"use client";

import { useState, useEffect, useCallback } from "react";
import { UKTaxJurisdiction } from "./constants";
import {
  calculateIncomeTax,
  calculateNationalInsurance,
  calculateChildBenefit,
  calculateChildcareValue,
  calculateStudentLoan,
  calculateMarginalTaxRate,
  StudentLoanPlanCode,
} from "./tax-calculator";
import { EV_BENCHMARKS } from "./ev-calculator";

export interface UnifiedFinancialProfile {
  grossSalary: number;
  pensionSacrificePercent: number;
  evGrossLeaseMonthly: number;
  evP11dValue: number;
  studentLoanPlan: StudentLoanPlanCode;
  childrenCount: number;
  childcareCount: number;
  targetPropertyPrice: number;
  depositPercent: number;
  jurisdiction: UKTaxJurisdiction;
  pensionPot: number;
  updatedAt?: string;
}

export interface UnifiedHouseholdSnapshot {
  grossSalary: number;
  annualPensionSacrifice: number;
  annualEvSacrifice: number;
  annualEvBikBenefit: number;
  adjustedNetIncome: number;
  personalAllowance: number;
  effectiveMarginalRatePercent: number;
  annualIncomeTax: number;
  annualNationalInsurance: number;
  annualStudentLoan: number;
  monthlyNetTakeHome: number;
  monthlyStudentLoan: number;
  childcareAndBenefitRestoredAnnual: number;
  maxMortgageBorrowingCapacity: number;
  inTaxTrapZone: boolean;
}

export const DEFAULT_FINANCIAL_PROFILE: UnifiedFinancialProfile = {
  grossSalary: 110000,
  pensionSacrificePercent: 9,
  evGrossLeaseMonthly: 0,
  evP11dValue: 45000,
  studentLoanPlan: "PLAN_2",
  childrenCount: 1,
  childcareCount: 1,
  targetPropertyPrice: 450000,
  depositPercent: 15,
  jurisdiction: "ENGLAND_NI",
  pensionPot: 185000,
};

const PROFILE_STORAGE_KEY = "ladderpass_financial_twin_v1";
const PROFILE_EVENT_NAME = "ladderpass-financial-twin-change";

export function getFinancialProfile(): UnifiedFinancialProfile {
  if (typeof window === "undefined") {
    return DEFAULT_FINANCIAL_PROFILE;
  }
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_FINANCIAL_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FINANCIAL_PROFILE, ...parsed };
  } catch {
    return DEFAULT_FINANCIAL_PROFILE;
  }
}

export function saveFinancialProfile(patch: Partial<UnifiedFinancialProfile>): UnifiedFinancialProfile {
  const current = getFinancialProfile();
  const next: UnifiedFinancialProfile = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(PROFILE_EVENT_NAME));
    } catch (err) {
      console.error("Failed to persist financial profile:", err);
    }
  }
  return next;
}

export function computeUnifiedHouseholdSnapshot(
  profile: UnifiedFinancialProfile
): UnifiedHouseholdSnapshot {
  const grossSalary = Math.max(0, profile.grossSalary);
  const annualPensionSacrifice = Math.round(
    Math.min(60000, grossSalary * (Math.max(0, profile.pensionSacrificePercent) / 100))
  );
  const annualEvSacrifice = Math.max(0, profile.evGrossLeaseMonthly) * 12;
  const annualEvBikBenefit =
    annualEvSacrifice > 0
      ? Math.round(profile.evP11dValue * EV_BENCHMARKS.average3YearBikRate)
      : 0;

  // Cash salary subject to Class 1 NI and Student Loan
  const cashSalaryAfterSacrifice = Math.max(
    0,
    grossSalary - annualPensionSacrifice - annualEvSacrifice
  );

  // Adjusted Net Income for Income Tax, PA Taper, HICBC, and 30h Free Childcare
  const adjustedNetIncome = cashSalaryAfterSacrifice + annualEvBikBenefit;

  const { tax: annualIncomeTax, personalAllowance } = calculateIncomeTax(adjustedNetIncome);
  const annualNationalInsurance = calculateNationalInsurance(cashSalaryAfterSacrifice);
  const annualStudentLoan = calculateStudentLoan(
    cashSalaryAfterSacrifice,
    profile.studentLoanPlan === "PLAN_2",
    false,
    profile.studentLoanPlan
  );

  const cbAfter = calculateChildBenefit(adjustedNetIncome, profile.childrenCount);
  const cbBaseline = calculateChildBenefit(grossSalary, profile.childrenCount);

  const childcareAfter = calculateChildcareValue(adjustedNetIncome, profile.childcareCount);
  const childcareBaseline = calculateChildcareValue(grossSalary, profile.childcareCount);

  const childcareAndBenefitRestoredAnnual =
    Math.max(0, cbAfter.netBenefit - cbBaseline.netBenefit) +
    Math.max(0, childcareAfter - childcareBaseline);

  const annualNetTakeHome =
    cashSalaryAfterSacrifice -
    annualIncomeTax -
    annualNationalInsurance -
    annualStudentLoan +
    cbAfter.netBenefit;

  const monthlyNetTakeHome = Math.round(annualNetTakeHome / 12);
  const monthlyStudentLoan = Math.round(annualStudentLoan / 12);

  const effectiveMarginalRatePercent = calculateMarginalTaxRate(
    adjustedNetIncome,
    profile.studentLoanPlan !== "NONE",
    profile.studentLoanPlan
  );

  // FCA Mortgage Affordability: 4.5x contractual cash income less 4.5x annual student loan drag
  const baseBorrowingMultiple = Math.max(0, grossSalary - annualEvSacrifice) * 4.5;
  const studentLoanDrag = annualStudentLoan * 4.5;
  const maxMortgageBorrowingCapacity = Math.round(Math.max(0, baseBorrowingMultiple - studentLoanDrag));

  const inTaxTrapZone = adjustedNetIncome > 100000 && adjustedNetIncome < 125140;

  return {
    grossSalary,
    annualPensionSacrifice,
    annualEvSacrifice,
    annualEvBikBenefit,
    adjustedNetIncome,
    personalAllowance,
    effectiveMarginalRatePercent,
    annualIncomeTax,
    annualNationalInsurance,
    annualStudentLoan,
    monthlyNetTakeHome,
    monthlyStudentLoan,
    childcareAndBenefitRestoredAnnual,
    maxMortgageBorrowingCapacity,
    inTaxTrapZone,
  };
}

export function useFinancialProfile() {
  const [profile, setProfile] = useState<UnifiedFinancialProfile>(DEFAULT_FINANCIAL_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      setProfile(getFinancialProfile());
      setHydrated(true);
    };
    sync();
    window.addEventListener(PROFILE_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROFILE_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const updateProfile = useCallback((patch: Partial<UnifiedFinancialProfile>) => {
    const next = saveFinancialProfile(patch);
    setProfile(next);
  }, []);

  const snapshot = computeUnifiedHouseholdSnapshot(profile);

  return {
    profile,
    snapshot,
    updateProfile,
    hydrated,
  };
}
