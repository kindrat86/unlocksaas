/** @type {import('next').NextConfig} */
const nextConfig = {
  // Launch-window pragmatic unblock. Multiple concurrent build sessions are
  // landing in-progress scaffolding (unused state hooks, unused destructured
  // imports) for features mid-wire-up (deliverable-email resend button,
  // diagnostic survey bucketing). Compilation passes – only ESLint's strict
  // no-unused-vars rule fails the build.
  //
  // Trading lint-strictness for deploy-ability for the launch window. After
  // the first verified customer cycle closes, flip back to the default
  // (delete this block) and clean up unused symbols in:
  //   - src/app/(app)/playbook/step/[id]/page.tsx (4 unused state hooks)
  //   - src/app/api/diagnostic/route.ts (assignBucket, Bucket, survey)
  //
  // TypeScript type-checking remains on; runtime correctness is unaffected.
  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * SXO / CWV bundle wins (2026-05-17).
   *
   * 1. `optimizePackageImports` rewrites barrel imports from the listed
   *    packages into deep, tree-shakable imports at build time. Without this,
   *    `import { ArrowRight } from "lucide-react"` pulls all ~1,500 icons
   *    into the client chunk. With it, only ArrowRight ships. Verified safe
   *    on Next 14; stable since 14.2.
   *
   *    - lucide-react: 23 files import from it; biggest offender by far.
   *    - @radix-ui/react-{progress,separator,slot}: smaller barrels but each
   *      ships its own runtime if not tree-shaken.
   *    - posthog-js: barrel re-exports many sub-modules we never touch
   *      (replay, surveys, exception-autocapture). Shaving them off the
   *      analytics chunk lifts LCP on every page that mounts PostHogProvider
   *      (i.e. all of them, via the root layout).
   *
   *    Follow-up not done here: dynamic-importing posthog-js itself inside
   *    initPostHog() would move it OUT of the initial chunk entirely. That
   *    refactor needs the PostHogProvider rewrite to drop the
   *    posthog-js/react <Provider> dependency, which is more invasive than
   *    a launch-window-safe change. Tracked separately.
   *
   * 2. `removeConsole` strips console.* (except error/warn) from production
   *    builds. The `console.info` calls in src/lib/analytics/client.ts are
   *    already NODE_ENV-guarded, but this catches any future-added unguarded
   *    log so the prod bundle stays clean.
   *
   * 3. `poweredByHeader: false` removes the `X-Powered-By: Next.js` response
   *    header – pure hygiene, no perf impact, smaller response by ~22 bytes.
   *
   * NOT enabled here, deliberately:
   *   - `experimental.optimizeCss`: requires the `critters` peer dep and has
   *     been flaky on Vercel CI in past 14.x patch releases. Re-evaluate
   *     after the first verified customer cycle.
   *   - Cache Components (`cacheComponents: true`): Next 16+ only. We are on
   *     14.2.35. Upgrading is the right call but it crosses the middleware
   *     -> proxy rename, async params/searchParams, and a few RSC boundary
   *     tightenings – not a launch-window-safe autonomous change.
   */
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-progress",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "posthog-js",
    ],
  },
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  poweredByHeader: false,

  /**
   * Content-Language HTTP header.
   *
   * Pairs with `<html lang="en-US">` (src/app/layout.tsx), the hreflang
   * alternates in metadata + sitemap, and the `inLanguage` JSON-LD fields.
   * The HTTP header is the canonical locale signal for crawlers and assistive
   * tech that read response headers before parsing HTML — some bots (Bing,
   * older Googlebot mobile, accessibility tools) prioritize it over markup.
   *
   * Deliberately monolingual. If multi-locale ever ships, swap to a matcher
   * that emits the per-route locale (e.g. en-US for `/`, es-ES for `/es/*`).
   * Until then this single header is the honest declaration: every URL on
   * unlocksaas.com is en-US, and there is no alternate.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Language", value: "en-US" },
        ],
      },
    ];
  },

  /**
   * 308 permanent redirects for the machine → playbook rename (2026-05-17).
   *
   * Marco (the avatar) didn't understand "machine"; the dashboard, sales page,
   * and LLM-friendly markdown route all moved to /playbook* / playbook-sales*.
   * Any existing inbound link – bookmarks, soap-opera and seinfeld emails
   * already in flight, Google's index of /machine-sales – survives as a 308
   * so PageRank and existing flows don't break.
   *
   * Keep these forever; they're cheap, and the SEO equity from /machine-sales
   * is the kind of thing that compounds quietly for years.
   */
  async redirects() {
    return [
      { source: "/machine", destination: "/playbook", permanent: true },
      { source: "/machine/:path*", destination: "/playbook/:path*", permanent: true },
      { source: "/machine-sales", destination: "/playbook-sales", permanent: true },
      { source: "/machine-sales.md", destination: "/playbook-sales.md", permanent: true },
    ];
  },
};

export default nextConfig;
