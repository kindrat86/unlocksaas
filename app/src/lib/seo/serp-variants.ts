/**
 * SERP-snippet A/B framework.
 *
 * Why this surface exists
 * -----------------------
 * The 2026-05-20 SXO audit flagged "no A/B framework for SERP-snippet copy"
 * as a 12-point gap on the SXO score. Google's CTR for the same SERP
 * position varies by 2-5x depending on title + description quality. Without
 * a way to test variants, we ship one snippet per page and never know if a
 * different headline would double organic CTR.
 *
 * Sequential rotation, not parallel A/B
 * -------------------------------------
 * Google indexes title + description from one crawl. We CANNOT serve
 * different variants to different visitors – that would be cloaking
 * (different content per user-agent), which Google penalises. Instead, the
 * operator declares variants with explicit `live_from` ISO dates, and the
 * active variant is the latest one whose `live_from <= now`. Each variant
 * lives for an epoch (typically 14-30 days) so GSC accumulates enough
 * impressions to compare CTR.
 *
 * Deterministic by date
 * ---------------------
 * `getActiveSerpVariant(path, now?)` is a pure function. No randomness, no
 * runtime API calls, no cookies, no headers. Build-time stable. The same
 * path returns the same variant for the same `now`. Cache-Components-
 * friendly (safe inside `use cache`).
 *
 * CRO loop integration
 * --------------------
 * The /api/cron/gsc-feedback cron tags every emitted PostHog row with the
 * variant that was active on the row's date. PostHog joins on
 * (path, window_start_date) → variant_id and the operator sees CTR per
 * variant in the dashboard. No client-side tracking required – Google
 * Search Console IS the measurement layer.
 *
 * What the framework does NOT do
 * ------------------------------
 * - Auto-rotate (no "let's try a new one every Monday"). Operator picks
 *   when to ship each variant – the registry is the contract.
 * - Auto-generate variants. Every variant is hand-written. The Brunson
 *   Hard-Rule (no fabricated copy) applies in full.
 * - Multi-armed bandit / statistical-significance gating. Sequential
 *   epoch testing only – picking the winning variant is the operator's
 *   judgment based on GSC + PostHog data, not an algorithm.
 *
 * Title-template interaction
 * --------------------------
 * The root layout's `title.template` is `"%s — Unlock SaaS"`. Variant
 * titles in this registry should be the page-specific title only; the
 * suffix is appended by Next.js when the page resolves. (If a variant
 * needs to override the suffix it can set `title: { absolute: "..." }`
 * in the page's metadata directly – not via this helper.)
 */

import type { Metadata } from "next";

/**
 * A single SERP variant. `id` is the cohort identifier surfaced into
 * PostHog so the operator can correlate (path, period, variant_id) →
 * GSC clicks/impressions/CTR.
 */
export interface SerpVariant {
  /**
   * Stable, snake_case variant identifier. Must be unique within a
   * given path's variant list. Convention: short verb-phrase tag, e.g.
   * "headline-pain", "headline-guarantee", "lead-with-cohort".
   */
  id: string;
  /**
   * Page-specific title (the suffix from the root template is appended
   * automatically by Next.js). Keep under ~55 chars to avoid Google's
   * SERP truncation.
   */
  title: string;
  /**
   * Meta description. Keep under ~155 chars for mobile and ~160 for
   * desktop SERPs.
   */
  description: string;
  /**
   * ISO date (YYYY-MM-DD) when this variant becomes active. If absent,
   * the variant is considered "always-live" (epoch baseline). When
   * multiple variants are always-live the first in the array wins.
   */
  live_from?: string;
  /**
   * Optional one-line rationale for why this variant exists. Lives next
   * to the copy so when a future operator reads the registry they know
   * what hypothesis each variant is testing. NOT shipped to PostHog.
   */
  hypothesis?: string;
}

/**
 * Resolved variant + meta about resolution. Returned by
 * `getActiveSerpVariant` so callers can attribute the variant in
 * analytics events.
 */
export interface ResolvedSerpVariant extends SerpVariant {
  /**
   * Number of variants in the registry for this path. `1` means there
   * is no real rotation; analytics callers can use this to detect
   * "permanent" snippets vs "in-test" snippets.
   */
  variant_count: number;
}

/**
 * Variant registry. Operator-editable. One entry per pathname.
 *
 * Editing rules
 * -------------
 * 1. Use the canonical pathname (no trailing slash, no locale prefix,
 *    no query string). The root is `/`.
 * 2. Variants in each array are sorted by `live_from` ascending. The
 *    resolver picks the latest whose `live_from <= now`. An always-live
 *    variant (`live_from` omitted) acts as the fallback.
 * 3. Once a variant has been live for ≥14 days, freeze it – do not
 *    delete it; add the next variant after it. GSC + PostHog need the
 *    historical cohort to stay readable.
 * 4. Keep titles <= 55 chars, descriptions <= 155 chars. Long copy gets
 *    truncated by Google and the cohort comparison becomes apples-to-
 *    oranges.
 *
 * Brunson Hard-Rule
 * -----------------
 * Every snippet in here is hand-written. No fabricated baselines, no
 * generated copy. If a hypothesis cannot be honestly stated, the
 * variant does not ship.
 */
