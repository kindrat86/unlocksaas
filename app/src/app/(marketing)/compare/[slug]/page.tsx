import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, Minus, Scale, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  COMPARE_SLUGS,
  getCompareBySlug,
  type CompareEntry,
  type CompareCriterion,
} from "@/lib/compare-catalog";
import { ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * Programmatic SEO surface — /compare/[a]-vs-[b].
 *
 * Switzerland-style shopping comparator. Sister surface to /vs/[slug] but
 * lighter and intentionally non-overlapping in slugs:
 *
 *   /vs/[slug]       – long-form dimensional editorial (6-9 dimensions,
 *                      per-side Review schema, deep FAQs).
 *   /compare/[slug]  – quick-verdict comparator (5-7 criteria, "pick A if
 *                      / pick B if" bullets, "when neither fits" callout
 *                      that earns trust by admitting both can be wrong,
 *                      tighter FAQ).
 *
 * Greg Isenberg / 2026 distribution rationale: G2 owns "[A] vs [B]" SERP
 * real estate because nobody else builds these. Every page funnels to the
 * Diagnostic CTA – the reader's offer is the real lever regardless of
 * which tool they pick.
 *
 * Brunson Hard-Rule reconciliation: symmetric framing, no slag, no
 * fabricated metrics, dated lastVerified, explicit "when neither fits"
 * keeps the Switzerland framing honest.
 */

const BASE = "https://unlocksaas.com";

export function generateStaticParams() {
  return COMPARE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const c = getCompareBySlug(params.slug);
  if (!c) return {};

  const canonical = `/compare/${c.slug}`;
  const title = `${c.a.name} vs ${c.b.name} – Honest Comparison`;
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

function buildJsonLd(c: CompareEntry, canonicalUrl: string): string[] {
  const subjectA = { "@type": "Organization", name: c.a.name, url: c.a.url };
  const subjectB = { "@type": "Organization", name: c.b.name, url: c.b.url };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${c.a.name} vs ${c.b.name} – Honest Comparison`,
    description: c.oneLine,
    abstract: c.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: c.lastVerified,
    dateModified: c.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    about: [subjectA, subjectB],
    mentions: [subjectA, subjectB],
    keywords: c.tags.join(", "),
    inLanguage: "en-US",
    speakable: buildSpeakable(
      '[data-speakable="verdict"]',
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
      '[data-speakable="verdict"]',
      '[data-speakable="faq-q"]',
      '[data-speakable="faq-a"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: c.faqs.map((f) => ({
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

// ----- Helpers --------------------------------------------------------------

function WinnerIcon({
  winner,
  side,
  aName,
  bName,
}: {
  winner: CompareCriterion["winner"];
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
        aria-label={`${name} wins this criterion`}
      />
    );
  }
  if (winner === "tie") {
    return (
      <Scale
        className="h-4 w-4 text-muted-foreground inline-block"
        aria-label="Tied on this criterion"
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
      aria-label={`${name} does not win this criterion`}
    />
  );
}

// ----- Page -----------------------------------------------------------------

export default async function ComparePage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const c = getCompareBySlug(params.slug);
  if (!c) notFound();

  const canonicalUrl = `${BASE}/compare/${c.slug}`;
  const jsonLdBlocks = buildJsonLd(c, canonicalUrl);

  const founderRec =
    c.forFounder.pick === "A"
      ? c.a.name
      : c.forFounder.pick === "B"
        ? c.b.name
        : null;

  return (
    <article className="min-h-screen">
      {jsonLdBlocks.map((json, idx) => (
        <JsonLdBlock key={idx} json={json} />
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

      {/* TL;DR */}
      <TldrSummary
        headingLabel={`${c.a.name} vs ${c.b.name} TL;DR`}
        items={[
          { term: "Compared", definition: `${c.a.name} vs ${c.b.name}` },
          { term: "Category", definition: c.category },
          { term: "TL;DR", definition: c.tldr },
          {
            term: "Founder pick",
            definition:
              c.forFounder.pick === "depends"
                ? `Depends – ${c.forFounder.reasoning}`
                : `${c.forFounder.pick === "A" ? c.a.name : c.b.name} – ${c.forFounder.reasoning}`,
          },
          {
            term: "Last verified",
            definition: formatVerifiedDate(c.lastVerified),
          },
        ]}
      />

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

      {/* Criteria table */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="criteria"
      >
        <h2 id="criteria" className="text-2xl font-bold mb-6 leading-tight">
          Criterion-by-criterion
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          <Check className="h-3.5 w-3.5 inline text-primary" /> wins this
          criterion &nbsp;·&nbsp;
          <Scale className="h-3.5 w-3.5 inline text-muted-foreground" /> tied
          &nbsp;·&nbsp;
          <Minus className="h-3.5 w-3.5 inline text-muted-foreground" />{" "}
          different shapes, not directly comparable
        </p>
        <div className="space-y-3">
          {c.criteria.map((d) => (
            <Card key={d.name}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <h3 className="text-base font-semibold leading-tight">
                    {d.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* When neither fits – the Switzerland tell */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="neither"
      >
        <h2 id="neither" className="text-2xl font-bold mb-4 leading-tight">
          When neither is the right call
        </h2>
        <Card className="border-muted-foreground/30">
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed">{c.whenNeitherFits}</p>
          </CardContent>
        </Card>
      </section>

      {/* Founder recommendation */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="founder"
      >
        <h2 id="founder" className="text-2xl font-bold mb-4 leading-tight">
          If you are an indie SaaS founder
        </h2>
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-2">
              {founderRec ? `Pick ${founderRec}` : "It depends"}
            </p>
            <p
              className="text-sm leading-relaxed"
              data-speakable="verdict"
            >
              {c.forFounder.reasoning}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="faq"
      >
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {c.a.name} vs {c.b.name} – FAQ
        </h2>
        <div className="space-y-3">
          {c.faqs.map((f) => (
            <details
              key={f.q}
              className="group border border-border rounded-lg px-4 py-3"
            >
              <summary
                className="cursor-pointer font-semibold leading-snug list-none flex items-start justify-between gap-3"
                data-speakable="faq-q"
              >
                <span>{f.q}</span>
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

      {/* Diagnostic CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              The tool is rarely the lever
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Whichever of {c.a.name} or {c.b.name} you pick, the offer page is
              usually where you lose the buyer. The 90-second diagnostic labels
              what is broken on yours: Wrong Person, Weak Offer, or Weak Belief.
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
          {" · "}
          <Link
            href="/vs"
            className="text-primary hover:underline font-semibold"
          >
            Long-form head-to-head editorial →
          </Link>
        </p>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified{" "}
          <time dateTime={c.lastVerified}>
            {formatVerifiedDate(c.lastVerified)}
          </time>
          . This comparison describes publicly observable behavior of{" "}
          {c.a.name} and {c.b.name} at that date. No quoted copy, no fabricated
          metrics, no claims about internal performance. See{" "}
          <a
            href={c.a.url}
            target="_blank"
            rel="noopener noreferrer external"
            className="underline hover:text-foreground"
          >
            {c.a.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>{" "}
          and{" "}
          <a
            href={c.b.url}
            target="_blank"
            rel="noopener noreferrer external"
            className="underline hover:text-foreground"
          >
            {c.b.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
          . If anything on this page is wrong or out of date, email{" "}
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
