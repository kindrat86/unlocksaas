import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
 * Stagger logic: each activated subscriber gets next_send_at = max(now,
 * latest existing funnelfixer next_send_at + 30 minutes). That keeps every
 * pair of FunnelFixer sends ≥30 minutes apart across the whole cohort –
 * the deliverability rule the operator set on 2026-05-18 (build-log
 * "Email verification + double opt-in + Resend bounce webhook" section).
 *
 * The actual dispatch happens in /api/cron/funnelfixer-tick (every 30 min),
 * which picks one due funnelfixer row per tick. This cron only stages the
 * schedule.
 *
 * Idempotent: when no paused funnelfixer rows remain, returns
 * { ok: true, activated: 0, reason: "queue_empty" } and exits.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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

  // ── 2. Find the latest existing scheduled funnelfixer send ───────────────
  // The new batch slots in 30 minutes after whatever's already in flight.
  const { data: scheduled, error: schedErr } = await supabase
    .from("soap_opera_subscribers")
    .select("next_send_at")
    .ilike("source", "funnelfixer_%")
    .eq("status", "active")
    .not("next_send_at", "is", null)
    .order("next_send_at", { ascending: false })
    .limit(1);

  if (schedErr) {
    console.error("[activate-funnelfixer] select_scheduled_failed", schedErr);
    return NextResponse.json(
      { error: "select_scheduled_failed", detail: schedErr.message },
      { status: 500 }
    );
  }

  const THIRTY_MIN_MS = 30 * 60 * 1000;
  const now = Date.now();
  const latestExisting = scheduled && scheduled.length > 0 && scheduled[0]?.next_send_at
    ? Date.parse(scheduled[0].next_send_at as string)
    : 0;

  // First slot: max(now, latestExisting + 30 min). Subsequent slots add 30 min.
  let nextSlot = Math.max(now, latestExisting + THIRTY_MIN_MS);

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
