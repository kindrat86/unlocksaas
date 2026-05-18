import { NextResponse } from "next/server";
import {
  DATASET_BUNDLE_JSON,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
} from "@/lib/seo/dataset";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /dataset/indie-saas-teardowns.json — full JSON bundle download.
 *
 * Surface C (linkable asset). Public, CC-BY-4.0, attribution-required.
 *
 * Response shape
 * --------------
 * The body is pre-serialized at module load in src/lib/seo/dataset.ts.
 * Per-request cost is a single string write. The bundle includes:
 *   - dataset metadata (name, slug, version, generatedAt, lastVerified)
 *   - license (SPDX + URL + attribution clause)
 *   - publisher + creator entity blocks
 *   - citation + bibtex strings
 *   - keyword list
 *   - row counts per table
 *   - five tables: funnel_teardowns, pricing_teardowns, comparisons,
 *     alternatives, categories (full structured rows, not flattened)
 *   - schema descriptions per table with canonical URL patterns
 *
 * Headers
 * -------
 *   - content-type: application/json (the bundle is structured JSON)
 *   - content-disposition: attachment; filename=...  so a browser hit
 *     triggers a download dialog rather than rendering raw JSON inline
 *   - cache-control: long edge TTL with stale-while-revalidate — the
 *     content changes at the catalog-edit cadence, not request cadence
 *   - link: License: rel + canonical anchor
 *   - access-control-allow-origin: * — research pipelines, notebook
 *     environments, and academic crawlers often run from a different
 *     origin; refusing CORS forces them to scrape instead
 */
export function GET() {
  return new NextResponse(DATASET_BUNDLE_JSON, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Force a download so a clicked link in a tweet or newsletter
      // saves a real .json file rather than opening as a webpage. A
      // re-user who actually wants to inspect inline can still curl
      // the URL directly.
      "content-disposition": `attachment; filename="${DATASET_SLUG}-v${DATASET_VERSION}.json"`,
      // Same edge-cache discipline as /llms-feed.json: changes at the
      // catalog-edit cadence (a couple of times per week at most).
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Open CORS so research notebooks, academic crawlers, and
      // browser-side LLM citation pipelines can fetch without a
      // server-side proxy.
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      // Standard W3C license link relation. The Link header is read by
      // legal-aware aggregators (Internet Archive, academic mirrors)
      // before the body is parsed.
      link: [
        `<${DATASET_LICENSE_URL}>; rel="license"; title="${DATASET_LICENSE_SPDX}"`,
        `<${DATASET_URLS.landing}>; rel="canonical"`,
        `<${BASE_URL}/dataset.md>; rel="alternate"; type="text/markdown"`,
      ].join(", "),
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}

// Static — body is pre-built at module load.
export const dynamic = "force-static";

// Node.js runtime (default). Pulls module-level data from five catalogs
// totalling ~14k lines of TS; sized for Node, not for an Edge V8 isolate.
export const runtime = "nodejs";
