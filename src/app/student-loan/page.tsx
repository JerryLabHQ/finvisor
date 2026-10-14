"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
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
import { Footer } from "@/components/Footer";
import {
  runStudentLoanCalculation,
  StudentLoanInputs,
} from "@/lib/student-loan-calculator";
import { SUPPORT_URL } from "@/lib/constants";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

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
  const [brokerSubmitted, setBrokerSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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
          buyerType: "FIRST_TIME_BUYER",
          propertyPrice: 350000,
          depositPercent: 15,
          buyingTimeline: "WITHIN_6M",
        }),
      });
      setBrokerSubmitted(true);
    } catch {
      setBrokerSubmitted(true);
    }
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
        <div className="hero-pill" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
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
              onClick={handlePrint}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Print Loan Report</span>
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
            <span className="metric-value highlight" style={{ color: "var(--accent-red)" }}>
              {formatGBP(results.currentMonthlyRepayment)}/mo
            </span>
            <span className="metric-subtext">Automatically deducted from salary</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Projected Debt Cancelled</span>
            <span className="metric-value highlight" style={{ color: "var(--accent-green)" }}>
              {formatGBP(results.debtWipedOutStandard)}
            </span>
            <span className="metric-subtext">Statutory write-off at year 30/40</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Total Lifetime Paid</span>
            <span className="metric-value">
              {formatGBP(results.totalLifetimePaidStandard)}
            </span>
            <span className="metric-subtext">Principal + Accrued Interest</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Mortgage Borrowing Drag</span>
            <span className="metric-value" style={{ color: "var(--accent-red)" }}>
              -{formatGBP(results.estimatedMortgageBorrowingReductionGbp)}
            </span>
            <span className="metric-subtext">Lender affordability reduction</span>
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
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", color: "var(--text-muted)" }}>Year</th>
                    <th style={{ padding: "8px 10px" }}>Salary</th>
                    <th style={{ padding: "8px 10px" }}>Starting Debt</th>
                    <th style={{ padding: "8px 10px" }}>Interest Rate</th>
                    <th style={{ padding: "8px 10px" }}>Interest Added</th>
                    <th style={{ padding: "8px 10px", color: "var(--accent-red)" }}>Mandatory Repaid</th>
                    <th style={{ padding: "8px 10px", fontWeight: 700 }}>Ending Debt</th>
                  </tr>
                </thead>
                <tbody>
                  {results.projectionsStandard.map((row) => (
                    <tr
                      key={row.year}
                      style={{
                        borderBottom: "1px solid var(--surface-border)",
                        background: row.isWrittenOff ? "rgba(16, 185, 129, 0.08)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px 10px", fontWeight: 600 }}>
                        Year {row.year} {row.isWrittenOff && "🎉 Wiped Out"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.salary)}</td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.startingBalance)}</td>
                      <td style={{ padding: "8px 10px" }}>{row.interestRatePercent}%</td>
                      <td style={{ padding: "8px 10px", color: "var(--accent-red)" }}>+{formatGBP(row.interestAccrued)}</td>
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

      {/* Broker Lead Modal */}
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
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Borrowing Assessment Requested</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                  An FCA-authorised mortgage broker will assess your borrowing capacity with high-street lenders who take a favorable approach to student loan deductions.
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
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Check Your Mortgage Affordability</h3>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Different UK lenders treat student loan repayments differently. Connect with a whole-of-market broker to maximize your borrowing capacity.
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
                    Assess My Mortgage Borrowing
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

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
