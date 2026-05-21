/**
 * 14-Day First-Customer Sprint Challenge — full email copy.
 *
 * Spec: strategy/workbooks/04-building-your-funnels.md §10 (Challenge Funnel)
 * + DotCom Secrets Secret #19 (Challenge Funnel).
 *
 * 15 emails total:
 *   - index 0  = Day 0  (welcome, sent inline on subscribe)
 *   - index 1  = Day 1  (One Real Person, story 1 — Blank Offer Page)
 *   - index 2  = Day 2  (Quote Them, story 4 — Mirror in Ten Founders)
 *   - index 3  = Day 3  (The Stripe Refresh, story 2)
 *   - index 4  = Day 4  (One Real Promise, Vehicle Story)
 *   - index 5  = Day 5  (The Math of Defence, Skeptic Avatar)
 *   - index 6  = Day 6  (The Remedy, Internal Belief Rewrite #1)
 *   - index 7  = Day 7  (The First List — 20 names, Dream 100 mini)
 *   - index 8  = Day 8  (The First Message, story 3 — SEO Escape Hatch)
 *   - index 9  = Day 9  (Send the First Five)
 *   - index 10 = Day 10 (Triage the Replies, Internal Belief Rewrite #4)
 *   - index 11 = Day 11 (Send the Next Ten — different congregation)
 *   - index 12 = Day 12 (The Hard Five — the ones you've been avoiding)
 *   - index 13 = Day 13 (One Real Conversation, story 5 — Door That Opened)
 *   - index 14 = Day 14 (Sprint Complete + $1 Starter, Hook #8 verbatim)
 *
 * Rules from workbook 04 §5 (carried over):
 *   - Story first. Action at the bottom. Never lead with the pitch.
 *   - Reluctant Hero voice. Sign every email "— Maryan".
 *   - Each email asks for ONE reply. Reply = engagement signal.
 *   - Only Day 14 carries the $1 Starter CTA. Earned, not snuck in.
 *
 * Personalisation: greets by `firstName`. No diagnosis branching (the
 * Challenge is its own surface and does not inherit from the diagnostic).
 */

import { buildUnsubscribeUrl } from "../soap-opera/tokens";

interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

interface RenderContext {
  email: string;
  firstName: string;
  /** Absolute origin of the app, e.g. https://unlocksaas.com */
  baseUrl: string;
}

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
    text: `You're getting these because you opted into the 14-Day Sprint at unlocksaas.com. One-click unsubscribe: ${unsubscribeUrl}`,
    html: `You're getting these because you opted into the 14-Day Sprint at <a href="https://unlocksaas.com" style="color:#888;">unlocksaas.com</a>. <a href="${unsubscribeUrl}" style="color:#888;">One-click unsubscribe</a>.`,
  };
}

