import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import {
  renderEmail,
  SPINE_LENGTH,
  type DiagnosticResult,
  type SequenceIndex,
} from "./emails";
import { buildUnsubscribeUrl } from "./tokens";

/**
 * Row shape the dispatcher needs. Mirrors a subset of
 * soap_opera_subscribers columns.
 *
 * emails_sent semantics (after migration 0020):
 *   0 = no spine email sent yet (Day 0 / E1 still pending)
 *   1 = E1 has been sent; E2 is next
 *   2 = E2 has been sent; E3 is next
 *   3 = all 3 spine emails sent; spine complete
 *
 * branch_fired is a separate axis (handled by sendBranchAndMark, not by
 * the day-0/2/4 spine cron).
 */
export interface DueRow {
  id: string;
  email: string;
  diagnostic_result: DiagnosticResult | null;
  emails_sent: number;
  /**
   * soap_opera_subscribers.source. Threaded through to renderEmail so E1
   * can render the FunnelFixer bridge variant for carry-over subscribers
   * (source LIKE 'funnelfixer_%').
   */
  source?: string | null;
}

export interface SendResult {
  email: string;
  /** Raw email index for logging; may be out of SequenceIndex range on error paths. */
  index: number;
  ok: boolean;
  error?: string;
}

/** 48-hour cadence between spine sends. Day 0 / 2 / 4. */
const TWO_DAY_INTERVAL_MS = 2 * 24 * 60 * 60 * 1000;

function baseUrl(): string {
  // Prefer the canonical app URL (always set in production env). Fall back to
  // VERCEL_URL (set on every preview deploy) so previews send links that
  // resolve to the right host.
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

/**
 * Send the next spine email for one subscriber and advance their counter.
 *
 * - On success: emails_sent++; last_sent_at=now; next_send_at=now+48h
 *   (or null + status='complete' when the spine is exhausted).
 * - On failure: emails_sent unchanged so the next cron tick retries.
 *
 * Every send is tagged with `subscriber_id` and `email_index` so the
 * Resend webhook can route opens/clicks back to the correct row without
 * a reverse-lookup on `to`.
 */
export async function sendNextAndAdvance(row: DueRow): Promise<SendResult> {
  const index = row.emails_sent; // zero-based; if 0 we send E1.
  if (index >= SPINE_LENGTH) {
    return { email: row.email, index, ok: false, error: "spine_exhausted" };
  }

  const supabase = createAdminClient();
  const rendered = renderEmail(index as SequenceIndex, {
    email: row.email,
    diagnosis: row.diagnostic_result,
    baseUrl: baseUrl(),
    source: row.source ?? null,
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
      // RFC 8058 one-click unsubscribe – keeps Gmail/Yahoo happy on bulk send.
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "sequence", value: "soap_opera" },
        // email_index is 1-based on the wire to match human intuition
        // (E1/E2/E3 not 0/1/2). The webhook converts back when matching
        // against the e3_opened_at column.
        { name: "email_index", value: String(index + 1) },
        // subscriber_id is the join key the Resend webhook uses to write
        // e3_opened_at / e3_clicked_at without re-querying by email.
        { name: "subscriber_id", value: row.id },
        {
          name: "diagnosis",
          value: row.diagnostic_result ?? "none",
        },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    console.error("[soap-opera-dispatch] send_failed", {
      id: row.id,
      email: row.email,
      index,
      error: sendError,
    });
    return { email: row.email, index, ok: false, error: sendError };
  }

  const nowMs = Date.now();
  const newCount = index + 1;
  const isFinal = newCount >= SPINE_LENGTH;

  const update: {
    emails_sent: number;
    last_sent_at: string;
    next_send_at: string | null;
    status?: "complete";
  } = {
    emails_sent: newCount,
    last_sent_at: new Date(nowMs).toISOString(),
    next_send_at: isFinal
      ? null
      : new Date(nowMs + TWO_DAY_INTERVAL_MS).toISOString(),
  };
  if (isFinal) update.status = "complete";

  const { error: dbError } = await supabase
    .from("soap_opera_subscribers")
    .update(update)
    .eq("id", row.id);

  if (dbError) {
    console.error("[soap-opera-dispatch] db_update_failed", {
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

/**
 * Row shape for branch dispatch. Branches don't advance emails_sent –
 * they're a separate axis and run at most once per subscriber.
 */
export interface BranchRow {
  id: string;
  email: string;
  diagnostic_result: DiagnosticResult | null;
  source?: string | null;
}

/** Branch identifiers stored in soap_opera_subscribers.branch_fired. */
export type BranchId = "branch_a" | "branch_b";

/**
 * Send a branch email and flip branch_fired + branch_fired_at on the row.
 * Designed for the day-6 cron pass.
 *
 * Idempotency: caller must check branch_fired = 'none' BEFORE invoking
 * this. The DB update unconditionally sets branch_fired, so calling this
 * for an already-routed subscriber would overwrite their state.
 */
export async function sendBranchAndMark(
  row: BranchRow,
  branch: BranchId
): Promise<SendResult> {
  const supabase = createAdminClient();
  const rendered = renderEmail(branch, {
    email: row.email,
    diagnosis: row.diagnostic_result,
    baseUrl: baseUrl(),
    source: row.source ?? null,
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
        { name: "sequence", value: "soap_opera" },
        { name: "email_index", value: branch },
        { name: "subscriber_id", value: row.id },
        {
          name: "diagnosis",
          value: row.diagnostic_result ?? "none",
        },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    console.error("[soap-opera-dispatch] branch_send_failed", {
      id: row.id,
      email: row.email,
      branch,
      error: sendError,
    });
    return { email: row.email, index: branch, ok: false, error: sendError };
  }

  // Flip branch_fired + branch_fired_at. We cast through `as never` for the
  // same reason the rest of the soap-opera code does: the generated
  // database.types.ts hasn't been regenerated for the new columns yet.
  const nowIso = new Date().toISOString();
  const update = {
    branch_fired: branch,
    branch_fired_at: nowIso,
  };
  const { error: dbError } = await supabase
    .from("soap_opera_subscribers")
    .update(update as never)
    .eq("id", row.id);

  if (dbError) {
    console.error("[soap-opera-dispatch] branch_db_update_failed", {
      id: row.id,
      email: row.email,
      branch,
      error: dbError.message,
    });
    return {
      email: row.email,
      index: branch,
      ok: false,
      error: `db_${dbError.message}`,
    };
  }

  return { email: row.email, index: branch, ok: true };
}

/**
 * Pure branch-selection logic – exported for the dry-run script.
 *
 * State machine (day 6, branch_fired = 'none'):
 *   - E3 clicked AND no Stripe charge yet   → 'branch_b' (objection_handler)
 *   - E3 opened (and not in the above bucket) → 'branch_a' (soft_sell)
 *   - else                                  → null (no branch fires)
 *
 * `converted` collapses converted_to_starter_at OR core_activated_at OR
 * any other "they paid" signal – kept generic so the cron can pass either.
 */
export function selectBranch(args: {
  e3_opened_at: string | null;
  e3_clicked_at: string | null;
  converted: boolean;
}): BranchId | null {
  if (args.converted) return null;
  if (args.e3_clicked_at) return "branch_b";
  if (args.e3_opened_at) return "branch_a";
  return null;
}
