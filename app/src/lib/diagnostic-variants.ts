/**
 * Diagnostic Quiz Variant Resolver.
 *
 * Inputs:  the three NEW survey signals (primary_goal, hours_per_week,
 *          biggest_fear) PLUS the legacy bucket from assignBucket().
 * Outputs: three orthogonal template variants applied on the result page:
 *
 *   1. headlineVariant  → which result-page headline overlay to render.
 *   2. scorecardTone    → which tone preface to render above the scorecard.
 *   3. planEmphasis     → which 30-day plan emphasis preface to render.
 *
 * The variants do NOT replace the LLM-generated diagnosis. They wrap it with
 * bucket-aware copy that explains the through-line and makes the per-answer
 * branching legible to the visitor — Brunson DCS Secret 15: the bridge has
 * to feel like it was written for THIS founder, not for a category.
 *
 * Pure functions, no I/O, no side effects. Trivially unit-testable.
 *
 * Source:
 *   - 2026-05-21 trend synthesis: quiz funnels with per-answer branching
 *     hit 40.1% avg conversion (Dashform 2026); the differentiator is
 *     visible personalization, not just routing.
 *   - Brunson DCS Secret 15 (Survey Funnel + Bridge Scripts).
 *   - strategy/workbooks/01-sales-funnel-secrets.md §6 (Reluctant Hero voice).
 */

import type {
  Bucket,
  PrimaryGoal,
  HoursPerWeek,
  BiggestFear,
  TimeSinceLaunch,
} from "@/lib/diagnostic";

// ---------------------------------------------------------------------------
// Headline variants — chosen by primary_goal × bucket family.
// Each variant is a (preheader, headline) pair that sits above the LLM-
// generated explanation on /diagnostic/result. Reluctant Hero voice, no
// exclamation marks, no en-dash/em-dash difference enforced upstream.
// ---------------------------------------------------------------------------

export type HeadlineVariant =
  | "first_customer_avoider"
  | "first_customer_builder"
  | "first_customer_default"
  | "replace_income"
  | "scale_revenue"
  | "validate_pmf"
  | "build_audience"
  | "default";

export type HeadlineCopy = {
  preheader: string;
  headline: string;
  /**
   * 1–2 sentence framing that ties THIS founder's stated goal to the
   * diagnosis they are about to read. Always present.
   */
  framing: string;
};

export const HEADLINE_COPY: Record<HeadlineVariant, HeadlineCopy> = {
  first_customer_avoider: {
    preheader: "Your first paying customer",
    headline: "Your first customer is one named person, not a category.",
    framing:
      "You told me you want the first paying customer. The diagnosis below names the upstream reason it has not arrived. Read it the way you would read a letter about your own avoidance.",
  },
  first_customer_builder: {
    preheader: "Your first paying customer",
    headline: "Your first customer will not come from another feature.",
    framing:
      "You told me you want the first paying customer. You also told me building more was your biggest attempt. The diagnosis below is the work that produces a customer instead of more product.",
  },
  first_customer_default: {
    preheader: "Your first paying customer",
    headline: "Your first paying customer is downstream of one specific decision.",
    framing:
      "You told me you want the first paying customer. The diagnosis below names the one upstream decision that, when made, lets every other tactic start working.",
  },
  replace_income: {
    preheader: "Replace your income",
    headline: "Replacing income starts with naming one buyer, not finding a hundred.",
    framing:
      "You told me the goal is to replace what your day job pays. Income replacement is a math problem ON TOP of a clarity problem. The diagnosis below names the clarity problem first.",
  },
  scale_revenue: {
    preheader: "Scale past where you are",
    headline: "Scaling past where you are is a different job than getting here.",
    framing:
      "You told me the goal is to scale the revenue you already have. The diagnosis below is read through that filter: the bottleneck you face now is not the one you faced at zero.",
  },
  validate_pmf: {
    preheader: "Validate product–market fit",
    headline: "PMF is a pattern, not an opinion. The pattern starts with one buyer.",
    framing:
      "You told me the goal is to validate PMF. The diagnosis below is read through that filter: PMF is what shows up after one named buyer says the offer is exactly right, twice in a row.",
  },
  build_audience: {
    preheader: "Build the audience first",
    headline: "Audience without a named buyer becomes content, not revenue.",
    framing:
      "You told me the goal is to build the audience first. The diagnosis below is read through that filter: an audience is a multiplier on a working offer, and a divider on a vague one.",
  },
  default: {
    preheader: "Your diagnosis",
    headline: "The upstream gap on your page, in plain language.",
    framing:
      "The diagnosis below names the one upstream gap on your page. Fix it first and the rest of the work gets easier.",
  },
};

