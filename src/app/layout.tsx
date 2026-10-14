import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finvisor - UK Buy vs Rent Calculator & Financial Intelligence",
  description: "The ultimate UK buy vs rent calculator and financial intelligence tool. Calculate Stamp Duty Land Tax (SDLT), mortgage amortizations, and compare net worth over time with open historical data.",
  metadataBase: new URL("https://finvisor.co.uk"),
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


