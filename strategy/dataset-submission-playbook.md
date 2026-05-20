# Dataset submission playbook

> Indie SaaS Teardowns Dataset – Hugging Face Datasets and Google Dataset Search
> activation. Status: code is shipped (2026-05-20), operator action gates the
> cross-listing.

This is the operator-facing companion to `app/src/lib/seo/dataset-hf.ts` and
the surfaces under `app/src/app/dataset/`. The code is in place. This
document is the five-minute checklist for the founder to flip the env-driven
gates from `operator` to `shipped`.

## Why this matters

Google Dataset Search ranks datasets higher when they appear in a recognised
`DataCatalog` (Hugging Face Datasets, Kaggle, Zenodo, figshare, DataCite).
The schema.org `Dataset.includedInDataCatalog` field is the canonical way
to declare a cross-listing; once declared and confirmed by the crawler, the
canonical page on unlocksaas.com lifts in ranking for indie-SaaS /
marketing-analysis dataset queries, AND the HF Hub itself becomes a second
acquisition surface that compounds with the canonical landing.

The audit on 2026-05-20 identified this as one of the highest impact-per-effort
moves available. Code is done; operator activation is the only gate.

## Current state

| Component | State | Notes |
| --- | --- | --- |
| Canonical landing at /dataset | shipped | Dataset JSON-LD, CC-BY-4.0, BibTeX, citation, 5 per-table CSVs |
| HF submission surface at /dataset/huggingface | shipped | Pre-built dataset card + five-step playbook |
| Raw README.md at /dataset/huggingface/raw | shipped | curl-downloadable as `README.md`, build-time constant |
| Sitemap entries | shipped | Both URLs listed, crawler-discoverable |
| Activation log entry | shipped | `dataset_external_catalogs` row in freshness.ts |
| HF dataset repo | **operator** | Operator creates at huggingface.co/new-dataset |
| `NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL` env var | **operator** | Set on Vercel after the HF repo exists |
| Google Dataset Search re-ingest | downstream | 1–7 days after the env var lands |

## Five-minute submission flow

### 1. Create the HF dataset repo

Go to https://huggingface.co/new-dataset.

- Owner: your HF org (suggest `unlocksaas`) or your personal HF handle.
- Dataset name: `indie-saas-teardowns` (lowercase, dashed).
- Visibility: **Public**.
- License: **cc-by-4.0** (matches the canonical license).

Click "Create dataset".

### 2. Download the canonical dataset card

```bash
curl -O https://unlocksaas.com/dataset/huggingface/raw
```

This saves `README.md` to the current directory. The file is the exact body
HF's parser expects: YAML frontmatter between `---` delimiters, then the
markdown dataset card. No manual editing required.

If you prefer to inspect first, open
https://unlocksaas.com/dataset/huggingface in a browser – the page renders
the same YAML frontmatter as a preview.

### 3. Upload the README and the five per-table CSVs

From the HF dataset repo page, click "Add file" → "Upload files".

Upload these six files:

- `README.md` – downloaded in step 2.
- `funnel-teardowns.csv` – from https://unlocksaas.com/dataset/tables/funnel-teardowns.csv
- `pricing-teardowns.csv` – from https://unlocksaas.com/dataset/tables/pricing-teardowns.csv
- `comparisons.csv` – from https://unlocksaas.com/dataset/tables/comparisons.csv
- `alternatives.csv` – from https://unlocksaas.com/dataset/tables/alternatives.csv
- `categories.csv` – from https://unlocksaas.com/dataset/tables/categories.csv

Or, if you have the HF CLI installed:

```bash
huggingface-cli login
huggingface-cli upload unlocksaas/indie-saas-teardowns \
  README.md \
  funnel-teardowns.csv \
  pricing-teardowns.csv \
  comparisons.csv \
  alternatives.csv \
  categories.csv \
  --repo-type=dataset
```

HF Datasets Server starts the auto-Parquet conversion within a couple of
minutes. The dataset card on the Hub now shows the five configs
(`funnel_teardowns`, `pricing_teardowns`, `comparisons`, `alternatives`,
`categories`) with row counts and column shapes.

### 4. Set the activation env var on Vercel

