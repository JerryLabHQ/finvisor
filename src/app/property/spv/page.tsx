"use client";

import React, { useState, useMemo } from "react";
import {
  Building,
  Sliders,
  Sparkles,
  FileText,
  Shield,
  Coins,
  CheckCircle,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import {
  runBTLCalculation,
  BTLInputs,
} from "@/lib/btl-spv-calculator";
import { SUPPORT_URL } from "@/lib/constants";
import "../../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export default function SpvPage() {
  const [price, setPrice] = useState(280000);
  const [rent, setRent] = useState(1450);
  const [deposit, setDeposit] = useState(25);
  const [personalRate, setPersonalRate] = useState(4.5);
  const [spvRate, setSpvRate] = useState(5.4);
  const [taxBracket, setTaxBracket] = useState<"BASIC_20" | "HIGHER_40" | "ADDITIONAL_45">("HIGHER_40");
  const [strategy, setStrategy] = useState<"REINVEST_IN_SPV" | "EXTRACT_ALL_DIVIDENDS">("REINVEST_IN_SPV");

  const [donationDismissed, setDonationDismissed] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [brokerSubmitted, setBrokerSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const inputs: BTLInputs = useMemo(
    () => ({
      propertyPrice: price,
      monthlyRent: rent,
      depositPercent: deposit,
      personalMortgageRate: personalRate,
      spvMortgageRate: spvRate,
      mortgageTermYears: 25,
      isInterestOnly: true,
      investorTaxBracket: taxBracket,
      lettingAgentFeePercent: 10,
      annualMaintenancePercent: 1.0,
      annualInsurance: 300,
      annualAccountancySpv: 1200,
      dividendStrategy: strategy,
      assumedHpiAppreciationPercent: 3.5,
    }),
    [price, rent, deposit, personalRate, spvRate, taxBracket, strategy]
  );

  const results = useMemo(() => runBTLCalculation(inputs), [inputs]);

  const applyPreset = (
    pVal: number,
    rVal: number,
    bracketVal: "BASIC_20" | "HIGHER_40" | "ADDITIONAL_45",
    strategyVal: "REINVEST_IN_SPV" | "EXTRACT_ALL_DIVIDENDS"
  ) => {
    setPrice(pVal);
    setRent(rVal);
    setTaxBracket(bracketVal);
    setStrategy(strategyVal);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBrokerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          buyerType: "BUY_TO_LET_INVESTOR",
          propertyPrice: price,
          depositPercent: deposit,
          buyingTimeline: "IMMEDIATE_3M",
        }),
      });
      setBrokerSubmitted(true);
    } catch {
      setBrokerSubmitted(true);
    }
  };

  const isSpvWinner = results.verdict === "SPV_WINS";

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Dismissible Donation Banner */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            👋 <strong>LadderPass BTL is 100% free with no commercial broker bias.</strong> If this Section 24 and SPV analysis gives you clarity on structuring your property investments, consider{" "}
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="donation-banner__link">
              buying me a coffee
            </a>{" "}
            to support independent UK research!
          </span>
          <button
            type="button"
            className="donation-banner__dismiss"
            onClick={() => setDonationDismissed(true)}
            aria-label="Dismiss donation prompt"
          >
            ×
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill" style={{ background: "rgba(147, 51, 234, 0.1)", color: "#9333ea", border: "1px solid rgba(147, 51, 234, 0.3)" }}>
          <Building size={14} />
          <span>UK Buy-to-Let Tax & SPV Incorporation Strategy</span>
        </div>
        <h1 className="hero-title">
          BTL Limited Company (SPV) vs. Personal Ownership
        </h1>
        <p className="hero-description">
          Section 24 prevents individual UK landlords from deducting mortgage interest from rental profits. Model whether incorporating a <strong>Special Purpose Vehicle (SPV Limited Company)</strong> saves you money after factoring in higher commercial mortgage rates and accountant fees.
        </p>

        {/* Quick Presets */}
        <div className="persona-presets-wrap">
          <span className="persona-label">Common Portfolios:</span>
          <div className="persona-chips">
            <button
              onClick={() => applyPreset(280000, 1450, "HIGHER_40", "REINVEST_IN_SPV")}
              className={`persona-chip ${price === 280000 && taxBracket === "HIGHER_40" ? "active" : ""}`}
            >
              <span>Higher Rate Landlord (£280k, 40%)</span>
            </button>
            <button
              onClick={() => applyPreset(180000, 1100, "BASIC_20", "EXTRACT_ALL_DIVIDENDS")}
              className={`persona-chip ${price === 180000 && taxBracket === "BASIC_20" ? "active" : ""}`}
            >
              <span>Basic Rate Landlord (£180k, 20%)</span>
            </button>
            <button
              onClick={() => applyPreset(450000, 2100, "HIGHER_40", "REINVEST_IN_SPV")}
              className={`persona-chip ${price === 450000 && taxBracket === "HIGHER_40" ? "active" : ""}`}
            >
              <span>London / South East (£450k, 40%)</span>
            </button>
            <button
              onClick={() => applyPreset(140000, 1050, "HIGHER_40", "REINVEST_IN_SPV")}
              className={`persona-chip ${price === 140000 && rent === 1050 ? "active" : ""}`}
            >
              <span>High Yield Regional (£140k, 9%)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Verdict Banner */}
      <div className={`verdict-banner ${isSpvWinner ? "buy-wins" : "rent-wins"}`}>
        <div className="verdict-header">
          <div>
            <div className={`verdict-badge ${isSpvWinner ? "buy" : "rent"}`}>
              {isSpvWinner ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <span>
                {isSpvWinner
                  ? `Verdict: Ltd Co SPV Wins by ${formatGBP(results.annualCashflowDifference)}/Year`
                  : `Verdict: Personal Ownership Wins by ${formatGBP(Math.abs(results.annualCashflowDifference))}/Year`}
              </span>
            </div>

            <h2 className="verdict-headline">
              {isSpvWinner
                ? `Holding in an SPV saves ${formatGBP(results.tenYearCumulativeDifference)} over 10 years.`
                : `Holding personally yields more cashflow due to lower personal mortgage rates.`}
            </h2>

            <p className="verdict-summary">{results.verdictReasoning}</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", alignSelf: "center" }}>
            <button
              onClick={handlePrint}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Print BTL Report</span>
            </button>
            <button
              onClick={() => setShowBrokerModal(true)}
              className="share-nav-btn"
              style={{ padding: "10px 14px" }}
            >
              <Shield size={15} />
              <span>SPV Mortgage Quotes</span>
            </button>
          </div>
        </div>

        {/* 4 Core BTL Metric Cards */}
        <div className="verdict-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Section 24 Tax Drag</span>
            <span className="metric-value highlight" style={{ color: "var(--accent-red)" }}>
              {formatGBP(results.section24TaxDragAnnual)}/yr
            </span>
            <span className="metric-subtext">Disallowed mortgage relief</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">SPV Net Cashflow</span>
            <span className="metric-value highlight" style={{ color: "var(--accent-green)" }}>
              {formatGBP(results.spv.netAnnualCashflow)}/yr
            </span>
            <span className="metric-subtext">{formatGBP(results.spv.netMonthlyCashflow)}/month net</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Personal Net Cashflow</span>
            <span className="metric-value">
              {formatGBP(results.personal.netAnnualCashflow)}/yr
            </span>
            <span className="metric-subtext">{formatGBP(results.personal.netMonthlyCashflow)}/month net</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">5% HRAD Stamp Duty</span>
            <span className="metric-value" style={{ color: "var(--primary)" }}>
              {formatGBP(results.sdltCost)}
            </span>
            <span className="metric-subtext">Higher Rate for Additional Dwellings</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Analysis */}
      <div className="main-grid">
        {/* Left Column: Sliders */}
        <aside className="controls-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Sliders size={18} />
              <h2 className="panel-title">Property & Financing</h2>
            </div>
            <button
              onClick={() => {
                setPrice(280000);
                setRent(1450);
                setTaxBracket("HIGHER_40");
              }}
              className="reset-btn"
            >
              Reset
            </button>
          </div>

          {/* Property Price */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="price" className="control-label">Purchase Price</label>
              <span className="control-value-badge">{formatGBP(price)}</span>
            </div>
            <input
              id="price"
              type="range"
              min="100000"
              max="800000"
              step="5000"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="slider"
            />
          </div>

          {/* Deposit Percent */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="deposit" className="control-label">Deposit Equity</label>
              <span className="control-value-badge">{deposit}% ({formatGBP((price * deposit) / 100)})</span>
            </div>
            <input
              id="deposit"
              type="range"
              min="20"
              max="40"
              step="5"
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>20%</span>
              <span>25%</span>
              <span>30%</span>
              <span>40%</span>
            </div>
          </div>

          {/* Monthly Rent */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="rent" className="control-label">Gross Monthly Rent</label>
              <span className="control-value-badge">{formatGBP(rent)}/mo</span>
            </div>
            <input
              id="rent"
              type="range"
              min="500"
              max="4500"
              step="50"
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              className="slider"
            />
            <span className="control-help">
              Gross Yield: {((rent * 12) / price * 100).toFixed(1)}%
            </span>
          </div>

          {/* Investor Tax Bracket */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label className="control-label">Your Personal Income Tax Bracket</label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {[
                { id: "BASIC_20", name: "20% Basic" },
                { id: "HIGHER_40", name: "40% Higher" },
                { id: "ADDITIONAL_45", name: "45% Addl" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setTaxBracket(b.id as "BASIC_20" | "HIGHER_40" | "ADDITIONAL_45")}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: "var(--round-md)",
                    border: "1px solid",
                    borderColor: taxBracket === b.id ? "var(--primary)" : "var(--surface-border)",
                    background: taxBracket === b.id ? "var(--primary-light)" : "var(--surface)",
                    color: taxBracket === b.id ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mortgage Rates Comparison */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div className="control-label-wrap">
              <label htmlFor="personalRate" className="control-label">Personal BTL Rate</label>
              <span className="control-value-badge">{personalRate}%</span>
            </div>
            <input
              id="personalRate"
              type="range"
              min="3.0"
              max="7.0"
              step="0.1"
              value={personalRate}
              onChange={(e) => setPersonalRate(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="spvRate" className="control-label">Limited Co (SPV) Rate</label>
              <span className="control-value-badge">{spvRate}%</span>
            </div>
            <input
              id="spvRate"
              type="range"
              min="3.5"
              max="8.0"
              step="0.1"
              value={spvRate}
              onChange={(e) => setSpvRate(Number(e.target.value))}
              className="slider"
            />
            <span className="control-help">
              SPV commercial rates are typically 0.7%–1.2% higher than personal loans.
            </span>
          </div>

          {/* Profit Extraction Strategy */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div className="control-label-wrap">
              <label className="control-label">SPV Profit Strategy</label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={() => setStrategy("REINVEST_IN_SPV")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "var(--round-md)",
                  border: "1px solid",
                  borderColor: strategy === "REINVEST_IN_SPV" ? "var(--primary)" : "var(--surface-border)",
                  background: strategy === "REINVEST_IN_SPV" ? "var(--primary-light)" : "var(--surface)",
                  color: strategy === "REINVEST_IN_SPV" ? "var(--primary)" : "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Reinvest inside SPV (0% Div Tax)
              </button>
              <button
                onClick={() => setStrategy("EXTRACT_ALL_DIVIDENDS")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "var(--round-md)",
                  border: "1px solid",
                  borderColor: strategy === "EXTRACT_ALL_DIVIDENDS" ? "var(--primary)" : "var(--surface-border)",
                  background: strategy === "EXTRACT_ALL_DIVIDENDS" ? "var(--primary-light)" : "var(--surface)",
                  color: strategy === "EXTRACT_ALL_DIVIDENDS" ? "var(--primary)" : "var(--text-secondary)",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Extract all Dividends
              </button>
            </div>
          </div>
        </aside>

        {/* Right Column: Comparative Cashflow Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Coins size={18} style={{ color: "var(--primary)" }} />
              <span>Personal vs. Limited Company Annual Cashflow Comparison</span>
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Financial Item</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-primary)" }}>Personal Ownership</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)", fontWeight: 700 }}>Limited Co SPV</th>
                    <th style={{ padding: "8px 12px", color: "var(--accent-green)" }}>SPV Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Gross Annual Rent</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.personal.grossAnnualRent)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.spv.grossAnnualRent)}</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Mortgage Interest (Annual)</td>
                    <td style={{ padding: "10px 12px" }}>-{formatGBP(results.personal.annualMortgagePayment)} ({personalRate}%)</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>-{formatGBP(results.spv.annualMortgagePayment)} ({spvRate}%)</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)" }}>-{formatGBP(results.spv.annualMortgagePayment - results.personal.annualMortgagePayment)} (Higher Rate)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Management, Maintenance & Accountancy</td>
                    <td style={{ padding: "10px 12px" }}>-{formatGBP(results.personal.annualOperatingExpenses)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>-{formatGBP(results.spv.annualOperatingExpenses)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)" }}>-£1,200 (Accountant)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Taxable Profit Calculated</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)" }}>
                      {formatGBP(results.personal.taxableProfit)} <span style={{ fontSize: 11 }}>(No mortgage deduction!)</span>
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                      {formatGBP(results.spv.taxableProfit)} <span style={{ fontSize: 11 }}>(Full mortgage deduction)</span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)" }}>Shielded from income tax</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Tax Actually Paid</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)", fontWeight: 700 }}>-{formatGBP(results.personal.taxPaid)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>-{formatGBP(results.spv.taxPaid)} (19% Corp Tax)</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)", fontWeight: 700 }}>
                      {results.personal.taxPaid > results.spv.taxPaid
                        ? `Save ${formatGBP(results.personal.taxPaid - results.spv.taxPaid)} in tax`
                        : "Similar"}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", background: "var(--surface-tray)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Net Cashflow (Annual)</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.personal.netAnnualCashflow)}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)", fontSize: 15 }}>
                      {formatGBP(results.spv.netAnnualCashflow)}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 800, color: isSpvWinner ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {isSpvWinner ? `+${formatGBP(results.annualCashflowDifference)}/yr` : `-${formatGBP(Math.abs(results.annualCashflowDifference))}/yr`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 24 Breakdown Card */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Scale size={18} style={{ color: "var(--accent-amber)" }} />
              <span>The Section 24 &ldquo;Phantom Profit&rdquo; Rule Explained</span>
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Under Section 24, individual UK landlords cannot deduct finance costs from rental income before tax. Instead, you pay 40% (or 45%) tax on your gross rent minus running costs, and receive only a 20% basic rate tax credit. This creates a phantom tax drag of <strong>{formatGBP(results.section24TaxDragAnnual)} each year</strong>, eating into your cashflow. In contrast, an SPV deducts 100% of mortgage interest as a standard business cost before paying 19% Corporation Tax.
            </p>
          </div>
        </div>
      </div>

      {/* Commercial Broker Lead Modal */}
      {showBrokerModal && (
        <div className="drawer-overlay open" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div
            className="glass-panel"
            style={{
              width: "92%",
              maxWidth: 480,
              padding: "28px 24px",
              background: "var(--surface)",
              border: "1px solid var(--surface-border)",
              borderRadius: "var(--round-lg)",
              boxShadow: "var(--shadow-popover)",
            }}
          >
            {brokerSubmitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Sparkles size={48} style={{ color: "var(--primary)", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>SPV Mortgage Consultation Assigned</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                  An FCA-authorised commercial mortgage specialist will compare competitive Limited Company rates across specialist lenders (e.g. Paragon, Fleet, Aldermore, Shawbrook).
                </p>
                <button
                  onClick={() => {
                    setShowBrokerModal(false);
                    setBrokerSubmitted(false);
                  }}
                  style={{
                    marginTop: 18,
                    padding: "10px 20px",
                    borderRadius: "var(--round-md)",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBrokerSubmit}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Shield size={20} style={{ color: "var(--primary)" }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Compare SPV Commercial Mortgages</h3>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Commercial BTL rates vary widely between lenders. Connect with a specialist intermediary who handles new SPV formations and company BTL mortgages.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)", background: "var(--surface-tray)", color: "var(--text-primary)", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)", background: "var(--surface-tray)", color: "var(--text-primary)", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Phone (Optional for callback)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)", background: "var(--surface-tray)", color: "var(--text-primary)", marginTop: 4 }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      marginTop: 8,
                      padding: "12px",
                      borderRadius: "var(--round-md)",
                      background: "var(--primary)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Compare SPV Mortgage Rates
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBrokerModal(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      cursor: "pointer",
                      marginTop: 4,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
