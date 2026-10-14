"use client";

import React, { useRef } from "react";
import { X, Printer, Download, Sparkles } from "lucide-react";
import { CalculatorResults } from "@/lib/calculator";
import { SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CalculatorResults;
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function ReportModal({ isOpen, onClose, results }: ReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const { inputs, annualBreakdown, breakEvenYear, netWorthDifferenceAtHorizon, sunkCostBreakdown, sdltCost } = results;
  const horizon = inputs.timeHorizonYears;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const headers = [
      "Year",
      "Home Value (£)",
      "Mortgage Balance (£)",
      "Buyer Equity (£)",
      "Buyer Investments (£)",
      "Buyer Total Net Worth (£)",
      "Buyer Cumulative Sunk Costs (£)",
      "Renter Investments (£)",
      "Renter Total Net Worth (£)",
      "Renter Cumulative Sunk Costs (£)",
    ];

    const rows = annualBreakdown.map((row) => [
      row.year,
      row.homeValue,
      row.mortgageBalance,
      row.buyerEquity,
      row.buyerInvestmentPot,
      row.buyerTotalNetWorth,
      row.buyerSunkCostsCumulative,
      row.renterInvestmentPot,
      row.renterTotalNetWorth,
      row.renterSunkCostsCumulative,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `finvisor_property_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="drawer-overlay open" style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 90 }}>
      <div
        className="glass-panel"
        style={{
          width: "94%",
          maxWidth: 840,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.15)",
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
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(11, 19, 38, 0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#fff" }}>
              UK Property Feasibility Report
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

            <button
              onClick={handleDownloadCsv}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 6,
                background: "var(--primary)",
                color: "#00363d",
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button className="close-btn" onClick={onClose} style={{ marginLeft: 6 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Report Content Body (Printable) */}
        <div
          ref={reportRef}
          id="printable-report"
          style={{
            overflowY: "auto",
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            color: "var(--foreground)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>FINVISOR BUY VS RENT REPORT</div>
              <div style={{ fontSize: 13, color: "var(--on-surface-variant)", marginTop: 4 }}>
                Comprehensive Financial Comparison • Generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 4, background: "rgba(16, 185, 129, 0.15)", color: "var(--secondary)", fontSize: 11, fontWeight: 700 }}>
                100% FREE & VERIFIED
              </span>
            </div>
          </div>

          {/* Executive Verdict Box */}
          <div
            style={{
              padding: 20,
              borderRadius: 8,
              background: netWorthDifferenceAtHorizon >= 0 ? "rgba(0, 229, 255, 0.08)" : "rgba(16, 185, 129, 0.08)",
              border: `1px solid ${netWorthDifferenceAtHorizon >= 0 ? "var(--primary)" : "var(--secondary)"}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: netWorthDifferenceAtHorizon >= 0 ? "var(--primary)" : "var(--secondary)", marginBottom: 6 }}>
              Decision Verdict: {netWorthDifferenceAtHorizon >= 0 ? "BUYING RECOMMENDED" : "RENTING & INVESTING RECOMMENDED"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
              {netWorthDifferenceAtHorizon >= 0
                ? `Buying generates ${formatGBP(netWorthDifferenceAtHorizon)} more wealth over ${horizon} years.`
                : `Renting generates ${formatGBP(Math.abs(netWorthDifferenceAtHorizon))} more wealth over ${horizon} years.`}
            </div>
            <div style={{ fontSize: 13, color: "var(--on-surface-variant)", lineHeight: 1.6 }}>
              {breakEvenYear
                ? `The upfront purchase costs (Stamp Duty, solicitors, survey) break even against renting in Year ${breakEvenYear}. After this milestone, principal amortization and property capital growth outstrip market rental cost inflation.`
                : `Throughout the ${horizon}-year horizon, the opportunity cost of the initial purchase deposit and debt service exceeds home equity gains.`}
            </div>
          </div>

          {/* Key Metric Highlights Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Property Price</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4 }}>{formatGBP(inputs.propertyPrice)}</div>
              <div style={{ fontSize: 10, color: "var(--on-surface-variant)", marginTop: 2 }}>Deposit: {inputs.depositPercent}% ({formatGBP(results.depositAmount)})</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Upfront Buy Costs</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 4 }}>{formatGBP(results.buyUpfrontCosts)}</div>
              <div style={{ fontSize: 10, color: "var(--on-surface-variant)", marginTop: 2 }}>SDLT: {formatGBP(sdltCost)}</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Initial Monthly Mortgage</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)", marginTop: 4 }}>{formatGBP(results.initialMonthlyMortgage)}</div>
              <div style={{ fontSize: 10, color: "var(--on-surface-variant)", marginTop: 2 }}>{inputs.mortgageRate}% Fixed ({inputs.fixedTermYears}y)</div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Initial Monthly Rent</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--secondary)", marginTop: 4 }}>{formatGBP(inputs.initialRent)}</div>
              <div style={{ fontSize: 10, color: "var(--on-surface-variant)", marginTop: 2 }}>+{inputs.rentIncreasePercent}%/yr increase</div>
            </div>
          </div>

          {/* Sunk Cost Breakdown Section */}
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Sunk Cost Audit ({horizon}-Year Cumulative Non-Recoverable Expenses)
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Buyer Sunk */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8, marginBottom: 8 }}>
                  <span>Buyer Non-Recoverable Costs</span>
                  <span style={{ color: "var(--tertiary)" }}>{formatGBP(sunkCostBreakdown.buyTotal)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Mortgage Interest:</span>
                    <span>{formatGBP(sunkCostBreakdown.buyMortgageInterest)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Stamp Duty (SDLT):</span>
                    <span>{formatGBP(sunkCostBreakdown.buySdlt)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Maintenance Reserve ({inputs.maintenancePercent}%):</span>
                    <span>{formatGBP(sunkCostBreakdown.buyMaintenance)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Service Charges:</span>
                    <span>{formatGBP(sunkCostBreakdown.buyServiceCharge)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Legal & Survey:</span>
                    <span>{formatGBP(sunkCostBreakdown.buyLegalAndSurvey)}</span>
                  </div>
                </div>
              </div>

              {/* Renter Sunk */}
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8, marginBottom: 8 }}>
                  <span>Renter Non-Recoverable Costs</span>
                  <span style={{ color: "var(--tertiary)" }}>{formatGBP(sunkCostBreakdown.rentTotal)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Cumulative Rent Paid:</span>
                    <span>{formatGBP(sunkCostBreakdown.rentCumulative)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Contents Insurance:</span>
                    <span>{formatGBP(sunkCostBreakdown.rentInsurance)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--on-surface-variant)" }}>Council Tax (Indexed):</span>
                    <span>Included in outgoings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Amortization Schedule Table (100% Free) */}
          <div>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              Annual Amortization & Equity Accumulation Summary
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)", color: "var(--on-surface-variant)" }}>
                    <th style={{ textAlign: "left", padding: "8px 6px" }}>Year</th>
                    <th style={{ padding: "8px 6px" }}>Home Value</th>
                    <th style={{ padding: "8px 6px" }}>Debt Balance</th>
                    <th style={{ padding: "8px 6px" }}>Buyer Equity</th>
                    <th style={{ padding: "8px 6px", color: "var(--primary)" }}>Buyer Net Worth</th>
                    <th style={{ padding: "8px 6px", color: "var(--secondary)" }}>Renter Net Worth</th>
                  </tr>
                </thead>
                <tbody>
                  {annualBreakdown.slice(0, 20).map((row) => (
                    <tr key={row.year} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ textAlign: "left", padding: "8px 6px", fontWeight: 600 }}>Yr {row.year}</td>
                      <td style={{ padding: "8px 6px" }}>{formatGBP(row.homeValue)}</td>
                      <td style={{ padding: "8px 6px" }}>{formatGBP(row.mortgageBalance)}</td>
                      <td style={{ padding: "8px 6px" }}>{formatGBP(row.buyerEquity)}</td>
                      <td style={{ padding: "8px 6px", color: "var(--primary)", fontWeight: 700 }}>{formatGBP(row.buyerTotalNetWorth)}</td>
                      <td style={{ padding: "8px 6px", color: "var(--secondary)", fontWeight: 700 }}>{formatGBP(row.renterTotalNetWorth)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Donation Support Box in Report */}
          {SUPPORT_URL && (
            <div style={{ background: "rgba(255, 221, 0, 0.06)", border: "1px solid rgba(255, 221, 0, 0.2)", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>
                Enjoying Finvisor? It&apos;s 100% free with no ads. If this report helped you make a clearer decision, consider supporting the creator:
              </span>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="layout__header-donate"
                style={{ background: "#ffdd00", color: "#000", border: "none", fontWeight: 700 }}
              >
                {SUPPORT_LABEL}
              </a>
            </div>
          )}

          {/* Regulatory Disclaimer */}
          <div style={{ fontSize: 11, color: "var(--on-surface-variant)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, lineHeight: 1.5 }}>
            <strong>Notice:</strong> This illustration is for financial educational and scenario analysis purposes only and does not constitute FCA-regulated financial advice. Mortgage rates, taxes, and valuations fluctuate. Consult an independent FCA-authorized mortgage advisor before entering legally binding contracts.
          </div>
        </div>
      </div>
    </div>
  );
}
