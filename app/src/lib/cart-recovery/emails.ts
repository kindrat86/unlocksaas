/**
 * Cart Abandonment Recovery — 3-email sequence.
 *
 * Spec: strategy/follow-up-funnels.md (Part 2, cadence #5).
 * Trigger: Stripe `checkout.session.expired` on any priceType.
 * Cadence: Day 0 (inline on enrolment) → Day 2 → Day 7. Then status='complete'.
 *
 * Voice rules (workbook 01 §6):
 *   - Reluctant Hero. Never "we" / "team." Signed "— Maryan."
 *   - Story first. Soft CTA at the bottom.
 *   - No fake urgency. No "your cart is about to expire." No countdown timers.
 *     Brunson rule + polarity AGAINST list (workbook 07 §3 Category 4).
 *
 * Personalisation:
 *   - `priceType` branches the resume link AND the headline reference. Someone
 *     who abandoned the $1 Starter is in a different headspace than someone
 *     who abandoned $49/mo. The arc is identical; the price reference differs.
 *   - `diagnosticLabel` (optional) tilts Email 2's story selection toward
 *     the diagnosed weakness. If null, the story is the universal default.
 */

import { buildUnsubscribeUrl } from "../soap-opera/tokens";

export type CartPriceType = "starter" | "playbook";
export type DiagnosticLabel = "wrong_person" | "weak_offer" | "weak_belief";

export const CART_RECOVERY_SEQUENCE_LENGTH = 3;

/**
 * Days from enrolment to each email send. Index 0 = Day 0 (sent inline by the
 * webhook handler). Indices 1 and 2 are picked up by the daily cron.
 *
 * Reasoning on spacing:
 *   - Day 0 inline catches the still-warm moment.
 *   - Day 2 lets the dust settle; the open is on a different inbox session
 *     so subject-line uniqueness matters more than recency.
 *   - Day 7 is the honest "last note." More than 7 days = chasing.
 */
export const CART_RECOVERY_CADENCE_DAYS: readonly number[] = [0, 2, 7];

interface RenderContext {
  email: string;
  priceType: CartPriceType;
  diagnosticLabel: DiagnosticLabel | null;
  baseUrl: string;
}

interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

// ── price-anchored copy fragments ────────────────────────────────────────────

const PRICE_HEADLINE: Record<CartPriceType, string> = {
  starter: "the $1 door",
  playbook: "the $49 door",
};

const PRICE_SHORT_REF: Record<CartPriceType, string> = {
  starter: "the $1 Starter",
  playbook: "the full Playbook at $49/mo",
};

function resumePath(priceType: CartPriceType): string {
  // Stripe's expired session URL would 404 by D2. Route to the surface page
  // which renders a fresh checkout button on every visit.
  return priceType === "starter" ? "/starter" : "/playbook-sales";
}

// ── diagnostic-label tilt for Email 2 (optional) ─────────────────────────────

const PARABLE_BY_LABEL: Record<DiagnosticLabel, string> = {
  wrong_person:
    "One founder I sat with last month told me her landing page said 'for indie SaaS founders.' She had been writing into the wind for nine months. The week she rewrote the headline to name ONE person — a non-engineer who ships with AI tools and refuses to look at Stripe — she got her first three customers. The product didn't change. The page didn't change. The named person did.",
  weak_offer:
    "One founder I sat with last week described his product for forty seconds. Beautiful description. I asked what he was promising — what specific result, in what specific timeframe, with what backup if it didn't land. He paused for ninety seconds. The pause was the offer. Features describe. Offers promise. Stripe pays the second one.",
  weak_belief:
    "One founder I sat with told me his page assumed the visitor already knew their funnel was leaking. The visitors didn't. They thought their problem was traffic. The page was written for someone three beliefs ahead of where the visitor actually was. He moved Belief 1 onto the page above the offer and conversion doubled in nine days.",
};

const DEFAULT_PARABLE =
  "One founder told me, after the third bourbon, that she had clicked buy on a tool five times before finally finishing the checkout. Five times. Same tool. Each time she found a reason to step away — a tab, a meeting, a doubt. The thing that finally moved her was reading what the inside actually looked like. Not the price. Not the guarantee. The inside.";

function storyFor(label: DiagnosticLabel | null): string {
  if (label && PARABLE_BY_LABEL[label]) return PARABLE_BY_LABEL[label];
  return DEFAULT_PARABLE;
}

// ── shared HTML wrapper ──────────────────────────────────────────────────────

