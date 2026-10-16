import { CalculatorInputs, CalculatorResults, AnnualData, UKTaxJurisdiction } from "./calculator";

export type { CalculatorInputs, CalculatorResults, AnnualData, UKTaxJurisdiction };

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  inputs: CalculatorInputs;
  results?: CalculatorResults;
}

export interface StressTestScenario {
  name: string;
  description: string;
  mortgageRateDelta: number; // e.g. +1.5%
  hpiDelta: number;          // e.g. -2.0%
  rentInflationDelta: number;// e.g. +2.0%
  results?: CalculatorResults;
}

export interface CityMarketData {
  slug: string;
  name: string;
  region: string;
  averagePrice: number;
  averageRentMonthly: number;
  priceToRentRatio: number;
  typicalDepositPct: number;
  typicalCouncilTaxMonthly: number;
  typicalServiceChargeMonthly: number;
  historicalHpi5YrAvg: number;
  description: string;
  highlights: string[];
}

export type LeadClientCategory =
  | "FIRST_TIME_BUYER"
  | "HOME_MOVER"
  | "REMORTGAGE"
  | "HIGH_EARNER_TAX"
  | "EV_SALARY_SACRIFICE"
  | "GRADUATE_BORROWER"
  | "BUY_TO_LET_INVESTOR"
  | "RETIREMENT_PLANNING";

export interface LeadQualificationMetrics {
  grossSalary?: number;
  pensionPot?: number;
  evP11dValue?: number;
  btlPortfolioSize?: number;
  studentLoanPlan?: string;
  jurisdiction?: UKTaxJurisdiction;
}

export interface BrokerLead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  propertyPrice: number;
  depositAmount: number;
  depositPercent: number;
  loanAmount: number;
  ltvPercent: number;
  estimatedMonthlyMortgage: number;
  buyerType: LeadClientCategory;
  buyingTimeline: "IMMEDIATE_3M" | "WITHIN_6M" | "WITHIN_12M" | "JUST_RESEARCHING";
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "INVOICED";
  estimatedLeadValueGbp: number;
  privacyPolicyAccepted: boolean;
  consentGrantedAt: string;
  qualificationMetrics?: LeadQualificationMetrics;
}

export interface ProStatus {
  isPro: boolean;
  unlockedAt?: string;
  plan?: "lifetime" | "monthly" | "demo";
  licenseKey?: string;
}