/** Strip out a usable first-name salutation; fall back to a generic opener. */
function greeting(firstName: string): string {
  const trimmed = firstName.trim();
  if (!trimmed) return "Hey,";
  // ASCII + Latin-1 Supplement + Latin Extended-A covers the names most likely
  // to come through the funnel (English + most European accented forms).
  // Avoids the Unicode `u` flag, which requires target >= es2015 (tsconfig
  // currently defaults to es5 per Next.js scaffold).
  const cleaned = trimmed
    .replace(/[^A-Za-z0-9À-ɏ\s'-]/g, "")
    .slice(0, 40);
  return `Hey ${cleaned},`;
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

  const fullParagraphs = [
    greeting(ctx.firstName),
    ...bodyParagraphs,
    `PS: ${ps}`,
    "— Maryan",
  ];

  const text = `${fullParagraphs.join("\n\n")}\n\n---\n${footer.text}\n`;
  const html = htmlShell(paragraphsToHtml(fullParagraphs), footer.html);

  return { subject, text, html };
}

// ── EMAIL 0 (Day 0): Welcome + the rule ─────────────────────────────────────
function day0(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "You're in. Here's the rule of the 14-Day Sprint.",
    bodyParagraphs: [
      "You opted into the Sprint. Day 1 lands tomorrow, same time.",
      "The rule is simple. One action per day. You reply with what you did. If you miss a day, the next day's email still arrives — no shame, no auto-eject.",
      "Here is what you will actually have by Day 14, if you do the work: one real dream customer (named), one real offer (with a guarantee), one defended 10x value math, a list of 20 specific people in your niche, twenty outreach messages sent across two waves, and at least one live conversation booked.",
      "That is more selling than most founders I talk to have done in the last six months. It is the work I had been avoiding for almost a year on my own product. It is the work that breaks the flat Stripe line.",
      "Honest disclaimer up front: 90% of people who sign up for daily-action emails miss Day 4 and never come back. The Sprint is built to keep showing up to you even if you stop showing up to it. The only thing I ask: when you reply, be truthful about what you did and did not do. Lying to me is fine. Lying to yourself is the disease.",
      "There is no $1 charge for the Sprint. There is no upsell on Day 7. The only door I will point you at arrives on Day 14, and it is the one you will have earned the right to open.",
      "Tomorrow: Day 1. Name one real person.",
    ],
    ps: "Reply to this email with one sentence: what does your Stripe line look like right now, and how long has it looked that way? I read every reply. That is the start of the Sprint.",
    ctx,
  });
}

// ── EMAIL 1 (Day 1): One Real Person — Story 1: Blank Offer Page ──────────
function day1(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 1: name one real person.",
    bodyParagraphs: [
      "One night I sat down to write the offer for the product I had been building for months. Features for days. Traffic tactics for days. I opened a blank doc and tried to write one sentence: who this is for, and what it does for them. I stared at it for forty minutes. I produced nothing.",
      "That was the night I realised I had been building a beautiful thing for no one in particular.",
      "Today's action: write one sentence that names one real person you built your product for. First name. Situation. Why this matters to them right now. Reply with that one sentence.",
      "The Brunson rule that breaks Day 1 for most people: 'founders' is a category. 'Alex, 36, marketer, non-engineer, shipped a real AI product two months ago, watching Stripe stay flat' is a person. If you cannot write the WHO in one sentence, the rest of this Sprint is decoration.",
      "If you cannot think of one, the customer who already paid you (even for a free coffee, or for a previous product) is a fine starting point.",
    ],
    ps: "Reply with the sentence. Even if it feels wrong. The sentence on Day 14 will not be this sentence. The sentence today is just the one you start from.",
    ctx,
  });
}

// ── EMAIL 2 (Day 2): Quote Them — Story 4: Mirror in Ten Founders ─────────
function day2(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 2: find one quote.",
    bodyParagraphs: [
      "I started talking to other founders. More than ten of them. Each conversation was a mirror — same flat Stripe line, same shelf of half-built products, same frantic faith that the next launch would be the one.",
      "Halfway through call six I had to mute, get up, and walk around the room. A small cold voice said: that is you. He is describing you. You do not see your own pattern until you hear it in someone else's mouth.",
      "You do not make up your customer's words. You collect them. The copy that converts is the copy your dream customer already wrote in a Reddit thread, a Twitter reply, a Slack DM, a podcast comment.",
      "Today's action: open one place your Day-1 person hangs out. Find ONE quote where someone like them describes the pain you are trying to solve. Verbatim. With the link.",
      "Reply with the quote and the URL. Do not summarise. Do not paraphrase. The exact words are the asset.",
    ],
    ps: "I spent six months guessing what my customer wanted. Three founder calls produced more usable copy than the six months did. Today is your version of one of those calls — except you do not need them to talk to you. You just need to read what they already wrote.",
    ctx,
  });
}

