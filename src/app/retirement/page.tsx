"use client";

import React, { useState, useMemo } from "react";
import {
  Coins,
  Sliders,
  Sparkles,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import {
  runPensionCalculation,
  PensionInputs,
} from "@/lib/pension-calculator";
import { SUPPORT_URL } from "@/lib/constants";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export default function RetirementPage() {
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

  const [donationDismissed, setDonationDismissed] = useState(false);
  const [showIfaModal, setShowIfaModal] = useState(false);
  const [ifaSubmitted, setIfaSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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
          name,
          email,
          phone,
          buyerType: "RETIREMENT_PLANNING",
          propertyPrice: pensionPot,
          depositPercent: 20,
          buyingTimeline: "IMMEDIATE_3M",
        }),
      });
      setIfaSubmitted(true);
    } catch {
      setIfaSubmitted(true);
    }
  };

  const isSustainable = results.verdict === "SUSTAINABLE_DRAWDOWN";

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Dismissible Donation Banner */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            👋 <strong>LadderPass Retirement is 100% free with no sales calls or commission bias.</strong> If this drawdown and 2027 IHT simulation helps you plan your financial independence, consider{" "}
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
              onClick={handlePrint}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Print Retirement Plan</span>
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
            <span className="metric-value highlight" style={{ color: results.initialDrawdownRatePercent <= 4.0 ? "var(--accent-green)" : "var(--accent-red)" }}>
              {results.initialDrawdownRatePercent}%
            </span>
            <span className="metric-subtext">UK Safe Withdrawal Benchmark: 3.8%</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">25% Tax-Free Lump Sum (PCLS)</span>
            <span className="metric-value highlight" style={{ color: "var(--accent-green)" }}>
              {formatGBP(results.pclsLumpSumTaken)}
            </span>
            <span className="metric-subtext">Capped at £268,275 statutory limit</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Guaranteed Lifetime Annuity</span>
            <span className="metric-value" style={{ color: "var(--primary)" }}>
              {formatGBP(results.guaranteedAnnuityAnnualIncome)}/yr
            </span>
            <span className="metric-subtext">Benchmark 6.5% level annuity rate</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Est. 2027 IHT Exposure</span>
            <span className="metric-value" style={{ color: results.estimatedPost2027IhtExposure > 0 ? "var(--accent-red)" : "var(--accent-green)" }}>
              {formatGBP(results.estimatedPost2027IhtExposure)}
            </span>
            <span className="metric-subtext">40% IHT on unspent pension</span>
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
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", color: "var(--text-muted)" }}>Age</th>
                    <th style={{ padding: "8px 10px" }}>Starting SIPP</th>
                    <th style={{ padding: "8px 10px" }}>Starting ISA</th>
                    <th style={{ padding: "8px 10px", color: "var(--accent-green)" }}>State Pension</th>
                    <th style={{ padding: "8px 10px", color: "var(--accent-red)" }}>SIPP Drawdown</th>
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
                        background: row.isPotDepleted ? "rgba(239, 68, 68, 0.08)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "8px 10px", fontWeight: 700 }}>
                        Age {row.age} {row.isPotDepleted && "⚠️ Depleted"}
                      </td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.startingPensionPot)}</td>
                      <td style={{ padding: "8px 10px" }}>{formatGBP(row.startingIsaPot)}</td>
                      <td style={{ padding: "8px 10px", color: "var(--accent-green)" }}>
                        {row.statePensionReceived > 0 ? `+${formatGBP(row.statePensionReceived)}` : "—"}
                      </td>
                      <td style={{ padding: "8px 10px", color: "var(--accent-red)" }}>
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
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Retirement Specialist Assigned</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                  An FCA-authorised Independent Financial Adviser specializing in UK pension drawdown, annuities, and post-2027 IHT mitigation will contact you shortly.
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
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Connect with a Retirement IFA</h3>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Receive independent, whole-of-market advice on safe withdrawal rates, annuity quotes, and 2027 pension inheritance tax planning.
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
                    Request Free Pension Consultation
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
    </div>
  );
}
