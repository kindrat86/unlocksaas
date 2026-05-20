/**
 * State of Post-Launch Pre-Revenue SaaS – aggregator + integrity gate.
 *
 * Reads anonymized counts from the diagnostic_leads table and shapes them
 * into the per-edition findings that the report page renders.
 *
 * Privacy contract
 * ----------------
 * This module reads ONLY the following columns from diagnostic_leads:
 *   - label          (Wrong Person | Weak Offer | Weak Belief | error)
 *   - bucket         (free-text bucket tag, may be null)
 *   - created_at     (ISO timestamp; bucketed by calendar year)
 *
 * It NEVER reads: email, ip, user_agent, product_url, headline,
 * explanation, evidence, analysis_detail, recent_revenue, biggest_attempt.
 * Those fields could re-identify a founder; the published numbers must be
 * de-identified by construction. The aggregator's return type carries
 * counts only, never any row-level field.
 *
 * Integrity gate
 * --------------
 * Below MIN_REPORT_N (see lib/state-of-saas.ts), the helpers return a
 * `belowThreshold` shape that the page template renders as the honest
 * "enrollment open" zero-state. Above threshold, the helpers return the
 * full findings shape with percentages. There is no "show the numbers
 * anyway" override — the gate is the editorial discipline.
 *
 * Caching
 * -------
 * Per-request deduplication via `React.cache()`. Page-level revalidation
 * via `export const revalidate = 3600` on the consuming route (1-hour
 * ISR). `'use cache'` is intentionally NOT used here because
 * `cacheComponents: false` in next.config — see the comment block in
 * next.config.ts. When Cache Components is re-enabled, this file becomes
 * one `'use cache' + cacheTag("diagnostic_leads_aggregate")` addition
 * and the underlying caller stays unchanged.
 */

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/server";
import { CURRENT_EDITION_YEAR, MIN_REPORT_N } from "@/lib/state-of-saas";

/**
 * Findings rendered when the edition has at least MIN_REPORT_N rows in
 * its calendar-year window.
 */
export interface PublishedFindings {
  readonly status: "published";
  /** Total submissions in the edition's calendar-year window. >= MIN_REPORT_N. */
  readonly totalSubmissions: number;
  /** Diagnostic label distribution as ordered rows so render order is
   *  deterministic and matches the body-copy narrative. */
  readonly labelDistribution: ReadonlyArray<{
    readonly label: "Wrong Person" | "Weak Offer" | "Weak Belief";
    readonly count: number;
    /** Integer percent (0-100), rounded to nearest. Sum may be 99 or 101
     *  by one due to rounding; the page template discloses this honestly. */
    readonly percent: number;
  }>;
  /** ISO date of the most recent submission included. Drives
   *  Article.dateModified for the published Report. */
  readonly mostRecentSubmissionAt: string;
}

/**
 * Zero-state shape rendered when the edition has fewer than MIN_REPORT_N
 * rows. Carries the current count + the threshold so the page can render
 * a real progress bar instead of generic "coming soon" prose.
 */
export interface BelowThresholdFindings {
  readonly status: "below_threshold";
  /** Current sample count in the edition's window. May be 0. */
  readonly totalSubmissions: number;
  /** Threshold the cohort must reach before findings publish. */
  readonly threshold: number;
}

export type EditionFindings = PublishedFindings | BelowThresholdFindings;

/**
 * Row shape returned by the .select() below. Mirrors the columns we
 * actually request — the type narrows so a future schema change that
 * removes one of these columns surfaces as a type error at build time.
 */
interface AggregateRow {
  readonly label: string;
  readonly created_at: string;
}

/**
 * Calendar-year window helpers. UTC anchoring — every edition's window
 * is defined in UTC so the same row lands in the same edition regardless
 * of where the diagnostic was submitted from.
 */
function yearWindowUtc(year: number): { gte: string; lt: string } {
  return {
    gte: `${year}-01-01T00:00:00Z`,
    // Half-open right edge so a row with created_at exactly at midnight
    // on 2027-01-01 lands in the 2027 edition, not the 2026 one.
    lt: `${year + 1}-01-01T00:00:00Z`,
  };
}

/**
 * Per-request cached fetch. React.cache() dedupes within a single render
 * pass so the page body, the metadata generator, and the OG image route
 * (when wired to consume findings) all share one Supabase round-trip.
 *
 * Errors are swallowed and treated as "no data yet" — the page should
 * never crash because the analytics table is temporarily unreachable;
 * it should fall back to the honest below-threshold zero-state.
 */
const fetchYearRows = cache(async function fetchYearRows(
  year: number,
): Promise<ReadonlyArray<AggregateRow>> {
  const { gte, lt } = yearWindowUtc(year);
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("diagnostic_leads")
      .select("label, created_at")
      .gte("created_at", gte)
      .lt("created_at", lt);
    if (error) {
      console.error("[state-of-saas] aggregate read failed", error);
      return [];
    }
    return (data ?? []) as ReadonlyArray<AggregateRow>;
  } catch (err) {
    console.error("[state-of-saas] aggregate read threw", err);
    return [];
  }
});

/** Map raw label tokens to the three public-facing labels. The diagnostic
 *  engine stores tokens; the report publishes the canonical display name.
 *  `error` rows (engine failures) are excluded from the cohort — they
 *  represent infrastructure failures, not founder diagnoses. */
function publicLabel(
  token: string,
): "Wrong Person" | "Weak Offer" | "Weak Belief" | null {
  if (token === "wrong_person") return "Wrong Person";
  if (token === "weak_offer") return "Weak Offer";
  if (token === "weak_belief") return "Weak Belief";
  return null;
}

/** Round a 0-1 fraction to nearest integer percent. */
function roundPercent(fraction: number): number {
  return Math.round(fraction * 100);
}

/**
 * Public entry point. Returns the findings shape (published or
 * below-threshold) for the given edition year. The page template
 * branches on `.status`.
 *
 * The function is `cache()`-wrapped at the row-fetch layer; calling it
 * twice in one render is free.
 */
export async function loadEditionFindings(
  year: number,
): Promise<EditionFindings> {
  const rows = await fetchYearRows(year);
  const valid = rows.filter((r) => publicLabel(r.label) !== null);
  const total = valid.length;

  if (total < MIN_REPORT_N) {
    return {
      status: "below_threshold",
      totalSubmissions: total,
      threshold: MIN_REPORT_N,
    };
  }

  const counts: Record<"Wrong Person" | "Weak Offer" | "Weak Belief", number> =
    {
      "Wrong Person": 0,
      "Weak Offer": 0,
      "Weak Belief": 0,
    };
  let mostRecent = "";
  for (const r of valid) {
    const label = publicLabel(r.label);
    if (label) counts[label] += 1;
    if (r.created_at > mostRecent) mostRecent = r.created_at;
  }

  return {
    status: "published",
    totalSubmissions: total,
    // Deterministic order — matches the body-copy narrative (most common
    // diagnosis first across editions). Order is by count descending so
    // the page reads "the leading diagnosis was X (N%)" without
    // post-render reordering.
    labelDistribution: (
      ["Wrong Person", "Weak Offer", "Weak Belief"] as const
    )
      .map((label) => ({
        label,
        count: counts[label],
        percent: roundPercent(counts[label] / total),
      }))
      .sort((a, b) => b.count - a.count),
    mostRecentSubmissionAt: mostRecent,
  };
}

/**
 * Re-export the current edition year for callers that want a single
 * import for the whole report surface. Mirrors the convenience exports
 * pattern in /lib/seo/dataset.ts.
 */
export { CURRENT_EDITION_YEAR };
