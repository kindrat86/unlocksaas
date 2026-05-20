/**
 * JSON-LD structured-data blocks for UnlockSaaS — Surface B (AEO/GEO) of the
 * Google strategy. See strategy/google-strategy.md §B.2.
 *
 * Each component renders a single <script type="application/ld+json"> tag.
 * Server-rendered so it's present on first paint for crawlers.
 *
 * Brunson Hard-Rule reconciliation: aggregateRating is intentionally omitted
 * from the Product block until verified customers with public ratings exist.
 * No fabricated review counts. See strategy/google-strategy.md §B.2 + the
 * `honest claims` row of the Brunson Hard-Rule table.
 *
 * Implementation note: every structured-data object is hoisted to module
 * scope and pre-serialized to JSON. The components are pure renders — no
 * per-request allocation, no per-render serialization. This is the
 * `server-hoist-static-io` + `rendering-hoist-jsx` pattern from the
 * Vercel React Best Practices guide.
 *
 * @id anchors (added 2026-05-17 GEO uplift)
 * --------------------------------------------------------
 * Organization, WebSite, and Person each carry a stable fragment-style
 * `@id`. Per-slug Article schemas on the pSEO surfaces then reference
 * those @ids via `isPartOf` and `publisher`, so Google's structured-data
 * graph and LLM retrieval pipelines resolve the four entities as one
 * connected node — not four disconnected blocks. The fragment URLs come
 * from `ID` in src/lib/seo/entity.ts (single source of truth).
 */

import { PLAYBOOK_STEPS } from "@/lib/playbook-steps";
import {
  ALTERNATE_NAMES,
  DEFINED_TERMS,
  FOUNDER,
  ID,
  KNOWS_ABOUT,
  MENTIONED_ENTITIES,
  ORGANIZATION,
  ORGANIZATION_MAIN_ENTITY_OF_PAGE,
  ORGANIZATION_SAME_AS,
  PUBLISHING_PRINCIPLES_URL,
  WORLDWIDE_AREA_SERVED,
  WORLDWIDE_PLACE,
} from "@/lib/seo/entity";
import {
  DIAGNOSTIC_WALKTHROUGH_DURATION_SEC,
  DIAGNOSTIC_WALKTHROUGH_TRANSCRIPT_TEXT,
} from "@/lib/diagnostic-walkthrough";
import { getEarnedMentions, type MediaMention } from "@/lib/media-mentions";
import {
  buildPodcastEpisodeJson,
  buildPodcastSeriesJson,
  type PodcastEpisode,
} from "@/lib/seo/podcast";
import {
  FOUNDER_ALUMNI_OF,
  FOUNDER_AWARDS,
  FOUNDER_KNOWS_ABOUT,
  FOUNDER_SAME_AS,
} from "@/lib/seo/founder";
import {
  FOUNDER_WORK_EXAMPLES,
  toCreativeWorkNode,
} from "@/lib/seo/founder-works";
import {
  FOUNDER_HAS_CREDENTIAL,
  FOUNDER_MEMBER_OF,
} from "@/lib/seo/founder-credentials";
import { buildCorrectionsItemList } from "@/lib/seo/corrections-log";
import {
  buildPlaybookAggregateRating,
  type PlaybookAggregateRatingNode,
} from "@/lib/seo/review-rating";
import {
  buildQuotationNode,
  type QuotationSchemaInput,
} from "@/lib/seo/quotation";

const BASE = "https://unlocksaas.com";

/**
 * Speakable Specification cssSelector list.
 *
 * Surface B (AEO + voice-engine optimization) extension. Schema.org's
 * `Speakable` property tells text-to-speech engines (Google Assistant,
 * Alexa, Siri Reader Mode, Bixby, ChatGPT Voice, Perplexity voice) which
 * DOM nodes are safe to read aloud – the prose, not the navigation,
 * call-to-action, or footer.
 *
 * Two parallel selector conventions are supported and both ship – callers
 * may pick either depending on page-level needs:
 *
 *   1. **Class-selector convention** (`aeo-*` classes via `speakableSpec`
 *      helper): used by /faq, where always-visible Q/A pairs let us mark
 *      them with stable `.aeo-q` / `.aeo-a` classes. Callers pass the
 *      selector list to `FaqPageJsonLd` and the helper builds the
 *      SpeakableSpecification inline.
 *
 *   2. **Data-attribute convention** (`SPEAKABLE_SELECTORS` /
 *      `SPEAKABLE_SPEC`): used by /diagnostic + the four pSEO slug
 *      surfaces, where `[data-speakable]` opt-ins and `[aria-labelledby]`
 *      anchors are stable retrieval handles. Pages spread `SPEAKABLE_SPEC`
 *      into their inline Article / WebPage schema.
 *
 * Selector contract (both conventions): every selector MUST resolve to
 * DOM that the page actually renders verbatim. Brunson Hard-Rule: no
 * fabricated speakable regions. A selector pointing at a non-existent
 * node is the same drift class as a JSON-LD field that disagrees with
 * rendered text – both get the page demoted in voice answer panels.
 *
 * Schema.org reference: https://schema.org/SpeakableSpecification
 */
export type SpeakableSelectors = ReadonlyArray<string>;

function speakableSpec(selectors: SpeakableSelectors) {
  return {
    "@type": "SpeakableSpecification",
    cssSelector: selectors,
  };
}

/**
 * Data-attribute selectors used by /diagnostic and the four pSEO slug
 * surfaces. See `speakableSpec` above for the parallel class-selector
 * convention used by /faq.
 */
export const SPEAKABLE_SELECTORS: readonly string[] = Object.freeze([
  "[data-speakable]",
  "[data-llm-summary]",
  '[aria-labelledby="tldr"]',
  '[aria-labelledby="quick-take"]',
]);

/**
 * Pre-built SpeakableSpecification subobject. Spread into any Article /
 * WebPage / HowTo schema. Frozen at module load to keep the embedded
 * reference identity-stable across renders.
 *
 * Default fallback. Prefer `buildSpeakable(...)` below for pSEO templates
 * that want page-specific `[data-speakable="<token>"]` curation – it gives
 * voice engines precise extraction handles on the page's most
 * citation-ready prose, instead of the generic catch-all.
 */
export const SPEAKABLE_SPEC = Object.freeze({
  "@type": "SpeakableSpecification",
  cssSelector: SPEAKABLE_SELECTORS,
});

/**
 * Stable global speakable handles every page can rely on – the structured
 * TL;DR `<dl data-llm-summary>` block and the TL;DR section wrapper. These
 * are always included by `buildSpeakable()` so per-page curation never
 * loses the canonical TL;DR anchor that LLM retrievers and voice engines
 * have already learned to query.
 */
const STABLE_SPEAKABLE_HANDLES: readonly string[] = Object.freeze([
  "[data-llm-summary]",
  '[aria-labelledby="tldr"]',
]);

/**
 * Build a curated SpeakableSpecification for a single page.
 *
 * Combines the stable global handles (the structured TL;DR + its section
 * wrapper) with page-specific `[data-speakable="<token>"]` selectors that
 * point at the page's most citation-ready prose blocks – the Hook/Story/
 * Offer paragraphs on a funnel teardown, the Direct Answer on an answers
 * page, the verdict on a comparison page, and so on.
 *
 * Why curate instead of using the bare `SPEAKABLE_SPEC` default
 * ------------------------------------------------------------
 * The default catches `[data-speakable]` (any token), `[data-llm-summary]`
 * (the structured TL;DR), and `[aria-labelledby="tldr"]` (its wrapper).
 * That works, but it's generic – a voice engine has no signal which of the
 * page's many `[data-speakable]` blocks is the canonical answer to the
 * page's intent. A curated list of named tokens
 * (`[data-speakable="hook"]`, `[data-speakable="story"]`,
 * `[data-speakable="offer"]`) names the page's specific speakable surface
 * and gives the engine a one-shot extraction path to the cited prose.
 *
 * Brunson Hard-Rule
 * -----------------
 * Every selector passed in MUST resolve to a DOM block the page actually
 * renders. The component contract is "the JSON-LD describes the rendered
 * HTML"; a speakable selector pointing at a non-existent attribute is the
 * same drift class as a JSON-LD field that disagrees with rendered text –
 * both get the page demoted in voice-answer panels and AI Overviews.
 *
 * Deduplication: the helper de-duplicates the merged selector list so a
 * caller that accidentally passes a stable handle (e.g.
 * `[data-llm-summary]`) does not produce a SpeakableSpecification with
 * repeated entries.
 *
 * Usage
 * -----
 *   const article = {
 *     // ...
 *     speakable: buildSpeakable(
 *       '[data-speakable="hook"]',
 *       '[data-speakable="story"]',
 *       '[data-speakable="offer"]',
 *     ),
 *   };
 */
export function buildSpeakable(...extraSelectors: readonly string[]) {
  const dedup = Array.from(
    new Set([...STABLE_SPEAKABLE_HANDLES, ...extraSelectors]),
  );
  return {
    "@type": "SpeakableSpecification",
    cssSelector: dedup,
  };
}

/**
 * Accessibility / access-mode signals. `accessMode` declares the sensory
 * modes the content uses; `accessModeSufficient` declares which single mode
 * suffices. A page that declares `["textual"]` as a sufficient mode tells
 * a voice assistant the text alone is a complete experience – safe to read
 * aloud without missing meaning carried by images or video.
 *
 * Exported so per-slug inline Article schemas can spread the same subobject
 * (the 4 pSEO slug pages build their Article JSON-LD in-line for static-
 * render simplicity; centralising the access-mode constant keeps the
 * declared signal consistent across every surface).
 */
export const ACCESS_MODE_TEXTUAL = Object.freeze({
  accessMode: ["textual"],
  accessModeSufficient: [
    { "@type": "ItemList", itemListElement: ["textual"] },
  ],
});

/**
 * Off-platform entity anchors shared by Organization.sameAs and Person.sameAs.
 *
 * LLMs (Perplexity, ChatGPT, Claude, Gemini) and Google's Knowledge Graph
 * walk `sameAs` to link the UnlockSaaS entity to its representation on other
 * indexed sites. Empty array = isolated entity = ~zero topical authority lift.
 *
 * Wired (2026-05-17 E-E-A-T audit fix) to the env-driven array exported by
 * src/lib/seo/entity.ts. Pre-fix this block was a local hardcoded `[]`, so
 * even though entity.ts already validated and froze a candidate list from
 * eight Vercel env vars, the consumer never read it – the operator could
 * have set every social handle on Vercel and the Organization / Person
 * blocks would still ship empty `sameAs`. Connecting this alias closes the
 * loop: set NEXT_PUBLIC_UNLOCKSAAS_*_URL on Vercel, redeploy, schema picks
 * it up – no code edit, no audit cycle.
 *
 * **Activation rule** (Brunson Hard-Rule: no fabricated identity):
 *   Only set an env var once the linked profile actually exists, is public,
 *   and credibly identifies Maryan / Unlock SaaS. Bidirectional claim is
 *   the bar: this site claims the handle via sameAs; the handle's bio
 *   claims unlocksaas.com. Knowledge Graph rewards the round-trip;
 *   one-way sameAs entries earn the lower confidence weight.
 *
 * Env vars consulted (see entity.ts buildSameAs), in suggested fill order
 * by GEO / AIO impact per effort:
 *   1. NEXT_PUBLIC_UNLOCKSAAS_X_URL              (Twitter / X)
 *   2. NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL  (Indie Hackers)
 *   3. NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL       (LinkedIn personal)
 *   4. NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL         (GitHub)
 *   5. NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL        (YouTube)
 *   6. NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL     (Crunchbase company)
 *   7. NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL   (Product Hunt)
 *   8. NEXT_PUBLIC_UNLOCKSAAS_OPENCORPORATES_URL (OpenCorporates legal entity)
 *   9. NEXT_PUBLIC_UNLOCKSAAS_WELLFOUND_URL      (Wellfound, formerly AngelList)
 *  10. NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL          (Wikidata Q-number or ad-hoc)
 *
 * Defaults to a frozen empty array in a fresh checkout. That is honest:
 * no env vars set = no off-platform anchors claimed. strategy/google-
 * strategy.md §B.3 (off-platform signal loop) is the publishing schedule
 * that fills the env vars.
 */
const SAME_AS = ORGANIZATION_SAME_AS;

// --- Pre-built JSON strings (module-level; serialized once at import time) ---

// `logo` resolves to /icon.svg — served by app/icon.svg via Next.js' file-based
// icon convention. iOS home-screen icon at 180×180 PNG is generated by
// app/apple-icon.tsx via next/og ImageResponse. Google accepts SVG for
// Organization.logo (since 2023); a 112×112-min PNG would unlock richer
// Knowledge-Graph rendering when brand-identity work ships.
/**
 * Convert earned media mentions into schema.org `subjectOf` entries on
 * Organization. Each row becomes an Article whose subject is UnlockSaaS,
 * which is exactly the Knowledge-Graph signal Google's AI Overviews and
 * LLM retrieval pipelines look for when answering "is this entity cited
 * anywhere outside its own site?"
 *
 * Returns `undefined` when no earned mentions exist – JSON.stringify drops
 * undefined fields, which keeps the JSON-LD valid and lets the schema
 * light up automatically the moment the operator appends the first row
 * to MEDIA_MENTIONS. No schema migration needed at mention-time.
 *
 * Article is the safest default schema.org type because every LLM and
 * structured-data tester accepts it. Podcast-specific or X-thread-specific
 * sub-types can be introduced later if MediaMention gains a `kind` field.
 */
