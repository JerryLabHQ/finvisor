import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UK_CITIES, getCityBySlug } from "@/lib/cities";
import {
  MapPin,
  CheckCircle2,
  Building,
  ArrowRight,
  Award,
} from "lucide-react";
import { HeaderNav } from "@/components/HeaderNav";
import { Footer } from "@/components/Footer";
import { CityAffordabilityWidget } from "@/components/CityAffordabilityWidget";
import {
  calculateMonthlyMortgage,
  calculatePropertyTax,
  getJurisdictionFromCity,
  getPropertyTaxLabel,
  runBuyVsRentCalculation,
} from "@/lib/calculator";
import { UK_MARKET_DEFAULTS, SITE_URL } from "@/lib/constants";
import "../../dashboard.css";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return UK_CITIES.map((city) => ({
    slug: city.slug,
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    return { title: "City Not Found - LadderPass" };
  }

  const currentYear = new Date().getFullYear();
  const jurisdiction = getJurisdictionFromCity(city.slug);
  const taxLabel = getPropertyTaxLabel(jurisdiction);

  return {
    title: `Buy vs Rent in ${city.name} (${currentYear}) - Property Prices, Rental Yields & Breakeven | LadderPass`,
    description: `Should you buy or rent in ${city.name}? Compare average house prices (£${city.averagePrice.toLocaleString()}), rental costs (£${city.averageRentMonthly.toLocaleString()}/mo), ${taxLabel}, and mortgage affordability.`,
    alternates: {
      canonical: `${SITE_URL}/city/${city.slug}`,
    },
    openGraph: {
      title: `Buy vs Rent in ${city.name} - The UK Financial Ladder`,
      description: `Detailed housing market analysis for ${city.name}: Average price £${city.averagePrice.toLocaleString()}, typical rent £${city.averageRentMonthly.toLocaleString()}/mo, price-to-rent ratio ${city.priceToRentRatio}x.`,
      url: `${SITE_URL}/city/${city.slug}`,
      siteName: "LadderPass",
      locale: "en_GB",
      type: "article",
    },
  };
}

const formatGBP = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const jurisdiction = getJurisdictionFromCity(city.slug);
  const taxLabel = getPropertyTaxLabel(jurisdiction);

  // Exact statutory calculations using real city metrics & devolved property tax
  const ftbStampDuty = calculatePropertyTax(city.averagePrice, true, false, jurisdiction);
  const standardStampDuty = calculatePropertyTax(city.averagePrice, false, false, jurisdiction);
  const loanAmount85 = city.averagePrice * 0.85;
  const estimatedMortgage = calculateMonthlyMortgage(loanAmount85, UK_MARKET_DEFAULTS.defaultMortgageRate, 25);
  const grossYieldPercent = Number((((city.averageRentMonthly * 12) / city.averagePrice) * 100).toFixed(1));

  const citySimulation = runBuyVsRentCalculation({
    propertyPrice: city.averagePrice,
    depositPercent: city.typicalDepositPct,
    mortgageRate: UK_MARKET_DEFAULTS.defaultMortgageRate,
    mortgageTerm: UK_MARKET_DEFAULTS.defaultMortgageTerm,
    fixedTermYears: UK_MARKET_DEFAULTS.defaultFixedTerm,
    svrRate: UK_MARKET_DEFAULTS.defaultSvrRate,
    isFirstTimeBuyer: true,
    stampDutyOverride: null,
    jurisdiction,
    legalFees: UK_MARKET_DEFAULTS.defaultLegalFees,
    surveyFees: UK_MARKET_DEFAULTS.defaultSurveyFees,
    councilTaxMonthly: city.typicalCouncilTaxMonthly,
    serviceChargeMonthly: city.typicalServiceChargeMonthly,
    maintenancePercent: UK_MARKET_DEFAULTS.defaultMaintenancePercent,
    insuranceMonthly: UK_MARKET_DEFAULTS.defaultInsuranceMonthly,
    initialRent: city.averageRentMonthly,
    rentIncreasePercent: UK_MARKET_DEFAULTS.defaultRentIncreasePercent,
    renterInsuranceMonthly: UK_MARKET_DEFAULTS.defaultRenterInsuranceMonthly,
    investmentReturnPercent: UK_MARKET_DEFAULTS.defaultStockReturnPercent,
    inflationPercent: UK_MARKET_DEFAULTS.defaultInflationPercent,
    houseAppreciationPercent: city.historicalHpi5YrAvg,
    timeHorizonYears: 10,
  });

  // Schema.org JSON-LD Structured Data (FinancialProduct, FAQPage, BreadcrumbList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "LadderPass UK",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${city.name} Buy vs Rent Calculator`,
            item: `${SITE_URL}/city/${city.slug}`,
          },
        ],
      },
      {
        "@type": "FinancialProduct",
        name: `${city.name} Residential Mortgage & Buy vs Rent Model`,
        description: city.description,
        interestRate: UK_MARKET_DEFAULTS.defaultMortgageRate,
        areaServed: {
          "@type": "City",
          name: city.name,
        },
        provider: {
          "@type": "Organization",
          name: "LadderPass Institutional",
          url: SITE_URL,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: `Is it cheaper to buy or rent in ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: citySimulation.breakEvenYear
                ? `Based on an average ${city.name} property price of ${formatGBP(city.averagePrice)} and monthly rent of ${formatGBP(city.averageRentMonthly)}, buying reaches net-worth break-even in Year ${citySimulation.breakEvenYear} at a ${city.typicalDepositPct}% deposit.`
                : `With an average property price of ${formatGBP(city.averagePrice)} and rent of ${formatGBP(city.averageRentMonthly)}/month, renting and compounding a deposit in a Stocks & Shares ISA outperforms buying over a 10-year horizon.`,
            },
          },
          {
            "@type": "Question",
            name: `How much is ${taxLabel} for a first-time buyer in ${city.name}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `On an average ${city.name} property priced at ${formatGBP(city.averagePrice)}, a first-time buyer pays ${formatGBP(ftbStampDuty)} in ${taxLabel} (compared to ${formatGBP(standardStampDuty)} for a standard home mover).`,
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Executive Suite Navigation Header */}
      <HeaderNav currentModule="UK Cities" />

      {/* Cross-City Hub Switcher Bar */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        borderRadius: "var(--round-lg)",
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        overflowX: "auto",
        boxShadow: "var(--shadow-card)",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
          Regional UK Hubs:
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap" }}>
          {UK_CITIES.map((c) => {
            const isActive = c.slug === city.slug;
            return (
              <Link
                key={c.slug}
                href={`/city/${c.slug}`}
                style={{
                  padding: "5px 12px",
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  background: isActive ? "var(--primary)" : "var(--surface-tray)",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  border: `1px solid ${isActive ? "var(--primary)" : "var(--surface-border)"}`,
                  transition: "all 0.15s ease",
                }}
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* City Hero Section */}
      <section className="hero-section">
        <div className="hero-pill" style={{ background: "var(--primary-light)", color: "var(--primary)", border: "1px solid var(--primary-border)" }}>
          <MapPin size={14} />
          <span>{city.region.toUpperCase()} • HM LAND REGISTRY &amp; {taxLabel.toUpperCase()}</span>
        </div>
        <h1 className="hero-title">
          Buy vs Rent in {city.name}: Property Prices, Rental Yields &amp; Breakeven Guide
        </h1>
        <p className="hero-subtitle">
          {city.description} Calibrate your capital deployment against real-time Bank of England base rates, statutory {taxLabel} brackets, and compound ISA opportunity costs.
        </p>
      </section>

      {/* Regional Macro Decision Certificate & 4 KPI Cards */}
      <div className="verdict-banner buy-wins">
        <div className="verdict-header">
          <div>
            <div className="verdict-badge buy">
              <Award size={14} />
              <span>{city.name} Macro-Index Decision Certificate</span>
            </div>
            <h2 className="verdict-headline">
              {citySimulation.breakEvenYear
                ? `In ${city.name} (${grossYieldPercent}% gross yield), buying reaches net-worth breakeven in Year ${citySimulation.breakEvenYear} at a ${city.typicalDepositPct}% deposit.`
                : `In ${city.name}, elevated price-to-rent multiples (${city.priceToRentRatio}x) and ${formatGBP(ftbStampDuty)} ${taxLabel} favor renting & ISA compounding over 10 years.`}
            </h2>
            <p className="verdict-summary">
              Official Land Registry figures show average prices at {formatGBP(city.averagePrice)} alongside market rents of {formatGBP(city.averageRentMonthly)}/month, generating an estimated gross rental yield of {grossYieldPercent}% and a 10-year net worth differential of {formatGBP(Math.abs(citySimulation.netWorthDifferenceAtHorizon))} in favor of {citySimulation.netWorthDifferenceAtHorizon >= 0 ? "buying" : "renting"}.
            </p>
          </div>
        </div>

        {/* 4 Precision Metric Cards */}
        <div className="verdict-metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Average Property Price</span>
            <span className="metric-value highlight" style={{ color: "var(--primary)" }}>
              {formatGBP(city.averagePrice)}
            </span>
            <span className="metric-subtext">Land Registry HPI Benchmark</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Monthly Market Rent</span>
            <span className="metric-value highlight" style={{ color: "var(--secondary)" }}>
              {formatGBP(city.averageRentMonthly)}/mo
            </span>
            <span className="metric-subtext">ONS Private Rental Index</span>
          </div>

          <div className="metric-card">
            <span className="metric-label">{taxLabel} (FTB)</span>
            <span className="metric-value" style={{ color: "var(--text-primary)" }}>
              {formatGBP(ftbStampDuty)}
            </span>
            <span className="metric-subtext">
              {jurisdiction === "SCOTLAND"
                ? "LBTT relief up to £175k"
                : jurisdiction === "WALES"
                  ? "Welsh LTT 0% up to £225k"
                  : "Post-Apr 2025 (£300k nil / £500k cap)"}
            </span>
          </div>

          <div className="metric-card">
            <span className="metric-label">Est. Monthly Mortgage</span>
            <span className="metric-value" style={{ color: "var(--primary)" }}>
              {formatGBP(estimatedMortgage)}/mo
            </span>
            <span className="metric-subtext">85% LTV @ {UK_MARKET_DEFAULTS.defaultMortgageRate}% (25y)</span>
          </div>
        </div>
      </div>

      {/* Interactive Affordability Calibrator & Local Outflow Breakdown */}
      <CityAffordabilityWidget
        cityName={city.name}
        citySlug={city.slug}
        averagePrice={city.averagePrice}
        averageRentMonthly={city.averageRentMonthly}
        typicalCouncilTaxMonthly={city.typicalCouncilTaxMonthly}
        typicalServiceChargeMonthly={city.typicalServiceChargeMonthly}
        historicalHpi5YrAvg={city.historicalHpi5YrAvg}
      />

      {/* Regional Market Dynamics & Highlights Bento */}
      <div className="glass-panel" style={{ padding: 28, borderRadius: "var(--round-lg)", background: "var(--surface)", border: "1px solid var(--surface-border)" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
          {city.name} Real Estate Market Dynamics &amp; Growth Drivers
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {city.highlights.map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-primary)", background: "var(--surface-tray)", padding: "12px 14px", borderRadius: "var(--round-md)", border: "1px solid var(--surface-border)" }}>
              <CheckCircle2 size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 2 }} />
              <span style={{ lineHeight: 1.5 }}>{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FCA Regulated Mortgage Broker Introducer Card */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--surface-border)",
        borderRadius: "var(--round-xl)",
        padding: "26px 30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, maxWidth: 680 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: "var(--round-md)",
            background: "var(--primary-light)",
            border: "1px solid var(--primary-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary)",
            flexShrink: 0,
          }}>
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              Looking to Buy in {city.name}? Connect with an FCA-Regulated Mortgage Broker
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
              Get fee-free independent mortgage comparisons, access to exclusive lender rates, and rapid Decision in Principle (DIP) letters.
            </div>
          </div>
        </div>

        <Link
          href={`/?price=${city.averagePrice}&deposit=${city.typicalDepositPct}&rent=${city.averageRentMonthly}&councilTax=${city.typicalCouncilTaxMonthly}&serviceCharge=${city.typicalServiceChargeMonthly}&hpi=${city.historicalHpi5YrAvg}&ftb=true&city=${city.slug}`}
          className="cta-button"
          style={{
            padding: "11px 20px",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          <span>Calculate Borrowing Capacity</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Global Institutional Editorial Footer */}
      <Footer />
    </div>
  );
}
