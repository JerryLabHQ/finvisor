"use client";

import React from "react";
import Link from "next/link";
import { useFinancialProfile } from "@/lib/financial-profile-store";
import { UKTaxJurisdiction } from "@/lib/constants";
import { getPropertyTaxLabel } from "@/lib/calculator";
import { Sparkles, Wallet, Percent, Home, MapPin } from "lucide-react";

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function UnifiedTwinBar() {
  const { profile, snapshot, updateProfile, hydrated } = useFinancialProfile();

  if (!hydrated) return null;

  const taxLabel = getPropertyTaxLabel(profile.jurisdiction);

  return (
    <div
      role="region"
      aria-label="Live UK Household Payslip & Borrowing Capacity Bar"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--surface-border)",
        padding: "8px 20px",
        fontSize: 12,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <div
        style={{
          maxWidth: 1360,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Twin Status Pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 8px",
              borderRadius: 4,
              background: "var(--primary-light)",
              color: "var(--primary)",
              border: "1px solid var(--primary-border)",
              fontWeight: 700,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <Sparkles size={11} />
            <span>UK Financial Twin Sync</span>
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
            Gross:{" "}
            <strong style={{ color: "var(--text-primary)" }}>
              {formatGBP(snapshot.grossSalary)}/yr
            </strong>
            {snapshot.annualPensionSacrifice > 0 && (
              <>
                {" "}
                • SIPP: <strong style={{ color: "var(--primary)" }}>-{formatGBP(snapshot.annualPensionSacrifice)}</strong>
              </>
            )}
            {snapshot.annualEvSacrifice > 0 && (
              <>
                {" "}
                • EV SalSac: <strong style={{ color: "var(--primary)" }}>-{formatGBP(snapshot.annualEvSacrifice)}</strong>
              </>
            )}
          </span>
        </div>

        {/* Center: Live Payslip & Borrowing Metrics */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Link
            href="/tax"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              color: "var(--text-secondary)",
            }}
            title="Adjust SIPP Salary Sacrifice in the 60% Tax Trap Engine"
          >
            <Percent size={12} style={{ color: snapshot.inTaxTrapZone ? "var(--tertiary)" : "var(--primary)" }} />
            <span>
              Adjusted Net Income:{" "}
              <strong style={{ color: "var(--text-primary)" }}>{formatGBP(snapshot.adjustedNetIncome)}</strong>{" "}
              <span
                style={{
                  color: snapshot.inTaxTrapZone ? "var(--tertiary)" : "var(--primary)",
                  fontWeight: 700,
                }}
              >
                ({snapshot.effectiveMarginalRatePercent}% Marginal)
              </span>
            </span>
          </Link>

          <span style={{ color: "var(--surface-border)" }} aria-hidden="true">|</span>

          <Link
            href="/ev"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              color: "var(--text-secondary)",
            }}
            title="View Net Take-Home & EV Salary Sacrifice Impact"
          >
            <Wallet size={12} style={{ color: "var(--primary)" }} />
            <span>
              Net Take-Home:{" "}
              <strong style={{ color: "var(--primary)" }}>{formatGBP(snapshot.monthlyNetTakeHome)}/mo</strong>
            </span>
          </Link>

          <span style={{ color: "var(--surface-border)" }} aria-hidden="true">|</span>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              color: "var(--text-secondary)",
            }}
            title="Model Max Mortgage Borrowing Capacity in Buy vs Rent"
          >
            <Home size={12} style={{ color: "var(--secondary)" }} />
            <span>
              Max Mortgage Capacity:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {formatGBP(snapshot.maxMortgageBorrowingCapacity)}
              </strong>{" "}
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>(4.5x Net-Adj)</span>
            </span>
          </Link>
        </div>

        {/* Right: Devolved UK Tax Jurisdiction Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MapPin size={12} style={{ color: "var(--primary)" }} />
          <label htmlFor="twin-jurisdiction-select" style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
            Tax Regime ({taxLabel}):
          </label>
          <select
            id="twin-jurisdiction-select"
            value={profile.jurisdiction}
            onChange={(e) => updateProfile({ jurisdiction: e.target.value as UKTaxJurisdiction })}
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid var(--surface-border)",
              background: "var(--surface-tray)",
              color: "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            <option value="ENGLAND_NI">England & NI (SDLT)</option>
            <option value="SCOTLAND">Scotland (LBTT)</option>
            <option value="WALES">Wales (LTT)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
