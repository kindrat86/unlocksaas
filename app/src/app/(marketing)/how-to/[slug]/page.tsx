import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  HOW_TO_SLUGS,
  getHowToBySlug,
  type HowToEntry,
  HOW_TO_CATEGORY_LABELS,
} from "@/lib/how-to";
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
  return HOW_TO_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const h = getHowToBySlug(params.slug);
  if (!h) return {};

  const canonical = `/how-to/${h.slug}`;
  return {
    title: h.metaTitle,
    description: h.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: h.metaTitle,
      description: h.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: h.metaTitle,
      description: h.metaDescription,
    },
  };
}

function buildJsonLd(h: HowToEntry, canonicalUrl: string): string[] {
  const howToSteps = h.steps.map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.heading,
    text: step.body,
  }));

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: h.title,
    description: h.oneLine,
    datePublished: h.lastVerified,
    dateModified: h.lastVerified,
    inLanguage: "en-US",
    step: howToSteps,
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: h.title,
    description: h.oneLine,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: h.lastVerified,
    dateModified: h.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    speakable: buildSpeakable(
      '[data-speakable="lead"]',
      '[data-speakable="step"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "How-to", item: `${BASE}/how-to` },
      { "@type": "ListItem", position: 3, name: h.title, item: canonicalUrl },
    ],
  };

  return [JSON.stringify(article), JSON.stringify(howTo), JSON.stringify(breadcrumbs)];
}

export default async function HowToPage(props: { params: Promise<RouteParams> }) {
  const params = await props.params;
  const h = getHowToBySlug(params.slug);
  if (!h) notFound();

  const canonicalUrl = `${BASE}/how-to/${h.slug}`;
  const jsonLdBlocks = buildJsonLd(h, canonicalUrl);
  const categoryLabel = HOW_TO_CATEGORY_LABELS[h.category] ?? h.category;

  const relatedGlossaryLinks = h.relatedGlossary
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
          <li><Link href="/how-to" className="hover:underline">How-to</Link></li>
          <li aria-current="page" className="text-foreground">{h.title}</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          How-to · {categoryLabel}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {h.title}
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={h.lastVerified}>
            {formatVerifiedDate(h.lastVerified)}
          </time>
        </p>
      </header>

      <Separator className="my-2" />

      <DirectAnswer lastVerified={h.lastVerified} variant="verdict" data-speakable="lead">
        {h.lead}
      </DirectAnswer>

      <TldrSummary
        headingLabel="Guide TL;DR"
        items={[
          { term: "Guide", definition: h.title },
          { term: "Category", definition: categoryLabel },
          { term: "Steps", definition: `${h.steps.length} steps` },
        ]}
      />

      {/* Steps */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="steps">
        <h2 id="steps" className="text-2xl font-bold mb-6 leading-tight">
          Step by step
        </h2>
        <ol className="space-y-8">
          {h.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4" data-speakable="step">
              <span className="shrink-0 mt-0.5 h-7 w-7 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-bold">
                {i + 1}
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold leading-tight">{step.heading}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Separator className="my-2" />

      {/* Pro tips */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="tips">
        <h2 id="tips" className="text-xl font-bold mb-6 leading-tight">
          Pro tips
        </h2>
        <ul className="space-y-3">
          {h.proTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <Lightbulb className="shrink-0 mt-0.5 h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
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
              Want the guided version?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook guides you step by step through every tactic on
              this page — outreach tracking, offer builder, Stripe verification,
              all in one tool.
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
