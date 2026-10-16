/**
 * LadderPass Comprehensive Financial Mathematics & Statutory Audit
 * Audits all 6 modules of "The UK Financial Ladder" against official UK benchmarks:
 * - HM Revenue & Customs (Post-April 2025 SDLT, Income Tax, NI, HICBC, BiK, Section 24, Marginal Corp Tax)
 * - Revenue Scotland (LBTT & 8% ADS) & Welsh Revenue Authority (LTT)
 * - Bank of England & Building Societies Association (Amortization & Stress Testing)
 * - Student Loans Company (2025/26 Plan 1, Plan 2, Plan 4, Plan 5, Postgrad thresholds)
 * - Department for Work and Pensions (£11,973 New State Pension & Inverse Tax Drawdown Solver)
 *
 * Run with: npm run verify:math
 */

import {
  calculateSDLT,
  calculatePropertyTax,
  calculateMonthlyMortgage,
  runBuyVsRentCalculation,
} from "../src/lib/calculator.ts";
import {
  calculateIncomeTax,
  calculateNationalInsurance,
  calculateChildBenefit,
  runTaxOptimization,
} from "../src/lib/tax-calculator.ts";
import {
  getEmployeeMarginalTaxRate,
  calculateProgressiveEVTaxDelta,
  runEVCalculation,
} from "../src/lib/ev-calculator.ts";
import {
  calculateMandatoryRepayment,
  getStudentLoanInterestRate,
  runStudentLoanCalculation,
} from "../src/lib/student-loan-calculator.ts";
import {
  calculateBtlSDLT,
  calculateUkCorporationTax,
  runBTLCalculation,
} from "../src/lib/btl-spv-calculator.ts";
import {
  calculatePensionDrawdownTax,
  solveGrossPensionDrawdownForNet,
  runPensionCalculation,
} from "../src/lib/pension-calculator.ts";

console.log("===============================================================");
console.log("    LADDERPASS: THE UK FINANCIAL LADDER MATHEMATICAL AUDIT    ");
console.log("===============================================================");

let failedChecks = 0;

