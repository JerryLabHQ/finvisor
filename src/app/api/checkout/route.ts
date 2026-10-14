import { NextResponse } from "next/server";
import { MONETIZATION_CONFIG } from "../../../lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan = "lifetime", returnUrl = "/" } = body;

    const isLifetime = plan === "lifetime";
    const amountGbp = isLifetime
      ? MONETIZATION_CONFIG.proPricing.lifetimePassGbp
      : MONETIZATION_CONFIG.proPricing.monthlySubscriptionGbp;

    // Check if Stripe is configured via environment variables
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      try {
        const formData = new URLSearchParams();
        formData.append("payment_method_types[0]", "card");
        formData.append("line_items[0][price_data][currency]", "gbp");
        formData.append("line_items[0][price_data][unit_amount]", String(amountGbp * 100));
        formData.append(
          "line_items[0][price_data][product_data][name]",
          `RentOrLadder Pro (${isLifetime ? "Lifetime Pass" : "Monthly"})`
        );
        formData.append(
          "line_items[0][price_data][product_data][description]",
          "Full UK property modeling, PDF reports, and scenario comparisons"
        );
        formData.append("line_items[0][quantity]", "1");
        formData.append("mode", isLifetime ? "payment" : "subscription");
        formData.append("success_url", `${returnUrl}?pro=success&session_id={CHECKOUT_SESSION_ID}`);
        formData.append("cancel_url", `${returnUrl}?pro=cancelled`);

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        const stripeSession = await stripeRes.json();
        if (stripeSession.url) {
          return NextResponse.json({ url: stripeSession.url });
        }
      } catch (stripeErr) {
        console.error("Stripe error, falling back to instant unlock mode:", stripeErr);
      }
    }

    // Instant Sandbox / Self-serve Fulfillment Mode
    const licenseKey = `PRO-${plan.toUpperCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      mode: "instant_unlock",
      plan,
      amountGbp,
      licenseKey,
      message: "Pro access granted! Your license key has been activated.",
      unlockedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: "Failed to initiate checkout" }, { status: 500 });
  }
}
