"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Sliders,
  X,
  Home,
  Sparkles,
  PiggyBank,
  Briefcase,
  FileText,
  Share2,
  Zap,
  GitCompare,
  Table,
  Coffee,
  HelpCircle,
  CheckCircle2,
  Scale,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { runBuyVsRentCalculation, calculateSDLT, CalculatorInputs, AnnualData } from "@/lib/calculator";
import { UK_CITIES } from "@/lib/cities";
import { UK_MARKET_DEFAULTS, SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";
import { ReportModal } from "@/components/ReportModal";
import { BrokerModal } from "@/components/BrokerModal";
import { StressTestView } from "@/components/StressTestView";
import { ScenarioCompare } from "@/components/ScenarioCompare";
import { AnnualTable } from "@/components/AnnualTable";
import { TrueCostView } from "@/components/TrueCostView";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import "./dashboard.css";

// Helper for formatting GBP
const formatGBP = (value: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
};

// Institutional British Financial Editorial Recharts Tooltip
interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
  payload: AnnualData;
}

interface EditorialChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

function EditorialChartTooltip({ active, payload }: EditorialChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const buyerNW = data.buyerTotalNetWorth || 0;
  const renterNW = data.renterTotalNetWorth || 0;
  const diff = Math.abs(buyerNW - renterNW);
  const buyerAhead = buyerNW >= renterNW;

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid var(--surface-border)",
        borderRadius: "8px",
        padding: "12px 16px",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
        fontSize: "12px",
        minWidth: "260px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          borderBottom: "1px solid var(--surface-border)",
          paddingBottom: "6px",
        }}
      >
        <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", fontSize: "11px" }}>
          Year {data.year} Projection
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 7px",
            borderRadius: "4px",
            backgroundColor: buyerAhead ? "var(--primary-light)" : "var(--secondary-light)",
            color: buyerAhead ? "var(--primary)" : "var(--secondary)",
            border: `1px solid ${buyerAhead ? "var(--primary-border)" : "var(--secondary-border)"}`,
          }}
        >
          {buyerAhead ? `Buyer +${formatGBP(diff)}` : `Renter +${formatGBP(diff)}`}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Buyer Net Worth</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-serif)", fontSize: "14px" }}>
            {formatGBP(buyerNW)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", paddingLeft: "14px" }}>
          <span>Home Equity: {formatGBP(data.buyerEquity)}</span>
          {data.buyerInvestmentPot > 0 && <span>ISA: {formatGBP(data.buyerInvestmentPot)}</span>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--secondary)" }}></span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Renter ISA Pot</span>
          </div>
          <span style={{ fontWeight: 700, color: "var(--secondary)", fontFamily: "var(--font-serif)", fontSize: "14px" }}>
            {formatGBP(renterNW)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", paddingLeft: "14px" }}>
          <span>S&S ISA: {formatGBP(data.renterInvestmentPot)}</span>
          <span>Deposit: {formatGBP(data.renterDepositRefundable)}</span>
        </div>
      </div>
    </div>
  );
}

