/**
 * Date formatting helpers for visible "Verified" stamps on pSEO surfaces.
 *
 * Why this module exists
 * ----------------------
 * The four pSEO catalogs (alternatives, funnel-teardown, pricing-teardown,
 * compare) each carry a `lastVerified: string` ISO date. The HTML pages
 * already wire that date into JSON-LD `datePublished` + `dateModified`
 * and into a footer "Last verified" string. The SEO audit (composite
 * 89/100, 2026-05-18) flagged that the date is not also rendered
 * prominently above-the-fold, where Google's "Last Updated" snippet
 * extractor and the AI Overviews freshness heuristic both look first.
 *
 * This file is the single source of truth for the human-readable
 * format of those ISO dates so every pSEO slug template renders the
 * same shape. Centralised because:
 *
 *   1. SSR safety — `Date#toLocaleDateString` produces different output
 *      on Node vs the browser depending on which locale data is
 *      installed. A static, hard-coded month table is deterministic.
 *   2. Locale honesty — the site is monolingual en-US (see entity.ts,
 *      sitemap.ts, layout.tsx hreflang). The format below matches
 *      en-US convention ("May 17, 2026"), not a fabricated locale.
 *   3. Brunson Hard-Rule — no fabricated dates. The function refuses
 *      malformed input (returns the raw ISO unchanged) rather than
 *      silently coercing nonsense into a plausible-looking date.
 *
 * Consumers
 * ---------
 *   - src/app/(marketing)/vs/[slug]/page.tsx
 *   - src/app/(marketing)/funnel-teardown/[slug]/page.tsx
 *   - src/app/(marketing)/pricing-teardown/[slug]/page.tsx
 *   - src/app/(marketing)/alternatives-to/[slug]/page.tsx
 *
 * The matching markdown mirrors (src/lib/seo/markdown.ts) already
 * surface the same date via the front-matter `updated:` field plus
 * inline "as observed [date]" lines, so HTML and markdown stay in sync.
 */

const MONTHS_EN_US: ReadonlyArray<string> = [
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

/**
 * Format a "YYYY-MM-DD" ISO date as "Month D, YYYY" in en-US.
 *
 * Examples:
 *   formatVerifiedDate("2026-05-17") → "May 17, 2026"
 *   formatVerifiedDate("2026-12-01") → "December 1, 2026"
 *
 * On malformed input (missing parts, non-numeric, month out of range),
 * the function returns the raw input unchanged. That is the honest
 * fallback: a visible "2026-05-17" beats a silently coerced "January
 * 0, NaN" or a thrown error blowing up SSR.
 */
export function formatVerifiedDate(iso: string): string {
  if (typeof iso !== "string") return String(iso);
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return iso;
  }
  if (year < 1900 || year > 9999) return iso;
  if (month < 1 || month > 12) return iso;
  if (day < 1 || day > 31) return iso;
  return `${MONTHS_EN_US[month - 1]} ${day}, ${year}`;
}
