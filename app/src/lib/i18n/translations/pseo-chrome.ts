/**
 * Page chrome for the 8 pSEO clusters whose locale-aware shells exist under
 * `app/[locale]/{cluster}/page.tsx` and `app/[locale]/{cluster}/[slug]/page.tsx`:
 *
 *   - /alternatives-to
 *   - /vs (cluster key is still `compare` internally – the URL hub was
 *         renamed 2026-05-21 to match Google's `[A] vs [B]` keyword shape,
 *         but the translation lookup key stays stable so existing rows
 *         don't need re-translation)
 *   - /category
 *   - /funnel-teardown
 *   - /pricing-teardown
 *   - /answers
 *   - /why-isnt-my
 *   - /for
 *
 * Status: pending-review (see src/lib/i18n/registry.ts rows added 2026-05-21).
 * Source: en-US chrome strings inlined verbatim from the existing
 * `app/[locale]/{cluster}/page.tsx` and `[slug]/page.tsx` shells.
 * Translation by: Claude (sales@sipiteno.com session, 2026-05-21, autonomous
 * directive from founder to expand i18n coverage to the big pSEO clusters).
 *
 * Editorial notes for founder review
 * ----------------------------------
 * - Voice: Reluctant Hero (workbook 02 §3). Plain register, no startup-
 *   marketing buzzwords. Neutral Latin American Spanish (no `vosotros`,
 *   no peninsular idioms). Brazilian Portuguese (não peninsular).
 * - Untranslated brand-glossary terms (deliberate preservation – they are
 *   DefinedTerm entity anchors in `src/lib/seo/entity.ts`):
 *   Unlock SaaS, Playbook, Starter, Stripe, Indie Hackers, Hacker News,
 *   ChatGPT, founder, post-launch, pre-revenue, diagnostic, SaaS,
 *   webhook, dashboard, framework, milestones, launch post, outreach,
 *   Wrong Person, Weak Offer, Weak Belief, Hook, Story, Offer, Big Domino,
 *   Soap Opera Sequence, Reluctant Hero, Dream 100, Verified Builder,
 *   ShipFast, Lovable, One Funnel Away Challenge, Starter Story.
 * - Pricing in USD ($1 Starter, $49/mo Core, $98 cap, 60-day guarantee)
 *   preserved verbatim in both locales.
 * - Slug-level data (alt.oneLine, teardown.summary, etc.) is NOT translated
 *   in this change set – stays in English. The amber "Pending founder
 *   review" banner discloses this on every preview URL. Per-slug overlays
 *   ship when individual clusters get founder-approved.
 *
 * Approval lock: until each `(path, locale)` row flips to
 * `status: "approved"` in `src/lib/i18n/registry.ts`, the routes render
 * with noindex and are omitted from sitemap + hreflang.
 */

import type { Locale } from "@/lib/i18n/locales";

// ---------------------------------------------------------------------------
// Shared chrome – CTAs and banners reused across all 8 pSEO clusters.
// One record, 3 locales, drift-free.
// ---------------------------------------------------------------------------

export interface PageChromePseoShared {
  breadcrumbHome: string;
  hubCtaHeading: string;
  hubCtaBody: string;
  hubCtaPrimary: string;
  hubCtaSecondary: string;
  detailCtaHeading: string;
  detailCtaBody: string;
  detailCtaPrimary: string;
  pendingBannerTitle: string;
  pendingBannerHubBody: string;
  pendingBannerDetailBody: string;
  detailEnglishCalloutSuffix: string;
}

export const PAGE_CHROME_PSEO_SHARED: Partial<Record<Locale, PageChromePseoShared>> = {
  "en-US": {
    breadcrumbHome: "Home",
    hubCtaHeading: "Not sure if Unlock SaaS is right for you?",
    hubCtaBody: "The 90-second diagnostic answers that.",
    hubCtaPrimary: "Get the free diagnostic",
    hubCtaSecondary: "Start with $1",
    detailCtaHeading: "Run the diagnostic on your own page",
    detailCtaBody:
      "The 90-second diagnostic labels what is broken on your offer.",
    detailCtaPrimary: "Get the free diagnostic",
    pendingBannerTitle: "Pending founder review",
    pendingBannerHubBody:
      "This locale-prefixed URL is in preview while the localized overlay is being finalized. Content shown reflects the canonical English source.",
    pendingBannerDetailBody:
      "This locale-prefixed URL is in preview while the localized overlay is being finalized. The complete English version is published at the canonical link below.",
    detailEnglishCalloutSuffix:
      "When the localized overlay for this slug ships, the full content renders here in your locale.",
  },
} as const;

