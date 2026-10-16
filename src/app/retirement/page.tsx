"use client";

import React, { useState, useMemo } from "react";
import {
  Coins,
  Sliders,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ConsultationModal } from "@/components/ConsultationModal";
import { ExecutiveDossierModal } from "@/components/ExecutiveDossierModal";
import { StatutoryMethodology, CitationItem } from "@/components/StatutoryMethodology";
import { ActionChecklist, ChecklistItem } from "@/components/ActionChecklist";
import {
  runPensionCalculation,
  PensionInputs,
} from "@/lib/pension-calculator";
import { useFinancialProfile } from "@/lib/financial-profile-store";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

const RETIREMENT_CITATIONS: CitationItem[] = [
  {
    act: "Finance Act 2004",
    section: "Schedule 29 (Authorized Lump Sums)",
    description: "Statutory 25% Pension Commencement Lump Sum (PCLS) tax-free entitlement, subject to the legislated Lump Sum Allowance cap of £268,275.",
    govUrl: "https://www.gov.uk/tax-on-your-private-pension/pension-tax-free-lump-sum",
  },
  {
    act: "Finance Act 2024 & Autumn Budget 2024",
    section: "Inheritance Tax Reform (Pensions)",
    description: "Statutory transition bringing unused registered pension funds and death benefits into the scope of UK Inheritance Tax (IHT) starting 6 April 2027.",
    govUrl: "https://www.gov.uk/government/publications/inheritance-tax-on-pensions",
  },
  {
    act: "Pensions Act 2014",
    section: "Part 1 (State Pension)",
    description: "Statutory single-tier State Pension (£11,973/yr full New State Pension) requiring 35 qualifying National Insurance years, indexed via the statutory triple lock formula.",
    govUrl: "https://www.gov.uk/new-state-pension",
  },
  {
    act: "Income Tax (Earnings and Pensions) Act 2003",
    section: "Part 9 (Pension Income)",
    description: "Governs PAYE income tax withholding on flexible drawdown withdrawals (20% basic, 40% higher, and 45% additional rate brackets).",
    govUrl: "https://www.legislation.gov.uk/ukpga/2003/1/part/9",
  },
];

const RETIREMENT_CHECKLIST: ChecklistItem[] = [
  {
    id: "dwp-forecast",
    stepNumber: 1,
    title: "Obtain Official DWP State Pension Forecast",
    detail: "Log in to Check Your State Pension online (gov.uk) to verify qualifying National Insurance years (35 required for full amount) and pinpoint your statutory State Pension Age.",
    actionTag: "DWP Government Record",
  },
  {
    id: "pension-tracing",
    stepNumber: 2,
    title: "Consolidate Legacy Workplace Pension Pots",
    detail: "Trace older employer pensions to eliminate duplicate annual management charges (AMCs) and transfer into a modern low-cost SIPP with flexible drawdown capabilities.",
    actionTag: "Fee Reduction",
  },
  {
    id: "pcls-timing",
    stepNumber: 3,
    title: "Schedule 25% Tax-Free Lump Sum (PCLS)",
    detail: "Plan your Pension Commencement Lump Sum withdrawal (statutory cap £268,275) to pay off remaining mortgage debt or fund early retirement bridges without triggering tax.",
    actionTag: "Tax-Free Allowance",
  },
  {
    id: "swr-calibration",
    stepNumber: 4,
    title: "Calibrate Safe Withdrawal Rate (3.5% - 4.0%)",
    detail: "Establish dynamic withdrawal guardrails during early retirement years to preserve capital longevity and insulate your portfolio from sequence-of-returns shocks.",
    actionTag: "Portfolio Longevity",
  },
  {
    id: "iht-2027-review",
    stepNumber: 5,
    title: "Implement April 2027 Pension IHT Estate Plan",
    detail: "Because unspent pensions enter the 40% Inheritance Tax net from 6 April 2027, review spending sequences: drawdown taxable pension pots before depleting tax-exempt ISAs.",
    actionTag: "Estate & IHT Defense",
  },
];

