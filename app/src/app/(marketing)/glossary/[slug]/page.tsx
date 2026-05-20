import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  GLOSSARY_SLUGS,
  getGlossaryBySlug,
  resolveRelated,
  type GlossaryEntry,
  type GlossaryAppearance,
} from "@/lib/glossary";
import { ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
  buildQuotationNode,
} from "@/components/seo/json-ld";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForGlossary,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";
import { DateStampedAnswer } from "@/components/seo/date-stamped-answer";
import { CitationBlock } from "@/components/seo/citation-block";
import { getCitationForGlossary } from "@/lib/citations";

/**
 * Programmatic SEO surface – Glossary term: {term}.
 *
 * Surface A (organic) + Surface B (GEO/AEO) of strategy/google-strategy.md.
 * Fifth pSEO block, focusing on pure definitional intent.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Definitions are in the founder's voice. No copy-pasted phrasing.
 *   - Cross-links resolve at module load (see glossary.ts validate()).
 *   - lastVerified ISO visible in the footer.
 *
 * JSON-LD per page: DefinedTerm (the term itself), Article (the long
 * explanation), FAQPage (Q/A pairs an LLM can paraphrase), and
 * BreadcrumbList. The DefinedTerm @id matches the entry in the
 * site-wide DefinedTermSet (`#brunson-glossary`) so Google's structured-
 * data graph resolves the term as one entity across surfaces.
 *
 * Static rendering: force-static + dynamicParams=false. Every slug is
 * prerendered at build; unknown slugs 404 instead of being lazily
 * generated, so crawlers cannot discover phantom URLs.
 */

const BASE = "https://unlocksaas.com";


export function generateStaticParams() {
  return GLOSSARY_SLUGS.map((slug) => ({ slug }));
}

