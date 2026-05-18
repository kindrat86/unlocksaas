/**
 * /press/topics/[slug] — per-angle reverse-press-kit page.
 *
 * Each slug renders one PressTopic entry. Five sections:
 *   1. Thesis  — the lede paragraph + Article schema headline anchor.
 *   2. Data points — observable, source-cited facts.
 *   3. Pull-quotes — verbatim quotable lines, on the record, with
 *      `data-press-quote` data attribute so a writer who copies the
 *      element preserves attribution.
 *   4. Counter-arguments — honest counters with honest responses.
 *   5. Related entities — who else a fair piece should cite, with URLs.
 *
 * Brunson Hard-Rule discipline
 * ----------------------------
 *   - Every pull-quote is something that already appears in the live
 *     site or has been said on the record. The `attestation` field on
 *     each quote names where the line lives (not surfaced on the page;
 *     it is editor-side self-discipline).
 *   - Counter-arguments are not strawmen. They name the real critique
 *     a fair journalist would raise.
 *   - `lastVerified` is preserved per row and surfaced in the article
 *     metadata so a citer cannot pretend the page is fresher than it is.
 *
 * Article + NewsArticle schema is rendered server-side. The pull-quote
 * list is ALSO emitted as a CreativeWork/Quotation graph so structured-
 * data pipelines (Diffbot, AI-Overview citation, Google News) can resolve
 * each quote independently — the same machinery that lets a quote get
 * cited without the surrounding article.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";
import {
  PRESS_TOPICS,
  PRESS_TOPIC_SLUGS,
  getPressTopic,
} from "@/lib/press-topics";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";

const BASE = "https://unlocksaas.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";
// Adding a new entry to PRESS_TOPICS auto-extends the prerendered set on
// the next build. Unknown slugs 404 via dynamicParams=false.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRESS_TOPIC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const topic = getPressTopic(slug);
  if (!topic) {
    return {
      title: "Press topic",
      robots: { index: false, follow: false },
    };
  }
  const url = `${BASE}/press/topics/${topic.slug}`;
  const description = `${topic.thesis} Source kit for journalists: data points, pull-quotes, counter-arguments, related entities. Verified ${topic.lastVerified}.`;
  return {
    title: topic.headline,
    description,
    alternates: markdownAlternate(
      `/press/topics/${topic.slug}`,
      `/press/topics/${topic.slug}/md`,
    ),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: topic.headline,
      description: topic.thesis,
      url,
      siteName: "Unlock SaaS",
      publishedTime: topic.lastVerified,
    },
    twitter: {
      card: "summary_large_image",
      title: topic.headline,
      description: topic.thesis,
    },
  };
}

export default async function PressTopicPage(props: Props) {
  const { slug } = await props.params;
  const topic = getPressTopic(slug);
  if (!topic) notFound();

  const url = `${BASE}/press/topics/${topic.slug}`;
  const wordCount = estimateWordCount(topic);

  // The Quotation graph: every pull-quote rendered as its own
  // CreativeWork node so retrievers can resolve quotes independently.
  // Attached as a sibling JSON-LD block; the Article block names the
  // page-level entity, the Quotation block names each pull-quote.
  const quotationGraphJsonLd = {
    "@context": "https://schema.org",
    "@graph": topic.pullQuotes.map((q, idx) => ({
      "@type": "Quotation",
      "@id": `${url}#quote-${idx}`,
      text: q.quote,
      spokenByCharacter: { "@id": `${BASE}/#founder` },
      isPartOf: { "@id": `${url}#article` },
      inLanguage: "en-US",
    })),
  };

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <ArticleJsonLd
        headline={topic.headline}
        description={topic.thesis}
        url={url}
        datePublished={topic.lastVerified}
        articleSection="Press"
        wordCount={wordCount}
        keywords={topic.intendedQueries}
        about={topic.relatedEntities.map((e) => ({
          name: e.name,
          sameAs: e.url,
        }))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(quotationGraphJsonLd),
        }}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "Press", url: `${BASE}/press` },
          { name: "Topics", url: `${BASE}/press/topics` },
          { name: topic.headline, url },
        ]}
      />

      <article className="max-w-3xl mx-auto">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="mb-10">
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-muted-foreground mb-4"
          >
            <Link
              href="/press/topics"
              className="underline underline-offset-4 hover:text-foreground"
            >
              ← All press topics
            </Link>
          </nav>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Story package · verified {topic.lastVerified}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {topic.headline}
          </h1>
          <p className="text-base text-foreground leading-relaxed mb-3">
            {topic.thesis}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {topic.context}
          </p>
        </header>

        {/* ── Intended queries (so writers see the page's surface area) ── */}
        <section
          aria-labelledby="queries"
          className="mb-10 rounded-md border bg-muted/40 px-5 py-4"
        >
          <p
            id="queries"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Built for these queries
          </p>
          <ul className="flex flex-wrap gap-2">
            {topic.intendedQueries.map((q) => (
              <li key={q}>
                <Badge variant="secondary" className="font-mono text-xs">
                  {q}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* ── Data points ─────────────────────────────────────────────── */}
        <section aria-labelledby="data" className="mb-10">
          <h2 id="data" className="text-2xl font-bold mb-4">
            Data points
          </h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Every claim below is independently verifiable at the source
            URL. If anything has drifted since the verification date, email{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>{" "}
            and the correction lands in the editorial log at{" "}
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /editorial-policy
            </Link>
            .
          </p>
          <ol className="space-y-5 list-decimal list-outside ml-5">
            {topic.dataPoints.map((d, idx) => (
              <li key={idx} className="pl-1">
                <p className="text-base text-foreground leading-relaxed mb-1">
                  {d.claim}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  Source: {d.source}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <Separator className="my-8" />

        {/* ── Pull-quotes ─────────────────────────────────────────────── */}
        <section aria-labelledby="quotes" className="mb-10">
          <h2 id="quotes" className="text-2xl font-bold mb-4">
            Pull-quotes
          </h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Verbatim lines from Maryan, on the record. Copy and paste as
            written — the attribution is{" "}
            <em>Maryan, founder of Unlock SaaS</em>, with a link back to
            this page.
          </p>
          <div className="space-y-5">
            {topic.pullQuotes.map((q, idx) => (
              <figure
                key={idx}
                data-press-quote={topic.slug}
                className="rounded-xl border-l-2 bg-card p-5 sm:p-6"
              >
                <blockquote className="text-base sm:text-lg text-foreground leading-relaxed italic mb-3">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-baseline justify-between gap-4">
                  <cite className="text-xs not-italic text-muted-foreground">
                    Maryan, founder of Unlock SaaS
                  </cite>
                  <CopyButton text={q.quote} label="Copy quote" />
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* ── Counter-arguments ───────────────────────────────────────── */}
        <section aria-labelledby="counter" className="mb-10">
          <h2 id="counter" className="text-2xl font-bold mb-4">
            What a fair piece should also address
          </h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Real counter-arguments with honest responses. If you write the
            piece, addressing these directly is the difference between a
            reported article and a press release.
          </p>
          <div className="space-y-5">
            {topic.counterArguments.map((c, idx) => (
              <div
                key={idx}
                className="rounded-md border bg-card p-5 space-y-2"
              >
                <p className="text-sm font-semibold text-foreground">
                  Counter: {c.argument}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Honest response: {c.response}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-8" />

        {/* ── Related entities ────────────────────────────────────────── */}
        <section aria-labelledby="entities" className="mb-10">
          <h2 id="entities" className="text-2xl font-bold mb-4">
            Related entities a fair piece should also cite
          </h2>
          <ul className="space-y-3">
            {topic.relatedEntities.map((e, idx) => (
              <li key={idx} className="text-sm">
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="font-semibold underline underline-offset-4 hover:text-foreground"
                >
                  {e.name}
                </a>{" "}
                <span className="text-muted-foreground">— {e.relevance}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* ── Attribution + contact ───────────────────────────────────── */}
        <section
          aria-labelledby="attribution"
          className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6"
        >
          <p
            id="attribution"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Attribution
          </p>
          <p className="text-sm text-foreground leading-relaxed mb-3">
            {topic.attribution}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Direct contact:{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
            . The founder reads every message personally and replies the
            same day. For brand assets, see{" "}
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /press
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  );
}

/**
 * Word-count estimate for the Article schema's `wordCount` field. Counts
 * thesis + context + data points + pull-quotes + counter-arguments +
 * related entities. Honest only: counts published prose, not nav or
 * boilerplate. Returned as an integer; the schema field is permissive.
 */
function estimateWordCount(
  topic: (typeof PRESS_TOPICS)[number],
): number {
  const corpus = [
    topic.thesis,
    topic.context,
    ...topic.dataPoints.flatMap((d) => [d.claim, d.source]),
    ...topic.pullQuotes.map((q) => q.quote),
    ...topic.counterArguments.flatMap((c) => [c.argument, c.response]),
    ...topic.relatedEntities.map((e) => e.relevance),
  ].join(" ");
  return corpus.split(/\s+/).filter(Boolean).length;
}
