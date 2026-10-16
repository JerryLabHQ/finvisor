"use client";

import React, { useState, useMemo } from "react";
import {
  Building,
  Sliders,
  FileText,
  Shield,
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
  runBTLCalculation,
  BTLInputs,
} from "@/lib/btl-spv-calculator";
import { useFinancialProfile } from "@/lib/financial-profile-store";
import "../../dashboard.css";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

const SPV_CITATIONS: CitationItem[] = [
  {
    act: "Finance (No. 2) Act 2015",
    section: "Section 24",
    description: "Statutory restriction preventing individual landlords from deducting mortgage interest as an allowable expense, taxing gross rental turnover less running costs and granting only a 20% basic-rate tax reduction.",
    govUrl: "https://www.legislation.gov.uk/ukpga/2015/33/section/24/enacted",
  },
  {
    act: "Corporation Tax Act 2010",
    section: "Part 3, Companies Carrying on a Property Business",
    description: "Allows Limited Company SPVs to deduct 100% of mortgage interest as a commercial trading expense, applying 19% small profits rate up to £50,000, 26.5% marginal relief £50k–£250k, and 25% above £250,000.",
    govUrl: "https://www.gov.uk/corporation-tax-rates",
  },
  {
    act: "Finance Act 2003 & Autumn Budget 2024",
    section: "Schedule 4ZA (Higher Rates for Additional Dwellings)",
    description: "Statutory 5% Stamp Duty Land Tax surcharge levied on corporate and additional residential property purchases across all price tiers.",
    govUrl: "https://www.gov.uk/guidance/stamp-duty-land-tax-buying-an-additional-residential-property",
  },
  {
    act: "Companies Act 2006",
    description: "Special Purpose Vehicle (SPV) incorporation under SIC code 68209 ('Other letting and operating of own or leased real estate') required by UK commercial buy-to-let mortgage lenders.",
    govUrl: "https://www.gov.uk/set-up-limited-company",
  },
];

const SPV_CHECKLIST: ChecklistItem[] = [
  {
    id: "spv-incorp",
    stepNumber: 1,
    title: "Incorporate SPV Limited Company",
    detail: "Register a private limited company with Companies House using Standard Industrial Classification (SIC) code 68209 ('Other letting and operating of own or leased real estate').",
    actionTag: "Companies House",
  },
  {
    id: "biz-bank-acc",
    stepNumber: 2,
    title: "Open a Commercial Business Bank Account",
    detail: "Set up a UK business bank account in the exact name of the Limited Company SPV to ringfence rental revenues and expense transactions.",
    actionTag: "Banking Compliance",
  },
  {
    id: "specialist-broker",
    stepNumber: 3,
    title: "Obtain Commercial BTL Mortgage DIP",
    detail: "Work with a specialist mortgage broker to test lender Interest Cover Ratios (ICRs) — typically 125% stressed at 5.5% for SPVs vs 145% at 5.5% for personal names.",
    actionTag: "Mortgage Sourcing",
  },
  {
    id: "hrad-reserve",
    stepNumber: 4,
    title: "Reserve 5% Higher Rate SDLT Surcharge",
    detail: "Factor in the autumn budget legislated 5% Higher Rates for Additional Dwellings (HRAD) Stamp Duty surcharge due within 14 days of completion.",
    actionTag: "Tax Capital",
  },
  {
    id: "director-loan",
    stepNumber: 5,
    title: "Document Director's Loan Agreement",
    detail: "Structure the initial deposit funds introduced by the director as an official Director's Loan, allowing future rental profits to be drawn out 100% tax-free until repaid.",
    actionTag: "Extraction Strategy",
  },
];

