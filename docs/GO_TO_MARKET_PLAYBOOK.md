# LadderPass: Go-To-Market (GTM) & Distribution Playbook (2026–2028) 🇬🇧
> **Tactical Distribution Blueprint for The UK Financial Ladder**  
> *Scaling from 5,000 to 500,000 monthly visits and £3.85M ARR through Programmatic SEO, Intermediary Distribution Networks, and B2B Proptech SaaS.*

---

## 1. Executive GTM Architecture

LadderPass operates a multi-channel distribution engine designed to maintain a blended Customer Acquisition Cost (CAC) below **£2.50** while driving high-intent transaction flow into our Quadrilateral Monetization Engine.

```
                                  ┌───────────────────────────────────────────────┐
                                  │          LADDERPASS GTM ACQUISITION           │
                                  └──────────────────────┬────────────────────────┘
                                                         │
                     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
                     ▼                   ▼                               ▼                   ▼
              ┌──────────────┐    ┌──────────────┐                ┌──────────────┐    ┌──────────────┐
              │   CHANNEL 1  │    │   CHANNEL 2  │                │   CHANNEL 3  │    │   CHANNEL 4  │
              │ Programmatic │    │ B2B Broker   │                │ Proptech     │    │ Corporate    │
              │ SEO (100+    │    │ Networks &   │                │ Embed Widget │    │ Wellbeing    │
              │ UK Hubs)     │    │ Clubs        │                │ (15k Offices)│    │ (City HR)    │
              │ Zero-CAC     │    │ 25-35% Rev   │                │ £49-£149/mo  │    │ £3k-£7.5k/yr │
              └──────────────┘    └──────────────┘                └──────────────┘    └──────────────┘
```

---

## 2. Channel 1: Programmatic Local SEO & Statutory Search Dominance

### 2.1 The Programmatic SEO Architecture
* **Target:** Expand from the current 19 UK city hubs to **100+ UK local authorities** and London boroughs.
* **Architecture:** Pre-rendered Static Site Generation (SSG) via Next.js 16 with `generateStaticParams`.
* **Dynamic Datasets:**
  * HM Land Registry UK House Price Index (HPI) via automated script (`update-city-data.mjs`).
  * Office for National Statistics (ONS) Private Rental Market statistics.
  * Local authority Council Tax bands and regional service charges.
  * Live Stamp Duty Land Tax (SDLT) calculations incorporating the April 2025 FTB threshold drop (to £300k) and 5% HRAD rules.

### 2.2 Statutory Keyword Target Clusters

| Priority Tier | Target Keyword Cluster | Search Volume (UK) | Search Intent & Conversion Hook | Target Landing Page |
|---|---|:---:|---|---|
| **Tier 1 (High Intent)** | `"stamp duty calculator 2026 first time buyer"` | 110,000/mo | Immediate buyer calculating post-April 2025 SDLT tax liabilities | `/` & `/city/[slug]` |
| **Tier 1 (High Intent)** | `"60 percent tax trap calculator SIPP"` | 45,000/mo | High earner (£100k–£125k) facing loss of Personal Allowance & 30h childcare | `/tax` |
| **Tier 1 (High Intent)** | `"buy vs rent calculator uk 25 40 year"` | 32,000/mo | Aspiring homebuyer evaluating price-to-rent breakeven point | `/` & `/city/[slug]` |
| **Tier 2 (Commercial)** | `"ev salary sacrifice vs pcp calculator"` | 28,000/mo | Company car driver evaluating 2% to 5% HMRC BiK savings | `/ev` |
| **Tier 2 (Commercial)** | `"ltd company spv vs personal buy to let"` | 22,000/mo | Property investor modeling Section 24 mortgage interest relief bypass | `/property/spv` |
| **Tier 2 (Commercial)** | `"plan 2 vs plan 5 student loan mortgage impact"` | 18,000/mo | Graduate assessing mortgage borrowing capacity drag | `/student-loan` |
| **Tier 2 (Commercial)** | `"pension inheritance tax 2027 drawdown calculator"` | 24,000/mo | Pre-retiree (age 50–65) assessing unspent pension pot 40% IHT inclusion | `/retirement` |

### 2.3 Programmatic Content Template
Every city hub (`/city/[slug]`) dynamically outputs:
1. **The Regional Metric Ledger:**
   * Average property purchase price (£).
   * Average monthly private rent (£).
   * Price-to-Rent Ratio (e.g. London 20.5 vs Manchester 14.2).
   * Local FTB Stamp Duty threshold impact.
2. **The 40-Year Amortization Comparison:**
   * Buying vs renting net wealth trajectory over 25 and 40 years.
   * Breakeven crossover year (e.g. Year 4 in Manchester, Year 8 in London).
3. **Structured Data:** Schema.org `FinancialProduct`, `FAQPage`, and `BreadcrumbList` in valid JSON-LD.

---

## 3. Channel 2: Mortgage Club & Intermediary Network Alliances