export const SERP_VARIANTS: Record<string, readonly SerpVariant[]> = {
  // /dont-buy-unlock-saas – first opt-in surface. The page is a linkbait
  // disqualifier, so the title's job is to make the wrong-fit reader stop
  // scrolling. Two variants live until 2026-06-04, then 2026-06-04 onward
  // ships the cohort headline.
  "/dont-buy-unlock-saas": [
    {
      id: "headline-honest",
      title: "Don't buy Unlock SaaS",
      description:
        "Eight honest disqualifiers and one canonical fit profile. If any disqualifier matches, the Playbook is the wrong tool. Said out loud, before checkout.",
      hypothesis:
        "Plain refusal beats a curiosity hook for the wrong-fit screen. Baseline – present from launch.",
    },
    {
      id: "headline-cohort",
      title: "Eight reasons we'll refuse your money",
      description:
        "We sell a 60-day paying-customer Playbook to one specific cohort. If you are outside it, we'd rather lose the sale than refund you at day 60. Read the disqualifiers first.",
      live_from: "2026-06-04",
      hypothesis:
        "Cohort framing converts higher on warm traffic from X / LinkedIn. Ships 14 days after baseline so the GSC cohort split is clean.",
    },
  ],
};

/**
 * Resolve the active SERP variant for a path against a given date.
 *
 * Pure function. Returns `null` when no variants are registered for the
 * path (which is the normal state for the vast majority of pages – only
 * pages opted into A/B-rotation appear in `SERP_VARIANTS`).
 *
 * `now` defaults to the current wall-clock time. Callers from the GSC
 * feedback cron pass the window date so historical rows are attributed
 * to the variant live ON that day, not the variant live today.
 */
export function getActiveSerpVariant(
  path: string,
  now: Date = new Date(),
): ResolvedSerpVariant | null {
  const variants = SERP_VARIANTS[path];
  if (!variants || variants.length === 0) return null;

  const nowIso = toIsoDate(now);
  let chosen: SerpVariant | undefined;
  for (const variant of variants) {
    // An always-live variant (no live_from) is the baseline and applies
    // when nothing else has shipped yet.
    if (!variant.live_from) {
      chosen = variant;
      continue;
    }
    if (variant.live_from <= nowIso) {
      // Variants are documented as sorted ascending; we keep walking
      // because we want the LATEST eligible variant, not the first.
      chosen = variant;
    }
  }
  if (!chosen) return null;
  return { ...chosen, variant_count: variants.length };
}

/**
 * Build a `Metadata` object (or a partial that can be spread into one)
 * for a path that may or may not be in the variant registry. The
 * `fallback` is used when no variant is registered – this lets a page
 * opt into the framework without forcing every other consumer to.
 *
 * Usage in a page.tsx:
 *
 *   const SERP_FALLBACK = {
 *     title: "Don't buy Unlock SaaS",
 *     description: "Eight honest disqualifiers ...",
 *   };
 *   export const metadata: Metadata = {
 *     ...buildSerpMetadata("/dont-buy-unlock-saas", SERP_FALLBACK),
 *     alternates: markdownAlternate("/dont-buy-unlock-saas", "/dont-buy-unlock-saas.md"),
 *   };
 *
 * Notes
 * -----
 * - The OG / Twitter card title and description are also overridden when
 *   a variant ships, because the same snippet should appear when a link
 *   is shared on X / LinkedIn / Slack. Keeping OG and SERP in lockstep
 *   keeps the cohort comparison honest.
 * - The variant id is stored in `other['x-serp-variant']` so the static
 *   HTML carries an inspectable marker – useful for ad-hoc QA but NOT
 *   the analytics channel (GSC cron is the analytics channel).
 */
export function buildSerpMetadata(
  path: string,
  fallback: { title: string; description: string },
  now: Date = new Date(),
): Pick<Metadata, "title" | "description" | "openGraph" | "twitter" | "other"> {
  const active = getActiveSerpVariant(path, now);
  const title = active?.title ?? fallback.title;
  const description = active?.description ?? fallback.description;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    // `other` accepts string | number | (string|number)[]. We only set
    // when a variant is in play so pages without rotation don't ship a
    // stale-looking attribute.
    ...(active
      ? { other: { "x-serp-variant": active.id } }
      : {}),
  };
}

/**
 * ISO-date (YYYY-MM-DD) projection of a Date. Uses UTC so the variant
 * boundary lines up with the GSC daily-rollup boundary (Google's
 * Search Analytics windows are UTC days).
 */
function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Strip the locale prefix from a pathname so locale variants of the same
 * page resolve to the same variant entry. `/es/dont-buy-unlock-saas` and
 * `/dont-buy-unlock-saas` both look up `/dont-buy-unlock-saas`.
 *
 * The current locale set is `en-US` (canonical, no prefix), `es`, and
 * `pt-BR`. Add new locales here as the i18n registry expands. Kept
 * deliberately small – the i18n.registry source of truth is consulted
 * elsewhere; for variant resolution we just need to strip.
 */
const LOCALE_PREFIX_RE = /^\/(es|pt-BR)(?=\/|$)/;

export function stripLocalePrefix(path: string): string {
  const stripped = path.replace(LOCALE_PREFIX_RE, "");
  // Replacing the entire match for the root (e.g. "/es") leaves "" –
  // restore "/" so the home-page variant entry resolves cleanly.
  return stripped === "" ? "/" : stripped;
}

/**
 * Convenience wrapper that strips locale before resolving. Used by the
 * GSC feedback cron, which sees Google-reported URLs that may include
 * a locale prefix.
 */
export function getActiveSerpVariantForGsc(
  pageUrl: string,
  now: Date,
): ResolvedSerpVariant | null {
  // GSC reports the full URL. Pull the pathname; tolerate malformed input.
  let pathname: string;
  try {
    pathname = new URL(pageUrl).pathname;
  } catch {
    return null;
  }
  return getActiveSerpVariant(stripLocalePrefix(pathname), now);
}
