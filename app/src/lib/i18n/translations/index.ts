/**
 * Locale resolver for content datasets.
 *
 * Each translated page imports its data through this resolver rather than
 * statically importing a per-locale file. The page component stays
 * locale-agnostic; adding a new locale = adding one translation file +
 * one case below + one row in registry.ts.
 *
 * Brunson Hard-Rule: when no translation file exists for a requested
 * locale, the resolver falls back to en-US source data. Callers MUST
 * gate the render on the registry — the resolver does not check
 * approval state.
 */

import type { Locale } from "@/lib/i18n/locales";
import { FAQ_ENTRIES, type FaqEntry } from "@/lib/faq-data";
import { FAQ_ENTRIES_ES } from "./faq.es";
import { FAQ_ENTRIES_PT_BR } from "./faq.pt-br";
import {
  GLOSSARY,
  type GlossaryEntry,
  type GlossaryRow,
} from "@/lib/glossary";
import { GLOSSARY_ES, type GlossaryTranslation } from "./glossary.es";
import { GLOSSARY_PT_BR } from "./glossary.pt-br";
import {
  BENCHMARK_ENTRIES,
  type BenchmarkEntry,
} from "@/lib/benchmarks";
import {
  BENCHMARK_ENTRIES_ES,
  type BenchmarkTranslation,
} from "./benchmarks.es";
import { BENCHMARK_ENTRIES_PT_BR } from "./benchmarks.pt-br";

export function getFaqEntries(locale: Locale): FaqEntry[] {
  // Registry-approved locales get their translated dataset; everything else
  // (and en-US itself) falls back to the canonical English source. Callers
  // gate indexability on the registry — this resolver only resolves content.
  if (locale === "es") return FAQ_ENTRIES_ES;
  if (locale === "pt-BR") return FAQ_ENTRIES_PT_BR;
  return FAQ_ENTRIES;
}

// ---------------------------------------------------------------------------
// Glossary resolver – overlays text translations onto the canonical entries.
// Structural fields (slug, category, relatedTerms, appearsIn) come from the
// canonical so cross-link drift is impossible. Missing slugs fall back to
// en-US source.
// ---------------------------------------------------------------------------

function overlayGlossary(
  canonical: ReadonlyArray<GlossaryEntry>,
  translations: ReadonlyArray<GlossaryTranslation>,
): ReadonlyArray<GlossaryEntry> {
  const byTSlug = new Map(translations.map((t) => [t.slug, t]));
  return canonical.map((c) => {
    const t = byTSlug.get(c.slug);
    if (!t) return c;
    const row: GlossaryRow = {
      ...c,
      longDefinition: t.longDefinition,
      whyItMatters: t.whyItMatters,
      howToApply: t.howToApply,
      example: t.example,
      commonConfusions: t.commonConfusions ?? c.commonConfusions,
      faqs: t.faqs,
    };
    return { ...row, shortDefinition: t.shortDefinition };
  });
}

export function getGlossaryEntries(
  locale: Locale,
): ReadonlyArray<GlossaryEntry> {
  // Overlay the approved translations onto the canonical entries; missing
  // slugs (and non-translated locales) fall back to en-US via the overlay.
  if (locale === "es") return overlayGlossary(GLOSSARY, GLOSSARY_ES);
  if (locale === "pt-BR") return overlayGlossary(GLOSSARY, GLOSSARY_PT_BR);
  return GLOSSARY;
}

// ---------------------------------------------------------------------------
// Benchmarks resolver – same overlay pattern.
// ---------------------------------------------------------------------------

function overlayBenchmarks(
  canonical: ReadonlyArray<BenchmarkEntry>,
  translations: ReadonlyArray<BenchmarkTranslation>,
): ReadonlyArray<BenchmarkEntry> {
  const byTSlug = new Map(translations.map((t) => [t.slug, t]));
  return canonical.map((c) => {
    const t = byTSlug.get(c.slug);
    if (!t) return c;
    return {
      ...c,
      metric: t.metric,
      metaTitle: t.metaTitle,
      metaDescription: t.metaDescription,
      aeoAnswer: t.aeoAnswer,
      bands: t.bands,
      drivers: t.drivers,
      misreadings: t.misreadings,
      faqs: t.faqs,
      sourceNote: t.sourceNote,
    };
  });
}

