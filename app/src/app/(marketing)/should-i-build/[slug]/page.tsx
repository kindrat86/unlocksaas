import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SHOULD_I_BUILD_SLUGS,
  SHOULD_I_BUILD_ENTRIES,
  SHOULD_I_BUILD_VERDICT_LABELS,
  getShouldIBuildBySlug,
  type ShouldIBuildEntry,
} from "@/lib/should-i-build";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return SHOULD_I_BUILD_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getShouldIBuildBySlug(params.slug);
  if (!e) return {};
  const canonical = `/should-i-build/${e.slug}`;
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

function buildJsonLd(e: ShouldIBuildEntry, canonicalUrl: string): string[] {
  const qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage: "en-US",
    mainEntity: {
      "@type": "Question",
      name: e.question,
      text: e.question,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.verdictLine,
        inLanguage: "en-US",
        upvoteCount: 0,
        author: { "@id": ID.person },
      },
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.question,
    description: e.metaDescription,
    abstract: e.verdictLine,
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
        name: "Should I build?",
        item: `${BASE_URL}/should-i-build`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.question,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(qaPage),
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

const VERDICT_BANNER_CLASS: Record<
  ShouldIBuildEntry["verdict"],
  string
> = {
  yes: "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800",
  no: "border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800",
  depends: "border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800",
  "not-in-2026":
    "border-slate-300 bg-slate-50 dark:bg-slate-900 dark:border-slate-700",
};

export default async function ShouldIBuildDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getShouldIBuildBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/should-i-build/${e.slug}`;
  const [qaJson, articleJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

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

  const related = SHOULD_I_BUILD_ENTRIES.filter(
    (other) => other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={qaJson} />
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
            <Link href="/should-i-build" className="hover:underline">
              Should I build?
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
          Decision page
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.question}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
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

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="verdict">
        <h2 id="verdict" className="sr-only">
          Verdict
        </h2>
        <Card className={`border ${VERDICT_BANNER_CLASS[e.verdict]}`}>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest mb-3">
              Verdict:{" "}
              <span className="font-semibold">
                {SHOULD_I_BUILD_VERDICT_LABELS[e.verdict]}
              </span>
            </p>
            <p className="text-base leading-relaxed" data-speakable>
              {e.verdictLine}
            </p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="reasoning"
      >
        <h2 id="reasoning" className="text-xl font-semibold mb-4 leading-tight">
          The reasoning
        </h2>
        <div className="space-y-4">
          {e.body.map((p, i) => (
            <p key={i} className="text-base leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="flip"
      >
        <h2 id="flip" className="text-xl font-semibold mb-4 leading-tight">
          When the verdict flips
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.flipConditions.map((c) => (
            <li key={c} className="text-base leading-relaxed">
              {c}
            </li>
          ))}
        </ul>
      </section>

      {e.alternativePaths.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="alt"
        >
          <h2 id="alt" className="text-xl font-semibold mb-4 leading-tight">
            What to do instead
          </h2>
          <ul className="space-y-3 list-disc list-inside">
            {e.alternativePaths.map((a) => (
              <li key={a} className="text-base leading-relaxed">
                {a}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {nicheLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
          aria-labelledby="related-niches"
        >
          <h2
            id="related-niches"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Related niches
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
        </section>
      ) : null}

      {glossaryLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
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
            More decision pages
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/should-i-build/${r.slug}`}
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
              Pressure-test your idea with the free diagnostic
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic takes a live product URL
              and labels what is actually broken — Wrong Person, Weak Offer,
              or Weak Belief — so the &ldquo;should I build this&rdquo;
              decision becomes &ldquo;build this with these specific fixes&rdquo;.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/should-i-build">All decisions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
