import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import {
  BASE_URL,
  DATASET_DOI,
  DATASET_DOI_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  DATASET_BUNDLE,
  DATASET_NAME,
  DATASET_PER_TABLE_CSV,
  DATASET_PER_TABLE_SLUGS,
  DATASET_URLS,
  DATASET_VERSION,
  perTableCsvUrl,
} from "@/lib/seo/dataset";
import { ZENODO_DEPOSITION_FILES } from "@/lib/seo/dataset-zenodo";

/**
 * /dataset/zenodo – Zenodo submission surface.
 *
 * Why this page exists
 * --------------------
 * The 2026-05-20 SEO audit identified "Zenodo or OSF.io mirror → real
 * DOI" as the highest-leverage off-platform lift the canonical dataset
 * was still missing. DOIs are the strongest dataset identifier class
 * Google Dataset Search recognises, the canonical citation form every
 * academic reference manager (Zotero, Mendeley, EndNote) pivots on,
 * and a persistent identifier that survives URL churn forever.
 *
 * This page is the canonical, indexable, machine-readable handoff
 * surface for the Zenodo submission flow. It serves two audiences:
 *
 *   1. The operator – step-by-step submission flow that pairs with
 *      scripts/mint-zenodo-deposit.py (the CLI that talks to Zenodo's
 *      API). Documents the env-var pair that activates the cross-
 *      listing and the DOI propagation, and the OSF.io alternative
 *      for operators who prefer that catalog.
 *
 *   2. Search engines + AI retrievers – the page is a stable URL
 *      Google Dataset Search and any catalog crawler can follow when
 *      walking `Dataset.includedInDataCatalog` from the canonical
 *      /dataset Dataset schema. Indexable; BreadcrumbList JSON-LD;
 *      canonical resolves to itself.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - The deposition metadata JSON and the file upload list both
 *     derive from the canonical dataset module – every claim on this
 *     page is also present on /dataset.
 *   - The Zenodo URL + DOI are not declared on the page until the
 *     operator publishes the deposit and pastes both on Vercel.
 *     Until then the page documents the activation step and renders
 *     the canonical submission flow.
 *   - lastVerified ISO is visible in the footer of the same page.
 */

export const metadata: Metadata = {
  title: `Zenodo submission – ${DATASET_NAME} (DOI mirror)`,
  description: `Mint a persistent DOI for ${DATASET_NAME} via Zenodo. Operator submission flow with the pre-built deposition metadata payload, the dataset file upload list, the API-driven CLI, and the env-var pair that activates the DOI in the canonical Dataset JSON-LD and HF dataset card.`,
  alternates: markdownAlternate("/dataset/zenodo", "/dataset/zenodo/raw"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    title: `Zenodo DOI submission – ${DATASET_NAME}`,
    description: `Pre-built Zenodo deposition payload and submission playbook for minting a persistent DOI on ${DATASET_NAME}.`,
    url: "/dataset/zenodo",
    siteName: ORGANIZATION.name,
    publishedTime: DATASET_BUNDLE.lastVerified,
    modifiedTime: DATASET_BUNDLE.lastVerified,
    authors: [FOUNDER.name],
  },
  twitter: {
    card: "summary_large_image",
    title: `${DATASET_NAME} on Zenodo (DOI mirror)`,
    description:
      "Canonical deposition payload and DOI mint playbook.",
  },
};

// Static – every value derives from module-level constants.

const TRAIL = [
  { name: ORGANIZATION.name, url: `${BASE_URL}/` },
  { name: "Dataset", url: DATASET_URLS.landing },
  { name: "Zenodo submission", url: `${BASE_URL}/dataset/zenodo` },
] as const;

const RAW_DEPOSITION_URL = `${BASE_URL}/dataset/zenodo/raw`;
const ZENODO_NEW_UPLOAD_URL = "https://zenodo.org/uploads/new";
const ZENODO_SANDBOX_URL = "https://sandbox.zenodo.org/";
const OSF_NEW_PROJECT_URL = "https://osf.io/myprojects/";

