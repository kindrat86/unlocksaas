/**
 * /dont-buy-unlock-saas data registry.
 *
 * Why this module exists
 * ----------------------
 * The /dont-buy-unlock-saas page is the Brunson polarity surface (see
 * strategy/google-strategy.md §B.3, "linkable surprise pages"). It exists
 * because:
 *
 *  - Surprising, anti-marketing copy is one of the few link magnets a
 *    pre-revenue founder can produce without a press budget. Patrick
 *    McKenzie, Justin Welsh, and the "honest founder" archetype on
 *    X / Bluesky / LinkedIn share pages that disqualify their own
 *    audience, because they cut through the saturation.
 *  - It pre-empts a wrong-fit customer arriving at /starter or
 *    /playbook-sales, paying, and discovering the mismatch in week one.
 *    Cheap to write today, expensive to fix as a Day-7 refund cohort.
 *  - It anchors the Verified-Builder positioning: "we say no on purpose"
 *    is half of what makes "we verify inside Stripe" credible.
 *
 * Single source of truth
 * ----------------------
 * The HTML page at app/(marketing)/dont-buy-unlock-saas/page.tsx and the
 * markdown mirror at app/dont-buy-unlock-saas.md (registered in
 * src/lib/seo/markdown.ts) both render this registry. Adding or editing
 * a disqualifier here updates both surfaces at the next build, identical
 * by construction.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *  - Every disqualifier below is a real product constraint a wrong-fit
 *    customer would hit in week one. No strawman disqualifiers ("you do
 *    not love yourself enough"). Each one names what the Playbook
 *    actually requires.
 *  - Every "do this instead" is an honest pointer to a real off-site
 *    alternative or a real on-site surface – never a covert upsell.
 *  - The fit criteria mirror AUDIENCE_LINE in src/lib/seo/markdown.ts and
 *    the canonical buyer profile in strategy/avatar.md. If those drift,
 *    this file is wrong.
 */

import type { ReactNode } from "react";

/**
 * One disqualifier entry. Each becomes one section on the HTML page and
 * one bullet block in the markdown mirror.
 */
export interface Disqualifier {
  /** Short imperative slug, used as section id (kebab-case). */
  id: string;
  /** Headline for the disqualifier. First-person, plain. */
  title: string;
  /** One paragraph of plain-language reasoning. */
  body: string;
  /**
   * Pointer to a real alternative. Optional; some disqualifiers point at
   * an on-site surface (e.g. the free diagnostic), some at off-site
   * categories the wrong-fit founder is closer to.
   *
   * `label` is rendered verbatim; `href` is either a site-relative path
   * or an absolute URL. Absolute URLs are honest – if you should not buy
   * Unlock SaaS because you have not shipped yet, we say so and point
   * away from the site.
   */
  insteadDo?: {
    label: string;
    href: string;
  };
}

/**
 * The disqualifier list. Reverse-priority not enforced – readers skim,
 * so the strongest signal (no shipped product yet) leads.
 */
export const DISQUALIFIERS: ReadonlyArray<Disqualifier> = [
  {
    id: "no-shipped-product",
    title: "You haven't shipped a product yet.",
    body: "The Playbook starts on a live URL. Step one in every cycle is paste-your-product-link. If you do not have a live URL today, the prerequisite is not a marketing playbook; it is a shipped product. Spend the $49 on the tool that gets you to a live URL first, then come back.",
    insteadDo: {
      label: "Ship with Lovable, Replit, v0, Cursor, or Bolt first",
      href: "https://lovable.dev",
    },
  },
  {
    id: "you-hate-writing",
    title: "You hate writing.",
    body: "Step 3 is write one real one-line offer. Step 5 is send one real outreach message. Both are writing. The Playbook tightens the writing and gives you the scaffolding; it does not eliminate the writing. If staring at a blank page for ten minutes makes you close the tab, you will hate this in week one.",
  },
  {
    id: "magic-button",
    title: "You want a one-click “generate me a customer” button.",
    body: "The Playbook is software, but the software exists to push back. It tells you when you have named a fake person, when your offer is a feature list, when your outreach is a wall of text. The output is not a customer; the output is the work that produces one. If you wanted a button, the Playbook will feel obstructive on day two.",
  },
  {
    id: "verification-gimmick",
    title: "You think Stripe verification is a gimmick.",
    body: "The 60-day refund fires automatically when your connected Stripe account shows zero new paying customers at day 60 and your in-product milestones were completed. “Verified inside Stripe” is not marketing copy; it is the literal refund mechanism. If you think the verification step is window-dressing, the entire product will read as theatre to you.",
    insteadDo: {
      label: "Read how the guarantee fires in code",
      href: "/faq",
    },
  },
  {
    id: "guaranteed-traffic",
    title: "You're looking for guaranteed traffic.",
    body: "There is no traffic in the box. The Playbook works on top of the audience, product, and one-real-customer you already have. It will not run paid ads for you, it will not seed your SEO, it will not warm an empty inbox. If you do not have a list, a product, and willingness to send one direct outreach a day for sixty days, the missing piece is not the Playbook.",
    insteadDo: {
      label: "Read the cold-traffic bridge first",
      href: "/bridge",
    },
  },
  {
    id: "want-a-coach",
    title: "You want a coaching call, not a tool.",
    body: "There are no calls included. Maryan answers email; that is the entire human-loop. The Playbook is opinionated software, not a person on Zoom. If you need a coach, hire a coach. Hiring a coach is not a worse choice than the Playbook; it is a different choice, and the Playbook is wrong for you.",
  },
  {
    id: "refund-hunter",
    title: "You're hunting for a refund hack.",
    body: "The guarantee is honest and capped at $98 ($1 Starter plus one month of the $49 Playbook before the cycle window closes). It pays out automatically when the milestones are met and Stripe shows no new customer. There is no quicker hack: refunding a $98 ceiling takes more elapsed time than the work, and Maryan will not argue with a refund that fires correctly. If extracting $98 is the play, your time is better spent elsewhere.",
  },
  {
    id: "non-english-audience",
    title: "Your dream customer does not buy in English.",
    body: "The Playbook ships in English only today. Spanish and Brazilian Portuguese are in a registry-gated rollout, but the outreach drafts, the dream-customer prompts, and the in-product copy are written in English first and translated only when a translation is founder-reviewed. If your dream customer reads Korean, Japanese, German, Mandarin, Arabic, or another language, the Playbook will not fit your outreach yet.",
  },
] as const;

/**
 * The canonical buyer profile – kept here so the negative-space page and
 * the positive-space audience line on /about, /press, and /playbook-sales
 * never disagree. Mirror of AUDIENCE_LINE in src/lib/seo/markdown.ts.
 */
export const FIT_CRITERIA: ReadonlyArray<string> = [
  "You shipped a real, live SaaS product (most members shipped with Lovable, Claude, Replit, v0, Cursor, Bolt, or Bubble).",
  "Your Stripe revenue line is flat or near-flat.",
  "You are willing to write one offer sentence and send one real outreach message per day for sixty days.",
  "You believe the work between “shipped” and “first paying customer” is the work nobody taught you.",
] as const;

/**
 * Stable type-export for callers that render a Disqualifier with extra
 * decoration (e.g. wrapping the body in an aside). Mostly unused today;
 * exported so the page file can compose alternative renderings without
 * importing the const type signature directly.
 */
export type DisqualifierRenderer = (d: Disqualifier) => ReactNode;
