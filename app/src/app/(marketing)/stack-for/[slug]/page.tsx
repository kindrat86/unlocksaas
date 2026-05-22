import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  STACK_SLUGS,
  getStackBySlug,
  getNicheForStack,
  getTeardownForStackTool,
  type StackEntry,
} from "@/lib/stacks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import { DirectAnswer } from "@/components/seo/direct-answer";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * /stack-for/[niche] – recommended indie SaaS stack per cohort.
 *
 * Pattern: mirrors /for/[slug]. Data lives in src/lib/stacks.ts and
 * cross-links into src/lib/niches.ts (for the cohort frame) and
 * src/lib/pricing-teardowns.ts (for each tool). The page renders an
 * ordered ItemList of tools, with role/why/swap-notes per tool,
 * cohort context inherited from the matching NicheEntry, and a strict
 * link out to each /pricing-teardown/[tool-slug].
 *
 * SEO posture: Article + ItemList + FAQPage + BreadcrumbList JSON-LD.
 * Image sitemap inherits the root opengraph-image (no per-slug card
 * shipped in this PR – follow-up if the AEO numbers warrant it).
 */

export function generateStaticParams() {
  return STACK_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const s = getStackBySlug(params.slug);
  if (!s) return {};

  const canonical = `/stack-for/${s.slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: s.metaTitle,
      description: s.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: s.metaTitle,
      description: s.metaDescription,
    },
  };
}

interface ResolvedTool {
  slug: string;
  displayName: string;
  category: string;
  role: string;
  why: string;
  swapNotes?: string;
}

function resolveTools(s: StackEntry): ReadonlyArray<ResolvedTool> {
  return s.tools
    .map((t): ResolvedTool | null => {
      const teardown = getTeardownForStackTool(t);
      if (!teardown) return null;
      return {
        slug: t.slug,
        displayName: teardown.displayName,
        category: teardown.category,
        role: t.role,
        why: t.why,
        swapNotes: t.swapNotes,
      };
    })
    .filter((x): x is ResolvedTool => x !== null);
}

function buildJsonLd(
  s: StackEntry,
  canonicalUrl: string,
  resolved: ReadonlyArray<ResolvedTool>,
): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: s.metaTitle,
    description: s.metaDescription,
    abstract: s.heroSubhead,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: s.lastVerified,
    dateModified: s.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `indie SaaS stack for ${s.slug}`,
      `tools for ${s.slug}`,
      `${s.slug} tech stack`,
      "Unlock SaaS",
    ].join(", "),
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: s.metaTitle,
    description: s.heroSubhead,
    numberOfItems: resolved.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: resolved.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.displayName,
      url: `${BASE_URL}/pricing-teardown/${t.slug}`,
      description: t.role,
    })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: s.faqs.map((f) => ({
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
        name: "Stack for",
        item: `${BASE_URL}/stack-for`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: s.metaTitle,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
    JSON.stringify(itemList),
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

export default async function StackForDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const s = getStackBySlug(params.slug);
  if (!s) notFound();

  const canonicalUrl = `${BASE_URL}/stack-for/${s.slug}`;
  const resolved = resolveTools(s);
  const niche = getNicheForStack(s);
  const [articleJson, itemListJson, faqJson, breadcrumbJson] = buildJsonLd(
    s,
    canonicalUrl,
    resolved,
  );

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={itemListJson} />
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
            <Link href="/stack-for" className="hover:underline">
              Stack for
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground capitalize">
            {niche?.displayName ?? s.slug}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Stack for {niche?.displayName ?? s.slug}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {s.metaTitle.replace(" – Unlock SaaS", "")}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
        >
          {s.heroSubhead}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={s.lastVerified}>
            {formatVerifiedDate(s.lastVerified)}
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
      <DirectAnswer lastVerified={s.lastVerified} variant="tldr">
        {s.tldr}
      </DirectAnswer>

      <TldrSummary
        headingLabel={`Key facts for the ${niche?.displayName ?? s.slug} stack`}
        items={[
          { term: "Cohort", definition: niche?.displayName ?? s.slug },
          { term: "Tools in stack", definition: `${resolved.length}` },
          { term: "Summary", definition: s.heroSubhead },
          { term: "Build first", definition: s.whatToBuildFirst },
          { term: "Common mistake", definition: s.commonMistake },
          {
            term: "Last verified",
            definition: formatVerifiedDate(s.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why-this-stack"
      >
        <h2
          id="why-this-stack"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          Why this shape of stack
        </h2>
        <p className="text-base leading-relaxed">{s.whyThisStack}</p>
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="the-stack"
      >
        <h2 id="the-stack" className="text-2xl font-bold mb-6 leading-tight">
          The stack, in funnel order
        </h2>
        <ol className="space-y-6">
          {resolved.map((t, i) => (
            <li key={t.slug} className="grid grid-cols-[2rem_1fr] gap-3">
              <span
                aria-hidden="true"
                className="text-sm font-mono text-muted-foreground pt-1"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-lg font-semibold leading-tight mb-1">
                  <Link
                    href={`/pricing-teardown/${t.slug}`}
                    className="hover:underline"
                  >
                    {t.displayName}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-2 font-normal">
                    ({t.category})
                  </span>
                </h3>
                <p className="text-sm font-medium mb-2">{t.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {t.why}
                </p>
                {t.swapNotes ? (
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                    Swap notes: {t.swapNotes}
                  </p>
                ) : null}
                <p className="mt-2">
                  <Link
                    href={`/pricing-teardown/${t.slug}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Read the {t.displayName} pricing teardown →
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="build-first"
      >
        <h2
          id="build-first"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          What to build first
        </h2>
        <p className="text-base leading-relaxed">{s.whatToBuildFirst}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="common-mistake"
      >
        <h2
          id="common-mistake"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          The mistake this cohort most often makes with stack-building
        </h2>
        <p className="text-base leading-relaxed">{s.commonMistake}</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions {niche?.displayName ?? "this cohort"} ask
        </h2>
        <div className="space-y-4">
          {s.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="related"
      >
        <h2
          id="related"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Related surfaces for {niche?.displayName ?? "this cohort"}
        </h2>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {niche ? (
            <li>
              <Link
                href={`/for/${s.slug}`}
                className="text-primary hover:underline"
              >
                The full /for/{s.slug} diagnostic page →
              </Link>
            </li>
          ) : null}
          <li>
            <Link href="/stack-for" className="text-primary hover:underline">
              Other niche stacks →
            </Link>
          </li>
          <li>
            <Link
              href="/pricing-teardown"
              className="text-primary hover:underline"
            >
              All pricing teardowns →
            </Link>
          </li>
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              The stack is the easy part. The funnel is the hard part.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Wiring up seven tools won&rsquo;t move the Stripe line if the
              Hook / Story / Offer is wrong upstream. The free 90-second
              Launch Diagnostic runs the Brunson triage on your live page and
              labels what&rsquo;s broken before you spend another week on the
              stack.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/stack-for">Other niche stacks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
