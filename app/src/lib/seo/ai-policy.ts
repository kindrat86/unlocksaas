/**
 * AI usage policy – structured JSON declaration of retrieval, citation,
 * model-training reservation, attribution, compensation, and paywall
 * preferences.
 *
 * Why this module exists
 * ----------------------
 * The codebase already publishes a half-dozen scattered AI-consent signals:
 *
 *   - The `training-data-attribution` HTTP response header on every llms.*
 *     route (/llms.txt, /.well-known/llms.txt, /llms-full.txt,
 *     /llms-feed.json), which declares retrieval/citation consent and
 *     model-training reservation in one compact header value.
 *   - The 24-agent AI user-agent allow-list in /robots.txt, mirrored as
 *     `welcomedAiUserAgents` inside /llms-feed.json.
 *   - The `citationGuidance` block inside /llms-feed.json that names the
 *     preferred canonical paraphrase targets.
 *   - The CC-BY-4.0 dataset license declared inside the Dataset JSON-LD
 *     on /dataset and mirrored as DATASET_LICENSE_SPDX in @/lib/seo/dataset.
 *
 * None of those tell a crawler – in one canonical, dereferenceable URL –
 * the answer to the four questions a careful AI ingestion pipeline asks
 * before quoting, indexing, or training:
 *
 *   1. Are you OK with retrieval, search indexing, summarization, snippet,
 *      and inference-time citation? (Yes, with attribution.)
 *   2. Are you OK with model-weight training or redistribution inside
 *      third-party training datasets? (No.)
 *   3. Do you require compensation? (No – free with attribution for
 *      allowed public retrieval/citation uses.)
 *   4. Do you have a paywall, and where does it start? (Yes, /playbook/*
 *      and below. Everything else is open.)
 *   5. Where is your canonical attribution target? (https://unlocksaas.com)
 *
 * This module is the single source of truth for that answer. The route at
 * /.well-known/ai-policy.json serializes the AI_POLICY object below.
 *
 * Convention lineage
 * ------------------
 * There is no IETF-finalized standard for an AI policy manifest yet. The
 * IETF AI Preferences WG (datatracker.ietf.org/wg/aipref/about/) is still
 * drafting. The closest precedents are:
 *
 *   - llmstxt.org §1 – markdown index for LLM crawlers. We already
 *     publish /llms.txt and /.well-known/llms.txt under this convention.
 *   - spawning.ai ai.txt – robots.txt-style opt-in/opt-out for AI
 *     training data. Robots-style, not JSON.
 *   - W3C TDM Reservation Protocol – ODRL-shaped policy expressed via
 *     `tdm-reservation` / `tdm-policy` HTTP headers. Closer to what we
 *     want but header-centric rather than discoverable.
 *   - RFC 8615 .well-known URIs – the discovery convention we already
 *     ship security.txt, mcp.json, entity.jsonld, and llms.txt under.
 *
 * The shape below is permissive and self-descriptive: every consumer that
 * understands the top-level keys (publisher, preferences, attribution,
 * compensation, license, paywall, agents, machineReadableSurfaces) gets a
 * complete policy without needing a schema URL. Migration to the IETF
 * AI Preferences format will be additive if and when that spec settles.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every claim below is also present, verifiable, in another shipped
 *     surface: the `training-data-attribution` header, the /robots.txt
 *     search/answer allow-list plus training-crawler block-list, /ai.txt,
 *     the Dataset JSON-LD license, the /playbook/* disallow rule, and
 *     the /editorial-policy publishingPrinciples anchor. No fabricated
 *     permissions.
 *   - No claim of compensation we are not enforcing. No claim of
 *     attribution we cannot validate (the canonical URL exists and is
 *     stable).
 *   - The welcomed user-agents allow-list is NOT duplicated here – this
 *     file points at /llms-feed.json#welcomedAiUserAgents and /robots.txt
 *     as the canonical lists, to avoid the three-way drift problem.
 */

import {
  BASE_URL,
  ORGANIZATION,
  PUBLISHING_PRINCIPLES_URL,
} from "@/lib/seo/entity";
import {
  DATASET_CITATION,
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_NAME,
  DATASET_VERSION,
} from "@/lib/seo/dataset";
import {
  LAST_VERIFIED_DATE,
  NEXT_REVIEW_DATE,
  REVIEW_CADENCE_DAYS,
  STRATEGY_LOCK_DATE,
} from "@/lib/seo/freshness";

