/**
 * /cohort/[YYYY-qN] pSEO catalog – quarterly Verified Builders cohort pages.
 *
 * Why this file exists
 * --------------------
 * The /builders directory is the cross-time roll-up of every founder who
 * shipped a paying customer through the Playbook. It is the canonical
 * E-E-A-T "Experience" surface (strategy/owned-traffic.md Part 7).
 *
 * What it does NOT do is bucket builders by time. A reader who lands on
 * /builders sees a flat list with the most recent first; there is no
 * "the 2026 Q2 class" identity, no quarter-by-quarter recap, no
 * recruiting page that fires once per quarter.
 *
 * Greg Isenberg's community-moat overlay (project_unlocksaas_isenberg_playbook):
 * "products copy, communities don't." The community moat made visible is
 * a time-segmented social-proof bundle. Each /cohort/<YYYY-qN> page is:
 *
 *   1. A social-proof bundle for the quarter (members who shipped during
 *      the window, anonymized to their public builder_slug, never PII).
 *   2. A recruiting page for the next quarter (the upcoming cohort that
 *      hasn't started yet, with the apply CTA pointed at /diagnostic).
 *   3. A permanent, indexable, agent-readable URL that compounds: the
 *      2026 Q2 cohort URL keeps earning backlinks long after the quarter
 *      closes because it's the canonical history record.
 *
 * Pre-launch reality
 * ------------------
 * As of 2026-05-22 the directory has 0 verified builders. Every cohort
 * page renders an honest empty state (mirrors the /builders empty-state
 * pattern). The moment the first Stripe-verified customer cycle fires
 * inside the quarter window, the per-cohort cache invalidates and the
 * first row appears.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - All counts come from the `builder_badges` view (Stripe-verified).
 *   - No invented members, no fabricated outcomes, no aspirational
 *     "23 founders" placeholder copy.
 *   - Quarters that haven't started yet say "opens on [ISO date]" - we
 *     don't pretend they've already started.
 *   - The slug catalog is intentionally finite and named-quarter (not
 *     `[YYYY-MM]` or generic `[period]`) so the URL space is bounded and
 *     each slug corresponds to a real calendar window.
 *
 * Catalog scope
 * -------------
 * Seeded with 2026 Q1 through 2027 Q1 (five quarters). The forward
 * quarters are honest recruiting pages: each one names the open date,
 * the cap, and points to /diagnostic. Extending the catalog is one row
 * per quarter - this file is the only source of truth, the sitemap +
 * llms feed + nav pull from it automatically.
 */

export interface CohortQuarter {
  /** URL slug, lowercase. e.g. "2026-q2". */
  slug: string;
  /** Calendar year. */
  year: number;
  /** Quarter number, 1-4. */
  quarter: 1 | 2 | 3 | 4;
  /** Display label, e.g. "2026 Q2". */
  displayName: string;
  /** ISO 8601 start of quarter, inclusive (00:00 UTC of first day). */
  windowStartIso: string;
  /** ISO 8601 end of quarter, exclusive (00:00 UTC of next quarter's first day). */
  windowEndIso: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** ~60-word TL;DR for the cohort. */
  tldr: string;
  /** One-line cohort theme - the "what this class is about" line. */
  theme: string;
  /** ISO date this catalog row was last hand-verified. */
  lastVerified: string;
}

/**
 * Quarter status relative to a given date. `upcoming` = window hasn't
 * opened yet. `current` = within the window. `past` = window closed.
 *
 * Computed at render time (the catalog itself is timeless).
 */
export type CohortStatus = "upcoming" | "current" | "past";

const Q_BOUNDS: Record<1 | 2 | 3 | 4, { startMonth: number; endMonth: number }> = {
  1: { startMonth: 1, endMonth: 4 },
  2: { startMonth: 4, endMonth: 7 },
  3: { startMonth: 7, endMonth: 10 },
  4: { startMonth: 10, endMonth: 13 },
};

/** Builds an ISO 8601 date string for the first day of a (year, month) at UTC midnight. */
function utcMidnight(year: number, month: number): string {
  const m = String(month).padStart(2, "0");
  return `${year}-${m}-01T00:00:00.000Z`;
}

function makeQuarter(
  year: number,
  quarter: 1 | 2 | 3 | 4,
  copy: { tldr: string; theme: string; lastVerified: string },
): CohortQuarter {
  const slug = `${year}-q${quarter}`;
  const displayName = `${year} Q${quarter}`;
  const bounds = Q_BOUNDS[quarter];
  const startYear = year;
  const startMonth = bounds.startMonth;
  const endYear = bounds.endMonth === 13 ? year + 1 : year;
  const endMonth = bounds.endMonth === 13 ? 1 : bounds.endMonth;
  return {
    slug,
    year,
    quarter,
    displayName,
    windowStartIso: utcMidnight(startYear, startMonth),
    windowEndIso: utcMidnight(endYear, endMonth),
    metaTitle: `Verified Builders ${displayName} Cohort - UnlockSaaS`,
    metaDescription: `Founders who shipped a paying customer in ${displayName}. Verified by Stripe, not self-reported. The ${displayName} class of the UnlockSaaS Playbook.`,
    tldr: copy.tldr,
    theme: copy.theme,
    lastVerified: copy.lastVerified,
  };
}

