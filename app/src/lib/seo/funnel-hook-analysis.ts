/**
 * Funnel hook structural analysis – derived analytic on the public
 * n=36 funnel-teardowns corpus (`@/lib/funnel-teardowns`).
 *
 * Surface C (linkable asset) supporting `/research/funnel-hook-distribution`.
 *
 * What this module does
 * ---------------------
 * Each teardown in our public corpus carries an authored
 * `brunsonLens.hook` pattern description – e.g. "Big enemy positioning
 * (Brunson 'Common Enemy' identity hook) plus a principle the reader
 * already half-believes." These descriptions are written to the same
 * editorial standard the Playbook teaches (Hook-Story-Offer), so a
 * structural analysis of OUR pattern descriptions is itself a useful
 * teaching artifact: it shows which structural elements the strong
 * hooks in our corpus exhibit, and which they don't.
 *
 * This module applies a 5-axis structural rubric to each pattern
 * description and emits a numeric score per axis (0/1/2) plus a 0-10
 * total. The scoring is deterministic and reproducible from the public
 * corpus alone – no per-company conversion data, no traffic numbers,
 * no fabricated metrics.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - We are NOT measuring marketing performance. We are scoring how
 *     many of the 5 structural axes our OWN pattern description
 *     exhibits. The score is a property of the description, not of
 *     the target company.
 *   - No fabricated conversion rates. No traffic claims. No "top 3
 *     worst funnels". The headline finding is "3 hook patterns score
 *     under 4/10 on our structural rubric" – a descriptive claim about
 *     our pattern descriptions, not a judgment on the companies.
 *   - The full rubric, all 36 scores, and the function that produced
 *     them are published. Anyone can re-run.
 *
 * The 5 axes
 * ----------
 *   1. Target identity        – names a specific persona/reader
 *   2. Outcome specificity    – names a concrete outcome or proof
 *   3. Polarity / tension     – contains against/for or enemy framing
 *   4. Distinct mechanism     – names a category or framework, not features
 *   5. Time / quantity ground – contains numbers, time units, or quantities
 *
 * Each axis is scored 0/1/2 by keyword and phrase pattern matching
 * against the lowercased pattern string. The rubric anchors are
 * documented inline below so any reader can verify the scoring logic
 * matches their reading of the same string.
 */

import { TEARDOWNS, type FunnelTeardown } from "@/lib/funnel-teardowns";

// ---------------------------------------------------------------------------
// Rubric
// ---------------------------------------------------------------------------

/** One of the five structural axes the rubric scores. */
export type HookAxis =
  | "targetIdentity"
  | "outcomeSpecificity"
  | "polarity"
  | "distinctMechanism"
  | "timeQuantityGrounding";

/**
 * A single axis definition. The `keywords` array is the literal
 * substring set the scorer matches against the lowercased pattern.
 * Two distinct hits push the score to 2; one hit scores 1; no hit
 * scores 0.
 */
export interface AxisRubric {
  axis: HookAxis;
  label: string;
  short: string;
  question: string;
  anchors: {
    /** What "0" looks like. */
    zero: string;
    /** What "1" looks like. */
    one: string;
    /** What "2" looks like. */
    two: string;
  };
  /** Substrings whose presence count as evidence of this axis. */
  keywords: ReadonlyArray<string>;
}

/**
 * The published rubric. The shape is intentionally simple so a reader
 * scanning the page can check our scoring by re-reading any pattern
 * description.
 */
