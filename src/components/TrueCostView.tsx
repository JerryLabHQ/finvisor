"use client";

import React, { useState } from "react";
import { ShieldCheck, Home, PiggyBank, Zap } from "lucide-react";
import { CalculatorResults, CalculatorInputs } from "@/lib/calculator";

interface TrueCostViewProps {
  results: CalculatorResults;
  inputs: CalculatorInputs;
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export function TrueCostView({ results, inputs }: TrueCostViewProps) {
  const [fixedTermYears, setFixedTermYears] = useState<2 | 5>(5);

  const yearsToAudit = Math.min(fixedTermYears, results.annualBreakdown.length);
  const auditSlice = results.annualBreakdown.slice(0, yearsToAudit);

  // 1. Upfront Buying Friction (Sunk Costs)
  const sdltCost = results.sdltCost;
  const legalAndConveyancing = 1500;
  const ricsSurvey = 500;
  const lenderProductFee = 999;
  const upfrontBuyingFriction = sdltCost + legalAndConveyancing + ricsSurvey + lenderProductFee;

  // 2. Ongoing Buying Sunk Costs across fixed term
  const mortgageInterestPaid = auditSlice.reduce((sum, yr) => sum + (yr.interestPaidThisYear || 0), 0);
  const maintenancePaid = auditSlice.reduce((sum, yr) => sum + (yr.maintenancePaidThisYear || 0), 0);
  const serviceChargePaid = auditSlice.reduce((sum, yr) => sum + (yr.serviceChargePaidThisYear || 0), 0);
  const buildingsInsurancePaid = inputs.insuranceMonthly * 12 * yearsToAudit;

  const totalBuyerSunkCosts =
    upfrontBuyingFriction + mortgageInterestPaid + maintenancePaid + serviceChargePaid + buildingsInsurancePaid;

  // Equity built (Recoverable, NOT sunk)
  const principalPaid = auditSlice.reduce((sum, yr) => sum + (yr.principalPaidThisYear || 0), 0);
  const estimatedHpiGain = (auditSlice[auditSlice.length - 1]?.homeValue || inputs.propertyPrice) - inputs.propertyPrice;

  // 3. Ongoing Renting Sunk Costs across fixed term
  const rentPaid = auditSlice.reduce((sum, yr) => sum + (yr.rentPaidThisYear || 0), 0);
  const renterInsurancePaid = inputs.renterInsuranceMonthly * 12 * yearsToAudit;
  const totalRenterSunkCosts = rentPaid + renterInsurancePaid;

  // Sunk Cost Difference
  const sunkDifference = totalBuyerSunkCosts - totalRenterSunkCosts;
  const buyerLowerSunk = sunkDifference < 0;
  const absSunkDiff = Math.abs(sunkDifference);

  return (
    <div className="glass-panel" style={{ padding: "26px", marginTop: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 14 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            <ShieldCheck size={14} />
            <span>Habito &amp; Which? Inspired Cost-of-Borrowing Audit</span>
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            True Cost of Borrowing: Non-Recoverable Sunk Outlay
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4, lineHeight: 1.5, maxWidth: 760 }}>
            Standard mortgage calculators only show your monthly repayment. This institutional audit separates <strong>recoverable equity capital</strong> from <strong>pure non-recoverable sunk friction</strong> (mortgage interest, SDLT, lender arrangement fees, and maintenance) vs. pure rent paid.
          </p>
        </div>

        {/* Term Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface-tray)", padding: 4, borderRadius: 8, border: "1px solid var(--surface-border)" }}>
          <button
            type="button"
            onClick={() => setFixedTermYears(2)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: fixedTermYears === 2 ? "var(--primary)" : "transparent",
              color: fixedTermYears === 2 ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            2-Year Fixed Deal
          </button>
          <button
            type="button"
            onClick={() => setFixedTermYears(5)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              background: fixedTermYears === 5 ? "var(--primary)" : "transparent",
              color: fixedTermYears === 5 ? "#ffffff" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            5-Year Fixed Deal
          </button>
        </div>
      </div>

      {/* Sunk Friction Comparison Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Buying Sunk Friction */}
        <div style={{ background: "var(--surface-subtle)", borderRadius: 10, padding: 22, border: "1px solid var(--surface-border)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Home size={16} style={{ color: "var(--primary)" }} />
              <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>Buyer Sunk Outgoings ({fixedTermYears} Years)</strong>
            </div>
            <span className="tabular-nums" style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "var(--tertiary)" }}>
              {formatGBP(totalBuyerSunkCosts)}
            </span>
          </div>

          <div className="tabular-nums" style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>HMRC Stamp Duty (SDLT):</span>
              <span style={{ fontWeight: 600 }}>{formatGBP(sdltCost)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Lender Product / Booking Fee:</span>
              <span>{formatGBP(lenderProductFee)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Conveyancing Solicitor &amp; Land Registry:</span>
              <span>{formatGBP(legalAndConveyancing)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>RICS Homebuyer Survey:</span>
              <span>{formatGBP(ricsSurvey)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Mortgage Interest ({fixedTermYears}y at {inputs.mortgageRate}%):</span>
              <strong style={{ color: "var(--tertiary)" }}>{formatGBP(mortgageInterestPaid)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Maintenance &amp; Buildings Insurance ({fixedTermYears}y):</span>
              <span>{formatGBP(maintenancePaid + buildingsInsurancePaid)}</span>
            </div>
            {serviceChargePaid > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Leasehold Service Charges ({fixedTermYears}y):</span>
                <span>{formatGBP(serviceChargePaid)}</span>
              </div>
            )}
          </div>

          {/* Equity Accrual Note (Recoverable Asset) */}
          <div style={{ marginTop: "auto", padding: "10px 12px", background: "var(--primary-light)", borderRadius: 6, border: "1px solid var(--primary-border)", fontSize: 12, lineHeight: 1.45 }}>
            <span style={{ fontWeight: 700, color: "var(--primary)" }}>Wealth Retained: </span>
            <span style={{ color: "var(--primary-dark)" }}>
              During this {fixedTermYears}-year period, you also repay <strong>{formatGBP(principalPaid)}</strong> of mortgage loan principal into home equity, plus an estimated <strong>+{formatGBP(estimatedHpiGain)}</strong> in capital appreciation.
            </span>
          </div>
        </div>

        {/* Renting Sunk Friction */}
        <div style={{ background: "var(--surface-subtle)", borderRadius: 10, padding: 22, border: "1px solid var(--surface-border)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--surface-border)", paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PiggyBank size={16} style={{ color: "var(--secondary)" }} />
              <strong style={{ fontSize: 15, color: "var(--text-primary)" }}>Renter Sunk Outgoings ({fixedTermYears} Years)</strong>
            </div>
            <span className="tabular-nums" style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "var(--tertiary)" }}>
              {formatGBP(totalRenterSunkCosts)}
            </span>
          </div>

          <div className="tabular-nums" style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Initial Rent ({formatGBP(inputs.initialRent)}/mo):</span>
              <span style={{ fontWeight: 600 }}>{formatGBP(inputs.initialRent * 12)}/yr</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Total Rent Paid Over {fixedTermYears} Years:</span>
              <strong style={{ color: "var(--tertiary)" }}>{formatGBP(rentPaid)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Rent Inflation Applied:</span>
              <span>{inputs.rentIncreasePercent}% per annum</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Tenant Contents Insurance ({fixedTermYears}y):</span>
              <span>{formatGBP(renterInsurancePaid)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Stamp Duty (SDLT) Liability:</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>£0 (Exempt)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-secondary)" }}>Lender &amp; Survey Fees:</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>£0 (Exempt)</span>
            </div>
          </div>

          {/* S&S ISA Growth Opportunity */}
          <div style={{ marginTop: "auto", padding: "10px 12px", background: "var(--secondary-light)", borderRadius: 6, border: "1px solid var(--secondary-border)", fontSize: 12, lineHeight: 1.45 }}>
            <span style={{ fontWeight: 700, color: "var(--secondary)" }}>Opportunity Pot: </span>
            <span style={{ color: "var(--secondary-dark)" }}>
              By not paying <strong>{formatGBP(results.buyUpfrontCosts)}</strong> in upfront cash, your deposit compounds in a tax-free Stocks &amp; Shares ISA at {inputs.investmentReturnPercent}% annual return.
            </span>
          </div>
        </div>
      </div>

      {/* Sunk Friction Verdict Slip */}
      <div
        style={{
          marginTop: 18,
          padding: "16px 20px",
          borderRadius: 8,
          background: buyerLowerSunk ? "var(--primary-light)" : "#eff6ff",
          border: `1px solid ${buyerLowerSunk ? "var(--primary-border)" : "#bfdbfe"}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={18} style={{ color: buyerLowerSunk ? "var(--primary)" : "var(--secondary)" }} />
          <div>
            <strong style={{ color: buyerLowerSunk ? "var(--primary)" : "var(--secondary)", fontSize: 14 }}>
              {buyerLowerSunk
                ? `Buying Sinks ${formatGBP(absSunkDiff)} LESS than Renting over ${fixedTermYears} years`
                : `Renting Sinks ${formatGBP(absSunkDiff)} LESS in pure friction than Buying over ${fixedTermYears} years`}
            </strong>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              {buyerLowerSunk
                ? `Your mortgage interest and buying friction are lower than the cumulative rent you would have paid to a landlord.`
                : `Because Stamp Duty and upfront friction take time to amortize, renting preserves more cash in the first ${fixedTermYears} years unless property capital growth compensates.`}
            </div>
          </div>
        </div>

        <div className="tabular-nums" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", fontWeight: 700 }}>
            {fixedTermYears}-Year Friction Gap
          </span>
          <div style={{ fontSize: 18, fontWeight: 700, color: buyerLowerSunk ? "var(--primary)" : "var(--secondary)" }}>
            {formatGBP(absSunkDiff)}
          </div>
        </div>
      </div>
    </div>
  );
}
