import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PRICING_PAGE_PATTERN_SLUGS,
  getPricingPagePatternBySlug,
  type PricingPagePatternEntry,
} from "@/lib/pricing-page-examples";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import { DirectAnswer } from "@/components/seo/direct-answer";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";


export function generateStaticParams() {
  return PRICING_PAGE_PATTERN_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getPricingPagePatternBySlug(params.slug);
  if (!e) return {};

  const canonical = `/pricing-page-examples/${e.slug}`;
  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: e.metaTitle,
      description: e.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: e.metaTitle,
      description: e.metaDescription,
    },
  };
}

function buildJsonLd(
  e: PricingPagePatternEntry,
  canonicalUrl: string,
): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `${e.displayName}`,
      `${e.displayName} examples`,
      "SaaS pricing page",
      "pricing pattern",
      "indie SaaS",
    ].join(", "),
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: e.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage: "en-US",
      },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing page examples",
        item: `${BASE_URL}/pricing-page-examples`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.displayName,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
    JSON.stringify(faqPage),
    JSON.stringify(breadcrumbs),
  ];
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default async function PricingPagePatternDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getPricingPagePatternBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/pricing-page-examples/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />

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
          <li>
            <Link href="/pricing-page-examples" className="hover:underline">
              Pricing page examples
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pricing pattern
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
        >
          {e.tldr}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={e.lastVerified}>
            {formatVerifiedDate(e.lastVerified)}
          </time>
          {" · "}
          <Link
            href="/editorial-policy"
            className="underline hover:text-foreground"
          >
            editorial policy
          </Link>
        </p>
      </header>

      <Separator className="my-2" />

      {/* Direct answer – speakable TL;DR paragraph for AI Overviews,
          Perplexity, ChatGPT browse, Claude search. */}
      <DirectAnswer lastVerified={e.lastVerified} variant="tldr">
        {e.tldr}
      </DirectAnswer>

      <TldrSummary
        headingLabel={`${e.displayName} TL;DR`}
        items={[
          { term: "Pattern", definition: e.displayName },
          { term: "TL;DR", definition: e.tldr },
          { term: "When it works", definition: e.whenItWorks },
          { term: "When it backfires", definition: e.whenItBackfires },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mechanics"
      >
        <h2 id="mechanics" className="text-2xl font-bold mb-4 leading-tight">
          The mechanics
        </h2>
        <p className="text-base leading-relaxed">{e.mechanics}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="examples"
      >
        <h2 id="examples" className="text-2xl font-bold mb-4 leading-tight">
          Where you see this in the wild
        </h2>
        <ul className="space-y-3">
          {e.examplesInTheWild.map((ex) => (
            <li key={ex.name}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold mb-2">{ex.name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ex.note}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="fit"
      >
        <h2 id="fit" className="sr-only">
          Fit assessment
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              When it works
            </p>
            <p className="text-sm leading-relaxed">{e.whenItWorks}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-destructive mb-3">
              When it backfires
            </p>
            <p className="text-sm leading-relaxed">{e.whenItBackfires}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="brunson"
      >
        <h2 id="brunson" className="text-2xl font-bold mb-4 leading-tight">
          The Brunson lens
        </h2>
        <p className="text-base leading-relaxed">{e.brunsonLens}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-2xl font-bold mb-4 leading-tight">
          Common implementation mistakes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.commonMistakes.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask about {e.displayName.toLowerCase()}
        </h2>
        <div className="space-y-4">
          {e.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {glossaryLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-glossary"
        >
          <h2
            id="related-glossary"
            className="text-xl font-semibold mb-4 leading-tight"
          >
            Related Brunson terms
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {glossaryLinks.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/glossary/${g.slug}`}
                  className="text-primary hover:underline"
                >
                  {g.term} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Now diagnose your own pricing page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Patterns are the structure. The free 90-second Launch
              Diagnostic checks whether your pricing page is being read as
              Wrong Person, Weak Offer, or Weak Belief – the upstream
              diagnosis that determines whether any pattern works.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing-page-examples">Other patterns</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