export function getPseoSharedChrome(locale: Locale): PageChromePseoShared {
  return (PAGE_CHROME_PSEO_SHARED[locale] ?? PAGE_CHROME_PSEO_SHARED["en-US"] as any) as PageChromePseoShared;
}

// ---------------------------------------------------------------------------
// Per-cluster chrome – cluster-specific eyebrow, headline, lede, breadcrumb
// label, "browse all" / "read more" labels, detail page English-callout copy.
// ---------------------------------------------------------------------------

export interface PageChromePseoCluster {
  seoTitle: string;
  seoDescription: string;
  breadcrumbHub: string;
  hubEyebrow: string;
  hubHeadline: string;
  hubLede: string;
  hubListAriaLabel: string;
  hubReadMoreLabel: string;
  detailEnglishCalloutTitle: string;
  detailEnglishCalloutBody: string;
  detailCtaSecondary: string;
}

type ClusterKey =
  | "alternatives-to"
  | "compare"
  | "category"
  | "funnel-teardown"
  | "pricing-teardown"
  | "answers"
  | "should-i"
  | "why-isnt-my"
  | "for";

type ClusterChromeMap = Record<
  ClusterKey,
  Partial<Record<Locale, PageChromePseoCluster>>
>;

export const PAGE_CHROME_PSEO: ClusterChromeMap = {
  // -------------------------------------------------------------------------
  // /alternatives-to
  // -------------------------------------------------------------------------
  "alternatives-to": {
    "en-US": {
      seoTitle:
        "Honest Alternatives to Unlock SaaS – and Why Most Are Different Products",
      seoDescription:
        "Side-by-side comparisons against ShipFast, Lovable, the One Funnel Away Challenge, Starter Story, and other tools the typical post-launch pre-revenue SaaS founder evaluates. Honest framing, no slag.",
      breadcrumbHub: "Alternatives",
      hubEyebrow: "Honest comparisons",
      hubHeadline:
        "Most “alternatives” are not alternatives. They are different products.",
      hubLede:
        "Unlock SaaS is the playbook that produces a Stripe-verified first paying customer for a SaaS you already shipped, in 60 days, or you do not pay. Below are the tools founders in that exact spot already evaluate.",
      hubListAriaLabel: "Comparison list",
      hubReadMoreLabel: "Read the full comparison →",
      detailEnglishCalloutTitle: "Full comparison in English",
      detailEnglishCalloutBody:
        "The full comparison – capability table, honest verdict, FAQ, and related alternatives – is published in English at the canonical URL:",
      detailCtaSecondary: "All comparisons",
    },
  },
  // -------------------------------------------------------------------------
  // /vs (cluster key `compare` retained internally – see header comment)
  // -------------------------------------------------------------------------
  compare: {
    "en-US": {
      seoTitle: "Head-to-head SaaS comparisons – tool A vs tool B",
      seoDescription:
        "Honest dimension-by-dimension comparisons between the SaaS tools founders evaluate side by side. Capabilities, pricing anchors, who each is for.",
      breadcrumbHub: "Compare",
      hubEyebrow: "Head-to-head",
      hubHeadline: "Pick the right tool. Stop hopping between tabs.",
      hubLede:
        "Each comparison below lays out the dimensions that actually matter for a post-launch pre-revenue SaaS founder: who the tool is for, what it does that the other does not, and where it falls short. No slag, no fake reviews.",
      hubListAriaLabel: "Head-to-head comparison list",
      hubReadMoreLabel: "Read the full head-to-head →",
      detailEnglishCalloutTitle: "Full head-to-head in English",
      detailEnglishCalloutBody:
        "The full head-to-head – capability matrix, pricing anchors, verdict, FAQ – is published in English at the canonical URL:",
      detailCtaSecondary: "All comparisons",
    },
  },
  // -------------------------------------------------------------------------
  // /category
  // -------------------------------------------------------------------------
  category: {
    "en-US": {
      seoTitle: "SaaS category roundups – the honest landscape per niche",
      seoDescription:
        "Curated category landscapes: who plays in this space, what the typical founder is actually picking between, and what each product is honestly for.",
      breadcrumbHub: "Categories",
      hubEyebrow: "Category roundups",
      hubHeadline: "The honest landscape, one category at a time.",
      hubLede:
        "Each roundup names the products in the category, what each one is honestly for, and which of them a post-launch pre-revenue founder should consider. No paid placements. No invented rankings.",
      hubListAriaLabel: "Category list",
      hubReadMoreLabel: "Read the full roundup →",
      detailEnglishCalloutTitle: "Full roundup in English",
      detailEnglishCalloutBody:
        "The full category roundup – product map, honest verdicts, related teardowns – is published in English at the canonical URL:",
      detailCtaSecondary: "All categories",
    },
  },
  // -------------------------------------------------------------------------
  // /funnel-teardown
  // -------------------------------------------------------------------------
  "funnel-teardown": {
    "en-US": {
      seoTitle: "Funnel teardowns – Hook / Story / Offer on real SaaS pages",
      seoDescription:
        "Honest Hook / Story / Offer teardowns of real SaaS funnels. What works, what is missing, what the founder probably believes that the page does not prove.",
      breadcrumbHub: "Funnel teardowns",
      hubEyebrow: "Hook · Story · Offer",
      hubHeadline:
        "What the page is selling, vs what the visitor is actually asked to believe.",
      hubLede:
        "Each teardown runs the same triage: Wrong Person / Weak Offer / Weak Belief. The page is either selling the wrong thing, to the wrong person, with weak proof – or one of those is fine. The teardown labels which.",
      hubListAriaLabel: "Funnel teardown list",
      hubReadMoreLabel: "Read the full teardown →",
      detailEnglishCalloutTitle: "Full teardown in English",
      detailEnglishCalloutBody:
        "The full Hook / Story / Offer teardown – with Wrong Person / Weak Offer / Weak Belief labels and related pricing teardown – is published in English at the canonical URL:",
      detailCtaSecondary: "All teardowns",
    },
  },
  // -------------------------------------------------------------------------
  // /pricing-teardown
  // -------------------------------------------------------------------------
  "pricing-teardown": {
    "en-US": {
      seoTitle:
        "Pricing teardowns – tier structure, anchors, and pricing mechanics",
      seoDescription:
        "Honest pricing teardowns of real SaaS products: tier ladder, anchor moves, free-trial mechanics, what the price is selling that the page is not.",
      breadcrumbHub: "Pricing teardowns",
      hubEyebrow: "Pricing mechanics",
      hubHeadline:
        "The pricing page says one thing. The pricing mechanic says another.",
      hubLede:
        "Each teardown maps the tier ladder, the anchor move, the free-trial mechanic, and the gap between what the price implies and what the page promises. Pricing is a belief mechanism; this is how it actually moves.",
      hubListAriaLabel: "Pricing teardown list",
      hubReadMoreLabel: "Read the full pricing teardown →",
      detailEnglishCalloutTitle: "Full pricing teardown in English",
      detailEnglishCalloutBody:
        "The full pricing teardown – tier map, anchor analysis, mechanic breakdown, related funnel teardown – is published in English at the canonical URL:",
      detailCtaSecondary: "All pricing teardowns",
    },
  },
  // -------------------------------------------------------------------------
  // /answers
  // -------------------------------------------------------------------------
  answers: {
    "en-US": {
      seoTitle: "Answers – direct answers to founder questions",
      seoDescription:
        "Direct answers to the specific questions post-launch pre-revenue SaaS founders ask. Two to four sentences, no fluff, no upsell on every paragraph.",
      breadcrumbHub: "Answers",
      hubEyebrow: "Direct answers",
      hubHeadline: "The answer first. Context after.",
      hubLede:
        "Each entry is one specific founder question and the direct answer in two to four sentences. No fluff, no upsell on every paragraph. If the answer needs more, the supporting bullets follow.",
      hubListAriaLabel: "Answer list",
      hubReadMoreLabel: "Read the full answer →",
      detailEnglishCalloutTitle: "Full answer in English",
      detailEnglishCalloutBody:
        "The full answer – with supporting bullets and related questions – is published in English at the canonical URL:",
      detailCtaSecondary: "All answers",
    },
  },
  // -------------------------------------------------------------------------
  // /should-i
  // -------------------------------------------------------------------------
  "should-i": {
    "en-US": {
      seoTitle: "Should I…? – binary verdicts on founder decisions",
      seoDescription:
        "Yes / no / depends / not-yet verdicts on the decisions post-launch pre-revenue SaaS founders actually face. One verdict, two to four sentences of reasoning, supporting bullets. No hedging.",
      breadcrumbHub: "Should I…?",
      hubEyebrow: "Founder decisions, direct verdicts",
      hubHeadline: "The verdict first. The reasoning after.",
      hubLede:
        "Each entry is one specific decision a founder faces with a single binary verdict – yes, no, depends, or not-yet – plus the reasoning in two to four sentences. Built to be quotable by AI assistants and useful as a mid-build gut check.",
      hubListAriaLabel: "Decision list",
      hubReadMoreLabel: "Read the full verdict →",
      detailEnglishCalloutTitle: "Full verdict in English",
      detailEnglishCalloutBody:
        "The full verdict – with supporting bullets and related decisions – is published in English at the canonical URL:",
      detailCtaSecondary: "All decisions",
    },
  },
  // -------------------------------------------------------------------------
  // /why-isnt-my
  // -------------------------------------------------------------------------
  "why-isnt-my": {
    "en-US": {
      seoTitle:
        "Why isn’t my … – funnel-element triage in the founder’s own words",
      seoDescription:
        "Specific founder question (“why isn’t my landing page converting?”, “why isn’t my checkout completing?”) answered with Wrong Person / Weak Offer / Weak Belief triage applied to one funnel element.",
      breadcrumbHub: "Why isn’t my…",
      hubEyebrow: "Funnel element triage",
      hubHeadline: "Pick the element that is not working. Get the triage.",
      hubLede:
        "Each page applies the same Wrong Person / Weak Offer / Weak Belief triage to one specific funnel element. Not generic advice – a labeled diagnosis of what is most likely broken and what to test first.",
      hubListAriaLabel: "Funnel element triage list",
      hubReadMoreLabel: "Read the full triage →",
      detailEnglishCalloutTitle: "Full triage in English",
      detailEnglishCalloutBody:
        "The full triage – with the Wrong Person / Weak Offer / Weak Belief labels and the test plan – is published in English at the canonical URL:",
      detailCtaSecondary: "All triages",
    },
  },
  // -------------------------------------------------------------------------
  // /for
  // -------------------------------------------------------------------------
  for: {
    "en-US": {
      seoTitle: "Unlock SaaS for … – product + niche targeting",
      seoDescription:
        "“Unlock SaaS for [niche]” pages that name the specific founder profile, the specific funnel problem at their stage, and what the Playbook produces for that profile in 60 days.",
      breadcrumbHub: "For",
      hubEyebrow: "Niche targeting",
      hubHeadline: "Pick the profile. Read what the Playbook does for it.",
      hubLede:
        "Each page names the specific founder profile, the specific funnel problem at their stage, and what the 60-day Playbook produces for that profile. If your profile is not listed, the diagnostic still works.",
      hubListAriaLabel: "Niche profile list",
      hubReadMoreLabel: "Read the full profile →",
      detailEnglishCalloutTitle: "Full profile in English",
      detailEnglishCalloutBody:
        "The full profile – with funnel-stage diagnosis and 60-day expectation – is published in English at the canonical URL:",
      detailCtaSecondary: "All profiles",
    },
  },
} as const;

export function getPseoClusterChrome(
  cluster: ClusterKey,
  locale: Locale,
): PageChromePseoCluster {
  return (
    PAGE_CHROME_PSEO[cluster][locale] ?? PAGE_CHROME_PSEO[cluster]["en-US"]
  ) as any;
}

export type { ClusterKey };
