/**
 * The Founder's First Customer Playbook.
 *
 * Brunson DotCom Secrets Secret #17 (Book Funnel + Star/Story/Solution):
 * the $1 Starter is the digital equivalent of Russell's "free + shipping"
 * book funnel. The buyer takes home an artifact with a NAME and a COVER and
 * a TABLE OF CONTENTS — the identity anchor. They can point at it later,
 * share it, refer back to it. Brunson rule: even a digital book gets a
 * cover mocked up; the shape of the thing carries the authority.
 *
 * Without the named artifact the Starter is a "deliverable" — useful, but
 * forgettable. With it the Starter becomes "the Playbook" — a thing the
 * buyer owns. That noun-shift closes the Book-Funnel chapter to 100.
 *
 * Source of truth for:
 *   /starter   PlaybookMockup (cover visual) + PlaybookContents (TOC)
 *   /welcome   "Your Playbook is being assembled" unboxing screen
 *   lib/deliverable-email.ts   subject + body framed as "Chapter X locked"
 *
 * Locked in: workbook 04 §2 (Starter Unboxing Funnel) + workbook 01 §2
 * (offer stack: Outreach Script Kit at $69 retail → $19 as Brunson bump).
 */
export const PLAYBOOK = {
  name: "The Founder's First Customer Playbook",
  shortName: "Playbook",
  subtitle:
    "A non-engineer's mechanical path from a flat Stripe line to one verified paying customer.",
  byline: "by Maryan, founder of Unlock SaaS",
} as const;

export interface PlaybookChapter {
  /** Stable sort + URL slug key. */
  id: string;
  /** Cover-of-book chapter number (1-indexed) or null for front/back matter. */
  number: number | null;
  /** Public-facing title. */
  title: string;
  /** One-sentence promise. */
  blurb: string;
  /** Free at $1 Starter? false = $49 Machine unlocks it. */
  unlockedAtStarter: boolean;
  /** Engine step that produces this chapter (1..5) or null for fixed copy. */
  engineStepId: "1" | "2" | "3" | "4" | "5" | null;
  /** Whether this entry is appendix matter rather than a numbered chapter. */
  isAppendix?: boolean;
}

export const PLAYBOOK_CHAPTERS: readonly PlaybookChapter[] = [
  {
    id: "foreword",
    number: null,
    title: "Foreword: The flat line is not a product problem.",
    blurb: "Why this Playbook exists and why nothing else fixed your Stripe.",
    unlockedAtStarter: true,
    engineStepId: null,
  },
  {
    id: "ch-1",
    number: 1,
    title: "Your Dream Customer",
    blurb: "One named person with their real congregation list.",
    unlockedAtStarter: true,
    engineStepId: "1",
  },
  {
    id: "ch-2",
    number: 2,
    title: "Your Offer",
    blurb: "One result, one timeframe, one guaranteed remedy, 10x math.",
    unlockedAtStarter: true,
    engineStepId: "2",
  },
  {
    id: "ch-3",
    number: 3,
    title: "Your Attractive Character",
    blurb: "The Reluctant Hero voice you will publish in from now on.",
    unlockedAtStarter: false,
    engineStepId: "3",
  },
  {
    id: "ch-4",
    number: 4,
    title: "Your Copy",
    blurb:
      "Five headlines, Star-Story-Solution page, OTO block, disqualifier.",
    unlockedAtStarter: false,
    engineStepId: "4",
  },
  {
    id: "ch-5",
    number: 5,
    title: "Your Outreach Assets",
    blurb:
      "Twenty named targets, two message variants, three reply branches.",
    unlockedAtStarter: false,
    engineStepId: "5",
  },
  {
    id: "ch-6",
    number: 6,
    title: "Your 20 Reps",
    blurb:
      "The engine logs and verifies every outreach action. No willpower required.",
    unlockedAtStarter: false,
    engineStepId: null,
  },
  {
    id: "ch-7",
    number: 7,
    title: "The Stripe Charge",
    blurb:
      "Webhook detects the first new paying customer. The flat line moves on its own.",
    unlockedAtStarter: false,
    engineStepId: null,
  },
  {
    id: "app-a",
    number: null,
    title: "Appendix A: The five Reluctant Hero parables.",
    blurb:
      "Blank Offer Page · Stripe Refresh · SEO Escape Hatch · Mirror in Ten · The Door That Opened.",
    unlockedAtStarter: true,
    engineStepId: null,
    isAppendix: true,
  },
  {
    id: "app-b",
    number: null,
    title: "Appendix B: The 16 mini-closes inventory.",
    blurb:
      "Risk reversal, logic, emotion — verbatim from the long-form sales page.",
    unlockedAtStarter: true,
    engineStepId: null,
    isAppendix: true,
  },
  {
    id: "app-c",
    number: null,
    title: "Appendix C: The 12 trial closes.",
    blurb:
      "Soft-yes questions you can paste into any email, DM, or thread.",
    unlockedAtStarter: true,
    engineStepId: null,
    isAppendix: true,
  },
] as const;

