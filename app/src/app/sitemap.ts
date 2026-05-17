import type { MetadataRoute } from "next";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";

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
      url: `${base}/parables`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/parables`),
    },
    // $1 Starter sales page. Solution-aware comparator.
    {
      url: `${base}/starter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/starter`),
    },
    // Long-form $49 Machine sales page. Product-aware decision page.
    {
      url: `${base}/machine-sales`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: hreflang(`${base}/machine-sales`),
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
  ];
}
