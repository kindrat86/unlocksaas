import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ONBOARDING_PATTERN_ENTRIES } from "@/lib/onboarding-patterns";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/onboarding-pattern";

export const metadata: Metadata = {
  title: "SaaS Onboarding Flow Patterns | Unlock SaaS",
  description:
    "Eight SaaS onboarding patterns — linear walkthrough, in-product checklist, sample data, just-in-time, guided setup, concierge, trial-to-paid, empty-state-as-onboarding. When each fits.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "SaaS Onboarding Flow Patterns — Unlock SaaS",
    description:
      "Structural analysis of SaaS onboarding flow patterns, with fit / mistakes / variations per pattern.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Onboarding Flow Patterns",
    description:
      "Linear walkthrough, in-product checklist, sample data, just-in-time, guided setup, concierge, trial-to-paid, empty-state.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "SaaS Onboarding Flow Patterns",
  url: `${BASE_URL}/onboarding-pattern`,
  description:
    "Eight structural onboarding patterns for indie SaaS — design patterns, fit analysis, activation metrics, common implementation mistakes.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: ONBOARDING_PATTERN_ENTRIES.length,
    itemListElement: ONBOARDING_PATTERN_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/onboarding-pattern/${e.slug}`,
      description: e.intro,
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
      name: "Onboarding patterns",
      item: `${BASE_URL}/onboarding-pattern`,
    },
  ],
});

export default function OnboardingPatternHubPage() {
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
            Onboarding patterns
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Design patterns, fit analysis
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          SaaS onboarding flow patterns.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Eight structural onboarding patterns for indie SaaS — linear
          walkthrough, in-product checklist, sample data pre-population,
          just-in-time, guided setup wizard, concierge, trial-to-paid,
          empty-state-as-onboarding. Each page covers how the pattern
          works, when it fits, when it fails, the activation metric to
          track, implementation considerations, and the common mistakes.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {ONBOARDING_PATTERN_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/onboarding-pattern/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.patternName}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {e.intro}
                </p>
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
              Pair the pattern with the experiment recipe
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The pattern names the design shape; the experiment recipe
              tells you how to test which shape fits your users.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/experiment/onboarding-email-test">
                  Onboarding experiment
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
