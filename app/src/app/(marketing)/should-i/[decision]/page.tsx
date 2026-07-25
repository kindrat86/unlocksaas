import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SHOULD_I_SLUGS,
  SHOULD_I_ENTRIES,
  SHOULD_I_VERDICT_LABELS,
  getShouldIBySlug,
  type ShouldIEntry,
} from "@/lib/should-i";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { DateStampedAnswer } from "@/components/seo/date-stamped-answer";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * Per-slug cached entry. Tagged `should-i:<slug>` for future Server
 * Action `revalidateTag('should-i:${slug}', 'max')` invalidation when
 * content moves off the frozen `.ts` array.
 */
async function getCachedEntry(slug: string): Promise<ShouldIEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`should-i:${slug}`);
  return getShouldIBySlug(slug);
}

export function generateStaticParams() {
  return SHOULD_I_SLUGS.map((decision) => ({ decision }));
}

type RouteParams = { decision: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = await getCachedEntry(params.decision);
  if (!e) return {};

  const canonical = `/should-i/${e.slug}`;
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

function buildJsonLd(e: ShouldIEntry, canonicalUrl: string): string[] {
  // QAPage with the verdict-headline as the accepted answer summary, and
  // the directAnswer as the long-form text. Speakable selectors curated
  // so voice assistants pull exactly the verdict + direct answer +
  // supporting bullets.
  const speakable = buildSpeakable(
    '[data-speakable="question"]',
    '[data-speakable="verdict"]',
    '[data-speakable="direct-answer"]',
    '[data-speakable="supporting"]',
  );

  const acceptedAnswerText = `${e.verdictHeadline} ${e.directAnswer}`;

  // QAPage is invalid here: Google requires that users be able to submit
  // answers, and names "an FAQ page written by the site itself" as an invalid
  // use. The primary Q&A now leads the page's single FAQPage instead. No
  // answerCount / upvoteCount — FAQPage needs neither and inventing them
  // fabricates engagement. Do NOT add a QAPage node back.
  const primaryQuestion = {
    "@type": "Question",
    name: e.question,
    text: e.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: acceptedAnswerText,
      url: canonicalUrl,
      inLanguage: "en-US",
      author: { "@id": ID.person },
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.question,
    description: e.metaDescription,
    abstract: e.verdictHeadline,
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
        name: "Should I…?",
        item: `${BASE_URL}/should-i`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.question,
        item: canonicalUrl,
      },
    ],
  };

  // FAQPage emitted alongside QAPage: the supporting-bullet H3s feed
  // rich-result eligibility for the "people also ask" follow-ups.
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    url: canonicalUrl,
    name: e.question,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    inLanguage: "en-US",
    speakable,
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: [primaryQuestion, ...e.supporting.map((s, i) => ({
      "@type": "Question",
      name: `Why? (point ${i + 1})`,
      acceptedAnswer: {
        "@type": "Answer",
        text: s,
        url: canonicalUrl,
        inLanguage: "en-US",
      },
    }))],
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

function verdictStyle(verdict: ShouldIEntry["verdict"]): {
  badgeVariant: "default" | "secondary" | "outline";
  borderClass: string;
  bgClass: string;
} {
  switch (verdict) {
    case "yes":
      return {
        badgeVariant: "default",
        borderClass: "border-primary/40",
        bgClass: "bg-primary/5",
      };
    case "no":
      return {
        badgeVariant: "outline",
        borderClass: "border-destructive/40",
        bgClass: "bg-destructive/5",
      };
    case "depends":
      return {
        badgeVariant: "secondary",
        borderClass: "border-muted-foreground/30",
        bgClass: "bg-muted/40",
      };
    case "not-yet":
      return {
        badgeVariant: "secondary",
        borderClass: "border-muted-foreground/30",
        bgClass: "bg-muted/40",
      };
  }
}

export default async function ShouldIDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = await getCachedEntry(params.decision);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/should-i/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const related = SHOULD_I_ENTRIES.filter(
    (other) => other.category === e.category && other.slug !== e.slug,
  ).slice(0, 4);

  const v = verdictStyle(e.verdict);

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
            <Link href="/should-i" className="hover:underline">
              Should I…?
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
          Should I…? – Decision
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

      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="verdict"
      >
        <h2 id="verdict" className="sr-only">
          Verdict
        </h2>
        <Card className={`${v.borderClass} ${v.bgClass}`}>
          <CardContent className="pt-6 pb-5">
            <div className="flex items-center gap-3 mb-3">
              <Badge
                variant={v.badgeVariant}
                className="text-xs uppercase tracking-wide"
              >
                {SHOULD_I_VERDICT_LABELS[e.verdict]}
              </Badge>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                Verdict
              </span>
            </div>
            <p
              className="text-lg font-semibold leading-snug"
              data-speakable="verdict"
            >
              {e.verdictHeadline}
            </p>
          </CardContent>
        </Card>
      </section>

      <TldrSummary
        headingLabel={`Decision key facts`}
        items={[
          { term: "Question", definition: e.question },
          {
            term: "Verdict",
            definition: `${SHOULD_I_VERDICT_LABELS[e.verdict]} – ${e.verdictHeadline}`,
          },
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

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="supporting"
      >
        <h2 id="supporting" className="text-xl font-semibold mb-4 leading-tight">
          Why
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
            Related decisions
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/should-i/${r.slug}`}
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
              The free 90-second Launch Diagnostic applies the Hook /
              Story / Offer triage to your actual URL and labels
              what&rsquo;s broken. Same triage that informs every verdict
              on this site.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/should-i">All decisions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
