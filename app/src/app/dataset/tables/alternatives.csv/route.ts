import {
  perTableCsvOptions,
  perTableCsvResponse,
} from "@/lib/seo/dataset-route";

/**
 * /dataset/tables/alternatives.csv — per-table CSV download.
 *
 * Standalone named-competitor alternative corpus with table-specific
 * columns (whatItIs / whatItIsNot, whoForIt / whoNotForIt, honest
 * verdict, capability count). Same CC-BY-4.0 license as the bundled
 * dataset.
 *
 * Column contract: see ALTERNATIVE_CSV_COLUMNS in
 * src/lib/seo/dataset.ts. Append-only.
 */
export function GET() {
  return perTableCsvResponse("alternatives");
}

export function OPTIONS() {
  return perTableCsvOptions();
}

export const dynamic = "force-static";
export const runtime = "nodejs";
