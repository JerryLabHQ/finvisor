"use client";

import React from "react";
import Link from "next/link";
import { UK_MARKET_DEFAULTS } from "@/lib/constants";
import { Landmark, TrendingUp, AlertTriangle, Home, Percent } from "lucide-react";

export function MacroDataTicker() {
  return (
    <div className="macro-ticker" role="region" aria-label="UK Macroeconomic and Statutory Benchmark Ticker">
      <div className="macro-ticker__inner">
        <div className="macro-ticker__label">
          <span className="macro-ticker__live-dot" aria-hidden="true" />
          <span className="macro-ticker__source">UK STATUTORY BENCHMARKS</span>
        </div>

        <div className="macro-ticker__items" tabIndex={0} aria-label="Scrollable macroeconomic rates">
          <div className="macro-ticker__item">
            <span className="macro-ticker__key">
              <Landmark size={12} className="macro-ticker__icon" /> BoE Base:
            </span>
            <span className="macro-ticker__val">{UK_MARKET_DEFAULTS.boeBaseRate}%</span>
            <span className="macro-ticker__badge">MPC</span>
          </div>

          <div className="macro-ticker__divider" aria-hidden="true">•</div>

          <div className="macro-ticker__item">
            <span className="macro-ticker__key">
              <Percent size={12} className="macro-ticker__icon" /> 2y Fixed Mortgages:
            </span>
            <span className="macro-ticker__val">{UK_MARKET_DEFAULTS.defaultMortgageRate}%</span>
            <span className="macro-ticker__sub">75% LTV</span>
          </div>

          <div className="macro-ticker__divider" aria-hidden="true">•</div>

          <div className="macro-ticker__item">
            <span className="macro-ticker__key">
              <TrendingUp size={12} className="macro-ticker__icon" /> 5y Fixed Mortgages:
            </span>
            <span className="macro-ticker__val">4.10%</span>
            <span className="macro-ticker__sub">Market Avg</span>
          </div>

          <div className="macro-ticker__divider" aria-hidden="true">•</div>

          <div className="macro-ticker__item">
            <span className="macro-ticker__key">CPI Inflation:</span>
            <span className="macro-ticker__val">2.8%</span>
            <span className="macro-ticker__sub">ONS Target 2%</span>
          </div>

          <div className="macro-ticker__divider" aria-hidden="true">•</div>

          <div className="macro-ticker__item">
            <span className="macro-ticker__key">
              <Home size={12} className="macro-ticker__icon" /> UK Avg Rent:
            </span>
            <span className="macro-ticker__val">£1,320<span className="text-xs">/mo</span></span>
            <span className="macro-ticker__sub">ONS HPI</span>
          </div>

          <div className="macro-ticker__divider" aria-hidden="true">•</div>

          <div className="macro-ticker__item macro-ticker__item--alert">
            <AlertTriangle size={12} className="macro-ticker__icon text-amber" />
            <span className="macro-ticker__alert-text">
              <strong>Statutory SDLT Sunset:</strong> FTB nil-rate band drops from £425,000 to £300,000 in April 2026
            </span>
            <Link href="/" className="macro-ticker__alert-link">
              Audit Impact →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
