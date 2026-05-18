/**
 * Shared double-opt-in plumbing for every funnel signup (Soap Opera, Seinfeld,
 * Challenge, Founding waitlist).
 *
 * Flow for an email-source signup:
 *   1. MX-check the address (lib/email-verification).
 *   2. Insert subscriber row with status='pending_confirmation' + a fresh
 *      confirmation_token (uuid).
 *   3. Send a single "confirm your subscription" email via Resend with a link
 *      to /api/confirm/[token]?list=<list_slug>.
 *   4. User clicks → /api/confirm flips status to 'active' and triggers the
 *      real Day 0 marketing email.
 *
 * Google-OAuth signups skip this entire pipeline (caller checks
 * isPreVerifiedSource() before reaching here).
 *
 * The confirmation token has no explicit expiry – there's a uniqueness index
 * but the token is effectively single-use (the /api/confirm route nulls it
 * out on success). If a token leaks it can only confirm one email subscription,
 * which is also what a malicious bot would have achieved on day one had we
 * stayed single opt-in. Net negligible risk.
 */

import { randomUUID } from "node:crypto";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";

/** Slugs match the `list` query param accepted by /api/confirm/[token]. */
export type FunnelList =
  | "soap_opera"
  | "seinfeld"
  | "challenge"
  | "founding";

/**
 * Maps a funnel slug to the subscriber table it lives in. Used by the confirm
 * endpoint and the Resend bounce webhook to iterate over all four tables.
 */
export const FUNNEL_TABLES: Record<FunnelList, string> = {
  soap_opera: "soap_opera_subscribers",
  seinfeld: "seinfeld_subscribers",
  challenge: "challenge_subscribers",
  founding: "founding_waitlist",
};

/** Human-friendly label used in the confirmation email body. */
export const FUNNEL_LABELS: Record<FunnelList, string> = {
  soap_opera: "the 5-email founder breakdown series",
  seinfeld: "the UnlockSaaS nurture sequence",
  challenge: "the 14-day Unstuck Sprint",
  founding: "the Founding Cohort waitlist",
};

export interface ConfirmationEmailInput {
  list: FunnelList;
  email: string;
  token: string;
  firstName?: string | null;
}

/** Generates a fresh confirmation token (uuid v4). */
export function newConfirmationToken(): string {
  return randomUUID();
}

/** Builds the confirm-link URL. Uses the same baseUrl rules as dispatchers. */
export function buildConfirmUrl(list: FunnelList, token: string): string {
  const base = baseUrl();
  const u = new URL(`/api/confirm/${token}`, base);
  u.searchParams.set("list", list);
  return u.toString();
}

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

/**
 * Sends the "please confirm" email via Resend. Single template across all four
 * funnels, parameterized by FUNNEL_LABELS.
 *
 * Returns { ok, id?, error? } so callers can decide whether to leave the row
 * pending or roll back. Idempotent on the caller side – if the user submits
 * twice, the row's confirmation_token gets re-issued and a new email goes out.
 */
export async function sendConfirmationEmail(
  input: ConfirmationEmailInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[double-opt-in] RESEND_API_KEY not set – skipping send", {
      list: input.list,
      email: input.email,
    });
    return { ok: false, error: "missing_resend_api_key" };
  }

  const confirmUrl = buildConfirmUrl(input.list, input.token);
  const label = FUNNEL_LABELS[input.list];
  const greeting = input.firstName ? `Hey ${input.firstName},` : "Hey,";

  const subject = "One click to confirm your UnlockSaaS subscription";

  const text = [
    greeting,
    "",
    `You (or someone using this address) just signed up at unlocksaas.com for ${label}.`,
    "",
    "Before I send anything else, I need you to confirm it's really you. Click the link below:",
    "",
    confirmUrl,
    "",
    "If you didn't sign up, just ignore this email – you won't hear from me again.",
    "",
    "– Maryan",
    "unlocksaas.com",
  ].join("\n");

  const html = `
<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.55; color: #111; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>${escapeHtml(greeting)}</p>
  <p>You (or someone using this address) just signed up at <strong>unlocksaas.com</strong> for ${escapeHtml(label)}.</p>
  <p>Before I send anything else, I need you to confirm it's really you:</p>
  <p style="margin: 28px 0;">
    <a href="${confirmUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Confirm subscription</a>
  </p>
  <p style="font-size: 14px; color: #555;">Or copy and paste this link:<br><span style="word-break: break-all;">${confirmUrl}</span></p>
  <p>If you didn't sign up, just ignore this email – you won't hear from me again.</p>
  <p>– Maryan<br><a href="https://unlocksaas.com" style="color: #555;">unlocksaas.com</a></p>
</body>
</html>`.trim();

  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: input.email,
      replyTo: REPLY_TO,
      subject,
      text,
      html,
      tags: [
        { name: "kind", value: "double_opt_in" },
        { name: "list", value: input.list },
      ],
    });
    if (result.error) {
      return { ok: false, error: result.error.message ?? "resend_error" };
    }
    const id = result.data?.id ?? "";
    if (!id) {
      return { ok: false, error: "resend_no_id" };
    }
    return { ok: true, id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown_send_error",
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
