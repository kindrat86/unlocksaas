/**
 * /swipe-file/[slug] pSEO catalog — pattern-level swipe files.
 *
 * Each entry collects structural patterns (NOT verbatim copy) for one
 * funnel element — headlines, CTAs, guarantees, etc. — drawn from the
 * indie SaaS funnel teardowns already published under
 * `src/lib/funnel-teardowns.ts`. Every "example" is a fill-in-the-blank
 * template with the slot positions named in [BRACKETS]; the named-source
 * field cross-links to the teardown the pattern was observed in.
 *
 * Brunson Hard-Rule reconciliation:
 *   - No quoted copy. Patterns only. The teardowns themselves observe
 *     the same "no slag" discipline; this surface inherits it.
 *   - Every named source is a real teardown we have already shipped.
 *     Adding a swipe file that references a teardown not yet in
 *     funnel-teardowns.ts is a build error, not a runtime warning, via
 *     a TS check at the bottom of this file.
 *   - Pattern attribution names the Hook / Story / Offer structural
 *     element so a reader can map back to the diagnostic triage.
 */

import { TEARDOWN_SLUGS } from "./funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "./pricing-teardowns";

export type SwipeFileCategory =
  | "headline"
  | "cta"
  | "social-proof"
  | "guarantee"
  | "stack-slide"
  | "pricing-copy"
  | "above-fold"
  | "hook";

export interface SwipePattern {
  /** Short label for the pattern, e.g. "[OUTCOME] in [TIME]". */
  template: string;
  /** What the [BRACKETED] slots represent, in plain language. */
  slots: string;
  /** Worked fill-in example (still structural — no real-site copy). */
  filledExample: string;
  /**
   * Slug of the teardown where this pattern was observed. Matched against
   * funnel-teardowns.ts first, then pricing-teardowns.ts. The detail page
   * resolves the right hub URL automatically.
   */
  sourceTeardownSlug: string;
}

export interface SwipeFileFaq {
  q: string;
  a: string;
}

export interface SwipeFileEntry {
  /** URL slug, kebab-case. */
  slug: string;
  /** Human-readable title. */
  title: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** Category for grouping on the hub. */
  category: SwipeFileCategory;
  /** The funnel element this swipe file applies to. */
  element: string;
  /** Brunson lens (Hook / Story / Offer) the patterns map to. */
  brunsonLens: "hook" | "story" | "offer";
  /** 2-3 sentence intro — what this swipe file is and isn't. */
  intro: string;
  /** Structural patterns drawn from already-shipped teardowns. */
  patterns: ReadonlyArray<SwipePattern>;
  /** Which Brunson Wrong-Person / Weak-Offer / Weak-Belief diagnosis this fixes. */
  fixesDiagnosis: "wrong-person" | "weak-offer" | "weak-belief";
  /** How to adapt the patterns to the reader's own page, in order. */
  howToAdapt: ReadonlyArray<string>;
  /** Related glossary term slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** Q&A block for FAQPage schema. */
  faqs: ReadonlyArray<SwipeFileFaq>;
  /** ISO date last verified end-to-end. */
  lastVerified: string;
}

