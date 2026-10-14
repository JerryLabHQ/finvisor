/**
 * RentOrLadder Market Benchmark Updater
 * Allows AI agents or automated jobs to update current market benchmarks
 * Example usage:
 *   node scripts/update-market-rates.mjs --mortgage=4.3 --svr=7.1 --boe=4.5 --inflation=2.4 --hpi=3.3
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const params = {};

for (const arg of args) {
  if (arg.startsWith("--")) {
    const [key, value] = arg.slice(2).split("=");
    params[key] = parseFloat(value);
  }
}

const constantsPath = path.resolve(process.cwd(), "src/lib/constants.ts");
let content = fs.readFileSync(constantsPath, "utf-8");

console.log("Current parameters to update:", params);

if (params.mortgage !== undefined && !isNaN(params.mortgage)) {
  content = content.replace(/defaultMortgageRate:\s*[0-9.]+/, `defaultMortgageRate: ${params.mortgage}`);
  console.log(`Updated defaultMortgageRate to ${params.mortgage}%`);
}

if (params.svr !== undefined && !isNaN(params.svr)) {
  content = content.replace(/defaultSvrRate:\s*[0-9.]+/, `defaultSvrRate: ${params.svr}`);
  console.log(`Updated defaultSvrRate to ${params.svr}%`);
}

if (params.boe !== undefined && !isNaN(params.boe)) {
  content = content.replace(/boeBaseRate:\s*[0-9.]+/, `boeBaseRate: ${params.boe}`);
  console.log(`Updated boeBaseRate to ${params.boe}%`);
}

if (params.inflation !== undefined && !isNaN(params.inflation)) {
  content = content.replace(/defaultInflationPercent:\s*[0-9.]+/, `defaultInflationPercent: ${params.inflation}`);
  console.log(`Updated defaultInflationPercent to ${params.inflation}%`);
}

if (params.hpi !== undefined && !isNaN(params.hpi)) {
  content = content.replace(/defaultHouseAppreciation:\s*[0-9.]+/, `defaultHouseAppreciation: ${params.hpi}`);
  console.log(`Updated defaultHouseAppreciation to ${params.hpi}%`);
}

// Update the timestamp in the file header
const dateStr = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
content = content.replace(/Last updated:\s*[^\n]+/, `Last updated: ${dateStr}`);

fs.writeFileSync(constantsPath, content, "utf-8");
console.log("Successfully updated src/lib/constants.ts!");

// Automatically run mathematical verification
console.log("\nRunning automatic math validation...");
try {
  execSync("npm run verify:math", { stdio: "inherit" });
  console.log("\nUpdate verified successfully! Safe to commit.");
} catch {
  console.error("\nVerification failed after update!");
  process.exit(1);
}
