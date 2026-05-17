/**
 * First-paying-customer celebration email.
 *
 * Sent from maryan@unlocksaas.com per project_unlocksaas_email_identity.md
 * (the Reluctant Hero AC — one human to one human, no role addresses).
 *
 * Called from the Stripe webhook's Connect-event branch and from the
 * /playbook/verified server action (manual mark). Same template both paths.
 *
 * Per workbook 10 §5 (butterfly play #2) + Hard Rule #10 (Verified Builders
 * identity ships from day one):
 *   - Reluctant Hero voice (workbook 01 §6 samples; no exclamation marks).
 *   - Stripe-verified language ("the line moved"), not generic congratulations.
 *   - CTA → /playbook/verified to claim the public badge (no pressure).
 *
 * Returns true if the email was sent, false on failure (caller can log).
 */
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";

export interface CelebrationEmailArgs {
  to: string;
  builderName?: string | null;
  productName?: string | null;
  amountCents?: number | null;
  currency?: string | null;
  /** Override CTA. Defaults to <app>/playbook/verified. */
  ctaUrl?: string;
  /** Idempotency key — caller's responsibility to ensure uniqueness per user. */
  idempotencyKey?: string;
}

function formatAmount(cents: number, currency: string): string {
  const n = cents / 100;
  const upper = currency.toUpperCase();
  if (upper === "USD") return `$${n.toFixed(2)}`;
  if (upper === "EUR") return `€${n.toFixed(2)}`;
  return `${n.toFixed(2)} ${upper}`;
}

function defaultCtaUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/playbook/verified`;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/playbook/verified`;
  }
  return "http://localhost:3000/playbook/verified";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendFirstCustomerCelebrationEmail(
  args: CelebrationEmailArgs
): Promise<boolean> {
  if (!args.to) return false;

  const greeting =
    (args.builderName?.split(/\s+/)[0] ?? args.to.split("@")[0] ?? "Builder").trim() ||
    "Builder";
  const product = args.productName?.trim() || "your product";
  const cta = args.ctaUrl ?? defaultCtaUrl();
  const amountLine =
    typeof args.amountCents === "number" && args.amountCents > 0
      ? `Stripe just confirmed a paying customer on ${product} — ${formatAmount(
          args.amountCents,
          args.currency ?? "usd"
        )}.`
      : `Stripe just confirmed a paying customer on ${product}.`;

  const text = [
    `${greeting}.`,
    ``,
    `The line moved.`,
    ``,
    amountLine,
    `The promise is kept. You did the work; the work paid.`,
    ``,
    `If you want to make it public, you can claim your Verified Builder badge here:`,
    cta,
    ``,
    `No pressure. The badge is yours either way.`,
    ``,
    `Reply to this email and tell me who the customer is. I want to put their story next to yours.`,
    ``,
    `— Maryan`,
  ].join("\n");

  const html = `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; font-size: 15px; line-height: 1.6; color: #111;">
  <p>${escapeHtml(greeting)}.</p>
  <p><strong>The line moved.</strong></p>
  <p>${escapeHtml(amountLine)}<br>
  The promise is kept. You did the work; the work paid.</p>
  <p>If you want to make it public, you can claim your Verified Builder badge:</p>
  <p><a href="${escapeHtml(cta)}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none; border-radius: 6px;">Open your Verified Builder badge</a></p>
  <p style="color: #555;">No pressure. The badge is yours either way.</p>
  <p style="color: #555;">Reply to this email and tell me who the customer is. I want to put their story next to yours.</p>
  <p>— Maryan</p>
</div>`.trim();

  try {
    await getResend().emails.send({
      from: FROM_ADDRESS,
      to: args.to,
      replyTo: REPLY_TO,
      subject: `${greeting} — your line moved.`,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[celebration-email] send failed:", err);
    return false;
  }
}
