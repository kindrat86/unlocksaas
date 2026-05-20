import type { MetadataRoute } from "next";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";
import { PRESS_TOPIC_SLUGS } from "@/lib/press-topics";
import { GLOSSARY_SLUGS } from "@/lib/glossary";
import { WHY_ISNT_MY_SLUGS } from "@/lib/why-isnt-my";
import { NICHE_SLUGS } from "@/lib/niches";
import { BENCHMARK_SLUGS } from "@/lib/benchmarks";
import { FUNNEL_PLAYBOOK_SLUGS } from "@/lib/funnel-playbooks";
import { ANSWER_SLUGS } from "@/lib/answers";
import {
  allApprovedTranslations,
  approvedLocalesForPath,
} from "@/lib/i18n/registry";
import { localizedPath } from "@/lib/i18n/locales";

/**
 * Sitemap for UnlockSaaS — Surface A of the Google strategy.
 *
 * Source: strategy/google-strategy.md §A.4. Lists only the public marketing
 * routes that should be indexable. Private surfaces (the member area, the
 * diagnostic result page that exposes per-user data, the per-builder OG
 * pages, the login flow, the entire API) are excluded by omission AND
 * confirmed non-indexable via per-page `robots: { index: false }` metadata.
 *
 * `lastModified` is set to the build time, which is fine for static
 * marketing pages — the actual content changes are infrequent and a
 * build is the right cadence for "this page was updated."
 *
 * Programmatic surface (added 2026-05-17): /alternatives-to (hub) and each
 * /alternatives-to/[slug] page are generated from src/lib/alternatives.ts.
 * Adding a new entry to that catalog auto-extends this sitemap on the next
 * build. The pages are honest named-competitor comparisons, not invented
 * keyword bait — every slug corresponds to a real product the canonical
 * audience already searches for.
 *
 * Brunson Hard-Rule reconciliation: every URL listed here passes the
 * "would the SEO-addicted version of the founder approve" check from
 * strategy/google-strategy.md §AC-flaw reconciliation. They are the same
 * pages that already convert organically; we are not inventing keyword
 * landing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://unlocksaas.com";
  const now = new Date();

  /**
   * Image sitemap helper – returns the best OG image URL for a path.
   *
   * Next.js file-based metadata convention (app/<route>/opengraph-image.tsx)
   * auto-generates a PNG route at `<base>/<route>/opengraph-image`. The
   * MetadataRoute.Sitemap `images?: string[]` field on each entry then
   * emits `<image:image><image:loc>…</image:loc></image:image>` blocks
   * per Google's image sitemap spec, which lifts Google Images discovery
   * (audit gap: 2026-05-20 SEO/pSEO audit, "no image sitemap").
   *
   * Routes WITH a dedicated opengraph-image.tsx serve that route's own
   * card; routes WITHOUT one inherit the root card via Next.js's nearest-
   * ancestor resolution, but the dedicated URL only exists when the file
   * exists – so for non-dedicated routes we must point image:loc at the
   * root `/opengraph-image` instead of fabricating a per-path URL that
   * would 404.
   *
   * Keep this list in sync with the on-disk inventory of
   * `opengraph-image.tsx` files. Adding a new dedicated card = add the
   * matching pattern below in the same commit.
   *
   * Per-locale dedicated cards under `/{locale}/{path}/opengraph-image`
   * (added 2026-05-20 for /faq, /contact, /repeatable, /editorial-policy
   * × es, pt-BR) are wired in the approvedTranslations block at the
   * bottom of the sitemap, not here – this helper handles canonical
   * (en-US) routes only.
   */
  const DEDICATED_OG_HUBS: ReadonlySet<string> = new Set([
    "/glossary",
    "/dont-buy-unlock-saas",
  ]);
  const DEDICATED_OG_DETAIL_PATTERNS: ReadonlyArray<RegExp> = [
    /^\/alternatives-to\/[^/]+$/,
    /^\/compare\/[^/]+$/,
    /^\/glossary\/[^/]+$/,
    /^\/funnel-teardown\/[^/]+$/,
    /^\/pricing-teardown\/[^/]+$/,
    /^\/press\/topics\/[^/]+$/,
    // /builder/[slug] + /diagnosis/[id] also carry dedicated cards but
    // they are NOT sitemap-listed (Verified Builder backlink farm
    // discovery via inbound links only; diagnosis pages are per-user
    // and noindex). Patterns omitted from this list intentionally.
  ];
  const rootOg = `${base}/opengraph-image`;
  const ogImageFor = (urlPath: string): string => {
    if (urlPath === "/") return rootOg;
    if (DEDICATED_OG_HUBS.has(urlPath)) {
      return `${base}${urlPath}/opengraph-image`;
    }
    if (DEDICATED_OG_DETAIL_PATTERNS.some((re) => re.test(urlPath))) {
      return `${base}${urlPath}/opengraph-image`;
    }
    return rootOg;
  };

  /**
   * Per-URL hreflang map, READ FROM THE TRANSLATION REGISTRY.
   *
   * Brunson Hard-Rule (no fabricated claims) requires that hreflang
   * alternates only resolve to approved translations. The registry at
   * src/lib/i18n/registry.ts is the single source of truth.
   *
   * The helper always declares en-US + x-default, then adds one entry
   * per APPROVED translation of the same canonical path. Pending or
   * archived rows are silently skipped — they are not advertised.
   *
   * Honest-monolingual fallback: when no translation is approved, output
   * is byte-identical to the previous {"en-US": url, "x-default": url} map.
   */
  /**
   * Hubs whose approval applies to every detail slug under them. Detail
   * paths (`/glossary/big-domino`, `/benchmarks/saas-churn-rate`, …)
   * have no exact registry row; the founder approved the hub once and
   * the underlying translation file (glossary.es.ts, benchmarks.es.ts)
   * carries every slug. Keep this list aligned with the constant of
   * the same intent in src/lib/seo/markdown-alternates.ts so the
   * sitemap hreflang map matches the canonical-page hreflang map.
   */
  const HUBS_WITH_DETAIL_LOCALE_INHERITANCE: readonly string[] = [
    "/glossary",
    "/benchmarks",
  ];
  /**
   * Hubs whose approved-locale detail slugs ship dedicated per-locale
   * per-slug OG cards under `app/src/app/[locale]/<hub>/[slug]/opengraph-image.tsx`.
   *
   * Keep this set in lockstep with the on-disk inventory of locale
   * opengraph-image.tsx routes. Adding a new (hub, locale) approval
   * pair to the translation registry does NOT automatically extend
   * this set — the matching route file must be shipped first. Listing
   * a hub here without the route would emit `image:loc` URLs in the
   * sitemap that 404, demoting Google Images discovery for the rest of
   * the batch.
   *
   * Activation log: 2026-05-20 audit fix #16 closed the per-locale
   * per-slug card gap for the two highest-AEO-intent approved-locale
   * subtrees (/es/glossary, /pt-BR/glossary, /es/benchmarks,
   * /pt-BR/benchmarks). Canonical (en-US) /benchmarks/[slug] does
   * NOT yet ship its own dedicated card and is tracked separately —
   * the post-pass at the bottom of this file routes en-US benchmark
   * detail rows through DEDICATED_OG_DETAIL_PATTERNS, which omits
   * /benchmarks until a card exists.
   */
  const HUBS_WITH_PER_LOCALE_DETAIL_OG: ReadonlySet<string> = new Set([
    "/glossary",
    "/benchmarks",
  ]);
  const localesForPath = (path: string) => {
    const exact = approvedLocalesForPath(path);
    if (exact.length > 0) return exact;
    for (const hub of HUBS_WITH_DETAIL_LOCALE_INHERITANCE) {
      if (path.startsWith(`${hub}/`)) {
        return approvedLocalesForPath(hub);
      }
    }
    return exact;
  };

  const hreflang = (absUrl: string) => {
    const path = absUrl.startsWith(base)
      ? absUrl.slice(base.length) || "/"
      : absUrl;
    const languages: Record<string, string> = {
      "en-US": absUrl,
      "x-default": absUrl,
    };
    for (const locale of localesForPath(path)) {
      languages[locale] = `${base}${localizedPath(path, locale)}`;
    }
    return { languages };
  };

  const entries: MetadataRoute.Sitemap = [
    // Funnel Hub — highest priority, brand-canonical entry point.
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: hreflang(`${base}/`),
    },
    // Pain-mirror long-tail squeeze. Conversion event.
    {
      url: `${base}/diagnostic`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
      alternates: hreflang(`${base}/diagnostic`),
    },
    // Reverse-squeeze long-form. Cold reader on Google long-tail lands here.
    {
      url: `${base}/stories`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/stories`),
    },
    // $1 Starter sales page. Solution-aware comparator.
    {
      url: `${base}/starter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/starter`),
    },
    // Long-form $49 Playbook sales page. Product-aware decision page.
    {
      url: `${base}/playbook-sales`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/playbook-sales`),
    },
    // Founding-Cohort PLF landing — state-dependent; while waitlist is open or
    // cart is open, this is a high-priority page. After cart-close it 404s or
    // redirects (per strategy/founding-plv-scripts.md), at which point this
    // entry should be removed by the cron task that flips the page state.
    {
      url: `${base}/founding`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: hreflang(`${base}/founding`),
    },
    // Cold-traffic bridge. Lands between Google paid problem-aware ads and
    // the diagnostic, but also indexable for problem-aware long-tail.
    {
      url: `${base}/bridge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/bridge`),
    },
    // 14-Day First-Customer Sprint challenge funnel surface.
    {
      url: `${base}/challenge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/challenge`),
    },
    // Rung-2 Repeatable Revenue surface (already index:true per its metadata).
    {
      url: `${base}/repeatable`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/repeatable`),
    },
    // Standalone FAQ surface — AEO anchor page. Always-visible Q&A, sourced
    // verbatim from strategy/dollar-objections.md via src/lib/faq-data.ts.
    // Shares FAQ_ENTRIES with the sales-page accordion so schema and rendered
    // text never diverge. Featured-snippet and PAA target for objection-style
    // queries ("is unlock saas worth it", "$49 saas tool refund", etc.).
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/faq`),
    },
    // Glossary entry deferred to pSEO block #6 below, which lists the hub
    // and 16 detail-page slugs together. PR #32 originally inserted a hub-
    // only entry here; PR #33 extended it with the [slug] detail pages, so
    // both URLs ship from the same block at the bottom of the file.
    // ---------------------------------------------------------------------
    // Programmatic SEO block — honest named-competitor comparisons.
    // Data source: src/lib/alternatives.ts. Adding a new alternative there
    // auto-extends this block on the next build.
    // ---------------------------------------------------------------------
    // Hub page listing every comparison. Crawl entry for the pSEO block.
    {
      url: `${base}/alternatives-to`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/alternatives-to`),
    },
    // Per-alternative detail pages. Each is a static, Article+FAQPage+
    // BreadcrumbList-schema'd comparison of Unlock SaaS vs the named product.
    ...ALTERNATIVE_SLUGS.map((slug) => ({
      url: `${base}/alternatives-to/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/alternatives-to/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #2 — funnel teardowns of indie SaaS.
    // Data source: src/lib/funnel-teardowns.ts. Adding a new teardown
    // there auto-extends this block on the next build. Each detail page
    // is Article + FAQPage + BreadcrumbList schema'd. The hub uses
    // CollectionPage schema.
    // ---------------------------------------------------------------------
    {
      url: `${base}/funnel-teardown`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/funnel-teardown`),
    },
    ...TEARDOWN_SLUGS.map((slug) => ({
      url: `${base}/funnel-teardown/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/funnel-teardown/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #3 — pricing teardowns of indie SaaS.
    // Data source: src/lib/pricing-teardowns.ts. Same pattern as
    // funnel-teardown: Article + FAQPage + BreadcrumbList JSON-LD per
    // detail page, CollectionPage on the hub. Companies that appear in
    // both manifests get bidirectional cross-link callouts on each page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/pricing-teardown`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/pricing-teardown`),
    },
    ...PRICING_TEARDOWN_SLUGS.map((slug) => ({
      url: `${base}/pricing-teardown/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/pricing-teardown/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #4 — head-to-head comparisons.
    // Data source: src/lib/comparisons.ts. Highest-intent SaaS-research
    // search class: "[A] vs [B]". Article + FAQPage + BreadcrumbList
    // JSON-LD per detail page. CollectionPage on the hub.
    // ---------------------------------------------------------------------
    {
      url: `${base}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/compare`),
    },
    ...COMPARISON_SLUGS.map((slug) => ({
      url: `${base}/compare/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/compare/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #5 — category roundup pages.
    // Data source: src/lib/categories.ts. Each canonical category bucket
    // aggregates products and comparisons across all underlying manifests.
    // Pure data reuse — adding entries to the underlying manifests extends
    // the matching category page automatically on next build.
    // ---------------------------------------------------------------------
    {
      url: `${base}/category`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/category`),
    },
    ...CATEGORY_SLUGS.map((slug) => ({
      url: `${base}/category/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/category/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #6 — Brunson glossary.
    // Data source: src/lib/glossary.ts. Pure definitional intent: targets
    // "what is X" / "X meaning" / "how do I use X" queries that LLMs and
    // Google AI Overviews aggressively cite. DefinedTerm + Article +
    // FAQPage + BreadcrumbList JSON-LD per detail page; CollectionPage +
    // DefinedTermSet + Dataset on the hub. Short definitions are read
    // from entity.DEFINED_TERMS at module load so the schema graph on `/`
    // and the glossary surface share one source of truth.
    // ---------------------------------------------------------------------
    {
      url: `${base}/glossary`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/glossary`),
    },
    ...GLOSSARY_SLUGS.map((slug) => ({
      url: `${base}/glossary/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/glossary/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #7 — panic-mode element diagnostics.
    // Data source: src/lib/why-isnt-my.ts. Targets "why isn't my X
    // converting" – the highest commercial intent search the ICP makes.
    // Article + FAQPage + BreadcrumbList JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/why-isnt-my`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: hreflang(`${base}/why-isnt-my`),
    },
    ...WHY_ISNT_MY_SLUGS.map((slug) => ({
      url: `${base}/why-isnt-my/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: hreflang(`${base}/why-isnt-my/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #8 — niche / cohort pages.
    // Data source: src/lib/niches.ts. Targets "[product] for [niche]"
    // and identity-shaped searches. Article + FAQPage + BreadcrumbList
    // JSON-LD per detail page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/for`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/for`),
    },
    ...NICHE_SLUGS.map((slug) => ({
      url: `${base}/for/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/for/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #9 — directional metric benchmarks (AEO).
    // Data source: src/lib/benchmarks.ts. Pure AEO play: each page
    // answers "what is a good X" with a cited directional range and
    // band breakdown. Article + FAQPage + BreadcrumbList JSON-LD.
    // ---------------------------------------------------------------------
    {
      url: `${base}/benchmarks`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/benchmarks`),
    },
    ...BENCHMARK_SLUGS.map((slug) => ({
      url: `${base}/benchmarks/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/benchmarks/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #10 — Brunson funnel playbooks.
    // Data source: src/lib/funnel-playbooks.ts. Targets action-intent
    // build queries ("tripwire playbook", "perfect webinar structure").
    // Article + HowTo + FAQPage + BreadcrumbList JSON-LD per detail.
    // ---------------------------------------------------------------------
    {
      url: `${base}/funnel-playbook`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/funnel-playbook`),
    },
    ...FUNNEL_PLAYBOOK_SLUGS.map((slug) => ({
      url: `${base}/funnel-playbook/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/funnel-playbook/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // Programmatic SEO block #11 — direct-answer AEO pages.
    // Data source: src/lib/answers.ts. Pure citation-bait: each page
    // is a single founder-question with a 2-4 sentence direct answer
    // plus supporting bullets. QAPage + Article + BreadcrumbList JSON-LD.
    // ---------------------------------------------------------------------
    {
      url: `${base}/answers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: hreflang(`${base}/answers`),
    },
    ...ANSWER_SLUGS.map((slug) => ({
      url: `${base}/answers/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
      alternates: hreflang(`${base}/answers/${slug}`),
    })),
    // ---------------------------------------------------------------------
    // E-E-A-T trust columns. Low SERP priority on their own; high structural
    // weight: Google quality raters and LLM citation pipelines both look for
    // a real about / contact / legal surface before treating an entity as
    // credible. Linked from the global footer and from each other's
    // "Related" footnotes; BreadcrumbList JSON-LD on each page.
    // ---------------------------------------------------------------------
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: hreflang(`${base}/about`),
    },
    // Press / media kit. Off-page lift surface – built so journalists,
    // podcasters, and newsletter writers can self-serve canonical
    // descriptions, fast facts, and brand assets without having to
    // contact the founder. Honest empty state on "recent coverage"
    // until earned mentions land. Same Brunson Hard-Rule discipline
    // as /about and /faq.
    {
      url: `${base}/press`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: hreflang(`${base}/press`),
    },
    // ---------------------------------------------------------------------
    // Reverse press kit – pre-assembled story packages for journalists.
    // Off-page lift item #7 of the 2026-05-18 plan. Hub + per-topic detail
    // pages, each pre-built around a recognisable story angle with
    // thesis, founder quote, three data points, three counter-points,
    // fact sheet, embed code. Data source: src/lib/press-topics.ts.
    // Adding a new topic auto-extends this block on the next deploy.
    // ---------------------------------------------------------------------
    {
      url: `${base}/press/topics`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/press/topics`),
    },
    ...PRESS_TOPIC_SLUGS.map((slug) => ({
      url: `${base}/press/topics/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.45,
      alternates: hreflang(`${base}/press/topics/${slug}`),
    })),
    // Editorial policy + disclosures + corrections log. E-E-A-T Trust
    // uplift (2026-05-17). Google Search Quality Rater Guidelines §3.1
    // and §3.4 explicitly look for a stated editorial policy + a
    // corrections policy on sites that publish opinions or comparisons —
    // which UnlockSaaS does on every pSEO surface. Same crawl priority
    // as /about and /press: low standalone SERP value, high structural
    // signal weight. BreadcrumbList JSON-LD on the page itself.
    {
      url: `${base}/editorial-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: hreflang(`${base}/editorial-policy`),
    },
    // Polarity / anti-marketing page (2026-05-18 off-page uplift). The
    // disqualifier list is the highest-share-probability surface on the
    // site — honest-founder accounts on X / LinkedIn / Bluesky link to
    // pages that turn audience away. Doubles as a wrong-fit-customer
    // screen before checkout. See strategy/google-strategy.md §B.3.
    // Crawl priority is moderate (0.5) because the page is intended to
    // attract inbound links + AI citations, not to rank on its own.
    {
      url: `${base}/dont-buy-unlock-saas`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/dont-buy-unlock-saas`),
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: hreflang(`${base}/contact`),
    },
    // Verified Builder directory hub. The individual /builder/<slug>
    // pages aren't sitemap-listed (they're discovered via inbound links
    // from each founder's own embedded badge, which is the entire point
    // of the off-page lift strategy). The directory page IS listed so
    // crawlers can find the canonical list of verified builders and
    // follow internal links to each badge.
    //
    // E-E-A-T anchor: a directory of Stripe-verified outcomes is the
    // strongest trust signal pre-revenue SaaS can ship. Quality raters
    // look for exactly this surface on sites that publish "our customers"
    // claims (Google Search Quality Rater Guidelines §4.5).
    {
      url: `${base}/builders`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: hreflang(`${base}/builders`),
    },
    // Site-wide search — backed by app/(marketing)/search/page.tsx. Real
    // surface the WebSite SearchAction potentialAction points at.
    {
      url: `${base}/search`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.3,
      alternates: hreflang(`${base}/search`),
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: hreflang(`${base}/privacy`),
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: hreflang(`${base}/terms`),
    },
    // -------------------------------------------------------------------------
    // Public dataset (Surface C – linkable asset / off-page lift).
    //
    // /dataset is the landing page that markets the bundled, CC-BY-4.0
    // licensed Indie SaaS Teardowns Dataset. The two download URLs ship
    // versioned filenames inside Content-Disposition headers; listing
    // them here surfaces the artifacts to Google Dataset Search and to
    // every aggregator that walks sitemaps before crawling. Higher
    // priority than the llms.txt cluster because these are real,
    // citable, human-facing assets – not crawler bait.
    // -------------------------------------------------------------------------
    {
      url: `${base}/dataset`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: hreflang(`${base}/dataset`),
    },
    {
      url: `${base}/dataset/indie-saas-teardowns.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/dataset/indie-saas-teardowns.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // Per-table CSVs – same dataset, narrower slices with table-
    // specific columns. Lifted at priority 0.45 (just under the bundle
    // downloads) so Google Dataset Search counts them as distinct
    // distributions but ranks the bundle higher when a query matches
    // multiple. Auto-extension: when a new record type lands in
    // DATASET_PER_TABLE_CSV, add a sitemap entry here in the same
    // commit so the new distribution is crawler-discoverable on first
    // deploy.
    {
      url: `${base}/dataset/tables/funnel-teardowns.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/pricing-teardowns.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/comparisons.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/alternatives.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    {
      url: `${base}/dataset/tables/categories.csv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.45,
    },
    // Hugging Face Datasets submission surface (2026-05-20 off-page lift).
    // The page documents the operator submission flow + Google Dataset
    // Search verification, and the /raw sibling serves the exact
    // README.md the operator uploads to the HF dataset repo. Both URLs
    // are indexable, carry BreadcrumbList JSON-LD on the page form, and
    // resolve to a self-canonical Link header on the raw form.
    //
    // Why list both. /dataset/huggingface is the human-readable
    // canonical the catalog crawler should treat as the cross-listing
    // anchor. /dataset/huggingface/raw is the machine artifact – it
    // serves text/markdown with Content-Disposition: attachment so a
    // curl downloader saves it as README.md. Listing the raw URL in
    // the sitemap makes it crawler-discoverable without needing the
    // operator to advertise it from the HF Hub. Priorities mirror the
    // dataset cluster above (page slightly above the raw artifact).
    {
      url: `${base}/dataset/huggingface`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/dataset/huggingface/raw`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // -------------------------------------------------------------------------
    // LLM-readable surfaces (Surface B – GEO/AEO).
    // Three routes are public, indexable bodies that AI retrievers
    // (Perplexity, ClaudeBot, GPTBot/OAI-SearchBot, Google AI Overviews,
    // Gemini, You.com) treat as the canonical paraphrase target for the
    // site. /llms.txt is the curated markdown index; /llms-full.txt is
    // the concatenated corpus; /llms-feed.json is the machine-typed JSON
    // sibling for retrievers that prefer JSON over markdown (added
    // 2026-05-18 GEO uplift).
    //
    // llmstxt.org is well-known so /llms.txt discovery happens via
    // convention. The JSON sibling has no documented well-known path
    // yet, so the sitemap entry is the primary discovery anchor for it –
    // listing all three says "yes, these surfaces are intentional and
    // current." Low priority because they are not user-facing pages –
    // they are crawler bait – but lastModified ties their freshness to
    // the build.
    // -------------------------------------------------------------------------
    {
      url: `${base}/llms.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-full.txt`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${base}/llms-feed.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // -------------------------------------------------------------------------
    // Surface C – Agent retrieval (MCP server).
    //
    // /mcp is the human-readable install + tool-catalog page. The actual
    // MCP server lives at /api/mcp (excluded from the sitemap because the
    // robots policy disallows /api/*) but the discovery manifest at
    // /.well-known/mcp.json is listed here so registry crawlers (Vercel MCP
    // catalog, mcp.run, Smithery) can self-populate from a sitemap fetch.
    //
    // hreflang is intentionally omitted – the manifest is a machine schema,
    // not a translated surface.
    // -------------------------------------------------------------------------
    {
      url: `${base}/mcp`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
      alternates: hreflang(`${base}/mcp`),
    },
    {
      url: `${base}/.well-known/mcp.json`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // -------------------------------------------------------------------------
    // Approved locale translations (Surface A — International SEO).
    //
    // One entry per APPROVED (path, locale) pair from
    // src/lib/i18n/registry.ts. Pending or archived rows are silently
    // omitted — never advertised in the sitemap, never reachable via
    // hreflang return-tag. Brunson Hard-Rule reconciliation: an entry
    // here is a public claim that the translation is live, founder-
    // reviewed, and Brunson-voice-compliant. The registry's approval
    // workflow is the single gate; this block is a pure read.
    //
    // `lastModified` reads from the approvedAt timestamp so locale URLs
    // carry their own freshness signal, not the build time.
    //
    // Image sitemap (2026-05-20 uplift): four translated paths now ship
    // per-locale opengraph-image.tsx routes under app/src/app/[locale]/…
    // The image URL listed here is the route-derived URL of that
    // dedicated card – e.g. /es/faq → /es/faq/opengraph-image – which
    // gives Spanish / Brazilian-Portuguese threads a locale-correct
    // social preview AND a distinct entry in Google Images for the
    // translated surface. Paths without a per-locale card (none today;
    // this set is closed) fall back to the root /opengraph-image via
    // the post-processing pass below.
    // -------------------------------------------------------------------------
    ...allApprovedTranslations().map((row) => {
      const localised = `${base}${localizedPath(row.path, row.locale)}`;
      const canonical =
        row.path === "/" ? `${base}/` : `${base}${row.path}`;
      const PER_LOCALE_OG_PATHS: ReadonlySet<string> = new Set([
        "/faq",
        "/contact",
        "/repeatable",
        "/editorial-policy",
      ]);
      const ogUrl = PER_LOCALE_OG_PATHS.has(row.path)
        ? `${localised}/opengraph-image`
        : rootOg;
      return {
        url: localised,
        lastModified: row.approvedAt ? new Date(row.approvedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
        alternates: {
          languages: {
            "en-US": canonical,
            "x-default": canonical,
            ...Object.fromEntries(
              approvedLocalesForPath(row.path).map((loc) => [
                loc,
                `${base}${localizedPath(row.path, loc)}`,
              ]),
            ),
          },
        },
        images: [ogUrl],
      };
    }),

    // -------------------------------------------------------------------------
    // Approved locale DETAIL pages (hub→detail inheritance — see
    // HUBS_WITH_DETAIL_LOCALE_INHERITANCE above).
    //
    // The hub `/glossary` and `/benchmarks` registry rows authorise every
    // child slug under them in the same locale. Without this block, the
    // sitemap would list /es/glossary (the hub) but not /es/glossary/hook,
    // /es/glossary/big-domino, … (the 16 detail slugs × 2 locales = 32
    // missing URLs for glossary; +40 for benchmarks). Search Console
    // would also flag the canonical /glossary/big-domino's hreflang
    // alternate to /es/glossary/big-domino as a missing return-tag.
    //
    // For each (hub, locale) approval pair, fan out across the hub's slug
    // catalog. lastModified inherits the row's approvedAt so each detail
    // URL carries the locale freshness signal.
    //
    // OG image (2026-05-20 audit fix): paths in HUBS_WITH_PER_LOCALE_DETAIL_OG
    // ship dedicated per-locale per-slug cards under
    // app/src/app/[locale]/<hub>/[slug]/opengraph-image.tsx, so the
    // `images[]` entry points at that route-derived URL — e.g.
    // /es/glossary/big-domino → /es/glossary/big-domino/opengraph-image.
    // Hubs without per-slug locale cards fall back to the root card via
    // the post-processing pass at the bottom of this file.
    // -------------------------------------------------------------------------
    ...allApprovedTranslations().flatMap((row) => {
      let slugs: readonly string[] = [];
      if (row.path === "/glossary") slugs = GLOSSARY_SLUGS;
      if (row.path === "/benchmarks") slugs = BENCHMARK_SLUGS;
      if (slugs.length === 0) return [];
      const hubLocales = approvedLocalesForPath(row.path);
      const hasPerLocaleDetailOg =
        HUBS_WITH_PER_LOCALE_DETAIL_OG.has(row.path);
      return slugs.map((slug) => {
        const childPath = `${row.path}/${slug}`;
        const localised = `${base}${localizedPath(childPath, row.locale)}`;
        const canonicalUrl = `${base}${childPath}`;
        const ogUrl = hasPerLocaleDetailOg
          ? `${localised}/opengraph-image`
          : rootOg;
        return {
          url: localised,
          lastModified: row.approvedAt ? new Date(row.approvedAt) : now,
          changeFrequency: "monthly" as const,
          priority: 0.5,
          alternates: {
            languages: {
              "en-US": canonicalUrl,
              "x-default": canonicalUrl,
              ...Object.fromEntries(
                hubLocales.map((loc) => [
                  loc,
                  `${base}${localizedPath(childPath, loc)}`,
                ]),
              ),
            },
          },
          images: [ogUrl],
        };
      });
    }),
  ];

  /**
   * Image sitemap post-pass.
   *
   * Walk every entry above and attach `images: [ogImageFor(path)]` to
   * the HTML-page routes that don't already carry one (the
   * approvedTranslations block sets its own per-locale images). Raw
   * asset routes (.json, .csv, .txt, .well-known/*) are NOT pages and
   * do not get image entries – an image:image tag on a JSON download
   * URL would lie about what crawlers find at that loc.
   *
   * Listing one image per page in the sitemap is the canonical Google
   * Images discovery channel (developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps).
   * Per-page Open Graph meta tags remain authoritative for social
   * scrapers; this just adds the parallel discovery anchor for image
   * search.
   */
  const RAW_ASSET_RE = /\.(?:json|csv|txt)$/;
  return entries.map((entry) => {
    if (entry.images && entry.images.length > 0) return entry;
    const urlString = typeof entry.url === "string" ? entry.url : "";
    const pathOnly = urlString.startsWith(base)
      ? urlString.slice(base.length) || "/"
      : urlString;
    const isRawAsset =
      RAW_ASSET_RE.test(pathOnly) || pathOnly.startsWith("/.well-known/");
    if (isRawAsset) return entry;
    return { ...entry, images: [ogImageFor(pathOnly)] };
  });
}
