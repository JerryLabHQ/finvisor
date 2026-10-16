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

### Protocol B: Updating UK Devolved Property Tax Brackets (SDLT, LBTT, LTT)
When the Chancellor, Scottish Government, or Welsh Government announces property tax changes:
1. Edit `SDLT_CONFIG`, `LBTT_CONFIG`, or `LTT_CONFIG` in `src/lib/constants.ts`.
2. Update unit test cases in `test/calculator.test.mjs`, `test/btl-spv-calculator.test.mjs`, and `scripts/verify-financial-math.mjs`.
3. Run `npm run verify:math` and `npm test`.

### Protocol C: Auditing and Exporting Broker Affiliate Leads
LadderPass captures GDPR-verified qualified mortgage, IFA, EV, and BTL SPV leads at `/api/leads`:
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
2. Next.js statically renders the new city page at `/city/[slug]` automatically during `npm run build` with real-time `runBuyVsRentCalculation()` and devolved `SDLT`/`LBTT`/`LTT` outputs.

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
LadderPass operates 6 core life-stage financial modeling engines synchronized via `src/lib/financial-profile-store.ts` ("One UK Financial Twin"):
1. **Property (`/` & `/city/[slug]`):** Buy vs. Rent, devolved `SDLT`/`LBTT`/`LTT` brackets (post-April 2025), and 40-year mortgage amortizations (`src/lib/calculator.ts`).
2. **Tax & High Earner (`/tax`):** The 60% Marginal Tax Trap (£100k–£125,140), 30h Free Childcare cliff edge, HICBC child benefit taper, and SIPP salary sacrifice optimization (`src/lib/tax-calculator.ts`).
3. **EV Mobility (`/ev`):** Electric vehicle employer salary sacrifice vs. private PCP vs. cash purchase using progressive tax-band slicing across Income Tax, NI, Student Loan, HICBC, and Childcare (`src/lib/ev-calculator.ts`).
4. **Student Loan (`/student-loan`):** Plan 1, Plan 2, Plan 4, Plan 5, and Postgraduate statutory write-off simulation (30y vs 40y) and mortgage borrowing capacity impact (`src/lib/student-loan-calculator.ts`).
5. **BTL Limited Company SPV (`/property/spv`):** Section 24 mortgage interest relief restrictions, marginal Corporation Tax (19% / 26.5% / 25%), and 5% HRAD Stamp Duty (`src/lib/btl-spv-calculator.ts`).
6. **Retirement & FIRE (`/retirement`):** Flexible drawdown with exact inverse tax-band gross-up vs. lifetime annuity, 25% tax-free lump sum (PCLS), £11,973 New State Pension bridge, and post-2027 Pension IHT rules (`src/lib/pension-calculator.ts`).

## 3. Institutional Monetization & B2B Partner Architecture
- **Dual-Path Executive Dossier (`ExecutiveDossierModal.tsx`)**: Users unlock unlimited Lender-Ready PDF & CSV dossiers either **free** by requesting a verified FCA Broker / Chartered IFA consultation (`ConsultationModal.tsx` -> `activatePro("lifetime")`) or anonymously via a **£19 one-off Pro Pass** (`/api/checkout`).
- **FCA Broker & IFA Referrals (`/api/leads`)**: Captures UK GDPR-consented (`privacyPolicyAccepted`, `consentGrantedAt`), phone-validated (`^(\+44|0)7\d{9}$`) borrower/wealth leads with dynamic vertical CPL (`£75`–`£250`), dispatches to `BROKER_WEBHOOK_URL`, and stores locally in `data/leads.json`.
- **B2B White-Label Proptech Widgets (`/partners` & `/embed`)**: Interactive partner customizer and chromeless `<iframe>` widget supporting `?engine=mortgage|tax|ev|btl` for UK estate agents and mortgage brokers.
- **Commercial Pro Forma Simulator**: Run `node scripts/simulate-financial-projections.mjs` to audit the 36-month P&L reconciled to the pound with `docs/BUSINESS_PLAN.md`.

## 4. Autonomous 6-Agent Executive Hierarchy (`.agents/skills/`)
LadderPass is operated by an autonomous 6-agent team orchestrated by the **Virtual CEO**:

| Role | Skill / Subagent | Model Tier (`invoke_subagent`) | Workspace Mode | Reasoning Depth |
|---|---|:---:|:---:|---|
| **Virtual CEO (Orchestrator)** | [`.agents/skills/virtual-ceo/SKILL.md`](.agents/skills/virtual-ceo/SKILL.md) (`virtual-ceo`) | `pro` (or `inherit` fallback) | `inherit` | Strategic synthesis, P&L allocation, and final release sign-off |
| **Lead Full-Stack Developer** | [`.agents/skills/dev-engineer/SKILL.md`](.agents/skills/dev-engineer/SKILL.md) (`dev-engineer`) | `flash` (or `pro` on refactors) | `share` (Git worktree) | Max thinking effort — React 19 UI, Next.js routes, TypeScript math engines |
| **QA & Release Engineer** | [`.agents/skills/qa-auditor/SKILL.md`](.agents/skills/qa-auditor/SKILL.md) (`qa-auditor`) | `flash` | `inherit` | Max thinking effort — 7 mandatory acceptance gates |
| **Macro & Statutory Rate Agent** | [`.agents/skills/rate-watcher/SKILL.md`](.agents/skills/rate-watcher/SKILL.md) (`rate-watcher`) | `flash` | `share` (Git worktree) | Max thinking effort — BoE rates & `SDLT`/`LBTT`/`LTT` brackets |
| **Programmatic SEO & HPI Agent** | [`.agents/skills/seo-growth/SKILL.md`](.agents/skills/seo-growth/SKILL.md) (`seo-growth`) | `flash` | `share` (Git worktree) | Max thinking effort — Land Registry HPI, ONS rents & `/city/[slug]` |
| **Revenue & Lead Ops Agent** | [`.agents/skills/rev-ops/SKILL.md`](.agents/skills/rev-ops/SKILL.md) (`rev-ops`) | `flash` | `inherit` | Max thinking effort — FCA lead audit, UK GDPR & 36m P&L |

### Worktree Isolation Policy
To prevent `.git/index.lock` collisions during parallel agent execution, write-heavy subagents (`dev-engineer`, `rate-watcher`, `seo-growth`) are invoked with `Workspace: "share"`. The Virtual CEO and `qa-auditor` verify all 7 gates before worktrees are committed and pushed to `main`.



