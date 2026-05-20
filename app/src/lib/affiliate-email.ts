/**
 * Affiliate commission notification email.
 *
 * Sent from maryan@unlocksaas.com per project_unlocksaas_email_identity.md
 * (Reluctant Hero AC — one human to one human, never noreply@).
 *
 * Called from the Stripe webhook after a commission row is INSERTED (so
 * Stripe retries don't trigger duplicate sends — the unique constraint on
 * affiliate_commissions(invoice, charge) absorbs the retry first).
 *
 * Tone: terse, no celebratory exclamation marks. Reluctant Hero voice.
 *
 * Returns true on success, false on failure (caller logs).
 */
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";

type CommissionKind = "starter" | "core_initial" | "core_renewal" | "other";

export interface AffiliateCommissionEmailArgs {
  to: string;
  builderName?: string | null;
  kind: CommissionKind;
  grossAmountCents: number;
  commissionCents: number;
  currency?: string;
}

function formatAmount(cents: number, currency: string = "usd"): string {
  const n = cents / 100;
  const upper = currency.toUpperCase();
  if (upper === "USD") return `$${n.toFixed(2)}`;
  if (upper === "EUR") return `€${n.toFixed(2)}`;
  return `${n.toFixed(2)} ${upper}`;
}

function kindLabel(kind: CommissionKind): string {
  switch (kind) {
    case "starter":
      return "Starter ($1)";
    case "core_initial":
      return "first Core subscription";
    case "core_renewal":
      return "Core renewal";
    default:
      return "purchase";
  }
}

function affiliateDashboardUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return `${explicit}/affiliate`;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/affiliate`;
  }
  return "http://localhost:3000/affiliate";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendAffiliateCommissionEmail(
  args: AffiliateCommissionEmailArgs,
): Promise<boolean> {
  const to = args.to.trim().toLowerCase();
  if (!to) return false;

  const greeting = args.builderName ? `Hey ${args.builderName.split(" ")[0]},` : "Hey,";
  const commission = formatAmount(args.commissionCents, args.currency);
  const gross = formatAmount(args.grossAmountCents, args.currency);
  const label = kindLabel(args.kind);
  const dashboard = affiliateDashboardUrl();

  // En dash only – never em dash (rule per feedback_no_em_dash.md).
  const subject =
    args.kind === "core_renewal"
      ? `${commission} commission – Core renewed`
      : `${commission} commission – ${label}`;

  const textBody = [
    greeting,
    "",
    `Someone you sent to UnlockSaaS just paid for the ${label}.`,
    `Gross: ${gross}. Your cut: ${commission}.`,
    "",
    "It sits in 'pending' for 30 days while the refund window runs out.",
    "After that it moves to 'payable' and I pay it via Wise on the 1st of the next month.",
    "",
    `Dashboard: ${dashboard}`,
    "",
    "– Maryan",
  ].join("\n");

  const htmlBody = `<!doctype html>
<html><body style="font-family:Inter,system-ui,sans-serif;font-size:15px;line-height:1.55;color:#111;max-width:560px;margin:0 auto;padding:24px;">
  <p>${escapeHtml(greeting)}</p>
  <p>Someone you sent to UnlockSaaS just paid for the ${escapeHtml(label)}.</p>
  <p><strong>Gross:</strong> ${escapeHtml(gross)}<br/>
     <strong>Your cut:</strong> ${escapeHtml(commission)}</p>
  <p style="color:#555;font-size:14px;">It sits in <code>pending</code> for 30 days while the refund window runs out. After that it moves to <code>payable</code> and I pay it via Wise on the 1st of the next month.</p>
  <p><a href="${dashboard}" style="background:#111;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none;display:inline-block;">Open dashboard</a></p>
  <p style="color:#666;">– Maryan</p>
</body></html>`;

  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to,
      replyTo: REPLY_TO,
      subject,
      text: textBody,
      html: htmlBody,
    });
    if (error) {
      console.error(
        `[affiliate-email] Resend rejected ${to}:`,
        error.message ?? error,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `[affiliate-email] send threw for ${to}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
