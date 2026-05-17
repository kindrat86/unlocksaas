import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  sendNextCartRecoveryAndAdvance,
  type CartRecoveryDueRow,
} from "@/lib/cart-recovery/dispatch";
import type {
  CartPriceType,
  DiagnosticLabel,
} from "@/lib/cart-recovery/emails";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Daily cron: GET /api/cron/cart-recovery
 *
 * Scheduled at 17:00 UTC via vercel.json crons (staggered after soap-opera,
 * seinfeld, founding — per strategy/follow-up-funnels.md Part 9).
 *
 * Selects every cart_abandonment_subscribers row with:
 *   - status='active'
 *   - emails_sent in [1, 2] — Email 1 is sent inline on enrolment; cron owns
 *     Email 2 (Day 2) and Email 3 (Day 7).
 *   - next_send_at <= now
 *
 * Dispatches the next email and advances the counter. Failed sends leave the
 * row unchanged for the next tick. Recovery short-circuit (status='recovered')
 * is enforced inside the dispatcher, not here, so we don't double-check.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Cast: cart_abandonment_subscribers not yet in generated database.types.ts.
  const { data: due, error } = await (
    supabase as unknown as { from: (t: string) => any }
  )
    .from("cart_abandonment_subscribers")
    .select(
      "id, email, price_type, diagnostic_label, emails_sent, created_at",
    )
    .eq("status", "active")
    .gte("emails_sent", 1)
    .lt("emails_sent", 3)
    .not("next_send_at", "is", null)
    .lte("next_send_at", nowIso)
    .limit(500);

  if (error) {
    console.error("[cart-recovery-cron] select_failed", error);
    return NextResponse.json(
      { error: "select_failed", detail: error.message },
      { status: 500 },
    );
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const raw of due as Array<{
    id: string;
    email: string;
    price_type: CartPriceType;
    diagnostic_label: DiagnosticLabel | null;
    emails_sent: number;
    created_at: string;
  }>) {
    const row: CartRecoveryDueRow = {
      id: raw.id,
      email: raw.email,
      price_type: raw.price_type,
      diagnostic_label: raw.diagnostic_label,
      emails_sent: raw.emails_sent,
      created_at: raw.created_at,
    };
    const result = await sendNextCartRecoveryAndAdvance(row);
    if (result.ok && result.skipped) {
      skipped++;
    } else if (result.ok) {
      sent++;
    } else {
      failed++;
      console.error("[cart-recovery-cron] row_failed", {
        email: row.email,
        index: result.index,
        error: result.error,
      });
    }
  }

  console.log("[cart-recovery-cron] complete", {
    processed: due.length,
    sent,
    skipped,
    failed,
  });

  return NextResponse.json({
    ok: true,
    processed: due.length,
    sent,
    skipped,
    failed,
  });
}
