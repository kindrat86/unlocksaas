import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { STACK_ENTRIES, getNicheForStack } from "@/lib/stacks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/stack-for";

export const metadata: Metadata = {
  title:
    "The Indie SaaS Stack, Per Niche – 12 Cohort-Tuned Tool Rosters",
  description:
    "Twelve opinionated indie SaaS stacks. The same category-leading tools, picked and ordered for one specific cohort: course creators, agency owners, SaaS founders, coaches, and 8 others.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "The Indie SaaS Stack, Per Niche",
    description:
      "Twelve opinionated tool rosters – one per cohort. Pick the closest fit.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Indie SaaS Stack, Per Niche",
    description: "Twelve opinionated indie SaaS tool rosters – one per cohort.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS stacks by niche",
  url: `${BASE_URL}/stack-for`,
  description:
    "Opinionated indie SaaS tool rosters per cohort, each pulling from the Unlock SaaS pricing-teardown catalog.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: STACK_ENTRIES.length,
    itemListElement: STACK_ENTRIES.map((s, i) => {
      const niche = getNicheForStack(s);
      return {
        "@type": "ListItem",
        position: i + 1,
        name: `Indie SaaS stack for ${niche?.displayName ?? s.slug}`,
        url: `${BASE_URL}/stack-for/${s.slug}`,
        description: s.heroSubhead,
      };
    }),
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
      name: "Stack for",
      item: `${BASE_URL}/stack-for`,
    },
  ],
});

export default function StackForHubPage() {
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
            Stack for
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Niche stacks
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The indie SaaS stack, tuned to your cohort.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Twelve opinionated tool rosters – the same category-leading tools,
          picked and ordered for one specific cohort. Each stack draws from
          the Unlock SaaS pricing-teardown catalog so every recommendation
          has a verified analysis behind it.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Stack hub TL;DR"
        cluster="Cohort-tuned indie SaaS stacks"
        count={`${STACK_ENTRIES.length} stacks, each with 6-8 tools in funnel order`}
        intent="Pick the closest cohort fit and ship the marketing layer your shipped product is missing."
        schema="CollectionPage + ItemList; per-detail Article + ItemList + FAQPage + BreadcrumbList"
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="stacks"
      >
        <h2 id="stacks" className="sr-only">
          Stacks by niche
        </h2>
        {STACK_ENTRIES.map((s) => {
          const niche = getNicheForStack(s);
          return (
            <Card key={s.slug} className="hover:border-primary/40 transition">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold leading-tight mb-2">
                  <Link
                    href={`/stack-for/${s.slug}`}
                    className="hover:underline capitalize"
                  >
                    Stack for {niche?.displayName ?? s.slug}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {s.heroSubhead}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {s.tools.length} tools in funnel order
                </p>
                <Link
                  href={`/stack-for/${s.slug}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  See the stack →
                </Link>
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
              Not in this list? The diagnostic works anyway.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Hook / Story / Offer triage is cohort-agnostic. The
              niche-specific stacks above tune the tool roster; the
              underlying diagnosis works on any post-launch pre-revenue
              founder page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing-teardown">All pricing teardowns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
