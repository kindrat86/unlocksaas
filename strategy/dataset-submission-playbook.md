# Dataset submission playbook

> Indie SaaS Teardowns Dataset – Hugging Face Datasets and Google Dataset Search
> activation. Status: Hugging Face + Zenodo are live and committed as verified
> defaults (2026-05-22); Kaggle / OSF remain optional operator mirrors.

This is the operator-facing companion to `app/src/lib/seo/dataset-hf.ts` and
the surfaces under `app/src/app/dataset/`. The code now emits verified public
defaults for the live Hugging Face repo and Zenodo DOI record; this document
remains the checklist for future mirrors and canonical URL changes.

## Why this matters

Google Dataset Search ranks datasets higher when they appear in a recognised
`DataCatalog` (Hugging Face Datasets, Kaggle, Zenodo, figshare, DataCite).
The schema.org `Dataset.includedInDataCatalog` field is the canonical way
to declare a cross-listing; once declared and confirmed by the crawler, the
canonical page on unlocksaas.com lifts in ranking for indie-SaaS /
marketing-analysis dataset queries, AND the HF Hub itself becomes a second
acquisition surface that compounds with the canonical landing.

The audit on 2026-05-20 identified this as one of the highest impact-per-effort
moves available. Hugging Face and Zenodo have since moved from operator-gated
to active external anchors.

## Current state

| Component | State | Notes |
| --- | --- | --- |
| Canonical landing at /dataset | shipped | Dataset JSON-LD, CC-BY-4.0, BibTeX, citation, 5 per-table CSVs |
| HF submission surface at /dataset/huggingface | shipped | Pre-built dataset card + five-step playbook |
| Raw README.md at /dataset/huggingface/raw | shipped | curl-downloadable as `README.md`, build-time constant |
| Sitemap entries | shipped | Both URLs listed, crawler-discoverable |
| Activation log entry | shipped | `dataset_external_catalogs` row in freshness.ts |
| HF dataset repo | **active** | `https://huggingface.co/datasets/unlocksaas/indie-saas-teardowns` |
| `NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL` env var | optional override | Leave blank unless the canonical HF repo moves |
| Zenodo DOI record | **active** | `10.5281/zenodo.20315742` at `https://zenodo.org/records/20315742` |
| `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI(_URL)` env vars | optional override | Leave blank unless a new canonical DOI supersedes the current record |
| Google Dataset Search re-ingest | downstream | 1–7 days after the deployment is crawled |

## Hugging Face Datasets <a id="hugging-face-datasets"></a>

The live repo is already active at
`https://huggingface.co/datasets/unlocksaas/indie-saas-teardowns`. The flow
below is retained for future repo migrations or version refreshes.

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

## Zenodo – persistent DOI mirror (shipped 2026-05-21) <a id="zenodo"></a>

Zenodo is the CERN-hosted open-research repository that mints persistent
DOIs on deposit. DOIs are the strongest dataset identifier class Google
Dataset Search recognises, the canonical citation form every academic
reference manager (Zotero, Mendeley, EndNote, RefWorks) pivots on, and
a persistent identifier that survives URL churn forever.

Code is in place. Operator activation gates the DOI.

### What ships with the canonical site

| Component | State | Notes |
| --- | --- | --- |
| Canonical landing at /dataset | shipped | DOI propagates into Dataset JSON-LD, BibTeX, citation when env vars set |
| Zenodo submission surface at /dataset/zenodo | shipped | Pre-built deposition payload + six-step playbook + OSF.io alternative |
| Raw deposition JSON at /dataset/zenodo/raw | shipped | curl-downloadable as `zenodo-deposition.json`, build-time constant |
| Sitemap entries | shipped | Both URLs listed, crawler-discoverable |
| Operator CLI at scripts/mint-zenodo-deposit.py | shipped | API-driven: creates deposit, uploads files, publishes. `--sandbox` for rehearsal, default is dry-run |
| Zenodo account + token | **operator** | Free registration at zenodo.org/signup |
| `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI` (bare DOI) | **operator** | Set on Vercel after the deposit publishes |
| `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL` (record URL) | **operator** | Set on Vercel after the deposit publishes |

### Six-minute mint flow

1. **Create a Zenodo account.** https://zenodo.org/signup/. Free,
   ORCID-linkable. Generate a personal access token under Account ->
   Applications -> Personal access tokens with scopes `deposit:write`
   and `deposit:actions`.

2. **Dry-run the CLI first.**

   ```bash
   python3 scripts/mint-zenodo-deposit.py
   ```

   The default mode fetches the canonical payload, resolves the file
   list, and prints the planned API calls without contacting Zenodo.
   Eyeball the file list and the metadata fields.

3. **Rehearse against the sandbox.**

   ```bash
   export ZENODO_API_TOKEN="<sandbox-token>"
   python3 scripts/mint-zenodo-deposit.py --sandbox --confirm
   ```

   Targets sandbox.zenodo.org. The deposit is real but the DOI is
   sandbox-scoped (non-resolvable). End-to-end test of the create-upload-
   publish chain.

