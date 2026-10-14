import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UK_CITIES, getCityBySlug } from "@/lib/cities";
import { TrendingUp, ArrowLeft, MapPin, CheckCircle, Calculator } from "lucide-react";
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

  return {
    title: `Buy vs Rent in ${city.name} (${new Date().getFullYear()}) - Financial Analysis & Calculator | LadderPass`,
    description: `Should you buy or rent in ${city.name}? Compare average house prices (£${city.averagePrice.toLocaleString()}), rental costs (£${city.averageRentMonthly.toLocaleString()}/mo), Stamp Duty, and historical yields.`,
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

  const calculatorUrl = `/?price=${city.averagePrice}&rent=${city.averageRentMonthly}&councilTax=${city.typicalCouncilTaxMonthly}&serviceCharge=${city.typicalServiceChargeMonthly}&hpi=${city.historicalHpi5YrAvg}`;

  return (
    <div className="dashboard-container" style={{ paddingBottom: 60 }}>
      {/* Navigation */}
      <nav className="nav-bar glass-panel">
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          <div className="logo-icon-wrap">
            <TrendingUp size={18} />
          </div>
          <span>LadderPass</span>
        </Link>
        <ul className="nav-links">
          <li>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <ArrowLeft size={16} />
              <span>Back to Interactive Calculator</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* City Header Hero */}
        <div className="glass-panel" style={{ padding: "36px 32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 12px", borderRadius: 999, background: "var(--primary-light)", border: "1px solid var(--primary-border)", color: "var(--primary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            <MapPin size={14} />
            <span>{city.region.toUpperCase()} Property Intelligence</span>
          </div>

          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 34, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.2 }}>
            Buy vs Rent in {city.name}: Financial Guide & Calculator
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 780, lineHeight: 1.6, marginBottom: 24 }}>
            {city.description}
          </p>

          <Link
            href={calculatorUrl}
            className="cta-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 26px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <Calculator size={18} />
            <span>Run {city.name} Custom Simulation</span>
          </Link>
        </div>

        {/* City Key Benchmarks Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Average Property Price</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--primary)", marginTop: 6 }}>
              {formatGBP(city.averagePrice)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Land Registry Benchmark</div>
          </div>

          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Average Monthly Rent</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--secondary)", marginTop: 6 }}>
              {formatGBP(city.averageRentMonthly)}/mo
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Private Rental Index</div>
          </div>

          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>Price-to-Rent Ratio</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", marginTop: 6 }}>
              {city.priceToRentRatio}x
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {city.priceToRentRatio > 20 ? "Favors Renting Initially" : "Competitive Buying Yields"}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)" }}>5-Year Historical HPI</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, fontWeight: 600, color: "var(--text-primary)", marginTop: 6 }}>
              +{city.historicalHpi5YrAvg}%/yr
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Compound Appreciation</div>
          </div>
        </div>

        {/* Market Analysis & Highlights */}
        <div className="glass-panel" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
            {city.name} Real Estate Market Dynamics
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {city.highlights.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-primary)" }}>
                <CheckCircle size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Other Cities Links for Internal Linking / SEO Authority */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
            Explore Other UK Property Markets
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {UK_CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/city/${c.slug}`}
                style={{
                  padding: "6px 14px",
                  borderRadius: 9999,
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--surface-border)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                {c.name} ({formatGBP(c.averagePrice)})
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
