/**
 * Soap Opera Sequence – 3 spine emails + 2 behavioral branches.
 *
 * Decision: strategy/decisions/sos-3-spine-2-branch.md
 * Brunson canon: strategy/workbooks/03-funnel-scripts.md (SOS),
 *               strategy/workbooks/04-building-your-funnels.md §5,
 *               strategy/workbooks/01-sales-funnel-secrets.md §6 Beat 3.
 *
 * Cadence:
 *   E1 – Set the stage (day 0) – Star + Backstory + Open Loop, no hard CTA.
 *   E2 – The wall (day 2)       – Drama + conflict; open the loop wider.
 *   E3 – Epiphany + offer (day 4) – Solution + Hidden Benefit + Logical
 *                                   Justification + CTA to /diagnostic.
 *
 *   Day 6 branches (one per subscriber, gated on E3 engagement):
 *     Branch A – soft_sell           – fires if E3 opened, not clicked.
 *     Branch B – objection_handler   – fires if E3 clicked, no buy.
 *
 * Personalisation:
 *   E1 (day 0) varies opener by `diagnosis`
 *     (wrong_person / weak_offer / weak_belief). Null = neutral opener.
 *     E2 / E3 / branches do NOT re-explain the diagnosis – the Reluctant
 *     Hero arc is the through-line, not a per-diagnosis tour.
 *
 *   FunnelFixer carry-over (source LIKE 'funnelfixer_%') replaces E1's
 *     opener with the rebrand bridge. The rest of the sequence is the
 *     same – the bridge only needs to reconcile the rename once.
 *
 * Voice rules (locked):
 *   – Reluctant Hero. Sign every email "– Maryan".
 *   – Story first. Offer at the bottom. Never lead with the pitch.
 *   – No em dash anywhere (en dash only). No yellow attention bars,
 *     no script fonts, no emoji.
 *   – Branch B quotes dollar-objections.md verbatim, then reframes.
 */

import { buildUnsubscribeUrl } from "./tokens";

/** Diagnostic labels stored in soap_opera_subscribers.diagnostic_result. */
export type DiagnosticResult = "wrong_person" | "weak_offer" | "weak_belief";

/**
 * Index space accepted by renderEmail. 0-based for the 3 spine emails
 * (0 = E1, 1 = E2, 2 = E3) plus the two named branches. The cron passes
 * the branch identifier directly; the spine index is the existing
 * emails_sent counter.
 */
export type SequenceIndex = 0 | 1 | 2 | "branch_a" | "branch_b";

interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

interface RenderContext {
  email: string;
  /** From soap_opera_subscribers.diagnostic_result. Null = non-diagnostic intake. */
  diagnosis: DiagnosticResult | null;
  /** Absolute origin of the app, e.g. https://unlocksaas.com */
  baseUrl: string;
  /**
   * Acquisition source. When it starts with 'funnelfixer_' (the carry-over
   * cohort from the discontinued FunnelFixer product), E1 renders the
   * rebrand bridge instead of the diagnosis/neutral opener.
   */
  source?: string | null;
}

// EMAIL 1 OPENER VARIANTS ----------------------------------------------------
const DIAGNOSIS_OPENER: Record<DiagnosticResult, string> = {
  wrong_person:
    "Your diagnosis came back: Wrong Person. Your copy speaks to a category, not a specific person. The visitor reads it and nods politely. They do not feel addressed. That is why the line stays flat.",
  weak_offer:
    "Your diagnosis came back: Weak Offer. Your page describes features. It does not promise a result with a guarantee. The visitor reads it and thinks, neat. Then they leave. That is why the line stays flat.",
  weak_belief:
    "Your diagnosis came back: Weak Belief. Your page assumes the visitor already believes the problem matters. They do not. They need the problem named before they care about the solution. That is why the line stays flat.",
};

const NEUTRAL_OPENER =
  "You landed on UnlockSaaS and walked away. Most people do. The page is honest about what it asks of you, which means it sells more slowly than something with a countdown timer screaming at you. I am okay with that. I want to tell you why I built it anyway.";

/**
 * Bridge opener for FunnelFixer carry-over subscribers. Replaces the
 * diagnosis/neutral opener of E1. The story body then continues with the
 * Blank Offer Page paragraphs unchanged, so the arc into E2 + E3 still
 * holds.
 */
