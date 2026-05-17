import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance, type DueRow } from "@/lib/challenge/dispatch";

export const runtime = "nodejs";
// Challenge cron may fan out to many subscribers. Bump well past the default.
export const maxDuration = 300;
// Force dynamic so the cron always runs against live DB state.
export const dynamic = "force-dynamic";

/**
 * Daily cron: GET /api/cron/challenge
 *
 * Scheduled via vercel.json `crons` at 14:30 UTC (between soap-opera 14:00
 * and seinfeld 15:00, to spread Resend + Supabase pooler load).
 *
 * Selects every active subscriber whose next_send_at is in the past and who
 * has not yet received Day 14 (the final email). Dispatches the next email
 * and advances the counter.
 *
 * Idempotency: a row whose Resend send fails is left with emails_sent
 * unchanged and next_send_at unchanged — the next cron tick retries it.
 *
 * Sequence semantics (see lib/challenge/emails.ts):
 *   emails_sent = 1  → Day 0 welcome already sent at /subscribe; Day 1 next.
 *   emails_sent = 14 → Day 13 already sent; Day 14 (final) next.
 *   After Day 14 send: emails_sent = 15, status='complete', next_send_at=null.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Subscribe owns Day 0 (emails_sent: 0 → 1). Cron handles Days 1..14
  // (emails_sent: 1..14 → 2..15). Sequence length is 15.
  // `as never` matches the dual-schema reconciliation pattern used in
  // lib/challenge/dispatch.ts — the migration shipped (20260518000001)
  // but the generated database.types.ts has not been regenerated yet.
  const { data: dueRaw, error } = await supabase
    .from("challenge_subscribers" as never)
    .select("id, email, first_name, emails_sent")
    .eq("status", "active")
    .gte("emails_sent", 1)
    .lt("emails_sent", 15)
    .not("next_send_at", "is", null)
    .lte("next_send_at", nowIso)
    .limit(500);

  const due = dueRaw as unknown as Array<{
    id: string;
    email: string;
    first_name: string;
    emails_sent: number;
  }> | null;

  if (error) {
    console.error("[challenge-cron] select_failed", error);
    return NextResponse.json(
      { error: "select_failed", detail: error.message },
      { status: 500 }
    );
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  // Sequential send (not Promise.all) so we don't hammer Resend or exhaust
  // the Supabase pooler. 500 sends × ~200ms ≈ 100s, well inside maxDuration.
  let sent = 0;
  let failed = 0;
  for (const raw of due) {
    const row: DueRow = {
      id: raw.id,
      email: raw.email,
      first_name: raw.first_name,
      emails_sent: raw.emails_sent,
    };
    const result = await sendNextAndAdvance(row);
    if (result.ok) {
      sent++;
    } else {
      failed++;
      console.error("[challenge-cron] row_failed", {
        email: row.email,
        index: result.index,
        error: result.error,
      });
    }
  }

  console.log("[challenge-cron] complete", {
    processed: due.length,
    sent,
    failed,
  });

  return NextResponse.json({
    ok: true,
    processed: due.length,
    sent,
    failed,
  });
}