export default function SpvPage() {
  const { updateProfile } = useFinancialProfile();
  const [price, setPrice] = useState(280000);
  const [rent, setRent] = useState(1450);
  const [deposit, setDeposit] = useState(25);
  const [personalRate, setPersonalRate] = useState(4.5);
  const [spvRate, setSpvRate] = useState(5.4);
  const [taxBracket, setTaxBracket] = useState<"BASIC_20" | "HIGHER_40" | "ADDITIONAL_45">("HIGHER_40");
  const [strategy, setStrategy] = useState<"REINVEST_IN_SPV" | "EXTRACT_ALL_DIVIDENDS">("REINVEST_IN_SPV");

  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  React.useEffect(() => {
    updateProfile({
      targetPropertyPrice: price,
      depositPercent: deposit,
    });
  }, [price, deposit, updateProfile]);

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

  const isSpvWinner = results.verdict === "SPV_WINS";

  return (
    <div className="dashboard-container">
      {/* Unified Suite Header Navigation */}
      <HeaderNav />

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
              onClick={() => setIsDossierOpen(true)}
              className="pdf-trigger-btn"
              style={{ whiteSpace: "nowrap" }}
            >
              <FileText size={16} />
              <span>Generate BTL Dossier</span>
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
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--tertiary)" }}>
              {formatGBP(results.section24TaxDragAnnual)}/yr
            </span>
            <span className="metric-subtext">Disallowed mortgage relief</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">SPV Net Cashflow</span>
            <span className="metric-value highlight tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.spv.netAnnualCashflow)}/yr
            </span>
            <span className="metric-subtext">{formatGBP(results.spv.netMonthlyCashflow)}/month net</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Personal Net Cashflow</span>
            <span className="metric-value tabular-nums">
              {formatGBP(results.personal.netAnnualCashflow)}/yr
            </span>
            <span className="metric-subtext">{formatGBP(results.personal.netMonthlyCashflow)}/month net</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">5% HRAD Stamp Duty</span>
            <span className="metric-value tabular-nums" style={{ color: "var(--primary)" }}>
              {formatGBP(results.sdltCost)}
            </span>
            <span className="metric-subtext">Higher Rate for Additional Dwellings</span>
          </div>
        </div>
      </div>

      {/* Market Leader Editorial Callout: Martin's Rule of Thumb for Landlords */}
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
          <strong style={{ color: "var(--text-primary)" }}>Martin&apos;s Rule of Thumb for Landlords (Section 24 Squeeze): </strong>
          <span style={{ color: "var(--text-secondary)" }}>
            If you are a 40% higher-rate or 45% additional-rate taxpayer, buying rental property in your personal name means HMRC taxes phantom profit—you pay income tax on gross rental turnover, with only a 20% basic tax credit for mortgage interest. A Limited Company SPV preserves full 100% mortgage interest deductibility at 19% Corporation Tax, offsetting the 5% HRAD SDLT surcharge within ~3 to 5 years if you reinvest profits into future properties.
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
            <div className="slider-ticks">
              <span>£100k</span>
              <span>£250k</span>
              <span>£500k</span>
              <span>£800k</span>
            </div>
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
            <div className="slider-ticks">
              <span>£500</span>
              <span>£1,500</span>
              <span>£3,000</span>
              <span>£4,500</span>
            </div>
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
            <div className="slider-ticks">
              <span>3.0%</span>
              <span>4.5%</span>
              <span>6.0%</span>
              <span>7.0%</span>
            </div>
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
            <div className="slider-ticks">
              <span>3.5%</span>
              <span>5.0%</span>
              <span>6.5%</span>
              <span>8.0%</span>
            </div>
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
              <table className="tabular-nums editorial-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: "var(--text-muted)" }}>Financial Item</th>
                    <th style={{ padding: "8px 12px", color: "var(--text-primary)" }}>Personal Ownership</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)", fontWeight: 700 }}>Limited Co SPV</th>
                    <th style={{ padding: "8px 12px", color: "var(--primary)" }}>SPV Advantage</th>
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
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)" }}>-{formatGBP(results.spv.annualMortgagePayment - results.personal.annualMortgagePayment)} (Higher Rate)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Management, Maintenance & Accountancy</td>
                    <td style={{ padding: "10px 12px" }}>-{formatGBP(results.personal.annualOperatingExpenses)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>-{formatGBP(results.spv.annualOperatingExpenses)}</td>
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)" }}>-£1,200 (Accountant)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Taxable Profit Calculated</td>
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)" }}>
                      {formatGBP(results.personal.taxableProfit)} <span style={{ fontSize: 11 }}>(No mortgage deduction!)</span>
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>
                      {formatGBP(results.spv.taxableProfit)} <span style={{ fontSize: 11 }}>(Full mortgage deduction)</span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)" }}>Shielded from income tax</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--surface-border)" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Tax Actually Paid</td>
                    <td style={{ padding: "10px 12px", color: "var(--tertiary)", fontWeight: 700 }}>-{formatGBP(results.personal.taxPaid)}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>-{formatGBP(results.spv.taxPaid)} (19% Corp Tax)</td>
                    <td style={{ padding: "10px 12px", color: "var(--primary)", fontWeight: 700 }}>
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
                    <td style={{ padding: "12px", fontWeight: 800, color: isSpvWinner ? "var(--primary)" : "var(--tertiary)" }}>
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

      {/* Statutory Sources & Mathematical Methodology (IFS / FT Style) */}
      <StatutoryMethodology
        moduleTitle="Buy-to-Let SPV vs Personal Ownership"
        formulaDescription="Calculates exact section 24 phantom tax drag (full rental turnover added to personal taxable income, basic 20% interest tax credit relief) vs 19% small profits Corporation Tax, 5% HRAD Stamp Duty surcharge, and commercial mortgage interest deductibility."
        citations={SPV_CITATIONS}
        defaultOpen={false}
      />

      {/* Interactive SPV Setup Checklist (Which? & MSE Style) */}
      <ActionChecklist
        id="btl-spv"
        title="BTL Limited Company SPV Formation Checklist"
        subtitle="5 essential corporate and financing steps for UK property portfolio investors"
        items={SPV_CHECKLIST}
      />

      {/* Commercial BTL Broker & SPV Accountant Modal */}
      <ConsultationModal
        isOpen={showBrokerModal}
        onClose={() => setShowBrokerModal(false)}
        context="BTL_SPV"
        propertyPrice={price}
        depositPercent={deposit}
        mortgageRate={spvRate}
        customMetrics={{
          primaryLabel: "Purchase Property Price",
          primaryValue: formatGBP(price),
          primarySub: `${deposit}% Deposit (${formatGBP(price * (deposit / 100))})`,
          secondaryLabel: "Section 24 Phantom Drag",
          secondaryValue: `${formatGBP(results.section24TaxDragAnnual)}/yr`,
          secondarySub: "Personal tax penalty",
          tertiaryLabel: "SPV Net Annual Cashflow",
          tertiaryValue: formatGBP(results.spv.netAnnualCashflow),
          tertiarySub: `${formatGBP(results.spv.netMonthlyCashflow)}/mo net`,
          quaternaryLabel: "10-Year Cumulative Gain",
          quaternaryValue: formatGBP(results.tenYearCumulativeDifference),
          quaternarySub: isSpvWinner ? "SPV Advantage" : "Personal Advantage",
        }}
      />

      {/* Institutional Printable BTL SPV Dossier Modal */}
      <ExecutiveDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        title="BTL Limited Company SPV Investment Memorandum"
        subtitle="Section 24 mortgage relief audit, 19% Corporation Tax, and 5% HRAD Stamp Duty feasibility"
        badge={isSpvWinner ? "SPV Advantage" : "Personal Ownership Favored"}
        metrics={[
          { label: "Purchase Price", value: formatGBP(price), sub: `${deposit}% Deposit` },
          { label: "Monthly Gross Rent", value: `${formatGBP(rent)}/mo`, sub: `Gross Yield: ${((rent * 12 / price) * 100).toFixed(1)}%` },
          { label: "Section 24 Drag", value: `${formatGBP(results.section24TaxDragAnnual)}/yr`, sub: "Phantom tax on personal" },
          { label: "10-Year Advantage", value: formatGBP(results.tenYearCumulativeDifference), sub: isSpvWinner ? "SPV Ahead" : "Personal Ahead" },
        ]}
        summaryParagraph={results.verdictReasoning}
        breakdownTable={{
          headers: ["Category", "Personal Name", "Limited Co SPV", "Variance / Advantage"],
          rows: [
            ["Gross Annual Rent", formatGBP(rent * 12), formatGBP(rent * 12), "£0"],
            ["Annual Mortgage Payment", formatGBP(results.personal.annualMortgagePayment), formatGBP(results.spv.annualMortgagePayment), formatGBP(results.spv.annualMortgagePayment - results.personal.annualMortgagePayment)],
            ["Allowable Finance Deduction", "£0 (Section 24 Disallowed)", formatGBP(results.spv.annualMortgagePayment), formatGBP(results.spv.annualMortgagePayment)],
            ["Annual Tax Liability", formatGBP(results.personal.taxPaid), formatGBP(results.spv.taxPaid), formatGBP(results.personal.taxPaid - results.spv.taxPaid)],
            ["Net Annual Cashflow", formatGBP(results.personal.netAnnualCashflow), formatGBP(results.spv.netAnnualCashflow), formatGBP(results.annualCashflowDifference)],
            ["10-Year Cumulative Cashflow", formatGBP(results.personal.netAnnualCashflow * 10), formatGBP(results.spv.netAnnualCashflow * 10), formatGBP(results.tenYearCumulativeDifference)],
          ],
        }}
        statutoryCitations={SPV_CITATIONS.map((c) => ({ act: c.act, description: c.description }))}
        csvFilename="ladderpass_btl_spv_audit"
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