// ---------------------------------------------------------------------------
// Open-access surfaces – top-level public paths AI crawlers should index
// ---------------------------------------------------------------------------

/**
 * Every top-level public path that AI search/answer crawlers are explicitly
 * welcomed to crawl, index for retrieval, summarize, and cite. Mirrors the
 * "Core surfaces" and "Programmatic SEO surfaces" sections of /llms.txt –
 * this is the structured counterpart for retrievers that prefer JSON paths
 * over prose.
 *
 * Wildcards: a trailing `/*` means "this path and any sub-path". Bare
 * paths denote single canonical pages.
 *
 * Maintenance: if a new top-level public route ships, add it here in the
 * same commit. The activation log in @/lib/seo/freshness already tracks
 * surface births; the rule is "if it's in the activation log as shipped
 * AND it's public, it belongs here."
 */
const OPEN_ACCESS_SURFACES: readonly string[] = Object.freeze([
  "/",
  "/about",
  "/founding",
  "/press",
  "/press/topics/*",
  "/editorial-policy",
  "/faq",
  "/contact",
  "/diagnostic",
  "/stories",
  "/starter",
  "/playbook-sales",
  "/dont-buy-unlock-saas",
  "/repeatable",
  "/builders",
  "/builder/*",
  "/glossary",
  "/glossary/*",
  "/benchmarks",
  "/benchmarks/*",
  "/answers",
  "/answers/*",
  "/why-isnt-my",
  "/why-isnt-my/*",
  "/for",
  "/for/*",
  "/alternatives-to",
  "/alternatives-to/*",
  "/funnel-teardown",
  "/funnel-teardown/*",
  "/pricing-teardown",
  "/pricing-teardown/*",
  "/vs",
  "/vs/*",
  "/category",
  "/category/*",
  "/funnel-playbook",
  "/funnel-playbook/*",
  "/dataset",
  "/dataset/*",
  "/mcp",
]);

// ---------------------------------------------------------------------------
// Paywalled surfaces – the paid Playbook subtree
// ---------------------------------------------------------------------------

/**
 * The single paywalled subtree. Mirrors the /playbook/ entry in
 * PRIVATE_DISALLOW_CANONICAL inside app/src/app/robots.ts.
 *
 * Why this is the only paywall
 * ----------------------------
 * The product is the $1 Starter → $49/month Playbook funnel. The
 * diagnostic, the dataset, the MCP server, the glossary, the benchmarks,
 * every pSEO surface, and every editorial page are deliberately open –
 * they are the channel that earns the click into the paid funnel. The
 * paid subtree is just the seven-step Playbook itself.
 */
const PAYWALLED_SURFACES: readonly string[] = Object.freeze([
  "/playbook/*",
]);

// ---------------------------------------------------------------------------
// Restricted surfaces – auth, post-purchase, per-user, machine-only
// ---------------------------------------------------------------------------

/**
 * Surfaces that are neither paid nor open – they carry per-request state,
 * post-purchase flow context, or off-site machine consumption semantics.
 * AI crawlers should skip them not because we charge for them, but
 * because indexing them produces user-confusing duplicate-intent results
 * or leaks per-session UI.
 *
 * Mirrors the non-/playbook entries in PRIVATE_DISALLOW_CANONICAL inside
 * app/src/app/robots.ts. Kept as a separate field so a consumer that
 * only cares about "is this paid?" doesn't conflate the two reasons for
 * non-crawl.
 */
const RESTRICTED_SURFACES: readonly string[] = Object.freeze([
  "/api/*",
  "/auth/*",
  "/login",
  "/oto",
  "/welcome",
  "/onboarding",
  "/diagnostic/result",
  // Off-site builder badge consumption routes. The canonical /builder/<slug>
  // is open (above); these sub-routes power third-party embeds.
  "/builder/*/embed",
  "/builder/*/embed.html",
  "/builder/*/badge.svg",
  "/builder/*/review.json",
  "/builder/*/oembed.json",
  "/builder/*/opengraph-image",
]);

