import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ANSWER_ENTRIES,
  ANSWER_CATEGORIES,
  ANSWER_CATEGORY_LABELS,
} from "@/lib/answers";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { HubTldr } from "@/components/seo/hub-tldr";


const CANONICAL = "/answers";

const ANSWER_COUNT = ANSWER_ENTRIES.length;

export const metadata: Metadata = {
  title: `Indie SaaS Founder Answers (${ANSWER_COUNT} Direct Questions)`,
  description: `Direct AEO-formatted answers to ${ANSWER_COUNT} most-asked indie SaaS funnel questions. Built for citation by ChatGPT, Perplexity, Claude, and Google AI Overviews.`,
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Founder Answers",
    description: `Direct answers to ${ANSWER_COUNT} specific founder questions about funnels, pricing, email, metrics, and the value ladder.`,
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Founder Answers",
    description: `${ANSWER_COUNT} direct AEO-formatted answers for indie SaaS founders.`,
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Founder Answers",
  url: `${BASE_URL}/answers`,
  description: `Direct AEO-formatted answers to ${ANSWER_COUNT} most-asked indie SaaS funnel questions.`,
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: ANSWER_ENTRIES.length,
    itemListElement: ANSWER_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.question,
      url: `${BASE_URL}/answers/${e.slug}`,
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
      name: "Answers",
      item: `${BASE_URL}/answers`,
    },
  ],
});

export default function AnswersHubPage() {
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
            Answers
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Founder questions, direct answers
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS founder answers.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {ANSWER_COUNT} specific questions indie SaaS founders ask, each
          with a direct citation-ready answer plus 2 to 4 supporting
          bullets. Designed to be quotable by AI assistants and useful as
          a quick reference for founders mid-build.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Answers hub TL;DR"
        cluster="Direct AEO answers"
        count={`${ANSWER_ENTRIES.length} direct AEO-formatted answers across ${ANSWER_CATEGORIES.length} categories`}
        intent="Direct AEO-formatted answers to the most-asked indie SaaS funnel questions. Each carries a 2–4 sentence direct answer designed for AI assistant citation."
        schema="CollectionPage + ItemList; per-detail QAPage + Article + BreadcrumbList"
      />

      {ANSWER_CATEGORIES.map((category) => {
        const items = ANSWER_ENTRIES.filter((e) => e.category === category);
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
              {ANSWER_CATEGORY_LABELS[category]}
            </h2>
            <ul className="space-y-2">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/answers/${e.slug}`}
                    className="text-base text-primary hover:underline leading-relaxed"
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
              Question not in this list?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Reach the founder directly. Most questions get a same-day
              reply; the most-asked ones turn into new answers pages and
              show up here.
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