/**
 * Always-present subjectOf entries — the LLM-readable corpus.
 *
 * Surface B (GEO/AEO) anchor: declares the two playbook-readable
 * representations of the entity (the curated index at /llms.txt and the
 * full concatenated corpus at /llms-full.txt) as Schema.org `Dataset`
 * artifacts that are "about" this Organization. AI retrieval pipelines
 * (Perplexity, ChatGPT search, Google AI Overviews, Claude search) walk
 * Organization.subjectOf to discover the canonical paraphrase corpus
 * for an entity. Without this, retrievers fall back to the llmstxt.org
 * convention discovery (probing /llms.txt by URL guess), which works
 * but earns lower confidence than an explicit schema-declared anchor.
 *
 * These two entries always render — the route handlers always serve.
 * Earned-media subjectOf entries (currently empty, fills as
 * MEDIA_MENTIONS grows) layer on top via buildSubjectOf below.
 *
 * encodingFormat=text/markdown is the honest content type the route
 * handlers serve. license points at /terms so downstream reusers know
 * the redistribution rule.
 */
const SUBJECT_OF_LLM_CORPUS = Object.freeze([
  {
    "@type": "Dataset",
    name: "Unlock SaaS — llms.txt index",
    description:
      "Curated playbook-readable index of every public Unlock SaaS surface, following the llmstxt.org convention.",
    url: `${BASE}/llms.txt`,
    encodingFormat: "text/markdown",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: `${BASE}/terms`,
    creator: { "@id": ID.organization },
  },
  {
    "@type": "Dataset",
    name: "Unlock SaaS — llms-full.txt corpus",
    description:
      "Concatenated playbook-readable corpus of every public surface — the LLM-canonical paraphrase target for Unlock SaaS.",
    url: `${BASE}/llms-full.txt`,
    encodingFormat: "text/markdown",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: `${BASE}/terms`,
    creator: { "@id": ID.organization },
  },
  // Canonical self-published entity manifest at /.well-known/entity.jsonld.
  // Tier 1 Knowledge Graph anchors (Wikidata, Wikipedia, SameAs.org) are
  // operator-gated; the Brunson Hard-Rule bars fabricating them. The
  // autonomous complement is to publish a stable, content-negotiated,
  // dereferenceable JSON-LD description of the entity and reference it
  // here so KG and LLM retrieval pipelines that walk subjectOf find the
  // canonical machine-readable description on their first traversal.
  // The manifest body is byte-stable across requests; only deploys
  // change it. See app/.well-known/entity.jsonld/route.ts for the source.
  {
    "@type": "Dataset",
    name: "Unlock SaaS – canonical entity manifest",
    description:
      "JSON-LD description of the Unlock SaaS Organization + Founder + WebSite entity graph, served at the .well-known discovery path for machine-readable entity resolution.",
    url: `${BASE}/.well-known/entity.jsonld`,
    encodingFormat: "application/ld+json",
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: `${BASE}/terms`,
    creator: { "@id": ID.organization },
  },
] as const);

/**
 * Compose the full subjectOf array: the always-present LLM corpus
 * Dataset entries first, then any earned media mentions on top.
 *
 * Article is the safest default schema.org type for mentions because
 * every LLM and structured-data tester accepts it. Podcast-specific
 * or X-thread-specific sub-types can be introduced later if
 * MediaMention gains a `kind` field.
 *
 * Order matters slightly: LLM-corpus entries first means retrievers
 * walking subjectOf top-down hit the paraphrase target before the
 * mentions list, which is the order that maximises citation accuracy.
 */
function buildSubjectOf(mentions: readonly MediaMention[]) {
  const mentionEntries = mentions.map((m) => ({
    "@type": "Article",
    url: m.url,
    name: m.context ?? `${ORGANIZATION.name} mention in ${m.publication}`,
    datePublished: m.publishedAt,
    publisher: {
      "@type": "Organization",
      name: m.publication,
    },
    about: { "@id": ID.organization },
  }));
  // Always emit the LLM-corpus entries — they describe a surface that
  // is ALWAYS present in production. Mentions are additive.
  return [...SUBJECT_OF_LLM_CORPUS, ...mentionEntries];
}

const ORGANIZATION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": ID.organization,
  name: ORGANIZATION.name,
  legalName: ORGANIZATION.legalName,
  // alternateName declares every public spelling resolves to one entity.
  // Without this, "UnlockSaaS" and "Unlock SaaS" can split into two weak
  // entity clusters in LLM training corpora. See entity.ALTERNATE_NAMES.
  alternateName: ALTERNATE_NAMES,
  url: BASE,
  logo: `${BASE}/icon.svg`,
  description: ORGANIZATION.description,
  slogan: ORGANIZATION.slogan,
  foundingDate: ORGANIZATION.foundingDate,
  // mainEntityOfPage anchors the Organization to its Wikipedia article
  // when one exists. Schema.org's one-to-one authoritative-description
  // pattern – Knowledge Graph weighs this more heavily than a sameAs
  // row pointing at the same URL because it explicitly names the page
  // as the canonical external description. Undefined (and dropped by
  // JSON.stringify) until NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL is set;
  // no fabricated Wikipedia URL ships.
  mainEntityOfPage: ORGANIZATION_MAIN_ENTITY_OF_PAGE,
  // subjectOf[] composes two layers, in order:
  //   1. Always-present: the /llms.txt + /llms-full.txt Dataset entries
  //      (SUBJECT_OF_LLM_CORPUS). Surface B (GEO/AEO) anchor — retrievers
  //      walking subjectOf top-down hit the paraphrase target first.
  //   2. Additive: earned-media Articles that name UnlockSaaS. Empty in
  //      a fresh state (MEDIA_MENTIONS=[]); the moment the operator
  //      appends a real mention, AIO + LLMO citation signals light up
  //      without a schema edit.
  // See buildSubjectOf() for the composition logic.
  subjectOf: buildSubjectOf(getEarnedMentions()),
  // Locale anchor. Mirrors the en-US signal shipped in the WebSite block and
  // the layout-level hreflang alternates. LLMs that build entity cards from
  // JSON-LD read `inLanguage` to decide which language audience this
  // organization serves; Google reads it as a corroborating International
  // SEO signal alongside hreflang.
  inLanguage: "en-US",
  // Worldwide digital SaaS. Honest declaration: no fabricated geo-targeting.
  areaServed: ORGANIZATION.areaServed,
  // knowsAbout declares topical authority. LLM retrieval pipelines use this
  // to decide "which entity is the authority on X" – specificity beats
  // breadth. See entity.KNOWS_ABOUT (28 entries, each verifiable in the
  // strategy/ folder or a shipped pSEO surface).
  knowsAbout: KNOWS_ABOUT,
  // publishingPrinciples points at /about's "Editorial position" block –
  // one of the strongest machine-readable E-E-A-T signals since 2023.
  publishingPrinciples: PUBLISHING_PRINCIPLES_URL,
  // mentions[] anchors UnlockSaaS in the entity neighbourhood of the
  // third-party entities the public surface already discusses. Every
  // entry is real and verifiable on at least one shipped page (funnel
  // teardowns, pricing teardowns, /alternatives-to, /about, /faq).
  mentions: MENTIONED_ENTITIES.map((m) => ({
    "@type": m.type,
    name: m.name,
    url: m.url,
  })),
  founder: {
    "@type": "Person",
    "@id": ID.person,
    name: "Maryan",
    email: "maryan@unlocksaas.com",
    url: `${BASE}/about`,
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "maryan@unlocksaas.com",
    url: `${BASE}/contact`,
    // BCP 47 locale tag. Matches inLanguage ("en-US"), <html lang>,
    // Content-Language HTTP header, and Service.availableLanguage so the
    // locale signal is internally consistent across every structured-data
    // surface. Prior value was the ISO 639-1 "en" which is valid per
    // schema.org but triggers "Item may be missing or invalid" warnings in
    // some Rich Results testers and weakens the locale signal that LLMs
    // aggregate across the entity. Normalized 2026-05-17.
    availableLanguage: ["en-US"],
  },
  // Machine-readable internal identifiers. PropertyValue is the schema.org
  // pattern for stable IDs that are not URLs. Knowledge Graph and LLM
  // retrieval pipelines walk Organization.identifier[] to confirm an
  // entity card is keyed to the same domain / founding date / canonical
  // manifest URL the body content names. Mirrors the identifier array on
  // /.well-known/entity.jsonld so both surfaces declare the same machine
  // IDs for the entity.
  identifier: [
    {
      "@type": "PropertyValue",
      propertyID: "domain",
      value: "unlocksaas.com",
    },
    {
      "@type": "PropertyValue",
      propertyID: "foundingDate",
      value: ORGANIZATION.foundingDate,
    },
    {
      "@type": "PropertyValue",
      propertyID: "canonical-manifest",
      value: `${BASE}/.well-known/entity.jsonld`,
    },
  ],
  sameAs: SAME_AS,
});

const WEBSITE_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": ID.website,
  name: "Unlock SaaS",
  url: BASE,
  inLanguage: "en-US",
  // Link the WebSite back to the publishing Organization so the graph
  // resolves as one entity, not two. Per-page Article schemas reference
  // ID.website via `isPartOf`, closing the loop.
  publisher: { "@id": ID.organization },
  /**
   * potentialAction[] — VEO / AEO actionable surface declarations
   * (added 2026-05-18 to close the audit gap on the WebSite block).
   *
   * Two actions, both backed by real shipped surfaces:
   *
   *   1. SearchAction → /search?q={search_term_string}
   *      Google "Sitelinks Search Box" enhancement. Backed by the real
   *      server-rendered /search page (app/(marketing)/search/page.tsx)
   *      so agents that submit the URL get a real HTML response, not 404.
   *
   *   2. AskAction → /diagnostic?url={url_input}
   *      Schema.org/AskAction is the canonical "ask a question, get an
   *      answer" action. /diagnostic IS literally that: paste a URL, get
   *      one of three labeled answers (Wrong Person / Weak Offer / Weak
   *      Belief). Lets voice assistants surface the diagnostic when the
   *      query class is "ask the site to diagnose X."
   *
   * Brunson Hard-Rule: both URL templates resolve to real pages. A
   * SearchAction or AskAction that 404s is the schema equivalent of a
   * fabricated claim — Google demotes the page, AI Overviews stop
   * citing the entity, the audit grade drops.
   */
  potentialAction: [
    {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    {
      "@type": "AskAction",
      name: "Ask Unlock SaaS to diagnose my product page",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE}/diagnostic?url={url_input}`,
        inLanguage: "en-US",
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform",
        ],
      },
      "query-input": "required name=url_input",
      result: {
        "@type": "Answer",
        text:
          "One of three diagnoses (Wrong Person, Weak Offer, Weak Belief) plus the specific next step that fixes the labeled problem.",
      },
    },
  ],
});

const DIAGNOSTIC_SERVICE_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": ID.diagnosticService,
  name: "Free Launch Diagnostic",
  description:
    "Paste your live product URL. In 90 seconds we label what is actually wrong with one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief — and hand you the door that fixes it.",
  inLanguage: "en-US",
  availableLanguage: ["en-US"],
  provider: { "@id": ID.organization },
  serviceType: "Pre-launch SaaS diagnostic",
  // areaServed: explicit "Worldwide" declaration on the Service node.
  // The Organization parent already declares areaServed: "Worldwide", but
  // Service is a separate entity in the schema graph and inherits nothing
  // automatically from its provider. Without this field, a crawler reading
  // the Service in isolation has to GUESS the geo target – and the heuristic
  // some crawlers use is "no areaServed = local intent unknown", which can
  // cost visibility on queries with implicit local framing ("indie SaaS
  // coach near me"). Single source of truth: WORLDWIDE_AREA_SERVED in
  // src/lib/seo/entity.ts – the "no Local SEO" decision codified.
  areaServed: WORLDWIDE_AREA_SERVED,
  audience: {
    "@type": "Audience",
    audienceType:
      "Post-launch pre-revenue non-engineer founders using AI tools",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    // eligibleRegion: Offer-scoped worldwide declaration. Schema.org
    // documents Place (or ISO country code, or GeoShape) as the accepted
    // shape; Place with name "Worldwide" is the validator-preferred form
    // for a digital-only worldwide product. Pairs with Service.areaServed
    // above so the two-layer geo signal is internally consistent.
    eligibleRegion: WORLDWIDE_PLACE,
  },
  // Free surface – declare it explicitly. LLMs answering "is X free" pull
  // this field directly. Pairs with the $0 Offer above.
  isAccessibleForFree: true,
  // Keywords expand the entity's lexical surface for retrieval-augmented
  // answer pipelines that don't walk knowsAbout on Service nodes.
  keywords: [
    "SaaS diagnostic",
    "indie SaaS launch audit",
    "Wrong Person Weak Offer Weak Belief",
    "Hook Story Offer page audit",
    "post-launch pre-revenue founder diagnostic",
  ].join(", "),
  category: "Pre-launch SaaS diagnostic",
  url: `${BASE}/diagnostic`,
});

const DIAGNOSTIC_HOWTO_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  "@id": ID.diagnosticHowTo,
  name: "How to get a free diagnosis of your stuck SaaS",
  description:
    "A three-step process that labels what is actually broken on your already-shipped product page.",
  inLanguage: "en-US",
  // VEO — HowTo steps are inherently voice-readable: a voice assistant
  // already reads the `name` + `text` of each step out loud when answering
  // "how do I do X." A page-specific `speakable` block is declared below
  // (after `step`) so the voice intro reads the same three Wrong Person /
  // Weak Offer / Weak Belief labels the on-page section renders.
  ...ACCESS_MODE_TEXTUAL,
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Paste your URL",
      text: "Paste the live URL of your shipped product and your email address.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Get the labeled diagnosis",
      text: "Within 90 seconds, get back one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Walk through the door",
      text: "The diagnosis hands you the specific next step that fixes the labeled problem.",
    },
  ],
  totalTime: "PT90S",
  // Speakable: the "What I am reading on your page" section on /diagnostic
  // renders the three diagnoses (Wrong Person / Weak Offer / Weak Belief) as
  // a bulleted list. Class `.aeo-diagnostic-howto` on that <section> makes
  // the same three answers voice-readable.
  speakable: speakableSpec([".aeo-diagnostic-howto"]),
});

/**
 * The seven-step Playbook as schema.org `HowTo`.
 *
 * Mounted on `/playbook-sales`. The same `PLAYBOOK_STEPS` array feeds the
 * "## The seven steps" section in `/playbook-sales.md` and `/llms-full.txt`
 * via `src/lib/seo/markdown.ts`, so the HowTo schema, the visible HTML
 * page, and the markdown mirror cannot drift.
 *
 * Why HowTo (not Article) for the seven steps: a numbered named-step list
 * is the literal shape Google's featured-snippet engine pulls when a
 * searcher types "how to get my first paying SaaS customer." Article fires
 * a generic Rich Result; HowTo fires the carousel-style step Rich Result
 * AND voice-answer eligibility, which is the entire AEO point.
 *
 * `estimatedCost` and `totalTime` are real, contracted values: $98 capped
 * exposure (the two-month Core price), 60 days from Playbook start. Both
 * are stated on /playbook-sales and in /faq verbatim; the Brunson Hard-Rule
 * "every schema field is in the public HTML" check passes.
 */
const PLAYBOOK_HOWTO_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to get your first paying SaaS customer in 60 days",
  description:
    "The Unlock SaaS Playbook is a seven-step system that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder is refunded automatically.",
  inLanguage: "en-US",
  totalTime: "P60D",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "USD",
    value: "98",
  },
  supply: [
    {
      "@type": "HowToSupply",
      name: "A live, already-shipped SaaS product (any stack — Lovable, Claude, Replit, v0, Cursor, Bolt, Bubble, hand-coded).",
    },
    {
      "@type": "HowToSupply",
      name: "A connected Stripe account (the guarantee reads from it).",
    },
    {
      "@type": "HowToSupply",
      name: "Willingness to do at least 20 logged outreach actions over 60 days.",
    },
  ],
  tool: [
    {
      "@type": "HowToTool",
      name: "The Playbook engine — outreach generation, response tracking, Stripe-webhook verification.",
    },
  ],
  step: PLAYBOOK_STEPS.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
    url: `${BASE}/playbook-sales#step-${i + 1}`,
  })),
  // Speakable: the seven steps render on /playbook-sales inside the Block 2
  // "Three Secrets" prose. Class `.aeo-playbook-howto` on the wrapping
  // <section> opts that block into voice answer panels.
  speakable: speakableSpec([".aeo-playbook-howto"]),
});

