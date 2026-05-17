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
  ORGANIZATION_SAME_AS,
  PUBLISHING_PRINCIPLES_URL,
} from "@/lib/seo/entity";

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
const PLAYBOOK_PRODUCT_JSON = JSON.stringify({
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
  },
  // aggregateRating intentionally omitted – see file header.
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
 * aggregateRating is intentionally omitted until verified customers with
 * public ratings exist. Brunson Hard-Rule (honest claims): no fabricated
 * review counts in structured data, ever.
 */
export function PlaybookProductJsonLd() {
  return <JsonLdScript json={PLAYBOOK_PRODUCT_JSON} />;
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
const DEFINED_TERM_SET_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": `${BASE}/#brunson-glossary`,
  name: "Unlock SaaS Brunson Glossary",
  description:
    "Working definitions of the Russell Brunson sales-funnel concepts Unlock SaaS teaches and applies to indie SaaS pages.",
  inLanguage: "en-US",
  publisher: { "@id": ID.organization },
  url: `${BASE}/`,
  hasDefinedTerm: DEFINED_TERMS.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.definition,
    inDefinedTermSet: `${BASE}/#brunson-glossary`,
  })),
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
