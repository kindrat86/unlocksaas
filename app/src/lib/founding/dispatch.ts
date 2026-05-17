import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import {
  renderFoundingEmail,
  FOUNDING_SEQUENCE_LENGTH,
} from "./pre-launch-emails";
import { seatsClaimed } from "./cohort";

/**
 * Founding-cohort pre-launch sequence dispatcher.
 *
 * Mirrors lib/soap-opera/dispatch.ts. Sends the next email in the PLE1-PLE6
 * sequence and advances the counter. On failure, emails_sent is NOT
 * incremented so the next cron tick retries.
 */

export interface DueRow {
  id: string;
  email: string;
  emails_sent: number;
}

export interface SendResult {
  email: string;
  index: number;
  ok: boolean;
  error?: string;
}

/**
 * Cadence schedule. PLE1 is sent inline on subscribe (Day 0 of the user's
 * waitlist journey). PLE2-PLE5 fire on a calendar that compresses Brunson's
 * 14-day pre-launch arc into the 4 anticipation/cart-open emails after PLE1.
 *
 * Day offsets are from the original signup. The cron picks the earliest row
 * whose next_send_at <= now and advances one email.
 */
const SEND_CADENCE_DAYS: number[] = [
  // index 0 (PLE1) is sent inline on subscribe; no schedule entry needed.
  4,  // PLE2 — 4 days after PLE1 (covers D-14 → D-10 arc compressed)
  3,  // PLE3 — 3 days after PLE2
  4,  // PLE4 — 4 days after PLE3
  3,  // PLE5 — 3 days after PLE4 (cart-open)
  7,  // PLE6 — 7 days after PLE5 (cart-close) OR triggered early when cap hits
];

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

export async function sendNextFoundingAndAdvance(
  row: DueRow
): Promise<SendResult> {
  const index = row.emails_sent;
  if (index >= FOUNDING_SEQUENCE_LENGTH) {
    return {
      email: row.email,
      index,
      ok: false,
      error: "founding_sequence_exhausted",
    };
  }

  const supabase = createAdminClient();
  const claimed = await seatsClaimed();
  const rendered = renderFoundingEmail(index, {
    email: row.email,
    baseUrl: baseUrl(),
    seatsClaimed: claimed,
  });
  const unsubscribeUrl = buildUnsubscribeUrl(row.email, baseUrl());

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
        { name: "sequence", value: "founding_pre_launch" },
        { name: "email_index", value: String(index) },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    console.error("[founding-dispatch] send_failed", {
      id: row.id,
      email: row.email,
      index,
      error: sendError,
    });
    // Stamp last_error so the founder can see failures in the DB.
    await supabase
      .from("founding_waitlist")
      .update({ last_error: sendError })
      .eq("id", row.id);
    return { email: row.email, index, ok: false, error: sendError };
  }

  // Schedule the next send. After PLE6 (index 5), the sequence is complete.
  const nowMs = Date.now();
  const newCount = index + 1;
  const isFinal = newCount >= FOUNDING_SEQUENCE_LENGTH;

  // SEND_CADENCE_DAYS[index] is the gap from the email JUST SENT to the next.
  // After PLE1 (index 0) we wait SEND_CADENCE_DAYS[0]=4 days for PLE2.
  let nextSendAt: string | null = null;
  if (!isFinal) {
    const gapDays = SEND_CADENCE_DAYS[index] ?? 3;
    nextSendAt = new Date(nowMs + gapDays * 24 * 60 * 60 * 1000).toISOString();
  }

  const update: {
    emails_sent: number;
    last_sent_at: string;
    next_send_at: string | null;
    last_error: null;
    status?: "complete";
  } = {
    emails_sent: newCount,
    last_sent_at: new Date(nowMs).toISOString(),
    next_send_at: nextSendAt,
    last_error: null,
  };
  if (isFinal) update.status = "complete";

  const { error: dbError } = await supabase
    .from("founding_waitlist")
    .update(update)
    .eq("id", row.id);

  if (dbError) {
    console.error("[founding-dispatch] db_update_failed", {
      id: row.id,
      email: row.email,
      index,
      error: dbError.message,
    });
    return {
      email: row.email,
      index,
      ok: false,
      error: `db_${dbError.message}`,
    };
  }

  return { email: row.email, index, ok: true };
}
