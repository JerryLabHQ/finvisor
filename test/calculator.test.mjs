import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSDLT,
  calculatePropertyTax,
  getJurisdictionFromCity,
  calculateMonthlyMortgage,
  runBuyVsRentCalculation,
  runStressTests,
} from "../src/lib/calculator.ts";
import { UK_CITIES, getCityBySlug } from "../src/lib/cities.ts";

test("calculateSDLT - Post-April 2025 First-time buyer relief thresholds", () => {
  // Up to £300k is zero SDLT for FTB
  assert.equal(calculateSDLT(250000, true), 0);
  assert.equal(calculateSDLT(300000, true), 0);

  // £425k FTB: 5% on (£425k - £300k = £125k) = £6,250
  assert.equal(calculateSDLT(425000, true), 6250);

  // Max FTB cap £500k: 5% on (£500k - £300k = £200k) = £10,000
  assert.equal(calculateSDLT(500000, true), 10000);

  // Over £500k loses FTB relief and reverts to standard post-April 2025 bands:
  // £550,000 -> 0% on £125k (£0) + 2% on £125k (£2,500) + 5% on £300k (£15,000) = £17,500
  assert.equal(calculateSDLT(550000, true), 17500);
});

test("calculateSDLT - Post-April 2025 Standard residential rates", () => {
  // Up to £125k is zero
  assert.equal(calculateSDLT(125000, false), 0);

  // £250,000: 2% on (£250k - £125k = £125k) = £2,500
  assert.equal(calculateSDLT(250000, false), 2500);

  // £400,000: £2,500 + 5% on £150k (£7,500) = £10,000
  assert.equal(calculateSDLT(400000, false), 10000);

  // £1,000,000:
  // 0% on £125k (£0) + 2% on £125k (£2,500) + 5% on £675k (£33,750) + 10% on £75k (£7,500) = £43,750
  assert.equal(calculateSDLT(1000000, false), 43750);
});

test("calculatePropertyTax - Scottish LBTT and Welsh LTT devolved engines", () => {
  // Scotland LBTT: £145k standard nil-rate, £175k FTB nil-rate
  assert.equal(calculatePropertyTax(170000, true, false, "SCOTLAND"), 0);
  // Standard £250k in Scotland: 2% on (£250k - £145k = £105k) = £2,100
  assert.equal(calculatePropertyTax(250000, false, false, "SCOTLAND"), 2100);
  // FTB £250k in Scotland: £2,100 - £600 FTB relief = £1,500
  assert.equal(calculatePropertyTax(250000, true, false, "SCOTLAND"), 1500);
  // Additional Dwelling Supplement (8% ADS) on £250k in Scotland: £2,100 + £20,000 = £22,100
  assert.equal(calculatePropertyTax(250000, false, true, "SCOTLAND"), 22100);

  // Wales LTT: £225k nil-rate (no separate FTB relief)
  assert.equal(calculatePropertyTax(225000, true, false, "WALES"), 0);
  // £300,000 in Wales: 6% on (£300k - £225k = £75k) = £4,500
  assert.equal(calculatePropertyTax(300000, false, false, "WALES"), 4500);
  // Additional property in Wales (+5% surcharge across bands) on £200,000 = 5% of £200k = £10,000
  assert.equal(calculatePropertyTax(200000, false, true, "WALES"), 10000);

  // Jurisdiction mapping from city slugs
  assert.equal(getJurisdictionFromCity("edinburgh"), "SCOTLAND");
  assert.equal(getJurisdictionFromCity("glasgow"), "SCOTLAND");
  assert.equal(getJurisdictionFromCity("cardiff"), "WALES");
  assert.equal(getJurisdictionFromCity("london"), "ENGLAND_NI");
  assert.equal(getJurisdictionFromCity("belfast"), "ENGLAND_NI");
});

test("calculateMonthlyMortgage - Standard amortization", () => {
  const monthly = calculateMonthlyMortgage(200000, 5, 25);
  assert.ok(monthly > 1168 && monthly < 1170, `Expected ~1169.18, got ${monthly}`);

  const zeroRate = calculateMonthlyMortgage(120000, 0, 10);
  assert.equal(zeroRate, 1000);
});

