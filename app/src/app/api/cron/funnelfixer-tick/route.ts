import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendNextAndAdvance,
  type DueRow,
} from "@/lib/soap-opera/dispatch";
import type { DiagnosticResult } from "@/lib/soap-opera/emails";

export const maxDuration = 60;

/**
 * GET /api/cron/funnelfixer-tick
 *
 * 30-minute throttle cron (vercel.json schedule "* /30 * * * *"). Owns
 * dispatch for the entire FunnelFixer carry-over cohort:
 *
 *   - Picks the single most-overdue funnelfixer subscriber whose
 *     next_send_at <= now and status='active' and emails_sent < 5.
 *   - Calls sendNextAndAdvance, which renders the right email (Email 1
 *     uses the bridge variant for source LIKE 'funnelfixer_%'), sends via
 *     Resend, advances emails_sent, and either schedules next_send_at = now
 *     + 24h or flips status='complete' if it was Email 5.
 *
 * One row per tick = at most one funnelfixer send per 30 minutes across
 * the whole cohort. That is the deliverability throttle the operator set
 * for the unwarmed unlocksaas.com sending domain.
 *
 * The general /api/cron/soap-opera cron has been filtered to exclude
 * funnelfixer_% sources, so the two crons cannot race.
 *
 * After 2026-06-08-ish the queue will drain and this cron returns
 * { processed: 0 } indefinitely. The wasted invocations cost ~$0 on Pro
 * and the cron can be removed at that point.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("soap_opera_subscribers")
    .select("id, email, diagnostic_result, emails_sent, source")
    .eq("status", "active")
    .ilike("source", "funnelfixer_%")
    .lt("emails_sent", 5)
    .not("next_send_at", "is", null)
    .lte("next_send_at", nowIso)
    .order("next_send_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("[funnelfixer-tick] select_failed", error);
    return NextResponse.json(
      { error: "select_failed", detail: error.message },
      { status: 500 }
    );
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const raw = due[0]!;
  const row: DueRow = {
    id: raw.id,
    email: raw.email,
    diagnostic_result: raw.diagnostic_result as DiagnosticResult | null,
    emails_sent: raw.emails_sent,
    source: (raw as { source?: string | null }).source ?? null,
  };

  const result = await sendNextAndAdvance(row);

  if (!result.ok) {
    console.error("[funnelfixer-tick] dispatch_failed", {
      email: row.email,
      index: result.index,
      error: result.error,
    });
    return NextResponse.json({
      ok: false,
      processed: 1,
      email: row.email,
      index: result.index,
      error: result.error,
    });
  }

  console.log("[funnelfixer-tick] sent", {
    email: row.email,
    index: result.index,
  });

  return NextResponse.json({
    ok: true,
    processed: 1,
    email: row.email,
    index: result.index,
  });
}
