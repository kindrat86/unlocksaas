import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cron-auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

export const maxDuration = 60;

/**
 * GET /api/cron/activate-funnelfixer-carryover
 *
 * Daily warm-up cron (vercel.json schedule "0 6 * * *" → 06:00 UTC = 09:00
 * Athens). Activates up to 5 paused FunnelFixer carry-over subscribers per
 * run, ordered by deliverability quality:
 *
 *   1. Google-OAuth signups first (most recent → oldest): the address was
 *      validated by Google during the original FunnelFixer signup, so
 *      bounce risk is lowest.
 *   2. Email signups next (most recent → oldest): less verification, but
 *      newer signups are more likely to be live inboxes.
 *
 * Stagger logic: the new batch is staggered at 30-minute intervals starting
 * from NOW (first sub: next_send_at = now; second: now + 30 min; ...). The
 * 30-min spacing within the batch gives the tick cron a deterministic order
 * to drain them. We do NOT anchor to other in-flight subs' future
 * next_send_at — that was a bug that pushed today's Email 1 sends ~11h
 * after activation when a previously-active sub had a far-future scheduled
 * email. The actual 30-min-between-sends throttle across the whole cohort
 * is already enforced by /api/cron/funnelfixer-tick (which sends one due
 * row per tick, and the tick runs every 30 min).
 *
 * Idempotent: when no paused funnelfixer rows remain, returns
 * { ok: true, activated: 0, reason: "queue_empty" } and exits.
 */
export async function GET(req: NextRequest) {
  // Fail closed: unset CRON_SECRET rejects exactly like a mismatch.
  const unauthorized = requireCronSecret(req);
  if (unauthorized) return unauthorized;

  // LOCAL-FIRST mode: no Supabase backing store configured — skip
  // cleanly instead of throwing inside createAdminClient() on every tick.
  if (!hasSupabaseAdminConfig()) {
    console.log("[cron-activate-funnelfixer-carryover] skipped: supabase_not_configured");
    return NextResponse.json({ ok: true, skipped: "supabase_not_configured" });
  }

  const supabase = createAdminClient();

  // ── 1. Pick the next 5 in tier order ─────────────────────────────────────
  // Two-step query because PostgREST can't express "google_oauth first, then
  // email, both newest-first" in a single ORDER BY. We pull a generous slice
  // then sort in JS.
  const { data: paused, error: pausedErr } = await supabase
    .from("soap_opera_subscribers")
    .select("id, email, source, subscribed_at")
    .eq("status", "paused")
    .ilike("source", "funnelfixer_%")
    .limit(50);

  if (pausedErr) {
    console.error("[activate-funnelfixer] select_paused_failed", pausedErr);
    return NextResponse.json(
      { error: "select_paused_failed", detail: pausedErr.message },
      { status: 500 }
    );
  }

  if (!paused || paused.length === 0) {
    return NextResponse.json({
      ok: true,
      activated: 0,
      reason: "queue_empty",
    });
  }

  type PausedRow = {
    id: string;
    email: string;
    source: string;
    subscribed_at: string | null;
  };

  // Tier sort: google_oauth (source='funnelfixer_google') first, then the
  // rest. Within each tier, newer subscribed_at first.
  const sorted = (paused as PausedRow[]).slice().sort((a, b) => {
    const aGoogle = a.source === "funnelfixer_google" ? 0 : 1;
    const bGoogle = b.source === "funnelfixer_google" ? 0 : 1;
    if (aGoogle !== bGoogle) return aGoogle - bGoogle;
    const at = a.subscribed_at ? Date.parse(a.subscribed_at) : 0;
    const bt = b.subscribed_at ? Date.parse(b.subscribed_at) : 0;
    return bt - at; // newer first
  });

  const batch = sorted.slice(0, 5);
  if (batch.length === 0) {
    return NextResponse.json({
      ok: true,
      activated: 0,
      reason: "queue_empty",
    });
  }

  // ── 2. Stagger the new batch from NOW at 30-min intervals ────────────────
  // First slot fires immediately (the next funnelfixer-tick run picks it up
  // within ≤30 min). The 30-min spacing within the batch is only there so
  // the tick cron has a deterministic order to drain them; the actual
  // ≥30-min-between-sends throttle is enforced by tick cron running every
  // 30 min and dispatching one due row per run.
  const THIRTY_MIN_MS = 30 * 60 * 1000;
  const now = Date.now();
  let nextSlot = now;

  // ── 3. Flip status=active with staggered next_send_at ────────────────────
  const activated: Array<{ email: string; next_send_at: string }> = [];
  for (const sub of batch) {
    const nextSendAtIso = new Date(nextSlot).toISOString();
    const { error: upErr } = await supabase
      .from("soap_opera_subscribers")
      .update({
        status: "active",
        emails_sent: 0,
        next_send_at: nextSendAtIso,
        last_sent_at: null,
      })
      .eq("id", sub.id)
      .eq("status", "paused"); // optimistic guard

    if (upErr) {
      console.error("[activate-funnelfixer] activate_failed", {
        email: sub.email,
        error: upErr.message,
      });
      continue;
    }
    activated.push({ email: sub.email, next_send_at: nextSendAtIso });
    nextSlot += THIRTY_MIN_MS;
  }

  console.log("[activate-funnelfixer] complete", {
    activated_count: activated.length,
    remaining: sorted.length - activated.length,
    first_slot: activated[0]?.next_send_at,
    last_slot: activated[activated.length - 1]?.next_send_at,
  });

  return NextResponse.json({
    ok: true,
    activated: activated.length,
    remaining: sorted.length - activated.length,
    schedule: activated,
  });
}
