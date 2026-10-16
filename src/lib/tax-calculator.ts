/**
 * UK Income Tax, National Insurance & Salary Sacrifice Optimization Engine
 * Models the 60% marginal tax trap (£100k-£125,140), Childcare cliff edge,
 * and High Income Child Benefit Charge (HICBC).
 * Verified against HMRC 2025/2026 statutory rules.
 */

export type StudentLoanPlanCode = "NONE" | "PLAN_1" | "PLAN_2" | "PLAN_4" | "PLAN_5";

export interface TaxInputs {
  grossSalary: number;            // Annual gross employment income (£)
  salarySacrificePension: number; // Annual salary sacrifice or SIPP contribution (£)
  numberOfChildren: number;       // For Child Benefit calculation
  childrenInChildcare: number;    // Number of children eligible for 30h / Tax-Free childcare
  hasStudentLoanPlan2: boolean;   // Whether 9% student loan applies
  hasStudentLoanPostgrad: boolean;// Whether 6% postgraduate loan applies above £21,000
  studentLoanPlan?: StudentLoanPlanCode; // Optional specific plan override (PLAN_1, PLAN_2, PLAN_4, PLAN_5)
}

export interface TaxBreakdown {
  adjustedNetIncome: number;
  personalAllowance: number;
  incomeTax: number;
  nationalInsurance: number;
  studentLoanDeduction: number;
  totalDeductions: number;
  netTakeHome: number;
  childBenefitEntitlement: number;
  childBenefitClawback: number;
  netChildBenefit: number;
  childcareValuePreserved: number;
  effectiveMarginalRatePercent: number; // Marginal rate on the last pound
  effectiveTotalTaxRatePercent: number; // Total deductions / Gross salary
}

export interface TaxOptimizationResults {
  inputs: TaxInputs;
  baseline: TaxBreakdown;       // Without salary sacrifice
  withSacrifice: TaxBreakdown;  // With salary sacrifice
  taxSaved: number;             // Income tax saved via sacrifice
  niSaved: number;              // National Insurance saved via sacrifice
  studentLoanSaved: number;     // Student loan saved via sacrifice
  totalTaxAndNiSaved: number;
  childcarePreservedValue: number;
  childBenefitRestored: number;
  netCostToTakeHome: number;    // Reduction in net take-home pay
  pensionGrowthProjections: {
    years: number;
    totalContributed: number;
    projectedPotAt5Percent: number;
    projectedPotAt7Percent: number;
  }[];
  optimalSacrificeTo100k: number;
  optimalSacrificeTo60k: number;
  netCostPer100PoundPension: number; // How much £100 in pension actually costs out of pocket
}

export const UK_TAX_CONSTANTS = {
  personalAllowance: 12570,
  basicRateThreshold: 50270,
  higherRateThreshold: 125140,
  taperStartThreshold: 100000,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,

  // Class 1 Employee NI (post-April 2024/2025)
  niPrimaryThreshold: 12570,
  niUpperEarningsLimit: 50270,
  niMainRate: 0.08, // 8%
  niUpperRate: 0.02, // 2%

  // Child Benefit (statutory rates)
  childBenefitFirstChildWeekly: 25.60,
  childBenefitSubsequentWeekly: 16.95,
  hicbcThresholdStart: 60000, // Raised from £50k to £60k in Spring Budget 2024
  hicbcThresholdEnd: 80000,   // Full clawback at £80k

  // Childcare estimates (Average UK value)
  freeChildcareHoursAnnualValuePerChild: 6500, // 30 hours funded childcare for 38 weeks
  taxFreeChildcareMaxPerChild: 2000,            // £2k top-up per child

  // Student loan repayment thresholds (2025/2026 statutory)
  plan1Threshold: 26065,
  plan2Threshold: 28470,
  plan4Threshold: 32745,
  plan5Threshold: 25000,
  planRate: 0.09,
  plan2Rate: 0.09,
  postgradThreshold: 21000,
  postgradRate: 0.06,

  // Pension annual allowance
  pensionAnnualAllowanceMax: 60000,
};

/**
 * Calculates Income Tax for a given Adjusted Net Income
 */
