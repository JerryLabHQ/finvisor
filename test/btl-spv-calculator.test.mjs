import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBtlSDLT,
  runBTLCalculation,
} from "../src/lib/btl-spv-calculator.ts";

test("calculateBtlSDLT - 5% HRAD Surcharge applied correctly", () => {
  // Below £250k: 5% flat HRAD
  // £200,000 -> 5% on £200k = £10,000
  assert.equal(calculateBtlSDLT(200000), 10000);

  // £400,000:
  // 5% on first £250k = £12,500
  // (5% standard + 5% HRAD = 10%) on remaining £150k = £15,000
  // Total = £27,500
  assert.equal(calculateBtlSDLT(400000), 27500);
});

test("runBTLCalculation - Higher rate taxpayer faces Section 24 penalty", () => {
  const result = runBTLCalculation({
    propertyPrice: 300000,
    monthlyRent: 1600,
    depositPercent: 25,
    personalMortgageRate: 4.5,
    spvMortgageRate: 5.4,
    mortgageTermYears: 25,
    isInterestOnly: true,
    investorTaxBracket: "HIGHER_40",
    lettingAgentFeePercent: 10,
    annualMaintenancePercent: 1.0,
    annualInsurance: 300,
    annualAccountancySpv: 1200,
    dividendStrategy: "REINVEST_IN_SPV",
    assumedHpiAppreciationPercent: 3.5,
  });

  // Loan amount: 75% of £300k = £225,000
  assert.equal(result.loanAmount, 225000);
  assert.equal(result.depositAmount, 75000);

  // Section 24 drag for 40% taxpayer: 20% on mortgage interest (£225k * 4.5% = £10,125) -> ~£2,025/year
  assert.ok(result.section24TaxDragAnnual > 1900 && result.section24TaxDragAnnual < 2100);

  // SPV should win when reinvesting profits
  assert.equal(result.verdict, "SPV_WINS");
  assert.ok(result.annualCashflowDifference > 0);
});

test("runBTLCalculation - Basic rate taxpayer favors personal ownership", () => {
  const result = runBTLCalculation({
    propertyPrice: 200000,
    monthlyRent: 1100,
    depositPercent: 25,
    personalMortgageRate: 4.5,
    spvMortgageRate: 5.5,
    mortgageTermYears: 25,
    isInterestOnly: true,
    investorTaxBracket: "BASIC_20",
    lettingAgentFeePercent: 10,
    annualMaintenancePercent: 1.0,
    annualInsurance: 250,
    annualAccountancySpv: 1200,
    dividendStrategy: "EXTRACT_ALL_DIVIDENDS",
    assumedHpiAppreciationPercent: 3.0,
  });

  // For a basic rate taxpayer, personal ownership avoids the higher mortgage rate & accountant fee
  assert.equal(result.verdict, "PERSONAL_WINS");
  assert.ok(result.personal.netAnnualCashflow > result.spv.netAnnualCashflow);
});
