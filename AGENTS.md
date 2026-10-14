<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Finvisor: Autonomous AI Agent Operations Playbook

Finvisor is built to be 100% self-serve and capable of autonomous maintenance, updates, and verification by AI agents.

## 1. Quick Verification Commands
Before submitting any changes, an AI agent must run the following verification suite:

```bash
# 1. Run unit test suite (SDLT, amortizations, stress tests, API endpoints)
npm test

# 2. Run automated mathematical audit against verified UK financial benchmarks
npm run verify:math

# 3. Lint and typecheck
npm run lint

# 4. Compile optimized production build
npm run build
```

## 2. Autonomous Task Protocols

### Protocol A: Updating Bank of England Base Rates or Market Averages
When the Bank of England Monetary Policy Committee announces a rate decision:
```bash
# Example: updating mortgage rate to 4.3%, SVR to 7.1%, BoE to 4.5%
node scripts/update-market-rates.mjs --mortgage=4.3 --svr=7.1 --boe=4.5
```
This script automatically:
1. Updates `src/lib/constants.ts` with the new rates and timestamp.
2. Triggers `npm run verify:math` to ensure all amortization calculations remain valid.

### Protocol B: Updating UK Stamp Duty (SDLT) Brackets
When the Chancellor announces changes in the Spring or Autumn Budget:
1. Edit `SDLT_CONFIG` in `src/lib/constants.ts`.
2. Update unit test cases in `test/calculator.test.mjs` and `scripts/verify-financial-math.mjs`.
3. Run `npm run verify:math` and `npm test`.

### Protocol C: Auditing and Exporting Broker Affiliate Leads
Finvisor captures qualified mortgage borrower leads at `/api/leads`:
```bash
# View summary of pipeline value and recent leads
node scripts/export-leads.mjs

# Export as CSV for partner broker ingestion or monthly billing
node scripts/export-leads.mjs --format=csv > leads_export.csv
```

### Protocol D: Adding or Updating Regional City Pages (Programmatic SEO)
City data is maintained in `src/lib/cities.ts`.
To add a new UK city:
1. Add a new entry to `UK_CITIES` with `slug`, `name`, `averagePrice`, `averageRentMonthly`, `priceToRentRatio`, `highlights`.
2. Next.js statically renders the new city page at `/city/[slug]` automatically during `npm run build`.

## 3. Monetization & Community Support Architecture
- **"Buy Me a Coffee" Setup**: 100% free with no paywalls. Reuses the FitPass pattern with `SUPPORT_URL` (`NEXT_PUBLIC_SUPPORT_URL` / `https://buymeacoffee.com/fit.pass`) and `SUPPORT_LABEL` (`☕ Buy me a coffee`), including top-nav pill buttons and dismissible nudge banners.
- **FCA Broker Referrals**: Optional B2B affiliate revenue (£150 - £250 per qualified lead). Captures borrower LTV, deposit, timeline, and dispatches to `BROKER_WEBHOOK_URL` (Zapier, Make, CRM) while storing in `data/leads.json`.
- **Programmatic SEO**: High-intent city pages generating 100% organic, ad-free search traffic.

