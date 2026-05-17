/**
 * Seinfeld send-and-advance for a single subscriber row.
 *
 * Mirrors lib/soap-opera/dispatch.ts in shape. Differences:
 *   - Selects content via JK5 rotation (per-send, not per-weekday). The 5
 *     JK5 categories (Personal / Process / Pattern / Polarity / Proof) come
 *     from strategy/workbooks/09-fill-your-funnel.md §2. Send N goes to
 *     JK5[N mod 5]; item inside that pool indexes by floor(N / 5).
 *   - Increments two counters: current_index (rotation cursor, kept for
 *     legacy analytics queries) and sends_count (the actual driver of the
 *     JK5 picker). Status never flips to 'complete' — Seinfeld is indefinite
 *     by design.
 *   - Cadence (Mon/Wed/Fri UTC) is preserved by the schedule layer; this
 *     function still guards a non-send-day call so manual /admin paths can't
 *     fire on a Tuesday by accident.
 *
 * Three defence-in-depth checks fire before any Resend call, in this order:
 *
 *   1. is-send-day        (schedule)
 *   2. row.status='active'  re-read  (paused-on-conversion race window)
 *   3. tier='core' re-read           (paranoia — handler bug would still skip)
 *
 * If any of (2) or (3) trips, the row is left untouched and the loop moves
 * on. The cron's next tick will re-evaluate normally.
 *
 * On send-fail, a two-strike bounce-escalation rule fires:
 *   - First failure: row keeps status='active', last_error is set, the cron
 *     will try again next send day.
 *   - Second consecutive failure (last_error was non-null when this send
 *     started AND this send also failed): row is flipped to status='errored'
 *     so the cron's WHERE clause excludes it. Operator can re-activate via
 *     /api/seinfeld/subscribe (POST refreshes status to 'active').
 *
 * Why two strikes and not three: Resend hard bounces never recover. A two-
 * strike rule reaches the same destination as three or five at a third the
 * inbox-reputation cost. A future Resend bounce webhook (deferred — see
 * strategy/follow-up-funnels.md Part 8) will flip directly to 'bounced'
 * without waiting for the two-strike heuristic.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import { isSendDay } from "./schedule";
import { pickForSend } from "./content";
import { renderEmail, pickPsTarget, type SubscriberTier } from "./emails";

export interface DueRow {
  id: string;
  email: string;
  current_index: number;
  sends_count: number;
}

export interface SendResult {
  email: string;
  ok: boolean;
  contentId?: string;
  jk5?: string;
  error?: string;
}

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

/**
 * Read the subscriber's current tier from public.profiles. Falls back to
 * 'none' on every failure path (no profile row, RLS deny, DB error) so a
 * missing/broken profile never blocks a send. tier='none' uses the legacy
 * diagnostic/starter PS alternation, which is the safe default.
 */
async function resolveTier(email: string): Promise<SubscriberTier> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("profiles")
      .select("tier")
      .ilike("email", email)
      .maybeSingle();
    const tier = (data as { tier?: string } | null)?.tier;
    if (tier === "core" || tier === "starter") return tier;
    return "none";
  } catch {
    return "none";
  }
}

/**
 * Send the right Seinfeld email for this subscriber, then advance counters.
 *
 * JK5 rotation is driven by `row.sends_count` (lifetime sends before this
 * one). Send #0 → Personal[0], #1 → Process[0], #2 → Pattern[0], #3 →
 * Polarity[0], #4 → Proof[0], #5 → Personal[1], etc.
 *
 * No-op (ok=false, error='not_send_day') if today is not a Mon/Wed/Fri UTC.
 * No-op (ok=false, error='no_longer_active') if the row was paused/unsubscribed
 * between cron Phase-2 SELECT and this dispatch call.
 * No-op (ok=false, error='converted_to_core') if the subscriber upgraded to
 * Core after Phase-2 SELECT but before maybeShortCircuitSeinfeld landed.
 */
