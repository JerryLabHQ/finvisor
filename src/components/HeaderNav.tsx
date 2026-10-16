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
  Share2,
  Menu,
  X,
  Check,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { MacroDataTicker } from "@/components/MacroDataTicker";
import { UnifiedTwinBar } from "@/components/UnifiedTwinBar";

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
    subtitle: "Section 24 mortgage relief & 19%-25% Corp Tax",
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
    fullTitle: "Buy vs Rent & Mortgages",
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
  const isPartnersActive = pathname?.startsWith("/partners");
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

        {/* Desktop Executive Links & Dropdown */}
        <div className="ladder-nav__center">
          <div className="executive-nav" role="navigation">
            <Link
              href="/"
              className={`executive-nav-link ${isPropertyActive ? "active" : ""}`}
              title="Buy vs Rent & Mortgages"
            >
              <Scale size={14} className="executive-nav-link__icon" />
              <span>Buy vs Rent</span>
            </Link>

            <Link
              href="/city/london"
              className={`executive-nav-link ${isCitiesActive ? "active" : ""}`}
              title="Regional UK City Benchmarks (19 Major Hubs)"
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

            <Link
              href="/partners"
              className={`executive-nav-link ${isPartnersActive ? "active" : ""}`}
              title="B2B Broker & Estate Agency White-Label Widgets"
            >
              <ShieldCheck size={14} className="executive-nav-link__icon" />
              <span>B2B Partners</span>
            </Link>
          </div>
        </div>

        {/* Right Utility Actions */}
        <div className="ladder-nav__right">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="share-nav-btn"
            title="Copy scenario link to clipboard"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>

          <Link
            href="/partners"
            className="layout__header-donate"
            title="Embed White-Label Widgets & FCA Broker Network"
          >
            <ShieldCheck size={13} />
            <span>Partner Network</span>
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Live Macroeconomic Benchmark Ticker */}
      <MacroDataTicker />

      {/* Live UK Financial Twin Payslip & Borrowing Capacity Bar */}
      <UnifiedTwinBar />

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-label="Mobile Navigation">
          <div className="mobile-nav-section">
            <div className="mobile-nav-heading">Core Property Suite</div>
            <Link
              href="/"
              className={`mobile-nav-item ${isPropertyActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Scale size={16} />
              <div>
                <div className="mobile-nav-title">Buy vs Rent & Mortgages</div>
                <div className="mobile-nav-sub">SDLT/LBTT/LTT, 40y amortization & ISA opportunity cost</div>
              </div>
            </Link>
            <Link
              href="/city/london"
              className={`mobile-nav-item ${isCitiesActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building size={16} />
              <div>
                <div className="mobile-nav-title">UK Regional City Hubs</div>
                <div className="mobile-nav-sub">19 metropolitan benchmarks & price-to-rent ratios</div>
              </div>
            </Link>
          </div>

          <div className="mobile-nav-section">
            <div className="mobile-nav-heading">Specialist Financial Models</div>
            {FINANCIAL_MODELS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-item ${active ? "active" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={16} />
                  <div>
                    <div className="mobile-nav-title">{item.label}</div>
                    <div className="mobile-nav-sub">{item.subtitle}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mobile-nav-section">
            <div className="mobile-nav-heading">Institutional B2B</div>
            <Link
              href="/partners"
              className={`mobile-nav-item ${isPartnersActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ShieldCheck size={16} />
              <div>
                <div className="mobile-nav-title">B2B Partner Portal & White-Label Widgets</div>
                <div className="mobile-nav-sub">Embed calculators & FCA Consumer Duty lead routing</div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
