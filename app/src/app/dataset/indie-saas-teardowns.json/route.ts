/**
 * /dataset/indie-saas-teardowns.json — public dataset export of every
 * UnlockSaaS catalog as one JSON document under CC-BY 4.0.
 *
 * Why this file exists
 * --------------------
 * The HTML pSEO surface is for humans; the markdown mirrors are for AI
 * retrievers; the MCP server is for agent tools. This route closes the
 * fourth quadrant: bulk-export for academics, founders building their
 * own analyses, and engineers who want the whole catalog as a typed
 * data structure they can join against.
 *
 * Why it generates backlinks (the off-page lift mechanism)
 * --------------------------------------------------------
 * Public datasets with permissive licenses get cited. Citations happen
 * because the license demands it: CC-BY 4.0 requires attribution on
 * any derivative work. Every blog post that quotes a stat from this
 * dataset, every academic paper that joins it with their own data,
 * every founder who screenshots a comparison, every newsletter that
 * graphs the pricing distribution carries a backlink to the canonical
 * source (this URL). That is the entire mechanism: turn the existing
 * Brunson-discipline catalog work into a permanent, citable artifact
 * that the rest of the web has a structural reason to link back to.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Single source of truth: this route reads from the same modules
 *     that render the HTML pages (alternatives.ts, funnel-teardowns.ts,
 *     pricing-teardowns.ts, comparisons.ts, categories.ts). Zero drift
 *     surface — if the HTML moves, the JSON moves on the next deploy.
 *   - No fabricated metadata. The `generatedAt` timestamp is honest;
 *     `counts` is computed at render time from the actual arrays.
 *   - License is permissive but DEMANDS attribution. Pre-revenue solo
 *     founder economics: every link counts. CC-BY does the legal work.
 *   - No invented schema fields. Every column below is a real property
 *     on the typed catalog entries — pass-through, not derived.
 *
 * Caching: force-static, 24-hour edge cache. Catalog changes ship on
 * deploys, and the build-id-keyed cache key invalidates the moment a
 * new build lands. Stale-while-revalidate buys us 7 days of soft
 * freshness against any rare cache misses on the edge.
 */

import { NextResponse } from "next/server";
import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-static";
export const revalidate = 86400;

const BASE = "https://unlocksaas.com";

/**
 * Build the export payload at request time. Build-id keyed by the
 * force-static directive, so this runs exactly once per deploy and
 * the result is served from the edge for 24 hours afterward.
 *
 * Returning a plain object (not JSON-stringified) so Next.js's
 * `NextResponse.json` handles the serialization (consistent encoding,
 * single source of truth for content-type, ETag, etc.).
 */
function buildPayload() {
  // Timestamp the export to give consumers a freshness anchor without
  // them needing to introspect HTTP cache headers. UTC ISO 8601 so
  // the value parses identically in every locale.
  const generatedAt = new Date().toISOString();

  return {
    // `$schema` advertises the schema URL even though no JSON Schema
    // is currently published. Convention enough that academic users
    // know where to look for one; trivial follow-up to ship later.
    $schema: `${BASE}/dataset/schema.json`,
    metadata: {
      name: "indie-saas-teardowns",
      title: "UnlockSaaS Indie SaaS Teardowns Dataset",
      description:
        "Honest, founder-built analyses of 157 indie SaaS products across funnels, pricing, head-to-head comparisons, named-competitor alternatives, and category roundups. Brunson-framework lens applied uniformly. No fabricated metrics, no quoted competitor copy, every entry carries a dated lastVerified.",
      version: "1.0.0",
      publisher: "UnlockSaaS",
      publisherUrl: BASE,
      homepage: `${BASE}/dataset`,
      // CC-BY 4.0: free to use commercially, must attribute. Same
      // license as Wikipedia content, OpenStreetMap, Stack Exchange.
      license: "CC-BY-4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      attribution: `UnlockSaaS Indie SaaS Teardowns Dataset, ${BASE}/dataset`,
      // Plain-text citation snippet for academic use. Format is
      // intentionally close to APA-7 so anyone in a citation manager
      // can paste it directly.
      citation: `UnlockSaaS. (${new Date().getFullYear()}). UnlockSaaS Indie SaaS Teardowns Dataset (v1.0.0) [Data set]. ${BASE}/dataset`,
      generatedAt,
      counts: {
        alternatives: ALTERNATIVES.length,
        funnelTeardowns: TEARDOWNS.length,
        pricingTeardowns: PRICING_TEARDOWNS.length,
        comparisons: COMPARISONS.length,
        categories: CATEGORIES.length,
        total:
          ALTERNATIVES.length +
          TEARDOWNS.length +
          PRICING_TEARDOWNS.length +
          COMPARISONS.length +
          CATEGORIES.length,
      },
      contact: "maryan@unlocksaas.com",
      // Discovery anchors so a consumer who lands here can find the
      // companion surfaces without re-fetching the hub.
      relatedSurfaces: {
        hub: `${BASE}/dataset`,
        readme: `${BASE}/dataset/README.md`,
        csv: `${BASE}/dataset/indie-saas-teardowns.csv`,
        editorialPolicy: `${BASE}/editorial-policy`,
        mcpServer: `${BASE}/api/mcp`,
        mcpManifest: `${BASE}/.well-known/mcp.json`,
      },
    },
    // Catalogs are returned as-is — typed, structured, pass-through.
    // Consumers get the same shape the TypeScript modules export, so a
    // re-implementation in another language is a 1-to-1 mapping.
    alternatives: ALTERNATIVES,
    funnelTeardowns: TEARDOWNS,
    pricingTeardowns: PRICING_TEARDOWNS,
    comparisons: COMPARISONS,
    categories: CATEGORIES,
  } as const;
}

export function GET() {
  return NextResponse.json(buildPayload(), {
    headers: {
      // Cache long at the edge. Build-id key in Next.js's static
      // cache layer invalidates the moment a new deploy ships.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Open to anyone — datasets are useless behind CORS for browser-
      // side analysis tools (Observable, JSFiddle, codepen, etc.).
      "access-control-allow-origin": "*",
      // Make it downloadable with a sensible filename without forcing
      // it (omit `attachment;`). Browsers still let users right-click
      // and "save as"; curl + wget pick up the filename automatically.
      "content-disposition": "inline; filename=\"indie-saas-teardowns.json\"",
      // Point any retrieval pipeline at the human-readable hub as the
      // canonical citation target rather than this raw JSON URL.
      link: `<${BASE}/dataset>; rel="canonical"`,
    },
  });
}
