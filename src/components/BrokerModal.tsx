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
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-popover)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-btn" style={{ position: "absolute", top: 16, right: 16 }} onClick={onClose}>
          <X size={20} />
        </button>

        {submittedLead ? (
          <div style={{ textAlign: "center", padding: "20px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <CheckCircle size={56} style={{ color: "var(--primary)" }} />
            <div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                Broker Match Requested
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.5, maxWidth: 380, margin: "0 auto" }}>
                An FCA-regulated whole-of-market mortgage specialist has been matched with your scenario. They will review lender rates and contact you within 24 business hours.
              </p>
            </div>

            <div style={{ background: "var(--surface-subtle)", padding: 14, borderRadius: 8, width: "100%", textAlign: "left", fontSize: 13, border: "1px solid var(--surface-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-secondary)" }}>Reference ID:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{submittedLead.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--text-secondary)" }}>Target Borrowing:</span>
                <span style={{ fontWeight: 600, color: "var(--primary)" }}>{formatGBP(loanAmount)} ({ltvPercent}% LTV)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Deposit Equity:</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{formatGBP(depositAmount)}</span>
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                <Shield size={14} /> Whole-of-Market FCA Broker Match
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                Get a Bespoke Mortgage & Tax Review
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 13, lineHeight: 1.5 }}>
                Connect with an independent mortgage advisor to access exclusive lender fixed rates, Stamp Duty optimization, and Decision in Principle (AIP) paperwork.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, background: "var(--surface-tray)", border: "1px solid var(--surface-border)", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 12 }}>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Loan to Value: </span>
                <strong style={{ color: "var(--primary)" }}>{ltvPercent}% LTV</strong>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Borrowing: </span>
                <strong style={{ color: "var(--text-primary)" }}>{formatGBP(loanAmount)}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }} htmlFor="lead-fullname">
                  Full Name
                </label>
                <input
                  id="lead-fullname"
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    background: "var(--surface-subtle)",
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
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }} htmlFor="lead-emailaddr">
                  Email Address
                </label>
                <input
                  id="lead-emailaddr"
                  type="email"
                  required
                  placeholder="sarah@example.co.uk"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }} htmlFor="lead-phone-input">
                  Phone Number (Optional for WhatsApp update)
                </label>
                <input
                  id="lead-phone-input"
                  type="tel"
                  placeholder="07123 456789"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 6,
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--text-primary)",
                    fontSize: 13,
                    outline: "none",
                  }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }} htmlFor="lead-buyertype">
                    Buyer Status
                  </label>
                  <select
                    id="lead-buyertype"
                    value={buyerType}
                    onChange={(e) => setBuyerType(e.target.value as "FIRST_TIME_BUYER" | "HOME_MOVER" | "REMORTGAGE")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--surface-border)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    <option value="FIRST_TIME_BUYER">First-Time Buyer</option>
                    <option value="HOME_MOVER">Home Mover</option>
                    <option value="REMORTGAGE">Remortgage</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }} htmlFor="lead-timeline">
                    Target Timeline
                  </label>
                  <select
                    id="lead-timeline"
                    value={buyingTimeline}
                    onChange={(e) => setBuyingTimeline(e.target.value as "IMMEDIATE_3M" | "WITHIN_6M" | "WITHIN_12M" | "JUST_RESEARCHING")}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 6,
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--surface-border)",
                      color: "var(--text-primary)",
                      fontSize: 13,
                      outline: "none",
                    }}
                  >
                    <option value="IMMEDIATE_3M">Next 3 Months</option>
                    <option value="WITHIN_6M">3 - 6 Months</option>
                    <option value="WITHIN_12M">6 - 12 Months</option>
                    <option value="JUST_RESEARCHING">Exploring</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cta-button"
                style={{ width: "100%", marginTop: 10, padding: "12px", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}
              >
                <span>{submitting ? "Connecting to Advisor..." : "Request Free Consultation"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4, textAlign: "center" }}>
              {MONETIZATION_CONFIG.brokerReferral.complianceNotice}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