// Multi-typed as Product + SoftwareApplication + LearningResource: schema.org
// allows array @type and Google + LLM training corpora index all three.
//   - Product keeps the priced offer Rich Result eligible.
//   - SoftwareApplication lets LLMs answer "what SaaS tool helps me get my
//     first paying customer" with the entity name.
//   - LearningResource (added 2026-05-17 AIO uplift) declares the Playbook
//     as a structured learning resource; AI training pipelines for
//     educational corpora prioritise this type. Honest: the Playbook IS
//     a seven-step instructional surface, this is not stretching the type.
//
// aggregateRating wiring (2026-05-18 off-page uplift)
// ---------------------------------------------------
// The Playbook block now accepts an OPTIONAL aggregateRating node. The
// no-arg call (`buildPlaybookProductJson()`) preserves the previous
// rating-omitted output, byte-for-byte. The PLAYBOOK_PRODUCT_JSON_BASE
// constant memoises that hot path so root-layout / non-canonical callers
// pay zero allocation.
//
// When the canonical /playbook-sales surface fetches the current count of
// Stripe-verified, publicly-shared builder badges, it passes a non-null
// AggregateRating sub-graph through; the builder folds it into the
// SoftwareApplication node so Google's Review Rich Result resolves the
// aggregate to the same `@id` (ID.product) the per-builder Review nodes
// reference cross-document.
//
// Brunson Hard-Rule reconciliation: the AggregateRating node is supplied
// only by `buildPlaybookAggregateRating(count)` in lib/seo/review-rating.ts,
// which returns null when count <= 0. There is no code path through which
// a fabricated rating can ship.
function buildPlaybookProductJson(opts?: {
  aggregateRating?: PlaybookAggregateRatingNode | null;
}): string {
  const node = {
  "@context": "https://schema.org",
  "@type": ["Product", "SoftwareApplication", "LearningResource"],
  "@id": ID.product,
  name: "The Playbook – Unlock SaaS",
  description:
    "A seven-step playbook that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder does not pay. Built by a non-engineer for non-engineer founders shipping with AI tools.",
  brand: {
    "@type": "Brand",
    name: "Unlock SaaS",
  },
  url: `${BASE}/playbook-sales`,
  inLanguage: "en-US",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  // areaServed: explicit "Worldwide" declaration on the Product /
  // SoftwareApplication / LearningResource node. Mirrors Service.areaServed
  // (diagnostic) and Organization.areaServed. The Brunson Hard-Rule check
  // passes: "Worldwide" is the same word ORGANIZATION already declares,
  // not a new claim. Defensive against the "no areaServed = local intent
  // unknown" crawler heuristic; see WORLDWIDE_AREA_SERVED in entity.ts
  // for the full rationale.
  areaServed: WORLDWIDE_AREA_SERVED,
  // LearningResource fields. educationalUse + learningResourceType + about
  // give training corpora a clean handle on what the Playbook teaches.
  learningResourceType: "Playbook",
  educationalUse: "Professional skill development",
  teaches: [
    "How to acquire the first paying customer for a SaaS",
    "Hook Story Offer landing-page diagnosis",
    "Dream 100 outreach for indie founders",
    "Stripe-verified validation of go-to-market work",
  ].join(", "),
  about: {
    "@type": "Thing",
    name: "First paying customer acquisition for indie SaaS",
  },
  audience: {
    "@type": "Audience",
    audienceType:
      "Post-launch pre-revenue non-engineer founders using AI tools",
  },
  // Keywords lift retrieval surface area beyond knowsAbout. Aligned to
  // verbatim queries indie SaaS founders type.
  keywords: [
    "first paying customer SaaS",
    "indie SaaS go-to-market",
    "Russell Brunson playbook for SaaS",
    "Hook Story Offer SaaS playbook",
    "Stripe-verified founder validation",
    "money-back guarantee SaaS playbook",
    "non-engineer SaaS founder playbook",
  ].join(", "),
  isAccessibleForFree: false,
  publisher: { "@id": ID.organization },
  creator: { "@id": ID.person },
  offers: {
    "@type": "Offer",
    price: "49",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `${BASE}/playbook-sales`,
    seller: { "@id": ID.organization },
    // eligibleRegion: Offer-scoped worldwide declaration. Pairs with
    // Product.areaServed above and MerchantReturnPolicy.applicableCountry
    // ("Worldwide", already declared below). The three together form a
    // consistent geo story across the schema graph: this offer is sold
    // worldwide, fulfilled worldwide, and refundable worldwide.
    // Source: WORLDWIDE_PLACE in entity.ts ("no Local SEO" decision).
    eligibleRegion: WORLDWIDE_PLACE,
    // E-E-A-T Trust uplift (2026-05-17). The 60-day money-back guarantee
    // is real, code-enforced (Stripe-verified at refund time per
    // strategy/workbooks/01-sales-funnel-secrets.md §2), and the single
    // most-quoted policy on the page. Without MerchantReturnPolicy
    // schema, Google AI Overviews + Bing Copilot + Perplexity have to
    // paraphrase the policy from prose; with structured data they can
    // cite the field verbatim.
    //
    // Honest signal — every field below is verifiable against the
    // refund contract on /playbook-sales:
    //   - 60-day finite return window (matches the page's headline promise).
    //   - applicableCountry "Worldwide" — digital SaaS, no geo carve-outs.
    //   - ReturnMethod "ReturnByMail" is the closest schema.org enum for a
    //     software refund (Schema has no "automatic refund" value);
    //     "returnFees: FreeReturn" is the canonical way to encode "the
    //     customer pays nothing to claim the refund."
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "Worldwide",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 60,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
      url: `${BASE}/playbook-sales#guarantee`,
    },
  },
  // aggregateRating is folded in below when supplied. The pre-condition that
  // guards against fabrication lives in buildPlaybookAggregateRating().
  };
  if (opts?.aggregateRating) {
    return JSON.stringify({ ...node, aggregateRating: opts.aggregateRating });
  }
  return JSON.stringify(node);
}

/**
 * Memoised, rating-less default. The root layout, root page, and any other
 * surface that emits the Playbook node without a fresh badge count gets
 * this string for free — no per-render allocation, no Supabase round-trip.
 *
 * The canonical /playbook-sales surface bypasses this constant via
 * `buildPlaybookProductJson({ aggregateRating: ... })`.
 */
const PLAYBOOK_PRODUCT_JSON = buildPlaybookProductJson();

// --- Playbook as Course ----------------------------------------------------
// The Playbook is a seven-step, instructor-led, time-bounded learning
// program (60-day window, verified completion via Stripe). schema.org/Course
// is the precise type. We declare it as a SEPARATE @id-anchored node rather
// than folding "Course" into the Product's @type array because:
//
//   1. Google's Course Rich Result requires `Course` as the head @type, not
//      as one entry in a multi-type array. Splitting the node preserves
//      Product Rich Result eligibility on the priced offer AND Course Rich
//      Result eligibility for the curriculum.
//   2. The Course node carries a hasCourseInstance that names the cohort
//      pattern (rolling — every new signup is its own instance), the
//      duration, and the format. These are honest, page-verifiable claims.
//   3. provider + instructor cross-reference the canonical Organization /
//      Person @ids so Google's Knowledge Graph resolves "who teaches
//      Unlock SaaS" to the same Maryan node already declared elsewhere.
//
// Brunson Hard-Rule reconciliation:
//   - No fabricated enrollment counts (no `numberOfStudents`).
//   - No fabricated reviews (no `aggregateRating`).
//   - hasCourseInstance.courseWorkload uses ISO 8601 duration P60D —
//     a deliberate declaration of the 60-day window, not a marketing claim.
//   - educationalLevel set to "Beginner" because the Playbook explicitly
//     targets founders who have NEVER acquired a paying customer.
const PLAYBOOK_COURSE_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Course",
  "@id": `${BASE}/#course-playbook`,
  name: "The Playbook — Your First Paying SaaS Customer in 60 Days",
  description:
    "A seven-step instructor-led program that walks a post-launch pre-revenue SaaS founder through pinning one real customer, writing one real offer, sending one real message, and verifying the first paying customer cycle inside Stripe.",
  url: `${BASE}/playbook-sales`,
  inLanguage: "en-US",
  educationalLevel: "Beginner",
  educationalUse: "Professional skill development",
  learningResourceType: "Course",
  teaches: [
    "Pin one real dream customer for an already-shipped SaaS",
    "Write one real offer the dream customer cannot say no to",
    "Run a Dream 100 outreach sequence without sounding like a guru",
    "Diagnose a landing page with the Hook Story Offer framework",
    "Verify the first paying customer cycle inside Stripe",
  ],
  about: {
    "@type": "Thing",
    name: "First paying customer acquisition for indie SaaS",
  },
  audience: {
    "@type": "Audience",
    audienceType:
      "Post-launch pre-revenue non-engineer founders using AI tools",
  },
  provider: { "@id": ID.organization },
  instructor: { "@id": ID.person },
  // The Course points BACK at the Product/SoftwareApplication node so
  // crawlers can walk from "what does the course cost" to the priced offer.
  isRelatedTo: { "@id": ID.product },
  // hasCourseInstance — Google's Course Rich Result requires this for
  // eligibility. Rolling cohort = every signup is its own instance.
  hasCourseInstance: {
    "@type": "CourseInstance",
    name: "Self-paced rolling cohort",
    courseMode: "Online",
    courseWorkload: "P60D",
    // Honest: no fixed start date — start date IS purchase date.
    location: {
      "@type": "VirtualLocation",
      url: `${BASE}/playbook-sales`,
    },
    instructor: { "@id": ID.person },
    inLanguage: "en-US",
  },
});

