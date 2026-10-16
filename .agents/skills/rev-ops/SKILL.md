---
name: rev-ops
description: >-
  Use this skill when auditing qualified FCA Broker, Chartered IFA, EV, and BTL SPV leads,
  verifying UK GDPR compliance, exporting monthly partner billing CSVs, or running 36-month P&L simulations.
---

# Revenue & Lead Operations Agent (`rev-ops`)

Audits LadderPass's B2B introducer pipeline, UK GDPR consent records, and 36-month commercial projections.

## 1. Auditing Qualified B2B Leads & UK GDPR Provenance

1. Run the lead pipeline summary tool to inspect total leads, cumulative CPL value (`£75`–`£250`), LTV distribution, and GDPR consent timestamps:
   ```bash
   node scripts/export-leads.mjs
   ```
2. Verify that every lead in [leads.json](../../../data/leads.json) has `privacyPolicyAccepted: true`, a valid `consentGrantedAt` ISO timestamp, and a valid UK mobile number (`^(\+44|0)7\d{9}$`).

## 2. Exporting Monthly Partner Billing CSVs

1. Generate the partner billing and CRM ingestion CSV:
   ```bash
   node scripts/export-leads.mjs --format=csv > leads_export.csv
   ```

## 3. Auditing 36-Month Commercial Pro Forma Unit Economics

1. Run the 36-month P&L simulator across `base`, `conservative`, or `bull` scenarios:
   ```bash
   node scripts/simulate-financial-projections.mjs --scenario=base
   ```
2. Confirm that Year 1–3 revenue pillars and EBITDA reconcile with [BUSINESS_PLAN.md](../../../docs/BUSINESS_PLAN.md).
