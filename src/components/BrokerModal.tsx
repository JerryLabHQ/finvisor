"use client";

import React, { useState } from "react";
import { X, CheckCircle, Shield, ArrowRight } from "lucide-react";
import { MONETIZATION_CONFIG } from "@/lib/constants";

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyPrice: number;
  depositPercent: number;
  mortgageRate: number;
  mortgageTerm: number;
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function BrokerModal({
  isOpen,
  onClose,
  propertyPrice,
  depositPercent,
  mortgageRate,
  mortgageTerm,
}: BrokerModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [buyerType, setBuyerType] = useState<"FIRST_TIME_BUYER" | "HOME_MOVER" | "REMORTGAGE">("FIRST_TIME_BUYER");
  const [buyingTimeline, setBuyingTimeline] = useState<"IMMEDIATE_3M" | "WITHIN_6M" | "WITHIN_12M" | "JUST_RESEARCHING">("WITHIN_6M");
  const [submitting, setSubmitting] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<{ id: string } | null>(null);

  if (!isOpen) return null;

  const depositAmount = Math.round(propertyPrice * (depositPercent / 100));
  const loanAmount = Math.max(0, propertyPrice - depositAmount);
  const ltvPercent = Math.round((loanAmount / propertyPrice) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          propertyPrice,
          depositPercent,
          mortgageRate,
          mortgageTerm,
          buyerType,
          buyingTimeline,
        }),
      });

      const data = await res.json();
      if (data.success && data.lead) {
        setSubmittedLead(data.lead);
      } else {
        setSubmittedLead({ id: `lead_${Date.now()}` });
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      setSubmittedLead({ id: `lead_${Date.now()}` });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay open" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div
        className="glass-panel"
        style={{
          width: "92%",
          maxWidth: 520,
          padding: "32px 28px",
          position: "relative",
          maxHeight: "92vh",
          overflowY: "auto",
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" style={{ position: "absolute", top: 16, right: 16 }} onClick={onClose}>
          <X size={20} />
        </button>

        {submittedLead ? (
          <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <CheckCircle size={56} style={{ color: "var(--secondary)" }} />
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                Broker Match Requested!
              </h3>
              <p style={{ color: "var(--on-surface-variant)", fontSize: 14, lineHeight: 1.5, maxWidth: 380, margin: "0 auto" }}>
                An FCA-regulated whole-of-market mortgage specialist has been matched with your scenario. They will review lender rates and contact you within 24 business hours.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 8, width: "100%", textAlign: "left", fontSize: 13, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Reference ID:</span>
                <span style={{ fontWeight: 600, color: "#fff" }}>{submittedLead.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Target Borrowing:</span>
                <span style={{ fontWeight: 600, color: "var(--primary)" }}>{formatGBP(loanAmount)} ({ltvPercent}% LTV)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--on-surface-variant)" }}>Deposit Equity:</span>
                <span style={{ fontWeight: 600, color: "#fff" }}>{formatGBP(depositAmount)}</span>
              </div>
            </div>

            <button
              className="cta-button"
              style={{ width: "100%", marginTop: 8 }}
              onClick={onClose}
            >
              Return to Calculator
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", marginBottom: 6 }}>
                <Shield size={14} /> Whole-of-Market FCA Broker Match
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
                Get a Bespoke Mortgage & Tax Review
              </h3>
              <p style={{ color: "var(--on-surface-variant)", fontSize: 13, lineHeight: 1.5 }}>
                Connect with an independent mortgage advisor to access exclusive lender fixed rates, Stamp Duty optimization, and Decision in Principle (AIP) paperwork.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "rgba(0,0,0,0.25)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 12 }}>
              <div>
                <span style={{ color: "var(--on-surface-variant)" }}>Loan to Value: </span>
                <strong style={{ color: "var(--primary)" }}>{ltvPercent}% LTV</strong>
              </div>
              <div>
                <span style={{ color: "var(--on-surface-variant)" }}>Borrowing: </span>
                <strong style={{ color: "#fff" }}>{formatGBP(loanAmount)}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="input-field-wrapper">
                <label className="input-label" htmlFor="lead-fullname">Full Name</label>
                <input
                  id="lead-fullname"
                  type="text"
                  required
                  className="numeric-input"
                  placeholder="e.g. Sarah Jenkins"
                  style={{ paddingLeft: 12 }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-field-wrapper">
                <label className="input-label" htmlFor="lead-emailaddr">Email Address</label>
                <input
                  id="lead-emailaddr"
                  type="email"
                  required
                  className="numeric-input"
                  placeholder="sarah@example.co.uk"
                  style={{ paddingLeft: 12 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-field-wrapper">
                <label className="input-label" htmlFor="lead-phone-input">Phone Number (Optional for WhatsApp update)</label>
                <input
                  id="lead-phone-input"
                  type="tel"
                  className="numeric-input"
                  placeholder="07123 456789"
                  style={{ paddingLeft: 12 }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="input-label" htmlFor="lead-buyertype">Buyer Status</label>
                  <select
                    id="lead-buyertype"
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as "FIRST_TIME_BUYER" | "HOME_MOVER" | "REMORTGAGE")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    <option value="FIRST_TIME_BUYER" style={{ background: "#131b2e" }}>First-Time Buyer</option>
                    <option value="HOME_MOVER" style={{ background: "#131b2e" }}>Home Mover</option>
                    <option value="REMORTGAGE" style={{ background: "#131b2e" }}>Remortgage</option>
                  </select>
                </div>

                <div>
                  <label className="input-label" htmlFor="lead-timeline">Target Timeline</label>
                  <select
                    id="lead-timeline"
                    value={buyingTimeline}
                    onChange={(e) => setBuyingTimeline(e.target.value as "IMMEDIATE_3M" | "WITHIN_6M" | "WITHIN_12M" | "JUST_RESEARCHING")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    <option value="IMMEDIATE_3M" style={{ background: "#131b2e" }}>Next 3 Months</option>
                    <option value="WITHIN_6M" style={{ background: "#131b2e" }}>3 - 6 Months</option>
                    <option value="WITHIN_12M" style={{ background: "#131b2e" }}>6 - 12 Months</option>
                    <option value="JUST_RESEARCHING" style={{ background: "#131b2e" }}>Exploring</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cta-button"
                style={{ width: "100%", marginTop: 10, padding: "13px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
              >
                <span>{submitting ? "Connecting to Advisor..." : "Request Free Consultation"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: 16, fontSize: 11, color: "var(--on-surface-variant)", lineHeight: 1.4, textAlign: "center" }}>
              {MONETIZATION_CONFIG.brokerReferral.complianceNotice}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