// ── EMAIL 3 (Day 3): Do NOT open Stripe — Story 2 ─────────────────────────
function day3(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 3: do NOT open Stripe today.",
    bodyParagraphs: [
      "For about a year, my evenings looked the same. Day job done. Dinner done. Laptop open. Refresh Stripe. Same number. Tweak one small thing. Call it progress. Close the laptop.",
      "Technically I was working on my business every single night. I had nothing to show for any of it.",
      "That ritual was not work. It was the most respectable form of avoidance there is — the one nobody, including me, could call out.",
      "Today's action is the smallest one in the Sprint and the hardest. Do not open Stripe today. Not once. Do not refresh the dashboard, do not check the app, do not glance at the email digest. Close the tab. Block the bookmark if you have to.",
      "Reply with the word 'closed' when you have done it. We will open Stripe together on Day 14, and the number will be different — if, and only if, you do the next eleven days of work.",
    ],
    ps: "If you feel exposed by this email, that is the right response. The Stripe refresh is the single most efficient way to spend your evenings not working on the thing that would make Stripe move.",
    ctx,
  });
}

// ── EMAIL 4 (Day 4): One Real Promise — Vehicle Story ───────────────────────
function day4(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 4: write one promise.",
    bodyParagraphs: [
      "Most products do not promise a result. They describe features. They show screenshots. They list integrations. The visitor reads, nods politely, leaves.",
      "A guarantee is the only thing that earns you the right to ask a skeptic for money. A guarantee says: I am so confident in what I am offering that I will refund you if it does not work. Without that, you are asking for trust on credit, and your dream customer has none to spare.",
      "Today's action: write the one result you can guarantee, in writing, for the person you named on Day 1. One sentence. With a timeframe. With a remedy if you fail.",
      "Format: 'For [Day 1 person], I guarantee [specific result] within [timeframe], or [remedy].'",
      "Reply with that sentence.",
      "The Brunson rule that breaks most attempts at Day 4: if you cannot refund it, you cannot promise it. If you cannot specify the timeframe, you have not earned the promise yet. If the remedy is 'we'll work harder', the promise is empty.",
    ],
    ps: "The Playbook — the full $49 product — carries one guarantee: your first paying customer in 60 days, verified by Stripe, or you do not pay. That sentence took me three months to earn the right to say. Today's draft will not be your final version. It is the version you start from.",
    ctx,
  });
}

// ── EMAIL 5 (Day 5): The Math of Defence — Skeptic Avatar ───────────────────
function day5(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 5: defend the price.",
    bodyParagraphs: [
      "Your dream customer does not care what your product is 'worth'. They care what it would cost them to assemble the same outcome on their own, at fair market rates.",
      "Russell Brunson calls this the 10x value defence. The sum of your offer's components, costed separately, should be at least ten times your asking price. Anything less and the skeptic in your customer says: I could do this myself.",
      "Today's action: list every component of your offer. The product itself, every feature with material value, every bonus, every piece of human or AI support included, every accountability mechanism. Estimate what each would cost separately at fair market rates. Sum.",
      "Reply with the math. The list. The estimates. The total. The ratio of total-to-price.",
      "The first time I did this for my product, I produced about forty dollars of value for forty-nine. The math did not earn the ask. I went back to the offer and added three components until the ratio cleared ten-to-one. The price stayed the same. The defence got real.",
    ],
    ps: "If your math comes out under 5x, you have two options. Lower the price until the ratio clears, or add bonuses until it does. Almost always: add bonuses. The skeptic respects a generous stack more than a low number.",
    ctx,
  });
}

// ── EMAIL 6 (Day 6): The Remedy — Internal Belief Rewrite #1 ────────────────
function day6(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 6: write the refund.",
    bodyParagraphs: [
      "Most founders I talk to believe the problem is the product. One more feature. One more polish pass. One more pricing tweak.",
      "The product was built for no one in particular. That is the actual problem, and it is upstream of every feature decision you can possibly make. You can polish a thing built for nobody until the surface is glass, and nobody will still buy it.",
      "A guarantee is the door out of that loop. It forces you to bet on the result, not on the feature list. And a guarantee is meaningless without a refund mechanism written in plain language.",
      "Today's action: write your refund policy. One paragraph. What you give back, when, on what conditions. No legalese.",
      "Reply with the paragraph.",
      "Two things almost every first draft gets wrong: (1) it hides the refund mechanism behind a customer-service email instead of automating it, and (2) it adds conditions that punish the customer for asking. Neither of those will survive a skeptic. The cleanest version: a one-click refund within the guarantee window, no questions, no retention call.",
    ],
    ps: "A confident refund line increases conversions, not decreases them. The mediocre operator hides the refund. The honest operator publishes it above the buy button. Guess which one a flat-line founder trusts more.",
    ctx,
  });
}