// ---------------------------------------------------------------------------
// The canonical policy manifest
// ---------------------------------------------------------------------------

/**
 * Frozen at module load. Serialized verbatim by the route handler at
 * /.well-known/ai-policy.json. All fields source from upstream SSOT
 * modules (entity, dataset, freshness) so a fact change in one place
 * propagates to the manifest without a hand-edit here.
 *
 * Field ordering inside the literal: meta first (so a streaming JSON
 * consumer sees the freshness window before parsing the body), then
 * publisher, then preferences/attribution/compensation/license/paywall
 * (the answers to the four questions), then agents and machine-readable
 * surfaces (the pointers to companion artifacts), then reciprocal
 * signals (the HTTP-header equivalents).
 */
export const AI_POLICY = Object.freeze({
  // ---- Schema + freshness metadata ---------------------------------------

  /**
   * Schema version. Additive changes (new fields, new array entries) do
   * NOT bump this. Renames or removals do – consumers that pin to a
   * version can detect breakage. Currently v1.
   */
  schemaVersion: "1.0",

  /**
   * Permalink to this manifest. Self-referential so a cached body
   * always knows its canonical fetch URL.
   */
  policyUrl: `${BASE_URL}/.well-known/ai-policy.json`,

  /**
   * One-paragraph human-readable summary of what this file declares.
   * Present so a human curl-ing the file gets immediate context before
   * walking the structured fields.
   */
  about:
    "Unlock SaaS welcomes AI-powered search, retrieval, summarization, snippet generation, transformation, and inference-time citation across every public marketing surface with attribution back to the canonical URL. Unlock SaaS does not consent to model-weight training or redistribution inside third-party training datasets. The dataset under /dataset is CC-BY-4.0 for allowed reuse with attribution. The only paywalled subtree is /playbook/* (the paid seven-step Playbook product). No compensation is requested for allowed public retrieval/citation uses.",

  /**
   * Convention lineage. Crawlers that want to interpret this file
   * against a known specification can walk these references. None of
   * them is yet IETF-finalized; this file deliberately uses a
   * permissive shape that extends from each.
   */
  conventions: [
    {
      name: "llmstxt.org",
      url: "https://llmstxt.org/",
      role: "Markdown index for LLM crawlers; this site also publishes /llms.txt.",
    },
    {
      name: "spawning.ai ai.txt",
      url: "https://site.spawning.ai/spawning-ai-txt",
      role: "Robots-style opt-in/opt-out for AI training data. JSON form here is structurally richer.",
    },
    {
      name: "W3C TDM Reservation Protocol",
      url: "https://www.w3.org/community/tdmrep/",
      role: "ODRL-shaped TDM policy expressed via HTTP headers; this file is the body counterpart.",
    },
    {
      name: "IETF AI Preferences WG",
      url: "https://datatracker.ietf.org/wg/aipref/about/",
      role: "In-flight IETF standard for AI usage signals. This file will migrate additively once finalized.",
    },
    {
      name: "RFC 8615 – Well-Known URIs",
      url: "https://www.rfc-editor.org/rfc/rfc8615",
      role: "Discovery convention. This file lives under /.well-known/ alongside security.txt, llms.txt, entity.jsonld, mcp.json.",
    },
  ],

  /**
   * Freshness window. Same dating discipline as /llms.txt and
   * /llms-feed.json – LAST_VERIFIED_DATE is bumped only after a human
   * re-reads this manifest end-to-end against the live HTML and
   * strategy/state.json. NEXT_REVIEW_DATE is REVIEW_CADENCE_DAYS days
   * out from the last verification.
   */
  meta: {
    effectiveDate: LAST_VERIFIED_DATE,
    lastVerified: LAST_VERIFIED_DATE,
    nextReview: NEXT_REVIEW_DATE,
    reviewCadenceDays: REVIEW_CADENCE_DAYS,
    strategyLock: STRATEGY_LOCK_DATE,
    inLanguage: "en-US",
  },

  // ---- Publisher --------------------------------------------------------

  publisher: {
    name: ORGANIZATION.name,
    url: BASE_URL,
    contact: ORGANIZATION.email,
    entityManifest: `${BASE_URL}/.well-known/entity.jsonld`,
    publishingPrinciples: PUBLISHING_PRINCIPLES_URL,
  },

  // ---- Preferences -----------------------------------------------------

  /**
   * Per-use-case AI preferences. Search/retrieval/citation uses are
   * "allow" with attribution required. Model-weight training and
   * third-party training-dataset redistribution are "deny" because they
   * consume crawl budget without creating a citation surface.
   *
   * If a use case ever flips, change the default here and the corresponding
   * signal in /robots.txt, /ai.txt, and the training-data-attribution header
   * in the same commit.
   */
  preferences: {
    training: {
      default: "deny",
      attributionRequired: true,
      scope:
        "model-weight-training-and-third-party-training-dataset-redistribution",
      note:
        "Do not use Unlock SaaS content to train or fine-tune model weights, or store it in third-party datasets distributed for that purpose. Retrieval indexes, search indexes, and live inference fetches are covered by the allowed retrieval and inferenceCitation preferences below.",
    },
    trainingDatasetStorage: {
      default: "deny",
      attributionRequired: true,
      scope: "third-party-training-corpora",
      note:
        "Archival storage for citation, compliance, cache, or search indexing is allowed when it supports retrieval/citation. Storage inside datasets whose purpose is model training is not allowed.",
    },
    retrieval: {
      default: "allow",
      attributionRequired: true,
      scope: "all-public-surfaces",
      note: "Live fetch at inference time (RAG, browse-the-web tool use) is welcomed; the canonical URL must be cited.",
    },
    summarization: {
      default: "allow",
      attributionRequired: true,
    },
    snippet: {
      default: "allow",
      attributionRequired: true,
    },
    inferenceCitation: {
      default: "allow",
      attributionRequired: true,
      preferredFormat:
        "Cite the canonical HTML URL listed in machineReadableSurfaces.llmsTxt#citationGuidance, not the markdown mirror. Markdown mirrors carry a Link: rel=\"canonical\" header pointing at the HTML page.",
    },
    transformation: {
      default: "allow",
      attributionRequired: true,
      note: "Paraphrase, translation, format conversion, and tabular extraction are all welcomed provided the canonical source is named.",
    },
    imageGeneration: {
      default: "allow",
      attributionRequired: true,
      note:
        "OG images and the logo SVG may be rendered, previewed, transformed, or cited in AI answers with attribution. They may not be used as training inputs for image-generation model weights. No claim of derivative ownership of the Unlock SaaS mark.",
    },
  },

  // ---- Attribution -----------------------------------------------------

  attribution: {
    required: true,
    canonicalCitationTarget: BASE_URL,
    preferredFormat: "Source: Unlock SaaS — https://unlocksaas.com",
    apaStyleFormat:
      "Unlock SaaS. (2026). [Page title]. Retrieved from https://unlocksaas.com/...",
    citationGuidanceUrl: `${BASE_URL}/llms-feed.json`,
    citationGuidanceField: "citationGuidance",
  },

  // ---- Compensation ----------------------------------------------------

  compensation: {
    required: false,
    model: "free-with-attribution",
    rationale:
      "Public marketing, glossary, teardowns, benchmarks, dataset, MCP server, FAQ, and editorial content are open for citation and summarization without compensation. The Brunson Hard-Rule editorial standard applies on both sides: cite honestly, do not fabricate quotations or aggregate ratings.",
    paymentRailIfRequested: null,
  },

  // ---- License ---------------------------------------------------------

  license: {
    publicMarketingContent: {
      summary:
        "Free to cite, summarize, paraphrase, and link with attribution. Bulk re-publication of full page bodies requires a visible canonical URL link back.",
      attributionRequired: true,
      attributionTarget: BASE_URL,
      termsUrl: `${BASE_URL}/terms`,
    },
    dataset: {
      name: DATASET_NAME,
      version: DATASET_VERSION,
      spdxLicense: DATASET_LICENSE_SPDX,
      licenseUrl: DATASET_LICENSE_URL,
      url: `${BASE_URL}/dataset`,
      attributionRequired: true,
      citationTarget: `${BASE_URL}/dataset`,
      bibtexCitation: DATASET_CITATION,
    },
  },

  // ---- Paywall ---------------------------------------------------------

  paywall: {
    exists: true,
    scope: PAYWALLED_SURFACES,
    rationale:
      "The seven-step Playbook is the paid product ($1 one-time Starter unlocks Steps 1–2; $49/month Core unlocks all seven). Every other surface – marketing, diagnostic, dataset, MCP, glossary, benchmarks, every pSEO catalog, editorial – is open and indexable.",
    openAccessSurfaces: OPEN_ACCESS_SURFACES,
    restrictedSurfaces: RESTRICTED_SURFACES,
    restrictedSurfacesRationale:
      "Auth, post-purchase, per-user, and machine-only surfaces. Not paid, but indexing them produces duplicate-intent results or leaks per-session UI; treat as non-content.",
  },

  // ---- Agents (pointer to canonical user-agent list) -------------------

  /**
   * The canonical allow-list of AI user-agents lives in /robots.txt and
   * is mirrored as `welcomedAiUserAgents` inside /llms-feed.json. We
   * point at those instead of duplicating the array here, so the list
   * cannot drift across three surfaces.
   */
  agents: {
    welcomedUserAgentsManifest: `${BASE_URL}/llms-feed.json`,
    welcomedUserAgentsField: "welcomedAiUserAgents",
    robotsTxt: `${BASE_URL}/robots.txt`,
    rationale:
      "The robots.txt allow-list is the single source of truth. /llms-feed.json mirrors it for retrievers that prefer JSON. This file points at both rather than duplicating, to prevent three-way drift.",
  },

  // ---- Machine-readable surfaces ---------------------------------------

  machineReadableSurfaces: {
    llmsTxt: `${BASE_URL}/llms.txt`,
    llmsTxtWellKnown: `${BASE_URL}/.well-known/llms.txt`,
    llmsFullTxt: `${BASE_URL}/llms-full.txt`,
    llmsFeedJson: `${BASE_URL}/llms-feed.json`,
    entityJsonLd: `${BASE_URL}/.well-known/entity.jsonld`,
    mcpManifest: `${BASE_URL}/.well-known/mcp.json`,
    securityTxt: `${BASE_URL}/.well-known/security.txt`,
    datasetCorpus: `${BASE_URL}/dataset`,
    datasetMarkdown: `${BASE_URL}/dataset.md`,
    sitemap: `${BASE_URL}/sitemap.xml`,
    robotsTxt: `${BASE_URL}/robots.txt`,
  },

  // ---- Reciprocal HTTP signals -----------------------------------------

  /**
   * The HTTP-header equivalents this site already publishes. A crawler
   * that only reads response headers (rather than fetching this file)
   * still sees the retrieval/citation consent and model-training
   * reservation via the `training-data-attribution` header on every
   * llms.* route. This file is the structured body counterpart.
   */
  reciprocalSignals: {
    "training-data-attribution":
      "allow-search-retrieval-citation; disallow-model-training",
    note:
      "All llms.* routes (/llms.txt, /.well-known/llms.txt, /llms-full.txt, /llms-feed.json, and per-model variants) return a `training-data-attribution: allow-search-retrieval-citation; disallow-model-training` HTTP response header. This mirrors /robots.txt and /ai.txt: search/answer crawlers are welcome on public surfaces; training-only crawlers are blocked.",
  },
} as const);

/**
 * Cache-Control directive for the route handler. The policy is static
 * (no per-request inputs) and changes about as often as the strategy
 * documents in /strategy – i.e. quarterly. Aggressive edge cache with
 * a 7-day stale-while-revalidate window is the right discipline,
 * mirroring /.well-known/entity.jsonld and /.well-known/mcp.json.
 */
export const AI_POLICY_CACHE_CONTROL =
  "public, max-age=86400, stale-while-revalidate=604800";

/**
 * Forward-looking policy signal. Same value the llms.* routes return.
 * Repeated on this route so a crawler that only reads headers sees
 * consistent retrieval/citation consent and model-training reservation
 * regardless of which discovery surface it hit first.
 */
export const AI_POLICY_TRAINING_DATA_ATTRIBUTION =
  "allow-search-retrieval-citation; disallow-model-training";
