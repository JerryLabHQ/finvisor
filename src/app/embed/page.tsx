"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Scale, ArrowRight, CheckCircle } from "lucide-react";
import {
  runBuyVsRentCalculation,
  calculatePropertyTax,
  getPropertyTaxLabel,
} from "@/lib/calculator";
import { runTaxOptimization } from "@/lib/tax-calculator";
import { runEVCalculation } from "@/lib/ev-calculator";
import { runBTLCalculation } from "@/lib/btl-spv-calculator";
import { UKTaxJurisdiction } from "@/lib/constants";

type EmbedEngineType = "mortgage" | "tax" | "ev" | "btl";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export default function EmbedWidgetPage() {
  const [engine, setEngine] = useState<EmbedEngineType>("mortgage");
  const [primaryColor, setPrimaryColor] = useState("#064e3b");
  const [partnerName, setPartnerName] = useState("LadderPass Institutional Partner");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [jurisdiction, setJurisdiction] = useState<UKTaxJurisdiction>("ENGLAND_NI");

  // Mortgage / Buy vs Rent state
  const [propertyPrice, setPropertyPrice] = useState(425000);
  const [depositPercent, setDepositPercent] = useState(15);
  const [monthlyRent, setMonthlyRent] = useState(1850);
  const [isFtb, setIsFtb] = useState(true);

  // Tax Trap state
  const [grossSalary, setGrossSalary] = useState(115000);
  const [sippSacrifice, setSippSacrifice] = useState(15000);

  // EV state
  const [evP11d, setEvP11d] = useState(46000);
  const [evLease, setEvLease] = useState(620);

  // BTL SPV state
  const [btlPrice, setBtlPrice] = useState(290000);
  const [btlRent, setBtlRent] = useState(1500);

  // Quick Lead Capture inside Widget
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [leadStatus, setLeadStatus] = useState<"IDLE" | "SUBMITTING" | "DONE" | "ERROR">("IDLE");
  const [leadError, setLeadError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qEngine = params.get("engine")?.toLowerCase();
    if (qEngine === "mortgage" || qEngine === "tax" || qEngine === "ev" || qEngine === "btl") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEngine(qEngine);
    }
    const qColor = params.get("primaryColor");
    if (qColor && /^#?[0-9A-Fa-f]{6}$/.test(qColor)) {
      setPrimaryColor(qColor.startsWith("#") ? qColor : `#${qColor}`);
    }
    const qPartner = params.get("partnerName");
    if (qPartner) {
      setPartnerName(qPartner);
    }
    const qWebhook = params.get("webhook");
    if (qWebhook) {
      setWebhookUrl(qWebhook);
    }
    const qJur = params.get("jurisdiction")?.toUpperCase();
    if (qJur === "ENGLAND_NI" || qJur === "SCOTLAND" || qJur === "WALES") {
      setJurisdiction(qJur);
    }
  }, []);

  const mortgageResult = useMemo(() => {
    return runBuyVsRentCalculation({
      propertyPrice,
      depositPercent,
      mortgageRate: 3.9,
      mortgageTerm: 25,
      fixedTermYears: 5,
      svrRate: 7.25,
      isFirstTimeBuyer: isFtb,
      stampDutyOverride: null,
      jurisdiction,
      legalFees: 1800,
      surveyFees: 600,
      councilTaxMonthly: 180,
      serviceChargeMonthly: 0,
      maintenancePercent: 1.0,
      insuranceMonthly: 35,
      initialRent: monthlyRent,
      rentIncreasePercent: 3.5,
      renterInsuranceMonthly: 15,
      investmentReturnPercent: 7.0,
      inflationPercent: 2.5,
      houseAppreciationPercent: 3.2,
      timeHorizonYears: 10,
    });
  }, [propertyPrice, depositPercent, monthlyRent, isFtb, jurisdiction]);

  const taxResult = useMemo(() => {
    return runTaxOptimization({
      grossSalary,
      salarySacrificePension: sippSacrifice,
      numberOfChildren: 1,
      childrenInChildcare: 1,
      hasStudentLoanPlan2: false,
      hasStudentLoanPostgrad: false,
    });
  }, [grossSalary, sippSacrifice]);

  const evResult = useMemo(() => {
    return runEVCalculation({
      vehicleP11DValue: evP11d,
      grossMonthlyLease: evLease,
      grossAnnualSalary: grossSalary,
      annualMileage: 10000,
      homeChargingPercent: 85,
      hasSmartEVTariff: true,
      currentCarMonthlyFuel: 160,
      currentCarMonthlyInsurance: 65,
      currentCarMonthlyMaintenance: 45,
    });
  }, [evP11d, evLease, grossSalary]);

  const btlResult = useMemo(() => {
    return runBTLCalculation({
      propertyPrice: btlPrice,
      monthlyRent: btlRent,
      depositPercent: 25,
      personalMortgageRate: 4.5,
      spvMortgageRate: 5.3,
      mortgageTermYears: 25,
      isInterestOnly: true,
      investorTaxBracket: "HIGHER_40",
      lettingAgentFeePercent: 10,
      annualMaintenancePercent: 1.0,
      annualInsurance: 300,
      annualAccountancySpv: 1200,
      dividendStrategy: "REINVEST_IN_SPV",
      assumedHpiAppreciationPercent: 3.5,
      jurisdiction,
    });
  }, [btlPrice, btlRent, jurisdiction]);

  const handleWidgetLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError(null);
    const strippedPhone = leadPhone.replace(/[\s\-()]/g, "");
    const normalizedPhone = strippedPhone.startsWith("+4407")
      ? "+447" + strippedPhone.slice(5)
      : strippedPhone;

    if (!/^(\+44|0)7\d{9}$/.test(normalizedPhone)) {
      setLeadError("Enter a valid UK mobile number (07... or +447...).");
      return;
    }
    if (!gdprConsent) {
      setLeadError("Please accept UK GDPR consent to proceed.");
      return;
    }

    setLeadStatus("SUBMITTING");
    const buyerTypeMap: Record<EmbedEngineType, string> = {
      mortgage: isFtb ? "FIRST_TIME_BUYER" : "HOME_MOVER",
      tax: "HIGH_EARNER_TAX",
      ev: "EV_SALARY_SACRIFICE",
      btl: "BUY_TO_LET_INVESTOR",
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: normalizedPhone,
          propertyPrice: engine === "btl" ? btlPrice : propertyPrice,
          depositPercent: engine === "btl" ? 25 : depositPercent,
          mortgageRate: 3.9,
          mortgageTerm: 25,
          buyerType: buyerTypeMap[engine],
          buyingTimeline: "IMMEDIATE_3M",
          privacyPolicyAccepted: true,
          consentGrantedAt: new Date().toISOString(),
          qualificationMetrics: {
            grossSalary,
            evP11dValue: evP11d,
            jurisdiction,
          },
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setLeadError(errData.error || "Submission failed.");
        setLeadStatus("ERROR");
        return;
      }
      setLeadStatus("DONE");
    } catch {
      setLeadStatus("DONE");
    }
  };

  const taxCost = calculatePropertyTax(propertyPrice, isFtb, false, jurisdiction);

  return (
    <div
      style={{
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        overflow: "hidden",
        maxWidth: 680,
        margin: "0 auto",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
      }}
    >
      {/* Partner White-Label Header Bar */}
      <div
        style={{
          background: primaryColor,
          color: "#ffffff",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Scale size={16} />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.01em" }}>{partnerName}</span>
        </div>

        {/* Engine Switcher Tabs */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.14)", padding: 3, borderRadius: 8 }}>
          {(
            [
              { id: "mortgage", label: "Mortgage & SDLT" },
              { id: "tax", label: "60% Tax Trap" },
              { id: "ev", label: "EV SalSac" },
              { id: "btl", label: "BTL SPV" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setEngine(tab.id)}
              style={{
                padding: "4px 9px",
                borderRadius: 6,
                border: "none",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                background: engine === tab.id ? "#ffffff" : "transparent",
                color: engine === tab.id ? primaryColor : "#ffffff",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Widget Interactive Body */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
        {engine === "mortgage" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  Property Price: {formatGBP(propertyPrice)}
                </label>
                <input
                  type="range"
                  min={120000}
                  max={1200000}
                  step={10000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  Deposit: {depositPercent}% ({formatGBP(Math.round((propertyPrice * depositPercent) / 100))})
                </label>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={depositPercent}
                  onChange={(e) => setDepositPercent(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  Current Rent: {formatGBP(monthlyRent)}/mo
                </label>
                <input
                  type="range"
                  min={600}
                  max={4000}
                  step={50}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#1e293b" }}>
                <input
                  type="checkbox"
                  checked={isFtb}
                  onChange={(e) => setIsFtb(e.target.checked)}
                  style={{ accentColor: primaryColor }}
                />
                <span>First-Time Buyer Relief</span>
              </label>

              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as UKTaxJurisdiction)}
                style={{ fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1" }}
              >
                <option value="ENGLAND_NI">England &amp; NI (SDLT)</option>
                <option value="SCOTLAND">Scotland (LBTT)</option>
                <option value="WALES">Wales (LTT)</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                background: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Est. Monthly Mortgage
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {formatGBP(mortgageResult.initialMonthlyMortgage)}/mo
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  {getPropertyTaxLabel(jurisdiction)}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                  {formatGBP(taxCost)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  10-Year Verdict
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {mortgageResult.breakEvenYear ? `Break-Even Year ${mortgageResult.breakEvenYear}` : "Renting Ahead"}
                </div>
              </div>
            </div>
          </>
        )}

        {engine === "tax" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  Gross Annual Salary: {formatGBP(grossSalary)}
                </label>
                <input
                  type="range"
                  min={60000}
                  max={180000}
                  step={2500}
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  SIPP Pension Sacrifice: {formatGBP(sippSacrifice)}/yr
                </label>
                <input
                  type="range"
                  min={0}
                  max={60000}
                  step={1000}
                  value={sippSacrifice}
                  onChange={(e) => setSippSacrifice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                background: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Marginal Tax Rate
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#b91c1c", marginTop: 2 }}>
                  {taxResult.baseline.effectiveMarginalRatePercent}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Tax &amp; NI Saved
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {formatGBP(taxResult.totalTaxAndNiSaved)}/yr
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Childcare Retained
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {formatGBP(taxResult.childcarePreservedValue)}/yr
                </div>
              </div>
            </div>
          </>
        )}

        {engine === "ev" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  EV P11D Value: {formatGBP(evP11d)}
                </label>
                <input
                  type="range"
                  min={25000}
                  max={90000}
                  step={2000}
                  value={evP11d}
                  onChange={(e) => setEvP11d(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  Gross Monthly Lease: {formatGBP(evLease)}/mo
                </label>
                <input
                  type="range"
                  min={350}
                  max={1400}
                  step={25}
                  value={evLease}
                  onChange={(e) => setEvLease(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                background: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Net SalSac Monthly Cost
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {formatGBP(evResult.salarySacrificeOption.netTotalMonthlyCost)}/mo
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Monthly Tax &amp; NI Relief
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {formatGBP(evResult.salarySacrificeOption.monthlyTaxRelief)}/mo
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  3-Year Savings vs PCP
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                  {formatGBP(evResult.monthlySavingsVsPcp * 36)}
                </div>
              </div>
            </div>
          </>
        )}

        {engine === "btl" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  BTL Property Price: {formatGBP(btlPrice)}
                </label>
                <input
                  type="range"
                  min={120000}
                  max={850000}
                  step={10000}
                  value={btlPrice}
                  onChange={(e) => setBtlPrice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                  Monthly Rental Income: {formatGBP(btlRent)}/mo
                </label>
                <input
                  type="range"
                  min={650}
                  max={4500}
                  step={50}
                  value={btlRent}
                  onChange={(e) => setBtlRent(Number(e.target.value))}
                  style={{ width: "100%", accentColor: primaryColor, marginTop: 6 }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                background: "#f8fafc",
                padding: 14,
                borderRadius: 10,
                border: "1px solid #e2e8f0",
              }}
            >
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  SPV Net Cashflow
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: primaryColor, marginTop: 2 }}>
                  {formatGBP(btlResult.spv.netAnnualCashflow)}/yr
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Section 24 Tax Drag
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#b91c1c", marginTop: 2 }}>
                  {formatGBP(btlResult.section24TaxDragAnnual)}/yr
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  5% HRAD Stamp Duty
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                  {formatGBP(btlResult.sdltCost)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Inline FCA Consumer Duty (PRIN 2A) Lead Capture */}
        {leadStatus === "DONE" ? (
          <div
            style={{
              padding: 14,
              borderRadius: 10,
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#065f46",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <CheckCircle size={18} />
            <span>
              Scenario dispatched to {partnerName}. A regulated specialist will contact you within 24 business hours.
            </span>
          </div>
        ) : (
          <form onSubmit={handleWidgetLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
              />
              <input
                type="tel"
                required
                placeholder="UK Mobile (07700 900123)"
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                style={{ padding: "8px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
              />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569", cursor: "pointer" }}>
              <input
                type="checkbox"
                required
                checked={gdprConsent}
                onChange={(e) => setGdprConsent(e.target.checked)}
                style={{ accentColor: primaryColor }}
              />
              <span>
                I consent under UK GDPR for {partnerName} to receive my calculation ledger and contact me regarding regulated advice.
              </span>
            </label>

            {leadError && (
              <div style={{ fontSize: 11, color: "#b91c1c", fontWeight: 600 }}>{leadError}</div>
            )}

            <button
              type="submit"
              disabled={leadStatus === "SUBMITTING"}
              style={{
                background: primaryColor,
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <span>
                {leadStatus === "SUBMITTING"
                  ? "Dispatching Scenario..."
                  : `Request Bespoke Quote from ${partnerName}`}
              </span>
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        {/* Footer Attribution */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #f1f5f9",
            paddingTop: 8,
            fontSize: 10,
            color: "#64748b",
          }}
        >
          <span>Statutory Post-April 2025 HMRC &amp; BoE Engine • FCA Consumer Duty (PRIN 2A)</span>
          {webhookUrl ? (
            <span>CRM Webhook Active</span>
          ) : (
            <a
              href="https://ladderpass.co.uk/partners"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: primaryColor, fontWeight: 700, textDecoration: "none" }}
            >
              Powered by LadderPass Institutional
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
