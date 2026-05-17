import type { MetadataRoute } from "next";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";

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
   * Self-referencing hreflang for a deliberately monolingual surface.
   *
   * The Brunson Hard-Rule (no fabricated claims) forbids declaring
   * alternates that do not exist. We are NOT inventing /es/ or /de/
   * pages. We ARE declaring, honestly, that this URL is the en-US
   * canonical and that there is no language-specific alternate
   * (`x-default`), which is the correct signal for an English-only
   * surface targeting global English-speaking founders.
   *
   * Without these alternates, a single-language site sends an
   * "unspecified" locale signal and loses International SEO points
   * it could trivially claim. With them, the site reads to Google as
   * "deliberately en-US," which is what UnlockSaaS is.
   */
  const hreflang = (url: string) => ({
    languages: {
      "en-US": url,
      "x-default": url,
    },
  });

  return [
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
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: hreflang(`${base}/contact`),
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
    // LLM-readable surfaces (Surface B – GEO/AEO).
    // Both routes are public, indexable text/markdown bodies that AI
    // retrievers (Perplexity, ClaudeBot, GPTBot/OAI-SearchBot, Google AI
    // Overviews, Gemini, You.com) treat as the canonical paraphrase target
    // for the site. llmstxt.org is well-known so discovery happens via
    // convention; listing them in the sitemap is the cheapest extra signal
    // that says "yes, these surfaces are intentional and current."
    // Low priority because they are not user-facing pages — they are
    // crawler bait — but lastModified ties their freshness to the build.
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
  ];
}
