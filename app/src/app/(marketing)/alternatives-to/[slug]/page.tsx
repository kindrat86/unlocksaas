import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ALTERNATIVE_SLUGS,
  CAPABILITY_ROWS,
  UNLOCK_SAAS_CAPABILITIES,
  getAlternativeBySlug,
  getRelatedAlternatives,
  type Alternative,
} from "@/lib/alternatives";
import { getTeardownBySlug } from "@/lib/funnel-teardowns";
import { hasPricingTeardown } from "@/lib/pricing-teardowns";
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
  paaForAlternative,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";

/**
 * Programmatic SEO surface — Unlock SaaS vs {Alternative}.
 *
 * Strategy:
 *   - Surface A (organic) in strategy/google-strategy.md. Target the
 *     "[product] alternative" intent class with a canonical, honest answer.
 *   - JSON-LD on every page: Article (the comparison piece), FAQPage
 *     (Q/A pairs an LLM can paraphrase), BreadcrumbList (sitelink hint).
 *   - generateStaticParams + force-static + dynamicParams=false makes
 *     every slug prerendered at build, and unknown slugs 404 cleanly.
 *
 * No client component is needed. All data is module-level constants in
 * src/lib/alternatives.ts; rendering is pure server.
 */

const BASE = "https://unlocksaas.com";

// ----- Static rendering directives -------------------------------------------
// Prerender all known alternatives at build. Unknown slugs return 404 (instead
// of being lazily generated at request time) so the surface stays tight and
// crawlers cannot discover phantom URLs.

export function generateStaticParams() {
  return ALTERNATIVE_SLUGS.map((slug) => ({ slug }));
}

// ----- Per-page metadata -----------------------------------------------------
type RouteParams = { slug: string };

