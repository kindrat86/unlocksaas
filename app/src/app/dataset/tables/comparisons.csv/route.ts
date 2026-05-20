import {
  perTableCsvOptions,
  perTableCsvResponse,
} from "@/lib/seo/dataset-route";

/**
 * /dataset/tables/comparisons.csv — per-table CSV download.
 *
 * Standalone head-to-head comparison corpus with table-specific
 * columns (best-for fields per side, pick-A-if / pick-B-if lists,
 * dimension count, honest take, indie-founder verdict). Same
 * CC-BY-4.0 license as the bundled dataset.
 *
 * Column contract: see COMPARISON_CSV_COLUMNS in
 * src/lib/seo/dataset.ts. Append-only.
 */
export function GET() {
  return perTableCsvResponse("comparisons");
}

export function OPTIONS() {
  return perTableCsvOptions();
}

