import test from "node:test";
import assert from "node:assert/strict";
import {
  getEmployeeMarginalTaxRate,
  calculateMonthlyEVElectricityCost,
  runEVCalculation,
} from "../src/lib/ev-calculator.ts";

test("getEmployeeMarginalTaxRate - Correct marginal tax brackets", () => {
  // £40,000: 20% IT + 8% NI = 28%
  assert.equal(Math.round(getEmployeeMarginalTaxRate(40000) * 100), 28);

  // £75,000: 40% IT + 2% NI = 42%
  assert.equal(Math.round(getEmployeeMarginalTaxRate(75000) * 100), 42);

  // £110,000: 60% IT + 2% NI = 62% (The Trap)
  assert.equal(Math.round(getEmployeeMarginalTaxRate(110000) * 100), 62);

  // £150,000: 45% IT + 2% NI = 47%
  assert.equal(Math.round(getEmployeeMarginalTaxRate(150000) * 100), 47);
});

test("calculateMonthlyEVElectricityCost - Fuel economics", () => {
  // 10,000 miles, 80% home with smart tariff (7p), 20% public (75p)
  // Expected cost is around £46/month (~£550/year)
  const monthlyCost = calculateMonthlyEVElectricityCost(10000, 80, true);
  assert.ok(monthlyCost > 40 && monthlyCost < 55, `Got ${monthlyCost}`);
});

test("runEVCalculation - Salary sacrifice massively beats private PCP", () => {
  const result = runEVCalculation({
    vehicleP11DValue: 48000, // Tesla Model Y Long Range
    grossMonthlyLease: 650,
    grossAnnualSalary: 85000, // 42% marginal rate
    annualMileage: 10000,
    homeChargingPercent: 80,
    hasSmartEVTariff: true,
    currentCarMonthlyFuel: 160,
    currentCarMonthlyInsurance: 60,
    currentCarMonthlyMaintenance: 40,
  });

  // Salary sacrifice option gets 42% tax relief
  assert.ok(result.salarySacrificeOption.monthlyTaxRelief > 250);

  // Net cost of SalSac is substantially lower than PCP
  assert.ok(
    result.salarySacrificeOption.netTotalMonthlyCost < result.pcpOption.netTotalMonthlyCost,
    `SalSac (${result.salarySacrificeOption.netTotalMonthlyCost}) should be less than PCP (${result.pcpOption.netTotalMonthlyCost})`
  );

  // Monthly savings vs PCP should be £200+
  assert.ok(result.monthlySavingsVsPcp > 200, `Expected savings > £200, got ${result.monthlySavingsVsPcp}`);
});