export const SWIPE_FILE_ENTRIES: ReadonlyArray<SwipeFileEntry> = [
  // ── Headline patterns ────────────────────────────────────────────────────
  {
    slug: "outcome-time-headline-swipe-file",
    title: "Outcome-time headline swipe file",
    metaTitle: "Outcome+Time Headline Swipe File (Indie SaaS)",
    metaDescription:
      "Eight structural patterns for above-the-fold SaaS headlines that name an outcome and a time horizon. Sourced from already-shipped indie SaaS teardowns.",
    category: "headline",
    element: "Above-the-fold headline",
    brunsonLens: "hook",
    intro:
      "The outcome-time headline pattern names a concrete result and a time horizon in one sentence. It is the hook that survives a two-second scroll. Every pattern below is observed on a real indie SaaS funnel — the source teardown is named so you can reverse-engineer the full page in context.",
    patterns: [
      {
        template: "[OUTCOME] in [TIME]",
        slots:
          "[OUTCOME] is the single concrete result a paying customer gets; [TIME] is the upper bound, not an average.",
        filledExample: "[Live form on your site] in [under 5 minutes]",
        sourceTeardownSlug: "tally",
      },
      {
        template: "[NUMBER] [UNITS] to [OUTCOME]",
        slots:
          "Front-load the count or duration; trailing outcome is what the reader is buying.",
        filledExample: "[Three lines of code] to [send transactional email]",
        sourceTeardownSlug: "resend",
      },
      {
        template: "[OUTCOME] without [PAINFUL DEFAULT]",
        slots:
          "[PAINFUL DEFAULT] is the path the reader is on today — name it specifically.",
        filledExample: "[Scheduled meetings] without [the back-and-forth]",
        sourceTeardownSlug: "cal-com",
      },
      {
        template: "[VERB] [OBJECT], [QUALIFIER]",
        slots:
          "Imperative verb + the noun being verbed; qualifier carries the positioning.",
        filledExample: "[Record async video,] [no editing required]",
        sourceTeardownSlug: "tella",
      },
    ],
    fixesDiagnosis: "wrong-person",
    howToAdapt: [
      "Write one sentence with two blanks: outcome and time. Fill both with the most specific values your product actually delivers.",
      "Read the sentence to one person in your real target audience. If they ask 'what does that mean?', the slot is too generic.",
      "Test the outcome blank first — a sharper outcome with a vague time beats a sharp time with a vague outcome.",
      "Time horizons under one day pull harder than weeks; weeks pull harder than 'fast'. Avoid 'fast' as a time horizon.",
    ],
    relatedGlossary: ["hook", "wrong-person"],
    faqs: [
      {
        q: "Should the time horizon be honest or aspirational?",
        a: "Honest. The headline sets the expectation the diagnostic, the demo, and the refund window all measure against. An aspirational time horizon that the product cannot meet is a refund trigger.",
      },
      {
        q: "Can I use this pattern without naming a time?",
        a: "Yes, but then it is the outcome-headline pattern, not the outcome-time pattern. Time anchors the hook in a way pure outcome does not. Skipping it costs scroll-survival, not headline grammar.",
      },
    ],
    lastVerified: "2026-05-19",
  },
  {
    slug: "negation-positioning-headline-swipe-file",
    title: "Negation-positioning headline swipe file",
    metaTitle: "Negation Positioning Headline Patterns (SaaS)",
    metaDescription:
      "Headline patterns that position by naming what your tool is NOT. Sourced from indie SaaS teardowns. Use when category is crowded.",
    category: "headline",
    element: "Above-the-fold headline",
    brunsonLens: "hook",
    intro:
      "Negation-positioning headlines say what you are NOT before they say what you are. The pattern works when the category is crowded and the reader already knows the dominant option — naming the negation tells them you understand the trade they are unhappy with.",
    patterns: [
      {
        template: "[OUTCOME], not [DOMINANT ALTERNATIVE]",
        slots:
          "[DOMINANT ALTERNATIVE] is the tool the reader will compare you against by reflex.",
        filledExample: "[Analytics,] not [a Google Analytics setup project]",
        sourceTeardownSlug: "plausible",
      },
      {
        template: "[CATEGORY] without [BAGGAGE]",
        slots:
          "[BAGGAGE] is the specific thing the dominant option drags along that the reader resents.",
        filledExample: "[A docs site] without [Markdown-in-a-monorepo gymnastics]",
        sourceTeardownSlug: "mintlify",
      },
      {
        template: "[OUTCOME] for [SPECIFIC AUDIENCE], not [BROAD AUDIENCE]",
        slots:
          "Two-axis positioning: outcome plus audience exclusion.",
        filledExample: "[Payments] for [Merchant of Record indie sellers,] not [enterprise]",
        sourceTeardownSlug: "lemonsqueezy",
      },
    ],
    fixesDiagnosis: "wrong-person",
    howToAdapt: [
      "Name the alternative the reader already uses today, not a strawman. The negation only works if the named alternative is real and current.",
      "Keep the negation specific — 'not enterprise' is sharper than 'not bloated'.",
      "Negation-positioning fails when the reader does not know the alternative. Test on cold readers.",
    ],
    relatedGlossary: ["hook", "wrong-person"],
    faqs: [
      {
        q: "Does negation-positioning work for unknown categories?",
        a: "No. The pattern depends on the reader already knowing the alternative. If the reader does not know what they are 'not', the headline reads as random.",
      },
    ],
    lastVerified: "2026-05-19",
  },

  // ── CTA button patterns ──────────────────────────────────────────────────
  {
    slug: "outcome-cta-button-swipe-file",
    title: "Outcome-CTA button swipe file",
    metaTitle: "Outcome-Specific CTA Button Patterns (SaaS)",
    metaDescription:
      "Eight structural patterns for SaaS CTA button copy that name the outcome, not the action. Replaces 'Sign up' and 'Get started'.",
    category: "cta",
    element: "Primary CTA button",
    brunsonLens: "offer",
    intro:
      "Generic CTA copy ('Sign up', 'Get started') describes the action; outcome-CTA copy describes the next thing that happens. The patterns below name the post-click state, which is what the reader is buying.",
    patterns: [
      {
        template: "[VERB] [OUTCOME]",
        slots: "Imperative verb + the result they get when the action completes.",
        filledExample: "[Send your first email]",
        sourceTeardownSlug: "resend",
      },
      {
        template: "Try [SPECIFIC FREE PATH]",
        slots:
          "Replaces 'Try it free' — name the specific path, not the trial state.",
        filledExample: "[Try a free 50-response form]",
        sourceTeardownSlug: "tally",
      },
      {
        template: "[VERB] [OBJECT] in [TIME]",
        slots: "Verb + concrete object + an honest time bound.",
        filledExample: "[Set up booking in under 2 minutes]",
        sourceTeardownSlug: "cal-com",
      },
    ],
    fixesDiagnosis: "weak-belief",
    howToAdapt: [
      "Write the next-state sentence first ('what happens after I click this?'), then compress to button length.",
      "Avoid present continuous ('Starting your trial' is worse than 'Start your trial').",
      "Test against the generic baseline — outcome-CTA wins on cold traffic about as often as it loses on warm traffic, where 'Get started' is shorthand the reader already understands.",
    ],
    relatedGlossary: ["offer", "weak-belief"],
    faqs: [
      {
        q: "Should the CTA contain the price?",
        a: "Only on a checkout-step button. The pre-checkout CTA's job is to move the reader to the offer surface; bundling price into the button surfaces it twice and dampens the price-anchoring sequence.",
      },
    ],
    lastVerified: "2026-05-19",
  },

  // ── Social proof patterns ───────────────────────────────────────────────
  {
    slug: "single-testimonial-block-swipe-file",
    title: "Single-testimonial block swipe file",
    metaTitle: "Single Testimonial Block Patterns (Indie SaaS)",
    metaDescription:
      "Structural patterns for a single high-trust testimonial block: quote + name + verifiable detail. Beats wall-of-logos on cold traffic.",
    category: "social-proof",
    element: "Above-the-fold or post-stack testimonial",
    brunsonLens: "story",
    intro:
      "A single testimonial with a verifiable detail beats a wall of logos on cold traffic. The patterns below structure one quote so the reader can verify it without leaving the page.",
    patterns: [
      {
        template: "[QUOTE]. — [NAME], [ROLE AT NAMED COMPANY]",
        slots:
          "Name, role, and company must be specific enough to be Googled. Avoid 'Founder, SaaS company'.",
        filledExample:
          "[\"It does the one thing I needed and nothing else.\"] — [Sam K., founder at a named indie SaaS]",
        sourceTeardownSlug: "senja",
      },
      {
        template: "[QUOTE]. — [NAME], [VERIFIABLE OUTCOME]",
        slots:
          "Replace role with a quantified outcome the named person can confirm.",
        filledExample:
          "[\"Live in production the same afternoon.\"] — [Sam K., shipped to 200 customers in week one]",
        sourceTeardownSlug: "resend",
      },
    ],
    fixesDiagnosis: "weak-belief",
    howToAdapt: [
      "If you do not yet have verified testimonials, ship the section as a stated absence ('We will publish customer quotes when paying customers volunteer them'). That is honest social proof.",
      "Always include a verifiable detail — Twitter handle, company URL, named outcome. Anonymous quotes read as fabricated whether they are or not.",
      "One sentence is enough. Multi-paragraph testimonials read as edited and lose trust on cold traffic.",
    ],
    relatedGlossary: ["story", "weak-belief", "verified-builder"],
    faqs: [
      {
        q: "How many testimonials are too many on a landing page?",
        a: "On cold traffic, one testimonial with a verifiable detail outperforms a row of five generic ones. On warm traffic, three to five is the comfortable ceiling.",
      },
      {
        q: "Should I publish testimonials I have not verified?",
        a: "No. The verified-builder discipline applies — only quotes from named customers with a verifiable outcome. Inflated testimonial counts are a Brunson Hard-Rule violation and quality raters flag them.",
      },
    ],
    lastVerified: "2026-05-19",
  },

  // ── Guarantee language ──────────────────────────────────────────────────
  {
    slug: "money-back-guarantee-swipe-file",
    title: "Money-back guarantee language swipe file",
    metaTitle: "Money-Back Guarantee Language Patterns (SaaS)",
    metaDescription:
      "Honest refund-trigger phrasing for SaaS offers. The guarantee carries weight only when the trigger is specific and verifiable.",
    category: "guarantee",
    element: "Guarantee block (sales page + checkout)",
    brunsonLens: "offer",
    intro:
      "A guarantee carries weight when the trigger is specific and the verifier is named. Vague guarantees ('love it or your money back') under-convert because the reader cannot picture the refund event. The patterns below structure the trigger plus the verifier in one short block.",
    patterns: [
      {
        template:
          "[SPECIFIC OUTCOME] in [TIME WINDOW], verified by [INDEPENDENT VERIFIER], or [REFUND PROMISE].",
        slots:
          "Outcome must be observable. Verifier must be a system the customer trusts — Stripe, a counter, a third party — not your own dashboard.",
        filledExample:
          "[First paying customer] in [60 days], verified by [Stripe], or [full refund].",
        sourceTeardownSlug: "stripe",
      },
      {
        template: "[REFUND PROMISE], no questions asked, within [TIME WINDOW].",
        slots:
          "Lowest-friction pattern. Works for low-ticket front-end offers where return-on-friction outweighs return-on-specificity.",
        filledExample: "[Refund the $1,] no questions asked, within [60 days].",
        sourceTeardownSlug: "lemonsqueezy",
      },
    ],
    fixesDiagnosis: "weak-belief",
    howToAdapt: [
      "Name a verifier the customer trusts more than you. Stripe, a counter, a third-party tool. 'Verified by us' adds no weight.",
      "Place the guarantee at checkout, not buried in FAQ. The moment of friction is where the language has to land.",
      "Mirror the guarantee on any OTO. Asymmetric guarantees between front-end and upsell are a trust break.",
    ],
    relatedGlossary: ["offer", "weak-belief"],
    faqs: [
      {
        q: "Does a guarantee increase refund rate?",
        a: "Marginally. A 2-8% refund rate within the guarantee window is healthy. Below 2% suggests the guarantee is not visible enough to do its conversion job; above 8% suggests an offer-fit problem the guarantee is masking.",
      },
    ],
    lastVerified: "2026-05-19",
  },

  // ── Stack-slide patterns ────────────────────────────────────────────────
  {
    slug: "stack-slide-swipe-file",
    title: "Brunson stack-slide swipe file",
    metaTitle: "Brunson Stack Slide Pattern Swipe File (SaaS)",
    metaDescription:
      "Structural patterns for a Brunson-style stack slide on a SaaS sales page. Itemized value with anchored prices, then the offer price.",
    category: "stack-slide",
    element: "Offer-page stack slide",
    brunsonLens: "offer",
    intro:
      "The stack slide is the offer-page block that itemizes each component of what the customer gets, attaches a value anchor to each line, sums them, and then reveals the actual price. The patterns below structure the slide so the math is honest and the anchor is defensible.",
    patterns: [
      {
        template:
          "[COMPONENT NAME] — [WHAT IT DOES IN ONE LINE]. Value: [$ANCHOR].",
        slots:
          "Anchor must be a price the component would plausibly carry as a standalone product or service. Inflated anchors break trust.",
        filledExample:
          "[The Playbook] — [Seven-step system, video walkthrough, weekly office hour]. Value: [$X].",
        sourceTeardownSlug: "resend",
      },
      {
        template: "Total real value: [$SUM]. Today: [$OFFER PRICE].",
        slots:
          "Sum of all component anchors, then the actual offer. The delta is the value proposition in dollars.",
        filledExample: "Total real value: [$X]. Today: [$49 / month].",
        sourceTeardownSlug: "tally",
      },
    ],
    fixesDiagnosis: "weak-offer",
    howToAdapt: [
      "Each anchor must be defensible — a price the component would carry as a standalone product, not an aspirational guess.",
      "Three to seven components is the sweet spot. Two reads as thin; eight or more reads as padding.",
      "The sum-to-offer delta should be honest. Inflating the anchors to make the delta bigger is the most common stack-slide failure mode and quality raters flag it.",
    ],
    relatedGlossary: ["stack-slide", "offer", "weak-offer"],
    faqs: [
      {
        q: "Should the stack slide be on a $1 tripwire?",
        a: "No, full stack slides are for the core offer surface (price $49+). On a $1 tripwire, the slide collapses to one or two lines because the reader is buying intent, not value math.",
      },
    ],
    lastVerified: "2026-05-19",
  },

  // ── Pricing page copy ───────────────────────────────────────────────────
  {
    slug: "pricing-page-copy-swipe-file",
    title: "Pricing page copy swipe file",
    metaTitle: "SaaS Pricing Page Copy Pattern Swipe File",
    metaDescription:
      "Structural patterns for SaaS pricing page copy: plan names, headline promises, feature lists, and crossover triggers.",
    category: "pricing-copy",
    element: "Pricing page",
    brunsonLens: "offer",
    intro:
      "Most indie SaaS pricing pages over-engineer the table and under-write the copy around it. The patterns below structure plan names, plan headlines, and the one-line promise per plan so the reader can self-select without parsing a feature matrix.",
    patterns: [
      {
        template: "[OUTCOME-NAMED PLAN], for [WHO THIS IS]",
        slots:
          "Plan name carries the outcome; subtitle names the buyer. Avoid 'Starter / Pro / Enterprise' if you can name the buyer.",
        filledExample: "[Solo,] for [the one-person founder still shipping alone]",
        sourceTeardownSlug: "linear",
      },
      {
        template: "[$X / cadence], [ONE-LINE WHAT YOU GET]",
        slots:
          "Price + one promise per plan. The feature list lives below, not in the headline.",
        filledExample: "[$49 / month,] [the full seven-step Playbook with a 60-day Stripe guarantee]",
        sourceTeardownSlug: "stripe",
      },
      {
        template: "Move up to [HIGHER PLAN] when [SPECIFIC TRIGGER]",
        slots:
          "Crossover trigger between adjacent plans — usage, team size, or feature need. Honest triggers convert better than generic 'for growing teams'.",
        filledExample: "Move up to [Team] when [you cross 5 named seats]",
        sourceTeardownSlug: "linear",
      },
    ],
    fixesDiagnosis: "weak-offer",
    howToAdapt: [
      "Write the plan-name + one-promise + price line for each tier on a single screen before drawing the feature matrix.",
      "Three tiers is the comfortable maximum for indie SaaS. Two tiers + a contact-sales third is fine. Four or more is a usability problem, not a pricing problem.",
      "The crossover trigger between plans should be one specific value, not a feature list.",
    ],
    relatedGlossary: ["offer", "weak-offer", "value-ladder"],
    faqs: [
      {
        q: "Should I show prices on the pricing page or gate them behind a contact form?",
        a: "Show them. For indie SaaS under $1,000 / month / seat, gating prices behind 'contact us' costs more conversions than it saves on under-fit leads. Reserve gated pricing for enterprise-only tiers.",
      },
    ],
    lastVerified: "2026-05-19",
  },

  // ── Above-fold hook ─────────────────────────────────────────────────────
  {
    slug: "above-fold-hook-swipe-file",
    title: "Above-fold hook swipe file",
    metaTitle: "Above-the-Fold Hook Patterns (Indie SaaS)",
    metaDescription:
      "Structural patterns for the first 600px of an indie SaaS landing page. Hook, sub-hook, primary CTA, and one trust element.",
    category: "above-fold",
    element: "Above-the-fold block (top 600px of landing page)",
    brunsonLens: "hook",
    intro:
      "The above-the-fold block has four jobs: name the outcome, name the buyer, give one credible signal, and offer one action. The patterns below structure each slot so the block carries its weight on a two-second scroll.",
    patterns: [
      {
        template:
          "H1: [OUTCOME]. Sub: [WHO IT'S FOR + WHAT'S DIFFERENT]. CTA: [OUTCOME VERB]. Trust: [ONE VERIFIABLE DETAIL].",
        slots:
          "Four slots, four sentences max. Any block longer than four sentences is fighting the scroll.",
        filledExample:
          "H1: [Bookings in 5 minutes]. Sub: [For solo founders who hate scheduling links that look like spam]. CTA: [Set up booking]. Trust: [Open source, audited]",
        sourceTeardownSlug: "cal-com",
      },
      {
        template:
          "H1: [OUTCOME-TIME]. Sub: [NEGATION POSITIONING]. CTA: [TRY SPECIFIC PATH]. Trust: [NAMED CUSTOMER COUNT].",
        slots:
          "Hooks via outcome + time, positions via negation, converts via specific free path, anchors via a counter.",
        filledExample:
          "H1: [Forms live in 5 minutes]. Sub: [Not a survey tool, not a database]. CTA: [Try a free form]. Trust: [Used by N indie founders]",
        sourceTeardownSlug: "tally",
      },
    ],
    fixesDiagnosis: "wrong-person",
    howToAdapt: [
      "Slot the headline first, the CTA second, the sub-hook third, the trust element last. Most pages over-invest in the sub-hook.",
      "Test the block at 375px width (mobile). Anything that wraps to a fifth line on mobile is too long.",
      "One trust element, not three. A single verifiable detail outperforms a wall of logos and a counter.",
    ],
    relatedGlossary: ["hook", "wrong-person", "weak-offer"],
    faqs: [
      {
        q: "Should the above-fold block have a video?",
        a: "Only if the video can autoplay muted in under two seconds and the hook still makes sense without it. Otherwise the video belongs lower on the page where the reader has chosen to slow down.",
      },
    ],
    lastVerified: "2026-05-19",
  },
];

