"use client";

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { runBuyVsRentCalculation, CalculatorInputs } from "@/lib/calculator";
import { UK_CITIES } from "@/lib/cities";
import { UK_MARKET_DEFAULTS, SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";
import { ReportModal } from "@/components/ReportModal";
import { BrokerModal } from "@/components/BrokerModal";
import { StressTestView } from "@/components/StressTestView";
import { ScenarioCompare } from "@/components/ScenarioCompare";
import { AnnualTable } from "@/components/AnnualTable";
import "./dashboard.css";

// Helper for formatting GBP
const formatGBP = (value: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [donationDismissed, setDonationDismissed] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"chart" | "table" | "stress" | "compare">("chart");

  // State for basic inputs
  const [propertyPrice, setPropertyPrice] = useState(450000);
  const [depositPercent, setDepositPercent] = useState(15);
  const [initialRent, setInitialRent] = useState(1850);
  const [timeHorizon, setTimeHorizon] = useState(15);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string | null>(null);

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

  // Show floating toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Mount & URL Query Param Sync
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    if (typeof window !== "undefined") {
      if (
        localStorage.getItem("rentorladder_donation_dismissed") === "true" ||
        localStorage.getItem("finvisor_donation_dismissed") === "true"
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
      localStorage.setItem("rentorladder_donation_dismissed", "true");
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

  // Apply City Preset
  const handleCitySelect = (citySlug: string) => {
    const city = UK_CITIES.find((c) => c.slug === citySlug);
    if (!city) return;
    setSelectedCitySlug(city.slug);
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
      showToast("Link copied to clipboard! Ready to share.");
    });
  };

  // Dynamic recommendation copy
  const advisorRecommendation = useMemo(() => {
    const horizon = timeHorizon;
    const diff = results.netWorthDifferenceAtHorizon;
    const absDiff = Math.abs(diff);

    if (diff > 0) {
      return {
        decision: "BUY",
        title: "Buying is mathematically superior",
        class: "text-primary",
        main: `Over your ${horizon}-year time horizon, buying builds ${formatGBP(absDiff)} more net worth than renting and investing.`,
        details: results.breakEvenYear
          ? `You recover all upfront transaction costs (Stamp Duty, solicitor, surveyor) in Year ${results.breakEvenYear}, after which debt amortization and capital growth accelerate ahead of renting.`
          : `Compounding property equity comfortably outpaces renting despite initial acquisition frictions.`,
      };
    } else {
      return {
        decision: "RENT",
        title: "Renting & Investing is superior",
        class: "text-secondary",
        main: `Renting and directing your deposit into a Stocks & Shares ISA yields ${formatGBP(absDiff)} more net worth over ${horizon} years.`,
        details: `Due to debt service (${mortgageRate}% fixed / ${svrRate}% SVR) and running outgoings, investing the upfront difference into a global index fund compounds faster.`,
      };
    }
  }, [results, timeHorizon, mortgageRate, svrRate]);

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="floating-toast">
          <Sparkles size={16} style={{ color: "var(--primary)" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="nav-bar glass-panel">
        <div className="logo">
          <TrendingUp className="logo-icon" />
          <span>RentOrLadder</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "rgba(255,255,255,0.08)", color: "var(--on-surface-variant)", fontWeight: 600 }}>
            100% Free UK Property Tool
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ul className="nav-links">
            <li>
              <Link href="/city/london">UK Cities</Link>
            </li>
            <li>
              <a href="https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate" target="_blank" rel="noreferrer">
                BoE Rate: {UK_MARKET_DEFAULTS.boeBaseRate}%
              </a>
            </li>
          </ul>

          {/* Buy Me a Coffee button (fitpass style) */}
          {SUPPORT_URL && (
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="layout__header-donate"
            >
              {SUPPORT_LABEL}
            </a>
          )}

          <button
            onClick={handleCopyShareLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <Share2 size={14} />
            <span>Share</span>
          </button>
        </div>
      </nav>

      {/* Dismissible Donation Banner (fitpass style) */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            Enjoying RentOrLadder? It&apos;s 100% free with no ads or paywalls — consider{" "}
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="donation-banner__link"
            >
              {SUPPORT_LABEL}
            </a>
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

      {/* Main Quick Inputs Bar */}
      <div className="quick-inputs-bar glass-panel">
        <div className="quick-inputs-group">
          <div className="input-field-wrapper">
            <label className="input-label" htmlFor="prop-price">Property Price</label>
            <div className="input-with-symbol">
              <span className="input-symbol">£</span>
              <input
                id="prop-price"
                type="number"
                className="numeric-input"
                value={propertyPrice}
                onChange={(e) => {
                  setPropertyPrice(Math.max(0, parseInt(e.target.value) || 0));
                  setSelectedCitySlug(null);
                }}
              />
            </div>
          </div>

          <div className="input-field-wrapper">
            <label className="input-label" htmlFor="deposit-pct">Deposit</label>
            <div className="input-with-symbol">
              <input
                id="deposit-pct"
                type="number"
                className="numeric-input"
                value={depositPercent}
                onChange={(e) => setDepositPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                style={{ paddingLeft: "12px", paddingRight: "28px" }}
              />
              <span className="input-symbol-right">%</span>
            </div>
          </div>

          <div className="input-field-wrapper">
            <label className="input-label" htmlFor="init-rent">Monthly Rent</label>
            <div className="input-with-symbol">
              <span className="input-symbol">£</span>
              <input
                id="init-rent"
                type="number"
                className="numeric-input"
                value={initialRent}
                onChange={(e) => {
                  setInitialRent(Math.max(0, parseInt(e.target.value) || 0));
                  setSelectedCitySlug(null);
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="settings-btn"
            style={{ background: "rgba(0, 229, 255, 0.1)", color: "var(--primary)", borderColor: "var(--primary)" }}
            onClick={() => setIsReportModalOpen(true)}
          >
            <FileText size={18} />
            <span>Generate PDF Report</span>
          </button>

          <button className="settings-btn" onClick={() => setIsDrawerOpen(true)}>
            <Sliders size={18} />
            <span>Advanced Settings</span>
          </button>
        </div>

        {/* City Quick Presets Bar */}
        <div className="city-presets-bar" style={{ width: "100%", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "var(--on-surface-variant)", textTransform: "uppercase", fontWeight: 700, marginRight: 4 }}>
            Regional Presets:
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
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side (Visuals & Modules) */}
        <div className="visuals-area">
          {/* Main Net Worth Chart Card */}
          <div className="chart-container glass-panel">
            <div className="chart-header">
              <div className="chart-title-group">
                <h2>Net Worth Wealth Projection</h2>
                <span className="chart-subtitle">
                  Comparing Total Net Worth (Property Equity + Investments) over time
                </span>
              </div>

              {results.breakEvenYear ? (
                <div className="break-even-badge">
                  <Sparkles size={16} />
                  <span>Break-Even: Year {results.breakEvenYear}</span>
                </div>
              ) : (
                <div className="break-even-badge no-breakeven">
                  <X size={16} />
                  <span>Renting Wins Throughout</span>
                </div>
              )}
            </div>

            {/* Time Horizon Slider */}
            <div className="slider-group" style={{ padding: "8px 0" }}>
              <div className="slider-labels">
                <span>Projection Timeframe</span>
                <span style={{ color: "var(--primary)", fontWeight: "800" }}>{timeHorizon} Years</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="1"
                max="40"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(parseInt(e.target.value, 10))}
              />
            </div>

            {/* Recharts Area */}
            <div style={{ width: "100%", height: 320, marginTop: 12 }}>
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={results.annualBreakdown}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="year"
                      stroke="var(--on-surface-variant)"
                      fontSize={12}
                      tickLine={false}
                      label={{
                        value: "Years",
                        position: "insideBottomRight",
                        offset: -5,
                        fill: "var(--on-surface-variant)",
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      stroke="var(--on-surface-variant)"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(v) => `£${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-container-high)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                      formatter={(value) => [formatGBP(Number(value || 0)), ""]}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      content={() => (
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="legend-color-buy"></span>
                            <span style={{ color: "var(--primary)" }}>Buying (Home Equity + Investments)</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color-rent"></span>
                            <span style={{ color: "var(--secondary)" }}>Renting (Stocks & Shares ISA Pot)</span>
                          </div>
                        </div>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="buyerTotalNetWorth"
                      stroke="var(--primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBuy)"
                      name="Buying Total"
                    />
                    <Area
                      type="monotone"
                      dataKey="renterTotalNetWorth"
                      stroke="var(--secondary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRent)"
                      name="Renting Total"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-surface-variant)" }}>
                  Loading Wealth Projection Chart...
                </div>
              )}
            </div>
          </div>

          {/* Sunk Cost Metrics Comparison */}
          <div className="stats-row">
            {/* Buying Stats */}
            <div className="stat-card buy-card glass-panel">
              <div className="stat-header">
                <span className="stat-title">Buying Summary</span>
                <Home size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div className="stat-value" style={{ color: "var(--primary)" }}>
                {formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.buyerTotalNetWorth || 0)}
              </div>
              <div className="stat-subtitle" style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "-6px" }}>
                Projected Net Worth in {timeHorizon} Years
              </div>
              <div className="stat-details">
                <div className="detail-row">
                  <span>Home Equity:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.buyerEquity || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Investment Pot:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.buyerInvestmentPot || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Total Sunk Costs:</span>
                  <span className="detail-value" style={{ color: "var(--tertiary)" }}>{formatGBP(results.buyTotalSunkCostsAtHorizon)}</span>
                </div>
                <div className="detail-row">
                  <span>Upfront Cash Required:</span>
                  <span className="detail-value">{formatGBP(results.buyUpfrontCosts)}</span>
                </div>
              </div>
            </div>

            {/* Renting Stats */}
            <div className="stat-card rent-card glass-panel">
              <div className="stat-header">
                <span className="stat-title">Renting Summary</span>
                <PiggyBank size={18} style={{ color: "var(--secondary)" }} />
              </div>
              <div className="stat-value" style={{ color: "var(--secondary)" }}>
                {formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.renterTotalNetWorth || 0)}
              </div>
              <div className="stat-subtitle" style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "-6px" }}>
                Projected Net Worth in {timeHorizon} Years
              </div>
              <div className="stat-details">
                <div className="detail-row">
                  <span>Stocks ISA Pot:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.renterInvestmentPot || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Refundable Deposit:</span>
                  <span className="detail-value">{formatGBP(results.annualBreakdown[results.annualBreakdown.length - 1]?.renterDepositRefundable || 0)}</span>
                </div>
                <div className="detail-row">
                  <span>Total Sunk Rent/Fees:</span>
                  <span className="detail-value" style={{ color: "var(--tertiary)" }}>{formatGBP(results.rentTotalSunkCostsAtHorizon)}</span>
                </div>
                <div className="detail-row">
                  <span>Upfront Cash Required:</span>
                  <span className="detail-value">{formatGBP(results.rentUpfrontCosts)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-view Navigation Tabs */}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button
              onClick={() => setActiveTab("chart")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: activeTab === "chart" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                color: activeTab === "chart" ? "#00363d" : "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("table")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: activeTab === "table" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                color: activeTab === "table" ? "#00363d" : "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Table size={14} />
              <span>Annual Breakdown Table</span>
            </button>
            <button
              onClick={() => setActiveTab("stress")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: activeTab === "stress" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                color: activeTab === "stress" ? "#00363d" : "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Zap size={14} />
              <span>Macro Stress Tests</span>
            </button>
            <button
              onClick={() => setActiveTab("compare")}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: activeTab === "compare" ? "var(--primary)" : "rgba(255,255,255,0.05)",
                color: activeTab === "compare" ? "#00363d" : "#fff",
                fontWeight: 700,
                fontSize: 13,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <GitCompare size={14} />
              <span>Side-by-Side Compare</span>
            </button>
          </div>

          {/* Conditional Sub-views (All 100% Free) */}
          {activeTab === "table" && (
            <AnnualTable annualBreakdown={results.annualBreakdown} />
          )}

          {activeTab === "stress" && (
            <StressTestView inputs={inputs} />
          )}

          {activeTab === "compare" && (
            <ScenarioCompare baseInputs={inputs} />
          )}
        </div>

        {/* Right Side (Advisor & Lead Gen) */}
        <div className="advisor-area">
          {/* Executive Advisor Recommendation Card */}
          <div className="advisor-card glass-panel">
            <div className="advisor-header">
              <Sparkles className="advisor-icon" />
              <h3 className="advisor-title">Advisor Verdict</h3>
            </div>
            <h4 style={{ fontSize: 16, marginTop: 4 }} className={advisorRecommendation.class}>
              {advisorRecommendation.title}
            </h4>
            <p className="advisor-recommendation">{advisorRecommendation.main}</p>
            <div className="advisor-details">{advisorRecommendation.details}</div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              style={{
                width: "100%",
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "10px",
                borderRadius: 6,
                background: "rgba(0, 229, 255, 0.12)",
                color: "var(--primary)",
                border: "1px solid var(--primary)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <FileText size={16} />
              <span>Generate Free PDF Report</span>
            </button>
          </div>

          {/* High-Intent FCA Broker Referral Card */}
          <div className="cta-card glass-panel">
            <Briefcase size={24} style={{ color: "var(--primary)", margin: "0 auto 4px" }} />
            <h3 className="cta-title">UK Whole-of-Market Broker Review</h3>
            <p className="cta-desc">
              Get an FCA-regulated mortgage illustration. Lock current fixed rates, calculate borrowing capacity (up to 4.5x salary), and claim first-time buyer Stamp Duty relief.
            </p>
            <button className="cta-button" onClick={() => setIsBrokerModalOpen(true)}>
              Get Free Broker Illustration
            </button>
            <div style={{ fontSize: 10, color: "var(--on-surface-variant)", textAlign: "center", marginTop: 8 }}>
              Independent FCA Brokers • Zero Broker Fee Option • No Spam
            </div>
          </div>

          {/* Support RentOrLadder / Buy Me a Coffee Box (fitpass style) */}
          {SUPPORT_URL && (
            <div
              className="glass-panel"
              style={{
                padding: 18,
                borderRadius: 12,
                background: "linear-gradient(180deg, rgba(255, 221, 0, 0.06) 0%, rgba(16, 185, 129, 0.06) 100%)",
                border: "1px solid rgba(255, 221, 0, 0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Coffee size={16} style={{ color: "#ffdd00" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Support RentOrLadder</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--on-surface-variant)", lineHeight: 1.5, marginBottom: 12 }}>
                RentOrLadder is 100% free with no paywalls or intrusive ads. If this calculator helped you make a confident property decision, consider buying me a coffee to support hosting & data maintenance!
              </p>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button"
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  fontSize: 12,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  background: "#ffdd00",
                  color: "#000",
                  fontWeight: 700,
                }}
              >
                <span>{SUPPORT_LABEL}</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Settings Drawer Overlay */}
      <div className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`} onClick={() => setIsDrawerOpen(false)}></div>

      {/* Drawer */}
      <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <h2 className="drawer-title">Advanced UK Settings</h2>
          <button className="close-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* Mortgage settings */}
          <div className="drawer-section">
            <h3 className="section-title">Buying & Mortgage</h3>

            <div className="checkbox-row" onClick={() => setIsFirstTimeBuyer(!isFirstTimeBuyer)}>
              <input
                type="checkbox"
                className="checkbox-input"
                checked={isFirstTimeBuyer}
                onChange={() => {}}
              />
              <span className="checkbox-label">First-Time Buyer Relief</span>
            </div>
            <p className="help-text">Saves SDLT (Stamp Duty) on purchases up to £625k in England/NI.</p>

            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Mortgage Rate (Fixed)</span>
                  <span>{mortgageRate}%</span>
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
                  <span>Fixed Term period</span>
                  <span>{fixedTermYears} Years</span>
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
                  <span>{svrRate}%</span>
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
                  <span>Mortgage Term</span>
                  <span>{mortgageTerm} Years</span>
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
            <h3 className="section-title">Running Costs (Annual/Monthly)</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Monthly Council Tax</span>
                  <span>£{councilTaxMonthly}</span>
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
                  <span>Monthly Service Charge / Ground Rent</span>
                  <span>£{serviceChargeMonthly}</span>
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
                  <span>{maintenancePercent}%</span>
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
                  <span>Monthly Buildings Insurance</span>
                  <span>£{insuranceMonthly}</span>
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
                  <span>Legal & Solicitor Fees</span>
                  <span>£{legalFees}</span>
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
                  <span>Survey & Valuation Fees</span>
                  <span>£{surveyFees}</span>
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
            <h3 className="section-title rent-section">Renting Details</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Annual Rent Increase</span>
                  <span>{rentIncreasePercent}%</span>
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
                  <span>Monthly Contents Insurance</span>
                  <span>£{renterInsuranceMonthly}</span>
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
            <h3 className="section-title eco-section">Macroeconomics (UK index values)</h3>
            <div className="form-grid">
              <div className="slider-group">
                <div className="slider-labels">
                  <span>Stocks/ISA Returns (Annual)</span>
                  <span>{investmentReturnPercent}%</span>
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
                  <span>House Appreciation (HPI Annual)</span>
                  <span>{houseAppreciationPercent}%</span>
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
                  <span>CPI Inflation (Annual)</span>
                  <span>{inflationPercent}%</span>
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
    </div>
  );
}
