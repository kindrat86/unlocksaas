import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  MIGRATE_FROM_SLUGS,
  MIGRATE_FROM_ENTRIES,
  getMigrateFromBySlug,
  resolveMigrateTeardown,
  type MigrateFromEntry,
} from "@/lib/migrate-from";
import { getTeardownBySlug } from "@/lib/funnel-teardowns";
import { getPricingTeardownBySlug } from "@/lib/pricing-teardowns";
import { getGlossaryBySlug } from "@/lib/glossary";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return MIGRATE_FROM_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getMigrateFromBySlug(params.slug);
  if (!e) return {};
  const canonical = `/migrate-from/${e.slug}`;
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

function resolveDestination(slug: string): { label: string; href: string } | null {
  const resolved = resolveMigrateTeardown(slug);
  if (!resolved) return null;
  if (resolved.kind === "funnel") {
    const t = getTeardownBySlug(slug);
    return t ? { label: t.displayName, href: resolved.href } : null;
  }
  const t = getPricingTeardownBySlug(slug);
  return t ? { label: t.displayName, href: resolved.href } : null;
}

function buildJsonLd(e: MigrateFromEntry, canonicalUrl: string): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: e.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
    totalTime: e.timeToMigrateBand,
    inLanguage: "en-US",
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
        name: "Migrate from",
        item: `${BASE_URL}/migrate-from`,
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
    JSON.stringify(howTo),
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

export default async function MigrateFromDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getMigrateFromBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/migrate-from/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const destinationLinks = e.destinationTeardownSlugs
    .map((slug) => resolveDestination(slug))
    .filter((x): x is { label: string; href: string } => x !== null);

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const comparisonLinks = e.relatedComparisons.filter((slug) =>
    COMPARISON_SLUGS.includes(slug),
  );

  const related = MIGRATE_FROM_ENTRIES.filter(
    (other) => other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={howToJson} />
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
            <Link href="/migrate-from" className="hover:underline">
              Migrate from
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.from} → {e.to}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Migration guide
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          {e.intro}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Time:</span>{" "}
            {e.timeToMigrateBand}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Migration cost:</span>{" "}
            {e.migrationCostBand}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          <span className="font-semibold text-foreground">
            Annualized cost change:
          </span>{" "}
          {e.annualizedCostDifference}
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
        aria-labelledby="why"
      >
        <h2 id="why" className="text-xl font-semibold mb-4 leading-tight">
          Why founders make this migration
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.whyMigrate.map((r) => (
            <li key={r} className="text-base leading-relaxed">
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="not"
      >
        <h2 id="not" className="text-xl font-semibold mb-4 leading-tight">
          When NOT to migrate
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.whenNotToMigrate.map((c) => (
            <li key={c} className="text-base leading-relaxed">
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="steps"
      >
        <h2 id="steps" className="text-xl font-semibold mb-4 leading-tight">
          The {e.steps.length}-step migration
        </h2>
        <ol className="space-y-6">
          {e.steps.map((s, i) => (
            <li key={s.title} className="border-l-2 border-primary/30 pl-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Step {i + 1}
              </p>
              <p className="text-base font-semibold mb-2 leading-tight">
                {s.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                {s.description}
              </p>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">Pitfall:</span>{" "}
                <span className="text-muted-foreground">{s.pitfall}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      {destinationLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
          aria-labelledby="destinations"
        >
          <h2
            id="destinations"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Destination tool teardowns
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {destinationLinks.map((d) => (
              <li key={d.href}>
                <Link href={d.href} className="text-primary hover:underline">
                  {d.label} teardown →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {comparisonLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-6"
          aria-labelledby="comparisons"
        >
          <h2
            id="comparisons"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Pre-decision comparisons
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {comparisonLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/compare/${slug}`}
                  className="text-primary hover:underline"
                >
                  {slug.replace(/-vs-/g, " vs ").replace(/-/g, " ")} →
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
            Other migrations
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/migrate-from/${r.slug}`}
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
              After the migration, audit the funnel
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Migrations preserve traffic, not conversion. The free 90-second
              Launch Diagnostic looks at your live page and labels what is
              actually broken on the new stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/migrate-from">All migrations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
