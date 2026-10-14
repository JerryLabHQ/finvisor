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
    <div className="glass-panel" style={{ padding: "24px", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
            <GitCompare size={14} />
            <span>SIDE-BY-SIDE PROPERTY BENCHMARKING</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
            Compare Two Property Decisions
          </h3>
          <p style={{ color: "var(--on-surface-variant)", fontSize: 13, marginTop: 4 }}>
            Directly test how changing property price or location impacts your required cash, monthly outgoings, and wealth trajectory.
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Scenario 1 */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 18, borderRadius: 10, border: "1px solid rgba(0, 229, 255, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>Scenario 1 (Current Active)</span>
            <span style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{formatGBP(baseInputs.propertyPrice)}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Upfront Cash Required:</span>
              <strong style={{ color: "#fff" }}>{formatGBP(scenarioA.buyUpfrontCosts)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Initial Monthly Mortgage:</span>
              <strong style={{ color: "var(--primary)" }}>{formatGBP(scenarioA.initialMonthlyMortgage)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Stamp Duty (SDLT):</span>
              <span style={{ color: "#fff" }}>{formatGBP(scenarioA.sdltCost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Break-Even Horizon:</span>
              <span style={{ color: scenarioA.breakEvenYear ? "var(--secondary)" : "var(--tertiary)", fontWeight: 700 }}>
                {scenarioA.breakEvenYear ? `Year ${scenarioA.breakEvenYear}` : "Renting Wins"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, marginTop: 4 }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Projected Net Worth ({baseInputs.timeHorizonYears}y):</span>
              <strong style={{ color: "#fff" }}>{formatGBP(scenarioA.annualBreakdown[scenarioA.annualBreakdown.length - 1]?.buyerTotalNetWorth || 0)}</strong>
            </div>
          </div>
        </div>

        {/* Scenario 2 */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 18, borderRadius: 10, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--secondary)" }}>Scenario 2 (Alternative Test)</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Price £</span>
                <input
                  type="number"
                  value={altPrice}
                  onChange={(e) => setAltPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 75,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: 11,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Dep %</span>
                <input
                  type="number"
                  value={altDepositPct}
                  onChange={(e) => setAltDepositPct(Math.min(90, Math.max(5, parseFloat(e.target.value) || 10)))}
                  style={{
                    width: 48,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: 11,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--on-surface-variant)" }}>Rent £</span>
                <input
                  type="number"
                  value={altRent}
                  onChange={(e) => setAltRent(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: 60,
                    padding: "3px 6px",
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: 11,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Upfront Cash Required:</span>
              <strong style={{ color: "#fff" }}>{formatGBP(scenarioB.buyUpfrontCosts)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Initial Monthly Mortgage:</span>
              <strong style={{ color: "var(--secondary)" }}>{formatGBP(scenarioB.initialMonthlyMortgage)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Stamp Duty (SDLT):</span>
              <span style={{ color: "#fff" }}>{formatGBP(scenarioB.sdltCost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Break-Even Horizon:</span>
              <span style={{ color: scenarioB.breakEvenYear ? "var(--secondary)" : "var(--tertiary)", fontWeight: 700 }}>
                {scenarioB.breakEvenYear ? `Year ${scenarioB.breakEvenYear}` : "Renting Wins"}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, marginTop: 4 }}>
              <span style={{ color: "var(--on-surface-variant)" }}>Projected Net Worth ({baseInputs.timeHorizonYears}y):</span>
              <strong style={{ color: "#fff" }}>{formatGBP(scenarioB.annualBreakdown[scenarioB.annualBreakdown.length - 1]?.buyerTotalNetWorth || 0)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
