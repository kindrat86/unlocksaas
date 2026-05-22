import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import {
  TOOLS,
  TOOLS_HUB_DESCRIPTION,
  TOOLS_HUB_EYEBROW,
  TOOLS_HUB_LAST_REVIEWED_AT,
  TOOLS_HUB_PATH,
  TOOLS_HUB_PUBLISHED_AT,
  TOOLS_HUB_SUBHEAD,
  TOOLS_HUB_TITLE,
  TOOLS_HUB_URL,
} from "@/lib/tools-catalog";

/**
 * /tools – free SaaS calculator hub.
 *
 * Why this page exists
 * --------------------
 * The 2026-05-22 SEO uplift round identified "free tools" as the
 * highest-leverage editorial-backlink play for an indie SaaS at this
 * authority tier. Static pSEO pages earn citations; interactive tools
 * earn *links from third-party editorial* (the cite-able kind: "use
 * this calculator to see how churn destroys SaaS unit economics").
 *
 * Surface choices, mirroring the rest of the marketing fleet:
 *   - One hub page + five detail pages under (marketing)/tools/<slug>.
 *   - Article + BreadcrumbList JSON-LD on the hub; each detail page
 *     ships its own Article + FAQPage + BreadcrumbList trio.
 *   - Per-route OG cards. Each card supplies its own headline so X /
 *     LinkedIn / Bluesky / Indie Hackers / Show HN share previews
 *     don't collapse into the generic root card.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every formula rendered on the destination pages is canonical
 *     SaaS-finance math. No invented mechanics, no proprietary
 *     "secret formula".
 *   - The calculators are pure – no email gate, no signup wall.
 *     Editorial backlinks come from utility, not from gating the
 *     answer.
 *   - Default values are honest indie-SaaS ranges (sourced from the
 *     UnlockSaaS open dataset).
 *
 * Performance: pure static prose + a single-island client widget
 * lower down each detail page. force-static is the rendering shape
 * for the hub. No per-request data, no runtime APIs.
 */

export const metadata: Metadata = {
  title: TOOLS_HUB_TITLE,
  description: TOOLS_HUB_DESCRIPTION,
  alternates: {
    canonical: TOOLS_HUB_PATH,
  },
  openGraph: {
    type: "website",
    title: TOOLS_HUB_TITLE,
    description: TOOLS_HUB_DESCRIPTION,
    url: TOOLS_HUB_PATH,
  },
  twitter: {
    card: "summary_large_image",
    title: TOOLS_HUB_TITLE,
    description: TOOLS_HUB_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Free tools", url: TOOLS_HUB_URL },
] as const;

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      <ArticleJsonLd
        headline={TOOLS_HUB_TITLE}
        description={TOOLS_HUB_DESCRIPTION}
        url={TOOLS_HUB_URL}
        datePublished={TOOLS_HUB_PUBLISHED_AT}
        dateModified={TOOLS_HUB_LAST_REVIEWED_AT}
        articleSection="Free tools"
        keywords={[
          "SaaS calculators",
          "LTV calculator",
          "churn cost calculator",
          "CAC payback",
          "SaaS revenue projection",
          "pricing power calculator",
          "indie SaaS",
          "SaaS unit economics",
          "post-launch SaaS",
        ]}
      />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>{TOOLS_HUB_EYEBROW}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {TOOLS_HUB_EYEBROW}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {TOOLS_HUB_TITLE}.
          </h1>
          <p
            data-speakable="lede"
            className="text-base leading-relaxed text-muted-foreground"
          >
            {TOOLS_HUB_SUBHEAD}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Published{" "}
            <time dateTime={TOOLS_HUB_PUBLISHED_AT}>
              {TOOLS_HUB_PUBLISHED_AT}
            </time>
            . Last reviewed{" "}
            <time dateTime={TOOLS_HUB_LAST_REVIEWED_AT}>
              {TOOLS_HUB_LAST_REVIEWED_AT}
            </time>
            .
          </p>
        </header>

        <section
          aria-labelledby="tools-grid"
          className="space-y-4"
        >
          <h2
            id="tools-grid"
            className="sr-only"
          >
            Available calculators
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <Card
                key={tool.slug}
                className="border-border/60 transition-colors hover:border-foreground/40"
              >
                <CardHeader>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {tool.eyebrow}
                  </p>
                  <CardTitle className="text-lg font-semibold leading-snug">
                    <Link
                      href={tool.path}
                      className="hover:underline underline-offset-4"
                    >
                      {tool.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.hubLede}
                  </p>
                  <p className="mt-4 text-xs">
                    <Link
                      href={tool.path}
                      className="font-medium underline underline-offset-4 hover:text-foreground"
                    >
                      Open calculator →
                    </Link>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="why-tools"
          className="mt-16 space-y-4"
        >
          <h2
            id="why-tools"
            className="text-xl font-semibold tracking-tight"
          >
            Why these five
          </h2>
          <p
            data-speakable="why-five"
            className="text-sm leading-relaxed text-muted-foreground"
          >
            Every formula on these pages is canonical SaaS-finance math
            – the same lenses David Skok, Bessemer, and Tomasz Tunguz
            use when they look at a deal. Nothing here is proprietary
            UnlockSaaS IP. The calculators exist so you can run the
            numbers yourself, in your browser, with no email gate and
            no signup wall, the same way the $49 Playbook walks paid
            customers through them.
          </p>
        </section>
      </article>
    </div>
  );
}