// Popular UK Scenarios (Target Audience Personas)
const UK_PERSONAS = [
  {
    id: "london-ftb",
    name: "London First-Time Buyer",
    badge: "London Starter",
    desc: "£450k • 15% dep • £2,100 rent",
    price: 450000,
    deposit: 15,
    rent: 2100,
    ftb: true,
    citySlug: "london",
  },
  {
    id: "regional-starter",
    name: "Regional Starter Home",
    badge: "Manchester/Leeds",
    desc: "£260k • 10% dep • £1,100 rent",
    price: 260000,
    deposit: 10,
    rent: 1100,
    ftb: true,
    citySlug: "manchester",
  },
  {
    id: "isa-compounder",
    name: "Aggressive ISA Investor",
    badge: "Index Compounding",
    desc: "£550k • 20% dep • £2,250 rent",
    price: 550000,
    deposit: 20,
    rent: 2250,
    ftb: false,
    citySlug: null,
  },
  {
    id: "deposit-5",
    name: "5% Deposit Ladder",
    badge: "Low Upfront Cash",
    desc: "£230k • 5% dep • £975 rent",
    price: 230000,
    deposit: 5,
    rent: 975,
    ftb: true,
    citySlug: "birmingham",
  },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [donationDismissed, setDonationDismissed] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"chart" | "table" | "stress" | "compare" | "truecost">("chart");

  // State for basic inputs
  const [propertyPrice, setPropertyPrice] = useState(450000);
  const [depositPercent, setDepositPercent] = useState(15);
  const [initialRent, setInitialRent] = useState(1850);
  const [timeHorizon, setTimeHorizon] = useState(10);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string | null>(null);
  const [activePersonaId, setActivePersonaId] = useState<string | null>("london-ftb");

  // State for advanced inputs
  const [mortgageRate, setMortgageRate] = useState(UK_MARKET_DEFAULTS.defaultMortgageRate);
  const [mortgageTerm, setMortgageTerm] = useState(UK_MARKET_DEFAULTS.defaultMortgageTerm);
  const [fixedTermYears, setFixedTermYears] = useState(UK_MARKET_DEFAULTS.defaultFixedTerm);
  const [svrRate, setSvrRate] = useState(UK_MARKET_DEFAULTS.defaultSvrRate);
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(true);
  const [legalFees, setLegalFees] = useState(UK_MARKET_DEFAULTS.defaultLegalFees);
  const [surveyFees, setSurveyFees] = useState(UK_MARKET_DEFAULTS.defaultSurveyFees);
  const [councilTaxMonthly, setCouncilTaxMonthly] = useState(UK_MARKET_DEFAULTS.defaultCouncilTaxMonthly);
  const [serviceChargeMonthly, setServiceChargeMonthly] = useState(UK_MARKET_DEFAULTS.defaultServiceChargeMonthly);
  const [maintenancePercent, setMaintenancePercent] = useState(UK_MARKET_DEFAULTS.defaultMaintenancePercent);
  const [insuranceMonthly, setInsuranceMonthly] = useState(UK_MARKET_DEFAULTS.defaultInsuranceMonthly);

  const [rentIncreasePercent, setRentIncreasePercent] = useState(UK_MARKET_DEFAULTS.defaultRentIncreasePercent);
  const [renterInsuranceMonthly, setRenterInsuranceMonthly] = useState(UK_MARKET_DEFAULTS.defaultRenterInsuranceMonthly);

  const [investmentReturnPercent, setInvestmentReturnPercent] = useState(UK_MARKET_DEFAULTS.defaultStockReturnPercent);
  const [inflationPercent, setInflationPercent] = useState(UK_MARKET_DEFAULTS.defaultInflationPercent);
  const [houseAppreciationPercent, setHouseAppreciationPercent] = useState(UK_MARKET_DEFAULTS.defaultHouseAppreciation);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mount & URL Query Param Sync
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    if (typeof window !== "undefined") {
      if (
        localStorage.getItem("ladderpass_donation_dismissed") === "true"
      ) {
        setDonationDismissed(true);
      }

      const searchParams = new URLSearchParams(window.location.search);
      const urlPrice = searchParams.get("price");
      const urlRent = searchParams.get("rent");
      const urlDeposit = searchParams.get("deposit");
      const urlHorizon = searchParams.get("horizon");

      if (urlPrice) setPropertyPrice(parseInt(urlPrice, 10));
      if (urlRent) setInitialRent(parseInt(urlRent, 10));
      if (urlDeposit) setDepositPercent(parseFloat(urlDeposit));
      if (urlHorizon) setTimeHorizon(parseInt(urlHorizon, 10));
    }
  }, []);

  const dismissDonation = () => {
    setDonationDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("ladderpass_donation_dismissed", "true");
    }
  };

  // Compute inputs object
  const inputs: CalculatorInputs = useMemo(() => {
    return {
      propertyPrice,
      depositPercent,
      mortgageRate,
      mortgageTerm,
      fixedTermYears,
      svrRate,
      isFirstTimeBuyer,
      stampDutyOverride: null,
      legalFees,
      surveyFees,
      councilTaxMonthly,
      serviceChargeMonthly,
      maintenancePercent,
      insuranceMonthly,
      initialRent,
      rentIncreasePercent,
      renterInsuranceMonthly,
      investmentReturnPercent,
      inflationPercent,
      houseAppreciationPercent,
      timeHorizonYears: timeHorizon,
    };
  }, [
    propertyPrice,
    depositPercent,
    mortgageRate,
    mortgageTerm,
    fixedTermYears,
    svrRate,
    isFirstTimeBuyer,
    legalFees,
    surveyFees,
    councilTaxMonthly,
    serviceChargeMonthly,
    maintenancePercent,
    insuranceMonthly,
    initialRent,
    rentIncreasePercent,
    renterInsuranceMonthly,
    investmentReturnPercent,
    inflationPercent,
    houseAppreciationPercent,
    timeHorizon,
  ]);

  // Run calculation
  const results = useMemo(() => {
    return runBuyVsRentCalculation(inputs);
  }, [inputs]);

  // Apply Persona
  const handleSelectPersona = (p: typeof UK_PERSONAS[0]) => {
    setActivePersonaId(p.id);
    setPropertyPrice(p.price);
    setDepositPercent(p.deposit);
    setInitialRent(p.rent);
    setIsFirstTimeBuyer(p.ftb);
    setSelectedCitySlug(p.citySlug);
    showToast(`Loaded ${p.name} Scenario`);
  };

  // Apply City Preset
  const handleCitySelect = (citySlug: string) => {
    const city = UK_CITIES.find((c) => c.slug === citySlug);
    if (!city) return;
    setSelectedCitySlug(city.slug);
    setActivePersonaId(null);
    setPropertyPrice(city.averagePrice);
    setInitialRent(city.averageRentMonthly);
    setDepositPercent(city.typicalDepositPct);
    setCouncilTaxMonthly(city.typicalCouncilTaxMonthly);
    setServiceChargeMonthly(city.typicalServiceChargeMonthly);
    setHouseAppreciationPercent(city.historicalHpi5YrAvg);
    showToast(`Loaded ${city.name} Market Benchmarks`);
  };

  // Copy Shareable Link
  const handleCopyShareLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin);
    url.searchParams.set("price", String(propertyPrice));
    url.searchParams.set("deposit", String(depositPercent));
    url.searchParams.set("rent", String(initialRent));
    url.searchParams.set("horizon", String(timeHorizon));

    navigator.clipboard.writeText(url.toString()).then(() => {
      showToast("Link copied to clipboard! Ready to share with partner.");
    });
  };

  // Dynamic recommendation copy
  const diff = results.netWorthDifferenceAtHorizon;
  const absDiff = Math.abs(diff);
  const isBuyWinner = diff > 0;
  const lastYearData = results.annualBreakdown[results.annualBreakdown.length - 1] || results.annualBreakdown[0];
  const totalCombinedWealth = Math.max(1, (lastYearData?.buyerTotalNetWorth || 0) + (lastYearData?.renterTotalNetWorth || 0));
  const standardSdltCost = calculateSDLT(propertyPrice, false);
  const sdltSavings = Math.max(0, standardSdltCost - results.sdltCost);

  const depositCashNeeded = Math.round(propertyPrice * (depositPercent / 100));
  const ltvRatio = 100 - depositPercent;
  const estimatedMonthlyMortgage = Math.round(results.initialMonthlyMortgage);

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="floating-toast">
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Unified Suite Header Navigation */}
      <HeaderNav currentModule="Property" />

      {/* Dismissible Donation Banner */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            👋 <strong>LadderPass is 100% free with no ads, trackers, or broker sales calls.</strong> If this tool helps you and your partner make a confident property decision, consider{" "}
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="donation-banner__link">
              buying me a coffee
            </a>{" "}
            to support hosting & data maintenance!
          </span>
          <button
            type="button"
            className="donation-banner__dismiss"
            onClick={dismissDonation}
            aria-label="Dismiss donation prompt"
          >
            ×
          </button>
        </div>
      )}

      {/* Welcoming Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Scale size={14} />
          <span>Independent UK Buy vs. Rent Financial Modeling</span>
        </div>
        <h1 className="hero-title">
          Should you buy a home or keep renting in the UK?
        </h1>
        <p className="hero-subtitle">
          Compare the real mathematical cost of stepping onto the property ladder vs. renting and investing your deposit into a tax-free Stocks & Shares ISA. Updated with current Bank of England base rates, 2026 Stamp Duty (SDLT) thresholds, and full amortization modeling.
        </p>

        {/* Quick Personas */}
        <div className="persona-chips-wrapper">
          <span className="persona-chips-label">Quick-Start Scenarios for First-Time Buyers & Renters:</span>
          <div className="persona-chips">
            {UK_PERSONAS.map((p) => (
              <button
                key={p.id}
                className={`persona-chip ${activePersonaId === p.id ? "active" : ""}`}
                onClick={() => handleSelectPersona(p)}
              >
                <span>{p.name}</span>
                <span className="persona-chip-desc">({p.desc})</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* The Bottom Line: Prominent Verdict Banner */}
      <div className={`verdict-banner ${isBuyWinner ? "buy-wins" : "rent-wins"}`}>
        <div className="verdict-header">
          <div>
            <div className={`verdict-badge ${isBuyWinner ? "buy" : "rent"}`}>
              {isBuyWinner ? (
                <>
                  <Sparkles size={14} />
                  <span>Verdict: Buying Wins by {formatGBP(absDiff)}</span>
                </>
              ) : (
                <>
                  <PiggyBank size={14} />
                  <span>Verdict: Renting & ISA Investing Wins by {formatGBP(absDiff)}</span>
                </>
              )}
            </div>

            <h2 className="verdict-headline">
              {isBuyWinner
                ? `Over ${timeHorizon} years, buying builds ${formatGBP(absDiff)} more net worth than renting.`
                : `Over ${timeHorizon} years, renting & investing yields ${formatGBP(absDiff)} more net wealth.`}
            </h2>

            <p className="verdict-summary">
              {isBuyWinner
                ? `Even after paying ${formatGBP(results.buyTotalSunkCostsAtHorizon)} in non-recoverable mortgage interest, Stamp Duty (£${results.sdltCost.toLocaleString()}), and repairs, your accumulated ${formatGBP(lastYearData.buyerEquity)} in home equity easily outpaces renting.`
                : `Because mortgage debt service (${mortgageRate}% fixed / ${svrRate}% SVR) and buying friction cost more than renting, compounding your ${formatGBP(depositCashNeeded)} deposit at ${investmentReturnPercent}% in a Stocks & Shares ISA builds wealth faster.`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", alignSelf: "center" }}>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Generate Free PDF Report</span>
            </button>
            <button
              onClick={handleCopyShareLink}
              className="share-nav-btn"
              title="Share this calculated scenario"
              style={{ padding: "10px 14px", height: "100%" }}
            >
              <Share2 size={15} />
              <span>Share Scenario</span>
            </button>
          </div>
        </div>

        {/* Wealth Distribution Bar */}
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, fontWeight: 700, flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "var(--primary)" }}>
              Buyer Net Worth: {formatGBP(lastYearData.buyerTotalNetWorth)} ({Math.round((lastYearData.buyerTotalNetWorth / totalCombinedWealth) * 100)}%)
            </span>
            <span style={{ color: isBuyWinner ? "var(--primary)" : "var(--secondary)", background: isBuyWinner ? "var(--primary-light)" : "var(--secondary-light)", padding: "3px 10px", borderRadius: 9999, border: `1px solid ${isBuyWinner ? "var(--primary-border)" : "var(--secondary-border)"}`, fontSize: 11, fontWeight: 800 }}>
              {isBuyWinner ? `+${formatGBP(absDiff)} Buyer Advantage` : `+${formatGBP(absDiff)} Renter Advantage`}
            </span>
            <span style={{ color: "var(--secondary)" }}>
              Renter ISA: {formatGBP(lastYearData.renterTotalNetWorth)} ({Math.round((lastYearData.renterTotalNetWorth / totalCombinedWealth) * 100)}%)
            </span>
          </div>
          <div style={{ display: "flex", width: "100%", height: 10, borderRadius: 9999, overflow: "hidden", background: "#e2e8f0" }}>
            <div style={{ width: `${Math.max(5, Math.min(95, Math.round((lastYearData.buyerTotalNetWorth / totalCombinedWealth) * 100)))}%`, background: "var(--primary)", transition: "width 0.3s ease" }} />
            <div style={{ flex: 1, background: "var(--secondary)", transition: "width 0.3s ease" }} />
          </div>
        </div>

        {/* 4 Core Verdict Precision Metric Tiles */}
        <div className="verdict-metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))" }}>
          <div className="verdict-metric-card">
            <span className="verdict-metric-label">
              <Sparkles size={13} style={{ color: "var(--primary)" }} /> Financial Cross-Over
            </span>
            <div className="verdict-metric-val" style={{ color: results.breakEvenYear ? "var(--primary)" : "var(--secondary)" }}>
              {results.breakEvenYear ? `Year ${results.breakEvenYear}` : "Renting Wins"}
            </div>
            <span className="verdict-metric-sub">
              {results.breakEvenYear
                ? `Point where equity surpasses initial Stamp Duty & conveyancing`
                : `At these rates, renting compounds faster over all ${timeHorizon} years`}
            </span>
          </div>

          <div className="verdict-metric-card">
            <span className="verdict-metric-label">
              <Home size={13} style={{ color: "var(--primary)" }} /> Buyer Equity ({timeHorizon}y)
            </span>
            <div className="verdict-metric-val" style={{ color: "var(--primary)" }}>
              {formatGBP(lastYearData.buyerEquity)}
            </div>
            <span className="verdict-metric-sub">
              Property value minus mortgage debt remaining
            </span>
          </div>

          <div className="verdict-metric-card">
            <span className="verdict-metric-label">
              <TrendingUp size={13} style={{ color: "var(--secondary)" }} /> Renter S&S ISA ({timeHorizon}y)
            </span>
            <div className="verdict-metric-val" style={{ color: "var(--secondary)" }}>
              {formatGBP(lastYearData.renterInvestmentPot)}
            </div>
            <span className="verdict-metric-sub">
              Compounded deposit & cashflow surplus @ {investmentReturnPercent}%
            </span>
          </div>

          <div className="verdict-metric-card">
            <span className="verdict-metric-label">
              <Zap size={13} style={{ color: "var(--tertiary)" }} /> Sunk Cost Comparison
            </span>
            <div className="verdict-metric-val" style={{ color: "var(--tertiary)", fontSize: 20 }}>
              {formatGBP(results.buyTotalSunkCostsAtHorizon)} vs {formatGBP(results.rentTotalSunkCostsAtHorizon)}
            </div>
            <span className="verdict-metric-sub">
              Buyer (Interest + SDLT + Maint) vs Pure Sunk Rent
            </span>
          </div>
        </div>

        {/* Market Leader Editorial Callout: Martin's Rules of Thumb & Statutory Watchdog */}
        <div
          style={{
            marginTop: 14,
            padding: "14px 18px",
            background: "#ffffff",
            border: "1px solid var(--surface-border)",
            borderRadius: 8,
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              padding: "6px",
              borderRadius: "6px",
              background: "var(--accent-amber-light)",
              color: "var(--accent-amber-text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={18} />
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55 }}>
            <strong style={{ color: "var(--text-primary)" }}>Martin&apos;s Rule of Thumb for UK Property: </strong>
            <span style={{ color: "var(--text-secondary)" }}>
              {isBuyWinner
                ? `At a ${depositPercent}% deposit (£${depositCashNeeded.toLocaleString()}), buying works if you plan to stay past Year ${results.breakEvenYear || 4}. Because SDLT (£${results.sdltCost.toLocaleString()}) and legal conveyancing (~£1,800) are pure sunk friction costs, selling before Year ${results.breakEvenYear || 4} leaves you worse off than renting. Keep a 3-month emergency fund before committing.`
                : `With current mortgage rates (${mortgageRate}%) and high initial sunk costs, renting is mathematically superior over a ${timeHorizon}-year horizon ONLY IF you rigorously invest the £${depositCashNeeded.toLocaleString()} deposit difference into a low-cost global index fund (S&S ISA) yielding ~${investmentReturnPercent}%. If that cash sits uninvested in a current account, buying always wins.`}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Inputs Tiles (Touch-Friendly & Interactive) */}
      <div className="quick-inputs-tiles">
        {/* Tile 1: Property Price */}
        <div className="input-tile glass-panel">
          <div className="input-tile-header">
            <label className="input-tile-title" htmlFor="prop-price">Target Property Price</label>
            <span className="input-tile-helper">Mortgage: ~£{estimatedMonthlyMortgage.toLocaleString()}/mo</span>
          </div>

          <div className="input-field-container">
            <span className="input-symbol-prefix">£</span>
            <input
              id="prop-price"
              type="number"
              className="tile-numeric-input"
              value={propertyPrice}
              onChange={(e) => {
                setPropertyPrice(Math.max(0, parseInt(e.target.value) || 0));
                setSelectedCitySlug(null);
                setActivePersonaId(null);
              }}
            />
          </div>

          <div className="tile-steppers">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setPropertyPrice((p) => Math.max(50000, p - 10000))}
            >
              -£10k
            </button>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setPropertyPrice((p) => p + 10000)}
            >
              +£10k
            </button>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setPropertyPrice((p) => p + 50000)}
            >
              +£50k
            </button>
          </div>
          <span className="tile-context-note">
            Typical UK average: £285,000 • London average: £530,000
          </span>
        </div>

        {/* Tile 2: Deposit Percentage */}
        <div className="input-tile glass-panel">
          <div className="input-tile-header">
            <label className="input-tile-title" htmlFor="deposit-pct">Deposit Equity</label>
            <span className="input-tile-helper">{ltvRatio}% LTV Mortgage</span>
          </div>

          <div className="input-field-container">
            <input
              id="deposit-pct"
              type="number"
              className="tile-numeric-input"
              style={{ paddingLeft: "14px", paddingRight: "32px" }}
              value={depositPercent}
              onChange={(e) => {
                setDepositPercent(Math.min(100, Math.max(1, parseFloat(e.target.value) || 0)));
                setActivePersonaId(null);
              }}
            />
            <span className="input-symbol-suffix">%</span>
          </div>

          <div className="tile-steppers">
            {[5, 10, 15, 20, 25].map((pct) => (
              <button
                key={pct}
                type="button"
                className={`stepper-btn ${depositPercent === pct ? "active" : ""}`}
                onClick={() => setDepositPercent(pct)}
              >
                {pct}%
              </button>
            ))}
          </div>
          <span className="tile-context-note">
            Cash required: <strong>£{depositCashNeeded.toLocaleString()}</strong> (plus ~£{results.sdltCost + legalFees + surveyFees} fees)
          </span>
        </div>

        {/* Tile 3: Monthly Rent */}
        <div className="input-tile glass-panel">
          <div className="input-tile-header">
            <label className="input-tile-title" htmlFor="init-rent">Alternative Monthly Rent</label>
            <span className="input-tile-helper">£{(initialRent * 12).toLocaleString()}/yr</span>
          </div>

          <div className="input-field-container">
            <span className="input-symbol-prefix">£</span>
            <input
              id="init-rent"
              type="number"
              className="tile-numeric-input"
              value={initialRent}
              onChange={(e) => {
                setInitialRent(Math.max(0, parseInt(e.target.value) || 0));
                setSelectedCitySlug(null);
                setActivePersonaId(null);
              }}
            />
          </div>

          <div className="tile-steppers">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setInitialRent((r) => Math.max(100, r - 100))}
            >
              -£100
            </button>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setInitialRent((r) => r + 100)}
            >
              +£100
            </button>
            <button
              type="button"
              className="stepper-btn"
              onClick={() => setInitialRent((r) => r + 250)}
            >
              +£250
            </button>
          </div>
          <span className="tile-context-note">
            Weekly equivalent: ~£{Math.round((initialRent * 12) / 52).toLocaleString()}/week
          </span>
        </div>
      </div>

      {/* SDLT Statutory Relief Breakdown Card */}
      <div className="glass-panel" style={{ padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: "var(--round-md)", background: "var(--primary-light)", border: "1px solid var(--primary-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", flexShrink: 0 }}>
            <Scale size={18} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>HMRC Stamp Duty (SDLT) Assessment: <strong style={{ color: "var(--primary)" }}>{formatGBP(results.sdltCost)}</strong></span>
              {isFirstTimeBuyer && propertyPrice <= 625000 && (
                <span className="editorial-badge-institution editorial-badge-hmrc">
                  FTB Statutory Relief Applied
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
              {isFirstTimeBuyer
                ? propertyPrice <= 425000
                  ? `0% nil-rate up to £425,000. Statutory relief saved: ${formatGBP(standardSdltCost)} vs standard residential rates.`
                  : propertyPrice <= 625000
                    ? `0% on first £425,000, 5% on £425,001–£${propertyPrice.toLocaleString()}. Statutory relief saved: ${formatGBP(sdltSavings)}.`
                    : `Property price exceeds £625,000 FTB ceiling. Standard residential rates apply (£${results.sdltCost.toLocaleString()}).`
                : `Standard residential SDLT: 0% up to £250,000, 5% to £925,000 (£${results.sdltCost.toLocaleString()} due).`}
            </div>
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--text-primary)", cursor: "pointer", background: "var(--surface-tray)", padding: "8px 14px", borderRadius: "var(--round-full)", border: "1px solid var(--surface-border)" }}>
          <input
            type="checkbox"
            checked={isFirstTimeBuyer}
            onChange={(e) => setIsFirstTimeBuyer(e.target.checked)}
            style={{ cursor: "pointer" }}
          />
          <span>First-Time Buyer Relief Eligible</span>
        </label>
      </div>

      {/* Quick Actions & Regional City Presets */}
      <div className="quick-actions-bar glass-panel" style={{ padding: "14px 20px" }}>
        <div className="city-presets-bar">
          <span style={{ fontSize: 11, color: "var(--on-surface-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Compare UK Cities:
          </span>
          {UK_CITIES.map((c) => (
            <button
              key={c.slug}
              className={`preset-pill ${selectedCitySlug === c.slug ? "active" : ""}`}
              onClick={() => handleCitySelect(c.slug)}
            >
              {c.name} (£{(c.averagePrice / 1000).toFixed(0)}k)
            </button>
          ))}
          <Link
            href="/city/london"
            className="preset-pill"
            style={{ background: "var(--primary-light)", color: "var(--primary)", borderColor: "var(--primary-border)", fontWeight: 700 }}
          >
            🏛️ All 10 UK City Hubs
          </Link>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="settings-trigger-btn" onClick={() => setIsDrawerOpen(true)}>
            <Sliders size={15} />
            <span>Advanced UK Assumptions</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Visuals on Left, Advisor on Right */}
      <div className="dashboard-grid">
        {/* Left Side: Chart, Stats, Subviews */}
        <div className="visuals-area">
          {/* Main Net Worth Chart */}
          <div className="chart-container glass-panel">
            <div className="chart-header">
              <div className="chart-title-group">
                <h2>Wealth Accumulation Trajectory</h2>
                <span className="chart-subtitle">
                  Total Net Worth comparison (Home Equity vs. Liquid Stocks & Shares ISA Portfolio)
                </span>
              </div>

              {results.breakEvenYear ? (
                <div className="break-even-badge">
                  <Sparkles size={15} />
                  <span>Break-Even: Year {results.breakEvenYear}</span>
                </div>
              ) : (
                <div className="break-even-badge no-breakeven">
                  <X size={15} />
                  <span>Renting Compounds Faster</span>
                </div>
              )}
            </div>

            {/* Time Horizon Quick Selector */}
            <div className="timeframe-controls">
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)" }}>
                Projection Horizon: <strong style={{ color: "var(--text-primary)" }}>{timeHorizon} Years</strong>
              </span>

              <div className="timeframe-chips">
                {[3, 5, 10, 15, 20, 25, 30, 40].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    className={`timeframe-chip ${timeHorizon === yr ? "active" : ""}`}
                    onClick={() => setTimeHorizon(yr)}
                  >
                    {yr}y
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Area Chart */}
            <div style={{ width: "100%", height: 340, marginTop: 8 }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={results.annualBreakdown}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#064e3b" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#064e3b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#94a3b8"
                      fontSize={12}
                      tickLine={false}
                      label={{
                        value: "Years Elapsed",
                        position: "insideBottomRight",
                        offset: -5,
                        fill: "#64748b",
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<EditorialChartTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      content={() => (
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="legend-color-buy"></span>
                            <span style={{ color: "#064e3b" }}>Buying (Home Equity + Savings)</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color-rent"></span>
                            <span style={{ color: "#1e3a8a" }}>Renting (Stocks & Shares ISA Pot)</span>
                          </div>
                        </div>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="buyerTotalNetWorth"
                      stroke="#064e3b"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorBuy)"
                      name="buyerTotalNetWorth"
                    />
                    <Area
                      type="monotone"
                      dataKey="renterTotalNetWorth"
                      stroke="#1e3a8a"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRent)"
                      name="renterTotalNetWorth"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                  Loading Wealth Trajectory...
                </div>
              )}
            </div>
          </div>

          {/* Sunk Cost Metrics Comparison */}
          <div className="stats-row">
            {/* Buying Stats */}
            <div className="stat-card buy-card glass-panel">
              <div className="stat-header">
                <span className="stat-title">Buying Position</span>
                <Home size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div className="stat-value" style={{ color: "var(--primary)" }}>
                {formatGBP(lastYearData.buyerTotalNetWorth)}
              </div>
              <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "-6px" }}>
                Total Net Worth at Year {timeHorizon}
              </div>
              <div className="stat-details">
                <div className="detail-row">
                  <span>Home Equity Built:</span>
                  <span className="detail-value">{formatGBP(lastYearData.buyerEquity)}</span>
                </div>
                <div className="detail-row">
                  <span>Remaining Mortgage:</span>
                  <span className="detail-value">{formatGBP(lastYearData.mortgageBalance)}</span>
                </div>
                <div className="detail-row">
                  <span>Upfront Cash Required:</span>
                  <span className="detail-value">{formatGBP(results.buyUpfrontCosts)}</span>
                </div>
                <div className="detail-row">
                  <span>Non-Recoverable Sunk Outgoings:</span>
                  <span className="detail-value" style={{ color: "var(--tertiary)" }}>
                    {formatGBP(results.buyTotalSunkCostsAtHorizon)}
                  </span>
                </div>
              </div>
            </div>

            {/* Renting Stats */}
            <div className="stat-card rent-card glass-panel">
              <div className="stat-header">
                <span className="stat-title">Renting Position</span>
                <PiggyBank size={18} style={{ color: "var(--secondary)" }} />
              </div>
              <div className="stat-value" style={{ color: "var(--secondary)" }}>
                {formatGBP(lastYearData.renterTotalNetWorth)}
              </div>
              <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "-6px" }}>
                Total Net Worth at Year {timeHorizon}
              </div>
              <div className="stat-details">
                <div className="detail-row">
                  <span>Stocks & Shares ISA Pot:</span>
                  <span className="detail-value">{formatGBP(lastYearData.renterInvestmentPot)}</span>
                </div>
                <div className="detail-row">
                  <span>Refundable Tenancy Deposit:</span>
                  <span className="detail-value">{formatGBP(lastYearData.renterDepositRefundable)}</span>
                </div>
                <div className="detail-row">
                  <span>Upfront Cash Required:</span>
                  <span className="detail-value">{formatGBP(results.rentUpfrontCosts)}</span>
                </div>
                <div className="detail-row">
                  <span>Total Sunk Rent Paid:</span>
                  <span className="detail-value" style={{ color: "var(--tertiary)" }}>
                    {formatGBP(results.rentTotalSunkCostsAtHorizon)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-view Navigation Tabs */}
          <div className="subview-tabs">
            <button
              onClick={() => setActiveTab("chart")}
              className={`subview-tab-btn ${activeTab === "chart" ? "active" : ""}`}
            >
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`subview-tab-btn ${activeTab === "table" ? "active" : ""}`}
            >
              <Table size={14} />
              <span>Year-by-Year Cash Flow Schedule</span>
            </button>
            <button
              onClick={() => setActiveTab("stress")}
              className={`subview-tab-btn ${activeTab === "stress" ? "active" : ""}`}
            >
              <Zap size={14} />
              <span>Macro Rate Shock Tests</span>
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              className={`subview-tab-btn ${activeTab === "compare" ? "active" : ""}`}
            >
              <GitCompare size={14} />
              <span>Side-by-Side Property Compare</span>
            </button>
            <button
              onClick={() => setActiveTab("truecost")}
              className={`subview-tab-btn ${activeTab === "truecost" ? "active" : ""}`}
            >
              <ShieldCheck size={14} />
              <span>True Cost of Borrowing</span>
            </button>
          </div>

          {/* Sub-views */}
          {activeTab === "truecost" && <TrueCostView results={results} inputs={inputs} />}
          {activeTab === "table" && <AnnualTable annualBreakdown={results.annualBreakdown} />}
          {activeTab === "stress" && <StressTestView inputs={inputs} />}
          {activeTab === "compare" && <ScenarioCompare baseInputs={inputs} />}
        </div>

        {/* Right Side: Advisor, Jargon Busters, Broker, Support */}
        <div className="advisor-area">
          {/* Executive Advisor Card */}
          <div className="advisor-card glass-panel">
            <div className="advisor-header">
              <Sparkles className="advisor-icon" />
              <h3 className="advisor-title">Advisor Analysis</h3>
            </div>
            <p className="advisor-recommendation">
              {isBuyWinner
                ? `Buying beats renting by ${formatGBP(absDiff)} over your ${timeHorizon}-year horizon. With a monthly mortgage of ~£${estimatedMonthlyMortgage.toLocaleString()} and initial rent of £${initialRent.toLocaleString()}, compounding home equity comfortably outpaces renting despite acquisition friction.`
                : `Renting and directing your ${formatGBP(depositCashNeeded)} deposit into a Stocks & Shares ISA yields ${formatGBP(absDiff)} more net worth over ${timeHorizon} years. Due to debt service (${mortgageRate}% fixed / ${svrRate}% SVR) and running costs, liquid index investing compounds faster.`}
            </p>
            <div className="advisor-details">
              <strong>Key takeaway:</strong>{" "}
              {results.breakEvenYear
                ? `If you plan to stay in the home for more than ${results.breakEvenYear} years, buying is mathematically advantageous. If you move sooner, renting avoids heavy Stamp Duty and selling friction.`
                : `Under current interest rates and rent yields, maintaining flexibility and investing the deposit delta builds a larger total wealth pot.`}
            </div>

            <button onClick={() => setIsReportModalOpen(true)} className="pdf-trigger-btn" style={{ width: "100%", justifyContent: "center" }}>
              <FileText size={15} />
              <span>Download Printable PDF Report</span>
            </button>
          </div>

          {/* Plain-English UK Jargon Busters */}
          <div className="jargon-card glass-panel">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <HelpCircle size={16} style={{ color: "var(--primary)" }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>UK Jargon Demystified</h3>
            </div>

            <div className="jargon-item">
              <div className="jargon-term">
                <CheckCircle2 size={13} style={{ color: "var(--primary)" }} />
                <span>Stamp Duty (SDLT)</span>
              </div>
              <p className="jargon-definition">
                Tax paid to HMRC when buying property. First-time buyers pay £0 up to £425,000 (relief up to £625k). Current calculated SDLT: <strong>{formatGBP(results.sdltCost)}</strong>.
              </p>
            </div>

            <div className="jargon-item">
              <div className="jargon-term">
                <CheckCircle2 size={13} style={{ color: "var(--secondary)" }} />
                <span>Stocks & Shares ISA</span>
              </div>
              <p className="jargon-definition">
                If you rent, your deposit remains invested in global index funds (typically 6-8% historical average), compounding 100% free of UK capital gains or income tax.
              </p>
            </div>

            <div className="jargon-item">
              <div className="jargon-term">
                <CheckCircle2 size={13} style={{ color: "var(--tertiary)" }} />
                <span>The &ldquo;Sunk Cost&rdquo; Truth</span>
              </div>
              <p className="jargon-definition">
                Rent is 100% non-refundable. But buyers also burn money on mortgage interest, building insurance, service charges, and maintenance. We compare both strictly.
              </p>
            </div>
          </div>

          {/* FCA Broker Referral Card */}
          <div className="cta-card glass-panel">
            <Briefcase size={22} style={{ color: "var(--primary)", margin: "0 auto 4px" }} />
            <h3 className="cta-title">UK Whole-of-Market Broker Check</h3>
            <p className="cta-desc">
              Get an FCA-regulated mortgage illustration. Lock current fixed rates, calculate maximum borrowing (up to 4.5x salary), and confirm first-time buyer tax relief.
            </p>
            <button className="cta-button" onClick={() => setIsBrokerModalOpen(true)}>
              Get Free Broker Illustration
            </button>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 4 }}>
              Independent FCA Brokers • Zero Broker Fee Option • No Spam
            </div>
          </div>

          {/* Support LadderPass / Buy Me a Coffee Box (fitpass style) */}
          {SUPPORT_URL && (
            <div
              className="glass-panel"
              style={{
                padding: 20,
                borderRadius: 14,
                background: "var(--surface)",
                border: "1px solid var(--surface-border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Coffee size={16} style={{ color: "var(--accent-amber)" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Support LadderPass</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
                LadderPass is 100% free with no paywalls or intrusive ads. If this calculator helped you make a confident property decision, consider buying me a coffee to support hosting & data maintenance!
              </p>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="layout__header-donate"
                style={{ width: "100%", justifyContent: "center" }}
              >
                <Coffee size={14} />
                <span>{SUPPORT_LABEL}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Settings Drawer */}
      <div className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`} onClick={() => setIsDrawerOpen(false)}></div>

      <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Advanced UK Assumptions</h2>
          <button className="close-btn" onClick={() => setIsDrawerOpen(false)} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Mortgage settings */}
          <div className="drawer-section">
            <h3 className="section-title">Buying & Mortgage Structure</h3>

            <div className="checkbox-row" onClick={() => setIsFirstTimeBuyer(!isFirstTimeBuyer)}>
              <input
                type="checkbox"
                className="checkbox-input"
                checked={isFirstTimeBuyer}
                onChange={() => {}}
              />
              <span className="checkbox-label">First-Time Buyer SDLT Relief</span>
            </div>
            <p className="help-text">Exempts Stamp Duty on purchases up to £425k in England/NI (relief up to £625k).</p>

            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Initial Fixed Mortgage Rate</span>
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>{mortgageRate}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="1"
                  max="10"
                  step="0.1"
                  value={mortgageRate}
                  onChange={(e) => setMortgageRate(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Fixed Deal Duration</span>
                  <span style={{ fontWeight: 700 }}>{fixedTermYears} Years</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="1"
                  max="10"
                  value={fixedTermYears}
                  onChange={(e) => setFixedTermYears(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Standard Variable Rate (SVR)</span>
                  <span style={{ color: "var(--tertiary)", fontWeight: 700 }}>{svrRate}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="3"
                  max="12"
                  step="0.1"
                  value={svrRate}
                  onChange={(e) => setSvrRate(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Mortgage Amortization Term</span>
                  <span style={{ fontWeight: 700 }}>{mortgageTerm} Years</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="10"
                  max="40"
                  value={mortgageTerm}
                  onChange={(e) => setMortgageTerm(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>

          {/* Running costs */}
          <div className="drawer-section">
            <h3 className="section-title">Homeowner Running Costs</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Monthly Council Tax</span>
                  <span style={{ fontWeight: 700 }}>£{councilTaxMonthly}</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="50"
                  max="500"
                  step="10"
                  value={councilTaxMonthly}
                  onChange={(e) => setCouncilTaxMonthly(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Service Charge & Ground Rent (Monthly)</span>
                  <span style={{ fontWeight: 700 }}>£{serviceChargeMonthly}</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="800"
                  step="10"
                  value={serviceChargeMonthly}
                  onChange={(e) => setServiceChargeMonthly(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Maintenance Reserve (Annual %)</span>
                  <span style={{ fontWeight: 700 }}>{maintenancePercent}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="3"
                  step="0.1"
                  value={maintenancePercent}
                  onChange={(e) => setMaintenancePercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Buildings Insurance (Monthly)</span>
                  <span style={{ fontWeight: 700 }}>£{insuranceMonthly}</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="10"
                  max="150"
                  step="5"
                  value={insuranceMonthly}
                  onChange={(e) => setInsuranceMonthly(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Solicitor & Legal Fees</span>
                  <span style={{ fontWeight: 700 }}>£{legalFees}</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="500"
                  max="5000"
                  step="100"
                  value={legalFees}
                  onChange={(e) => setLegalFees(parseInt(e.target.value, 10))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Property Survey Fees (RICS)</span>
                  <span style={{ fontWeight: 700 }}>£{surveyFees}</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="100"
                  max="2000"
                  step="50"
                  value={surveyFees}
                  onChange={(e) => setSurveyFees(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>

          {/* Rent details */}
          <div className="drawer-section rent-section">
            <h3 className="section-title rent-section">Renting Projections</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Annual Rent Increase (Inflation)</span>
                  <span style={{ color: "var(--secondary)", fontWeight: 700 }}>{rentIncreasePercent}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="15"
                  step="0.5"
                  value={rentIncreasePercent}
                  onChange={(e) => setRentIncreasePercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>Renter Contents Insurance (Monthly)</span>
                  <span style={{ fontWeight: 700 }}>£{renterInsuranceMonthly}</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="5"
                  max="100"
                  step="5"
                  value={renterInsuranceMonthly}
                  onChange={(e) => setRenterInsuranceMonthly(parseInt(e.target.value, 10))}
                />
              </div>
            </div>
          </div>

          {/* Economic variables */}
          <div className="drawer-section eco-section">
            <h3 className="section-title eco-section">Macroeconomic Assumptions</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Stocks/ISA Returns (Annual Net)</span>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>{investmentReturnPercent}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="1"
                  max="15"
                  step="0.5"
                  value={investmentReturnPercent}
                  onChange={(e) => setInvestmentReturnPercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>House Price Inflation (HPI Annual)</span>
                  <span style={{ fontWeight: 700 }}>{houseAppreciationPercent}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="-2"
                  max="10"
                  step="0.1"
                  value={houseAppreciationPercent}
                  onChange={(e) => setHouseAppreciationPercent(parseFloat(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <div className="slider-labels">
                  <span>General CPI Inflation (Annual)</span>
                  <span style={{ fontWeight: 700 }}>{inflationPercent}%</span>
                </div>
                <input
                  type="range"
                  className="slider-input"
                  min="0"
                  max="10"
                  step="0.1"
                  value={inflationPercent}
                  onChange={(e) => setInflationPercent(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        results={results}
      />

      {/* Broker Consultation Modal */}
      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        propertyPrice={propertyPrice}
        depositPercent={depositPercent}
        mortgageRate={mortgageRate}
        mortgageTerm={mortgageTerm}
      />

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
