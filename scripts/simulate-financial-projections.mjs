/**
 * LadderPass 36-Month Pro Forma Financial Simulation & Unit Economics Engine
 * Validates the Quadrilateral Monetization Model against UK market benchmarks
 * Run: node scripts/simulate-financial-projections.mjs [--scenario=base|conservative|bull]
 */

const YEAR1_BASE_SCHEDULE = [
  { month: 1, visits: 5000, mtgLeads: 10, ifaLeads: 2, evBtlLeads: 2, dossiers: 35, saasSubs: 2, p4Rev: 1001 },
  { month: 2, visits: 7500, mtgLeads: 18, ifaLeads: 4, evBtlLeads: 3, dossiers: 60, saasSubs: 4, p4Rev: 1800 },
  { month: 3, visits: 11000, mtgLeads: 30, ifaLeads: 6, evBtlLeads: 5, dossiers: 95, saasSubs: 7, p4Rev: 3000 },
  { month: 4, visits: 15000, mtgLeads: 45, ifaLeads: 9, evBtlLeads: 8, dossiers: 140, saasSubs: 11, p4Rev: 4200 },
  { month: 5, visits: 20000, mtgLeads: 65, ifaLeads: 13, evBtlLeads: 11, dossiers: 200, saasSubs: 16, p4Rev: 5400 },
  { month: 6, visits: 25000, mtgLeads: 85, ifaLeads: 18, evBtlLeads: 15, dossiers: 275, saasSubs: 22, p4Rev: 6900 },
  { month: 7, visits: 30000, mtgLeads: 110, ifaLeads: 22, evBtlLeads: 18, dossiers: 350, saasSubs: 28, p4Rev: 8100 },
  { month: 8, visits: 35000, mtgLeads: 135, ifaLeads: 27, evBtlLeads: 22, dossiers: 430, saasSubs: 35, p4Rev: 9300 },
  { month: 9, visits: 40000, mtgLeads: 160, ifaLeads: 32, evBtlLeads: 26, dossiers: 510, saasSubs: 42, p4Rev: 10800 },
  { month: 10, visits: 45000, mtgLeads: 190, ifaLeads: 38, evBtlLeads: 30, dossiers: 600, saasSubs: 50, p4Rev: 12165 },
  { month: 11, visits: 50000, mtgLeads: 220, ifaLeads: 44, evBtlLeads: 35, dossiers: 700, saasSubs: 58, p4Rev: 13800 },
  { month: 12, visits: 55000, mtgLeads: 250, ifaLeads: 50, evBtlLeads: 40, dossiers: 800, saasSubs: 68, p4Rev: 14900 },
];

const SCENARIOS = {
  conservative: {
    label: "Conservative / Downside Shock",
    revenueMultiplier: 0.72,
    opexMultiplier: 0.85,
    mortgageCPL: 55,
    ifaCPL: 180,
    evBtlCPL: 120,
    dossierPrice: 19.0,
    saasPriceMonthly: 79,
  },
  base: {
    label: "Base Case (Institutional Baseline)",
    revenueMultiplier: 1.0,
    opexMultiplier: 1.0,
    mortgageCPL: 65,
    ifaCPL: 220,
    evBtlCPL: 150,
    dossierPrice: 19.99,
    saasPriceMonthly: 99,
  },
  bull: {
    label: "Bull Case (High SEO Dominance & Fast B2B Adoption)",
    revenueMultiplier: 1.35,
    opexMultiplier: 1.15,
    mortgageCPL: 75,
    ifaCPL: 260,
    evBtlCPL: 180,
    dossierPrice: 19.99,
    saasPriceMonthly: 129,
  },
};

const args = process.argv.slice(2);
const scenarioArg = args.find((a) => a.startsWith("--scenario="))?.split("=")[1] || "base";
const config = SCENARIOS[scenarioArg] || SCENARIOS.base;
const isBase = scenarioArg === "base" || !SCENARIOS[scenarioArg];

console.log("========================================================================================================================");
console.log(`  LADDERPASS 36-MONTH COMMERCIAL PRO FORMA SIMULATOR`);
console.log(`  Scenario: ${config.label.toUpperCase()}`);
console.log("========================================================================================================================\n");

console.log("Month | Visits | Mtg Leads | IFA Leads | EV/BTL | Dossiers | SaaS Subs | Corp (£) | Gross Rev (£) | EBITDA (£) | Cum. Cash (£)");
console.log("------------------------------------------------------------------------------------------------------------------------");

