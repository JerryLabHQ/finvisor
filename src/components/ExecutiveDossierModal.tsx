"use client";

import React, { useRef } from "react";
import { X, Printer, Download, Sparkles, Scale, ShieldCheck } from "lucide-react";
import { SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";

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
}: ExecutiveDossierModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

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
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="layout__header-donate"
              >
                {SUPPORT_LABEL}
              </a>
            )}

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
              borderBottom: "2px solid var(--primary)",
              paddingBottom: 16,
              marginBottom: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--primary)",
                  marginBottom: 6,
                }}
              >
                <Scale size={13} />
                <span>LadderPass UK Financial Advisory Memorandum</span>
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
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                {subtitle}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: 4,
                  backgroundColor: "var(--primary-light)",
                  color: "var(--primary)",
                  border: "1px solid var(--primary-border)",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {badge}
              </span>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                Generated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Executive KPI Summary Matrix */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: "14px 16px",
                  background: "var(--surface-tray)",
                  border: "1px solid var(--surface-border)",
                  borderRadius: 6,
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
                    fontWeight: 700,
                    color: "var(--primary)",
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

          {/* Strategic Narrative / Verdict */}
          <div
            style={{
              padding: "16px 20px",
              background: "#ffffff",
              border: "1px solid var(--surface-border)",
              borderRadius: 6,
              marginBottom: 24,
              boxShadow: "var(--shadow-subtle)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              Executive Summary & Strategy Finding
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                margin: 0,
              }}
            >
              {summaryParagraph}
            </p>
          </div>

          {/* Detailed Schedule Breakdown Table */}
          {breakdownTable && (
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 15,
                  fontWeight: 600,
                  marginBottom: 10,
                  color: "var(--text-primary)",
                }}
              >
                Multi-Year Financial Modeling Ledger
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <thead>
                    <tr style={{ background: "var(--surface-tray)", borderBottom: "1px solid var(--surface-border)" }}>
                      {breakdownTable.headers.map((h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "8px 10px",
                            fontWeight: 700,
                            textAlign: i === 0 ? "left" : "right",
                            color: "var(--text-muted)",
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
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: "1px solid var(--surface-border-subtle)",
                          background: rIdx % 2 === 0 ? "#ffffff" : "var(--surface-tray)",
                        }}
                      >
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: "7px 10px",
                              textAlign: cIdx === 0 ? "left" : "right",
                              fontWeight: cIdx === 0 ? 600 : 400,
                              color: cIdx === 0 ? "var(--text-primary)" : "var(--text-secondary)",
                            }}
                          >
                            {typeof cell === "number" ? cell.toLocaleString() : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Official Statutory Legal Basis */}
          <div
            style={{
              paddingTop: 16,
              borderTop: "1px solid var(--surface-border)",
              fontSize: 11,
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 700,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              <ShieldCheck size={13} style={{ color: "var(--primary)" }} />
              <span>Statutory Compliance & Regulatory Framework</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 8, marginBottom: 12 }}>
              {statutoryCitations.map((c, i) => (
                <div key={i} style={{ padding: "6px 10px", background: "var(--surface-tray)", borderRadius: 4, border: "1px solid var(--surface-border)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{c.act}:</strong> {c.description}
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontStyle: "italic" }}>
              Disclaimer: Generated for informational and modeling purposes by LadderPass (https://ladderpass.vercel.app). All tax bands, National Insurance thresholds, and Benefit-in-Kind rates conform to prevailing UK legislation. This document does not constitute personalized financial advice. Consult an FCA-authorized mortgage broker or chartered tax accountant before entering binding financial commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
