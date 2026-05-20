import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  TEARDOWN_SLUGS,
  getTeardownBySlug,
  getRelatedTeardowns,
  type FunnelTeardown,
} from "@/lib/funnel-teardowns";
import { hasPricingTeardown } from "@/lib/pricing-teardowns";
import { hasAlternative } from "@/lib/alternatives";
import { getComparisonsForProductSlug } from "@/lib/comparisons";
import { getCategoryByRawString } from "@/lib/categories";
import { ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForFunnelTeardown,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";

/**
 * Programmatic SEO surface — Funnel teardown: {Company}.
 *
 * Surface A (organic) of strategy/google-strategy.md, second pSEO block
 * after /alternatives-to/. Target intent: "[product] funnel teardown",
 * "how does [product] sell", "[product] landing page breakdown".
 *
 * Brunson Hard-Rule reconciliation:
 *   - Pattern-level analysis only. No quoted competitor copy.
 *   - Honest framing: "what's working", "what to adapt", "what to avoid".
 *     The page is for the reader's benefit, not for our positioning.
 *   - lastVerified ISO is visible in the footer.
 *
 * JSON-LD on every page: Article (the teardown), FAQPage (Q/A pairs an
 * LLM can paraphrase), BreadcrumbList (sitelink hint). All three are
 * built from module-level static data with no user input.
 *
 * Static rendering: force-static + dynamicParams=false. Every slug is
 * prerendered at build; unknown slugs 404 instead of being lazily
 * generated, so crawlers cannot discover phantom URLs.
 */

const BASE = "https://unlocksaas.com";


export function generateStaticParams() {
  return TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

// ----- Per-page metadata -----------------------------------------------------
type RouteParams = { slug: string };

export async function generateMetadata(
  props: {
    params: Promise<RouteParams>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const t = getTeardownBySlug(params.slug);
  if (!t) return {};

  const canonical = `/funnel-teardown/${t.slug}`;
  const title = `${t.displayName} Funnel Teardown — What Indie SaaS Founders Can Learn`;
  const description = t.oneLine;

  return {
    title,
    description,
    // Advertise the playbook-readable markdown mirror via the standard
    // content-negotiation alternate link. Surface B (GEO/AEO) extension
    // landed 2026-05-17 — retrievers (Perplexity, ChatGPT search,
    // Google AI Overviews) now have a deterministic discovery path to
    // the .md without parsing /llms.txt or guessing at URL conventions.
    alternates: markdownAlternate(canonical, `/funnel-teardown/${t.slug}/md`),
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

// ----- JSON-LD (per-slug, inlined for static-render simplicity) --------------

function buildJsonLd(
  t: FunnelTeardown,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  // Subject-entity reference for both `about` and `mentions`. When the
  // manifest provides a homepageUrl we name the subject as a real
  // Organization with a URL Google's Knowledge Graph can walk back to.
  // When it doesn't, we fall back to a bare name string — still valid
  // schema.org, just lower entity-graph density.
  const subjectEntity = t.homepageUrl
    ? {
        "@type": "Organization",
        name: t.displayName,
        url: t.homepageUrl,
      }
    : t.displayName;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${t.displayName} Funnel Teardown — What Indie SaaS Founders Can Learn`,
    description: t.oneLine,
    abstract: t.tldr,
    // Author + publisher now point at the canonical @ids declared on the
    // funnel hub via OrganizationJsonLd / PersonJsonLd. Google resolves
    // these by walking the @id graph across the site instead of treating
    // each Article as carrying its own disconnected Person/Org records.
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: t.lastVerified,
    dateModified: t.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    // `about` names the primary subject of the Article. `mentions` lists
    // every named entity discussed — for a single-subject teardown the two
    // align, but separating them is what GEO retrievers (Perplexity,
    // Gemini, AI Overviews) walk when answering "what does Unlock SaaS
    // say about <product>" – the answer surfaces both the canonical URL
    // and the named subject as a citable entity neighbour.
    about: subjectEntity,
    mentions: [subjectEntity],
    keywords: t.tags.join(", "),
    inLanguage: "en-US",
    // VEO — TL;DR section wraps in `aria-labelledby="tldr"`, matched by
    // SPEAKABLE_SELECTORS. Voice assistants and LLM voice modes (ChatGPT
    // Voice, Perplexity voice) read the teardown summary aloud first.
    speakable: buildSpeakable(
      '[data-speakable="hook"]',
      '[data-speakable="story"]',
      '[data-speakable="offer"]',
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
      '[data-speakable="hook"]',
      '[data-speakable="story"]',
      '[data-speakable="offer"]',
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
        name: "Funnel teardowns",
        item: `${BASE}/funnel-teardown`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${t.displayName} funnel teardown`,
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

// ----- Page ------------------------------------------------------------------

export default async function FunnelTeardownPage(
  props: {
    params: Promise<RouteParams>;
  }
) {
  const params = await props.params;
  const t = getTeardownBySlug(params.slug);
  if (!t) notFound();

  const canonicalUrl = `${BASE}/funnel-teardown/${t.slug}`;
  const paaPairs = paaForFunnelTeardown(t);
  const mergedFaqs = mergePaaIntoFaqs(t.faqs, paaPairs);
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    t,
    canonicalUrl,
    mergedFaqs,
  );
  const related = getRelatedTeardowns(t.slug, 4);
  const hasPricing = hasPricingTeardown(t.slug);
  const hasAlt = hasAlternative(t.slug);
  const comparisons = getComparisonsForProductSlug(t.slug);
  const category = getCategoryByRawString(t.category);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />
      {/* Breadcrumb visible trail (matches BreadcrumbList JSON-LD) */}
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
            <Link href="/funnel-teardown" className="hover:underline">
              Funnel teardowns
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {t.displayName}
          </li>
        </ol>
      </nav>
      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Funnel teardown · {t.category}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {t.displayName} funnel teardown
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t.oneLine}
        </p>
        {/*
          Above-the-fold "Verified" stamp. Funnel teardowns are tied to
          a live read of the competitor's landing page — the visible
          date is the audit trail. Semantic <time> for snippet-extractor
          handles. Editorial-policy link strengthens E-E-A-T at the
          first scroll position the visitor sees.
         */}
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={t.lastVerified}>
            {formatVerifiedDate(t.lastVerified)}
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
        headingLabel={`${t.displayName} funnel teardown TL;DR`}
        items={[
          { term: "Company", definition: t.displayName },
          { term: "Category", definition: t.category },
          { term: "TL;DR", definition: t.tldr },
          { term: "Hook pattern", definition: t.hook.pattern },
          { term: "Story pattern", definition: t.story.pattern },
          { term: "Offer pattern", definition: t.offer.pattern },
          {
            term: "Last verified",
            definition: formatVerifiedDate(t.lastVerified),
          },
        ]}
      />
      {/* Cross-pattern callout to pricing teardown when both exist */}
      {hasPricing ? (
        <section
          className="max-w-3xl mx-auto px-6 py-4"
          aria-labelledby="cross-pattern"
        >
          <h2 id="cross-pattern" className="sr-only">
            Also see
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm leading-relaxed">
              Studying{" "}
              <span className="font-semibold">{t.displayName}</span>&apos;s
              pricing model specifically?
            </p>
            <Link
              href={`/pricing-teardown/${t.slug}`}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Read the pricing teardown →
            </Link>
          </div>
        </section>
      ) : null}
      {/* Alternatives-to cross-pattern callout when an alternatives entry exists */}
      {hasAlt ? (
        <section
          className="max-w-3xl mx-auto px-6 py-2"
          aria-labelledby="alt-cross"
        >
          <h2 id="alt-cross" className="sr-only">
            Compare to Unlock SaaS
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm leading-relaxed">
              Wondering if <span className="font-semibold">{t.displayName}</span>{" "}
              is an Unlock SaaS alternative?
            </p>
            <Link
              href={`/alternatives-to/${t.slug}`}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Read the honest comparison →
            </Link>
          </div>
        </section>
      ) : null}
      {/* Category roundup callout */}
      {category ? (
        <section
          className="max-w-3xl mx-auto px-6 py-2"
          aria-labelledby="category-cross"
        >
          <h2 id="category-cross" className="sr-only">
            Browse the category
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm leading-relaxed">
              Comparing every tool in this category?
            </p>
            <Link
              href={`/category/${category.slug}`}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Browse {category.displayName.toLowerCase()} →
            </Link>
          </div>
        </section>
      ) : null}
      {/* Product snapshot */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="snapshot"
      >
        <h2 id="snapshot" className="text-2xl font-bold mb-6 leading-tight">
          What {t.displayName} actually sells
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              What they sell
            </dt>
            <dd className="text-sm leading-relaxed">
              {t.productSnapshot.whatTheySell}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Who it is for
            </dt>
            <dd className="text-sm leading-relaxed">
              {t.productSnapshot.whoFor}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Pricing observed
            </dt>
            <dd className="text-sm leading-relaxed">
              {t.productSnapshot.pricingNote}
            </dd>
          </div>
        </dl>
      </section>
      {/* Hook / Story / Offer breakdown */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="hso"
      >
        <h2 id="hso" className="text-2xl font-bold mb-6 leading-tight">
          The funnel, layer by layer
        </h2>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Hook · how they catch attention
              </p>
              <p
                className="text-base font-semibold mb-3"
                data-speakable="hook"
              >
                {t.hook.pattern}
              </p>
              <p
                className="text-sm text-muted-foreground leading-relaxed"
                data-speakable="hook"
              >
                {t.hook.analysis}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Story · how they create belief
              </p>
              <p
                className="text-base font-semibold mb-3"
                data-speakable="story"
              >
                {t.story.pattern}
              </p>
              <p
                className="text-sm text-muted-foreground leading-relaxed"
                data-speakable="story"
              >
                {t.story.analysis}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Offer · how they close
              </p>
              <p
                className="text-base font-semibold mb-3"
                data-speakable="offer"
              >
                {t.offer.pattern}
              </p>
              <p
                className="text-sm text-muted-foreground leading-relaxed"
                data-speakable="offer"
              >
                {t.offer.analysis}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* What's working */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="working"
      >
        <h2 id="working" className="text-2xl font-bold mb-6 leading-tight">
          What is working in this funnel
        </h2>
        <ul className="space-y-3">
          {t.whatsWorking.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </section>
      {/* What to adapt vs avoid */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="adapt"
      >
        <h2 id="adapt" className="text-2xl font-bold mb-6 leading-tight">
          What to adapt, what to avoid
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-3">
                Adapt for your indie SaaS
              </p>
              <ul className="space-y-2">
                {t.whatToAdapt.map((bullet) => (
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
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Do not copy without context
              </p>
              <ul className="space-y-2">
                {t.whatToAvoid.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <X className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-1" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Brunson lens */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="brunson"
      >
        <h2 id="brunson" className="text-2xl font-bold mb-6 leading-tight">
          The Brunson lens
        </h2>
        <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
          The same Hook / Story / Offer framework Unlock SaaS runs against
          your own page. We use it on every teardown so the vocabulary stays
          consistent across the surface.
        </p>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Hook
              </p>
              <p className="text-sm leading-relaxed">{t.brunsonLens.hook}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Story
              </p>
              <p className="text-sm leading-relaxed">{t.brunsonLens.story}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Offer
              </p>
              <p className="text-sm leading-relaxed">{t.brunsonLens.offer}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Value Ladder tier
              </p>
              <p className="text-sm leading-relaxed">
                {t.brunsonLens.valueLadderTier}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      {/* People Also Ask – PAA H3s sourced from this teardown's tldr,
          hook/story/offer patterns, and product snapshot. */}
      <PeopleAlsoAsk pairs={paaPairs} />
      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {t.displayName} funnel – FAQ
        </h2>
        <div className="space-y-3">
          {t.faqs.map((f) => (
            <details
              key={f.q}
              className="group border border-border rounded-lg px-4 py-3"
            >
              <summary className="cursor-pointer font-semibold leading-snug list-none flex items-start justify-between gap-3">
                <span data-speakable="faq-q">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform"
                >
                  ▾
                </span>
              </summary>
              <p
                className="mt-3 text-sm text-muted-foreground leading-relaxed"
                data-speakable="faq-a"
              >
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
              Want this teardown applied to your own page?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic runs the same Hook / Story / Offer
              framework against your live product page and labels what is
              broken: Wrong Person, Weak Offer, or Weak Belief. No email gate
              to see the diagnosis category.
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
      {/* Head-to-head comparisons including this product */}
      {comparisons.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
          aria-labelledby="comparisons"
        >
          <h2
            id="comparisons"
            className="text-lg font-bold mb-4 leading-tight"
          >
            {t.displayName} compared head-to-head
          </h2>
          <ul className="space-y-2">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="group flex items-start gap-2 text-sm hover:text-primary transition"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary" />
                  <span>
                    <span className="font-semibold">
                      {c.a.name} vs {c.b.name}
                    </span>{" "}
                    <span className="text-muted-foreground">— {c.oneLine}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {/* Related teardowns (internal linking graph) */}
      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10 border-t border-border/40"
          aria-labelledby="related"
        >
          <h2
            id="related"
            className="text-lg font-bold mb-4 leading-tight"
          >
            Related funnel teardowns
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/funnel-teardown/${r.slug}`}
                  className="group flex items-start gap-2 text-sm hover:text-primary transition"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary" />
                  <span>
                    <span className="font-semibold">{r.displayName}</span>{" "}
                    <span className="text-muted-foreground">— {r.oneLine}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link
              href="/funnel-teardown"
              className="underline hover:text-foreground"
            >
              Browse every funnel teardown →
            </Link>
          </p>
        </section>
      ) : null}
      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified{" "}
          <time dateTime={t.lastVerified}>
            {formatVerifiedDate(t.lastVerified)}
          </time>
          . This teardown describes publicly observable funnel patterns on{" "}
          {t.displayName}&apos;s marketing surface at that date. No quoted
          copy, no fabricated metrics, no claims about internal performance.
          {t.homepageUrl ? (
            <>
              {" "}
              Visit {t.displayName} at{" "}
              <a
                href={t.homepageUrl}
                target="_blank"
                rel="noopener noreferrer external"
                className="underline hover:text-foreground"
              >
                {t.homepageUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
              .
            </>
          ) : null}{" "}
          If anything on this page is wrong, unfair, or out of date, email{" "}
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