// --- Founder (Person) ------------------------------------------------------
// Anchors the entity graph: LLMs link "Maryan, founder of Unlock SaaS" to the
// Organization above via the shared founder reference. ProfilePage on `/` is
// the canonical place to render this; the empty sameAs[] is the same
// honest-state pattern as Organization — fills as the founder publishes.
//
// 2026-05-20 enrichment (GEO uplift): knowsAbout sourced from DEFINED_TERMS +
// KNOWS_ABOUT via FOUNDER_KNOWS_ABOUT; subjectOf composes the existing
// bylined-work entries with any earned MEDIA_MENTIONS; alumniOf, award, and
// sameAs are env-gated via src/lib/seo/founder.ts and omitted entirely when
// the operator has not provisioned source-of-truth values. No fabricated
// claims ship in a fresh checkout.

/**
 * Build the Person.subjectOf array: the two always-present bylined
 * surfaces first, then any earned media mentions where Maryan is the
 * named subject. Earned mentions auto-populate as MEDIA_MENTIONS fills –
 * the integrity gate in src/lib/media-mentions.ts prevents fabricated
 * rows from shipping.
 *
 * Order: bylined work first (the canonical surfaces retrievers should
 * resolve to first), then mentions. Mirrors the Organization buildSubjectOf
 * composition order.
 */
function buildPersonSubjectOf(mentions: readonly MediaMention[]) {
  const bylinedWork = [
    {
      "@type": "Article",
      "@id": `${BASE}/stories`,
      headline: "Five Stories for the Flat Stripe Line",
      url: `${BASE}/stories`,
    },
    {
      "@type": "ProfilePage",
      "@id": `${BASE}/about`,
      url: `${BASE}/about`,
    },
  ] as const;
  const mentionEntries = mentions.map((m) => ({
    "@type": "Article",
    url: m.url,
    name: m.context ?? `Maryan mention in ${m.publication}`,
    datePublished: m.publishedAt,
    publisher: {
      "@type": "Organization",
      name: m.publication,
    },
    about: { "@id": ID.person },
  }));
  return [...bylinedWork, ...mentionEntries];
}

/**
 * Compose the full Person object then JSON.stringify once at module load.
 * Env-gated keys (alumniOf, award, sameAs) are omitted entirely when the
 * source array is empty – a `[]` or `undefined` on these keys is a
 * fabrication tell to KG validators, so we strip them at build time.
 *
 * The hoisted-static pattern is preserved: the build runs once at module
 * load, the resulting JSON string is shared across every render, and no
 * per-request allocation happens.
 */
function buildPersonJson(): string {
  const base = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": ID.person,
    name: "Maryan",
    url: `${BASE}/about`,
    mainEntityOfPage: {
      "@type": "ProfilePage",
      "@id": `${BASE}/about`,
    },
    email: "maryan@unlocksaas.com",
    jobTitle: "Founder",
    // Author-language signal for E-E-A-T attribution on /stories and any
    // future bylined content. Mirrors Organization.inLanguage.
    knowsLanguage: ["en-US"],
    // Single source of truth: FOUNDER.description in lib/seo/entity.ts.
    // The /about page and ABOUT_BODY markdown mirror both render the same
    // string verbatim, so changing one place updates every Person JSON-LD
    // surface across the site. Cross-section frame (Brunson funnels +
    // non-engineer shipper, in one head) lives in that constant; see
    // strategy/state.json attractive_character.locked.cross_section_frame
    // for the voice constraint that keeps it from drifting into a boast
    // and breaking Reluctant Hero.
    description: FOUNDER.description,
    // knowsAbout composes DEFINED_TERMS (the Brunson glossary the site
    // teaches at /glossary) + the broader KNOWS_ABOUT topical-authority
    // list + the five baseline founder skills. See FOUNDER_KNOWS_ABOUT
    // in src/lib/seo/founder.ts for the composition logic. Every entry
    // is verifiable: the product teaches each term on a shipped page,
    // and the founder is the one teaching it.
    knowsAbout: FOUNDER_KNOWS_ABOUT,
    worksFor: {
      "@type": "Organization",
      name: "Unlock SaaS",
      url: BASE,
    },
    // hasOccupation – schema.org's machine-readable Occupation node lets
    // Google Knowledge Graph and LLM citation pipelines disambiguate
    // "Maryan, founder of Unlock SaaS" from any other Maryan with a public
    // surface. occupationLocation = Worldwide matches Organization.areaServed
    // for internal consistency.
    //
    // Brunson Hard-Rule: every entry below is on the operator's documented
    // origin story (workbook 01 §6 Beat 1, founder VSL script). No invented
    // titles, no fabricated certifications.
    hasOccupation: {
      "@type": "Occupation",
      name: "Indie SaaS founder",
      description:
        "Solo non-engineer founder building Unlock SaaS with Claude Code. Builds the playbook he uses for his own launch.",
      occupationLocation: {
        "@type": "Place",
        name: "Worldwide",
      },
      // Skills mirror the founder baseline (the five core domains) so the
      // Occupation node reads as a self-contained signal when retrievers
      // parse it in isolation. The full glossary lives on knowsAbout above.
      skills: [
        "Customer development",
        "Sales funnel design",
        "Indie SaaS go-to-market",
        "Russell Brunson DotCom Secrets framework",
        "AI-assisted product development",
      ].join(", "),
    },
    // subjectOf – declares the bylined editorial work + the earned-media
    // articles where Maryan is the named subject. Anchors the Person
    // entity to the longform content graph so retrievers can answer
    // "what has Maryan written" or "where has Maryan been mentioned"
    // with the canonical surfaces.
    //
    // Always emits the two bylined-work entries (/stories, /about).
    // Earned mentions layer on top via buildPersonSubjectOf and auto-
    // populate as MEDIA_MENTIONS fills. The build-time integrity gate
    // in src/lib/media-mentions.ts prevents fabricated rows from
    // reaching this composition.
    subjectOf: buildPersonSubjectOf(getEarnedMentions()),
  } as const;
  // Env-gated keys, composed conditionally so an unset env var omits the
  // key entirely from the serialized JSON. JSON.stringify drops undefined
  // values, so the conditional spreads below are the cleanest way to ship
  // "nothing claimed" for an unset operator slot. See src/lib/seo/founder.ts
  // for the env var contract – the helper module returns frozen empty
  // arrays for unset values, never undefined / null.
  const sameAs =
    FOUNDER_SAME_AS.length > 0 ? { sameAs: FOUNDER_SAME_AS } : {};
  const alumniOf =
    FOUNDER_ALUMNI_OF.length > 0
      ? {
          alumniOf: FOUNDER_ALUMNI_OF.map((name) => ({
            "@type": "EducationalOrganization",
            name,
          })),
        }
      : {};
  const award = FOUNDER_AWARDS.length > 0 ? { award: FOUNDER_AWARDS } : {};
  // workExample – the founder's body of work. Always populated by the
  // anchor artifacts (dataset, glossary, podcast, OpenAPI, MCP server,
  // state-of-saas, four-indie essay) because each is a live, indexable
  // surface on this domain. The env-gated Zenodo / HuggingFace mirrors
  // layer on top once their respective deposits land. See
  // src/lib/seo/founder-works.ts for the editorial discipline that
  // governs which artifacts qualify.
  const workExample =
    FOUNDER_WORK_EXAMPLES.length > 0
      ? { workExample: FOUNDER_WORK_EXAMPLES.map(toCreativeWorkNode) }
      : {};
  // hasCredential – EducationalOccupationalCredential strings the
  // founder holds. Env-gated (NEXT_PUBLIC_FOUNDER_HAS_CREDENTIAL).
  // Empty by default per Brunson Hard-Rule – the key is omitted
  // entirely until the operator provides a real credential.
  const hasCredential =
    FOUNDER_HAS_CREDENTIAL.length > 0
      ? {
          hasCredential: FOUNDER_HAS_CREDENTIAL.map((name) => ({
            "@type": "EducationalOccupationalCredential",
            name,
          })),
        }
      : {};
  // memberOf – Organization memberships. Env-gated
  // (NEXT_PUBLIC_FOUNDER_MEMBER_OF, pipe-delimited name|url pairs).
  // Empty by default; the key is omitted until a real membership
  // resolves to a verifiable Organization URL.
  const memberOf =
    FOUNDER_MEMBER_OF.length > 0
      ? {
          memberOf: FOUNDER_MEMBER_OF.map((m) => ({
            "@type": "Organization",
            name: m.name,
            url: m.url,
          })),
        }
      : {};
  return JSON.stringify({
    ...base,
    ...sameAs,
    ...alumniOf,
    ...award,
    ...workExample,
    ...hasCredential,
    ...memberOf,
  });
}

const PERSON_JSON = buildPersonJson();

// --- Dynamic-input schema builders ------------------------------------------
// These accept caller-supplied data and serialize per render. Per-render cost
// is bounded (short arrays, no I/O) and the alternative — module-level
// memoization keyed by reference identity — adds complexity that doesn't pay
// for itself on a page that renders once per request via SSR. Strings are
// JSON-stringified by the helpers, so embedded quotes and HTML-like chars are
// safely escaped before reaching dangerouslySetInnerHTML.

export type FaqItem = { q: string; a: string };

function buildFaqPageJson(
  items: ReadonlyArray<FaqItem>,
  speakable?: SpeakableSelectors,
): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    ...ACCESS_MODE_TEXTUAL,
    // VEO — voice assistants reading FAQPage schema will read aloud whichever
    // DOM regions match these selectors. Caller-provided selectors win
    // (always-visible Q/A on /faq passes `.aeo-q` / `.aeo-a` classes);
    // default `SPEAKABLE_SPEC` covers data-speakable + aria-labelledby
    // anchors used elsewhere. Single `speakable` key — no duplicate per
    // TS object-literal rules.
    speakable: speakable ? speakableSpec(speakable) : SPEAKABLE_SPEC,
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.a,
        inLanguage: "en-US",
      },
    })),
  });
}

export type ArticleSchemaInput = {
  headline: string;
  description: string;
  url: string;
  datePublished: string; // ISO 8601
  dateModified?: string; // ISO 8601 — defaults to datePublished
  imageUrl?: string;
  /**
   * Speakable cssSelector list. Pass for long-form editorial pages where a
   * voice assistant should read the TL;DR / lede / per-story heading prose
   * but NOT the nav links or opt-in CTA. See SpeakableSelectors docs.
   */
  speakableSelectors?: SpeakableSelectors;
  /**
   * Word count of the article body. E-E-A-T Expertise signal — Google and
   * AI retrievers weight long-form editorial heavier when the schema
   * declares the actual depth. Honest only: count the published prose,
   * not nav + CTA boilerplate.
   */
  wordCount?: number;
  /**
   * articleSection — the editorial section/category the piece sits in.
   * Free text; LLMs use it to cluster bylined work into topical sets.
   */
  articleSection?: string;
  /**
   * Keywords this article is about. Free-form, comma-joined inside the
   * builder. Distinct from page metadata.keywords — schema keywords feed
   * AI retrieval; page meta keywords feed nothing (Google has ignored
   * meta keywords since 2009).
   */
  keywords?: ReadonlyArray<string>;
  /**
   * Topic anchors. Pass schema.org/Thing references the article is about,
   * so retrievers can resolve "what's this article about" to entities,
   * not just strings. Skip when the article is generic; pass when the
   * editorial is centered on named concepts (frameworks, methods, products).
   */
  about?: ReadonlyArray<{ name: string; sameAs?: string }>;
  /**
   * Verbatim externally-sourced quotations the article quotes. Emitted as
   * schema.org Article.citation – an array of Quotation nodes bound to
   * the parent Article. Each entry signals an external source to E-E-A-T
   * crawlers AND back-links the article into the knowledge graph via the
   * creator + source URLs.
   *
   * Brunson Hard-Rule: `text` MUST be character-verbatim from the named
   * source. No paraphrases. See QuotationSchemaInput docs in
   * @/lib/seo/quotation. Validation runs at module load via
   * `validateQuotations` from the same module.
   */
  quotations?: ReadonlyArray<QuotationSchemaInput>;
};

function buildArticleJson(input: ArticleSchemaInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: input.url,
    inLanguage: "en-US",
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    ...ACCESS_MODE_TEXTUAL,
    // VEO — voice assistants and reader-mode renderers pull `speakable` to
    // decide which DOM regions to read aloud first. Caller-provided
    // selectors override the default `SPEAKABLE_SPEC` (which targets
    // `[aria-labelledby="tldr"]` / `[aria-labelledby="quick-take"]` /
    // `[data-speakable]`). Single `speakable` key — no duplicate per TS
    // object-literal rules.
    speakable: input.speakableSelectors
      ? speakableSpec(input.speakableSelectors)
      : SPEAKABLE_SPEC,
    author: {
      "@type": "Person",
      "@id": ID.person,
      name: "Maryan",
      url: BASE,
    },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": input.url,
    },
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    // E-E-A-T enrichments (2026-05-17). All four fields are optional and
    // omitted entirely when the caller doesn't pass them — no fabricated
    // word counts or invented topic anchors. wordCount is the strongest
    // signal of editorial depth Google currently reads from Article schema.
    ...(input.wordCount !== undefined ? { wordCount: input.wordCount } : {}),
    ...(input.articleSection
      ? { articleSection: input.articleSection }
      : {}),
    ...(input.keywords && input.keywords.length > 0
      ? { keywords: input.keywords.join(", ") }
      : {}),
    ...(input.about && input.about.length > 0
      ? {
          about: input.about.map((thing) => ({
            "@type": "Thing",
            name: thing.name,
            ...(thing.sameAs ? { sameAs: thing.sameAs } : {}),
          })),
        }
      : {}),
    // Article.citation — array of Quotation nodes for verbatim external
    // sources. Brunson Hard-Rule: empty / omitted when no verbatim quotes
    // exist. See QuotationSchemaInput docs.
    ...(input.quotations && input.quotations.length > 0
      ? { citation: input.quotations.map(buildQuotationNode) }
      : {}),
  });
}