// ── EMAIL 7 (Day 7): The First List — Dream 100 mini ────────────────────────
function day7(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 7: pick 20 names.",
    bodyParagraphs: [
      "Brunson teaches the Dream 100 — the hundred specific people you most want as customers. For Day 7, we are scaling that down. Not a hundred. Twenty.",
      "Twenty is the floor. At a 5% reply rate on cold outreach, twenty messages produces one conversation. That is the minimum that compounds — anything less is not a test of the message, it is a test of luck.",
      "Where does the person you named on Day 1 actually hang out? Pick three places. A subreddit. A Discord. A specific Twitter list. A podcast comment section. An Indie Hackers forum thread. A LinkedIn hashtag.",
      "Today's action: from those three places, list 20 specific names. Real handles, real emails, real usernames. People you could send a message to today if you had the message ready.",
      "Reply with the count (it should be 20) and the names of the three congregations.",
      "You do not need to find perfect prospects. You need to find twenty real ones. Imperfect-but-named beats perfect-but-imagined every day of this Sprint.",
    ],
    ps: "If you cannot find twenty, you have not found their congregation yet. Spend tonight scrolling. Read three threads end to end. Pick a different place tomorrow. The list is the asset — without it, the messages on Day 8 land nowhere.",
    ctx,
  });
}

// ── EMAIL 8 (Day 8): The First Message — Story 3: SEO Escape Hatch ────────
function day8(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 8: write one message.",
    bodyParagraphs: [
      "I went embarrassingly deep into SEO for nearly a year. Programmatic pages, AEO tooling, GEO experiments. None of it produced a customer. All of it produced something that felt like work.",
      "Tactic shopping is sophisticated avoidance. It is the activity you do when the actual activity — sending a real message to a real person — feels too exposing.",
      "The only message that converts is the one you actually send. There is no perfect template. There is no clever opener that closes a deal a real conversation would not have closed faster.",
      "Today's action: write the message you will send to the first person on your Day 7 list. ONE paragraph. Three rules:",
      "1) Open with the quote from Day 2. Or with their own words, taken from a public post of theirs you read.",
      "2) Make ONE specific observation about their situation. Not 'I noticed you launched a product.' Something only someone who actually paid attention would write.",
      "3) End with one question they can answer in one sentence. No pitch. No link. No call-to-action. A question.",
      "Reply with the message.",
    ],
    ps: "The gap between 'sent' and 'didn't send' is wider than the gap between 'good message' and 'great message'. Tomorrow you will send this to five people. You are allowed to rewrite it tomorrow. You are not allowed to skip the send.",
    ctx,
  });
}

// ── EMAIL 9 (Day 9): Send the First Five ─────────────────────────────────────
function day9(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 9: send to five.",
    bodyParagraphs: [
      "Today is the day the Sprint stops being abstract.",
      "Pick five names from your Day 7 list. Send your Day 8 message to each one. Personalise the opener for each — the quote, the observation, the question, all specific. Different message for each of the five, same shape.",
      "Reply with: 'sent 5'. Bonus: paste the screenshots of the five sent states. Bonus to the bonus: paste the platform (DM, email, Reddit comment, IH reply, wherever you sent).",
      "Honest confession: the first 5 I sent felt like I was breaking a window. The hands shook. By the third one they had stopped shaking. By the fifth it felt like a normal Tuesday activity. The trick is the threshold — there is one before five, and there is one after.",
      "The Brunson rule that breaks Day 9 for most founders: send before it feels ready. Always. The version you would have sent had you waited another week is the version that would have read like every other founder's pitch in your dream customer's inbox.",
    ],
    ps: "If you only send four, that's fine — reply 'sent 4' and we keep moving. If you only send one, reply 'sent 1'. The lying-to-yourself version is the only one that breaks the Sprint, not the under-performing version.",
    ctx,
  });
}

