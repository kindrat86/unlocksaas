/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 removes the `eslint` config option and the `next lint` command.
  // Lint runs through the ESLint CLI directly (out of the Next.js build) and
  // is not configured in this baseline migration; the existing
  // eslint-config-next dep is bumped so a follow-up can wire up
  // `eslint.config.mjs` per the v16 codemod (`next-lint-to-eslint-cli`).

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
   * Trailing-slash normalization (2026-05-20 SEO audit fix #8).
   *
   * Without this flag, Next.js serves `/about` and `/about/` as two distinct
   * 200-OK URLs. Crawlers index both, splitting PageRank and creating the
   * classic "duplicate content with itself" pattern that the 2026-05-20 SEO
   * audit flagged as a -3pt drag on technical SEO. Setting it to `false`
   * (also the Next.js default, but declared explicitly so future contributors
   * do not flip it without thinking) makes `/about/` 308-redirect to `/about`.
   * The redirect is automatic; no entries needed in the `redirects()` block
   * below.
   *
   * Compatibility checklist (verified 2026-05-20):
   *   – All internal Link hrefs in this repo are written without trailing
   *     slashes (sitemap.ts, JSON-LD canonical URLs, internal-link blocks).
   *   – Stripe Checkout success / cancel URLs (lib/stripe/*) are non-trailing.
   *   – Resend transactional templates link to non-trailing canonical URLs.
   *   – Redirect destinations in `redirects()` below are non-trailing.
   *
   * If a future external referral ships with a trailing slash, the 308
   * carries the inbound link equity to the canonical URL without breaking
   * the user's flow.
   */
  trailingSlash: false,

  /**
   * Content-Language HTTP header — locale-aware (2026-05-18 i18n unlock).
   *
   * Pairs with the per-locale `<div lang>` wrapper in app/[locale]/layout.tsx,
   * the hreflang alternates in metadata + sitemap, and the `inLanguage`
   * JSON-LD fields. The HTTP header is the canonical locale signal for
   * crawlers and assistive tech that read response headers before parsing
   * HTML — some bots (Bing, older Googlebot mobile, accessibility tools)
   * prioritize it over markup.
   *
   * Routing order matters: more-specific patterns FIRST. Next evaluates the
   * array top-to-bottom and stops at the first match for a given path.
   *
   * Brunson Hard-Rule reconciliation: declaring Content-Language es on a
   * /es/* URL is honest only because the `app/[locale]` segment 404s for
   * any locale without renderable content (registry-gated via
   * generateStaticParams + dynamicParams: false). A locale header on a
   * 404 response is still honest — the response IS in that locale's format.
   *
   * Adding a new locale: add a matcher row here at the same time as the
   * locale is added to SUPPORTED_LOCALES in src/lib/i18n/locales.ts.
   */
  async headers() {
    // Locale-specific paths evaluated first; en-US is the catch-all
    // default. The `app/[locale]/*` segment 404s for any locale without
    // approved content (registry-gated via generateStaticParams +
    // dynamicParams: false). A locale header on a 404 response is still
    // honest — the response IS in that locale's format.
    return [
      { source: "/es/:path*", headers: [{ key: "Content-Language", value: "es" }] },
      { source: "/es", headers: [{ key: "Content-Language", value: "es" }] },
      { source: "/pt-BR/:path*", headers: [{ key: "Content-Language", value: "pt-BR" }] },
      { source: "/pt-BR", headers: [{ key: "Content-Language", value: "pt-BR" }] },
      { source: "/:path*", headers: [{ key: "Content-Language", value: "en-US" }] },
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
