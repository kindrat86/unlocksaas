import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNextAndAdvance, type DueRow } from "@/lib/soap-opera/dispatch";
import type { DiagnosticResult } from "@/lib/soap-opera/emails";

// Soap Opera cron may need to fan out to many subscribers. Bump well past the
// default to be safe — most days this returns in seconds.
export const maxDuration = 300;
// Force dynamic so the cron always runs against live DB state instead of
// being statically rendered at build time.

/**
 * Daily cron: GET /api/cron/soap-opera
 *
 * Scheduled via vercel.json `crons`. Vercel injects an
 *   Authorization: Bearer <CRON_SECRET>
 * header on every cron-triggered request; we verify it before touching state.
 *
 * Selects every active subscriber whose next_send_at is in the past and who
 * has not yet received the 5th email. Dispatches the next email and advances
 * the counter. The next_send_at column is the cron's index (see migration
 * 0003: soap_opera_due_idx).
 *
 * Idempotency: a row whose Resend send fails is left with emails_sent
 * unchanged and next_send_at unchanged — the next cron tick retries it.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // FunnelFixer carry-over subscribers are dispatched by /api/cron/funnelfixer-tick
  // every 30 minutes (one row per tick, throttled for deliverability on the
  // unwarmed sending domain). Excluding them here prevents this daily fan-out
  // cron from racing the tick cron and producing double sends.
  const { data: due, error } = await supabase
    .from("soap_opera_subscribers")
    .select("id, email, diagnostic_result, emails_sent, source")
    .eq("status", "active")
    // Subscribe owns Day 0; cron handles Days 1-4.
    .gte("emails_sent", 1)
    .lt("emails_sent", 5)
    .not("next_send_at", "is", null)
    .lte("next_send_at", nowIso)
    .not("source", "ilike", "funnelfixer_%")
    // Cap per-run fan-out. If we ever blow past this the next cron tick picks
    // up the rest — no data is lost.
    .limit(500);

  if (error) {
    console.error("[soap-opera-cron] select_failed", error);
    return NextResponse.json(
      { error: "select_failed", detail: error.message },
      { status: 500 }
    );
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
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
      emails_sent: raw.emails_sent,
      source: (raw as { source?: string | null }).source ?? null,
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

  return NextResponse.json({
    ok: true,
    processed: due.length,
    sent,
    failed,
  });
}
