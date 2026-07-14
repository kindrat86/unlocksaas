/**
 * Canonical entity definition for UnlockSaaS.
 *
 * Single source of truth consumed by:
 *   - src/components/seo/json-ld.tsx  (Organization + Person + WebSite schemas)
 *   - src/app/llms.txt/route.ts       (AI-crawler entity anchor)
 *   - src/app/layout.tsx              (creator / publisher metadata)
 *
 * Why this file exists
 * --------------------
 * The first audit pass scored Entity / Topical Authority at 22/100 with the
 * deduction reasoning: "Organization.sameAs is empty; no off-platform
 * anchors." The fix is NOT to fabricate social handles — Brunson Hard-Rule
 * (honest claims) forbids it. The fix is to:
 *
 *   1. Honestly declare every entity signal we *can* verify without lying
 *      (founder, email, founding date, topical expertise, slogan, audience).
 *   2. Provide one operator-flippable env-driven slot per real social
 *      handle, so the day Maryan creates the account, the schema starts
 *      claiming it without a code edit + redeploy + audit cycle.
 *   3. Wire @id cross-references across Org/Person/WebSite/Product so
 *      Google's Knowledge Graph and AI-Overview pipelines can resolve the
 *      entity as a connected node, not five disconnected blocks.
 *
 * The `sameAs` array currently resolves to whatever env vars are set. In a
 * fresh checkout it is empty. That is honest and correct. The moment the
 * operator drops e.g. NEXT_PUBLIC_UNLOCKSAAS_X_URL into Vercel, the
 * Organization JSON-LD starts claiming it and the LLMO surface lights up.
 *
 * No fabricated handles. No placeholder URLs. No "if used" speculative
 * entries. If the env var isn't set, the entry isn't claimed.
 */

// ---------------------------------------------------------------------------
// Canonical URLs and @id anchors
// ---------------------------------------------------------------------------

/** Production origin. Mirrors src/app/layout.tsx metadataBase. */
export const BASE_URL = "https://unlocksaas.com";

/**
 * Fragment-style @id anchors. Schema.org's documented pattern for linking
 * entities inside a single document and across pages. Google's JSON-LD
 * structured-data tester resolves these as Knowledge Graph candidate keys.
 */
export const ID = {
  organization: `${BASE_URL}/#organization`,
  person: `${BASE_URL}/#founder`,
  website: `${BASE_URL}/#website`,
  product: `${BASE_URL}/#product-playbook`,
  diagnosticService: `${BASE_URL}/#service-diagnostic`,
  diagnosticHowTo: `${BASE_URL}/#howto-diagnostic`,
  /**
   * VideoObject @id for the planned 90-second walkthrough on /diagnostic.
   * Stable across env states (set or unset) so any future Article /
   * WebPage cross-references resolve to the same node once the recording
   * ships and DiagnosticWalkthroughVideoJsonLd starts emitting it.
   */
  diagnosticWalkthroughVideo: `${BASE_URL}/diagnostic#walkthrough-video`,
} as const;

// ---------------------------------------------------------------------------
// Off-platform anchors (env-driven, empty until operator activates)
// ---------------------------------------------------------------------------

/**
 * Reads a candidate social-anchor URL from env. Returns undefined if the
 * env var is unset, empty, or doesn't look like an absolute URL. Bad URLs
 * are silently dropped – we never want to ship a malformed sameAs entry
 * because it tanks Knowledge Graph eligibility for the whole block.
 *
 * URL validation is intentionally strict: must start with https:// and pass
 * URL constructor. http:// is rejected because every legitimate social
 * profile is on https, and a downgraded URL would look like a fabrication.
 */
function readSocialEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("https://")) return undefined;
  try {
    // Throws on malformed URLs.
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}

/**
 * DOI shape validator. A DOI is `10.<registrant>/<suffix>`:
 *   - registrant is a numeric prefix assigned by the DOI registration
 *     agency (Zenodo is `10.5281`, CrossRef registrants start with
 *     `10.1000`+, DataCite mints in the same `10.<digits>/...` shape).
 *   - suffix is any non-whitespace string after the slash.
 *
 * Returns the trimmed DOI when the value matches, otherwise undefined.
 * Bare strings only – no `doi:` prefix, no `https://doi.org/` prefix.
 * Brunson Hard-Rule: a malformed DOI silently drops so the canonical
 * Dataset JSON-LD never carries a fabricated identifier.
 */
const DOI_PATTERN = /^10\.\d{4,}(?:\.\d+)*\/\S+$/;

function readDoiEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  // Strip a leading `doi:` if the operator pasted it that way. Both
  // forms are common in Zenodo's UI; we normalize to the bare DOI.
  const candidate = trimmed.replace(/^doi:/i, "").trim();
  if (!DOI_PATTERN.test(candidate)) return undefined;
  return candidate;
}

