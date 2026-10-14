import { CalculatorInputs, CalculatorResults, AnnualData } from "./calculator";

export type { CalculatorInputs, CalculatorResults, AnnualData };

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
  buyerType: "FIRST_TIME_BUYER" | "HOME_MOVER" | "REMORTGAGE";
  buyingTimeline: "IMMEDIATE_3M" | "WITHIN_6M" | "WITHIN_12M" | "JUST_RESEARCHING";
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "INVOICED";
  estimatedLeadValueGbp: number;
}

export interface ProStatus {
  isPro: boolean;
  unlockedAt?: string;
  plan?: "lifetime" | "monthly" | "demo";
  licenseKey?: string;
}