### 3.1 Target Mortgage Clubs & Networks
Over 84% of UK mortgages are arranged by intermediaries affiliated with major mortgage clubs:
1. **Sesame Bankhall Group (SBG) & PMS Mortgage Club:** Over 10,000 Directly Authorised (DA) and Appointed Representative (AR) advisers.
2. **Legal & General Mortgage Club:** Originates over £90 billion in UK mortgages annually.
3. **SimplyBiz Group:** Supports over 3,000 financial advice and mortgage firms.
4. **Mortgage Advice Bureau (MAB):** Over 2,000 advisers operating nationwide.
5. **Connect Mortgages & Network:** Specialist network covering complex residential and commercial BTL SPV lending.

### 3.2 Value Proposition for Broker Networks
* **FCA Consumer Duty (PRIN 2A) Native Compliance:** The FCA requires authorized firms to prove that marketing does not cause consumer harm. LadderPass scenario data provides documented proof of borrower understanding, sensitivity stress testing (+1%, +2%, +3%), and complete cost disclosure.
* **Pre-Underwritten Borrower Dossiers:** Unlike cold directory forms (Unbiased/Bark) where 40%+ of leads are unresponsive or sub-prime, LadderPass leads come with pre-calculated LTV, deposit amount, timeline, and borrowing requirement.
* **Commercial Model:** LadderPass offers networks a choice:
  * **Option A:** Exclusive, pre-qualified CPL (£65–£85 per residential mortgage lead; £200–£350 for BTL SPVs).
  * **Option B:** Performance rev-share: 30% of the completed broker procuration + advice fee (£450–£750 per completion).

### 3.3 Intermediary CRM Integration Architecture
LadderPass integrates directly into major UK mortgage intermediary platforms via webhook:
* **Acre Platforms:** Direct API case creation pushing borrower fact-find data straight into Acre's CRM.
* **Smartr365:** Webhook mapping to create a new mortgage pipeline record.
* **One Mortgage System (OMS):** Automated case injection for commercial and residential brokers.

---

## 4. Channel 3: B2B White-Label & Embeddable Widgets (Proptech)

### 4.1 Addressable Estate Agency Landscape
The UK estate agency software market is heavily concentrated across three CRM platforms:
* **Alto (Zoopla/Houseful):** ~6,000 branch offices.
* **Reapit (Foundations Marketplace):** ~5,200 branch offices.
* **Street.co.uk (Street Group):** ~2,700 branch offices.

### 4.2 The Agency Problem & Solution
* **The Problem:** Estate agency websites feature dated 3-field calculators that do not account for post-April 2025 SDLT rules or regional buy-vs-rent breakevens, causing 90%+ of prospective buyers to bounce.
* **The Solution:** Embeddable React/iframe widget matching agency branding (custom CSS variables). When a buyer runs a calculation on a property listing, the agency receives the buyer's financial qualification (deposit size, mortgage requirement, timeline) directly in their CRM.
* **Pricing & SaaS Packaging:**
  * **Standard Widget (£49/mo per office):** Single calculator embed, lead notification email.
  * **Full Pro Suite (£149/mo per office):** Full 6-engine suite, white-label branding removal, direct CRM integration (Reapit Foundations / Street Open API), and branded PDF dossier export.

---

## 5. Channel 4: Corporate Financial Wellbeing & HR Perks

### 5.1 The High-Earner Corporate Dilemma
UK employers in high-paying sectors (City law firms, investment banks, technology scaleups, consulting firms) paying £80k–£200k base salaries are experiencing severe employee frustration:
1. **The 60% Tax Trap (£100k–£125k):** Employees receive only £38–£40 net for every £100 earned.
2. **Childcare Cliff Edge:** Losing 30 hours of free childcare worth ~£7,000–£10,000 net upon hitting £100,000 adjusted net income.
3. **PCPP vs EV Salary Sacrifice:** Confusion regarding HMRC BiK rates and salary sacrifice savings.

### 5.2 The Product: `company.ladderpass.com`
LadderPass deploys dedicated corporate portals configured with:
* The company’s specific pension match rules and SIPP salary sacrifice scheme.
* The company’s active EV salary sacrifice provider (Octopus EV, Tusker, The Electric Car Scheme).
* Automated marginal tax simulations demonstrating how sacrificing £10,000 into a SIPP saves £6,000 in income tax and restores £10,000 in childcare benefits.
* **Annual Licensing:** £3,000 to £7,500/year per employer.

---

## 6. Financial PR & Editorial Thought Leadership

### 6.1 Reactive Editorial Calendar
LadderPass leverages macroeconomic trigger events to capture national media coverage (The Times, The Telegraph, Financial Times, BBC Personal Finance, This is Money):
1. **Bank of England MPC Rate Decisions (8 times/year):** Within 15 minutes of a rate decision, LadderPass issues automated rate impact analyses showing exact monthly mortgage increases across the 19 UK city hubs.
2. **HM Land Registry Monthly HPI Bulletin:** Regional rankings of the fastest-moving buy-vs-rent breakevens in the UK.
3. **Autumn and Spring Fiscal Budgets:** Immediate statutory reaction models analyzing SDLT changes, Capital Gains Tax, and Pension IHT rules.

### 6.2 LinkedIn & High-Earner Viral Loops
* High-earner personal finance content on LinkedIn dissecting the "£100k Childcare Cliff" and "SIPP Salary Sacrifice Optimization" regularly achieves viral distribution among UK professionals.
* Every graphic published includes an interactive LadderPass calculator link, generating high-intent, zero-cost traffic.