function funnelfixerBridgeOpener(): string[] {
  return [
    "A few months back you signed up at FunnelFixer. I shut that product down.",
    "I noticed something while running it. Founders kept asking me to fix the funnel when the actual problem was upstream. Wrong customer, weak offer, or a story nobody believed yet. Building a slicker funnel on top of a broken foundation just made the leak louder. So I closed FunnelFixer and built UnlockSaaS – same operator, different scope. It is for post-launch pre-revenue founders, and it answers one question: which of the three is breaking your launch?",
    "Over the next four days I will walk you through how I worked it out on my own product, and how the same diagnosis applies to yours. If this is not for you, the unsubscribe link at the bottom is one click. No hard feelings.",
  ];
}

const PS_LINE_DIAGNOSTIC = (baseUrl: string) =>
  `When you want to see your own diagnosis in writing, the door is here: ${baseUrl}/diagnostic`;

const PS_LINE_STARTER = (baseUrl: string) =>
  `If you want to finish your WHO and WHAT for $1, the door is here: ${baseUrl}/starter`;

// SHARED HTML HELPERS --------------------------------------------------------
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
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;">${p
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p>`
    )
    .join("\n");
}

function buildFooter(unsubscribeUrl: string): { text: string; html: string } {
  return {
    text: `You're hearing from Maryan because you opted in at unlocksaas.com. One-click unsubscribe: ${unsubscribeUrl}`,
    html: `You're hearing from Maryan because you opted in at <a href="https://unlocksaas.com" style="color:#888;">unlocksaas.com</a>. <a href="${unsubscribeUrl}" style="color:#888;">One-click unsubscribe</a>.`,
  };
}

function render({
  subject,
  bodyParagraphs,
  ps,
  ctx,
}: {
  subject: string;
  bodyParagraphs: string[];
  ps: string;
  ctx: RenderContext;
}): RenderedEmail {
  const unsubscribeUrl = buildUnsubscribeUrl(ctx.email, ctx.baseUrl);
  const footer = buildFooter(unsubscribeUrl);

  const fullParagraphs = [...bodyParagraphs, `PS: ${ps}`, "– Maryan"];

  const text = `${fullParagraphs.join("\n\n")}\n\n---\n${footer.text}\n`;

  const html = htmlShell(paragraphsToHtml(fullParagraphs), footer.html);

  return { subject, text, html };
}

// E1 (Day 0) – Star + Backstory + Open Loop ---------------------------------
//
// Hint of big promise. No hard CTA – end on the cliffhanger that something
// changed. PS points at the diagnostic (warm path) so curious readers can
// see their own version of the story without selling them anything yet.
function email1(ctx: RenderContext): RenderedEmail {
  const isFunnelfixerCarryover =
    typeof ctx.source === "string" && ctx.source.startsWith("funnelfixer_");

  if (isFunnelfixerCarryover) {
    return render({
      subject: "I shut down FunnelFixer. Here is what replaced it.",
      bodyParagraphs: [
        ...funnelfixerBridgeOpener(),
        "I sat down one night to write the offer for this product. I had features for days. I had traffic tactics for days. I opened a blank doc and tried to write one sentence: who this is for, and what it does for them. I stared at it for forty minutes and produced nothing.",
        "That was the night I realised I had been building a beautiful thing for no one in particular.",
        "If you cannot write your offer in one sentence, to one real person, you have not earned the right to build the product. I had not. I do not think you have either, yet.",
        "Tomorrow I will tell you the day this stopped being a thought experiment for me. The day a small cold voice in the back of my head finally said the thing out loud.",
      ],
      ps: PS_LINE_DIAGNOSTIC(ctx.baseUrl),
      ctx,
    });
  }

  const opener = ctx.diagnosis ? DIAGNOSIS_OPENER[ctx.diagnosis] : NEUTRAL_OPENER;
  return render({
    subject: "Your diagnosis is below. Here is what nobody told you about it.",
    bodyParagraphs: [
      opener,
      "Here is what nobody told you about it.",
      "I sat down one night to write the offer for this product. I had features for days. I had traffic tactics for days. I opened a blank doc and tried to write one sentence: who this is for, and what it does for them. I stared at it for forty minutes and produced nothing.",
      "That was the night I realised I had been building a beautiful thing for no one in particular.",
      "If you cannot write your offer in one sentence, to one real person, you have not earned the right to build the product. I had not. I do not think you have either, yet. That is what the diagnosis is really telling you.",
      "Tomorrow I will tell you the day this stopped being a thought experiment for me. The day a small cold voice in the back of my head finally said the thing out loud.",
    ],
    ps: PS_LINE_DIAGNOSTIC(ctx.baseUrl),
    ctx,
  });
}

