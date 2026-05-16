import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance } from "@/lib/soap-opera/dispatch";
import type { DiagnosticResult } from "@/lib/soap-opera/emails";

export const runtime = "nodejs";

const ALLOWED_DIAGNOSES: DiagnosticResult[] = [
  "wrong_person",
  "weak_offer",
  "weak_belief",
];

const ALLOWED_IDENTITY_VARIANTS = ["verified_builder", "paid_builder"] as const;
type IdentityVariant = (typeof ALLOWED_IDENTITY_VARIANTS)[number];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email?: unknown;
  /** Free-form attribution, e.g. 'free_diagnostic', 'funnel_hub', 'starter_cold'. */
  source?: unknown;
  /** Required when source='free_diagnostic'; null otherwise. */
  diagnostic_result?: unknown;
  /** Optional A/B test bucket from the opt-in form. */
  identity_variant?: unknown;
}

/**
 * POST /api/soap-opera/subscribe
 *
 * Adds (or refreshes) a subscriber and immediately sends Email 1 (Day 0).
 *
 * Idempotency: upserts on email. A repeat submit by the same address resets
 * the sequence to day 0 — intentional, since most repeats are users re-taking
 * the Free Diagnostic with a new URL.
 *
 * Schema reference: supabase/migrations/20260516224206_0003_soap_opera_and_ab_tests.sql
 */
export async function POST(req: NextRequest) {
  let body: SubscribeBody;
  try {
    body = (await req.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const emailRaw =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!emailRaw || !EMAIL_RE.test(emailRaw)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const source =
    typeof body.source === "string" && body.source.length > 0
      ? body.source
      : "funnel_hub";

  const diagnostic_result: DiagnosticResult | null =
    typeof body.diagnostic_result === "string" &&
    (ALLOWED_DIAGNOSES as string[]).includes(body.diagnostic_result)
      ? (body.diagnostic_result as DiagnosticResult)
      : null;

  const identity_variant: IdentityVariant | null =
    typeof body.identity_variant === "string" &&
    (ALLOWED_IDENTITY_VARIANTS as readonly string[]).includes(body.identity_variant)
      ? (body.identity_variant as IdentityVariant)
      : null;

  const supabase = createAdminClient();

  // Upsert resets the sequence counters on duplicate email.
  const nowIso = new Date().toISOString();
  const { data: row, error: upsertError } = await supabase
    .from("soap_opera_subscribers")
    .upsert(
      {
        email: emailRaw,
        source,
        diagnostic_result,
        identity_variant,
        status: "active",
        current_day: 0,
        subscribed_at: nowIso,
        last_sent_at: null,
        next_send_at: null,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    )
    .select("id, email, diagnostic_result, current_day")
    .single();

  if (upsertError || !row) {
    console.error("[soap-opera-subscribe] upsert_failed", {
      email: emailRaw,
      source,
      error: upsertError?.message,
    });
    return NextResponse.json(
      { error: "db_upsert_failed", detail: upsertError?.message },
      { status: 500 }
    );
  }

  // Send Email 1 immediately. Subscribe owns Day 0; the cron only picks up
  // rows whose current_day > 0 (i.e., Day 0 has already been sent and we are
  // now waiting for Days 1-4). If Day 0 fails, current_day stays at 0 and
  // the operator should re-POST /subscribe with the same email to retry.
  const result = await sendNextAndAdvance({
    id: row.id,
    email: row.email,
    diagnostic_result: row.diagnostic_result as DiagnosticResult | null,
    current_day: row.current_day,
  });

  if (!result.ok) {
    console.error("[soap-opera-subscribe] day_0_send_failed", {
      email: emailRaw,
      source,
      error: result.error,
    });
    return NextResponse.json(
      { ok: false, subscribed: true, day_0_send: "failed", error: result.error },
      { status: 502 }
    );
  }

  console.log("[soap-opera-subscribe] ok", {
    email: emailRaw,
    source,
    diagnostic_result,
    identity_variant,
  });
  return NextResponse.json({ ok: true, subscribed: true, day_0_send: "ok" });
}
