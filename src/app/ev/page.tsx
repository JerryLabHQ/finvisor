"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  Sliders,
  Sparkles,
  FileText,
  Coins,
  CheckCircle,
  Car,
  ShieldAlert,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ConsultationModal } from "@/components/ConsultationModal";
import { ExecutiveDossierModal } from "@/components/ExecutiveDossierModal";
import { StatutoryMethodology, CitationItem } from "@/components/StatutoryMethodology";
import { ActionChecklist, ChecklistItem } from "@/components/ActionChecklist";
import {
  runEVCalculation,
  EVInputs,
} from "@/lib/ev-calculator";
import { useFinancialProfile } from "@/lib/financial-profile-store";
import "../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

const EV_CITATIONS: CitationItem[] = [
  {
    act: "Income Tax (Earnings and Pensions) Act 2003 (ITEPA 2003)",
    section: "Sections 120-148 (Chapter 6: Cars and Vans)",
    description: "Statutory Benefit-in-Kind (BiK) framework assessing company car tax on the vehicle's published P11D list price multiplied by legislated CO2 emission bands.",
    govUrl: "https://www.legislation.gov.uk/ukpga/2003/1/part/3/chapter/6",
  },
  {
    act: "Finance Act 2024",
    section: "Company Car Tax Rates for Electric Vehicles",
    description: "Statutory BiK rates established by HM Treasury: 2% for 2024/25, rising by 1% annually to 3% (2025/26), 4% (2026/27), and 5% (2027/28).",
    govUrl: "https://www.gov.uk/guidance/company-car-benefit-in-kind-bik-rates",
  },
  {
    act: "Social Security Contributions and Benefits Act 1992",
    description: "Employer Class 1A National Insurance savings on pre-tax salary sacrifice deductions (13.8% rising to 15.0% post-April 2025) frequently passed back to employees.",
    govUrl: "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2024-to-2025",
  },
  {
    act: "Automated and Electric Vehicles Act 2018",
    description: "Regulations governing private electric vehicle chargepoints, smart metering interoperability, and access to domestic time-of-use tariffs.",
    govUrl: "https://www.legislation.gov.uk/ukpga/2018/18/contents",
  },
];

const EV_CHECKLIST: ChecklistItem[] = [
  {
    id: "scheme-eligibility",
    stepNumber: 1,
    title: "Verify Employer Scheme Eligibility",
    detail: "Confirm your employer offers an authorized salary sacrifice scheme (e.g. Octopus EV, Tusker, Zenith) and check your post-sacrifice salary remains above National Minimum Wage.",
    actionTag: "HR & Eligibility",
  },
  {
    id: "p11d-bik",
    stepNumber: 2,
    title: "Audit P11D Value & Monthly BiK Deductions",
    detail: "Verify the vehicle's exact P11D price to calculate your monthly Benefit-in-Kind tax liability at 2% (2024/25), 3% (2025/26), and 4% (2026/27).",
    actionTag: "HMRC Tax Check",
  },
  {
    id: "smart-charger",
    stepNumber: 3,
    title: "Install Home Smart Charger & Switch Tariff",
    detail: "Install a 7kW home charger and switch to a dedicated EV energy tariff (e.g. Octopus Intelligent Go at 7p/kWh off-peak) to cut fueling costs by up to 80% vs petrol.",
    actionTag: "Fuel Optimization",
  },
  {
    id: "all-inclusive-audit",
    stepNumber: 4,
    title: "Confirm All-Inclusive Inclusions",
    detail: "Ensure the lease quote includes fully comprehensive motor insurance, annual servicing, MOT, replacement premium tyres, and roadside breakdown assistance.",
    actionTag: "Contract Terms",
  },
  {
    id: "early-exit",
    stepNumber: 5,
    title: "Review Early Termination & Redundancy Cover",
    detail: "Examine policy terms regarding maternity/paternity leave, resignation, or involuntary redundancy to ensure employer scheme protection cushions early exit fees.",
    actionTag: "Risk Management",
  },
];

