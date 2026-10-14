/**
 * RentOrLadder Lead Audit and Export Tool
 * Allows AI agents or operators to inspect, export to CSV, and calculate affiliate revenue
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
  console.log("  FINVISOR BROKER AFFILIATE LEADS AUDIT         ");
  console.log("=================================================");
  console.log(`Total Leads Captured: ${leads.length}`);

  const totalEstimatedValue = leads.reduce((sum, l) => sum + (l.estimatedLeadValueGbp || 175), 0);
  console.log(`Total Estimated Affiliate Value: £${totalEstimatedValue.toLocaleString("en-GB")}`);

  const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED" || l.depositPercent >= 10);
  console.log(`High-Intent Qualified Leads: ${qualifiedLeads.length}`);
  console.log("-------------------------------------------------");

  if (process.argv.includes("--format=csv")) {
    console.log("ID,Created,Name,Email,PropertyPrice,Deposit,LTV,BuyerType,LeadValue");
    for (const lead of leads) {
      console.log(
        `"${lead.id}","${lead.createdAt}","${lead.name}","${lead.email}",${lead.propertyPrice},${lead.depositAmount},${lead.ltvPercent}%,"${lead.buyerType}",£${lead.estimatedLeadValueGbp || 175}`
      );
    }
  } else {
    console.log(JSON.stringify(leads, null, 2));
  }
} catch (err) {
  console.error("Error reading leads:", err.message);
  process.exit(1);
}
