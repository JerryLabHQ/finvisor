import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tempLeadsPath = path.join(
  os.tmpdir(),
  `ladderpass-test-leads-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
);
process.env.LEADS_FILE_PATH = tempLeadsPath;

// Snapshot existing data/leads.json if present
const defaultLeadsPath = path.resolve(process.cwd(), "data", "leads.json");
const originalLeadsContent = fs.existsSync(defaultLeadsPath)
  ? fs.readFileSync(defaultLeadsPath, "utf-8")
  : null;

import { POST as leadsPost, GET as leadsGet } from "../src/app/api/leads/route.ts";
import { POST as checkoutPost } from "../src/app/api/checkout/route.ts";

test.after(() => {
  try {
    if (fs.existsSync(tempLeadsPath)) {
      fs.unlinkSync(tempLeadsPath);
    }
  } catch {
    // ignore
  }

  // Restore snapshot if data/leads.json was touched
  if (originalLeadsContent !== null && fs.existsSync(defaultLeadsPath)) {
    const current = fs.readFileSync(defaultLeadsPath, "utf-8");
    if (current !== originalLeadsContent) {
      fs.writeFileSync(defaultLeadsPath, originalLeadsContent, "utf-8");
    }
  }
});

test("API: POST /api/leads validates required fields, UK mobile format, and explicit UK GDPR consent", async () => {
  // Missing name/email
  const badReq1 = new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "not-an-email" }),
  });
  const res1 = await leadsPost(badReq1);
  assert.equal(res1.status, 400);

  // Invalid UK mobile number
  const badPhoneReq = new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Fitzwilliam Darcy",
      email: "darcy@pemberley.co.uk",
      phone: "0123456789",
      privacyPolicyAccepted: true,
    }),
  });
  const resPhone = await leadsPost(badPhoneReq);
  assert.equal(resPhone.status, 400);

  // Un-ticked GDPR consent
  const noGdprReq = new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Fitzwilliam Darcy",
      email: "darcy@pemberley.co.uk",
      phone: "07700 900 123",
      privacyPolicyAccepted: false,
    }),
  });
  const resGdpr = await leadsPost(noGdprReq);
  assert.equal(resGdpr.status, 400);
});

test("API: POST /api/leads records qualified lead with dynamic vertical CPL, GDPR timestamp, and qualificationMetrics", async () => {
  const req = new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Elizabeth Bennet",
      email: "elizabeth@pemberley.co.uk",
      phone: "+44 7700 900123",
      propertyPrice: 500000,
      depositPercent: 20,
      mortgageRate: 4.5,
      mortgageTerm: 25,
      buyerType: "FIRST_TIME_BUYER",
      buyingTimeline: "IMMEDIATE_3M",
      leadVertical: "MORTGAGE",
      privacyPolicyAccepted: true,
      consentGrantedAt: "2026-10-16T10:00:00.000Z",
      qualificationMetrics: {
        grossSalary: 115000,
        pensionPot: 180000,
        jurisdiction: "ENGLAND_NI",
      },
    }),
  });

  const res = await leadsPost(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.lead.propertyPrice, 500000);
  assert.equal(data.lead.depositAmount, 100000);
  assert.equal(data.lead.ltvPercent, 80);
  assert.equal(data.lead.privacyPolicyAccepted, true);
  // LTV <= 85% and IMMEDIATE_3M timeline -> £250 premium CPL
  assert.equal(data.lead.estimatedLeadValueGbp, 250);
  assert.equal(data.lead.qualificationMetrics.grossSalary, 115000);
  assert.ok(data.lead.estimatedMonthlyMortgage > 0);
});

test("API: GET /api/leads returns pipeline statistics", async () => {
  const res = await leadsGet(new Request("http://localhost:3000/api/leads"));
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(typeof data.totalLeads === "number");
  assert.ok(data.totalPipelineValueGbp >= 0);
});

test("API: POST /api/checkout handles self-serve instant license fulfillment", async () => {
  const req = new Request("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: "lifetime" }),
  });

  const res = await checkoutPost(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.plan, "lifetime");
  assert.equal(data.amountGbp, 19);
  assert.ok(data.licenseKey.startsWith("PRO-LIFETIME"));
});
