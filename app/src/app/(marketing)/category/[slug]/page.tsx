import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_SLUGS,
  getCategoryBySlug,
  getProductRosterForCategory,
  getComparisonsInCategory,
  type CategoryDef,
} from "@/lib/categories";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";
import { ID } from "@/lib/seo/entity";
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import { paaForCategory } from "@/lib/seo/paa-questions";

/**
 * pSEO #5 — Category roundup pages.
 *
 * Each /category/[slug] page aggregates every product, teardown, and
 * comparison in a canonical category bucket. Zero new analytical
 * writing — pure data reuse over the four existing manifests.
 *
 * Target intent: "best [category] for indie SaaS" and adjacent
 * curated-comparison queries. The roundup IS the answer.
 *
 * Static rendering: force-static + dynamicParams=false. Every
 * category is prerendered at build; unknown slugs 404.
 */

const BASE = "https://unlocksaas.com";


export function generateStaticParams() {
  return CATEGORY_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(
  props: {
    params: Promise<RouteParams>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return {};

  const canonical = `/category/${cat.slug}`;
  const title = `${cat.displayName} for Indie SaaS — Roundup and Comparisons`;
  const description = cat.oneLine;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
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
  cat: CategoryDef,
  canonicalUrl: string,
  paaPairs: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  const products = getProductRosterForCategory(cat.slug);
  const comparisons = getComparisonsInCategory(cat.slug);

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    // Stable @id so cross-page schemas (BreadcrumbList lists, internal
    // links from /category hub) can resolve this page as one node in
    // the entity graph. Matches the discipline shipped on glossary/
    // funnel-teardown / pricing-teardown / compare / etc. detail pages.
    "@id": canonicalUrl,
    name: `${cat.displayName} — Indie SaaS Roundup`,
    description: cat.oneLine,
    abstract: cat.intent,
    url: canonicalUrl,
    inLanguage: "en-US",
    // Speakable + access-mode: the "Category overview" intent
    // paragraph (matching the `abstract: cat.intent` field above)
    // is the canonical voice answer for "best {category} for indie
    // SaaS" voice queries. Marked `data-speakable` in the rendered
    // DOM, matching the [data-speakable] selector in
    // SPEAKABLE_SELECTORS. CollectionPage carries Speakable per
    // schema.org — the type is a subclass of WebPage, which is the
    // documented domain for SpeakableSpecification.
    // ACCESS_MODE_TEXTUAL declares the roundup is fully consumable
    // as text (the product/comparison lists are text-link rows, no
    // images carry meaning).
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
    // @id cross-references resolve to the canonical Organization /
    // WebSite nodes rendered by OrganizationJsonLd in the root layout.
    // Without these, Google's structured-data graph and the LLM
    // retrieval pipelines see this CollectionPage as a disconnected
    // node – the publisher / parent-website signal is lost. Pattern
    // is the same one already shipped on every other pSEO detail
    // surface (see glossary/[slug]/page.tsx for the canonical example).
    isPartOf: { "@id": ID.website },
    publisher: { "@id": ID.organization },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length + comparisons.length,
      itemListElement: [
        ...products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: p.funnelSlug
            ? `${BASE}/funnel-teardown/${p.funnelSlug}`
            : `${BASE}/pricing-teardown/${p.pricingSlug}`,
        })),
        ...comparisons.map((c, i) => ({
          "@type": "ListItem",
          position: products.length + i + 1,
          name: `${c.a.name} vs ${c.b.name}`,
          url: `${BASE}/compare/${c.slug}`,
        })),
      ],
    },
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
        name: "Categories",
        item: `${BASE}/category`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cat.displayName,
        item: canonicalUrl,
      },
    ],
  };

  // FAQPage: the PAA H3s rendered on the page also feed FAQPage
  // rich-result eligibility. Category roundup pages did not previously
  // emit FAQPage — the PAA pattern unlocks it. Drift-free by
  // construction: the same `paaPairs` array feeds both the visible H3s
  // and the schema mainEntity.
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: paaPairs.map((p) => ({
      "@type": "Question",
      name: p.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: p.a,
        inLanguage: "en-US",
      },
    })),
  };

  return [
    JSON.stringify(collection),
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

// ----- Page -----------------------------------------------------------------

export default async function CategoryPage(props: { params: Promise<RouteParams> }) {
  const params = await props.params;
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const canonicalUrl = `${BASE}/category/${cat.slug}`;
  const paaPairs = paaForCategory(cat);
  const [collectionJson, faqJson, breadcrumbJson] = buildJsonLd(
    cat,
    canonicalUrl,
    paaPairs,
  );
  const products = getProductRosterForCategory(cat.slug);
  const comparisons = getComparisonsInCategory(cat.slug);

  return (
    <main className="min-h-screen">
      <JsonLdBlock json={collectionJson} />
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
            <Link href="/category" className="hover:underline">
              Categories
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {cat.displayName}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Category roundup
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {cat.displayName} for indie SaaS
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {cat.oneLine}
        </p>
      </header>

      <Separator className="my-2" />

      {/* Intent / AEO citation block */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="intent">
        <h2 id="intent" className="sr-only">
          What this category contains
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Category overview
            </p>
            <p className="text-base leading-relaxed" data-speakable>
              {cat.intent}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* People Also Ask – PAA H3s sourced from this category's
          oneLine + intent paragraph. Captures "what is X" / "why does
          X matter" queries that cluster around category roundups. */}
      <PeopleAlsoAsk pairs={paaPairs} />

      {/* Products in this category */}
      {products.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10"
          aria-labelledby="products"
        >
          <h2
            id="products"
            className="text-2xl font-bold mb-6 leading-tight"
          >
            Products analyzed in this category
          </h2>
          <div className="space-y-3">
            {products.map((p) => (
              <Card
                key={p.name}
                className="hover:border-primary/30 transition"
              >
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold leading-tight mb-2">
                    {p.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {p.oneLine}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    {p.funnelSlug ? (
                      <Link
                        href={`/funnel-teardown/${p.funnelSlug}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        Funnel teardown →
                      </Link>
                    ) : null}
                    {p.pricingSlug ? (
                      <Link
                        href={`/pricing-teardown/${p.pricingSlug}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        Pricing teardown →
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* Comparisons in this category */}
      {comparisons.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10"
          aria-labelledby="comparisons"
        >
          <h2
            id="comparisons"
            className="text-2xl font-bold mb-6 leading-tight"
          >
            Head-to-head comparisons in this category
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
                    <span className="text-muted-foreground">
                      — {c.oneLine}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Building an indie SaaS in this category?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic labels what is broken on your offer:
              Wrong Person, Weak Offer, or Weak Belief. The category does
              not matter; the offer does.
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
        aria-labelledby="more"
      >
        <h2
          id="more"
          className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
        >
          Browse more
        </h2>
        <p className="text-sm leading-relaxed">
          <Link
            href="/category"
            className="text-primary hover:underline font-semibold"
          >
            <Layers className="h-4 w-4 inline" /> All categories
          </Link>{" "}
          —{" "}
          <Link
            href="/compare"
            className="text-primary hover:underline font-semibold"
          >
            Head-to-head comparisons
          </Link>
          {" — "}
          <Link
            href="/funnel-teardown"
            className="text-primary hover:underline font-semibold"
          >
            Funnel teardowns
          </Link>
          {" — "}
          <Link
            href="/pricing-teardown"
            className="text-primary hover:underline font-semibold"
          >
            Pricing teardowns
          </Link>
        </p>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          This roundup aggregates every product in the {cat.displayName.toLowerCase()}{" "}
          category that we have analyzed. The roundup itself does not slag
          any product; honesty inherits from the linked teardowns and
          comparisons. If any analysis is unfair, wrong, or out of date,
          email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix it.
        </p>
      </footer>
    </main>
  );
}
