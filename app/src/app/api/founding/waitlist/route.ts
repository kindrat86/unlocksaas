import { NextResponse, type NextRequest } from "next/server";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/lib/supabase/server";
import { subscribeViaEngine } from "@/lib/email-engine";
import { sendNextFoundingAndAdvance } from "@/lib/founding/dispatch";
import { readIdentityFromCookies } from "@/lib/ab";
import {
  verifyDeliverableEmail,
  isPreVerifiedSource,
} from "@/lib/email-verification";
import {
  newConfirmationToken,
  sendConfirmationEmail,
} from "@/lib/double-opt-in";

export const maxDuration = 60;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface PostBody {
  email?: unknown;
  source?: unknown;
}

/**
 * Founding-Cohort PLF — waitlist signup endpoint.
 *
 * POST /api/founding/waitlist
 *   body: { email: string, source?: string }
 *   returns: { ok: true, sent_ple1: boolean } | { error: string }
 *
 * Behaviour:
 *   1. Validate email shape (RLS will reject malformed values too).
 *   2. Upsert into founding_waitlist keyed on lower(email). Repeat signups
 *      from the same email are idempotent: row is reset to emails_sent=0 so
 *      PLE1 fires again. Brunson rule: respect the second touch.
 *   3. Send PLE1 inline (Day 0 of waitlist journey).
 *   4. Advance counter and schedule PLE2 per dispatch cadence.
 *
 * Returns 200 even when PLE1 sending fails so the form completes — the row
 * is in the DB and the cron will retry. last_error is stamped for visibility.
 *
 * Degraded mode (2026-07-14): when the Supabase admin config is missing or
 * a placeholder (production shipped one once), the subscriber is handed to
 * the shared email-engine (src/lib/email-engine.ts) instead of 500ing, and
 * the response carries the same pending-confirmation success shape as the
 * double-opt-in branch. The engine is also the last-resort rescue when the
 * upsert itself fails.
 */
export async function POST(request: NextRequest) {
  let body: PostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
  if (!rawEmail || rawEmail.length > 255 || !EMAIL_RE.test(rawEmail)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  let email = rawEmail.toLowerCase();

  const source = typeof body.source === "string"
    ? body.source.slice(0, 64)
    : null;

  const preVerified = isPreVerifiedSource(source);

  // MX gate. Skipped for Google-OAuth sources – those are already proven good.
  if (!preVerified) {
    const deliverability = await verifyDeliverableEmail(email);
    if (!deliverability.ok) {
      return NextResponse.json(
        { error: "undeliverable_email", detail: deliverability.reason },
        { status: 400 }
      );
    }
    email = deliverability.normalized;
  }

  // Degraded-mode path: no (real) Supabase config → hand the subscriber to
  // the shared email-engine instead of 500ing on createAdminClient(). The
  // engine owns double-opt-in, so the client-facing semantics are the same
  // as the pending-confirmation branch below. Mirrors the fallback in
  // src/lib/soap-opera/subscribe.ts.
  if (!hasSupabaseAdminConfig()) {
    const engine = await subscribeViaEngine(email, source ?? "founding_waitlist");
    if (engine.ok) {
      console.log("[founding-waitlist] engine_fallback_ok", { email, source });
      return NextResponse.json({
        ok: true,
        subscribed: true,
        pending_confirmation: true,
      });
    }
    console.error("[founding-waitlist] engine_fallback_failed", {
      email,
      source,
      error: engine.error,
    });
    return NextResponse.json({ error: "waitlist_write_failed" }, { status: 500 });
  }

  // A/B identity variant — same cookie scheme as the rest of the site so a
  // waitlister assigned to "paid_builder" stays in the same bucket through
  // their PLE5/PLE6 emails and final purchase.
  const identityVariant = await readIdentityFromCookies();

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const initialStatus = preVerified ? "active" : "pending_confirmation";
  const confirmationToken = preVerified ? null : newConfirmationToken();

  // Idempotent upsert: if the email already exists, reset its sequence so
  // PLE1 fires again. For email signups we now route through a confirmation
  // step before PLE1 – the form copy on /founding promises a confirmation
  // email; double opt-in delivers on that explicitly.
  // Cast: founding_waitlist not yet in generated database.types.ts (migration
  // 20260518000002 lands the table; types regenerate on the next gen pass).
  const { data: row, error: upsertError } = await (supabase as unknown as { from: (t: string) => any })
    .from("founding_waitlist")
    .upsert(
      {
        email,
        source,
        identity_variant: identityVariant,
        emails_sent: 0,
        last_sent_at: null,
        next_send_at: null,
        last_error: null,
        status: initialStatus,
        converted_to_founding_at: null,
        converted_session_id: null,
        confirmation_token: confirmationToken,
        confirmation_sent_at: preVerified ? null : nowIso,
      },
      { onConflict: "email" }
    )
    .select("id, email, emails_sent")
    .single();

  if (upsertError || !row) {
    console.error("[founding-waitlist] upsert_failed", upsertError?.message);
    // Supabase is configured but unreachable/broken — last-resort engine
    // rescue so a transient outage never drops a waitlister on the floor.
    const engine = await subscribeViaEngine(email, source ?? "founding_waitlist");
    if (engine.ok) {
      console.log("[founding-waitlist] engine_rescue_ok", { email, source });
      return NextResponse.json({
        ok: true,
        subscribed: true,
        pending_confirmation: true,
      });
    }
    return NextResponse.json({ error: "waitlist_write_failed" }, { status: 500 });
  }

  // Double opt-in branch: send confirmation email, defer PLE1 until click.
  if (!preVerified && confirmationToken) {
    const sendResult = await sendConfirmationEmail({
      list: "founding",
      email: row.email,
      token: confirmationToken,
    });
    if (!sendResult.ok) {
      console.error("[founding-waitlist] confirmation_send_failed", {
        email,
        error: sendResult.error,
      });
      return NextResponse.json(
        {
          ok: false,
          subscribed: true,
          confirmation_send: "failed",
          error: sendResult.error,
        },
        { status: 502 }
      );
    }
    console.log("[founding-waitlist] pending_confirmation", { email });
    return NextResponse.json({
      ok: true,
      subscribed: true,
      pending_confirmation: true,
    });
  }

  // Pre-verified path (Google OAuth): send PLE1 inline. If it fails, the row
  // is still in the DB and the cron will retry on its next pass.
  const send = await sendNextFoundingAndAdvance({
    id: row.id,
    email: row.email,
    emails_sent: row.emails_sent,
  });

  return NextResponse.json({
    ok: true,
    sent_ple1: send.ok,
  });
}