// E2 (Day 2) – The Wall ------------------------------------------------------
//
// Drama and conflict. The moment things almost failed. Open the loop wider
// by hinting that the epiphany came right after this scene.
function email2(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "I had to mute the call and walk around the room.",
    bodyParagraphs: [
      "For about a year my evenings looked the same.",
      "Day job done. Dinner done. Laptop open. Refresh Stripe. Same number. Tweak one small thing. Call it progress. Close the laptop.",
      "Technically I was working on my business every single night. I had nothing to show for any of it. That ritual was not work. It was a way to feel like I was not failing.",
      "Halfway through last winter I started talking to other founders. Really talking. Not the polite version. More than ten of them. Each conversation was a mirror. Same flat Stripe line. Same shelf of half-built products. Same frantic faith that the next launch would be the one.",
      "Halfway through call six I had to mute, get up, and walk around the room. A small cold voice said: that is you. He is describing you.",
      "I want to be honest about what happened next. I almost quit. I sat with the laptop closed for three days. The voice that had said the polite ritual was work for a year had a much louder cousin, and that cousin was telling me to put the whole thing down.",
      "The next email is the one where I tell you what I did instead, and why it changed the diagnosis from a label on a page into a thing I could actually fix.",
    ],
    ps: PS_LINE_DIAGNOSTIC(ctx.baseUrl),
    ctx,
  });
}

// E3 (Day 4) – Epiphany + Offer + Guarantee ---------------------------------
//
// The solution unveiled. Hidden Benefit (the guarantee inverts the bet)
// + Logical Justification (your downside is capped). Single warm CTA to
// /diagnostic, so people who haven't taken it yet land in the canonical
// front door. Branches handle the people who clicked but didn't buy.
function email3(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Your first paying customer, in writing, or you do not pay.",
    bodyParagraphs: [
      "Two emails in. Here is the part I owe you, plainly.",
      "After the call I muted, I did the one thing I had been refusing to do for a year. I picked one named person and wrote one promise to them, in one sentence. The diagnosis stopped being a label and turned into a checklist I could finish.",
      "Out of that came the offer underneath UnlockSaaS, and the only contract that makes sense for a tool that claims it can fix a flat Stripe line:",
      "Your first paying customer, verified by Stripe, within 60 days. Or full refund. In writing.",
      "Not your first signup. Not your first 'this is awesome' comment. A charge in Stripe. That is the only proof I will count, and it is the only proof you should count either.",
      "What you get inside the $49 Playbook: seven steps that pin your dream customer to one named person, build the offer, write the voice, write the copy, generate a real 20-target outreach list from a Dream 100 curated for your niche, track every send, and listen for the first Stripe charge that closes your guarantee. The Verified Builders community sits alongside it – other non-engineers who shipped, the mirror that worked for me. The 60-day clock is visible in the header from the moment you start.",
      "The hidden benefit nobody pitches when they sell you a course: if the work the Playbook asks of you does not produce a charge, you do not pay. The downside is capped at $98. Most founders I built this for spend more than that on tools they have not opened this month.",
      "If you have not run your diagnosis yet, that is the cleanest place to start. It is free and it tells you which of the three is breaking your launch before you spend a dollar with me.",
    ],
    ps: PS_LINE_DIAGNOSTIC(ctx.baseUrl),
    ctx,
  });
}

