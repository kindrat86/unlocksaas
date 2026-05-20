# Zenodo submission playbook

> Indie SaaS Teardowns Dataset – Zenodo DOI + Google Dataset Search uplift.
> Status: code is shipped (env slot `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL`
> in [entity.ts](../app/src/lib/seo/entity.ts) `DATASET_EXTERNAL_REGISTRATIONS`);
> operator action gates the cross-listing.

This is the focused companion to
[dataset-submission-playbook.md](./dataset-submission-playbook.md) for the
Zenodo arm. The HF playbook (already shipped) handles the Hugging Face
catalog; this playbook handles the DOI – the strongest dataset identifier
class Google Dataset Search recognises.

## Why Zenodo specifically

| Property | Zenodo | HF Datasets | Kaggle |
|---|---|---|---|
| Identifier class | **DOI** (CERN-backed) | repo URL | dataset URL |
| Versioning | per-release DOI + concept DOI | git LFS | dataset version |
| Permanence | CERN long-term archive | platform-bound | platform-bound |
| Google Dataset Search treatment | strongest (DOI = canonical) | recognised | recognised |
| Cited in academic blogs | yes (DOI is the convention) | sometimes | rarely |
| Upload friction | medium (web UI, metadata fields) | low (curl + CLI) | medium |
| Auto-DOI on GitHub release | yes (Zenodo-GitHub integration) | no | no |

The DOI is the unlock. A Zenodo DOI converts the dataset from "live URL on
unlocksaas.com" into a citable academic artifact. Academic blog posts,
working papers, and research aggregators (Semantic Scholar, OpenAIRE,
DataCite Commons) walk DOIs as primary identifiers. Each citation that
names UnlockSaaS via the DOI compounds toward the Wikidata
secondary-source threshold tracked in
[wikidata-application/notability-checklist.md](./wikidata-application/notability-checklist.md).

## Current state

| Component | State | Notes |
| --- | --- | --- |
| Canonical landing at /dataset | shipped | Dataset JSON-LD, CC-BY-4.0, BibTeX, citation, 5 per-table CSVs |
| Zenodo slot in `DATASET_EXTERNAL_REGISTRATIONS` | shipped | Reads `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL`, omits silently when unset |
| Zenodo account | **operator** | Sign up at zenodo.org/signup |
| Zenodo deposit | **operator** | Create via web UI or REST API |
| DOI issued | **operator** | Zenodo issues on "Publish" click; irreversible |
| `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL` env var | **operator** | Set on Vercel after DOI is in hand |
| Metadata template | shipped | [zenodo-metadata-template.json](./zenodo-metadata-template.json) – paste into Zenodo upload form |
| Google Dataset Search re-ingest | downstream | 1–14 days after the env var lands |

## Fifteen-minute submission flow

### 1. Create the Zenodo account (one-time, 3 min)

Visit <https://zenodo.org/signup>. Two sign-up paths:

- **ORCID** (recommended). If you have an ORCID iD or are willing to
  create one (free at orcid.org), this path attaches the deposit to a
  persistent researcher identifier. ORCID + Zenodo is the canonical
  academic-publishing combination.
- **GitHub OAuth**. Easier setup; lets you enable the Zenodo-GitHub
  integration in step 5 below.

Either path is fine. Verify your email.

### 2. Prepare the upload bundle (2 min)

Zenodo accepts a single deposit containing multiple files. Download the
canonical artifacts:

```sh
curl -O https://unlocksaas.com/dataset/indie-saas-teardowns.json
curl -O https://unlocksaas.com/dataset/indie-saas-teardowns.csv
curl -O https://unlocksaas.com/dataset/tables/funnel-teardowns.csv
curl -O https://unlocksaas.com/dataset/tables/pricing-teardowns.csv
curl -O https://unlocksaas.com/dataset/tables/comparisons.csv
curl -O https://unlocksaas.com/dataset/tables/alternatives.csv
curl -O https://unlocksaas.com/dataset/tables/categories.csv
```

Seven files total – the bundle (JSON + flat CSV) and the five per-table
CSVs. Same artifacts the HF deposit uses, byte-for-byte identical, so
checksums match across the two catalogs (Brunson Hard-Rule: one source
of truth).

### 3. Create the deposit (5 min)

Visit <https://zenodo.org/uploads/new>.

Drag the seven files into the upload area. Wait for the green
"Uploaded" indicator on each.

Fill the metadata form. Use the values from
[zenodo-metadata-template.json](./zenodo-metadata-template.json) as the
source of truth – every field there maps to a Zenodo form field by
the same name. Highlights:

- **Resource type** → `Dataset`.
- **Title** → `Indie SaaS Teardowns Dataset`.
- **Creators** → `Maryan` (affiliation: `Unlock SaaS`, ORCID if you
  registered one).
- **Description** → paste the multi-paragraph description from the
  template.
- **License** → `Creative Commons Attribution 4.0 International (CC-BY-4.0)`.
  Match the canonical license on /dataset exactly.
- **Keywords** → paste the comma-separated list from the template.
- **Related identifiers** → add the canonical landing URL
  `https://unlocksaas.com/dataset` with relation `IsDerivedFrom`. This
  is the Zenodo equivalent of `Dataset.sameAs` and is the field
  Google Dataset Search walks to verify the cross-listing.
