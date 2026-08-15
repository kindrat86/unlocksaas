import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { SAAS_FEATURE_PATTERN_ENTRIES } from "@/lib/saas-feature-patterns";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/saas-feature-pattern";

export const metadata: Metadata = {
  title: "SaaS Growth Feature Patterns | Unlock SaaS",
  description:
    "Structural design patterns for SaaS growth features — referral programs, freemium gates, paywalls, upgrade prompts, in-app surveys, annual upgrade prompts, team invitations.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "SaaS Growth Feature Patterns — Unlock SaaS",
    description:
      "Structural design patterns for SaaS growth features with fit analysis, target metrics, implementation considerations, and common misuses.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Growth Feature Patterns",
    description: "Referral, freemium, paywall, upgrade prompt, survey, annual upgrade, team invitation.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "SaaS Growth Feature Patterns",
  url: `${BASE_URL}/saas-feature-pattern`,
  description:
    "Structural design patterns for SaaS growth features. Each entry covers when the pattern fits, target metrics, implementation considerations, and common misuses.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: SAAS_FEATURE_PATTERN_ENTRIES.length,
    itemListElement: SAAS_FEATURE_PATTERN_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/saas-feature-pattern/${e.slug}`,
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
      name: "SaaS feature patterns",
      item: `${BASE_URL}/saas-feature-pattern`,
    },
  ],
});

export default function SaasFeaturePatternHubPage() {
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
            SaaS feature patterns
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Growth features, structural patterns
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          SaaS growth feature patterns.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Seven structural design patterns for the SaaS growth features
          indie founders most often build — referral programs, freemium
          gates, paywalls, in-product upgrade prompts, in-app surveys,
          monthly-to-annual upgrade prompts, team invitation flows.
          Each page covers how the pattern works, when it fits, when it
          fails, the target growth metric, implementation considerations,
          and the common indie SaaS misuses.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Distinct from{" "}
          <Link
            href="/onboarding-pattern"
            className="text-primary hover:underline"
          >
            /onboarding-pattern
          </Link>{" "}
          (onboarding-specific) and{" "}
          <Link href="/pricing-model" className="text-primary hover:underline">
            /pricing-model
          </Link>{" "}
          (pricing-structure).
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {SAAS_FEATURE_PATTERN_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/saas-feature-pattern/${e.slug}`}
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
              Test the pattern before fully committing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Each growth feature pattern is an investment. The experiment
              recipes test the pattern's actual lift on your product
              before you commit to it long-term.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/experiment">Experiment recipes</Link>
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
