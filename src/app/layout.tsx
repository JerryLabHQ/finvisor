import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RentOrLadder - UK Buy vs Rent Calculator & Property Ladder Intelligence",
  description: "The definitive UK buy vs rent calculator. Compare the true cost of renting vs getting on the property ladder after Stamp Duty (SDLT), mortgage interest, and Stocks & Shares ISA compounding.",
  metadataBase: new URL("https://rentorladder.com"),
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


