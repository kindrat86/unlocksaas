import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  STACK_SLUGS,
  STACK_ENTRIES,
  STACK_CATEGORY_LABELS,
  getStackBySlug,
  resolveStackTeardown,
  type StackEntry,
} from "@/lib/stacks-catalog";
import { getTeardownBySlug } from "@/lib/funnel-teardowns";
import { getPricingTeardownBySlug } from "@/lib/pricing-teardowns";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getNicheBySlug } from "@/lib/niches";
import { getCategoryBySlug } from "@/lib/categories";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return STACK_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getStackBySlug(params.slug);
  if (!e) return {};
  const canonical = `/stack/${e.slug}`;
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

function resolveToolLink(
  teardownSlug: string | undefined,
): { label: string; href: string } | null {
  if (!teardownSlug) return null;
  const resolved = resolveStackTeardown(teardownSlug);
  if (!resolved) return null;
  if (resolved.kind === "funnel") {
    const t = getTeardownBySlug(teardownSlug);
    return t ? { label: t.displayName, href: resolved.href } : null;
  }
  const t = getPricingTeardownBySlug(teardownSlug);
  return t ? { label: t.displayName, href: resolved.href } : null;
}

function buildJsonLd(e: StackEntry, canonicalUrl: string): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: e.slots.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `${s.role}: ${s.tool}`,
      text: s.reason,
    })),
    inLanguage: "en-US",
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: e.displayName,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: e.slots.length,
    itemListElement: e.slots.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${s.role}: ${s.tool}`,
      description: s.reason,
    })),
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
        name: "Stacks",
        item: `${BASE_URL}/stack`,
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

export default async function StackDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getStackBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/stack/${e.slug}`;
  const [articleJson, howToJson, itemListJson, faqJson, breadcrumbJson] =
    buildJsonLd(e, canonicalUrl);

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

  const categoryLinks = e.relatedCategories
    .map((catSlug) => {
      const c = getCategoryBySlug(catSlug);
      return c ? { slug: catSlug, label: c.displayName } : null;
    })
    .filter((x): x is { slug: string; label: string } => x !== null);

  const related = STACK_ENTRIES.filter(
    (other) => other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={howToJson} />
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
            <Link href="/stack" className="hover:underline">
              Stacks
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
          {STACK_CATEGORY_LABELS[e.category]}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-4">
          {e.intro}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Who:</span> {e.who}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">
              Cost ceiling at launch scale:
            </span>{" "}
            {e.monthlyCeilingLowScale}
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
        aria-labelledby="slots"
      >
        <h2 id="slots" className="text-xl font-semibold mb-4 leading-tight">
          The {e.slots.length} slots
        </h2>
        <ul className="space-y-6">
          {e.slots.map((s) => {
            const link = resolveToolLink(s.teardownSlug);
            return (
              <li key={s.role} className="border-l-2 border-primary/30 pl-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {s.role}
                </p>
                <p className="text-base font-semibold mb-2 leading-tight">
                  {link ? (
                    <Link href={link.href} className="text-primary hover:underline">
                      {s.tool}
                    </Link>
                  ) : (
                    s.tool
                  )}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {s.reason}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Cost:</span>{" "}
                  {s.costBand}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="when-not"
      >
        <h2
          id="when-not"
          className="text-base font-semibold mb-3 leading-tight"
        >
          When NOT to use this stack
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {e.whenNotToUse}
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-xl font-semibold mb-4 leading-tight">
          Common mistakes
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
        aria-labelledby="swap"
      >
        <h2 id="swap" className="text-xl font-semibold mb-4 leading-tight">
          When to swap a slot
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.swapTriggers.map((t) => (
            <li key={t} className="text-base leading-relaxed">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {(glossaryLinks.length > 0 ||
        nicheLinks.length > 0 ||
        categoryLinks.length > 0) && (
        <section className="max-w-3xl mx-auto px-6 py-8">
          {nicheLinks.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Tuned for these niches
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
          {categoryLinks.length > 0 ? (
            <div className="mb-4">
              <h2 className="text-base font-semibold mb-2 leading-tight">
                Related categories
              </h2>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {categoryLinks.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/category/${c.slug}`}
                      className="text-primary hover:underline"
                    >
                      {c.label} →
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
            Other stack recommendations
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/stack/${r.slug}`}
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
              Stack is right, but page is broken?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic looks at your live product
              page and labels the failure mode — Wrong Person, Weak Offer, or
              Weak Belief. The stack is necessary; the funnel is sufficient.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/stack">All stacks</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
