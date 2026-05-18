import { NextResponse } from "next/server";
import {
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_PER_TABLE_CSV,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
  type DatasetPerTableSlug,
} from "@/lib/seo/dataset";

/**
 * Shared response helper for per-table CSV route handlers.
 *
 * Each of the five files under app/src/app/dataset/tables/<slug>.csv/
 * is a one-line route that delegates to this function. Centralizing the
 * cache + license + canonical headers means a future change (rotating
 * the cache TTL, adding ETag, updating the license URL) lands in one
 * place, not five.
 *
 * Why a separate helper rather than a generic dynamic route
 * ---------------------------------------------------------
 * Next.js App Router does not accept literal-suffix dynamic segments
 * (`[slug].csv/` is parsed as a literal folder, not a dynamic segment),
 * so the cleanest way to serve `/dataset/tables/funnel-teardowns.csv`,
 * `/dataset/tables/pricing-teardowns.csv`, etc. is one route handler
 * per file. Each handler is a single function call.
 */
export function perTableCsvResponse(slug: DatasetPerTableSlug): NextResponse {
  const entry = DATASET_PER_TABLE_CSV[slug];
  return new NextResponse(entry.body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}-v${DATASET_VERSION}.csv"`,
      // Same edge-cache discipline as the bundled JSON + CSV.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      link: [
        `<${DATASET_LICENSE_URL}>; rel="license"; title="${DATASET_LICENSE_SPDX}"`,
        `<${DATASET_URLS.landing}>; rel="canonical"`,
        `<${perTableCsvUrl(slug)}>; rel="self"; type="text/csv"`,
        `<${DATASET_URLS.json}>; rel="alternate"; type="application/json"`,
      ].join(", "),
    },
  });
}

/** OPTIONS preflight handler. Same for every per-table route. */
export function perTableCsvOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}
