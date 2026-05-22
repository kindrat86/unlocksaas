/**
 * Article-rich-result `image` resolver.
 *
 * Google's Article rich result requires `image` on the Article JSON-LD
 * (https://developers.google.com/search/docs/appearance/structured-data/article#article-types).
 * The image is the SERP thumbnail for the Top Stories carousel + the Article
 * answer panel. Without it, the page is structurally valid but ineligible.
 *
 * Each pSEO detail template either ships a dedicated `opengraph-image.tsx`
 * at its `[slug]` route (which generates `<canonical>/opengraph-image` for
 * each slug) or inherits the root `/opengraph-image` from the layout
 * cascade. Next.js does NOT walk up the route tree at runtime to satisfy a
 * child-segment `opengraph-image` URL, so for templates *without* a
 * dedicated card we have to point JSON-LD at the root card explicitly.
 *
 * `articleImageFor(canonicalUrl)` returns the correct ImageObject for the
 * URL — slug-level for templates with their own card, root-level for the
 * rest. The ImageObject includes the documented 1200x630 dimensions so
 * Google's renderer can size the thumbnail without re-fetching.
 *
 * 2026-05-22 SEO audit (rich-results eligibility sweep): added because 20+
 * detail templates had Article JSON-LD without `image` — fixed via a single
 * helper to keep the convention DRY across the marketing surface.
 */

import { BASE_URL } from "./entity";

/**
 * Path-prefix → has-dedicated-OG manifest.
 *
 * Source of truth: `app/src/app/(marketing)/<hub>/[slug]/opengraph-image.tsx`
 * presence at build time. Audited 2026-05-22.
 */
const DEDICATED_OG_PREFIXES = [
  "/alternatives-to/",
  "/benchmarks/",
  "/funnel-teardown/",
  "/glossary/",
  "/pricing-teardown/",
  "/swipe-file/",
  "/vs/",
] as const;

/** Standard Next.js opengraph-image dimensions. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Returns the Article-rich-result-eligible `image` for a given canonical URL.
 *
 * Pass the page's canonical URL (e.g. `https://unlocksaas.com/glossary/hook`)
 * and spread the result into the Article JSON-LD:
 *
 * ```ts
 * const article = {
 *   "@type": "Article",
 *   headline: ...,
 *   image: articleImageFor(canonicalUrl),
 *   ...
 * };
 * ```
 *
 * The returned object is an ImageObject (richer than a bare URL string) so
 * Google's renderer gets dimensions without a fetch and the entity graph
 * keeps a consistent `@type` discipline.
 */
export function articleImageFor(canonicalUrl: string): {
  "@type": "ImageObject";
  url: string;
  width: number;
  height: number;
} {
  const hasDedicated = DEDICATED_OG_PREFIXES.some((prefix) =>
    canonicalUrl.includes(prefix),
  );
  const url = hasDedicated
    ? `${canonicalUrl}/opengraph-image`
    : `${BASE_URL}/opengraph-image`;
  return {
    "@type": "ImageObject",
    url,
    width: OG_WIDTH,
    height: OG_HEIGHT,
  };
}
