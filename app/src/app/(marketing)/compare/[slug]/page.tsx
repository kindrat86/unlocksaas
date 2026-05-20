import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, Minus, Scale, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  COMPARISON_SLUGS,
  getComparisonBySlug,
  type Comparison,
  type ComparisonDimension,
} from "@/lib/comparisons";
import { getTeardownBySlug as getFunnelTeardownBySlug } from "@/lib/funnel-teardowns";
import { getPricingTeardownBySlug } from "@/lib/pricing-teardowns";
import { getCategoryByRawString } from "@/lib/categories";
import { ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { deriveComparisonRatings } from "@/lib/seo/review-rating";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForComparison,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";

/**
 * Programmatic SEO surface — Compare: {Product A} vs {Product B}.
 *
 * Fourth pSEO block. Target intent: "[A] vs [B]" — the single highest-
 * intent SaaS-research search class. Every comparison reader is
 * mid-evaluation.
 *
 * Cross-pattern linking: if either product has a funnel or pricing
 * teardown on our site, the comparison page deep-links to them. The
 * teardown detail pages reciprocally surface relevant comparisons via
 * getComparisonsForProductSlug.
 *
 * Brunson Hard-Rule reconciliation: symmetric framing on both products,
 * dimensional verdicts named honestly per dimension, lastVerified ISO.
 */

const BASE = "https://unlocksaas.com";


export function generateStaticParams() {
  return COMPARISON_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(
  props: {
    params: Promise<RouteParams>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const c = getComparisonBySlug(params.slug);
  if (!c) return {};

  const canonical = `/compare/${c.slug}`;
  const title = `${c.a.name} vs ${c.b.name} — Honest Head-to-Head Comparison`;
  const description = c.oneLine;

  return {
    title,
    description,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
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

// ----- JSON-LD --------------------------------------------------------------

function buildJsonLd(
  c: Comparison,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  // Comparison pages have TWO subject entities by construction (A vs B).
  // Build each as a real Organization when the manifest carries a URL,
  // otherwise fall back to a bare name. `about` and `mentions` both carry
  // the two-element list so retrievers that walk either field resolve
  // both products as citable entity neighbours.
  const subjectA = c.a.url
    ? { "@type": "Organization", name: c.a.name, url: c.a.url }
    : { "@type": "Organization", name: c.a.name };
  const subjectB = c.b.url
    ? { "@type": "Organization", name: c.b.name, url: c.b.url }
    : { "@type": "Organization", name: c.b.name };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${c.a.name} vs ${c.b.name} — Honest Head-to-Head Comparison`,
    description: c.oneLine,
    abstract: c.tldr,
    // @id references back to the canonical Organization / Person /
    // WebSite declared on the funnel hub. Closes the entity graph so
    // Google walks the @id graph instead of treating each Article as
    // its own disconnected Person/Org block.
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: c.lastVerified,
    dateModified: c.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    // Two-subject article: name both Organizations as `about` and
    // `mentions` so AEO direct-answer pulls for "[A] vs [B]" queries
    // resolve both products as named entities, not a comma-joined
    // string. Pure prose-to-string about[] was the legacy shape.
    about: [subjectA, subjectB],
    mentions: [subjectA, subjectB],
    keywords: c.tags.join(", "),
    inLanguage: "en-US",
    // VEO — TL;DR block wraps in `aria-labelledby="tldr"`, matched by
    // SPEAKABLE_SELECTORS. Voice modes read the head-to-head summary
    // aloud first.
    speakable: buildSpeakable(
      '[data-speakable="recommendation"]',
      '[data-speakable="faq-q"]',
      '[data-speakable="faq-a"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    speakable: buildSpeakable(
      '[data-speakable="recommendation"]',
      '[data-speakable="faq-q"]',
      '[data-speakable="faq-a"]',
    ),
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Compare",
        item: `${BASE}/compare`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${c.a.name} vs ${c.b.name}`,
        item: canonicalUrl,
      },
    ],
  };

  // ---------- Review + ReviewRating per product ----------------------------
  //
  // Surface B (AEO/GEO) extension landing 2026-05-18 from the SEO-audit
  // dings: "no Review schema variant for the 'best for' verdict blocks."
  // Review Rich Result eligibility requires `reviewRating.ratingValue`;
  // emitting the rating from a fabricated number would re-introduce the
  // Brunson Hard-Rule violation the rest of this file painstakingly avoids
  // (no aggregateRating, no testimonial counts before they exist).
  //
  // Honest path: derive the rating deterministically from the dimensional
  // `winner` field the page already renders, via deriveComparisonRatings
  // (see src/lib/seo/review-rating.ts for the algorithm + edge cases).
  // The reader can reproduce the math by counting the dimension table.
  //
  // Two Review nodes — one per product, symmetric framing — so both
  // products are eligible for star-rating snippets on their own name
  // searches when this page surfaces.
  //
  // reviewBody composes: per-product "best for" + (when this product is
  // the indie-founder pick) the indie-specific reasoning. The body never
  // restates the dimensions verbatim; it cites the verdict the page
  // already publishes in prose. Drift class: zero.
  const ratings = deriveComparisonRatings(c);

  const buildReviewBody = (
    side: "A" | "B",
    bestForLine: string,
  ): string => {
    const indiePicksThisSide =
      (side === "A" && c.forIndieFounders.pick === "A") ||
      (side === "B" && c.forIndieFounders.pick === "B");
    return indiePicksThisSide
      ? `${bestForLine} ${c.forIndieFounders.reasoning}`
      : bestForLine;
  };

  // Only emit Review nodes when there is at least one comparable
  // dimension (aWins + bWins + ties > 0). All-"different" or empty
  // dimensions would emit a neutral 3.0/3.0 that adds no signal and
  // would clutter the page schema with low-value nodes.
  const hasComparableDimensions =
    ratings.aWins + ratings.bWins + ratings.ties > 0;

  const reviewA = hasComparableDimensions
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        name: `${c.a.name} review — Unlock SaaS head-to-head verdict against ${c.b.name}`,
        itemReviewed: {
          ...subjectA,
          // Reuse the same Organization name + url shape declared above
          // so retrievers see one consistent entity reference per product
          // across `about`, `mentions`, and `itemReviewed`.
        },
        author: { "@id": ID.person },
        publisher: { "@id": ID.organization },
        datePublished: c.lastVerified,
        inLanguage: "en-US",
        reviewBody: buildReviewBody("A", c.bestFor.a),
        reviewRating: {
          "@type": "Rating",
          ratingValue: ratings.aRating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
        },
      }
    : null;

  const reviewB = hasComparableDimensions
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        name: `${c.b.name} review — Unlock SaaS head-to-head verdict against ${c.a.name}`,
        itemReviewed: {
          ...subjectB,
        },
        author: { "@id": ID.person },
        publisher: { "@id": ID.organization },
        datePublished: c.lastVerified,
        inLanguage: "en-US",
        reviewBody: buildReviewBody("B", c.bestFor.b),
        reviewRating: {
          "@type": "Rating",
          ratingValue: ratings.bRating.toFixed(1),
          bestRating: "5",
          worstRating: "1",
        },
      }
    : null;

  const json: string[] = [
    JSON.stringify(article),
    JSON.stringify(faqPage),
    JSON.stringify(breadcrumbs),
  ];
  if (reviewA) json.push(JSON.stringify(reviewA));
  if (reviewB) json.push(JSON.stringify(reviewB));
  return json;
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

// ----- Helpers --------------------------------------------------------------

function WinnerIcon({
  winner,
  side,
  aName,
  bName,
}: {
  winner: ComparisonDimension["winner"];
  side: "A" | "B";
  aName: string;
  bName: string;
}) {
  const isWin =
    (winner === "A" && side === "A") || (winner === "B" && side === "B");
  const name = side === "A" ? aName : bName;
  if (isWin) {
    return (
      <Check
        className="h-4 w-4 text-primary inline-block"
        aria-label={`${name} wins this dimension`}
      />
    );
  }
  if (winner === "tie") {
    return (
      <Scale
        className="h-4 w-4 text-muted-foreground inline-block"
        aria-label="Tied on this dimension"
      />
    );
  }
  if (winner === "different") {
    return (
      <Minus
        className="h-4 w-4 text-muted-foreground inline-block"
        aria-label="Different shapes; not directly comparable"
      />
    );
  }
  return (
    <X
      className="h-4 w-4 text-muted-foreground/40 inline-block"
      aria-label={`${name} does not win this dimension`}
    />
  );
}

// ----- Page ------------------------------------------------------------------

export default async function ComparePage(props: { params: Promise<RouteParams> }) {
  const params = await props.params;
  const c = getComparisonBySlug(params.slug);
  if (!c) notFound();

  const canonicalUrl = `${BASE}/compare/${c.slug}`;
  // buildJsonLd returns a variable-length array: always Article, FAQPage,
  // BreadcrumbList; optionally two Review nodes (one per product) when the
  // comparison has at least one A/B/tie dimension. Iterate rather than
  // destructure so the optional tail is not silently dropped.
  const paaPairs = paaForComparison(c);
  const mergedFaqs = mergePaaIntoFaqs(c.faqs, paaPairs);
  const jsonLdBlocks = buildJsonLd(c, canonicalUrl, mergedFaqs);

  const aFunnel =
    c.a.teardownSlug && getFunnelTeardownBySlug(c.a.teardownSlug);
  const aPricing =
    c.a.teardownSlug && getPricingTeardownBySlug(c.a.teardownSlug);
  const bFunnel =
    c.b.teardownSlug && getFunnelTeardownBySlug(c.b.teardownSlug);
  const bPricing =
    c.b.teardownSlug && getPricingTeardownBySlug(c.b.teardownSlug);
  const category = getCategoryByRawString(c.category);

  const indieRec =
    c.forIndieFounders.pick === "A"
      ? c.a.name
      : c.forIndieFounders.pick === "B"
        ? c.b.name
        : null;

  return (
    <article className="min-h-screen">
      {jsonLdBlocks.map((json, idx) => (
        <JsonLdBlock
          // The block ordering is fixed by buildJsonLd (Article, FAQPage,
          // BreadcrumbList, optional Review×2) so the index is a stable
          // React key across renders. Each block is a distinct JSON
          // document so keying by content would be wasteful.
          key={idx}
          json={json}
        />
      ))}
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
            <Link href="/compare" className="hover:underline">
              Compare
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {c.a.name} vs {c.b.name}
          </li>
        </ol>
      </nav>
      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Head-to-head · {c.category}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {c.a.name} vs {c.b.name}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {c.oneLine}
        </p>
        {/*
          Above-the-fold "Verified" date stamp. Surface A (organic) +
          Surface B (AEO) lift landing 2026-05-18 from the SEO-audit
          dings: the footer date was technically present but never in
          the snippet-extraction window for Google's "Last Updated"
          heuristic. Semantic <time> with machine-readable dateTime
          gives the snippet extractor a clean handle; the human-readable
          "Verified May 17, 2026" copy is the trust signal a real
          founder reads before trusting the comparison.
         */}
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={c.lastVerified}>
            {formatVerifiedDate(c.lastVerified)}
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
      {/* TL;DR – structured key/value summary for AI summarizers + voice engines */}
      <TldrSummary
        headingLabel={`${c.a.name} vs ${c.b.name} TL;DR`}
        items={[
          { term: "Compared", definition: `${c.a.name} vs ${c.b.name}` },
          { term: "Category", definition: c.category },
          { term: "TL;DR", definition: c.tldr },
          { term: `${c.a.name} best for`, definition: c.bestFor.a },
          { term: `${c.b.name} best for`, definition: c.bestFor.b },
          {
            term: "Indie founder pick",
            definition:
              c.forIndieFounders.pick === "depends"
                ? `Depends — ${c.forIndieFounders.reasoning}`
                : `${c.forIndieFounders.pick === "A" ? c.a.name : c.b.name} — ${c.forIndieFounders.reasoning}`,
          },
          {
            term: "Last verified",
            definition: formatVerifiedDate(c.lastVerified),
          },
        ]}
      />
      {/* Best for, side by side */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="best-for"
      >
        <h2 id="best-for" className="text-2xl font-bold mb-6 leading-tight">
          Best for
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold">
                {c.a.name} is best for
              </p>
              <p className="text-sm leading-relaxed">{c.bestFor.a}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-foreground mb-2 font-semibold">
                {c.b.name} is best for
              </p>
              <p className="text-sm leading-relaxed">{c.bestFor.b}</p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Pick A if / Pick B if */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="pick"
      >
        <h2 id="pick" className="text-2xl font-bold mb-6 leading-tight">
          Pick {c.a.name} if · Pick {c.b.name} if
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-foreground mb-3 font-semibold">
                Pick {c.a.name} if
              </p>
              <ul className="space-y-2">
                {c.pickAIf.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-foreground mb-3 font-semibold">
                Pick {c.b.name} if
              </p>
              <ul className="space-y-2">
                {c.pickBIf.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Dimensions table */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="dimensions"
      >
        <h2 id="dimensions" className="text-2xl font-bold mb-6 leading-tight">
          Dimension-by-dimension
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          <Check className="h-3.5 w-3.5 inline text-primary" /> wins this
          dimension &nbsp;·&nbsp;
          <Scale className="h-3.5 w-3.5 inline text-muted-foreground" /> tied
          &nbsp;·&nbsp;
          <Minus className="h-3.5 w-3.5 inline text-muted-foreground" />{" "}
          different shapes, not directly comparable
        </p>
        <div className="space-y-3">
          {c.dimensions.map((d) => (
            <Card key={d.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <h3 className="text-base font-semibold leading-tight">
                    {d.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                      <WinnerIcon
                        winner={d.winner}
                        side="A"
                        aName={c.a.name}
                        bName={c.b.name}
                      />
                      {c.a.name}
                    </p>
                    <p className="text-sm leading-relaxed">{d.a}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                      <WinnerIcon
                        winner={d.winner}
                        side="B"
                        aName={c.a.name}
                        bName={c.b.name}
                      />
                      {c.b.name}
                    </p>
                    <p className="text-sm leading-relaxed">{d.b}</p>
                  </div>
                </div>
                {d.note ? (
                  <p className="text-xs text-muted-foreground italic mt-2 leading-relaxed">
                    {d.note}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      {/* Honest take */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="honest"
      >
        <h2 id="honest" className="text-2xl font-bold mb-4 leading-tight">
          Honest take
        </h2>
        <p
          className="text-base leading-relaxed"
          data-speakable="recommendation"
        >
          {c.honestTake}
        </p>
      </section>
      {/* Indie founder recommendation */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="indie"
      >
        <h2 id="indie" className="text-2xl font-bold mb-4 leading-tight">
          If you are an indie SaaS founder
        </h2>
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-2">
              {indieRec ? `Pick ${indieRec}` : "It depends"}
            </p>
            <p
              className="text-sm leading-relaxed"
              data-speakable="recommendation"
            >
              {c.forIndieFounders.reasoning}
            </p>
          </CardContent>
        </Card>
      </section>
      {/* Cross-pattern callouts: teardowns for either product */}
      {aFunnel || aPricing || bFunnel || bPricing ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
          aria-labelledby="cross"
        >
          <h2
            id="cross"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
          >
            Go deeper on either product
          </h2>
          <ul className="space-y-2 text-sm">
            {aFunnel ? (
              <li>
                <Link
                  href={`/funnel-teardown/${c.a.teardownSlug}`}
                  className="text-primary hover:underline"
                >
                  → {c.a.name} funnel teardown
                </Link>
              </li>
            ) : null}
            {aPricing ? (
              <li>
                <Link
                  href={`/pricing-teardown/${c.a.teardownSlug}`}
                  className="text-primary hover:underline"
                >
                  → {c.a.name} pricing teardown
                </Link>
              </li>
            ) : null}
            {bFunnel ? (
              <li>
                <Link
                  href={`/funnel-teardown/${c.b.teardownSlug}`}
                  className="text-primary hover:underline"
                >
                  → {c.b.name} funnel teardown
                </Link>
              </li>
            ) : null}
            {bPricing ? (
              <li>
                <Link
                  href={`/pricing-teardown/${c.b.teardownSlug}`}
                  className="text-primary hover:underline"
                >
                  → {c.b.name} pricing teardown
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
      {/* People Also Ask – canonical PAA phrasings for [A] vs [B]
          queries, sourced from this comparison's tldr + bestFor. */}
      <PeopleAlsoAsk pairs={paaPairs} />
      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {c.a.name} vs {c.b.name} – FAQ
        </h2>
        <div className="space-y-3">
          {c.faqs.map((f) => (
            <details
              key={f.q}
              className="group border border-border rounded-lg px-4 py-3"
            >
              <summary className="cursor-pointer font-semibold leading-snug list-none flex items-start justify-between gap-3">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform"
                >
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Building a SaaS that wins this kind of comparison?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic labels what is broken on your offer:
              Wrong Person, Weak Offer, or Weak Belief. When your buyer is
              comparison-shopping, the offer page is usually where you lose
              them.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/starter">Start with $1</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      {/* Browse more */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="browse"
      >
        <h2 id="browse" className="sr-only">
          Browse more
        </h2>
        <p className="text-sm">
          <Link
            href="/compare"
            className="text-primary hover:underline font-semibold"
          >
            <ArrowRight className="h-4 w-4 inline" /> Browse every comparison
          </Link>
          {category ? (
            <>
              {" "}
              ·{" "}
              <Link
                href={`/category/${category.slug}`}
                className="text-primary hover:underline font-semibold"
              >
                Browse {category.displayName.toLowerCase()} →
              </Link>
            </>
          ) : null}
        </p>
      </section>
      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified{" "}
          <time dateTime={c.lastVerified}>
            {formatVerifiedDate(c.lastVerified)}
          </time>
          . This comparison describes publicly observable product behavior on{" "}
          {c.a.name} and {c.b.name} at that date. No quoted copy, no
          fabricated metrics, no claims about internal performance.{" "}
          {c.a.url ? (
            <>
              See{" "}
              <a
                href={c.a.url}
                target="_blank"
                rel="noopener noreferrer external"
                className="underline hover:text-foreground"
              >
                {c.a.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </>
          ) : null}
          {c.a.url && c.b.url ? " and " : ""}
          {c.b.url ? (
            <>
              <a
                href={c.b.url}
                target="_blank"
                rel="noopener noreferrer external"
                className="underline hover:text-foreground"
              >
                {c.b.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
              .
            </>
          ) : null}{" "}
          If anything on this page is wrong or out of date, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix it.
        </p>
      </footer>
    </article>
  );
}