// ── EMAIL 10 (Day 10): Triage — Internal Belief Rewrite #4 ──────────────────
function day10(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 10: triage what comes back.",
    bodyParagraphs: [
      "Customers exist outside your head. You cannot reason your way to one. You have to leave your head and find them — which you did, yesterday, in five places.",
      "Replies will come in three shapes. Interested ('tell me more'). Curious-but-skeptical ('how does this work?'). Objection ('I tried something like this, it did not work for me'). Each gets a different response.",
      "Today's action: log whatever came back from your Day 9 sends. Even silence. Especially silence. Reply with the counts:",
      "- Interested: N",
      "- Curious: N",
      "- Objection: N",
      "- Silence (so far): N",
      "If you got nothing back yet, that is normal — 24 hours is short. Log the counts you have. You will update them in your head over the next few days.",
      "Tomorrow you will send ten more, to a different congregation. The replies from Day 9 are the data that tunes the message for Day 11.",
    ],
    ps: "If you reply with 'scripts' today, tomorrow's email will include the three reply scripts I use for each of the three reply types. Not as templates to copy verbatim — as scaffolds, so the second message in a conversation does not stall.",
    ctx,
  });
}

// ── EMAIL 11 (Day 11): Send the Next Ten ────────────────────────────────────
function day11(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 11: ten more, different group.",
    bodyParagraphs: [
      "Day 9 told you what to fix in the message. Day 11 tests the fix at twice the volume, in a different congregation.",
      "Pick a SECOND congregation from your Day 7 list. Not the one you used for the first five — a different community, a different platform, a different language norm. Rewrite the message for that audience. The pain stays the same. The vocabulary changes. The opener changes.",
      "Today's action: send the revised message (call it v2) to 10 specific people from the second congregation. Personalise each one. Reply with 'sent 10' and which platform.",
      "The Brunson rule that breaks Day 11: never send the same message to two congregations without revising the language. The Indie Hackers founder reads differently than the r/SaaS lurker. The crypto Discord reads nothing like the LinkedIn solopreneur. Adjust the surface; keep the spine.",
    ],
    ps: "Half the founders who get to Day 11 send the v1 message again because rewriting feels too much. Notice the urge. Rewrite anyway. The rewrite is the lesson.",
    ctx,
  });
}

// ── EMAIL 12 (Day 12): The Hard Five ─────────────────────────────────────────
function day12(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 12: the five you've been avoiding.",
    bodyParagraphs: [
      "There are five names on your Day 7 list you have been quietly skipping. The ones who feel 'above' you. The ones whose audience you would kill to be in front of. The ones whose reply you most want and most fear.",
      "Today is for those five.",
      "Pull them out specifically. Write the message that only you could write to that person — drawing on the quote from Day 2, the observation from Day 8, what you have learned in three days of replies. Send to each one individually.",
      "Reply with one sentence about who those five were and why you had been avoiding them.",
      "My own version of this list had seven people on it. Two replied. One became a collaborator I still talk to monthly. The biggest leverage outreach action of my year was a single message I had been not-sending for ten weeks.",
    ],
    ps: "The fear is not that they will say no. The fear is that they will see the message clearly enough to know what is actually being offered, and decide it is not enough. That is also the only useful piece of feedback the Sprint can produce on Day 12.",
    ctx,
  });
}

