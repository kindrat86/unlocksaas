/**
 * Open Graph image defaults.
 *
 * Why this module exists
 * ----------------------
 * Next.js metadata API REPLACES nested objects on inheritance — when a
 * route segment declares `metadata.openGraph: { ... }`, that block does
 * NOT merge with the parent's; it completely replaces it. Any field the
 * child omits (including `images`) is therefore *absent* on the final
 * page, NOT inherited from the root layout.
 *
 * The file-based convention (app/opengraph-image.tsx) auto-attaches an
 * `images` entry to the openGraph metadata for its own route segment
 * only — children that declare a fresh openGraph block do NOT pick it
 * up from an ancestor segment's file-based image.
 *
 * Net effect: every page that customizes openGraph (title / description
 * / type / url) but doesn't have its own opengraph-image.tsx in the same
 * route segment ends up with no `og:image` meta tag at all. The crawler
 * citation audit (strategy/audits/2026-05-22-crawler-citation-audit.md)
 * caught this on 23 pages — every hub + several detail pages.
 *
 * Two helpers are exported:
 *
 *  - DEFAULT_OG_IMAGE — the metadata.openGraph.images entry that points
 *    at the site-wide root opengraph card (app/opengraph-image.tsx).
 *    Use this on any route that has NO route-segment opengraph-image.tsx
 *    of its own. It is byte-identical to the value Next.js would have
 *    auto-attached at the root segment, so retainability of the root
 *    card across the site is preserved.
 *
 *  - withDefaultOgImage(openGraph) — convenience wrapper that returns
 *    the input openGraph object with DEFAULT_OG_IMAGE attached IFF the
 *    caller did not already provide its own `images`. This is the
 *    one-line fix for the 23 broken pages.
 *
 * Why a constant instead of a URL string?
 * ---------------------------------------
 * Declaring the image with explicit width/height/alt prevents Twitter
 * Card validator + LinkedIn Post Inspector from falling back to "image
 * dimensions unknown" rendering. The width/height/alt match what
 * app/opengraph-image.tsx generates so cards render at 1200×630 with
 * the right `og:image:alt` automatically (Brunson Hard-Rule: card alt
 * text must mirror the offer headline, not be a generic site descriptor).
 */

import type { Metadata } from "next";
import { ORGANIZATION } from "@/lib/seo/entity";

/**
 * Site-wide default OpenGraph image, pointing at the file-based root
 * opengraph card. Width / height / alt are aligned with the actual
 * runtime card (1200×630, headline matches the offer).
 *
 * The URL is site-relative so Next.js resolves it against
 * `metadataBase` from app/layout.tsx — keeps the same constant valid
 * on production, preview deployments, and `next dev`.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: ORGANIZATION.name + " — Your First Paying Customer in 60 Days",
  type: "image/png",
} as const;

/**
 * The same default packaged as a single-element `images` array, ready
 * to drop into `metadata.openGraph` as `images: [DEFAULT_OG_IMAGES]`.
 * Slightly handier than spreading the constant manually each time.
 */
export const DEFAULT_OG_IMAGES = [DEFAULT_OG_IMAGE];

/**
 * Wraps a page-level openGraph object with the default site image when
 * the caller did not already declare its own `images`. No-ops if the
 * caller passes an explicit `images:` array — even an empty one — so
 * "I deliberately want no image" stays expressible.
 *
 * Use:
 *
 *   openGraph: withDefaultOgImage({
 *     type: "article",
 *     title: "About Maryan",
 *     description: "…",
 *     url: "/about",
 *   }),
 *
 * Output is byte-identical to writing `images: [DEFAULT_OG_IMAGE]`
 * inline; the helper exists so the 23-page fix is one import + one
 * function call per file rather than five new lines per file.
 */
export function withDefaultOgImage(
  openGraph: NonNullable<Metadata["openGraph"]>,
): NonNullable<Metadata["openGraph"]> {
  if (openGraph && "images" in openGraph && openGraph.images !== undefined) {
    return openGraph;
  }
  return {
    ...openGraph,
    images: DEFAULT_OG_IMAGES,
  };
}
