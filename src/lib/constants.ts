/**
 * UK Financial, Tax, and Market Benchmarks for LadderPass
 * Maintained and versioned for AI agent updates.
 * Last updated: October 2026
 */

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
 * England & Northern Ireland Stamp Duty Land Tax (SDLT) Brackets
 * Verified against Gov.uk HMRC guidelines.
 */
export const SDLT_CONFIG = {
  // First-time buyer relief limits
  firstTimeBuyerMaxPrice: 625000,
  firstTimeBuyerZeroRateThreshold: 425000,
  firstTimeBuyerReliefRate: 0.05,

  // Standard residential bands
  standardBands: [
    { upTo: 250000, rate: 0.00 },
    { upTo: 925000, rate: 0.05 },
    { upTo: 1500000, rate: 0.10 },
    { upTo: Infinity, rate: 0.12 },
  ],

  // Surcharge for additional properties (buy-to-let / second home)
  additionalPropertySurchargeRate: 0.05, // 5% surcharge introduced in Autumn Budget
};

/**
 * Support & Donation Configuration (reusing Buy Me a Coffee setup)
 */
export const SUPPORT_URL = process.env.NEXT_PUBLIC_SUPPORT_URL || "https://buymeacoffee.com/jerrylabhq";
export const SUPPORT_LABEL = "☕ Buy me a coffee";

/**
 * Product & Monetization Configuration
 */
export const MONETIZATION_CONFIG = {
  appName: "LadderPass",
  supportUrl: SUPPORT_URL,
  supportLabel: SUPPORT_LABEL,
  proPricing: {
    lifetimePassGbp: 19,
    monthlySubscriptionGbp: 9,
  },
  brokerReferral: {
    partnerName: "LadderPass FCA Broker Network",
    averageBrokerCommissionPerLeadGbp: 175,
    complianceNotice:
      "LadderPass is an independent financial modeling platform. When you request a consultation, we introduce you to FCA-regulated independent mortgage brokers at no cost to you.",
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

