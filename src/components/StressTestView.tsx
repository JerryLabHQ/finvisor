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
    <div className="glass-panel" style={{ padding: "24px", marginTop: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
            <ShieldAlert size={14} />
            <span>MACRO STRESS TESTING & SENSITIVITY</span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
            What If Market Conditions Shift?
          </h3>
          <p style={{ color: "var(--on-surface-variant)", fontSize: 13, marginTop: 4 }}>
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
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{scenario.title}</span>
                  {isPositive ? (
                    <ArrowUpRight size={16} style={{ color: "var(--primary)" }} />
                  ) : (
                    <ArrowDownRight size={16} style={{ color: "var(--secondary)" }} />
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--on-surface-variant)", lineHeight: 1.4, marginBottom: 12 }}>
                  {scenario.description}
                </p>
              </div>

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--on-surface-variant)" }}>Net Difference:</span>
                  <span style={{ fontWeight: 700, color: isPositive ? "var(--primary)" : "var(--secondary)" }}>
                    {isPositive ? "+" : ""}{formatGBP(scenario.netWorthDiff)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "var(--on-surface-variant)" }}>Break-Even:</span>
                  <span style={{ fontWeight: 600, color: scenario.breakEven ? "#fff" : "var(--tertiary)" }}>
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
