/**
 * 5-Email Soap Opera Sequence — full copy.
 *
 * Spec: strategy/workbooks/04-building-your-funnels.md §5.
 * Parables: strategy/workbooks/01-sales-funnel-secrets.md §6 Beat 3.
 * Hook #8: strategy/workbooks/01-sales-funnel-secrets.md §5.
 *
 * Rules from workbook 04 §5:
 *   - Story first. Offer at the bottom. Never lead with the pitch.
 *   - Reluctant Hero voice. Sign every email "— Maryan".
 *   - PS line drives to /starter on every email.
 *
 * Personalisation:
 *   - Email 1 (Day 0) varies its opener by `diagnosis`
 *     (wrong_person / weak_offer / weak_belief). If diagnosis is null the
 *     subscriber came from a non-diagnostic surface (funnel hub etc.) and
 *     gets the neutral opener. All other emails are the same across
 *     diagnoses — by design, the Soap Opera is about the Reluctant Hero
 *     arc, not about re-explaining the diagnosis.
 */

import { buildUnsubscribeUrl } from "./tokens";

/** Diagnostic labels stored in soap_opera_subscribers.diagnostic_result. */
export type DiagnosticResult = "wrong_person" | "weak_offer" | "weak_belief";

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
}

// ── opener variants (Email 1 only) ──────────────────────────────────────────
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

const PS_LINE_DEFAULT = (baseUrl: string) =>
  `If you want to finish your WHO and WHAT for $1, the door is here: ${baseUrl}/starter`;

const PS_LINE_FINAL = (baseUrl: string) =>
  `Start at $1 here: ${baseUrl}/starter — upgrade to the full Machine on the next page. The clock starts when you click.`;

// ── shared HTML helpers ─────────────────────────────────────────────────────
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

  const fullParagraphs = [...bodyParagraphs, `PS: ${ps}`, "— Maryan"];

  const text = `${fullParagraphs.join("\n\n")}\n\n---\n${footer.text}\n`;

  const html = htmlShell(paragraphsToHtml(fullParagraphs), footer.html);

  return { subject, text, html };
}

// ── EMAIL 1 (Day 0): Diagnosis + Parable 1 (Blank Offer Page) ───────────────
function email1(ctx: RenderContext): RenderedEmail {
  const opener = ctx.diagnosis ? DIAGNOSIS_OPENER[ctx.diagnosis] : NEUTRAL_OPENER;
  return render({
    subject: "Your diagnosis is below. Here is what nobody told you about it.",
    bodyParagraphs: [
      opener,
      "Here is what nobody told you about it.",
      "I sat down one night to write the offer for this product. I had features for days. I had traffic tactics for days. I opened a blank doc and tried to write one sentence: who this is for, and what it does for them. I stared at it for forty minutes and produced nothing.",
      "That was the night I realised I had been building a beautiful thing for no one in particular.",
      "If you cannot write your offer in one sentence, to one real person, you have not earned the right to build the product. I had not. I do not think you have either, yet. That is what the diagnosis is really telling you.",
      "The fix is not another feature. It is the work I had been skipping. Naming one person. Writing one promise.",
    ],
    ps: PS_LINE_DEFAULT(ctx.baseUrl),
    ctx,
  });
}

// ── EMAIL 2 (Day 1): Parable 2 (Stripe Refresh) ─────────────────────────────
function email2(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day done. Dinner done. Laptop open. Refresh Stripe.",
    bodyParagraphs: [
      "For about a year my evenings looked the same.",
      "Day job done. Dinner done. Laptop open. Refresh Stripe. Same number. Tweak one small thing. Call it progress. Close the laptop.",
      "Technically I was working on my business every single night. I had nothing to show for any of it.",
      "That ritual was not work. It was a way to feel like I was not failing.",
      "The most expensive part was not the lost income. It was the year I spent telling myself I was doing the work, when the actual work — naming a person, writing an offer, sending a message — sat untouched on a different tab I never opened.",
      "If any of this sounds like your last six months, you are not lazy. You are not behind. You are doing the most respectable form of avoidance there is, the one nobody, including you, can call out.",
    ],
    ps: PS_LINE_DEFAULT(ctx.baseUrl),
    ctx,
  });
}

