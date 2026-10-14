import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}


