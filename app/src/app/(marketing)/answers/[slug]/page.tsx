import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ANSWER_SLUGS,
  ANSWER_ENTRIES,
  getAnswerBySlug,
  type AnswerEntry,
} from "@/lib/answers";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import { paaForAnswer } from "@/lib/seo/paa-questions";
import { DateStampedAnswer } from "@/components/seo/date-stamped-answer";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";


export function generateStaticParams() {
  return ANSWER_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getAnswerBySlug(params.slug);
  if (!e) return {};

  const canonical = `/answers/${e.slug}`;
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
  e: AnswerEntry,
  canonicalUrl: string,
  paaPairs: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  // QAPage is the right schema for a direct-answer page (Q + accepted answer).
  // Google's structured-data team explicitly documents QAPage as the
  // citation-friendly format for single-question pages.
  //
  // SpeakableSpecification curated per-page so voice engines (Google
  // Assistant, ChatGPT Voice, Perplexity voice) extract exactly the
  // question + direct answer + supporting bullets, not nav or CTA.
  // Stable [data-llm-summary] handle is auto-included by buildSpeakable.
  const speakable = buildSpeakable(
    '[data-speakable="question"]',
    '[data-speakable="direct-answer"]',
    '[data-speakable="supporting"]',
  );

  const qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage: "en-US",
    speakable,
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: {
      "@type": "Question",
      name: e.question,
      text: e.question,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.directAnswer,
        inLanguage: "en-US",
        upvoteCount: 0,
        author: { "@id": ID.person },
      },
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.question,
    description: e.metaDescription,
    abstract: e.directAnswer,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: "en-US",
    speakable,
    ...ACCESS_MODE_TEXTUAL,
  };

  const breadcrumbs = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: e.question,
        item: canonicalUrl,
      },
    ],
  };

  // FAQPage emitted alongside QAPage: the PAA H3s rendered on the page
  // (the primary question + the supporting-point follow-ups) feed
  // FAQPage rich-result eligibility. QAPage handles the canonical "one
  // question, one accepted answer" intent; FAQPage handles the
  // multi-question PAA-style nuance.
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: paaPairs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage: "en-US",
      },
    })),
  };

  return [
    JSON.stringify(qaPage),
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

export default async function AnswerDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getAnswerBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/answers/${e.slug}`;
  const paaPairs = paaForAnswer(e);
  const [qaJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
    paaPairs,
  );

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const related = ANSWER_ENTRIES.filter(
    (other) => other.category === e.category && other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={qaJson} />
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
            <Link href="/answers" className="hover:underline">
              Answers
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.question}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Answer
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
          data-speakable="question"
        >
          {e.question}
        </h1>
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
        headingLabel={`Answer key facts`}
        items={[
          { term: "Question", definition: e.question },
          { term: "Direct answer", definition: e.directAnswer },
          { term: "Category", definition: e.category.replace(/-/g, " ") },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="direct"
      >
        <h2 id="direct" className="sr-only">
          Direct answer
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Direct answer
            </p>
            <div data-speakable="direct-answer">
              <DateStampedAnswer
                lastVerified={e.lastVerified}
                variant="answer"
              >
                {e.directAnswer}
              </DateStampedAnswer>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* People Also Ask – PAA H3s sourced from this entry's
          supporting points; the entry's question + directAnswer is the
          QAPage primary, and these are the nuance follow-ups. */}
      <PeopleAlsoAsk pairs={paaPairs} />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="supporting"
      >
        <h2 id="supporting" className="text-xl font-semibold mb-4 leading-tight">
          Supporting points
        </h2>
        <ul
          className="space-y-3 list-disc list-inside"
          data-speakable="supporting"
        >
          {e.supporting.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {glossaryLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-glossary"
        >
          <h2
            id="related-glossary"
            className="text-base font-semibold mb-3 leading-tight"
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

      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related"
        >
          <h2
            id="related"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Related questions
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/answers/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {r.question}
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
              See this applied to your page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic applies the Hook / Story
              / Offer triage to your actual URL and labels what&rsquo;s
              broken. Same triage that informs every answer on this site.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/answers">All answers</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
