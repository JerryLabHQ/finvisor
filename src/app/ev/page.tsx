"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  Sliders,
  Sparkles,
  FileText,
  Shield,
  Coins,
  CheckCircle,
  Car,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import {
  runEVCalculation,
  EVInputs,
} from "@/lib/ev-calculator";
import { SUPPORT_URL } from "@/lib/constants";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export default function EVPage() {
  const [p11d, setP11d] = useState(48000);
  const [grossLease, setGrossLease] = useState(650);
  const [salary, setSalary] = useState(85000);
  const [mileage, setMileage] = useState(10000);
  const [homePercent, setHomePercent] = useState(80);
  const [hasSmartTariff, setHasSmartTariff] = useState(true);
  const [petrolFuel, setPetrolFuel] = useState(160);
  const petrolInsurance = 65;
  const petrolMaint = 45;

  const [donationDismissed, setDonationDismissed] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [brokerSubmitted, setBrokerSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const inputs: EVInputs = useMemo(
    () => ({
      vehicleP11DValue: p11d,
      grossMonthlyLease: grossLease,
      grossAnnualSalary: salary,
      annualMileage: mileage,
      homeChargingPercent: homePercent,
      hasSmartEVTariff: hasSmartTariff,
      currentCarMonthlyFuel: petrolFuel,
      currentCarMonthlyInsurance: petrolInsurance,
      currentCarMonthlyMaintenance: petrolMaint,
    }),
    [p11d, grossLease, salary, mileage, homePercent, hasSmartTariff, petrolFuel, petrolInsurance, petrolMaint]
  );

  const results = useMemo(() => runEVCalculation(inputs), [inputs]);

  const applyCarPreset = (p11dVal: number, leaseVal: number) => {
    setP11d(p11dVal);
    setGrossLease(leaseVal);
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
          buyerType: "EV_SALARY_SACRIFICE",
          propertyPrice: p11d,
          depositPercent: 15,
          buyingTimeline: "IMMEDIATE_3M",
        }),
      });
      setBrokerSubmitted(true);
    } catch {
      setBrokerSubmitted(true);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Dismissible Donation Banner */}
      {!donationDismissed && SUPPORT_URL && (
        <div className="donation-banner" role="note">
          <span className="donation-banner__text">
            👋 <strong>LadderPass EV is 100% free with no car dealer bias or tracking cookies.</strong> If this comparison helps you save hundreds of pounds each month, consider{" "}
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
        <div className="hero-pill" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-green)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <Zap size={14} />
          <span>UK Electric Vehicle Financial Strategy</span>
        </div>
        <h1 className="hero-title">
          EV Salary Sacrifice vs. PCP vs. Buying vs. Petrol
        </h1>
        <p className="hero-description">
          In the UK, employer EV salary sacrifice allows you to pay for a brand-new electric car out of <strong>pre-tax salary</strong> (saving 42%–62% in Income Tax and NI) while paying only 2%–5% Benefit-in-Kind tax. Compare all four routes side-by-side with real charging rates.
        </p>

        {/* Popular EV Presets */}
        <div className="persona-presets-wrap">
          <span className="persona-label">Popular UK Models:</span>
          <div className="persona-chips">
            <button
              onClick={() => applyCarPreset(48000, 650)}
              className={`persona-chip ${p11d === 48000 ? "active" : ""}`}
            >
              <span>Tesla Model Y Long Range (£48k)</span>
            </button>
            <button
              onClick={() => applyCarPreset(49500, 670)}
              className={`persona-chip ${p11d === 49500 ? "active" : ""}`}
            >
              <span>Kia EV6 GT-Line (£49.5k)</span>
            </button>
            <button
              onClick={() => applyCarPreset(53000, 710)}
              className={`persona-chip ${p11d === 53000 ? "active" : ""}`}
            >
              <span>Audi Q4 e-tron (£53k)</span>
            </button>
            <button
              onClick={() => applyCarPreset(29000, 390)}
              className={`persona-chip ${p11d === 29000 ? "active" : ""}`}
            >
              <span>MG4 EV Long Range (£29k)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main KPI Verdict Banner */}
      <div className="verdict-banner buy-wins">
        <div className="verdict-header">
          <div>
            <div className="verdict-badge buy">
              <Sparkles size={14} />
              <span>Verdict: Salary Sacrifice Saves {formatGBP(results.monthlySavingsVsPcp)}/Month vs. Private PCP</span>
            </div>

            <h2 className="verdict-headline">
              Drive a {formatGBP(p11d)} EV for {formatGBP(results.salarySacrificeOption.netTotalMonthlyCost)}/month (All-Inclusive).
            </h2>

            <p className="verdict-summary">
              Because of your {results.effectiveEmployeeTaxRatePercent}% marginal tax relief, your gross {formatGBP(grossLease)} lease only costs {formatGBP(results.salarySacrificeOption.netTotalMonthlyCost - results.salarySacrificeOption.monthlyFuelCost)} out of your take-home pay, including full comprehensive insurance, tyres, and servicing.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", alignSelf: "center" }}>
            <button
              onClick={handlePrint}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Print EV Report</span>
            </button>
            <button
              onClick={() => setShowBrokerModal(true)}
              className="share-nav-btn"
              style={{ padding: "10px 14px" }}
            >
              <Car size={15} />
              <span>Compare Provider Quotes</span>
            </button>
          </div>
        </div>

        {/* 4 Core EV Metric Cards */}
        <div className="verdict-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Net SalSac Monthly Cost</span>
            <span className="metric-value highlight" style={{ color: "var(--accent-green)" }}>
              {formatGBP(results.salarySacrificeOption.netTotalMonthlyCost)}
            </span>
            <span className="metric-subtext">Vehicle + Insurance + Fuel</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Monthly Tax Relief</span>
            <span className="metric-value highlight">
              {formatGBP(results.salarySacrificeOption.monthlyTaxRelief)}
            </span>
            <span className="metric-subtext">Income Tax & NI deducted</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Monthly Savings vs PCP</span>
            <span className="metric-value" style={{ color: "var(--primary)" }}>
              {formatGBP(results.monthlySavingsVsPcp)}/mo
            </span>
            <span className="metric-subtext">Save {formatGBP(results.monthlySavingsVsPcp * 36)} over 3 years</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Annual Fuel Savings</span>
            <span className="metric-value" style={{ color: "var(--accent-green)" }}>
              {formatGBP(results.fuelSavingsAnnual)}
            </span>
            <span className="metric-subtext">7p/kWh Home Charging vs Petrol</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls vs Comparison */}
      <div className="main-grid">
        {/* Left Column: Sliders */}
        <aside className="controls-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <Sliders size={18} />
              <h2 className="panel-title">Vehicle & Tax Parameters</h2>
            </div>
            <button
              onClick={() => {
                setP11d(48000);
                setGrossLease(650);
                setSalary(85000);
              }}
              className="reset-btn"
            >
              Reset
            </button>
          </div>

          {/* Vehicle P11D Value */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="p11d" className="control-label">Vehicle P11D Retail Price</label>
              <span className="control-value-badge">{formatGBP(p11d)}</span>
            </div>
            <input
              id="p11d"
              type="range"
              min="25000"
              max="95000"
              step="1000"
              value={p11d}
              onChange={(e) => setP11d(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£25k</span>
              <span>£50k</span>
              <span>£75k</span>
              <span>£95k</span>
            </div>
          </div>

          {/* Gross Monthly Lease Quote */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="grossLease" className="control-label">Gross Monthly Lease Quote</label>
              <span className="control-value-badge">{formatGBP(grossLease)}/mo</span>
            </div>
            <input
              id="grossLease"
              type="range"
              min="300"
              max="1400"
              step="20"
              value={grossLease}
              onChange={(e) => setGrossLease(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£300</span>
              <span>£650</span>
              <span>£1,000</span>
              <span>£1,400</span>
            </div>
            <span className="control-help">
              Typically includes full comprehensive insurance, tyres, and annual maintenance.
            </span>
          </div>

          {/* Annual Salary */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="salary" className="control-label">Your Annual Gross Salary</label>
              <span className="control-value-badge">{formatGBP(salary)}</span>
            </div>
            <input
              id="salary"
              type="range"
              min="30000"
              max="180000"
              step="2000"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
              className="slider"
            />
            <div className="slider-ticks">
              <span>£30k</span>
              <span>£50k (Higher)</span>
              <span>£100k (Trap)</span>
              <span>£180k</span>
            </div>
          </div>

          {/* Mileage & Charging Options */}
          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="mileage" className="control-label">Annual Mileage</label>
              <span className="control-value-badge">{mileage.toLocaleString()} miles</span>
            </div>
            <input
              id="mileage"
              type="range"
              min="5000"
              max="25000"
              step="1000"
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <div className="control-label-wrap">
              <label htmlFor="homePercent" className="control-label">Home Charging vs Public Rapid</label>
              <span className="control-value-badge">{homePercent}% Home</span>
            </div>
            <input
              id="homePercent"
              type="range"
              min="20"
              max="100"
              step="10"
              value={homePercent}
              onChange={(e) => setHomePercent(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Smart EV Off-Peak Tariff (7p/kWh)</span>
              <input
                type="checkbox"
                checked={hasSmartTariff}
                onChange={(e) => setHasSmartTariff(e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
            </div>
            <span className="control-help">e.g. Octopus Intelligent Go or OVO Charge Anytime.</span>
          </div>

          {/* Current Petrol Car Upkeep */}
          <div className="control-group" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 14 }}>
            <div className="control-label-wrap">
              <label htmlFor="petrolFuel" className="control-label">Current Monthly Petrol / Diesel Spend</label>
              <span className="control-value-badge">{formatGBP(petrolFuel)}</span>
            </div>
            <input
              id="petrolFuel"
              type="range"
              min="50"
              max="400"
              step="10"
              value={petrolFuel}
              onChange={(e) => setPetrolFuel(Number(e.target.value))}
              className="slider"
            />
          </div>
        </aside>

        {/* Right Column: 4-Way Comparison Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Coins size={18} style={{ color: "var(--primary)" }} />
              <span>4-Way Monthly Cost Breakdown (Vehicle + Fuel + Maintenance)</span>
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Component</th>
                    <th style={{ padding: "8px 12px", color: "var(--accent-green)", fontWeight: 700 }}>1. Salary Sacrifice</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-primary)" }}>2. Private PCP</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-primary)" }}>3. Cash Purchase</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-secondary)" }}>4. Keep Petrol</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Vehicle Payment / Depreciation</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.salarySacrificeOption.monthlyVehicleCost)} (Gross)</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.pcpOption.monthlyVehicleCost)}</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.cashPurchaseOption.monthlyVehicleCost)}</td>
                    <td style={{ padding: "10px 12px" }}>£0 (Owned)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Income Tax & NI Relief</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)", fontWeight: 700 }}>-{formatGBP(results.salarySacrificeOption.monthlyTaxRelief)}</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>HMRC Benefit-in-Kind (BiK) Tax</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)" }}>+{formatGBP(results.salarySacrificeOption.monthlyBikTax)}</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Monthly Fuel / Charging</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.salarySacrificeOption.monthlyFuelCost)}</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.pcpOption.monthlyFuelCost)}</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.cashPurchaseOption.monthlyFuelCost)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-red)" }}>{formatGBP(results.petrolStatusQuoOption.monthlyFuelCost)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Insurance, Servicing & Tyres</td>
                    <td style={{ padding: "10px 12px", color: "var(--accent-green)", fontWeight: 700 }}>£0 (Included)</td>
                    <td style={{ padding: "10px 12px" }}>+{formatGBP(results.pcpOption.monthlyInsuranceAndUpkeep)}</td>
                    <td style={{ padding: "10px 12px" }}>+{formatGBP(results.cashPurchaseOption.monthlyInsuranceAndUpkeep)}</td>
                    <td style={{ padding: "10px 12px" }}>+{formatGBP(results.petrolStatusQuoOption.monthlyInsuranceAndUpkeep)}</td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", background: "var(--surface-tray)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Total Net Out-of-Pocket / Month</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--accent-green)", fontSize: 15 }}>
                      {formatGBP(results.salarySacrificeOption.netTotalMonthlyCost)}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.pcpOption.netTotalMonthlyCost)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.cashPurchaseOption.netTotalMonthlyCost)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.petrolStatusQuoOption.netTotalMonthlyCost)}</td>
                  </tr>
                  <tr style={{ background: "rgba(16, 185, 129, 0.05)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Total 3-Year Cost (incl. Deposit)</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--accent-green)" }}>
                      {formatGBP(results.salarySacrificeOption.total3YearSpend)}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.pcpOption.total3YearSpend)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.cashPurchaseOption.total3YearSpend)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.petrolStatusQuoOption.total3YearSpend)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Advantages Card */}
          <div className="glass-panel" style={{ padding: 24, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Why Salary Sacrifice Works So Well in the UK
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <CheckCircle size={18} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13 }}>
                  <strong>Gross Tax Deduction:</strong> Payments come out before income tax and National Insurance, saving 42% for higher-rate taxpayers and 62% for £100k+ earners.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <CheckCircle size={18} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13 }}>
                  <strong>Zero Upfront Deposit:</strong> Unlike private PCP deals requiring £2,000–£5,000 upfront, most corporate salary sacrifice schemes have £0 initial deposit.
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <CheckCircle size={18} style={{ color: "var(--accent-green)", flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13 }}>
                  <strong>True All-Inclusive:</strong> Comprehensive insurance, routine servicing, breakdown recovery, and replacement tyres are fully bundled.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Inquiry Modal */}
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
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Provider Quotes Requested</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>
                  We are matching your criteria with leading UK salary sacrifice fleet providers (e.g. Octopus EV, The Electric Car Scheme). You will receive verified quote comparisons.
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
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Compare UK Salary Sacrifice Providers</h3>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
                  Whether your company already has an EV scheme or you want to introduce one to your HR/Finance team, get whole-of-market vehicle lease quotes.
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
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Work Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)", background: "var(--surface-tray)", color: "var(--text-primary)", marginTop: 4 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600 }}>Employer / Company Name</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Tech Ltd"
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
                    Get Free Provider Comparisons
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
