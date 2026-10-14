"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, ShieldAlert } from "lucide-react";
import { CalculatorInputs, runStressTests } from "@/lib/calculator";

interface StressTestViewProps {
  inputs: CalculatorInputs;
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function StressTestView({ inputs }: StressTestViewProps) {
  const stressScenarios = runStressTests(inputs);

  return (
    <div className="glass-panel" style={{ padding: "26px", marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            <ShieldAlert size={14} />
            <span>Macro Stress Testing & Sensitivity</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            What If UK Market Conditions Shift?
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
            Simulate how interest rate hikes, falling house prices, or surging rental inflation alter your financial break-even.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {stressScenarios.map((scenario) => {
          const isPositive = scenario.netWorthDiff >= 0;
          return (
            <div
              key={scenario.id}
              style={{
                background: "var(--surface-subtle)",
                border: "1px solid var(--surface-border)",
                borderRadius: 10,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{scenario.title}</span>
                  {isPositive ? (
                    <ArrowUpRight size={16} style={{ color: "var(--primary)" }} />
                  ) : (
                    <ArrowDownRight size={16} style={{ color: "var(--secondary)" }} />
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                  {scenario.description}
                </p>
              </div>

              <div style={{ borderTop: "1px solid var(--surface-border)", paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Net Difference:</span>
                  <span style={{ fontWeight: 700, color: isPositive ? "var(--primary)" : "var(--secondary)" }}>
                    {isPositive ? "+" : ""}{formatGBP(scenario.netWorthDiff)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Break-Even:</span>
                  <span style={{ fontWeight: 600, color: scenario.breakEven ? "var(--text-primary)" : "var(--tertiary)" }}>
                    {scenario.breakEven ? `Yr ${scenario.breakEven}` : "Renting Wins"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
