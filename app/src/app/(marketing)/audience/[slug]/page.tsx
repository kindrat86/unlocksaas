import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AUDIENCE_SLUGS,
  AUDIENCE_ENTRIES,
  AUDIENCE_PLATFORM_LABELS,
  getAudienceBySlug,
  type AudienceEntry,
} from "@/lib/audiences";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return AUDIENCE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getAudienceBySlug(params.slug);
  if (!e) return {};
  const canonical = `/audience/${e.slug}`;
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

function buildJsonLd(e: AudienceEntry, canonicalUrl: string): string[] {
  const allActions: string[] = e.monthlyPlaybook.flatMap((p) =>
    p.actions.map((a) => `${p.monthRange}: ${a}`),
  );

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: allActions.slice(0, 12).map((a, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: a.split(":")[0],
      text: a,
    })),
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
        name: "Audience-building",
        item: `${BASE_URL}/audience`,
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

export default async function AudienceDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getAudienceBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/audience/${e.slug}`;
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

  const related = AUDIENCE_ENTRIES.filter(
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
            <Link href="/audience" className="hover:underline">
              Audience-building
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {AUDIENCE_PLATFORM_LABELS[e.platform]}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {AUDIENCE_PLATFORM_LABELS[e.platform]} audience playbook
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {e.intro}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs mt-4">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Cadence:</span>{" "}
            {e.cadence}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">12-month band:</span>{" "}
            {e.typical12MonthOutcomeBand}
          </p>
        </div>
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
        aria-labelledby="who"
      >
        <h2 id="who" className="text-xl font-semibold mb-4 leading-tight">
          Who this playbook fits
        </h2>
        <p className="text-base leading-relaxed">{e.whoItFits}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="playbook"
      >
        <h2 id="playbook" className="text-xl font-semibold mb-4 leading-tight">
          Monthly playbook
        </h2>
        <ol className="space-y-8">
          {e.monthlyPlaybook.map((p, i) => (
            <li key={p.monthRange} className="border-l-2 border-primary/30 pl-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Phase {i + 1} · {p.monthRange}
              </p>
              <p className="text-base font-semibold mb-2 leading-tight">
                {p.focus}
              </p>
              <ul className="space-y-1 list-disc list-inside text-sm leading-relaxed">
                {p.actions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="milestones"
      >
        <h2
          id="milestones"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Audience-size milestones
        </h2>
        <ul className="space-y-4">
          {e.milestones.map((m) => (
            <li key={m.size} className="border-l-2 border-primary/30 pl-4">
              <p className="text-base font-semibold leading-tight">{m.size}</p>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Expected month: {m.expectedMonth}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {m.whatItUnlocks}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="stuck"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2
              id="stuck"
              className="text-base font-semibold mb-3 leading-tight"
            >
              Common stuck patterns
            </h2>
            <ul className="space-y-2 list-disc list-inside text-sm leading-relaxed">
              {e.stuckPatterns.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="vs"
      >
        <h2 id="vs" className="text-xl font-semibold mb-4 leading-tight">
          {AUDIENCE_PLATFORM_LABELS[e.platform]} vs other platforms
        </h2>
        <p className="text-base leading-relaxed">{e.vsOtherPlatforms}</p>
      </section>

      {nicheLinks.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-base font-semibold mb-3 leading-tight">
            Niches this platform fits
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
            Other platform playbooks
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/audience/${r.slug}`}
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
              Audience compounds into your launch
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The audience built through this playbook is the foundation
              your eventual launch runs on. The launch playbook turns
              accumulated audience into the launch event.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/launch">Launch playbooks</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/audience">All platforms</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
