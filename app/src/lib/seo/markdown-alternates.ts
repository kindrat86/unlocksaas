/**
 * Markdown-mirror alternate-link helpers for Next.js Metadata API.
 *
 * Why this module exists
 * ----------------------
 * GEO/AEO crawlers (Perplexity, Anthropic ClaudeBot, OpenAI's OAI-SearchBot,
 * Google AI Overviews, Gemini, You.com, Diffbot) prefer playbook-readable
 * markdown over JS-rendered HTML when both exist. The discovery convention
 * for "this HTML page has a markdown mirror" is the standard W3C content-
 * negotiation alternate link:
 *
 *   <link rel="alternate" type="text/markdown" href="/foo.md" />
 *
 * Without this link, a retriever must guess the mirror URL (or rely on the
 * `llms.txt` index alone). With it, every page self-advertises its own
 * mirror — the GEO equivalent of hreflang for monolingual sites.
 *
 * Next.js's Metadata API serializes the `alternates.types` map into one
 * `<link rel="alternate">` per entry, so this is a one-call wiring per page.
 *
 * Single source of truth
 * ----------------------
 * The list of (HTML path → markdown path) pairs lives in
 * `src/lib/seo/markdown.ts` (SURFACES + the per-slug renderers). This module
 * is the consumer side: a small typed helper that produces the
 * `Metadata['alternates']` fragment each page exports.
 *
 * Brunson Hard-Rule reconciliation: we only advertise mirrors that actually
 * exist (every mdPath listed here has a route handler under `app/`). No
 * speculative aliases, no fabricated formats.
 */

import type { Metadata } from "next";
import { BASE_URL } from "./entity";
import { approvedLocalesForPath } from "@/lib/i18n/registry";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

/**
 * Shape of the `alternates` fragment we return. Narrowed to the keys
 * Metadata accepts so type-checking catches accidental drift.
 */
type AlternatesFragment = NonNullable<Metadata["alternates"]>;

/**
 * Hub paths whose APPROVAL applies to every detail slug under them.
 *
 * The registry stores one row per `(hubPath, locale)`; the underlying
 * translation files (e.g. glossary.es.ts, benchmarks.es.ts) carry the
 * full set of slug translations. When the founder approves the hub for
 * a locale, that approval covers the entire tree (every slug under the
 * hub was reviewed as a set against the shared translation file).
 *
 * This list lets `buildHreflangMap()` resolve hreflang for detail paths
 * like `/glossary/big-domino` by walking up to the hub `/glossary` and
 * reading its approval state. Without this, every detail-page canonical
 * would emit only `en-US` + `x-default` (because no exact registry row
 * exists for the detail path), even though the locale-prefixed detail
 * URL is shipped and indexable.
 *
 * Add a hub here when:
 *   - Its registry row is at the hub level (one row, not one-per-slug).
 *   - The underlying translation file carries every child slug.
 *   - The detail-page locale routes already exist under
 *     app/src/app/[locale]/<hub>/[slug]/page.tsx.
 */
const HUBS_WITH_DETAIL_LOCALE_INHERITANCE: readonly string[] = [
  "/glossary",
  "/benchmarks",
  // 2026-05-21 audit fix #3 – plumbing-only expansion. The other ten
  // pSEO hubs satisfy the "detail-page locale routes exist" criterion
  // (see the per-hub "pSEO surface plumbing extension" log in
  // src/lib/i18n/registry.ts). They do NOT yet satisfy the
  // "underlying translation file carries every child slug" criterion –
  // the registry has no rows for these paths, so
  // approvedLocalesForPath() returns [] and the helper below emits
  // en-US + x-default only. Listing the hubs here is forward-
  // compatibility: when a real translation overlay ships, per-slug
  // hreflang resolution needs zero further wiring. Keep in lockstep
  // with the same constant in app/src/app/sitemap.ts.
  "/alternatives-to",
  "/compare",
  "/funnel-teardown",
  "/pricing-teardown",
  "/category",
  "/for",
  "/funnel-playbook",
  "/answers",
  "/why-isnt-my",
  "/press/topics",
];

/**
 * Resolve approved locales for a canonical path, with hub→detail
 * inheritance.
 *
 *   - Exact-match registry row → return its approved locales.
 *   - Detail path under an inheriting hub → return the hub's locales.
 *   - Anything else → empty (honest monolingual).
 *
 * Brunson Hard-Rule reconciliation: inheritance is registry-driven and
 * gated by `HUBS_WITH_DETAIL_LOCALE_INHERITANCE`. A hub does NOT inherit
 * by default; adding one to the list is a deliberate editorial decision
 * that the slug translations are reviewed as a unit. The exact-match
 * lookup still wins when both apply.
 */
