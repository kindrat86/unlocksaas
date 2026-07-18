import type { Metadata, Viewport } from "next";
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
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { buildVerification } from "@/lib/seo/verification";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { SiteHeader } from "@/components/blocks/site-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ReadingProgress } from "@/components/ui/reading-progress";
import { BackToTop } from "@/components/ui/back-to-top";
import { SkipToContent } from "@/components/ui/skip-to-content";

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
  // placeholder.supabase.co parses fine but is a dead host — a preconnect
  // to it shipped to production once. Same placeholder detection as
  // lib/supabase/server.ts.
  if (/placeholder|your-project-ref/i.test(url)) return null;
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
    default: "Unlock SaaS — Land Your First Paying Customer in 60 Days",
    template: "%s — Unlock SaaS",
  },
  description:
    "A playbook that turns your already-shipped product into a verified paying customer with zero fluff. If it does not deliver a customer, you do not pay.",
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
    title: "Unlock SaaS — Land Your First Paying Customer in 60 Days",
    description:
      "A playbook that turns your already-shipped product into a verified paying customer with zero fluff. If it does not deliver a customer, you do not pay.",
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock SaaS — Land Your First Paying Customer in 60 Days",
    description:
      "A playbook that turns your already-shipped product into a verified paying customer with zero fluff. If it does not deliver a customer, you do not pay.",
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
        {/* R16 world-class UX layer — shared design system across portfolio */}
        <link rel="stylesheet" href="/ux.css" />
        <script src="/ux.js" defer />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
        <PostHogProvider>
          {/* Reading progress bar — zero-JS-cost orientation on long pages. */}
          <ReadingProgress />
          {/* Skip-to-content link — first focusable element (WCAG 2.4.1). */}
          <SkipToContent />
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
          {/* SiteNavigationElement JSON-LD (2026-07-06 audit) — declares the
              primary navigation structure to Google, improving sitelinks
              display eligibility in SERPs. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SiteNavigationElement",
                name: [
                  "Glossary",
                  "Benchmarks",
                  "Teardowns",
                  "Compare",
                  "Alternatives",
                  "Learn",
                  "Free Tools",
                ],
                url: [
                  "https://unlocksaas.com/glossary",
                  "https://unlocksaas.com/benchmarks",
                  "https://unlocksaas.com/funnel-teardown",
                  "https://unlocksaas.com/vs",
                  "https://unlocksaas.com/alternatives-to",
                  "https://unlocksaas.com/how-to",
                  "https://unlocksaas.com/tools",
                ],
              }),
            }}
          />
          {/* Site-wide header navigation (2026-07-06 audit). Puts every major
              content hub within one click of every page. Wrapped in Suspense
              because the header uses usePathname() for active-link state,
              which forces client-side rendering and must be isolated from
              cached/static page shells. */}
          <Suspense fallback={<div className="h-14 border-b border-border" />}>
            <SiteHeader />
          </Suspense>
          {/* main landmark with id for skip-link target. */}
          <main id="main-content">
            {children}
          </main>
          {/* Floating back-to-top on long pages. */}
          <BackToTop />

          {/* Traffic Secrets Dream-100 congregation footer —
              only verified-resolving (HTTP 200) links. x.com/unlocksaas
              verified in a real browser 2026-07-14 (Maryan's profile);
              linked as x.com since twitter.com adds a redirect hop. */}
          <footer className="border-t border-border/40 mt-16">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
              <strong className="text-foreground/60">Find us where indie hackers are:</strong>
              {" "}
              <a href="https://x.com/unlocksaas" rel="me noopener" className="hover:text-foreground transition-colors">X / Twitter</a>
              {" · "}
              <a href="https://github.com/kindrat86" rel="me noopener" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </footer>
        </PostHogProvider>
        </ThemeProvider>
      
        {/* Cross-Portfolio Network Footer — web ring */}
        <div dangerouslySetInnerHTML={{ __html: `<!-- CROSS-PORTFOLIO NETWORK FOOTER — generated 2026-07-18 -->
<style>
.portfolio-network {
    max-width: 1200px;
    margin: 4rem auto 2rem;
    padding: 2rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    font-family: system-ui, -apple-system, sans-serif;
}
.portfolio-network h3 {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #9ca3af;
    margin: 0 0 1rem;
    text-align: center;
}
.network-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
}
.network-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    text-decoration: none;
    transition: background 0.15s;
    background: #f9fafb;
}
.network-card:hover {
    background: #f3f4f6;
}
.network-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
.network-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
}
.network-tagline {
    font-size: 0.6875rem;
    color: #9ca3af;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
/* Dark mode */
@media (prefers-color-scheme: dark) {
    .portfolio-network { border-top-color: #374151; }
    .portfolio-network h3 { color: #6b7280; }
    .network-card { background: #1f2937; }
    .network-card:hover { background: #374151; }
    .network-name { color: #f9fafb; }
    .network-tagline { color: #6b7280; }
}
</style>
<section class="portfolio-network">
    <h3>🚀 Explore Our Network</h3>
    <nav class="network-grid" aria-label="Portfolio network">
            <a href="https://gitdealflow.com" class="network-card" 
               title="GitDealFlow: Track startup acquisitions & funding rounds">
                <span class="network-dot" style="background:#10B981"></span>
                <span class="network-name">GitDealFlow</span>
                <span class="network-tagline">Data & Analytics</span>
            </a>
            <a href="https://signals.gitdealflow.com" class="network-card" 
               title="Signals by GitDealFlow: AI-powered startup investment signals">
                <span class="network-dot" style="background:#3B82F6"></span>
                <span class="network-name">Signals by GitDealFlow</span>
                <span class="network-tagline">AI & Investing</span>
            </a>
            <a href="https://invisibleexit.com" class="network-card" 
               title="Invisible Exit: Acquisition readiness for bootstrapped SaaS">
                <span class="network-dot" style="background:#8B5CF6"></span>
                <span class="network-name">Invisible Exit</span>
                <span class="network-tagline">SaaS & M&A</span>
            </a>
            <a href="https://sipiteno.com" class="network-card" 
               title="SipiTeno: AI Agents for SaaS Operations">
                <span class="network-dot" style="background:#F59E0B"></span>
                <span class="network-name">SipiTeno</span>
                <span class="network-tagline">AI Agents & Automation</span>
            </a>
            <a href="https://unlocksaas.com" class="network-card" 
               title="UnlockSaaS: Launch your SaaS in 60 days">
                <span class="network-dot" style="background:#EC4899"></span>
                <span class="network-name">UnlockSaaS</span>
                <span class="network-tagline">SaaS Building</span>
            </a>
            <a href="https://voicelogpro.com" class="network-card" 
               title="VoiceLogPro: Voice-to-insight for field teams">
                <span class="network-dot" style="background:#06B6D4"></span>
                <span class="network-name">VoiceLogPro</span>
                <span class="network-tagline">Voice AI & Field Ops</span>
            </a>
            <a href="https://carshake.online" class="network-card" 
               title="CarShake: Valet-damage-proof vehicle handover">
                <span class="network-dot" style="background:#EF4444"></span>
                <span class="network-name">CarShake</span>
                <span class="network-tagline">Automotive & Insurance</span>
            </a>
            <a href="https://churnlens.site" class="network-card" 
               title="ChurnLens: Churn analytics that predict, not just report">
                <span class="network-dot" style="background:#6366F1"></span>
                <span class="network-name">ChurnLens</span>
                <span class="network-tagline">SaaS Analytics</span>
            </a>
            <a href="https://sanctionsai.dev" class="network-card" 
               title="SanctionsAI: AI agent payment compliance">
                <span class="network-dot" style="background:#DC2626"></span>
                <span class="network-name">SanctionsAI</span>
                <span class="network-tagline">Compliance & Fintech</span>
            </a>
            <a href="https://sipi.bot" class="network-card" 
               title="Sipi.bot: AI spend firewall for agent payments">
                <span class="network-dot" style="background:#14B8A6"></span>
                <span class="network-name">Sipi.bot</span>
                <span class="network-tagline">AI Infrastructure</span>
            </a>
    </nav>
</section>` }} />
      </body>
    </html>
  );
}
