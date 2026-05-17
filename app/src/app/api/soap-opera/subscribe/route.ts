import { NextRequest, NextResponse } from "next/server";
import {
  subscribeToSoapOpera,
  coerceBucket,
  coerceDiagnosis,
  coerceIdentityVariant,
} from "@/lib/soap-opera/subscribe";

export const runtime = "nodejs";

interface SubscribeBody {
  email?: unknown;
  /** Free-form attribution, e.g. 'free_diagnostic', 'funnel_hub', 'starter_cold'. */
  source?: unknown;
  /** Required when source='free_diagnostic'; null otherwise. */
  diagnostic_result?: unknown;
  /** Optional A/B test bucket from the opt-in form. */
  identity_variant?: unknown;
  /**
   * Optional Brunson Survey Funnel bucket (DCS Secret 15). Currently only
   * /api/diagnostic threads this; other surfaces (funnel hub, parables) send
   * null and the Day-0 opener falls through to neutral.
   */
  bucket?: unknown;
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
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const outcome = await subscribeToSoapOpera({
    email: typeof body.email === "string" ? body.email : "",
    source:
      typeof body.source === "string" && body.source.length > 0
        ? body.source
        : "funnel_hub",
    diagnostic_result: coerceDiagnosis(body.diagnostic_result),
    identity_variant: coerceIdentityVariant(body.identity_variant),
    bucket: coerceBucket(body.bucket),
  });

  if (outcome.ok) {
    return NextResponse.json({ ok: true, subscribed: true, day_0_send: "ok" });
  }

  switch (outcome.reason) {
    case "invalid_email":
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    case "db_upsert_failed":
      return NextResponse.json(
        { error: "db_upsert_failed", detail: outcome.detail },
        { status: 500 }
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