export type BreadcrumbTrail = ReadonlyArray<{ name: string; url: string }>;

function buildBreadcrumbJson(trail: BreadcrumbTrail): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  });
}

/**
 * VideoObject — render on any page hosting the founder VSL.
 *
 * `contentUrl` and `embedUrl` are deliberately optional: until the VSL has a
 * stable hosted URL (Mux, YouTube, or a Vercel-served MP4), we still want to
 * publish `name`, `description`, `uploadDate`, and `thumbnailUrl` so LLMs and
 * Google can attach the entity to the page even with the playable asset
 * pointing at the page itself. Schema.org permits `contentUrl` to be the
 * canonical page URL while the asset is in flight, but it lowers Rich-Results
 * eligibility — flag the upgrade in strategy/google-strategy.md when the VSL
 * lands on a CDN.
 */
export type VideoSchemaInput = {
  name: string;
  description: string;
  uploadDate: string; // ISO 8601 (YYYY-MM-DD or full ISO datetime)
  thumbnailUrl: string;
  durationISO8601?: string; // e.g. "PT4M30S"
  contentUrl?: string;
  embedUrl?: string;
  /** URL of a transcript document. Honored only when `transcriptText`
   *  is unset – inline text takes precedence because it is what voice
   *  engines and AI summarisers cite verbatim. */
  transcriptUrl?: string;
  /** Inline verbatim transcript text. Schema.org permits Text on the
   *  `VideoObject.transcript` field (alongside URL and MediaObject), and
   *  inline text is the strongest signal for AI Overview citations and
   *  voice-engine readouts because it removes the second-hop fetch. */
  transcriptText?: string;
  /** Optional stable @id anchor so other schemas (Article, WebPage,
   *  Service) can cross-reference this VideoObject as a connected node
   *  in the entity graph. See src/lib/seo/entity.ts ID constants. */
  id?: string;
  /** Optional caller-supplied creator anchor. Defaults to the
   *  organization @id; pass `ID.person` on founder-narrated assets. */
  creatorId?: string;
}

function buildVideoJson(input: VideoSchemaInput): string {
  const transcript = input.transcriptText ?? input.transcriptUrl;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    ...(input.id ? { "@id": input.id } : {}),
    name: input.name,
    description: input.description,
    uploadDate: input.uploadDate,
    thumbnailUrl: [input.thumbnailUrl],
    inLanguage: "en-US",
    publisher: { "@id": ID.organization },
    creator: { "@id": input.creatorId ?? ID.organization },
    ...(input.durationISO8601 ? { duration: input.durationISO8601 } : {}),
    ...(input.contentUrl ? { contentUrl: input.contentUrl } : {}),
    ...(input.embedUrl ? { embedUrl: input.embedUrl } : {}),
    ...(transcript ? { transcript } : {}),
  });
}

/**
 * AudioObject — schema.org type for an audio asset (podcast episode, voiceover,
 * audio version of an essay). Mirrors the VideoObject builder pattern. All
 * playable-asset fields are optional: until an audio asset ships, the builder
 * can still emit `name`, `description`, `uploadDate`, `transcript`, and
 * `publisher` so retrieval pipelines see the AudioObject node and link it to
 * the canonical page; Rich-Results eligibility unlocks once `contentUrl` is
 * populated.
 *
 * Brunson Hard-Rule: do NOT render AudioJsonLd on a page until the audio (or
 * the transcript that an audio asset would mirror) actually exists. The
 * existing markdown mirrors (/llms-full.txt, /<page>.md) ARE the canonical
 * "spoken-content" source for the founder's narration — when the VSL audio
 * track ships, `transcriptUrl` should point at the same MD mirror, which is
 * what an LLM voice mode will read aloud anyway.
 */
export type AudioSchemaInput = {
  name: string;
  description: string;
  uploadDate: string; // ISO 8601
  durationISO8601?: string; // e.g. "PT3M42S"
  contentUrl?: string; // canonical playable URL once the asset ships
  embedUrl?: string;
  /** URL of a transcript document. For UnlockSaaS this is the .md mirror of
   *  the spoken-content source page. */
  transcriptUrl?: string;
  /** Encoding format, e.g. `audio/mpeg`. Honest signal for AI ingestion. */
  encodingFormat?: string;
};

function buildAudioJson(input: AudioSchemaInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AudioObject",
    name: input.name,
    description: input.description,
    uploadDate: input.uploadDate,
    inLanguage: "en-US",
    publisher: { "@id": ID.organization },
    ...(input.durationISO8601 ? { duration: input.durationISO8601 } : {}),
    ...(input.contentUrl ? { contentUrl: input.contentUrl } : {}),
    ...(input.embedUrl ? { embedUrl: input.embedUrl } : {}),
    ...(input.transcriptUrl ? { transcript: input.transcriptUrl } : {}),
    ...(input.encodingFormat ? { encodingFormat: input.encodingFormat } : {}),
  });
}

// --- Render helpers ----------------------------------------------------------

