import { NextRequest, NextResponse } from "next/server";
import {
  subscribeToChallenge,
  coerceIdentityVariant,
} from "@/lib/challenge/subscribe";
import { hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { subscribeViaEngine } from "@/lib/email-engine";
import { verifyDeliverableEmail } from "@/lib/email-verification";
import { guardPublicForm, honeypotTripped } from "@/lib/form-guard";


interface SubscribeBody {
  email?: unknown;
  first_name?: unknown;
  product_url?: unknown;
  source?: unknown;
  identity_variant?: unknown;
  /** Honeypot — humans leave it empty. See @/lib/form-guard. */
  _gotcha?: unknown;
}

/**
 * POST /api/challenge/subscribe
 *
 * Opt-in to the 14-Day First-Customer Sprint. Sends Day 0 inline, then the
 * cron continues with Days 1..14.
 *
 * Body shape:
 *   { email, first_name, product_url?, source?, identity_variant? }
 *
 * Returns 200 on success, 400 on validation, 502 if Day 0 send fails (the
 * row was persisted and the operator can manually trigger a re-send).
 *
 * Degraded mode (2026-07-14): when the Supabase admin config is missing or
 * a placeholder, the subscriber is handed to the shared email-engine
 * (src/lib/email-engine.ts) instead of 500ing, and the response carries the
 * same pending-confirmation success shape as the double-opt-in branch. The
 * engine is also the last-resort rescue when the upsert itself fails.
 */
export async function POST(req: NextRequest) {
  // Rate limit + BotID, same stack as /api/checkout — this endpoint
  // triggers a real outbound Resend send per accepted email.
  const guarded = await guardPublicForm(req, "challenge-subscribe");
  if (guarded) return guarded;

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot tripped: plausible fake success, no send, no DB write.
  if (honeypotTripped(body as Record<string, unknown>)) {
    return NextResponse.json({
      ok: true,
      subscribed: true,
      day_0_send: "deferred_pending_confirmation",
      pending_confirmation: true,
    });
  }

  const input = {
    email: typeof body.email === "string" ? body.email : "",
    first_name: typeof body.first_name === "string" ? body.first_name : "",
    product_url: typeof body.product_url === "string" ? body.product_url : null,
    source:
      typeof body.source === "string" && body.source.length > 0
        ? body.source.slice(0, 64)
        : "challenge_optin",
    identity_variant: coerceIdentityVariant(body.identity_variant),
  };

  // Degraded-mode path: no (real) Supabase config → subscribeToChallenge
  // would throw inside createAdminClient() and the opt-in form would 500.
  // Hand the subscriber to the shared email-engine instead, which owns
  // double-opt-in — the client sees the same pending-confirmation success
  // shape as the primary path. Mirrors src/lib/soap-opera/subscribe.ts;
  // syntax + MX gate runs here because the lib's validation is bypassed.
  if (!hasSupabaseAdminConfig()) {
    const check = await verifyDeliverableEmail(input.email);
    if (!check.ok) {
      if (check.reason === "invalid_syntax") {
        return NextResponse.json({ error: "invalid_email" }, { status: 400 });
      }
      return NextResponse.json(
        { error: "undeliverable_email", detail: check.reason },
        { status: 400 }
      );
    }
    const engine = await subscribeViaEngine(check.normalized, input.source);
    if (engine.ok) {
      console.log("[challenge-subscribe] engine_fallback_ok", {
        email: check.normalized,
        source: input.source,
      });
      return NextResponse.json({
        ok: true,
        subscribed: true,
        day_0_send: "deferred_pending_confirmation",
        pending_confirmation: true,
      });
    }
    console.error("[challenge-subscribe] engine_fallback_failed", {
      email: check.normalized,
      source: input.source,
      error: engine.error,
    });
    return NextResponse.json(
      { error: "db_upsert_failed", detail: engine.error },
      { status: 500 }
    );
  }

  const outcome = await subscribeToChallenge(input);

  if (outcome.ok) {
    return NextResponse.json({
      ok: true,
      subscribed: true,
      day_0_send: outcome.day_0_send,
      pending_confirmation:
        outcome.day_0_send === "deferred_pending_confirmation",
    });
  }

  switch (outcome.reason) {
    case "invalid_email":
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    case "undeliverable_email":
      return NextResponse.json(
        { error: "undeliverable_email", detail: outcome.detail },
        { status: 400 }
      );
    case "invalid_first_name":
      return NextResponse.json(
        { error: "invalid_first_name" },
        { status: 400 }
      );
    case "db_upsert_failed": {
      // Supabase is configured but the upsert failed — last-resort engine
      // rescue so a transient outage never drops a subscriber on the
      // floor (same pattern as src/lib/soap-opera/subscribe.ts). The lib
      // already ran the syntax + MX gate before the upsert, so the
      // trimmed lowercase email is safe to forward.
      const rescue = await subscribeViaEngine(
        input.email.trim().toLowerCase(),
        input.source
      );
      if (rescue.ok) {
        console.log("[challenge-subscribe] engine_rescue_ok", {
          source: input.source,
        });
        return NextResponse.json({
          ok: true,
          subscribed: true,
          day_0_send: "deferred_pending_confirmation",
          pending_confirmation: true,
        });
      }
      return NextResponse.json(
        { error: "db_upsert_failed", detail: outcome.detail },
        { status: 500 }
      );
    }
    case "confirmation_send_failed":
      return NextResponse.json(
        {
          ok: false,
          subscribed: true,
          confirmation_send: "failed",
          error: outcome.detail,
        },
        { status: 502 }
      );
    case "day_0_send_failed":
      return NextResponse.json(
        {
          ok: false,
          subscribed: true,
          day_0_send: "failed",
          error: outcome.detail,
        },
        { status: 502 }
      );
  }
}
