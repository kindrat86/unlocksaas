import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  POSITIONING_SLUGS,
  POSITIONING_ENTRIES,
  getPositioningBySlug,
  type PositioningEntry,
} from "@/lib/positioning";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getNicheBySlug } from "@/lib/niches";
import { getCategoryBySlug } from "@/lib/categories";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return POSITIONING_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getPositioningBySlug(params.slug);
  if (!e) return {};
  const canonical = `/positioning/${e.slug}`;
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

function buildJsonLd(e: PositioningEntry, canonicalUrl: string): string[] {
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
        name: "Positioning",
        item: `${BASE_URL}/positioning`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.displayName,
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

export default async function PositioningDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getPositioningBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/positioning/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const category = getCategoryBySlug(e.categorySlug);

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const nicheLinks = e.relatedNiches
    .map((nicheSlug) => {
      const n = getNicheBySlug(nicheSlug);
      return n ? { slug: nicheSlug, label: n.displayName } : null;
    })
    .filter((x): x is { slug: string; label: string } => x !== null);

  const related = POSITIONING_ENTRIES.filter(
    (other) => other.slug !== e.slug,
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
            <Link href="/positioning" className="hover:underline">
              Positioning
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {category ? category.displayName : "Positioning"} ·{" "}
          {e.brunsonLens.toUpperCase()}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
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
        aria-labelledby="context"
      >
        <h2 id="context" className="text-xl font-semibold mb-4 leading-tight">
          Market context
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {e.marketContext}
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="for-whom"
      >
        <div>
          <h2
            id="for-whom"
            className="text-base font-semibold mb-3 leading-tight"
          >
            For whom
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {e.forWhom}
          </p>
        </div>
        <div>
          <h2
            id="not-for-whom"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Not for whom
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {e.notForWhom}
          </p>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="trap"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2 id="trap" className="text-base font-semibold mb-3 leading-tight">
              The single biggest positioning trap
            </h2>
            <p className="text-sm leading-relaxed">{e.positioningTrap}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="examples"
      >
        <h2 id="examples" className="text-xl font-semibold mb-4 leading-tight">
          Templated one-liner examples
        </h2>
        <ul className="space-y-6">
          {e.oneLinerExamples.map((ex) => (
            <li key={ex.title} className="border-l-2 border-primary/30 pl-4">
              <p className="text-sm font-semibold mb-1">{ex.title}</p>
              <p className="text-sm font-mono mb-2 text-foreground">
                {ex.template}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Slots:</span>{" "}
                {ex.slots}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="axes"
      >
        <h2 id="axes" className="text-xl font-semibold mb-4 leading-tight">
          The {e.positioningAxes.length} axes, in priority order
        </h2>
        <ol className="space-y-4 list-decimal list-inside">
          {e.positioningAxes.map((a) => (
            <li key={a.axis} className="text-base leading-relaxed">
              <span className="font-semibold">{a.axis}.</span>{" "}
              <span className="text-muted-foreground">{a.explanation}</span>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why-hard"
      >
        <h2
          id="why-hard"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Why this is hard in {category ? category.displayName : "this category"}
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.whyHard.map((h) => (
            <li key={h} className="text-base leading-relaxed">
              {h}
            </li>
          ))}
        </ul>
      </section>

      {(category || nicheLinks.length > 0 || glossaryLinks.length > 0) && (
        <section className="max-w-3xl mx-auto px-6 py-8">
          {category ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Category roundup
              </h2>
              <Link
                href={`/category/${category.slug}`}
                className="text-sm text-primary hover:underline"
              >
                See the {category.displayName} category roundup →
              </Link>
            </div>
          ) : null}
          {nicheLinks.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Niches this matters for
              </h2>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {nicheLinks.map((n) => (
                  <li key={n.slug}>
                    <Link
                      href={`/for/${n.slug}`}
                      className="text-primary hover:underline"
                    >
                      {n.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {glossaryLinks.length > 0 ? (
            <div>
              <h2 className="text-base font-semibold mb-2 leading-tight">
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
            </div>
          ) : null}
        </section>
      )}

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
            More positioning guides
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/positioning/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {r.displayName}
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
              Stress-test the positioning against your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic checks whether your
              positioning is making it to the visitor — labels Wrong Person,
              Weak Offer, or Weak Belief and names the specific fix.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/positioning">All positioning guides</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
