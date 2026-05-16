/**
 * Seinfeld send-and-advance for a single subscriber row.
 *
 * Mirrors lib/soap-opera/dispatch.ts in shape. Differences:
 *   - Selects content from a per-weekday pool (PARABLES / BEHIND_THE_BUILD /
 *     INDUSTRY_OBSERVATIONS) instead of a fixed 5-item sequence.
 *   - Increments two counters: current_index (rotation cursor) and
 *     sends_count (drives PS alternation). Never flips status to 'complete' —
 *     the Seinfeld nurture is indefinite by design.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import { poolForWeekday, type SeinfeldItem } from "./content";
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
 * Send the right Seinfeld email for this subscriber on today's weekday, then
 * advance counters. No-op (ok=false, error='not_send_day') if today's weekday
 * has no pool — the caller (cron) should guard before calling, but we double-
 * check here so manual /admin send-now paths can't accidentally fire on a
 * Tuesday.
 */
export async function sendNextAndAdvance(
  row: DueRow,
  now: Date = new Date(),
): Promise<SendResult> {
  const pool = poolForWeekday(now.getUTCDay());
  if (!pool || pool.length === 0) {
    return { email: row.email, ok: false, error: "not_send_day" };
  }

  const item: SeinfeldItem = pool[row.current_index % pool.length];

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
        { name: "kind", value: item.kind },
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
    return { email: row.email, ok: false, contentId: item.id, error: sendError };
  }

  const { error: dbError } = await supabase
    .from("seinfeld_subscribers")
    .update({
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
      error: `db_${dbError.message}`,
    };
  }

  return { email: row.email, ok: true, contentId: item.id };
}
