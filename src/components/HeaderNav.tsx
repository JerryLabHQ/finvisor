"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  Percent,
  Zap,
  GraduationCap,
  Building,
  Coins,
  Coffee,
  Share2,
  Menu,
  X,
  Check,
} from "lucide-react";
import { UK_MARKET_DEFAULTS, SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";

export const LADDER_MODULES = [
  {
    href: "/",
    label: "Property",
    fullTitle: "Buy vs Rent & Mortgages",
    icon: Scale,
    badge: "Flagship",
  },
  {
    href: "/tax",
    label: "60% Tax Trap",
    fullTitle: "Tax Trap & SIPP Optimizer",
    icon: Percent,
    badge: "High Earner",
  },
  {
    href: "/ev",
    label: "EV Car",
    fullTitle: "EV Salary Sacrifice vs PCP",
    icon: Zap,
    badge: "Save 40%+",
  },
  {
    href: "/student-loan",
    label: "Student Loan",
    fullTitle: "Plan 2 vs 5 & Overpay Guide",
    icon: GraduationCap,
    badge: "Wipeout",
  },
  {
    href: "/property/spv",
    label: "BTL SPV",
    fullTitle: "Ltd Co SPV vs Personal BTL",
    icon: Building,
    badge: "Section 24",
  },
  {
    href: "/retirement",
    label: "Retirement",
    fullTitle: "Pension Drawdown & FIRE",
    icon: Coins,
    badge: "2027 IHT",
  },
];

interface HeaderNavProps {
  currentModule?: string;
}

export function HeaderNav({ currentModule }: HeaderNavProps = {}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isModuleActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname?.startsWith("/city");
    }
    return pathname === href || pathname?.startsWith(href);
  };

  return (
    <header className="ladder-header" aria-label={currentModule ? `${currentModule} Module - The UK Financial Ladder` : "The UK Financial Ladder"}>
      {/* Top Main Navigation Bar */}
      <nav className="ladder-nav" aria-label="Main Navigation">
        <div className="ladder-nav__left">
          <Link href="/" className="logo-link">
            <span className="logo-icon" aria-hidden="true">🇬🇧</span>
            <div className="logo-text-group">
              <span className="logo-title">
                Ladder<span className="logo-accent">Pass</span>
              </span>
              <span className="logo-subtitle">The UK Financial Ladder</span>
            </div>
          </Link>
        </div>

        {/* Desktop Suite Links */}
        <div className="ladder-nav__center">
          <ul className="suite-pills" role="tablist">
            {LADDER_MODULES.map((item) => {
              const active = isModuleActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href} role="presentation">
                  <Link
                    href={item.href}
                    className={`suite-pill ${active ? "suite-pill--active" : ""}`}
                    title={item.fullTitle}
                  >
                    <Icon size={14} className="suite-pill__icon" />
                    <span className="suite-pill__label">{item.label}</span>
                    {item.badge && !active && (
                      <span className="suite-pill__badge">{item.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Action Utilities */}
        <div className="ladder-nav__right">
          <a
            href="https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
            target="_blank"
            rel="noreferrer"
            className="boe-pill"
            title="Current Bank of England Official Bank Rate"
          >
            <span className="pulse-dot"></span>
            <span>BoE Base: {UK_MARKET_DEFAULTS.boeBaseRate}%</span>
          </a>

          {/* Preserved Buy Me A Coffee pill button */}
          {SUPPORT_URL && (
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="layout__header-donate"
              title="Support this free independent UK project"
            >
              <Coffee size={14} />
              <span>{SUPPORT_LABEL}</span>
            </a>
          )}

          <button
            onClick={handleCopyShareLink}
            className="share-nav-btn"
            title="Share with partner or colleague"
            type="button"
          >
            {copied ? <Check size={13} style={{ color: "var(--accent-green)" }} /> : <Share2 size={13} />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="ladder-nav__mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="ladder-nav__mobile-drawer">
          <div className="mobile-drawer__section-title">The UK Financial Ladder</div>
          <div className="mobile-drawer__list">
            {LADDER_MODULES.map((item) => {
              const active = isModuleActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-drawer__item ${active ? "mobile-drawer__item--active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="mobile-drawer__item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="mobile-drawer__item-info">
                    <div className="mobile-drawer__item-title">{item.label}</div>
                    <div className="mobile-drawer__item-desc">{item.fullTitle}</div>
                  </div>
                  {item.badge && (
                    <span className="suite-pill__badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="mobile-drawer__footer">
            <Link
              href="/city/london"
              className="mobile-drawer__link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building size={14} />
              <span>Regional UK City Benchmarks</span>
            </Link>
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="layout__header-donate"
                style={{ justifyContent: "center", marginTop: 8 }}
              >
                <Coffee size={14} />
                <span>{SUPPORT_LABEL}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
