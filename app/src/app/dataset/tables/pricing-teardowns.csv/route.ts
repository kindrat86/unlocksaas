import {
  perTableCsvOptions,
  perTableCsvResponse,
} from "@/lib/seo/dataset-route";

/**
 * /dataset/tables/pricing-teardowns.csv — per-table CSV download.
 *
 * Standalone pricing teardown corpus with table-specific columns
 * (pricing model, payment frequency, free-trial behavior, anchor /
 * upgrade-trigger analysis, Brunson lens). Same CC-BY-4.0 license as
 * the bundled dataset.
 *
 * Column contract: see PRICING_TEARDOWN_CSV_COLUMNS in
 * src/lib/seo/dataset.ts. Append-only.
 */
export function GET() {
  return perTableCsvResponse("pricing-teardowns");
}

export function OPTIONS() {
  return perTableCsvOptions();
}

export const dynamic = "force-static";
export const runtime = "nodejs";