// BRANCH A (Day 6) – soft_sell ----------------------------------------------
//
// Fires when E3 was opened but not clicked. Hypothesis: they read the
// email, the offer didn't land enough to click, they're still warm. We
// don't push, we lower the bar: "maybe you missed this," one link, one
// soft frame.
function branchSoftSell(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "In case the last one got buried.",
    bodyParagraphs: [
      "Inboxes are loud. The last email probably landed at a bad moment, or in a folder you don't check, or right between two Slack pings.",
      "I am not going to retell the whole arc. The short version: I spent a year doing the polite ritual of looking like I was working on my product, and the only thing that broke me out of it was finally writing my offer to one named person.",
      "If your Stripe line is still flat, the diagnostic at the link below is the cleanest first move. It is free, it takes a minute, and it tells you which of the three (wrong person, weak offer, weak belief) is the thing actually keeping the line flat. No payment, no upsell on the result page itself – just the diagnosis in writing so you can decide what to do next.",
      "If you already ran it and you closed the result tab without doing anything with it, this is your nudge to open it again.",
    ],
    ps: PS_LINE_DIAGNOSTIC(ctx.baseUrl),
    ctx,
  });
}

// BRANCH B (Day 6) – objection_handler --------------------------------------
//
// Fires when E3 was clicked but no Stripe charge landed. Hypothesis: they
// landed on /diagnostic or /starter, looked at the offer, and stalled on
// a real objection. We pull the top 3 dollar-objection categories from
// strategy/dollar-objections.md (Subscription Fatigue, Cash Constraint,
// Burned by Gurus) and rebut them verbatim-quote-then-reframe. End on
// the guarantee + a /starter CTA – they're already past curious.
function branchObjectionHandler(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Three things I bet stopped you on the offer page.",
    bodyParagraphs: [
      "You opened the offer. You did not pull the trigger. That is the right move on most days, with most things sold to founders. So I am going to do the unfair thing and answer the three objections that almost certainly stopped you, in the language other founders have already used in public.",
      "1. \"I am personally so over the subscription model.\" – Bpve, Indie Hackers. Fair. The $1 Starter is one-time. You can finish your WHO and your WHAT, ship the work, and walk away without ever touching a recurring charge. The $49 Playbook is monthly because the 60-day guarantee needs a billing cycle to live on – not because I want you locked in. If you finish in 30 days, cancel in 30 days. You still own everything you built inside.",
      "2. \"Every dollar counts when we're building and growing our businesses.\" – Cleme, Indie Hackers. Also fair. So I capped your downside at $98, not $49. Two months on the Playbook is the maximum cost of being wrong about me. If no Stripe charge lands in 60 days AND you completed the in-product milestones, you ask, I refund. No call, no survey, no retention email. The contract is in writing on the sales page.",
      "3. \"I blindly followed a lot of advice given out by gurus online, but that was a costly mistake.\" – author of an Indie Hackers post on 3 years to $5k MRR. The single most important thing I can say: this is not a course. A course makes you smarter. A coach makes you accountable. Neither does the work. The Playbook is a workspace – outreach gets sent inside it, Stripe pings it when your first customer pays. What it produces is a verified charge in your account, not a finished worksheet. If you complete the seven steps and no charge lands, the guarantee fires. No course offers that because no course can.",
      "If any one of those three was the real reason you closed the tab, the answer is already inside the offer. Re-read the guarantee section in particular – it is the part that exists specifically because I built this for the version of me from last year, who would not have bought a subscription tool with no risk reversal either.",
    ],
    ps: PS_LINE_STARTER(ctx.baseUrl),
    ctx,
  });
}

// PUBLIC API -----------------------------------------------------------------

/**
 * Number of spine emails (excludes branches). The cron uses this to gate
 * the day-0/2/4 progression on emails_sent.
 */
export const SPINE_LENGTH = 3;

const SPINE = [email1, email2, email3] as const;

const BRANCHES = {
  branch_a: branchSoftSell,
  branch_b: branchObjectionHandler,
} as const;

/**
 * Render the email at the given index. For spine emails pass 0..2;
 * for branches pass the named identifier. Throws on out-of-range index.
 */
export function renderEmail(
  index: SequenceIndex,
  ctx: RenderContext
): RenderedEmail {
  if (typeof index === "number") {
    const fn = SPINE[index];
    if (!fn) {
      throw new Error(`No Soap Opera spine email at index ${index}`);
    }
    return fn(ctx);
  }
  const branchFn = BRANCHES[index];
  if (!branchFn) {
    throw new Error(`No Soap Opera branch named ${index}`);
  }
  return branchFn(ctx);
}
