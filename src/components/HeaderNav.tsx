"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
} from "lucide-react";
import { UK_MARKET_DEFAULTS, SUPPORT_URL, SUPPORT_LABEL } from "@/lib/constants";

export const FINANCIAL_MODELS = [
  {
    href: "/tax",
    label: "60% Marginal Tax Trap",
    subtitle: "Personal Allowance clawback & SIPP optimization",
    icon: Percent,
  },
  {
    href: "/ev",
    label: "EV Salary Sacrifice",
    subtitle: "Employer BiK rates (2%-5%) vs PCP vs buying",
    icon: Zap,
  },
  {
    href: "/student-loan",
    label: "Student Loan Payoff",
    subtitle: "Plan 2 vs 5 statutory write-off audit",
    icon: GraduationCap,
  },
  {
    href: "/property/spv",
    label: "BTL Limited Company SPV",
    subtitle: "Section 24 mortgage relief & 19% Corp Tax",
    icon: Building,
  },
  {
    href: "/retirement",
    label: "Pension & FIRE Model",
    subtitle: "Flexible drawdown vs annuity & 2027 IHT bridge",
    icon: Coins,
  },
];

export const LADDER_MODULES = [
  {
    href: "/",
    label: "Buy vs Rent",
    fullTitle: "Buy vs Rent & Mortgages (Flagship)",
    icon: Scale,
  },
  ...FINANCIAL_MODELS.map((m) => ({
    href: m.href,
    label: m.label,
    fullTitle: m.subtitle,
    icon: m.icon,
  })),
];

interface HeaderNavProps {
  currentModule?: string;
}

export function HeaderNav({ currentModule }: HeaderNavProps = {}) {
  const pathname = usePathname();
  const [modelsDropdownOpen, setModelsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setModelsDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPropertyActive = pathname === "/" || (pathname?.startsWith("/?") ?? false);
  const isCitiesActive = pathname?.startsWith("/city");
  const activeModel = FINANCIAL_MODELS.find(
    (m) => pathname === m.href || pathname?.startsWith(m.href)
  );
  const isModelsActive = Boolean(activeModel);

  return (
    <header
      className="ladder-header"
      aria-label={currentModule ? `${currentModule} Module - The UK Financial Ladder` : "The UK Financial Ladder"}
    >
      {/* Top Main Executive Navigation Bar */}
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

        {/* Desktop Executive Links & Dropdown (No Calculator Farm Tabs) */}
        <div className="ladder-nav__center">
          <div className="executive-nav" role="navigation">
            <Link
              href="/"
              className={`executive-nav-link ${isPropertyActive ? "active" : ""}`}
              title="Buy vs Rent & Mortgages (Flagship Engine)"
            >
              <Scale size={14} className="executive-nav-link__icon" />
              <span>Buy vs Rent (Flagship)</span>
            </Link>

            <Link
              href="/city/london"
              className={`executive-nav-link ${isCitiesActive ? "active" : ""}`}
              title="Regional UK City Benchmarks (10 Major Hubs)"
            >
              <Building size={14} className="executive-nav-link__icon" />
              <span>UK Cities</span>
            </Link>

            {/* Financial Models Dropdown Popover */}
            <div className="executive-dropdown-wrap" ref={dropdownRef}>
              <button
                type="button"
                className={`executive-nav-link executive-dropdown-toggle ${isModelsActive ? "active" : ""} ${modelsDropdownOpen ? "open" : ""}`}
                onClick={() => setModelsDropdownOpen(!modelsDropdownOpen)}
                aria-expanded={modelsDropdownOpen}
                aria-haspopup="true"
              >
                <span>{activeModel ? activeModel.label : "Financial Models"}</span>
                <ChevronDown
                  size={14}
                  className={`dropdown-chevron ${modelsDropdownOpen ? "rotated" : ""}`}
                />
              </button>

              {modelsDropdownOpen && (
                <div className="executive-dropdown-menu" role="menu">
                  <div className="executive-dropdown-header">
                    <span>Specialist UK Financial Engines</span>
                  </div>
                  {FINANCIAL_MODELS.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`executive-dropdown-item ${active ? "active" : ""}`}
                        role="menuitem"
                        onClick={() => setModelsDropdownOpen(false)}
                      >
                        <div className="executive-dropdown-icon">
                          <Icon size={16} />
                        </div>
                        <div className="executive-dropdown-text">
                          <div className="executive-dropdown-title">
                            {item.label}
                            {active && <span className="active-dot" aria-hidden="true" />}
                          </div>
                          <div className="executive-dropdown-sub">{item.subtitle}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Action Utilities */}
        <div className="ladder-nav__right">
          <a
            href="https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate"
            target="_blank"
            rel="noreferrer"
            className="boe-pill"
            title="Current Bank of England Official Bank Rate • MPC Indexed"
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
          <div className="mobile-drawer__section-title">Core Property Intelligence</div>
          <div className="mobile-drawer__list">
            <Link
              href="/"
              className={`mobile-drawer__item ${isPropertyActive ? "mobile-drawer__item--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer__item-icon">
                <Scale size={16} />
              </div>
              <div className="mobile-drawer__item-info">
                <div className="mobile-drawer__item-title">Buy vs Rent (Flagship)</div>
                <div className="mobile-drawer__item-desc">40-year mortgage amortization & SDLT relief</div>
              </div>
            </Link>

            <Link
              href="/city/london"
              className={`mobile-drawer__item ${isCitiesActive ? "mobile-drawer__item--active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer__item-icon">
                <Building size={16} />
              </div>
              <div className="mobile-drawer__item-info">
                <div className="mobile-drawer__item-title">UK Regional Cities</div>
                <div className="mobile-drawer__item-desc">Price-to-rent ratios across 10 major hubs</div>
              </div>
            </Link>
          </div>

          <div className="mobile-drawer__section-title" style={{ marginTop: 8 }}>
            Specialist Financial Models
          </div>
          <div className="mobile-drawer__list">
            {FINANCIAL_MODELS.map((item) => {
              const active = pathname === item.href;
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
                    <div className="mobile-drawer__item-desc">{item.subtitle}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mobile-drawer__footer">
            {SUPPORT_URL && (
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="layout__header-donate"
                style={{ justifyContent: "center" }}
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