export async function sendNextAndAdvance(
  row: DueRow,
  now: Date = new Date(),
): Promise<SendResult> {
  if (!isSendDay(now)) {
    return { email: row.email, ok: false, error: "not_send_day" };
  }

  const supabase = createAdminClient();

  // ── Re-read guard #1: status changed between cron SELECT and now ──────
  // strategy/follow-up-funnels.md Part 6 "stop the chase the second they buy"
  // — companion to lib/cart-recovery/dispatch.ts. The cron SELECT picks
  // active rows; a race window opens until this row's send actually fires.
  // A Stripe webhook (or unsubscribe) landing in that window flips status,
  // and we honour it before paying for a Resend call.
  const { data: liveRow, error: liveErr } = await supabase
    .from("seinfeld_subscribers")
    .select("status, last_error")
    .eq("id", row.id)
    .maybeSingle();

  if (liveErr) {
    console.warn("[seinfeld-dispatch] reread_failed", {
      email: row.email,
      error: liveErr.message,
    });
    // Proceed — read failure shouldn't block the send. Worst case we send to
    // a recently-paused subscriber; the unsubscribe link in every email gives
    // them a one-click out.
  } else if (liveRow && liveRow.status !== "active") {
    return {
      email: row.email,
      ok: false,
      error: `no_longer_active:${liveRow.status}`,
    };
  }

  // Tier resolution lives here so the renderer remains pure. Resolved once,
  // passed in. tier='core' should never reach this point thanks to the pause
  // webhook, but if it does, the dispatcher refuses to send.
  const tier = await resolveTier(row.email);
  if (tier === "core") {
    // Self-heal: a Core subscriber slipped past the pause webhook. Flip the
    // row now and skip the send. Next tick won't see it.
    await supabase
      .from("seinfeld_subscribers")
      .update({ status: "paused" })
      .eq("id", row.id);
    console.log("[seinfeld-dispatch] self_healed_paused_core", {
      email: row.email,
    });
    return { email: row.email, ok: false, error: "converted_to_core" };
  }

  const { item, jk5 } = pickForSend(row.sends_count);

  const rendered = renderEmail(item, {
    email: row.email,
    baseUrl: baseUrl(),
    sendsCount: row.sends_count,
    tier,
  });
  const unsubscribeUrl = buildUnsubscribeUrl(row.email, baseUrl());
  const psTarget = pickPsTarget(row.sends_count, tier);
  const hadPreviousError = !!liveRow?.last_error;

  let sendError: string | undefined;
  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: row.email,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "sequence", value: "seinfeld" },
        // `kind` retains the pre-JK5 label for back-compat with existing
        // Resend dashboards. `jk5` is the new authoritative category.
        { name: "kind", value: item.kind },
        { name: "jk5", value: jk5 },
        { name: "content_id", value: item.id },
        { name: "ps_target", value: psTarget },
        // tier lets the Resend dashboard slice opens/clicks by audience.
        { name: "tier", value: tier },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    // Two-strike bounce escalation. See header comment.
    const nextStatus = hadPreviousError ? "errored" : "active";
    await supabase
      .from("seinfeld_subscribers")
      .update({ last_error: sendError, status: nextStatus })
      .eq("id", row.id);
    if (nextStatus === "errored") {
      console.warn("[seinfeld-dispatch] escalated_to_errored", {
        email: row.email,
        error: sendError,
      });
    }
    return {
      email: row.email,
      ok: false,
      contentId: item.id,
      jk5,
      error: sendError,
    };
  }

  const { error: dbError } = await supabase
    .from("seinfeld_subscribers")
    .update({
      // current_index trails sends_count; both increment in lockstep. Kept
      // distinct so a future feature (e.g. skip-ahead on a topic) can
      // diverge them without a migration.
      current_index: row.current_index + 1,
      sends_count: row.sends_count + 1,
      last_sent_at: now.toISOString(),
      last_error: null,
    })
    .eq("id", row.id);

  if (dbError) {
    return {
      email: row.email,
      ok: false,
      contentId: item.id,
      jk5,
      error: `db_${dbError.message}`,
    };
  }

  return { email: row.email, ok: true, contentId: item.id, jk5 };
}
