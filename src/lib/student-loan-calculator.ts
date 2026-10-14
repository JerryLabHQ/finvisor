/**
 * UK Student Loan Repayment & "Graduate Tax" Simulation Engine
 * Compares Plan 1, Plan 2, Plan 5, and Postgraduate loans.
 * Models 30-year / 40-year statutory write-off cliffs, career wage curves,
 * and impact on mortgage affordability.
 */

export interface StudentLoanInputs {
  currentSalary: number;            // Current annual gross salary (£)
  currentLoanBalance: number;       // Current outstanding balance (£)
  loanPlan: "PLAN_2" | "PLAN_5" | "POSTGRAD" | "PLAN_1";
  annualSalaryGrowthPercent: number;// Expected annual wage growth (e.g. 4.5%)
  assumedRpiPercent: number;        // Expected RPI inflation (e.g. 3.0%)
  yearsSinceGraduation: number;     // Elapsed years of the 30/40-year clock
  voluntaryMonthlyOverpayment: number; // Extra optional monthly payment (£)
}

export interface StudentLoanYearProjection {
  year: number;
  salary: number;
  startingBalance: number;
  interestAccrued: number;
  interestRatePercent: number;
  mandatoryRepayment: number;
  voluntaryRepayment: number;
  totalRepayment: number;
  endingBalance: number;
  isWrittenOff: boolean;
}

export interface StudentLoanResults {
  inputs: StudentLoanInputs;
  projectionsStandard: StudentLoanYearProjection[];
  projectionsWithOverpayment: StudentLoanYearProjection[];
  
  // Standard scenario outcomes
  willBePaidOffStandard: boolean;
  yearsToPayOffStandard: number | null;
  totalLifetimePaidStandard: number;
  totalInterestPaidStandard: number;
  debtWipedOutStandard: number;

  // Overpayment scenario outcomes
  willBePaidOffOverpay: boolean;
  yearsToPayOffOverpay: number | null;
  totalLifetimePaidOverpay: number;
  interestSavedViaOverpay: number;

  // Strategic Verdict
  verdict: "DO_NOT_OVERPAY" | "CONSIDER_OVERPAYING" | "BORDERLINE";
  verdictReasoning: string;

  // Mortgage Borrowing Impact
  currentMonthlyRepayment: number;
  estimatedMortgageBorrowingReductionGbp: number;
}

export const STUDENT_LOAN_CONSTANTS = {
  PLAN_2: {
    threshold: 27295,
    rate: 0.09,
    writeOffYears: 30,
    minInterestSpread: 0, // RPI + 0% at threshold
    maxInterestSpread: 0.03, // RPI + 3% above £49,130
    maxInterestThreshold: 49130,
  },
  PLAN_5: {
    threshold: 25000,
    rate: 0.09,
    writeOffYears: 40,
    minInterestSpread: 0,
    maxInterestSpread: 0, // Strictly RPI only
    maxInterestThreshold: 25000,
  },
  POSTGRAD: {
    threshold: 21000,
    rate: 0.06,
    writeOffYears: 30,
    minInterestSpread: 0.03, // RPI + 3% flat
    maxInterestSpread: 0.03,
    maxInterestThreshold: 21000,
  },
  PLAN_1: {
    threshold: 24990,
    rate: 0.09,
    writeOffYears: 25,
    minInterestSpread: 0,
    maxInterestSpread: 0,
    maxInterestThreshold: 24990,
  },
};

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

/**
 * Calculates current interest rate based on plan rules and salary
 */
export function getStudentLoanInterestRate(
  plan: "PLAN_2" | "PLAN_5" | "POSTGRAD" | "PLAN_1",
  salary: number,
  rpi: number
): number {
  const config = STUDENT_LOAN_CONSTANTS[plan];
  if (plan === "PLAN_5" || plan === "PLAN_1") {
    return rpi;
  }
  if (plan === "POSTGRAD") {
    return rpi + 3.0;
  }

  // Plan 2 sliding interest rate
  if (salary <= config.threshold) {
    return rpi;
  }
  if (salary >= config.maxInterestThreshold) {
    return rpi + 3.0;
  }
  const fraction = (salary - config.threshold) / (config.maxInterestThreshold - config.threshold);
  return rpi + fraction * 3.0;
}

/**
 * Calculates mandatory annual repayment based on plan threshold and rate
 */
export function calculateMandatoryRepayment(
  plan: "PLAN_2" | "PLAN_5" | "POSTGRAD" | "PLAN_1",
  salary: number
): number {
  const config = STUDENT_LOAN_CONSTANTS[plan];
  if (salary <= config.threshold) return 0;
  return Math.round((salary - config.threshold) * config.rate);
}

/**
 * Simulates year-by-year trajectory until payoff or statutory write-off
 */
