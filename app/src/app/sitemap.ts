import type { MetadataRoute } from "next";

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
 * Brunson Hard-Rule reconciliation: every URL listed here passes the
 * "would the SEO-addicted version of the founder approve" check from
 * strategy/google-strategy.md §AC-flaw reconciliation. They are the same
 * pages that already convert organically; we are not inventing keyword
 * landing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://unlocksaas.com";
  const now = new Date();

  return [
    // Funnel Hub — highest priority, brand-canonical entry point.
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // Pain-mirror long-tail squeeze. Conversion event.
    {
      url: `${base}/diagnostic`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Reverse-squeeze long-form. Cold reader on Google long-tail lands here.
    {
      url: `${base}/parables`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // $1 Starter sales page. Solution-aware comparator.
    {
      url: `${base}/starter`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Long-form $49 Machine sales page. Product-aware decision page.
    {
      url: `${base}/machine-sales`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
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
    },
    // Cold-traffic bridge. Lands between Google paid problem-aware ads and
    // the diagnostic, but also indexable for problem-aware long-tail.
    {
      url: `${base}/bridge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // 14-Day First-Customer Sprint challenge funnel surface.
    {
      url: `${base}/challenge`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Rung-2 Repeatable Revenue surface (already index:true per its metadata).
    {
      url: `${base}/repeatable`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
