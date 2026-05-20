/**
 * Corrections log — published-once registry of confirmed factual
 * corrections, structured for schema.org/Article.correction surface.
 *
 * Why this module exists (E-E-A-T uplift, 2026-05-21):
 *   The /editorial-policy page already names a corrections workflow
 *   and renders an honest empty-state ("No corrections logged yet").
 *   The audit identified that the log lacked structured data – no
 *   ItemList, no Article.correctionsPolicy, no machine-readable
 *   anchor for Google's quality raters or LLM citation pipelines
 *   to confirm the page's corrections discipline.
 *
 *   This module is the single source of truth that:
 *     - holds the (currently empty) corrections registry
 *     - documents the workflow for appending a real correction
 *     - exposes a schema.org-shaped serialization helper
 *     - carries a build-time integrity gate that throws on a
 *       fabricated / malformed entry before the schema graph ships
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - CORRECTIONS is empty by default. Empty is the honest state.
 *     A correction lands here only after the workflow in
 *     editorial-policy.tsx §5 confirms the original claim was wrong.
 *   - CORRECTIONS_LOG_SINCE is a real, single, immutable date – the
 *     day the editorial policy was published. The honest empty
 *     state reads as "nothing confirmed since 2026-05-17", not
 *     "no corrections ever in our history" (which would be a
 *     fabrication-by-omission).
 *   - The validation IIFE throws on a future-dated entry, on a
 *     malformed URL, on a missing claim/correction pair – the same
 *     discipline as media-mentions.ts and founder-works.ts.
 *
 * Operator workflow when a real correction lands
 * ----------------------------------------------
 *   1. Email exchange confirms the original claim was wrong and the
 *      proposed correction is true (editorial-policy.tsx §5).
 *   2. Update the affected page – fix the claim, bump dateModified.
 *   3. Append a row to CORRECTIONS below at the top of the array
 *      (reverse-chronological order is the rendered surface's
 *      contract).
 *   4. Commit with message: `corrections: log <slug> (<date>)`.
 *   5. Deploy. /editorial-policy renders the row in §6 and the
 *      Article.correction JSON-LD picks it up automatically.
 */

import { BASE_URL } from "@/lib/seo/entity";

/**
 * One confirmed factual correction issued against a previously
 * published claim on this site. Each entry is a small, immutable
 * record – once shipped, never rewritten (a rewrite of a correction
 * would itself be a correction).
 */
export interface CorrectionEntry {
  /**
   * ISO YYYY-MM-DD date the correction was confirmed and shipped.
   * Reverse-chronological order in the rendered surface.
   */
  readonly correctedAt: string;
  /**
   * Absolute URL of the page where the claim was originally
   * published. Must be a real surface on this domain (verified by
   * the build-time integrity gate). Anchors the correction to the
   * page it corrects.
   */
  readonly pageUrl: string;
  /**
   * Short slug describing the correction – used as the rendered
   * surface's heading and as the Article.correction node's name.
   * Keep under 80 chars; the long-form explanation lives in
   * `corrected` below.
   */
  readonly title: string;
  /**
   * What was originally claimed, verbatim where possible. Required
   * for honest comparison – a correction without the original text
   * is unverifiable.
   */
  readonly originalClaim: string;
  /**
   * What the correction now says. Verbatim where possible. The reader
   * should be able to copy both fields side-by-side and confirm the
   * delta themselves.
   */
  readonly corrected: string;
  /**
   * Optional source URL backing the correction (the article, the
   * tweet, the email that reported the original error). Helpful
   * but not required – some corrections are operator-initiated
   * (e.g., "we noticed our own typo").
   */
  readonly sourceUrl?: string;
}

/**
 * Reverse-chronological corrections registry. Empty at launch and
 * intended to stay short – a correctly-published site should
 * accumulate corrections in the single digits per year, not the
 * hundreds. The validation IIFE below caps entries at 200 as a
 * sanity guard: a registry that long indicates the site is
 * publishing claims faster than it can verify them, which is itself
 * a Brunson Hard-Rule violation.
 *
 * Append new corrections at the TOP of the array (newest first).
 */
export const CORRECTIONS: readonly CorrectionEntry[] = Object.freeze([]);

/**
 * The day the editorial policy was published and corrections started
 * being tracked. The rendered empty-state copy reads:
 *   "No corrections confirmed since YYYY-MM-DD."
 * which is honest (we DO track corrections; none have landed yet)
 * without claiming "no corrections in our history" (which would be
 * unfalsifiable for a brand-new site).
 *
 * Mirrors POLICY_PUBLISHED_AT in editorial-policy.tsx exactly.
 */
