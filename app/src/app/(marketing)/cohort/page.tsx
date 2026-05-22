/**
 * /cohort - hub page listing every quarterly Verified Builders cohort.
 *
 * Source: src/lib/cohorts.ts (single source of truth).
 *
 * Brunson + Isenberg overlay: this is the time-segmented complement to
 * the cross-time /builders directory. /builders shows "every founder who
 * has ever shipped a customer." /cohort/<YYYY-qN> shows "the class of
 * that quarter." Each cohort URL is permanent: it keeps earning links
 * after the quarter closes because it is the canonical history record.
 *
 * Voice: Reluctant Hero. The cohort identity belongs to the founders,
 * not to UnlockSaaS. The page surfaces the cohorts; the founders earn
 * the rows.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { COHORT_QUARTERS, formatWindow } from "@/lib/cohorts";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

const CANONICAL = "/cohort";

export const metadata: Metadata = {
  title: "Verified Builders Cohorts (Quarterly) - UnlockSaaS",
  description:
    "Every quarterly class of Verified Builders. Founders who shipped a paying customer through the UnlockSaaS Playbook, bucketed by the quarter their first Stripe charge cleared.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Verified Builders Cohorts (Quarterly) - UnlockSaaS",
    description:
      "Quarterly cohorts of Stripe-verified Builders. Each cohort is a calendar window, not a curated list.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Builders Cohorts (Quarterly)",
    description:
      "Quarterly cohorts of Stripe-verified Builders on the UnlockSaaS Playbook.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Verified Builders cohorts by quarter",
  url: `${BASE_URL}/cohort`,
  description:
    "Quarterly bucketing of Verified Builders. Each cohort is a calendar window; founders land in the quarter their first Stripe-verified customer cleared.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: COHORT_QUARTERS.length,
    itemListElement: COHORT_QUARTERS.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.displayName} cohort`,
      url: `${BASE_URL}/cohort/${c.slug}`,
      description: c.tldr,
    })),
  },
});

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Cohorts",
      item: `${BASE_URL}/cohort`,
    },
  ],
});

export default function CohortHubPage() {
  // No `new Date()` here on purpose. Cache Components (Next 16) forbid
  // request-time clock reads inside a statically-prerendered Server
  // Component without a dynamic boundary. The date range printed on each
  // card communicates the quarter without needing a status chip; the
  // per-cohort detail page (which is dynamic via `connection()`) carries
  // the status-dependent copy.

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COLLECTION_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            Cohorts
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Verified Builders by quarter
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The quarterly classes of the Playbook.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every Verified Builder lands in the quarter their first
          Stripe-verified customer cleared. The cohort is the calendar
          window, not a curated list. Founders earn their row by the
          charge, not by an application.
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="quarters"
      >
        <h2 id="quarters" className="sr-only">
          All cohorts
        </h2>
        {COHORT_QUARTERS.map((c) => {
          return (
            <Card key={c.slug} className="hover:border-primary/40 transition">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {formatWindow(c)}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-tight mb-2">
                  <Link
                    href={`/cohort/${c.slug}`}
                    className="hover:underline"
                  >
                    The {c.displayName} cohort
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {c.tldr}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  Theme
                </p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {c.theme}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Want your row in the next class?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The path to a cohort row is the same in every quarter: take
              the free 90-second Launch Diagnostic, run the Playbook, ship
              the work, let Stripe verify the customer. Your row lands
              automatically the moment the first charge clears.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/builders">All Verified Builders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
