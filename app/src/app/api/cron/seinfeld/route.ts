import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance, type DueRow } from "@/lib/seinfeld/dispatch";
import { isSendDay } from "@/lib/seinfeld/schedule";
import { withCronRunHistory } from "@/lib/cron/run-history";

export const runtime = "nodejs";
// The cron fans out one Resend send per due subscriber. With sequential
// dispatch at ~200ms/send, 500 sends ≈ 100s. 300s is the platform default
// and gives plenty of headroom.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Daily cron: GET /api/cron/seinfeld (15:00 UTC).
 *
 * Scheduled via app/vercel.json `crons`. CRON_SECRET verification +
 * cron_run_history bookkeeping are handled by withCronRunHistory.
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
 *      email per pool rotation. Off-days return processed=0 with
 *      reason="not_send_day" in extra.
 *
 * Spec: strategy/workbooks/08-your-dream-customer.md §6.
 */
export async function GET(req: NextRequest) {
  return withCronRunHistory(req, "/api/cron/seinfeld", async () => {
    const supabase = createAdminClient();
    const now = new Date();

    // ── Phase 1: enroll Soap Opera graduates ───────────────────────────────
    // Two-step (fetch IDs, then insert filtered set) because the Supabase JS
    // client doesn't support correlated INSERT…SELECT in a single call.
    let enrolled = 0;
    const { data: graduates, error: gradError } = await supabase
      .from("soap_opera_subscribers")
      .select("id, email")
      .eq("status", "complete")
      .limit(1000);

    if (gradError) {
      console.error("[seinfeld-cron] graduates_select_failed", gradError);
    } else if (graduates && graduates.length > 0) {
      const emails = graduates.map((g) => g.email);
      const { data: existing } = await supabase
        .from("seinfeld_subscribers")
        .select("email")
        .in("email", emails);
      const existingEmails = new Set((existing ?? []).map((r) => r.email));
      const newRows = graduates
        .filter((g) => !existingEmails.has(g.email))
        .map((g) => ({
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

    // ── Phase 2: dispatch on send days only ────────────────────────────────
    if (!isSendDay(now)) {
      return {
        processed: 0,
        sent: 0,
        failed: 0,
        extra: {
          enrolled,
          reason: "not_send_day",
          utc_weekday: now.getUTCDay(),
        },
      };
    }

    // 22h instead of 24h tolerates small cron jitter without re-firing the same
    // email twice on the same calendar day.
    const cutoffIso = new Date(
      now.getTime() - 22 * 60 * 60 * 1000,
    ).toISOString();

    const { data: due, error: dueError } = await supabase
      .from("seinfeld_subscribers")
      .select("id, email, current_index, sends_count")
      .eq("status", "active")
      .or(`last_sent_at.is.null,last_sent_at.lt.${cutoffIso}`)
      .limit(500);

    if (dueError) {
      console.error("[seinfeld-cron] select_failed", dueError);
      throw new Error(`select_failed: ${dueError.message}`);
    }

    if (!due || due.length === 0) {
      return { processed: 0, sent: 0, failed: 0, extra: { enrolled } };
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

    return {
      processed: due.length,
      sent,
      failed,
      extra: { enrolled },
    };
  });
}