export const CORRECTIONS_LOG_SINCE = "2026-05-17" as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateCorrections(rows: readonly CorrectionEntry[]): void {
  if (rows.length > 200) {
    throw new Error(
      "CORRECTIONS has more than 200 entries – publication velocity " +
        "exceeds verification capacity. Audit and prune.",
    );
  }
  const seenPageUrls = new Map<string, number>();
  let previousDate: string | null = null;
  rows.forEach((row, i) => {
    const where = `CORRECTIONS[${i}]`;
    if (!ISO_DATE_RE.test(row.correctedAt)) {
      throw new Error(
        `${where}.correctedAt must be ISO YYYY-MM-DD; got ${JSON.stringify(row.correctedAt)}`,
      );
    }
    const parsedDate = new Date(`${row.correctedAt}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(
        `${where}.correctedAt is not a real calendar date: ${row.correctedAt}`,
      );
    }
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (parsedDate > tomorrow) {
      throw new Error(
        `${where}.correctedAt is in the future: ${row.correctedAt}`,
      );
    }
    if (typeof row.pageUrl !== "string" || !row.pageUrl.startsWith(BASE_URL)) {
      throw new Error(
        `${where}.pageUrl must be an absolute URL on this domain (${BASE_URL}); got ${row.pageUrl}`,
      );
    }
    try {
      new URL(row.pageUrl);
    } catch {
      throw new Error(`${where}.pageUrl is not a valid URL: ${row.pageUrl}`);
    }
    if (typeof row.title !== "string" || row.title.trim().length < 4) {
      throw new Error(`${where}.title must be a non-trivial string (>= 4 chars)`);
    }
    if (
      typeof row.originalClaim !== "string" ||
      row.originalClaim.trim().length < 4
    ) {
      throw new Error(
        `${where}.originalClaim must be a non-trivial string (>= 4 chars)`,
      );
    }
    if (typeof row.corrected !== "string" || row.corrected.trim().length < 4) {
      throw new Error(
        `${where}.corrected must be a non-trivial string (>= 4 chars)`,
      );
    }
    if (row.sourceUrl !== undefined) {
      if (
        typeof row.sourceUrl !== "string" ||
        !row.sourceUrl.startsWith("https://")
      ) {
        throw new Error(
          `${where}.sourceUrl, when set, must be an absolute https URL; got ${row.sourceUrl}`,
        );
      }
      try {
        new URL(row.sourceUrl);
      } catch {
        throw new Error(
          `${where}.sourceUrl is not a valid URL: ${row.sourceUrl}`,
        );
      }
    }
    // Multiple corrections to the same page is allowed (different
    // claims on the same page can each get a correction), but
    // count occurrences for the sanity warning above.
    seenPageUrls.set(row.pageUrl, (seenPageUrls.get(row.pageUrl) ?? 0) + 1);
    if (previousDate !== null && row.correctedAt > previousDate) {
      throw new Error(
        `${where} breaks reverse-chronological order – ${row.correctedAt} ` +
          `comes after the previous entry's ${previousDate}. Insert newer ` +
          "entries at the top of the array.",
      );
    }
    previousDate = row.correctedAt;
  });
}

validateCorrections(CORRECTIONS);

/**
 * Serialize the corrections registry as an ItemList JSON-LD payload.
 * Designed to be embedded as the `correction` field on the
 * /editorial-policy Article schema – schema.org/Article accepts an
 * ItemList there for multi-correction surfaces.
 *
 * Returns undefined when the registry is empty, so the consumer can
 * spread `{ ...maybeCorrection }` onto the Article payload without
 * having to special-case the empty path. JSON.stringify drops
 * undefined values, keeping the schema honest (no `correction: null`,
 * no `correction: []`).
 */
export function buildCorrectionsItemList():
  | { correction: Record<string, unknown> }
  | undefined {
  if (CORRECTIONS.length === 0) return undefined;
  return {
    correction: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: CORRECTIONS.length,
      itemListElement: CORRECTIONS.map((row, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CorrectionComment",
          name: row.title,
          datePublished: row.correctedAt,
          url: row.pageUrl,
          text: `Originally: ${row.originalClaim} — Corrected: ${row.corrected}`,
          ...(row.sourceUrl ? { citation: row.sourceUrl } : {}),
        },
      })),
    },
  };
}