export const SWIPE_FILE_SLUGS: ReadonlyArray<string> = SWIPE_FILE_ENTRIES.map(
  (e) => e.slug,
);

export function getSwipeFileBySlug(slug: string): SwipeFileEntry | undefined {
  return SWIPE_FILE_ENTRIES.find((e) => e.slug === slug);
}

export const SWIPE_FILE_CATEGORIES = [
  "headline",
  "cta",
  "social-proof",
  "guarantee",
  "stack-slide",
  "pricing-copy",
  "above-fold",
  "hook",
] as const;

export const SWIPE_FILE_CATEGORY_LABELS: Record<SwipeFileCategory, string> = {
  headline: "Headlines",
  cta: "CTA buttons",
  "social-proof": "Social proof",
  guarantee: "Guarantees",
  "stack-slide": "Stack slides",
  "pricing-copy": "Pricing pages",
  "above-fold": "Above-the-fold blocks",
  hook: "Hooks",
};

// ── Build-time guard: every patterns[].sourceTeardownSlug must be a real
// teardown slug in either funnel-teardowns.ts or pricing-teardowns.ts. If
// a swipe-file references a teardown that does not exist on the live site,
// this throws at module load — fails the build, no quiet drift.

export type TeardownKind = "funnel" | "pricing";

export function resolveSourceTeardown(
  slug: string,
): { kind: TeardownKind; href: string } | undefined {
  if (TEARDOWN_SLUGS.includes(slug)) {
    return { kind: "funnel", href: `/funnel-teardown/${slug}` };
  }
  if (PRICING_TEARDOWN_SLUGS.includes(slug)) {
    return { kind: "pricing", href: `/pricing-teardown/${slug}` };
  }
  return undefined;
}

{
  for (const entry of SWIPE_FILE_ENTRIES) {
    for (const p of entry.patterns) {
      if (!resolveSourceTeardown(p.sourceTeardownSlug)) {
        throw new Error(
          `swipe-files.ts: entry "${entry.slug}" references unknown teardown slug "${p.sourceTeardownSlug}". Add the teardown to funnel-teardowns.ts or pricing-teardowns.ts first, or correct the slug.`,
        );
      }
    }
  }
}
