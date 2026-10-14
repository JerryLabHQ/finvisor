/**
 * LadderPass City Property Market Data Updater
 * Updates regional city benchmarks (Land Registry HPI & ONS rental index) in src/lib/cities.ts
 *
 * Example usage:
 *   node scripts/update-city-data.mjs --list
 *   node scripts/update-city-data.mjs --city=london --price=540000 --rent=2200 --hpi=2.9
 *   node scripts/update-city-data.mjs --city=manchester --price=248000 --rent=1275
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const params = {};

for (const arg of args) {
  if (arg === "--list") {
    params.list = true;
  } else if (arg.startsWith("--")) {
    const [key, value] = arg.slice(2).split("=");
    params[key] = isNaN(Number(value)) ? value : parseFloat(value);
  }
}

const citiesPath = path.resolve(process.cwd(), "src/lib/cities.ts");
let fileContent = fs.readFileSync(citiesPath, "utf-8");

// Parse existing cities
function extractCityBlocks(content) {
  const blocks = [];
  // Match each city object in UK_CITIES array
  const cityRegex = /\{\s*slug:\s*"([a-z-]+)",[\s\S]*?\n\s*\}/g;
  let match;
  while ((match = cityRegex.exec(content)) !== null) {
    blocks.push({
      slug: match[1],
      fullText: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }
  return blocks;
}

const blocks = extractCityBlocks(fileContent);

if (params.list) {
  console.log("\n==========================================================================");
  console.log("  LADDERPASS REGIONAL CITY PROPERTY DATA (src/lib/cities.ts)             ");
  console.log("==========================================================================");
  console.log("SLUG         NAME           AVG PRICE   AVG RENT   P/R RATIO   5-YR HPI");
  console.log("--------------------------------------------------------------------------");
  
  for (const block of blocks) {
    const nameMatch = block.fullText.match(/name:\s*"([^"]+)"/);
    const priceMatch = block.fullText.match(/averagePrice:\s*(\d+)/);
    const rentMatch = block.fullText.match(/averageRentMonthly:\s*(\d+)/);
    const ratioMatch = block.fullText.match(/priceToRentRatio:\s*([0-9.]+)/);
    const hpiMatch = block.fullText.match(/historicalHpi5YrAvg:\s*([0-9.]+)/);
    
    const name = nameMatch ? nameMatch[1] : block.slug;
    const price = priceMatch ? `£${Number(priceMatch[1]).toLocaleString("en-GB")}` : "N/A";
    const rent = rentMatch ? `£${Number(rentMatch[1]).toLocaleString("en-GB")}/mo` : "N/A";
    const ratio = ratioMatch ? `${ratioMatch[1]}x` : "N/A";
    const hpi = hpiMatch ? `${hpiMatch[1]}%` : "N/A";

    console.log(
      `${block.slug.padEnd(12)} ${name.padEnd(14)} ${price.padEnd(11)} ${rent.padEnd(10)} ${ratio.padEnd(11)} ${hpi}`
    );
  }
  console.log("==========================================================================\n");
  process.exit(0);
}

if (!params.city) {
  console.error("Error: --city=<slug> is required. Run with --list to see available city slugs.");
  process.exit(1);
}

const targetSlug = String(params.city).toLowerCase();
const cityBlock = blocks.find((b) => b.slug === targetSlug);

if (!cityBlock) {
  console.error(`Error: City '${targetSlug}' not found in src/lib/cities.ts.`);
  console.error(`Available cities: ${blocks.map((b) => b.slug).join(", ")}`);
  process.exit(1);
}

let updatedBlockText = cityBlock.fullText;

// Extract current values to calculate updated price-to-rent ratio if only one changes
let currentPrice = Number(cityBlock.fullText.match(/averagePrice:\s*(\d+)/)?.[1] || 0);
let currentRent = Number(cityBlock.fullText.match(/averageRentMonthly:\s*(\d+)/)?.[1] || 0);

if (params.price !== undefined && !isNaN(params.price)) {
  currentPrice = Number(params.price);
  updatedBlockText = updatedBlockText.replace(
    /averagePrice:\s*\d+/,
    `averagePrice: ${currentPrice}`
  );
  // Update price in highlights
  const formattedPrice = `£${currentPrice.toLocaleString("en-GB")}`;
  updatedBlockText = updatedBlockText.replace(
    /(Average (?:2-bed )?property price:\s*)£[0-9,]+/g,
    `$1${formattedPrice}`
  );
  console.log(`[${targetSlug}] Updated averagePrice to £${currentPrice.toLocaleString("en-GB")}`);
}

if (params.rent !== undefined && !isNaN(params.rent)) {
  currentRent = Number(params.rent);
  updatedBlockText = updatedBlockText.replace(
    /averageRentMonthly:\s*\d+/,
    `averageRentMonthly: ${currentRent}`
  );
  // Update rent in highlights
  const formattedRent = `£${currentRent.toLocaleString("en-GB")}`;
  updatedBlockText = updatedBlockText.replace(
    /(Average private rent:\s*)£[0-9,]+(\/month)/g,
    `$1${formattedRent}$2`
  );
  console.log(`[${targetSlug}] Updated averageRentMonthly to £${currentRent.toLocaleString("en-GB")}`);
}

// Automatically recompute price-to-rent ratio if price or rent changed
if (currentPrice > 0 && currentRent > 0) {
  const annualRent = currentRent * 12;
  const newRatio = Math.round((currentPrice / annualRent) * 10) / 10;
  updatedBlockText = updatedBlockText.replace(
    /priceToRentRatio:\s*[0-9.]+/,
    `priceToRentRatio: ${newRatio}`
  );
  console.log(`[${targetSlug}] Recomputed priceToRentRatio to ${newRatio}x`);
}

if (params.hpi !== undefined && !isNaN(params.hpi)) {
  updatedBlockText = updatedBlockText.replace(
    /historicalHpi5YrAvg:\s*[0-9.]+/,
    `historicalHpi5YrAvg: ${params.hpi}`
  );
  console.log(`[${targetSlug}] Updated historicalHpi5YrAvg to ${params.hpi}%`);
}

if (params.deposit !== undefined && !isNaN(params.deposit)) {
  updatedBlockText = updatedBlockText.replace(
    /typicalDepositPct:\s*\d+/,
    `typicalDepositPct: ${params.deposit}`
  );
  console.log(`[${targetSlug}] Updated typicalDepositPct to ${params.deposit}%`);
}

if (params.councilTax !== undefined && !isNaN(params.councilTax)) {
  updatedBlockText = updatedBlockText.replace(
    /typicalCouncilTaxMonthly:\s*\d+/,
    `typicalCouncilTaxMonthly: ${params.councilTax}`
  );
  console.log(`[${targetSlug}] Updated typicalCouncilTaxMonthly to £${params.councilTax}`);
}

if (params.serviceCharge !== undefined && !isNaN(params.serviceCharge)) {
  updatedBlockText = updatedBlockText.replace(
    /typicalServiceChargeMonthly:\s*\d+/,
    `typicalServiceChargeMonthly: ${params.serviceCharge}`
  );
  console.log(`[${targetSlug}] Updated typicalServiceChargeMonthly to £${params.serviceCharge}`);
}

// Replace the block in the main file
const newFileContent =
  fileContent.slice(0, cityBlock.startIndex) +
  updatedBlockText +
  fileContent.slice(cityBlock.endIndex);

fs.writeFileSync(citiesPath, newFileContent, "utf-8");
console.log(`\nSuccessfully updated ${targetSlug} in src/lib/cities.ts!`);

// Run verification suite
console.log("\nRunning automatic math validation...");
try {
  execSync("npm run verify:math", { stdio: "inherit" });
  console.log("\nUpdate verified successfully! Safe to commit.");
} catch {
  console.error("\nVerification failed after updating city data!");
  process.exit(1);
}
