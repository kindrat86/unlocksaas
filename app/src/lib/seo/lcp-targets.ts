/**
 * Per-route LCP target table and classifier.
 *
 * Why this surface exists
 * -----------------------
 * The 2026-05-20 SXO audit flagged "no per-route LCP target tracking" as a
 * 12-point gap on the SXO score. The existing WebVitalsReporter sends raw
 * web-vitals values to PostHog with Google's blanket "good / needs-improvement
 * / poor" rating, but every route is judged against the same 2500ms threshold.
 * That is wrong: /diagnostic (the conversion-critical surface) should fail
 * faster than /pricing-teardown (a content surface). This module pins an
 * explicit budget per route category and classifies each LCP sample against
 * its own target.
 *
 * Targets are deliberately tighter than Google's defaults on conversion
 * surfaces and looser on content surfaces. The pSEO clusters can afford a
 * 3000ms LCP because the visitor is exploring, not buying. The diagnostic
 * cannot afford 2000ms because the visitor is about to type an email address.
 *
 * Why a table and not per-page metadata exports
 * ---------------------------------------------
 * We could put `lcpTargetMs: 1500` on every page.tsx, but with 89 page.tsx
 * files and 3000+ generated pSEO slugs that would never stay in sync.
 * Categorising by URL prefix gives us:
 *   - O(1) lookup at runtime
 *   - One file to edit when budgets shift
 *   - Static analysis (the table IS the documentation)
 * Prefix order matters: more-specific prefixes come first so /diagnostic/result
 * resolves to the diagnostic budget, not the marketing fallback.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Targets are picked from Lighthouse 75th-percentile guidance and adjusted
 * down on conversion surfaces. They are explicit, documented, and the
 * rationale lives next to the number. No fabricated "we hit 1.2s LCP" – this
 * module sets the bar; the WebVitalsReporter reports whether real users
 * actually cleared it.
 *
 * Sources
 * -------
 *   - web.dev LCP: https://web.dev/articles/lcp (2500/4000 baseline)
 *   - Internal SXO audit, 2026-05-20 (this commit)
 */

/**
 * Coarse route category for analytics rollups. Used as `route_category`
 * property on every web_vital_reported PostHog event so dashboards can group
 * by category without re-parsing the pathname.
 */
export type RouteCategory =
  | "home"
  | "conversion" // diagnostic flow + sales pages – paying with email or money
  | "auth" // login, magic link redemption
  | "trust" // about, press, editorial-policy, dont-buy
  | "pseo-detail" // /alternatives-to/[slug], /compare/[slug], etc.
  | "pseo-hub" // /alternatives-to, /compare, etc.
  | "content" // /glossary, /faq, /stories, /state-of-saas, /four-indie-search-engines
  | "podcast" // /podcast, /podcast/[slug]
  | "dataset" // /dataset and children
  | "app" // authenticated /playbook, /onboarding
  | "other";

export interface RouteCategoryRule {
  /** URL pathname prefix this rule matches against `startsWith`. */
  prefix: string;
  /** Coarse category tag for PostHog. */
  category: RouteCategory;
  /**
   * Target LCP in milliseconds. Sample <= target_ms × GOOD_BAND_RATIO
   * classifies as "good"; <= target_ms classifies as "needs-improvement";
   * above is "poor". Per-route so a fast budget on the conversion path
   * does not get masked by a generous budget on content pages.
   */
  target_ms: number;
}

/**
 * "Good" band sits at 60% of the per-route target – picks up Google's
 * 2500 → 1500 ratio for the 2500ms default. Sample at or below this is
 * "good", at or below target is "needs-improvement", anything else "poor".
 * Single constant so the band shape is consistent across categories.
 */
const GOOD_BAND_RATIO = 0.6;

/**
 * Rules ordered most-specific-prefix first. Lookup uses the FIRST match;
 * `/` is therefore last so it doesn't shadow `/diagnostic`, etc. The
 * comment on each rule names the surfaces it covers; the order is the
 * contract.
 */
