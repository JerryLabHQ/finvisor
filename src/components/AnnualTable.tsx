"use client";

import React, { useState } from "react";
import { Table, ChevronDown, ChevronUp } from "lucide-react";
import { AnnualData } from "@/lib/calculator";

interface AnnualTableProps {
  annualBreakdown: AnnualData[];
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function AnnualTable({ annualBreakdown }: AnnualTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayedRows = isExpanded ? annualBreakdown : annualBreakdown.slice(0, 5);

  return (
    <div className="glass-panel" style={{ padding: "26px", marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Table size={18} style={{ color: "var(--primary)" }} />
          <div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              Year-by-Year Cash Flow & Amortization Schedule
            </h3>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Inspect principal reduction, home equity accumulation, and investment compound growth
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--surface)",
            border: "1px solid var(--surface-border)",
            color: "var(--text-secondary)",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "var(--shadow-subtle)",
          }}
        >
          <span>{isExpanded ? "Collapse Table" : `Show All ${annualBreakdown.length} Years`}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--surface-border)", color: "var(--text-secondary)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Year</th>
              <th style={{ padding: "10px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Home Value</th>
              <th style={{ padding: "10px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Mortgage Debt</th>
              <th style={{ padding: "10px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Home Equity</th>
              <th style={{ padding: "10px 8px", color: "var(--primary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Buyer Net Worth</th>
              <th style={{ padding: "10px 8px", color: "var(--tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Buyer Sunk Costs</th>
              <th style={{ padding: "10px 8px", color: "var(--secondary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Renter ISA Pot</th>
              <th style={{ padding: "10px 8px", color: "var(--secondary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Renter Net Worth</th>
              <th style={{ padding: "10px 8px", color: "var(--tertiary)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Renter Sunk Rent</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => (
              <tr
                key={row.year}
                style={{
                  borderBottom: "1px solid var(--surface-border)",
                  transition: "background 0.15s ease",
                }}
              >
                <td style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Year {row.year}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--text-primary)" }}>{formatGBP(row.homeValue)}</td>
                <td style={{ padding: "10px 8px", color: "var(--text-secondary)" }}>
                  {formatGBP(row.mortgageBalance)}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--text-primary)" }}>{formatGBP(row.buyerEquity)}</td>
                <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--primary)" }}>
                  {formatGBP(row.buyerTotalNetWorth)}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--tertiary)" }}>
                  {formatGBP(row.buyerSunkCostsCumulative)}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--text-primary)" }}>{formatGBP(row.renterInvestmentPot)}</td>
                <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--secondary)" }}>
                  {formatGBP(row.renterTotalNetWorth)}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--tertiary)" }}>
                  {formatGBP(row.renterSunkCostsCumulative)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
