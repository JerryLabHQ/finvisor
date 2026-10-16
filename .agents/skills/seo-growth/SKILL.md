---
name: seo-growth
description: >-
  Use this skill when updating UK regional city house prices (HM Land Registry HPI),
  ONS private rental figures, or expanding programmatic SEO city pages in LadderPass.
---

# Programmatic SEO & HPI Agent (`seo-growth`)

Maintains and expands LadderPass's regional UK city property intelligence hubs (`/city/[slug]`).

## 1. Inspecting Current Regional Benchmarks

1. List all configured UK cities, average prices, monthly rents, price-to-rent ratios, and 5-year HPI rates:
   ```bash
   node scripts/update-city-data.mjs --list
   ```

## 2. Updating Existing City HPI & Rental Benchmarks

1. Run [update-city-data.mjs](../../../scripts/update-city-data.mjs) for the target city slug:
   ```bash
   node scripts/update-city-data.mjs --city=london --price=535000 --rent=2250 --hpi=2.8
   ```
   This automatically recomputes `priceToRentRatio`, updates devolved tax highlight copy (`SDLT`, `LBTT`, or `LTT`), and runs `npm run verify:math`.

## 3. Adding a New UK Regional City Hub

1. Add a new `CityMarketData` entry to `UK_CITIES` in [cities.ts](../../../src/lib/cities.ts) with `slug`, `name`, `region`, `averagePrice`, `averageRentMonthly`, `priceToRentRatio`, `historicalHpi5YrAvg`, `typicalDepositPct`, `typicalCouncilTaxMonthly`, `typicalServiceChargeMonthly`, `overview`, and `highlights`.
2. If the city is in Scotland or Wales, ensure its slug is mapped to `"SCOTLAND"` or `"WALES"` in `getJurisdictionFromCity()` inside [calculator.ts](../../../src/lib/calculator.ts).
3. Verify static route generation and Schema.org JSON-LD compilation:
   ```bash
   npm run build
   ```
