"use client";

import React, { useState } from "react";
import { GitCompare } from "lucide-react";
import { CalculatorInputs, runBuyVsRentCalculation } from "@/lib/calculator";

interface ScenarioCompareProps {
  baseInputs: CalculatorInputs;
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function ScenarioCompare({ baseInputs }: ScenarioCompareProps) {
  const [altPrice, setAltPrice] = useState(325000);
  const [altDepositPct, setAltDepositPct] = useState(20);
  const [altRent, setAltRent] = useState(1500);

  const scenarioA = runBuyVsRentCalculation(baseInputs);

  const altInputs: CalculatorInputs = {
    ...baseInputs,
    propertyPrice: altPrice,
    depositPercent: altDepositPct,
    initialRent: altRent,
  };
  const scenarioB = runBuyVsRentCalculation(altInputs);

  return (
    <div className="glass-panel" style={{ padding: "26px", marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            <GitCompare size={14} />
            <span>Side-by-Side Property Benchmarking</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            Compare Two Property Decisions
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
            Directly test how changing property price or location impacts your required cash, monthly outgoings, and wealth trajectory.
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {/* Scenario 1 */}
        <div style={{ background: "var(--surface-subtle)", padding: 20, borderRadius: 10, border: "1px solid var(--primary-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>Scenario 1 (Current Active)</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{formatGBP(baseInputs.propertyPrice)}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Upfront Cash Required:</span>
              <strong style={{ color: "var(--text-primary)" }}>{formatGBP(scenarioA.buyUpfrontCosts)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Initial Monthly Mortgage:</span>
              <strong style={{ color: "var(--primary)" }}>{formatGBP(scenarioA.initialMonthlyMortgage)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Stamp Duty (SDLT):</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(scenarioA.sdltCost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Break-Even Horizon:</span>
              <span style={{ color: scenarioA.breakEvenYear ? "var(--primary)" : "var(--tertiary)", fontWeight: 700 }}>
                {scenarioA.breakEvenYear ? `Year ${scenarioA.breakEvenYear}` : "Renting Wins"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--surface-border)", paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: "var(--text-secondary)" }}>Projected Net Worth ({baseInputs.timeHorizonYears}y):</span>
              <strong style={{ color: "var(--text-primary)", fontSize: 14 }}>{formatGBP(scenarioA.annualBreakdown[scenarioA.annualBreakdown.length - 1]?.buyerTotalNetWorth || 0)}</strong>
            </div>
          </div>
        </div>

        {/* Scenario 2 */}
        <div style={{ background: "var(--surface-subtle)", padding: 20, borderRadius: 10, border: "1px solid var(--secondary-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--secondary)" }}>Scenario 2 (Alternative Test)</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Price £</span>
                <input
                  type="number"
                  value={altPrice}
                  onChange={(e) => setAltPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 75,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--text-primary)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Dep %</span>
                <input
                  type="number"
                  value={altDepositPct}
                  onChange={(e) => setAltDepositPct(Math.min(90, Math.max(5, parseFloat(e.target.value) || 10)))}
                  style={{
                    width: 48,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--text-primary)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Rent £</span>
                <input
                  type="number"
                  value={altRent}
                  onChange={(e) => setAltRent(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 60,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "var(--surface)",
                    border: "1px solid var(--surface-border)",
                    color: "var(--text-primary)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Upfront Cash Required:</span>
              <strong style={{ color: "var(--text-primary)" }}>{formatGBP(scenarioB.buyUpfrontCosts)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Initial Monthly Mortgage:</span>
              <strong style={{ color: "var(--secondary)" }}>{formatGBP(scenarioB.initialMonthlyMortgage)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Stamp Duty (SDLT):</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formatGBP(scenarioB.sdltCost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Break-Even Horizon:</span>
              <span style={{ color: scenarioB.breakEvenYear ? "var(--secondary)" : "var(--tertiary)", fontWeight: 700 }}>
                {scenarioB.breakEvenYear ? `Year ${scenarioB.breakEvenYear}` : "Renting Wins"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--surface-border)", paddingTop: 10, marginTop: 4 }}>
              <span style={{ color: "var(--text-secondary)" }}>Projected Net Worth ({baseInputs.timeHorizonYears}y):</span>
              <strong style={{ color: "var(--text-primary)", fontSize: 14 }}>{formatGBP(scenarioB.annualBreakdown[scenarioB.annualBreakdown.length - 1]?.buyerTotalNetWorth || 0)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