/** Chapters the $1 Starter unlocks. */
export const STARTER_CHAPTERS: readonly PlaybookChapter[] =
  PLAYBOOK_CHAPTERS.filter((c) => c.unlockedAtStarter);

/** Chapters that open with the $49 Machine subscription. */
export const MACHINE_CHAPTERS: readonly PlaybookChapter[] =
  PLAYBOOK_CHAPTERS.filter((c) => !c.unlockedAtStarter);

/** Map an engine step id → its Playbook chapter (for the deliverable email). */
export function chapterForEngineStep(
  stepId: "1" | "2" | "3" | "4" | "5",
): PlaybookChapter {
  const match = PLAYBOOK_CHAPTERS.find((c) => c.engineStepId === stepId);
  if (!match) {
    // Shape-safe fallback — should never hit.
    throw new Error(`No Playbook chapter mapped for engine step ${stepId}`);
  }
  return match;
}

/**
 * Order-Form Bump (Brunson DotCom Secrets Secret #17 §3).
 *
 * A small ($7–$37) add-on checkbox on the order form. 30–50% of buyers click
 * it. Lifts AOV without adding any friction to the primary purchase.
 *
 * For UnlockSaaS the bump = The Outreach Script Kit. One of the three named
 * bonuses in the offer stack (worth $69 standalone per workbook 01 §2). Bump
 * price is $19, available ONLY at this moment, never on the $1 page alone
 * and never on the $49 OTO.
 *
 * Wiring:
 *   /starter:        controlled checkbox; passes `bumps: ["outreach_kit"]`
 *   /api/checkout:   adds a second Stripe line item with the bump price
 *   /api/webhooks/stripe: reads line items, marks the bump as owned
 *   /welcome:        surfaces "Your Outreach Script Kit is unlocked"
 *
 * Operator env block: STRIPE_OUTREACH_KIT_PRICE_ID. Create a $19 one-time
 * price in Stripe for "Outreach Script Kit," then `vercel env add` it to
 * all three envs. Until that lands, the checkbox renders DISABLED with an
 * honest "coming soon" note — the moment the env var is set, the bump
 * auto-activates without a code change. Same fail-quiet pattern as the
 * VSL block (env-driven, kinetic fallback).
 */
export const ORDER_FORM_BUMP = {
  id: "outreach_kit",
  name: "The Outreach Script Kit",
  bumpPrice: 19,
  retailPrice: 69,
  blurb:
    "Done-for-you DM, comment, and email scripts — plus the three reply branches — for the four channels your dream customer lives in (X, Indie Hackers, r/SaaS, your warm-lead inbox). One-time, no recurring.",
} as const;

export type BumpId = typeof ORDER_FORM_BUMP.id;

/** Whether the bump is currently sellable (price id present in env). */
export function isBumpEnabled(): boolean {
  return outreachKitPriceId() !== null;
}

/** Resolved Stripe price id for the bump, or null if not configured. */
export function outreachKitPriceId(): string | null {
  const id = process.env.STRIPE_OUTREACH_KIT_PRICE_ID;
  return id && id.trim().length > 0 ? id : null;
}

/** Whitelist of bump ids the checkout route accepts. */
export const KNOWN_BUMP_IDS: readonly BumpId[] = [ORDER_FORM_BUMP.id];

export function isKnownBumpId(value: string): value is BumpId {
  return (KNOWN_BUMP_IDS as readonly string[]).includes(value);
}
