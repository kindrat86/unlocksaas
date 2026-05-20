import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CONVERSION_RATE_SLUGS,
  getConversionRateBySlug,
  type ConversionRateEntry,
} from "@/lib/conversion-rate";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";


export function generateStaticParams() {
  return CONVERSION_RATE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getConversionRateBySlug(params.slug);
  if (!e) return {};

  const canonical = `/conversion-rate/${e.slug}`;
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
  e: ConversionRateEntry,
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
      `conversion rate for ${e.displayName}`,
      `${e.displayName} benchmarks`,
      `SaaS conversion rate`,
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
        name: "Conversion rate",
        item: `${BASE_URL}/conversion-rate`,
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

export default async function ConversionRateDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getConversionRateBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/conversion-rate/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const niche = getNicheBySlug(e.slug);

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
            <Link href="/conversion-rate" className="hover:underline">
              Conversion rate
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
          Conversion benchmarks
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Conversion rates for {e.displayName}
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

      <TldrSummary
        headingLabel={`Conversion rate for ${e.displayName} TL;DR`}
        items={[
          { term: "Cohort", definition: e.displayName },
          { term: "TL;DR", definition: e.tldr },
          { term: "Good looks like", definition: e.goodLooksLike },
          { term: "Broken looks like", definition: e.brokenLooksLike },
          {
            term: "Most common diagnosis",
            definition: e.mostCommonDiagnosis,
          },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="stages">
        <h2 id="stages" className="text-2xl font-bold mb-4 leading-tight">
          Funnel-stage directional ranges
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          All ranges are directional. They depend on traffic source, price
          point, audience warmth, and cohort tightness. Use them to position
          your own numbers honestly, not as universal targets.
        </p>
        <ol className="space-y-4">
          {e.stages.map((s, i) => (
            <li key={s.stage}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Stage {i + 1}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 leading-tight">
                    {s.stage}
                  </h3>
                  <p className="text-xl font-bold text-primary mb-2 aeo-a">
                    {s.range}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.contextNote}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="states"
      >
        <h2 id="states" className="sr-only">
          What good vs. broken looks like
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Good looks like
            </p>
            <p className="text-sm leading-relaxed">{e.goodLooksLike}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-destructive mb-3">
              Broken looks like
            </p>
            <p className="text-sm leading-relaxed">{e.brokenLooksLike}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="diagnosis"
      >
        <h2 id="diagnosis" className="text-xl font-semibold mb-3 leading-tight">
          Most common Brunson diagnosis for {e.displayName}
        </h2>
        <p className="text-base leading-relaxed">
          When {e.displayName} hit the diagnostic with flat numbers, the
          most-common label that comes back is{" "}
          <span className="font-semibold text-foreground">
            {e.mostCommonDiagnosis}
          </span>
          . That doesn&rsquo;t mean every flat-rate cohort lands there –
          it&rsquo;s a directional priors signal worth checking first.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions {e.displayName} ask about conversion rates
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

      {niche ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="niche-link"
        >
          <h2
            id="niche-link"
            className="text-xl font-semibold mb-3 leading-tight"
          >
            More for {e.displayName}
          </h2>
          <p className="text-sm leading-relaxed">
            <Link
              href={`/for/${niche.slug}`}
              className="text-primary hover:underline"
            >
              The full diagnostic for {niche.displayName} →
            </Link>
            <br />
            <span className="text-sm text-muted-foreground">
              {niche.heroSubhead}
            </span>
          </p>
        </section>
      ) : null}

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
              How does your funnel actually compare?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Knowing the range doesn&rsquo;t fix the funnel – running the
              read does. The free 90-second Launch Diagnostic checks your
              live page against the {e.displayName} pattern and labels what
              specifically is flat.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/conversion-rate">Other cohorts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