export async function generateMetadata(
  props: {
    params: Promise<RouteParams>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const alt = getAlternativeBySlug(params.slug);
  if (!alt) return {};

  const canonical = `/alternatives-to/${alt.slug}`;
  const title = `${alt.displayName} vs Unlock SaaS — Honest Comparison`;
  const description = alt.oneLine;

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

// ----- JSON-LD helpers (per-slug, hence inlined here, not in json-ld.tsx) ---

/**
 * Pure data → JSON string. Called once per render of a prerendered page,
 * so this runs at build time. Safe to keep simple; no user input flows in.
 */
function buildJsonLd(
  alt: Alternative,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  // Subject-entity for `about` and `mentions`. If the manifest carries a
  // homepageUrl we name the competitor as a real Organization with a URL
  // Google's Knowledge Graph and LLM retrievers can walk; otherwise we
  // fall back to a bare name string (still valid, lower density).
  const subjectEntity = alt.homepageUrl
    ? {
        "@type": "Organization",
        name: alt.displayName,
        url: alt.homepageUrl,
      }
    : alt.displayName;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${alt.displayName} vs Unlock SaaS — Honest Comparison`,
    description: alt.oneLine,
    // Reference the canonical @ids declared on the funnel hub via
    // OrganizationJsonLd / PersonJsonLd. Google walks the @id graph
    // instead of treating each Article as carrying its own disconnected
    // Person/Org records. See src/lib/seo/entity.ts ID.* for the
    // single source of truth.
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    inLanguage: "en-US",
    datePublished: alt.lastVerified,
    dateModified: alt.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    // `about` names the primary subject of the comparison; `mentions`
    // is the broader entity-graph anchor list. For a head-to-head page
    // both surfaces resolve to the same competitor; declaring both
    // satisfies retrievers that walk one but not the other.
    about: subjectEntity,
    mentions: [subjectEntity],
    // VEO — Quick-take section on this page wraps in
    // `aria-labelledby="quick-take"`, matched by SPEAKABLE_SELECTORS.
    // Voice modes read the comparison summary first.
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
        name: "Alternatives",
        item: `${BASE}/alternatives-to`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${alt.displayName} vs Unlock SaaS`,
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
  // json is built from module-level static data; no user input flows here.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

// ----- Page ------------------------------------------------------------------

export default async function AlternativePage(props: { params: Promise<RouteParams> }) {
  const params = await props.params;
  const alt = getAlternativeBySlug(params.slug);
  if (!alt) notFound();

  const canonicalUrl = `${BASE}/alternatives-to/${alt.slug}`;
  const paaPairs = paaForAlternative(alt);
  const mergedFaqs = mergePaaIntoFaqs(alt.faqs, paaPairs);
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    alt,
    canonicalUrl,
    mergedFaqs,
  );

  // ----- Cross-link lookups (closes the 2026-05-17 link-graph dead-end) ------
  // Each is defensive: if no matching entity exists in the sister manifests
  // the corresponding section simply doesn't render. That keeps the page
  // honest for current data (none of the 9 alternatives currently overlap
  // with the teardown catalogues by slug) and ready to compound the moment
  // the manifests fan out — the failure mode is "more internal links," not
  // "broken links."
  const hasFunnelTeardown = Boolean(getTeardownBySlug(alt.slug));
  const hasPricing = hasPricingTeardown(alt.slug);
  const comparisons = getComparisonsForProductSlug(alt.slug);
  const category = getCategoryByRawString(alt.category);
  const related = getRelatedAlternatives(alt.slug, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />
      {/* ----- Breadcrumb visible trail (matches BreadcrumbList JSON-LD) ----- */}
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
            <Link href="/alternatives-to" className="hover:underline">
              Alternatives
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {alt.displayName} vs Unlock SaaS
          </li>
        </ol>
      </nav>
      {/* ----- Hero ----- */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Honest comparison
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {alt.displayName} vs Unlock SaaS
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {alt.oneLine}
        </p>
        {/*
          Above-the-fold "Verified" stamp. Alternatives pages compare a
          live competitor surface against Unlock SaaS — the visible date
          is the audit trail. Semantic <time> for Google's "Last Updated"
          snippet extractor; editorial-policy link reinforces E-E-A-T at
          the first scroll position.
         */}
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={alt.lastVerified}>
            {formatVerifiedDate(alt.lastVerified)}
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
        headingLabel={`${alt.displayName} key facts`}
        items={[
          { term: "Tool", definition: alt.displayName },
          { term: "Category", definition: alt.category },
          { term: "Pricing", definition: alt.pricingNote },
          { term: "Best for", definition: alt.whoForIt },
          { term: "Not for", definition: alt.whoNotForIt },
          { term: "Honest verdict", definition: alt.honestVerdict },
          {
            term: "Last verified",
            definition: formatVerifiedDate(alt.lastVerified),
          },
        ]}
      />
      {/* ----- Cross-pattern callouts (link-graph parity with funnel /
            pricing teardowns). Each renders only when a sister manifest
            entry matches this slug; defensive-by-design. ----- */}
      {hasFunnelTeardown ? (
        <section
          className="max-w-3xl mx-auto px-6 py-4"
          aria-labelledby="cross-funnel"
        >
          <h2 id="cross-funnel" className="sr-only">
            Also see
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm leading-relaxed">
              Want the full Hook / Story / Offer teardown of{" "}
              <span className="font-semibold">{alt.displayName}</span>&apos;s
              funnel?
            </p>
            <Link
              href={`/funnel-teardown/${alt.slug}`}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Read the funnel teardown →
            </Link>
          </div>
        </section>
      ) : null}
      {hasPricing ? (
        <section
          className="max-w-3xl mx-auto px-6 py-2"
          aria-labelledby="cross-pricing"
        >
          <h2 id="cross-pricing" className="sr-only">
            Also see
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm leading-relaxed">
              Studying{" "}
              <span className="font-semibold">{alt.displayName}</span>&apos;s
              pricing model specifically?
            </p>
            <Link
              href={`/pricing-teardown/${alt.slug}`}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Read the pricing teardown →
            </Link>
          </div>
        </section>
      ) : null}
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
      {/* ----- The two-column quick-take ----- */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="quick-take"
      >
        <h2 id="quick-take" className="sr-only">
          Quick take
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {alt.displayName}
              </p>
              <p className="text-sm font-semibold mb-3">{alt.category}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {alt.pricingNote.split(".")[0]}.
              </p>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Unlock SaaS
              </p>
              <p className="text-sm font-semibold mb-3">
                Playbook that produces a Stripe-verified first paying customer in
                60 days, or you do not pay
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                $1 Starter, $49/month Playbook.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* ----- Capability comparison table ----- */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="capabilities"
      >
        <h2 id="capabilities" className="text-2xl font-bold mb-6 leading-tight">
          Side-by-side capabilities
        </h2>
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                    Capability
                  </th>
                  <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-foreground">
                    Unlock SaaS
                  </th>
                  <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                    {alt.displayName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {CAPABILITY_ROWS.map((row) => {
                  const us = UNLOCK_SAAS_CAPABILITIES[row.key];
                  const them = alt.capabilities[row.key];
                  return (
                    <tr
                      key={row.key}
                      className="border-b border-border/40 last:border-b-0"
                    >
                      <td className="py-3 pr-4 leading-snug">{row.label}</td>
                      <td className="py-3 px-2 text-center">
                        {us ? (
                          <Check
                            className="h-5 w-5 text-primary mx-auto"
                            aria-label={`Unlock SaaS: yes — ${row.label}`}
                          />
                        ) : (
                          <X
                            className="h-5 w-5 text-muted-foreground/50 mx-auto"
                            aria-label={`Unlock SaaS: no — ${row.label}`}
                          />
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        {them ? (
                          <Check
                            className="h-5 w-5 text-primary mx-auto"
                            aria-label={`${alt.displayName}: yes — ${row.label}`}
                          />
                        ) : (
                          <X
                            className="h-5 w-5 text-muted-foreground/50 mx-auto"
                            aria-label={`${alt.displayName}: no — ${row.label}`}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground italic mt-4 leading-relaxed">
          We do not slag {alt.displayName}. They built a different thing. This
          table compares both against the same canonical job: producing one
          Stripe-verified paying customer for an already-shipped SaaS.
        </p>
      </section>
      {/* ----- What it is / is not ----- */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="what-it-is"
      >
        <h2
          id="what-it-is"
          className="text-2xl font-bold mb-6 leading-tight"
        >
          What {alt.displayName} actually is
        </h2>
        <ul className="space-y-2 mb-8">
          {alt.whatItIs.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold mb-6 leading-tight">
          What {alt.displayName} is not
        </h2>
        <ul className="space-y-2">
          {alt.whatItIsNot.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <X className="h-5 w-5 text-muted-foreground/60 shrink-0 mt-0.5" />
              <span className="leading-relaxed text-muted-foreground">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {/* ----- Who each is for ----- */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="who-for"
      >
        <h2 id="who-for" className="text-2xl font-bold mb-6 leading-tight">
          Who each is for
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {alt.displayName} is for
              </p>
              <p className="text-sm leading-relaxed">{alt.whoForIt}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Unlock SaaS is for
              </p>
              <p className="text-sm leading-relaxed">{alt.whoNotForIt}</p>
            </CardContent>
          </Card>
        </div>
      </section>
      {/* ----- Honest verdict ----- */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="verdict"
      >
        <h2 id="verdict" className="text-2xl font-bold mb-4 leading-tight">
          Honest verdict
        </h2>
        <p
          className="text-base leading-relaxed"
          data-speakable="verdict"
        >
          {alt.honestVerdict}
        </p>
      </section>
      {/* ----- People Also Ask — canonical PAA phrasings sourced from
          this alternative's whatItIs / honestVerdict / whoForIt / pricing. */}
      <PeopleAlsoAsk pairs={paaPairs} />
      {/* ----- FAQ — mirrors FAQPage JSON-LD above ----- */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {alt.displayName} vs Unlock SaaS — FAQ
        </h2>
        <div className="space-y-3">
          {alt.faqs.map((f) => (
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
      {/* ----- CTA ----- */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Run the 90-second diagnostic
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Paste the URL of the product you already shipped. The diagnostic
              labels what is broken — Wrong Person, Weak Offer, or Weak Belief
              — and hands you the door that fixes it. No email gate to see the
              diagnosis category.
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
      {/* ----- Head-to-head comparisons featuring this product (internal
            linking graph; mirrors the same block on funnel/pricing teardowns) ----- */}
      {comparisons.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
          aria-labelledby="comparisons"
        >
          <h2
            id="comparisons"
            className="text-lg font-bold mb-4 leading-tight"
          >
            {alt.displayName} compared head-to-head
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
      {/* ----- Related alternatives (closes the dead-end the SEO audit
            flagged: tag-overlap-ranked sibling pages so crawlers and
            humans both exit into more of the manifest). ----- */}
      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10 border-t border-border/40"
          aria-labelledby="related"
        >
          <h2 id="related" className="text-lg font-bold mb-4 leading-tight">
            Related alternatives
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/alternatives-to/${r.slug}`}
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
              href="/alternatives-to"
              className="underline hover:text-foreground"
            >
              Browse every alternatives comparison →
            </Link>
          </p>
        </section>
      ) : null}
      {/* ----- Honesty footer ----- */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified{" "}
          <time dateTime={alt.lastVerified}>
            {formatVerifiedDate(alt.lastVerified)}
          </time>
          . {alt.pricingNote}
          {alt.homepageUrl ? (
            <>
              {" "}
              Visit {alt.displayName} at{" "}
              <a
                href={alt.homepageUrl}
                target="_blank"
                rel="noopener noreferrer external"
                className="underline hover:text-foreground"
              >
                {alt.homepageUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
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