// ── EMAIL 3 (Day 2): Parable 4 (Mirror in Ten Founders) ─────────────────────
function email3(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "I had to mute the call and walk around the room.",
    bodyParagraphs: [
      "I started talking to other founders. Really talking. Not the polite version. More than ten of them.",
      "Each conversation was a mirror. Same flat Stripe line. Same shelf of half-built products. Same frantic faith that the next launch would be the one.",
      "Halfway through call six I had to mute, get up, and walk around the room. A small cold voice said: that is you. He is describing you.",
      "You will not see your own pattern until you hear it in someone else's mouth. That is the part I keep coming back to. I had read every framework. I had taken the courses. None of it landed until I sat across from a person who was me, eighteen months ahead, telling my own story back to me.",
      "If you are building in isolation and your Stripe is flat, the missing input is not another tactic. It is ten founders, in real conversations, where you stop performing.",
      "Inside the $1 Starter, after you finish Steps 1 and 2, the Machine points you at the Outreach Room — a real list of real founders, picked for you, the ones who will mirror you back.",
    ],
    ps: PS_LINE_DEFAULT(ctx.baseUrl),
    ctx,
  });
}

// ── EMAIL 4 (Day 3): Parable 5 (Door That Opened) + Polarity FOR #2 ─────────
function email4(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Why now is different (for non-engineers especially).",
    bodyParagraphs: [
      "For most of my life, building software was a door that stayed closed.",
      "I am not an engineer. I have never written a line of production code. I had quietly made peace with being the one with ideas, never the one who builds.",
      "Then it was 2026. Lovable and Claude opened the door. I shipped real products in weeks. The shipping part felt like magic. I assumed the rest would follow. It did not.",
      "Here is what changed and what did not.",
      "What changed: building is solved. A non-engineer with a clear head can ship something real in a weekend. The bottleneck moved.",
      "What did not change: selling. The work of naming one person, writing one promise, sending the message. That work was always the bottleneck. It is just exposed now, because the build is no longer there to hide behind.",
      "Every funnel guru on the internet quietly assumes you can code. Most marketing tools assume it too. If you are a non-engineer who already shipped, you are in the strangest position: the hardest part is done, and the entire industry that teaches the rest of it speaks a language that excludes you.",
      "The Machine is the one I wish someone had handed me when I was on that side of the door.",
    ],
    ps: PS_LINE_DEFAULT(ctx.baseUrl),
    ctx,
  });
}

// ── EMAIL 5 (Day 4): Hook #8 expanded + Guarantee + Stack ───────────────────
function email5(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Your first paying customer, in writing, or you do not pay.",
    bodyParagraphs: [
      "Four emails in. Here is the offer, plainly.",
      "Your first paying customer, verified by Stripe, within 60 days. Or full refund. In writing.",
      "Not your first signup. Not your first 'this is awesome' comment. A charge in Stripe. That is the only proof I will count, and it is the only proof you should count either.",
      "What you get for $49 a month:",
      "— The Machine. Seven steps. Step 1 pins your dream customer to one named person. Step 2 builds the offer. Step 3 writes the voice. Step 4 writes the copy. Step 5 generates a real 20-target outreach list from a Dream 100 curated for your niche. Step 6 tracks every send. Step 7 listens for the first Stripe charge that closes your guarantee.",
      "— The Verified Builders community. Other non-engineers who shipped. The mirror that worked for me.",
      "— The 60-day clock, visible in the app header from the moment you start. No surprises. No fine print.",
      "The guarantee mechanics: you do the work the Machine asks of you — pin the customer, lock the offer, send the 20 outreach messages it generates. If no Stripe charge arrives in 60 days, you ask, I refund. No call. No survey. No retention email.",
      "If you have not shipped anything yet, this is not for you. Go ship first. Come back when your Stripe is flat.",
      "If you have shipped, and the line is flat, and you have been refreshing it for months — this is the door I built for the version of me from last year.",
    ],
    ps: PS_LINE_FINAL(ctx.baseUrl),
    ctx,
  });
}

const SEQUENCE = [email1, email2, email3, email4, email5] as const;

/**
 * Render the email at the given zero-based index (0 = Day 0 = Email 1).
 * Throws if index is out of bounds.
 */
export function renderEmail(
  index: number,
  ctx: RenderContext
): RenderedEmail {
  const fn = SEQUENCE[index];
  if (!fn) {
    throw new Error(`No Soap Opera email at index ${index}`);
  }
  return fn(ctx);
}

export const SEQUENCE_LENGTH = SEQUENCE.length;
