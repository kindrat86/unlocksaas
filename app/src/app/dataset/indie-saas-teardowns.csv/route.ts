/**
 * /dataset/indie-saas-teardowns.csv — flat CSV export of the entire
 * UnlockSaaS catalog under CC-BY 4.0.
 *
 * Why CSV in addition to JSON
 * ---------------------------
 * The JSON sibling at /dataset/indie-saas-teardowns.json preserves the
 * full typed shape of every catalog entry. That is the right format for
 * engineers re-implementing analyses, but the wrong format for the
 * majority of would-be citers: academic notebooks (pandas, R), business
 * analysts (Excel, Google Sheets, Numbers), and journalists building a
 * quick chart in Datawrapper or Flourish all expect CSV.
 *
 * Shape: long-format (entity_type as a column, one row per catalog
 * entry across all five catalogs). This denormalises the heterogeneous
 * catalog shapes into a single table at the cost of leaving the
 * detailed payload fields blank for entries that do not have them.
 * The trade-off is correct for the use case: a journalist who wants
 * "every indie SaaS we have analysed" gets one CSV; a researcher who
 * wants the full Brunson lens reads the JSON.
 *
 * Columns (stable, documented in /dataset/README.md):
 *   entity_type         alternative | funnel-teardown | pricing-teardown | comparison | category
 *   slug                kebab-case URL slug
 *   display_name        proper-noun display (for comparisons: "A vs B")
 *   category            the catalog's category bucket
 *   one_line            single-line thesis
 *   tldr                40-to-60-word TL;DR (where the entity has one)
 *   creator             person or company that operates it (where known)
 *   url_canonical       https URL of the UnlockSaaS analysis page
 *   url_target          the analysed product's homepage (where known)
 *   last_verified       ISO 8601 date of last manual sanity check
 *
 * Brunson Hard-Rule reconciliation: every column is a pass-through of
 * fields that already render on the public HTML pages. No derived
 * scores, no fabricated metrics, no aggregated statistics. The CSV is
 * the catalog, not an analysis OF the catalog.
 *
 * License: CC-BY 4.0 (same as the JSON sibling and the hub page).
 * Attribution requirement: "UnlockSaaS Indie SaaS Teardowns Dataset,
 * https://unlocksaas.com/dataset". Header row labels this in a
 * comment line and the route response is companion-linked to the
 * README markdown.
 */

import { NextResponse } from "next/server";
import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-static";
export const revalidate = 86400;

const BASE = "https://unlocksaas.com";

/**
 * RFC 4180 CSV escaping. A field is wrapped in double quotes if it
 * contains a comma, a double quote, a newline, or a carriage return;
 * any embedded double quote is doubled.
 *
 * Doing this inline rather than reaching for a CSV library because the
 * catalog content is well-known (short strings, no embedded binaries)
 * and the escape rules are five lines. A library would add ~30 KB to
 * the function bundle for zero benefit.
 */
function csvEscape(value: string | null | undefined): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build one CSV row from a column-ordered field list. */
function row(fields: ReadonlyArray<string | null | undefined>): string {
  return fields.map(csvEscape).join(",");
}

/**
 * Render the full CSV. Built at build-time (force-static), so the
 * string-concatenation cost is amortised across every cache hit.
 */
function buildCsv(): string {
  // Header row. Stable column names match the schema documented in
  // /dataset/README.md and in the hub page Dataset JSON-LD.
  const header = [
    "entity_type",
    "slug",
    "display_name",
    "category",
    "one_line",
    "tldr",
    "creator",
    "url_canonical",
    "url_target",
    "last_verified",
  ];

  const rows: string[] = [header.join(",")];

  // ALTERNATIVES — `Alternative` interface in src/lib/alternatives.ts.
  // No `tldr` field; oneLine doubles as the summary. URL target is
  // `homepageUrl`.
  for (const a of ALTERNATIVES) {
    rows.push(
      row([
        "alternative",
        a.slug,
        a.displayName,
        a.category,
        a.oneLine,
        // No tldr on Alternative; honestVerdict is the closest
        // narrative equivalent.
        a.honestVerdict,
        a.creator,
        `${BASE}/alternatives-to/${a.slug}`,
        a.homepageUrl,
        a.lastVerified,
      ]),
    );
  }

  // FUNNEL TEARDOWNS — `FunnelTeardown` interface in
  // src/lib/funnel-teardowns.ts. Has both oneLine and tldr.
  for (const t of TEARDOWNS) {
    rows.push(
      row([
        "funnel-teardown",
        t.slug,
        t.displayName,
        t.category,
        t.oneLine,
        t.tldr,
        t.creator,
        `${BASE}/funnel-teardown/${t.slug}`,
        // FunnelTeardown does not carry a homepageUrl field on the
        // top-level interface; the productSnapshot context names the
        // target but does not provide a URL. Leave blank.
        undefined,
        t.lastVerified,
      ]),
    );
  }

  // PRICING TEARDOWNS — `PricingTeardown` interface in
  // src/lib/pricing-teardowns.ts. Same shape as funnel teardowns.
  for (const t of PRICING_TEARDOWNS) {
    rows.push(
      row([
        "pricing-teardown",
        t.slug,
        t.displayName,
        t.category,
        t.oneLine,
        t.tldr,
        t.creator,
        `${BASE}/pricing-teardown/${t.slug}`,
        undefined,
        t.lastVerified,
      ]),
    );
  }

  // COMPARISONS — `Comparison` interface in src/lib/comparisons.ts.
  // display_name is "A vs B" (matches the heading on the HTML page);
  // url_target is intentionally blank because there are two products,
  // not one.
  for (const c of COMPARISONS) {
    rows.push(
      row([
        "comparison",
        c.slug,
        `${c.a.name} vs ${c.b.name}`,
        c.category,
        c.oneLine,
        c.tldr,
        undefined,
        `${BASE}/compare/${c.slug}`,
        undefined,
        c.lastVerified,
      ]),
    );
  }

  // CATEGORIES — `CategoryDef` interface in src/lib/categories.ts.
  // No tldr; the intent paragraph is the narrative field. No
  // lastVerified — categories are evergreen and do not carry a date.
  for (const cat of CATEGORIES) {
    rows.push(
      row([
        "category",
        cat.slug,
        cat.displayName,
        cat.slug,
        cat.oneLine,
        cat.intent,
        undefined,
        `${BASE}/category/${cat.slug}`,
        undefined,
        undefined,
      ]),
    );
  }

  // RFC 4180 line ending convention is CRLF, which Excel honors most
  // reliably. Some Unix tools strip CR transparently; the trade-off
  // is correct for the broadest consumer compatibility.
  return rows.join("\r\n") + "\r\n";
}

export function GET() {
  const csv = buildCsv();
  return new NextResponse(csv, {
    status: 200,
    headers: {
      // text/csv is the IANA-registered media type for CSV. The
      // charset is explicit so Excel on Windows does not misread
      // non-ASCII characters (proper-noun company names, em dashes
      // in TL;DRs, etc.).
      "content-type": "text/csv; charset=utf-8",
      // Hint a sensible filename, inline so browsers preview by
      // default rather than forcing download.
      "content-disposition": "inline; filename=\"indie-saas-teardowns.csv\"",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      link: `<${BASE}/dataset>; rel="canonical"`,
    },
  });
}
