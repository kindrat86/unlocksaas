/**
 * Seinfeld email renderer.
 *
 * Spec: strategy/workbooks/08-your-dream-customer.md §6.
 *
 * Renders one item from a content pool into a {subject, text, html} triple
 * ready to hand to Resend.
 *
 * PS-line policy (locked):
 *   - Every email ends with a single PS linking either /diagnostic OR /starter.
 *   - Alternation is parity-based on sends_count (even → /diagnostic, odd → /starter).
 *     The first send (sends_count=0) goes to /diagnostic — the cheapest next
 *     step for a graduate who didn't already buy.
 *   - When the user is already a $1 Starter buyer (source='starter_buyer' once
 *     the webhook wires that case), the renderer could skip /starter — leaving
 *     that branch as a future-state TODO for now since we don't yet flag
 *     buyer-state on the subscriber row.
 *
 * Visual shell intentionally mirrors lib/soap-opera/emails.ts so the two
 * sequences feel like one continuous voice across the subscriber's lifetime.
 */

import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";
import type { SeinfeldItem } from "./content";

export type PsTarget = "diagnostic" | "starter";

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
}

/**
 * Even sends → Free Diagnostic. Odd sends → $1 Starter. First Seinfeld send
 * lands on Diagnostic because graduate audiences haven't already converted —
 * the cheapest next ask is the right one.
 */
export function pickPsTarget(sendsCount: number): PsTarget {
  return sendsCount % 2 === 0 ? "diagnostic" : "starter";
}

function psLine(target: PsTarget, baseUrl: string): string {
  if (target === "diagnostic") {
    return `If you want a free read on why your line is flat, the diagnostic is here: ${baseUrl}/diagnostic`;
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
  const target = pickPsTarget(ctx.sendsCount);
  const ps = psLine(target, ctx.baseUrl);
  const unsubscribeUrl = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const footer = buildFooter(unsubscribeUrl);

  const fullParagraphs = [...item.paragraphs, `PS: ${ps}`, "— Maryan"];

  const text = `${fullParagraphs.join("\n\n")}\n\n---\n${footer.text}\n`;
  const html = htmlShell(paragraphsToHtml(fullParagraphs), footer.html);

  return { subject: item.subject, text, html };
}
