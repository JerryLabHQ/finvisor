import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateMandatoryRepayment,
  getStudentLoanInterestRate,
  runStudentLoanCalculation,
} from "../src/lib/student-loan-calculator.ts";

test("calculateMandatoryRepayment - Statutory 2025/26 thresholds (Plan 1, Plan 2, Plan 4, Plan 5, Postgrad)", () => {
  // Plan 2 (£28,470 threshold, 9% rate)
  assert.equal(calculateMandatoryRepayment("PLAN_2", 28000), 0);
  assert.equal(calculateMandatoryRepayment("PLAN_2", 28470), 0);
  assert.equal(calculateMandatoryRepayment("PLAN_2", 38470), 900);

  // Plan 5 (£25,000 threshold, 9% rate)
  assert.equal(calculateMandatoryRepayment("PLAN_5", 35000), 900);

  // Plan 1 (£26,065 threshold, 9% rate)
  assert.equal(calculateMandatoryRepayment("PLAN_1", 36065), 900);

  // Plan 4 Scotland (£32,745 threshold, 9% rate)
  assert.equal(calculateMandatoryRepayment("PLAN_4", 42745), 900);

  // Postgraduate (£21,000 threshold, 6% rate)
  assert.equal(calculateMandatoryRepayment("POSTGRAD", 31000), 600);
});

test("getStudentLoanInterestRate - Sliding scale for Plan 2", () => {
  assert.equal(getStudentLoanInterestRate("PLAN_2", 25000, 3.0), 3.0);
  assert.equal(getStudentLoanInterestRate("PLAN_2", 52000, 3.0), 6.0);
  assert.equal(getStudentLoanInterestRate("PLAN_5", 80000, 3.0), 3.0);
});

test("runStudentLoanCalculation - Identifies debt wipeout vs payoff", () => {
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
