import { type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextFoundingAndAdvance } from "@/lib/founding/dispatch";
import { FOUNDING_SEQUENCE_LENGTH } from "@/lib/founding/pre-launch-emails";
import { withCronRunHistory } from "@/lib/cron/run-history";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Founding-Cohort PLF — daily pre-launch sequence dispatcher.
 *
 * GET /api/cron/founding (16:00 UTC).
 *
 * Scheduled via app/vercel.json crons. CRON_SECRET verification +
 * cron_run_history bookkeeping handled by withCronRunHistory.
 *
 * Selects active rows whose emails_sent is between 1 and (length-1) and whose
 * next_send_at <= now. PLE1 (index 0) is sent inline from /api/founding/waitlist
 * so the cron filters emails_sent >= 1.
 *
 * Sequential dispatch (not Promise.all) to avoid Supabase pooler exhaustion.
 * Cap at 500 rows per run for safety.
 */
export async function GET(request: NextRequest) {
  return withCronRunHistory(request, "/api/cron/founding", async () => {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Cast: founding_waitlist not yet in generated database.types.ts.
    const { data: rows, error } = await (
      supabase as unknown as { from: (t: string) => any }
    )
      .from("founding_waitlist")
      .select("id, email, emails_sent")
      .eq("status", "active")
      .gte("emails_sent", 1)
      .lte("emails_sent", FOUNDING_SEQUENCE_LENGTH - 1)
      .not("next_send_at", "is", null)
      .lte("next_send_at", now)
      .limit(500);

    if (error) {
      console.error("[cron-founding] read_failed", error.message);
      throw new Error(`read_failed: ${error.message}`);
    }

    if (!rows || rows.length === 0) {
      return { processed: 0, sent: 0, failed: 0 };
    }

    const results = [];
    for (const row of rows) {
      const r = await sendNextFoundingAndAdvance(row);
      results.push(r);
    }

    return {
      processed: results.length,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
    };
  });
}
