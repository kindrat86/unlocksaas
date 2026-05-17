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
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import { isSendDay } from "./schedule";
import { pickForSend } from "./content";
import { renderEmail, pickPsTarget } from "./emails";

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
 * Send the right Seinfeld email for this subscriber, then advance counters.
 *
 * JK5 rotation is driven by `row.sends_count` (lifetime sends before this
 * one). Send #0 → Personal[0], #1 → Process[0], #2 → Pattern[0], #3 →
 * Polarity[0], #4 → Proof[0], #5 → Personal[1], etc.
 *
 * No-op (ok=false, error='not_send_day') if today is not a Mon/Wed/Fri UTC.
 */
export async function sendNextAndAdvance(
  row: DueRow,
  now: Date = new Date(),
): Promise<SendResult> {
  if (!isSendDay(now)) {
    return { email: row.email, ok: false, error: "not_send_day" };
  }

  const { item, jk5 } = pickForSend(row.sends_count);

  const rendered = renderEmail(item, {
    email: row.email,
    baseUrl: baseUrl(),
    sendsCount: row.sends_count,
  });
  const unsubscribeUrl = buildUnsubscribeUrl(row.email, baseUrl());
  const psTarget = pickPsTarget(row.sends_count);

  const supabase = createAdminClient();

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
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    await supabase
      .from("seinfeld_subscribers")
      .update({ last_error: sendError })
      .eq("id", row.id);
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
