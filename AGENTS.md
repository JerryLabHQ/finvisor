<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LadderPass: Autonomous AI Agent Operations Playbook

LadderPass is built to be 100% self-serve and capable of autonomous maintenance, updates, and verification by AI agents.

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
LadderPass captures qualified mortgage borrower leads at `/api/leads`:
```bash
# View summary of pipeline value and recent leads
node scripts/export-leads.mjs

# Export as CSV for partner broker ingestion or monthly billing
node scripts/export-leads.mjs --format=csv > leads_export.csv
```

### Protocol D: Adding Regional City Pages (Programmatic SEO)
City data is maintained in `src/lib/cities.ts`.
To add a new UK city:
1. Add a new entry to `UK_CITIES` with `slug`, `name`, `averagePrice`, `averageRentMonthly`, `priceToRentRatio`, `highlights`.
2. Next.js statically renders the new city page at `/city/[slug]` automatically during `npm run build`.

### Protocol E: Updating Regional City Property & Rental Data
When HM Land Registry publishes new UK HPI figures or ONS publishes new private rent bulletins:
```bash
# List all current city benchmarks
node scripts/update-city-data.mjs --list

# Update specific city metrics (automatically recomputes price-to-rent ratio & highlights)
node scripts/update-city-data.mjs --city=london --price=540000 --rent=2200 --hpi=2.9
```
This script automatically runs `npm run verify:math` to ensure model consistency.

### Protocol F: The UK Financial Ladder Suite Architecture
LadderPass operates 6 core life-stage financial modeling engines:
1. **Property (`/` & `/city/[slug]`):** Buy vs. Rent, SDLT relief brackets, and 40-year mortgage amortizations (`src/lib/calculator.ts`).
2. **Tax & High Earner (`/tax`):** The 60% Marginal Tax Trap (£100k-£125k), 30h Free Childcare cliff edge, HICBC child benefit taper, and SIPP salary sacrifice optimization (`src/lib/tax-calculator.ts`).
3. **EV Mobility (`/ev`):** Electric vehicle employer salary sacrifice vs. private PCP vs. buying, factoring in HMRC BiK rates (2% to 5%) and smart off-peak charging (`src/lib/ev-calculator.ts`).
4. **Student Loan (`/student-loan`):** Plan 2 vs. Plan 5 statutory write-off simulation (30y vs 40y) and mortgage borrowing capacity impact (`src/lib/student-loan-calculator.ts`).
5. **BTL Limited Company SPV (`/property/spv`):** Section 24 mortgage interest relief restrictions, 19% Corporation Tax, and 5% HRAD Stamp Duty (`src/lib/btl-spv-calculator.ts`).
6. **Retirement & FIRE (`/retirement`):** Flexible drawdown vs. lifetime annuity, 25% tax-free lump sum (PCLS), State Pension bridge, and post-2027 Pension IHT rules (`src/lib/pension-calculator.ts`).

## 3. Monetization & Community Support Architecture
- **"Buy Me a Coffee" Setup**: 100% free with no paywalls. Reuses the FitPass pattern with `SUPPORT_URL` (`NEXT_PUBLIC_SUPPORT_URL` / `https://buymeacoffee.com/jerrylabhq`) and `SUPPORT_LABEL` (`☕ Buy me a coffee`), including top-nav pill buttons and dismissible nudge banners.
- **FCA Broker Referrals**: B2B qualified introducer revenue (£100 - £350 per lead). Captures buyer/investor criteria, dispatches to `BROKER_WEBHOOK_URL` (Zapier, Make, CRM), and stores locally in `data/leads.json`.
- **Commercial Roadmap**: See `docs/BUSINESS_PLAN.md` for the Quadrilateral Monetization Engine (Pillars 1–4).

