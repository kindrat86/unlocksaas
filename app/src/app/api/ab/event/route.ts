import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  IDENTITY_AB_KEY,
  readIdentityFromCookies,
  readSubjectFromCookies,
} from "@/lib/ab";

/**
 * Log an A/B exposure or conversion event for the identity_label test.
 *
 * Body: { event?: string | null }
 *   - omitted / null  → exposure row (the visitor saw the variant)
 *   - "opt_in"        → joined the Soap Opera (workbook 04 §5)
 *   - "starter_purchase" → $1 Starter checkout completed (fired from webhook)
 *   - "core_purchase"    → $49 Core subscription started (fired from webhook)
 *
 * Anonymous inserts allowed by the public.ab_tests RLS policy
 * (constrained by length caps in migration 0005). Variant + subject come
 * from sticky cookies set in src/middleware.ts.
 */
export async function POST(req: NextRequest) {
  let event: string | null = null;
  try {
    const body = await req.json();
    if (typeof body?.event === "string" && body.event.length > 0) {
      // schema check ab_tests_event_length: <= 64 chars
      event = body.event.slice(0, 64);
    }
  } catch {
    // empty body is fine — treat as exposure
  }

  const variant = readIdentityFromCookies();
  const subjectId = readSubjectFromCookies();

  const supabase = createClient();
  const { error } = await supabase.from("ab_tests").insert({
    key: IDENTITY_AB_KEY,
    variant,
    subject_id: subjectId,
    conversion_event: event,
  });

  if (error) {
    // Don't blow up the page over an analytics write — log + return 200 so
    // the beacon doesn't retry in a tight loop.
    console.error("ab_tests insert failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  return NextResponse.json({ ok: true });
}