```bash
vercel env add NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL production
# When prompted, paste the canonical HF URL, for example:
#   https://huggingface.co/datasets/unlocksaas/indie-saas-teardowns

vercel env add NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL preview
# Same URL – or omit if you only want the cross-listing on prod.
```

The env var is `NEXT_PUBLIC_*` because the value is rendered into
server-rendered JSON-LD; no secret leakage risk.

### 5. Redeploy and verify

Trigger a redeploy (any commit to `main` will do). On the next deploy:

1. The Dataset JSON-LD on https://unlocksaas.com/dataset now declares
   `includedInDataCatalog: [{ "@type": "DataCatalog", "name": "Hugging Face Datasets", "url": "https://huggingface.co/datasets" }]`
   and the HF repo URL is appended to `sameAs`.

2. The HF page at /dataset/huggingface now renders a "Live at <HF URL>"
   line in the catalog mirrors block (the empty-state branch flips to
   the live branch automatically – no template change needed).

3. The activation-log row in /llms.txt + /llms-feed.json flips from
   `operator` to `shipped` once you bump LAST_VERIFIED_DATE on the next
   quarterly review.

Verify the schema graph with the Google Rich Results Test:
https://search.google.com/test/rich-results

Paste https://unlocksaas.com/dataset. The graph viewer should show:

- One Dataset node with `includedInDataCatalog` populated.
- `sameAs` containing both the canonical landing URL and the HF URL.
- `measurementTechnique` populated with the editorial-method paragraph.

Google Dataset Search re-ingests on its own crawl cadence (typically
1–7 days). Search https://datasetsearch.research.google.com/ for
"indie saas teardowns" or "indie saas marketing dataset" to confirm
ingestion.

## Why this isn't fully autonomous

Two steps require a human:

1. **Creating the HF account / org.** HF accounts require email
   verification and a profile; that is intentionally a human-in-the-loop
   action, and the Brunson Hard-Rule explicitly forbids fabricating
   accounts.

2. **Uploading files to HF.** The HF API needs a personal access token
   (a secret), and the dataset infrastructure on Vercel does not store
   HF credentials. The CLI / web UI is the correct surface for this
   one-time upload.

Everything else (the dataset card, the YAML frontmatter, the per-table
CSVs, the cross-catalog JSON-LD, the sitemap entries, the activation-log
mirror) is shipped and lives on https://unlocksaas.com.

## Kaggle and Zenodo – future optional mirrors

The same env-driven cross-listing slots are reserved for two additional
catalogs:

- `NEXT_PUBLIC_UNLOCKSAAS_KAGGLE_DATASET_URL` – Kaggle Datasets.
  Submission flow mirrors HF: create a Kaggle dataset, upload the same
  five CSVs, set the env var, redeploy. The Dataset JSON-LD picks up
  the Kaggle cross-listing on the next deploy.

- `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL` – Zenodo. Zenodo issues a DOI
  on submission, and DOIs are the strongest dataset identifier class
  Google Dataset Search recognises. Submission flow: register an
  account, upload the JSON bundle + the five per-table CSVs + the
  README.md, request a DOI, set the env var with the DOI landing URL.

All three slots are optional and additive. Each adds one more
`includedInDataCatalog` row to the canonical Dataset schema and one
more `sameAs` URL. Until the env var is set, the slot is silently
omitted – Brunson Hard-Rule: never advertise a listing that does not
exist.

## Source of truth

- `app/src/lib/seo/dataset.ts` – canonical dataset metadata.
- `app/src/lib/seo/dataset-hf.ts` – HF dataset card builder.
- `app/src/lib/seo/entity.ts` – env-driven `DATASET_EXTERNAL_REGISTRATIONS`.
- `app/src/components/seo/json-ld.tsx` – `PublicDatasetJsonLd` builder.
- `app/src/app/dataset/page.tsx` – canonical landing.
- `app/src/app/dataset/huggingface/page.tsx` – HF submission surface.
- `app/src/app/dataset/huggingface/raw/route.ts` – raw README.md route.
- `app/src/lib/seo/freshness.ts` – activation-log entry.
- `app/src/lib/seo/llms-txt.ts` – LLM-readable mirror of the surfaces.
