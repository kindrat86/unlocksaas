import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return _resend;
}

/**
 * Canonical From address for all customer-facing email.
 * Locked in memory: project_unlocksaas_email_identity.md — every customer-facing
 * message is from maryan@unlocksaas.com, signed "— Maryan". Never use
 * noreply@ or role addresses (sales@, info@, support@) — they break the
 * Reluctant Hero parasocial bond and trip spam filters.
 *
 * Override with RESEND_FROM env var only for staging/sandbox sends.
 */
export const FROM_ADDRESS =
  process.env.RESEND_FROM ?? "Maryan from UnlockSaaS <maryan@unlocksaas.com>";

/**
 * Reply-To is the same mailbox so replies land in Private Email (which
 * scripts/mail.py reads). Resend can DKIM-sign as maryan@unlocksaas.com but
 * the inbox sits on Private Email — the reply-to header keeps the loop closed.
 */
export const REPLY_TO = "maryan@unlocksaas.com";