export function calculateIncomeTax(adjustedNetIncome: number): {
  tax: number;
  personalAllowance: number;
} {
  if (adjustedNetIncome <= 0) return { tax: 0, personalAllowance: UK_TAX_CONSTANTS.personalAllowance };

  // Calculate Personal Allowance taper above £100,000
  let personalAllowance = UK_TAX_CONSTANTS.personalAllowance;
  if (adjustedNetIncome > UK_TAX_CONSTANTS.taperStartThreshold) {
    const excess = adjustedNetIncome - UK_TAX_CONSTANTS.taperStartThreshold;
    const reduction = Math.min(UK_TAX_CONSTANTS.personalAllowance, Math.floor(excess / 2));
    personalAllowance = Math.max(0, UK_TAX_CONSTANTS.personalAllowance - reduction);
  }

  const taxableIncome = Math.max(0, adjustedNetIncome - personalAllowance);
  if (taxableIncome === 0) return { tax: 0, personalAllowance };

  let tax = 0;

  // Basic rate band is the next £37,700 of taxable income
  const basicRateBandSize = UK_TAX_CONSTANTS.basicRateThreshold - UK_TAX_CONSTANTS.personalAllowance; // 37,700
  const basicTaxable = Math.min(taxableIncome, basicRateBandSize);
  tax += basicTaxable * UK_TAX_CONSTANTS.basicRate;

  // Higher rate band: taxable income between £37,700 and £125,140 - personalAllowance
  const higherRateLimit = UK_TAX_CONSTANTS.higherRateThreshold - personalAllowance;
  if (taxableIncome > basicRateBandSize) {
    const higherTaxable = Math.min(taxableIncome, higherRateLimit) - basicRateBandSize;
    tax += Math.max(0, higherTaxable) * UK_TAX_CONSTANTS.higherRate;
  }

  // Additional rate band: income above £125,140
  if (taxableIncome > higherRateLimit) {
    const additionalTaxable = taxableIncome - higherRateLimit;
    tax += additionalTaxable * UK_TAX_CONSTANTS.additionalRate;
  }

  return { tax: Math.round(tax), personalAllowance };
}

/**
 * Calculates Employee Class 1 National Insurance
 */
export function calculateNationalInsurance(salary: number): number {
  if (salary <= UK_TAX_CONSTANTS.niPrimaryThreshold) return 0;

  let ni = 0;
  const mainBandSalary = Math.min(salary, UK_TAX_CONSTANTS.niUpperEarningsLimit) - UK_TAX_CONSTANTS.niPrimaryThreshold;
  ni += Math.max(0, mainBandSalary) * UK_TAX_CONSTANTS.niMainRate;

  if (salary > UK_TAX_CONSTANTS.niUpperEarningsLimit) {
    const upperSalary = salary - UK_TAX_CONSTANTS.niUpperEarningsLimit;
    ni += upperSalary * UK_TAX_CONSTANTS.niUpperRate;
  }

  return Math.round(ni);
}

/**
 * Calculates Child Benefit entitlement and High Income Child Benefit Charge (HICBC)
 */
export function calculateChildBenefit(
  adjustedNetIncome: number,
  numberOfChildren: number
): {
  entitlement: number;
  clawback: number;
  netBenefit: number;
} {
  if (numberOfChildren <= 0) {
    return { entitlement: 0, clawback: 0, netBenefit: 0 };
  }

  // Full annual entitlement
  const firstChildAnnual = UK_TAX_CONSTANTS.childBenefitFirstChildWeekly * 52;
  const subsequentChildrenAnnual = UK_TAX_CONSTANTS.childBenefitSubsequentWeekly * 52 * Math.max(0, numberOfChildren - 1);
  const entitlement = Math.round(firstChildAnnual + subsequentChildrenAnnual);

  // HICBC clawback calculation: 1% per £200 between £60k and £80k
  if (adjustedNetIncome <= UK_TAX_CONSTANTS.hicbcThresholdStart) {
    return { entitlement, clawback: 0, netBenefit: entitlement };
  }

  if (adjustedNetIncome >= UK_TAX_CONSTANTS.hicbcThresholdEnd) {
    return { entitlement, clawback: entitlement, netBenefit: 0 };
  }

  const excess = adjustedNetIncome - UK_TAX_CONSTANTS.hicbcThresholdStart;
  const clawbackPercent = Math.min(1.0, excess / (UK_TAX_CONSTANTS.hicbcThresholdEnd - UK_TAX_CONSTANTS.hicbcThresholdStart));
  const clawback = Math.round(entitlement * clawbackPercent);

  return { entitlement, clawback, netBenefit: entitlement - clawback };
}

