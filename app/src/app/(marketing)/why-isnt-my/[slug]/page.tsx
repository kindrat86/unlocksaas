import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  WHY_ISNT_MY_SLUGS,
  getWhyIsntMyBySlug,
  type WhyIsntMyEntry,
} from "@/lib/why-isnt-my";

/**
 * Per-slug cached entry lookup. Source is a frozen `.ts` array so the cache
 * has nothing to invalidate today, but the `why-isnt-my:<slug>` tag is in
 * place for the future move to Supabase/Markdown — at that point a Server
 * Action that updates a single entry can call
 * `revalidateTag('why-isnt-my:${slug}', 'max')` to refresh just that page.
 * `cacheLife('max')` is correct for the current build-time data: invalidated
 * only by the next deploy (build-id keyed).
 */
async function getCachedEntry(slug: string): Promise<WhyIsntMyEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`why-isnt-my:${slug}`);
  return getWhyIsntMyBySlug(slug);
}

import { glossaryTermSlug, getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForWhyIsntMy,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";
import { DateStampedAnswer } from "@/components/seo/date-stamped-answer";
import { getRelatedClustersForWhyIsntMy } from "@/lib/seo/cluster-relations";


export function generateStaticParams() {
  return WHY_ISNT_MY_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = await getCachedEntry(params.slug);
  if (!e) return {};

  const canonical = `/why-isnt-my/${e.slug}`;
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
  e: WhyIsntMyEntry,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
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
      `why isn't my ${e.element} converting`,
      `${e.element} conversion`,
      "indie SaaS",
      "Brunson",
    ].join(", "),
    inLanguage: "en-US",
    // Speakable + access-mode: the TL;DR paragraph (marked
    // `data-speakable` in the rendered DOM, matching the
    // [data-speakable] selector in SPEAKABLE_SELECTORS) is the
    // canonical voice-readable answer for "why isn't my <element>
    // converting" voice queries. ACCESS_MODE_TEXTUAL declares the
    // page is fully consumable as text — safe to read aloud
    // without missing meaning carried by images/video.
    speakable: buildSpeakable(
      '[data-speakable="diagnosis"]',
      '[data-speakable="fix"]',
    ),
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
        name: "Why isn't my",
        item: `${BASE_URL}/why-isnt-my`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Why isn't my ${e.element} converting`,
        item: canonicalUrl,
      },
    ],
  };

  // QAPage: the page IS the answer to one canonical founder question.
  // Distinct from the sibling FAQPage above – the FAQPage carries the
  // PAA follow-ups (3-5 supporting Q+A pairs); the QAPage carries the
  // single primary Q+A that this URL exists to answer.
  //
  // LLM citation pipelines (Perplexity, ChatGPT, Claude, Google AI Mode)
  // preferentially cite QAPage-typed surfaces for direct-answer queries.
  // FAQPage is the citation surface for ancillary "people also ask" hits.
  // Shipping both on the same URL is the documented schema.org pattern.
  const qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "@id": `${canonicalUrl}#qa`,
    url: canonicalUrl,
    inLanguage: "en-US",
    mainEntity: {
      "@type": "Question",
      name: `Why isn't my ${e.element} converting?`,
      text: `Why isn't my ${e.element} converting?`,
      author: { "@id": ID.person },
      dateCreated: e.lastVerified,
      answerCount: 1 + e.diagnoses.length,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.tldr,
        author: { "@id": ID.person },
        dateCreated: e.lastVerified,
      },
      suggestedAnswer: e.diagnoses.map((d) => ({
        "@type": "Answer",
        text: `${d.label}: ${d.appearance} Fix to try this week: ${d.fix}`,
        author: { "@id": ID.person },
        dateCreated: e.lastVerified,
      })),
    },
  };

  return [
    JSON.stringify(article),
    JSON.stringify(faqPage),
    JSON.stringify(breadcrumbs),
    JSON.stringify(qaPage),
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

export default async function WhyIsntMyDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = await getCachedEntry(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/why-isnt-my/${e.slug}`;
  const paaPairs = paaForWhyIsntMy(e);
  const mergedFaqs = mergePaaIntoFaqs(e.faqs, paaPairs);
  const [articleJson, faqJson, breadcrumbJson, qaJson] = buildJsonLd(
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
            <Link href="/why-isnt-my" className="hover:underline">
              Why isn&rsquo;t my
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.element} converting
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Panic-mode diagnostic
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Why isn&rsquo;t my {e.element} converting?
        </h1>
        <DateStampedAnswer
          lastVerified={e.lastVerified}
          variant="diagnosis"
          className="text-lg text-muted-foreground"
        >
          {e.tldr}
        </DateStampedAnswer>
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
        headingLabel={`Why isn't my ${e.element} converting key facts`}
        items={[
          { term: "Element", definition: e.element },
          { term: "Most common cause", definition: e.tldr },
          {
            term: "Directional range",
            definition: `${e.directionalRange.range} – ${e.directionalRange.note}`,
          },
          ...e.diagnoses.map((d) => ({
            term: d.label,
            definition: d.appearance,
          })),
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="diagnoses"
      >
        <h2 id="diagnoses" className="text-2xl font-bold mb-4 leading-tight">
          The three diagnoses
        </h2>
        <div className="space-y-4">
          {e.diagnoses.map((d) => (
            <Card key={d.label} className="border-primary/20">
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">
                  {d.label}
                </p>
                <p className="text-sm font-semibold mb-2">What it looks like</p>
                <p
                  className="text-base leading-relaxed mb-4"
                  data-speakable="diagnosis"
                >
                  {d.appearance}
                </p>
                <p className="text-sm font-semibold mb-2">The fix</p>
                <p
                  className="text-base leading-relaxed"
                  data-speakable="fix"
                >
                  {d.fix}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="range"
      >
        <h2 id="range" className="text-2xl font-bold mb-4 leading-tight">
          Directional range
        </h2>
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-3xl font-bold mb-2">{e.directionalRange.range}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {e.directionalRange.note}
            </p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="checklist"
      >
        <h2 id="checklist" className="text-2xl font-bold mb-4 leading-tight">
          The 5-step checklist (run today)
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {e.checklist.map((c) => (
            <li key={c} className="text-base leading-relaxed">
              {c}
            </li>
          ))}
        </ol>
      </section>

      {/* People Also Ask – canonical "Why isn't my X" PAA H3s sourced
          from this entry's tldr, directional range, and checklist. */}
      <PeopleAlsoAsk pairs={paaPairs} />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="faq"
      >
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask
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

      {/* ----- Cross-cluster sidebar (2026-05-21 audit fix #1):
            tie this diagnostic to the directional metric founders
            should aim for and the canonical playbook that fixes the
            element. Every link is derived from the manifest by
            token-sequence matching (lib/seo/cluster-relations.ts); a
            stale or missing sibling silently drops out. ----- */}
      {(() => {
        const related = getRelatedClustersForWhyIsntMy(e.slug);
        if (!related) return null;
        if (!related.benchmark && !related.funnelPlaybook) return null;
        return (
          <section
            className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
            aria-labelledby="cross-cluster"
          >
            <h2
              id="cross-cluster"
              className="text-lg font-bold mb-4 leading-tight"
            >
              Where this diagnostic shows up across the rest of the site
            </h2>
            <ul className="space-y-2">
              {related.benchmark ? (
                <li>
                  <Link
                    href={`/benchmarks/${related.benchmark.slug}`}
                    className="group flex items-start gap-2 text-sm hover:text-primary transition"
                  >
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground group-hover:text-primary shrink-0"
                    >
                      →
                    </span>
                    <span>
                      <span className="font-semibold capitalize">
                        {related.benchmark.metric}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — directional range you should be hitting
                      </span>
                    </span>
                  </Link>
                </li>
              ) : null}
              {related.funnelPlaybook ? (
                <li>
                  <Link
                    href={`/funnel-playbook/${related.funnelPlaybook.slug}`}
                    className="group flex items-start gap-2 text-sm hover:text-primary transition"
                  >
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground group-hover:text-primary shrink-0"
                    >
                      →
                    </span>
                    <span>
                      <span className="font-semibold">
                        {related.funnelPlaybook.displayName} playbook
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — the step-by-step build that fixes this element
                      </span>
                    </span>
                  </Link>
                </li>
              ) : null}
            </ul>
          </section>
        );
      })()}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              See the diagnosis applied to your live {e.element}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic runs the Wrong Person /
              Weak Offer / Weak Belief triage on your actual URL and tells
              you which diagnosis fits before you ship the fix.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/why-isnt-my">Other diagnostics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
