"use client";

import React, { useState, useMemo } from "react";
import {
  Percent,
  Sliders,
  TrendingUp,
  Sparkles,
  Briefcase,
  FileText,
  AlertTriangle,
  Shield,
  Coins,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import {
  runTaxOptimization,
  TaxInputs,
} from "@/lib/tax-calculator";
import { SUPPORT_URL } from "@/lib/constants";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export default function TaxPage() {
  const [grossSalary, setGrossSalary] = useState(115000);
  const [salarySacrifice, setSalarySacrifice] = useState(15000);
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [childrenInChildcare, setChildrenInChildcare] = useState(1);
  const [hasPlan2, setHasPlan2] = useState(false);
  const [hasPostgrad, setHasPostgrad] = useState(false);
  const [donationDismissed, setDonationDismissed] = useState(false);
  const [showIfaModal, setShowIfaModal] = useState(false);
  const [ifaSubmitted, setIfaSubmitted] = useState(false);
  const [ifaName, setIfaName] = useState("");
  const [ifaEmail, setIfaEmail] = useState("");
  const [ifaPhone, setIfaPhone] = useState("");

  const inputs: TaxInputs = useMemo(
    () => ({
      grossSalary,
      salarySacrificePension: salarySacrifice,
      numberOfChildren,
      childrenInChildcare,
      hasStudentLoanPlan2: hasPlan2,
      hasStudentLoanPostgrad: hasPostgrad,
    }),
    [grossSalary, salarySacrifice, numberOfChildren, childrenInChildcare, hasPlan2, hasPostgrad]
  );

  const results = useMemo(() => runTaxOptimization(inputs), [inputs]);

  const applyPreset = (salary: number, children: number, childcare: number) => {
    setGrossSalary(salary);
    setNumberOfChildren(children);
    setChildrenInChildcare(childcare);
    if (salary > 100000) {
      setSalarySacrifice(Math.min(60000, salary - 100000));
    } else if (salary > 60000) {
      setSalarySacrifice(Math.min(60000, salary - 60000));
    } else {
      setSalarySacrifice(5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleIfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ifaName,
          email: ifaEmail,
          phone: ifaPhone,
          buyerType: "HIGH_EARNER_TAX_PLANNING",
          propertyPrice: grossSalary,
          depositPercent: 20,
          buyingTimeline: "IMMEDIATE_3M",
        }),
      });
      setIfaSubmitted(true);
    } catch {
      setIfaSubmitted(true);
    }
  };

  const isInTrap = grossSalary > 100000 && grossSalary <= 125140;

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Dismissible Donation Banner (Preserved) */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            👋 <strong>LadderPass Tax is 100% free with no paywalls or sales spam.</strong> If this tax modeler helps you keep your hard-earned money and preserve your childcare benefits, consider{" "}
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
        <div className="hero-pill" style={{ background: "var(--accent-amber-light)", color: "var(--accent-amber-text)", border: "1px solid var(--accent-amber-border)" }}>
          <Percent size={14} />
          <span>UK High Earner Tax & Pension Strategy</span>
        </div>
        <h1 className="hero-title">
          The 60% Marginal Tax Trap & Childcare Cliff Optimizer
        </h1>
        <p className="hero-description">
          In Britain, earnings between <strong>£100,000 and £125,140</strong> face an effective <strong>62% marginal tax rate</strong> due to Personal Allowance clawback—plus the sudden loss of 30 hours free childcare. Calculate your true marginal rate and find the exact SIPP salary sacrifice to keep your benefits.
        </p>

        {/* Quick Presets */}
        <div className="persona-presets-wrap">
          <span className="persona-label">Common Scenarios:</span>
          <div className="persona-chips">
            <button
              onClick={() => applyPreset(115000, 1, 1)}
              className={`persona-chip ${grossSalary === 115000 ? "active" : ""}`}
            >
              <span>£115k (Peak Trap + 1 Child)</span>
            </button>
            <button
              onClick={() => applyPreset(105000, 2, 2)}
              className={`persona-chip ${grossSalary === 105000 ? "active" : ""}`}
            >
              <span>£105k (Childcare Cliff Edge)</span>
            </button>
            <button
              onClick={() => applyPreset(75000, 2, 0)}
              className={`persona-chip ${grossSalary === 75000 ? "active" : ""}`}
            >
              <span>£75k (Child Benefit HICBC)</span>
            </button>
            <button
              onClick={() => applyPreset(140000, 0, 0)}
              className={`persona-chip ${grossSalary === 140000 ? "active" : ""}`}
            >
              <span>£140k (High Earner SIPP)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Verdict Banner */}
      <div className={`verdict-banner ${isInTrap ? "rent-wins" : "buy-wins"}`}>
        <div className="verdict-header">
          <div>
            <div className={`verdict-badge ${isInTrap ? "rent" : "buy"}`}>
              <Sparkles size={14} />
              <span>
                {isInTrap
                  ? `You are inside the UK 60% Marginal Tax Trap (${results.baseline.effectiveMarginalRatePercent}% Marginal Rate)`
                  : `Your Effective Marginal Rate: ${results.baseline.effectiveMarginalRatePercent}%`}
              </span>
            </div>

            <h2 className="verdict-headline">
              {salarySacrifice > 0
                ? `Sacrificing ${formatGBP(salarySacrifice)} into pension saves ${formatGBP(results.totalTaxAndNiSaved)} in Income Tax & NI.`
                : `You are paying ${formatGBP(results.baseline.incomeTax)} in Income Tax and ${formatGBP(results.baseline.nationalInsurance)} in NI.`}
            </h2>

            <p className="verdict-summary">
              {salarySacrifice > 0
                ? `Putting ${formatGBP(salarySacrifice)} into a pension or SIPP only costs ${formatGBP(results.netCostToTakeHome)} out of your net pay. That is equivalent to paying just £${results.netCostPer100PoundPension} for every £100 added to your pension pot!`
                : `Above £100,000, every £100 you earn loses £40 in Higher Rate tax, £20 from reduced Personal Allowance, and £2 in NI—leaving you with just £38.`}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", alignSelf: "center" }}>
            <button
              onClick={handlePrint}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Print Tax Report</span>
            </button>
            <button
              onClick={() => setShowIfaModal(true)}
              className="share-nav-btn"
              style={{ padding: "10px 14px" }}
            >
              <Briefcase size={15} />
              <span>Connect with an IFA</span>
            </button>
          </div>
        </div>

        {/* 4 Core Tax Metric Cards */}
        <div className="verdict-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Marginal Tax on Next £1</span>
            <span className="metric-value highlight" style={{ color: results.baseline.effectiveMarginalRatePercent >= 60 ? "var(--accent-red)" : "var(--primary)" }}>
              {results.baseline.effectiveMarginalRatePercent}%
            </span>
            <span className="metric-subtext">
              {results.baseline.effectiveMarginalRatePercent >= 60 ? "60% Income Tax + 2% NI" : "Income Tax + NI combined"}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Tax & NI Saved</span>
            <span className="metric-value highlight" style={{ color: "var(--accent-green)" }}>
              {formatGBP(results.totalTaxAndNiSaved)}
            </span>
            <span className="metric-subtext">Immediate statutory relief</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Preserved Childcare Value</span>
            <span className="metric-value">
              {formatGBP(results.childcarePreservedValue + results.childBenefitRestored)}
            </span>
            <span className="metric-subtext">30h Free Childcare & Child Benefit</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">True Cost per £100 in SIPP</span>
            <span className="metric-value" style={{ color: "var(--primary)" }}>
              £{results.netCostPer100PoundPension}
            </span>
            <span className="metric-subtext">Net out-of-pocket take-home impact</span>
          </div>
        </div>
      </div>

      {/* Optimal Recommendation Callout */}
      {results.optimalSacrificeTo100k > 0 && salarySacrifice < results.optimalSacrificeTo100k && (
        <div style={{
          background: "var(--accent-amber-light)",
          border: "1px solid var(--accent-amber-border)",
          borderRadius: "var(--round-lg)",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AlertTriangle size={24} style={{ color: "var(--accent-amber)" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent-amber-text)" }}>
                Optimal Tax-Saving Move: Sacrifice {formatGBP(results.optimalSacrificeTo100k)} into Pension
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Bringing your Adjusted Net Income down to exactly £100,000 restores your full £12,570 Personal Allowance and prevents the childcare cliff edge.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSalarySacrifice(results.optimalSacrificeTo100k)}
            style={{
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "var(--round-md)",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Apply Optimal Sacrifice
          </button>
        </div>
      )}

      {/* Main Grid: Controls vs Analysis */}
      <div className="main-grid">
        {/* Left Column: Sliders */}
        <aside className="controls-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Sliders size={18} />
              <h2 className="panel-title">Your Income & Deductions</h2>
            </div>
            <button
              onClick={() => {
                setGrossSalary(100000);
                setSalarySacrifice(0);
              }}
              className="reset-btn"
            >
              Reset
            </button>
          </div>

          {/* Gross Salary Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="grossSalary" className="control-label">Annual Gross Salary</label>
              <span className="control-value-badge">{formatGBP(grossSalary)}</span>
            </div>
            <input
              id="grossSalary"
              type="range"
              min="40000"
              max="200000"
              step="1000"
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£40k</span>
              <span style={{ color: "var(--accent-red)", fontWeight: 700 }}>£100k (Trap)</span>
              <span>£125k</span>
              <span>£200k</span>
            </div>
          </div>

          {/* Salary Sacrifice Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="salarySacrifice" className="control-label">Annual Pension Sacrifice / SIPP</label>
              <span className="control-value-badge" style={{ color: "var(--accent-green)", background: "rgba(16, 185, 129, 0.1)" }}>
                {formatGBP(salarySacrifice)}
              </span>
            </div>
            <input
              id="salarySacrifice"
              type="range"
              min="0"
              max={Math.min(60000, grossSalary)}
              step="500"
              value={salarySacrifice}
              onChange={(e) => setSalarySacrifice(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£0</span>
              <span>£20k</span>
              <span>£40k</span>
              <span>£60k (Annual Cap)</span>
            </div>
            <span className="control-help">
              Statutory pension annual allowance is capped at £60,000/year.
            </span>
          </div>

          {/* Family & Childcare Controls */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label className="control-label">Number of Children</label>
              <span className="control-value-badge">{numberOfChildren}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setNumberOfChildren(n)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: "var(--round-md)",
                    border: "1px solid",
                    borderColor: numberOfChildren === n ? "var(--primary)" : "var(--surface-border)",
                    background: numberOfChildren === n ? "var(--primary-light)" : "var(--surface)",
                    color: numberOfChildren === n ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <div className="control-label-wrap">
              <label className="control-label">Children in Paid Childcare (Under 5)</label>
              <span className="control-value-badge">{childrenInChildcare}</span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setChildrenInChildcare(n)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: "var(--round-md)",
                    border: "1px solid",
                    borderColor: childrenInChildcare === n ? "var(--primary)" : "var(--surface-border)",
                    background: childrenInChildcare === n ? "var(--primary-light)" : "var(--surface)",
                    color: childrenInChildcare === n ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <span className="control-help">
              Worth ~£8,500/year per child (30 hours free childcare + £2,000 Tax-Free Childcare top-up).
            </span>
          </div>

          {/* Student Loan Toggles */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Plan 2 Student Loan (9%)</span>
              <input
                type="checkbox"
                checked={hasPlan2}
                onChange={(e) => setHasPlan2(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Postgraduate Loan (6%)</span>
              <input
                type="checkbox"
                checked={hasPostgrad}
                onChange={(e) => setHasPostgrad(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
            </div>
          </div>
        </aside>

        {/* Right Column: Comparative Analysis & Projections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Side-by-Side Comparison Card */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Coins size={18} style={{ color: "var(--primary)" }} />
              <span>Take-Home Pay vs. Pension Comparison</span>
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Metric</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-primary)" }}>Without Sacrifice</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)" }}>With {formatGBP(salarySacrifice)} Sacrifice</th>
                    <th style={{ padding: "8px 12px", color: "var(--accent-green)" }}>Net Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Adjusted Net Income</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.adjustedNetIncome)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.adjustedNetIncome)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)" }}>-{formatGBP(salarySacrifice)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Personal Allowance</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.personalAllowance)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.personalAllowance)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)" }}>+{formatGBP(results.withSacrifice.personalAllowance - results.baseline.personalAllowance)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Income Tax Paid</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)" }}>{formatGBP(results.baseline.incomeTax)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.incomeTax)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)", fontWeight: 700 }}>Save {formatGBP(results.taxSaved)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>National Insurance</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.nationalInsurance)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.nationalInsurance)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)" }}>Save {formatGBP(results.niSaved)}</td>
                  </tr>
                  {numberOfChildren > 0 && (
                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>Net Child Benefit (Post-HICBC)</td>
                      <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.netChildBenefit)}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.netChildBenefit)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--accent-green)" }}>+{formatGBP(results.childBenefitRestored)}</td>
                    </tr>
                  )}
                  {childrenInChildcare > 0 && (
                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>Free Childcare Preserved Value</td>
                      <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.childcareValuePreserved)}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.childcareValuePreserved)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--accent-green)" }}>+{formatGBP(results.childcarePreservedValue)}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", background: "var(--surface-tray)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Annual Net Take-Home Pay</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.baseline.netTakeHome)}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)" }}>{formatGBP(results.withSacrifice.netTakeHome)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>Drop of {formatGBP(results.netCostToTakeHome)}</td>
                  </tr>
                  <tr style={{ background: "rgba(16, 185, 129, 0.05)" }}>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--accent-green)" }}>Annual Pension Pot Added</td>
                    <td style={{ padding: "12px" }}>£0</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--accent-green)" }}>+{formatGBP(salarySacrifice)}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--accent-green)" }}>+{formatGBP(salarySacrifice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SIPP Compound Wealth Projection Table */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} style={{ color: "var(--accent-green)" }} />
              <span>Projected SIPP / Pension Wealth Growth (at {formatGBP(salarySacrifice || 10000)}/yr)</span>
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              By shielding this income from the 62% tax trap, compounding it in global equity index funds builds substantial tax-sheltered wealth:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              {results.pensionGrowthProjections.map((p) => (
                <div
                  key={p.years}
                  style={{
                    padding: "12px 14px",
                    background: "var(--surface-tray)",
                    borderRadius: "var(--round-md)",
                    border: "1px solid var(--surface-border)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>After {p.years} Years</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent-green)", margin: "4px 0" }}>
                    {formatGBP(p.projectedPotAt7Percent)}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    Contributed: {formatGBP(p.totalContributed)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* IFA Lead Modal */}
      {showIfaModal && (
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
            {ifaSubmitted ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Sparkles size={48} style={{ color: "var(--primary)", margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Adviser Match Assigned</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                  An FCA-authorised Independent Financial Adviser specializing in UK high-earner SIPP strategy will contact you within 1 business day.
                </p>
                <button
                  onClick={() => {
                    setShowIfaModal(false);
                    setIfaSubmitted(false);
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
              <form onSubmit={handleIfaSubmit}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Shield size={20} style={{ color: "var(--primary)" }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Independent Wealth Planning</h3>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Connect with an FCA-regulated Independent Financial Adviser (IFA) to review your pension carry-forward allowances, SIPP transfers, and family wealth structure.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={ifaName}
                      onChange={(e) => setIfaName(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)", background: "var(--surface-tray)", color: "var(--text-primary)", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Work or Personal Email</label>
                    <input
                      type="email"
                      required
                      value={ifaEmail}
                      onChange={(e) => setIfaEmail(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)", background: "var(--surface-tray)", color: "var(--text-primary)", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Phone (Optional for SMS)</label>
                    <input
                      type="tel"
                      value={ifaPhone}
                      onChange={(e) => setIfaPhone(e.target.value)}
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
                    Request Free IFA Consultation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIfaModal(false)}
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

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