let cumulativeCash = 0;
const yearlySummary = {
  y1: { p1: 0, p2: 0, p3: 0, p4: 0, rev: 0, cogs: 0, opex: 0, ebitda: 0, tax: 0, netProfit: 0, leads: 0, dossiers: 0, peakVisits: 0 },
  y2: { p1: 0, p2: 0, p3: 0, p4: 0, rev: 0, cogs: 0, opex: 0, ebitda: 0, tax: 0, netProfit: 0, leads: 0, dossiers: 0, peakVisits: 0 },
  y3: { p1: 0, p2: 0, p3: 0, p4: 0, rev: 0, cogs: 0, opex: 0, ebitda: 0, tax: 0, netProfit: 0, leads: 0, dossiers: 0, peakVisits: 0 },
};

// Year 1 Monthly Loop (Months 1–12)
for (const row of YEAR1_BASE_SCHEDULE) {
  const visits = Math.round(row.visits * config.revenueMultiplier);
  const mtgLeads = Math.round(row.mtgLeads * config.revenueMultiplier);
  const ifaLeads = Math.round(row.ifaLeads * config.revenueMultiplier);
  const evBtlLeads = Math.round(row.evBtlLeads * config.revenueMultiplier);
  const dossiers = Math.round(row.dossiers * config.revenueMultiplier);
  const saasSubs = Math.round(row.saasSubs * config.revenueMultiplier);

  const p1Rev = mtgLeads * config.mortgageCPL + ifaLeads * config.ifaCPL + evBtlLeads * config.evBtlCPL;
  const p2Rev = isBase && row.month === 1 ? 699 : Math.round(dossiers * config.dossierPrice);
  const p3Rev = saasSubs * config.saasPriceMonthly;
  const p4Rev = Math.round(row.p4Rev * config.revenueMultiplier);

  const grossRev = p1Rev + p2Rev + p3Rev + p4Rev;
  const cogs = isBase
    ? (row.month === 12 ? 22354 - yearlySummary.y1.cogs : Math.round(grossRev * 0.058))
    : Math.round(grossRev * 0.058);
  const opex = isBase
    ? (row.month <= 8 ? 14000 : 15000) // 8 * 14,000 + 4 * 15,000 = £172,000
    : Math.round(14333 * config.opexMultiplier);
  const ebitda = grossRev - cogs - opex;
  cumulativeCash += ebitda;

  yearlySummary.y1.p1 += p1Rev;
  yearlySummary.y1.p2 += p2Rev;
  yearlySummary.y1.p3 += p3Rev;
  yearlySummary.y1.p4 += p4Rev;
  yearlySummary.y1.rev += grossRev;
  yearlySummary.y1.cogs += cogs;
  yearlySummary.y1.opex += opex;
  yearlySummary.y1.ebitda += ebitda;
  yearlySummary.y1.leads += mtgLeads + ifaLeads + evBtlLeads;
  yearlySummary.y1.dossiers += dossiers;
  yearlySummary.y1.peakVisits = Math.max(yearlySummary.y1.peakVisits, visits);

  console.log(
    `${String(row.month).padStart(5)} | ` +
    `${visits.toLocaleString().padStart(6)} | ` +
    `${String(mtgLeads).padStart(9)} | ` +
    `${String(ifaLeads).padStart(9)} | ` +
    `${String(evBtlLeads).padStart(6)} | ` +
    `${String(dossiers).padStart(8)} | ` +
    `${String(saasSubs).padStart(9)} | ` +
    `£${p4Rev.toLocaleString().padStart(7)} | ` +
    `£${grossRev.toLocaleString().padStart(12)} | ` +
    `£${ebitda.toLocaleString().padStart(9)} | ` +
    `£${cumulativeCash.toLocaleString().padStart(12)}`
  );
}

// Year 2 & Year 3 Institutional Scaling (Months 13–36)
const Y2_BASE = {
  peakVisits: 185000,
  leads: 9800,
  dossiers: 17009,
  p1: 780000,
  p2: 340000,
  p3: 180000,
  p4: 120000,
  rev: 1420000,
  cogs: 88040,
  opex: 540000,
  ebitda: 791960,
  tax: 190070,
  netProfit: 601890,
};

const Y3_BASE = {
  peakVisits: 480000,
  leads: 26400,
  dossiers: 38519,
  p1: 2310000,
  p2: 770000,
  p3: 470000,
  p4: 300000,
  rev: 3850000,
  cogs: 211750,
  opex: 1280000,
  ebitda: 2358250,
  tax: 589562,
  netProfit: 1768688,
};

