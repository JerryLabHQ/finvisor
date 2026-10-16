import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBtlSDLT,
  calculateUkCorporationTax,
  runBTLCalculation,
} from "../src/lib/btl-spv-calculator.ts";

test("calculateBtlSDLT - Post-April 2025 Standard SDLT + 5% HRAD Surcharge", () => {
  // £200,000:
  // £0–£125k at 5% = £6,250
  // £125k–£200k (£75k) at (2% + 5% = 7%) = £5,250
  // Total = £11,500
  assert.equal(calculateBtlSDLT(200000), 11500);

  // £300,000:
  // £0–£125k at 5% (£6,250) + £125k–£250k at 7% (£8,750) + £250k–£300k at 10% (£5,000) = £20,000
  assert.equal(calculateBtlSDLT(300000), 20000);

  // £400,000:
  // £6,250 + £8,750 + £150k at 10% (£15,000) = £30,000
  assert.equal(calculateBtlSDLT(400000), 30000);
});

test("calculateUkCorporationTax - Statutory 19% small profits, 26.5% marginal relief, and 25% main rate", () => {
  // Small profits rate (<= £50,000): 19%
  assert.equal(calculateUkCorporationTax(40000), 7600);
  assert.equal(calculateUkCorporationTax(50000), 9500);

  // Marginal relief zone (£50,000 to £250,000): 19% on first £50k (£9,500) + 26.5% on excess
  // At £100,000: £9,500 + 26.5% of £50,000 (£13,250) = £22,750
  assert.equal(calculateUkCorporationTax(100000), 22750);

  // Main rate (>= £250,000): 25% flat
  assert.equal(calculateUkCorporationTax(250000), 62500);
  assert.equal(calculateUkCorporationTax(300000), 75000);
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

  assert.equal(result.loanAmount, 225000);
  assert.equal(result.depositAmount, 75000);
  assert.equal(result.sdltCost, 20000);
  assert.ok(result.section24TaxDragAnnual > 1900 && result.section24TaxDragAnnual < 2100);
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

  assert.equal(result.verdict, "PERSONAL_WINS");
  assert.ok(result.personal.netAnnualCashflow > result.spv.netAnnualCashflow);
});
