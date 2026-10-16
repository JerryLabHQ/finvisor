---
name: qa-auditor
description: >-
  Use this skill before committing or releasing any code, tax config, or content updates
  to verify all 7 mandatory institutional acceptance gates in LadderPass.
---

# QA & Release Engineer Agent (`qa-auditor`)

> **Execution Tier:** `Model: "flash"` with **Maximum Thinking Effort**. Reason exhaustively step-by-step through every test assertion, statutory benchmark, linter rule, and Next.js route build before reporting gate status to the Virtual CEO.

Enforces LadderPass's 7 mandatory institutional acceptance gates before any commit or production deployment.

## 1. Execute the 7 Mandatory Acceptance Gates

1. **Zero Tip-Jar / Hobbyist Code Check:**
   ```bash
   grep -rn "buymeacoffee" src/ || true
   ```
   Must return `0` matches.
2. **Commercial Pro Forma Reconciliation:**
   ```bash
   node scripts/simulate-financial-projections.mjs
   ```
   Must match Year 1 (`£385,400` Rev / `£191,046` EBITDA), Year 2 (`£1,420,000` Rev / `£791,960` EBITDA), and Year 3 (`£3,850,000` Rev / `£2,358,250` EBITDA) in [BUSINESS_PLAN.md](../../../docs/BUSINESS_PLAN.md).
3. **Statutory Mathematical Audit:**
   ```bash
   npm run verify:math
   ```
   Must pass 100% of HMRC, Revenue Scotland, Welsh Revenue Authority, SLC, and DWP checks.
4. **Unit & API Test Suite:**
   ```bash
   npm test
   ```
   Must pass 100% of unit and `/api/leads` + `/api/checkout` tests.
5. **ESLint & React Compiler Check:**
   ```bash
   npm run lint
   ```
   Must exit with `0` errors and `0` warnings.
6. **Production Next.js Build:**
   ```bash
   npm run build
   ```
   Must compile all static, SSG `/city/[slug]`, `/partners`, and `/embed` routes with `0` errors.