function check(name, condition, details = "") {
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name} ${details}`);
    failedChecks++;
  }
}

// 1. Post-April 2025 SDLT & Devolved UK Property Taxes (LBTT & LTT)
console.log("\n[1] Property: Post-April 2025 SDLT, Scottish LBTT & Welsh LTT:");
check("FTB £300,000 -> £0 SDLT", calculateSDLT(300000, true) === 0);
check("FTB £425,000 -> £6,250 SDLT (5% above £300k)", calculateSDLT(425000, true) === 6250);
check("FTB £500,000 -> £10,000 SDLT (max FTB cap)", calculateSDLT(500000, true) === 10000);
check("FTB £550,000 (>£500k cap) -> £17,500 standard SDLT", calculateSDLT(550000, true) === 17500);
check("Standard £125,000 -> £0 SDLT", calculateSDLT(125000, false) === 0);
check("Standard £250,000 -> £2,500 SDLT (2% on £125k-£250k)", calculateSDLT(250000, false) === 2500);
check("Standard £400,000 -> £10,000 SDLT", calculateSDLT(400000, false) === 10000);
check("Standard £1,000,000 -> £43,750 SDLT", calculateSDLT(1000000, false) === 43750);
check("Scotland LBTT FTB £250,000 -> £1,500 (£175k nil-rate)", calculatePropertyTax(250000, true, false, "SCOTLAND") === 1500);
check("Scotland LBTT BTL £250,000 (with 8% ADS) -> £22,100", calculatePropertyTax(250000, false, true, "SCOTLAND") === 22100);
check("Wales LTT Standard £300,000 -> £4,500 (£225k nil-rate)", calculatePropertyTax(300000, false, false, "WALES") === 4500);
check("Guildford FTB £485,000 -> £9,250 SDLT (5% above £300k)", calculateSDLT(485000, true) === 9250);
check("St Albans FTB £545,000 (>£500k cap) -> £17,250 standard SDLT", calculateSDLT(545000, true) === 17250);
check("Reading FTB £355,000 -> £2,750 SDLT (5% above £300k)", calculateSDLT(355000, true) === 2750);
check("Milton Keynes FTB £330,000 -> £1,500 SDLT (5% above £300k)", calculateSDLT(330000, true) === 1500);
check("Chelmsford FTB £360,000 -> £3,000 SDLT (5% above £300k)", calculateSDLT(360000, true) === 3000);

// 2. Amortization Math Check
console.log("\n[2] Property: Mortgage Amortization Formulas:");
const m1 = calculateMonthlyMortgage(250000, 4.5, 25);
check("£250,000 at 4.5% over 25 years (~£1,389.58/mo)", Math.abs(m1 - 1389.58) < 1.0, `Got ${m1.toFixed(2)}`);
const m2 = calculateMonthlyMortgage(400000, 5.0, 30);
check("£400,000 at 5.0% over 30 years (~£2,147.29/mo)", Math.abs(m2 - 2147.29) < 1.0, `Got ${m2.toFixed(2)}`);

// 3. Multi-year Property Simulation Check
console.log("\n[3] Property: Complete 25-Year Buy vs. Rent Projection:");
const sampleInputs = {
  propertyPrice: 450000,
  depositPercent: 15,
  mortgageRate: 4.5,
  mortgageTerm: 25,
  fixedTermYears: 5,
  svrRate: 7.0,
  isFirstTimeBuyer: true,
  stampDutyOverride: null,
  legalFees: 1600,
  surveyFees: 550,
  councilTaxMonthly: 180,
  serviceChargeMonthly: 140,
  maintenancePercent: 1.0,
  insuranceMonthly: 35,
  initialRent: 1850,
  rentIncreasePercent: 3.5,
  renterInsuranceMonthly: 15,
  investmentReturnPercent: 7.0,
  inflationPercent: 2.5,
  houseAppreciationPercent: 3.5,
  timeHorizonYears: 25,
};
const results = runBuyVsRentCalculation(sampleInputs);
check("Annual breakdown contains 25 years", results.annualBreakdown.length === 25);
check("Deposit equals £67,500", results.depositAmount === 67500);
check("Loan equals £382,500", results.loanAmount === 382500);
check("Post-April 2025 FTB SDLT equals £7,500 at £450k", results.sdltCost === 7500);
const year25 = results.annualBreakdown[24];
check("Mortgage balance <= 0 at Year 25", year25.mortgageBalance <= 0);
check("Buyer final equity matches home value", year25.buyerEquity === year25.homeValue);
check("Renter deposit stays at nominal face value", year25.renterInvestmentPot + year25.renterDepositRefundable === year25.renterTotalNetWorth);

// 4. Tax Trap & SIPP Engine Check
console.log("\n[4] Tax: UK 60% Marginal Tax Trap & SIPP Optimization:");
const tax100k = calculateIncomeTax(100000);
const tax110k = calculateIncomeTax(110000);
check("Income tax at £100k equals £27,432", tax100k.tax === 27432);
check("Income tax at £110k equals £33,432 (60% on £10k)", tax110k.tax === 33432);
check("Personal Allowance tapered by £5,000 at £110k", tax110k.personalAllowance === 7570);
check("Class 1 NI at £30k equals £1,394 (8% post-2024)", calculateNationalInsurance(30000) === 1394);
const cbTest = calculateChildBenefit(70000, 2);
check("Child Benefit clawed back by 50% at £70k (HICBC)", Math.abs(cbTest.clawback - cbTest.entitlement * 0.5) < 2);
const taxOpt = runTaxOptimization({
  grossSalary: 115000,
  salarySacrificePension: 15000,
  numberOfChildren: 1,
  childrenInChildcare: 1,
  hasStudentLoanPlan2: false,
  hasStudentLoanPostgrad: false,
});
check("SIPP sacrifice restores full £12,570 Personal Allowance", taxOpt.withSacrifice.personalAllowance === 12570);
check("SIPP sacrifice saves 60% Income Tax (£9,000)", taxOpt.taxSaved === 9000);
check("Net out-of-pocket cost is only £38 per £100 pension", taxOpt.netCostPer100PoundPension === 38);

// 5. EV Salary Sacrifice Engine Check
console.log("\n[5] EV Mobility: Progressive Band Slicing & Salary Sacrifice vs. PCP:");
check("Higher-rate employee receives 42% marginal relief", Math.round(getEmployeeMarginalTaxRate(80000) * 100) === 42);
check("£100k-£125k employee receives 62% marginal relief", Math.round(getEmployeeMarginalTaxRate(115000) * 100) === 62);
const evCrossBand = calculateProgressiveEVTaxDelta(53000, 7800, 48000);
check("Progressive EV band slicing across £50,270 threshold (~£2,566/yr vs £3,276 flat)", evCrossBand.annualTaxAndNiRelief > 2400 && evCrossBand.annualTaxAndNiRelief < 2700);
const evTest = runEVCalculation({
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
check("Salary sacrifice beats PCP by >£200/month", evTest.monthlySavingsVsPcp > 200);
check("Annual fuel savings vs petrol > £800/yr", evTest.fuelSavingsAnnual > 800);

// 6. Student Loan Repayment & Wipeout Check
console.log("\n[6] Student Loan: 2025/26 Statutory Thresholds & Write-Off Simulation:");
check("Plan 2 repayment on £38,470 equals £900/yr (9% above £28,470)", calculateMandatoryRepayment("PLAN_2", 38470) === 900);
check("Plan 5 repayment on £35,000 equals £900/yr (9% above £25,000)", calculateMandatoryRepayment("PLAN_5", 35000) === 900);
check("Plan 1 repayment on £36,065 equals £900/yr (9% above £26,065)", calculateMandatoryRepayment("PLAN_1", 36065) === 900);
check("Plan 4 repayment on £42,745 equals £900/yr (9% above £32,745)", calculateMandatoryRepayment("PLAN_4", 42745) === 900);
check("Plan 2 interest reaches RPI+3% above £51,245", getStudentLoanInterestRate("PLAN_2", 52000, 3.0) === 6.0);
const slTest = runStudentLoanCalculation({
  currentSalary: 32000,
  currentLoanBalance: 50000,
  loanPlan: "PLAN_2",
  annualSalaryGrowthPercent: 3.5,
  assumedRpiPercent: 3.0,
  yearsSinceGraduation: 2,
  voluntaryMonthlyOverpayment: 0,
});
check("Identifies Do Not Overpay for moderate earners (wipeout > £0)", slTest.verdict === "DO_NOT_OVERPAY" && slTest.debtWipedOutStandard > 0);

// 7. Buy-to-Let SPV vs Personal Check
console.log("\n[7] Buy-to-Let: Section 24, HRAD SDLT & Marginal Corporation Tax:");
check("Post-April 2025 5% HRAD Stamp Duty on £300k equals £20,000", calculateBtlSDLT(300000) === 20000);
check("UK Corp Tax at £50k equals £9,500 (19% small profits rate)", calculateUkCorporationTax(50000) === 9500);
check("UK Corp Tax at £100k equals £22,750 (26.5% marginal relief band)", calculateUkCorporationTax(100000) === 22750);
check("UK Corp Tax at £250k equals £62,500 (25% main rate)", calculateUkCorporationTax(250000) === 62500);
const btlTest = runBTLCalculation({
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
check("Section 24 tax drag computed accurately (>£1,900/yr)", btlTest.section24TaxDragAnnual > 1900);
check("SPV wins for Higher Rate landlord reinvesting profits", btlTest.verdict === "SPV_WINS");

// 8. Pension Drawdown & 2027 IHT Check
console.log("\n[8] Retirement: Inverse Tax Drawdown Solver, SIPP & 2027 IHT Simulator:");
check("Drawdown tax uses standard personal allowance (£0 on £12,570)", calculatePensionDrawdownTax(12570, 0) === 0);
const invGross = solveGrossPensionDrawdownForNet(30000, 11973);
check("Inverse drawdown solver converges within £1 of target net income", Math.abs(invGross - calculatePensionDrawdownTax(invGross, 11973) - 30000) <= 1);
const penTest = runPensionCalculation({
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
check("25% PCLS tax-free lump sum equals £150,000", penTest.pclsLumpSumTaken === 150000);
check("Drawdown confirmed sustainable to age 85", penTest.isFullyFunded && penTest.verdict === "SUSTAINABLE_DRAWDOWN");
check("Guaranteed annuity benchmark computed (£39,000/yr)", penTest.guaranteedAnnuityAnnualIncome === 39000);

console.log("\n===============================================================");
if (failedChecks === 0) {
  console.log("  ALL STATUTORY AUDIT CHECKS PASSED (100% MATHEMATICAL AUDIT) ");
  console.log("===============================================================");
  process.exit(0);
} else {
  console.error(`  ${failedChecks} AUDIT CHECK(S) FAILED!                       `);
  console.error("===============================================================");
  process.exit(1);
}
