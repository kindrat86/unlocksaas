import { NextResponse } from "next/server";
import {
  DATASET_BUNDLE_CSV,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
} from "@/lib/seo/dataset";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /dataset/indie-saas-teardowns.csv — flat denormalized CSV download.
 *
 * Surface C companion to the JSON bundle. Same dataset, projected into a
 * single tabular shape so a re-user can drop it into a spreadsheet,
 * pandas, R, or DuckDB without parsing nested JSON.
 *
 * Column contract
 * ---------------
 * Stable column order (append-only, see DATASET_CSV_COLUMNS in
 * src/lib/seo/dataset.ts):
 *
 *   record_type, slug, name_a, name_b, category, one_line, tldr,
 *   creator, homepage_url_a, homepage_url_b, tags, last_verified,
 *   canonical_url, markdown_url
 *
 * `record_type` discriminates one of five values: funnel_teardown,
 * pricing_teardown, comparison, alternative, category. The `name_b` /
 * `homepage_url_b` columns are populated only for comparison rows.
 *
 * Headers
 * -------
 *   - content-type: text/csv — RFC 4180, the canonical MIME for CSV
 *   - content-disposition: attachment with versioned filename
 *   - cache-control: same edge TTL as the JSON sibling
 *   - link: license + canonical + alternate to the JSON sibling
 *   - access-control-allow-origin: *
 */
export function GET() {
  return new NextResponse(DATASET_BUNDLE_CSV, {
    status: 200,
    headers: {
      // RFC 4180 MIME. Some older spreadsheet apps still sniff for
      // application/vnd.ms-excel — those are decades obsolete and the
      // standard MIME wins universally now.
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${DATASET_SLUG}-v${DATASET_VERSION}.csv"`,
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      link: [
        `<${DATASET_LICENSE_URL}>; rel="license"; title="${DATASET_LICENSE_SPDX}"`,
        `<${DATASET_URLS.landing}>; rel="canonical"`,
        `<${DATASET_URLS.json}>; rel="alternate"; type="application/json"`,
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