export default function EVPage() {
  const { updateProfile } = useFinancialProfile();
  const [p11d, setP11d] = useState(48000);
  const [grossLease, setGrossLease] = useState(650);
  const [salary, setSalary] = useState(85000);
  const [mileage, setMileage] = useState(10000);
  const [homePercent, setHomePercent] = useState(80);
  const [hasSmartTariff, setHasSmartTariff] = useState(true);
  const [petrolFuel, setPetrolFuel] = useState(160);
  const petrolInsurance = 65;
  const petrolMaint = 45;

  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  React.useEffect(() => {
    updateProfile({
      grossSalary: salary,
      evGrossLeaseMonthly: grossLease,
    });
  }, [salary, grossLease, updateProfile]);

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

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill" style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--primary-border)" }}>
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
              onClick={() => setIsDossierOpen(true)}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Generate EV Dossier</span>
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
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.salarySacrificeOption.netTotalMonthlyCost)}
            </span>
            <span className="metric-subtext">Vehicle + Insurance + Fuel</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Monthly Tax Relief</span>
            <span className="metric-value highlight tabular-nums">
              {formatGBP(results.salarySacrificeOption.monthlyTaxRelief)}
            </span>
            <span className="metric-subtext">Income Tax & NI deducted</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Monthly Savings vs PCP</span>
            <span className="metric-value tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.monthlySavingsVsPcp)}/mo
            </span>
            <span className="metric-subtext">Save {formatGBP(results.monthlySavingsVsPcp * 36)} over 3 years</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Annual Fuel Savings</span>
            <span className="metric-value tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.fuelSavingsAnnual)}
            </span>
            <span className="metric-subtext">7p/kWh Home Charging vs Petrol</span>
          </div>
        </div>
      </div>

      {/* Market Leader Editorial Callout: Martin's Rule of Thumb for Electric Vehicles */}
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
          <strong style={{ color: "var(--text-primary)" }}>Martin&apos;s Rule of Thumb for EV Drivers (The 2% BiK Arbitrage): </strong>
          <span style={{ color: "var(--text-secondary)" }}>
            Financing an electric car through a private PCP or personal bank loan uses post-tax income (costing £600–£800/mo net). With employer salary sacrifice, the gross lease is deducted from your pre-tax pay, slashing income tax and National Insurance liabilities. Even after HMRC Benefit-in-Kind (BiK) tax (currently 2%, stepping up to 5% by 2027/28), higher-rate taxpayers effectively receive a ~40% to 50% state-subsidized discount on a brand new EV.
          </span>
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
            <div className="slider-ticks">
              <span>5,000</span>
              <span>10,000 (UK Avg)</span>
              <span>15,000</span>
              <span>25,000</span>
            </div>
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
            <div className="slider-ticks">
              <span>20%</span>
              <span>50%</span>
              <span>80% (Typical)</span>
              <span>100% Home</span>
            </div>
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
              <table className="tabular-nums editorial-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Component</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)", fontWeight: 700 }}>1. Salary Sacrifice</th>
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
                    <td style={{ padding: "10px 12px", color: "var(--primary)", fontWeight: 700 }}>-{formatGBP(results.salarySacrificeOption.monthlyTaxRelief)}</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>HMRC Benefit-in-Kind (BiK) Tax</td>
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)" }}>+{formatGBP(results.salarySacrificeOption.monthlyBikTax)}</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                    <td style={{ padding: "10px 12px" }}>£0</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Monthly Fuel / Charging</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{formatGBP(results.salarySacrificeOption.monthlyFuelCost)}</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.pcpOption.monthlyFuelCost)}</td>
                    <td style={{ padding: "10px 12px" }}>{formatGBP(results.cashPurchaseOption.monthlyFuelCost)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)" }}>{formatGBP(results.petrolStatusQuoOption.monthlyFuelCost)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Insurance, Servicing & Tyres</td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)", fontWeight: 700 }}>£0 (Included)</td>
                    <td style={{ padding: "10px 12px" }}>+{formatGBP(results.pcpOption.monthlyInsuranceAndUpkeep)}</td>
                    <td style={{ padding: "10px 12px" }}>+{formatGBP(results.cashPurchaseOption.monthlyInsuranceAndUpkeep)}</td>
                    <td style={{ padding: "10px 12px" }}>+{formatGBP(results.petrolStatusQuoOption.monthlyInsuranceAndUpkeep)}</td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", background: "var(--surface-tray)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Total Net Out-of-Pocket / Month</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)", fontSize: 15 }}>
                      {formatGBP(results.salarySacrificeOption.netTotalMonthlyCost)}
                    </td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.pcpOption.netTotalMonthlyCost)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.cashPurchaseOption.netTotalMonthlyCost)}</td>
                    <td style={{ padding: "12px", fontWeight: 700 }}>{formatGBP(results.petrolStatusQuoOption.netTotalMonthlyCost)}</td>
                  </tr>
                  <tr style={{ background: "var(--primary-light)" }}>
                    <td style={{ padding: "12px", fontWeight: 800 }}>Total 3-Year Cost (incl. Deposit)</td>
                    <td style={{ padding: "12px", fontWeight: 800, color: "var(--primary)" }}>
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

      {/* Statutory Sources & Mathematical Methodology (IFS / FT Style) */}
      <StatutoryMethodology
        moduleTitle="EV Employer Salary Sacrifice vs Private PCP"
        formulaDescription="Models employer gross salary sacrifice deductions against personal income tax (20%, 40%, 45%), employee Class 1 National Insurance, HMRC legislated Benefit-in-Kind (2% to 5%), smart off-peak EV electricity tariffs (7p/kWh vs 28p/kWh peak), and all-inclusive maintenance packages."
        citations={EV_CITATIONS}
        defaultOpen={false}
      />

      {/* Interactive EV Salary Sacrifice Checklist (Which? & MSE Style) */}
      <ActionChecklist
        id="ev-mobility"
        title="EV Salary Sacrifice Order & Transition Checklist"
        subtitle="5 bounded statutory verification and home charging setup steps for UK drivers"
        items={EV_CHECKLIST}
      />

      {/* Fleet Provider & Salary Sacrifice Consultation Modal */}
      <ConsultationModal
        isOpen={showBrokerModal}
        onClose={() => setShowBrokerModal(false)}
        context="EV_SCHEME"
        propertyPrice={p11d}
        customMetrics={{
          primaryLabel: "Vehicle P11D Retail Value",
          primaryValue: formatGBP(p11d),
          primarySub: `Lease: ${formatGBP(grossLease)}/mo`,
          secondaryLabel: "Net SalSac Monthly Cost",
          secondaryValue: formatGBP(results.salarySacrificeOption.netTotalMonthlyCost),
          secondarySub: "All-inclusive",
          tertiaryLabel: "Monthly Tax & NI Saved",
          tertiaryValue: formatGBP(results.salarySacrificeOption.monthlyTaxRelief),
          tertiarySub: `${results.effectiveEmployeeTaxRatePercent}% marginal relief`,
          quaternaryLabel: "3-Year Savings vs. PCP",
          quaternaryValue: formatGBP(results.monthlySavingsVsPcp * 36),
          quaternarySub: `Save ${formatGBP(results.monthlySavingsVsPcp)}/mo`,
        }}
      />

      {/* Institutional Printable EV Salary Sacrifice Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        title="EV Salary Sacrifice Mobility Memorandum"
        subtitle="HMRC Benefit-in-Kind (BiK) company car tax arbitrage vs private PCP financing"
        badge={results.monthlySavingsVsPcp > 0 ? "Salary Sacrifice Beats Private PCP" : "PCP Comparison"}
        metrics={[
          { label: "Vehicle P11D Value", value: formatGBP(p11d), sub: `Gross Lease: ${formatGBP(grossLease)}/mo` },
          { label: "Net Monthly Cost", value: formatGBP(results.salarySacrificeOption.netTotalMonthlyCost), sub: "All-inclusive (vehicle, ins, fuel)" },
          { label: "Monthly Tax & NI Relief", value: formatGBP(results.salarySacrificeOption.monthlyTaxRelief), sub: `${results.effectiveEmployeeTaxRatePercent}% marginal relief` },
          { label: "3-Year Total Savings", value: formatGBP(results.monthlySavingsVsPcp * 36), sub: `Save ${formatGBP(results.monthlySavingsVsPcp)}/mo vs PCP` },
        ]}
        summaryParagraph={`By sacrificing gross pre-tax salary of ${formatGBP(grossLease)} per month, you reduce statutory income tax and employee National Insurance liability, saving ${formatGBP(results.salarySacrificeOption.monthlyTaxRelief)} every month. Adding monthly electricity (${formatGBP(results.salarySacrificeOption.monthlyFuelCost)} using smart off-peak tariffs) and BiK tax (${formatGBP(results.salarySacrificeOption.monthlyBikTax)}), total monthly mobility expenditure is ${formatGBP(results.salarySacrificeOption.netTotalMonthlyCost)}, saving ${formatGBP(results.monthlySavingsVsPcp)} every month compared to private PCP financing.`}
        breakdownTable={{
          headers: ["Ownership Route", "Monthly Vehicle / Lease", "Tax & NI Relief", "BiK / Insurance", "Fuel / Electricity", "Total Net Monthly", "3-Year Total Spend"],
          rows: [
            ["Employer Salary Sacrifice", formatGBP(results.salarySacrificeOption.monthlyVehicleCost), `-${formatGBP(results.salarySacrificeOption.monthlyTaxRelief)}`, formatGBP(results.salarySacrificeOption.monthlyBikTax), formatGBP(results.salarySacrificeOption.monthlyFuelCost), formatGBP(results.salarySacrificeOption.netTotalMonthlyCost), formatGBP(results.salarySacrificeOption.total3YearSpend)],
            ["Private PCP Financing", formatGBP(results.pcpOption.monthlyVehicleCost), "£0", formatGBP(results.pcpOption.monthlyInsuranceAndUpkeep), formatGBP(results.pcpOption.monthlyFuelCost), formatGBP(results.pcpOption.netTotalMonthlyCost), formatGBP(results.pcpOption.total3YearSpend)],
            ["Outright Cash Purchase", formatGBP(results.cashPurchaseOption.monthlyVehicleCost), "£0", formatGBP(results.cashPurchaseOption.monthlyInsuranceAndUpkeep), formatGBP(results.cashPurchaseOption.monthlyFuelCost), formatGBP(results.cashPurchaseOption.netTotalMonthlyCost), formatGBP(results.cashPurchaseOption.total3YearSpend)],
            ["Keep Existing Petrol Car", "£0", "£0", formatGBP(results.petrolStatusQuoOption.monthlyInsuranceAndUpkeep), formatGBP(results.petrolStatusQuoOption.monthlyFuelCost), formatGBP(results.petrolStatusQuoOption.netTotalMonthlyCost), formatGBP(results.petrolStatusQuoOption.total3YearSpend)],
          ],
        }}
        statutoryCitations={EV_CITATIONS.map((c) => ({ act: c.act, description: c.description }))}
        csvFilename="ladderpass_ev_salary_sacrifice_audit"
        onRequestConsultation={() => {
          setIsDossierOpen(false);
          setShowBrokerModal(true);
        }}
      />

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
