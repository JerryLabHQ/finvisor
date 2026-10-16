/**
 * UK Electric Vehicle (EV) Financial Comparison Engine
 * Compares Salary Sacrifice vs. PCP vs. Cash Purchase vs. Petrol/Diesel.
 * Models HMRC Benefit-in-Kind (BiK) escalator (2% to 5%), progressive tax-band slicing,
 * and home vs. public charging costs.
 */

import {
  calculateIncomeTax,
  calculateNationalInsurance,
  calculateChildBenefit,
  calculateChildcareValue,
  calculateStudentLoan,
  StudentLoanPlanCode,
} from "./tax-calculator";

export interface EVInputs {
  vehicleP11DValue: number;       // Recommended retail price (£)
  grossMonthlyLease: number;       // Salary sacrifice quote per month (incl. insurance & maintenance)
  grossAnnualSalary: number;       // Employee income (£)
  annualMileage: number;          // Miles driven per year
  homeChargingPercent: number;    // % charged at home (e.g. 80%)
  hasSmartEVTariff: boolean;      // e.g. Octopus Intelligent 7p/kWh vs 24p standard
  currentCarMonthlyFuel: number;  // Current petrol/diesel monthly spend (£)
  currentCarMonthlyInsurance: number;
  currentCarMonthlyMaintenance: number;
  studentLoanPlan?: StudentLoanPlanCode; // Optional student loan plan for exact sacrifice delta
  numberOfChildren?: number;      // Optional HICBC child benefit recovery modeling
  childrenInChildcare?: number;   // Optional 30h childcare cliff recovery modeling
}

export interface EVOptionComparison {
  optionName: string;
  monthlyVehicleCost: number;     // Lease, PCP, or depreciation
  monthlyTaxRelief: number;       // Income tax and NI (and student loan) saved via progressive band slicing
  monthlyBikTax: number;          // Benefit-in-kind tax owed
  monthlyFuelCost: number;        // Electricity or petrol
  monthlyInsuranceAndUpkeep: number; // Insurance, servicing, tyres
  netTotalMonthlyCost: number;    // True out-of-pocket cost
  total3YearSpend: number;
}

export interface EVCalculatorResults {
  inputs: EVInputs;
  salarySacrificeOption: EVOptionComparison;
  pcpOption: EVOptionComparison;
  cashPurchaseOption: EVOptionComparison;
  petrolStatusQuoOption: EVOptionComparison;
  monthlySavingsVsPcp: number;
  monthlySavingsVsPetrol: number;
  threeYearSavingsVsPetrol: number;
  effectiveEmployeeTaxRatePercent: number;
  averageBikPercentOver3Years: number;
  fuelSavingsAnnual: number;
  annualChildcareAndBenefitRestored: number;
}

export const EV_BENCHMARKS = {
  // BiK Escalator: 2024/25: 2%, 2025/26: 3%, 2026/27: 4%, 2027/28: 5%
  average3YearBikRate: 0.033, // 3.3% average over a 3-year term

  // Electricity and Fuel costs (GB 2025/2026)
  smartOffPeakElectricityCostPerKwh: 0.07, // 7p/kWh (Octopus Intelligent / OVO Charge Anytime)
  standardHomeElectricityCostPerKwh: 0.24, // 24p/kWh standard price cap
  publicRapidElectricityCostPerKwh: 0.75,  // 75p/kWh DC rapid charger
  evEfficiencyMilesPerKwh: 3.7,            // Typical real-world efficiency

  // PCP Assumptions
  pcpDeposit: 3000,
  pcpAnnualInterestRate: 0.079, // 7.9% APR typical PCP
  residualValuePercentAfter3Years: 0.48, // 48% residual value

  // VED (Road Tax from 2025)
  evStandardVedAnnual: 195,
  petrolStandardVedAnnual: 190,
};

/**
 * Computes marginal tax rate on the next pound of salary
 */
export function getEmployeeMarginalTaxRate(salary: number): number {
  if (salary > 125140) return 0.45 + 0.02; // 47%
  if (salary > 100000) return 0.60 + 0.02; // 62% in the trap!
  if (salary > 50270) return 0.40 + 0.02;  // 42%
  if (salary > 12570) return 0.20 + 0.08;  // 28%
  return 0;
}

/**
 * Computes exact progressive tax, NI, student loan, HICBC, and childcare delta for an EV salary sacrifice
 * Handles band-crossing accurately (e.g., sacrificing £9,600/yr from £101,000 slices £1,000 @ 62% and £8,600 @ 42%).
 */