function localesForPathWithHubFallback(
  canonical: string,
): ReadonlyArray<ReturnType<typeof approvedLocalesForPath>[number]> {
  const exact = approvedLocalesForPath(canonical);
  if (exact.length > 0) return exact;
  for (const hub of HUBS_WITH_DETAIL_LOCALE_INHERITANCE) {
    if (canonical.startsWith(`${hub}/`)) {
      return approvedLocalesForPath(hub);
    }
  }
  return [];
}

/**
 * Build the per-URL hreflang `languages` map for a given source path.
 *
 * Reads from the translation registry at module load. The honest contract:
 *   - en-US canonical always appears.
 *   - Each APPROVED translation appears under its BCP 47 locale tag.
 *   - `x-default` points at the en-US canonical.
 *   - Pending or archived translations are silently skipped. Brunson
 *     Hard-Rule: never advertise alternates that aren't approved.
 *   - Detail pages under hub-level-approved surfaces (see
 *     HUBS_WITH_DETAIL_LOCALE_INHERITANCE) inherit the hub's approved
 *     locales so the canonical /glossary/<slug> declares its
 *     /es/glossary/<slug> and /pt-BR/glossary/<slug> siblings.
 *
 * Until any translation is approved, output is byte-identical to the
 * previous monolingual self-referencing map.
 */
export function buildHreflangMap(
  canonical: string,
  opts: { absolute?: boolean } = {},
): Record<string, string> {
  const abs = opts.absolute === true;
  const wrap = (p: string) => (abs ? `${BASE_URL}${p}` : p);
  const map: Record<string, string> = {
    "en-US": wrap(canonical),
    "x-default": wrap(canonical),
  };
  for (const locale of localesForPathWithHubFallback(canonical)) {
    map[locale] = wrap(localizedPath(canonical, locale));
  }
  return map;
}

/**
 * Self-referencing hreflang for the canonical, with approved-translation
 * alternates appended. Backwards-compatible signature — every existing
 * caller (pageAlternates, markdownAlternate, layout) routes through this
 * and automatically picks up approved translations without per-call
 * updates. Until any translation is `approved`, the output is
 * byte-identical to the previous monolingual map.
 */
export function selfHreflang(canonical: string): Record<string, string> {
  return buildHreflangMap(canonical);
}

/**
 * Predicate: is `(canonical, locale)` approved, honoring hub→detail
 * inheritance?
 *
 * Exposed so locale-routed pages (`app/[locale]/.../page.tsx`) can drive
 * their `robots` flag and `alternates` shape without re-implementing the
 * lookup logic that `buildHreflangMap` already encapsulates.
 *
 * Hub→detail inheritance: `/glossary/big-domino` returns `true` for any
 * locale where the `/glossary` hub is approved – the founder reviews the
 * hub + its slug catalog as a unit (see `HUBS_WITH_DETAIL_LOCALE_INHERITANCE`).
 *
 * Brunson Hard-Rule reconciliation: this is a pure read of the registry.
 * Approval state cannot be inferred from anything outside `registry.ts`.
 */
export function isLocaleApprovedForPath(
  canonical: string,
  locale: Exclude<Locale, "en-US">,
): boolean {
  return localesForPathWithHubFallback(canonical).some((l) => l === locale);
}

/**
 * Build a per-page alternates fragment with canonical + self-referencing
 * hreflang.
 *
 * Why this exists
 * ---------------
 * The root layout (src/app/layout.tsx) declares
 * `alternates.languages: { "en-US": "/", "x-default": "/" }`, which is
 * correct for the homepage. Next.js metadata merging preserves the
 * `languages` field from a parent layout when a child page only overrides
 * `canonical`. The result: every non-homepage that sets
 * `alternates: { canonical: "/foo" }` emits hreflang that back-links to `/`
 * instead of `/foo`. Search Console flags that as an hreflang
 * return-tag mismatch.
 *
 * Drop-in replacement for `alternates: { canonical }`:
 *
 *   export const metadata: Metadata = {
 *     ...,
 *     alternates: pageAlternates("/faq"),
 *   };
 *
 * For pages that ALSO carry a markdown mirror (pSEO surfaces), use
 * `markdownAlternate()` instead — it includes hreflang by default plus the
 * `text/markdown` types entry.
 *
 * @param canonical Site-relative HTML path (e.g. "/faq", "/about").
 */
export function pageAlternates(canonical: string): AlternatesFragment {
  return {
    canonical,
    languages: selfHreflang(canonical),
  };
}

