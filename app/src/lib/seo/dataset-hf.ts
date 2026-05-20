/**
 * Hugging Face Datasets card builder.
 *
 * Why this module exists
 * ----------------------
 * Hugging Face Datasets is one of the recognised DataCatalogs that Google
 * Dataset Search ranks favourably (alongside Kaggle, Zenodo, figshare,
 * DataCite). Listing the Indie SaaS Teardowns dataset on HF is the
 * single highest-leverage off-platform mechanism the audit identified
 * for "academic citation surface" — HF accounts for the bulk of dataset
 * traffic that turns into citations in NLP / ML papers, and HF Datasets
 * Server auto-derives a Parquet distribution from CSV uploads, which
 * lifts the Dataset Search ranking signal one more notch.
 *
 * HF's repo convention is "drop a README.md at the repo root with a
 * YAML frontmatter block that describes the dataset; HF parses it for
 * the search index and the Hub UI; the body below the frontmatter is
 * rendered as the human-readable dataset card." This module is the
 * single source of truth for that file.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every field below is sourced from the existing dataset module
 *     (DATASET_NAME, DATASET_BUNDLE.counts, DATASET_KEYWORDS, ...). No
 *     claim in the HF card is absent from the canonical page at
 *     /dataset and the JSON-LD on it.
 *   - Row counts are read live from the catalogs at module load. No
 *     fabricated "thousands of entries".
 *   - License is CC-BY-4.0; HF supports the SPDX identifier verbatim.
 *   - Versioned filenames in the upload list mirror the
 *     DATASET_VERSION constant so a versioned re-upload cannot drift.
 *
 * The card is served as plain markdown at /dataset/huggingface/raw with
 * Content-Disposition: attachment; filename="README.md" so the operator
 * curl-downloads it, uploads it to the HF repo as-is, and the HF Hub
 * accepts it without manual editing.
 */

import {
  DATASET_ALTERNATE_NAMES,
  DATASET_ATTRIBUTION,
  DATASET_BIBTEX,
  DATASET_BUNDLE,
  DATASET_CITATION,
  DATASET_KEYWORDS,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_MEASUREMENT_TECHNIQUE,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_SLUG,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
  type DatasetPerTableSlug,
} from "@/lib/seo/dataset";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";

// ---------------------------------------------------------------------------
// HF taxonomy values
// ---------------------------------------------------------------------------

/**
 * HF `task_categories` controlled vocabulary entries that apply to the
 * Indie SaaS Teardowns dataset. Both are honest: the corpus is structured
 * text suitable for retrieval, classification, and few-shot tasks that
 * pivot on indie SaaS marketing analysis.
 *
 * Listed because the HF search filter UI exposes these as facets – being
 * indexed under both lifts discoverability for the citation-relevant
 * audience (ML researchers building marketing-analysis classifiers).
 */
const HF_TASK_CATEGORIES = ["text-classification", "text-retrieval"] as const;

/** HF language controlled vocabulary – BCP-47 base tags only. */
const HF_LANGUAGES = ["en"] as const;

/**
 * HF size category buckets. Pick the bucket the dataset's total row
 * count falls into – HF computes this automatically when the CSVs ship,
 * but declaring it in the frontmatter avoids a parse race on first
 * upload.
 */
function pickHfSizeCategory(totalRows: number): string {
  if (totalRows < 1_000) return "n<1K";
  if (totalRows < 10_000) return "1K<n<10K";
  if (totalRows < 100_000) return "10K<n<100K";
  if (totalRows < 1_000_000) return "100K<n<1M";
  return "n>1M";
}

/** HF tags – free-form keywords that surface in search and recommendation. */
const HF_TAGS = Object.freeze([
  "saas",
  "indie-hackers",
  "marketing",
  "funnel-analysis",
  "pricing-analysis",
  "comparison",
  "russell-brunson",
  "value-ladder",
  "editorial",
  "honest-claims",
]);

// ---------------------------------------------------------------------------
// YAML serialization
// ---------------------------------------------------------------------------

/**
 * YAML 1.2 plain-scalar quoting heuristic.
 *
 * A string is safe as a plain scalar when it contains no YAML reserved
 * characters and is not parseable as a boolean / null / number. When
 * any of those hold, wrap in double quotes and escape internal quotes
 * and backslashes per YAML's double-quoted-string escape rules.
 *
 * HF parses the frontmatter with python-yaml (PyYAML), which is strict
 * about reserved-character scalars. Erring on the side of double-quoting
 * keeps the parser silent.
 */
