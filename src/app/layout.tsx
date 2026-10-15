import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LadderPass — The UK Financial Ladder & Property Intelligence",
  description: "The definitive mathematical guide to the British financial ladder. Institutional scenario modeling across Buy vs Rent, 60% Tax Trap, EV Salary Sacrifice, Student Loans, and BTL SPVs.",
  metadataBase: new URL("https://ladderpass.com"),
  openGraph: {
    title: "LadderPass — The UK Financial Ladder & Property Intelligence",
    description: "Compare home equity accumulation against tax-free Stocks & Shares ISA compounding, calibrate the 60% marginal tax trap, and model 40-year mortgage amortizations.",
    url: "https://ladderpass.com",
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
      "url": "https://ladderpass.com",
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
      "url": "https://ladderpass.com",
      "logo": "https://ladderpass.com/icon.svg",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${newsreader.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`min-h-full flex flex-col ${inter.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}


