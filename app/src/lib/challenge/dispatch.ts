import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { renderEmail, SEQUENCE_LENGTH } from "./emails";
import { buildUnsubscribeUrl } from "../soap-opera/tokens";

/**
 * 14-Day Challenge dispatcher — mirrors the Soap Opera dispatcher behaviour:
 * idempotent advance, retry-safe on Resend/DB failure, console-traced errors.
 *
 * emails_sent semantics:
 *   0 = nothing sent (transient — subscribe sends Day 0 inline before persist completes)
 *   1 = Day 0 welcome sent (Day 1 next)
 *   ...
 *   15 = Day 14 sent; sequence complete
 */
export interface DueRow {
  id: string;
  email: string;
  first_name: string;
  emails_sent: number;
}

export interface SendResult {
  email: string;
  index: number;
  ok: boolean;
  error?: string;
}

/** 24-hour cadence between sends. Same as Soap Opera. */
const DAY_INTERVAL_MS = 24 * 60 * 60 * 1000;

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

/**
 * Send the next email in the sequence for one subscriber and advance their
 * counter. Returns ok=true on success, ok=false on either Resend failure or
 * DB write failure. On failure, emails_sent is NOT incremented so the next
 * cron tick retries the same email.
 */
export async function sendNextAndAdvance(row: DueRow): Promise<SendResult> {
  const index = row.emails_sent; // zero-based; if 0 we send Day 0 welcome.
  if (index >= SEQUENCE_LENGTH) {
    return { email: row.email, index, ok: false, error: "sequence_exhausted" };
  }

  const supabase = createAdminClient();
  const rendered = renderEmail(index, {
    email: row.email,
    firstName: row.first_name,
    baseUrl: baseUrl(),
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
        { name: "sequence", value: "challenge_14day" },
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
    console.error("[challenge-dispatch] send_failed", {
      id: row.id,
      email: row.email,
      index,
      error: sendError,
    });
    // Persist last_error so the operator can see why the row is stuck.
    // `as never` matches the dual-schema reconciliation pattern used in
    // machine/page.tsx — the migration shipped (20260518000001) but the
    // generated database.types.ts has not been regenerated yet.
    await supabase
      .from("challenge_subscribers" as never)
      .update({ last_error: sendError.slice(0, 500) } as never)
      .eq("id", row.id);
    return { email: row.email, index, ok: false, error: sendError };
  }

  // Advance the counter. If this was the final email, flip status to 'complete'
  // (matches the check constraint) and clear next_send_at + stamp completed_at.
  const nowMs = Date.now();
  const newCount = index + 1;
  const isFinal = newCount >= SEQUENCE_LENGTH;

  const update: {
    emails_sent: number;
    last_sent_at: string;
    next_send_at: string | null;
    last_error: null;
    status?: "complete";
    completed_at?: string;
  } = {
    emails_sent: newCount,
    last_sent_at: new Date(nowMs).toISOString(),
    next_send_at: isFinal ? null : new Date(nowMs + DAY_INTERVAL_MS).toISOString(),
    last_error: null,
  };
  if (isFinal) {
    update.status = "complete";
    update.completed_at = new Date(nowMs).toISOString();
  }

  const { error: dbError } = await supabase
    .from("challenge_subscribers" as never)
    .update(update as never)
    .eq("id", row.id);

  if (dbError) {
    console.error("[challenge-dispatch] db_update_failed", {
      id: row.id,
      email: row.email,
      index,
      error: dbError.message,
    });
    return { email: row.email, index, ok: false, error: `db_${dbError.message}` };
  }

  if (isFinal) {
    console.log("[challenge-dispatch] sprint_complete", {
      id: row.id,
      email: row.email,
    });
  }

  return { email: row.email, index, ok: true };
}
