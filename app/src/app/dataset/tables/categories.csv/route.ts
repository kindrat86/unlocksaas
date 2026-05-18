import {
  perTableCsvOptions,
  perTableCsvResponse,
} from "@/lib/seo/dataset-route";

/**
 * /dataset/tables/categories.csv — per-table CSV download.
 *
 * Standalone canonical-category corpus with table-specific columns
 * (display name, one-line summary, AEO intent paragraph, raw category
 * matcher strings). Same CC-BY-4.0 license as the bundled dataset.
 *
 * Column contract: see CATEGORY_CSV_COLUMNS in
 * src/lib/seo/dataset.ts. Append-only.
 */
export function GET() {
  return perTableCsvResponse("categories");
}

export function OPTIONS() {
  return perTableCsvOptions();
}

export const dynamic = "force-static";
export const runtime = "nodejs";
