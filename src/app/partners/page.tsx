"use client";

import React, { useState, useMemo } from "react";
import {
  Briefcase,
  Code2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Scale,
  Building,
  Percent,
  ArrowRight,
  Lock,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { ConsultationModal } from "@/components/ConsultationModal";
import { UKTaxJurisdiction } from "@/lib/constants";
import "../dashboard.css";

export default function PartnersPage() {
  const [engine, setEngine] = useState<"mortgage" | "tax" | "ev" | "btl">("mortgage");
  const [primaryColor, setPrimaryColor] = useState("#064e3b");
  const [partnerName, setPartnerName] = useState("Mayfair Private Mortgages LLP");
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.zapier.com/hooks/catch/uk-broker-crm");
  const [jurisdiction, setJurisdiction] = useState<UKTaxJurisdiction>("ENGLAND_NI");
  const [copied, setCopied] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      engine,
      primaryColor: primaryColor.replace("#", ""),
      partnerName,
      jurisdiction,
    });
    if (webhookUrl.trim()) {
      params.set("webhook", webhookUrl.trim());
    }
    return `/embed?${params.toString()}`;
  }, [engine, primaryColor, partnerName, webhookUrl, jurisdiction]);

  const iframeSnippet = useMemo(() => {
    return `<iframe
  src="https://ladderpass.co.uk${embedUrl}"
  width="100%"
  height="540"
  style="border:0; border-radius:14px; overflow:hidden; max-width:680px;"
  title="${partnerName} — UK Financial Decision Engine"
  loading="lazy"
></iframe>`;
  }, [embedUrl, partnerName]);

  const handleCopySnippet = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="dashboard-container">
      <HeaderNav />

      {/* Hero Section */}
      <section className="hero-section">
        <div
          className="hero-pill"
          style={{
            background: "var(--primary-light)",
            color: "var(--primary)",
            border: "1px solid var(--primary-border)",
          }}
        >
          <Briefcase size={14} />
          <span>Pillar 2 &amp; Pillar 3 Institutional B2B Suite</span>
        </div>
        <h1 className="hero-title">
          White-Label Proptech Widgets &amp; FCA Introducer Network
        </h1>
        <p className="hero-subtitle">
          Embed LadderPass&apos;s post-April 2025 HMRC Stamp Duty (SDLT), Scottish LBTT, Welsh LTT, 60% Tax Trap, and SPV Corporation Tax engines directly on your brokerage or estate agency portal—or receive pre-verified client introductions with full FCA Consumer Duty (PRIN 2A) provenance.
        </p>
      </section>

      {/* Live Customizer & Embed Preview Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}
      >
        {/* Left: Widget Configuration Studio */}
        <div
          className="glass-panel"
          style={{
            padding: 24,
            borderRadius: "var(--round-lg)",
            background: "var(--surface)",
            border: "1px solid var(--surface-border)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Code2 size={18} style={{ color: "var(--primary)" }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
              1. Configure Your White-Label Widget
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
              Firm / Brokerage Display Name
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: "var(--round-md)",
                border: "1px solid var(--surface-border)",
                background: "var(--surface-tray)",
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                Default Calculation Engine
              </label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value as "mortgage" | "tax" | "ev" | "btl")}
                style={{
                  padding: "10px",
                  borderRadius: "var(--round-md)",
                  border: "1px solid var(--surface-border)",
                  background: "var(--surface-tray)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                <option value="mortgage">Residential Mortgage &amp; SDLT/LBTT</option>
                <option value="tax">60% Tax Trap &amp; SIPP Optimizer</option>
                <option value="ev">EV Salary Sacrifice vs PCP</option>
                <option value="btl">BTL Limited Company SPV</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                Default Devolved Tax Jurisdiction
              </label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as UKTaxJurisdiction)}
                style={{
                  padding: "10px",
                  borderRadius: "var(--round-md)",
                  border: "1px solid var(--surface-border)",
                  background: "var(--surface-tray)",
                  fontSize: 13,
                  color: "var(--text-primary)",
                }}
              >
                <option value="ENGLAND_NI">England &amp; NI (SDLT)</option>
                <option value="SCOTLAND">Scotland (LBTT)</option>
                <option value="WALES">Wales (LTT)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                Brand Hex Color
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  style={{ width: 38, height: 38, border: "none", background: "transparent", cursor: "pointer" }}
                />
                <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>{primaryColor}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                CRM / Zapier Webhook Endpoint
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/..."
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--round-md)",
                  border: "1px solid var(--surface-border)",
                  background: "var(--surface-tray)",
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Copyable Iframe Code Block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                2. Copy Ready-to-Deploy HTML Snippet
              </span>
              <button
                type="button"
                onClick={handleCopySnippet}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--primary-border)",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? "Copied to Clipboard" : "Copy Embed Code"}</span>
              </button>
            </div>
            <pre
              style={{
                background: "#0f172a",
                color: "#e2e8f0",
                padding: 14,
                borderRadius: 8,
                fontSize: 11,
                overflowX: "auto",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              <code>{iframeSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Right: Live Interactive Preview */}
        <div
          className="glass-panel"
          style={{
            padding: 24,
            borderRadius: "var(--round-lg)",
            background: "var(--surface)",
            border: "1px solid var(--surface-border)",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} style={{ color: "var(--primary)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Live Chromeless Widget Preview</h2>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 9999,
                background: "var(--primary-light)",
                color: "var(--primary)",
              }}
            >
              Interactive Sandbox
            </span>
          </div>

          <iframe
            src={embedUrl}
            title="LadderPass B2B Widget Live Preview"
            style={{
              width: "100%",
              height: 510,
              border: "1px solid var(--surface-border)",
              borderRadius: 12,
              background: "#ffffff",
            }}
          />
        </div>
      </div>

      {/* B2B SaaS Licensing Tiers & FCA Introducer Pricing */}
      <div
        className="glass-panel"
        style={{
          padding: 28,
          borderRadius: "var(--round-lg)",
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          Institutional Licensing &amp; FCA Introducer Commercial Terms
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
          Built for FCA-regulated mortgage networks, Chartered Tax Advisers (CTAs), IFAs, and UK estate agency groups.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          <div style={{ padding: 18, borderRadius: 12, background: "var(--surface-tray)", border: "1px solid var(--surface-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 700, fontSize: 13 }}>
              <Scale size={16} />
              <span>Residential Mortgage CPL</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              £75 – £250 <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>/ verified lead</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Pre-qualified UK borrowers with verified `+447` mobile, LTV calculation, deposit cash, and 4.5x income multiple check.
            </p>
          </div>

          <div style={{ padding: 18, borderRadius: 12, background: "var(--surface-tray)", border: "1px solid var(--surface-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 700, fontSize: 13 }}>
              <Percent size={16} />
              <span>IFA Wealth &amp; 60% Tax Trap CPL</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              £220 <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>/ HNW introduction</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              £100k–£250k+ gross earners modeling SIPP salary sacrifice, Personal Allowance recovery, and post-2027 Pension IHT drawdown.
            </p>
          </div>

          <div style={{ padding: 18, borderRadius: 12, background: "var(--surface-tray)", border: "1px solid var(--surface-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--primary)", fontWeight: 700, fontSize: 13 }}>
              <Building size={16} />
              <span>B2B White-Label Proptech SaaS</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, margin: "8px 0 4px", fontVariantNumeric: "tabular-nums" }}>
              £245 <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>/ month per agency</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
              Unlimited white-label embeds across all 6 UK statutory engines, custom branding, direct CRM webhooks, and automated BoE/HMRC updates.
            </p>
          </div>
        </div>

        {/* FCA Consumer Duty (PRIN 2A) Compliance Ledger */}
        <div
          style={{
            marginTop: 20,
            padding: "16px 20px",
            borderRadius: 10,
            background: "var(--primary-light)",
            border: "1px solid var(--primary-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, maxWidth: 680 }}>
            <ShieldCheck size={22} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5 }}>
              <strong>FCA Consumer Duty (PRIN 2A) &amp; PERG 2.7.19G Pure Introducer Architecture:</strong> Every lead payload includes an immutable ISO-8601 `consentGrantedAt` timestamp, `privacyPolicyAccepted: true`, devolved tax jurisdiction (`ENGLAND_NI` | `SCOTLAND` | `WALES`), and full vertical `qualificationMetrics` JSON.
            </div>
          </div>

          <button
            type="button"
            className="cta-button"
            onClick={() => setIsPartnerModalOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 18px" }}
          >
            <Lock size={14} />
            <span>Onboard Your Brokerage</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <ConsultationModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        context="MORTGAGE"
        propertyPrice={500000}
      />

      <Footer />
    </div>
  );
}
