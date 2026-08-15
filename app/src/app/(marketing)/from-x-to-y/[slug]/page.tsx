import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  JOURNEY_SLUGS,
  JOURNEY_ENTRIES,
  getJourneyBySlug,
  type JourneyEntry,
} from "@/lib/journeys";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return JOURNEY_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getJourneyBySlug(params.slug);
  if (!e) return {};
  const canonical = `/from-x-to-y/${e.slug}`;
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

function buildJsonLd(e: JourneyEntry, canonicalUrl: string): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: e.phases.map((p, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: p.title,
      text: p.whatItLooksLike,
    })),
    totalTime: e.typicalTimeBand,
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
        name: "Journey templates",
        item: `${BASE_URL}/from-x-to-y`,
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

export default async function FromXToYDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getJourneyBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/from-x-to-y/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const nicheLinks = e.relatedNiches
    .map((nicheSlug) => {
      const n = getNicheBySlug(nicheSlug);
      return n ? { slug: nicheSlug, label: n.displayName } : null;
    })
    .filter((x): x is { slug: string; label: string } => x !== null);

  const related = JOURNEY_ENTRIES.filter(
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
            <Link href="/from-x-to-y" className="hover:underline">
              Journey templates
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
          Milestone journey template
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          {e.intro}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">From:</span>{" "}
            {e.from}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">To:</span> {e.to}
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          <span className="font-semibold text-foreground">
            Typical time band:
          </span>{" "}
          {e.typicalTimeBand}
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
        aria-labelledby="phases"
      >
        <h2 id="phases" className="text-xl font-semibold mb-4 leading-tight">
          The {e.phases.length} phases
        </h2>
        <ol className="space-y-8">
          {e.phases.map((p, i) => (
            <li key={p.title} className="border-l-2 border-primary/30 pl-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Phase {i + 1} · {p.timeBand}
              </p>
              <p className="text-base font-semibold mb-2 leading-tight">
                {p.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                <span className="font-semibold text-foreground">
                  What this phase looks like:
                </span>{" "}
                {p.whatItLooksLike}
              </p>
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground mb-1">
                  What to do:
                </p>
                <ul className="space-y-1 list-disc list-inside text-sm leading-relaxed">
                  {p.whatToDo.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground">
                  Watch for:
                </span>{" "}
                <span className="text-muted-foreground">{p.watchFor}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="detours"
      >
        <h2 id="detours" className="text-xl font-semibold mb-4 leading-tight">
          Common detours that extend the timeline
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.commonDetours.map((d) => (
            <li key={d} className="text-base leading-relaxed">
              {d}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="success-stuck"
      >
        <Card className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <h2
              id="success-stuck"
              className="text-base font-semibold mb-3 leading-tight"
            >
              What success looks like
            </h2>
            <p className="text-sm leading-relaxed">{e.successDefinition}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-3 leading-tight">
              What stuck looks like
            </h2>
            <p className="text-sm leading-relaxed">{e.stuckSignal}</p>
          </CardContent>
        </Card>
      </section>

      {nicheLinks.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-base font-semibold mb-2 leading-tight">
            Niches this journey resonates with
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
            Other milestone journeys
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/from-x-to-y/${r.slug}`}
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
              Locate yourself in the journey
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              failure mode your page hits — and that maps cleanly to the
              phase of this journey you are currently in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/from-x-to-y">All journey templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
