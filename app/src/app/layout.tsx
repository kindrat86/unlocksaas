import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
/**
 * Geist Sans + Geist Mono via `geist/font` (v1.7.0). Audited 2026-05-21:
 * `geist/dist/sans.js` and `geist/dist/mono.js` call `next/font/local`
 * without overriding `display`, which means both fonts inherit Next.js's
 * default `display: 'swap'`. font-display:swap = browsers paint fallback
 * text immediately while the woff2 downloads, then swap to Geist with no
 * invisible-text flash (FOIT). This is the LCP-correct default for a
 * text-led marketing surface where the H1 IS the LCP element; we keep
 * the upstream default rather than overriding so a future geist@2.x
 * configuration change propagates without manual sync.
 *
 * The variable-axis woff2 (Geist-Variable.woff2 / GeistMono-Variable.woff2,
 * weight 100-900) is self-hosted from /public via next/font, so there is
 * no third-party CDN fetch and no extra DNS lookup on the LCP critical
 * path.
 */
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildVerification } from "@/lib/seo/verification";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

/**
 * Third-party connection hints (2026-05-20 SEO audit fix #8 / CWV +5).
 *
 * Parsed once at module load (server-side), per the React server-side
 * `server-hoist-static-io` rule – no per-request URL parsing. Each entry
 * resolves to a clean origin (scheme + host + port, no path / query) so
 * the preconnect / dns-prefetch hint matches what the browser actually
 * opens when it later fetches Stripe.js, hits Supabase auth, or warms
 * PostHog ingest.
 *
 * Choice of hint per origin:
 *   – Stripe.js: `preconnect`. Loaded eagerly by `loadStripe()` on the
 *     /playbook-sales and /starter checkout paths; saving the TLS+TCP
 *     handshake (~120-180ms on a cold mobile network) pays off on the
 *     very next interaction.
 *   – Supabase: `preconnect` with `crossOrigin="anonymous"`. The auth /
 *     query client opens an anonymous CORS fetch (Authorization header,
 *     no cookie credentials), so the warmed socket has to match.
 *   – PostHog: `dns-prefetch`, not preconnect. The SDK is dynamic-imported
 *     AFTER first paint (lib/analytics/client.ts), so a full TLS handshake
 *     held open during LCP would waste a connection slot. DNS resolution
 *     is the cheap, useful half of preconnect for a deferred origin.
 *
 * Resend is intentionally absent: it's server-side only (sent from
 * /api/* via the Node SDK). The browser never opens a socket to
 * api.resend.com, so a preconnect there would burn a connection slot
 * for zero benefit.
 *
 * Brunson Hard-Rule reconciliation: any origin whose env var is unset
 * or unparseable resolves to `null` and renders nothing – no fabricated
 * hints, no placeholder hosts. Stripe is the only hardcoded constant
 * because js.stripe.com is the documented public CDN for Stripe.js and
 * does not vary per deployment.
 */
function parseOrigin(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
const THIRD_PARTY_ORIGINS = {
  stripe: "https://js.stripe.com",
  supabase: parseOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL),
  posthog: parseOrigin(
    process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
  ),
} as const;

// Mobile-first viewport. `viewportFit: cover` lets the page paint under
// iOS notches; padding then uses safe-area-inset via Tailwind utilities.
// `maximumScale: 5` (not 1) preserves accessibility — the avatar
// includes older eyes that pinch-zoom.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
};

