import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSDLT,
  calculateMonthlyMortgage,
  runBuyVsRentCalculation,
  runStressTests,
} from "../src/lib/calculator.ts";

test("calculateSDLT - First-time buyer relief thresholds", () => {
  // Up to £425k is zero SDLT for FTB
  assert.equal(calculateSDLT(300000, true), 0);
  assert.equal(calculateSDLT(425000, true), 0);

  // £500k FTB: 5% on £75k = £3,750
  assert.equal(calculateSDLT(500000, true), 3750);

  // Max FTB threshold £625k: 5% on £200k = £10,000
  assert.equal(calculateSDLT(625000, true), 10000);

  // Over £625k loses FTB relief, falls to standard rates:
  // £650,000 -> 0% on 250k, 5% on 400k = £20,000
  assert.equal(calculateSDLT(650000, true), 20000);
});

test("calculateSDLT - Standard residential rates", () => {
  // Below £250k is zero
  assert.equal(calculateSDLT(200000, false), 0);
  assert.equal(calculateSDLT(250000, false), 0);

  // £300,000: 5% on £50k = £2,500
  assert.equal(calculateSDLT(300000, false), 2500);

  // £500,000: 5% on £250k = £12,500
  assert.equal(calculateSDLT(500000, false), 12500);

  // £1,000,000:
  // 0% on 250k (£0)
  // 5% on 675k (£33,750)
  // 10% on 75k (£7,500)
  // Total = £41,250
  assert.equal(calculateSDLT(1000000, false), 41250);
});

test("calculateMonthlyMortgage - Standard amortization", () => {
  // £200,000 loan, 5% rate, 25 years
  const monthly = calculateMonthlyMortgage(200000, 5, 25);
  // Expected is approximately £1,169.18
  assert.ok(monthly > 1168 && monthly < 1170, `Expected ~1169.18, got ${monthly}`);

  // 0% rate edge case
  const zeroRate = calculateMonthlyMortgage(120000, 0, 10);
  assert.equal(zeroRate, 1000);
});

test("runBuyVsRentCalculation - Generates complete annual projections", () => {
  const inputs = {
    propertyPrice: 400000,
    depositPercent: 15,
    mortgageRate: 4.5,
    mortgageTerm: 25,
    fixedTermYears: 5,
    svrRate: 7.0,
    isFirstTimeBuyer: true,
    stampDutyOverride: null,
    legalFees: 1500,
    surveyFees: 500,
    councilTaxMonthly: 150,
    serviceChargeMonthly: 100,
    maintenancePercent: 1.0,
    insuranceMonthly: 30,
    initialRent: 1600,
    rentIncreasePercent: 3.5,
    renterInsuranceMonthly: 15,
    investmentReturnPercent: 7.0,
    inflationPercent: 2.5,
    houseAppreciationPercent: 3.5,
    timeHorizonYears: 10,
  };

  const results = runBuyVsRentCalculation(inputs);

  assert.equal(results.annualBreakdown.length, 10);
  assert.equal(results.depositAmount, 60000);
  assert.equal(results.loanAmount, 340000);

  const year10 = results.annualBreakdown[9];
  assert.equal(year10.year, 10);
  assert.ok(year10.buyerTotalNetWorth > 0);
  assert.ok(year10.renterTotalNetWorth > 0);
  assert.ok(results.sunkCostBreakdown.buyTotal > 0);
  assert.ok(results.sunkCostBreakdown.rentTotal > 0);
});

test("runStressTests - Generates 4 stress test scenarios", () => {
  const inputs = {
    propertyPrice: 350000,
    depositPercent: 10,
    mortgageRate: 4.0,
    mortgageTerm: 25,
    fixedTermYears: 5,
    svrRate: 6.5,
    isFirstTimeBuyer: true,
    stampDutyOverride: null,
    legalFees: 1500,
    surveyFees: 500,
    councilTaxMonthly: 150,
    serviceChargeMonthly: 100,
    maintenancePercent: 1.0,
    insuranceMonthly: 30,
    initialRent: 1400,
    rentIncreasePercent: 3.0,
    renterInsuranceMonthly: 15,
    investmentReturnPercent: 7.0,
    inflationPercent: 2.5,
    houseAppreciationPercent: 3.0,
    timeHorizonYears: 15,
  };

  const tests = runStressTests(inputs);
  assert.equal(tests.length, 4);
  assert.equal(tests[0].id, "baseline");
  assert.equal(tests[1].id, "rate-hike");
  assert.equal(tests[2].id, "price-slump");
  assert.equal(tests[3].id, "rent-surge");
});