// ── EMAIL 13 (Day 13): One Real Conversation — Story 5: Door That Opened ──
function day13(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 13: one real conversation.",
    bodyParagraphs: [
      "For most of my life, building software was a door that stayed closed. I am not an engineer. I had quietly made peace with being the one with ideas, never the one who builds.",
      "Then it was 2026. Lovable and Claude opened the door. The shipping part felt like magic. The selling part did not. What I learned this year: building is solved. Selling has not been. Now it sits exposed.",
      "Text-based outreach is rehearsal. A voice or a video conversation is where a deal forms. The full message of the Sprint compresses into one move: you have spent twelve days putting yourself in front of real people in writing. Tomorrow we close the Sprint. Today, you take it one step further.",
      "Today's action: book ONE live conversation. 15 minutes. Phone or video. From any of the replies you got over Days 9 through 12. Or from a direct ask to one of the warmest names on your Day 7 list.",
      "Reply with the time and who it is with. Even if it is two weeks from now. Even if it is tentative. Booked counts.",
    ],
    ps: "One real conversation produces more revenue and more learning than ten landing-page split tests. If you cannot get one booked today, send three explicit asks: 'I have 15 minutes Thursday at 4 — would that work for you?' Specific times convert. Open-ended invitations do not.",
    ctx,
  });
}

// ── EMAIL 14 (Day 14): Sprint Complete + $1 Starter (Hook #8 verbatim) ──────
function day14(ctx: RenderContext): RenderedEmail {
  return render({
    subject: "Day 14: open Stripe.",
    bodyParagraphs: [
      "Fourteen days ago you opted into the Sprint. Today you have a dream customer named to a single first name. An offer with a guaranteed result, a timeframe, a remedy, and a 10x value defence. A list of 20 specific people in two congregations. Twenty outreach messages sent across two waves, plus a hard five. At least one live conversation booked.",
      "That is more selling than most founders I talk to have done in the last six months. Read that sentence again. It is true.",
      "Open Stripe. Look at it for the first time in eleven days. If you did the work, the line has moved or is about to move. If it has not moved yet, the messages you sent in Days 9, 11, 12 are still in inboxes — and the conversation you booked for Day 13 has not happened yet. The math is not in.",
      "Here is the door you have earned the right to open.",
      "Everything you did in your head and in this inbox needs to live inside the product, where the next time you sit down to sell, you cannot skip it. That is what the Playbook is for. Seven steps. The 14-Day Sprint baked in as the accelerator inside Step 6 — except this time, the engine generates the messages, the targets, and the tracking; you press send.",
      "Your first paying customer, verified by Stripe, within 60 days. Or full refund. In writing.",
      "What you get inside the Playbook (the full $49):",
      "— Seven Playbook steps. Steps 1 and 2 finish the WHO and WHAT on paper. Step 3 writes the voice. Step 4 generates the copy. Steps 5 and 6 generate the 20-target outreach and track every send. Step 7 listens for the first Stripe charge that closes your guarantee.",
      "— The 14-Day Sprint baked in as the accelerator inside Step 6 (the same scaffold you just ran, with the engine attached).",
      "— The Outreach Room — other non-engineers who shipped, the mirror that worked for me.",
      "— A 60-day clock, visible in the app header from the moment you start. No surprises.",
      "The $1 door is below. The Starter finishes Steps 1 and 2 inside the tool, with the engine pushing back on every vague answer. After the Starter, the OTO page asks whether you want the rest plus the 60-day guarantee. One decision. No third option.",
    ],
    ps: `If the 14 days landed and you want to mark it, the Starter unlocks the Verified Builder Trainee badge — a shareable proof you ran the Sprint. ${ctx.baseUrl}/starter?from=challenge`,
    ctx,
  });
}

const SEQUENCE = [
  day0,
  day1,
  day2,
  day3,
  day4,
  day5,
  day6,
  day7,
  day8,
  day9,
  day10,
  day11,
  day12,
  day13,
  day14,
] as const;

/**
 * Render the email at the given zero-based index (0 = Day 0 = welcome).
 * Throws if index is out of bounds.
 */
export function renderEmail(
  index: number,
  ctx: RenderContext
): RenderedEmail {
  const fn = SEQUENCE[index];
  if (!fn) {
    throw new Error(`No Challenge email at index ${index}`);
  }
  return fn(ctx);
}

export const SEQUENCE_LENGTH = SEQUENCE.length; // 15
