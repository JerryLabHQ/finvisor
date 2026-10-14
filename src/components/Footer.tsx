import React from "react";
import Link from "next/link";
import { Coffee, ShieldCheck, Database, Landmark, ExternalLink } from "lucide-react";
import { UK_MARKET_DEFAULTS, SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";
import { UK_CITIES } from "@/lib/cities";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ladder-footer" role="contentinfo" aria-label="LadderPass Institutional Footer">
      <div className="ladder-footer__container">
        {/* 4-Column Editorial Matrix */}
        <div className="ladder-footer__grid">
          {/* Column 1: Brand & Independent Mission */}
          <div className="ladder-footer__col ladder-footer__brand">
            <Link href="/" className="logo-link" style={{ marginBottom: 4 }}>
              <span className="logo-icon" aria-hidden="true">🇬🇧</span>
              <div className="logo-text-group">
                <span className="logo-title">
                  Ladder<span className="logo-accent">Pass</span>
                </span>
                <span className="logo-subtitle">The UK Financial Ladder</span>
              </div>
            </Link>

            <p className="ladder-footer__mission">
              Independent financial algorithms engineered to decode UK fiscal policy, residential property economics, and tax-efficient wealth compounding. 100% self-serve, ad-free, and private.
            </p>

            <div className="ladder-footer__status-badge">
              <span className="pulse-dot" aria-hidden="true" />
              <span>BoE Official Bank Rate: {UK_MARKET_DEFAULTS.boeBaseRate}% • MPC Indexed</span>
            </div>

            {SUPPORT_URL && (
              <div style={{ marginTop: 8 }}>
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="layout__header-donate"
                  style={{ display: "inline-flex" }}
                  title="Support this free independent UK project"
                >
                  <Coffee size={14} />
                  <span>{SUPPORT_LABEL}</span>
                </a>
              </div>
            )}
          </div>

          {/* Column 2: Financial Engines Directory */}
          <div className="ladder-footer__col">
            <h4 className="ladder-footer__heading">Financial Engines</h4>
            <ul className="ladder-footer__list">
              <li>
                <Link href="/" className="ladder-footer__link">
                  Buy vs Rent (Flagship)
                </Link>
              </li>
              <li>
                <Link href="/tax" className="ladder-footer__link">
                  60% Marginal Tax Trap
                </Link>
              </li>
              <li>
                <Link href="/ev" className="ladder-footer__link">
                  EV Salary Sacrifice vs PCP
                </Link>
              </li>
              <li>
                <Link href="/student-loan" className="ladder-footer__link">
                  Student Loan Payoff Guide
                </Link>
              </li>
              <li>
                <Link href="/property/spv" className="ladder-footer__link">
                  BTL Limited Company SPV
                </Link>
              </li>
              <li>
                <Link href="/retirement" className="ladder-footer__link">
                  Pension Drawdown & FIRE
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Regional UK Housing Benchmarks */}
          <div className="ladder-footer__col">
            <h4 className="ladder-footer__heading">Regional Housing Hubs</h4>
            <ul className="ladder-footer__list">
              {UK_CITIES.slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link href={`/city/${c.slug}`} className="ladder-footer__link">
                    {c.name} ({new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(c.averagePrice)})
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Statutory Citations & Regulatory Notice */}
          <div className="ladder-footer__col">
            <h4 className="ladder-footer__heading">Statutory Citations</h4>
            <ul className="ladder-footer__list">
              <li>
                <a
                  href="https://www.gov.uk/stamp-duty-land-tax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ladder-footer__link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <span>HMRC Stamp Duty (SDLT)</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.gov.uk/income-tax-rates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ladder-footer__link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <span>HMRC 2024/25 Tax Bands</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ladder-footer__link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <span>Bank of England MPC Rate</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://landregistry.data.gov.uk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ladder-footer__link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <span>HM Land Registry UK HPI</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ladder-footer__link"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
                >
                  <span>ONS Private Rental Index</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Statutory Legal Bar */}
        <div className="ladder-footer__bottom">
          <p className="ladder-footer__disclaimer">
            © {currentYear} LadderPass. Quantitative financial simulations provided strictly for educational and informational purposes under English law. This application is not regulated by the Financial Conduct Authority (FCA) and does not provide financial, legal, or mortgage advice pursuant to the Financial Services and Markets Act 2000 (FSMA). Consult an FCA-authorised Independent Financial Adviser (IFA) or qualified mortgage broker for bespoke planning.
          </p>

          <div className="ladder-footer__trust-badges">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Landmark size={13} style={{ color: "var(--primary)" }} />
              <span>Bank of England Indexed</span>
            </span>
            <span aria-hidden="true">•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Database size={13} style={{ color: "var(--primary)" }} />
              <span>HMRC 2024/25 Audited</span>
            </span>
            <span aria-hidden="true">•</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <ShieldCheck size={13} style={{ color: "var(--primary)" }} />
              <span>Zero-Tracking Privacy</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
