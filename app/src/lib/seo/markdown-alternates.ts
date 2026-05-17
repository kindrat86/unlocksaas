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

/**
 * Shape of the `alternates` fragment we return. Narrowed to the keys
 * Metadata accepts so type-checking catches accidental drift.
 */
type AlternatesFragment = NonNullable<Metadata["alternates"]>;

/**
 * Self-referencing hreflang map for the monolingual surface.
 *
 * Honest monolingual: both `en-US` and `x-default` point at the same
 * canonical, telling Google "this is deliberately en-US, no language
 * alternates exist." Mirrors the per-URL hreflang block in `sitemap.ts`.
 *
 * Used by `pageAlternates()` and by the default branch of
 * `markdownAlternate()`. Exposed standalone for cases where a page builds
 * a custom alternates fragment but still wants the canonical hreflang.
 */
export function selfHreflang(canonical: string) {
  return {
    "en-US": canonical,
    "x-default": canonical,
  } as const;
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
