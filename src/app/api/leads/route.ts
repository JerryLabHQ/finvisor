import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { calculateMonthlyMortgage } from "../../../lib/calculator";
import { BrokerLead } from "../../../lib/types";
import { MONETIZATION_CONFIG, UK_MARKET_DEFAULTS } from "../../../lib/constants";

const DATA_DIR = path.resolve(process.cwd(), "data");
const LEADS_FILE = path.resolve(DATA_DIR, "leads.json");

function getStoredLeads(): BrokerLead[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, "[]", "utf-8");
      return [];
    }
    const data = fs.readFileSync(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read leads file:", err);
    return [];
  }
}

function saveLeads(leads: BrokerLead[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save leads file:", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      propertyPrice = 350000,
      depositPercent = 15,
      mortgageRate = UK_MARKET_DEFAULTS.defaultMortgageRate,
      mortgageTerm = 25,
      buyerType = "FIRST_TIME_BUYER",
      buyingTimeline = "WITHIN_6M",
    } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a valid full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const price = Math.max(10000, Number(propertyPrice) || 350000);
    const depPct = Math.min(90, Math.max(5, Number(depositPercent) || 15));
    const depositAmount = Math.round(price * (depPct / 100));
    const loanAmount = price - depositAmount;
    const ltvPercent = Math.round((loanAmount / price) * 100);

    const estMonthly = Math.round(
      calculateMonthlyMortgage(loanAmount, Number(mortgageRate) || 4.5, Number(mortgageTerm) || 25)
    );

    // Compute Lead Value Tier for Broker monetization
    let leadValue = MONETIZATION_CONFIG.brokerReferral.averageBrokerCommissionPerLeadGbp;
    if (ltvPercent <= 85 && buyingTimeline === "IMMEDIATE_3M") {
      leadValue = 250; // Premium ready-to-transact borrower
    } else if (buyingTimeline === "JUST_RESEARCHING") {
      leadValue = 100; // Early nurture lead
    }

    const newLead: BrokerLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      propertyPrice: price,
      depositAmount,
      depositPercent: depPct,
      loanAmount,
      ltvPercent,
      estimatedMonthlyMortgage: estMonthly,
      buyerType,
      buyingTimeline,
      status: "NEW",
      estimatedLeadValueGbp: leadValue,
    };

    const existingLeads = getStoredLeads();
    existingLeads.unshift(newLead);
    saveLeads(existingLeads);

    // If an external webhook (Zapier, Make, CRM) is configured, forward lead asynchronously
    const webhookUrl = process.env.BROKER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      }).catch((webhookErr) => {
        console.warn("Broker webhook forwarding failed:", webhookErr);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead recorded successfully. Broker match assigned.",
      lead: {
        id: newLead.id,
        name: newLead.name,
        propertyPrice: newLead.propertyPrice,
        depositAmount: newLead.depositAmount,
        estimatedMonthlyMortgage: newLead.estimatedMonthlyMortgage,
        ltvPercent: newLead.ltvPercent,
      },
    });
  } catch (error) {
    console.error("Error processing lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const leads = getStoredLeads();
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedLeadValueGbp || 175), 0);
  return NextResponse.json({
    totalLeads: leads.length,
    totalPipelineValueGbp: totalPipelineValue,
    leadsSummary: leads.slice(0, 10).map((l) => ({
      id: l.id,
      createdAt: l.createdAt,
      buyerType: l.buyerType,
      ltvPercent: l.ltvPercent,
      propertyPrice: l.propertyPrice,
      depositAmount: l.depositAmount,
      estimatedLeadValueGbp: l.estimatedLeadValueGbp,
    })),
  });
}
