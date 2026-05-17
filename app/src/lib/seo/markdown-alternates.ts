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
 * Build a minimal alternates fragment that declares the page canonical
 * AND its markdown mirror. Per-page metadata exports should spread the
 * returned object into their `alternates` field:
 *
 *   export const metadata: Metadata = {
 *     ...,
 *     alternates: markdownAlternate("/faq", "/faq.md"),
 *   };
 *
 * Or, for pages that also need hreflang languages:
 *
 *   alternates: markdownAlternate("/", "/index.md", { hreflang: true }),
 *
 * @param canonical Site-relative HTML path (e.g. "/faq", "/funnel-teardown/tally").
 * @param mdPath Site-relative markdown mirror path (e.g. "/faq.md",
 *   "/funnel-teardown/tally/md"). Note pSEO slug mirrors use `/slug/md`,
 *   not `/slug.md`, because App Router can't combine dynamic segments
 *   with literal `.md` suffixes — see src/lib/seo/md-route.ts.
 * @param opts.hreflang When true, also emit the self-referencing en-US +
 *   x-default declaration we use on the root and other monolingual surfaces.
 *   Default false because most per-page metadata only needs canonical + types.
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

  if (opts.hreflang) {
    // Honest monolingual: self-reference both locale slots so a single-
    // language site reads to Google as "deliberately en-US" rather than
    // "unspecified locale." Mirrors the declaration in src/app/sitemap.ts.
    fragment.languages = {
      "en-US": canonical,
      "x-default": canonical,
    };
  }

  return fragment;
}