function JsonLdScript({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      // json is pre-serialized at module load from static, hard-coded values.
      // No user input flows through this string.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/**
 * Organization + WebSite schema. Render on the funnel hub `/`.
 * LLMs anchor on Organization as the entity for UnlockSaaS-related queries.
 */
export function OrganizationJsonLd() {
  return (
    <>
      <JsonLdScript json={ORGANIZATION_JSON} />
      <JsonLdScript json={WEBSITE_JSON} />
    </>
  );
}

/**
 * Editorial-policy Article schema. Render on `/editorial-policy`.
 *
 * Why this component exists (E-E-A-T trust uplift, 2026-05-21):
 *   The /editorial-policy page already names a corrections workflow
 *   and renders an honest empty-state for the corrections log. It
 *   needed a machine-readable anchor – an Article JSON-LD declaring:
 *     - `correctionsPolicy` URL (self-referential anchor – the page
 *       itself is the policy document)
 *     - `correction` ItemList when CORRECTIONS is populated (omitted
 *       entirely while empty, per Brunson Hard-Rule – an empty
 *       correction array is a fabrication tell to validators)
 *     - publisher / author cross-references to the canonical
 *       Organization and Person @ids
 *
 *   Schema.org/Article.correctionsPolicy is one of the strongest
 *   E-E-A-T trust signals Google's quality raters recognise. The
 *   declaration tells crawlers: this site publishes a corrections
 *   policy AND links to it from every page where claims are made.
 *
 * Hoisting pattern: the JSON is composed at module load (same shape
 * as PERSON_JSON, ORGANIZATION_JSON) so per-render cost is zero.
 * The buildCorrectionsItemList() helper returns undefined when the
 * registry is empty, so the spread is a no-op in the honest empty
 * state.
 */
const EDITORIAL_POLICY_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${BASE}/editorial-policy`,
  headline: "Editorial Policy — Unlock SaaS",
  description:
    "How Unlock SaaS sources, dates, signs, and corrects every public claim. Editorial standards, financial disclosures, and the running corrections log.",
  url: `${BASE}/editorial-policy`,
  datePublished: "2026-05-17",
  dateModified: "2026-05-21",
  inLanguage: "en-US",
  isPartOf: { "@id": ID.website },
  publisher: { "@id": ID.organization },
  author: { "@id": ID.person },
  // Self-referential: this page IS the corrections policy document.
  // Schema.org accepts a URL for both correctionsPolicy and
  // diversityPolicy / ethicsPolicy fields.
  correctionsPolicy: `${BASE}/editorial-policy#corrections-workflow`,
  // Spread the corrections ItemList only when CORRECTIONS is non-empty.
  // buildCorrectionsItemList returns undefined while empty, so spreading
  // it is a safe no-op until the registry has entries.
  ...(buildCorrectionsItemList() ?? {}),
  // Knowledge Graph alignment with the existing publishingPrinciples
  // declaration on Organization – both fields point at this same
  // editorial-policy page, doubling the entity-confidence anchor.
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${BASE}/editorial-policy`,
  },
});

export function EditorialPolicyArticleJsonLd() {
  return <JsonLdScript json={EDITORIAL_POLICY_JSON} />;
}

/**
 * Service + HowTo schema. Render on `/diagnostic`.
 * The HowTo block is the format LLMs paraphrase when summarizing a process.
 */
export function DiagnosticJsonLd() {
  return (
    <>
      <JsonLdScript json={DIAGNOSTIC_SERVICE_JSON} />
      <JsonLdScript json={DIAGNOSTIC_HOWTO_JSON} />
    </>
  );
}

/**
 * Product schema. Render on `/playbook-sales`.
 *
 * aggregateRating handling (2026-05-18 off-page uplift):
 *   - Callers that DO NOT pass `aggregateRating` get the memoised
 *     rating-less constant (PLAYBOOK_PRODUCT_JSON). Same byte output the
 *     site has always shipped; no Supabase round-trip on root layout etc.
 *   - Callers that pass a non-null `aggregateRating` (see
 *     `buildPlaybookAggregateRating` in lib/seo/review-rating.ts, fed by
 *     `loadPublicBadgeCount` in lib/builder-badge.ts) get the same node
 *     with `aggregateRating` folded in. Google + LLM retrievers resolve
 *     the aggregate against the parent `@id` (ID.product) which the
 *     per-builder Review nodes also reference — one entity, N reviews,
 *     deterministic count.
 *
 * Brunson Hard-Rule: no fabricated review counts in structured data, ever.
 * The pre-condition that guards against fabrication lives upstream in
 * `buildPlaybookAggregateRating`, which returns null when count <= 0;
 * callers MUST forward a `null` result as `undefined` (or simply skip the
 * prop) so the rating block is omitted entirely rather than emitted empty.
 */
export function PlaybookProductJsonLd({
  aggregateRating,
}: {
  aggregateRating?: PlaybookAggregateRatingNode | null;
} = {}) {
  const json = aggregateRating
    ? buildPlaybookProductJson({ aggregateRating })
    : PLAYBOOK_PRODUCT_JSON;
  return <JsonLdScript json={json} />;
}

// Re-export so callers can avoid a second import path for the helper.
export { buildPlaybookAggregateRating } from "@/lib/seo/review-rating";
export type { PlaybookAggregateRatingNode } from "@/lib/seo/review-rating";

/**
 * Course schema for the Playbook. Render on `/playbook-sales` next to
 * PlaybookProductJsonLd and PlaybookHowToJsonLd. The three nodes are
 * complementary, not redundant:
 *
 *   - Product (+ SoftwareApplication + LearningResource): the priced
 *     subscription, with offers + MerchantReturnPolicy. Google Product
 *     Rich Result eligibility.
 *   - HowTo: the seven steps, voice-answer eligible via Speakable.
 *   - Course (this block): the time-bounded, instructor-led program.
 *     Google Course Rich Result eligibility; cited by AI Overviews when
 *     the query class is "courses" / "programs" / "training."
 *
 * Schema.org Knowledge Graph walks @id cross-references — the Course's
 * `isRelatedTo: ID.product` and `instructor: ID.person` resolve to the
 * same Product and Person already declared above, so the page reads as
 * one connected entity with three perspectives, not three disconnected
 * blocks. E-E-A-T Expertise uplift (2026-05-17).
 */
export function PlaybookCourseJsonLd() {
  return <JsonLdScript json={PLAYBOOK_COURSE_JSON} />;
}

/**
 * Person schema for Maryan. Render on the funnel hub `/` and on `/about`
 * once that page exists. Anchors author/E-E-A-T claims to a single entity.
 */
export function PersonJsonLd() {
  return <JsonLdScript json={PERSON_JSON} />;
}

/**
 * FAQPage schema. Caller passes the same FAQ array it renders as visible
 * HTML — Google penalizes Rich Results when schema diverges from rendered
 * text, so the source of truth lives in src/lib/content/faqs.ts and both
 * the page and this component import from there.
 *
 * Optional `speakableSelectors`: pass a cssSelector list for surfaces where
 * every answer is always-visible (e.g. /faq) so voice engines opt in. The
 * accordion variant on /playbook-sales should NOT pass this — hidden text
 * is invisible to voice and creates schema↔DOM drift.
 */
export function FaqPageJsonLd({
  items,
  speakableSelectors,
}: {
  items: ReadonlyArray<FaqItem>;
  speakableSelectors?: SpeakableSelectors;
}) {
  return <JsonLdScript json={buildFaqPageJson(items, speakableSelectors)} />;
}

/**
 * HowTo schema for the seven-step Playbook. Render on `/playbook-sales`.
 *
 * Mounted alongside `PlaybookProductJsonLd` (the priced Offer) so a single
 * page emits two complementary Rich-Result candidacies: HowTo (the seven
 * steps, voice-answer eligible via the Speakable child) AND Product (the
 * priced offer that powers AI Overviews price-pull). Both fields are drawn
 * from `PLAYBOOK_STEPS` and the canonical `BASE` constant — no per-render
 * allocation, no drift surface.
 */
export function PlaybookHowToJsonLd() {
  return <JsonLdScript json={PLAYBOOK_HOWTO_JSON} />;
}

/**
 * Article schema. Render on long-form content pages (e.g. `/stories`) so
 * LLMs and Google attach author + publish date + canonical URL to the
 * narrative content. Caller supplies the publishing dates from the page
 * to avoid baking build-time dates into the serialized claim.
 */
export function ArticleJsonLd(props: ArticleSchemaInput) {
  return <JsonLdScript json={buildArticleJson(props)} />;
}

/**
 * BreadcrumbList schema. Render on every non-hub page. Crumb trail must
 * mirror the visible site navigation; for UnlockSaaS most surfaces are
 * two-deep (`Home › <Surface>`). Exported as `BreadcrumbListJsonLd` so the
 * component name matches the schema.org `BreadcrumbList` type — easier for
 * future authors to grep and matches the convention used by /about's import.
 */
export function BreadcrumbListJsonLd({ trail }: { trail: BreadcrumbTrail }) {
  return <JsonLdScript json={buildBreadcrumbJson(trail)} />;
}

/**
 * VideoObject schema. Render alongside the VSL block. See VideoSchemaInput
 * docs above: omitting `contentUrl`/`embedUrl` is supported but lowers
 * Rich-Results eligibility — wire them once the VSL ships on a CDN.
 */
export function VideoJsonLd(props: VideoSchemaInput) {
  return <JsonLdScript json={buildVideoJson(props)} />;
}

/**
 * Diagnostic walkthrough VideoObject – env-driven VEO/AEO uplift
 * (2026-05-20).
 *
 * Pairs with the visible 90-second walkthrough <section> rendered on
 * /diagnostic. The verbatim transcript ships in the DOM regardless of
 * env state (it is canonical textual content describing how the
 * diagnostic works). This component layers a VideoObject JSON-LD on top
 * the moment a real recording lands at DIAGNOSTIC_VIDEO_URL.
 *
 * Brunson Hard-Rule: render nothing until a real `contentUrl` exists.
 * Until then, the visible transcript section is the only emission –
 * which is honest: there is content on the page describing the flow,
 * but no claim of a hosted video. The instant the URL lands in Vercel
 * env, this component starts emitting the VideoObject node with the
 * same transcript inline, the schema↔DOM contract intact.
 *
 * Env contract (NEXT_PUBLIC_ prefix so the value is visible in the
 * rendered HTML for crawlers; values are URLs, not secrets):
 *
 *   - NEXT_PUBLIC_DIAGNOSTIC_VIDEO_URL          (required to emit)
 *   - NEXT_PUBLIC_DIAGNOSTIC_VIDEO_THUMBNAIL_URL (required to emit)
 *   - NEXT_PUBLIC_DIAGNOSTIC_VIDEO_UPLOAD_DATE  (optional ISO date,
 *                                                defaults to org founding)
 *   - NEXT_PUBLIC_DIAGNOSTIC_VIDEO_EMBED_URL    (optional iframe URL)
 *   - NEXT_PUBLIC_DIAGNOSTIC_VIDEO_DURATION_MS  (optional override;
 *                                                default 95s from the
 *                                                walkthrough script)
 */
export function DiagnosticWalkthroughVideoJsonLd() {
  const contentUrl = process.env.NEXT_PUBLIC_DIAGNOSTIC_VIDEO_URL?.trim();
  const thumbnailUrl =
    process.env.NEXT_PUBLIC_DIAGNOSTIC_VIDEO_THUMBNAIL_URL?.trim();
  // Both video URL and thumbnail are required – Google Rich Results
  // eligibility for VideoObject demands a thumbnail, and emitting a
  // node without one tanks the page's structured-data score for the
  // benefit of zero gain. Honest zero-state until both ship.
  if (!contentUrl || !thumbnailUrl) return null;
  const embedUrl = process.env.NEXT_PUBLIC_DIAGNOSTIC_VIDEO_EMBED_URL?.trim();
  const uploadDateOverride =
    process.env.NEXT_PUBLIC_DIAGNOSTIC_VIDEO_UPLOAD_DATE?.trim();
  const uploadDate =
    uploadDateOverride && uploadDateOverride.length > 0
      ? uploadDateOverride
      : ORGANIZATION.foundingDate;
  const overrideMs = Number(
    process.env.NEXT_PUBLIC_DIAGNOSTIC_VIDEO_DURATION_MS,
  );
  const fallbackMs = DIAGNOSTIC_WALKTHROUGH_DURATION_SEC * 1000;
  const ms =
    Number.isFinite(overrideMs) && overrideMs > 0 ? overrideMs : fallbackMs;
  const durationISO8601 = `PT${Math.max(1, Math.round(ms / 1000))}S`;
  return (
    <VideoJsonLd
      id={ID.diagnosticWalkthroughVideo}
      name="The Free Diagnostic – in 90 seconds"
      description="A founder-narrated walkthrough of the free Unlock SaaS launch diagnostic: what you paste, what I read on your page, and which of three labels (Wrong Person, Weak Offer, Weak Belief) you get back."
      uploadDate={uploadDate}
      thumbnailUrl={thumbnailUrl}
      durationISO8601={durationISO8601}
      contentUrl={contentUrl}
      {...(embedUrl ? { embedUrl } : {})}
      transcriptText={DIAGNOSTIC_WALKTHROUGH_TRANSCRIPT_TEXT}
      creatorId={ID.person}
    />
  );
}

/**
 * AudioObject schema. Render on any page hosting a hosted audio asset
 * (founder narration, podcast episode, audio version of an essay) — and
 * also on any page that publishes a transcript that an audio asset would
 * mirror. Voice engines (Siri, Alexa, Google Assistant podcast surface,
 * ChatGPT Voice) and AI audio-search pipelines walk AudioObject + transcript
 * to attach the spoken content to the canonical page.
 *
 * Brunson Hard-Rule: do not render this on a page until either (a) the
 * audio asset has a real hosted URL, or (b) a transcript URL exists that
 * truthfully represents what the audio would say. The .md mirrors qualify
 * as (b) — they are the spoken-content source of truth.
 */
export function AudioJsonLd(props: AudioSchemaInput) {
  return <JsonLdScript json={buildAudioJson(props)} />;
}

/**
 * Founder VSL audio rendition — env-driven AudioObject for the funnel hub.
 *
 * VEO uplift (2026-05-18): the founder VSL ships as video when
 * NEXT_PUBLIC_VSL_URL is set; this component declares the audio-only
 * rendition when NEXT_PUBLIC_VSL_AUDIO_URL is also set, which is what
 * voice assistants (Siri Reader, Alexa, Google Assistant, ChatGPT Voice)
 * consume directly.
 *
 * Brunson Hard-Rule: render nothing until a real contentUrl exists. The
 * funnel hub's markdown mirror (/index.md) holds the same prose the VSL
 * narrates, so transcript resolves to a real surface that mirrors the
 * audio.
 */
export function FounderVslAudioJsonLd() {
  const contentUrl = process.env.NEXT_PUBLIC_VSL_AUDIO_URL?.trim();
  if (!contentUrl) return null;
  const uploadDateOverride = process.env.NEXT_PUBLIC_VSL_AUDIO_UPLOAD_DATE?.trim();
  const uploadDate =
    uploadDateOverride && uploadDateOverride.length > 0
      ? uploadDateOverride
      : ORGANIZATION.foundingDate;
  const encodingFormat =
    process.env.NEXT_PUBLIC_VSL_AUDIO_FORMAT?.trim() || "audio/mpeg";
  // Duration — default to VSL_SCRIPT total (matches video). Override env
  // when the uploaded audio measurably diverges (e.g. extended music tail).
  // Default: 110s per VSL_SCRIPT.totalDurationMs.
  const overrideMs = Number(process.env.NEXT_PUBLIC_VSL_AUDIO_DURATION_MS);
  const fallbackMs = 110 * 1000;
  const ms =
    Number.isFinite(overrideMs) && overrideMs > 0 ? overrideMs : fallbackMs;
  const durationISO8601 = `PT${Math.max(1, Math.round(ms / 1000))}S`;
  return (
    <AudioJsonLd
      name="The Playbook — in 110 seconds — audio"
      description="Why your line is flat, what fixes it, and the 60-day promise — said out loud."
      uploadDate={uploadDate}
      durationISO8601={durationISO8601}
      contentUrl={contentUrl}
      transcriptUrl={`${BASE}/index.md`}
      encodingFormat={encodingFormat}
    />
  );
}

/**
 * PodcastSeries — env-driven, declares schema.org/PodcastSeries only when
 * a real RSS feed exists at NEXT_PUBLIC_PODCAST_FEED_URL. Brunson Hard-Rule:
 * no fabricated show, no aspirational "Coming soon" surface. Mount on
 * /press (the canonical journalist + AI-summariser landing surface).
 */
export function PodcastSeriesJsonLd() {
  const feedUrl = process.env.NEXT_PUBLIC_PODCAST_FEED_URL?.trim();
  if (!feedUrl) return null;
  const webUrl = process.env.NEXT_PUBLIC_PODCAST_WEB_URL?.trim();
  const name =
    process.env.NEXT_PUBLIC_PODCAST_NAME?.trim() ||
    `${ORGANIZATION.name} Podcast`;
  const description =
    process.env.NEXT_PUBLIC_PODCAST_DESCRIPTION?.trim() ||
    "Conversations with non-engineer founders shipping SaaS with AI tools, recorded by the founder of Unlock SaaS.";
  const json = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "@id": `${BASE}/#podcast`,
    name,
    description,
    inLanguage: "en-US",
    webFeed: feedUrl,
    url: webUrl && webUrl.length > 0 ? webUrl : feedUrl,
    publisher: { "@id": ID.organization },
    author: { "@id": ID.person },
    about: [
      {
        "@type": "Thing",
        name: "Post-launch pre-revenue SaaS founder activation",
      },
      {
        "@type": "Thing",
        name: "First paying customer acquisition for indie SaaS",
      },
    ],
  });
  return <JsonLdScript json={json} />;
}

// Duplicate `export function` declarations of PersonJsonLd, ArticleJsonLd,
// FaqPageJsonLd, and BreadcrumbListJsonLd previously sat below this point —
// concurrent build sessions landed two copies plus a stale re-export alias.
// Canonical exports are above this line. The alias below preserves the older
// `BreadcrumbJsonLd` import name used by /faq/page.tsx (and any other caller
// that has not migrated to the schema.org-literal `BreadcrumbListJsonLd` name)
// so renames in this file do not break consumers.
export { BreadcrumbListJsonLd as BreadcrumbJsonLd };

// ---------------------------------------------------------------------------
// First-party podcast surface (2026-05-21) — PodcastSeries on /podcast,
// PodcastEpisode on /podcast/[slug]. Differs from PodcastSeriesJsonLd
// above: this variant always emits because the canonical feed lives at
// /feed/podcast.rss (an internal, always-present route). Use the env-
// gated PodcastSeriesJsonLd above on /press where the show is
// announced; use the variants here on the podcast's own pages.
// ---------------------------------------------------------------------------

/**
 * PodcastSeries JSON-LD for the canonical /podcast hub. Reads payload
 * from src/lib/seo/podcast.ts (buildPodcastSeriesJson) so the @id, name,
 * description, and webFeed URL stay in lockstep with the actual RSS
 * served at /feed/podcast.rss. The @id is shared with the env-gated
 * PodcastSeriesJsonLd above (`${BASE}/#podcast`) so the schema graph
 * resolves both surfaces to one connected entity.
 */
export function PodcastSeriesCanonicalJsonLd() {
  return <JsonLdScript json={buildPodcastSeriesJson()} />;
}

/**
 * PodcastEpisode JSON-LD for a single episode. associatedMedia
 * (AudioObject) is included only when the per-episode audio env var
 * resolved at module load – the honest text-only fallback when no
 * audio asset exists. Render once per /podcast/[slug] page.
 */
export function PodcastEpisodeJsonLd({
  episode,
}: {
  episode: PodcastEpisode;
}) {
  return <JsonLdScript json={buildPodcastEpisodeJson(episode)} />;
}

// ---------------------------------------------------------------------------
// AIO uplift (2026-05-17) — DefinedTermSet, Hub Dataset, Speakable
// ---------------------------------------------------------------------------

/**
 * DefinedTermSet — declares UnlockSaaS as the publisher of a glossary
 * of Brunson terms the site teaches. LLM training corpora that ingest
 * DefinedTermSet treat the publisher as a primary citation source for
 * the term. Pre-revenue, this is one of the few entity-graph anchors
 * a brand-new site CAN claim honestly: "we teach this term, here is
 * our definition, in our own words." Sourced from entity.DEFINED_TERMS.
 *
 * Render once on the funnel hub (`/`). The set is hoisted at module
 * load – no per-render allocation.
 */
// The DefinedTermSet's canonical entity now anchors at `/glossary` (the
// indexable surface added 2026-05-19), not the funnel hub's hash fragment.
// Per-term `@id` and `url` resolve to the in-page anchor on /glossary, so
// citation surfaces (AI Overviews, Perplexity, Bing Copilot) land on the
// canonical term anchor with one fragment per term. The funnel hub keeps
// emitting this script tag — multiple pages may declare the same @id;
// crawlers unify on the @id, not the declaring page.
const DEFINED_TERM_SET_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": `${BASE}/glossary#defined-term-set`,
  name: "Unlock SaaS Brunson Glossary",
  description:
    "Working definitions of the Russell Brunson sales-funnel concepts Unlock SaaS teaches and applies to indie SaaS pages.",
  inLanguage: "en-US",
  publisher: { "@id": ID.organization },
  url: `${BASE}/glossary`,
  hasDefinedTerm: DEFINED_TERMS.map((t) => {
    const slug = t.term
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return {
      "@type": "DefinedTerm",
      "@id": `${BASE}/glossary#${slug}`,
      name: t.term,
      description: t.definition,
      inDefinedTermSet: `${BASE}/glossary#defined-term-set`,
      url: `${BASE}/glossary#${slug}`,
    };
  }),
});

