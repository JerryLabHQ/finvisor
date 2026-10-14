# LadderPass 🇬🇧
> **The UK Financial Ladder: Independent Life-Stage Scenario Modeling & Financial Advisory Suite (`ladderpass.com`).**
> **Live Web App:** [https://ladderpass.vercel.app](https://ladderpass.vercel.app)
> Engineered as a 100% free, community-supported platform powered by "Buy Me a Coffee" and maintained autonomously by AI agents.

---

## 🪜 The UK Financial Ladder (6 Core Modeling Engines)

LadderPass models the high-stakes financial decisions British professionals face across their careers:

1. **🏠 Property Ladder (`/` & `/city/[slug]`):**
   * Definitive UK Buy vs. Rent modeler comparing home equity growth against tax-free Stocks & Shares ISA compounding.
   * Statutory SDLT brackets (First-Time Buyer relief up to £625k), 40-year amortization tables, service charges, and macro rate shock stress tests (+1%, +2%, +3%).
2. **💼 Tax & High Earner Ladder (`/tax`):**
   * The **60% Marginal Tax Trap** (£100,000–£125,140 Personal Allowance taper).
   * Childcare Cliff Edge (sudden loss of 30 hours funded childcare & Tax-Free Childcare).
   * High Income Child Benefit Charge (HICBC) taper (£60k–£80k).
   * Exact SIPP & Workplace Salary Sacrifice optimization to preserve benefits and achieve statutory tax relief up to 62%.
3. **🚗 EV Mobility Ladder (`/ev`):**
   * Electric Vehicle Employer Salary Sacrifice vs. Private PCP vs. Cash Buying vs. Petrol/Diesel.
   * HMRC Benefit-in-Kind (BiK) escalator (2% to 5%), smart off-peak tariffs (7p/kWh on Octopus Intelligent vs. 75p public), and 3-year total cost of ownership.
4. **🎓 Student Loan Ladder (`/student-loan`):**
   * Plan 2 vs. Plan 5 vs. Postgraduate "Graduate Tax" repayment simulator.
   * 30-year vs. 40-year statutory cancellation cliffs, wage progression curves, and the definitive "Should I Overpay?" verdict.
   * Direct quantification of student loan monthly deductions on high-street mortgage borrowing capacity.
5. **🏢 Buy-to-Let SPV Ladder (`/property/spv`):**
   * Section 24 mortgage interest relief restrictions vs. 19% Corporation Tax in a Limited Company Special Purpose Vehicle (SPV).
   * 5% Higher Rates for Additional Dwellings (HRAD) Stamp Duty surcharge and dividend extraction tax modeling.
6. **🏖️ Retirement & FIRE Ladder (`/retirement`):**
   * Flexible SIPP Drawdown vs. Guaranteed Lifetime Annuity vs. Hybrid.
   * 25% Tax-Free Lump Sum (PCLS, capped at £268,275), State Pension Triple Lock bridge, and Autumn Budget 2027 Pension Inheritance Tax (IHT) exposure.

---

## ☕ Support & Monetization Architecture

LadderPass is the financial sibling project to **FitPass**:

### 1. "Buy Me a Coffee" Community Support
* **100% Free & Unlocked:** No artificial paywalls or gated features.
* **Configurable Support Link:**
  * `SUPPORT_URL`: Configurable via `NEXT_PUBLIC_SUPPORT_URL` (defaults to `https://buymeacoffee.com/jerrylabhq`).
  * `SUPPORT_LABEL`: `☕ Buy me a coffee`.
* **UI Placements:**
  * Global pill button in the top navigation bar (`HeaderNav.tsx`).
  * Dismissible friendly donation banner on every module page.
  * Dedicated creator notes in printable reports.

### 2. Commercial Quadrilateral Engine (Future Roadmap)
See [`docs/BUSINESS_PLAN.md`](docs/BUSINESS_PLAN.md) for the complete commercial monetization blueprint:
* **Pillar 1:** B2B High-Ticket Lead Referrals (FCA Mortgage Brokers, IFAs, EV Fleet Schemes paying £100–£350/lead).
* **Pillar 2:** Direct D2C "Lender-Ready Financial Dossiers" (£19.99 one-off via Stripe).
* **Pillar 3:** B2B White-Label & Embeddable Calculator SaaS for Estate Agencies (£49–£149/mo).
* **Pillar 4:** Corporate Financial Wellbeing Licenses (£2,500–£7,500/yr).

---

## 🤖 Built & Maintained by AI Agents

LadderPass is engineered for autonomous agent development and self-auditing operations:

| Script / Command | Purpose |
|---|---|
| `npm test` | Runs the full 29-test unit suite across all 6 financial modules and API endpoints. |
| `npm run verify:math` | Automated 26-point mathematical audit against statutory UK financial benchmarks. |
| `npm run lint` | Ensures strict TypeScript and ESLint compliance (0 errors, 0 warnings). |
| `npm run build` | Turbopack production compilation including all 19 static/SSG routes. |
| `node scripts/update-market-rates.mjs` | Autonomous CLI tool to update BoE base rates, mortgage rates, and inflation benchmarks. |
| `node scripts/export-leads.mjs` | Autonomous CLI tool to audit captured leads and calculate partner broker commissions. |

See [`AGENTS.md`](AGENTS.md) for full autonomous maintenance protocols.

---

## ⚙️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run automated test and math verification suite
npm test
npm run verify:math

# 3. Check linting and build production assets
npm run lint
npm run build

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📜 Regulatory Disclaimer

*LadderPass is an independent financial scenario modeling tool and does not provide FCA-regulated financial advice. Users are connected with independent, FCA-authorized intermediaries for formal mortgage borrowing and financial planning assessments.*
