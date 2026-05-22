import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  OUTCOME_SLUGS,
  getOutcomeBySlug,
  type OutcomeEntry,
} from "@/lib/outcomes";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * /get-[outcome] – outcome-promise landing page.
 *
 * URL shape: /get-<slug> (e.g. /get-first-paying-customer). The mixed
 * static-dynamic folder name `get-[outcome]` preserves the
 * "get first paying customer" all-in-one URL segment that the founder
 * actually types into Google, instead of splitting it into /get/<slug>.
 *
 * One data file (src/lib/outcomes.ts), one route. Each entry renders
 * with Article + HowTo + FAQPage + BreadcrumbList JSON-LD and threads
 * back to the canonical free Launch Diagnostic CTA. The Offer that
 * lands the reader is always the same; what changes per outcome page is
 * the Hook (the specific result being searched for) and the Story
 * (why that result is hard for most and what the Brunson move actually
 * is).
 *
 * Brunson Hard-Rule reconciliation:
 *   - No invented timeframes ("in 7 days") unless the mechanism is named.
 *   - No invented testimonials per outcome.
 *   - Each page describes the same product, in the language of the
 *     result the reader came searching for.
 */

async function getCachedEntry(slug: string): Promise<OutcomeEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`get-outcome:${slug}`);
  return getOutcomeBySlug(slug);
}

export function generateStaticParams() {
  return OUTCOME_SLUGS.map((slug) => ({ outcome: slug }));
}

type RouteParams = { outcome: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = await getCachedEntry(params.outcome);
  if (!e) return {};

  const canonical = `/get-${e.slug}`;
  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: pageAlternates(canonical),
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

function buildJsonLd(e: OutcomeEntry, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.heroSubhead,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    about: {
      "@type": "Thing",
      name: e.displayName,
    },
    keywords: [
      `get ${e.displayName.toLowerCase()}`,
      "Brunson",
      "Hook Story Offer",
      "post-launch pre-revenue founder",
      "Unlock SaaS",
    ].join(", "),
    inLanguage: "en-US",
    // Speakable + access-mode: the hero subhead (matching the
    // `abstract: e.heroSubhead` field above) is the canonical voice
    // answer for this outcome. Marked `data-speakable` in the DOM.
    speakable: buildSpeakable('[data-speakable="lede"]'),
    ...ACCESS_MODE_TEXTUAL,
  };

  // HowTo schema – each outcome page declares the concrete steps from
  // the Brunson Playbook that move a reader from the painSnapshot to
  // the named outcome. HowTo schema gets featured-snippet treatment in
  // Google AI Overviews and Perplexity citations for "how to" queries.
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to get ${e.displayName.toLowerCase()}`,
    description: e.heroSubhead,
    inLanguage: "en-US",
    step: e.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.heading,
      text: s.body,
    })),
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
        name: "Outcomes",
        item: `${BASE_URL}/get`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Get ${e.displayName}`,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
    JSON.stringify(howTo),
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

export default async function GetOutcomeDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = await getCachedEntry(params.outcome);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/get-${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const relatedLinks = e.relatedOutcomes
    .map((slug) => {
      const target = getOutcomeBySlug(slug);
      return target
        ? { slug: target.slug, displayName: target.displayName }
        : null;
    })
    .filter(
      (x): x is { slug: string; displayName: string } => x !== null,
    );

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={howToJson} />
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
            <Link href="/get" className="hover:underline">
              Outcomes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            Get {e.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Outcome
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.hookHeadline}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable="lede"
        >
          {e.heroSubhead}
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
        headingLabel={`Get ${e.displayName.toLowerCase()} – key facts`}
        items={[
          { term: "Outcome", definition: e.displayName },
          { term: "Summary", definition: e.heroSubhead },
          { term: "Why hard for most", definition: e.whyHardForMost },
          { term: "The move", definition: e.theMove },
          { term: "What to track", definition: e.whatToTrack },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="pain-snapshot"
      >
        <h2
          id="pain-snapshot"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          What the stuck-state looks like
        </h2>
        <p className="text-base leading-relaxed">{e.painSnapshot}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why-hard"
      >
        <h2 id="why-hard" className="text-2xl font-bold mb-4 leading-tight">
          Why this outcome is hard for most founders
        </h2>
        <p className="text-base leading-relaxed">{e.whyHardForMost}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="the-move"
      >
        <h2 id="the-move" className="text-2xl font-bold mb-4 leading-tight">
          The Brunson move
        </h2>
        <p className="text-base leading-relaxed">{e.theMove}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="steps"
      >
        <h2 id="steps" className="text-2xl font-bold mb-4 leading-tight">
          The {e.steps.length}-step walk
        </h2>
        <ol className="space-y-6">
          {e.steps.map((s, i) => (
            <li key={s.heading} className="grid grid-cols-[auto_1fr] gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold leading-tight mb-2">
                  {s.heading}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="common-mistake"
      >
        <h2
          id="common-mistake"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          The mistake most founders make chasing this
        </h2>
        <p className="text-base leading-relaxed">{e.commonMistake}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="what-to-track"
      >
        <h2
          id="what-to-track"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          What to track so you know it is working
        </h2>
        <p className="text-base leading-relaxed">{e.whatToTrack}</p>
      </section>

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

      {relatedLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-outcomes"
        >
          <h2
            id="related-outcomes"
            className="text-xl font-semibold mb-4 leading-tight"
          >
            Outcomes founders chase next
          </h2>
          <ul className="space-y-2 text-sm">
            {relatedLinks.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/get-${r.slug}`}
                  className="text-primary hover:underline"
                >
                  Get {r.displayName} →
                </Link>
              </li>
            ))}
          </ul>
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
            Brunson terms that show up on this outcome
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
              Run the diagnostic against your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic runs the Hook / Story /
              Offer triage on your actual URL and labels which of three
              blocks is between you and {e.displayName.toLowerCase()}. Same
              triage that powers this page, applied to your specific
              situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/get">Other outcomes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
