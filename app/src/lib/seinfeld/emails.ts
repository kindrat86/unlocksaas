/**
 * Seinfeld email renderer.
 *
 * Spec: strategy/workbooks/08-your-dream-customer.md §6.
 *
 * Renders one item from a content pool into a {subject, text, html} triple
 * ready to hand to Resend.
 *
 * PS-line policy (locked, revised 2026-05-17 for tier-awareness):
 *   - Every email ends with a single PS linking the cheapest UNOWNED rung of
 *     the value ladder (workbook 02 §1).
 *   - For a subscriber with NO purchase (tier='none' or unknown):
 *       even sendsCount → /diagnostic  (free)
 *       odd  sendsCount → /starter     ($1)
 *     First send (sendsCount=0) goes to /diagnostic — the cheapest next ask
 *     for a graduate who didn't already buy.
 *   - For a $1 Starter buyer (tier='starter'):
 *       even sendsCount → /diagnostic    (still useful — "free read on your
 *                                          live page" works even for buyers)
 *       odd  sendsCount → /machine-sales ($49 — the next unowned rung)
 *     Brunson rule: never ask a customer to buy what they already own.
 *   - Core customers (tier='core') do not receive Seinfeld at all — the
 *     Stripe webhook pauses their row via maybeShortCircuitSeinfeld on
 *     `customer.subscription.created`. If one slips through (race window
 *     between cron select and pause), the dispatcher's re-read guard skips
 *     them. Either way this renderer should never see a tier='core' caller.
 *
 * Visual shell intentionally mirrors lib/soap-opera/emails.ts so the two
 * sequences feel like one continuous voice across the subscriber's lifetime.
 */

import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import type { SeinfeldItem } from "./content";

export type PsTarget = "diagnostic" | "starter" | "machine-sales";

/**
 * Subscriber tier read from public.profiles at dispatch time. Drives the
 * PS-line rotation. 'none' = no purchase. 'starter' = $1 OTO paid. 'core' =
 * $49/mo active (should never reach the renderer in practice — see policy
 * note above).
 */
export type SubscriberTier = "none" | "starter" | "core";

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

export interface RenderContext {
  email: string;
  /** Absolute origin of the app, e.g. https://unlocksaas.com */
  baseUrl: string;
  /** Even/odd parity from sends_count picks the PS target. */
  sendsCount: number;
  /**
   * Subscriber tier at dispatch time. Defaults to 'none' if the caller can't
   * resolve a profile row by email (cold subscribers, manual enrolls).
   */
  tier?: SubscriberTier;
}

/**
 * Pick the PS-line target for this send. Brunson: point at the cheapest
 * unowned rung. See policy note at top of file for the full matrix.
 *
 * Defaults `tier` to 'none' when the caller hasn't resolved a profile row
 * (e.g. cold subscriber whose email has never bought). That gives the
 * legacy two-state behaviour from the v1 spec.
 */
export function pickPsTarget(
  sendsCount: number,
  tier: SubscriberTier = "none",
): PsTarget {
  // Defensive: a paused-on-conversion race shouldn't reach this code, but if
  // it does, route to /diagnostic (the one CTA that's safe even for a Core
  // customer — "free read on your live page" never insults).
  if (tier === "core") return "diagnostic";

  const odd = sendsCount % 2 !== 0;
  if (!odd) return "diagnostic";

  // Odd sends: ask for the next unowned rung.
  return tier === "starter" ? "machine-sales" : "starter";
}

function psLine(target: PsTarget, baseUrl: string): string {
  if (target === "diagnostic") {
    return `If you want a free read on why your line is flat, the diagnostic is here: ${baseUrl}/diagnostic`;
  }
  if (target === "machine-sales") {
    return `If you want to run the full Machine — first paying customer in 60 days, verified, or you don't pay — the door is here: ${baseUrl}/machine-sales`;
  }
  return `If you want to finish your WHO and WHAT for $1, the door is here: ${baseUrl}/starter`;
}

// ── shared HTML helpers (mirrors lib/soap-opera/emails.ts) ──────────────────
function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlShell(bodyHtml: string, footerHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f7f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px;">
      <tr><td style="font-size:16px;line-height:1.6;">
${bodyHtml}
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

function paragraphsToHtml(paragraphs: string[]): string {
  return paragraphs
    .map((p) => `<p style="margin:0 0 16px 0;">${escape(p)}</p>`)
    .join("\n");
}

function buildFooter(unsubscribeUrl: string): { text: string; html: string } {
  return {
    text: `You're hearing from Maryan because you opted in at unlocksaas.com. One-click unsubscribe: ${unsubscribeUrl}`,
    html: `You're hearing from Maryan because you opted in at <a href="https://unlocksaas.com" style="color:#888;">unlocksaas.com</a>. <a href="${unsubscribeUrl}" style="color:#888;">One-click unsubscribe</a>.`,
  };
}

/**
 * Render one Seinfeld email. Caller picks the item (via per-weekday pool +
 * rotation cursor) and passes it in.
 */
export function renderEmail(
  item: SeinfeldItem,
  ctx: RenderContext,
): RenderedEmail {
  const target = pickPsTarget(ctx.sendsCount, ctx.tier);
  const ps = psLine(target, ctx.baseUrl);
  const unsubscribeUrl = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const footer = buildFooter(unsubscribeUrl);

  const fullParagraphs = [...item.paragraphs, `PS: ${ps}`, "— Maryan"];

  const text = `${fullParagraphs.join("\n\n")}\n\n---\n${footer.text}\n`;
  const html = htmlShell(paragraphsToHtml(fullParagraphs), footer.html);

  return { subject: item.subject, text, html };
}
