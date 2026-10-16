import test from "node:test";
import assert from "node:assert/strict";
import {
  getEmployeeMarginalTaxRate,
  calculateProgressiveEVTaxDelta,
  calculateMonthlyEVElectricityCost,
  runEVCalculation,
} from "../src/lib/ev-calculator.ts";

test("getEmployeeMarginalTaxRate - Correct marginal tax brackets", () => {
  assert.equal(Math.round(getEmployeeMarginalTaxRate(40000) * 100), 28);
  assert.equal(Math.round(getEmployeeMarginalTaxRate(75000) * 100), 42);
  assert.equal(Math.round(getEmployeeMarginalTaxRate(110000) * 100), 62);
  assert.equal(Math.round(getEmployeeMarginalTaxRate(150000) * 100), 47);
});

test("calculateProgressiveEVTaxDelta - Exact progressive band slicing across thresholds", () => {
  // Employee earning £53,000 sacrificing £7,800/yr (£650/mo) crosses the £50,270 higher-rate threshold:
  // Only £2,730 is saved at 42% (40% IT + 2% NI), while £5,070 is saved at 28% (20% IT + 8% NI).
  // A naive flat 42% multiplier would overestimate savings at £3,276/yr (£273/mo), whereas exact progressive slicing is ~£2,566/yr (£214/mo).
  const delta = calculateProgressiveEVTaxDelta(53000, 7800, 48000);
  assert.ok(delta.annualTaxAndNiRelief > 2400 && delta.annualTaxAndNiRelief < 2700, `Got ${delta.annualTaxAndNiRelief}`);
  assert.ok(delta.annualBikTax > 0);
});

test("calculateMonthlyEVElectricityCost - Fuel economics", () => {
  const monthlyCost = calculateMonthlyEVElectricityCost(10000, 80, true);
  assert.ok(monthlyCost > 40 && monthlyCost < 55, `Got ${monthlyCost}`);
});

test("runEVCalculation - Salary sacrifice beats private PCP", () => {
  const result = runEVCalculation({
    vehicleP11DValue: 48000,
    grossMonthlyLease: 650,
    grossAnnualSalary: 85000,
    annualMileage: 10000,
    homeChargingPercent: 80,
    hasSmartEVTariff: true,
    currentCarMonthlyFuel: 160,
    currentCarMonthlyInsurance: 60,
    currentCarMonthlyMaintenance: 40,
  });

  assert.ok(result.salarySacrificeOption.monthlyTaxRelief > 250);
  assert.ok(
    result.salarySacrificeOption.netTotalMonthlyCost < result.pcpOption.netTotalMonthlyCost,
    `SalSac (${result.salarySacrificeOption.netTotalMonthlyCost}) should be less than PCP (${result.pcpOption.netTotalMonthlyCost})`
  );
  assert.ok(result.monthlySavingsVsPcp > 200, `Expected savings > £200, got ${result.monthlySavingsVsPcp}`);
});
