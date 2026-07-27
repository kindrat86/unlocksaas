import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { sendNextAndAdvance, type DueRow } from "@/lib/seinfeld/dispatch";
import { isSendDay } from "@/lib/seinfeld/schedule";

// The cron fans out one Resend send per due subscriber. With sequential
// dispatch at ~200ms/send, 500 sends ≈ 100s. 300s is the platform default
// and gives plenty of headroom.
export const maxDuration = 300;

/**
 * Daily cron: GET /api/cron/seinfeld
 *
 * Scheduled via app/vercel.json `crons`. Vercel injects an
 *   Authorization: Bearer <CRON_SECRET>
 * header on every cron-triggered request; we verify it before touching state.
 *
 * Two phases per tick:
 *
 *   1. Enroll graduates. Find every soap_opera_subscribers row with
 *      status='complete' that does not yet have a seinfeld_subscribers row,
 *      and insert it. Runs every day even on non-send days — keeps the
 *      Seinfeld table caught up so the next send day has a full list ready.
 *
 *   2. Dispatch. On Mon/Wed/Fri UTC only, select every active subscriber
 *      whose last_sent_at is older than ~22h (or null) and send the next
 *      email per pool rotation. Off-days return { processed: 0, reason }.
 *
 * Spec: strategy/workbooks/08-your-dream-customer.md §6.
 */
export async function GET(req: NextRequest) {
  // Fail closed: unset CRON_SECRET rejects exactly like a mismatch.
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  // LOCAL-FIRST mode: no Supabase backing store configured — skip
  // cleanly instead of throwing inside createAdminClient() on every tick.
  if (!hasSupabaseAdminConfig()) {
    console.log("[cron-seinfeld] skipped: supabase_not_configured");
    return NextResponse.json({ ok: true, skipped: "supabase_not_configured" });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // ── Phase 1: enroll Soap Opera graduates ─────────────────────────────────
  // Two-step (fetch IDs, then insert filtered set) because the Supabase JS
  // client doesn't support correlated INSERT…SELECT in a single call.
  //
  // FunnelFixer carry-over gate (migration 0030):
  //   We pull `source` + `testimonial_offer_sent_at` so we can skip
  //   funnelfixer-cohort graduates that have NOT yet received the one-shot
  //   testimonial-farm reactivation offer (sent by
  //   /api/cron/testimonial-farm-offer). Once that cron stamps the row, the
  //   recipient is eligible for Seinfeld enrollment on the next tick. This
  //   prevents the same-day double-send window where a Wednesday Seinfeld
  //   broadcast would land in the same inbox as the testimonial-farm offer.
  let enrolled = 0;
  const { data: graduates, error: gradError } = await supabase
    .from("soap_opera_subscribers")
    .select("id, email, source, testimonial_offer_sent_at")
    .eq("status", "complete")
    .limit(1000);

  if (gradError) {
    console.error("[seinfeld-cron] graduates_select_failed", gradError);
  } else if (graduates && graduates.length > 0) {
    // Honest gate: a funnelfixer-source graduate is held back from Seinfeld
    // until the testimonial-farm offer has fired (or until the operator
    // bypasses by manually stamping testimonial_offer_sent_at). Non-funnelfixer
    // graduates flow straight through.
    const eligible = graduates.filter((g:any) => {
      const isFunnelfixer =
        typeof g.source === "string" &&
        g.source.startsWith("funnelfixer_");
      if (!isFunnelfixer) return true;
      return g.testimonial_offer_sent_at != null;
    });
    const emails = eligible.map((g:any) => g.email);
    const { data: existing } = emails.length === 0
      ? { data: [] as { email: string }[] }
      : await supabase
          .from("seinfeld_subscribers")
          .select("email")
          .in("email", emails);
    const existingEmails = new Set((existing ?? []).map((r:any) => r.email));
    const newRows = eligible
      .filter((g:any) => !existingEmails.has(g.email))
      .map((g:any) => ({
        email: g.email,
        source: "soap_opera_graduate" as const,
        source_subscriber_id: g.id,
        status: "active" as const,
      }));
    if (newRows.length > 0) {
      const { error: insertError, count } = await supabase
        .from("seinfeld_subscribers")
        .insert(newRows, { count: "exact" });
      if (insertError) {
        console.error("[seinfeld-cron] graduates_insert_failed", insertError);
      } else {
        enrolled = count ?? newRows.length;
      }
    }
  }

  // ── Phase 2: dispatch on send days only ──────────────────────────────────
  if (!isSendDay(now)) {
    return NextResponse.json({
      ok: true,
      enrolled,
      processed: 0,
      reason: "not_send_day",
      utc_weekday: now.getUTCDay(),
    });
  }

  // 22h instead of 24h tolerates small cron jitter without re-firing the same
  // email twice on the same calendar day.
  const cutoffIso = new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString();

  const { data: due, error: dueError } = await supabase
    .from("seinfeld_subscribers")
    .select("id, email, current_index, sends_count")
    .eq("status", "active")
    .or(`last_sent_at.is.null,last_sent_at.lt.${cutoffIso}`)
    .limit(500);

  if (dueError) {
    console.error("[seinfeld-cron] select_failed", dueError);
    return NextResponse.json(
      { error: "select_failed", detail: dueError.message },
      { status: 500 },
    );
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, enrolled, processed: 0, sent: 0, failed: 0 });
  }

  let sent = 0;
  let failed = 0;
  for (const row of due as DueRow[]) {
    const result = await sendNextAndAdvance(row, now);
    if (result.ok) {
      sent++;
    } else {
      failed++;
      console.error("[seinfeld-cron] send_failed", {
        email: row.email,
        contentId: result.contentId,
        error: result.error,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    enrolled,
    processed: due.length,
    sent,
    failed,
  });
}