/**
 * Knowledge-Graph anchors – strongest AIO multipliers in the entity graph.
 *
 * Wikidata Q-URL is the canonical machine-readable entity ID Google's
 * Knowledge Graph uses to disambiguate brands. A single populated Q-URL
 * is worth more for AI Overviews than every social profile combined.
 * Wikipedia URL is the second strongest signal because every major LLM
 * training corpus includes Wikipedia as a primary source.
 *
 * Both are env-driven and stay empty until a real entry exists – we
 * never fabricate a Wikidata Q-ID. The operator path is documented in
 * strategy/wikidata-application/README.md (Wikidata) and
 * strategy/sameas-activation-playbook.md §Wikipedia (Wikipedia).
 *
 * Hoisted to module-scope exports (above buildSameAs) so consumers
 * other than sameAs can resolve the same source-of-truth values:
 *   - ORGANIZATION_WIKIDATA_URL  – consumed by Organization.sameAs.
 *   - ORGANIZATION_WIKIDATA_QID  – consumed by Organization.identifier[]
 *     as a PropertyValue with propertyID="wikidata" (bare Q-ID is the
 *     stronger machine-readable signal than a URL alone; KG resolves it
 *     to the canonical Wikidata item without URL parsing).
 *   - ORGANIZATION_WIKIPEDIA_URL – consumed by Organization.sameAs AND
 *     by Organization.mainEntityOfPage (one-to-one authoritative anchor,
 *     stronger than a sameAs row).
 */
export const ORGANIZATION_WIKIDATA_URL: string | undefined = readSocialEnv(
  "NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL",
);

export const ORGANIZATION_WIKIPEDIA_URL: string | undefined = readSocialEnv(
  "NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL",
);

/**
 * Extract a bare Wikidata Q-ID (e.g. "Q139863921") from a Wikidata URL.
 *
 * Accepted URL shapes – every canonical Wikidata entity URL ends in a
 * path segment matching `/Q<digits>` (or `/Property:P<digits>` etc. –
 * we only extract Q-items here):
 *
 *   - https://www.wikidata.org/wiki/Q139863921
 *   - https://www.wikidata.org/entity/Q139863921
 *   - https://m.wikidata.org/wiki/Q139863921
 *
 * Rejected (returns undefined):
 *   - Empty / undefined input.
 *   - URLs whose last path segment does not match `^Q\d+$`.
 *   - Malformed URLs (URL constructor throws).
 *
 * Brunson Hard-Rule: a malformed Wikidata URL must not leak a bogus
 * QID into the identifier[] PropertyValue array. Bad inputs silently
 * drop so the consumer omits the wikidata identifier entirely – never
 * ships an empty-string or null value that looks like a fabrication
 * to KG validators.
 */