function yamlScalar(value: string): string {
  // Reserved indicators that require quoting in plain scalar form.
  const NEEDS_QUOTING = /[:#&*!|>'"%@`\-?{}[\],\\]|^\s|\s$|^(true|false|null|yes|no|on|off)$/i;
  if (!NEEDS_QUOTING.test(value) && !/^\d/.test(value)) {
    return value;
  }
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** Render a YAML list of strings as a block sequence. */
function yamlStringList(items: readonly string[], indent: string): string {
  return items.map((v) => `${indent}- ${yamlScalar(v)}`).join("\n");
}

// ---------------------------------------------------------------------------
// HF config blocks
// ---------------------------------------------------------------------------

/**
 * One HF "config" per per-table CSV. HF Datasets supports a single
 * config with multiple splits, OR multiple configs each with one split.
 * The latter is the right pick here: the five tables (funnel teardowns,
 * pricing teardowns, comparisons, alternatives, categories) have
 * different column schemas, so they cannot share a single Arrow / Parquet
 * shape. Listing each as its own config lets HF Datasets Server
 * auto-convert each to Parquet independently and surface them as
 * separate configs in the Hub UI.
 *
 * Convention: config_name matches the source-table key
 * (`funnel_teardowns`, etc.), the data_files path matches the CSV
 * filename as it lands at the HF repo root, and the split is named
 * `train` per HF's default-split convention (no labels, no eval split –
 * this is a reference corpus, not a benchmark).
 *
 * The CSV filenames mirror the per-table downloads on unlocksaas.com,
 * so a re-uploader can curl them directly from /dataset/tables/<slug>.csv
 * without renaming.
 */
function buildHfConfigs(): string {
  const lines: string[] = ["configs:"];
  for (const slug of DATASET_PER_TABLE_SLUGS) {
    const entry = DATASET_PER_TABLE_CSV[slug];
    lines.push(`  - config_name: ${yamlScalar(entry.sourceTable)}`);
    lines.push(`    data_files:`);
    lines.push(`      - split: train`);
    lines.push(`        path: ${yamlScalar(`${slug}.csv`)}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Frontmatter assembly
// ---------------------------------------------------------------------------

/**
 * Build the YAML frontmatter block. HF's frontmatter format is documented
 * at https://huggingface.co/docs/hub/datasets-cards – every key below is
 * one HF recognises.
 *
 * `pretty_name` is the human-readable display string; `language` is
 * BCP-47; `license` accepts the SPDX identifier; `tags` and
 * `task_categories` are search facets; `size_categories` is one of
 * HF's published buckets; `configs` maps the CSV files to splits.
 *
 * Frozen at module load – HF YAML is a build-time constant.
 */
function buildHfFrontmatter(): string {
  const sizeCategory = pickHfSizeCategory(DATASET_BUNDLE.counts.total_rows);
  const lines: string[] = [];

  lines.push(`pretty_name: ${yamlScalar(DATASET_NAME)}`);
  lines.push(`language:\n${yamlStringList(HF_LANGUAGES, "  ")}`);
  lines.push(`license: ${yamlScalar(DATASET_LICENSE_SPDX.toLowerCase())}`);
  lines.push(`license_link: ${yamlScalar(DATASET_LICENSE_URL)}`);
  lines.push(`size_categories:\n  - ${yamlScalar(sizeCategory)}`);
  lines.push(
    `task_categories:\n${yamlStringList(HF_TASK_CATEGORIES, "  ")}`,
  );
  lines.push(`tags:\n${yamlStringList(HF_TAGS, "  ")}`);
  lines.push(`source_datasets:\n  - original`);
  lines.push(buildHfConfigs());

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Card body
// ---------------------------------------------------------------------------

/**
 * The markdown body below the YAML frontmatter. HF renders this as the
 * dataset card on the Hub. Mirrors the canonical /dataset landing copy
 * for drift-free re-use – every claim here is also present at /dataset.
 *
 * Sections deliberately match the HF "Dataset Card Template" from
 * https://huggingface.co/docs/hub/datasets-cards so reviewers find a
 * familiar shape.
 */
function buildHfBody(): string {
  const counts = DATASET_BUNDLE.counts;
  const tablesTable = [
    "| Config | Rows | Source page pattern |",
    "| --- | --- | --- |",
    ...DATASET_PER_TABLE_SLUGS.map((slug) => {
      const entry = DATASET_PER_TABLE_CSV[slug];
      const sourcePattern = `${BASE_URL}/${slug.replace(/-/g, "-")}/{slug}`;
      return `| \`${entry.sourceTable}\` | ${entry.rowCount} | ${sourcePattern} |`;
    }),
  ].join("\n");

  const perTableLinks = DATASET_PER_TABLE_SLUGS.map(
    (slug: DatasetPerTableSlug) =>
      `- \`${DATASET_PER_TABLE_CSV[slug].sourceTable}\` – [${DATASET_PER_TABLE_CSV[slug].displayName}](${perTableCsvUrl(slug)})`,
  ).join("\n");

  return `# ${DATASET_NAME}

> An open editorial dataset of ${counts.total_rows} indie SaaS marketing analyses. Every row is a re-projection of a published page on [${BASE_URL.replace(/^https?:\/\//, "")}](${BASE_URL}) and carries a dated \`last_verified\` field.

| | |
| --- | --- |
| Version | \`${DATASET_VERSION}\` |
| License | \`${DATASET_LICENSE_SPDX}\` – ${DATASET_LICENSE_URL} |
| Last verified | ${DATASET_BUNDLE.lastVerified} |
| Next editorial review | ${DATASET_BUNDLE.nextReview} |
| Total rows | ${counts.total_rows} |
| Configs | ${DATASET_PER_TABLE_SLUGS.length} (one per source table) |
| Canonical home | ${DATASET_URLS.landing} |

## Dataset Summary

Five tables, each a structured re-projection of a public marketing-analysis surface on [unlocksaas.com](${BASE_URL}):

- **\`funnel_teardowns\`** (${counts.funnel_teardowns} rows) – Indie SaaS marketing funnels analyzed through Russell Brunson's Hook / Story / Offer framework. Each row carries hook/story/offer pattern + analysis, what's working, what to adapt, what to avoid, and a Brunson-lens summary.
- **\`pricing_teardowns\`** (${counts.pricing_teardowns} rows) – Indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics. Approximate prices with dated \`last_verified\`.
- **\`comparisons\`** (${counts.comparisons} rows) – Symmetric head-to-head "A vs B" comparisons with best-for fields, pick-A-if / pick-B-if lists, evaluated dimensions, an honest take, and an indie-founder recommendation.
- **\`alternatives\`** (${counts.alternatives} rows) – Honest named-competitor comparison rows that respect the competitor's real value proposition and name the category difference, not a quality gap.
- **\`categories\`** (${counts.categories} rows) – Canonical category buckets used to group teardowns and comparisons into category roundup pages.

## Configs and Splits

${tablesTable}

Each config exposes a single \`train\` split. HF Datasets Server auto-converts the CSVs to Parquet on push.

## Supported Tasks

The corpus is structured text suitable for:

- **\`text-classification\`** – Hook/Story/Offer labeling, pricing-model classification, conversion-pattern detection, indie vs enterprise SaaS positioning.
- **\`text-retrieval\`** – Few-shot retrieval over indie SaaS marketing analyses, RAG over comparison rows, similarity search across competitor positioning.

## Languages

English (\`en\`). All source pages on unlocksaas.com are en-US; translated locales on the canonical site do not change the dataset rows.

## Dataset Structure

### Source files

Five CSVs are uploaded at the repo root, one per config:

${perTableLinks}

All five carry RFC 4180 CSV formatting (CRLF terminators, quoted fields with internal quotes doubled, pipe-separated list cells for array columns), append-only column contracts, and a stable column order.

### Universal flat CSV

A denormalized "one row per record, all five tables" projection ships at [${DATASET_URLS.csv}](${DATASET_URLS.csv}). 14 universal columns with a \`record_type\` discriminator. Use this when you want a quick \`pd.read_csv\` workflow without parsing five files.

### JSON bundle

Full structured rows for all five tables with schema descriptions and citation metadata: [${DATASET_URLS.json}](${DATASET_URLS.json}).

## Data Fields

Per-config column contracts are stable and append-only. Once published, a column's position never moves. Optional values may be added; types and positions are immutable.

Full per-config column lists are in the source repository at [/dataset](${DATASET_URLS.landing}) under "CSV column contract".

## Data Splits

Each config has a single \`train\` split. There is no held-out evaluation split – this is a reference corpus, not a benchmark.

## Source Data

### Initial Data Collection and Normalization

${DATASET_MEASUREMENT_TECHNIQUE}

### Who are the source language producers?

${FOUNDER.name}, ${FOUNDER.jobTitle} of ${ORGANIZATION.name}, is the sole author of the source pages. Bio: ${BASE_URL}/about. Editorial policy: ${BASE_URL}/editorial-policy.

## Annotations

The dataset is the annotation – there is no separate labeling layer. The structured fields (Hook/Story/Offer analyses, tier breakdowns, pick-A-if lists, honest verdicts) are the author's editorial annotations on each source page, captured at the same level of granularity they appear on the rendered HTML.

## Considerations for Using the Data

### Social Impact of Dataset

The corpus is suitable for research and tooling that helps indie SaaS founders understand marketing patterns honestly. The editorial standard explicitly refuses fabricated metrics, scraped private data, and inferred user counts; the dataset is built so a downstream classifier or retriever cannot accidentally surface bad-faith claims sourced from the corpus itself.

### Discussion of Biases

The corpus reflects a single editorial point of view: Russell Brunson's Hook / Story / Offer framework as the analytic lens. Pricing analyses use Brunson stack / anchor / value-ladder vocabulary. Downstream re-users should be aware that the dataset is opinionated by design and document the framework when citing.

### Other Known Limitations

- **Approximate pricing.** Public SaaS pricing pages change frequently; prices in the pricing_teardowns table are flagged "approximate" in the JSON bundle and column names mirror that framing in the CSV.
- **English-only.** Source pages have translated locales on the canonical site (\`es\`, \`pt-BR\`) but the dataset rows are the en-US canonical content.
- **Coverage.** ${counts.funnel_teardowns + counts.pricing_teardowns} indie SaaS companies are analyzed at time of last verification (${DATASET_BUNDLE.lastVerified}); the catalog grows on the canonical site, and re-uploads will follow.

## Additional Information

### Dataset Curators

${FOUNDER.name} (${FOUNDER.jobTitle}, ${ORGANIZATION.name}). Contact: ${ORGANIZATION.email}.

### Licensing Information

Released under the [Creative Commons Attribution 4.0 International license (${DATASET_LICENSE_SPDX})](${DATASET_LICENSE_URL}). Re-use is unrestricted – copy, redistribute, remix, transform, and build upon for any purpose including commercial – provided you give appropriate credit.

**Required attribution.** Paste this string in a footnote, methods note, or page footer:

\`\`\`
${DATASET_ATTRIBUTION}
\`\`\`

### Citation Information

Plain text:

\`\`\`
${DATASET_CITATION}
\`\`\`

BibTeX:

\`\`\`bibtex
${DATASET_BIBTEX}
\`\`\`

### Contributions

Errors and correction requests: open a contact via ${BASE_URL}/contact. All accepted corrections are logged publicly in the editorial-policy corrections log at ${BASE_URL}/editorial-policy.

### Alternate names

${DATASET_ALTERNATE_NAMES.map((n) => `- \`${n}\``).join("\n")}

`;
}

// ---------------------------------------------------------------------------
// Public exports
// ---------------------------------------------------------------------------

/**
 * Pre-built YAML frontmatter. Module-scope constant – no per-request
 * allocation, no per-render serialization (server-hoist-static-io
 * pattern from the React Best Practices guide).
 */
export const HF_DATASET_CARD_FRONTMATTER: string = buildHfFrontmatter();

/**
 * Pre-built markdown body. Same hoist discipline as the frontmatter.
 */
export const HF_DATASET_CARD_BODY: string = buildHfBody();

/**
 * Full README.md ready to drop into the HF dataset repo root. The
 * frontmatter is delimited by `---` lines per HF's parser convention.
 *
 * Operator workflow: curl this string at /dataset/huggingface/raw,
 * upload as README.md on the HF repo, upload the five CSVs from
 * /dataset/tables/*.csv as siblings, push. Done.
 */
export const HF_DATASET_CARD_README: string = `---
${HF_DATASET_CARD_FRONTMATTER}
---

${HF_DATASET_CARD_BODY}`;