// ----- Per-page metadata -----------------------------------------------------

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const g = getGlossaryBySlug(params.slug);
  if (!g) return {};

  const canonical = `/glossary/${g.slug}`;
  const title = `${g.term} – Definition for Indie SaaS Founders`;
  const description = g.shortDefinition;

  return {
    title,
    description,
    alternates: markdownAlternate(canonical, `/glossary/${g.slug}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ----- JSON-LD (per-slug) ----------------------------------------------------

function buildJsonLd(
  g: GlossaryEntry,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  // DefinedTerm: matches the entry inside the site-wide DefinedTermSet
  // (id: #brunson-glossary) so a single canonical glossary node lives in
  // the schema graph. `name` and `description` mirror the short
  // definition published on the funnel hub – drift-free by construction
  // (the short definition is read from entity.DEFINED_TERMS at module
  // load, same source the hub uses).
  const definedTerm = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${canonicalUrl}#term`,
    name: g.term,
    description: g.shortDefinition,
    // Repointed to /glossary#defined-term-set per PR #32 — the canonical
    // DefinedTermSet @id now resolves to the glossary hub, not the homepage
    // hash anchor. Detail-page DefinedTerm rows reference the set there.
    inDefinedTermSet: `${BASE}/glossary#defined-term-set`,
    url: canonicalUrl,
    inLanguage: "en-US",
  };

  // Article: carries the long explanation, why-it-matters paragraph,
  // and the worked example. Same @id discipline as the funnel teardown
  // articles – author and publisher resolve to the site-wide
  // Person and Organization nodes.
  //
  // Article.citation: schema.org Quotation chain for verbatim external
  // sources. Bound here (not as a detached @graph node) so the citation
  // graph stays connected to the article it supports. Brunson Hard-Rule:
  // empty when no verbatim quotes are curated for this entry – module
  // load already ran validateQuotations() so any entry that ships here
  // is honesty-gated. See @/lib/seo/quotation.
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${g.term} – Definition for Indie SaaS Founders`,
    description: g.shortDefinition,
    abstract: g.longDefinition,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: g.lastVerified,
    dateModified: g.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: { "@id": `${canonicalUrl}#term` },
    mentions: [{ "@id": `${canonicalUrl}#term` }],
    keywords: [g.term, g.category, "Brunson", "indie SaaS"].join(", "),
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
    // `citation` field points at the stable /cite/[id] permalink.
    // The permalink view itself emits a WebPage schema with
    // mainEntity back to this canonical URL, completing the
    // bidirectional citation graph LLM training corpora index.
    citation: {
      "@type": "CreativeWork",
      "@id": `${BASE}/cite/glossary-${g.slug}`,
      url: `${BASE}/cite/glossary-${g.slug}`,
      name: `Stable citation permalink for ${g.term}`,
    },
  };
  if (g.quotations && g.quotations.length > 0) {
    article.citation = g.quotations.map(buildQuotationNode);
  }

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: faqsForSchema.map((f) => ({
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
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Glossary",
        item: `${BASE}/glossary`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: g.term,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(definedTerm),
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

// ----- Appearance link rendering --------------------------------------------

/** Resolve a structured appearance entry to an internal href. */
function appearanceHref(a: GlossaryAppearance): string {
  switch (a.kind) {
    case "funnel-teardown":
      return `/funnel-teardown/${a.slug}`;
    case "pricing-teardown":
      return `/pricing-teardown/${a.slug}`;
    case "compare":
      return `/compare/${a.slug}`;
    case "alternatives-to":
      return `/alternatives-to/${a.slug}`;
    case "category":
      return `/category/${a.slug}`;
    case "page":
      return a.href;
  }
}

// ----- Page ------------------------------------------------------------------

export default async function GlossaryDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const g = getGlossaryBySlug(params.slug);
  if (!g) notFound();

  const canonicalUrl = `${BASE}/glossary/${g.slug}`;
  const paaPairs = paaForGlossary(g);
  const mergedFaqs = mergePaaIntoFaqs(g.faqs, paaPairs);
  const [termJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    g,
    canonicalUrl,
    mergedFaqs,
  );

  // Resolve related terms once at render time (sibling lookups are O(1)).
  const related = (g.relatedTerms ?? [])
    .map((slug) => resolveRelated(slug))
    .filter((r): r is NonNullable<ReturnType<typeof resolveRelated>> =>
      Boolean(r),
    );

  // Resolve the citation record for this glossary entry. Materialised
  // once at module load (citations.ts REGISTRY), this is an O(1) map
  // lookup. Returns undefined only if the citation library is missing
  // a row – CitationBlock no-ops gracefully in that case.
  const citation = getCitationForGlossary(g.slug);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={termJson} />
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />

      {/* Breadcrumb */}
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
            <Link href="/glossary" className="hover:underline">
              Glossary
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {g.term}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Glossary · {g.category} layer
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {g.term}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {g.shortDefinition}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={g.lastVerified}>
            {formatVerifiedDate(g.lastVerified)}
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

      {/* TL;DR – speakable anchor for voice engines */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="tldr"
      >
        <h2 id="tldr" className="sr-only">
          Short definition
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Short definition
            </p>
            <DateStampedAnswer
              lastVerified={g.lastVerified}
              variant="definition"
            >
              {g.shortDefinition}
            </DateStampedAnswer>
          </CardContent>
        </Card>
      </section>

      {/* Long definition */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="long"
      >
        <h2 id="long" className="text-2xl font-bold mb-4 leading-tight">
          What it actually means
        </h2>
        <p className="text-base leading-relaxed whitespace-pre-line">
          {g.longDefinition}
        </p>
      </section>

      {/* Why it matters */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why"
      >
        <h2 id="why" className="text-2xl font-bold mb-4 leading-tight">
          Why it matters for a post-launch pre-revenue founder
        </h2>
        <p className="text-base leading-relaxed whitespace-pre-line">
          {g.whyItMatters}
        </p>
      </section>

      {/* How to apply */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="apply"
      >
        <h2 id="apply" className="text-2xl font-bold mb-4 leading-tight">
          How to apply it on your page
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {g.howToApply.map((b) => (
            <li key={b} className="text-base leading-relaxed">
              {b}
            </li>
          ))}
        </ol>
      </section>

      {/* Worked example */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="example"
      >
        <h2 id="example" className="text-2xl font-bold mb-4 leading-tight">
          Example
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed">{g.example}</p>
          </CardContent>
        </Card>
      </section>

      {/* Common confusions */}
      {g.commonConfusions && g.commonConfusions.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="confusions"
        >
          <h2
            id="confusions"
            className="text-2xl font-bold mb-4 leading-tight"
          >
            Often confused with
          </h2>
          <div className="space-y-3">
            {g.commonConfusions.map((c) => (
              <Card key={c.term}>
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold mb-2">{c.term}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.difference}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* Where it shows up on the site */}
      {g.appearsIn && g.appearsIn.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="appears"
        >
          <h2
            id="appears"
            className="text-2xl font-bold mb-4 leading-tight"
          >
            Where this term is applied on the site
          </h2>
          <ul className="space-y-3">
            {g.appearsIn.map((a) => (
              <li key={appearanceHref(a) + a.label} className="text-sm">
                <Link
                  href={appearanceHref(a)}
                  className="text-primary hover:underline font-semibold"
                >
                  {a.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Related terms */}
      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related"
        >
          <h2 id="related" className="text-2xl font-bold mb-4 leading-tight">
            Related terms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {related.map((r) => (
              <Card key={r.slug} className="hover:border-primary/30 transition">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold mb-2">
                    <Link
                      href={`/glossary/${r.slug}`}
                      className="hover:text-primary transition"
                    >
                      {r.term} →
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.shortDefinition}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* People Also Ask – question-form H3s matched to canonical PAA
          phrasings, sourced from this entry's curated fields. */}
      <PeopleAlsoAsk pairs={paaPairs} />

      {/* FAQ */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="faq"
      >
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask about {g.term}
        </h2>
        <div className="space-y-4">
          {g.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Citation – formal citation strings for academic / agent re-use. */}
      <section className="max-w-3xl mx-auto px-6 py-10 border-t border-border/40">
        <CitationBlock citation={citation} headingLevel="h2" />
      </section>

      {/* CTA */}
      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              See {g.term} applied to your page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second diagnostic applies the Hook / Story / Offer
              framework to your live product page and labels what is
              broken: Wrong Person, Weak Offer, or Weak Belief.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/glossary">Back to the glossary</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Every definition on this page is in the founder&apos;s own words
          and appears on a shipped surface. Russell Brunson&apos;s frameworks
          are the underlying source. If anything reads off, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and the entry gets a corrections-log row in /editorial-policy.
        </p>
      </footer>
    </article>
  );
}
