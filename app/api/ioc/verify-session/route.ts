import Stripe from "stripe";
import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { killSwitchResponse } from "@/lib/api-kill-switch";
import { log } from "@/lib/log";
import { isIocArchetypeKey } from "@/lib/ioc/archetype-from-birthdate";
import { getIocTextForArchetype } from "@/lib/ioc/ioc-map";
import { normalizeIocBlockForClipboard } from "@/lib/ioc/ioc-split";
import { stripeTestModeRequired } from "@/lib/runtime-mode";

function mergeIocMeta(session: Stripe.Checkout.Session): { ioc_unlock?: string; archetype?: string } {
  const fromSession = session.metadata ?? {};
  let fromPi: Record<string, string> = {};
  const pi = session.payment_intent;
  if (pi && typeof pi === "object" && !("deleted" in pi)) {
    fromPi = (pi as Stripe.PaymentIntent).metadata ?? {};
  }
  return {
    ioc_unlock: fromSession.ioc_unlock ?? fromPi.ioc_unlock,
    archetype: fromSession.archetype ?? fromPi.archetype,
  };
}

export async function GET(request: Request) {
  const kill = killSwitchResponse();
  if (kill) return kill;

  const requestId = crypto.randomUUID();
  log("info", "request", { requestId, route: "/api/ioc/verify-session" });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("ioc_checkout_session")?.trim();
  if (!sessionId) {
    return errorResponse(400, "MISSING_SESSION_ID", requestId);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return errorResponse(500, "STRIPE_NOT_CONFIGURED", requestId);
  }

  if (stripeTestModeRequired && secretKey.startsWith("sk_live_")) {
    log("error", "stripe_live_key_in_non_prod", { requestId });
    return errorResponse(500, "STRIPE_LIVE_KEY_NOT_ALLOWED_IN_DEV", requestId);
  }

  const stripe = new Stripe(secretKey);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const paid =
      session.status === "complete" ||
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";

    if (!paid) {
      return NextResponse.json({ ok: false, paid: false }, { status: 200 });
    }

    const meta = mergeIocMeta(session);
    if (meta.ioc_unlock !== "1") {
      return NextResponse.json({ ok: false, paid: false }, { status: 200 });
    }

    const arch = typeof meta.archetype === "string" ? meta.archetype.trim() : "";
    if (!arch || !isIocArchetypeKey(arch)) {
      log("warn", "ioc_verify_bad_archetype", { requestId, sessionId });
      return NextResponse.json(
        { ok: false, paid: false, error: "INVALID_SESSION_METADATA" },
        { status: 200 }
      );
    }

    const iocFull = normalizeIocBlockForClipboard(getIocTextForArchetype(arch));
    log("info", "ioc_verify_ok", { requestId, sessionId });
    return NextResponse.json({ ok: true, paid: true, archetype: arch, iocFull }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    log("error", "ioc_verify_failed", { requestId, sessionId, message });
    return NextResponse.json({ ok: false, error: "VERIFY_FAILED" }, { status: 200 });
  }
}
