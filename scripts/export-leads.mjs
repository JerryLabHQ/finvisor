/**
 * LadderPass Lead Audit and Export Tool
 * Allows AI agents, operators, and commercial partners to inspect, export to CSV,
 * and calculate pipeline revenue across all 6 financial modules.
 *
 * Example:
 *   node scripts/export-leads.mjs [--format=csv|json] [--status=NEW|QUALIFIED|INVOICED]
 */

import fs from "node:fs";
import path from "node:path";

const leadsFilePath = path.resolve(process.cwd(), "data/leads.json");

if (!fs.existsSync(leadsFilePath)) {
  console.log("No leads file found at data/leads.json. Zero leads captured yet.");
  process.exit(0);
}

try {
  const raw = fs.readFileSync(leadsFilePath, "utf-8");
  const leads = JSON.parse(raw);

  console.log("=================================================");
  console.log("  LADDERPASS BROKER & PARTNER PIPELINE AUDIT     ");
  console.log("=================================================");
  console.log(`Total Leads Captured: ${leads.length}`);

  const totalEstimatedValue = leads.reduce((sum, l) => sum + (l.estimatedLeadValueGbp || 175), 0);
  console.log(`Total Pipeline Value: £${totalEstimatedValue.toLocaleString("en-GB")}`);

  // Category breakdown
  const categoryStats = {};
  for (const l of leads) {
    const cat = l.buyerType || "MORTGAGE";
    if (!categoryStats[cat]) {
      categoryStats[cat] = { count: 0, value: 0 };
    }
    categoryStats[cat].count += 1;
    categoryStats[cat].value += l.estimatedLeadValueGbp || 175;
  }

  console.log("\nPipeline Breakdown by Module:");
  for (const [cat, stat] of Object.entries(categoryStats)) {
    console.log(`  • ${cat}: ${stat.count} leads (Est. £${stat.value.toLocaleString("en-GB")})`);
  }

  const qualifiedLeads = leads.filter(
    (l) => l.status === "QUALIFIED" || l.depositPercent >= 10 || l.buyingTimeline === "IMMEDIATE_3M"
  );
  console.log(`\nHigh-Intent Ready-to-Transact Leads: ${qualifiedLeads.length}`);
  console.log("-------------------------------------------------");

  if (process.argv.includes("--format=csv")) {
    console.log(
      "ID,Created,Name,Email,Phone,PropertyPrice,Deposit,LTV,Category,Timeline,LeadValueGbp,GrossSalary,PensionPot,Jurisdiction,ConsentGrantedAt,Status"
    );
    for (const lead of leads) {
      const qm = lead.qualificationMetrics || {};
      console.log(
        `"${lead.id}","${lead.createdAt}","${lead.name}","${lead.email}","${lead.phone || ""}","${lead.propertyPrice || 0}","${lead.depositAmount || 0}","${lead.ltvPercent || 0}%","${lead.buyerType || "MORTGAGE"}","${lead.buyingTimeline || "IMMEDIATE_3M"}",${lead.estimatedLeadValueGbp || 75},"${qm.grossSalary || ""}","${qm.pensionPot || ""}","${qm.jurisdiction || "ENGLAND_NI"}","${lead.consentGrantedAt || lead.createdAt}","${lead.status || "NEW"}"`
      );
    }
  } else if (!process.argv.includes("--summary")) {
    console.log(JSON.stringify(leads, null, 2));
  }
} catch (err) {
  console.error("Error reading leads:", err.message);
  process.exit(1);
}