// ---------------------------------------------------------------------------
// Scorecard tone — chosen by hours_per_week × time_since_launch.
// Sets the tone preface that sits above the three-axis scorecard.
// ---------------------------------------------------------------------------

export type ScorecardTone = "urgent" | "patient" | "sober" | "compounding";

export type ScorecardToneCopy = {
  label: string;
  /** 2-sentence preface that sets emotional context for the scorecard. */
  preface: string;
};

export const SCORECARD_TONE_COPY: Record<ScorecardTone, ScorecardToneCopy> = {
  urgent: {
    label: "Read this with urgency",
    preface:
      "You told me you have under five hours a week and have been at this for ninety-plus days. Read the lowest score first. That is the only axis worth your hours this month — the others are leverage that compounds once it is fixed.",
  },
  patient: {
    label: "Read this with patience",
    preface:
      "You told me you have real hours and you shipped recently. You have runway. Read all three scores together. Fix the lowest first, but you have room to compound improvements on the other two without panic.",
  },
  sober: {
    label: "Read this soberly",
    preface:
      "Three scores. The lowest one is the upstream gap. Fix that one first, then the others get easier. No score below means the page is unsalvageable. It means there is real work to do, and the work is namable.",
  },
  compounding: {
    label: "Read this as a compounding bet",
    preface:
      "You have hours and you have been at this long enough to know what flat feels like. Treat the lowest score as the first compounding bet: fix it deeply, document the fix, and the discipline carries to the other two.",
  },
};

// ---------------------------------------------------------------------------
// Plan emphasis — chosen by biggest_fear (with bucket fallback).
// Sets the emphasis preface above the 30-day plan grid.
// ---------------------------------------------------------------------------

export type PlanEmphasis =
  | "audience_discovery"
  | "distribution_first"
  | "ship_imperfect"
  | "organic_before_paid"
  | "credibility_build"
  | "default";

export type PlanEmphasisCopy = {
  label: string;
  preface: string;
};

export const PLAN_EMPHASIS_COPY: Record<PlanEmphasis, PlanEmphasisCopy> = {
  audience_discovery: {
    label: "Plan emphasis: audience discovery",
    preface:
      "You told me the fear is picking the wrong audience. The four weeks below front-load named-customer conversations. By week 2 you should be able to point at one real person whose pain your offer rhymes with. Everything else in the plan is downstream of that.",
  },
  distribution_first: {
    label: "Plan emphasis: distribution first",
    preface:
      "You told me the fear is no distribution. The plan below treats distribution as the first deliverable, not the last. Week 1 ships the smallest distribution loop you can run alone; weeks 2-4 sharpen the offer the loop sends traffic to.",
  },
  ship_imperfect: {
    label: "Plan emphasis: ship before ready",
    preface:
      "You told me the fear is the product is not ready. The plan below assumes shipped beats perfect. Week 1 shrinks the offer to the smallest thing one named buyer would pay for; weeks 2-4 widen only after that buyer says yes.",
  },
  organic_before_paid: {
    label: "Plan emphasis: organic before paid",
    preface:
      "You told me the fear is wasting money on ads. The plan below earns the right to spend by proving the offer organically first. No paid deliverables appear until week 4, and only if the offer has converted at least one organic customer.",
  },
  credibility_build: {
    label: "Plan emphasis: credibility build",
    preface:
      "You told me the fear is not being seen as the expert. The plan below builds your credibility surface in parallel with the offer rewrite. Each week ships one public artifact under your name — not a brand, not a category, you.",
  },
  default: {
    label: "Your 30-day plan",
    preface:
      "Four weeks. Each deliverable is verb-led and completable in one work session. Week 1 fixes the lowest-scoring axis; weeks 2-4 compound on that fix.",
  },
};