export function calculateProgressiveEVTaxDelta(
  grossAnnualSalary: number,
  grossAnnualLease: number,
  vehicleP11DValue: number,
  options?: {
    studentLoanPlan?: StudentLoanPlanCode;
    numberOfChildren?: number;
    childrenInChildcare?: number;
  }
): {
  annualTaxAndNiRelief: number;
  annualBikTax: number;
  monthlyTaxRelief: number;
  monthlyBikTax: number;
  effectiveReliefRatePercent: number;
  annualChildcareAndBenefitRestored: number;
} {
  if (grossAnnualLease <= 0 || grossAnnualSalary <= 0) {
    return {
      annualTaxAndNiRelief: 0,
      annualBikTax: 0,
      monthlyTaxRelief: 0,
      monthlyBikTax: 0,
      effectiveReliefRatePercent: 0,
      annualChildcareAndBenefitRestored: 0,
    };
  }

  const postSacrificeCashSalary = Math.max(0, grossAnnualSalary - grossAnnualLease);
  const annualBikTaxableBenefit = vehicleP11DValue * EV_BENCHMARKS.average3YearBikRate;
  // Adjusted Net Income for Income Tax / PA taper / Childcare includes taxable BiK benefit
  const postSacrificeAdjustedNetIncome = postSacrificeCashSalary + annualBikTaxableBenefit;

  // 1. Income Tax before vs after gross lease deduction (before BiK)
  const baselineIncomeTax = calculateIncomeTax(grossAnnualSalary).tax;
  const postLeaseIncomeTax = calculateIncomeTax(postSacrificeCashSalary).tax;
  const incomeTaxSavedOnLease = Math.max(0, baselineIncomeTax - postLeaseIncomeTax);

  // 2. Employee Class 1 NI before vs after gross lease deduction (employees do not pay Class 1 NI on BiK)
  const baselineNi = calculateNationalInsurance(grossAnnualSalary);
  const postLeaseNi = calculateNationalInsurance(postSacrificeCashSalary);
  const niSavedOnLease = Math.max(0, baselineNi - postLeaseNi);

  // 3. Optional Student Loan reduction (calculated on cash gross pay subject to Class 1 NI)
  const slPlan = options?.studentLoanPlan || "NONE";
  const baselineSl = calculateStudentLoan(grossAnnualSalary, slPlan === "PLAN_2", false, slPlan);
  const postLeaseSl = calculateStudentLoan(postSacrificeCashSalary, slPlan === "PLAN_2", false, slPlan);
  const slSavedOnLease = Math.max(0, baselineSl - postLeaseSl);

  // 4. Exact Income Tax owed on the P11D BiK benefit at the post-sacrifice tax position
  const incomeTaxWithBik = calculateIncomeTax(postSacrificeAdjustedNetIncome).tax;
  const annualBikTax = Math.max(0, incomeTaxWithBik - postLeaseIncomeTax);

  // 5. HICBC & 30h Free Childcare restoration (evaluated at post-sacrifice Adjusted Net Income incl. BiK)
  const childrenCount = options?.numberOfChildren || 0;
  const childcareCount = options?.childrenInChildcare || 0;
  const cbBefore = calculateChildBenefit(grossAnnualSalary, childrenCount).netBenefit;
  const cbAfter = calculateChildBenefit(postSacrificeAdjustedNetIncome, childrenCount).netBenefit;
  const childcareBefore = calculateChildcareValue(grossAnnualSalary, childcareCount);
  const childcareAfter = calculateChildcareValue(postSacrificeAdjustedNetIncome, childcareCount);
  const annualChildcareAndBenefitRestored =
    Math.max(0, cbAfter - cbBefore) + Math.max(0, childcareAfter - childcareBefore);

  const annualTaxAndNiRelief = incomeTaxSavedOnLease + niSavedOnLease + slSavedOnLease;
  const monthlyTaxRelief = Math.round(annualTaxAndNiRelief / 12);
  const monthlyBikTax = Math.round(annualBikTax / 12);
  const effectiveReliefRatePercent = Math.round((annualTaxAndNiRelief / grossAnnualLease) * 100);

  return {
    annualTaxAndNiRelief,
    annualBikTax,
    monthlyTaxRelief,
    monthlyBikTax,
    effectiveReliefRatePercent,
    annualChildcareAndBenefitRestored,
  };
}

/**
 * Computes monthly electricity fuel cost
 */
export function calculateMonthlyEVElectricityCost(
  annualMileage: number,
  homePercent: number,
  hasSmartTariff: boolean
): number {
  const milesPerMonth = annualMileage / 12;
  const kwhPerMonth = milesPerMonth / EV_BENCHMARKS.evEfficiencyMilesPerKwh;

  const homeCostPerKwh = hasSmartTariff
    ? EV_BENCHMARKS.smartOffPeakElectricityCostPerKwh
    : EV_BENCHMARKS.standardHomeElectricityCostPerKwh;

  const homeFraction = homePercent / 100;
  const publicFraction = 1 - homeFraction;

  const cost =
    kwhPerMonth * homeFraction * homeCostPerKwh +
    kwhPerMonth * publicFraction * EV_BENCHMARKS.publicRapidElectricityCostPerKwh;

  return Math.round(cost);
}

/**
 * Full EV Comparative Calculation
 */
