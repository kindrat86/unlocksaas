import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextFoundingAndAdvance } from "@/lib/founding/dispatch";
import { readIdentityFromCookies } from "@/lib/ab";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
  const email = rawEmail.toLowerCase();

  const source = typeof body.source === "string"
    ? body.source.slice(0, 64)
    : null;

  // A/B identity variant — same cookie scheme as the rest of the site so a
  // waitlister assigned to "paid_builder" stays in the same bucket through
  // their PLE5/PLE6 emails and final purchase.
  const identityVariant = readIdentityFromCookies();

  const supabase = createAdminClient();

  // Idempotent upsert: if the email already exists, reset its sequence so
  // PLE1 fires again. The form copy on /founding promises a confirmation
  // email; that contract has to hold even on second submit.
  const { data: row, error: upsertError } = await supabase
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
        status: "active",
        converted_to_founding_at: null,
        converted_session_id: null,
      },
      { onConflict: "email" }
    )
    .select("id, email, emails_sent")
    .single();

  if (upsertError || !row) {
    console.error("[founding-waitlist] upsert_failed", upsertError?.message);
    return NextResponse.json({ error: "waitlist_write_failed" }, { status: 500 });
  }

  // Send PLE1 inline. If it fails, the row is still in the DB and the cron
  // will retry on its next pass.
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