// ---------------------------------------------------------------------------
// Resolvers.
// ---------------------------------------------------------------------------

export type QuizSignals = {
  primary_goal: PrimaryGoal | null;
  hours_per_week: HoursPerWeek | null;
  biggest_fear: BiggestFear | null;
};

export type ResolvedVariants = {
  headline: HeadlineVariant;
  scorecard: ScorecardTone;
  plan: PlanEmphasis;
};

/**
 * Map (primary_goal × bucket) to a headline variant.
 *
 * The most specific combinations win — "first_customer" × "customer_avoider"
 * is the modal avatar bucket and gets its own variant; everything else falls
 * back to the primary_goal-only headline; if there's no primary_goal at all
 * (legacy row), we land on "default".
 */
export function resolveHeadlineVariant(
  signals: QuizSignals,
  bucket: Bucket | null,
): HeadlineVariant {
  const goal = signals.primary_goal;
  if (!goal) return "default";

  if (goal === "first_customer") {
    if (bucket === "customer_avoider" || bucket === "tactic_shopper") {
      return "first_customer_avoider";
    }
    if (bucket === "stuck_builder") return "first_customer_builder";
    return "first_customer_default";
  }
  if (goal === "replace_income") return "replace_income";
  if (goal === "scale_revenue") return "scale_revenue";
  if (goal === "validate_pmf") return "validate_pmf";
  if (goal === "build_audience") return "build_audience";

  // Exhaustiveness guard — TypeScript will catch a missing branch above the
  // moment a new PrimaryGoal lands.
  return "default";
}

/**
 * Map (hours_per_week × time_since_launch) to a scorecard tone.
 * Time-since-launch is part of the legacy survey, not the new quiz fields —
 * we accept it as an input so the result page can pass through both.
 */
export function resolveScorecardTone(
  signals: QuizSignals,
  timeSinceLaunch: TimeSinceLaunch | null,
): ScorecardTone {
  const hours = signals.hours_per_week;
  if (!hours) return "sober";

  if (hours === "under_5" && timeSinceLaunch === "90_plus") return "urgent";
  if (hours === "fifteen_plus" && timeSinceLaunch === "under_30") {
    return "patient";
  }
  if (hours === "fifteen_plus" && timeSinceLaunch === "90_plus") {
    return "compounding";
  }
  return "sober";
}

/**
 * Map biggest_fear to plan emphasis. Bucket isn't used here — the fear
 * answer is the strongest signal for what the founder is willing to read
 * in a 30-day plan, regardless of bucket. "none" and null fall through to
 * the generic default.
 */
export function resolvePlanEmphasis(
  signals: QuizSignals,
): PlanEmphasis {
  const fear = signals.biggest_fear;
  if (!fear || fear === "none") return "default";

  if (fear === "wrong_audience") return "audience_discovery";
  if (fear === "no_distribution") return "distribution_first";
  if (fear === "not_ready") return "ship_imperfect";
  if (fear === "ad_waste") return "organic_before_paid";
  if (fear === "not_expert") return "credibility_build";

  return "default";
}

/**
 * Single-call convenience: resolve all three variants for a lead.
 * Used by /diagnostic/result and /diagnosis/[id] when rendering.
 */
export function resolveAllVariants(
  signals: QuizSignals,
  bucket: Bucket | null,
  timeSinceLaunch: TimeSinceLaunch | null,
): ResolvedVariants {
  return {
    headline: resolveHeadlineVariant(signals, bucket),
    scorecard: resolveScorecardTone(signals, timeSinceLaunch),
    plan: resolvePlanEmphasis(signals),
  };
}
