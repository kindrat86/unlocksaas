import type { MetadataRoute } from "next";

/**
 * robots.txt for UnlockSaaS.
 *
 * Source: strategy/google-strategy.md §A.4.
 *
 * Allow the public marketing surface. Disallow:
 *  - /machine/*     — authenticated member area; per-user data
 *  - /api/*         — server routes, never indexable
 *  - /auth/*        — login / callback flow
 *  - /diagnostic/result — exposes a per-lead diagnosis (already index:false)
 *  - /builder/*     — per-Verified-Builder OG / share routes (already index:false)
 *  - /login         — auth surface
 *  - /oto, /welcome — post-purchase transitions; indexing them confuses the
 *    cold-traffic narrative (the OTO has no context outside the $1 purchase)
 *  - /onboarding    — post-purchase intake; auth-gated downstream
 *
 * Sitemap reference points crawlers at sitemap.ts above.
 */
export default function robots(): MetadataRoute.Robots {
  const base = "https://unlocksaas.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/machine/",
          "/api/",
          "/auth/",
          "/diagnostic/result",
          "/builder/",
          "/login",
          "/oto",
          "/welcome",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
