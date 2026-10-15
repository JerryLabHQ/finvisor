"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Sliders,
  FileText,
  Coins,
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
  runStudentLoanCalculation,
  StudentLoanInputs,
} from "@/lib/student-loan-calculator";
import { SUPPORT_URL } from "@/lib/constants";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

const STUDENT_LOAN_CITATIONS: CitationItem[] = [
  {
    act: "Education (Student Loans) (Repayment) Regulations 2009",
    section: "Statutory Instrument 2009/470 (as amended)",
    description: "Statutory basis for income-contingent deductions: 9% calculated strictly on earnings exceeding the repayment threshold via HMRC PAYE.",
    govUrl: "https://www.legislation.gov.uk/uksi/2009/470/contents/made",
  },
  {
    act: "Higher Education and Research Act 2017",
    description: "Defines Plan 2 repayment terms (£27,295 statutory threshold, RPI to RPI+3% interest rate scale, and complete debt cancellation after 30 years).",
    govUrl: "https://www.gov.uk/repaying-your-student-loan/which-repayment-plan-you-are-on",
  },
  {
    act: "The Student Loans (Repayment) (Amendment) Regulations 2023",
    description: "Enacts Plan 5 for students starting August 2023 onwards: £25,000 threshold frozen until 2027, RPI-only interest, and 40-year statutory cancellation horizon.",
    govUrl: "https://www.gov.uk/government/publications/student-loans-a-guide-to-terms-and-conditions",
  },
  {
    act: "FCA Handbook: Mortgage Conduct of Business (MCOB)",
    section: "MCOB 11.6 (Assessing Affordability)",
    description: "Requires UK mortgage lenders to factor mandatory monthly student loan deductions as committed expenditure, directly restricting borrowing capacity.",
    govUrl: "https://www.handbook.fca.org.uk/handbook/MCOB/11/6.html",
  },
];

const STUDENT_LOAN_CHECKLIST: ChecklistItem[] = [
  {
    id: "slc-plan-verify",
    stepNumber: 1,
    title: "Verify Exact Loan Plan & Balance on SLC Portal",
    detail: "Sign in to your Student Loans Company (SLC) online account to record exact outstanding balance and verify whether you are on Plan 1, Plan 2, Plan 4, or Plan 5.",
    actionTag: "SLC Portal",
  },
  {
    id: "write-off-date",
    stepNumber: 2,
    title: "Note Statutory Debt Cancellation Horizon",
    detail: "Mark your statutory write-off date (e.g. 30 years after graduation for Plan 2, 40 years for Plan 5). If career earnings won't repay it in full, any voluntary payment is wasted money.",
    actionTag: "Statutory Wipeout",
  },
  {
    id: "opp-cost-isa",
    stepNumber: 3,
    title: "Redirect Overpayment Cash into Stocks & Shares ISA",
    detail: "Rather than voluntarily overpaying a loan that will be forgiven, compound extra savings inside a tax-free Stocks & Shares ISA for your house deposit or emergency fund.",
    actionTag: "Wealth Strategy",
  },
  {
    id: "mortgage-stress",
    stepNumber: 4,
    title: "Stress Test Mortgage Borrowing Capacity",
    detail: "Account for your monthly 9% PAYE student loan deduction in lender affordability calculators; it reduces maximum mortgage borrowing by approx 4.5x the annual repayment.",
    actionTag: "Borrowing Impact",
  },
  {
    id: "p60-audit",
    stepNumber: 5,
    title: "Perform Annual P60 & Deduction Audit",
    detail: "Cross-check your annual P60 with SLC statements to ensure payroll deductions match your gross pay and prevent over-deductions in the final repayment year.",
    actionTag: "PAYE Integrity",
  },
];