export const HOOK_RUBRIC: ReadonlyArray<AxisRubric> = [
  {
    axis: "targetIdentity",
    label: "Target identity",
    short: "Identity",
    question: "Does the hook name a specific reader or persona?",
    anchors: {
      zero: "No identity language at all.",
      one: "Generic identity ('the reader', 'people', 'users').",
      two: "Specific persona ('indie founder', 'creator', 'B2B SaaS team').",
    },
    keywords: [
      "indie founder",
      "founder",
      "creator",
      "developer",
      "designer",
      "team",
      "agency",
      "saas",
      "writer",
      "reader",
      "user",
      "person",
      "buyer",
      "customer",
      "audience",
      "identity hook",
      "identity ",
      "persona",
      "for sales",
      "for teams",
      "for marketers",
      "for engineers",
      "for designers",
      "selling to",
      "looks like",
      "b2b",
      "this is what",
    ],
  },
  {
    axis: "outcomeSpecificity",
    label: "Outcome specificity",
    short: "Outcome",
    question: "Does the hook name a concrete outcome, proof, or promise?",
    anchors: {
      zero: "No outcome language.",
      one: "Generic outcome ('better', 'easier', 'faster').",
      two: "Concrete outcome with a verifiable shape ('free forever', 'unlimited', '$X').",
    },
    keywords: [
      "free",
      "unlimited",
      "outcome",
      "result",
      "promise",
      "guarantee",
      "proof",
      "transparent",
      "transparency",
      "deliverable",
      "ship",
      "delivers",
      "earn",
      "revenue",
      "convert",
      "saves",
      "save you",
      "without",
      "better",
      "easier",
      "faster",
      "removes",
      "no more",
      "output",
      "stop ",
      "fewer",
      "improves",
      "more ",
    ],
  },
  {
    axis: "polarity",
    label: "Polarity / tension",
    short: "Polarity",
    question: "Does the hook contain a positive/negative tension?",
    anchors: {
      zero: "Flat description with no tension.",
      one: "Implicit tension (one strong claim, no counter).",
      two: "Explicit polarity ('against X, for Y', 'not a Z, a W').",
    },
    keywords: [
      "enemy",
      "common enemy",
      "against",
      "versus",
      "vs.",
      "vs ",
      "not a ",
      "not the ",
      "instead of",
      "rather than",
      "without ",
      "anti",
      "polar",
      "reject",
      "refuse",
      "broken",
      "fix",
      "fixes",
      "stop",
      "stops",
      "distinct from",
      "different from",
      "alternative",
      "alone",
      "rare in",
    ],
  },
  {
    axis: "distinctMechanism",
    label: "Distinct mechanism",
    short: "Mechanism",
    question: "Does the hook name a category, framework, or mechanism (not just features)?",
    anchors: {
      zero: "Feature-list language.",
      one: "Names one mechanism word ('framework', 'method').",
      two: "Names a specific framework or category ('Common Enemy', 'new opportunity', 'value ladder').",
    },
    keywords: [
      "framework",
      "method",
      "system",
      "mechanism",
      "category",
      "new opportunity",
      "common enemy",
      "value ladder",
      "expert secrets",
      "dotcom",
      "brunson",
      "playbook",
      "engine",
      "model",
      "structure",
      "principle",
      "anchor",
      "lens",
      "approach",
      "moat",
      "vehicle",
      "positioning",
      "reframe",
      "pivot",
      "shift ",
      "canon",
      "mousetrap",
      "secret",
    ],
  },
  {
    axis: "timeQuantityGrounding",
    label: "Time / quantity grounding",
    short: "Quantity",
    question: "Does the hook ground in numbers, time, or quantity?",
    anchors: {
      zero: "No numbers, no time units, no quantities.",
      one: "One generic quantity word ('many', 'all', 'every').",
      two: "Specific number, time unit, or measurable quantity ('60 days', '$1', 'one per week').",
    },
    keywords: [
      "forever",
      "unlimited",
      "every",
      "all",
      "one ",
      "single",
      "first",
      "1 ",
      "100",
      "60",
      "30",
      "day",
      "week",
      "month",
      "year",
      "today",
      "now",
      "minute",
      "second",
      "hour",
      "$",
      "free",
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Per-axis score from 0 (no evidence) to 2 (strong evidence). */
export type AxisScore = 0 | 1 | 2;

/** Full scored result for one hook pattern. */
export interface HookScore {
  slug: string;
  displayName: string;
  category: string;
  /** The exact pattern string we scored, taken verbatim from the corpus. */
  pattern: string;
  /** Score per axis, keyed by HookAxis. Each value is 0, 1, or 2. */
  byAxis: Record<HookAxis, AxisScore>;
  /** Sum of byAxis values. Range 0-10. */
  total: number;
  /** Subset of axes scoring 0 – useful for "what's missing" UX. */
  missingAxes: ReadonlyArray<HookAxis>;
  /** Substrings that fired across the rubric, joined per axis (audit aid). */
  hits: Record<HookAxis, ReadonlyArray<string>>;
}

/**
 * Apply the rubric to one pattern string. Public so any consumer
 * (the page, the JSON export, a future re-scoring on an updated rubric)
 * can call it directly.
 */
export function scoreHookPattern(
  pattern: string,
  meta: { slug: string; displayName: string; category: string },
): HookScore {
  const lower = pattern.toLowerCase();
  const byAxis = {} as Record<HookAxis, AxisScore>;
  const hits = {} as Record<HookAxis, ReadonlyArray<string>>;

  for (const axis of HOOK_RUBRIC) {
    const matched: string[] = [];
    for (const kw of axis.keywords) {
      if (lower.includes(kw)) {
        matched.push(kw);
      }
    }
    const score: AxisScore = matched.length >= 2 ? 2 : matched.length === 1 ? 1 : 0;
    byAxis[axis.axis] = score;
    hits[axis.axis] = matched;
  }

  const total = (Object.values(byAxis) as AxisScore[]).reduce<number>(
    (a, b) => a + b,
    0,
  );
  const missingAxes = HOOK_RUBRIC.filter(
    (a) => byAxis[a.axis] === 0,
  ).map((a) => a.axis);

  return {
    slug: meta.slug,
    displayName: meta.displayName,
    category: meta.category,
    pattern,
    byAxis,
    total,
    missingAxes,
    hits,
  };
}

/**
 * Score every teardown in the corpus. Pure function – call site is
 * the page and the JSON export route. Stable order (corpus order).
 */
export function getAllHookScores(): ReadonlyArray<HookScore> {
  return TEARDOWNS.map((t: FunnelTeardown) =>
    scoreHookPattern(t.brunsonLens.hook, {
      slug: t.slug,
      displayName: t.displayName,
      category: t.category,
    }),
  );
}

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export interface HookDistributionSummary {
  /** Total scored. */
  n: number;
  /** Mean total score. Rounded to 1 decimal. */
  mean: number;
  /** Median total score. */
  median: number;
  /** Min total score. */
  min: number;
  /** Max total score. */
  max: number;
  /** Number of patterns scoring at or below 4 (the headline finding). */
  belowFourCount: number;
  /** Per-axis mean score across the corpus, rounded to 1 decimal. */
  axisMeans: Record<HookAxis, number>;
  /** Histogram of total scores 0..10. histogram[i] = count of patterns at score i. */
  histogram: ReadonlyArray<number>;
}

/** Compute the distribution summary for a list of scored hooks. */
export function summarizeDistribution(
  scored: ReadonlyArray<HookScore>,
): HookDistributionSummary {
  if (scored.length === 0) {
    const emptyAxis = {} as Record<HookAxis, number>;
    for (const a of HOOK_RUBRIC) emptyAxis[a.axis] = 0;
    return {
      n: 0,
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      belowFourCount: 0,
      axisMeans: emptyAxis,
      histogram: Array(11).fill(0),
    };
  }
  const totals = scored.map((s) => s.total).sort((a, b) => a - b);
  const sum = totals.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / totals.length) * 10) / 10;
  const median =
    totals.length % 2 === 0
      ? (totals[totals.length / 2 - 1] + totals[totals.length / 2]) / 2
      : totals[Math.floor(totals.length / 2)];
  const min = totals[0];
  const max = totals[totals.length - 1];
  const belowFourCount = scored.filter((s) => s.total <= 4).length;

  const axisMeans = {} as Record<HookAxis, number>;
  for (const a of HOOK_RUBRIC) {
    const axisSum = scored.reduce((acc, s) => acc + s.byAxis[a.axis], 0);
    axisMeans[a.axis] = Math.round((axisSum / scored.length) * 10) / 10;
  }

  const histogram = Array<number>(11).fill(0);
  for (const s of scored) histogram[s.total]++;

  return { n: scored.length, mean, median, min, max, belowFourCount, axisMeans, histogram };
}

/**
 * The lowest-scoring N hook patterns, stable order. The page renders
 * the bottom 3 by default; the JSON export carries the full sort.
 */
export function lowestScoring(
  scored: ReadonlyArray<HookScore>,
  n = 3,
): ReadonlyArray<HookScore> {
  return [...scored]
    .sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, n);
}

/**
 * The highest-scoring N hook patterns. Symmetric to lowestScoring –
 * used for the contrast section on the research page.
 */
export function highestScoring(
  scored: ReadonlyArray<HookScore>,
  n = 3,
): ReadonlyArray<HookScore> {
  return [...scored]
    .sort((a, b) => {
      if (a.total !== b.total) return b.total - a.total;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, n);
}

// ---------------------------------------------------------------------------
// Convenience – computed once at module load
// ---------------------------------------------------------------------------

export const ALL_HOOK_SCORES: ReadonlyArray<HookScore> = getAllHookScores();
export const HOOK_DISTRIBUTION: HookDistributionSummary = summarizeDistribution(
  ALL_HOOK_SCORES,
);