export function getBenchmarkEntries(
  locale: Locale,
): ReadonlyArray<BenchmarkEntry> {
  // Overlay the approved translations onto the canonical entries; missing
  // slugs (and non-translated locales) fall back to en-US via the overlay.
  if (locale === "es")
    return overlayBenchmarks(BENCHMARK_ENTRIES, BENCHMARK_ENTRIES_ES);
  if (locale === "pt-BR")
    return overlayBenchmarks(BENCHMARK_ENTRIES, BENCHMARK_ENTRIES_PT_BR);
  return BENCHMARK_ENTRIES;
}

/**
 * Per-locale page chrome strings. Every key required for every locale —
 * TypeScript enforces parity at build time.
 */
export interface PageChromeFaq {
  breadcrumbHome: string;
  breadcrumbFaq: string;
  headline: string;
  lede: string;
  ledeDisclosure: string;
  ctaTitle: string;
  ctaDescription: string;
  ctaPrimary: string;
  ctaSecondary: string;
  footerAttribution: string;
  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_FAQ: Partial<Record<Locale, PageChromeFaq>> = {
  "en-US": {
    breadcrumbHome: "Home",
    breadcrumbFaq: "FAQ",
    headline:
      "Every objection answered. Each one sourced from a real founder.",
    lede:
      "These are the eight questions post-launch pre-revenue founders actually raise — about price, time, identity, DIY temptation, and whether praise without payment means the market is dead. They are not the questions a marketer would write. They are the ones I have read, in those words, in public Indie Hackers and Hacker News threads.",
    ledeDisclosure:
      "Every answer is the same answer I would give in a DM. Nothing here is rewritten to sell harder.",
    ctaTitle: "Still have a question that is not here?",
    ctaDescription:
      "The fastest way to get a specific answer about your own page is to run the free 90-second diagnostic. If you would rather just see the product, the $1 Starter is the same destination — just compressed.",
    ctaPrimary: "Run the free diagnostic",
    ctaSecondary: "Start the Playbook for $1",
    footerAttribution:
      "All quotes attributed to public Indie Hackers / Hacker News threads sourced in strategy/dollar-objections.md.",
    seoTitle: "FAQ — Every objection answered in the founder's exact words",
    seoDescription:
      "The eight objections post-launch pre-revenue founders actually raise about Unlock SaaS — price, time, identity, DIY, signal — answered in the same language they were asked in.",
  },
} as const;

export function getFaqChrome(locale: Locale): PageChromeFaq {
  return (PAGE_CHROME_FAQ[locale] ?? PAGE_CHROME_FAQ["en-US"] as any) as PageChromeFaq;
}

/**
 * Per-locale page chrome strings for /contact.
 *
 * /contact is pure chrome – no list entries, just structured copy. Brand
 * glossary preservation rules from faq.es.ts / faq.pt-br.ts apply
 * verbatim: Unlock SaaS, Stripe, Playbook, Starter, customer portal,
 * Wrong Person, Weak Offer, Weak Belief, partnership stay English in
 * every locale. Email address (maryan@unlocksaas.com) is identity, not
 * translatable.
 *
 * Voice: Reluctant Hero (workbook 02 §3). Plain register, no marketing
 * puffery. Spanish is neutral LATAM (no 'vosotros'). Portuguese is
 * Brazilian (não peninsular). Numbers and pricing in USD ($1, $49, 60
 * days, ninety seconds) preserved across locales.
 *
 * TypeScript enforces key parity across all three locales at build.
 */
export interface PageChromeContact {
  breadcrumbHome: string;
  breadcrumbContact: string;
  pageLabel: string;
  headline: string;
  lede: string;
  emailHeading: string;
  emailHelp: string;
  stuckHeading: string;
  stuckP1: string;
  stuckCta: string;
  refundHeading: string;
  refundP: string;
  pressHeading: string;
  pressP: string;
  relatedLabel: string;
  relatedAbout: string;
  relatedPrivacy: string;
  relatedTerms: string;
  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_CONTACT: Partial<Record<Locale, PageChromeContact>> = {
  "en-US": {
    breadcrumbHome: "Unlock SaaS",
    breadcrumbContact: "Contact",
    pageLabel: "Contact",
    headline: "One inbox. One human. Real replies.",
    lede:
      "There is no ticket system pretending to be a person. The address below is mine. I read every message.",
    emailHeading: "Email",
    emailHelp:
      "Diagnostic questions, refund requests, partnership notes, press – same address. Replies usually within one business day. If you don’t hear back within three, send a nudge – sometimes the spam filter eats things.",
    stuckHeading: "If you’re stuck",
    stuckP1:
      "The fastest path to an answer is usually the free diagnostic. Paste your live product page and you get a labeled diagnosis in about ninety seconds – Wrong Person, Weak Offer, or Weak Belief – plus the specific door that fixes it.",
    stuckCta: "Take the free diagnostic →",
    refundHeading: "If you bought and want to cancel or refund",
    refundP:
      "You can cancel a Playbook subscription from the Stripe customer portal linked inside the product, or by emailing the address above. The 60-day money-back guarantee on the Playbook and a standard refund on the $1 Starter are both honored by replying to any purchase email or writing fresh.",
    pressHeading: "If you’re a journalist or podcaster",
    pressP:
      "Same address. Put the publication, the angle, and a deadline in the subject line. I prioritize anything tied to a real publication date over generic interview requests.",
    relatedLabel: "Related",
    relatedAbout: "About Maryan",
    relatedPrivacy: "Privacy",
    relatedTerms: "Terms",
    seoTitle: "Contact",
    seoDescription:
      "One inbox, one human, real replies. Email maryan@unlocksaas.com. Diagnostic, refund, partnership, press – all the same address.",
  },
} as const;

export function getContactChrome(locale: Locale): PageChromeContact {
  return (PAGE_CHROME_CONTACT[locale] ?? PAGE_CHROME_CONTACT["en-US"] as any) as any;
}

/**
 * Per-locale page chrome strings for /repeatable (Rung 2 spec page).
 *
 * Brand glossary preservation (stays English in every locale):
 *   Unlock SaaS, Playbook, Core, Starter, Rung 1, Rung 2, Rung 3,
 *   Dream 100, Attractive Character, Outreach Room, Reluctant Hero,
 *   Product 1, Product 2, Stripe, value ladder, dream customer,
 *   outreach, prefill, lock, clone, warmth flags, patterns, self-serve,
 *   coaching, tier, waitlist, countdown, carry-over.
 *
 * Numbers and pricing preserved verbatim in USD: $1, $49/mo, $149/mo,
 * 60-day, 90-day. The strategy file path
 * `strategy/decisions/rung-2-repeatable-revenue.md` renders as an
 * untranslated <code> element, so chrome doesn't carry it.
 *
 * Voice: Reluctant Hero. Same neutral LATAM Spanish (no 'vosotros') and
 * Brazilian Portuguese (não peninsular) discipline as the rest of the
 * registry. TypeScript enforces key parity across all three locales.
 */
export interface PageChromeRepeatable {
  topLabel: string;
  headline: string;
  lede: string;
  whatItIsHeading: string;
  whatItIsP1: string;
  whatItIsP2: string;
  whatItIsNotHeading: string;
  whatItIsNotItems: readonly [string, string, string, string];
  gatesHeading: string;
  gatesIntro: string;
  gatesItems: readonly [string, string, string];
  priceHeading: string;
  priceP: string;
  ctaIntro: string;
  ctaPrimary: string;
  ctaSecondaryPre: string;
  ctaSecondaryLink: string;
  ctaSecondaryPost: string;
  signoff: string;
  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_REPEATABLE: Partial<Record<Locale, PageChromeRepeatable>> = {
  "en-US": {
    topLabel: "Rung 2 – The Repeatable Revenue Layer",
    headline: "The next yes, published before I am ready to sell it.",
    lede:
      "This is the layer of the value ladder that sits above $49/mo Core. It is spec'd, not shipped. The build is gated on three paying Core customers completing the full Playbook loop. Until then this page is a public commitment – not a waitlist, not a countdown.",
    whatItIsHeading: "What it is",
    whatItIsP1:
      "Once the Playbook gets you to your first paying customer on Product 1, the most expensive thing you can do is start Product 2 from zero. Re-define the dream customer. Re-write the offer. Re-build the outreach list. Re-discover which Dream 100 targets actually convert. That is a week of avoidance dressed up as productive work – the exact disease the Playbook treats.",
    whatItIsP2:
      "The Repeatable Revenue Layer carries the assets you earned on Product 1 forward into Product 2, automatically: dream customer pre-fill, Attractive Character lock, outreach template clone, Dream 100 with warmth flags, Stripe pattern library. Same Playbook, same guarantee mechanic, with a 90-day window for Product 2's first paying customer.",
    whatItIsNotHeading: "What it is not",
    whatItIsNotItems: [
      "Not a course. Same anti-guru rule as Core.",
      "Not a coaching tier. Self-serve only.",
      "Not a community-only upsell. The Outreach Room stays at Core.",
      "Not an agency / unlimited-products tier. That is Rung 3, still deferred.",
    ],
    gatesHeading: "Hard activation gates",
    gatesIntro: "I refuse to ship this before:",
    gatesItems: [
      "Three paying Core customers have completed the full Playbook loop (Step 1 → Step 7 → First Paying Customer Verified). Carry-over assumptions are unvalidated below three.",
      "At least one Core customer has asked, unprompted, for a next layer. No supply without demand signal.",
      "I have personally run Product 2 through the imagined carry-over flow on myself. The Reluctant Hero rule: never hand a customer a path I have not walked.",
    ],
    priceHeading: "Target price",
    priceP:
      "$149/mo. 60-day guarantee mechanic with a 90-day window for Product 2's first paying customer. Full spec lives in",
    ctaIntro: "Rung 2 is the door that opens AFTER you walk through Rung 1.",
    ctaPrimary: "Start at the $49 Core Playbook",
    ctaSecondaryPre: "Or take the",
    ctaSecondaryLink: "$1 Starter",
    ctaSecondaryPost: "and earn your way to this page.",
    signoff: "– Maryan",
    seoTitle: "The Repeatable Revenue Layer – Rung 2",
    seoDescription:
      "What ships after your first paying customer: a self-serve layer that carries dream customer, Attractive Character, outreach, and Stripe pattern across Product 2. Spec published; build gated on three Core customer cycles.",
  },
} as const;

export function getRepeatableChrome(locale: Locale): PageChromeRepeatable {
  return (PAGE_CHROME_REPEATABLE[locale] ?? PAGE_CHROME_REPEATABLE["en-US"] as any) as any;
}

/**
 * Per-locale page chrome strings for /editorial-policy.
 *
 * E-E-A-T anchor. Google Quality Rater Guidelines §3.1 + §3.4 explicitly
 * look for a "clearly stated editorial policy" and a "corrections policy"
 * on sites that publish opinions or comparisons (which UnlockSaaS does on
 * every pSEO surface).
 *
 * Brand-glossary preservation rules apply in every locale:
 *   Unlock SaaS, Maryan, founder, editorial board, contractor pool,
 *   ghost-written / ghostwriter, parable, funnel teardown, pricing
 *   teardown, comparison (translated grammatically), category roundup,
 *   byline, footer, Indie Hackers, Hacker News, thread (translated),
 *   Stripe, ChatGPT, canonical audience, lastVerified, datePublished,
 *   dateModified, schema.org/Article, affiliate links, paid placements,
 *   Person schema graph stay English. USD pricing verbatim
 *   ($1 Starter, $49/mo Playbook).
 *
 * Voice: Reluctant Hero, working-policy register (not legal boilerplate).
 * Spanish: neutral LATAM, no 'vosotros'. Portuguese: Brazilian, não
 * peninsular.
 *
 * The mailto link in section 5 item 1 renders the email address as
 * plain text in locale pages (canonical en-US keeps its <a href> link).
 * Acceptable degradation: the address is still legible and copy-pasteable.
 *
 * TypeScript enforces key parity across all three locales at build.
 */
export interface LabeledItem {
  /** Bold-rendered label prefix. */
  label: string;
  /** Body sentence(s) that follow the label. */
  body: string;
}

export interface PageChromeEditorialPolicy {
  breadcrumbHome: string;
  breadcrumbEditorial: string;
  pageLabel: string;
  headline: string;
  lede: string;
  publishedLabel: string;
  reviewedLabel: string;