export function runEVCalculation(inputs: EVInputs): EVCalculatorResults {
  const monthlyEVFuel = calculateMonthlyEVElectricityCost(
    inputs.annualMileage,
    inputs.homeChargingPercent,
    inputs.hasSmartEVTariff
  );

  // 1. Salary Sacrifice Option (using exact progressive tax band slicing)
  const annualGrossLease = inputs.grossMonthlyLease * 12;
  const progressiveDelta = calculateProgressiveEVTaxDelta(
    inputs.grossAnnualSalary,
    annualGrossLease,
    inputs.vehicleP11DValue,
    {
      studentLoanPlan: inputs.studentLoanPlan,
      numberOfChildren: inputs.numberOfChildren,
      childrenInChildcare: inputs.childrenInChildcare,
    }
  );

  const { monthlyTaxRelief, monthlyBikTax, effectiveReliefRatePercent, annualChildcareAndBenefitRestored } =
    progressiveDelta;

  // Net cost of lease: Gross - Tax Relief + BiK
  const netSalarySacrificeVehicleCost = Math.max(
    0,
    inputs.grossMonthlyLease - monthlyTaxRelief + monthlyBikTax
  );

  const salarySacrificeTotalMonthly = netSalarySacrificeVehicleCost + monthlyEVFuel;

  const salarySacrificeOption: EVOptionComparison = {
    optionName: "Salary Sacrifice (All-Inclusive)",
    monthlyVehicleCost: inputs.grossMonthlyLease,
    monthlyTaxRelief,
    monthlyBikTax,
    monthlyFuelCost: monthlyEVFuel,
    monthlyInsuranceAndUpkeep: 0, // Fully included in SalSac lease!
    netTotalMonthlyCost: salarySacrificeTotalMonthly,
    total3YearSpend: salarySacrificeTotalMonthly * 36,
  };

  // 2. Personal Contract Purchase (PCP) on the same EV
  const estimatedPcpMonthly = Math.round(inputs.grossMonthlyLease * 0.92);
  const estimatedInsuranceMonthly = 85;
  const estimatedServiceTyresMonthly = 35;
  const pcpTotalMonthly =
    estimatedPcpMonthly + monthlyEVFuel + estimatedInsuranceMonthly + estimatedServiceTyresMonthly;

  const pcpOption: EVOptionComparison = {
    optionName: "Personal PCP (Private Dealership)",
    monthlyVehicleCost: estimatedPcpMonthly,
    monthlyTaxRelief: 0,
    monthlyBikTax: 0,
    monthlyFuelCost: monthlyEVFuel,
    monthlyInsuranceAndUpkeep: estimatedInsuranceMonthly + estimatedServiceTyresMonthly,
    netTotalMonthlyCost: pcpTotalMonthly,
    total3YearSpend: pcpTotalMonthly * 36 + EV_BENCHMARKS.pcpDeposit,
  };

  // 3. Cash Purchase / Bank Loan Option
  const monthlyDepreciation = Math.round((inputs.vehicleP11DValue * 0.52) / 36);
  const cashTotalMonthly =
    monthlyDepreciation + monthlyEVFuel + estimatedInsuranceMonthly + estimatedServiceTyresMonthly;

  const cashPurchaseOption: EVOptionComparison = {
    optionName: "Cash Purchase (Depreciation + Upkeep)",
    monthlyVehicleCost: monthlyDepreciation,
    monthlyTaxRelief: 0,
    monthlyBikTax: 0,
    monthlyFuelCost: monthlyEVFuel,
    monthlyInsuranceAndUpkeep: estimatedInsuranceMonthly + estimatedServiceTyresMonthly,
    netTotalMonthlyCost: cashTotalMonthly,
    total3YearSpend: cashTotalMonthly * 36,
  };

  // 4. Status Quo: Keeping Current Petrol / Diesel Car
  const currentTotalMonthly =
    inputs.currentCarMonthlyFuel +
    inputs.currentCarMonthlyInsurance +
    inputs.currentCarMonthlyMaintenance;

  const petrolStatusQuoOption: EVOptionComparison = {
    optionName: "Keep Current Petrol / Diesel",
    monthlyVehicleCost: 0, // Assuming paid off
    monthlyTaxRelief: 0,
    monthlyBikTax: 0,
    monthlyFuelCost: inputs.currentCarMonthlyFuel,
    monthlyInsuranceAndUpkeep:
      inputs.currentCarMonthlyInsurance + inputs.currentCarMonthlyMaintenance,
    netTotalMonthlyCost: currentTotalMonthly,
    total3YearSpend: currentTotalMonthly * 36,
  };

  const monthlySavingsVsPcp = pcpTotalMonthly - salarySacrificeTotalMonthly;
  const monthlySavingsVsPetrol = currentTotalMonthly - salarySacrificeTotalMonthly;
  const threeYearSavingsVsPetrol = monthlySavingsVsPetrol * 36;
  const fuelSavingsAnnual = (inputs.currentCarMonthlyFuel - monthlyEVFuel) * 12;

  return {
    inputs,
    salarySacrificeOption,
    pcpOption,
    cashPurchaseOption,
    petrolStatusQuoOption,
    monthlySavingsVsPcp,
    monthlySavingsVsPetrol,
    threeYearSavingsVsPetrol,
    effectiveEmployeeTaxRatePercent: effectiveReliefRatePercent,
    averageBikPercentOver3Years: Math.round(EV_BENCHMARKS.average3YearBikRate * 1000) / 10,
    fuelSavingsAnnual,
    annualChildcareAndBenefitRestored,
  };
}