/**
 * Calculates the monetary value of government funded childcare preserved
 */
export function calculateChildcareValue(adjustedNetIncome: number, childrenInChildcare: number): number {
  if (childrenInChildcare <= 0) return 0;
  // If ANI > £100,000, 30 hours free childcare and Tax-Free Childcare are lost
  if (adjustedNetIncome > UK_TAX_CONSTANTS.taperStartThreshold) {
    return 0;
  }
  const perChildValue =
    UK_TAX_CONSTANTS.freeChildcareHoursAnnualValuePerChild + UK_TAX_CONSTANTS.taxFreeChildcareMaxPerChild;
  return perChildValue * childrenInChildcare;
}

/**
 * Resolves the statutory student loan threshold for a given plan
 */
export function getPlanThreshold(plan?: StudentLoanPlanCode, hasPlan2 = false): number | null {
  const effectivePlan = plan || (hasPlan2 ? "PLAN_2" : "NONE");
  switch (effectivePlan) {
    case "PLAN_1":
      return UK_TAX_CONSTANTS.plan1Threshold;
    case "PLAN_2":
      return UK_TAX_CONSTANTS.plan2Threshold;
    case "PLAN_4":
      return UK_TAX_CONSTANTS.plan4Threshold;
    case "PLAN_5":
      return UK_TAX_CONSTANTS.plan5Threshold;
    default:
      return null;
  }
}

/**
 * Calculates Student Loan Deductions
 */
export function calculateStudentLoan(
  salary: number,
  hasPlan2: boolean,
  hasPostgrad: boolean,
  planOverride?: StudentLoanPlanCode
): number {
  let deduction = 0;
  const threshold = getPlanThreshold(planOverride, hasPlan2);
  if (threshold !== null && salary > threshold) {
    deduction += (salary - threshold) * UK_TAX_CONSTANTS.planRate;
  }
  if (hasPostgrad && salary > UK_TAX_CONSTANTS.postgradThreshold) {
    deduction += (salary - UK_TAX_CONSTANTS.postgradThreshold) * UK_TAX_CONSTANTS.postgradRate;
  }
  return Math.round(deduction);
}

/**
 * Calculates the exact marginal tax rate on the next pound of income
 */
export function calculateMarginalTaxRate(
  income: number,
  hasStudentLoan = false,
  planOverride?: StudentLoanPlanCode
): number {
  let rate = 0;
  if (income > UK_TAX_CONSTANTS.personalAllowance && income <= UK_TAX_CONSTANTS.basicRateThreshold) {
    rate = 20 + 8; // 20% IT + 8% NI = 28%
  } else if (income > UK_TAX_CONSTANTS.basicRateThreshold && income <= UK_TAX_CONSTANTS.taperStartThreshold) {
    rate = 40 + 2; // 40% IT + 2% NI = 42%
  } else if (income > UK_TAX_CONSTANTS.taperStartThreshold && income <= UK_TAX_CONSTANTS.higherRateThreshold) {
    rate = 60 + 2; // 40% IT + 20% lost allowance + 2% NI = 62% (The 60% Trap)
  } else if (income > UK_TAX_CONSTANTS.higherRateThreshold) {
    rate = 45 + 2; // 45% IT + 2% NI = 47%
  }
  const slThreshold = getPlanThreshold(planOverride, hasStudentLoan);
  if (slThreshold !== null && income > slThreshold) {
    rate += 9;
  }
  return rate;
}

/**
 * Full single-scenario breakdown
 */
