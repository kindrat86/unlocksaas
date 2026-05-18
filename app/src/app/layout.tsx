import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { WebVitalsReporter } from "@/components/analytics/web-vitals-reporter";
import { buildVerification } from "@/lib/seo/verification";

// Mobile-first viewport. `viewportFit: cover` lets the page paint under
// iOS notches; padding then uses safe-area-inset via Tailwind utilities.
// `maximumScale: 5` (not 1) preserves accessibility — Marco's avatar
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
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
