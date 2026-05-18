/**
 * /dataset/[file] — public open-dataset endpoint, one route per filename.
 *
 * Why a single dynamic route (not one route file per filename)
 * -----------------------------------------------------------
 * Eleven explicit route files would be eleven copies of the same boilerplate.
 * The DATASET_FILES manifest in @/lib/seo/dataset is the single source of
 * truth; `generateStaticParams` prerenders every spec'd filename at build
 * time, the switch in GET picks the renderer, and force-static means every
 * filename ships as a flat static file with edge cache headers. No
 * Supabase round-trip, no per-request cost — same operational profile as
 * the sitemap or robots.txt.
 *
 * Output discipline
 * -----------------
 *   JSON files → buildEnvelope() + jsonResponse() — every payload wraps
 *                the rows in a schema.org-Dataset-shaped envelope so a
 *                citer can attribute correctly from the file alone.
 *   CSV files  → csvResponse() with the column manifest from
 *                dataset.ts — RFC-4180 escaping, license preamble.
 *
 * No row of the dataset is invented here. Every flattener reads the
 * existing source-of-truth catalog modules. The JSON exports carry the
 * full nested record. The CSV exports flatten to scalar columns that
 * are stable across releases (column adds are minor version bumps).
 *
 * The unique bundle file `indie-saas.json` wraps every catalog under
 * the same envelope so the "one-file citation" path works — researchers
 * who would otherwise have to download five files get one.
 */

import { notFound } from "next/navigation";
import {
  ALTERNATIVES,
} from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";
import {
  ALTERNATIVE_CSV_COLUMNS,
  CATEGORY_CSV_COLUMNS,
  COMPARISON_CSV_COLUMNS,
  DATASET_FILES,
  DATASET_TOTAL_ROWS,
  FUNNEL_TEARDOWN_CSV_COLUMNS,
  PRICING_TEARDOWN_CSV_COLUMNS,
  buildEnvelope,
  csvResponse,
  flattenAlternatives,
  flattenCategories,
  flattenComparisons,
  flattenFunnelTeardowns,
  flattenPricingTeardowns,
  jsonResponse,
} from "@/lib/seo/dataset";

// Pure data, no per-request inputs. Build once, serve forever. Edge cache
// headers on the response are belt-and-suspenders for CDN propagation.
export const dynamic = "force-static";
// `revalidate = false` would also work; `revalidate = 0` defeats static.
// Omit revalidate entirely — `force-static` is the contract.

/**
 * Pre-render every filename listed in DATASET_FILES at build time.
 * Adding a new entry to the manifest auto-extends this set on the next
 * build with no edits to this file.
 */
export function generateStaticParams() {
  return DATASET_FILES.map((spec) => ({ file: spec.filename }));
}

// Brunson Hard-Rule reconciliation: `dynamicParams = false` makes any
// filename not in the manifest 404 instead of dynamically rendering an
// empty envelope. Keeps the surface honest — only the catalogs we
// actually ship are advertised.
export const dynamicParams = false;

interface Props {
  params: Promise<{ file: string }>;
}

