import Stripe from "stripe";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { log } from "@/lib/log";
import { stripeTestModeRequired } from "@/lib/runtime-mode";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  log("info", "request", { requestId, route: "/api/stripe/webhook" });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!webhookSecret || !secretKey) {
    return errorResponse(500, "STRIPE_NOT_CONFIGURED", requestId);
  }

  if (stripeTestModeRequired && secretKey.startsWith("sk_live_")) {
    log("error", "stripe_live_key_in_non_prod", { requestId });
    return errorResponse(500, "STRIPE_LIVE_KEY_NOT_ALLOWED_IN_DEV", requestId);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    const stripe = new Stripe(secretKey);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return errorResponse(400, "INVALID_STRIPE_SIGNATURE", requestId);
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.metadata?.ioc_unlock === "1") {
    log("info", "webhook_ioc_checkout_ack", { requestId, checkoutSessionId: session.id });
    return NextResponse.json({ received: true }, { status: 200 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
