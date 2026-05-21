/**
 * Offer-deliverable email.
 *
 * Sent when a buyer completes an OTO (vault, cold-emails downsell) or an
 * order-bump add-on (Dream 100 spreadsheet). Hands the buyer the asset URL
 * the operator has pasted into the matching env var. If the URL is unset we
 * send a holding-pattern note instead so the customer never wonders whether
 * their card was charged.
 *
 * Voice: matches community-invite-email.ts and deliverable-email.ts –
 * Reluctant Hero, signed "- Maryan", no hype. Workbook 01 §6.
 *
 * Returns true on Resend success, false on failure (caller logs).
 */
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { OFFERS, type OfferId, formatDollars } from "@/lib/offers";

export interface OfferDeliverableEmailArgs {
  to: string;
  offerId: OfferId;
  /** The operator-pasted asset URL (Notion, Drive, etc.). May be null. */
  deliverableUrl: string | null;
  /** Optional first-name greeting. */
  firstName?: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function subjectFor(offerId: OfferId): string {
  switch (offerId) {
    case "starter_bump":
      return "Your Dream 100 spreadsheet and cold-email library";
    case "oto_vault":
      return "The Founder's Diary Vault is in your inbox";
    case "oto_downsell":
      return "Your cold-email library";
    case "oto_lifetime":
      // The lifetime OTO has its own dedicated email (community invite)
      // so this branch is never reached in production. Keep the string
      // safe in case the webhook misroutes a payload.
      return "Lifetime seat – the room invite is coming separately";
  }
}

function bodyFor(offerId: OfferId, url: string | null): string {
  const offer = OFFERS[offerId];
  const price = formatDollars(offer.priceCents);
  if (url) {
    return [
      `Quick note. The ${offer.title} link is below. ${price} cleared in Stripe a minute ago.`,
      "",
      url,
      "",
      "Open it now, copy whatever you want into your own Notion, and treat the original as the master. I'll update the master if I find anything worth adding; you'll always have your fork.",
      "",
      "Reply to this email if anything is unclear. The address goes to me.",
      "",
      "- Maryan",
    ].join("\n");
  }
  // Holding pattern – the buyer's card cleared but the operator hasn't
  // pasted the URL into env yet. Honest note, no apology theater.
  return [
    `Quick note. The ${offer.title} cleared in Stripe a minute ago (${price}).`,
    "",
    "The link for the download is still being finalized – I'll send it to this same inbox within twenty-four hours. If for any reason it doesn't land, hit reply and I'll personally deliver it.",
    "",
    "- Maryan",
  ].join("\n");
}

function htmlFor(offerId: OfferId, url: string | null): string {
  const text = bodyFor(offerId, url);
  // Convert plain-text paragraphs into <p> blocks, preserving the URL as a link.
  const paragraphs = text.split("\n\n").map((p) => {
    const safe = escapeHtml(p);
    if (url && p.trim() === url) {
      return `<p style="margin:0 0 16px 0;"><a href="${escapeHtml(url)}" style="color:#0a0a0a;text-decoration:underline;">${safe}</a></p>`;
    }
    return `<p style="margin:0 0 16px 0;line-height:1.55;">${safe.replace(/\n/g, "<br />")}</p>`;
  });
  return `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#0a0a0a;max-width:560px;margin:0 auto;padding:32px 16px;">${paragraphs.join("")}</body></html>`;
}

export async function sendOfferDeliverableEmail(
  args: OfferDeliverableEmailArgs,
): Promise<boolean> {
  const { to, offerId, deliverableUrl } = args;
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      replyTo: REPLY_TO,
      subject: subjectFor(offerId),
      text: bodyFor(offerId, deliverableUrl),
      html: htmlFor(offerId, deliverableUrl),
    });
    if (result.error) {
      console.warn(
        `[offer-deliverable-email] resend error for ${offerId}:`,
        result.error.message ?? result.error,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      `[offer-deliverable-email] threw for ${offerId}:`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