4. **Mint the production DOI.**

   ```bash
   export ZENODO_API_TOKEN="<production-token>"
   python3 scripts/mint-zenodo-deposit.py --confirm
   ```

   The CLI prints the bare DOI + the Zenodo record URL on success.
   The deposit is now public on Zenodo; the DOI is permanent and
   resolvable.

5. **Set both env vars on Vercel.**

   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI production
   # Paste the bare DOI, e.g. 10.5281/zenodo.12345678

   vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL production
   # Paste the record URL, e.g. https://zenodo.org/records/12345678
   ```

6. **Redeploy and verify.** Any commit to main triggers a redeploy.
   On the next deploy:

   - Canonical Dataset JSON-LD at /dataset declares the DOI as a typed
     `PropertyValue identifier` (`propertyID: "DOI"`), appends
     `https://doi.org/<doi>` to `sameAs`, and adds the Zenodo catalog
     row to `includedInDataCatalog`.
   - BibTeX entry gets a `doi = {...}` field. Citation string gets a
     `DOI: ...` suffix. The downloaded JSON bundle gets `doi` and
     `doiUrl` fields.
   - HF dataset card YAML frontmatter gets a `doi:` line; the card
     body gets a DOI table row.

   Verify with the Google Rich Results Test against /dataset – the
   Dataset node's `identifier` should be an array with the DOI
   PropertyValue first.

### Why this isn't fully autonomous

Two steps require a human:

1. **Creating the Zenodo account.** Email verification + ORCID linking
   are intentionally human-in-the-loop. Brunson Hard-Rule explicitly
   forbids fabricated accounts.

2. **The access token is a secret.** The token grants permission to
   publish on the operator's behalf. It must stay in the operator's
   environment (or a CI secret store), never in the codebase.

Everything else – the metadata payload, the file list, the API calls,
the verification – is automated by `scripts/mint-zenodo-deposit.py`.

### OSF.io alternative <a id="osf-io"></a>

Open Science Framework also mints DOIs and is a recognised
`DataCatalog`. The same dataset can be deposited on OSF instead of
(or in addition to) Zenodo. Reserved env vars:

- `NEXT_PUBLIC_UNLOCKSAAS_OSF_DATASET_URL` – the OSF project URL
- `NEXT_PUBLIC_UNLOCKSAAS_OSF_DOI` – the bare OSF DOI

Submission via the OSF web UI (no API parallel to the Zenodo CLI yet).
OSF and Zenodo deposits are additive – the canonical Dataset JSON-LD
declares both `includedInDataCatalog` rows simultaneously when both
env-var pairs land.

## Kaggle – optional mirror <a id="kaggle-datasets"></a>

- `NEXT_PUBLIC_UNLOCKSAAS_KAGGLE_DATASET_URL` – Kaggle Datasets.
  Submission flow mirrors HF: create a Kaggle dataset, upload the same
  five CSVs, set the env var, redeploy. The Dataset JSON-LD picks up
  the Kaggle cross-listing on the next deploy.

Kaggle does not mint DOIs, so it surfaces only as
`includedInDataCatalog` and `sameAs` – not as a DOI identifier.

## Source of truth

- `app/src/lib/seo/dataset.ts` – canonical dataset metadata; DOI threads
  through DATASET_CITATION, DATASET_BIBTEX, DATASET_URLS.doi.
- `app/src/lib/seo/dataset-hf.ts` – HF dataset card builder; injects
  `doi:` into YAML frontmatter when DATASET_DOI is set.
- `app/src/lib/seo/dataset-zenodo.ts` – Zenodo Deposition API metadata
  builder; mirrors dataset-hf.ts pattern.
- `app/src/lib/seo/entity.ts` – env-driven `DATASET_EXTERNAL_REGISTRATIONS`,
  `DATASET_DOI`, `DATASET_DOI_URL`.
- `app/src/components/seo/json-ld.tsx` – `PublicDatasetJsonLd` builder;
  accepts `doi` prop, emits PropertyValue identifier.
- `app/src/app/dataset/page.tsx` – canonical landing; renders Zenodo
  catalog mirror entry.
- `app/src/app/dataset/huggingface/page.tsx` – HF submission surface.
- `app/src/app/dataset/huggingface/raw/route.ts` – raw README.md route.
- `app/src/app/dataset/zenodo/page.tsx` – Zenodo submission surface.
- `app/src/app/dataset/zenodo/raw/route.ts` – raw deposition JSON route.
- `app/src/app/dataset.md/route.ts` – markdown mirror; includes DOI
  frontmatter + a persistent-DOI line in the body when set.
- `app/src/lib/seo/freshness.ts` – activation-log entry.
- `app/src/lib/seo/llms-txt.ts` – LLM-readable mirror of the surfaces.
- `scripts/mint-zenodo-deposit.py` – operator CLI for the Zenodo API.
