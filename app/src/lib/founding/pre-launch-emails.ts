/**
 * Pre-Launch Email Sequence for the Founding-Cohort PLF.
 *
 * Workbook 03 Script 8 (revised 2026-05-17). The sequence has 6 emails:
 *
 *   PLE1 (D-14): Engagement — ask one question, no sale, no video.
 *   PLE2 (D-10): Anticipation — PLV1 ("The Door That Opened") drops.
 *   PLE3 (D-7):  Anticipation — PLV2 ("How the Machine Actually Works") drops.
 *   PLE4 (D-3):  Anticipation — PLV3 ("What It Looks Like on the Inside") drops.
 *   PLE5 (D-0):  Cart-open — the 50 seats are open.
 *   PLE6 (D+7 OR cap): Cart-close — last call or closure.
 *
 * Voice: Reluctant Hero from workbook 01 Section 6, identical to the
 * homepage hero, the $1 Starter page, and the Soap Opera Sequence. Signed
 * "— Maryan". From maryan@unlocksaas.com per email-identity memory.
 *
 * Pacing: each email is short. Brunson rule: PLF emails are not novellas.
 * The Reluctant Hero voice carries; we never lecture. Story first, link
 * second, PS at the bottom.
 */

import { buildUnsubscribeUrl } from "@/lib/soap-opera/tokens";

export const FOUNDING_SEQUENCE_LENGTH = 6;

