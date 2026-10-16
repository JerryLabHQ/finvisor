---
name: rate-watcher
description: >-
  Use this skill when updating Bank of England base rates, UK 5-year fixed mortgage averages,
  lender SVR rates, or devolved UK property tax brackets (SDLT, Scottish LBTT, Welsh LTT) in LadderPass.
---

# Macro & Statutory Rate Agent (`rate-watcher`)

> **Execution Tier:** `Model: "flash"` with **Maximum Thinking Effort**. Reason exhaustively step-by-step through every HMRC, Revenue Scotland, Welsh Revenue Authority, and Bank of England threshold before modifying any rate or bracket.

Maintains statutory accuracy across Bank of England monetary policy benchmarks and HMRC / Revenue Scotland / Welsh Revenue Authority tax brackets.

## 1. Updating Bank of England & Mortgage Market Rates

1. Run the rate updater script with the latest Bank of England Base Rate, 5-Year Fixed average, and Standard Variable Rate (SVR):
   ```bash
   node scripts/update-market-rates.mjs --mortgage=3.9 --svr=7.25 --boe=4.25
   ```
2. Verify that [constants.ts](../../../src/lib/constants.ts) (`UK_MARKET_DEFAULTS`) and [MacroDataTicker.tsx](../../../src/components/MacroDataTicker.tsx) reflect the updated rates and date.

## 2. Updating Devolved UK Property Tax Brackets (SDLT, LBTT, LTT)

1. Edit `SDLT_CONFIG` (England & NI), `LBTT_CONFIG` (Scotland), or `LTT_CONFIG` (Wales) in [constants.ts](../../../src/lib/constants.ts).
2. Update corresponding statutory assertions in [calculator.test.mjs](../../../test/calculator.test.mjs), [btl-spv-calculator.test.mjs](../../../test/btl-spv-calculator.test.mjs), and [verify-financial-math.mjs](../../../scripts/verify-financial-math.mjs).

## 3. Mandatory Verification

1. Run the mathematical audit suite:
   ```bash
   npm run verify:math
   ```
2. Run the unit test suite:
   ```bash
   npm test
   ```
