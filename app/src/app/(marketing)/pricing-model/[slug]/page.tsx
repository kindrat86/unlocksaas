import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PRICING_MODEL_SLUGS,
  PRICING_MODEL_ENTRIES,
  getPricingModelBySlug,
  type PricingModelEntry,
} from "@/lib/pricing-models";
import { getPricingTeardownBySlug } from "@/lib/pricing-teardowns";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PRICING_MODEL_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getPricingModelBySlug(params.slug);
  if (!e) return {};
  const canonical = `/pricing-model/${e.slug}`;
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

function buildJsonLd(e: PricingModelEntry, canonicalUrl: string): string[] {
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
        name: "Pricing models",
        item: `${BASE_URL}/pricing-model`,
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

export default async function PricingModelDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getPricingModelBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/pricing-model/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const exampleLinks = e.exampleTeardownSlugs
    .map((slug) => {
      const t = getPricingTeardownBySlug(slug);
      return t ? { slug, label: t.displayName } : null;
    })
    .filter((x): x is { slug: string; label: string } => x !== null);

  const related = PRICING_MODEL_ENTRIES.filter(
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
            <Link href="/pricing-model" className="hover:underline">
              Pricing models
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.modelName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pricing model
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
        aria-labelledby="how"
      >
        <h2 id="how" className="text-xl font-semibold mb-4 leading-tight">
          How the model works
        </h2>
        <p className="text-base leading-relaxed">{e.howItWorks}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="fit"
      >
        <Card className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <h2 id="fit" className="text-base font-semibold mb-3 leading-tight">
              Best for
            </h2>
            <p className="text-sm leading-relaxed">{e.bestFor}</p>
          </CardContent>
        </Card>
        <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-3 leading-tight">
              Worst for
            </h2>
            <p className="text-sm leading-relaxed">{e.worstFor}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="econ"
      >
        <h2 id="econ" className="text-xl font-semibold mb-4 leading-tight">
          Unit-economics implications
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.unitEconomicsImplications.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-xl font-semibold mb-4 leading-tight">
          Common implementation mistakes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.commonImplementationMistakes.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="trap"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2 id="trap" className="text-base font-semibold mb-3 leading-tight">
              Positioning trap to watch
            </h2>
            <p className="text-sm leading-relaxed">{e.positioningTrapWarning}</p>
          </CardContent>
        </Card>
      </section>

      {exampleLinks.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-base font-semibold mb-3 leading-tight">
            Pricing teardowns of products using this model
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {exampleLinks.map((ex) => (
              <li key={ex.slug}>
                <Link
                  href={`/pricing-teardown/${ex.slug}`}
                  className="text-primary hover:underline"
                >
                  {ex.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
            Other pricing models
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/pricing-model/${r.slug}`}
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
              Diagnose the page, then pick the model
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Pricing model is downstream of positioning. The free
              diagnostic labels which Brunson failure mode your page hits;
              the right pricing model follows from the positioning.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing-model">All pricing models</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