// Surface A of the Google strategy — strategy/google-strategy.md §A.3 #3.
// metadataBase makes canonical URLs and OG image URLs resolve against the
// production origin, which Search Console + AI Overviews + Twitter/X cards
// all rely on. Per-page metadata exports inherit unless they override.
export const metadata: Metadata = {
  metadataBase: new URL("https://unlocksaas.com"),
  title: {
    default: "Unlock SaaS — Your First Paying Customer in 60 Days",
    template: "%s — Unlock SaaS",
  },
  description:
    "A playbook that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
  applicationName: "Unlock SaaS",
  authors: [{ name: "Maryan", url: "https://unlocksaas.com/about" }],
  creator: "Maryan",
  publisher: "Unlock SaaS",
  alternates: {
    canonical: "/",
    // Self-referencing hreflang for a deliberately monolingual surface.
    // `x-default` tells Google there is no language-specific alternate; the
    // en-US page IS the canonical for every locale. Without this declaration
    // a single-language site looks "unspecified" and forfeits International
    // SEO signal points it could trivially claim. See google-strategy.md §A.4
    // (locale declarations) — extension landing 2026-05-17.
    languages: {
      "en-US": "/",
      "x-default": "/",
    },
  },
  robots: { index: true, follow: true },
  // Search-engine ownership verification — env-driven slots, empty until
  // the operator drops a value in Vercel. Each tag is a real, currently-
  // documented verification mechanism (Google Search Console, Bing
  // Webmaster, Yandex Webmaster, Pinterest domain verify, Facebook
  // domain verify, Naver Webmaster). Without these, every console that
  // requires DNS-or-meta proof falls back to slower DNS verification,
  // delaying access to AI Overview eligibility signals and Bing Copilot
  // citation metrics. With them, the moment the operator pastes a key
  // into Vercel, the corresponding console verifies on the next deploy.
  //
  // Brunson Hard-Rule reconciliation: every slot below is empty until
  // an env var is set. Empty slots render NOTHING — no fabricated
  // verification codes, no placeholder strings, no "TODO" tokens.
  // See lib/seo/verification.ts for the read-and-validate logic.
  verification: buildVerification(),
  openGraph: {
    type: "website",
    siteName: "Unlock SaaS",
    title: "Unlock SaaS — Your First Paying Customer in 60 Days",
    description:
      "A playbook that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock SaaS — Your First Paying Customer in 60 Days",
    description:
      "A playbook that turns your already-shipped product into a verified paying customer. If it does not, you do not pay.",
    creator: "@maryan",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={cn(GeistSans.variable, GeistMono.variable)}>
      <head>
        {/*
          Connection hints – see THIRD_PARTY_ORIGINS at the top of this file
          for the per-origin rationale (preconnect vs dns-prefetch, why
          Resend is excluded, Brunson Hard-Rule on env-driven hosts).
        */}
        <link rel="preconnect" href={THIRD_PARTY_ORIGINS.stripe} />
        {THIRD_PARTY_ORIGINS.supabase ? (
          <link
            rel="preconnect"
            href={THIRD_PARTY_ORIGINS.supabase}
            crossOrigin="anonymous"
          />
        ) : null}
        {THIRD_PARTY_ORIGINS.posthog ? (
          <link rel="dns-prefetch" href={THIRD_PARTY_ORIGINS.posthog} />
        ) : null}
      </head>
      <body className="antialiased bg-background text-foreground">
        <PostHogProvider>
          {/* PageView lives in Suspense because useSearchParams forces CSR. */}
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          {/*
            Core Web Vitals + Next custom-timing beacon. Reports LCP, INP,
            CLS, FCP, TTFB, FID, plus Next.js-hydration /
            Next.js-route-change-to-render / Next.js-render. Sits outside
            Suspense because useReportWebVitals does not subscribe to nav
            hooks – Suspense would couple two unrelated lifecycles. Forwards
            to PostHog via the lazy-loaded analytics client so first paint
            stays unaffected (bundle-defer-third-party pattern).
          */}
          <WebVitalsReporter />
          {/*
            Vercel Speed Insights – second sink for the same CWV metrics
            (LCP, INP, CLS, FCP, TTFB) but routed to Vercel's native
            dashboard instead of PostHog. The two sinks are complementary,
            not redundant:
              – WebVitalsReporter → PostHog: per-distinct_id correlation
                with funnel events, retention cohorts, feature flags.
                Useful for "did this LCP regression cost us conversions?"
              – SpeedInsights → Vercel dashboard: per-route p75 with
                Google's CrUX field-data baseline as comparison line.
                Useful for "is this route fast enough to win SERP /
                AI Overview eligibility?"
            CWV is a hard Google ranking factor; without measurement we
            cannot tell whether the connection-hint optimization above,
            the next/font preload, or any future change actually moved
            the p75 needle. The `route` prop is auto-set by the framework
            import (@vercel/speed-insights/next) so dynamic routes like
            /glossary/[slug] aggregate correctly. Brunson Hard-Rule note:
            this ships data only when the operator enables Speed Insights
            in the Vercel dashboard – no enable, no script load, no data.
          */}
          <SpeedInsights />
          {/*
            Organization + WebSite JSON-LD as site-wide entity anchors.
            Lives in the root layout so every page inherits both blocks —
            the prior placement on the homepage only meant /diagnostic,
            /faq, /about, and every pSEO slug had a hollow entity graph
            (Article/FAQPage/Breadcrumb but no Organization to attach to).
            The `@unlocksaas/seo` validate-claims audit caught this on
            2026-05-18 by flagging 6 of 7 production surfaces with
            "Missing Organization JSON-LD" + "Missing WebSite JSON-LD".
            Server-rendered, zero hydration cost.
          */}
          <OrganizationJsonLd />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