export interface FoundingEmailContext {
  email: string;
  baseUrl: string;
  /** Used in PLE5/PLE6 to render a live "X of 50" count. */
  seatsClaimed?: number;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function htmlShell(bodyParagraphs: string[], unsubscribeUrl: string): string {
  const paragraphs = bodyParagraphs
    .map((p) => `<p style="margin:0 0 16px 0;line-height:1.55;color:#1f2937">${p}</p>`)
    .join("");
  return `<!doctype html>
<html><body style="margin:0;padding:32px 16px;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1f2937">
<div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px;border-radius:12px;border:1px solid #e5e7eb">
${paragraphs}
<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
<p style="margin:0;font-size:12px;color:#6b7280">
You signed up for the founding-cohort waitlist at unlocksaas.com.
<a href="${unsubscribeUrl}" style="color:#6b7280">Unsubscribe</a>.
</p>
</div></body></html>`;
}

function paraToText(paragraphs: string[]): string {
  return paragraphs.map((p) => stripHtml(p)).join("\n\n");
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}

// ---------------------------------------------------------------------------
// PLE1 — Engagement (D-14)
// ---------------------------------------------------------------------------

function renderPLE1(ctx: FoundingEmailContext): RenderedEmail {
  const unsub = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const paragraphs = [
    "Thanks for putting your name on the waitlist.",
    "I am about to open a door for 50 founders. Before I do, I want to ask you one thing.",
    "What does your Stripe dashboard look like right now? One sentence is fine. &ldquo;Flat for four months.&rdquo; &ldquo;Three customers I do not know how I got.&rdquo; &ldquo;Nothing yet.&rdquo; Anything honest.",
    "Hit reply. I read everything personally — that is part of what makes this work.",
    "First video drops in four days.",
    "&mdash; Maryan",
    "<em style=\"color:#6b7280\">PS: This is a real waitlist, not a fake one. I am opening 50 seats on a specific day, and once they are claimed the founding bonuses are gone forever. More on that next week.</em>",
  ];
  return {
    subject: "Before I open the door, I have one question.",
    text: paraToText(paragraphs),
    html: htmlShell(paragraphs, unsub),
  };
}

// ---------------------------------------------------------------------------
// PLE2 — PLV1 drops (D-10)
// ---------------------------------------------------------------------------

function renderPLE2(ctx: FoundingEmailContext): RenderedEmail {
  const unsub = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const plv1 = `${ctx.baseUrl}/founding/v1`;
  const paragraphs = [
    "Six minutes. Coffee in hand.",
    `<a href="${plv1}" style="color:#0f172a;font-weight:600">The Door That Opened &mdash; watch PLV1.</a>`,
    "It is the story I owe you before I show you the product. Why I built this. What I think the actual bottleneck is now that AI has moved the building part. Who I think this is for and who it is not for.",
    "If you want to know whether you are in the right room, this is the video that answers that question.",
    "PLV2 drops Wednesday. That one shows you the Machine itself, step by step.",
    "&mdash; Maryan",
    "<em style=\"color:#6b7280\">PS: Did you reply to my last email? I read all the answers and reply when there is something useful to say. If something in the video stops you, hit reply.</em>",
  ];
  return {
    subject: "The Door That Opened.",
    text: paraToText(paragraphs),
    html: htmlShell(paragraphs, unsub),
  };
}

// ---------------------------------------------------------------------------
// PLE3 — PLV2 drops (D-7)
// ---------------------------------------------------------------------------

function renderPLE3(ctx: FoundingEmailContext): RenderedEmail {
  const unsub = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const plv2 = `${ctx.baseUrl}/founding/v2`;
  const paragraphs = [
    "Today I show you the Machine.",
    `<a href="${plv2}" style="color:#0f172a;font-weight:600">How the Machine Actually Works &mdash; watch PLV2.</a>`,
    "Seven steps. In order. The engine refuses to advance until you finish each one. That is not a UX choice. That is the entire mechanism.",
    "The video walks through every step with screen recordings of the real product. I spend most of the time on step 5 because that is where every other tool quits and where mine does something nobody else does.",
    "Watch it. If you have a question while you are watching, hit reply.",
    "PLV3 drops Sunday. That one shows you the inside &mdash; what it looks like to actually own this and be a Verified Builder. And I tell you when the door opens.",
    "&mdash; Maryan",
  ];
  return {
    subject: "How the Machine actually works (and where every other tool quits).",
    text: paraToText(paragraphs),
    html: htmlShell(paragraphs, unsub),
  };
}

// ---------------------------------------------------------------------------
// PLE4 — PLV3 drops (D-3)
// ---------------------------------------------------------------------------

function renderPLE4(ctx: FoundingEmailContext): RenderedEmail {
  const unsub = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const plv3 = `${ctx.baseUrl}/founding/v3`;
  const paragraphs = [
    "Last video before the door opens.",
    `<a href="${plv3}" style="color:#0f172a;font-weight:600">What It Looks Like on the Inside &mdash; watch PLV3.</a>`,
    "I read the manifesto out loud. I show you the actual refund button. I show you the badge that fires when Stripe sees your first paying customer. And I tell you exactly when the door opens.",
    "Short version: Wednesday, 9am Pacific. 50 founding seats. Same $49 a month as the eventual evergreen price &mdash; no discount. The bonus is that your $49 is locked for the life of your subscription. It will not go up. Other people&rsquo;s eventually will.",
    "Two more bonuses: a Founding variant of the Verified Builder badge (different frame, public history), and my email address for 30 days &mdash; me, replying within one business day, not a help desk.",
    "After 50 seats or 7 days, the founding bonuses retire forever. Same product, same price, just without the lock and the badge and the direct line.",
    "If you want a seat, watch the video. The cart-open email lands in your inbox Wednesday at 9.",
    "&mdash; Maryan",
  ];
  return {
    subject: "What it looks like on the inside.",
    text: paraToText(paragraphs),
    html: htmlShell(paragraphs, unsub),
  };
}

// ---------------------------------------------------------------------------
// PLE5 — Cart-open (D-0)
// ---------------------------------------------------------------------------

function renderPLE5(ctx: FoundingEmailContext): RenderedEmail {
  const unsub = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const founding = `${ctx.baseUrl}/founding`;
  const claimed = ctx.seatsClaimed ?? 0;
  const remaining = Math.max(0, 50 - claimed);
  const paragraphs = [
    `The door is open. ${claimed} of 50 seats claimed, ${remaining} remaining.`,
    `<a href="${founding}" style="color:#0f172a;font-weight:600">Claim a Founding Verified Builder seat for $49/mo.</a>`,
    "Here is what comes in the door with you. The Machine &mdash; seven steps, engine pushback, framework into the engine. The 60-day guarantee &mdash; Stripe-verified first paying customer or you do not pay, capped at $98. The Outreach Room. The 14-Day First-Customer Sprint. The Script Kit.",
    "And the three things that only happen during this 7-day window. Your $49 a month, locked for life. The Founding badge variant. My email for 30 days.",
    "$496 of work, tools, and community for $49 a month. Plus a $720 lifetime price-lock if you are in the founding 50. With a written 60-day guarantee.",
    "Cart closes in 7 days or when seats are gone, whichever comes first.",
    "&mdash; Maryan",
    "<em style=\"color:#6b7280\">PS: I will send one more email when 5 seats remain or 6 hours remain, whichever comes first. After that, this sequence is done and the founding bonuses are gone. The product stays at $49 a month evergreen.</em>",
  ];
  return {
    subject: "The 50 Founding Verified Builder seats are open.",
    text: paraToText(paragraphs),
    html: htmlShell(paragraphs, unsub),
  };
}

// ---------------------------------------------------------------------------
// PLE6 — Cart-close (D+7 OR cap)
// ---------------------------------------------------------------------------

function renderPLE6(ctx: FoundingEmailContext): RenderedEmail {
  const unsub = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const founding = `${ctx.baseUrl}/founding`;
  const starter = `${ctx.baseUrl}/starter`;
  const claimed = ctx.seatsClaimed ?? 0;
  const remaining = Math.max(0, 50 - claimed);
  const capReached = remaining === 0;

  if (capReached) {
    const paragraphs = [
      "50 of 50 claimed.",
      "The founding cohort is full. The door is now closed for the lifetime price lock, the founding badge variant, and the 30-day direct line.",
      "The Machine itself is still $49 a month and still carries the 60-day Stripe-verified guarantee. If you were waiting for a sign, that is the sign &mdash; product without the founding bonuses, same promise.",
      `<a href="${starter}" style="color:#0f172a;font-weight:600">Start the Machine for $1.</a>`,
      "Two steps for a dollar. Same engine. Yours to keep.",
      "If you want to know who got in, I will send a one-time email when the Founding 50 page goes live. That is the only thing left to do on this list.",
      "&mdash; Maryan",
    ];
    return {
      subject: "50 of 50 claimed.",
      text: paraToText(paragraphs),
      html: htmlShell(paragraphs, unsub),
    };
  }

  // Variant A — seats still available, last-call
  const paragraphs = [
    `${remaining} of 50 left. The door closes in less than 24 hours.`,
    `<a href="${founding}" style="color:#0f172a;font-weight:600">Claim a Founding seat.</a>`,
    "After the close, the product stays at $49 a month evergreen, but the price lock, the Founding badge, and my 30-day direct line are gone for good. No second cohort.",
    "If you are reading this and you have been thinking about it for three videos and five emails, that thinking is the thing the Machine treats. The door is right there.",
    "&mdash; Maryan",
  ];
  return {
    subject: `${remaining} of 50 left — door closes in 24 hours.`,
    text: paraToText(paragraphs),
    html: htmlShell(paragraphs, unsub),
  };
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

const RENDERERS: Array<(ctx: FoundingEmailContext) => RenderedEmail> = [
  renderPLE1,
  renderPLE2,
  renderPLE3,
  renderPLE4,
  renderPLE5,
  renderPLE6,
];

/**
 * Renders email at the given zero-based index. Index 0 = PLE1, index 5 = PLE6.
 */
export function renderFoundingEmail(
  index: number,
  ctx: FoundingEmailContext
): RenderedEmail {
  if (index < 0 || index >= FOUNDING_SEQUENCE_LENGTH) {
    throw new Error(`founding_email_index_out_of_range: ${index}`);
  }
  return RENDERERS[index](ctx);
}
