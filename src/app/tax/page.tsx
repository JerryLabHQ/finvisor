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
  Coins,
  ShieldAlert,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ConsultationModal } from "@/components/ConsultationModal";
import { ExecutiveDossierModal } from "@/components/ExecutiveDossierModal";
import { StatutoryMethodology, CitationItem } from "@/components/StatutoryMethodology";
import { ActionChecklist, ChecklistItem } from "@/components/ActionChecklist";
import {
  runTaxOptimization,
  TaxInputs,
} from "@/lib/tax-calculator";
import { useFinancialProfile } from "@/lib/financial-profile-store";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

const TAX_CITATIONS: CitationItem[] = [
  {
    act: "Income Tax Act 2007",
    section: "Section 35",
    description: "Statutory clawback reducing the standard Personal Allowance (£12,570) by £1 for every £2 of adjusted net income above £100,000, creating an effective 60% income tax rate (62% including employee NI).",
    govUrl: "https://www.legislation.gov.uk/ukpga/2007/3/section/35",
  },
  {
    act: "Childcare Act 2006 & Early Education Regulations",
    description: "Strict £100,000 adjusted net income statutory ceiling beyond which entitlement to 30 hours of government-funded childcare and Tax-Free Childcare (£2,000/child) is entirely lost.",
    govUrl: "https://www.gov.uk/tax-free-childcare",
  },
  {
    act: "Finance Act 2004",
    section: "Part 4, Registered Pension Schemes",
    description: "Statutory exemption for registered pension contributions (SIPP / employer salary sacrifice) from income tax and National Insurance, reducing adjusted net income below the £100,000 threshold.",
    govUrl: "https://www.gov.uk/tax-on-your-private-pension/pension-tax-relief",
  },
  {
    act: "Social Security Contributions and Benefits Act 1992",
    description: "High Income Child Benefit Charge (HICBC) statutory taper recovering child benefit at 1% per £200 earned between £60,000 and £80,000.",
    govUrl: "https://www.gov.uk/child-benefit-tax-charge",
  },
];

const TAX_CHECKLIST: ChecklistItem[] = [
  {
    id: "ani-calc",
    stepNumber: 1,
    title: "Calculate Exact Adjusted Net Income",
    detail: "Take total gross income (salary, bonuses, rental profits, dividends) and deduct gross pension contributions and allowable charitable Gift Aid.",
    actionTag: "Statutory Base",
  },
  {
    id: "workplace-salsac",
    stepNumber: 2,
    title: "Maximize Workplace Pension Salary Sacrifice",
    detail: "Request employer payroll sacrifice down to £100,000 before 5 April to eliminate 40% income tax and 2% employee National Insurance at source.",
    actionTag: "Payroll Action",
  },
  {
    id: "sipp-topup",
    stepNumber: 3,
    title: "Execute Direct Personal SIPP Contribution",
    detail: "If payroll cutoff has passed, contribute net cash into a personal SIPP. The provider reclaims 20% basic-rate tax automatically from HMRC.",
    actionTag: "Immediate Relief",
  },
  {
    id: "sa-relief-claim",
    stepNumber: 4,
    title: "Claim Higher-Rate Relief via Self Assessment",
    detail: "Declare gross SIPP contributions on your HMRC SA100 tax return to recover the additional 20% higher-rate relief as a direct refund or tax code adjustment.",
    actionTag: "HMRC Filing",
  },
  {
    id: "childcare-recertify",
    stepNumber: 5,
    title: "Re-confirm 30 Hours Funded Childcare Entitlement",
    detail: "Log in to the government Childcare Service account and re-confirm income below £100k every 3 months to protect up to £9,000/yr in free childcare.",
    actionTag: "Cliff Edge Defense",
  },
];

