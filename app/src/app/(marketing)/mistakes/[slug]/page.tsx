import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  MISTAKE_SLUGS,
  getMistakeBySlug,
  type MistakeEntry,
  MISTAKE_CATEGORY_LABELS,
} from "@/lib/mistakes";
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
  return MISTAKE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const m = getMistakeBySlug(params.slug);
  if (!m) return {};

  const canonical = `/mistakes/${m.slug}`;
  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: m.metaTitle,
      description: m.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: m.metaTitle,
      description: m.metaDescription,
    },
  };
}

function buildJsonLd(m: MistakeEntry, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: m.title,
    description: m.oneLine,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: m.lastVerified,
    dateModified: m.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    speakable: buildSpeakable(
      '[data-speakable="fix"]',
      '[data-speakable="lead"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    speakable: buildSpeakable('[data-speakable="faq-q"]', '[data-speakable="faq-a"]'),
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: m.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a, inLanguage: "en-US" },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Mistakes", item: `${BASE}/mistakes` },
      { "@type": "ListItem", position: 3, name: m.title, item: canonicalUrl },
    ],
  };

  return [JSON.stringify(article), JSON.stringify(faqPage), JSON.stringify(breadcrumbs)];
}

export default async function MistakePage(props: { params: Promise<RouteParams> }) {
  const params = await props.params;
  const m = getMistakeBySlug(params.slug);
  if (!m) notFound();

  const canonicalUrl = `${BASE}/mistakes/${m.slug}`;
  const jsonLdBlocks = buildJsonLd(m, canonicalUrl);
  const categoryLabel = MISTAKE_CATEGORY_LABELS[m.category] ?? m.category;

  const relatedGlossaryLinks = m.relatedGlossary
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
          <li aria-hidden="true">/</li>
          <li><Link href="/mistakes" className="hover:underline">Mistakes</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">{m.title}</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Mistake · {categoryLabel}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {m.title}
        </h1>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={m.lastVerified}>
            {formatVerifiedDate(m.lastVerified)}
          </time>
        </p>
      </header>

      <Separator className="my-2" />

      <DirectAnswer lastVerified={m.lastVerified} variant="verdict" data-speakable="lead">
        {m.lead}
      </DirectAnswer>

      <TldrSummary
        headingLabel={`${m.title} — TL;DR`}
        items={[
          { term: "Mistake", definition: m.title },
          { term: "Category", definition: categoryLabel },
          { term: "One-line", definition: m.oneLine },
        ]}
      />

      {/* Why it happens */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="why">
        <h2 id="why" className="text-2xl font-bold mb-6 leading-tight">
          Why this happens
        </h2>
        <ul className="space-y-3">
          {m.whyItHappens.map((reason, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-destructive/10 grid place-items-center text-destructive text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* The fix */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="fix"
        data-speakable="fix"
      >
        <h2 id="fix" className="text-2xl font-bold mb-6 leading-tight">
          The fix
        </h2>
        <ul className="space-y-4">
          {m.theFix.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/10 grid place-items-center text-primary">
                <Check className="h-3 w-3" />
              </span>
              <span className="text-sm text-muted-foreground leading-relaxed">{step}</span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faqs">
        <h2 id="faqs" className="text-xl font-bold mb-6 leading-tight">
          Frequently asked
        </h2>
        <dl className="space-y-6">
          {m.faqs.map((faq, i) => (
            <div key={i}>
              <dt
                className="font-semibold mb-1"
                data-speakable="faq-q"
              >
                {faq.q}
              </dt>
              <dd
                className="text-sm text-muted-foreground leading-relaxed"
                data-speakable="faq-a"
              >
                {faq.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Separator className="my-2" />

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
              This mistake sounds familiar?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook removes the avoidance option. Outreach happens inside
              the tool, not on your willpower. 60-day Stripe-verified guarantee.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Run the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/playbook-sales">See the Playbook</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
