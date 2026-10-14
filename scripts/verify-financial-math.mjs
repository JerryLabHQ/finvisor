/**
 * LadderPass Automated Math Verification Script
 * Intended for AI Agent autonomous verification before committing or deploying changes.
 * Run with: npm run verify:math
 */

import { calculateSDLT, calculateMonthlyMortgage, runBuyVsRentCalculation } from "../src/lib/calculator.ts";

console.log("=================================================");
console.log("  LADDERPASS AUTOMATED FINANCIAL MATH AUDIT     ");
console.log("=================================================");

let failedChecks = 0;

function check(name, condition, details = "") {
  if (condition) {
    console.log(`  [PASS] ${name}`);
  } else {
    console.error(`  [FAIL] ${name} ${details}`);
    failedChecks++;
  }
}

// 1. SDLT Bands Check
console.log("\n[1] Verifying UK Stamp Duty Land Tax (SDLT) Brackets:");
check("FTB £300,000 -> £0 SDLT", calculateSDLT(300000, true) === 0);
check("FTB £425,000 -> £0 SDLT", calculateSDLT(425000, true) === 0);
check("FTB £500,000 -> £3,750 SDLT", calculateSDLT(500000, true) === 3750);
check("FTB £625,000 -> £10,000 SDLT", calculateSDLT(625000, true) === 10000);
check("FTB £650,000 (disqualified) -> £20,000 SDLT", calculateSDLT(650000, true) === 20000);
check("Standard £250,000 -> £0 SDLT", calculateSDLT(250000, false) === 0);
check("Standard £400,000 -> £7,500 SDLT", calculateSDLT(400000, false) === 7500);
check("Standard £1,000,000 -> £41,250 SDLT", calculateSDLT(1000000, false) === 41250);

// 2. Amortization Math Check
console.log("\n[2] Verifying Mortgage Amortization Formulas:");
const m1 = calculateMonthlyMortgage(250000, 4.5, 25);
// Expected monthly for £250k at 4.5% over 25y is approx £1,389.58
check(
  "£250,000 at 4.5% over 25 years (~£1,389.58/mo)",
  Math.abs(m1 - 1389.58) < 1.0,
  `Got ${m1.toFixed(2)}`
);

const m2 = calculateMonthlyMortgage(400000, 5.0, 30);
// Expected monthly for £400k at 5% over 30y is approx £2,147.29
check(
  "£400,000 at 5.0% over 30 years (~£2,147.29/mo)",
  Math.abs(m2 - 2147.29) < 1.0,
  `Got ${m2.toFixed(2)}`
);

// 3. Multi-year Simulation Check
console.log("\n[3] Verifying Complete 25-Year Projection Simulation:");
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
check("Deposit amount equals £67,500", results.depositAmount === 67500);
check("Loan amount equals £382,500", results.loanAmount === 382500);
check("SDLT equals £1,250 for FTB at £450k", results.sdltCost === 1250);

const year25 = results.annualBreakdown[24];
check("Mortgage is fully repaid at Year 25 (balance <= 0)", year25.mortgageBalance <= 0);
check("Buyer final equity matches home value", year25.buyerEquity === year25.homeValue);
check("Sunk costs correctly accumulated", results.sunkCostBreakdown.buyTotal > 0 && results.sunkCostBreakdown.rentTotal > 0);

console.log("\n=================================================");
if (failedChecks === 0) {
  console.log("  ALL MATHEMATICAL AUDIT CHECKS PASSED (100%)    ");
  console.log("=================================================");
  process.exit(0);
} else {
  console.error(`  ${failedChecks} AUDIT CHECK(S) FAILED!         `);
  console.error("=================================================");
  process.exit(1);
}
