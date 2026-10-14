# RentOrLadder 🇬🇧

> **Independent UK Buy vs. Rent Financial Modeling & Property Advisory Platform.**
> **Live Web App:** [https://rentorladder.vercel.app](https://rentorladder.vercel.app)
> Engineered as a 100% free, community-supported side project powered by "Buy Me a Coffee" and maintained autonomously by AI agents.

---

## ☕ Support & Monetization Architecture

RentOrLadder reuses the clean, community-supported setup from **FitPass**:

### 1. "Buy Me a Coffee" Community Support
- **100% Free & Unlocked:** No artificial paywalls. All tools—including PDF investment report generation, 40-year amortization CSV exports, multi-property comparisons, and macro rate shock stress-testing—are completely free for everyone.
- **Configurable Support Link:**
  - `SUPPORT_URL`: Configurable via `NEXT_PUBLIC_SUPPORT_URL` (defaults to `https://buymeacoffee.com/fit.pass`).
  - `SUPPORT_LABEL`: `☕ Buy me a coffee`.
- **UI Placements (FitPass Pattern):**
  - Sleek pill button in the top navigation bar (`.layout__header-donate`).
  - Dismissible friendly donation nudge banner (`.donation-banner`) above the calculator controls.
  - Creator support note inside the printable PDF report.
  - Dedicated "Support RentOrLadder" card in the advisor sidebar.

### 2. Whole-of-Market FCA Broker Lead Referrals (Optional Affiliate Revenue)
- **Economics:** £150 to £250+ per qualified mortgage lead.
- **Intelligent Qualification:** Automatically computes borrower Loan-to-Value (LTV), target borrowing, deposit equity, and buying timeline.
- **Delivery Engine:** Stores leads securely in `data/leads.json` and dispatches real-time webhooks (`BROKER_WEBHOOK_URL`) to Zapier, Make, HubSpot, or broker email queues.

### 3. Programmatic SEO Engine (Zero-Ad-Spend Organic Discovery)
- Static pre-rendering for major UK property markets: `/city/london`, `/city/manchester`, `/city/birmingham`, `/city/edinburgh`, `/city/bristol`, `/city/leeds`, `/city/cambridge`, `/city/oxford`.
- Deep links back into the interactive calculator with pre-populated local prices, rents, and tax bands.

---

## 🤖 Built & Maintained by AI Agents

RentOrLadder is designed from the ground up for autonomous development and background agent workflows:

| Script / Command | Purpose |
|---|---|
| `npm test` | Runs the full unit test suite (SDLT brackets, amortization formulas, and API handlers). |
| `npm run verify:math` | Automated 15-point mathematical audit against UK financial benchmarks. |
| `npm run lint` | Ensures strict TypeScript and ESLint compliance (0 errors, 0 warnings). |
| `npm run build` | Turbopack production compilation including SSG city pages. |
| `node scripts/update-market-rates.mjs` | Autonomous CLI tool to update BoE base rates, mortgage rates, and inflation benchmarks. |
| `node scripts/export-leads.mjs` | Autonomous CLI tool to audit captured leads and calculate partner broker commissions. |

See [`AGENTS.md`](file:///Users/jerry-poon/dev/finvisor/AGENTS.md) for full autonomous maintenance protocols.

---

## ⚙️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run automated verification suite
npm test
npm run verify:math

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Environment Variables (Optional)

Configure these in `.env.local`:

```env
# Custom Buy Me a Coffee / donation link (defaults to https://buymeacoffee.com/fit.pass)
NEXT_PUBLIC_SUPPORT_URL=https://buymeacoffee.com/fit.pass

# Broker lead webhook (Zapier, Make, CRM endpoint)
BROKER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
```

---

## 📜 Regulatory Disclaimer

*Finvisor is an independent financial scenario modeling tool and does not provide FCA-regulated financial advice. Users are connected with independent, FCA-authorized mortgage intermediaries for formal borrowing assessments.*
