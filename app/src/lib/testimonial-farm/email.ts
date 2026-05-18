/**
 * Testimonial-farm offer email renderer.
 *
 * One-time reactivation email sent to every FunnelFixer carry-over
 * subscriber the day after they finish the 5-email Soap Opera.
 *
 * Offer (Brunson Hard-Rule compliant):
 *   - $1 Starter at $0 for 14 days via a Stripe-coupon-backed Payment Link
 *     the operator creates in Stripe and pastes into env.
 *   - If Stripe verifies a paying customer on the back of what they build,
 *     they agree to land on /builders as a Verified Builder.
 *   - If it does not work, they owe nothing. They paid nothing. The
 *     fallback is honest, not a soft re-pitch.
 *
 * Voice: same Reluctant Hero register as the Soap Opera, signed "— Maryan",
 * PS line, RFC 8058 one-click unsubscribe via the existing token route.
 *
 * Spec: build-log entry "FunnelFixer carry-over testimonial farm" +
 * strategy/google-strategy.md §AC-flaw on aggregateRating discipline.
 */

import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";

export interface TestimonialFarmRenderContext {
  /** Recipient address. Used for the unsubscribe token and the prefilled email. */
  email: string;
  /** Absolute origin of the app, e.g. https://unlocksaas.com */
  baseUrl: string;
  /**
   * The operator-configured Stripe Payment Link URL pointing at the Starter
   * price with the 100%-off coupon already applied. Per-recipient query
   * params (prefilled_email + client_reference_id + utm_*) are appended by
   * the caller before this URL hits the email body.
   */
  paymentLinkUrl: string;
}

export interface RenderedTestimonialFarmEmail {
  subject: string;
  text: string;
  html: string;
}

// ── shared HTML helpers ────────────────────────────────────────────────────
// Duplicated from lib/soap-opera/emails.ts intentionally. Both sequences
// render in the same Resend account against the same domain; sharing
// helpers would couple two unrelated change-cadences. The CSS-in-table
// shape is also small enough that copying is cheaper than extracting.

function htmlShell(bodyHtml: string, ctaHtml: string, footerHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px;">
      <tr><td style="font-size:16px;line-height:1.6;">
${bodyHtml}
${ctaHtml}
      </td></tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;padding:16px 8px 0;">
      <tr><td style="font-size:12px;line-height:1.5;color:#888;">
${footerHtml}
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => `<p style="margin:0 0 16px 0;">${escapeHtml(p)}</p>`)
    .join("\n");
}

function ctaBlock(paymentLinkUrl: string): string {
  // Inline-styled button so Gmail/Outlook render it without rewriting.
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px 0;">
  <tr><td style="border-radius:6px;background:#111;">
    <a href="${escapeHtml(paymentLinkUrl)}" style="display:inline-block;padding:14px 22px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">Claim the $0 Starter</a>
  </td></tr>
</table>
<p style="margin:0 0 16px 0;font-size:13px;color:#666;">If the button does not work, copy and paste: ${escapeHtml(paymentLinkUrl)}</p>`;
}

function buildFooter(unsubscribeUrl: string): { text: string; html: string } {
  return {
    text: `You're hearing from Maryan because you opted in at unlocksaas.com (originally via FunnelFixer). One-click unsubscribe: ${unsubscribeUrl}`,
    html: `You're hearing from Maryan because you opted in at <a href="https://unlocksaas.com" style="color:#888;">unlocksaas.com</a> (originally via FunnelFixer). <a href="${unsubscribeUrl}" style="color:#888;">One-click unsubscribe</a>.`,
  };
}

/**
 * Build the per-recipient Payment Link URL.
 *
 * Appends:
 *   - prefilled_email  → Stripe-supported, prefills the checkout email field
 *   - client_reference_id → preserved on the resulting Checkout Session, so
 *                            the Stripe webhook can attribute the purchase
 *                            back to the exact soap_opera_subscribers row
 *   - utm_source / utm_campaign → Brunson attribution + analytics
 *
 * Falls back to the bare URL if the input is somehow malformed; we still
 * want the email to send so the recipient can hand-paste it.
 */
export function buildPaymentLinkUrl(
  base: string,
  email: string,
  subscriberId: string
): string {
  try {
    const url = new URL(base);
    url.searchParams.set("prefilled_email", email);
    url.searchParams.set("client_reference_id", subscriberId);
    url.searchParams.set("utm_source", "funnelfixer_testimonial");
    url.searchParams.set("utm_medium", "email");
    url.searchParams.set("utm_campaign", "testimonial_farm");
    return url.toString();
  } catch {
    return base;
  }
}

/**
 * Render the one-shot offer email. Pure function – no I/O, no DB. The
 * caller threads the per-recipient Payment Link URL in.
 */
export function renderTestimonialFarmEmail(
  ctx: TestimonialFarmRenderContext
): RenderedTestimonialFarmEmail {
  const unsubscribeUrl = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const footer = buildFooter(unsubscribeUrl);

  const subject = "One last note from me. No money this time.";

  const bodyParagraphs = [
    "You read all five emails. Most people skim two and drift. You stayed. That earns you one more.",
    "Here is the situation. The /builders wall on unlocksaas.com only lists founders whose first paying customer was verified inside Stripe. Not self-reported. Not a screenshot of a tweet. A real Stripe charge tied to a real product. The wall has zero entries today. That is honest, and it is also a problem, because the next reader who lands on the homepage looks at an empty wall and decides UnlockSaaS is too new to trust.",
    "So I am running this exactly once for the people who came over from FunnelFixer.",
    "For the next fourteen days, the $1 Starter is $0 for you. The button below opens a Stripe Payment Link with a one-time 100% off coupon already applied. You will see $0 due. That gets you Step 1 and Step 2 of the Playbook – pin one real customer, write one real offer – and a Verified Builder slot if a paying customer lands on your Stripe account on the back of it.",
    "The only ask, if it works: let me add your name and the Stripe-cycle screenshot to /builders. That is the deal. Real verification, real name, real founder.",
    "If it does not work, you owe nothing. You paid nothing. I would still want to hear what got in the way, but that is a request, not a condition. The 60-day money-back guarantee that applies on the paid Playbook does not apply here because there is nothing to refund.",
    "This is a one-shot. If you ignore this email, I will not re-pitch it. I am sending it to the entire carry-over list once, then it closes. That is also honest – I would rather the wall stay empty than coerce the offer.",
  ];

  const ps =
    "PS: If you do not want the link but you want to send me your launch URL anyway, just hit reply. I read everything that lands in maryan@unlocksaas.com. If you have already shipped a first paying customer somewhere else, that is the better story – tell me about it and I will put you on /builders without you needing this link at all.";

  const fullParagraphs = [...bodyParagraphs, ps, "— Maryan"];

  const text = `${bodyParagraphs.join("\n\n")}\n\nClaim the $0 Starter: ${ctx.paymentLinkUrl}\n\n${ps}\n\n— Maryan\n\n---\n${footer.text}\n`;

  const html = htmlShell(
    paragraphsToHtml(bodyParagraphs),
    ctaBlock(ctx.paymentLinkUrl) +
      paragraphsToHtml([ps, "— Maryan"]),
    footer.html
  );

  return { subject, text, html };
}