const RULES: readonly RouteCategoryRule[] = [
  // ── Conversion surfaces – tightest budget ────────────────────────────
  // /diagnostic, /diagnostic/result, /diagnostic/finish, /diagnosis/[id]
  { prefix: "/diagnostic", category: "conversion", target_ms: 1800 },
  { prefix: "/diagnosis", category: "conversion", target_ms: 1800 },
  // /starter, /playbook-sales, /oto, /welcome – paid funnel pages
  { prefix: "/starter", category: "conversion", target_ms: 1800 },
  { prefix: "/playbook-sales", category: "conversion", target_ms: 1800 },
  { prefix: "/oto", category: "conversion", target_ms: 1800 },
  { prefix: "/welcome", category: "conversion", target_ms: 1800 },
  { prefix: "/challenge", category: "conversion", target_ms: 1800 },
  { prefix: "/founding", category: "conversion", target_ms: 1800 },

  // ── Auth surfaces – fast because the user is about to type ───────────
  { prefix: "/login", category: "auth", target_ms: 1500 },
  { prefix: "/auth", category: "auth", target_ms: 1500 },
  { prefix: "/confirm", category: "auth", target_ms: 1500 },

  // ── Authenticated app surfaces – not search-indexable ────────────────
  { prefix: "/playbook", category: "app", target_ms: 2200 },
  { prefix: "/onboarding", category: "app", target_ms: 2200 },

  // ── Trust pages – linkbait, headline matters more than ms ────────────
  { prefix: "/about", category: "trust", target_ms: 2500 },
  { prefix: "/press", category: "trust", target_ms: 2500 },
  { prefix: "/editorial-policy", category: "trust", target_ms: 2500 },
  { prefix: "/dont-buy-unlock-saas", category: "trust", target_ms: 2500 },
  { prefix: "/contact", category: "trust", target_ms: 2500 },

  // ── Podcast surfaces – audio bandwidth defers LCP naturally ──────────
  { prefix: "/podcast", category: "podcast", target_ms: 3000 },

  // ── Dataset surfaces – download-oriented, content-heavy ──────────────
  { prefix: "/dataset", category: "dataset", target_ms: 3000 },

  // ── Content surfaces – exploratory, looser budget ────────────────────
  { prefix: "/glossary", category: "content", target_ms: 2500 },
  { prefix: "/faq", category: "content", target_ms: 2500 },
  { prefix: "/stories", category: "content", target_ms: 2500 },
  { prefix: "/state-of-saas", category: "content", target_ms: 2500 },
  { prefix: "/four-indie-search-engines", category: "content", target_ms: 2500 },
  { prefix: "/search", category: "content", target_ms: 2500 },

  // ── pSEO detail pages – longest tail, looser budget ──────────────────
  // Pattern-matched by prefix even though the URL ends in a [slug] segment.
  { prefix: "/alternatives-to/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/compare/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/glossary/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/funnel-teardown/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/pricing-teardown/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/category/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/for/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/benchmarks/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/funnel-playbook/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/answers/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/why-isnt-my/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/press/topics/", category: "pseo-detail", target_ms: 3000 },
  { prefix: "/builder/", category: "pseo-detail", target_ms: 3000 },

  // ── pSEO hubs – fewer rows than the detail pages, slightly tighter ───
  // These rules sit AFTER the per-detail prefixes so /alternatives-to/lovable
  // resolves to "/alternatives-to/" (detail), and bare /alternatives-to
  // resolves to "/alternatives-to" (hub) via this rule.
  { prefix: "/alternatives-to", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/compare", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/funnel-teardown", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/pricing-teardown", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/category", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/for", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/benchmarks", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/funnel-playbook", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/answers", category: "pseo-hub", target_ms: 2500 },
  { prefix: "/why-isnt-my", category: "pseo-hub", target_ms: 2500 },

  // ── Home – conversion-adjacent, tight ────────────────────────────────
  // Must be the LAST entry because `/` is a prefix of everything.
  { prefix: "/", category: "home", target_ms: 2000 },
];

/**
 * Resolve route → category + LCP target.
 *
 * Pure function. No DOM access, no env. Safe to call in both client and
 * server contexts. The route arg is the pathname only (no query string,
 * no origin); callers typically read `window.location.pathname` (client)
 * or the request URL (server) and pass it in.
 *
 * Returns the "other" fallback when no rule matches – which can only
 * happen for an empty string. The `/` rule is the last entry and matches
 * every non-empty pathname.
 */
export function resolveRouteCategory(route: string): {
  category: RouteCategory;
  target_ms: number;
} {
  if (!route) return { category: "other", target_ms: 2500 };
  for (const rule of RULES) {
    if (route.startsWith(rule.prefix)) {
      return { category: rule.category, target_ms: rule.target_ms };
    }
  }
  // Theoretically unreachable – the `/` rule above matches everything that
  // starts with a leading slash. Defensive fallback only.
  return { category: "other", target_ms: 2500 };
}

/**
 * Status of an LCP sample against its per-route target. The three bands
 * mirror Google's "good / needs-improvement / poor" vocabulary so the
 * PostHog dashboard groups stay legible alongside the global `rating`
 * field – but the THRESHOLDS are per-route, not the Google defaults.
 */
export type LcpTargetStatus = "good" | "needs-improvement" | "poor";

/**
 * Classify an LCP sample against its per-route target.
 *
 * Bands:
 *   sample <= target_ms * 0.6  →  "good"
 *   sample <= target_ms        →  "needs-improvement"
 *   sample >  target_ms        →  "poor"
 *
 * Returning `null` for non-finite samples (NaN, ±Infinity) keeps the
 * downstream PostHog row consistent – the WebVitalsReporter passes the
 * status through as a string property and a NaN would silently land as
 * "NaN" in the dashboard.
 */
export function classifyLcpAgainstTarget(
  sample_ms: number,
  target_ms: number,
): LcpTargetStatus | null {
  if (!Number.isFinite(sample_ms) || !Number.isFinite(target_ms)) return null;
  if (target_ms <= 0) return null;
  if (sample_ms <= target_ms * GOOD_BAND_RATIO) return "good";
  if (sample_ms <= target_ms) return "needs-improvement";
  return "poor";
}

/**
 * Exported for the SXO test surface and any operator-tool that needs to
 * mirror the routing table (e.g. generating a per-route LCP-target sheet
 * in the operator dashboard). The array is `readonly`; consumers must
 * not mutate it.
 */
export const ROUTE_CATEGORY_RULES = RULES;