- **Version** → `v1.0.0` (semver, matching the canonical version
  declared in [dataset.ts](../app/src/lib/seo/dataset.ts)).
- **Publication date** → today's ISO date.

### 4. Publish + capture the DOI (1 min)

Click **"Publish"**. Zenodo issues the DOI immediately.

The deposit URL looks like `https://zenodo.org/records/<numeric-id>`
and the DOI looks like `10.5281/zenodo.<numeric-id>`. Both forms work
for the env var; the DOI URL form is preferred for
`includedInDataCatalog.sameAs` semantics.

Zenodo prints both at the top of the published record page. Copy the
DOI URL (the one starting with `https://doi.org/10.5281/zenodo.…`).

**Note on irreversibility:** Zenodo publishes are irreversible. You can
ship a new version (which gets its own DOI, plus the concept DOI which
resolves to the latest version), but you cannot delete or rewrite a
published deposit. If a metadata typo lands, ship v1.0.1 with the fix
rather than trying to undo v1.0.0.

### 5. Optional but recommended: enable GitHub-Zenodo auto-DOI

If your dataset source-of-truth is in this repo, you can wire Zenodo
to auto-issue a new DOI on every tagged GitHub release.

1. Visit <https://zenodo.org/account/settings/github/>.
2. Authorise the Zenodo-GitHub OAuth app if not already done.
3. Find the repo in the list and flip its toggle to **On**.
4. Create a new GitHub release with a semver tag (`v1.0.0`, `v1.1.0`,
   etc.). Zenodo auto-creates a Zenodo deposit from the release tarball
   and issues a new DOI.

This is purely additive – the manual deposit in step 3 stays the
canonical first record. The auto-issued releases extend the lineage.

### 6. Set the Vercel env var (1 min)

```sh
vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL production
# paste: https://doi.org/10.5281/zenodo.<numeric-id>
vercel env add NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL preview
```

Trigger a deploy (or wait for the next push). Once the new build is
live, the Dataset JSON-LD on /dataset includes the Zenodo catalog
in `Dataset.includedInDataCatalog` and the DOI in `sameAs`.

### 7. Submit to Google Dataset Search (optional, 2 min)

Google Dataset Search picks up new cross-listings on its next crawl of
/dataset (typically 1–14 days). To accelerate:

1. Visit Google Search Console (assumes Tier 1.1 of
   [seo-activation-checklist.md](./seo-activation-checklist.md) is done).
2. URL Inspection → enter `https://unlocksaas.com/dataset`.
3. Click "Request Indexing".

Within 24–72 hours, the dataset should appear in
[Google Dataset Search](https://datasetsearch.research.google.com/) for
queries like `indie SaaS funnel teardowns`, `SaaS pricing dataset`, or
`UnlockSaaS`.

## Acceptance test

After the env var lands and the next deploy completes:

```sh
curl -s https://unlocksaas.com/dataset \
  | grep -o '"includedInDataCatalog":\[[^]]*\]' \
  | grep -o '"Zenodo"'
```

Expected output: `"Zenodo"` (literal string). If empty, the env var
isn't picked up yet (deploy in progress) or the DOI URL failed the
https validator in [entity.ts](../app/src/lib/seo/entity.ts)
`readSocialEnv` (must start with `https://`).

```sh
curl -sI "$NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL" | head -3
```

Expected output: a `HTTP/2 302` redirect to the Zenodo record page –
confirms the DOI is live and resolves.

## Brunson Hard-Rule reconciliation

- The metadata template lists only verifiable facts from the canonical
  dataset module ([dataset.ts](../app/src/lib/seo/dataset.ts)). No
  fabricated row counts, no inflated audience claims, no
  affiliation that doesn't exist.
- The deposit description matches the /dataset landing copy. Drift
  would re-trigger the audit-side rail in `packages/seo/validate-claims`.
- The license matches the canonical CC-BY-4.0 exactly. Zenodo accepts
  CC-BY-4.0 as a first-class license option; the form field is a
  dropdown with that exact wording.
- The version (v1.0.0) matches the canonical
  `DATASET_VERSION` constant in [dataset.ts](../app/src/lib/seo/dataset.ts).
  Future bumps require the version to advance in both places before
  publishing a new Zenodo deposit.

## Source of truth

- Canonical dataset facts: [`app/src/lib/seo/dataset.ts`](../app/src/lib/seo/dataset.ts)
- Env-driven cross-listing slot:
  [`app/src/lib/seo/entity.ts`](../app/src/lib/seo/entity.ts)
  `DATASET_EXTERNAL_REGISTRATIONS` → reads `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL`
- Schema rendering: [`app/src/components/seo/json-ld.tsx`](../app/src/components/seo/json-ld.tsx)
  `PublicDatasetJsonLd`
- Paste-ready metadata for the Zenodo form:
  [`strategy/zenodo-metadata-template.json`](./zenodo-metadata-template.json)
- Companion playbook (HF, already shipped):
  [`strategy/dataset-submission-playbook.md`](./dataset-submission-playbook.md)
