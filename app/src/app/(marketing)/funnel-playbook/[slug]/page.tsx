import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  FUNNEL_PLAYBOOK_SLUGS,
  getFunnelPlaybookBySlug,
  type FunnelPlaybookEntry,
} from "@/lib/funnel-playbooks";
import {
  FUNNEL_MATRIX_SLUGS,
  getMatrixEntry,
  type FunnelMatrixEntry,
} from "@/lib/funnel-playbook-matrix";

async function getCachedEntry(slug: string): Promise<FunnelPlaybookEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`funnel-playbook:${slug}`);
  return getFunnelPlaybookBySlug(slug);
}

/**
 * Matrix combos are synthesised from FUNNEL_PLAYBOOK_ENTRIES ×
 * NICHE_ENTRIES. Cache them on the same "max" lifetime as the bare
 * funnel entries – the source data is build-time static, so a hit
 * never needs to invalidate within a deploy. Per-combo tag lets a
 * future revalidateTag-style hook surface a single combo without
 * touching the bare funnel pages.
 */
async function getCachedMatrixEntry(
  slug: string,
): Promise<FunnelMatrixEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`funnel-playbook-matrix:${slug}`);
  return getMatrixEntry(slug);
}

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
import { PeopleAlsoAsk } from "@/components/seo/people-also-ask";
import {
  paaForFunnelPlaybook,
  mergePaaIntoFaqs,
} from "@/lib/seo/paa-questions";
import { getRelatedClustersForFunnelPlaybook } from "@/lib/seo/cluster-relations";


/**
 * /funnel-playbook/[slug] handles two shapes at build time:
 *
 *   1. Bare funnel slug (8 entries from FUNNEL_PLAYBOOK_SLUGS) – e.g.
 *      /funnel-playbook/tripwire. Renders the original funnel page.
 *
 *   2. Matrix combo slug (96 entries from FUNNEL_MATRIX_SLUGS) – e.g.
 *      /funnel-playbook/tripwire-for-course-creators. Renders the
 *      cross-applied page synthesised from FUNNEL_PLAYBOOK_ENTRIES ×
 *      NICHE_ENTRIES.
 *
 * Slug resolution at request time: try bare-funnel first, then matrix.
 */