export function DefinedTermSetJsonLd() {
  return <JsonLdScript json={DEFINED_TERM_SET_JSON} />;
}

/**
 * Hub Dataset — the four pSEO catalogs (alternatives, funnel teardowns,
 * pricing teardowns, comparisons) are structurally datasets: each has a
 * defined schema, dated entries, and a stable distribution URL. Declaring
 * them as schema.org Dataset lifts AIO because:
 *   - Google Dataset Search discovers them.
 *   - LLM training corpora that prioritise structured data (Common Crawl
 *     dataset detection, academic crawlers) ingest them at a higher tier.
 *   - The `distribution` field points at the markdown mirror, so retrieval
 *     pipelines find the JS-free corpus directly.
 *
 * Caller passes the hub-specific facts. Built per-call, but the inputs
 * are static arrays from the manifests so this is cheap.
 */
export type HubDatasetInput = {
  name: string;
  description: string;
  /** Canonical HTML URL of the hub, e.g. `/funnel-teardown`. */
  hubPath: string;
  /** Markdown-mirror URL of the hub, e.g. `/funnel-teardown.md`. */
  mdPath: string;
  /** Date the latest entry in the catalog was verified (ISO 8601). */
  lastVerified: string;
  /** Catalog entries. Names appear in keywords + variableMeasured. */
  entries: ReadonlyArray<{ slug: string; displayName: string }>;
};

function buildHubDatasetJson(input: HubDatasetInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: input.name,
    description: input.description,
    url: `${BASE}${input.hubPath}`,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    creator: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    license: `${BASE}/terms`,
    keywords: input.entries.map((e) => e.displayName).join(", "),
    dateModified: input.lastVerified,
    variableMeasured: input.entries.map((e) => e.displayName),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "text/html",
        contentUrl: `${BASE}${input.hubPath}`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/markdown",
        contentUrl: `${BASE}${input.mdPath}`,
      },
    ],
  });
}

export function HubDatasetJsonLd(props: HubDatasetInput) {
  return <JsonLdScript json={buildHubDatasetJson(props)} />;
}

// ---------------------------------------------------------------------------
// Public Dataset JSON-LD (downloadable, citable, CC-BY-4.0)
// ---------------------------------------------------------------------------

/**
 * Schema.org `Dataset` block for the public Indie SaaS Teardowns dataset
 * served at `/dataset` with downloads at `/dataset/<slug>.json` and
 * `/dataset/<slug>.csv`.
 *
 * Why this is a SEPARATE component from HubDatasetJsonLd:
 *   - The hub variant treats the pSEO hub as a "dataset of entries"
 *     metaphor — discovery, not download. The HTML hub IS the dataset.
 *   - This variant publishes a real CC-BY-4.0 corpus with versioned
 *     downloadable artifacts (JSON, CSV) — the canonical shape Google
 *     Dataset Search indexes, and the citation hook for academic /
 *     newsletter re-use.
 *
 * Brunson Hard-Rule reconciliation:
 *   - `dateModified` and `version` carry through from the dataset
 *     module unchanged; no fabricated freshness signal.
 *   - `aggregateRating` deliberately omitted (no public reviewers of
 *     the dataset itself yet — same honesty rule as the Playbook).
 *   - `funder` / `sponsor` not claimed.
 *   - `license` resolves to the canonical CC-BY-4.0 URL; the
 *     attribution clause is mirrored in the same license URL so a
 *     re-user can verify the obligation without trusting us.
 */
export type PublicDatasetInput = {
  /** Display name, e.g. "Indie SaaS Teardowns Dataset". */
  name: string;
  /** Stable URL slug used in filenames. */
  slug: string;
  /** SemVer version string. */
  version: string;
  /** Long-form description. Appears as `Dataset.description`. */
  description: string;
  /** ISO date the editorial corpus was last verified. */
  lastVerified: string;
  /** ISO datetime the bundle was assembled (deployment timestamp). */
  generatedAt: string;
  /** Canonical landing-page URL. */
  landingUrl: string;
  /** JSON download URL. */
  jsonUrl: string;
  /** CSV download URL. */
  csvUrl: string;
  /** Markdown mirror URL. */
  markdownUrl: string;
  /** CC-BY-4.0 license URL. */
  licenseUrl: string;
  /** Plain-text citation string. */
  citation: string;
  /** Keyword list for `Dataset.keywords`. */
  keywords: ReadonlyArray<string>;
  /** Variable names exposed in the bundle (e.g. table names). */
  variableMeasured: ReadonlyArray<string>;
  /** Total row count across all tables. */
  totalRows: number;
  /**
   * Stable, version-pinned dataset identifier. Becomes
   * `Dataset.identifier`. Crawlers use this as the persistent ID across
   * version bumps; cross-listings (HF, Kaggle) carry their own catalog
   * identifiers via the `externalRegistrations` field below.
   */
  primaryIdentifier?: string;
  /**
   * Alternate dataset names – includes the slug, the HF-style
   * `<org>/<repo>` form, and any short forms. Schema.org
   * `Dataset.alternateName` is a cross-catalog retrieval anchor.
   */
  alternateNames?: ReadonlyArray<string>;
  /**
   * Plain-English description of how the rows were produced. Maps to
   * `Dataset.measurementTechnique` – one of Google Dataset Search's
   * recommended methodology fields. Mirrors the editorial method
   * documented at /editorial-policy.
   */
  measurementTechnique?: string;
  /**
   * External DataCatalog registrations (Hugging Face, Kaggle, Zenodo,
   * OSF). Each becomes a `Dataset.includedInDataCatalog` row and
   * contributes to `Dataset.sameAs`. Env-driven empty by default –
   * Brunson Hard-Rule: only declared when the catalog listing actually
   * exists. The optional `doi` field is populated for DOI-minting
   * catalogs (Zenodo, OSF) – it does not turn into a separate Dataset
   * field by itself, but the top-level `doi` prop below is the canonical
   * surface for it.
   */
  externalRegistrations?: ReadonlyArray<{
    /** Schema.org DataCatalog.name. */
    name: string;
    /** Canonical URL of the listing on that catalog. */
    url: string;
    /** Catalog homepage URL. */
    catalogUrl: string;
    /** Bare DOI in `10.<registrant>/<suffix>` form when the catalog
     *  mints one. Undefined for non-DOI catalogs (HF, Kaggle). */
    doi?: string;
  }>;
  /**
   * Bare DOI for the dataset (e.g. `10.5281/zenodo.12345678`) when the
   * Zenodo or OSF deposit is live. Surfaced as a schema.org
   * PropertyValue with `propertyID: "DOI"` on the Dataset block, and
   * appended to `sameAs` as `https://doi.org/<doi>`. Brunson Hard-Rule:
   * undefined when the operator has not pasted a real DOI on Vercel,
   * so the Dataset schema never advertises an identifier it cannot
   * resolve. DOI is the strongest dataset identifier class Google
   * Dataset Search recognises and the form every academic citation
   * pipeline pivots on – populating it lifts the canonical page above
   * non-DOI mirrors of the same corpus.
   */
  doi?: string;
  /**
   * Per-table CSV distributions. Each becomes an additional
   * `Dataset.distribution` entry so Google Dataset Search and any
   * structured-data crawler can index the per-table slices as distinct
   * download URLs. Empty array supported for older callers.
   */
  perTableDistributions?: ReadonlyArray<{
    /** Public display name, e.g. "Funnel teardowns". */
    name: string;
    /** Absolute download URL. */
    url: string;
  }>;
};

function buildPublicDatasetJson(input: PublicDatasetInput): string {
  // sameAs is an array of external canonical URLs for the dataset.
  // Schema.org expects either a single URL or an array; arrays are
  // honoured by Google Dataset Search and the HF / Kaggle ingestion
  // crawlers. The landing URL is always present; external catalog URLs
  // (HF, Kaggle, Zenodo, OSF) are appended when the env-driven
  // registrations resolved at module load. The DOI URL (when set)
  // is appended LAST so it appears as the canonical persistent
  // identifier alongside the volatile catalog URLs.
  // De-duped because the operator may legitimately set the Zenodo URL
  // env var to the `https://doi.org/<doi>` form (the strongest catalog
  // listing form) – in which case the env-driven row and the auto-
  // built DOI URL collapse to the same value. A schema.org sameAs with
  // duplicates is parseable but looks fabricated to strict validators.
  const doiUrl = input.doi ? `https://doi.org/${input.doi}` : undefined;
  const sameAs: string[] = Array.from(
    new Set([
      input.landingUrl,
      ...(input.externalRegistrations ?? []).map((r) => r.url),
      ...(doiUrl ? [doiUrl] : []),
    ]),
  );

  // includedInDataCatalog – one DataCatalog node per off-platform
  // catalog where the dataset is also hosted. Dataset Search treats
  // this as the strongest cross-catalog signal: a confirmed listing on
  // a recognised catalog (HF, Kaggle, Zenodo, figshare, DataCite, OSF)
  // lifts the canonical page's Dataset Search ranking and unlocks the
  // catalog's own search surface as a second acquisition channel.
  const includedInDataCatalog =
    (input.externalRegistrations ?? []).length > 0
      ? (input.externalRegistrations ?? []).map((r) => ({
          "@type": "DataCatalog" as const,
          name: r.name,
          url: r.catalogUrl,
        }))
      : undefined;

  // identifier – schema.org accepts either a string, a PropertyValue,
  // or an array mixing both. The single-string form (slug-version) is
  // the legacy local identifier; when a DOI is present we promote
  // identifier to an array with the DOI as a typed PropertyValue first
  // (Google Dataset Search reads the first element preferentially for
  // citation rendering), followed by the local slug-version string.
  //
  // Why PropertyValue not just a string. Google Dataset Search treats
  // DOI as a first-class persistent identifier class only when it is
  // wrapped in a PropertyValue with `propertyID: "doi"`. A bare DOI
  // string in the identifier slot is parsed but ranked below the
  // typed form. Academic citation pipelines (Zotero, Mendeley) also
  // prefer the typed form for round-tripping into BibTeX `doi = {}`.
  const localIdentifier =
    input.primaryIdentifier ?? `${input.slug}-v${input.version}`;
  const identifier = input.doi
    ? [
        {
          "@type": "PropertyValue" as const,
          propertyID: "DOI" as const,
          value: input.doi,
          url: `https://doi.org/${input.doi}`,
        },
        localIdentifier,
      ]
    : localIdentifier;

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${input.landingUrl}#dataset`,
    name: input.name,
    // alternateName accepts a single string OR an array of strings;
    // the array form is the modern shape and Dataset Search resolves
    // each as an independent retrieval anchor. Fall back to the slug
    // when no alternate-name list is passed for older callers.
    alternateName: input.alternateNames ?? input.slug,
    description: input.description,
    url: input.landingUrl,
    sameAs,
    identifier,
    version: input.version,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: input.licenseUrl,
    creator: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    sourceOrganization: { "@id": ID.organization },
    citation: input.citation,
    keywords: input.keywords.join(", "),
    variableMeasured: input.variableMeasured,
    dateModified: input.lastVerified,
    datePublished: input.lastVerified,
    // Methodology – Dataset Search's recommended field for documenting
    // how a corpus was produced. Omitted when no value passed so the
    // schema validator does not see a null methodology claim.
    ...(input.measurementTechnique
      ? { measurementTechnique: input.measurementTechnique }
      : {}),
    // Cross-catalog listings. Omitted when none are configured – an
    // empty includedInDataCatalog array would look like a fabricated
    // listing to a structured-data validator.
    ...(includedInDataCatalog ? { includedInDataCatalog } : {}),
    // schema.org Dataset has no native `generatedAt`; use the
    // additional-properties pattern so the deployment timestamp is
    // still machine-readable.
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "generatedAt",
        value: input.generatedAt,
      },
      {
        "@type": "PropertyValue",
        name: "totalRows",
        value: String(input.totalRows),
      },
    ],
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: input.jsonUrl,
        name: `${input.name} (JSON, v${input.version})`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: input.csvUrl,
        name: `${input.name} (CSV, v${input.version})`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/markdown",
        contentUrl: input.markdownUrl,
        name: `${input.name} (Markdown summary)`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/html",
        contentUrl: input.landingUrl,
        name: `${input.name} (HTML landing)`,
      },
      // Per-table CSV distributions. Each table is its own DataDownload
      // so Dataset Search can rank queries that match a specific
      // record type (e.g. "indie SaaS pricing data") against the right
      // narrower slice.
      ...(input.perTableDistributions ?? []).map((t) => ({
        "@type": "DataDownload" as const,
        encodingFormat: "text/csv" as const,
        contentUrl: t.url,
        name: `${t.name} (CSV, v${input.version})`,
      })),
    ],
    spatialCoverage: { "@type": "Place", name: "Worldwide" },
    temporalCoverage: `${input.lastVerified}/..`,
  });
}

export function PublicDatasetJsonLd(props: PublicDatasetInput) {
  return <JsonLdScript json={buildPublicDatasetJson(props)} />;
}