function htmlWrap(bodyMarkup: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f7f7f5;margin:0;padding:24px;color:#111;line-height:1.6;">
<div style="max-width:560px;margin:0 auto;background:#fff;padding:32px;border-radius:8px;font-size:16px;">
${bodyMarkup}
<hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;">
<p style="font-size:13px;color:#888;margin:0;">You are receiving this because a checkout session expired without completing. If that wasn't you, or you would prefer to stop hearing from me, <a href="${unsubscribeUrl}" style="color:#888;">one-click unsubscribe</a>.</p>
</div></body></html>`;
}

function pTextLink(href: string, label: string): string {
  return `${label}: ${href}`;
}

// ── Email 1 — Day 0, inline on enrolment ─────────────────────────────────────

function renderEmail1(ctx: RenderContext, unsubscribeUrl: string): RenderedEmail {
  const door = PRICE_HEADLINE[ctx.priceType];
  const shortRef = PRICE_SHORT_REF[ctx.priceType];
  const resume = `${ctx.baseUrl}${resumePath(ctx.priceType)}`;

  const subject = `${door[0].toUpperCase() + door.slice(1)} is still open`;

  const text = `I saw you click. Then I saw the click not finish. That happens.

The door stays open.

I am not going to chase you. I just wanted to tell you that ${door} is exactly where you left it — same page, same offer, same 60-day guarantee. If today is not the day, that is fine. If it is, here is the link:

${resume}

That is all for this one. The next note is in two days.

— Maryan

PS — replying to this email reaches my actual inbox. Not a help desk. If something on ${shortRef} was unclear or felt off, I want to hear what.

${pTextLink(unsubscribeUrl, "Unsubscribe")}`;

  const html = htmlWrap(
    `<p>I saw you click. Then I saw the click not finish. That happens.</p>
<p>The door stays open.</p>
<p>I am not going to chase you. I just wanted to tell you that <strong>${door}</strong> is exactly where you left it — same page, same offer, same 60-day guarantee. If today is not the day, that is fine. If it is, here is the link:</p>
<p><a href="${resume}" style="color:#0a7;font-weight:600;">${resume}</a></p>
<p>That is all for this one. The next note is in two days.</p>
<p>— Maryan</p>
<p style="color:#555;font-size:14px;"><em>PS — replying to this email reaches my actual inbox. Not a help desk. If something on ${shortRef} was unclear or felt off, I want to hear what.</em></p>`,
    unsubscribeUrl,
  );

  return { subject, text, html };
}

// ── Email 2 — Day 2 ──────────────────────────────────────────────────────────

function renderEmail2(ctx: RenderContext, unsubscribeUrl: string): RenderedEmail {
  const shortRef = PRICE_SHORT_REF[ctx.priceType];
  const resume = `${ctx.baseUrl}${resumePath(ctx.priceType)}`;
  const story = storyFor(ctx.diagnosticLabel);

  const subject = "Five-time clickers";

  const text = `${story}

That is the pattern. The thing that finally moves a five-time clicker is not another email about price. It is one more look at what the inside actually does.

If you want that look, ${shortRef} is here:

${resume}

If you do not, that is also fine. One more note from me, on Day 7. Then I am done.

— Maryan

${pTextLink(unsubscribeUrl, "Unsubscribe")}`;

  const html = htmlWrap(
    `<p>${story}</p>
<p>That is the pattern. The thing that finally moves a five-time clicker is not another email about price. It is one more look at what the inside actually does.</p>
<p>If you want that look, ${shortRef} is here:</p>
<p><a href="${resume}" style="color:#0a7;font-weight:600;">${resume}</a></p>
<p>If you do not, that is also fine. One more note from me, on Day 7. Then I am done.</p>
<p>— Maryan</p>`,
    unsubscribeUrl,
  );

  return { subject, text, html };
}

// ── Email 3 — Day 7 ──────────────────────────────────────────────────────────

function renderEmail3(ctx: RenderContext, unsubscribeUrl: string): RenderedEmail {
  const shortRef = PRICE_SHORT_REF[ctx.priceType];
  const resume = `${ctx.baseUrl}${resumePath(ctx.priceType)}`;
  const diagnostic = `${ctx.baseUrl}/diagnostic`;

  const subject = "Last note from me, and a question";

  const text = `I am not going to email you about this again. Not because I am playing hard-to-get — because nobody wants to be chased by a piece of software.

If ${shortRef} is for you, you will know when. The door stays at the same price either way:

${resume}

If you are not sure whether the problem is the price or the product, the free diagnostic is here and it labels the actual gap in 90 seconds with no email gate this time:

${diagnostic}

And if you want to stay in the conversation without another purchase pitch, my Tuesday note (Seinfeld nurture, one short story per week) is the right place. Reply to this email with "yes" and I'll add you.

That is it. Thank you for getting this far.

— Maryan

${pTextLink(unsubscribeUrl, "Unsubscribe")}`;

  const html = htmlWrap(
    `<p>I am not going to email you about this again. Not because I am playing hard-to-get — because nobody wants to be chased by a piece of software.</p>
<p>If ${shortRef} is for you, you will know when. The door stays at the same price either way:</p>
<p><a href="${resume}" style="color:#0a7;font-weight:600;">${resume}</a></p>
<p>If you are not sure whether the problem is the price or the product, the free diagnostic is here and it labels the actual gap in 90 seconds with no email gate this time:</p>
<p><a href="${diagnostic}" style="color:#0a7;">${diagnostic}</a></p>
<p>And if you want to stay in the conversation without another purchase pitch, my Tuesday note (Seinfeld nurture, one short story per week) is the right place. Reply to this email with <strong>yes</strong> and I'll add you.</p>
<p>That is it. Thank you for getting this far.</p>
<p>— Maryan</p>`,
    unsubscribeUrl,
  );

  return { subject, text, html };
}

// ── dispatcher entry point ───────────────────────────────────────────────────

const RENDERERS: ReadonlyArray<
  (ctx: RenderContext, unsubscribeUrl: string) => RenderedEmail
> = [renderEmail1, renderEmail2, renderEmail3];

/**
 * Render the email at zero-based index. Caller is expected to pass an index
 * in [0, CART_RECOVERY_SEQUENCE_LENGTH).
 */
export function renderCartRecoveryEmail(
  index: number,
  ctx: RenderContext,
): RenderedEmail {
  const renderer = RENDERERS[index];
  if (!renderer) {
    throw new Error(`cart-recovery email index out of range: ${index}`);
  }
  const unsubscribeUrl = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  return renderer(ctx, unsubscribeUrl);
}
