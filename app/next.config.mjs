/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 removes the `eslint` config option and the `next lint` command.
  // Lint runs through the ESLint CLI directly (out of the Next.js build) and
  // is not configured in this baseline migration; the existing
  // eslint-config-next dep is bumped so a follow-up can wire up
  // `eslint.config.mjs` per the v16 codemod (`next-lint-to-eslint-cli`).

  /**
   * Cache Components (Next 16+) — DEFERRED 2026-05-20.
   *
   * Initially enabled 2026-05-20 alongside the SEO audit batch, but four
   * consecutive prod deploys failed at the prerender step with:
   *
   *   Error: Route "<path>": Uncached data was accessed outside of
   *   <Suspense>. This delays the entire page from rendering...
   *
   * The strict cacheComponents:true rule requires every uncached data read
   * to be inside a <Suspense> boundary. Many existing auth-gated and
   * personalised routes (/onboarding, /playbook, /playbook/verified,
   * /diagnostic, /login, plus likely more) call `await createClient()` +
   * `await getUser()` at the top level — the old escape hatch
   * `export const dynamic = "force-dynamic"` was already removed in the
   * directive cleanup, and the new Suspense + connection() pattern needs
   * to be applied per-route. Two partial-fix commits (#12dc333 onboarding,
   * #173cd49 (app) layouts) chipped at the list but new failures kept
   * surfacing.
   *
   * To unblock production deploys, cacheComponents is OFF here. Without it
   * Next 16 falls back to the auto-dynamic detection it had pre-16: routes
   * that read cookies/headers/auth render dynamically without the explicit
   * directive. The Suspense wrapping already added in #12dc333 / #173cd49
   * stays in place — Suspense without cacheComponents is harmless.
   *
   * Re-enable plan: convert each remaining auth/personalised route to the
   * Suspense + connection() pattern on a focused feature branch, verify the
   * full prerender pass locally with `next build`, then flip this back to
   * `cacheComponents: true` in a single atomic commit. The original audit
   * target (per-tag invalidation for pSEO surfaces via cacheTag/revalidateTag)
   * is preserved as the destination — just not on the launch path.
   *
   * SXO / CWV bundle wins (kept from 2026-05-17):
   *
   * 1. `optimizePackageImports` rewrites barrel imports from the listed
   *    packages into deep, tree-shakable imports at build time. Without this,
   *    `import { ArrowRight } from "lucide-react"` pulls all ~1,500 icons
   *    into the client chunk. With it, only ArrowRight ships.
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
   *   - `experimental.optimizeCss`: requires the `critters` peer dep, which
   *     has had a history of CI flakiness (multiple 14.x patch cycles). Next
   *     16's CSS pipeline already inlines critical CSS via the Turbopack
   *     graph for app/ routes, so the marginal lift from optimizeCss is
   *     small on this codebase. Re-evaluate together with the cacheComponents
   *     re-enable above, not before — adding a second experimental during a
   *     paused migration would muddy attribution if a build regresses.
   */
  // Re-enabled 2026-05-21 — picks up the parallel session's full Suspense +
  // 'use cache' migration (#dd22051 / #173cd49 / #12dc333 + restored cache
  // wrappers from feat/re-enable-cache-components). Every previously
  // failing auth-gated route (/onboarding, /playbook, /playbook/verified,
  // /diagnostic, /login, /builders) now reads cookies/headers behind
  // Suspense + connection(); the homepage, /founding, /diagnostic/result,
  // /builder/[slug], /diagnosis/[id] wrap their async bodies in Suspense.
  // Verified clean by 668-page local prerender pass before re-enable.
  cacheComponents: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-progress",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "posthog-js",
    ],
  },
  /**
   * Image Optimization (2026-05-21 CWV uplift).
   *
   * formats: ['image/avif','image/webp']
   *   Explicitly declared so Next's image pipeline negotiates AVIF first
   *   (~30% smaller than WebP at equivalent quality), then WebP, then the
   *   source format. Without this declaration Next 16 still serves WebP by
   *   default but skips AVIF, leaving ~25% LCP byte savings on the table
   *   for the homepage hero, founder portrait, and per-route OG cards.
   *   AVIF decode is ~50% slower than WebP CPU-side, but the smaller payload
   *   wins on LCP because the network is the bottleneck on first paint.
   *
   * minimumCacheTTL: 31536000 (1y)
   *   Optimized variants are immutable artifacts keyed by the source URL +
   *   width + quality + format. Once generated, they never change for a
   *   given input. A 1y cache TTL maximises CDN hit-rate without sacrificing
   *   freshness — the source image URL is the cache key, so swapping the
   *   source automatically invalidates downstream variants.
   */
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
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
   * HTTP response headers — locale + security defence-in-depth (2026-05-20).
   *
   * Three concerns share this function:
   *
   *   1. Content-Language (per-locale, 2026-05-18 i18n unlock).
   *   2. X-Robots-Tag noindex on private surfaces (HTTP-header tier of the
   *      same disallow list robots.ts advertises, so an accidental metadata
   *      misconfig on a per-user page can't leak into Google's index).
   *   3. Baseline security headers (HSTS, CSP, Referrer-Policy,
   *      X-Content-Type-Options, Permissions-Policy) on every response.
   *
   * Routing order: catch-all patterns FIRST, more-specific overrides AFTER.
   * Next evaluates the array top-to-bottom; when multiple rules match the
   * same path AND set the same header key, the later rule's value wins. We
   * exploit that twice:
   *   - The en-US Content-Language catch-all is placed BEFORE the locale-
   *     specific /es/* and /pt-BR/* rules so the locale rules win for their
   *     prefixes (verified 2026-05-20: previously /es/faq served en-US
   *     because the catch-all came after).
   *   - The embed-route CSP override is placed AFTER the baseline security
   *     headers so it replaces `frame-ancestors 'none'` with the wide-open
   *     value the cross-origin iframe needs.
   *
   * Content-Language pairs with the per-locale `<div lang>` wrapper in
   * app/[locale]/layout.tsx, the hreflang alternates in metadata + sitemap,
   * and the `inLanguage` JSON-LD fields. Some crawlers (Bing, older
   * Googlebot mobile, accessibility tools) prioritize the header over markup.
   *
   * Brunson Hard-Rule reconciliation: declaring Content-Language es on a
   * /es/* URL is honest only because the `app/[locale]` segment 404s for
   * any locale without renderable content (registry-gated via
   * generateStaticParams + dynamicParams: false). A locale header on a
   * 404 response is still honest — the response IS in that locale's format.
   *
   * Adding a new locale: add a matcher row in LOCALE_HEADERS at the same
   * time as the locale is added to SUPPORTED_LOCALES in src/lib/i18n/locales.ts.
   *
   * ─── Security header rationale ─────────────────────────────────────────
   *
   * HSTS (`Strict-Transport-Security`):
   *   max-age=2y, includeSubDomains, preload. Two-year max-age + preload
   *   eligibility per hstspreload.org criteria. Submitting unlocksaas.com
   *   to the preload list is a separate operator action (deferred until a
   *   verified launch); the header is set now so the preload submission
   *   is a one-step process when ready.
   *
   * X-Content-Type-Options: nosniff
   *   Prevents browsers from MIME-sniffing /llms.txt as HTML, /llms-feed.json
   *   as JS, etc. Critical given how many surfaces serve non-HTML content.
   *
   * Referrer-Policy: strict-origin-when-cross-origin
   *   Sends full URL on same-origin (so internal analytics see paths), only
   *   origin on cross-origin (so we don't leak diagnostic IDs or auth params
   *   in Referer headers to Stripe / PostHog / Supabase).
   *
   * Permissions-Policy:
   *   Disables every browser feature the site doesn't use — camera, mic,
   *   geolocation, payment APIs (Stripe Checkout uses its own iframe origin),
   *   FLoC / Topics (third-party cohort tracking we never want).
   *
   * Content-Security-Policy:
   *   Allow-listed against the actual origins the client touches (audited
   *   2026-05-20: Stripe.js, Supabase, PostHog EU, Mux for VSL/founding
   *   video). `'unsafe-inline'` on script-src is currently required because:
   *     a) every pSEO surface server-renders JSON-LD via
   *        dangerouslySetInnerHTML (these are <script type="application/ld+json">
   *        blocks — non-executable but still matched by script-src), and
   *     b) Next.js RSC hydration emits inline bootstrap scripts.
   *   Hardening path (deferred): nonce-based CSP via proxy.ts middleware on
   *   the Next 16 upgrade, which lets us drop `'unsafe-inline'` cleanly.
   *
   * frame-ancestors:
   *   Default 'none' (replaces the deprecated X-Frame-Options DENY).
   *   Override to '*' for /builder/<slug>/embed* — those routes are designed
   *   for cross-origin iframe embedding on verified-builder founder sites,
   *   so blocking ancestors there would break the Verified Builder backlink
   *   farm by design.
   *
   * X-Robots-Tag:
   *   Mirrors the disallow list in robots.ts. The HTTP header is enforced
   *   for ALL crawlers (including AI bots the marketing robots.ts allow-lists
   *   on public surfaces) and survives misconfigurations at the per-page
   *   metadata level. Defence-in-depth, not the primary mechanism.
   */
  async headers() {
    // ── Reusable header sets ────────────────────────────────────────────
    //
    // CSP origins audited 2026-05-20 against actual client-side use:
    //   - Stripe.js script + Checkout iframe + Connect OAuth POST
    //   - Supabase REST + Realtime (wss) + Storage
    //   - PostHog EU ingest + asset host (same origin: eu.i.posthog.com)
    //   - Mux video for VSL / founding (env-driven NEXT_PUBLIC_VSL_URL)
    //   - IndexNow ping (server-side fetch only — listed defensively)
    //
    // 'unsafe-inline' on script-src is required for inline JSON-LD blocks
    // and Next.js RSC hydration. 'unsafe-eval' is added in dev only for
    // React Fast Refresh.
    const isDev = process.env.NODE_ENV === "development";
    const STRICT_CSP = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com https://eu.i.posthog.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://eu.i.posthog.com https://api.stripe.com https://connect.stripe.com https://api.indexnow.org",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://stream.mux.com",
      "media-src 'self' https://stream.mux.com https://image.mux.com data: blob:",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://connect.stripe.com",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    // CSP override for /builder/<slug>/embed* — these routes MUST be
    // iframeable from any origin (the verified-builder badge embed on
    // founder sites). Same allow-list as STRICT_CSP minus the third-party
    // SDK origins (the embed iframe only renders the badge + Review JSON-LD,
    // no Stripe / PostHog / Supabase).
    const EMBED_CSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors *",
    ].join("; ");

    const BASE_SECURITY_HEADERS = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
      },
      { key: "Content-Security-Policy", value: STRICT_CSP },
    ];

    const NOINDEX_HEADERS = [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];

    // Private surfaces — mirror robots.ts PRIVATE_DISALLOW_CANONICAL.
    // Each entry expands to both the bare path and the subtree variant
    // where applicable, so e.g. /onboarding AND /onboarding/step-2 both
    // get the header. Builder sub-routes are listed individually because
    // they're sibling files under /builder/<slug>/, not subtrees.
    const NOINDEX_PATHS = [
      "/playbook",
      "/playbook/:path*",
      "/api/:path*",
      "/auth/:path*",
      "/diagnostic/result",
      "/diagnostic/result/:path*",
      "/onboarding",
      "/onboarding/:path*",
      "/welcome",
      "/welcome/:path*",
      "/oto",
      "/oto/:path*",
      "/login",
      "/builder/:slug/embed",
      "/builder/:slug/embed.html",
      "/builder/:slug/badge.svg",
      "/builder/:slug/review.json",
      "/builder/:slug/oembed.json",
      "/builder/:slug/opengraph-image",
      "/builder/:slug/opengraph-image.png",
    ];

    return [
      // ── 1. Content-Language: catch-all en-US FIRST, locale overrides AFTER
      // Next's header merging applies later-wins for matching rules with the
      // same header key. By placing the catch-all en-US rule before the
      // locale-specific rules, requests to /es/* and /pt-BR/* get their
      // locale value overriding en-US. (Verified live 2026-05-20: the prior
      // order had the catch-all last, so /es/faq served Content-Language:
      // en-US in production for every locale-prefixed URL.)
      { source: "/:path*", headers: [{ key: "Content-Language", value: "en-US" }] },
      { source: "/es/:path*", headers: [{ key: "Content-Language", value: "es" }] },
      { source: "/es", headers: [{ key: "Content-Language", value: "es" }] },
      { source: "/pt-BR/:path*", headers: [{ key: "Content-Language", value: "pt-BR" }] },
      { source: "/pt-BR", headers: [{ key: "Content-Language", value: "pt-BR" }] },

      // ── 2. X-Robots-Tag: noindex for private/transactional surfaces ──
      ...NOINDEX_PATHS.map((source) => ({ source, headers: NOINDEX_HEADERS })),

      // ── 3. Baseline security headers on every response ───────────────
      { source: "/:path*", headers: BASE_SECURITY_HEADERS },

      // ── 4. CSP override for cross-origin-embeddable builder iframes ──
      // Placed AFTER the baseline so the later-wins ordering rule replaces
      // the default `frame-ancestors 'none'` with `frame-ancestors *`.
      {
        source: "/builder/:slug/embed",
        headers: [{ key: "Content-Security-Policy", value: EMBED_CSP }],
      },
      {
        source: "/builder/:slug/embed.html",
        headers: [{ key: "Content-Security-Policy", value: EMBED_CSP }],
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
