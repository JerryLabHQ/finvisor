import test from "node:test";
import assert from "node:assert/strict";
import { POST as leadsPost, GET as leadsGet } from "../src/app/api/leads/route.ts";
import { POST as checkoutPost } from "../src/app/api/checkout/route.ts";

test("API: POST /api/leads validates required fields", async () => {
  const req = new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "", email: "not-an-email" }),
  });

  const res = await leadsPost(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.error);
});

test("API: POST /api/leads records qualified lead with LTV and mortgage estimation", async () => {
  const req = new Request("http://localhost:3000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Elizabeth Bennet",
      email: "elizabeth@pemberley.co.uk",
      phone: "07700900123",
      propertyPrice: 500000,
      depositPercent: 20,
      mortgageRate: 4.5,
      mortgageTerm: 25,
      buyerType: "FIRST_TIME_BUYER",
      buyingTimeline: "IMMEDIATE_3M",
    }),
  });

  const res = await leadsPost(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.lead.propertyPrice, 500000);
  assert.equal(data.lead.depositAmount, 100000);
  assert.equal(data.lead.ltvPercent, 80);
  assert.ok(data.lead.estimatedMonthlyMortgage > 0);
});

test("API: GET /api/leads returns pipeline statistics", async () => {
  const res = await leadsGet();
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
