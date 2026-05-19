import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  LAUNCH_SLUGS,
  LAUNCH_ENTRIES,
  LAUNCH_CHANNEL_LABELS,
  getLaunchBySlug,
  type LaunchEntry,
  type LaunchStep,
} from "@/lib/launches";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LAUNCH_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getLaunchBySlug(params.slug);
  if (!e) return {};
  const canonical = `/launch/${e.slug}`;
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

function buildJsonLd(e: LaunchEntry, canonicalUrl: string): string[] {
  const allSteps = [
    ...e.preLaunchBuildUp,
    ...e.launchDay,
    ...e.postLaunch,
  ];

  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: allSteps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
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
        name: "Launch",
        item: `${BASE_URL}/launch`,
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

function StepList({
  title,
  steps,
  id,
}: {
  title: string;
  steps: ReadonlyArray<LaunchStep>;
  id: string;
}) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby={id}>
      <h2 id={id} className="text-xl font-semibold mb-4 leading-tight">
        {title}
      </h2>
      <ol className="space-y-6">
        {steps.map((s, i) => (
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
              <span className="font-semibold text-foreground">Time:</span>{" "}
              <span className="text-muted-foreground">{s.timeBand}</span>
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FIT_BANNER: Record<LaunchEntry["fitVerdict"], string> = {
  "strong-fit":
    "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800",
  "good-fit":
    "border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800",
  "marginal-fit":
    "border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800",
  "wrong-channel":
    "border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800",
};

const FIT_LABEL: Record<LaunchEntry["fitVerdict"], string> = {
  "strong-fit": "Strong fit",
  "good-fit": "Good fit",
  "marginal-fit": "Marginal fit",
  "wrong-channel": "Wrong channel for this SaaS type",
};

export default async function LaunchDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getLaunchBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/launch/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
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

  const related = LAUNCH_ENTRIES.filter(
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
            <Link href="/launch" className="hover:underline">
              Launch
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
          {LAUNCH_CHANNEL_LABELS[e.channel]}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          {e.intro}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">SaaS type:</span>{" "}
          {e.saasType}
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

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="fit">
        <h2 id="fit" className="sr-only">
          Channel fit verdict
        </h2>
        <Card className={`border ${FIT_BANNER[e.fitVerdict]}`}>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest mb-2">
              Channel fit: <span className="font-semibold">{FIT_LABEL[e.fitVerdict]}</span>
            </p>
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">When NOT to use:</span>{" "}
              {e.whenNotToUse}
            </p>
          </CardContent>
        </Card>
      </section>

      <StepList title="Pre-launch build-up" steps={e.preLaunchBuildUp} id="pre" />
      <StepList title="Launch day" steps={e.launchDay} id="day" />
      <StepList title="Post-launch (7 days)" steps={e.postLaunch} id="post" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="profiles"
      >
        <div>
          <h2
            id="profiles"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Success profile
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {e.successProfile}
          </p>
        </div>
        <div>
          <h2 className="text-base font-semibold mb-3 leading-tight">
            Failure profile
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {e.failureProfile}
          </p>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-xl font-semibold mb-4 leading-tight">
          Channel-specific mistakes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.channelMistakes.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      {(glossaryLinks.length > 0 || nicheLinks.length > 0) && (
        <section className="max-w-3xl mx-auto px-6 py-8">
          {nicheLinks.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Niches that fit this channel
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
            More launch channels
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/launch/${r.slug}`}
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
              Pair this with the pre-launch checklist
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The pre-launch indie SaaS checklist names the ten things every
              SaaS must verify before any of the launch channels here can
              convert.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/checklist/pre-launch-saas-checklist">
                  Pre-launch checklist
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/launch">All launch playbooks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
