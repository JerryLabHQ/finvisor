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
    link.setAttribute("download", `ladderpass_property_report_${Date.now()}.csv`);
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
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
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
                background: "var(--surface-subtle)",
                border: "1px solid var(--surface-border)",
                color: "var(--text-primary)",
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
                color: "#ffffff",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
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
            background: "var(--surface)",
            color: "var(--text-primary)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--surface-border)", paddingBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)" }}>
                LADDERPASS UK PROPERTY FEASIBILITY REPORT
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                Comprehensive Financial Comparison • Generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 4, background: "var(--primary-light)", color: "var(--primary)", fontSize: 11, fontWeight: 700, border: "1px solid var(--primary-border)" }}>
                100% FREE & VERIFIED
              </span>
            </div>
          </div>

          {/* Executive Verdict Box */}
          <div
            style={{
              padding: 20,
              borderRadius: 10,
              background: netWorthDifferenceAtHorizon >= 0 ? "var(--primary-light)" : "var(--secondary-light)",
              border: `1px solid ${netWorthDifferenceAtHorizon >= 0 ? "var(--primary-border)" : "var(--secondary-border)"}`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5, color: netWorthDifferenceAtHorizon >= 0 ? "var(--primary)" : "var(--secondary)", marginBottom: 6 }}>
              Decision Verdict: {netWorthDifferenceAtHorizon >= 0 ? "BUYING RECOMMENDED" : "RENTING & INVESTING RECOMMENDED"}
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              {netWorthDifferenceAtHorizon >= 0
                ? `Buying generates ${formatGBP(netWorthDifferenceAtHorizon)} more wealth over ${horizon} years.`
                : `Renting generates ${formatGBP(Math.abs(netWorthDifferenceAtHorizon))} more wealth over ${horizon} years.`}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {breakEvenYear
                ? `The upfront purchase costs (Stamp Duty, solicitors, survey) break even against renting in Year ${breakEvenYear}. After this milestone, principal amortization and property capital growth outstrip market rental cost inflation.`
                : `Throughout the ${horizon}-year horizon, the opportunity cost of the initial purchase deposit and debt service exceeds home equity gains.`}
            </div>
          </div>

          {/* Key Metric Highlights Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div style={{ background: "var(--surface-subtle)", padding: 14, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Property Price</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{formatGBP(inputs.propertyPrice)}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Deposit: {inputs.depositPercent}% ({formatGBP(results.depositAmount)})</div>
            </div>

            <div style={{ background: "var(--surface-subtle)", padding: 14, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Upfront Buy Costs</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginTop: 4 }}>{formatGBP(results.buyUpfrontCosts)}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>SDLT: {formatGBP(sdltCost)}</div>
            </div>

            <div style={{ background: "var(--surface-subtle)", padding: 14, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Initial Monthly Mortgage</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--primary)", marginTop: 4 }}>{formatGBP(results.initialMonthlyMortgage)}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{inputs.mortgageRate}% Fixed ({inputs.fixedTermYears}y)</div>
            </div>

            <div style={{ background: "var(--surface-subtle)", padding: 14, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Initial Monthly Rent</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--secondary)", marginTop: 4 }}>{formatGBP(inputs.initialRent)}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>+{inputs.rentIncreasePercent}%/yr increase</div>
            </div>
          </div>

          {/* Sunk Cost Breakdown Section */}
          <div>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              Sunk Cost Audit ({horizon}-Year Cumulative Non-Recoverable Expenses)
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Buyer Sunk */}
              <div style={{ background: "var(--surface-subtle)", padding: 16, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderBottom: "1px solid var(--surface-border)", paddingBottom: 8, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-primary)" }}>Buyer Non-Recoverable Costs</span>
                  <span style={{ color: "var(--tertiary)" }}>{formatGBP(sunkCostBreakdown.buyTotal)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Mortgage Interest:</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.buyMortgageInterest)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Stamp Duty (SDLT):</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.buySdlt)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Maintenance Reserve ({inputs.maintenancePercent}%):</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.buyMaintenance)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Service Charges:</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.buyServiceCharge)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Legal & Survey:</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.buyLegalAndSurvey)}</span>
                  </div>
                </div>
              </div>

              {/* Renter Sunk */}
              <div style={{ background: "var(--surface-subtle)", padding: 16, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderBottom: "1px solid var(--surface-border)", paddingBottom: 8, marginBottom: 8 }}>
                  <span style={{ color: "var(--text-primary)" }}>Renter Non-Recoverable Costs</span>
                  <span style={{ color: "var(--tertiary)" }}>{formatGBP(sunkCostBreakdown.rentTotal)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Cumulative Rent Paid:</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.rentCumulative)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Contents Insurance:</span>
                    <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(sunkCostBreakdown.rentInsurance)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Council Tax (Indexed):</span>
                    <span style={{ color: "var(--text-muted)" }}>Included in outgoings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Amortization Schedule Table */}
          <div>
            <h4 style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              Annual Amortization & Equity Accumulation Summary
            </h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--surface-border)", color: "var(--text-secondary)" }}>
                    <th style={{ textAlign: "left", padding: "8px 6px", fontSize: 11, textTransform: "uppercase" }}>Year</th>
                    <th style={{ padding: "8px 6px", fontSize: 11, textTransform: "uppercase" }}>Home Value</th>
                    <th style={{ padding: "8px 6px", fontSize: 11, textTransform: "uppercase" }}>Debt Balance</th>
                    <th style={{ padding: "8px 6px", fontSize: 11, textTransform: "uppercase" }}>Buyer Equity</th>
                    <th style={{ padding: "8px 6px", color: "var(--primary)", fontSize: 11, textTransform: "uppercase" }}>Buyer Net Worth</th>
                    <th style={{ padding: "8px 6px", color: "var(--secondary)", fontSize: 11, textTransform: "uppercase" }}>Renter Net Worth</th>
                  </tr>
                </thead>
                <tbody>
                  {annualBreakdown.slice(0, 20).map((row) => (
                    <tr key={row.year} style={{ borderBottom: "1px solid var(--surface-border)" }}>
                      <td style={{ textAlign: "left", padding: "8px 6px", fontWeight: 600, color: "var(--text-primary)" }}>Yr {row.year}</td>
                      <td style={{ padding: "8px 6px", color: "var(--text-primary)" }}>{formatGBP(row.homeValue)}</td>
                      <td style={{ padding: "8px 6px", color: "var(--text-secondary)" }}>{formatGBP(row.mortgageBalance)}</td>
                      <td style={{ padding: "8px 6px", color: "var(--text-primary)" }}>{formatGBP(row.buyerEquity)}</td>
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
            <div style={{ background: "var(--accent-coffee-bg)", border: "1px solid var(--accent-coffee-border)", borderRadius: 8, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--accent-coffee-text)" }}>
                Enjoying LadderPass? It&apos;s 100% free with no ads. If this report helped you make a clearer decision, consider supporting the creator:
              </span>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="layout__header-donate"
              >
                {SUPPORT_LABEL}
              </a>
            </div>
          )}

          {/* Regulatory Disclaimer */}
          <div style={{ fontSize: 11, color: "var(--text-muted)", borderTop: "1px solid var(--surface-border)", paddingTop: 16, lineHeight: 1.5 }}>
            <strong>Notice:</strong> This illustration is for financial educational and scenario analysis purposes only and does not constitute FCA-regulated financial advice. Mortgage rates, taxes, and valuations fluctuate. Consult an independent FCA-authorized mortgage advisor before entering legally binding contracts.
          </div>
        </div>
      </div>
    </div>
  );
}
