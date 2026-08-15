import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FOUNDER_MISTAKE_SLUGS,
  FOUNDER_MISTAKE_ENTRIES,
  getFounderMistakeBySlug,
  type FounderMistakeEntry,
} from "@/lib/founder-mistakes";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return FOUNDER_MISTAKE_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getFounderMistakeBySlug(params.slug);
  if (!e) return {};
  const canonical = `/founder-mistake/${e.slug}`;
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

function buildJsonLd(e: FounderMistakeEntry, canonicalUrl: string): string[] {
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
        name: "Founder mistakes",
        item: `${BASE_URL}/founder-mistake`,
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

const DIAGNOSIS_LABEL: Record<FounderMistakeEntry["fixesDiagnosis"], string> = {
  "wrong-person": "Wrong Person",
  "weak-offer": "Weak Offer",
  "weak-belief": "Weak Belief",
};

const WHY_ISNT_MY_DEFAULT: Record<
  FounderMistakeEntry["fixesDiagnosis"],
  string
> = {
  "wrong-person": "landing-page",
  "weak-offer": "upsell",
  "weak-belief": "checkout",
};

export default async function FounderMistakeDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getFounderMistakeBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/founder-mistake/${e.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

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

  const related = FOUNDER_MISTAKE_ENTRIES.filter(
    (other) =>
      other.brunsonLens === e.brunsonLens && other.slug !== e.slug,
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
            <Link href="/founder-mistake" className="hover:underline">
              Founder mistakes
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.mistakeName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Strategic mistake · {DIAGNOSIS_LABEL[e.fixesDiagnosis]}
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
        aria-labelledby="shows-up"
      >
        <h2 id="shows-up" className="text-xl font-semibold mb-4 leading-tight">
          How it shows up
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.howItShowsUp.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why"
      >
        <h2 id="why" className="text-xl font-semibold mb-4 leading-tight">
          Why it happens
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.whyItHappens.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="cost"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2 id="cost" className="text-base font-semibold mb-3 leading-tight">
              The real cost
            </h2>
            <p className="text-sm leading-relaxed">{e.realCost}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="fix"
      >
        <h2 id="fix" className="text-xl font-semibold mb-4 leading-tight">
          The fix
        </h2>
        <ol className="space-y-3 list-decimal list-inside">
          {e.theFix.map((s) => (
            <li key={s} className="text-base leading-relaxed">
              {s}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="false-fixes"
      >
        <h2
          id="false-fixes"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          False fixes (do NOT do these)
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.falseFixes.map((f) => (
            <li key={f} className="text-base leading-relaxed">
              {f}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="signal"
      >
        <Card className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardContent className="pt-6">
            <h2
              id="signal"
              className="text-base font-semibold mb-3 leading-tight"
            >
              How to know the fix worked
            </h2>
            <p className="text-sm leading-relaxed">{e.successSignal}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="link-diagnostic"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          This mistake usually surfaces as a{" "}
          <span className="font-semibold text-foreground">
            {DIAGNOSIS_LABEL[e.fixesDiagnosis]}
          </span>{" "}
          diagnosis in the free Launch Diagnostic. See also{" "}
          <Link
            href={`/why-isnt-my/${WHY_ISNT_MY_DEFAULT[e.fixesDiagnosis]}`}
            className="text-primary hover:underline"
          >
            the element-level page-fix for this diagnosis
          </Link>
          .
        </p>
      </section>

      {(glossaryLinks.length > 0 || nicheLinks.length > 0) && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          {nicheLinks.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Niches this hits hardest
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
            More {e.brunsonLens}-lens mistakes
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/founder-mistake/${r.slug}`}
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
              Diagnose the strategic mistake on your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live page
              and labels which Brunson failure mode your page hits — Wrong
              Person, Weak Offer, or Weak Belief — so you can map back to
              the strategic mistake driving it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/founder-mistake">All founder mistakes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
