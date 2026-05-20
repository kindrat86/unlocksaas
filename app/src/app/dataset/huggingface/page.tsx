import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  DATASET_BUNDLE,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
} from "@/lib/seo/dataset";
import { HF_DATASET_CARD_FRONTMATTER } from "@/lib/seo/dataset-hf";

/**
 * /dataset/huggingface — Hugging Face Datasets submission surface.
 *
 * Why this page exists
 * --------------------
 * The 2026-05-20 SEO audit identified "Submit dataset to Hugging Face
 * Datasets" as one of the highest-leverage off-platform lifts the
 * canonical dataset is currently missing. HF is one of the recognised
 * DataCatalogs Google Dataset Search ranks favourably, and the HF Hub
 * itself is a secondary acquisition surface that compounds with the
 * canonical landing page.
 *
 * This page is the canonical, indexable, machine-readable handoff
 * surface for the HF submission flow. It serves two audiences:
 *
 *   1. The operator – step-by-step submission flow, the curl command
 *      that downloads the pre-built README.md, the env-var name that
 *      activates the cross-listing in the canonical Dataset JSON-LD.
 *
 *   2. Search engines + AI retrievers – the page is a stable URL
 *      Google Dataset Search and any catalog crawler can follow when
 *      walking `Dataset.includedInDataCatalog` from the canonical
 *      /dataset Dataset schema. It is indexable; it carries
 *      BreadcrumbList JSON-LD; the canonical URL resolves to itself.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - The HF dataset card body and YAML frontmatter both derive from
 *     the canonical dataset module – every claim on this page is also
 *     present on /dataset and in /dataset/huggingface/raw.
 *   - The HF URL itself is not declared on the page until the operator
 *     sets NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL. Until then
 *     the page documents the activation step and shows the canonical
 *     submission flow.
 *   - lastVerified ISO is visible in the footer of the same page.
 *
 * Off-page lift mechanism: when the HF dataset repo is created and the
 * env var lands on Vercel, the canonical /dataset Dataset schema
 * automatically declares the HF DataCatalog cross-listing on the next
 * deploy. Google Dataset Search re-ingests and the canonical page lifts
 * in ranking for indie-SaaS / marketing-analysis dataset queries.
 */

export const metadata: Metadata = {
  title: `Hugging Face Datasets submission — ${DATASET_NAME}`,
  description: `Canonical ${DATASET_NAME} dataset card (YAML frontmatter + body) ready to upload to a Hugging Face Datasets repo. Includes the per-table CSV upload list, the env-var that activates the cross-listing, and the verification steps.`,
  alternates: markdownAlternate(
    "/dataset/huggingface",
    "/dataset/huggingface/raw",
  ),
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    title: `Hugging Face Datasets submission — ${DATASET_NAME}`,
    description: `Pre-built dataset card and submission playbook for hosting ${DATASET_NAME} on Hugging Face Datasets.`,
    url: "/dataset/huggingface",
    siteName: ORGANIZATION.name,
    publishedTime: DATASET_BUNDLE.lastVerified,
    modifiedTime: DATASET_BUNDLE.lastVerified,
    authors: [FOUNDER.name],
  },
  twitter: {
    card: "summary_large_image",
    title: `${DATASET_NAME} on Hugging Face Datasets`,
    description: "Canonical dataset card and submission playbook.",
  },
};

// Static — every value on the page derives from module-level constants.

const TRAIL = [
  { name: ORGANIZATION.name, url: `${BASE_URL}/` },
  { name: "Dataset", url: DATASET_URLS.landing },
  { name: "Hugging Face submission", url: `${BASE_URL}/dataset/huggingface` },
] as const;

const RAW_README_URL = `${BASE_URL}/dataset/huggingface/raw`;
const HF_NEW_DATASET_URL = "https://huggingface.co/new-dataset";

