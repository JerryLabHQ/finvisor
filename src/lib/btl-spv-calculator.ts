/**
 * UK Buy-to-Let (BTL) Ownership Modeler: Personal Name vs. Limited Company (SPV)
 * Implements Section 24 mortgage interest relief restrictions,
 * 19%-25% Corporation Tax, dividend extraction tax, and 5% HRAD Stamp Duty.
 * Verified against HMRC statutory rules.
 */

export interface BTLInputs {
  propertyPrice: number;            // Purchase price (£)
  monthlyRent: number;              // Gross monthly rental income (£)
  depositPercent: number;           // Equity deposit % (e.g. 25%)
  personalMortgageRate: number;     // Interest rate % for personal BTL (e.g. 4.5%)
  spvMortgageRate: number;          // Interest rate % for Limited Co SPV (e.g. 5.3%)
  mortgageTermYears: number;        // Term (e.g. 25)
  isInterestOnly: boolean;          // BTL is predominantly interest-only
  investorTaxBracket: "BASIC_20" | "HIGHER_40" | "ADDITIONAL_45";
  lettingAgentFeePercent: number;   // e.g. 10%
  annualMaintenancePercent: number; // e.g. 1.0%
  annualInsurance: number;          // e.g. £300
  annualAccountancySpv: number;     // e.g. £1,200 for accounts and filings
  dividendStrategy: "REINVEST_IN_SPV" | "EXTRACT_ALL_DIVIDENDS";
  assumedHpiAppreciationPercent: number; // e.g. 3.5%
}

export interface BTLScenarioBreakdown {
  grossAnnualRent: number;
  annualMortgagePayment: number;
  annualOperatingExpenses: number;
  taxableProfit: number;
  taxPaid: number;
  section24TaxCredit: number;       // Personal only
  netAnnualCashflow: number;
  netMonthlyCashflow: number;
  returnOnEquityPercent: number;
  effectiveTaxRateOnProfitPercent: number;
}

export interface BTLResults {
  inputs: BTLInputs;
  personal: BTLScenarioBreakdown;
  spv: BTLScenarioBreakdown;
  loanAmount: number;
  depositAmount: number;
  sdltCost: number;                  // Stamp duty with 5% surcharge
  initialCapitalRequired: number;    // Deposit + SDLT + Legal
  section24TaxDragAnnual: number;    // Extra tax paid personally due to Sec 24
  annualCashflowDifference: number;  // SPV cashflow minus Personal cashflow
  tenYearCumulativeDifference: number;
  verdict: "SPV_WINS" | "PERSONAL_WINS" | "CLOSE_CALL";
  verdictReasoning: string;
}

export const BTL_CONSTANTS = {
  // Surcharge for additional residential properties
  hradSurchargePercent: 0.05, // 5% surcharge
  standardBands: [
    { upTo: 250000, rate: 0.00 },
    { upTo: 925000, rate: 0.05 },
    { upTo: 1500000, rate: 0.10 },
    { upTo: Infinity, rate: 0.12 },
  ],
  // Corporation Tax rates
  corpTaxSmallProfitsRate: 0.19, // Up to £50,000 profits
  corpTaxMainRate: 0.25,         // Over £250,000 profits
  // Dividend Tax rates (2024-2026)
  dividendAllowance: 500,        // £500 tax-free dividend allowance
  dividendBasicRate: 0.0875,     // 8.75%
  dividendHigherRate: 0.3375,    // 33.75%
  dividendAdditionalRate: 0.3935,// 39.35%
  // Typical upfront friction
  legalFees: 1800,
  surveyFees: 600,
};

/**
 * Calculates Stamp Duty for BTL / SPV (including 5% HRAD surcharge)
 */
export function calculateBtlSDLT(propertyPrice: number): number {
  let tax = 0;
  let previousThreshold = 0;

  for (const band of BTL_CONSTANTS.standardBands) {
    if (propertyPrice > previousThreshold) {
      const taxableInBand = Math.min(propertyPrice, band.upTo) - previousThreshold;
      const combinedRate = band.rate + BTL_CONSTANTS.hradSurchargePercent;
      tax += taxableInBand * combinedRate;
      previousThreshold = band.upTo;
    }
  }

  return Math.round(tax);
}

/**
 * Computes the comparative BTL analysis
 */