test("runBuyVsRentCalculation - Nominal renter deposit & selling-fee-adjusted breakeven", () => {
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
  // Post-April 2025 FTB SDLT on £400k: 5% on £100k = £5,000
  assert.equal(results.sdltCost, 5000);

  // Renter deposit refundable must remain at nominal face value (5 weeks of initial £1,600 rent = £1,846)
  const expectedNominalRenterDeposit = Math.round((1600 * 12) / 52 * 5);
  const year10 = results.annualBreakdown[9];
  assert.equal(year10.renterDepositRefundable, expectedNominalRenterDeposit);
  assert.equal(year10.renterInvestmentPot + year10.renterDepositRefundable, year10.renterTotalNetWorth);

  // Net worth difference at horizon deducts selling fees
  const expectedNetDiff = (year10.buyerTotalNetWorth - results.sellingFeesAtHorizon) - year10.renterTotalNetWorth;
  assert.equal(results.netWorthDifferenceAtHorizon, expectedNetDiff);
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

test("UK commuter city hubs - Statutory FTB SDLT and benchmark metrics", () => {
  assert.equal(UK_CITIES.length, 23);
  const commuterSlugs = ["guildford", "st-albans", "reading", "milton-keynes", "chelmsford"];

  for (const slug of commuterSlugs) {
    const city = getCityBySlug(slug);
    assert.ok(city, `City ${slug} must exist in UK_CITIES`);
    assert.equal(getJurisdictionFromCity(slug), "ENGLAND_NI");
  }

  // 1. Guildford (£485k, £1,850 rent, 21.8x P/R, 3.4% HPI)
  const guildford = getCityBySlug("guildford");
  assert.equal(guildford.averagePrice, 485000);
  assert.equal(guildford.averageRentMonthly, 1850);
  assert.equal(guildford.priceToRentRatio, 21.8);
  assert.equal(guildford.historicalHpi5YrAvg, 3.4);
  assert.equal(calculateSDLT(guildford.averagePrice, true), 9250);
  assert.ok(guildford.highlights.some((h) => h.includes("£9,250") && h.includes("£300k")));

  // 2. St Albans (£545k, £1,950 rent, 23.3x P/R, 3.2% HPI)
  const stAlbans = getCityBySlug("st-albans");
  assert.equal(stAlbans.averagePrice, 545000);
  assert.equal(stAlbans.averageRentMonthly, 1950);
  assert.equal(stAlbans.priceToRentRatio, 23.3);
  assert.equal(stAlbans.historicalHpi5YrAvg, 3.2);
  // St Albans exceeds £500k FTB cap -> standard SDLT applies (£17,250)
  assert.equal(calculateSDLT(stAlbans.averagePrice, true), 17250);
  assert.equal(calculateSDLT(stAlbans.averagePrice, false), 17250);
  assert.ok(stAlbans.highlights.some((h) => h.includes("£17,250") && h.includes(">£500k")));

  // 3. Reading (£355k, £1,550 rent, 19.1x P/R, 3.6% HPI)
  const reading = getCityBySlug("reading");
  assert.equal(reading.averagePrice, 355000);
  assert.equal(reading.averageRentMonthly, 1550);
  assert.equal(reading.priceToRentRatio, 19.1);
  assert.equal(reading.historicalHpi5YrAvg, 3.6);
  assert.equal(calculateSDLT(reading.averagePrice, true), 2750);
  assert.ok(reading.highlights.some((h) => h.includes("£2,750") && h.includes("£300k")));

  // 4. Milton Keynes (£330k, £1,450 rent, 18.9x P/R, 3.8% HPI)
  const miltonKeynes = getCityBySlug("milton-keynes");
  assert.equal(miltonKeynes.averagePrice, 330000);
  assert.equal(miltonKeynes.averageRentMonthly, 1450);
  assert.equal(miltonKeynes.priceToRentRatio, 18.9);
  assert.equal(miltonKeynes.historicalHpi5YrAvg, 3.8);
  assert.equal(calculateSDLT(miltonKeynes.averagePrice, true), 1500);
  assert.ok(miltonKeynes.highlights.some((h) => h.includes("£1,500") && h.includes("£300k")));

  // 5. Chelmsford (£360k, £1,475 rent, 20.3x P/R, 3.7% HPI)
  const chelmsford = getCityBySlug("chelmsford");
  assert.equal(chelmsford.averagePrice, 360000);
  assert.equal(chelmsford.averageRentMonthly, 1475);
  assert.equal(chelmsford.priceToRentRatio, 20.3);
  assert.equal(chelmsford.historicalHpi5YrAvg, 3.7);
  assert.equal(calculateSDLT(chelmsford.averagePrice, true), 3000);
  assert.ok(chelmsford.highlights.some((h) => h.includes("£3,000") && h.includes("£300k")));
});