export async function GET(_req: Request, props: Props): Promise<Response> {
  const { file } = await props.params;
  const spec = DATASET_FILES.find((s) => s.filename === file);
  if (!spec) {
    // dynamicParams = false should make this unreachable, but defence-in-
    // depth: any request that bypasses the prerender gate gets a clean
    // 404 instead of a misleading empty file.
    notFound();
  }

  switch (file) {
    // ─── Combined bundle ─────────────────────────────────────────────
    case "indie-saas.json": {
      const envelope = {
        $schema: "https://schema.org/Dataset" as const,
        name: "Unlock SaaS Indie SaaS Teardowns Dataset",
        description:
          "Five-catalog bundle covering indie SaaS alternatives, funnel teardowns, pricing teardowns, head-to-head comparisons, and category roundups. Every row carries a lastVerified ISO date.",
        version: "1.0.0",
        datePublished: "2026-05-18",
        license: {
          spdx: "CC-BY-4.0" as const,
          name: "Creative Commons Attribution 4.0 International" as const,
          url: "https://creativecommons.org/licenses/by/4.0/" as const,
        },
        attribution:
          "Source: Unlock SaaS Indie SaaS Teardowns Dataset, https://unlocksaas.com/dataset, Maryan, CC-BY-4.0.",
        source: "https://unlocksaas.com/dataset",
        totalRows: DATASET_TOTAL_ROWS,
        catalogs: {
          alternatives: {
            count: ALTERNATIVES.length,
            rows: ALTERNATIVES,
          },
          funnel_teardowns: {
            count: TEARDOWNS.length,
            rows: TEARDOWNS,
          },
          pricing_teardowns: {
            count: PRICING_TEARDOWNS.length,
            rows: PRICING_TEARDOWNS,
          },
          comparisons: {
            count: COMPARISONS.length,
            rows: COMPARISONS,
          },
          categories: {
            count: CATEGORIES.length,
            rows: CATEGORIES,
          },
        },
      };
      const body = JSON.stringify(envelope, null, 2);
      return new Response(body, {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "content-disposition": `attachment; filename="${file}"`,
          "x-license": "CC-BY-4.0",
          "x-license-notice":
            "Source: Unlock SaaS Indie SaaS Teardowns Dataset, https://unlocksaas.com/dataset, Maryan, CC-BY-4.0.",
          "cache-control":
            "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
          "access-control-allow-origin": "*",
        },
      });
    }

    // ─── Per-catalog JSON ────────────────────────────────────────────
    case "alternatives.json":
      return jsonResponse({
        envelope: buildEnvelope({
          name: "Indie SaaS Alternatives",
          description:
            "Honest competitor comparison rows. Each row names a real product and the category difference, not a quality gap.",
          rows: ALTERNATIVES,
        }),
        filename: file,
      });
    case "funnel-teardowns.json":
      return jsonResponse({
        envelope: buildEnvelope({
          name: "Indie SaaS Funnel Teardowns",
          description:
            "Hook / Story / Offer analysis of indie SaaS funnels, with what-to-adapt and what-to-avoid lists per company.",
          rows: TEARDOWNS,
        }),
        filename: file,
      });
    case "pricing-teardowns.json":
      return jsonResponse({
        envelope: buildEnvelope({
          name: "Indie SaaS Pricing Teardowns",
          description:
            "Tier structure, anchor mechanics, upgrade triggers, and payment-mechanics analysis of indie SaaS pricing pages.",
          rows: PRICING_TEARDOWNS,
        }),
        filename: file,
      });
    case "comparisons.json":
      return jsonResponse({
        envelope: buildEnvelope({
          name: "Indie SaaS Head-to-Head Comparisons",
          description:
            "Symmetric head-to-head comparisons of indie SaaS tools, with per-dimension verdicts and an indie-founder-specific pick.",
          rows: COMPARISONS,
        }),
        filename: file,
      });
    case "categories.json":
      return jsonResponse({
        envelope: buildEnvelope({
          name: "Indie SaaS Category Roundups",
          description:
            "Canonical SaaS category buckets and the matchers that map raw category strings into them.",
          rows: CATEGORIES,
        }),
        filename: file,
      });

    // ─── Per-catalog CSV ─────────────────────────────────────────────
    case "alternatives.csv":
      return csvResponse({
        rows: flattenAlternatives(),
        columns: [...ALTERNATIVE_CSV_COLUMNS],
        filename: file,
        datasetName: "Indie SaaS Alternatives (CSV)",
        datasetDescription:
          "Top-level scalar columns of the alternatives catalog, for spreadsheet analysis.",
      });
    case "funnel-teardowns.csv":
      return csvResponse({
        rows: flattenFunnelTeardowns(),
        columns: [...FUNNEL_TEARDOWN_CSV_COLUMNS],
        filename: file,
        datasetName: "Indie SaaS Funnel Teardowns (CSV)",
        datasetDescription:
          "Top-level scalar columns of the funnel teardown catalog, for spreadsheet analysis.",
      });
    case "pricing-teardowns.csv":
      return csvResponse({
        rows: flattenPricingTeardowns(),
        columns: [...PRICING_TEARDOWN_CSV_COLUMNS],
        filename: file,
        datasetName: "Indie SaaS Pricing Teardowns (CSV)",
        datasetDescription:
          "Top-level scalar columns of the pricing teardown catalog, for spreadsheet analysis.",
      });
    case "comparisons.csv":
      return csvResponse({
        rows: flattenComparisons(),
        columns: [...COMPARISON_CSV_COLUMNS],
        filename: file,
        datasetName: "Indie SaaS Head-to-Head Comparisons (CSV)",
        datasetDescription:
          "Top-level scalar columns of the comparison catalog, for spreadsheet analysis.",
      });
    case "categories.csv":
      return csvResponse({
        rows: flattenCategories(),
        columns: [...CATEGORY_CSV_COLUMNS],
        filename: file,
        datasetName: "Indie SaaS Category Roundups (CSV)",
        datasetDescription:
          "Top-level scalar columns of the category catalog, for spreadsheet analysis.",
      });

    default:
      // Reachable only if a filename is added to DATASET_FILES without
      // a matching case here. The compiler can't catch the gap because
      // the manifest is a runtime constant; this fallback gives an
      // explicit error path. Brunson Hard-Rule: never serve an empty
      // envelope under a real filename.
      console.error(
        "[dataset/[file]] manifest entry has no renderer; bug in route handler",
        { file },
      );
      notFound();
  }
}
