import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  OBJECTION_SLUGS,
  OBJECTION_ENTRIES,
  getObjectionBySlug,
  type ObjectionEntry,
} from "@/lib/objections";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getTemplateBySlug } from "@/lib/templates";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return OBJECTION_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getObjectionBySlug(params.slug);
  if (!e) return {};
  const canonical = `/objection/${e.slug}`;
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

function buildJsonLd(e: ObjectionEntry, canonicalUrl: string): string[] {
  const qaPage = {
    "@context": "https://schema.org",
    "@type": "QAPage",
    inLanguage: "en-US",
    mainEntity: {
      "@type": "Question",
      name: e.objection,
      text: e.objection,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.responseScript,
        inLanguage: "en-US",
        upvoteCount: 0,
        author: { "@id": ID.person },
      },
    },
  };

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
        name: "Objections",
        item: `${BASE_URL}/objection`,
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

const LENS_LABEL = {
  hook: "Hook (Wrong Person)",
  story: "Story (Weak Belief)",
  offer: "Offer (Weak Offer)",
} as const;

export default async function ObjectionDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getObjectionBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/objection/${e.slug}`;
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

  const relatedTemplate = e.relatedTemplateSlug
    ? getTemplateBySlug(e.relatedTemplateSlug)
    : undefined;

  const related = OBJECTION_ENTRIES.filter(
    (other) => other.brunsonLens === e.brunsonLens && other.slug !== e.slug,
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
            <Link href="/objection" className="hover:underline">
              Objections
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.objection}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {LENS_LABEL[e.brunsonLens]} · Surfaces in: {e.whereItSurfaces}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          &ldquo;{e.objection}&rdquo;
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
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="legitimacy"
      >
        <div>
          <h2
            id="legitimacy"
            className="text-base font-semibold mb-3 leading-tight"
          >
            When the objection is legitimate
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {e.whenLegitimate}
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-3 leading-tight">
            The real concern underneath
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {e.realConcernUnderneath}
          </p>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="response"
      >
        <h2 id="response" className="sr-only">
          Response script
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Response script
            </p>
            <p
              className="text-base leading-relaxed whitespace-pre-line"
              data-speakable
            >
              {e.responseScript}
            </p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="surface-concern"
      >
        <h2
          id="surface-concern"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          The question that surfaces the real concern
        </h2>
        <p className="text-base leading-relaxed italic">
          &ldquo;{e.surfaceTheRealConcern}&rdquo;
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="what-not"
      >
        <h2 id="what-not" className="text-xl font-semibold mb-4 leading-tight">
          What NOT to say
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.whatNotToSay.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {(relatedTemplate || glossaryLinks.length > 0) && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          {relatedTemplate ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Underlying template
              </h2>
              <Link
                href={`/template/${relatedTemplate.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {relatedTemplate.displayName} →
              </Link>
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
        <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
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
            More {e.brunsonLens}-lens objections
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/objection/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  &ldquo;{r.objection}&rdquo;
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
              Pre-empt this objection on your page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              diagnosis your page hits — and the objections you will hear
              follow directly from that diagnosis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/objection">All objections</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
