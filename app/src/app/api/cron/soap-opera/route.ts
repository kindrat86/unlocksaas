import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance, type DueRow } from "@/lib/soap-opera/dispatch";
import type { DiagnosticResult } from "@/lib/soap-opera/emails";
import { coerceBucket } from "@/lib/soap-opera/subscribe";
import { withCronRunHistory } from "@/lib/cron/run-history";

export const runtime = "nodejs";
// Soap Opera cron may need to fan out to many subscribers. Bump well past the
// default to be safe — most days this returns in seconds.
export const maxDuration = 300;
// Force dynamic so the cron always runs against live DB state instead of
// being statically rendered at build time.
export const dynamic = "force-dynamic";

/**
 * Daily cron: GET /api/cron/soap-opera (14:00 UTC).
 *
 * Scheduled via app/vercel.json `crons`. Vercel injects an
 *   Authorization: Bearer <CRON_SECRET>
 * header on every cron-triggered request. CRON_SECRET verification +
 * cron_run_history bookkeeping are handled by withCronRunHistory; this
 * route's job is the dispatch logic only.
 *
 * Selects every active subscriber whose next_send_at is in the past and who
 * has not yet received the 5th email. Dispatches the next email and advances
 * the counter. The next_send_at column is the cron's index (see migration
 * 0003: soap_opera_due_idx).
 *
 * Idempotency: a row whose Resend send fails is left with emails_sent
 * unchanged and next_send_at unchanged — the next cron tick retries it.
 *
 * Observability: every run writes a row to public.cron_run_history with
 * processed/sent/failed/duration_ms. Read via the Friday Audible Call SQL
 * in supabase/views/funnel_audibles.sql.
 */
export async function GET(req: NextRequest) {
  return withCronRunHistory(req, "/api/cron/soap-opera", async () => {
    const supabase = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data: due, error } = await supabase
      .from("soap_opera_subscribers")
      .select("id, email, diagnostic_result, bucket, emails_sent")
      .eq("status", "active")
      // Subscribe owns Day 0; cron handles Days 1-4.
      .gte("emails_sent", 1)
      .lt("emails_sent", 5)
      .not("next_send_at", "is", null)
      .lte("next_send_at", nowIso)
      // Cap per-run fan-out. If we ever blow past this the next cron tick picks
      // up the rest — no data is lost.
      .limit(500);

    if (error) {
      console.error("[soap-opera-cron] select_failed", error);
      throw new Error(`select_failed: ${error.message}`);
    }

    if (!due || due.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    // Sequential send (not Promise.all) so we don't hammer the Resend API or
    // exhaust Supabase pooler connections. 500 sends * ~200ms ≈ 100s, well
    // inside maxDuration.
    let sent = 0;
    let failed = 0;
    for (const raw of due) {
      const row: DueRow = {
        id: raw.id,
        email: raw.email,
        diagnostic_result: raw.diagnostic_result as DiagnosticResult | null,
        // Re-validate the DB string against the OpenerBucket type. The check
        // constraint in migration 20260518000005 already restricts this
        // column; coerceBucket is belt-and-braces and falls back to null
        // cleanly if the schema is ever loosened.
        bucket: coerceBucket(raw.bucket),
        emails_sent: raw.emails_sent,
      };
      const result = await sendNextAndAdvance(row);
      if (result.ok) {
        sent++;
      } else {
        failed++;
        // Per-row error already logged in dispatch.ts; this is the aggregate trace.
        console.error("[soap-opera-cron] row_failed", {
          email: row.email,
          index: result.index,
          error: result.error,
        });
      }
    }

    console.log("[soap-opera-cron] complete", {
      processed: due.length,
      sent,
      failed,
    });

    return { processed: due.length, sent, failed };
  });
}
