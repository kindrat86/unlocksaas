import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CASE_STUDY_SLUGS,
  getCaseStudyBySlug,
  type CaseStudyEntry,
  CASE_STUDY_CATEGORY_LABELS,
} from "@/lib/case-studies";
import { getGlossaryBySlug } from "@/lib/glossary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import { DirectAnswer } from "@/components/seo/direct-answer";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

const BASE = "https://unlocksaas.com";

export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const c = getCaseStudyBySlug(params.slug);
  if (!c) return {};

  const canonical = `/case-studies/${c.slug}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: c.metaTitle,
      description: c.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription,
    },
  };
}

function buildJsonLd(c: CaseStudyEntry, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.oneLine,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: c.lastVerified,
    dateModified: c.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    speakable: buildSpeakable(
      '[data-speakable="result"]',
      '[data-speakable="problem"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Case Studies", item: `${BASE}/case-studies` },
      { "@type": "ListItem", position: 3, name: c.title, item: canonicalUrl },
    ],
  };

  return [JSON.stringify(article), JSON.stringify(breadcrumbs)];
}

export default async function CaseStudyPage(props: { params: Promise<RouteParams> }) {
  const params = await props.params;
  const c = getCaseStudyBySlug(params.slug);
  if (!c) notFound();

  const canonicalUrl = `${BASE}/case-studies/${c.slug}`;
  const jsonLdBlocks = buildJsonLd(c, canonicalUrl);
  const categoryLabel = CASE_STUDY_CATEGORY_LABELS[c.category] ?? c.category;

  const relatedGlossaryLinks = c.relatedGlossary
    .map((s) => getGlossaryBySlug(s))
    .filter((g): g is NonNullable<typeof g> => !!g);

  return (
    <article className="min-h-screen">
      {jsonLdBlocks.map((json, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li><Link href="/case-studies" className="hover:underline">Case Studies</Link></li>
          <li aria-current="page" className="text-foreground">{c.title}</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Case study · {categoryLabel}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {c.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-2">{c.founderProfile}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={c.lastVerified}>
            {formatVerifiedDate(c.lastVerified)}
          </time>
        </p>
      </header>

      <Separator className="my-2" />

      <DirectAnswer lastVerified={c.lastVerified} variant="verdict">
        {c.oneLine}
      </DirectAnswer>

      <TldrSummary
        headingLabel="Case study TL;DR"
        items={[
          { term: "Founder", definition: c.founderProfile },
          { term: "Category", definition: categoryLabel },
          { term: "Result", definition: c.theResult },
        ]}
      />

      {/* Backstory */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="backstory">
        <h2 id="backstory" className="text-2xl font-bold mb-4 leading-tight">
          The founder
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{c.backstory}</p>
      </section>

      <Separator className="my-2" />

      {/* The problem */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="problem"
        data-speakable="problem"
      >
        <h2 id="problem" className="text-2xl font-bold mb-4 leading-tight">
          The problem
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{c.theProblem}</p>
      </section>

      <Separator className="my-2" />

      {/* What changed */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="changed">
        <h2 id="changed" className="text-2xl font-bold mb-6 leading-tight">
          What changed
        </h2>
        <ol className="space-y-4">
          {c.whatChanged.map((change, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-primary/10 grid place-items-center text-primary text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">{change}</span>
            </li>
          ))}
        </ol>
      </section>

      <Separator className="my-2" />

      {/* The result */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="result"
        data-speakable="result"
      >
        <h2 id="result" className="text-2xl font-bold mb-4 leading-tight">
          The result
        </h2>
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm leading-relaxed font-medium">{c.theResult}</p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-2" />

      {/* Key lessons */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="lessons">
        <h2 id="lessons" className="text-xl font-bold mb-6 leading-tight">
          Key lessons
        </h2>
        <ul className="space-y-4">
          {c.keyLessons.map((lesson, i) => (
            <li key={i} className="flex items-start gap-3">
              <Quote className="shrink-0 mt-0.5 h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground leading-relaxed italic">{lesson}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Related glossary */}
      {relatedGlossaryLinks.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="related">
          <h2 id="related" className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
            Related terms
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedGlossaryLinks.map((g) => (
              <Link
                key={g.slug}
                href={`/glossary/${g.slug}`}
                className="text-xs bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80 transition"
              >
                {g.term}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Want to be the next case study?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook walks you through every step from a flat Stripe line
              to your first paying customer. 60-day guarantee, code-enforced.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/playbook-sales">See the Playbook</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Run the free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
