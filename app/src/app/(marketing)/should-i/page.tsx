import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SHOULD_I_ENTRIES,
  SHOULD_I_CATEGORIES,
  SHOULD_I_CATEGORY_LABELS,
  SHOULD_I_VERDICT_LABELS,
  type ShouldIVerdict,
} from "@/lib/should-i";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/should-i";

export const metadata: Metadata = {
  title:
    "Should I…? Indie SaaS Founder Decisions (Direct Answers) – Unlock SaaS",
  description:
    "Direct yes / no / depends / not-yet verdicts on the decisions indie SaaS founders actually face. Built for citation by ChatGPT, Perplexity, Claude, and Google AI Overviews.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Should I…? Indie SaaS Founder Decisions – Unlock SaaS",
    description:
      "Yes / no / depends / not-yet verdicts on the decisions indie SaaS founders actually face.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Should I…? Indie SaaS Founder Decisions",
    description:
      "Direct verdicts on the decisions indie SaaS founders actually face.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Founder Decisions",
  url: `${BASE_URL}/should-i`,
  description:
    "Direct yes / no / depends / not-yet verdicts on the decisions indie SaaS founders actually face.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: SHOULD_I_ENTRIES.length,
    itemListElement: SHOULD_I_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.question,
      url: `${BASE_URL}/should-i/${e.slug}`,
      description: e.directAnswer,
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
      name: "Should I…?",
      item: `${BASE_URL}/should-i`,
    },
  ],
});

function VerdictBadge({ verdict }: { verdict: ShouldIVerdict }) {
  const variant: Record<ShouldIVerdict, "default" | "secondary" | "outline"> = {
    yes: "default",
    no: "outline",
    depends: "secondary",
    "not-yet": "secondary",
  };
  return (
    <Badge variant={variant[verdict]} className="text-xs uppercase tracking-wide">
      {SHOULD_I_VERDICT_LABELS[verdict]}
    </Badge>
  );
}

export default function ShouldIHubPage() {
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
            Should I…?
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Founder decisions, direct verdicts
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Should I…? Indie SaaS founder decisions.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {SHOULD_I_ENTRIES.length} specific decisions indie SaaS founders
          actually face, each with a binary verdict, the reasoning behind
          it, and supporting bullets. Designed to be quotable by AI
          assistants and useful as a quick gut-check mid-build.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Should I…? hub TL;DR"
        cluster="Decision-helper AEO answers"
        count={`${SHOULD_I_ENTRIES.length} yes / no / depends / not-yet verdicts across ${SHOULD_I_CATEGORIES.length} categories`}
        intent="Decision-tree shaped AEO answers. Each carries a single verdict plus reasoning, designed for AI assistant citation in the 'should I X?' query shape."
        schema="CollectionPage + ItemList; per-detail FAQPage + Article + BreadcrumbList"
      />

      {SHOULD_I_CATEGORIES.map((category) => {
        const items = SHOULD_I_ENTRIES.filter((e) => e.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`cat-${category}`}
          >
            <h2
              id={`cat-${category}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {SHOULD_I_CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-2">
              {items.map((e) => (
                <li
                  key={e.slug}
                  className="flex items-start gap-3 leading-relaxed"
                >
                  <span className="mt-0.5 shrink-0">
                    <VerdictBadge verdict={e.verdict} />
                  </span>
                  <Link
                    href={`/should-i/${e.slug}`}
                    className="text-base text-primary hover:underline"
                  >
                    {e.question}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Decision not in this list?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Reach the founder directly. Most decisions get a same-day
              reply; the most-asked ones turn into new pages and show up
              here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/contact">Ask a question</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
