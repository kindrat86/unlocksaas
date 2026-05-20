import {
  perTableCsvOptions,
  perTableCsvResponse,
} from "@/lib/seo/dataset-route";

/**
 * /dataset/tables/funnel-teardowns.csv — per-table CSV download.
 *
 * Standalone funnel teardown corpus with table-specific columns
 * (hook/story/offer patterns, Brunson lens, what's working, what to
 * adapt, what to avoid). Same CC-BY-4.0 license as the bundled
 * dataset; see /dataset for the landing, citation, and BibTeX.
 *
 * Column contract: see FUNNEL_TEARDOWN_CSV_COLUMNS in
 * src/lib/seo/dataset.ts. Append-only.
 */
export function GET() {
  return perTableCsvResponse("funnel-teardowns");
}

export function OPTIONS() {
  return perTableCsvOptions();
}

