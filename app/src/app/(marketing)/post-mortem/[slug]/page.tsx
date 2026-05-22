import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  POST_MORTEM_SLUGS,
  getPostMortemBySlug,
  getRelatedPostMortems,
  type PostMortem,
} from "@/lib/post-mortems";
import { ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { articleImageFor } from "@/lib/seo/article-image";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * Programmatic SEO surface – Post-mortem: {Company}.
 *
 * Adds the post-mortem cluster after the existing /funnel-teardown and
 * /pricing-teardown pSEO blocks. Target intent: "[product] post-mortem",
 * "why did [product] fail", "[product] failure analysis".
 *
 * Brunson Hard-Rule reconciliation:
 *   - Pattern-level structural analysis only. No quoted founder copy.
 *   - The "What Unlock SaaS would have caught" block is the page's anchor.
 *     It maps the failure to the same Brunson diagnosis (Wrong Person,
 *     Weak Offer, Weak Belief) the V2 diagnostic would assign to a live
 *     founder page – making the lesson directly applicable to the reader.
 *   - Funding numbers and shutdown facts are widely-reported public
 *     facts. No invented metrics; uncertain numbers are described
 *     qualitatively rather than guessed.
 *   - Sources block links the underlying public reporting. lastVerified
 *     ISO is the audit trail.
 *
 * JSON-LD on every page: Article + FAQPage + BreadcrumbList. All three
 * are built from module-level static data with no user input. Static
 * rendering via generateStaticParams; unknown slugs 404 instead of being
 * lazily generated, so crawlers cannot discover phantom URLs.
 */

const BASE = "https://unlocksaas.com";

export function generateStaticParams() {
  return POST_MORTEM_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const p = getPostMortemBySlug(params.slug);
  if (!p) return {};

  const canonical = `/post-mortem/${p.slug}`;
  const title = `${p.displayName} Post-Mortem – Why It Failed and What Indie Founders Can Learn`;
  const description = p.oneLine;

  return {
    title,
    description,
    alternates: markdownAlternate(canonical, `/post-mortem/${p.slug}/md`),
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
  p: PostMortem,
  canonicalUrl: string,
): string[] {
  // Subject entity for `about` / `mentions`. When the underlying company
  // page is unavailable (e.g. shut down) we fall back to the Wikipedia
  // URL stored as homepageUrl – still a stable knowledge-graph anchor.
  const subjectEntity = p.homepageUrl
    ? {
        "@type": "Organization",
        name: p.displayName,
        url: p.homepageUrl,
      }
    : p.displayName;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${p.displayName} Post-Mortem – Why It Failed and What Indie Founders Can Learn`,
    image: articleImageFor(canonicalUrl),
    description: p.oneLine,
    abstract: p.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: p.lastVerified,
    dateModified: p.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: subjectEntity,
    mentions: [subjectEntity],
    keywords: p.tags.join(", "),
    inLanguage: "en-US",
    speakable: buildSpeakable(
      '[data-speakable="tldr"]',
      '[data-speakable="diagnosis"]',
      '[data-speakable="counterfactual"]',
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
      '[data-speakable="tldr"]',
      '[data-speakable="diagnosis"]',
      '[data-speakable="counterfactual"]',
      '[data-speakable="faq-q"]',
      '[data-speakable="faq-a"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: p.faqs.map((f) => ({
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
        name: "Post-mortems",
        item: `${BASE}/post-mortem`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${p.displayName} post-mortem`,
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

export default async function PostMortemPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const p = getPostMortemBySlug(params.slug);
  if (!p) notFound();

  const canonicalUrl = `${BASE}/post-mortem/${p.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(p, canonicalUrl);
  const related = getRelatedPostMortems(p.slug, 4);

  return (
    <article className="min-h-screen">
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
            <Link href="/post-mortem" className="hover:underline">
              Post-mortems
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {p.displayName}
          </li>
        </ol>
      </nav>
      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Post-mortem · {p.category} · shutdown {p.shutdownYear}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {p.displayName} post-mortem
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {p.oneLine}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={p.lastVerified}>
            {formatVerifiedDate(p.lastVerified)}
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
        headingLabel={`${p.displayName} post-mortem TL;DR`}
        items={[
          { term: "Company", definition: p.displayName },
          { term: "Category", definition: p.category },
          { term: "Years active", definition: p.yearsActive },
          { term: "Shutdown reason", definition: p.shutdownReason },
          {
            term: "Unlock SaaS diagnosis",
            definition: p.unlockSaaSWouldHaveCaught.diagnosis,
          },
          { term: "TL;DR", definition: p.tldr },
          {
            term: "Last verified",
            definition: formatVerifiedDate(p.lastVerified),
          },
        ]}
      />
      {/* Speakable wrapper around tldr text (for assistants that read the
          page aloud – the TldrSummary component does not yet emit a
          data-speakable attribute on its body text). */}
      <p className="sr-only" data-speakable="tldr">
        {p.tldr}
      </p>
      {/* Product snapshot */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="snapshot"
      >
        <h2 id="snapshot" className="text-2xl font-bold mb-6 leading-tight">
          What {p.displayName} actually sold
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              What they sold
            </dt>
            <dd className="text-sm leading-relaxed">
              {p.productSnapshot.whatTheySold}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Who it was for
            </dt>
            <dd className="text-sm leading-relaxed">
              {p.productSnapshot.whoFor}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Pricing observed
            </dt>
            <dd className="text-sm leading-relaxed">
              {p.productSnapshot.pricingNote}
            </dd>
          </div>
        </dl>
        {(p.fundingRaisedNote || p.peakValuationNote) && (
          <dl className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.fundingRaisedNote && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Funding raised
                </dt>
                <dd className="text-sm leading-relaxed">
                  {p.fundingRaisedNote}
                </dd>
              </div>
            )}
            {p.peakValuationNote && (
              <div>
                <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Peak valuation
                </dt>
                <dd className="text-sm leading-relaxed">
                  {p.peakValuationNote}
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>
      {/* Timeline */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="timeline"
      >
        <h2 id="timeline" className="text-2xl font-bold mb-6 leading-tight">
          Timeline
        </h2>
        <ol className="space-y-4 border-l border-border pl-6">
          {p.timeline.map((beat) => (
            <li key={`${beat.period}-${beat.event}`} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[1.65rem] top-1.5 h-2 w-2 rounded-full bg-primary"
              />
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {beat.period}
              </p>
              <p className="text-sm leading-relaxed">{beat.event}</p>
            </li>
          ))}
        </ol>
      </section>
      {/* Root causes */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="root-causes"
      >
        <h2 id="root-causes" className="text-2xl font-bold mb-6 leading-tight">
          Structural root causes
        </h2>
        <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
          Framework-agnostic. The next section maps these to the Brunson
          diagnosis the Unlock SaaS audit would have assigned.
        </p>
        <ul className="space-y-3">
          {p.rootCauses.map((cause) => (
            <li key={cause} className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="leading-relaxed">{cause}</span>
            </li>
          ))}
        </ul>
      </section>
      {/* What Unlock SaaS would have caught – the page's anchor */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="unlocksaas-counterfactual"
      >
        <h2
          id="unlocksaas-counterfactual"
          className="text-2xl font-bold mb-3 leading-tight"
        >
          What Unlock SaaS would have caught
        </h2>
        <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
          The same Brunson Hook / Story / Offer framework the V2 diagnostic
          runs against your live page, applied retroactively to{" "}
          {p.displayName}&apos;s public surface. The diagnosis is one of three
          categories the audit assigns to every page: Wrong Person, Weak
          Offer, or Weak Belief.
        </p>
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Brunson diagnosis
              </p>
              <p
                className="text-lg font-semibold leading-snug"
                data-speakable="diagnosis"
              >
                {p.unlockSaaSWouldHaveCaught.diagnosis}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Diagnostic signal
              </p>
              <p
                className="text-sm leading-relaxed"
                data-speakable="diagnosis"
              >
                {p.unlockSaaSWouldHaveCaught.diagnosticSignal}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Machine gap
              </p>
              <p className="text-sm leading-relaxed">
                {p.unlockSaaSWouldHaveCaught.machineGap}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Structural fix
              </p>
              <p
                className="text-sm leading-relaxed"
                data-speakable="counterfactual"
              >
                {p.unlockSaaSWouldHaveCaught.counterfactual}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      {/* Lessons */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="lessons"
      >
        <h2 id="lessons" className="text-2xl font-bold mb-6 leading-tight">
          Transferable lessons for an indie SaaS
        </h2>
        <ul className="space-y-3">
          {p.lessons.map((lesson) => (
            <li key={lesson} className="flex gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="leading-relaxed">{lesson}</span>
            </li>
          ))}
        </ul>
      </section>
      {/* What to avoid */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="avoid"
      >
        <h2 id="avoid" className="text-2xl font-bold mb-6 leading-tight">
          What not to copy as a lesson
        </h2>
        <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
          The failure mode is teachable. Some specific moves the company
          made, however, should not be copied as if they were lessons.
        </p>
        <ul className="space-y-3">
          {p.whatToAvoid.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-muted-foreground leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {p.displayName} post-mortem – FAQ
        </h2>
        <div className="space-y-3">
          {p.faqs.map((f) => (
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
              Want the same audit on your own page, before the post-mortem?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic runs the same Hook / Story / Offer
              framework against your live product page and labels what is
              broken: Wrong Person, Weak Offer, or Weak Belief. The same
              three categories used to diagnose{" "}
              <span className="font-semibold">{p.displayName}</span> above.
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
      {/* Sources */}
      {p.sources.length > 0 && (
        <section
          className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
          aria-labelledby="sources"
        >
          <h2
            id="sources"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
          >
            Sources
          </h2>
          <ul className="space-y-2 text-sm">
            {p.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="underline hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {/* Related post-mortems */}
      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10 border-t border-border/40"
          aria-labelledby="related"
        >
          <h2 id="related" className="text-lg font-bold mb-4 leading-tight">
            Related post-mortems
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/post-mortem/${r.slug}`}
                  className="group flex items-start gap-2 text-sm hover:text-primary transition"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary" />
                  <span>
                    <span className="font-semibold">{r.displayName}</span>{" "}
                    <span className="text-muted-foreground">
                      – {r.oneLine}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link
              href="/post-mortem"
              className="underline hover:text-foreground"
            >
              Browse every post-mortem →
            </Link>
          </p>
        </section>
      ) : null}
      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified{" "}
          <time dateTime={p.lastVerified}>
            {formatVerifiedDate(p.lastVerified)}
          </time>
          . This post-mortem describes publicly-reported events and
          structural patterns. No fabricated metrics, no invented quotes,
          no claims about internal performance beyond what has been
          publicly reported. If anything on this page is wrong, unfair,
          or out of date, email{" "}
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
