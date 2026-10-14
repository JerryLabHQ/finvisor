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
    <div className="glass-panel" style={{ padding: "24px", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Table size={18} style={{ color: "var(--primary)" }} />
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>
              Year-by-Year Cash Flow & Amortization Schedule
            </h3>
            <span style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
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
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          <span>{isExpanded ? "Collapse Table" : `Show All ${annualBreakdown.length} Years`}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "right" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", color: "var(--on-surface-variant)" }}>
              <th style={{ textAlign: "left", padding: "10px 8px" }}>Year</th>
              <th style={{ padding: "10px 8px" }}>Home Value</th>
              <th style={{ padding: "10px 8px" }}>Mortgage Debt</th>
              <th style={{ padding: "10px 8px" }}>Home Equity</th>
              <th style={{ padding: "10px 8px", color: "var(--primary)" }}>Buyer Net Worth</th>
              <th style={{ padding: "10px 8px", color: "var(--tertiary)" }}>Buyer Sunk Costs</th>
              <th style={{ padding: "10px 8px", color: "var(--secondary)" }}>Renter ISA Pot</th>
              <th style={{ padding: "10px 8px", color: "var(--secondary)" }}>Renter Net Worth</th>
              <th style={{ padding: "10px 8px", color: "var(--tertiary)" }}>Renter Sunk Rent</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => (
              <tr
                key={row.year}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
                  transition: "background 0.15s ease",
                }}
              >
                <td style={{ textAlign: "left", padding: "10px 8px", fontWeight: 700, color: "#fff" }}>
                  Year {row.year}
                </td>
                <td style={{ padding: "10px 8px" }}>{formatGBP(row.homeValue)}</td>
                <td style={{ padding: "10px 8px", color: "var(--on-surface-variant)" }}>
                  {formatGBP(row.mortgageBalance)}
                </td>
                <td style={{ padding: "10px 8px", color: "#fff" }}>{formatGBP(row.buyerEquity)}</td>
                <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--primary)" }}>
                  {formatGBP(row.buyerTotalNetWorth)}
                </td>
                <td style={{ padding: "10px 8px", color: "var(--tertiary)" }}>
                  {formatGBP(row.buyerSunkCostsCumulative)}
                </td>
                <td style={{ padding: "10px 8px" }}>{formatGBP(row.renterInvestmentPot)}</td>
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
