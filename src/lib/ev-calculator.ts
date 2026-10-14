/**
 * UK Electric Vehicle (EV) Financial Comparison Engine
 * Compares Salary Sacrifice vs. PCP vs. Cash Purchase vs. Petrol/Diesel.
 * Models HMRC Benefit-in-Kind (BiK) escalator (2% to 5%), tax relief,
 * and home vs. public charging costs.
 */

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
}

export interface EVOptionComparison {
  optionName: string;
  monthlyVehicleCost: number;     // Lease, PCP, or depreciation
  monthlyTaxRelief: number;       // Income tax and NI saved
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
 * Computes marginal tax rate for salary sacrifice deductions
 */
export function getEmployeeMarginalTaxRate(salary: number): number {
  if (salary > 125140) return 0.45 + 0.02; // 47%
  if (salary > 100000) return 0.60 + 0.02; // 62% in the trap!
  if (salary > 50270) return 0.40 + 0.02;  // 42%
  if (salary > 12570) return 0.20 + 0.08;  // 28%
  return 0;
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
  const marginalRate = getEmployeeMarginalTaxRate(inputs.grossAnnualSalary);
  const monthlyEVFuel = calculateMonthlyEVElectricityCost(
    inputs.annualMileage,
    inputs.homeChargingPercent,
    inputs.hasSmartEVTariff
  );

  // 1. Salary Sacrifice Option
  // Monthly BiK Tax = (P11D * 3.3% / 12) * marginal income tax rate (excluding NI)
  // Income tax portion only: 20%, 40%, or 45% (or 60% in the trap)
  let incomeTaxOnlyRate = 0.20;
  if (inputs.grossAnnualSalary > 125140) incomeTaxOnlyRate = 0.45;
  else if (inputs.grossAnnualSalary > 100000) incomeTaxOnlyRate = 0.60;
  else if (inputs.grossAnnualSalary > 50270) incomeTaxOnlyRate = 0.40;

  const monthlyBikTax = Math.round(
    ((inputs.vehicleP11DValue * EV_BENCHMARKS.average3YearBikRate) / 12) * incomeTaxOnlyRate
  );

  // Tax + NI relief on the gross lease
  const monthlyTaxRelief = Math.round(inputs.grossMonthlyLease * marginalRate);

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
  // A typical PCP on a £45k car with £3k deposit is roughly 1.15x the gross lease without tax relief, plus insurance & servicing
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
  // Depreciation over 3 years: ~52% of P11D value / 36 months + lost interest opportunity cost
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
    effectiveEmployeeTaxRatePercent: Math.round(marginalRate * 100),
    averageBikPercentOver3Years: Math.round(EV_BENCHMARKS.average3YearBikRate * 1000) / 10,
    fuelSavingsAnnual,
  };
}
