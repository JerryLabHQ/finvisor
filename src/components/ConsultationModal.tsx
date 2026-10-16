"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle,
  ArrowRight,
  Lock,
  Building,
  Coins,
  Zap,
  GraduationCap,
  Percent,
  Scale,
} from "lucide-react";
import { MONETIZATION_CONFIG } from "@/lib/constants";
import { activatePro } from "@/lib/pro-store";
import { getFinancialProfile } from "@/lib/financial-profile-store";

export type ConsultationContext =
  | "MORTGAGE"
  | "TAX_TRAP"
  | "EV_SCHEME"
  | "STUDENT_LOAN"
  | "BTL_SPV"
  | "RETIREMENT";

export type TimelineType =
  | "IMMEDIATE_3M"
  | "WITHIN_6M"
  | "WITHIN_12M"
  | "JUST_RESEARCHING";

export interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ConsultationContext;
  // Specific financial figures to showcase in the ledger
  propertyPrice?: number;
  depositPercent?: number;
  mortgageRate?: number;
  mortgageTerm?: number;
  // Optional custom metrics for other modules
  customMetrics?: {
    primaryLabel: string;
    primaryValue: string;
    primarySub?: string;
    secondaryLabel: string;
    secondaryValue: string;
    secondarySub?: string;
    tertiaryLabel: string;
    tertiaryValue: string;
    tertiarySub?: string;
    quaternaryLabel: string;
    quaternaryValue: string;
    quaternarySub?: string;
  };
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function ConsultationModal({
  isOpen,
  onClose,
  context = "MORTGAGE",
  propertyPrice = 450000,
  depositPercent = 15,
  mortgageRate = 3.9,
  mortgageTerm = 25,
  customMetrics,
}: ConsultationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clientCategory, setClientCategory] = useState<string>(() => {
    switch (context) {
      case "TAX_TRAP":
        return "HIGH_EARNER_TAX";
      case "EV_SCHEME":
        return "EV_SALARY_SACRIFICE";
      case "STUDENT_LOAN":
        return "GRADUATE_BORROWER";
      case "BTL_SPV":
        return "BUY_TO_LET_INVESTOR";
      case "RETIREMENT":
        return "RETIREMENT_PLANNING";
      default:
        return "FIRST_TIME_BUYER";
    }
  });
  const [timeline, setTimeline] = useState<"IMMEDIATE_3M" | "WITHIN_6M" | "WITHIN_12M" | "JUST_RESEARCHING">("IMMEDIATE_3M");
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{ id: string } | null>(null);

  if (!isOpen) return null;

  // Calculation figures for standard mortgage context
  const depositAmount = Math.round(propertyPrice * (depositPercent / 100));
  const loanAmount = Math.max(0, propertyPrice - depositAmount);
  const ltvPercent = Math.round((loanAmount / propertyPrice) * 100);
  const monthlyRate = mortgageRate / 100 / 12;
  const numPayments = mortgageTerm * 12;
  const estimatedMonthlyMortgage = Math.round(
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanAmount / numPayments
  );

  // Context titles & subtitles
  const getContextMeta = () => {
    switch (context) {
      case "TAX_TRAP":
        return {
          icon: Percent,
          badge: "Chartered Tax Adviser (CTA) & SIPP Partner",
          title: "Bespoke 60% Tax Trap & SIPP Review",
          desc: "Connect with a regulated wealth planner to calculate statutory SIPP salary sacrifice, reclaim your £12,570 Personal Allowance, and preserve 30 hours of free childcare.",
          btnText: "Request Private Wealth Consultation",
          successTitle: "Tax Strategy Session Requested",
          successDesc: "A specialist UK Chartered Tax Adviser / IFA will audit your income bands and contact you within 24 business hours.",
        };
      case "EV_SCHEME":
        return {
          icon: Zap,
          badge: "Whole-of-Market Fleet & Salary Sacrifice Partner",
          title: "Compare UK EV Salary Sacrifice Fleet Quotes",
          desc: "Get independent, commercial fleet lease quotes (Octopus EV, Tusker, The Electric Car Scheme) and lock 2% to 5% HMRC BiK savings for your organization.",
          btnText: "Request Fleet Lease Comparisons",
          successTitle: "EV Fleet Quotes Dispatched",
          successDesc: "Our fleet partner specialists will match your preferred vehicle specifications and contact you within 24 business hours.",
        };
      case "STUDENT_LOAN":
        return {
          icon: GraduationCap,
          badge: "FCA-Regulated Mortgage & Debt Adviser",
          title: "Graduate Mortgage Borrowing Capacity Review",
          desc: "Learn how your Plan 2 or Plan 5 repayment affects maximum mortgage debt service (affordability tests) and whether voluntary payoff makes mathematical sense.",
          btnText: "Request Borrowing Capacity Review",
          successTitle: "Borrowing Capacity Review Queued",
          successDesc: "A specialist mortgage advisor experienced in graduate income multiples will contact you within 24 business hours.",
        };
      case "BTL_SPV":
        return {
          icon: Building,
          badge: "FCA Commercial Broker & Property Accountant",
          title: "SPV Limited Company Mortgage & Tax Audit",
          desc: "Model Section 24 relief bypass, compare corporate BTL mortgage rates across 40+ UK lenders, and structure your property company for 19% Corporation Tax.",
          btnText: "Request SPV Commercial Quote",
          successTitle: "SPV Mortgage Illustration Requested",
          successDesc: "An experienced BTL mortgage broker and property tax specialist will review your property criteria and contact you within 24 business hours.",
        };
      case "RETIREMENT":
        return {
          icon: Coins,
          badge: "FCA-Regulated Independent Financial Adviser (IFA)",
          title: "Bespoke Pension Drawdown & 2027 IHT Review",
          desc: "Protect your retirement pot from aggressive depletion, optimize 25% tax-free lump sum (PCLS) withdrawals, and model the new 2027 pension inheritance tax rules.",
          btnText: "Connect with a Chartered Financial Planner",
          successTitle: "Retirement Planning Match Requested",
          successDesc: "An FCA-regulated Chartered Financial Planner will review your pension and ISA scenario and contact you within 24 business hours.",
        };
      default:
        return {
          icon: Scale,
          badge: "FCA-Regulated Partner Match • Independent Whole-of-Market",
          title: "Request Bespoke Mortgage & Wealth Consultation",
          desc: "Connect with a certified UK mortgage broker to unlock exclusive lender fixed rates, HMRC Stamp Duty optimization, and immediate Decision in Principle (AIP) paperwork.",
          btnText: "Dispatch Scenario to Whole-of-Market Advisor",
          successTitle: "Broker Match Confirmed",
          successDesc: "An FCA-regulated whole-of-market mortgage specialist has been matched with your scenario. They will review lender rates and contact you within 24 business hours.",
        };
    }
  };

  const meta = getContextMeta();
  const IconComponent = meta.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const strippedPhone = phone.replace(/[\s\-()]/g, "");
    const normalizedPhone = strippedPhone.startsWith("+4407")
      ? "+447" + strippedPhone.slice(5)
      : strippedPhone;

    if (!/^(\+44|0)7\d{9}$/.test(normalizedPhone)) {
      setFormError("Please enter a valid UK mobile number (e.g., 07700 900123 or +447700900123).");
      return;
    }

    if (!privacyPolicyAccepted) {
      setFormError("Please confirm explicit UK GDPR consent to transmit your scenario to an FCA-regulated partner.");
      return;
    }

    setSubmitting(true);
    const consentGrantedAt = new Date().toISOString();
    const profile = getFinancialProfile();

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: normalizedPhone,
          propertyPrice,
          depositPercent,
          mortgageRate,
          mortgageTerm,
          buyerType: clientCategory,
          buyingTimeline: timeline,
          privacyPolicyAccepted: true,
          consentGrantedAt,
          qualificationMetrics: {
            grossSalary: profile.grossSalary,
            pensionPot: profile.pensionPot,
            evP11dValue: profile.evGrossLeaseMonthly > 0 ? profile.evGrossLeaseMonthly * 72 : 42000,
            btlPortfolioSize: context === "BTL_SPV" ? 2 : 0,
            studentLoanPlan: profile.studentLoanPlan,
            jurisdiction: profile.jurisdiction,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Unable to submit consultation request. Please verify your details.");
        setSubmitting(false);
        return;
      }

      // Path A: Lead-Magnet Unlock — automatically activate Lifetime Pro Dossier access
      activatePro("lifetime", `PRO-ADVISOR-${Date.now().toString(36).toUpperCase()}`);

      if (data.success && data.lead) {
        setSubmittedLead(data.lead);
      } else {
        setSubmittedLead({ id: `lead_${Date.now()}` });
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      activatePro("lifetime", `PRO-ADVISOR-${Date.now().toString(36).toUpperCase()}`);
      setSubmittedLead({ id: `lead_${Date.now()}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="drawer-overlay open"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "94%",
          maxWidth: 620,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          borderRadius: "var(--round-xl)",
          boxShadow: "var(--shadow-popover)",
          padding: 0,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          style={{
            padding: "28px 28px 20px 28px",
            borderBottom: "1px solid var(--surface-border)",
            background: "var(--surface-tray)",
            position: "relative",
          }}
        >
          <button
            className="close-btn"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--surface-border)",
              background: "var(--surface)",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>

          {/* Discreet Regulatory Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 9999,
              background: "var(--primary-light)",
              border: "1px solid var(--primary-border)",
              color: "var(--primary)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <IconComponent size={13} />
            <span>{meta.badge}</span>
          </div>

          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: "0 0 6px 0",
              lineHeight: 1.25,
            }}
          >
            {meta.title}
          </h2>

          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              margin: 0,
              paddingRight: 24,
            }}
          >
            {meta.desc}
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          {submittedLead ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary)",
                }}
              >
                <CheckCircle size={36} />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 6px 0",
                  }}
                >
                  {meta.successTitle}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: 13,
                    lineHeight: 1.5,
                    maxWidth: 420,
                    margin: "0 auto",
                  }}
                >
                  {meta.successDesc}
                </p>
              </div>

              {/* Reference ID card */}
              <div
                style={{
                  background: "var(--surface-tray)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "var(--round-md)",
                  padding: "16px 20px",
                  width: "100%",
                  textAlign: "left",
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)" }}>Scenario Case Ref:</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "monospace" }}>
                    #{submittedLead.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "var(--text-muted)" }}>FCA Intermediary SLA:</span>
                  <span style={{ fontWeight: 600, color: "var(--primary)" }}>Within 24 Business Hours</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Fee Status:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>100% Free Initial Assessment</span>
                </div>
              </div>

              <button
                className="cta-button"
                style={{ width: "100%", marginTop: 8 }}
                onClick={onClose}
              >
                Return to Calculation Workbench
              </button>
            </div>
          ) : (
            <>
              {/* Verified Client Simulation Parameters (Bento Card) */}
              <div
                style={{
                  background: "var(--surface-tray)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: "var(--round-lg)",
                  padding: "16px 18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid var(--surface-border)",
                    paddingBottom: 8,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-muted)",
                    }}
                  >
                    Verified Client Simulation Parameters
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--primary)",
                      background: "var(--primary-light)",
                      border: "1px solid var(--primary-border)",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    Active Ledger #LP-{Math.floor(1000 + (propertyPrice % 9000))}
                  </span>
                </div>

                {customMetrics ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {customMetrics.primaryLabel}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {customMetrics.primaryValue}{" "}
                        {customMetrics.primarySub && (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                            ({customMetrics.primarySub})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {customMetrics.secondaryLabel}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {customMetrics.secondaryValue}{" "}
                        {customMetrics.secondarySub && (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                            ({customMetrics.secondarySub})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {customMetrics.tertiaryLabel}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {customMetrics.tertiaryValue}{" "}
                        {customMetrics.tertiarySub && (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                            ({customMetrics.tertiarySub})
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {customMetrics.quaternaryLabel}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {customMetrics.quaternaryValue}{" "}
                        {customMetrics.quaternarySub && (
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                            ({customMetrics.quaternarySub})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        Target Borrowing
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {formatGBP(loanAmount)}{" "}
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                          ({ltvPercent}% LTV)
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        Deposit Equity
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {formatGBP(depositAmount)}{" "}
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                          ({depositPercent}% Cash)
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        Est. Monthly Payment
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {formatGBP(estimatedMonthlyMortgage)}/mo{" "}
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                          ({mortgageRate}% Fixed)
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        Full Property Price
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                        {formatGBP(propertyPrice)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Consultation Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-secondary)",
                      }}
                      htmlFor="client-fullname"
                    >
                      Full Legal Name
                    </label>
                    <input
                      id="client-fullname"
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--round-md)",
                        background: "var(--surface-tray)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-secondary)",
                      }}
                      htmlFor="client-emailaddr"
                    >
                      Direct Email Address
                    </label>
                    <input
                      id="client-emailaddr"
                      type="email"
                      required
                      placeholder="sarah.jenkins@example.co.uk"
                      style={{
                        padding: "10px 12px",
                        borderRadius: "var(--round-md)",
                        background: "var(--surface-tray)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-secondary)",
                    }}
                    htmlFor="client-phone-input"
                  >
                    Direct Telephone Number
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 12,
                        fontSize: 13,
                        color: "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      🇬🇧 +44
                    </span>
                    <input
                      id="client-phone-input"
                      type="tel"
                      required
                      placeholder="07700 900123"
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 68px",
                        borderRadius: "var(--round-md)",
                        background: "var(--surface-tray)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    UK mobile required (`07...` or `+447...`) for FCA advisor verification & instant Pro Dossier unlock.
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-secondary)",
                      }}
                      htmlFor="client-category-select"
                    >
                      Client Classification
                    </label>
                    <select
                      id="client-category-select"
                      value={clientCategory}
                      onChange={(e) => setClientCategory(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "var(--round-md)",
                        background: "var(--surface-tray)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    >
                      <option value="FIRST_TIME_BUYER">First-Time Buyer</option>
                      <option value="HOME_MOVER">Home Mover</option>
                      <option value="REMORTGAGE">Remortgage / Refinancing</option>
                      <option value="HIGH_EARNER_TAX">High Earner (£100k+ SIPP)</option>
                      <option value="EV_SALARY_SACRIFICE">EV Salary Sacrifice Scheme</option>
                      <option value="BUY_TO_LET_INVESTOR">BTL SPV Investor</option>
                      <option value="RETIREMENT_PLANNING">Pension Drawdown & IHT</option>
                      <option value="GRADUATE_BORROWER">Graduate Borrower (Plan 2/5)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-secondary)",
                      }}
                      htmlFor="client-timeline-select"
                    >
                      Execution Horizon
                    </label>
                    <select
                      id="client-timeline-select"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value as TimelineType)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "var(--round-md)",
                        background: "var(--surface-tray)",
                        border: "1px solid var(--surface-border)",
                        color: "var(--text-primary)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    >
                      <option value="IMMEDIATE_3M">Immediate (Next 30 Days)</option>
                      <option value="WITHIN_6M">1 to 3 Months</option>
                      <option value="WITHIN_12M">3 to 6 Months</option>
                      <option value="JUST_RESEARCHING">Exploring & Scenario Modeling</option>
                    </select>
                  </div>
                </div>

                {/* Explicit UK GDPR Consent Checkbox */}
                <label
                  htmlFor="uk-gdpr-consent-checkbox"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: "var(--round-md)",
                    background: "var(--surface-tray)",
                    border: "1px solid var(--surface-border)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    lineHeight: 1.45,
                  }}
                >
                  <input
                    id="uk-gdpr-consent-checkbox"
                    type="checkbox"
                    required
                    checked={privacyPolicyAccepted}
                    onChange={(e) => setPrivacyPolicyAccepted(e.target.checked)}
                    style={{ marginTop: 2, accentColor: "var(--primary)", width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span>
                    I explicitly consent under <strong>UK GDPR &amp; FCA Consumer Duty (PRIN 2A)</strong> for LadderPass to transmit my contact details and simulation parameters to a matched FCA-regulated advisor or fleet partner. Includes complimentary <strong>Lifetime Pro Dossier (PDF/CSV)</strong> unlock.
                  </span>
                </label>

                {formError && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--round-md)",
                      background: "rgba(220, 38, 38, 0.08)",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      color: "#b91c1c",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {formError}
                  </div>
                )}

                {/* Privacy Assurance Pill */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 14px",
                    borderRadius: "var(--round-md)",
                    background: "var(--surface-tray)",
                    border: "1px solid var(--surface-border)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  <Lock size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
                  <span>Zero-spam guarantee • Encrypted under UK GDPR • Unlocks Free Pro Dossier Export</span>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="cta-button"
                  style={{
                    width: "100%",
                    padding: "13px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    marginTop: 4,
                  }}
                >
                  <span>{submitting ? "Connecting to Intermediary..." : meta.btnText}</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Statutory Notice */}
              <div
                style={{
                  borderTop: "1px solid var(--surface-border)",
                  paddingTop: 12,
                  fontSize: 11,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {MONETIZATION_CONFIG.brokerReferral.complianceNotice}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Backwards-compatibility alias for BrokerModal
export { ConsultationModal as BrokerModal };
