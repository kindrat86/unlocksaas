/**
 * Testimonial-farm dispatcher.
 *
 * Sends the one-shot reactivation offer to a single FunnelFixer carry-over
 * subscriber who has finished the Soap Opera (status='complete',
 * source LIKE 'funnelfixer_%').
 *
 * Idempotency: on Resend success the row is stamped with
 *   testimonial_offer_sent_at = now()
 *   testimonial_offer_session_url = paymentLinkUrl (per-recipient)
 * which removes it from the cron's partial-index'd due query forever. On
 * Resend failure neither column is set, so the next cron tick retries.
 *
 * Honesty gate: this dispatcher REFUSES to send if
 *   STRIPE_FUNNELFIXER_TESTIMONIAL_PAYMENT_LINK_URL
 * is not set in env. The Brunson Hard-Rule – no fabricated offer, no
 * broken link – forbids mailing a CTA that does not resolve to a real
 * coupon-backed Stripe checkout. Until the operator pastes the URL
 * into Vercel, the cron returns ok:false reason:'payment_link_not_configured'
 * for every tick and no email is sent.
 *
 * See lib/testimonial-farm/email.ts for the copy. See
 * api/cron/testimonial-farm-offer/route.ts for the queue selection and
 * deliverability-throttle logic.
 */

import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_ADDRESS, REPLY_TO } from "@/lib/resend";
import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import {
  buildPaymentLinkUrl,
  renderTestimonialFarmEmail,
} from "./email";

export interface OfferDueRow {
  id: string;
  email: string;
}

export interface OfferSendResult {
  email: string;
  ok: boolean;
  error?: string;
  /** Set only on ok=true. The exact URL that was embedded in the email. */
  paymentLinkUrl?: string;
}

function baseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "https://unlocksaas.com";
}

function paymentLinkBase(): string | null {
  const v = process.env.STRIPE_FUNNELFIXER_TESTIMONIAL_PAYMENT_LINK_URL;
  if (!v) return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  // Sanity check: must look like an https URL. Brunson Hard-Rule – we will
  // not ship a CTA that obviously will not resolve.
  if (!/^https?:\/\//i.test(trimmed)) return null;
  return trimmed;
}

/**
 * Try to send the offer to one subscriber. Returns ok=false with a reason
 * on any failure; caller decides whether to retry next tick.
 */
export async function sendTestimonialFarmOffer(
  row: OfferDueRow
): Promise<OfferSendResult> {
  const link = paymentLinkBase();
  if (!link) {
    return {
      email: row.email,
      ok: false,
      error: "payment_link_not_configured",
    };
  }

  const supabase = createAdminClient();
  const origin = baseUrl();
  const perRecipientUrl = buildPaymentLinkUrl(link, row.email, row.id);

  const rendered = renderTestimonialFarmEmail({
    email: row.email,
    baseUrl: origin,
    paymentLinkUrl: perRecipientUrl,
  });
  const unsubscribeUrl = buildUnsubscribeUrl(row.email, origin);

  let sendError: string | undefined;
  try {
    const result = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: row.email,
      replyTo: REPLY_TO,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      // RFC 8058 one-click unsubscribe – mirrors the Soap Opera dispatcher,
      // required for Gmail/Yahoo bulk deliverability.
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      tags: [
        { name: "sequence", value: "testimonial_farm" },
        { name: "cohort", value: "funnelfixer_carryover" },
      ],
    });
    if (result.error) {
      sendError = `${result.error.name}: ${result.error.message}`;
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : "unknown_send_error";
  }

  if (sendError) {
    console.error("[testimonial-farm] send_failed", {
      id: row.id,
      email: row.email,
      error: sendError,
    });
    return { email: row.email, ok: false, error: sendError };
  }

  // Stamp the row. If this write fails we will resend tomorrow – worse than
  // not stamping at all is a double-send, but the partial-index query will
  // still find this row next tick, so the worst case is at-least-once
  // delivery on a one-shot offer. Logged loudly so the operator notices.
  const { error: updateError } = await supabase
    .from("soap_opera_subscribers")
    .update({
      testimonial_offer_sent_at: new Date().toISOString(),
      testimonial_offer_session_url: perRecipientUrl,
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("[testimonial-farm] stamp_failed_after_send", {
      id: row.id,
      email: row.email,
      error: updateError.message,
    });
    // Still ok – the email went out. The cron's next tick may re-send if the
    // stamp truly did not land, but Resend tagging will at least make the
    // duplicate visible in the dashboard.
  }

  console.log("[testimonial-farm] sent", {
    id: row.id,
    email: row.email,
  });

  return {
    email: row.email,
    ok: true,
    paymentLinkUrl: perRecipientUrl,
  };
}