export default function TaxPage() {
  const { updateProfile } = useFinancialProfile();
  const [grossSalary, setGrossSalary] = useState(115000);
  const [salarySacrifice, setSalarySacrifice] = useState(15000);
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [childrenInChildcare, setChildrenInChildcare] = useState(1);
  const [hasPlan2, setHasPlan2] = useState(false);
  const [hasPostgrad, setHasPostgrad] = useState(false);
  const [showIfaModal, setShowIfaModal] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  React.useEffect(() => {
    const pensionPct = grossSalary > 0 ? Math.min(60, Math.round((salarySacrifice / grossSalary) * 100)) : 5;
    updateProfile({
      grossSalary,
      pensionSacrificePercent: pensionPct,
      childrenCount: numberOfChildren,
      childcareCount: childrenInChildcare,
    });
  }, [grossSalary, salarySacrifice, numberOfChildren, childrenInChildcare, updateProfile]);

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

  const isInTrap = grossSalary > 100000 && grossSalary <= 125140;

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

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
              onClick={() => setIsDossierOpen(true)}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Generate Tax Dossier</span>
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
            <span className="metric-value highlight tabular-nums" style={{ color: results.baseline.effectiveMarginalRatePercent >= 60 ? "var(--tertiary)" : "var(--primary)" }}>
              {results.baseline.effectiveMarginalRatePercent}%
            </span>
            <span className="metric-subtext">
              {results.baseline.effectiveMarginalRatePercent >= 60 ? "60% Income Tax + 2% NI" : "Income Tax + NI combined"}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Tax & NI Saved</span>
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.totalTaxAndNiSaved)}
            </span>
            <span className="metric-subtext">Immediate statutory relief</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Preserved Childcare Value</span>
            <span className="metric-value tabular-nums">
              {formatGBP(results.childcarePreservedValue + results.childBenefitRestored)}
            </span>
            <span className="metric-subtext">30h Free Childcare & Child Benefit</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">True Cost per £100 in SIPP</span>
            <span className="metric-value tabular-nums" style={{ color: "var(--primary)" }}>
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

      {/* Market Leader Editorial Callout: Martin's Rule of Thumb for High Earners */}
      <div
        style={{
          padding: "16px 20px",
          background: "#ffffff",
          border: "1px solid var(--surface-border)",
          borderRadius: "var(--round-lg)",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          boxShadow: "var(--shadow-card)",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            padding: "8px",
            borderRadius: "6px",
            background: "var(--accent-amber-light)",
            color: "var(--accent-amber-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={20} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--text-primary)" }}>Martin&apos;s Rule of Thumb for High Earners (£100k Cliff Edge): </strong>
          <span style={{ color: "var(--text-secondary)" }}>
            Earning £100,001 immediately revokes 30 hours of free childcare (worth up to ~£8,500/yr per child) and £2,000 Tax-Free Childcare, while triggering a 60% effective income tax rate via Personal Allowance clawback (40% tax + 20% allowance reduction + 2% NI = 62% marginal drag). Sacrificing into a workplace pension or personal SIPP brings your Adjusted Net Income back under £100k, restoring £12,570 of tax-free allowance and full childcare funding.
          </span>
        </div>
      </div>

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
              <span style={{ color: "var(--tertiary)", fontWeight: 700 }}>£100k (Trap)</span>
              <span>£125k</span>
              <span>£200k</span>
            </div>
          </div>

          {/* Salary Sacrifice Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="salarySacrifice" className="control-label">Annual Pension Sacrifice / SIPP</label>
              <span className="control-value-badge" style={{ color: "var(--primary)", background: "var(--primary-light)" }}>
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
              <table className="tabular-nums editorial-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Metric</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-primary)" }}>Without Sacrifice</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)" }}>With {formatGBP(salarySacrifice)} Sacrifice</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)" }}>Net Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Adjusted Net Income</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.adjustedNetIncome)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.adjustedNetIncome)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)", fontWeight: 700 }}>-{formatGBP(salarySacrifice)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Personal Allowance</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.personalAllowance)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.personalAllowance)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)", fontWeight: 700 }}>+{formatGBP(results.withSacrifice.personalAllowance - results.baseline.personalAllowance)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Income Tax Paid</td>
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)" }}>{formatGBP(results.baseline.incomeTax)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.incomeTax)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)", fontWeight: 700 }}>Save {formatGBP(results.taxSaved)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>National Insurance</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.nationalInsurance)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.nationalInsurance)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)" }}>Save {formatGBP(results.niSaved)}</td>
                  </tr>
                  {numberOfChildren > 0 && (
                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>Net Child Benefit (Post-HICBC)</td>
                      <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.netChildBenefit)}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.netChildBenefit)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--primary)" }}>+{formatGBP(results.childBenefitRestored)}</td>
                    </tr>
                  )}
                  {childrenInChildcare > 0 && (
                    <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>Free Childcare Preserved Value</td>
                      <td style={{ padding: "10px 12px" }}>{formatGBP(results.baseline.childcareValuePreserved)}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.withSacrifice.childcareValuePreserved)}</td>
                      <td style={{ padding: "10px 12px", color: "var(--primary)" }}>+{formatGBP(results.childcarePreservedValue)}</td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", background: "var(--surface-tray)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Annual Net Take-Home Pay</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.baseline.netTakeHome)}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)" }}>{formatGBP(results.withSacrifice.netTakeHome)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>Drop of {formatGBP(results.netCostToTakeHome)}</td>
                  </tr>
                  <tr style={{ background: "var(--primary-light)" }}>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)" }}>Annual Pension Pot Added</td>
                    <td style={{ padding: "12px" }}>£0</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)" }}>+{formatGBP(salarySacrifice)}</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)" }}>+{formatGBP(salarySacrifice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SIPP Compound Wealth Projection Table */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} style={{ color: "var(--primary)" }} />
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
                  <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 800, color: "var(--primary)", margin: "4px 0" }}>
                    {formatGBP(p.projectedPotAt7Percent)}
                  </div>
                  <div className="tabular-nums" style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                    Contributed: {formatGBP(p.totalContributed)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Sources & Mathematical Methodology (IFS / FT Style) */}
      <StatutoryMethodology
        moduleTitle="60% Marginal Tax Trap & SIPP Pension Optimizer"
        formulaDescription="Computes exact statutory income tax bands under the Income Tax Act 2007 (Basic 20%, Higher 40%, Additional 45%), Personal Allowance clawback at £0.50 per £1 between £100,000 and £125,140, Class 1 Employee National Insurance (8% and 2%), and the all-or-nothing loss of 30 hours funded childcare."
        citations={TAX_CITATIONS}
        defaultOpen={false}
      />

      {/* Interactive 60% Tax Trap Mitigation Checklist (Which? & MSE Style) */}
      <ActionChecklist
        id="tax-trap"
        title="60% Marginal Tax Trap Recovery Checklist"
        subtitle="5 actionable steps to restore your Personal Allowance and preserve 30h free childcare before 5 April"
        items={TAX_CHECKLIST}
      />

      {/* Chartered Tax & IFA Consultation Modal */}
      <ConsultationModal
        isOpen={showIfaModal}
        onClose={() => setShowIfaModal(false)}
        context="TAX_TRAP"
        propertyPrice={grossSalary}
        customMetrics={{
          primaryLabel: "Gross Annual Income",
          primaryValue: formatGBP(grossSalary),
          primarySub: `${results.baseline.effectiveMarginalRatePercent}% Marginal`,
          secondaryLabel: "Optimized SIPP Sacrifice",
          secondaryValue: formatGBP(salarySacrifice),
          secondarySub: "Annual Cap: £60k",
          tertiaryLabel: "Statutory Tax & NI Saved",
          tertiaryValue: formatGBP(results.totalTaxAndNiSaved),
          tertiarySub: "Immediate relief",
          quaternaryLabel: "Childcare Value Retained",
          quaternaryValue: formatGBP(results.childcarePreservedValue),
          quaternarySub: "30h + Tax-Free top-up",
        }}
      />

      {/* Institutional Printable Tax Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        title="60% Marginal Tax Trap Mitigation Dossier"
        subtitle="HMRC statutory income tax, National Insurance, and SIPP salary sacrifice optimization audit"
        badge={isInTrap ? "62% Marginal Trap Active" : "Standard Marginal Rate"}
        metrics={[
          { label: "Gross Salary", value: formatGBP(grossSalary), sub: `${results.baseline.effectiveMarginalRatePercent}% Marginal Rate` },
          { label: "SIPP Contribution", value: formatGBP(salarySacrifice), sub: `Net Cost: ${formatGBP(results.netCostToTakeHome)}` },
          { label: "Immediate Tax & NI Saved", value: formatGBP(results.totalTaxAndNiSaved), sub: `£${results.netCostPer100PoundPension} per £100 SIPP` },
          { label: "Childcare Retained", value: formatGBP(results.childcarePreservedValue), sub: "30h statutory funded" },
        ]}
        summaryParagraph={
          salarySacrifice > 0
            ? `By allocating ${formatGBP(salarySacrifice)} into an approved registered pension scheme (SIPP), adjusted net income is reduced to ${formatGBP(results.withSacrifice.adjustedNetIncome)}. This completely eliminates the 60% Personal Allowance clawback, saving ${formatGBP(results.totalTaxAndNiSaved)} in statutory deductions and preserving ${formatGBP(results.childcarePreservedValue)} in funded childcare entitlements.`
            : `Gross earnings of ${formatGBP(grossSalary)} place you squarely in the 60% marginal tax trap between £100,000 and £125,140. Every £100 earned in this band loses £40 to Higher Rate income tax, £20 from Personal Allowance clawback, and £2 in Class 1 employee NI, leaving only £38 take-home.`
        }
        breakdownTable={{
          headers: ["Horizon", "Gross Salary", "Annual SIPP", "Total Contributed", "Compound Value (7.0%)", "Net Tax Saved"],
          rows: results.pensionGrowthProjections.map((p) => [
            `${p.years} Years`,
            formatGBP(grossSalary),
            formatGBP(salarySacrifice),
            formatGBP(p.totalContributed),
            formatGBP(p.projectedPotAt7Percent),
            formatGBP(results.totalTaxAndNiSaved * p.years),
          ]),
        }}
        statutoryCitations={TAX_CITATIONS.map((c) => ({ act: c.act, description: c.description }))}
        csvFilename="ladderpass_60_tax_trap_audit"
        onRequestConsultation={() => {
          setIsDossierOpen(false);
          setShowIfaModal(true);
        }}
      />

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
