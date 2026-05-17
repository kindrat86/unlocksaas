import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { cn } from "@/lib/utils";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";

/**
 * Webmaster verification tokens — operator-pushed env vars.
 *
 * Closes the SEO audit deduction "no Bing Webmaster verification meta tag
 * visible" (see build-log.md for crawlability §9). Each search / AI
 * console (Google Search Console, Bing Webmaster Tools, Yandex Webmaster,
 * Pinterest) requires a one-time meta-tag handshake before we can submit
 * sitemaps and read indexing telemetry.
 *
 * Env-driven so the meta tag appears the instant the operator pushes the
 * value — no code edit or redeploy gates the verification step. Each tag
 * is emitted ONLY when its env var is set; an empty content="" attribute
 * would fail verification on every console.
 *
 * Brunson Hard-Rule reconciliation: every token below is verifiable by
 * the operator with one "confirm" click in the corresponding console.
 * No fabricated tokens. See LAUNCH-READINESS.md §Webmaster-verification
 * for the push flow.
 */
type VerificationOther = NonNullable<
  NonNullable<Metadata["verification"]>["other"]
>;

function buildVerification(): Metadata["verification"] | undefined {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const yandex = process.env.YANDEX_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  const pinterest = process.env.PINTEREST_VERIFICATION?.trim();

  // Next.js's typed `verification` only covers google / yandex / yahoo / me.
  // Bing's tag is <meta name="msvalidate.01"> and Pinterest's is
  // <meta name="p:domain_verify"> — both go through `other`.
  const other: VerificationOther = {};
  if (bing) other["msvalidate.01"] = bing;
  if (pinterest) other["p:domain_verify"] = pinterest;

  const hasAny =
    Boolean(google) ||
    Boolean(yandex) ||
    Object.keys(other).length > 0;
  if (!hasAny) return undefined;

  const v: NonNullable<Metadata["verification"]> = {};
  if (google) v.google = google;
  if (yandex) v.yandex = yandex;
  if (Object.keys(other).length > 0) v.other = other;
  return v;
}

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
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
