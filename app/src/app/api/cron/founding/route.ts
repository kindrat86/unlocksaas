import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextFoundingAndAdvance } from "@/lib/founding/dispatch";
import { FOUNDING_SEQUENCE_LENGTH } from "@/lib/founding/pre-launch-emails";

export const maxDuration = 300;

/**
 * Founding-Cohort PLF — daily pre-launch sequence dispatcher.
 *
 * GET /api/cron/founding
 *
 * Auth: Authorization: Bearer ${CRON_SECRET}. Vercel injects this header on
 * cron-triggered requests. Same secret used by /api/cron/soap-opera and
 * /api/cron/seinfeld.
 *
 * Selects active rows whose emails_sent is between 1 and (length-1) and whose
 * next_send_at <= now. PLE1 (index 0) is sent inline from /api/founding/waitlist
 * so the cron filters emails_sent >= 1.
 *
 * Sequential dispatch (not Promise.all) to avoid Supabase pooler exhaustion.
 * Cap at 500 rows per run for safety.
 *
 * Schedule: add to app/vercel.json crons, e.g. "0 16 * * *" UTC (1 hr after
 * /api/cron/seinfeld so the three crons don't pile onto the pooler).
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cron_secret_unset" }, { status: 500 });
  }
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Cast: founding_waitlist not yet in generated database.types.ts.
  const { data: rows, error } = await (supabase as unknown as { from: (t: string) => any })
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
    return NextResponse.json(
      { error: `read_failed: ${error.message}` },
      { status: 500 }
    );
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const results = [];
  for (const row of rows) {
    const r = await sendNextFoundingAndAdvance(row);
    results.push(r);
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  });
}
