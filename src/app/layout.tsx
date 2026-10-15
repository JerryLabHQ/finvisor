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
  title: "LadderPass - UK Buy vs Rent Financial Intelligence & Property Calculator",
  description: "The definitive mathematical guide to the British property ladder. Compare home equity accumulation against tax-free Stocks & Shares ISA compounding after Stamp Duty, BoE mortgage rates, and maintenance.",
  metadataBase: new URL("https://ladderpass.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${newsreader.variable}`}>
      <body className={`min-h-full flex flex-col ${inter.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}