export default function DatasetZenodoPage() {
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
          <span>Zenodo submission</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Off-platform lift · Persistent DOI · v{DATASET_VERSION}
          </p>
          <h1
            className="text-3xl md:text-4xl font-bold leading-tight mb-4"
            id="tldr"
          >
            Zenodo submission – mint a persistent DOI
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
            under CC-BY-4.0. This page is the canonical handoff surface
            for depositing it on{" "}
            <a
              href="https://zenodo.org/"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Zenodo
            </a>{" "}
            – CERN's open-research repository – so the deposit mints a
            persistent DOI. DOIs are the strongest dataset identifier
            class Google Dataset Search recognises, the canonical
            citation form every academic reference manager pivots on,
            and propagate automatically into the BibTeX, the citation
            string, and the Hugging Face dataset card the moment the
            DOI lands on Vercel.
          </p>
          {DATASET_DOI_URL ? (
            <p className="mt-4 text-sm">
              <strong>Live DOI:</strong>{" "}
              <a
                href={DATASET_DOI_URL}
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4 font-mono"
              >
                {DATASET_DOI}
              </a>
            </p>
          ) : null}
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Six-step submission</h2>
          <ol className="list-decimal list-outside ml-6 space-y-3 marker:text-muted-foreground">
            <li>
              <strong>Create a Zenodo account.</strong>{" "}
              <a
                href="https://zenodo.org/signup/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                zenodo.org/signup
              </a>
              . Free, ORCID-linkable. If you already have a GitHub or
              ORCID account, sign in via either – Zenodo accepts both
              as identity providers. New accounts get an API access
              token under{" "}
              <a
                href="https://zenodo.org/account/settings/applications/"
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                Account → Applications → Personal access tokens
              </a>
              . Scopes needed: <code>deposit:write</code> and{" "}
              <code>deposit:actions</code>.
            </li>
            <li>
              <strong>Export the pre-built deposition payload.</strong>
              <pre className="mt-2 bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {`curl -O ${RAW_DEPOSITION_URL}`}
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                The response sets <code>Content-Disposition</code> to{" "}
                <code>filename=&quot;zenodo-deposition.json&quot;</code>,
                so the file lands ready for the CLI. The payload is the
                exact JSON shape{" "}
                <a
                  href="https://developers.zenodo.org/#deposit-metadata"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  Zenodo&rsquo;s API expects
                </a>
                .
              </p>
            </li>
            <li>
              <strong>Run the operator CLI.</strong>
              <pre className="mt-2 bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {`export ZENODO_API_TOKEN="<paste-your-token>"
python3 scripts/mint-zenodo-deposit.py --confirm`}
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                The CLI creates the deposition, uploads the{" "}
                {ZENODO_DEPOSITION_FILES.length} artifacts (JSON bundle,
                universal CSV, {DATASET_PER_TABLE_SLUGS.length} per-table
                CSVs, markdown summary), reserves a DOI, and publishes
                the deposit. The CLI prints the resulting DOI + record
                URL on success. Without <code>--confirm</code> it does
                a dry-run that prints the planned API calls without
                executing them.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Prefer the sandbox first?{" "}
                <code>--sandbox</code> targets{" "}
                <a
                  href={ZENODO_SANDBOX_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  sandbox.zenodo.org
                </a>{" "}
                instead of the production Zenodo – same API shape, DOIs
                are sandbox-scoped and non-resolvable, but the workflow
                rehearses cleanly without committing a real DOI.
              </p>
            </li>
            <li>
              <strong>Set the activation env vars on Vercel.</strong>
              <pre className="mt-2 bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                {`# The Zenodo record landing URL (catalog cross-listing target)
vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL production
# Paste the URL the CLI printed, for example:
#   https://zenodo.org/records/12345678

# The bare DOI (identifier surface)
vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI production
# Paste the bare DOI the CLI printed, for example:
#   10.5281/zenodo.12345678`}
              </pre>
              <p className="text-sm text-muted-foreground mt-2">
                Both vars are <code>NEXT_PUBLIC_*</code> – the values
                render into server-rendered JSON-LD and have no
                secrecy contract. The DOI itself is independently
                verifiable by following{" "}
                <code>https://doi.org/&lt;doi&gt;</code>; pasting a
                fabricated value would point at nothing.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Repeat for <em>preview</em> if you want the cross-
                listing visible on preview deploys too.
              </p>
            </li>
            <li>
              <strong>Redeploy and verify.</strong> The next deploy
              picks up both env vars. On the live site:
              <ul className="mt-2 list-disc list-outside ml-6 text-sm space-y-1 marker:text-muted-foreground">
                <li>
                  The Dataset JSON-LD on <code>/dataset</code> declares
                  the DOI as a typed{" "}
                  <code>PropertyValue identifier</code>, appends{" "}
                  <code>https://doi.org/&lt;doi&gt;</code> to{" "}
                  <code>sameAs</code>, and adds the Zenodo catalog row
                  to <code>includedInDataCatalog</code>.
                </li>
                <li>
                  The BibTeX entry gets a <code>doi = {`{ ... }`}</code>{" "}
                  field. The citation string gets a{" "}
                  <code>DOI: https://doi.org/&lt;doi&gt;</code> suffix.
                </li>
                <li>
                  The Hugging Face dataset card&rsquo;s YAML frontmatter
                  gets a <code>doi:</code> field; the dataset card body
                  gets a DOI table row near the top.
                </li>
                <li>
                  The downloaded JSON bundle gets <code>doi</code> +{" "}
                  <code>doiUrl</code> fields.
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Verify with the{" "}
                <a
                  href="https://search.google.com/test/rich-results"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  Google Rich Results Test
                </a>{" "}
                against <code>/dataset</code> – the Dataset node should
                show <code>identifier</code> as an array with the DOI
                PropertyValue first.
              </p>
            </li>
            <li>
              <strong>Wait for Dataset Search ingestion.</strong> Google
              Dataset Search re-ingests on its own crawl cadence
              (typically 1–7 days). The DOI propagates faster across
              academic citation pipelines: Zotero / Mendeley / EndNote
              recognise the DOI immediately because the Zenodo record
              is already published; the citation export formats on the
              Zenodo record page (BibTeX, RIS, CSL-JSON, DataCite XML)
              are immediately usable.
            </li>
          </ol>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Files uploaded to the deposit</h2>
          <p className="text-sm text-muted-foreground">
            The CLI fetches each artifact from the canonical site and
            uploads it under the filename below. Version-suffixed so a
            future bump produces a new deposit (and a new DOI) without
            file-name collisions.
          </p>
          <ul className="space-y-2">
            {ZENODO_DEPOSITION_FILES.map((file) => (
              <li
                key={file.filename}
                className="border border-border rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <code className="text-sm font-medium">
                      {file.filename}
                    </code>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {file.description}
                    </div>
                  </div>
                  <a
                    href={file.sourceUrl}
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Source
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Total per-table CSV count: {DATASET_PER_TABLE_SLUGS.length}.
            Counts per table:{" "}
            {DATASET_PER_TABLE_SLUGS.map((slug) => {
              const entry = DATASET_PER_TABLE_CSV[slug];
              return `${entry.displayName} (${entry.rowCount})`;
            }).join(", ")}
            .
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">No-CLI alternative (web UI)</h2>
          <p>
            If you would rather click than script, the same artifacts
            upload through Zenodo&rsquo;s web UI. The deposition payload
            JSON contains every metadata field, so you can paste each
            value into the corresponding form input.
          </p>
          <ol className="list-decimal list-outside ml-6 space-y-2 text-sm marker:text-muted-foreground">
            <li>
              Go to{" "}
              <a
                href={ZENODO_NEW_UPLOAD_URL}
                rel="noopener noreferrer"
                target="_blank"
                className="underline underline-offset-4"
              >
                zenodo.org/uploads/new
              </a>
              .
            </li>
            <li>
              Upload type: <em>Dataset</em>. Access right: <em>Open</em>.
              License: <em>Creative Commons Attribution 4.0</em>.
            </li>
            <li>
              Open{" "}
              <a
                href={RAW_DEPOSITION_URL}
                className="underline underline-offset-4"
              >
                {RAW_DEPOSITION_URL}
              </a>{" "}
              in another tab. Each form field on the Zenodo page maps
              one-to-one to a key in the JSON.
            </li>
            <li>
              Upload the {ZENODO_DEPOSITION_FILES.length} files from the
              list above. Drag-drop from the canonical site or download
              first.
            </li>
            <li>
              Click <em>Reserve DOI</em>, then <em>Publish</em>. Copy
              the DOI from the resulting record page.
            </li>
            <li>Set both env vars on Vercel and redeploy (step 4 above).</li>
          </ol>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">OSF.io alternative</h2>
          <p>
            <a
              href="https://osf.io/"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Open Science Framework
            </a>{" "}
            (OSF) also mints DOIs and is a recognised{" "}
            <code>DataCatalog</code>. The same dataset can be deposited
            on OSF instead of (or in addition to) Zenodo. The env-var
            slot is reserved:
          </p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {`vercel env add NEXT_PUBLIC_UNLOCKSAAS_OSF_DATASET_URL production
# Paste the OSF project URL, for example:
#   https://osf.io/abc123/

vercel env add NEXT_PUBLIC_UNLOCKSAAS_OSF_DOI production
# Paste the bare DOI OSF mints, for example:
#   10.17605/OSF.IO/ABC123`}
          </pre>
          <p className="text-sm text-muted-foreground">
            Create the OSF project at{" "}
            <a
              href={OSF_NEW_PROJECT_URL}
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              osf.io/myprojects
            </a>
            , upload the same{" "}
            {ZENODO_DEPOSITION_FILES.length} artifacts, click{" "}
            <em>Create DOI</em>. The DOI propagates into the canonical
            Dataset JSON-LD the same way Zenodo&rsquo;s does. Both
            slots are additive – you can have a Zenodo DOI as the
            primary identifier and an OSF deposit as an additional
            <code> includedInDataCatalog</code> row.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Brunson Hard-Rule</h2>
          <p className="text-sm">
            The deposition metadata payload, the file upload list, the
            HTML description, and the citation block all derive from
            the same module that drives <code>/dataset</code> and its
            JSON-LD. The Zenodo deposit cannot drift from the canonical
            site by construction – every row count, license string,
            citation, and column contract is read once at module load.
          </p>
          <p className="text-sm">
            The live DOI is committed as a verified public default. Future
            overrides still pass through the same validators: the URL must
            be <code>https://</code> and the bare DOI must match{" "}
            <code>10.&lt;digits&gt;/&lt;suffix&gt;</code>. A malformed
            override is silently skipped – the schema validator never sees
            a fabricated DOI claim.
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
            Raw deposition payload:{" "}
            <a
              href={RAW_DEPOSITION_URL}
              className="text-foreground underline underline-offset-4"
            >
              /dataset/zenodo/raw
            </a>
          </p>
          <p>
            Operator CLI:{" "}
            <code className="text-foreground">
              scripts/mint-zenodo-deposit.py
            </code>
          </p>
        </section>
      </article>
    </div>
  );
}
