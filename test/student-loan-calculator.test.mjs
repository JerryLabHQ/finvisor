import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateMandatoryRepayment,
  getStudentLoanInterestRate,
  runStudentLoanCalculation,
} from "../src/lib/student-loan-calculator.ts";

test("calculateMandatoryRepayment - Plan 2 thresholds and 9% rate", () => {
  // Below £27,295 threshold -> £0
  assert.equal(calculateMandatoryRepayment("PLAN_2", 27000), 0);
  assert.equal(calculateMandatoryRepayment("PLAN_2", 27295), 0);

  // £37,295 (£10,000 above threshold) -> 9% = £900/year
  assert.equal(calculateMandatoryRepayment("PLAN_2", 37295), 900);

  // £57,295 (£30,000 above threshold) -> 9% = £2,700/year
  assert.equal(calculateMandatoryRepayment("PLAN_2", 57295), 2700);
});

test("calculateMandatoryRepayment - Plan 5 £25,000 threshold", () => {
  // £35,000 (£10,000 above £25k threshold) -> 9% = £900/year
  assert.equal(calculateMandatoryRepayment("PLAN_5", 35000), 900);
});

test("getStudentLoanInterestRate - Sliding scale for Plan 2", () => {
  // Under threshold: RPI (e.g. 3.0%)
  assert.equal(getStudentLoanInterestRate("PLAN_2", 25000, 3.0), 3.0);

  // Above max threshold (£49,130): RPI + 3% = 6.0%
  assert.equal(getStudentLoanInterestRate("PLAN_2", 50000, 3.0), 6.0);

  // Plan 5: strictly RPI only
  assert.equal(getStudentLoanInterestRate("PLAN_5", 80000, 3.0), 3.0);
});

test("runStudentLoanCalculation - Identifies debt wipeout vs payoff", () => {
  // Moderate earner (£32k rising at 3.5% with £50k debt): Should be wiped out!
  const wipeoutResult = runStudentLoanCalculation({
    currentSalary: 32000,
    currentLoanBalance: 50000,
    loanPlan: "PLAN_2",
    annualSalaryGrowthPercent: 3.5,
    assumedRpiPercent: 3.0,
    yearsSinceGraduation: 2,
    voluntaryMonthlyOverpayment: 0,
  });

  assert.equal(wipeoutResult.verdict, "DO_NOT_OVERPAY");
  assert.ok(wipeoutResult.debtWipedOutStandard > 0, "Debt should be written off");

  // High earner (£85k rising at 5.0% with £35k debt): Will clear the debt
  const payoffResult = runStudentLoanCalculation({
    currentSalary: 85000,
    currentLoanBalance: 35000,
    loanPlan: "PLAN_2",
    annualSalaryGrowthPercent: 5.0,
    assumedRpiPercent: 3.0,
    yearsSinceGraduation: 2,
    voluntaryMonthlyOverpayment: 200,
  });

  assert.equal(payoffResult.willBePaidOffStandard, true);
  assert.ok(payoffResult.yearsToPayOffStandard && payoffResult.yearsToPayOffStandard < 15);
});