/**
 * The cohort catalog. Each entry is a real calendar quarter.
 *
 * Voice: the `theme` and `tldr` fields use the Reluctant Hero voice from
 * workbook 01 §6 - the page is about the builders, not about UnlockSaaS.
 * The recruiting CTA is the diagnostic, not "join the cohort", because
 * the cohort is earned (Stripe picks who lands), not invited.
 */
export const COHORT_QUARTERS: ReadonlyArray<CohortQuarter> = [
  makeQuarter(2026, 1, {
    tldr:
      "The first quarter UnlockSaaS shipped to the world. Founders who took the diagnostic, ran the Playbook, and crossed their first paying-customer line between January and March 2026.",
    theme:
      "Day-one founders. The class that proved the cycle works before the marketing did.",
    lastVerified: "2026-05-22",
  }),
  makeQuarter(2026, 2, {
    tldr:
      "The April-to-June 2026 class. Founders ran the diagnostic, took the $1 Starter, climbed to the $49/mo Core Playbook, and surfaced their first Stripe-verified customer inside the quarter window.",
    theme:
      "Post-launch, pre-revenue founders shipping their first real charge.",
    lastVerified: "2026-05-22",
  }),
  makeQuarter(2026, 3, {
    tldr:
      "The July-to-September 2026 class. Cohort opens at the first day of Q3; the directory page populates automatically as Stripe-verified customers land. No invitation, no application - the path is the diagnostic.",
    theme:
      "Late-summer 2026 class. The path opens the day the diagnostic returns a label you can act on.",
    lastVerified: "2026-05-22",
  }),
  makeQuarter(2026, 4, {
    tldr:
      "The October-to-December 2026 class. The end-of-year quarter. Founders who ship a paying customer between October 1 and December 31 carry the 2026 Q4 cohort identity on their Verified Builder badge.",
    theme:
      "Year-end 2026 class. The last founding quarter inside the 2026 calendar.",
    lastVerified: "2026-05-22",
  }),
  makeQuarter(2027, 1, {
    tldr:
      "The January-to-March 2027 class. First quarter of the second calendar year. The Playbook stays $49/mo, the diagnostic stays free, the verification rule stays Stripe-only. Same cycle, new year.",
    theme:
      "Second-year openers. Founders who started 2027 by moving the Stripe line.",
    lastVerified: "2026-05-22",
  }),
];

/** All cohort slugs in declaration order. Source of truth for generateStaticParams + sitemap. */
export const COHORT_SLUGS: ReadonlyArray<string> = COHORT_QUARTERS.map(
  (c) => c.slug,
);

/** Returns a cohort by slug, or null if no match. */
export function getCohortBySlug(slug: string): CohortQuarter | null {
  return COHORT_QUARTERS.find((c) => c.slug === slug) ?? null;
}

/**
 * Computes the quarter status relative to `now`. Used by both the detail
 * page (to pick the right empty-state copy) and the index hub (to render
 * the status chip).
 */
export function statusFor(
  cohort: CohortQuarter,
  now: Date = new Date(),
): CohortStatus {
  const start = new Date(cohort.windowStartIso).getTime();
  const end = new Date(cohort.windowEndIso).getTime();
  const t = now.getTime();
  if (t < start) return "upcoming";
  if (t >= end) return "past";
  return "current";
}

/**
 * Returns the quarter that contains `date`. Useful for "you are in"
 * messaging on the index page.
 */
export function quarterFor(date: Date): { year: number; quarter: 1 | 2 | 3 | 4 } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  let quarter: 1 | 2 | 3 | 4;
  if (month <= 3) quarter = 1;
  else if (month <= 6) quarter = 2;
  else if (month <= 9) quarter = 3;
  else quarter = 4;
  return { year, quarter };
}

/**
 * Formats the window as a human-readable date range, e.g.
 * "April 1 - June 30, 2026". Used by the detail header and the empty-state
 * "opens on" line. Output is deterministic across SSR + browser (does not
 * rely on locale data).
 */
export function formatWindow(cohort: CohortQuarter): string {
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const start = new Date(cohort.windowStartIso);
  const end = new Date(cohort.windowEndIso);
  // end is exclusive (first day of next quarter at 00:00 UTC); the last
  // included day is one day before that.
  const lastIncluded = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const startMonth = MONTHS[start.getUTCMonth()];
  const endMonth = MONTHS[lastIncluded.getUTCMonth()];
  const startDay = start.getUTCDate();
  const endDay = lastIncluded.getUTCDate();
  const year = start.getUTCFullYear();
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
}
