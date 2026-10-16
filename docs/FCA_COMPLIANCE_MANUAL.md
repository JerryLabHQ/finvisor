# LadderPass: FCA Regulatory Compliance & Governance Manual 🇬🇧
> **Statutory Compliance Framework for The UK Financial Ladder**  
> *Operating within FSMA 2000, PERG 4/8, SUP 12, FCA Consumer Duty (PRIN 2A), and UK GDPR.*

---

## 1. Executive Regulatory Classification

LadderPass operates as an independent financial decision-modeling technology platform. To maintain compliance across all customer journeys and partner integrations, the platform adheres strictly to the **Financial Services and Markets Act 2000 (FSMA)**, the **Financial Services and Markets Act 2000 (Regulated Activities) Order 2001 (RAO)**, and the **FCA Handbook**.

```
┌────────────────────────────────────────────────────────────────────────┐
│               LADDERPASS REGULATORY OPERATING TIERS                    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 1: UNREGULATED INTRODUCER (Active Baseline)                       │
│ • RAO Article 33A Exclusion: "Introducing" without arranging or        │
│   advising on regulated mortgage contracts or retail investments.      │
│ • PERG 4.3 & PERG 8.4: Mathematical simulation and scenario modeling   │
│   without product recommendation does not constitute regulated advice. │
│ • Customer details are passed exclusively to FCA-authorised firms.     │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: INTRODUCER APPOINTED REPRESENTATIVE (IAR - SUP 12)             │
│ • Formal appointment under Section 39 of FSMA by an authorised         │
│   Principal broker or network (e.g. Sesame Bankhall or L&G partner).   │
│ • Permits co-branded promotions and enhanced partner introductions.    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: DIRECT FCA AUTHORIZATION / AISP (Long-Term Optionality)        │
│ • Read-Only Open Banking Account Information Service Provider (AISP)   │
│   under the Payment Services Regulations 2017 for automated data pull. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Perimeter Guidance Analysis: The Advice vs Guidance Boundary

### 2.1 The Regulatory Boundary (PERG 4 & PERG 8)
Under FCA Perimeter Guidance:
1. **Generic Financial Information (Unregulated):** Presenting mathematical calculations, amortizations, tax brackets, and historical statistical data is factual information and does not require FCA authorization.
2. **Scenario Modeling (Unregulated):** Allowing a consumer to toggle sliders (e.g. deposit percentage, interest rate, income level) and viewing the resulting mathematical outcome is self-directed simulation. It does not constitute a personal recommendation.
3. **Regulated Advice (Requires Authorisation):** Recommending that a specific consumer choose Lender A over Lender B, or advising that a 5-year fixed rate is suitable for their specific financial situation, crosses into regulated advice under Article 53A of the RAO.

### 2.2 Operational Safeguards Implemented on LadderPass
* **Zero Specific Product Recommendations:** LadderPass displays representative market benchmark rates (e.g. Bank of England base rates, UK HPI data) but never presents or ranks specific commercial products (e.g. "Barclays 4.19% 5-Year Fixed").
* **Mandatory Universal Disclaimers:** Visible in the header, footer, modal views, and exported PDF reports:
  ```text
  "LadderPass is an independent financial modeling platform and does not provide FCA-regulated financial advice. 
  Calculations are illustrative scenarios based on statutory UK tax rates and market averages. When you request a 
  consultation, we introduce you to an FCA-authorised independent intermediary who assesses your full financial circumstances."
  ```
* **Statutory Warning Badges:** Prominently featured on all mortgage scenario views:
  ```text
  "Your home may be repossessed if you do not keep up repayments on your mortgage."
  ```

---

## 3. FCA Consumer Duty (PRIN 2A) Architecture

Even when operating outside the regulatory perimeter as an introducer, the **FCA Consumer Duty (Principle 12)** heavily impacts the intermediary chain. Authorised mortgage brokers and IFAs who purchase leads from third parties are held legally liable for the ethics and clarity of lead sources.

LadderPass directly reinforces our partners' Consumer Duty compliance through four core outcomes:

### Outcome 1: Products and Services
* **Problem in Legacy Lead Gen:** Clickbait sites harvest data by offering unrealistic loan terms ("Guaranteed 100% Mortgages with Bad Credit").
* **LadderPass Compliance:** Every user must configure realistic deposit percentages, purchase prices, and income tiers. Mathematical outputs are strictly bounded by statutory HMRC rules and verified Bank of England market rates.

### Outcome 2: Price and Value
* **Problem in Legacy Lead Gen:** Hidden transaction costs are concealed to maximize application volume.
* **LadderPass Compliance:** Exposes the complete cost of ownership: Stamp Duty Land Tax (including the April 2025 FTB threshold drop to £300k and the 5% HRAD surcharge), conveyancing legal fees, RICS survey fees, and lifetime mortgage interest over 40 years.

### Outcome 3: Consumer Understanding
* **Problem in Legacy Lead Gen:** Consumers are trapped in 2-year fixed mortgages without understanding payment shock at renewal.
* **LadderPass Compliance:** Integrated Sensitivity Stress-Test View models +1.0%, +2.0%, and +3.0% interest rate shocks, clearly showing the exact monthly cash payment impact before the user enters a broker funnel.

### Outcome 4: Consumer Support
* **Problem in Legacy Lead Gen:** Leads are sold to multiple high-pressure telemarketing call centers simultaneously.
* **LadderPass Compliance:** Exclusive matching policy. Leads are introduced to a single whole-of-market FCA broker or Chartered IFA who contacts the consumer within 24 business hours.

---

## 4. Introducer Appointed Representative (IAR) Governance (SUP 12)

When LadderPass transitions to Phase 2 (IAR status under a Principal broker network):
1. **Principal Oversight:** The Principal broker firm conducts an initial due diligence audit of LadderPass's websites, calculations, and financial promotions.
2. **Approved Persons & SM&CR:** The Principal's Compliance Officer assumes regulatory oversight for all promotional material published by LadderPass.
3. **Scope of Permission:** LadderPass’s permissions under SUP 12 are strictly restricted to:
   * Effecting introductions to the Principal or its appointed brokers.
   * Distributing financial promotions pre-approved by the Principal.
4. **Prohibited Activities:** LadderPass personnel will never negotiate mortgage terms, provide advice, or handle client money.

---

## 5. Data Protection, Privacy & UK GDPR Compliance

### 5.1 Legal Basis for Processing
LadderPass processes borrower and user personal data under the lawful basis of **Explicit Consent (Article 6(1)(a) UK GDPR)**.

### 5.2 Consent Mechanics
* All consultation forms and lead capture modals feature an un-ticked, explicit consent checkbox:
  ```text
  [ ] I consent to LadderPass securely sharing my scenario details and contact information with an FCA-authorised mortgage broker or Chartered IFA to receive a consultation. I have read and agree to the Privacy Policy.
  ```
* Consent timestamps, IP addresses, and exact user scenario criteria are recorded in `data/leads.json` as audit evidence for ICO compliance.

### 5.3 Data Minimization Principles
* **What We Collect:** Name, email, phone number, target property price, deposit size, income bracket, and transaction timeline.
* **What We Never Collect:** Bank account numbers, sort codes, credit card numbers, National Insurance numbers, or full dates of birth.

### 5.4 Information Commissioner's Office (ICO) Registration
LadderPass maintains active registration with the ICO as a Data Controller and adheres to the UK Data Protection Act 2018. All data transmitted via webhooks to broker partners is encrypted in transit (TLS 1.3) and at rest (AES-256).