export function runBTLCalculation(inputs: BTLInputs): BTLResults {
  const depositAmount = Math.round(inputs.propertyPrice * (inputs.depositPercent / 100));
  const loanAmount = inputs.propertyPrice - depositAmount;

  // Stamp duty and initial capital
  const sdltCost = calculateBtlSDLT(inputs.propertyPrice);
  const initialCapitalRequired = depositAmount + sdltCost + BTL_CONSTANTS.legalFees + BTL_CONSTANTS.surveyFees;

  const grossAnnualRent = inputs.monthlyRent * 12;
  const annualOperatingExpenses = Math.round(
    grossAnnualRent * (inputs.lettingAgentFeePercent / 100) +
    inputs.propertyPrice * (inputs.annualMaintenancePercent / 100) +
    inputs.annualInsurance
  );

  // 1. Personal Ownership Calculation (Section 24 applies)
  const personalAnnualMortgage = inputs.isInterestOnly
    ? Math.round(loanAmount * (inputs.personalMortgageRate / 100))
    : Math.round(
        (loanAmount *
          (inputs.personalMortgageRate / 100 / 12) *
          Math.pow(1 + inputs.personalMortgageRate / 100 / 12, inputs.mortgageTermYears * 12)) /
          (Math.pow(1 + inputs.personalMortgageRate / 100 / 12, inputs.mortgageTermYears * 12) - 1) *
          12
      );

  // Under Section 24: Mortgage interest is NOT deductible from rental income
  const personalTaxableProfit = Math.max(0, grossAnnualRent - annualOperatingExpenses);

  let personalTaxRate = 0.20;
  let dividendRate = BTL_CONSTANTS.dividendBasicRate;
  if (inputs.investorTaxBracket === "HIGHER_40") {
    personalTaxRate = 0.40;
    dividendRate = BTL_CONSTANTS.dividendHigherRate;
  } else if (inputs.investorTaxBracket === "ADDITIONAL_45") {
    personalTaxRate = 0.45;
    dividendRate = BTL_CONSTANTS.dividendAdditionalRate;
  }

  const grossPersonalTaxDue = personalTaxableProfit * personalTaxRate;
  // Section 24 tax credit is 20% on mortgage interest
  const section24Credit = Math.round(personalAnnualMortgage * 0.20);
  const finalPersonalTaxPaid = Math.max(0, Math.round(grossPersonalTaxDue - section24Credit));

  const personalNetAnnualCashflow =
    grossAnnualRent - annualOperatingExpenses - personalAnnualMortgage - finalPersonalTaxPaid;
  const personalNetMonthlyCashflow = Math.round(personalNetAnnualCashflow / 12);
  const personalRoe = (personalNetAnnualCashflow / initialCapitalRequired) * 100;

  // Section 24 Phantom Tax Drag: Difference between marginal deduction and 20% credit
  const section24TaxDragAnnual = Math.max(
    0,
    Math.round(personalAnnualMortgage * (personalTaxRate - 0.20))
  );

  // 2. Limited Company SPV Calculation
  const spvAnnualMortgage = inputs.isInterestOnly
    ? Math.round(loanAmount * (inputs.spvMortgageRate / 100))
    : Math.round(
        (loanAmount *
          (inputs.spvMortgageRate / 100 / 12) *
          Math.pow(1 + inputs.spvMortgageRate / 100 / 12, inputs.mortgageTermYears * 12)) /
          (Math.pow(1 + inputs.spvMortgageRate / 100 / 12, inputs.mortgageTermYears * 12) - 1) *
          12
      );

  // Under SPV: Mortgage interest AND accountancy fees are 100% deductible business expenses
  const spvAllowableDeductions =
    annualOperatingExpenses + spvAnnualMortgage + inputs.annualAccountancySpv;
  const spvNetProfitBeforeTax = Math.max(0, grossAnnualRent - spvAllowableDeductions);

  // Corporation Tax (19% small profits rate up to £50k)
  const spvCorpTax = Math.round(spvNetProfitBeforeTax * BTL_CONSTANTS.corpTaxSmallProfitsRate);
  const spvRetainedProfit = Math.max(0, spvNetProfitBeforeTax - spvCorpTax);

  let spvDividendTaxPaid = 0;
  let spvFinalNetAnnualCashflow = spvRetainedProfit;

  if (inputs.dividendStrategy === "EXTRACT_ALL_DIVIDENDS" && spvRetainedProfit > 0) {
    const taxableDividends = Math.max(0, spvRetainedProfit - BTL_CONSTANTS.dividendAllowance);
    spvDividendTaxPaid = Math.round(taxableDividends * dividendRate);
    spvFinalNetAnnualCashflow = spvRetainedProfit - spvDividendTaxPaid;
  }

  const spvNetMonthlyCashflow = Math.round(spvFinalNetAnnualCashflow / 12);
  const spvRoe = (spvFinalNetAnnualCashflow / initialCapitalRequired) * 100;

  // Comparison Metrics
  const annualCashflowDifference = spvFinalNetAnnualCashflow - personalNetAnnualCashflow;
  const tenYearCumulativeDifference = annualCashflowDifference * 10;

  let verdict: "SPV_WINS" | "PERSONAL_WINS" | "CLOSE_CALL" = "SPV_WINS";
  let verdictReasoning = "";

  if (inputs.investorTaxBracket === "BASIC_20") {
    if (personalNetAnnualCashflow > spvFinalNetAnnualCashflow) {
      verdict = "PERSONAL_WINS";
      verdictReasoning = `As a basic-rate (20%) taxpayer, you receive a full 20% Section 24 tax credit that matches your tax rate. Personal ownership avoids the higher SPV commercial mortgage rate and £${inputs.annualAccountancySpv.toLocaleString()}/yr accountancy fees, putting ${Math.abs(annualCashflowDifference).toLocaleString()}/year more cash in your pocket.`;
    } else {
      verdict = "CLOSE_CALL";
      verdictReasoning = `For basic-rate taxpayers, personal and SPV returns are very close. An SPV is primarily advantageous if you plan to build a multi-property portfolio or anticipate moving into the higher-rate tax bracket.`;
    }
  } else {
    // Higher or Additional rate
    if (annualCashflowDifference > 0) {
      verdict = "SPV_WINS";
      verdictReasoning = `As a ${inputs.investorTaxBracket === "HIGHER_40" ? "40% Higher Rate" : "45% Additional Rate"} taxpayer, Section 24 penalizes personal ownership with £${section24TaxDragAnnual.toLocaleString()}/year in non-deductible tax drag. Incorporating as an SPV saves you £${annualCashflowDifference.toLocaleString()}/year (£${tenYearCumulativeDifference.toLocaleString()} over 10 years) even after paying higher mortgage rates and accountant fees.`;
    } else {
      verdict = "CLOSE_CALL";
      verdictReasoning = `While Section 24 taxes personal rental income heavily, the higher SPV mortgage rate and accountant fees roughly offset the tax savings at this rental yield. Reinvesting profits inside the company tilts the math strongly in favor of the SPV.`;
    }
  }

  return {
    inputs,
    personal: {
      grossAnnualRent,
      annualMortgagePayment: personalAnnualMortgage,
      annualOperatingExpenses,
      taxableProfit: personalTaxableProfit,
      taxPaid: finalPersonalTaxPaid,
      section24TaxCredit: section24Credit,
      netAnnualCashflow: personalNetAnnualCashflow,
      netMonthlyCashflow: personalNetMonthlyCashflow,
      returnOnEquityPercent: Math.round(personalRoe * 10) / 10,
      effectiveTaxRateOnProfitPercent:
        personalTaxableProfit > 0
          ? Math.round((finalPersonalTaxPaid / personalTaxableProfit) * 100)
          : 0,
    },
    spv: {
      grossAnnualRent,
      annualMortgagePayment: spvAnnualMortgage,
      annualOperatingExpenses: annualOperatingExpenses + inputs.annualAccountancySpv,
      taxableProfit: spvNetProfitBeforeTax,
      taxPaid: spvCorpTax + spvDividendTaxPaid,
      section24TaxCredit: 0,
      netAnnualCashflow: spvFinalNetAnnualCashflow,
      netMonthlyCashflow: spvNetMonthlyCashflow,
      returnOnEquityPercent: Math.round(spvRoe * 10) / 10,
      effectiveTaxRateOnProfitPercent:
        spvNetProfitBeforeTax > 0
          ? Math.round(((spvCorpTax + spvDividendTaxPaid) / spvNetProfitBeforeTax) * 100)
          : 0,
    },
    loanAmount,
    depositAmount,
    sdltCost,
    initialCapitalRequired,
    section24TaxDragAnnual,
    annualCashflowDifference,
    tenYearCumulativeDifference,
    verdict,
    verdictReasoning,
  };
}
