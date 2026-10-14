import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateIncomeTax,
  calculateNationalInsurance,
  calculateChildBenefit,
  calculateChildcareValue,
  calculateMarginalTaxRate,
  runTaxOptimization,
} from "../src/lib/tax-calculator.ts";

test("calculateIncomeTax - Standard Personal Allowance and Bands", () => {
  // Below Personal Allowance: £0 tax
  assert.equal(calculateIncomeTax(12570).tax, 0);

  // £30,000: 20% on (£30,000 - £12,570 = £17,430) = £3,486
  assert.equal(calculateIncomeTax(30000).tax, 3486);

  // £50,270 (Top of basic rate): 20% on £37,700 = £7,540
  assert.equal(calculateIncomeTax(50270).tax, 7540);

  // £100,000: £7,540 (basic) + 40% on (£100,000 - £50,270 = £49,730 = £19,892) = £27,432
  const tax100k = calculateIncomeTax(100000);
  assert.equal(tax100k.personalAllowance, 12570);
  assert.equal(tax100k.tax, 27432);
});

test("calculateIncomeTax - The 60% Marginal Tax Trap (£100k to £125,140)", () => {
  // At £110,000: Excess is £10,000. PA reduced by £5,000 to £7,570.
  // Tax should increase by 40% on £10k (£4,000) + 40% on £5k lost allowance (£2,000) = £6,000 (an effective 60% tax rate!)
  const tax110k = calculateIncomeTax(110000);
  assert.equal(tax110k.personalAllowance, 7570);
  assert.equal(tax110k.tax, 33432); // £27,432 + £6,000 = £33,432!
  assert.equal(tax110k.tax - calculateIncomeTax(100000).tax, 6000);

  // At £125,140: Personal allowance is fully tapered to £0
  const tax125k = calculateIncomeTax(125140);
  assert.equal(tax125k.personalAllowance, 0);
  // Total tax: 20% on 37,700 (£7,540) + 40% on (125,140 - 37,700 = 87,440 = £34,976) = £42,516
  assert.equal(tax125k.tax, 42516);
});

test("calculateNationalInsurance - Class 1 Employee post-2024 rates", () => {
  // Under primary threshold £12,570
  assert.equal(calculateNationalInsurance(12570), 0);

  // £30,000: 8% on (£30,000 - £12,570 = £17,430) = £1,394.40 -> ~£1,394
  assert.equal(calculateNationalInsurance(30000), 1394);

  // £100,000: 8% on £37,700 (£3,016) + 2% on (£100,000 - £50,270 = £49,730 = £994.60) = ~£4,011
  assert.equal(calculateNationalInsurance(100000), 4011);
});

test("calculateChildBenefit - HICBC taper between £60k and £80k", () => {
  // 2 children: (25.60 + 16.95) * 52 = 42.55 * 52 = £2,212.60 -> £2,213
  const cb60k = calculateChildBenefit(60000, 2);
  assert.equal(cb60k.entitlement, 2213);
  assert.equal(cb60k.clawback, 0);
  assert.equal(cb60k.netBenefit, 2213);

  // At £70,000 (mid-point of £60k-£80k): 50% clawback
  const cb70k = calculateChildBenefit(70000, 2);
  assert.equal(Math.round(cb70k.clawback), Math.round(2213 * 0.5));

  // At £80,000+: 100% clawback
  const cb85k = calculateChildBenefit(85000, 2);
  assert.equal(cb85k.clawback, 2213);
  assert.equal(cb85k.netBenefit, 0);
});

test("calculateChildcareValue - Lost above £100,000 cliff edge", () => {
  // 1 child in childcare: £6,500 + £2,000 = £8,500
  assert.equal(calculateChildcareValue(99999, 1), 8500);
  // Over £100k cliff: drops to £0
  assert.equal(calculateChildcareValue(100001, 1), 0);
});

test("calculateMarginalTaxRate - Correct effective tax humps", () => {
  // £40k: 20% IT + 8% NI = 28%
  assert.equal(calculateMarginalTaxRate(40000), 28);

  // £75k: 40% IT + 2% NI = 42%
  assert.equal(calculateMarginalTaxRate(75000), 42);

  // £110k: 40% IT + 20% PA loss + 2% NI = 62%
  assert.equal(calculateMarginalTaxRate(110000), 62);

  // £110k with Student Loan Plan 2 (+9%) = 71%!
  assert.equal(calculateMarginalTaxRate(110000, true), 71);
});

test("runTaxOptimization - SIPP sacrifice wipes out 62% tax trap", () => {
  const result = runTaxOptimization({
    grossSalary: 110000,
    salarySacrificePension: 10000,
    numberOfChildren: 1,
    childrenInChildcare: 1,
    hasStudentLoanPlan2: false,
    hasStudentLoanPostgrad: false,
  });

  // Sacrificing £10k drops income from £110k to £100k
  assert.equal(result.withSacrifice.adjustedNetIncome, 100000);

  // Income Tax saved: £6,000 (60% rate!)
  assert.equal(result.taxSaved, 6000);

  // NI saved: 2% on £10k = £200
  assert.equal(result.niSaved, 200);

  // Total tax & NI saved = £6,200
  assert.equal(result.totalTaxAndNiSaved, 6200);

  // Preserved Childcare: £8,500
  assert.equal(result.childcarePreservedValue, 8500);

  // Out of pocket cost to put £10,000 in pension is only £3,800 (£38 per £100!)
  assert.equal(result.netCostToTakeHome, 3800);
  assert.equal(result.netCostPer100PoundPension, 38);
});