/**
 * Build an alternates fragment that declares the page canonical, its
 * markdown mirror, AND self-referencing hreflang. Per-page metadata exports
 * spread the returned object into their `alternates` field:
 *
 *   export const metadata: Metadata = {
 *     ...,
 *     alternates: markdownAlternate("/faq", "/faq.md"),
 *   };
 *
 * Hreflang is emitted by default. The honest-monolingual `en-US` +
 * `x-default` self-reference is the same signal the sitemap carries
 * per-URL; emitting it in the per-page `<head>` keeps Next.js's metadata
 * inheritance from leaking the layout-level `languages: { "en-US": "/" }`
 * map onto every child page. Pass `{ hreflang: false }` only when the
 * caller is wiring a custom `languages` map elsewhere in the same
 * metadata object.
 *
 * @param canonical Site-relative HTML path (e.g. "/faq", "/funnel-teardown/tally").
 * @param mdPath Site-relative markdown mirror path (e.g. "/faq.md",
 *   "/funnel-teardown/tally/md"). Note pSEO slug mirrors use `/slug/md`,
 *   not `/slug.md`, because App Router can't combine dynamic segments
 *   with literal `.md` suffixes — see src/lib/seo/md-route.ts.
 * @param opts.hreflang Defaults to `true`. Set `false` only to suppress
 *   the languages map entirely (rare — only for pages that emit their
 *   own custom hreflang block).
 */
export function markdownAlternate(
  canonical: string,
  mdPath: string,
  opts: { hreflang?: boolean } = {},
): AlternatesFragment {
  const fragment: AlternatesFragment = {
    canonical,
    types: {
      // The IANA-registered media type for Markdown. Retrievers that honor
      // the alternate link use this string to filter for the playbook-
      // readable version when both HTML and markdown are advertised.
      "text/markdown": `${BASE_URL}${mdPath}`,
    },
  };

  // Default-on hreflang. Layout-level languages map points at "/" by
  // design (correct for the homepage); without per-page override every
  // child page emits hreflang pointing at "/" instead of its own canonical.
  // Self-reference here makes the emitted <link rel="alternate"> resolve
  // to the page itself, which is what Search Console expects.
  if (opts.hreflang !== false) {
    fragment.languages = selfHreflang(canonical);
  }

  return fragment;
}

/**
 * Per-locale alternates fragment for routes under `app/[locale]/...`.
 *
 * Returns:
 *   - `canonical`: self-canonical at the LOCALIZED URL (`/es/faq`,
 *     `/pt-BR/glossary/big-domino`, …).
 *   - `languages`: the full hreflang cluster (en-US canonical +
 *     x-default + every approved sibling locale) WHEN the (path,
 *     locale) pair is approved – directly or via hub→detail
 *     inheritance.
 *
 * Approval gate
 * -------------
 * If the (canonical, locale) pair is NOT approved (status
 * `pending-review`, founder still in the loop), the `languages` map is
 * OMITTED. A noindex page that emits hreflang siblings would pollute
 * the cluster with an asymmetric edge (Search Console expects every
 * member of an hreflang cluster to be indexable); self-canonical-only
 * is the honest signal for "this URL exists for founder preview but
 * does not participate in the international SEO graph yet."
 *
 * The previous inline pattern across `app/[locale]/.../page.tsx` used
 * `localesWithApprovedContent()` (global – every locale that has ANY
 * approved row anywhere), which over-claimed by listing locales that
 * had no approved row for THIS path. This helper instead routes
 * through `localesForPathWithHubFallback()` which is per-path with
 * hub inheritance – byte-correct hreflang clusters.
 *
 * Drop-in usage
 * -------------
 *   import { localeAlternates } from "@/lib/seo/markdown-alternates";
 *   ...
 *   return {
 *     title,
 *     description,
 *     alternates: localeAlternates("/faq", locale),
 *     robots: isLocaleApprovedForPath("/faq", locale)
 *       ? { index: true, follow: true }
 *       : { index: false, follow: false },
 *     ...
 *   };
 */
export function localeAlternates(
  canonical: string,
  locale: Exclude<Locale, "en-US">,
): AlternatesFragment {
  const localised = localizedPath(canonical, locale);
  if (!isLocaleApprovedForPath(canonical, locale)) {
    // Pending-review: noindex page, self-canonical only. Don't
    // pollute the hreflang cluster from a non-indexable surface –
    // Search Console flags clusters with non-indexable members as
    // "hreflang errors: alternate page is no-index."
    return { canonical: localised };
  }
  return {
    canonical: localised,
    languages: selfHreflang(canonical),
  };
}