export default function RetirementPage() {
  const { updateProfile } = useFinancialProfile();
  const [pensionPot, setPensionPot] = useState(550000);
  const [isaPot, setIsaPot] = useState(80000);
  const [currentAge, setCurrentAge] = useState(55);
  const [retireAge, setRetireAge] = useState(60);
  const [lifeAge, setLifeAge] = useState(88);
  const [incomeNet, setIncomeNet] = useState(32000);
  const [takePcls, setTakePcls] = useState(true);
  const [returnPct, setReturnPct] = useState(5.5);
  const [inflationPct] = useState(2.5);
  const [hasStatePension, setHasStatePension] = useState(true);

  const [showIfaModal, setShowIfaModal] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  React.useEffect(() => {
    updateProfile({
      pensionPot,
    });
  }, [pensionPot, updateProfile]);

  const inputs: PensionInputs = useMemo(
    () => ({
      currentPensionPot: pensionPot,
      currentIsaPot: isaPot,
      currentAge,
      targetRetirementAge: retireAge,
      lifeExpectancyAge: lifeAge,
      desiredAnnualIncomeNet: incomeNet,
      takeTaxFreeLumpSumAtRetirement: takePcls,
      assumedRealReturnPercent: returnPct,
      inflationPercent: inflationPct,
      statePensionAge: 67,
      qualifiesForFullStatePension: hasStatePension,
      annuityQuoteRatePercent: 6.5,
    }),
    [pensionPot, isaPot, currentAge, retireAge, lifeAge, incomeNet, takePcls, returnPct, inflationPct, hasStatePension]
  );

  const results = useMemo(() => runPensionCalculation(inputs), [inputs]);

  const applyPreset = (
    potVal: number,
    isaVal: number,
    curAgeVal: number,
    retAgeVal: number,
    incVal: number
  ) => {
    setPensionPot(potVal);
    setIsaPot(isaVal);
    setCurrentAge(curAgeVal);
    setRetireAge(retAgeVal);
    setIncomeNet(incVal);
  };

  const isSustainable = results.verdict === "SUSTAINABLE_DRAWDOWN";

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--accent-amber-text)", border: "1px solid var(--accent-amber-border)" }}>
          <Coins size={14} />
          <span>UK Retirement, FIRE & Drawdown Strategy</span>
        </div>
        <h1 className="hero-title">
          Pension Drawdown, FIRE Longevity & Annuity Simulator
        </h1>
        <p className="hero-description">
          Model how long your SIPP and ISA portfolio will last in flexible drawdown against market volatility, sequence-of-returns risk, and the <strong>Autumn Budget 2027 Inheritance Tax (IHT) changes</strong> bringing unspent pensions into taxable estates.
        </p>

        {/* Quick Presets */}
        <div className="persona-presets-wrap">
          <span className="persona-label">Retirement Scenarios:</span>
          <div className="persona-chips">
            <button
              onClick={() => applyPreset(550000, 80000, 55, 60, 32000)}
              className={`persona-chip ${pensionPot === 550000 && incomeNet === 32000 ? "active" : ""}`}
            >
              <span>Comfortable Drawdown (£630k Total, £32k/yr)</span>
            </button>
            <button
              onClick={() => applyPreset(350000, 40000, 50, 55, 24000)}
              className={`persona-chip ${pensionPot === 350000 && retireAge === 55 ? "active" : ""}`}
            >
              <span>Early FIRE (£390k Pot, Age 55)</span>
            </button>
            <button
              onClick={() => applyPreset(1050000, 150000, 58, 62, 50000)}
              className={`persona-chip ${pensionPot === 1050000 ? "active" : ""}`}
            >
              <span>Affluent (£1.2M Pot, 2027 IHT Risk)</span>
            </button>
            <button
              onClick={() => applyPreset(400000, 20000, 64, 65, 30000)}
              className={`persona-chip ${pensionPot === 400000 && retireAge === 65 ? "active" : ""}`}
            >
              <span>Annuity vs Drawdown Benchmark (£400k)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Verdict Banner */}
      <div className={`verdict-banner ${isSustainable ? "buy-wins" : "rent-wins"}`}>
        <div className="verdict-header">
          <div>
            <div className={`verdict-badge ${isSustainable ? "buy" : "rent"}`}>
              {isSustainable ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              <span>
                {isSustainable
                  ? `Verdict: Sustainable Drawdown (${results.initialDrawdownRatePercent}% Initial Rate)`
                  : `Verdict: High Depletion Risk (Runs Dry at Age ${results.potLastsUntilAge})`}
              </span>
            </div>

            <h2 className="verdict-headline">
              {isSustainable
                ? `Your portfolio is projected to last past age ${lifeAge} with a £${results.finalLegacyPotAtLifeExpectancy.toLocaleString()} surplus.`
                : `Your desired spending of ${formatGBP(incomeNet)}/yr runs out before age ${lifeAge}.`}
            </h2>

            <p className="verdict-summary">{results.verdictReasoning}</p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", alignSelf: "center" }}>
            <button
              onClick={() => setIsDossierOpen(true)}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Generate Retirement Dossier</span>
            </button>
            <button
              onClick={() => setShowIfaModal(true)}
              className="share-nav-btn"
              style={{ padding: "10px 14px" }}
            >
              <Shield size={15} />
              <span>Speak to a Retirement IFA</span>
            </button>
          </div>
        </div>

        {/* 4 Core Retirement Metric Cards */}
        <div className="verdict-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Initial Withdrawal Rate</span>
            <span className="metric-value highlight tabular-nums" style={{ color: results.initialDrawdownRatePercent <= 4.0 ? "var(--primary)" : "var(--tertiary)" }}>
              {results.initialDrawdownRatePercent}%
            </span>
            <span className="metric-subtext">UK Safe Withdrawal Benchmark: 3.8%</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">25% Tax-Free Lump Sum (PCLS)</span>
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.pclsLumpSumTaken)}
            </span>
            <span className="metric-subtext">Capped at £268,275 statutory limit</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Guaranteed Lifetime Annuity</span>
            <span className="metric-value tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.guaranteedAnnuityAnnualIncome)}/yr
            </span>
            <span className="metric-subtext">Benchmark 6.5% level annuity rate</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Est. 2027 IHT Exposure</span>
            <span className="metric-value tabular-nums" style={{ color: results.estimatedPost2027IhtExposure > 0 ? "var(--tertiary)" : "var(--primary)" }}>
              {formatGBP(results.estimatedPost2027IhtExposure)}
            </span>
            <span className="metric-subtext">40% IHT on unspent pension</span>
          </div>
        </div>
      </div>

      {/* Market Leader Editorial Callout: Martin's Rule of Thumb for Retirement & IHT */}
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
          <strong style={{ color: "var(--text-primary)" }}>Martin&apos;s Rule of Thumb for Retirement &amp; 2027 IHT: </strong>
          <span style={{ color: "var(--text-secondary)" }}>
            You can withdraw up to 25% of your defined contribution pension completely tax-free (capped at £268,275 PCLS). Subsequent withdrawals are taxed at your marginal income tax rate. Crucially, under Autumn Budget statutory reforms, unspent pension pots will no longer bypass Inheritance Tax (IHT) after April 2027. If your total estate exceeds £325k (or £1m with the Residence Nil Rate Band), unspent pension wealth faces up to 40% IHT, making planned decumulation and lifetime gifting essential.
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
              <h2 className="panel-title">Pensions & Spending</h2>
            </div>
            <button
              onClick={() => {
                setPensionPot(550000);
                setIsaPot(80000);
                setIncomeNet(32000);
              }}
              className="reset-btn"
            >
              Reset
            </button>
          </div>

          {/* Pension Pot Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="pensionPot" className="control-label">Defined Contribution / SIPP Pot</label>
              <span className="control-value-badge">{formatGBP(pensionPot)}</span>
            </div>
            <input
              id="pensionPot"
              type="range"
              min="100000"
              max="1500000"
              step="10000"
              value={pensionPot}
              onChange={(e) => setPensionPot(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£100k</span>
              <span>£500k</span>
              <span>£1.0m</span>
              <span>£1.5m</span>
            </div>
          </div>

          {/* Stocks & Shares ISA Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="isaPot" className="control-label">Stocks & Shares ISA Balance</label>
              <span className="control-value-badge">{formatGBP(isaPot)}</span>
            </div>
            <input
              id="isaPot"
              type="range"
              min="0"
              max="500000"
              step="5000"
              value={isaPot}
              onChange={(e) => setIsaPot(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£0</span>
              <span>£100k</span>
              <span>£250k</span>
              <span>£500k</span>
            </div>
            <span className="control-help">
              ISA withdrawals are 100% free of income tax.
            </span>
          </div>

          {/* Target Net Spending */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="incomeNet" className="control-label">Desired Annual Net Income</label>
              <span className="control-value-badge">{formatGBP(incomeNet)}/yr</span>
            </div>
            <input
              id="incomeNet"
              type="range"
              min="18000"
              max="90000"
              step="1000"
              value={incomeNet}
              onChange={(e) => setIncomeNet(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£18k</span>
              <span>£35k (Comfortable)</span>
              <span>£60k</span>
              <span>£90k</span>
            </div>
            <span className="control-help">
              Equivalent to {formatGBP(Math.round(incomeNet / 12))}/month post-tax spending.
            </span>
          </div>

          {/* Retirement Age Slider */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div className="control-label-wrap">
              <label htmlFor="retireAge" className="control-label">Target Retirement Age</label>
              <span className="control-value-badge">Age {retireAge}</span>
            </div>
            <input
              id="retireAge"
              type="range"
              min="50"
              max="70"
              step="1"
              value={retireAge}
              onChange={(e) => setRetireAge(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>Age 50</span>
              <span>Age 58 (SIPP)</span>
              <span>Age 67 (State)</span>
              <span>Age 70</span>
            </div>
          </div>

          {/* Current Age Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="currentAge" className="control-label">Current Age</label>
              <span className="control-value-badge">Age {currentAge}</span>
            </div>
            <input
              id="currentAge"
              type="range"
              min="30"
              max="65"
              step="1"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>Age 30</span>
              <span>Age 40</span>
              <span>Age 50</span>
              <span>Age 65</span>
            </div>
          </div>

          {/* Longevity Horizon Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="lifeAge" className="control-label">Longevity Planning Age</label>
              <span className="control-value-badge">Age {lifeAge}</span>
            </div>
            <input
              id="lifeAge"
              type="range"
              min="75"
              max="98"
              step="1"
              value={lifeAge}
              onChange={(e) => setLifeAge(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>Age 75</span>
              <span>Age 85 (ONS Avg)</span>
              <span>Age 90</span>
              <span>Age 98</span>
            </div>
          </div>

          {/* Toggles */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Take 25% Tax-Free Lump Sum (PCLS)</span>
              <input
                type="checkbox"
                checked={takePcls}
                onChange={(e) => setTakePcls(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Full UK State Pension at Age 67 (£11.5k)</span>
              <input
                type="checkbox"
                checked={hasStatePension}
                onChange={(e) => setHasStatePension(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Real Return Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="returnPct" className="control-label">Real Portfolio Return (After Fees)</label>
              <span className="control-value-badge">{returnPct}%</span>
            </div>
            <input
              id="returnPct"
              type="range"
              min="2.0"
              max="8.0"
              step="0.5"
              value={returnPct}
              onChange={(e) => setReturnPct(Number(e.target.value))}
              className="slider"
            />
          </div>
        </aside>

        {/* Right Column: Year-by-Year Decumulation Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Coins size={18} style={{ color: "var(--primary)" }} />
              <span>Retirement Decumulation & Cashflow Projection</span>
            </h3>

            <div style={{ overflowX: "auto", maxHeight: 420 }}>
              <table className="tabular-nums editorial-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", color: "var(--text-muted)" }}>Age</th>
                    <th style={{ padding: "8px 10px" }}>Starting SIPP</th>
                    <th style={{ padding: "8px 10px" }}>Starting ISA</th>
                    <th style={{ padding: "8px 10px", color: "var(--primary)" }}>State Pension</th>
                    <th style={{ padding: "8px 10px", color: "var(--tertiary)" }}>SIPP Drawdown</th>
                    <th style={{ padding: "8px 10px" }}>Tax Paid</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Total Net Worth</th>
                  </tr>
                </thead>
                <tbody>
                  {results.projections.map((row) => (
                    <tr
                      key={row.age}
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        background: row.isPotDepleted ? "var(--tertiary-light)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px 10px", fontWeight: 700 }}>
                        Age {row.age} {row.isPotDepleted && "⚠️ Depleted"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.startingPensionPot)}</td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.startingIsaPot)}</td>
                      <td style={{ padding: "8px 10px", color: "var(--primary)" }}>
                        {row.statePensionReceived > 0 ? `+${formatGBP(row.statePensionReceived)}` : "—"}
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--tertiary)" }}>
                        {row.drawdownFromPension > 0 ? `-${formatGBP(row.drawdownFromPension)}` : "—"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        {row.taxPaidOnDrawdown > 0 ? formatGBP(row.taxPaidOnDrawdown) : "£0"}
                      </td>
                      <td style={{ padding: "8px 10px", fontWeight: 800 }}>
                        {formatGBP(row.totalNetWorth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2027 IHT Reform Advisory Card */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Scale size={18} style={{ color: "var(--accent-amber)" }} />
              <span>Autumn Budget 2027: Pension Inheritance Tax (IHT) Impact</span>
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              From April 2027, unused pension funds and death benefits will no longer be exempt from UK Inheritance Tax. If your total estate exceeds the nil-rate band (£325,000), unspent pensions face up to <strong>40% IHT</strong>. This inverts traditional retirement advice: financial planners now frequently recommend spending down taxable pension pots <em>before</em> dipping into tax-free ISAs to minimize your family&apos;s eventual IHT liability.
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Sources & Mathematical Methodology (IFS / FT Style) */}
      <StatutoryMethodology
        moduleTitle="Retirement & FIRE: Drawdown, Annuity & 2027 IHT"
        formulaDescription="Simulates variable annual drawdown rates net of basic and higher rate income tax (PAYE), 25% tax-free PCLS withdrawal up to the £268,275 statutory cap, portfolio compounding net of inflation, single-tier State Pension bridge commencing at age 68, and 40% Inheritance Tax exposure on unspent funds post-April 2027."
        citations={RETIREMENT_CITATIONS}
        defaultOpen={false}
      />

      {/* Interactive Retirement Preparation Checklist (Which? & MSE Style) */}
      <ActionChecklist
        id="retirement-fire"
        title="Retirement Drawdown & April 2027 IHT Defense Checklist"
        subtitle="5 bounded statutory and portfolio milestones to secure financial independence"
        items={RETIREMENT_CHECKLIST}
      />

      {/* Chartered Financial Planner & Pension Consultation Modal */}
      <ConsultationModal
        isOpen={showIfaModal}
        onClose={() => setShowIfaModal(false)}
        context="RETIREMENT"
        propertyPrice={pensionPot}
        customMetrics={{
          primaryLabel: "Accumulated Pension Pot",
          primaryValue: formatGBP(pensionPot),
          primarySub: `Current Age: ${currentAge}`,
          secondaryLabel: "Target Annual Net Income",
          secondaryValue: `${formatGBP(incomeNet)}/yr`,
          secondarySub: `Retire at ${retireAge}`,
          tertiaryLabel: "25% Tax-Free Lump Sum (PCLS)",
          tertiaryValue: formatGBP(takePcls ? Math.min(268275, pensionPot * 0.25) : 0),
          tertiarySub: "HMRC statutory allowance",
          quaternaryLabel: "Portfolio Sustainability",
          quaternaryValue: isSustainable ? "Sustainable Drawdown" : "Depletion Risk",
          quaternarySub: isSustainable ? `Survives past age ${lifeAge}` : "Requires reduction",
        }}
      />

      {/* Institutional Printable Retirement Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        title="Retirement Drawdown & April 2027 IHT Memorandum"
        subtitle="Sustainable drawdown modeling, State Pension bridge, and Autumn Budget 2027 IHT exposure"
        badge={isSustainable ? "Sustainable Drawdown Horizon" : "Depletion Alert"}
        metrics={[
          { label: "Total Pension Pot", value: formatGBP(pensionPot), sub: `S&S ISA: ${formatGBP(isaPot)}` },
          { label: "Target Annual Net Income", value: `${formatGBP(incomeNet)}/yr`, sub: `Retire at ${retireAge}` },
          { label: "25% Tax-Free PCLS", value: formatGBP(takePcls ? Math.min(268275, pensionPot * 0.25) : 0), sub: "£268,275 statutory cap" },
          { label: "Projected Legacy Surplus", value: formatGBP(results.finalLegacyPotAtLifeExpectancy), sub: `At age ${lifeAge}` },
        ]}
        summaryParagraph={results.verdictReasoning}
        breakdownTable={{
          headers: ["Age", "Starting Pension", "Starting ISA", "State Pension", "Pension Drawdown", "Tax Paid", "Total Net Worth"],
          rows: results.projections.slice(0, 20).map((row) => [
            `Age ${row.age}${row.isPotDepleted ? " (Depleted)" : ""}`,
            formatGBP(row.startingPensionPot),
            formatGBP(row.startingIsaPot),
            row.statePensionReceived > 0 ? formatGBP(row.statePensionReceived) : "£0",
            row.drawdownFromPension > 0 ? formatGBP(row.drawdownFromPension) : "£0",
            formatGBP(row.taxPaidOnDrawdown),
            formatGBP(row.totalNetWorth),
          ]),
        }}
        statutoryCitations={RETIREMENT_CITATIONS.map((c) => ({ act: c.act, description: c.description }))}
        csvFilename="ladderpass_retirement_drawdown_audit"
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
