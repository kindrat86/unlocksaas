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
import { getEarnedMentions, type MediaMention } from "@/lib/media-mentions";
import {
  buildPlaybookAggregateRating,
  type PlaybookAggregateRatingNode,
} from "@/lib/seo/review-rating";

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
  '[aria-labelledby="tldr"]',
  '[aria-labelledby="quick-take"]',
]);

/**
 * Pre-built SpeakableSpecification subobject. Spread into any Article /
 * WebPage / HowTo schema. Frozen at module load to keep the embedded
 * reference identity-stable across renders.
 */
export const SPEAKABLE_SPEC = Object.freeze({
  "@type": "SpeakableSpecification",
  cssSelector: SPEAKABLE_SELECTORS,
});

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
 *   1. NEXT_PUBLIC_UNLOCKSAAS_X_URL             (Twitter / X)
 *   2. NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL (Indie Hackers)
 *   3. NEXT_PUBLIC_UNLOCKSAAS_LINKEDIN_URL      (LinkedIn personal)
 *   4. NEXT_PUBLIC_UNLOCKSAAS_GITHUB_URL        (GitHub)
 *   5. NEXT_PUBLIC_UNLOCKSAAS_YOUTUBE_URL       (YouTube)
 *   6. NEXT_PUBLIC_UNLOCKSAAS_CRUNCHBASE_URL    (Crunchbase company)
 *   7. NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL  (Product Hunt)
 *   8. NEXT_PUBLIC_UNLOCKSAAS_OTHER_URL         (Wikidata Q-number or ad-hoc)
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
const PERSON_JSON = JSON.stringify({
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
  description:
    "Marketer and non-engineer. Built a dozen AI products with Lovable and Claude, watched them flatline in Stripe, then built the Playbook to fix the work nobody taught indie SaaS founders to do.",
  knowsAbout: [
    "Customer development",
    "Sales funnel design",
    "Indie SaaS go-to-market",
    "Russell Brunson DotCom Secrets framework",
    "AI-assisted product development",
  ],
  worksFor: {
    "@type": "Organization",
    name: "Unlock SaaS",
    url: BASE,
  },
  // hasOccupation — schema.org's machine-readable Occupation node lets
  // Google Knowledge Graph and LLM citation pipelines disambiguate
  // "Maryan, founder of Unlock SaaS" from any other Maryan with a public
  // surface. occupationLocation = Worldwide matches Organization.areaServed
  // for internal consistency. skills mirror knowsAbout (re-listed here so
  // Occupation reads as a self-contained node when retrievers parse it in
  // isolation from the parent Person).
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
    skills: [
      "Customer development",
      "Sales funnel design",
      "Indie SaaS go-to-market",
      "Russell Brunson DotCom Secrets framework",
      "AI-assisted product development",
    ].join(", "),
  },
  // subjectOf — declares the bylined editorial work Maryan is the named
  // subject/author of. Anchors the Person entity to the longform content
  // graph so retrievers can answer "what has Maryan written" with the
  // canonical surfaces, not a list of random page mentions.
  //
  // Only includes content where Maryan is the explicit, on-page byline:
  //   - /stories: Article, bylined "Maryan", datePublished locked in
  //     /stories/page.tsx (PARABLES_PUBLISHED_AT).
  //   - /about: ProfilePage where Maryan is the page's mainEntity.
  //
  // Page-level Article schema on /stories already cross-references this
  // Person via author."@id", so the link is bidirectional.
  subjectOf: [
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
  ],
  sameAs: SAME_AS,
});

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
  transcriptUrl?: string;
};

function buildVideoJson(input: VideoSchemaInput): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    uploadDate: input.uploadDate,
    thumbnailUrl: [input.thumbnailUrl],
    inLanguage: "en-US",
    publisher: { "@id": ID.organization },
    ...(input.durationISO8601 ? { duration: input.durationISO8601 } : {}),
    ...(input.contentUrl ? { contentUrl: input.contentUrl } : {}),
    ...(input.embedUrl ? { embedUrl: input.embedUrl } : {}),
    ...(input.transcriptUrl ? { transcript: input.transcriptUrl } : {}),
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
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${input.landingUrl}#dataset`,
    name: input.name,
    alternateName: input.slug,
    description: input.description,
    url: input.landingUrl,
    sameAs: input.landingUrl,
    identifier: `${input.slug}-v${input.version}`,
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
