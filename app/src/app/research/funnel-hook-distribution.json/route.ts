import { NextResponse } from "next/server";
import {
  ALL_HOOK_SCORES,
  HOOK_DISTRIBUTION,
  HOOK_RUBRIC,
} from "@/lib/seo/funnel-hook-analysis";
import {
  BASE_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
} from "@/lib/seo/dataset";
import { LAST_VERIFIED_DATE } from "@/lib/seo/freshness";

/**
 * /research/funnel-hook-distribution.json – machine-readable bundle.
 *
 * Surface C asset – CC-BY-4.0, attribution required, open CORS.
 *
 * Contents:
 *   - metadata block (name, slug, version, license, published, lastVerified,
 *     publisher, creator, source corpus link)
 *   - the full 5-axis rubric (each axis with keyword set + anchors)
 *   - per-pattern scores (one row per teardown in the source corpus,
 *     verbatim brunsonLens.hook pattern + axis scores + total)
 *   - the distribution summary (n, mean, median, min, max, histogram,
 *     per-axis means, count of patterns scoring under 4)
 *
 * Cache: 1h browser, 1d edge, 7d stale-while-revalidate. The bundle
 * changes only when the source corpus or the rubric changes – a deploy
 * is the natural bust event.
 *
 * Headers:
 *   - content-disposition: attachment so a clicked link in a tweet or
 *     newsletter saves the file rather than rendering inline.
 *   - link: rel=canonical to the HTML landing, rel=license to CC-BY-4.0,
 *     rel=alternate to the source dataset landing.
 *   - access-control-allow-origin: * so research notebooks, browser-
 *     based LLM-citation pipelines, and academic crawlers can fetch.
 */

const SLUG = "funnel-hook-distribution";
const VERSION = "1.0.0";
const PAGE_URL = `${BASE_URL}/research/${SLUG}`;
const JSON_URL = `${BASE_URL}/research/${SLUG}.json`;

const BUNDLE = {
  metadata: {
    name: "Indie SaaS Funnel Hook Distribution",
    slug: SLUG,
    version: VERSION,
    license: {
      spdx: DATASET_LICENSE_SPDX,
      url: DATASET_LICENSE_URL,
      attribution: `Source: ${ORGANIZATION.name} – Funnel Hook Distribution (${PAGE_URL}). Licensed under ${DATASET_LICENSE_SPDX}.`,
    },
    publishedIso: LAST_VERIFIED_DATE,
    lastVerifiedIso: LAST_VERIFIED_DATE,
    landing: PAGE_URL,
    download: JSON_URL,
    creator: {
      name: FOUNDER.name,
      url: `${BASE_URL}/founding`,
    },
    publisher: {
      name: ORGANIZATION.name,
      url: BASE_URL,
    },
    citationPermalink: `${BASE_URL}/cite/research-${SLUG}-v${VERSION.replace(
      /\./g,
      "-",
    )}`,
    isBasedOn: {
      name: "Indie SaaS Teardowns Dataset",
      url: `${BASE_URL}/dataset`,
    },
    methodologyNote:
      "Each pattern is scored 0/1/2 per axis by deterministic keyword pattern matching against the lowercased pattern string. Two distinct keyword hits push the axis score to 2; one hit scores 1; zero hits scores 0. Total range 0-10. The scoring code is published in app/src/lib/seo/funnel-hook-analysis.ts in the unlocksaas repository.",
    honestyNote:
      "The score is a property of our authored pattern description, not a judgment of the target company. We do not measure marketing performance, conversion rate, or traffic. Many one-axis hook patterns perform well in practice.",
  },
  rubric: HOOK_RUBRIC.map((axis) => ({
    axis: axis.axis,
    label: axis.label,
    short: axis.short,
    question: axis.question,
    anchors: axis.anchors,
    keywords: axis.keywords,
  })),
  scores: ALL_HOOK_SCORES.map((s) => ({
    slug: s.slug,
    displayName: s.displayName,
    category: s.category,
    pattern: s.pattern,
    byAxis: s.byAxis,
    total: s.total,
    missingAxes: s.missingAxes,
    hits: s.hits,
  })),
  distribution: {
    n: HOOK_DISTRIBUTION.n,
    mean: HOOK_DISTRIBUTION.mean,
    median: HOOK_DISTRIBUTION.median,
    min: HOOK_DISTRIBUTION.min,
    max: HOOK_DISTRIBUTION.max,
    belowFourCount: HOOK_DISTRIBUTION.belowFourCount,
    axisMeans: HOOK_DISTRIBUTION.axisMeans,
    histogram: HOOK_DISTRIBUTION.histogram,
  },
} as const;

const BUNDLE_JSON = JSON.stringify(BUNDLE, null, 2);

export function GET() {
  return new NextResponse(BUNDLE_JSON, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="funnel-hook-distribution-v${VERSION}.json"`,
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      link: [
        `<${DATASET_LICENSE_URL}>; rel="license"; title="${DATASET_LICENSE_SPDX}"`,
        `<${PAGE_URL}>; rel="canonical"`,
        `<${BASE_URL}/dataset>; rel="alternate"; type="text/html"; title="source corpus"`,
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