export default function StudentLoanPage() {
  const [salary, setSalary] = useState(38000);
  const [balance, setBalance] = useState(48000);
  const [plan, setPlan] = useState<"PLAN_2" | "PLAN_5" | "POSTGRAD" | "PLAN_1">("PLAN_2");
  const [growth, setGrowth] = useState(4.0);
  const rpi = 3.0;
  const [yearsElapsed, setYearsElapsed] = useState(3);
  const [overpay, setOverpay] = useState(0);

  const [donationDismissed, setDonationDismissed] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const inputs: StudentLoanInputs = useMemo(
    () => ({
      currentSalary: salary,
      currentLoanBalance: balance,
      loanPlan: plan,
      annualSalaryGrowthPercent: growth,
      assumedRpiPercent: rpi,
      yearsSinceGraduation: yearsElapsed,
      voluntaryMonthlyOverpayment: overpay,
    }),
    [salary, balance, plan, growth, rpi, yearsElapsed, overpay]
  );

  const results = useMemo(() => runStudentLoanCalculation(inputs), [inputs]);

  const applyPreset = (
    salVal: number,
    balVal: number,
    planVal: "PLAN_2" | "PLAN_5" | "POSTGRAD" | "PLAN_1",
    growthVal: number
  ) => {
    setSalary(salVal);
    setBalance(balVal);
    setPlan(planVal);
    setGrowth(growthVal);
    setOverpay(0);
  };

  const isDoNotOverpay = results.verdict === "DO_NOT_OVERPAY";

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Dismissible Donation Banner */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            👋 <strong>LadderPass Student Loan is 100% free with no paywalls.</strong> If this mathematical projection gives you clarity on your repayments and mortgage borrowing capacity, consider{" "}
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="donation-banner__link">
              buying me a coffee
            </a>{" "}
            to support independent UK tools!
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
        <div className="hero-pill" style={{ background: "var(--secondary-light)", color: "var(--secondary)", border: "1px solid var(--secondary-border)" }}>
          <GraduationCap size={14} />
          <span>UK Graduate Tax & Lifetime Loan Modeler</span>
        </div>
        <h1 className="hero-title">
          Student Loan Repayment vs. &ldquo;Graduate Tax&rdquo; Reality
        </h1>
        <p className="hero-description">
          Over 70% of UK Plan 2 graduates will <strong>never clear their student loan balance</strong> before the 30-year cancellation clock expires. Find out if making voluntary overpayments saves money or wastes cash that will otherwise be wiped clean.
        </p>

        {/* Quick Career Presets */}
        <div className="persona-presets-wrap">
          <span className="persona-label">Career Benchmarks:</span>
          <div className="persona-chips">
            <button
              onClick={() => applyPreset(32000, 52000, "PLAN_2", 3.5)}
              className={`persona-chip ${salary === 32000 && plan === "PLAN_2" ? "active" : ""}`}
            >
              <span>Typical Plan 2 Grad (£32k, £52k Debt)</span>
            </button>
            <button
              onClick={() => applyPreset(72000, 36000, "PLAN_2", 5.5)}
              className={`persona-chip ${salary === 72000 && plan === "PLAN_2" ? "active" : ""}`}
            >
              <span>High Earner (£72k, Fast Payoff)</span>
            </button>
            <button
              onClick={() => applyPreset(29000, 48000, "PLAN_5", 3.8)}
              className={`persona-chip ${salary === 29000 && plan === "PLAN_5" ? "active" : ""}`}
            >
              <span>Plan 5 Post-2023 Grad (40y Horizon)</span>
            </button>
            <button
              onClick={() => applyPreset(45000, 14000, "POSTGRAD", 4.0)}
              className={`persona-chip ${salary === 45000 && plan === "POSTGRAD" ? "active" : ""}`}
            >
              <span>Postgrad Master&apos;s Loan (£45k, 6%)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Verdict Banner */}
      <div className={`verdict-banner ${isDoNotOverpay ? "rent-wins" : "buy-wins"}`}>
        <div className="verdict-header">
          <div>
            <div className={`verdict-badge ${isDoNotOverpay ? "rent" : "buy"}`}>
              {isDoNotOverpay ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
              <span>
                {isDoNotOverpay
                  ? `Definitive Verdict: Do Not Overpay (Debt Wiped Out)`
                  : `Verdict: Voluntary Overpaying May Save ${formatGBP(results.interestSavedViaOverpay)}`}
              </span>
            </div>

            <h2 className="verdict-headline">
              {isDoNotOverpay
                ? `You are projected to have ${formatGBP(results.debtWipedOutStandard)} in student debt cancelled.`
                : `You will clear your loan in ${results.yearsToPayOffStandard} years under your salary trajectory.`}
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
              <span>Generate Loan Dossier</span>
            </button>
            <button
              onClick={() => setShowBrokerModal(true)}
              className="share-nav-btn"
              style={{ padding: "10px 14px" }}
            >
              <Scale size={15} />
              <span>Mortgage Borrowing Impact</span>
            </button>
          </div>
        </div>

        {/* 4 Core Loan Metric Cards */}
        <div className="verdict-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Current Monthly Deduction</span>
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--tertiary)" }}>
              {formatGBP(results.currentMonthlyRepayment)}/mo
            </span>
            <span className="metric-subtext">Automatically deducted from salary</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Projected Debt Cancelled</span>
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.debtWipedOutStandard)}
            </span>
            <span className="metric-subtext">Statutory write-off at year 30/40</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Total Lifetime Paid</span>
            <span className="metric-value tabular-nums">
              {formatGBP(results.totalLifetimePaidStandard)}
            </span>
            <span className="metric-subtext">Principal + Accrued Interest</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Mortgage Borrowing Drag</span>
            <span className="metric-value tabular-nums" style={{ color: "var(--tertiary)" }}>
              -{formatGBP(results.estimatedMortgageBorrowingReductionGbp)}
            </span>
            <span className="metric-subtext">Lender affordability reduction</span>
          </div>
        </div>
      </div>

      {/* Market Leader Editorial Callout: Martin's Rule of Thumb for Student Loans */}
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
          <strong style={{ color: "var(--text-primary)" }}>Martin&apos;s Rule of Thumb on UK Student Loans (It Is a 9% Graduate Tax): </strong>
          <span style={{ color: "var(--text-secondary)" }}>
            Treat your student loan as a 9% graduate tax above the statutory threshold (£27,295 on Plan 2, £25,000 on Plan 5), NOT as commercial debt. Any remaining balance wipes completely clean after 30 years (Plan 2) or 40 years (Plan 5) regardless of interest accumulated. Overpaying is only financially rational for career high-flyers who are mathematically certain to clear the debt before the wipeout clock expires. For everyone else, keep the cash for your house deposit or pension.
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
              <h2 className="panel-title">Loan & Career Parameters</h2>
            </div>
            <button
              onClick={() => {
                setSalary(38000);
                setBalance(48000);
                setPlan("PLAN_2");
              }}
              className="reset-btn"
            >
              Reset
            </button>
          </div>

          {/* Current Salary Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="salary" className="control-label">Current Annual Gross Salary</label>
              <span className="control-value-badge">{formatGBP(salary)}</span>
            </div>
            <input
              id="salary"
              type="range"
              min="20000"
              max="150000"
              step="1000"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£20k</span>
              <span>£50k</span>
              <span>£100k</span>
              <span>£150k</span>
            </div>
          </div>

          {/* Outstanding Balance Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="balance" className="control-label">Current Loan Balance</label>
              <span className="control-value-badge">{formatGBP(balance)}</span>
            </div>
            <input
              id="balance"
              type="range"
              min="5000"
              max="95000"
              step="1000"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£5k</span>
              <span>£25k</span>
              <span>£50k (Avg)</span>
              <span>£95k</span>
            </div>
          </div>

          {/* Plan Selector */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label className="control-label">Student Loan Plan</label>
              <span className="control-value-badge">{plan}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
              {[
                { id: "PLAN_2", name: "Plan 2 (2012–2023)" },
                { id: "PLAN_5", name: "Plan 5 (Post-2023)" },
                { id: "POSTGRAD", name: "Postgraduate (6%)" },
                { id: "PLAN_1", name: "Plan 1 (Pre-2012)" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id as "PLAN_2" | "PLAN_5" | "POSTGRAD" | "PLAN_1")}
                  style={{
                    padding: "8px",
                    borderRadius: "var(--round-md)",
                    border: "1px solid",
                    borderColor: plan === p.id ? "var(--primary)" : "var(--surface-border)",
                    background: plan === p.id ? "var(--primary-light)" : "var(--surface)",
                    color: plan === p.id ? "var(--primary)" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Annual Wage Growth Slider */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="growth" className="control-label">Expected Annual Wage Growth</label>
              <span className="control-value-badge">{growth}%/year</span>
            </div>
            <input
              id="growth"
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={growth}
              onChange={(e) => setGrowth(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>1%</span>
              <span>3%</span>
              <span>5% (Typical)</span>
              <span>8%</span>
            </div>
            <span className="control-help">
              Blends general inflation (e.g. 2.5%) plus career promotion increases.
            </span>
          </div>

          {/* Voluntary Overpayment Slider */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div className="control-label-wrap">
              <label htmlFor="overpay" className="control-label">Optional Monthly Overpayment</label>
              <span className="control-value-badge" style={{ color: "var(--accent-green)", background: "rgba(16, 185, 129, 0.1)" }}>
                {formatGBP(overpay)}/mo
              </span>
            </div>
            <input
              id="overpay"
              type="range"
              min="0"
              max="600"
              step="25"
              value={overpay}
              onChange={(e) => setOverpay(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£0</span>
              <span>£150</span>
              <span>£300</span>
              <span>£600</span>
            </div>
            <span className="control-help">
              Test whether extra monthly payments save interest or are wasted.
            </span>
          </div>

          {/* Years Elapsed */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="yearsElapsed" className="control-label">Years Elapsed Since Graduation</label>
              <span className="control-value-badge">{yearsElapsed} years</span>
            </div>
            <input
              id="yearsElapsed"
              type="range"
              min="0"
              max="20"
              step="1"
              value={yearsElapsed}
              onChange={(e) => setYearsElapsed(Number(e.target.value))}
              className="slider"
            />
          </div>
        </aside>

        {/* Right Column: Multi-Year Projection Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Coins size={18} style={{ color: "var(--primary)" }} />
              <span>Multi-Year Student Loan Trajectory Simulation</span>
            </h3>

            <div style={{ overflowX: "auto", maxHeight: 420 }}>
              <table className="tabular-nums editorial-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", color: "var(--text-muted)" }}>Year</th>
                    <th style={{ padding: "8px 10px" }}>Salary</th>
                    <th style={{ padding: "8px 10px" }}>Starting Debt</th>
                    <th style={{ padding: "8px 10px" }}>Interest Rate</th>
                    <th style={{ padding: "8px 10px" }}>Interest Added</th>
                    <th style={{ padding: "8px 10px", color: "var(--tertiary)" }}>Mandatory Repaid</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Ending Debt</th>
                  </tr>
                </thead>
                <tbody>
                  {results.projectionsStandard.map((row) => (
                    <tr
                      key={row.year}
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        background: row.isWrittenOff ? "var(--primary-light)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>
                        Year {row.year} {row.isWrittenOff && "🎉 Wiped Out"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.salary)}</td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.startingBalance)}</td>
                      <td style={{ padding: "8px 10px" }}>{row.interestRatePercent}%</td>
                      <td style={{ padding: "8px 10px", color: "var(--tertiary)" }}>+{formatGBP(row.interestAccrued)}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700 }}>-{formatGBP(row.mandatoryRepayment)}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 800 }}>
                        {row.isWrittenOff ? "£0 (Cancelled)" : formatGBP(row.endingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mortgage Affordability Guidance */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <Scale size={18} style={{ color: "var(--primary)" }} />
              <span>How Student Loans Impact Your Mortgage Affordability</span>
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              In the UK, student loans do not appear on credit files as negative debt, but your <strong>{formatGBP(results.currentMonthlyRepayment)} monthly deduction</strong> directly lowers your net disposable income in lender affordability models. For a typical high-street mortgage, this reduces your maximum borrowing limit by approximately <strong>{formatGBP(results.estimatedMortgageBorrowingReductionGbp)}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Statutory Sources & Mathematical Methodology (IFS / FT Style) */}
      <StatutoryMethodology
        moduleTitle="Student Loan Repayment & Mortgage Affordability"
        formulaDescription="Simulates statutory income-contingent repayments (9% on earnings above Plan 2 £27,295 and Plan 5 £25,000), monthly compounding interest based on prevailing RPI, 30y/40y statutory debt cancellation horizons, and impact on FCA borrowing capacity (approx 4.5x annual repayments)."
        citations={STUDENT_LOAN_CITATIONS}
        defaultOpen={false}
      />

      {/* Interactive Graduate Loan Checklist (Which? & MSE Style) */}
      <ActionChecklist
        id="student-loan"
        title="Graduate Student Loan & Mortgage Affordability Checklist"
        subtitle="5 bounded steps to avoid wasteful overpayments and optimize mortgage borrowing capacity"
        items={STUDENT_LOAN_CHECKLIST}
      />

      {/* Graduate Mortgage Borrowing Review Modal */}
      <ConsultationModal
        isOpen={showBrokerModal}
        onClose={() => setShowBrokerModal(false)}
        context="STUDENT_LOAN"
        propertyPrice={salary * 4.5}
        customMetrics={{
          primaryLabel: "Annual Gross Salary",
          primaryValue: formatGBP(salary),
          primarySub: plan.replace("_", " "),
          secondaryLabel: "Current Loan Balance",
          secondaryValue: formatGBP(balance),
          secondarySub: `Growth: +${growth}%/yr`,
          tertiaryLabel: "Monthly Deductions",
          tertiaryValue: `${formatGBP(results.currentMonthlyRepayment)}/mo`,
          tertiarySub: "Automatic PAYE",
          quaternaryLabel: "Estimated Debt Cancelled",
          quaternaryValue: formatGBP(results.debtWipedOutStandard),
          quaternarySub: isDoNotOverpay ? "Wipeout expected" : "Full payoff",
        }}
      />

      {/* Institutional Printable Student Loan Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        title="UK Student Loan Repayment & Affordability Dossier"
        subtitle="Plan 2 vs Plan 5 statutory debt write-off analysis and FCA mortgage borrowing impact"
        badge={isDoNotOverpay ? "Statutory Wipeout Projected" : "Full Payoff Expected"}
        metrics={[
          { label: "Gross Salary", value: formatGBP(salary), sub: plan.replace("_", " ") },
          { label: "Loan Balance", value: formatGBP(balance), sub: `Plan: ${plan.replace("_", " ")}` },
          { label: "Monthly Repayment", value: `${formatGBP(results.currentMonthlyRepayment)}/mo`, sub: "Automatic 9% PAYE" },
          { label: "Statutory Debt Cancelled", value: formatGBP(results.debtWipedOutStandard), sub: isDoNotOverpay ? "Projected debt write-off" : "Full payoff" },
        ]}
        summaryParagraph={results.verdictReasoning}
        breakdownTable={{
          headers: ["Year", "Projected Salary", "Mandatory Repayment", "Interest Accrued", "Year-End Balance"],
          rows: results.projectionsStandard.slice(0, 15).map((row) => [
            `Year ${row.year}`,
            formatGBP(row.salary),
            formatGBP(row.mandatoryRepayment),
            formatGBP(row.interestAccrued),
            row.isWrittenOff ? "£0 (Wiped Out)" : formatGBP(row.endingBalance),
          ]),
        }}
        statutoryCitations={STUDENT_LOAN_CITATIONS.map((c) => ({ act: c.act, description: c.description }))}
        csvFilename="ladderpass_student_loan_audit"
      />

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
