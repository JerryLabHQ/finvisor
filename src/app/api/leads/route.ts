import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { calculateMonthlyMortgage } from "../../../lib/calculator";
import { BrokerLead } from "../../../lib/types";
import { MONETIZATION_CONFIG, UK_MARKET_DEFAULTS } from "../../../lib/constants";

const DATA_DIR = path.resolve(process.cwd(), "data");
const LEADS_FILE = process.env.LEADS_FILE_PATH
  ? path.resolve(process.env.LEADS_FILE_PATH)
  : path.resolve(DATA_DIR, "leads.json");

function getLeadsFilePath(): string {
  return process.env.LEADS_FILE_PATH
    ? path.resolve(process.env.LEADS_FILE_PATH)
    : LEADS_FILE;
}

function getStoredLeads(): BrokerLead[] {
  try {
    const leadsFile = getLeadsFilePath();
    const leadsDir = path.dirname(leadsFile);
    if (!fs.existsSync(leadsDir)) {
      fs.mkdirSync(leadsDir, { recursive: true });
    }
    if (!fs.existsSync(leadsFile)) {
      fs.writeFileSync(leadsFile, "[]", "utf-8");
      return [];
    }
    const data = fs.readFileSync(leadsFile, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read leads file:", err);
    return [];
  }
}

function saveLeads(leads: BrokerLead[]) {
  try {
    const leadsFile = getLeadsFilePath();
    const leadsDir = path.dirname(leadsFile);
    if (!fs.existsSync(leadsDir)) {
      fs.mkdirSync(leadsDir, { recursive: true });
    }
    fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save leads file:", err);
  }
}

function validateUkMobilePhone(rawPhone?: string): { valid: boolean; normalized?: string } {
  if (!rawPhone || typeof rawPhone !== "string" || rawPhone.trim().length === 0) {
    return { valid: true, normalized: undefined };
  }
  const stripped = rawPhone.replace(/[\s\-()]/g, "");
  const normalized = stripped.startsWith("+4407")
    ? "+447" + stripped.slice(5)
    : stripped;
  const isValid = /^(\+44|0)7\d{9}$/.test(normalized);
  return { valid: isValid, normalized: isValid ? normalized : undefined };
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
      privacyPolicyAccepted,
      consentGrantedAt,
      qualificationMetrics,
    } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please provide a valid full name." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (privacyPolicyAccepted === false) {
      return NextResponse.json(
        { error: "Explicit UK GDPR consent is required before dispatching advisor introductions." },
        { status: 400 }
      );
    }

    const phoneCheck = validateUkMobilePhone(phone);
    if (!phoneCheck.valid) {
      return NextResponse.json(
        { error: "Please provide a valid UK mobile telephone number (e.g. 07700 900123 or +447700900123)." },
        { status: 400 }
      );
    }

    const price = Math.max(10000, Number(propertyPrice) || 350000);
    const depPct = Math.min(90, Math.max(5, Number(depositPercent) || 15));
    const depositAmount = Math.round(price * (depPct / 100));
    const loanAmount = price - depositAmount;
    const ltvPercent = Math.round((loanAmount / price) * 100);

    const estMonthly = Math.round(
      calculateMonthlyMortgage(loanAmount, Number(mortgageRate) || 4.5, Number(mortgageTerm) || 25)
    );

    // Compute dynamic Vertical CPL for Broker / IFA / Fleet monetization
    let leadValue = MONETIZATION_CONFIG.brokerReferral.averageBrokerCommissionPerLeadGbp; // £75 baseline residential mortgage
    if (buyerType === "HIGH_EARNER_TAX" || buyerType === "RETIREMENT_PLANNING") {
      leadValue = 220; // IFA / Chartered Tax Adviser wealth lead (>£100k salary/pot)
    } else if (buyerType === "EV_SALARY_SACRIFICE" || buyerType === "BUY_TO_LET_INVESTOR") {
      leadValue = 150; // Commercial Fleet / Corporate SPV BTL lead
    } else if (ltvPercent <= 85 && buyingTimeline === "IMMEDIATE_3M") {
      leadValue = 250; // Premium <85% LTV immediate residential mortgage borrower
    } else if (buyingTimeline === "JUST_RESEARCHING") {
      leadValue = 75;
    }

    const nowIso = new Date().toISOString();
    const newLead: BrokerLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: nowIso,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phoneCheck.normalized,
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
      privacyPolicyAccepted: privacyPolicyAccepted ?? true,
      consentGrantedAt: typeof consentGrantedAt === "string" && consentGrantedAt ? consentGrantedAt : nowIso,
      qualificationMetrics:
        qualificationMetrics && typeof qualificationMetrics === "object"
          ? {
              grossSalary: Number(qualificationMetrics.grossSalary) || undefined,
              pensionPot: Number(qualificationMetrics.pensionPot) || undefined,
              evP11dValue: Number(qualificationMetrics.evP11dValue) || undefined,
              btlPortfolioSize: Number(qualificationMetrics.btlPortfolioSize) || undefined,
              studentLoanPlan: qualificationMetrics.studentLoanPlan ? String(qualificationMetrics.studentLoanPlan) : undefined,
              jurisdiction: qualificationMetrics.jurisdiction,
            }
          : undefined,
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

    // If Resend API Key is configured, dispatch transactional confirmation email
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      // 1. Borrower Confirmation Receipt
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SENDER_EMAIL || "LadderPass <consultation@ladderpass.com>",
          to: [newLead.email],
          subject: `Your UK Property Scenario & Mortgage Introduction (Ref: ${newLead.id})`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px;">
              <div style="font-size: 20px; font-weight: 700; margin-bottom: 6px; color: #064e3b;">🇬🇧 LadderPass — The UK Financial Ladder</div>
              <p style="font-size: 14px; color: #475569; margin-bottom: 20px;">Dear ${newLead.name},</p>
              <p style="font-size: 14px; line-height: 1.5; color: #334155;">
                Thank you for running your property scenario on LadderPass. As requested, we have matched your borrower criteria with an independent, whole-of-market FCA-regulated mortgage intermediary who will review your borrowing capacity without charging upfront advice fees.
              </p>
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Your Verified Scenario Criteria</div>
                <div style="font-size: 13px; line-height: 1.8;">
                  <strong>Target Property:</strong> £${newLead.propertyPrice.toLocaleString()}<br/>
                  <strong>Deposit Equity:</strong> £${newLead.depositAmount.toLocaleString()} (${newLead.depositPercent}%)<br/>
                  <strong>Loan Required:</strong> £${newLead.loanAmount.toLocaleString()} (${newLead.ltvPercent}% LTV)<br/>
                  <strong>Est. Initial Monthly Payment:</strong> ~£${newLead.estimatedMonthlyMortgage.toLocaleString()}/mo<br/>
                  <strong>Buying Timeline:</strong> ${newLead.buyingTimeline.replace(/_/g, " ")}
                </div>
              </div>
              <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
                LadderPass is an independent mathematical simulation platform. We do not provide FCA-regulated financial advice. Your assigned intermediary will assess your full financial circumstances.
              </p>
            </div>
          `,
        }),
      }).catch((emailErr) => {
        console.warn("Transactional email dispatch failed:", emailErr);
      });

      // 2. Broker Notification (if BROKER_EMAIL is configured)
      const brokerEmail = process.env.BROKER_EMAIL || process.env.LEAD_NOTIFICATION_EMAIL;
      if (brokerEmail) {
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.SENDER_EMAIL || "LadderPass Leads <leads@ladderpass.com>",
            to: [brokerEmail],
            subject: `[New Lead] £${newLead.propertyPrice.toLocaleString()} (${newLead.ltvPercent}% LTV) - ${newLead.name}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>New Qualified UK Borrower Introduction</h2>
                <p><strong>Name:</strong> ${newLead.name}</p>
                <p><strong>Email:</strong> ${newLead.email}</p>
                <p><strong>Phone:</strong> ${newLead.phone || "Not provided"}</p>
                <p><strong>Property Price:</strong> £${newLead.propertyPrice.toLocaleString()}</p>
                <p><strong>Deposit:</strong> £${newLead.depositAmount.toLocaleString()} (${newLead.depositPercent}%)</p>
                <p><strong>LTV:</strong> ${newLead.ltvPercent}%</p>
                <p><strong>Est. Monthly Mortgage:</strong> ~£${newLead.estimatedMonthlyMortgage.toLocaleString()}/mo</p>
                <p><strong>Timeline:</strong> ${newLead.buyingTimeline}</p>
                <p><strong>Estimated Lead Value:</strong> £${newLead.estimatedLeadValueGbp}</p>
              </div>
            `,
          }),
        }).catch((err) => console.warn("Broker email notification failed:", err));
      }
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
        estimatedLeadValueGbp: newLead.estimatedLeadValueGbp,
        buyerType: newLead.buyerType,
        privacyPolicyAccepted: newLead.privacyPolicyAccepted,
        consentGrantedAt: newLead.consentGrantedAt,
        qualificationMetrics: newLead.qualificationMetrics,
      },
    });
  } catch (error) {
    console.error("Error processing lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = request?.headers?.get("authorization") || request?.headers?.get("Authorization");

  if (adminKey) {
    if (authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing ADMIN_API_KEY Bearer token." }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production" || (authHeader && !authHeader.startsWith("Bearer test-"))) {
    return NextResponse.json({ error: "Unauthorized: Valid Bearer ADMIN_API_KEY required." }, { status: 401 });
  }

  const leads = getStoredLeads();
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedLeadValueGbp || 75), 0);
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
      privacyPolicyAccepted: l.privacyPolicyAccepted ?? true,
      consentGrantedAt: l.consentGrantedAt,
      qualificationMetrics: l.qualificationMetrics,
    })),
  });
}
