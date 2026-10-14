import test from "node:test";
import assert from "node:assert/strict";
import {
  calculatePensionDrawdownTax,
  runPensionCalculation,
} from "../src/lib/pension-calculator.ts";

test("calculatePensionDrawdownTax - Uses personal allowance and basic rate", () => {
  // Drawdown of £12,570 with £0 State Pension -> £0 tax
  assert.equal(calculatePensionDrawdownTax(12570, 0), 0);

  // Drawdown of £20,000 with £0 State Pension:
  // Tax on (£20,000 - £12,570 = £7,430) at 20% = £1,486
  assert.equal(calculatePensionDrawdownTax(20000, 0), 1486);
});

test("runPensionCalculation - Models sustainable 3.8% drawdown", () => {
  const result = runPensionCalculation({
    currentPensionPot: 600000,
    currentIsaPot: 100000,
    currentAge: 60,
    targetRetirementAge: 60,
    lifeExpectancyAge: 85,
    desiredAnnualIncomeNet: 28000, // Safe ~4% withdrawal
    takeTaxFreeLumpSumAtRetirement: true,
    assumedRealReturnPercent: 5.5,
    inflationPercent: 2.5, // 3% real return
    statePensionAge: 67,
    qualifiesForFullStatePension: true,
    annuityQuoteRatePercent: 6.5,
  });

  // 25% tax-free lump sum should be £150,000 (below £268k cap)
  assert.equal(result.pclsLumpSumTaken, 150000);

  // Guaranteed annuity income: 6.5% on £600k pension pot = £39,000
  assert.equal(result.guaranteedAnnuityAnnualIncome, 39000);

  // Portfolio should be fully funded across retirement
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
    desiredAnnualIncomeNet: 45000, // Very aggressive withdrawal!
    takeTaxFreeLumpSumAtRetirement: false,
    assumedRealReturnPercent: 4.5,
    inflationPercent: 2.5,
    statePensionAge: 67,
    qualifiesForFullStatePension: true,
    annuityQuoteRatePercent: 6.0,
  });

  // Pot should run out before age 90
  assert.equal(result.isFullyFunded, false);
  assert.equal(result.verdict, "RISK_OF_DEPLETION");
  assert.ok(result.potLastsUntilAge < 90);
});
