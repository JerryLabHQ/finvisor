import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "LadderPass — The UK Financial Ladder & Property Intelligence",
  description: "The definitive mathematical guide to the British financial ladder. Institutional scenario modeling across Buy vs Rent, 60% Tax Trap, EV Salary Sacrifice, Student Loans, and BTL SPVs.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "LadderPass — The UK Financial Ladder & Property Intelligence",
    description: "Compare home equity accumulation against tax-free Stocks & Shares ISA compounding, calibrate the 60% marginal tax trap, and model 40-year mortgage amortizations.",
    url: SITE_URL,
    siteName: "LadderPass",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LadderPass — The UK Financial Ladder",
    description: "Institutional UK financial modeling across property, tax traps, salary sacrifice, and pensions.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "LadderPass",
      "url": SITE_URL,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All",
      "description": "The definitive mathematical modeling platform for the British property ladder and UK tax scenarios.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "GBP",
      },
    },
    {
      "@type": "Organization",
      "name": "LadderPass",
      "url": SITE_URL,
      "logo": `${SITE_URL}/icon.svg`,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}


