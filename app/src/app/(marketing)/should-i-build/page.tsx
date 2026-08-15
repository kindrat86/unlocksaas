import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SHOULD_I_BUILD_ENTRIES,
  SHOULD_I_BUILD_VERDICT_LABELS,
} from "@/lib/should-i-build";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/should-i-build";

export const metadata: Metadata = {
  title: "Should I Build This SaaS? — Honest Verdicts | Unlock SaaS",
  description:
    "Yes / no / depends verdicts on the ten most-asked indie SaaS build decisions. Brunson Hard-Rule honest — several entries say no.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Should I Build This SaaS? — Unlock SaaS",
    description:
      "Honest yes / no / depends decision pages for indie SaaS founders considering what to build.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Should I Build This SaaS?",
    description: "Honest yes / no / depends verdicts on common indie SaaS build decisions.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Should I Build This SaaS? — Decision Pages",
  url: `${BASE_URL}/should-i-build`,
  description:
    "Honest pre-revenue decision pages for indie SaaS founders, with yes / no / depends verdicts and Brunson Hard-Rule reasoning.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: SHOULD_I_BUILD_ENTRIES.length,
    itemListElement: SHOULD_I_BUILD_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.question,
      url: `${BASE_URL}/should-i-build/${e.slug}`,
      description: e.verdictLine,
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
      name: "Should I build?",
      item: `${BASE_URL}/should-i-build`,
    },
  ],
});

const VERDICT_BADGE_CLASS: Record<
  ReturnType<() => (typeof SHOULD_I_BUILD_ENTRIES)[number]["verdict"]>,
  string
> = {
  yes: "bg-green-100 text-green-900 border-green-300 dark:bg-green-950 dark:text-green-100 dark:border-green-800",
  no: "bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-100 dark:border-red-800",
  depends:
    "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800",
  "not-in-2026":
    "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
};

export default function ShouldIBuildHubPage() {
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
            Should I build?
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Brunson Hard-Rule decision pages
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Should I build this SaaS?
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Honest yes / no / depends verdicts on the ten most-asked indie SaaS
          build decisions — niche size, AI wrappers, clones, side-projects,
          pre-selling. Several entries deliberately say no. Saying no honestly
          is the trust moat.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-3">
          {SHOULD_I_BUILD_ENTRIES.map((e) => (
            <li
              key={e.slug}
              className="flex flex-col sm:flex-row sm:items-start gap-3"
            >
              <span
                className={`shrink-0 inline-flex items-center justify-center text-xs font-semibold px-2 py-0.5 rounded border w-fit sm:w-32 ${VERDICT_BADGE_CLASS[e.verdict]}`}
                aria-label={`Verdict: ${SHOULD_I_BUILD_VERDICT_LABELS[e.verdict]}`}
              >
                {SHOULD_I_BUILD_VERDICT_LABELS[e.verdict]}
              </span>
              <Link
                href={`/should-i-build/${e.slug}`}
                className="text-base text-primary hover:underline leading-relaxed"
              >
                {e.question}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Apply the decision to your own idea
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic takes a live product URL
              and labels what is broken with one of three Brunson diagnoses.
              If the verdict above is &ldquo;depends&rdquo;, the diagnostic
              points you at which axis to fix first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/for">Niche-specific pages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
