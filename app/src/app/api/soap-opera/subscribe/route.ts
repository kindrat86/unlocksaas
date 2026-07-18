import { NextRequest, NextResponse } from "next/server";
import {
  subscribeToSoapOpera,
  coerceDiagnosis,
  coerceIdentityVariant,
} from "@/lib/soap-opera/subscribe";
import { guardPublicForm, honeypotTripped } from "@/lib/form-guard";


interface SubscribeBody {
  email?: unknown;
  /** Free-form attribution, e.g. 'free_diagnostic', 'funnel_hub', 'starter_cold'. */
  source?: unknown;
  /** Required when source='free_diagnostic'; null otherwise. */
  diagnostic_result?: unknown;
  /** Optional A/B test bucket from the opt-in form. */
  identity_variant?: unknown;
  /** Honeypot — humans leave it empty. See @/lib/form-guard. */
  _gotcha?: unknown;
}

/**
 * POST /api/soap-opera/subscribe
 *
 * Thin wrapper over subscribeToSoapOpera() in @/lib/soap-opera/subscribe.
 * Used by:
 *   - the funnel-hub opt-in form (no diagnostic involved)
 *   - manual operator subscribes
 *   - any future surface that needs to add to the sequence without running
 *     the full diagnostic flow.
 *
 * The Free Diagnostic form does NOT call this directly — it submits to
 * /api/diagnostic which calls subscribeToSoapOpera() internally so the
 * diagnostic label is captured atomically with the subscription.
 */
export async function POST(req: NextRequest) {
  // Rate limit + BotID, same stack as /api/checkout — this endpoint
  // triggers a real outbound Resend send per accepted email.
  const guarded = await guardPublicForm(req, "soap-subscribe");
  if (guarded) return guarded;

  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot tripped: plausible fake success, no send, no DB write.
  if (honeypotTripped(body as Record<string, unknown>)) {
    return NextResponse.json({ ok: true, subscribed: true });
  }

  const outcome = await subscribeToSoapOpera({
    email: typeof body.email === "string" ? body.email : "",
    source:
      typeof body.source === "string" && body.source.length > 0
        ? body.source.slice(0, 64)
        : "funnel_hub",
    diagnostic_result: coerceDiagnosis(body.diagnostic_result),
    identity_variant: coerceIdentityVariant(body.identity_variant),
  });

  if (outcome.ok) {
    return NextResponse.json({
      ok: true,
      subscribed: true,
      day_0_send: outcome.day_0_send,
      // Pending-confirmation surfaces to the client as a success – UI should
      // show "check your inbox to confirm" rather than the usual confirmation.
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
    case "db_upsert_failed":
      return NextResponse.json(
        { error: "db_upsert_failed", detail: outcome.detail },
        { status: 500 }
      );
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