/**
 * Speakable schema — declares which CSS selectors voice assistants
 * (Google Assistant, Siri shortcuts via the Vision Pro web client,
 * Alexa Show web fetches) should read aloud. Render on `/faq`,
 * `/diagnostic`, and any pSEO slug page where the Q/A + TL;DR pattern
 * is voice-friendly.
 *
 * `cssSelectors` is optional — when omitted, the canonical
 * SPEAKABLE_SELECTORS set is used so every speakable surface declares
 * the same selector contract. The Article/FAQPage/HowTo schemas elsewhere
 * in this module embed the same `speakable` object directly via
 * SPEAKABLE_SPEC; this WebPage-level block is the page-level companion.
 */
export type SpeakableInput = {
  /** Page URL the SpeakableSpecification applies to. */
  url: string;
  /** CSS selectors a voice assistant should read aloud. Defaults to the
   *  canonical SPEAKABLE_SELECTORS set. */
  cssSelectors?: ReadonlyArray<string>;
};

function buildSpeakableJson(input: SpeakableInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: input.url,
    inLanguage: "en-US",
    ...ACCESS_MODE_TEXTUAL,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: input.cssSelectors ?? SPEAKABLE_SELECTORS,
    },
  });
}

export function SpeakableJsonLd(props: SpeakableInput) {
  return <JsonLdScript json={buildSpeakableJson(props)} />;
}

/**
 * Quotation — schema.org/Quotation block for verbatim external citations.
 *
 * The common case is to attach Quotation nodes inline on a parent Article
 * via `ArticleSchemaInput.quotations`; that keeps the citation chain bound
 * to the article in the structured-data graph. Use this STANDALONE block
 * only when the quotation is itself the primary entity of a dedicated page
 * (rare – for example a single-quote landing page or a press-quote index).
 *
 * Both the type and the node builder live in `@/lib/seo/quotation` so pure
 * data modules can import them without a React dependency. This file
 * re-exports them for components that already import from json-ld.tsx.
 *
 * Brunson Hard-Rule: NEVER emit a Quotation without character-verbatim
 * `text` from the named source. See QuotationSchemaInput docs.
 */
function buildStandaloneQuotationJson(input: QuotationSchemaInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    ...buildQuotationNode(input),
  });
}

export function QuotationJsonLd(props: QuotationSchemaInput) {
  return <JsonLdScript json={buildStandaloneQuotationJson(props)} />;
}

// Re-export so component-facing imports get the type + node helper from
// the same module that exports the React component.
export { buildQuotationNode };
export type { QuotationSchemaInput };

// ---------------------------------------------------------------------------
// Glossary AudioObject — per-slug TTS-rendered episode (VEO / AEO uplift)
// ---------------------------------------------------------------------------

/**
 * Per-slug AudioObject for the glossary detail pages.
 *
 * Why a dedicated builder (not a generic AudioJsonLd call): the glossary
 * audio episodes are anchored to a specific Article + DefinedTerm pair via
 * `isPartOf` and `about` @id cross-references, declare a real measured
 * `contentSize` (bytes) and `duration` (seconds), and carry the
 * `accessMode: ["auditory"]` + `accessibilityFeature: ["transcript"]`
 * signals that Apple Podcasts / Google Podcasts / Spotify / ChatGPT Voice
 * ingest when classifying an audio source as transcript-backed. The
 * generic AudioJsonLd lower in this file is calibrated for the founder
 * VSL audio rendition (env-driven, possibly absent contentUrl) and cannot
 * carry these richer signals without conditional logic that would muddy
 * its single-purpose contract.
 *
 * The transcript field points at the canonical glossary detail page – the
 * page IS the transcript by construction. Brunson Hard-Rule: every claim
 * here is verifiable against the file the enclosure URL serves.
 *
 * Render contract: caller MUST gate on
 * `getGlossaryAudio(slug)` returning non-null. The component does not
 * defensively check – emission of this schema implies a real audio file
 * exists at the contentUrl, and a stale claim is a Brunson Hard-Rule
 * violation that demotes the page in Rich Results + AI Overviews.
 */
export type GlossaryAudioJsonLdInput = {
  /** Term display name, e.g. "Hook". */
  termName: string;
  /** Short definition – the text the audio narrates verbatim. */
  shortDefinition: string;
  /** Absolute URL of the canonical glossary page (the transcript surface). */
  canonicalGlossaryUrl: string;
  /** Absolute URL of the MP3 file. */
  audioUrl: string;
  /** MIME type, e.g. "audio/mpeg". */
  contentType: string;
  /** Real duration in seconds, measured from the encoded file. */
  durationSeconds: number;
  /** Real byte size of the encoded file. */
  byteSize: number;
  /** ISO 8601 timestamp of when the audio was generated. */
  generatedAt: string;
  /** Locale tag, e.g. "en-US". */
  inLanguage: string;
};

function buildGlossaryAudioJson(input: GlossaryAudioJsonLdInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "AudioObject",
    "@id": `${input.canonicalGlossaryUrl}#audio`,
    name: `${input.termName} — audio definition`,
    description: input.shortDefinition,
    contentUrl: input.audioUrl,
    encodingFormat: input.contentType,
    // Schema.org duration is ISO 8601. Whole seconds only – TTS output is
    // generated at runtime so sub-second precision adds no signal.
    duration: `PT${Math.max(1, Math.round(input.durationSeconds))}S`,
    // contentSize accepts byte count as string ("12345") or with unit
    // suffix ("12.3 KB"). Raw byte count is the honest, unambiguous form.
    contentSize: `${input.byteSize}`,
    uploadDate: input.generatedAt,
    inLanguage: input.inLanguage,
    // Anchor to the glossary detail page's Article + DefinedTerm @ids
    // so the schema graph resolves the audio as ONE node connected to
    // both the article body and the term itself, not a disconnected leaf.
    // Detail page builders mint the Article @id implicitly via
    // `mainEntityOfPage.@id = canonicalUrl`; the DefinedTerm anchors at
    // `${canonicalUrl}#term`.
    isPartOf: { "@id": input.canonicalGlossaryUrl },
    about: { "@id": `${input.canonicalGlossaryUrl}#term` },
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    // Accessibility signals – the audio is fully transcript-backed. The
    // glossary page renders the same text verbatim as on-page prose, so
    // the canonical page URL is a valid `transcript` resolution target.
    accessMode: ["auditory"],
    accessModeSufficient: [
      { "@type": "ItemList", itemListElement: ["auditory"] },
    ],
    accessibilityFeature: ["transcript", "captions"],
    transcript: input.canonicalGlossaryUrl,
    isAccessibleForFree: true,
    license: `${BASE}/terms`,
  });
}

/**
 * AudioObject JSON-LD for one glossary slug. See GlossaryAudioJsonLdInput
 * docs above for the render contract – caller MUST gate on the manifest
 * helper before emitting this.
 */
export function GlossaryAudioJsonLd(props: GlossaryAudioJsonLdInput) {
  return <JsonLdScript json={buildGlossaryAudioJson(props)} />;
}

/**
 * State of UnlockSaaS dashboard schema. Emits two complementary JSON-LD
 * blocks consumed by Google Dataset Search, AI Overviews, Perplexity-style
 * retrievers, and any structured-data crawler that walks `@graph` edges:
 *
 *   1. `Dataset` – the dashboard itself as a citable artifact (stable
 *      URL, SemVer version, CC-BY-4.0 license, identifier, citation,
 *      keywords, creator/publisher/sourceOrganization linked via @id).
 *      Dataset Search ranks it; AI Overviews cite it.
 *
 *   2. `DataFeed` – the stream of dated observations. Each observation
 *      becomes a `DataFeedItem` whose `item` is a schema.org
 *      `Observation` with `name`, `description`, `measuredProperty`,
 *      `value`, `observationDate`, and an `isBasedOn` URL pointing at
 *      the canonical surface where the value is independently
 *      verifiable. The DataFeed shape is the schema.org-recommended
 *      pattern for "a snapshot that updates on a cadence" – exactly
 *      what /state-of-saas is.
 *
 * Pattern note: both blocks ship from this single component so callers
 * cannot accidentally render one without the other. Dataset alone is a
 * static-shaped artifact; DataFeed alone has no citable identity.
 * Together they read as "this dataset is a feed; this feed has these
 * dated observations" – the shape Knowledge Graph and Dataset Search
 * jointly recognise.
 *
 * Brunson Hard-Rule reconciliation: the schema only emits what the
 * upstream `state-of-saas` module passed validation for. The integrity
 * gate in src/lib/state-of-saas.ts is the single point that guards
 * against malformed rows (non-negative integers, valid ISO dates,
 * unique snake_case keys, https sourceUrls); this builder trusts that
 * upstream contract and renders verbatim.
 */
export type SnapshotObservationLd = {
  /** snake_case stable key, e.g. `glossary_terms`. */
  key: string;
  /** Category bucket, used for `additionalType` on the Observation. */
  category: string;
  /** Short human-readable label for the metric. */
  label: string;
  /** The measured value. */
  value: number;
  /** Plain-text unit, e.g. "pages", "terms". */
  unit: string;
  /** Sentence-form description. */
  description: string;
  /** Canonical URL where the value can be verified. */
  sourceUrl?: string;
  /** ISO 8601 date the value was current as of. */
  asOf: string;
};

export type SnapshotJsonLdInput = {
  /** Canonical URL of the dashboard surface, e.g. https://unlocksaas.com/state-of-saas. */
  url: string;
  /** Display name. */
  name: string;
  /** Long-form description. */
  description: string;
  /** SemVer version string. */
  version: string;
  /** ISO date the snapshot was last verified end-to-end by a human. */
  lastVerified: string;
  /** ISO date the next scheduled review is due. */
  nextReview: string;
  /** Plain-text citation string. */
  citation: string;
  /** Top-level keywords for cross-catalog retrieval. */
  keywords: ReadonlyArray<string>;
  /** Stable, version-pinned identifier. */
  primaryIdentifier: string;
  /** License URL (CC-BY-4.0). */
  licenseUrl: string;
  /** Markdown mirror URL. */
  markdownUrl: string;
  /** Ordered observation rows from SNAPSHOT_OBSERVATIONS. */
  observations: ReadonlyArray<SnapshotObservationLd>;
};

function buildSnapshotDatasetJson(input: SnapshotJsonLdInput): string {
  // Distinct variable names (one per observation key) – Dataset Search
  // reads `variableMeasured` as the retrieval anchor for "what does
  // this dataset measure" queries.
  const variableMeasured = input.observations.map((o) => ({
    "@type": "PropertyValue" as const,
    name: o.label,
    propertyID: o.key,
    unitText: o.unit,
    description: o.description,
  }));

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${input.url}#dataset`,
    name: input.name,
    description: input.description,
    url: input.url,
    sameAs: [input.url],
    identifier: input.primaryIdentifier,
    version: input.version,
    inLanguage: "en-US",
    isAccessibleForFree: true,
    license: input.licenseUrl,
    creator: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    sourceOrganization: { "@id": ID.organization },
    citation: input.citation,
    keywords: input.keywords.join(", "),
    variableMeasured,
    dateModified: input.lastVerified,
    datePublished: input.lastVerified,
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "text/html",
        contentUrl: input.url,
        name: `${input.name} (HTML dashboard)`,
      },
      {
        "@type": "DataDownload",
        encodingFormat: "text/markdown",
        contentUrl: input.markdownUrl,
        name: `${input.name} (Markdown summary)`,
      },
    ],
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "nextScheduledReview",
        value: input.nextReview,
      },
      {
        "@type": "PropertyValue",
        name: "observationCount",
        value: String(input.observations.length),
      },
    ],
    spatialCoverage: { "@type": "Place", name: "Worldwide" },
    temporalCoverage: `${input.lastVerified}/..`,
  });
}

function buildSnapshotDataFeedJson(input: SnapshotJsonLdInput): string {
  // Each observation becomes one DataFeedItem whose `item` is a
  // schema.org Observation. The Observation links back to the source
  // URL via `isBasedOn` and carries the value as a PropertyValue.
  const dataFeedElement = input.observations.map((o) => ({
    "@type": "DataFeedItem" as const,
    dateCreated: o.asOf,
    dateModified: o.asOf,
    item: {
      "@type": "Observation",
      "@id": `${input.url}#obs-${o.key}`,
      name: o.label,
      description: o.description,
      observationDate: o.asOf,
      measuredProperty: o.key,
      additionalType: o.category,
      value: o.value,
      unitText: o.unit,
      inLanguage: "en-US",
      about: { "@id": ID.organization },
      ...(o.sourceUrl ? { isBasedOn: o.sourceUrl } : {}),
    },
  }));

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "DataFeed",
    "@id": `${input.url}#datafeed`,
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: "en-US",
    isBasedOn: { "@id": `${input.url}#dataset` },
    creator: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    sourceOrganization: { "@id": ID.organization },
    license: input.licenseUrl,
    keywords: input.keywords.join(", "),
    dateModified: input.lastVerified,
    datePublished: input.lastVerified,
    dataFeedElement,
  });
}

export function SnapshotJsonLd(props: SnapshotJsonLdInput) {
  return (
    <>
      <JsonLdScript json={buildSnapshotDatasetJson(props)} />
      <JsonLdScript json={buildSnapshotDataFeedJson(props)} />
    </>
  );
}