export function extractWikidataQid(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter((s) => s.length > 0);
    const last = segments[segments.length - 1];
    if (last && /^Q\d+$/.test(last)) return last;
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Bare Wikidata Q-ID for the Unlock SaaS Organization (e.g. "Q139863921").
 *
 * Derived from ORGANIZATION_WIKIDATA_URL at module load. Exposed so the
 * Organization JSON-LD identifier[] array can emit a PropertyValue with
 * propertyID="wikidata" – the schema.org pattern Google's Knowledge Graph
 * walks to cross-reference an entity card with the canonical Wikidata
 * item without having to URL-parse the sameAs row.
 *
 * Stays undefined in a fresh checkout (no env var) OR when the env URL
 * doesn't match the Wikidata Q-URL shape. The consumer must omit the
 * wikidata PropertyValue entirely when undefined – never ship an empty
 * value.
 */
export const ORGANIZATION_WIKIDATA_QID: string | undefined = extractWikidataQid(
  ORGANIZATION_WIKIDATA_URL,
);

// ---------------------------------------------------------------------------
// Organization identifier[] – machine-readable cross-references
// ---------------------------------------------------------------------------

/**
 * Schema.org PropertyValue subobject shape. Exported so consumers that
 * spread these into Organization / Person blocks get a stable type.
 */
export interface OrganizationIdentifier {
  readonly "@type": "PropertyValue";
  readonly propertyID: string;
  readonly value: string;
}

/**
 * Single source of truth for the founding date.
 *
 * Hoisted above `buildOrganizationIdentifiers()` so the builder can read it
 * at module load without a TDZ violation. Re-used by the `ORGANIZATION`
 * literal below so the same string never lives in two places.
 */
const ORGANIZATION_FOUNDING_DATE = "2026-05-17" as const;

/**
 * Build the Organization.identifier[] array.
 *
 * PropertyValue is the schema.org pattern for stable, non-URL identifiers
 * that an entity exposes for cross-reference. Knowledge Graph and LLM
 * retrieval pipelines walk identifier[] to confirm an entity card is
 * keyed to the same domain / founding date / canonical manifest / Wikidata
 * Q-ID the body content names.
 *
 * Three always-present rows + one conditional row:
 *
 *   1. propertyID="domain"             – unlocksaas.com (canonical key).
 *   2. propertyID="foundingDate"       – ORGANIZATION_FOUNDING_DATE.
 *   3. propertyID="canonical-manifest" – /.well-known/entity.jsonld URL.
 *   4. propertyID="wikidata" (conditional) – bare Q-ID like "Q139863921"
 *      when ORGANIZATION_WIKIDATA_QID resolves. This is the strongest
 *      identifier KG recognises; pairing it with the Wikidata sameAs URL
 *      row gives the entity a one-to-one machine-readable anchor AND a
 *      crawlable URL, the canonical pattern Google's KG documentation
 *      recommends.
 *
 * Brunson Hard-Rule: the wikidata row only appears when the env-driven
 * URL resolves to a valid Q-shape. Misconfigured env (typo, missing
 * URL) silently drops the row – never ships an empty value.
 *
 * Hoisted to module scope. Single allocation per cold start; consumers
 * share the same frozen array. Both Organization JSON-LD surfaces
 * (the homepage `json-ld.tsx` Organization block AND the canonical
 * manifest at `/.well-known/entity.jsonld`) MUST use this constant –
 * if the two surfaces ship different identifier[] rows, a crawler
 * comparing them flags the entity for verification failure.
 */
function buildOrganizationIdentifiers(): readonly OrganizationIdentifier[] {
  const rows: OrganizationIdentifier[] = [
    {
      "@type": "PropertyValue",
      propertyID: "domain",
      value: "unlocksaas.com",
    },
    {
      "@type": "PropertyValue",
      propertyID: "foundingDate",
      value: ORGANIZATION_FOUNDING_DATE,
    },
    {
      "@type": "PropertyValue",
      propertyID: "canonical-manifest",
      value: `${BASE_URL}/.well-known/entity.jsonld`,
    },
  ];
  if (ORGANIZATION_WIKIDATA_QID) {
    rows.push({
      "@type": "PropertyValue",
      propertyID: "wikidata",
      value: ORGANIZATION_WIKIDATA_QID,
    });
  }
  return Object.freeze(rows);
}

export const ORGANIZATION_IDENTIFIERS: readonly OrganizationIdentifier[] =
  buildOrganizationIdentifiers();

/**
 * Build the sameAs array from env at module load. Each entry corresponds
 * to a single real, operator-controlled profile. Add a new social network
 * here only when (a) the operator has created the account, and (b) the
 * profile bio names UnlockSaaS — Knowledge Graph rewards bidirectional
 * claims (this site claims the handle; the handle claims this site).
 *
 * Env naming convention: NEXT_PUBLIC_* so the values are available to the
 * server-rendered Organization block without leaking secrets. None of
 * these URLs are sensitive.
 */
function buildSameAs(): readonly string[] {
  const candidates = [
    // Knowledge-Graph anchors first – strongest AIO multipliers in the
    // array. Both consumed from the hoisted exports above so the
    // source-of-truth env reads happen exactly once per module load.
    ORGANIZATION_WIKIDATA_URL,
    ORGANIZATION_WIKIPEDIA_URL,
    // Founder/owner profiles – primary entity anchors.
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_X_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL"),
    // Aggregator / review-directory anchors. These are the surfaces
    // ChatGPT, Perplexity, and Google AI Overviews cite when answering
    // "what is X?" or "X alternatives" – every live listing is a permanent
    // candidate citation that loops back to unlocksaas.com via sameAs.
    // Source of truth for which directories we're targeting + submission
    // URLs + operator runbook: src/lib/seo/directory-listings.ts.
    // Brunson Hard-Rule: a slot stays unset until the directory team
    // approves the listing and the URL is live. No aspirational entries.
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_G2_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_BETALIST_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_ALTERNATIVETO_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_SAASHUB_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL"),
    // Company-entity registry anchors – fed directly into Google's
    // Knowledge Graph as primary entity sources. Heavier weight than
    // generic social profiles. OpenCorporates is a public registry of
    // legal entities sourced from government filings (only set once
    // UnlockSaaS is incorporated and OpenCorporates has indexed the
    // jurisdiction; for many small jurisdictions this is automatic
    // within weeks of incorporation). Wellfound (formerly AngelList
    // Talent) is the canonical startup profile registry – the URL the
    // operator pastes resolves under wellfound.com, not the legacy
    // angel.co domain.
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_OPENCORPORATES_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_WELLFOUND_URL"),
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL"),
    // Generic "other" slot – for one ad-hoc profile without a dedicated
    // env var. Lower priority than Wikidata/Wikipedia above.
    readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL"),
  ].filter((v): v is string => typeof v === "string");

  // De-dupe defensively in case the operator pastes the same URL twice.
  return Array.from(new Set(candidates));
}

/**
 * Frozen at module load. Importers see a stable array per server boot.
 * Vercel's per-request env mutation is not a concern here – these are
 * build-time configuration, not per-request data.
 */
export const ORGANIZATION_SAME_AS: readonly string[] = Object.freeze(
  buildSameAs(),
);

/**
 * Wikipedia URL (when populated) is exposed separately as the Organization's
 * `mainEntityOfPage`. Schema.org's documented pattern: when a Wikipedia
 * article exists for an entity, naming it as mainEntityOfPage tells Google
 * "this Wikipedia page is the authoritative external description of this
 * entity." That doubles the entity-confidence weight versus listing it as
 * just another sameAs row, because Knowledge Graph treats mainEntityOfPage
 * as a one-to-one anchor and sameAs as one-to-many.
 *
 * Resolves at module load via the hoisted ORGANIZATION_WIKIPEDIA_URL
 * constant; undefined until NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL is set.
 * JSON-LD consumers MUST omit the field when undefined – a
 * `mainEntityOfPage: undefined` serializes to `"mainEntityOfPage": null` in
 * some JSON.stringify paths and looks like a fabrication to validators.
 */
export const ORGANIZATION_MAIN_ENTITY_OF_PAGE: string | undefined =
  ORGANIZATION_WIKIPEDIA_URL;

// ---------------------------------------------------------------------------
// External dataset catalog registrations (env-driven, empty until activated)
// ---------------------------------------------------------------------------

/**
 * Off-platform dataset catalog where the Indie SaaS Teardowns dataset is
 * also hosted. Each entry is a real registration on a real catalog;
 * env-driven empty slots stay omitted, never fabricated.
 *
 * Why this matters
 * ----------------
 * Google Dataset Search ranks a dataset higher when it appears in a
 * recognized DataCatalog (Hugging Face Datasets, Kaggle, Zenodo, figshare,
 * DataCite). The schema.org `includedInDataCatalog` + `sameAs` pair is
 * how a dataset declares "this same artifact is also at <URL>" — and the
 * crawler then walks that URL to confirm the catalog hosts it. The
 * confirmed cross-listing lifts the canonical page's Dataset Search
 * ranking and unlocks Hugging Face's own search surface as a second
 * acquisition channel.
 *
 * Operator workflow
 * -----------------
 *   1. Create the Hugging Face dataset repo: huggingface.co/new-dataset.
 *      Repo name: `unlocksaas/indie-saas-teardowns` (lowercase, dashed).
 *   2. Download the canonical dataset card at
 *      https://unlocksaas.com/dataset/huggingface/raw and upload it as
 *      `README.md` on the HF repo.
 *   3. Upload the five per-table CSVs from
 *      https://unlocksaas.com/dataset/tables/ to the HF repo root.
 *   4. Set `NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL` on Vercel
 *      to the canonical HF dataset URL (e.g.
 *      https://huggingface.co/datasets/unlocksaas/indie-saas-teardowns).
 *   5. Redeploy. The Dataset JSON-LD on /dataset now declares the HF
 *      catalog cross-listing; Google Dataset Search picks it up on the
 *      next crawl.
 *
 * The Kaggle and Zenodo slots are reserved for the same pattern. Kaggle
 * mirrors the HF upload flow (CSV files + dataset card); Zenodo issues a
 * DOI on submission and Google Dataset Search treats DOIs as the
 * strongest dataset identifier class. All three are optional.
 *
 * Brunson Hard-Rule reconciliation: a row only appears in the output when
 * the env var is set to a valid https URL. A malformed value or unset env
 * skips the catalog entirely – we never advertise a dataset listing that
 * the operator has not actually created.
 */
export interface DatasetCatalogRegistration {
  /** Schema.org DataCatalog.name – the human-readable catalog identifier. */
  readonly name: string;
  /** Canonical URL of the dataset listing on that catalog. */
  readonly url: string;
  /** Catalog homepage URL – schema.org DataCatalog.url. */
  readonly catalogUrl: string;
  /**
   * Bare DOI in `10.<registrant>/<suffix>` form when the catalog mints
   * one (Zenodo, figshare, DataCite, OSF). HF and Kaggle do not mint
   * DOIs, so this field stays undefined for those catalogs. Used by
   * the canonical Dataset JSON-LD to emit `Dataset.identifier` as a
   * PropertyValue with `propertyID: "doi"` – the strongest dataset
   * identifier class Google Dataset Search recognises, and the form
   * every academic citation pipeline pivots on.
   */
  readonly doi?: string;
}

/**
 * The bare DOI for the Indie SaaS Teardowns dataset (e.g.
 * `10.5281/zenodo.12345678`), resolved from
 * `NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI` at module load. Undefined until
 * the operator mints a Zenodo deposit and pastes the resulting DOI on
 * Vercel.
 *
 * Why this lives at module scope (not derived per-call from the catalog
 * registrations): consumers other than the Dataset JSON-LD also need
 * the DOI directly – the BibTeX `doi = {...}` field, the citation
 * string, the HF dataset card YAML frontmatter, the markdown mirror.
 * Hoisting it once keeps the source of truth single.
 *
 * Brunson Hard-Rule: a malformed value silently drops via DOI_PATTERN
 * validation. The dataset never advertises a DOI it does not actually
 * resolve.
 */
export const DATASET_DOI: string | undefined = readDoiEnv(
  "NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI",
);

/**
 * Resolvable `https://doi.org/...` URL form of DATASET_DOI. Undefined
 * when the DOI is unset. Used as a `sameAs` entry on the Dataset
 * schema and as the citation link target.
 */
export const DATASET_DOI_URL: string | undefined = DATASET_DOI
  ? `https://doi.org/${DATASET_DOI}`
  : undefined;

function buildDatasetCatalogRegistrations(): readonly DatasetCatalogRegistration[] {
  const rows: DatasetCatalogRegistration[] = [];

  // GitHub mirror — a public mirror repository with a weekly auto-PR refresh
  // workflow. The mirror is the strongest off-platform backlink for the
  // canonical landing because GitHub's domain authority is among the highest
  // on the web, AI Overviews / Perplexity cite GitHub repos frequently, and
  // every fork of the mirror creates an inbound link back to /dataset. The
  // mirror repo itself runs a weekly cron that pulls the canonical files
  // from this site, so the dataset declared here is by construction a
  // verbatim copy of the canonical artifact, not a forked snapshot.
  //
  // Activation: create the public mirror repo, then set
  // NEXT_PUBLIC_UNLOCKSAAS_GITHUB_DATASET_URL on Vercel to the repo URL
  // (e.g. https://github.com/<owner>/indie-saas-teardowns-dataset). The
  // canonical Dataset JSON-LD then declares the GitHub mirror as another
  // `includedInDataCatalog` row + appends it to `sameAs`.
  const github = readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_GITHUB_DATASET_URL");
  if (github) {
    rows.push({
      name: "GitHub",
      url: github,
      catalogUrl: "https://github.com/",
    });
  }

  const hf = readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL");
  if (hf) {
    rows.push({
      name: "Hugging Face Datasets",
      url: hf,
      catalogUrl: "https://huggingface.co/datasets",
    });
  }

  const kaggle = readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_KAGGLE_DATASET_URL");
  if (kaggle) {
    rows.push({
      name: "Kaggle Datasets",
      url: kaggle,
      catalogUrl: "https://www.kaggle.com/datasets",
    });
  }

  const zenodo = readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI_URL");
  if (zenodo) {
    rows.push({
      name: "Zenodo",
      url: zenodo,
      catalogUrl: "https://zenodo.org/",
      // Pair the catalog URL with the bare DOI when set. The DOI is
      // the identifier the canonical Dataset JSON-LD surfaces as a
      // PropertyValue; the URL is what `includedInDataCatalog` walks.
      // Both shipped together so a downstream crawler does not have
      // to derive one from the other.
      ...(DATASET_DOI ? { doi: DATASET_DOI } : {}),
    });
  }

  // OSF.io – Open Science Framework, also a DOI-minting catalog. Lower
  // priority than Zenodo because Zenodo is the academic default and
  // already has a sandbox environment; OSF is the secondary mirror for
  // datasets that want presence in the open-science research community.
  // Operator activates by depositing the same artifacts on osf.io,
  // requesting a DOI, and pasting both URL + DOI here.
  const osf = readSocialEnv("NEXT_PUBLIC_UNLOCKSAAS_OSF_DATASET_URL");
  if (osf) {
    const osfDoi = readDoiEnv("NEXT_PUBLIC_UNLOCKSAAS_OSF_DOI");
    rows.push({
      name: "OSF",
      url: osf,
      catalogUrl: "https://osf.io/",
      ...(osfDoi ? { doi: osfDoi } : {}),
    });
  }

  return Object.freeze(rows);
}

/**
 * Frozen at module load. Re-evaluated only on cold start when the
 * env-driven URLs might change (Vercel env updates are picked up at
 * deploy time, not at request time). Defaults to a frozen empty array
 * in a fresh checkout – that is honest: no env vars set = no cross-
 * listings claimed.
 */
export const DATASET_EXTERNAL_REGISTRATIONS: readonly DatasetCatalogRegistration[] =
  buildDatasetCatalogRegistrations();

// ---------------------------------------------------------------------------
// Topical authority — knowsAbout
// ---------------------------------------------------------------------------

/**
 * Every entry is a real area of demonstrated expertise documented in the
 * strategy folder. These are NOT keyword stuffing – each one corresponds
 * to either a workbook section, a strategy document, or a shipped surface.
 *
 * Used by both Organization.knowsAbout and Person.knowsAbout. Google and
 * LLM retrieval pipelines use these as topical anchors for "which entity
 * is the authority on X" queries.
 *
 * Editorial rule: only add a topic if the founder could survive a
 * 10-minute interview on it without consulting notes. Each entry maps to
 * either a Brunson workbook section, a shipped pSEO surface (funnel
 * teardowns, pricing teardowns, compare, alternatives), or a strategy
 * document under strategy/. The list grew from 12 to 28 on 2026-05-17
 * to lift the AIO/LLMO entity-density score (training-corpus visibility
 * compounds with specificity of declared expertise).
 */
export const KNOWS_ABOUT: readonly string[] = Object.freeze([
  // Brunson framework (DotCom / Expert / Traffic Secrets) – verifiable
  // against the 10 locked workbooks in strategy/.
  "Russell Brunson sales funnel design",
  "Hook Story Offer framework",
  "Value ladder construction for SaaS products",
  "Big Domino positioning statement",
  "Perfect Webinar framework",
  "Stack slide and one-time offers",
  "Soap Opera Sequence email marketing",
  "Seinfeld daily email marketing",
  "Reluctant Hero attractive character archetype",
  "Dream 100 outreach strategy",
  // Indie SaaS go-to-market – matches /alternatives-to, /vs,
  // /funnel-teardown, /pricing-teardown pSEO surfaces.
  "Post-launch pre-revenue SaaS founder activation",
  "First paying customer acquisition for indie SaaS",
  "Indie SaaS pricing page design",
  "SaaS landing page conversion teardowns",
  "Head-to-head SaaS tool comparisons for indie founders",
  "Programmatic SEO for indie SaaS",
  // Mechanics specific to the Playbook product surface.
  "Stripe-verified founder validation",
  "Money-back guarantee mechanics for digital products",
  "Refund-by-code guarantee enforcement",
  // Non-engineer founder workflows – matches the dream-customer named
  // in workbook 08 and the AI-tools list reflected in MENTIONED_ENTITIES.
  "Non-engineer founder workflows with AI tools",
  "Lovable AI app builder workflows",
  "Claude Code product development for non-engineers",
  "v0 by Vercel UI generation for founders",
  "Bolt.new full-stack prototyping",
  "Cursor IDE workflows for non-engineers",
  "Replit AI agent workflows",
  // Trust columns / editorial.
  "Honest competitor comparison editorial standards",
  "Brunson Hard-Rule fabrication-free marketing claims",
]);

// ---------------------------------------------------------------------------
// Brand-name variants – alternateName for tokenizer breadth
// ---------------------------------------------------------------------------

/**
 * Every public spelling the brand is referred to as. LLM tokenizers
 * learn each variant as a distinct surface form; declaring them in
 * Organization.alternateName tells Google's Knowledge Graph (and any
 * retrieval pipeline that walks JSON-LD) that all four resolve to one
 * entity. Without this, "UnlockSaaS" queries and "Unlock SaaS" queries
 * can split into two weak entity clusters instead of compounding into
 * one strong one.
 *
 * Brunson Hard-Rule: every variant below is a real spelling used in
 * the codebase / strategy folder / marketing copy. No fabricated
 * alternate brands.
 */
export const ALTERNATE_NAMES: readonly string[] = Object.freeze([
  "UnlockSaaS",
  "Unlock-SaaS",
  "unlocksaas.com",
]);

// ---------------------------------------------------------------------------
// Off-entity mentions – schema.org `mentions` for entity-graph density
// ---------------------------------------------------------------------------

/**
 * Real third-party entities the public marketing surface names. Every
 * `name` and `url` below corresponds to an entity discussed in at least
 * one shipped page – the funnel teardowns, the pricing teardowns, the
 * comparisons, or the alternatives surface. Declaring them as
 * Organization.mentions[] is honest (we DO talk about these entities)
 * and lifts AIO/LLMO by anchoring UnlockSaaS in the entity neighbourhood
 * of well-known products and authors.
 *
 * Brunson Hard-Rule: each entry is verifiable inside the codebase. A
 * fresh search for the `name` will find at least one shipped surface
 * that names the entity. No name belongs here that the site does not
 * actually discuss in body copy.
 */
export const MENTIONED_ENTITIES: ReadonlyArray<{
  name: string;
  url: string;
  type: "Person" | "Organization" | "Book" | "SoftwareApplication";
}> = Object.freeze([
  // The single most-cited author across the strategy/ folder.
  {
    name: "Russell Brunson",
    url: "https://www.russellbrunson.com",
    type: "Person",
  },
  // Brunson trilogy – named verbatim in /about, /stories, /funnel-teardown.
  { name: "DotCom Secrets", url: "https://www.dotcomsecretsbook.com", type: "Book" },
  // expertsecretsbook.com / trafficsecretsbook.com went NXDOMAIN (2026-07-14
  // crawl); Amazon product pages are the stable canonical references now.
  {
    name: "Expert Secrets",
    url: "https://www.amazon.com/Expert-Secrets-Underground-Playbook-Advice/dp/1401970605",
    type: "Book",
  },
  {
    name: "Traffic Secrets",
    url: "https://www.amazon.com/Traffic-Secrets-Underground-Playbook-Customers/dp/1401957900",
    type: "Book",
  },
  // ClickFunnels is the canonical reference funnel-builder we explicitly
  // contrast with – "no ClickFunnels 1.0 look" appears in feedback memory.
  {
    name: "ClickFunnels",
    url: "https://www.clickfunnels.com",
    type: "Organization",
  },
  // AI tools the dream customer ships with – named in /about, /faq,
  // /playbook-sales, llms.txt, and every pSEO body.
  { name: "Lovable", url: "https://lovable.dev", type: "SoftwareApplication" },
  { name: "Claude", url: "https://claude.ai", type: "SoftwareApplication" },
  { name: "Replit", url: "https://replit.com", type: "SoftwareApplication" },
  { name: "v0 by Vercel", url: "https://v0.app", type: "SoftwareApplication" },
  { name: "Cursor", url: "https://cursor.com", type: "SoftwareApplication" },
  { name: "Bolt.new", url: "https://bolt.new", type: "SoftwareApplication" },
  { name: "Bubble", url: "https://bubble.io", type: "SoftwareApplication" },
  // Infrastructure named in the guarantee mechanics + transactional surface.
  { name: "Stripe", url: "https://stripe.com", type: "Organization" },
]);

// ---------------------------------------------------------------------------
// Defined terms – the Brunson glossary the site teaches
// ---------------------------------------------------------------------------

/**
 * Terms the site teaches. Every entry corresponds to a section
 * heading or recurring concept across the public surface. Rendered
 * as schema.org `DefinedTermSet` from the funnel hub – it declares
 * UnlockSaaS as a topical authority on this specific glossary.
 *
 * LLM retrieval systems that ingest DefinedTermSet treat the publisher
 * as a primary citation source for the term. Pre-revenue, this is one
 * of the few entity-graph anchors a brand-new site CAN claim honestly:
 * "we teach this term, here is our definition, in our own words".
 *
 * Brunson Hard-Rule: every definition below is in the founder's own
 * words and appears in at least one shipped surface (the funnel
 * teardowns and /faq are the primary anchors).
 */
export const DEFINED_TERMS: ReadonlyArray<{
  term: string;
  definition: string;
}> = Object.freeze([
  {
    term: "Hook",
    definition:
      "The promise plus polarity move a page makes in the first three seconds, before the visitor decides whether to keep reading.",
  },
  {
    term: "Story",
    definition:
      "The belief stack between the hook and the close – the sequence of small recognitions that turns curiosity into trust.",
  },
  {
    term: "Offer",
    definition:
      "What the page asks for and what it gives in return, structured so the perceived value is unambiguously higher than the price.",
  },
  {
    term: "Big Domino",
    definition:
      "The single claim the page must prove – the one belief that, if accepted, makes every smaller objection irrelevant.",
  },
  {
    term: "Value Ladder",
    definition:
      "An ordered sequence of offers a customer can move through, each delivering more value than the last at a price proportional to the delivery.",
  },
  {
    term: "Stack Slide",
    definition:
      "The offer reveal pattern that itemizes the deliverables, anchors each to a standalone price, and then presents the total as a discount to that anchor.",
  },
  {
    term: "Perfect Webinar",
    definition:
      "Russell Brunson's framework for selling a high-ticket offer to a cold audience in a single one-to-many presentation, structured around the Big Domino plus three secrets.",
  },
  {
    term: "Soap Opera Sequence",
    definition:
      "The five-email indoctrination sequence a new subscriber gets across their first week, structured around a backstory cliffhanger that resolves into the offer.",
  },
  {
    term: "Seinfeld Email",
    definition:
      "Russell Brunson's daily email pattern – a slice-of-life story in the founder's voice that pivots into the offer in the last few lines.",
  },
  {
    term: "Reluctant Hero",
    definition:
      "An attractive-character archetype: the founder who solved their own problem first and is reluctantly publishing the playbook because the audience keeps asking for it.",
  },
  {
    term: "Dream 100",
    definition:
      "The named list of the hundred specific humans, publications, communities, or platforms where the dream customer already congregates – the entry point for every outbound channel.",
  },
  {
    term: "Wrong Person",
    definition:
      "One of three diagnostic labels: the offer on the page is fine but the page is aimed at no one in particular. The most common diagnosis on a post-launch flat Stripe line.",
  },
  {
    term: "Weak Offer",
    definition:
      "One of three diagnostic labels: the person on the page is fine but the page promises a feature list instead of a result.",
  },
  {
    term: "Weak Belief",
    definition:
      "One of three diagnostic labels: the person and the offer are fine but the page does not make the reader believe it will work for them.",
  },
  {
    term: "Verified Builder",
    definition:
      "A founder whose first paying customer was confirmed via the connected Stripe account – not self-reported. The Verified Builders directory grows only when Stripe confirms the cycle.",
  },
  {
    term: "Brunson Hard-Rule",
    definition:
      "Editorial standard adopted by Unlock SaaS: every public claim is independently verifiable, dated where it changes, and unfabricated. No aggregateRating, no testimonial counts, no sameAs entries until the underlying fact exists.",
  },
]);

// ---------------------------------------------------------------------------
// Publishing principles – E-E-A-T anchor
// ---------------------------------------------------------------------------

/**
 * URL of the page that documents the editorial standards UnlockSaaS
 * publishes by. Schema.org's `publishingPrinciples` field is one of the
 * strongest machine-readable E-E-A-T signals Google honours since 2023.
 *
 * Repointed 2026-05-17 from /about (the founder's bio + general editorial
 * position) to /editorial-policy (the dedicated quality-rater anchor:
 * dated editorial standards, financial disclosures, corrections workflow,
 * corrections log). Both pages reinforce E-E-A-T, but Google's quality
 * raters specifically expect publishingPrinciples to resolve to the
 * editorial-policy surface, not the about page.
 */
export const PUBLISHING_PRINCIPLES_URL: string = `${BASE_URL}/editorial-policy`;

// ---------------------------------------------------------------------------
// Organization entity
// ---------------------------------------------------------------------------

/**
 * Public-facing organization facts. Every field is independently verifiable
 * by a reader visiting the site, the Stripe checkout, the Resend-sent
 * email, or the public DNS record.
 *
 * `foundingDate` is the strategy-lock date documented in strategy/state.json
 * (2026-05-17). That is the operationally meaningful birth of the entity:
 * the day the 10 Brunson workbooks were locked and build started.
 */
export const ORGANIZATION = {
  name: "Unlock SaaS",
  legalName: "Unlock SaaS",
  url: BASE_URL,
  logo: `${BASE_URL}/icon`, // Next.js dynamic icon at app/icon.tsx serves PNG at /icon
  email: "maryan@unlocksaas.com",
  slogan: "Your first paying customer in 60 days, or you do not pay.",
  // Source-of-truth string lives at ORGANIZATION_FOUNDING_DATE above –
  // both this literal AND the identifier[] PropertyValue row consume it,
  // so a future date change is a one-line edit.
  foundingDate: ORGANIZATION_FOUNDING_DATE,
  description:
    "A playbook that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
  // Schema.org expects ISO 3166 region codes or named places. SaaS sold
  // worldwide; "Worldwide" is the accepted convention for digital-only.
  areaServed: "Worldwide",
} as const;

// ---------------------------------------------------------------------------
// Worldwide geo signal – the "no Local SEO" decision, codified
// ---------------------------------------------------------------------------

/**
 * Local SEO is deliberately N/A for Unlock SaaS.
 *
 * Why this constant exists
 * ------------------------
 * Unlock SaaS is a worldwide, digital-only product. There is no
 * `LocalBusiness` subtype, no `PostalAddress`, no `GeoCoordinates`, no
 * `GeoCircle`, and no street address anywhere in the schema graph – and
 * there never should be. That is the correct posture for a SaaS sold
 * globally to indie founders on the public internet.
 *
 * The risk this constant defends against is NOT that we accidentally add
 * a local signal. The risk is the opposite: that the *absence* of a
 * geo declaration on a Service / Product / Offer is read by some
 * crawler heuristic as "geo-unknown" rather than "deliberately
 * worldwide." A geo-unknown Service can lose visibility in queries
 * Google interprets as having local intent ("SaaS founder coach near me",
 * "indie SaaS playbook in the US") even when the right answer for the
 * searcher is a worldwide product. An explicit worldwide declaration
 * closes that ambiguity.
 *
 * Two shapes are exported because schema.org accepts both:
 *
 *   - `WORLDWIDE_AREA_SERVED` (string): the canonical free-text form
 *     used by `Organization.areaServed`, `Service.areaServed`, and
 *     `Product.areaServed`. Matches the existing `ORGANIZATION.areaServed`
 *     value verbatim so every node in the graph says exactly the same
 *     word.
 *
 *   - `WORLDWIDE_PLACE` (typed Place node): the validator-preferred
 *     form for `Offer.eligibleRegion`, where schema.org's documented
 *     shape is a `Place` / `GeoShape` / ISO country code. We pick
 *     `Place` because the closest honest declaration is "name: Worldwide" –
 *     not a list of every ISO country code (which would be redundant
 *     and noisy), and not a GeoShape (which implies bounded coordinates).
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No new claim: "Worldwide" is already declared on `ORGANIZATION.areaServed`
 *     and on `FOUNDER.hasOccupation.occupationLocation`. This constant is
 *     a re-use, not a new fact.
 *   - No fabricated geo: we are NOT listing countries we do not serve;
 *     we are NOT carving out any region; we are NOT implying local
 *     presence anywhere.
 *   - Single source of truth: every schema node that wants a worldwide
 *     declaration imports from here, so a future scope change (e.g.
 *     restricted to "EU+US" for GDPR reasons) is a one-file edit.
 *
 * Activation log: 2026-05-18 – audit pass item 12 (Local SEO N/A,
 * autonomous mode). Codifies the existing posture, adds the worldwide
 * declaration to the Service / Product / Offer nodes that previously
 * relied on inheritance from Organization.
 */
export const WORLDWIDE_AREA_SERVED = "Worldwide" as const;

export const WORLDWIDE_PLACE = Object.freeze({
  "@type": "Place" as const,
  name: "Worldwide",
});

// ---------------------------------------------------------------------------
// Founder (Person) entity
// ---------------------------------------------------------------------------

/**
 * Founder-level Person schema. Linked back to ORGANIZATION via worksFor /
 * founder cross-reference (the @id pattern lives in the consumer in
 * json-ld.tsx — this module just carries the facts).
 *
 * `description` matches the on-page bio at /diagnostic so LLMs see the
 * same prose in structured data and in body copy. Repetition across
 * surfaces strengthens entity confidence in retrieval-augmented answers.
 */
export const FOUNDER = {
  name: "Maryan",
  givenName: "Maryan",
  jobTitle: "Founder",
  email: "maryan@unlocksaas.com",
  url: BASE_URL,
  // Cross-section frame baked into the canonical Person description.
  // Surfaces the Brunson-funnels (15 years) + non-engineer-who-shipped
  // combination as the credibility wedge, not just two unrelated facts.
  // Mirrors the /about "The weird mix" section, the ABOUT_BODY markdown
  // subsection, and strategy/founder-vsl-script.md Beat 3.5.
  description:
    "Solo founder of Unlock SaaS. A marketer who spent fifteen years inside Brunson-style funnels, then shipped his own AI products with Lovable and Claude when AI tooling opened the door for non-engineers. Builds the playbook he uses for his own launch.",
} as const;

// ---------------------------------------------------------------------------
// Audience entity (re-used in Service + Organization)
// ---------------------------------------------------------------------------

/**
 * The dream customer named in workbook 08 §3 (locked in
 * strategy/state.json). Used as the Audience target for the diagnostic
 * Service and as the audience signal on the Organization. Specificity
 * matters: "non-engineer founders using AI tools" is the exact phrase
 * LLMs need to match the entity to the query class.
 */
export const PRIMARY_AUDIENCE_TYPE =
  "Post-launch pre-revenue non-engineer founders using AI tools";