export function runSingleTaxScenario(
  salary: number,
  inputs: TaxInputs,
  salarySacrifice = 0
): TaxBreakdown {
  const adjustedNetIncome = Math.max(0, salary - salarySacrifice);
  const { tax: incomeTax, personalAllowance } = calculateIncomeTax(adjustedNetIncome);
  const nationalInsurance = calculateNationalInsurance(adjustedNetIncome);
  const studentLoanDeduction = calculateStudentLoan(
    adjustedNetIncome,
    inputs.hasStudentLoanPlan2,
    inputs.hasStudentLoanPostgrad,
    inputs.studentLoanPlan
  );
  const { entitlement, clawback, netBenefit } = calculateChildBenefit(
    adjustedNetIncome,
    inputs.numberOfChildren
  );
  const childcareValue = calculateChildcareValue(adjustedNetIncome, inputs.childrenInChildcare);

  const totalDeductions = incomeTax + nationalInsurance + studentLoanDeduction + clawback;
  const netTakeHome = adjustedNetIncome - (incomeTax + nationalInsurance + studentLoanDeduction) + netBenefit;

  const marginalRate = calculateMarginalTaxRate(
    adjustedNetIncome,
    inputs.hasStudentLoanPlan2,
    inputs.studentLoanPlan
  );
  const effectiveTotalRate = salary > 0 ? (totalDeductions / salary) * 100 : 0;

  return {
    adjustedNetIncome,
    personalAllowance,
    incomeTax,
    nationalInsurance,
    studentLoanDeduction,
    totalDeductions,
    netTakeHome,
    childBenefitEntitlement: entitlement,
    childBenefitClawback: clawback,
    netChildBenefit: netBenefit,
    childcareValuePreserved: childcareValue,
    effectiveMarginalRatePercent: marginalRate,
    effectiveTotalTaxRatePercent: Math.round(effectiveTotalRate * 10) / 10,
  };
}

/**
 * Complete Comparative Tax & Salary Sacrifice Analysis
 */
export function runTaxOptimization(inputs: TaxInputs): TaxOptimizationResults {
  const sacrifice = Math.min(
    UK_TAX_CONSTANTS.pensionAnnualAllowanceMax,
    Math.max(0, inputs.salarySacrificePension)
  );

  const baseline = runSingleTaxScenario(inputs.grossSalary, inputs, 0);
  const withSacrifice = runSingleTaxScenario(inputs.grossSalary, inputs, sacrifice);

  const taxSaved = Math.max(0, baseline.incomeTax - withSacrifice.incomeTax);
  const niSaved = Math.max(0, baseline.nationalInsurance - withSacrifice.nationalInsurance);
  const studentLoanSaved = Math.max(0, baseline.studentLoanDeduction - withSacrifice.studentLoanDeduction);
  const totalTaxAndNiSaved = taxSaved + niSaved;

  const childcarePreservedValue = Math.max(
    0,
    withSacrifice.childcareValuePreserved - baseline.childcareValuePreserved
  );
  const childBenefitRestored = Math.max(
    0,
    withSacrifice.netChildBenefit - baseline.netChildBenefit
  );

  const netCostToTakeHome = Math.max(0, baseline.netTakeHome - withSacrifice.netTakeHome);

  // Out of pocket cost to put £100 in pension
  const netCostPer100PoundPension =
    sacrifice > 0 ? Math.max(0, Math.round((netCostToTakeHome / sacrifice) * 100)) : 100;

  // SIPP Compound Growth Projections
  const annualContrib = sacrifice > 0 ? sacrifice : 10000;
  const pensionGrowthProjections = [5, 10, 15, 20, 25, 30].map((years) => {
    const totalContributed = annualContrib * years;
    const r5 = 0.05;
    const r7 = 0.07;
    const fv5 = Math.round((annualContrib * (Math.pow(1 + r5, years) - 1)) / r5);
    const fv7 = Math.round((annualContrib * (Math.pow(1 + r7, years) - 1)) / r7);

    return {
      years,
      totalContributed,
      projectedPotAt5Percent: fv5,
      projectedPotAt7Percent: fv7,
    };
  });

  const optimalSacrificeTo100k = Math.max(
    0,
    Math.min(UK_TAX_CONSTANTS.pensionAnnualAllowanceMax, inputs.grossSalary - UK_TAX_CONSTANTS.taperStartThreshold)
  );
  const optimalSacrificeTo60k = Math.max(
    0,
    Math.min(UK_TAX_CONSTANTS.pensionAnnualAllowanceMax, inputs.grossSalary - UK_TAX_CONSTANTS.hicbcThresholdStart)
  );

  return {
    inputs,
    baseline,
    withSacrifice,
    taxSaved,
    niSaved,
    studentLoanSaved,
    totalTaxAndNiSaved,
    childcarePreservedValue,
    childBenefitRestored,
    netCostToTakeHome,
    pensionGrowthProjections,
    optimalSacrificeTo100k,
    optimalSacrificeTo60k,
    netCostPer100PoundPension,
  };
}
