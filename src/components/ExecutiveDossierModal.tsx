"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Printer, Download, Sparkles, Scale, ShieldCheck, Lock, CheckCircle } from "lucide-react";
import { getProStatus, activatePro } from "@/lib/pro-store";
import { MONETIZATION_CONFIG } from "@/lib/constants";
import { ProStatus } from "@/lib/types";

export interface MetricItem {
  label: string;
  value: string;
  sub?: string;
}

export interface ExecutiveDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  badge: string;
  metrics: MetricItem[];
  summaryParagraph: string;
  breakdownTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  statutoryCitations: { act: string; description: string }[];
  csvFilename?: string;
  onRequestConsultation?: () => void;
}

export function ExecutiveDossierModal({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  metrics,
  summaryParagraph,
  breakdownTable,
  statutoryCitations,
  csvFilename = "ladderpass_executive_dossier",
  onRequestConsultation,
}: ExecutiveDossierModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [proStatus, setProStatus] = useState<ProStatus>({ isPro: false });
  const [unlockingPro, setUnlockingPro] = useState(false);

  useEffect(() => {
    const syncPro = () => setProStatus(getProStatus());
    syncPro();
    window.addEventListener("ladderpass-pro-change", syncPro);
    return () => window.removeEventListener("ladderpass-pro-change", syncPro);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirectProUnlock = async () => {
    setUnlockingPro(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "lifetime", returnUrl: window.location.pathname }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.success && data.licenseKey) {
        const updated = activatePro("lifetime", data.licenseKey);
        setProStatus(updated);
      }
    } catch (err) {
      console.error("Failed to unlock Pro dossier:", err);
    } finally {
      setUnlockingPro(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (!breakdownTable) return;
    const csvContent = [
      breakdownTable.headers.join(","),
      ...breakdownTable.rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${csvFilename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="drawer-overlay open"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90 }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "94%",
          maxWidth: 860,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          background: "var(--surface)",
          border: "1px solid var(--surface-border)",
          boxShadow: "var(--shadow-popover)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: "1px solid var(--surface-border)",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                fontWeight: 600,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              {title}
            </h3>
            {proStatus.isPro && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  border: "1px solid var(--primary-border)",
                }}
              >
                <CheckCircle size={11} />
                <span>PRO VERIFIED ({proStatus.licenseKey || "ACTIVE"})</span>
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {breakdownTable && (
              <button
                type="button"
                onClick={handleDownloadCsv}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "1px solid var(--surface-border)",
                  background: "var(--surface-tray)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                }}
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 6,
                background: "var(--primary)",
                color: "var(--on-primary)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: "var(--text-muted)",
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dual-Path Institutional Unlock Banner (when not yet Pro/Verified) */}
        {!proStatus.isPro && (
          <div
            style={{
              padding: "12px 24px",
              background: "var(--primary-light)",
              borderBottom: "1px solid var(--primary-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-primary)" }}>
              <Lock size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <span>
                <strong>Lender-Ready Dossier License:</strong> Unlock certified broker-stamped exports free via an FCA consultation request, or activate an anonymous Lifetime Pro Pass (£{MONETIZATION_CONFIG.proPricing.lifetimePassGbp}).
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {onRequestConsultation && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestConsultation();
                  }}
                  style={{
                    padding: "6px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: "1px solid var(--primary)",
                    background: "#ffffff",
                    color: "var(--primary)",
                    cursor: "pointer",
                  }}
                >
                  Free Unlock via FCA Advisor Match
                </button>
              )}
              <button
                type="button"
                disabled={unlockingPro}
                onClick={handleDirectProUnlock}
                style={{
                  padding: "6px 12px",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 4,
                  border: "none",
                  background: "var(--primary)",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {unlockingPro ? "Activating..." : `Instant Pro Pass (£${MONETIZATION_CONFIG.proPricing.lifetimePassGbp})`}
              </button>
            </div>
          </div>
        )}

        {/* Printable Content Body */}
        <div
          ref={reportRef}
          id="printable-report"
          style={{
            overflowY: "auto",
            padding: 32,
            fontFamily: "var(--font-sans)",
            color: "var(--text-primary)",
            lineHeight: 1.5,
          }}
        >
          {/* Header Masthead */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "2px solid var(--text-primary)",
              paddingBottom: 16,
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--primary)",
                  background: "var(--primary-light)",
                  border: "1px solid var(--primary-border)",
                  padding: "3px 8px",
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              >
                <Scale size={12} />
                <span>{badge}</span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 24,
                  fontWeight: 600,
                  margin: "0 0 4px 0",
                  color: "var(--text-primary)",
                }}
              >
                {title}
              </h1>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{subtitle}</p>
            </div>

            <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-muted)" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 13 }}>
                🇬🇧 LadderPass Institutional Ledger
              </div>
              <div>Date: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</div>
              <div>Jurisdiction: United Kingdom (HMRC / BoE)</div>
            </div>
          </div>

          {/* Executive Summary Callout */}
          <div
            style={{
              padding: "16px 20px",
              background: "var(--surface-tray)",
              borderLeft: "4px solid var(--primary)",
              borderRadius: "0 8px 8px 0",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--primary)",
                marginBottom: 4,
              }}
            >
              Executive Quantitative Verdict
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--text-primary)" }}>
              {summaryParagraph}
            </p>
          </div>

          {/* 4-Metric Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: 14,
                  borderRadius: 8,
                  border: "1px solid var(--surface-border)",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {m.value}
                </div>
                {m.sub && (
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                    {m.sub}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Breakdown Schedule Table */}
          {breakdownTable && (
            <div style={{ marginBottom: 28 }}>
              <h4
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-secondary)",
                  marginBottom: 10,
                }}
              >
                Itemized Financial Schedule
              </h4>
              <div className="editorial-table-wrap">
                <table className="editorial-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--surface-border)", background: "var(--surface-tray)" }}>
                      {breakdownTable.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "8px 10px",
                            textAlign: i === 0 ? "left" : "right",
                            fontWeight: 700,
                            fontSize: 11,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {breakdownTable.rows.map((row, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: "8px 10px",
                              textAlign: cIdx === 0 ? "left" : "right",
                              fontWeight: cIdx === 0 ? 600 : 400,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Statutory Methodology Citations */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "var(--surface-tray)",
              border: "1px solid var(--surface-border)",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-primary)",
                marginBottom: 10,
              }}
            >
              <ShieldCheck size={14} style={{ color: "var(--primary)" }} />
              <span>Statutory Legislation & Basis of Calculation</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {statutoryCitations.map((c, i) => (
                <div key={i} style={{ fontSize: 11 }}>
                  <strong style={{ color: "var(--text-primary)" }}>{c.act}:</strong>{" "}
                  <span style={{ color: "var(--text-secondary)" }}>{c.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Footer Note */}
          <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.5 }}>
            Generated by LadderPass (The UK Financial Ladder). This memorandum is an independent mathematical illustration and does not constitute personal financial or tax advice under FSMA 2000. Verify final terms with an FCA-regulated intermediary or Chartered Tax Adviser before execution.
          </div>
        </div>
      </div>
    </div>
  );
}
