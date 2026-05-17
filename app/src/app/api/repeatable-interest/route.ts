import { NextRequest, NextResponse } from "next/server";
import { captureInterest } from "@/lib/repeatable-interest";

/**
 * POST /api/repeatable-interest
 *
 * Captures a Rung 2 (Repeatable Revenue Layer) interest signal. NOT a
 * waitlist — see strategy/decisions/rung-2-repeatable-revenue.md. The
 * signal becomes the activation-gate read on `repeatable_interest_signal`
 * (workbook 04 §8b Friday Audible Call).
 *
 * Body:  { email, message?, source?, identity_variant? }
 * 200:   { ok: true, id, is_core_customer }
 * 4xx:   { error: <token> }
 *
 * Rules:
 *   - is_core_customer is enriched server-side from profiles.email — the
 *     client cannot claim Core status. This is the load-bearing piece for
 *     the "no supply without demand signal" activation gate.
 *   - No follow-up sequence is triggered by submission. Workbook 02 §5
 *     polarity discipline: this is honest demand capture, not a tripwire
 *     into a Soap Opera sequence.
 *   - Same email re-submitting is idempotent (upsert on lower(email)).
 */
export const runtime = "nodejs";

interface RequestBody {
  email?: unknown;
  message?: unknown;
  source?: unknown;
  identity_variant?: unknown;
}

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

export async function POST(req: NextRequest) {
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const outcome = await captureInterest({
    email: typeof body.email === "string" ? body.email : "",
    message: typeof body.message === "string" ? body.message : null,
    source:
      typeof body.source === "string" && body.source.length > 0
        ? body.source
        : "repeatable_page",
    identity_variant:
      body.identity_variant === "verified_builder" ||
      body.identity_variant === "paid_builder"
        ? body.identity_variant
        : null,
    user_agent: req.headers.get("user-agent")?.slice(0, 512) ?? null,
    ip: clientIp(req),
  });

  if (outcome.ok) {
    return NextResponse.json({
      ok: true,
      id: outcome.id,
      is_core_customer: outcome.is_core_customer,
    });
  }

  switch (outcome.reason) {
    case "invalid_email":
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    case "message_too_long":
      return NextResponse.json({ error: "message_too_long" }, { status: 400 });
    case "db_insert_failed":
      console.error("[repeatable-interest] db_insert_failed:", outcome.detail);
      return NextResponse.json(
        { error: "db_insert_failed" },
        { status: 500 }
      );
  }
}
