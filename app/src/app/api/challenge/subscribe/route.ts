import { NextRequest, NextResponse } from "next/server";
import {
  subscribeToChallenge,
  coerceIdentityVariant,
} from "@/lib/challenge/subscribe";

export const runtime = "nodejs";

interface SubscribeBody {
  email?: unknown;
  first_name?: unknown;
  product_url?: unknown;
  source?: unknown;
  identity_variant?: unknown;
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
 */
export async function POST(req: NextRequest) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const outcome = await subscribeToChallenge({
    email: typeof body.email === "string" ? body.email : "",
    first_name: typeof body.first_name === "string" ? body.first_name : "",
    product_url: typeof body.product_url === "string" ? body.product_url : null,
    source:
      typeof body.source === "string" && body.source.length > 0
        ? body.source.slice(0, 64)
        : "challenge_optin",
    identity_variant: coerceIdentityVariant(body.identity_variant),
  });

  if (outcome.ok) {
    return NextResponse.json({ ok: true, subscribed: true, day_0_send: "ok" });
  }

  switch (outcome.reason) {
    case "invalid_email":
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    case "invalid_first_name":
      return NextResponse.json(
        { error: "invalid_first_name" },
        { status: 400 }
      );
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
