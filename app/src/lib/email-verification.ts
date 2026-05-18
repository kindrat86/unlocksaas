/**
 * Lightweight email deliverability check used by every public signup endpoint.
 *
 * Two checks, both essentially free:
 *   1. Syntax – matches the same regex shape we use throughout the app.
 *   2. MX lookup – confirms the domain has at least one mail exchanger. Catches
 *      typo'd domains (gnail.com, hotmial.com) and dead/parked domains.
 *
 * Falls back to A-record when MX is absent (RFC 5321 §5.1 implicit MX).
 *
 * Intentionally does NOT do an SMTP probe. Gmail/Outlook/Yahoo always accept
 * RCPT TO for anti-enumeration, so probing them tells us nothing; we rely on
 * the Resend bounce webhook to catch dead inboxes on those providers after
 * the first send.
 *
 * Called from the email-source POST paths. Skipped entirely when the signup
 * source is 'google_oauth' – Google has already verified the address.
 */

import { promises as dns } from "node:dns";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EmailCheckResult =
  | { ok: true; normalized: string }
  | { ok: false; reason: "invalid_syntax" | "no_mx_record" | "lookup_failed" };

/**
 * Validates an email address against syntax + MX. Returns a normalized
 * (trimmed + lowercased) form on success.
 *
 * The MX lookup has a built-in resolver timeout (Node uses ~5s by default)
 * but we don't cache results – the call sites are user-initiated form posts
 * with single addresses, so cache complexity isn't worth it.
 */
export async function verifyDeliverableEmail(
  emailRaw: string
): Promise<EmailCheckResult> {
  const email = (emailRaw ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, reason: "invalid_syntax" };
  }

  const domain = email.split("@")[1];
  if (!domain) return { ok: false, reason: "invalid_syntax" };

  try {
    const records = await dns.resolveMx(domain);
    if (records && records.length > 0) {
      return { ok: true, normalized: email };
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    // ENODATA / ENOTFOUND: domain has no MX. Try implicit A fallback per
    // RFC 5321 before giving up.
    if (code === "ENODATA" || code === "ENOTFOUND") {
      try {
        await dns.resolve4(domain);
        return { ok: true, normalized: email };
      } catch {
        try {
          await dns.resolve6(domain);
          return { ok: true, normalized: email };
        } catch {
          return { ok: false, reason: "no_mx_record" };
        }
      }
    }
    return { ok: false, reason: "lookup_failed" };
  }

  return { ok: false, reason: "no_mx_record" };
}

/**
 * Returns true when the signup source bypasses our verification pipeline.
 * Google OAuth means Google has already proven the email is real and owned by
 * the person hitting submit – no need to MX-check or double opt-in.
 */
export function isPreVerifiedSource(source: string | null | undefined): boolean {
  if (!source) return false;
  const s = source.toLowerCase();
  return s === "google_oauth" || s.startsWith("google_");
}