  section1Heading: string;
  section1P1: string;
  section1P2: string;

  section2Heading: string;
  section2Items: readonly [
    LabeledItem,
    LabeledItem,
    LabeledItem,
    LabeledItem,
  ];

  section3Heading: string;
  section3P1: string;
  section3P2: string;

  section4Heading: string;
  section4Items: readonly [
    LabeledItem,
    LabeledItem,
    LabeledItem,
    LabeledItem,
    LabeledItem,
  ];

  section5Heading: string;
  section5Intro: string;
  section5Items: readonly [string, string, string, string];

  section6Heading: string;
  section6Intro: string;
  section6EmptyState: string;

  footerSigPre: string;
  footerSigPost: string;
  footerSeeAlso: string;
  footerLinkAbout: string;
  footerLinkPress: string;
  footerLinkContact: string;

  seoTitle: string;
  seoDescription: string;
}

export const PAGE_CHROME_EDITORIAL_POLICY: Record<
  string,
  PageChromeEditorialPolicy
> = {
  "en-US": {
    breadcrumbHome: "Unlock SaaS",
    breadcrumbEditorial: "Editorial Policy",
    pageLabel: "Editorial Policy",
    headline: "How we source, date, sign, and correct every public claim.",
    lede:
      "Unlock SaaS publishes opinions and comparisons of real products. This page is the standard those publications hold themselves to, written by the person who writes them.",
    publishedLabel: "Published",
    reviewedLabel: "Last reviewed",

    section1Heading: "1. Who writes this site",
    section1P1:
      "One person. Maryan, the founder. There is no anonymous editorial board, no contractor pool, no ghost-written posts. Every parable, every funnel teardown, every pricing teardown, every comparison, every category roundup is the work of the named human in the footer.",
    section1P2:
      "If a future contributor publishes here, they will be bylined on the piece, named here, and added to the Person schema graph. No unsigned editorial. Ever.",

    section2Heading: "2. How claims get sourced",
    section2Items: [
      {
        label: "Funnel teardowns + pricing teardowns + comparisons",
        body: "are written from a live read of the competitor's public page on the dated lastVerified shown at the bottom of every detail page. No second-hand summaries, no ChatGPT-paraphrased reviews, no quoted copy.",
      },
      {
        label: "FAQ entries",
        body: "are verbatim objections sourced from real Indie Hackers and Hacker News threads. The thread links are not surfaced publicly to avoid driving traffic to individual users who did not consent to being quoted; they are retained in the project repository for audit.",
      },
      {
        label: "Parables and stories",
        body: "are the founder's own experience. When a parable references a third-party product or person, the reference is on the public record.",
      },
      {
        label: "Statistics and dollar figures",
        body: "only appear when they are about Unlock SaaS itself and verifiable inside our own Stripe account. No third-party statistics from a report we did not read end-to-end.",
      },
    ],

    section3Heading: "3. Datelines",
    section3P1:
      "Every published-once-and-left-alone article carries a hard published date (the article's datePublished in schema and the human-readable footer date). It does not silently move forward when the page is redeployed. If the article changes materially, the change is logged in the corrections section below and the dateModified field updates separately.",
    section3P2:
      "Programmatic SEO surfaces (funnel teardowns, pricing teardowns, comparisons, category roundups) carry a separate lastVerified ISO date on the page itself, declaring when the live competitor surface was last read.",

    section4Heading: "4. Financial and editorial disclosures",
    section4Items: [
      {
        label: "Affiliate links:",
        body: "none. No comparison page, teardown page, or parable contains a paid affiliate link to any competitor named. Linking out is free. If this ever changes, every page that contains an affiliate link will carry a per-link disclosure and this section will be updated.",
      },
      {
        label: "Paid placements:",
        body: "none. No competitor has paid to be included in or excluded from any teardown, comparison, or category roundup. The list of products analyzed is the operator's editorial judgement of what the canonical audience already evaluates.",
      },
      {
        label: "Sponsored content:",
        body: "none. The site has not published a single sponsored post. If that changes, every sponsored piece will be labeled in the first line of the article and excluded from the schema.org/Article graph.",
      },
      {
        label: "Ownership and funding:",
        body: "Unlock SaaS is fully owned and self-funded by the named founder. No outside investors. No grants. Revenue comes from product sales (currently $1 Starter and $49/mo Playbook).",
      },
      {
        label: "Customer relationships:",
        body: "the operator has not been compensated by any competitor named on this site. If a future customer of Unlock SaaS is also named in a teardown or comparison, that relationship will be disclosed on the relevant page.",
      },
    ],

    section5Heading: "5. Corrections workflow",
    section5Intro: "If a claim on this site is wrong:",
    section5Items: [
      "Email maryan@unlocksaas.com with the URL, the claim, and the correction.",
      "The operator confirms or rejects the correction within 7 days. Confirmations are not gated on the reporter being a representative of the affected entity; the standard is whether the claim is wrong, not who is reporting it.",
      "Confirmed corrections are logged below with date, URL, the old claim, the corrected claim, and the source. The page itself is updated and the dateModified field is bumped.",
      "Rejected corrections receive a reply explaining why and what evidence would change the answer. No silence.",
    ],

    section6Heading: "6. Corrections log",
    section6Intro:
      "Reverse-chronological. Every confirmed correction since the site launched. Empty does not mean nothing has ever been wrong; it means nothing has been reported and confirmed yet.",
    section6EmptyState:
      "No corrections logged yet. If you find a wrong claim, the workflow above is how it lands here.",

    footerSigPre: "Editorial policy · signed",
    footerSigPost: ", founder, Unlock SaaS.",
    footerSeeAlso: "See also:",
    footerLinkAbout: "About the operator",
    footerLinkPress: "Press",
    footerLinkContact: "Contact",

    seoTitle: "Editorial Policy",
    seoDescription:
      "How Unlock SaaS sources, dates, signs, and corrects every public claim. Editorial standards, financial disclosures, and the running corrections log.",
  },
} as const;

export function getEditorialPolicyChrome(
  locale: Locale,
): PageChromeEditorialPolicy {
  return (
    PAGE_CHROME_EDITORIAL_POLICY[locale] ??
    PAGE_CHROME_EDITORIAL_POLICY["en-US"]
  ) as PageChromeEditorialPolicy;
}

/**
 * Per-locale page chrome strings for /glossary (hub + detail).
 *
 * Brand-glossary rules from glossary.es.ts / glossary.pt-br.ts apply.
 * Display names of glossary terms (Hook, Story, Offer, Big Domino,
 * Reluctant Hero, Stack Slide, etc.) stay English – they are Brunson
 * canonical proper nouns; localized prose surrounds them.
 */
export interface PageChromeGlossary {
  hubSeoTitle: string;
  hubSeoDescription: string;
  hubBreadcrumbHome: string;
  hubBreadcrumbGlossary: string;
  hubLabel: string;
  hubHeadline: string;
  hubLede: string;
  hubLastVerifiedLabel: string;
  hubCategoryLabel: (layer: string) => string;
  hubReadMoreLabel: string;
  detailSeoTitleSuffix: string;
  detailBreadcrumbGlossary: string;
  detailLabelPrefix: string;
  detailShortDefinitionLabel: string;
  detailLongDefinitionHeading: string;
  detailWhyItMattersHeading: string;
  detailHowToApplyHeading: string;
  detailExampleHeading: string;
  detailCommonConfusionsHeading: string;
  detailAppearsInHeading: string;
  detailRelatedTermsHeading: string;
  detailFaqHeading: (term: string) => string;
  detailVerifiedLabel: string;
  detailEditorialPolicyLabel: string;
  detailCtaHeading: (term: string) => string;
  detailCtaBody: string;
  detailCtaPrimary: string;
  detailCtaSecondary: string;
  detailHonestyFooter: string;
  pendingReviewBannerTitle: string;
  pendingReviewBannerBody: string;
}

export const PAGE_CHROME_GLOSSARY: Partial<Record<Locale, PageChromeGlossary>> = {
  "en-US": {
    hubSeoTitle: "Glossary – 16 Brunson Terms for Indie SaaS Founders",
    hubSeoDescription:
      "Plain-English Brunson glossary: Hook, Story, Offer, Big Domino, Reluctant Hero, Stack Slide, and 11 more terms post-launch pre-revenue founders need on their page.",
    hubBreadcrumbHome: "Home",
    hubBreadcrumbGlossary: "Glossary",
    hubLabel: "Glossary",
    hubHeadline:
      "The 16 Brunson terms an indie SaaS page lives or dies on.",
    hubLede:
      "Every term below is the founder's own working definition, the worked example from a shipped surface, the common confusions, and a link to where the term shows up on the live product.",
    hubLastVerifiedLabel: "Last verified",
    hubCategoryLabel: (layer) => `${layer} layer`,
    hubReadMoreLabel: "Read the full entry →",
    detailSeoTitleSuffix: "– Definition for Indie SaaS Founders",
    detailBreadcrumbGlossary: "Glossary",
    detailLabelPrefix: "Glossary ·",
    detailShortDefinitionLabel: "Short definition",
    detailLongDefinitionHeading: "What it actually means",
    detailWhyItMattersHeading:
      "Why it matters for a post-launch pre-revenue founder",
    detailHowToApplyHeading: "How to apply it on your page",
    detailExampleHeading: "Example",
    detailCommonConfusionsHeading: "Often confused with",
    detailAppearsInHeading: "Where this term is applied on the site",
    detailRelatedTermsHeading: "Related terms",
    detailFaqHeading: (term) => `Questions founders ask about ${term}`,
    detailVerifiedLabel: "Verified",
    detailEditorialPolicyLabel: "editorial policy",
    detailCtaHeading: (term) => `See ${term} applied to your page`,
    detailCtaBody:
      "The free 90-second diagnostic applies the Hook / Story / Offer framework to your live product page and labels what is broken: Wrong Person, Weak Offer, or Weak Belief.",
    detailCtaPrimary: "Get the free diagnostic",
    detailCtaSecondary: "Back to the glossary",
    detailHonestyFooter:
      "Every definition on this page is in the founder's own words and appears on a shipped surface. Russell Brunson's frameworks are the underlying source. If anything reads off, email maryan@unlocksaas.com and the entry gets a corrections-log row in /editorial-policy.",
    pendingReviewBannerTitle: "Pending review – not indexed yet",
    pendingReviewBannerBody:
      "Translation is in review. The page renders but is noindex; sitemap omits it; no hreflang alternate is advertised.",
  },
} as const;

export function getGlossaryChrome(locale: Locale): PageChromeGlossary {
  return (PAGE_CHROME_GLOSSARY[locale] ?? PAGE_CHROME_GLOSSARY["en-US"] as any) as any;
}

/**
 * Per-locale page chrome strings for /benchmarks (hub + detail).
 *
 * Band labels (Underperforming, Typical range, Outperforming) stay
 * verbatim in the data as TypeScript discriminated union literals; the
 * chrome here provides the localized DISPLAY labels for those bands.
 */
export interface PageChromeBenchmarks {
  hubSeoTitle: string;
  hubSeoDescription: string;
  hubBreadcrumbHome: string;
  hubBreadcrumbBenchmarks: string;
  hubLabel: string;
  hubHeadline: string;
  hubLede: string;
  hubLastVerifiedLabel: string;
  hubReadMoreLabel: string;
  detailBreadcrumbBenchmarks: string;
  detailLabel: string;
  detailDirectAnswerLabel: string;
  detailBandsHeading: string;
  detailDriversHeading: string;
  detailMisreadingsHeading: string;
  detailFaqHeading: string;
  detailSourceHeading: string;
  detailVerifiedLabel: string;
  detailEditorialPolicyLabel: string;
  detailCtaHeading: string;
  detailCtaBody: string;
  detailCtaPrimary: string;
  detailCtaSecondary: string;
  bandUnderperforming: string;
  bandTypicalRange: string;
  bandOutperforming: string;
  pendingReviewBannerTitle: string;
  pendingReviewBannerBody: string;
}

export const PAGE_CHROME_BENCHMARKS: Partial<Record<Locale, PageChromeBenchmarks>> = {
  "en-US": {
    hubSeoTitle: "Indie SaaS Benchmarks – Directional Ranges for 20 Metrics",
    hubSeoDescription:
      "Directional ranges for 20 indie SaaS funnel metrics: landing page conversion, checkout completion, email open rate, churn, LTV, CAC, MRR growth, refund rate, and more.",
    hubBreadcrumbHome: "Home",
    hubBreadcrumbBenchmarks: "Benchmarks",
    hubLabel: "Benchmarks",
    hubHeadline: "Directional ranges for 20 indie SaaS funnel metrics.",
    hubLede:
      "Every range below is sourced, dated, and labeled as directional – not as the universal industry average. The CTA on every page is the free diagnostic: paste your live URL and see where your page actually falls.",
    hubLastVerifiedLabel: "Last verified",
    hubReadMoreLabel: "Read the full benchmark →",
    detailBreadcrumbBenchmarks: "Benchmarks",
    detailLabel: "Benchmark",
    detailDirectAnswerLabel: "Direct answer",
    detailBandsHeading: "Where you fall",
    detailDriversHeading: "What drives this metric (in order)",
    detailMisreadingsHeading: "Common misreadings",
    detailFaqHeading: "Questions founders ask",
    detailSourceHeading: "Source attribution",
    detailVerifiedLabel: "Verified",
    detailEditorialPolicyLabel: "editorial policy",
    detailCtaHeading: "See where your page falls on this metric",
    detailCtaBody:
      "The free 90-second Launch Diagnostic applies the same triage to your actual page and tells you which band you're in plus what to fix first.",
    detailCtaPrimary: "Get the free diagnostic",
    detailCtaSecondary: "All benchmarks",
    bandUnderperforming: "Underperforming",
    bandTypicalRange: "Typical range",
    bandOutperforming: "Outperforming",
    pendingReviewBannerTitle: "Pending review – not indexed yet",
    pendingReviewBannerBody:
      "Translation is in review. The page renders but is noindex; sitemap omits it; no hreflang alternate is advertised.",
  },
} as const;

export function getBenchmarksChrome(locale: Locale): PageChromeBenchmarks {
  return (PAGE_CHROME_BENCHMARKS[locale] ?? PAGE_CHROME_BENCHMARKS["en-US"] as any) as any;
}

// ---------------------------------------------------------------------------
// pSEO cluster chrome – 8 large pSEO surfaces (alternatives-to, compare,
// category, funnel-teardown, pricing-teardown, answers, why-isnt-my, for).
// Re-exported from `./pseo-chrome.ts` to keep this file from ballooning.
// See header in pseo-chrome.ts for editorial standard + brand-glossary notes.
// ---------------------------------------------------------------------------
export {
  type PageChromePseoShared,
  type PageChromePseoCluster,
  type ClusterKey as PseoClusterKey,
  PAGE_CHROME_PSEO_SHARED,
  PAGE_CHROME_PSEO,
  getPseoSharedChrome,
  getPseoClusterChrome,
} from "./pseo-chrome";
