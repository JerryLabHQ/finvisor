import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatePensionDrawdownTax,
  solveGrossPensionDrawdownForNet,
  runPensionCalculation,
} from "../src/lib/pension-calculator.ts";

test("calculatePensionDrawdownTax & solveGrossPensionDrawdownForNet - Exact inverse tax solver", () => {
  // Drawdown of £12,570 with £0 State Pension -> £0 tax
  assert.equal(calculatePensionDrawdownTax(12570, 0), 0);

  // Drawdown of £20,000 with £0 State Pension: 20% on (£20,000 - £12,570 = £7,430) = £1,486
  assert.equal(calculatePensionDrawdownTax(20000, 0), 1486);

  // Inverse solver: if we need £25,000 net with £11,973 State Pension, gross - tax(gross) must equal £25,000
  const grossNeeded = solveGrossPensionDrawdownForNet(25000, 11973);
  const taxPaid = calculatePensionDrawdownTax(grossNeeded, 11973);
  assert.ok(Math.abs(grossNeeded - taxPaid - 25000) <= 2, `Expected net ~25000, got ${grossNeeded - taxPaid}`);

  // Higher-rate inverse solver test (£60,000 net desired):
  const highGross = solveGrossPensionDrawdownForNet(60000, 11973);
  const highTax = calculatePensionDrawdownTax(highGross, 11973);
  assert.ok(Math.abs(highGross - highTax - 60000) <= 2, `Expected net ~60000, got ${highGross - highTax}`);
});

test("runPensionCalculation - Models sustainable drawdown without double inflation subtraction", () => {
  const result = runPensionCalculation({
    currentPensionPot: 600000,
    currentIsaPot: 100000,
    currentAge: 60,
    targetRetirementAge: 60,
    lifeExpectancyAge: 85,
    desiredAnnualIncomeNet: 28000,
    takeTaxFreeLumpSumAtRetirement: true,
    assumedRealReturnPercent: 3.5,
    inflationPercent: 2.5,
    statePensionAge: 67,
    qualifiesForFullStatePension: true,
    annuityQuoteRatePercent: 6.5,
  });

  assert.equal(result.pclsLumpSumTaken, 150000);
  assert.equal(result.guaranteedAnnuityAnnualIncome, 39000);
  assert.equal(result.isFullyFunded, true);
  assert.equal(result.verdict, "SUSTAINABLE_DRAWDOWN");
});

test("runPensionCalculation - Detects aggressive withdrawal depletion", () => {
  const result = runPensionCalculation({
    currentPensionPot: 300000,
    currentIsaPot: 20000,
    currentAge: 55,
    targetRetirementAge: 55,
    lifeExpectancyAge: 90,
    desiredAnnualIncomeNet: 45000,
    takeTaxFreeLumpSumAtRetirement: false,
    assumedRealReturnPercent: 2.5,
    inflationPercent: 2.5,
    statePensionAge: 67,
    qualifiesForFullStatePension: true,
    annuityQuoteRatePercent: 6.0,
  });

  assert.equal(result.isFullyFunded, false);
  assert.equal(result.verdict, "RISK_OF_DEPLETION");
  assert.ok(result.potLastsUntilAge < 90);
});