export function simulateLoanTrajectory(
  inputs: StudentLoanInputs,
  voluntaryMonthlyOverpay = 0
): {
  projections: StudentLoanYearProjection[];
  isPaidOff: boolean;
  yearsToPayOff: number | null;
  totalLifetimePaid: number;
  totalInterestPaid: number;
  debtWipedOut: number;
} {
  const config = STUDENT_LOAN_CONSTANTS[inputs.loanPlan];
  const maxYearsRemaining = Math.max(1, config.writeOffYears - inputs.yearsSinceGraduation);
  const projections: StudentLoanYearProjection[] = [];

  let balance = inputs.currentLoanBalance;
  let salary = inputs.currentSalary;
  let totalLifetimePaid = 0;
  let totalInterestPaid = 0;
  let isPaidOff = false;
  let yearsToPayOff: number | null = null;
  let debtWipedOut = 0;

  for (let year = 1; year <= maxYearsRemaining; year++) {
    if (balance <= 0) {
      if (!isPaidOff) {
        isPaidOff = true;
        yearsToPayOff = year - 1;
      }
      break;
    }

    const startingBalance = balance;
    const interestRate = getStudentLoanInterestRate(inputs.loanPlan, salary, inputs.assumedRpiPercent);
    const interestAccrued = Math.round(startingBalance * (interestRate / 100));
    totalInterestPaid += interestAccrued;

    let mandatoryRepayment = calculateMandatoryRepayment(inputs.loanPlan, salary);
    let voluntaryRepayment = voluntaryMonthlyOverpay * 12;

    // Repayments cannot exceed remaining balance + interest
    const totalDue = startingBalance + interestAccrued;
    if (mandatoryRepayment + voluntaryRepayment > totalDue) {
      if (mandatoryRepayment >= totalDue) {
        mandatoryRepayment = totalDue;
        voluntaryRepayment = 0;
      } else {
        voluntaryRepayment = totalDue - mandatoryRepayment;
      }
    }

    const totalRepayment = mandatoryRepayment + voluntaryRepayment;
    totalLifetimePaid += totalRepayment;
    balance = Math.max(0, totalDue - totalRepayment);

    const isLastYear = year === maxYearsRemaining;
    const isWrittenOff = isLastYear && balance > 0;

    if (isWrittenOff) {
      debtWipedOut = balance;
      balance = 0;
    }

    projections.push({
      year,
      salary: Math.round(salary),
      startingBalance,
      interestAccrued,
      interestRatePercent: Math.round(interestRate * 10) / 10,
      mandatoryRepayment,
      voluntaryRepayment,
      totalRepayment,
      endingBalance: isWrittenOff ? 0 : balance,
      isWrittenOff,
    });

    if (balance <= 0 && !isPaidOff && !isWrittenOff) {
      isPaidOff = true;
      yearsToPayOff = year;
    }

    // Advance wage trajectory
    salary = salary * (1 + inputs.annualSalaryGrowthPercent / 100);
  }

  return {
    projections,
    isPaidOff,
    yearsToPayOff,
    totalLifetimePaid,
    totalInterestPaid,
    debtWipedOut,
  };
}

/**
 * Full comparative Student Loan simulation
 */
export function runStudentLoanCalculation(inputs: StudentLoanInputs): StudentLoanResults {
  const standard = simulateLoanTrajectory(inputs, 0);
  const overpay = simulateLoanTrajectory(inputs, inputs.voluntaryMonthlyOverpayment);

  const currentMandatoryAnnual = calculateMandatoryRepayment(inputs.loanPlan, inputs.currentSalary);
  const currentMonthlyRepayment = Math.round(currentMandatoryAnnual / 12);

  // UK Lenders typically reduce mortgage borrowing by 4.5x - 5.0x annual loan deductions
  // or deduct monthly repayments from net cashflow stress testing (~12x-14x annual deduction)
  const estimatedMortgageBorrowingReductionGbp = Math.round(currentMandatoryAnnual * 4.5);

  let verdict: "DO_NOT_OVERPAY" | "CONSIDER_OVERPAYING" | "BORDERLINE" = "DO_NOT_OVERPAY";
  let verdictReasoning = "";

  if (!standard.isPaidOff && standard.debtWipedOut > 0) {
    verdict = "DO_NOT_OVERPAY";
    verdictReasoning = `Under your projected career trajectory, your student loan will be legally wiped out in ${standard.projections.length} years with ${formatGBP(standard.debtWipedOut)} of debt forgiven. Making voluntary overpayments would waste money that will otherwise be cancelled by the government.`;
  } else if (standard.isPaidOff && standard.yearsToPayOff && standard.yearsToPayOff <= 18) {
    verdict = "CONSIDER_OVERPAYING";
    const saved = Math.max(0, standard.totalInterestPaid - overpay.totalInterestPaid);
    verdictReasoning = `Your high earning trajectory means you will completely clear your debt in ${standard.yearsToPayOff} years. Because of high RPI interest rates, voluntary overpaying could save you approximately ${formatGBP(saved)} in total lifetime interest.`;
  } else {
    verdict = "BORDERLINE";
    verdictReasoning = `You are near the break-even threshold. Investing extra cash in a tax-free Stocks & Shares ISA (expected 7% return) will likely outperform the student loan interest rate while maintaining liquidity.`;
  }

  return {
    inputs,
    projectionsStandard: standard.projections,
    projectionsWithOverpayment: overpay.projections,
    willBePaidOffStandard: standard.isPaidOff,
    yearsToPayOffStandard: standard.yearsToPayOff,
    totalLifetimePaidStandard: standard.totalLifetimePaid,
    totalInterestPaidStandard: standard.totalInterestPaid,
    debtWipedOutStandard: standard.debtWipedOut,
    willBePaidOffOverpay: overpay.isPaidOff,
    yearsToPayOffOverpay: overpay.yearsToPayOff,
    totalLifetimePaidOverpay: overpay.totalLifetimePaid,
    interestSavedViaOverpay: Math.max(0, standard.totalLifetimePaid - overpay.totalLifetimePaid),
    verdict,
    verdictReasoning,
    currentMonthlyRepayment,
    estimatedMortgageBorrowingReductionGbp,
  };
}