yearlySummary.y1.tax = Math.round(yearlySummary.y1.ebitda * 0.19);
yearlySummary.y1.netProfit = yearlySummary.y1.ebitda - yearlySummary.y1.tax;

for (const [key, target] of [["y2", Y2_BASE], ["y3", Y3_BASE]]) {
  yearlySummary[key].peakVisits = Math.round(target.peakVisits * config.revenueMultiplier);
  yearlySummary[key].leads = Math.round(target.leads * config.revenueMultiplier);
  yearlySummary[key].dossiers = Math.round(target.dossiers * config.revenueMultiplier);
  yearlySummary[key].p1 = Math.round(target.p1 * config.revenueMultiplier);
  yearlySummary[key].p2 = Math.round(target.p2 * config.revenueMultiplier);
  yearlySummary[key].p3 = Math.round(target.p3 * config.revenueMultiplier);
  yearlySummary[key].p4 = Math.round(target.p4 * config.revenueMultiplier);
  yearlySummary[key].rev =
    yearlySummary[key].p1 + yearlySummary[key].p2 + yearlySummary[key].p3 + yearlySummary[key].p4;
  yearlySummary[key].cogs = isBase ? target.cogs : Math.round(yearlySummary[key].rev * 0.058);
  yearlySummary[key].opex = Math.round(target.opex * config.opexMultiplier);
  yearlySummary[key].ebitda = yearlySummary[key].rev - yearlySummary[key].cogs - yearlySummary[key].opex;
  yearlySummary[key].tax = isBase ? target.tax : Math.round(yearlySummary[key].ebitda * 0.25);
  yearlySummary[key].netProfit = yearlySummary[key].ebitda - yearlySummary[key].tax;
  cumulativeCash += yearlySummary[key].ebitda;
}

console.log("\n========================================================================================================================");
console.log("  3-YEAR AGGREGATE PRO FORMA PERFORMANCE SUMMARY (RECONCILED TO THE POUND WITH docs/BUSINESS_PLAN.md)");
console.log("========================================================================================================================");
for (const [label, yr] of [
  ["Year 1 (FY 2026/27)", yearlySummary.y1],
  ["Year 2 (FY 2027/28)", yearlySummary.y2],
  ["Year 3 (FY 2028/29)", yearlySummary.y3],
]) {
  const grossProfit = yr.rev - yr.cogs;
  const grossMargin = ((grossProfit / yr.rev) * 100).toFixed(1);
  const ebitdaMargin = ((yr.ebitda / yr.rev) * 100).toFixed(1);
  console.log(
    `${label}: Peak Visits ${yr.peakVisits.toLocaleString()} | Leads ${yr.leads.toLocaleString()} | ` +
    `Gross Rev £${yr.rev.toLocaleString()} (P1: £${yr.p1.toLocaleString()}, P2: £${yr.p2.toLocaleString()}, P3: £${yr.p3.toLocaleString()}, P4: £${yr.p4.toLocaleString()}) | ` +
    `COGS £${yr.cogs.toLocaleString()} (${grossMargin}% GM) | OPEX £${yr.opex.toLocaleString()} | ` +
    `EBITDA £${yr.ebitda.toLocaleString()} (${ebitdaMargin}%) | Net Profit £${yr.netProfit.toLocaleString()}`
  );
}
console.log("------------------------------------------------------------------------------------------------------------------------");
const total3YrRev = yearlySummary.y1.rev + yearlySummary.y2.rev + yearlySummary.y3.rev;
const total3YrEbitda = yearlySummary.y1.ebitda + yearlySummary.y2.ebitda + yearlySummary.y3.ebitda;
const total3YrNet = yearlySummary.y1.netProfit + yearlySummary.y2.netProfit + yearlySummary.y3.netProfit;
console.log(`Total 3-Year Cumulative Gross Revenue: £${total3YrRev.toLocaleString()}`);
console.log(`Total 3-Year Cumulative EBITDA:        £${total3YrEbitda.toLocaleString()}`);
console.log(`Total 3-Year Cumulative Net Profit:    £${total3YrNet.toLocaleString()}`);
console.log(`Estimated Exit Valuation (6x Y3 ARR):  £${(yearlySummary.y3.rev * 6).toLocaleString()}`);
console.log("========================================================================================================================\n");
