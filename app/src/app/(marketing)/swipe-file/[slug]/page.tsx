import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SWIPE_FILE_SLUGS,
  getSwipeFileBySlug,
  resolveSwipeFileRealExamples,
  type SwipeFileEntry,
} from "@/lib/swipe-files";
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
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForSwipeFile,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";

/**
 * /swipe-file/[slug] – per-funnel-element pattern library detail page.
 *
 * Mirrors the shape of /funnel-playbook/[slug] but with the data axis
 * being a funnel element (hero headline, CTA, pricing table, OTO, etc.)
 * and each "step" replaced with a named pattern (formula + example +
 * notes). Article + ItemList + FAQPage + BreadcrumbList JSON-LD per
 * detail page.
 *
 * Brunson Hard-Rule reconciliation: each example is a template formula
 * + a synthesized example. Notes explain the structural mechanic; no
 * fabricated metrics, no quoted competitor copy.
 */

export function generateStaticParams() {
  return SWIPE_FILE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getSwipeFileBySlug(params.slug);
  if (!e) return {};

  const canonical = `/swipe-file/${e.slug}`;
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
  e: SwipeFileEntry,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${e.displayName} – named patterns`,
    description: e.tldr,
    numberOfItems: e.examples.length,
    itemListElement: e.examples.map((ex, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: ex.pattern,
      description: `Formula: ${ex.formula} | Example: ${ex.example}`,
    })),
    inLanguage: "en-US",
  };

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
      `${e.element} swipe file`,
      `${e.element} examples`,
      `${e.element} patterns`,
      "indie SaaS",
      "Brunson",
    ].join(", "),
    inLanguage: "en-US",
    // Speakable: the TL;DR is the canonical voice answer for the
    // "what is a <element> swipe file" voice query. Marked
    // [data-speakable] in the rendered DOM so voice surfaces read
    // exactly the TL;DR, not the formula list (which is scannable
    // but not voice-natural).
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
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
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Swipe files",
        item: `${BASE_URL}/swipe-file`,
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
    JSON.stringify(itemList),
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

export default async function SwipeFileDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getSwipeFileBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/swipe-file/${e.slug}`;
  const paaPairs = paaForSwipeFile(e);
  const mergedFaqs = mergePaaIntoFaqs(e.faqs, paaPairs);
  const [articleJson, itemListJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
    mergedFaqs,
  );

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const realExamples = resolveSwipeFileRealExamples(e);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={itemListJson} />
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
            <Link href="/swipe-file" className="hover:underline">
              Swipe files
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
          Swipe file
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
          { term: "Element", definition: e.elementPlural },
          { term: "TL;DR", definition: e.tldr },
          { term: "When to use", definition: e.whenToUse },
          { term: "When NOT to use", definition: e.whenNotToUse },
          { term: "Brunson lens", definition: e.brunsonLens },
          {
            term: "Patterns",
            definition: `${e.examples.length} named patterns with formula + example + structural notes`,
          },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="fit"
      >
        <h2 id="fit" className="sr-only">
          When to use
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Rewrite this when
            </p>
            <p className="text-sm leading-relaxed">{e.whenToUse}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-destructive mb-3">
              Do NOT touch when
            </p>
            <p className="text-sm leading-relaxed">{e.whenNotToUse}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="patterns"
      >
        <h2 id="patterns" className="text-2xl font-bold mb-4 leading-tight">
          {e.examples.length} named patterns
        </h2>
        <ol className="space-y-4">
          {e.examples.map((ex, i) => (
            <li key={ex.pattern}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Pattern {i + 1}
                  </p>
                  <h3 className="text-lg font-semibold mb-3 leading-tight">
                    {ex.pattern}
                  </h3>
                  <div className="space-y-3 text-sm leading-relaxed">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Formula
                      </p>
                      <p className="font-mono text-sm text-foreground">
                        {ex.formula}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Example
                      </p>
                      <p className="text-foreground">{ex.example}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Why it works
                      </p>
                      <p className="text-muted-foreground">{ex.notes}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
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

      {realExamples.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="real-examples"
        >
          <h2
            id="real-examples"
            className="text-2xl font-bold mb-4 leading-tight"
          >
            Real examples from indie SaaS teardowns
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Pattern names above are illustrative. These are real,
            named, dated funnels from the Unlock SaaS teardown set
            where the {e.element} demonstrates the pattern in a
            shipping product. Funnel-hack the real ones.
          </p>
          <ul className="space-y-4">
            {realExamples.map((r) => (
              <li key={`${r.teardownSlug}-${r.ref.lens}`}>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      {r.ref.lens} lens
                    </p>
                    <h3 className="text-lg font-semibold mb-1 leading-tight">
                      <Link
                        href={r.url}
                        className="text-primary hover:underline"
                      >
                        {r.displayName}
                      </Link>
                      {" "}
                      <span className="text-foreground font-normal italic">
                        – {r.patternName}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground italic leading-relaxed mb-3">
                      {r.oneLine}
                    </p>
                    <p className="text-sm text-foreground leading-relaxed mb-3">
                      {r.ref.why}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      From the teardown:{" "}
                      <span className="italic">{r.analysis}</span>
                    </p>
                    <p className="mt-3">
                      <Link
                        href={r.url}
                        className="text-xs text-primary hover:underline"
                      >
                        Read the full {r.displayName} teardown →
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="lens"
      >
        <h2 id="lens" className="text-xl font-semibold mb-3 leading-tight">
          Which Brunson job does this element do?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This element sits in the{" "}
          <strong className="text-foreground">{e.brunsonLens}</strong> lens.
          Knowing the lens tells you what the element is supposed to
          accomplish, not just what shape it takes – so you don&rsquo;t
          rewrite a Story element using Hook tactics or vice versa.
        </p>
      </section>

      <PeopleAlsoAsk pairs={paaPairs} />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask about {e.element} copy
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
              Apply these patterns to your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic checks whether the{" "}
              {e.element} is actually the broken step on your page, or
              whether the bottleneck is upstream.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/swipe-file">Other swipe files</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