export function generateStaticParams() {
  return [...FUNNEL_PLAYBOOK_SLUGS, ...FUNNEL_MATRIX_SLUGS].map((slug) => ({
    slug,
  }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;

  // Try bare-funnel first.
  const bare = await getCachedEntry(params.slug);
  if (bare) {
    const canonical = `/funnel-playbook/${bare.slug}`;
    return {
      title: bare.metaTitle,
      description: bare.metaDescription,
      alternates: markdownAlternate(canonical, `${canonical}/md`),
      robots: { index: true, follow: true },
      openGraph: {
        type: "article",
        title: bare.metaTitle,
        description: bare.metaDescription,
        url: canonical,
        siteName: "Unlock SaaS",
      },
      twitter: {
        card: "summary_large_image",
        title: bare.metaTitle,
        description: bare.metaDescription,
      },
    };
  }

  // Try matrix combo.
  const matrix = await getCachedMatrixEntry(params.slug);
  if (matrix) {
    const canonical = `/funnel-playbook/${matrix.slug}`;
    return {
      title: matrix.metaTitle,
      description: matrix.metaDescription,
      alternates: markdownAlternate(canonical, `${canonical}/md`),
      robots: { index: true, follow: true },
      openGraph: {
        type: "article",
        title: matrix.metaTitle,
        description: matrix.metaDescription,
        url: canonical,
        siteName: "Unlock SaaS",
      },
      twitter: {
        card: "summary_large_image",
        title: matrix.metaTitle,
        description: matrix.metaDescription,
      },
    };
  }

  return {};
}

function buildJsonLd(
  e: FunnelPlaybookEntry,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.tldr,
    step: e.steps.map((s, i) => ({
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
    abstract: e.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `${e.displayName} playbook`,
      `${e.displayName} structure`,
      "Brunson",
      "indie SaaS",
    ].join(", "),
    inLanguage: "en-US",
    // Speakable + access-mode: the TL;DR paragraph (matching the
    // `abstract: e.tldr` field above) is the canonical voice
    // answer for "what is the {archetype} playbook" voice queries.
    // Marked `data-speakable` in the rendered DOM, matching the
    // [data-speakable] selector in SPEAKABLE_SELECTORS.
    // ACCESS_MODE_TEXTUAL declares the page is fully consumable as
    // text — safe for voice readout without missing meaning
    // carried by images/video. The HowTo block below intentionally
    // does NOT carry Speakable: stepwise instructions are read in
    // the dedicated /diagnostic and onboarding voice surfaces, not
    // as a single read-aloud block on the marketing page.
    speakable: buildSpeakable('[data-speakable="tldr-prose"]'),
    ...ACCESS_MODE_TEXTUAL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: faqsForSchema.map((f) => ({
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
        name: "Funnel playbook",
        item: `${BASE_URL}/funnel-playbook`,
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

export default async function FunnelPlaybookDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;

  // Bare-funnel branch (original behaviour, unchanged).
  const bare = await getCachedEntry(params.slug);
  if (bare) {
    return <BarePlaybookView e={bare} />;
  }

  // Matrix combo branch.
  const matrix = await getCachedMatrixEntry(params.slug);
  if (matrix) {
    return <MatrixPlaybookView m={matrix} />;
  }

  notFound();
}

/**
 * Original bare-funnel view, extracted from the inline render so the
 * dispatcher above stays small. Behaviour is identical to the
 * pre-matrix shipped page.
 */
function BarePlaybookView({ e }: { e: FunnelPlaybookEntry }) {
  const canonicalUrl = `${BASE_URL}/funnel-playbook/${e.slug}`;
  const paaPairs = paaForFunnelPlaybook(e);
  const mergedFaqs = mergePaaIntoFaqs(e.faqs, paaPairs);
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
    mergedFaqs,
  );

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

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
            <Link href="/funnel-playbook" className="hover:underline">
              Funnel playbook
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
          Funnel playbook
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable="tldr-prose"
        >
          {e.tldr}
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

      {/* Direct answer – speakable TL;DR paragraph for AI Overviews,
          Perplexity, ChatGPT browse, Claude search. */}
      <DirectAnswer lastVerified={e.lastVerified} variant="tldr">
        {e.tldr}
      </DirectAnswer>

      <TldrSummary
        headingLabel={`${e.displayName} funnel playbook TL;DR`}
        items={[
          { term: "Funnel", definition: e.displayName },
          { term: "TL;DR", definition: e.tldr },
          { term: "When to use", definition: e.whenToUse },
          { term: "When NOT to use", definition: e.whenNotToUse },
          { term: "Ladder position", definition: e.ladderPosition },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="fit"
      >
        <h2 id="fit" className="sr-only">
          When to use
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Use this when
            </p>
            <p className="text-sm leading-relaxed">{e.whenToUse}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-destructive mb-3">
              Do not use when
            </p>
            <p className="text-sm leading-relaxed">{e.whenNotToUse}</p>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="steps">
        <h2 id="steps" className="text-2xl font-bold mb-4 leading-tight">
          The steps
        </h2>
        <ol className="space-y-4">
          {e.steps.map((s, i) => (
            <li key={s.title}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Step {i + 1}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-2xl font-bold mb-4 leading-tight">
          Common implementation mistakes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.commonMistakes.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="ladder"
      >
        <h2 id="ladder" className="text-xl font-semibold mb-3 leading-tight">
          Where this fits in the Value Ladder
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {e.ladderPosition}
        </p>
      </section>

      {/* People Also Ask – PAA H3s sourced from this playbook's tldr,
          whenToUse, whenNotToUse, and ladder position. */}
      <PeopleAlsoAsk pairs={paaPairs} />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask about {e.displayName.toLowerCase()}
        </h2>
        <div className="space-y-4">
          {e.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {glossaryLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-glossary"
        >
          <h2
            id="related-glossary"
            className="text-xl font-semibold mb-4 leading-tight"
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

      {/* ----- Cross-cluster sidebar (2026-05-21 audit fix #1):
            tie this playbook to the directional metric it moves and
            the founder diagnostic that triggers running it. Token-
            sequence matching against the canonical manifests
            (lib/seo/cluster-relations.ts); a stale or missing sibling
            silently drops out. ----- */}
      {(() => {
        const related = getRelatedClustersForFunnelPlaybook(e.slug);
        if (!related) return null;
        if (!related.benchmark && !related.whyIsntMy) return null;
        return (
          <section
            className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
            aria-labelledby="cross-cluster"
          >
            <h2
              id="cross-cluster"
              className="text-lg font-bold mb-4 leading-tight"
            >
              Where this playbook shows up across the rest of the site
            </h2>
            <ul className="space-y-2">
              {related.benchmark ? (
                <li>
                  <Link
                    href={`/benchmarks/${related.benchmark.slug}`}
                    className="group flex items-start gap-2 text-sm hover:text-primary transition"
                  >
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground group-hover:text-primary shrink-0"
                    >
                      →
                    </span>
                    <span>
                      <span className="font-semibold capitalize">
                        {related.benchmark.metric}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — the metric this playbook moves
                      </span>
                    </span>
                  </Link>
                </li>
              ) : null}
              {related.whyIsntMy ? (
                <li>
                  <Link
                    href={`/why-isnt-my/${related.whyIsntMy.slug}`}
                    className="group flex items-start gap-2 text-sm hover:text-primary transition"
                  >
                    <span
                      aria-hidden="true"
                      className="text-muted-foreground group-hover:text-primary shrink-0"
                    >
                      →
                    </span>
                    <span>
                      <span className="font-semibold">
                        Why isn&apos;t my {related.whyIsntMy.element} converting
                      </span>{" "}
                      <span className="text-muted-foreground">
                        — the founder diagnostic that triggers this playbook
                      </span>
                    </span>
                  </Link>
                </li>
              ) : null}
            </ul>
          </section>
        );
      })()}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Apply this playbook to your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic checks whether this is
              the right playbook for what&rsquo;s breaking on your page right
              now, or whether a different archetype fits better.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/funnel-playbook">Other playbooks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}

/**
 * JSON-LD for matrix combo pages. Reuses Article + HowTo + FAQPage but
 * extends the breadcrumb chain to four levels: Home > Funnel playbook >
 * {funnel} > {funnel for niche}. Keeps the HowTo authored on the
 * funnel (mechanics are universal), the Article authored on the combo
 * (specific to the cohort), and the FAQ from the merged set.
 */
function buildMatrixJsonLd(
  m: FunnelMatrixEntry,
  canonicalUrl: string,
  faqsForSchema: ReadonlyArray<{ q: string; a: string }>,
): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${m.funnel.displayName} (steps)`,
    description: m.funnel.tldr,
    step: m.funnel.steps.map((s, i) => ({
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
    headline: m.metaTitle,
    description: m.metaDescription,
    abstract: m.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: m.lastVerified,
    dateModified: m.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `${m.funnel.displayName} for ${m.niche.displayName}`,
      `${m.funnel.displayName} playbook`,
      `funnel for ${m.niche.displayName}`,
      "Brunson",
      "indie SaaS",
    ].join(", "),
    inLanguage: "en-US",
    speakable: buildSpeakable('[data-speakable="tldr-prose"]'),
    ...ACCESS_MODE_TEXTUAL,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: faqsForSchema.map((f) => ({
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
        name: "Funnel playbook",
        item: `${BASE_URL}/funnel-playbook`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: m.funnel.displayName,
        item: `${BASE_URL}/funnel-playbook/${m.funnel.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: m.displayName,
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

/**
 * Matrix combo view: cross-applied playbook for a specific cohort.
 * Reuses the funnel's structural sections (steps, common mistakes,
 * ladder position) verbatim because the mechanics don't change per
 * cohort, and adds three combo-specific sections: fit verdict,
 * cohort adaptation, cohort failure mode. Closes with crosslinks to
 * both parent hubs so the combo page is a discoverable surface, not
 * a dead-end.
 */
function MatrixPlaybookView({ m }: { m: FunnelMatrixEntry }) {
  const canonicalUrl = `${BASE_URL}/funnel-playbook/${m.slug}`;
  const paaPairs = paaForFunnelPlaybook(m.funnel);
  const mergedFaqs = mergePaaIntoFaqs(m.faqs, paaPairs);
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildMatrixJsonLd(
    m,
    canonicalUrl,
    mergedFaqs,
  );

  const glossaryLinks = m.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

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
            <Link href="/funnel-playbook" className="hover:underline">
              Funnel playbook
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={`/funnel-playbook/${m.funnel.slug}`}
              className="hover:underline"
            >
              {m.funnel.displayName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            for {m.niche.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Funnel playbook · for {m.niche.displayName}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {m.displayName}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable="tldr-prose"
        >
          {m.tldr}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={m.lastVerified}>
            {formatVerifiedDate(m.lastVerified)}
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

      <TldrSummary
        headingLabel={`${m.displayName} TL;DR`}
        items={[
          { term: "Funnel", definition: m.funnel.displayName },
          { term: "Cohort", definition: m.niche.displayName },
          { term: "When to use", definition: m.funnel.whenToUse },
          { term: "When NOT to use", definition: m.funnel.whenNotToUse },
          {
            term: "Cohort money mechanics",
            definition: m.niche.moneyMechanics,
          },
          { term: "Ladder position", definition: m.funnel.ladderPosition },
          {
            term: "Last verified",
            definition: formatVerifiedDate(m.lastVerified),
          },
        ]}
      />

      {/* Combo-specific section #1: does the funnel fit the cohort's
          money mechanics? */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="fit-verdict"
      >
        <h2
          id="fit-verdict"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          Does {m.funnel.displayName.toLowerCase()} fit {m.niche.displayName}?
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm leading-relaxed">{m.fitVerdict}</p>
          </CardContent>
        </Card>
      </section>

      {/* Original when-to / when-not-to-use cards from the funnel. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="fit"
      >
        <h2 id="fit" className="sr-only">
          When to use
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              Use this when
            </p>
            <p className="text-sm leading-relaxed">{m.funnel.whenToUse}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-destructive mb-3">
              Do not use when
            </p>
            <p className="text-sm leading-relaxed">{m.funnel.whenNotToUse}</p>
          </CardContent>
        </Card>
      </section>

      {/* Combo-specific section #2: how the playbook shifts for this
          cohort's vocabulary + what compounds for them. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="adaptation"
      >
        <h2
          id="adaptation"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          How the playbook shifts for {m.niche.displayName}
        </h2>
        <p className="text-base leading-relaxed">{m.cohortAdaptation}</p>
      </section>

      {/* Steps from the funnel – mechanics are universal. */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="steps">
        <h2 id="steps" className="text-2xl font-bold mb-4 leading-tight">
          The steps
        </h2>
        <ol className="space-y-4">
          {m.funnel.steps.map((s, i) => (
            <li key={s.title}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Step {i + 1}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Combo-specific section #3: this cohort's specific failure
          mode when running this funnel. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="cohort-failure"
      >
        <h2
          id="cohort-failure"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          Where {m.niche.displayName} break this funnel
        </h2>
        <p className="text-base leading-relaxed">{m.cohortFailureMode}</p>
      </section>

      {/* The funnel's universal mistake list, kept verbatim. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-2xl font-bold mb-4 leading-tight">
          Common implementation mistakes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {m.funnel.commonMistakes.map((mistake) => (
            <li key={mistake} className="text-base leading-relaxed">
              {mistake}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="ladder"
      >
        <h2 id="ladder" className="text-xl font-semibold mb-3 leading-tight">
          Where this fits in the Value Ladder
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {m.funnel.ladderPosition}
        </p>
      </section>

      {/* People Also Ask – PAA H3s sourced from the underlying funnel. */}
      <PeopleAlsoAsk pairs={paaPairs} />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions {m.niche.displayName} ask about{" "}
          {m.funnel.displayName.toLowerCase()}
        </h2>
        <div className="space-y-4">
          {m.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {glossaryLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-glossary"
        >
          <h2
            id="related-glossary"
            className="text-xl font-semibold mb-4 leading-tight"
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

      {/* Parent-hub crosslinks – matrix combo is a discoverable
          surface, so always offer the two upward paths. */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="parents"
      >
        <h2
          id="parents"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Read the parent guides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Funnel
              </p>
              <Link
                href={`/funnel-playbook/${m.funnel.slug}`}
                className="text-primary hover:underline font-medium"
              >
                {m.funnel.displayName} playbook →
              </Link>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Full mechanics, when-to-use, common mistakes, and ladder
                position for {m.funnel.displayName.toLowerCase()}.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Cohort
              </p>
              <Link
                href={`/for/${m.niche.slug}`}
                className="text-primary hover:underline font-medium"
              >
                Diagnostic for {m.niche.displayName} →
              </Link>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Cohort-specific landing page covering vocabulary, money
                mechanics, and what compounds for {m.niche.displayName}.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Apply this playbook to your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic checks whether{" "}
              {m.funnel.displayName.toLowerCase()} is the right playbook for
              your specific{" "}
              {m.niche.displayName.replace(/s$/, "")}-cohort situation, or
              whether a different archetype fits better right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/funnel-playbook">All funnel playbooks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