export default function DatasetHuggingFacePage() {
  const totalRows = DATASET_BUNDLE.counts.total_rows;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {ORGANIZATION.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <Link
            href="/dataset"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Dataset
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Hugging Face submission</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Off-platform lift · DataCatalog cross-listing · v{DATASET_VERSION}
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            id="tldr"
          >
            Hugging Face Datasets submission
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed"
            data-speakable
          >
            The {totalRows}-row {DATASET_NAME.toLowerCase()} ships at{" "}
            <Link
              href="/dataset"
              className="text-foreground underline underline-offset-4"
            >
              /dataset
            </Link>{" "}
            with full Dataset JSON-LD, citation, BibTeX, and per-table CSVs.
            This page is the canonical handoff surface for mirroring it to{" "}
            <a
              href="https://huggingface.co/datasets"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Hugging Face Datasets
            </a>{" "}
            – one of the recognised catalogs Google Dataset Search ranks
            favourably and a second acquisition surface for the same
            corpus.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Five-step submission</h2>
          <ol className="list-decimal list-outside ml-6 space-y-3 marker:text-muted-foreground">
            <li>
              <strong>Create the HF dataset repo.</strong>{" "}
              <a
                href={HF_NEW_DATASET_URL}
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                huggingface.co/new-dataset
              </a>
              . Suggested owner+name:{" "}
              <code className="text-sm">unlocksaas/indie-saas-teardowns</code>.
              Visibility: <em>Public</em>. License: <em>cc-by-4.0</em>.
            </li>
            <li>
              <strong>Download the canonical dataset card.</strong>
              <pre className="mt-2 bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {`curl -O ${RAW_README_URL}`}
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                The response sets <code>Content-Disposition</code> to{" "}
                <code>filename=&quot;README.md&quot;</code>, so the file
                lands ready to upload as-is.
              </p>
            </li>
            <li>
              <strong>Upload the CSVs to the repo root.</strong> Five
              per-table CSVs, downloadable from{" "}
              <Link
                href="/dataset"
                className="underline underline-offset-4"
              >
                /dataset
              </Link>
              :
              <ul className="mt-2 space-y-1 text-sm">
                {DATASET_PER_TABLE_SLUGS.map((slug) => {
                  const entry = DATASET_PER_TABLE_CSV[slug];
                  return (
                    <li key={slug}>
                      <a
                        href={perTableCsvUrl(slug)}
                        className="underline underline-offset-4"
                      >
                        {entry.displayName}
                      </a>{" "}
                      <span className="text-muted-foreground">
                        ({entry.rowCount} rows, {entry.columns.length}{" "}
                        columns) →{" "}
                        <code className="text-xs">{slug}.csv</code>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                HF Datasets Server auto-converts each CSV to Parquet on
                push – no manual conversion step.
              </p>
            </li>
            <li>
              <strong>Set the activation env var on Vercel.</strong>
              <pre className="mt-2 bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {`vercel env add NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL production
# Paste the HF repo URL when prompted, for example:
#   https://huggingface.co/datasets/unlocksaas/indie-saas-teardowns`}
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                Repeat for the <em>preview</em> environment if you want
                the cross-listing visible on preview deploys too.
              </p>
            </li>
            <li>
              <strong>Redeploy and verify.</strong> The Dataset JSON-LD
              on <code>/dataset</code> now declares the HF DataCatalog
              cross-listing automatically. Verify with the{" "}
              <a
                href="https://search.google.com/test/rich-results"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                Google Rich Results Test
              </a>{" "}
              against{" "}
              <Link
                href="/dataset"
                className="underline underline-offset-4"
              >
                /dataset
              </Link>{" "}
              – the schema graph should show one{" "}
              <code>includedInDataCatalog</code> entry with{" "}
              <code>name: &quot;Hugging Face Datasets&quot;</code>.
              Google Dataset Search re-ingests on the next crawl
              (typically 1–7 days).
            </li>
          </ol>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">YAML frontmatter preview</h2>
          <p className="text-sm text-muted-foreground">
            This is the exact YAML block the HF Hub parses to populate
            its search facets, the auto-Parquet conversion, and the
            dataset-card metadata panel. Identical to what{" "}
            <a
              href={RAW_README_URL}
              className="underline underline-offset-4"
            >
              /dataset/huggingface/raw
            </a>{" "}
            serves between its <code>---</code> delimiters.
          </p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {`---\n${HF_DATASET_CARD_FRONTMATTER}\n---`}
          </pre>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">
            Google Dataset Search verification
          </h2>
          <p>
            Google Dataset Search ingests the schema.org{" "}
            <code>Dataset</code> JSON-LD rendered on{" "}
            <Link
              href="/dataset"
              className="underline underline-offset-4"
            >
              /dataset
            </Link>{" "}
            – there is no separate submission portal. Three things make
            a Dataset eligible for inclusion:
          </p>
          <ul className="text-sm space-y-2 list-disc list-outside ml-6 marker:text-muted-foreground">
            <li>
              The page is indexable and the canonical URL is stable.{" "}
              <span className="text-muted-foreground">
                Confirmed – <code>/dataset</code> ships{" "}
                <code>robots: index, follow</code> and is listed in{" "}
                <Link
                  href="/sitemap.xml"
                  className="underline underline-offset-4"
                >
                  /sitemap.xml
                </Link>
                .
              </span>
            </li>
            <li>
              The <code>Dataset</code> JSON-LD carries{" "}
              <code>name</code>, <code>description</code>,{" "}
              <code>license</code>, <code>creator</code>,{" "}
              <code>distribution</code>, <code>dateModified</code>,{" "}
              <code>keywords</code>, <code>variableMeasured</code>, and
              <code> identifier</code>.{" "}
              <span className="text-muted-foreground">
                Confirmed – every field is sourced from the canonical
                dataset module and includes <code>measurementTechnique</code>
                {" "}
                describing the editorial method.
              </span>
            </li>
            <li>
              Cross-catalog corroboration via{" "}
              <code>includedInDataCatalog</code>.{" "}
              <span className="text-muted-foreground">
                Activates automatically once the HF env var lands. Until
                then the Dataset schema lists the canonical landing as
                its only <code>sameAs</code> – still eligible, but
                without the catalog-cross-listing rank lift.
              </span>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Use the{" "}
            <a
              href="https://datasetsearch.research.google.com/"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Google Dataset Search
            </a>{" "}
            UI to query the canonical name once Google has crawled the
            updated schema. Typical end-to-end propagation after the
            HF env var is set: 24 hours for the schema, 1–7 days for
            Dataset Search re-ingestion.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Brunson Hard-Rule</h2>
          <p className="text-sm">
            The HF dataset card body and YAML frontmatter both derive
            from the same module that drives <code>/dataset</code> and
            its JSON-LD. The HF mirror cannot drift from the canonical
            site by construction – every row count, license string,
            citation, and column contract is read once at module load.
          </p>
          <p className="text-sm">
            The HF cross-listing itself is operator-gated. The Dataset
            JSON-LD declares the catalog only when the env var resolves
            to a valid <code>https://</code> URL. A missing or
            malformed value is silently skipped – the schema validator
            never sees a fabricated catalog claim.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="text-sm text-muted-foreground space-y-1">
          <p>
            Author:{" "}
            <Link
              href="/about"
              className="text-foreground underline underline-offset-4"
            >
              {FOUNDER.name}
            </Link>
            , {FOUNDER.jobTitle}, {ORGANIZATION.name}
          </p>
          <p>Last verified: {DATASET_BUNDLE.lastVerified}</p>
          <p>Next editorial review: {DATASET_BUNDLE.nextReview}</p>
          <p>
            Raw README.md:{" "}
            <a
              href={RAW_README_URL}
              className="text-foreground underline underline-offset-4"
            >
              /dataset/huggingface/raw
            </a>
          </p>
        </section>
      </article>
    </div>
  );
}
