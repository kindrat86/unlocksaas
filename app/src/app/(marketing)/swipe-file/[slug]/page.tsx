import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SWIPE_FILE_SLUGS,
  SWIPE_FILE_ENTRIES,
  getSwipeFileBySlug,
  resolveSourceTeardown,
  type SwipeFileEntry,
} from "@/lib/swipe-files";
import { getTeardownBySlug } from "@/lib/funnel-teardowns";
import { getPricingTeardownBySlug } from "@/lib/pricing-teardowns";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SWIPE_FILE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getSwipeFileBySlug(params.slug);
  if (!e) return {};
  const canonical = `/swipe-file/${e.slug}`;
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

function resolveSourceLabel(slug: string): { label: string; href: string } | null {
  const resolved = resolveSourceTeardown(slug);
  if (!resolved) return null;
  if (resolved.kind === "funnel") {
    const t = getTeardownBySlug(slug);
    return t ? { label: t.displayName, href: resolved.href } : null;
  }
  const t = getPricingTeardownBySlug(slug);
  return t ? { label: t.displayName, href: resolved.href } : null;
}

function buildJsonLd(e: SwipeFileEntry, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.intro,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `${e.element} swipe file`,
      "indie SaaS",
      "Brunson",
      e.brunsonLens,
    ].join(", "),
    inLanguage: "en-US",
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
        name: "Swipe files",
        item: `${BASE_URL}/swipe-file`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.title,
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

export default async function SwipeFileDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getSwipeFileBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/swipe-file/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const related = SWIPE_FILE_ENTRIES.filter(
    (other) => other.brunsonLens === e.brunsonLens && other.slug !== e.slug,
  ).slice(0, 4);

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
            <Link href="/swipe-file" className="hover:underline">
              Swipe files
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.title}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {e.element} · {e.brunsonLens.toUpperCase()}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.title}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {e.intro}
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

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="patterns"
      >
        <h2 id="patterns" className="text-xl font-semibold mb-4 leading-tight">
          Patterns
        </h2>
        <ul className="space-y-6">
          {e.patterns.map((p, i) => {
            const source = resolveSourceLabel(p.sourceTeardownSlug);
            return (
              <li key={i} className="border-l-2 border-primary/30 pl-4">
                <p className="text-sm font-mono mb-1 text-foreground">
                  {p.template}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">Slots:</span>{" "}
                  {p.slots}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">
                    Filled example:
                  </span>{" "}
                  {p.filledExample}
                </p>
                {source ? (
                  <p className="text-xs text-muted-foreground">
                    Source pattern observed on{" "}
                    <Link
                      href={source.href}
                      className="text-primary hover:underline"
                    >
                      {source.label}
                    </Link>
                    .
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="adapt"
      >
        <h2 id="adapt" className="text-xl font-semibold mb-4 leading-tight">
          How to adapt these to your own page
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {e.howToAdapt.map((step) => (
            <li key={step} className="text-base leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="diagnosis"
      >
        <h2
          id="diagnosis"
          className="text-base font-semibold mb-3 leading-tight"
        >
          What this fixes
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Applied correctly, this swipe file addresses the{" "}
          <Link
            href={`/why-isnt-my/${
              e.fixesDiagnosis === "wrong-person"
                ? "landing-page"
                : e.fixesDiagnosis === "weak-offer"
                  ? "upsell"
                  : "checkout"
            }`}
            className="text-primary hover:underline"
          >
            {e.fixesDiagnosis === "wrong-person"
              ? "Wrong Person"
              : e.fixesDiagnosis === "weak-offer"
                ? "Weak Offer"
                : "Weak Belief"}
          </Link>{" "}
          diagnosis — the Brunson Hook / Story / Offer triage that powers the
          live diagnostic.
        </p>
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

      {e.faqs.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="faq"
        >
          <h2 id="faq" className="text-xl font-semibold mb-4 leading-tight">
            Frequently asked
          </h2>
          <dl className="space-y-4">
            {e.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold mb-1">{f.q}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
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
            More swipe files for the same Brunson lens
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/swipe-file/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {r.title}
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
              Run this swipe against your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              diagnosis (Wrong Person, Weak Offer, Weak Belief) your page
              hits and tells you which swipe file to apply.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/swipe-file">All swipe files</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
