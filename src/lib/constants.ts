/**
 * UK Financial, Tax, and Market Benchmarks for LadderPass
 * Maintained and versioned for AI agent updates.
 * Last updated: October 2026
 */

export type UKTaxJurisdiction = "ENGLAND_NI" | "SCOTLAND" | "WALES";

export const UK_MARKET_DEFAULTS = {
  // Current Bank of England Base Rate and retail lending benchmarks
  boeBaseRate: 3.75,
  defaultMortgageRate: 3.9, // Typical 5-year fixed rate
  defaultSvrRate: 6.75,     // Standard Variable Rate
  defaultMortgageTerm: 25,
  defaultFixedTerm: 5,

  // Macro assumptions
  defaultInflationPercent: 2.5,     // CPI target / realistic trend
  defaultHouseAppreciation: 3.5,    // Long-term UK House Price Index trend
  defaultStockReturnPercent: 7.0,   // Global equity index (Stocks & Shares ISA)

  // Running cost averages
  defaultMaintenancePercent: 1.0,   // 1% rule of thumb
  defaultCouncilTaxMonthly: 185,    // Average Band D in England
  defaultServiceChargeMonthly: 140, // Average UK leasehold service charge
  defaultInsuranceMonthly: 35,      // Buildings insurance
  defaultRenterInsuranceMonthly: 15,// Contents insurance
  defaultLegalFees: 1600,           // Solicitor / Conveyancing
  defaultSurveyFees: 550,           // RICS Homebuyer survey
  defaultRentIncreasePercent: 3.8,  // UK private rental index trend
};

/**
 * England & Northern Ireland Stamp Duty Land Tax (SDLT) Brackets (Post-April 2025 Statutory Rules)
 * Verified against Gov.uk HMRC guidelines.
 */
export const SDLT_CONFIG = {
  // First-time buyer relief limits (post-April 2025: 0% up to £300k, 5% from £300k to £500k; >£500k standard rates)
  firstTimeBuyerMaxPrice: 500000,
  firstTimeBuyerZeroRateThreshold: 300000,
  firstTimeBuyerReliefRate: 0.05,

  // Standard residential bands (post-April 2025)
  standardBands: [
    { upTo: 125000, rate: 0.00 },
    { upTo: 250000, rate: 0.02 },
    { upTo: 925000, rate: 0.05 },
    { upTo: 1500000, rate: 0.10 },
    { upTo: Infinity, rate: 0.12 },
  ],

  // Surcharge for additional properties (buy-to-let / second home HRAD)
  additionalPropertySurchargeRate: 0.05,
};

/**
 * Scotland Land and Buildings Transaction Tax (LBTT) Brackets
 * Verified against Revenue Scotland statutory guidelines.
 */
export const LBTT_CONFIG = {
  firstTimeBuyerZeroRateThreshold: 175000, // FTB relief raises nil-rate band from £145k to £175k
  standardBands: [
    { upTo: 145000, rate: 0.00 },
    { upTo: 250000, rate: 0.02 },
    { upTo: 325000, rate: 0.05 },
    { upTo: 750000, rate: 0.10 },
    { upTo: Infinity, rate: 0.12 },
  ],
  additionalDwellingSupplementRate: 0.08, // 8% ADS on additional residential properties
};

/**
 * Wales Land Transaction Tax (LTT) Brackets
 * Verified against Welsh Revenue Authority (WRA) statutory guidelines.
 */
export const LTT_CONFIG = {
  standardBands: [
    { upTo: 225000, rate: 0.00 },
    { upTo: 400000, rate: 0.06 },
    { upTo: 750000, rate: 0.075 },
    { upTo: 1500000, rate: 0.10 },
    { upTo: Infinity, rate: 0.12 },
  ],
  additionalPropertySurchargeRate: 0.05, // 5% higher residential rates surcharge across bands
};

/**
 * Product & Monetization Configuration
 */
export const MONETIZATION_CONFIG = {
  appName: "LadderPass",
  proPricing: {
    lifetimePassGbp: 19,
    monthlySubscriptionGbp: 9,
  },
  brokerReferral: {
    partnerName: "LadderPass FCA Broker Network",
    averageBrokerCommissionPerLeadGbp: 175,
    complianceNotice:
      "LadderPass is an independent financial modeling platform. When you request a consultation, we introduce you to FCA-regulated independent mortgage brokers or Chartered IFAs at no upfront cost to you.",
  },
};

/**
 * Site URL configuration (uses custom domain, Vercel production URL, or defaults to ladderpass.vercel.app)
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://ladderpass.vercel.app");
