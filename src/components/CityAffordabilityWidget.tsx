"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import {
  calculateMonthlyMortgage,
  calculatePropertyTax,
  getJurisdictionFromCity,
  getPropertyTaxLabel,
  runBuyVsRentCalculation,
} from "@/lib/calculator";
import { UK_MARKET_DEFAULTS } from "@/lib/constants";

interface CityAffordabilityWidgetProps {
  cityName: string;
  citySlug: string;
  averagePrice: number;
  averageRentMonthly: number;
  typicalCouncilTaxMonthly: number;
  typicalServiceChargeMonthly: number;
  historicalHpi5YrAvg: number;
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function CityAffordabilityWidget({
  cityName,
  citySlug,
  averagePrice,
  averageRentMonthly,
  typicalCouncilTaxMonthly,
  typicalServiceChargeMonthly,
  historicalHpi5YrAvg,
}: CityAffordabilityWidgetProps) {
  const [depositPercent, setDepositPercent] = useState<10 | 15 | 20>(15);
  const [isFtb, setIsFtb] = useState(true);

  const jurisdiction = getJurisdictionFromCity(citySlug);
  const taxLabel = getPropertyTaxLabel(jurisdiction);

  const depositAmount = averagePrice * (depositPercent / 100);
  const loanAmount = averagePrice - depositAmount;
  const mortgageRate = UK_MARKET_DEFAULTS.defaultMortgageRate; // e.g. 3.9%
  const monthlyMortgage = calculateMonthlyMortgage(loanAmount, mortgageRate, 25);
  const stampDuty = calculatePropertyTax(averagePrice, isFtb, false, jurisdiction);
  const totalMonthlyOwnership = monthlyMortgage + typicalServiceChargeMonthly;
  const monthlyDelta = totalMonthlyOwnership - averageRentMonthly;

  const liveSimulation = useMemo(() => {
    return runBuyVsRentCalculation({
      propertyPrice: averagePrice,
      depositPercent,
      mortgageRate: UK_MARKET_DEFAULTS.defaultMortgageRate,
      mortgageTerm: UK_MARKET_DEFAULTS.defaultMortgageTerm,
      fixedTermYears: UK_MARKET_DEFAULTS.defaultFixedTerm,
      svrRate: UK_MARKET_DEFAULTS.defaultSvrRate,
      isFirstTimeBuyer: isFtb,
      stampDutyOverride: null,
      jurisdiction: getJurisdictionFromCity(citySlug),
      legalFees: UK_MARKET_DEFAULTS.defaultLegalFees,
      surveyFees: UK_MARKET_DEFAULTS.defaultSurveyFees,
      councilTaxMonthly: typicalCouncilTaxMonthly,
      serviceChargeMonthly: typicalServiceChargeMonthly,
      maintenancePercent: UK_MARKET_DEFAULTS.defaultMaintenancePercent,
      insuranceMonthly: UK_MARKET_DEFAULTS.defaultInsuranceMonthly,
      initialRent: averageRentMonthly,
      rentIncreasePercent: UK_MARKET_DEFAULTS.defaultRentIncreasePercent,
      renterInsuranceMonthly: UK_MARKET_DEFAULTS.defaultRenterInsuranceMonthly,
      investmentReturnPercent: UK_MARKET_DEFAULTS.defaultStockReturnPercent,
      inflationPercent: UK_MARKET_DEFAULTS.defaultInflationPercent,
      houseAppreciationPercent: historicalHpi5YrAvg,
      timeHorizonYears: 15,
    });
  }, [
    averagePrice,
    depositPercent,
    isFtb,
    citySlug,
    typicalCouncilTaxMonthly,
    typicalServiceChargeMonthly,
    averageRentMonthly,
    historicalHpi5YrAvg,
  ]);

  const calculatorUrl = `/?price=${averagePrice}&deposit=${depositPercent}&rent=${averageRentMonthly}&councilTax=${typicalCouncilTaxMonthly}&serviceCharge=${typicalServiceChargeMonthly}&hpi=${historicalHpi5YrAvg}&ftb=${isFtb}&city=${citySlug}`;

  return (
    <div className="city-affordability-grid">
      {/* Left Card: Interactive Affordability Calculator */}
      <div className="glass-panel" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            <Calculator size={15} />
            <span>Interactive Local Affordability Calibrator</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            {cityName} Ownership vs. Rental Outflow Breakdown
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>
            Calibrate your initial deposit and view exact monthly capital requirements based on HM Land Registry benchmarks, {taxLabel}, and live BoE MPC rates.
          </p>
        </div>

        {/* Deposit Stepper Pills */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
              Deposit Equity Tier
            </label>
            <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
              {depositPercent}% ({formatGBP(depositAmount)})
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, background: "var(--surface-tray)", padding: 4, borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)" }}>
            {[10, 15, 20].map((tier) => (
              <button
                key={tier}
                type="button"
                onClick={() => setDepositPercent(tier as 10 | 15 | 20)}
                style={{
                  padding: "8px 0",
                  borderRadius: "var(--round-xs)",
                  border: "none",
                  background: depositPercent === tier ? "var(--surface)" : "transparent",
                  color: depositPercent === tier ? "var(--primary)" : "var(--text-secondary)",
                  fontWeight: depositPercent === tier ? 700 : 500,
                  fontSize: 12,
                  boxShadow: depositPercent === tier ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tier}% ({formatGBP(averagePrice * (tier / 100))})
              </button>
            ))}
          </div>
        </div>

        {/* First-Time Buyer Toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--surface-tray)", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              First-Time Buyer {taxLabel} Relief
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {jurisdiction === "SCOTLAND"
                ? isFtb
                  ? `Scottish LBTT FTB relief up to £175k (LBTT: ${formatGBP(stampDuty)})`
                  : `Standard Scottish LBTT up to £145k nil-rate (LBTT: ${formatGBP(stampDuty)})`
                : jurisdiction === "WALES"
                  ? `Welsh LTT 0% up to £225k (LTT: ${formatGBP(stampDuty)})`
                  : isFtb
                    ? `Post-April 2025 relief: 0% up to £300k, £500k cap (SDLT: ${formatGBP(stampDuty)})`
                    : `Post-April 2025 standard residential rate (SDLT: ${formatGBP(stampDuty)})`}
            </div>
          </div>
          <input
            type="checkbox"
            checked={isFtb}
            onChange={(e) => setIsFtb(e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer" }}
            aria-label="Toggle First-Time Buyer Stamp Duty Relief"
          />
        </div>

        {/* Breakdown Ledger */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--surface-border)", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
            <span style={{ color: "var(--text-secondary)" }}>Monthly Mortgage Principal &amp; Interest</span>
            <span style={{ fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>
              {formatGBP(monthlyMortgage)}/mo
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
            <span style={{ color: "var(--text-secondary)" }}>Est. Service Charge &amp; Ground Rent</span>
            <span style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>
              {formatGBP(typicalServiceChargeMonthly)}/mo
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
            <span style={{ color: "var(--text-secondary)" }}>Alternative Benchmark Monthly Rent</span>
            <span style={{ fontWeight: 600, color: "var(--secondary)", fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>
              {formatGBP(averageRentMonthly)}/mo
            </span>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
            background: monthlyDelta > 0 ? "rgba(153, 27, 27, 0.05)" : "rgba(6, 78, 59, 0.05)",
            border: `1px solid ${monthlyDelta > 0 ? "rgba(153, 27, 27, 0.15)" : "rgba(6, 78, 59, 0.15)"}`,
            borderRadius: "var(--round-md)",
            marginTop: 6,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: monthlyDelta > 0 ? "var(--secondary)" : "var(--primary)" }}>
              Monthly Cashflow Differential
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: monthlyDelta > 0 ? "var(--secondary)" : "var(--primary)", fontFamily: "var(--font-sans)", fontVariantNumeric: "tabular-nums" }}>
              {monthlyDelta > 0 ? `+${formatGBP(monthlyDelta)}/mo more to own` : `${formatGBP(Math.abs(monthlyDelta))}/mo cheaper to own`}
            </span>
          </div>
        </div>

        {/* Primary Simulation Action Button */}
        <Link
          href={calculatorUrl}
          className="cta-button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "12px 20px",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            marginTop: 4,
          }}
        >
          <span>Open Full 25-Year {cityName} Amortisation Model</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Right Column: Live Calculated Local Breakeven Verdict & Macro Assumptions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="verdict-banner buy-wins" style={{ padding: 24, borderRadius: "var(--round-lg)" }}>
          <div className="verdict-badge buy">
            <TrendingUp size={14} />
            <span>{cityName} Calculated Breakeven Horizon</span>
          </div>

          <h3 className="verdict-headline" style={{ fontSize: 20, margin: "8px 0" }}>
            {liveSimulation.breakEvenYear
              ? `Buying in ${cityName} reaches net-worth breakeven in Year ${liveSimulation.breakEvenYear} (at ${depositPercent}% deposit).`
              : `In ${cityName}, renting & compounding a Stocks & Shares ISA remains ahead over 15 years.`}
          </h3>

          <p className="verdict-summary" style={{ fontSize: 13, margin: 0 }}>
            Factoring in {formatGBP(stampDuty)} in {taxLabel}, £{typicalServiceChargeMonthly}/mo service charge, £{typicalCouncilTaxMonthly}/mo council tax, and <strong>+{historicalHpi5YrAvg}%/yr</strong> historical HPI, {liveSimulation.netWorthDifferenceAtHorizon >= 0 ? `buying builds ${formatGBP(liveSimulation.netWorthDifferenceAtHorizon)} more net wealth over 15 years` : `renting and investing in an ISA builds ${formatGBP(Math.abs(liveSimulation.netWorthDifferenceAtHorizon))} more net wealth over 15 years`}.
          </p>
        </div>

        {/* Market Dynamics Checklist */}
        <div className="glass-panel" style={{ padding: 22, borderRadius: "var(--round-lg)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>
            Local Market Fundamentals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
              <span>Mortgage rate calibrated to current Bank of England base rate ({UK_MARKET_DEFAULTS.boeBaseRate}%).</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
              <span>{taxLabel} computed dynamically with statutory post-April 2025 thresholds.</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13 }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
              <span>Includes estimated local ground rent, service charges (£{typicalServiceChargeMonthly}/mo), and selling friction.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
