/**
 * /glossary/[slug] — per-term definition surface.
 *
 * Each slug renders one GlossaryTerm row with schema.org DefinedTerm
 * JSON-LD, a sibling FAQPage block surfacing the "why it matters" beat
 * as a Q&A pair, the term origin, an example/pitfall sidebar, related
 * terms, and live cross-links into the catalog surfaces where the term
 * appears in context.
 *
 * Brunson Hard-Rule
 * -----------------
 *   - No fabricated etymologies. The `origin` field is named only
 *     where it is genuinely attributable.
 *   - Related terms must resolve to other rows in the catalog (the
 *     resolver silently drops dangling slugs — caller responsibility).
 *   - Cross-links to Unlock SaaS surfaces are only added when the
 *     term actually appears on that surface.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BreadcrumbListJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";
import { Separator } from "@/components/ui/separator";
import {
  GLOSSARY_SLUGS,
  getGlossaryTerm,
  resolveRelatedTerms,
} from "@/lib/glossary";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";

const BASE = "https://unlocksaas.com";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const term = getGlossaryTerm(slug);
  if (!term) {
    return { title: "Glossary term", robots: { index: false, follow: false } };
  }
  const url = `${BASE}/glossary/${term.slug}`;
  const description =
    term.definition.length > 160
      ? term.definition.slice(0, 157) + "…"
      : term.definition;
  return {
    title: `${term.term} — definition`,
    description,
    alternates: markdownAlternate(
      `/glossary/${term.slug}`,
      `/glossary/${term.slug}/md`,
    ),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: `${term.term} — Indie SaaS Glossary`,
      description,
      url,
      siteName: "Unlock SaaS",
      publishedTime: term.lastVerified,
    },
    twitter: {
      card: "summary_large_image",
      title: `${term.term} — Indie SaaS Glossary`,
      description,
    },
  };
}

export default async function GlossaryTermPage(props: Props) {
  const { slug } = await props.params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const url = `${BASE}/glossary/${term.slug}`;
  const related = resolveRelatedTerms(term.relatedSlugs);

  // DefinedTerm JSON-LD — the canonical schema.org type for a glossary
  // entry. Anchored with a stable @id so the DefinedTermSet on the hub
  // page's hasDefinedTerm[] can resolve back to this node.
  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${url}#term`,
    name: term.term,
    description: term.definition,
    url,
    alternateName: term.alsoKnownAs,
    inDefinedTermSet: { "@id": `${BASE}/glossary#set` },
    inLanguage: "en-US",
  };

  // FAQ schema sourced from the why-it-matters beat. Voice retrievers
  // and Google's PAA box anchor on FAQPage for "what is X" + "why does
  // X matter" query pairs. Single-question FAQs are valid per
  // schema.org spec and Google's structured-data guidelines.
  // FaqItem shape from @/components/seo/json-ld is `{ q, a }` — match
  // the existing convention so the schema builder serializes correctly.
  const faqItems = [
    {
      q: `What is ${term.term}?`,
      a: term.definition,
    },
    {
      q: `Why does ${term.term} matter for indie SaaS founders?`,
      a: term.whyItMatters,
    },
  ];

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(definedTermJsonLd),
        }}
      />
      <FaqPageJsonLd items={faqItems} />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "Glossary", url: `${BASE}/glossary` },
          { name: term.term, url },
        ]}
      />

      <article className="max-w-2xl mx-auto">
        {/* ── Breadcrumb back-link ─────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-4"
        >
          <Link
            href="/glossary"
            className="underline underline-offset-4 hover:text-foreground"
          >
            ← All glossary terms
          </Link>
        </nav>

        {/* ── Term header ─────────────────────────────────────────── */}
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Glossary · verified {term.lastVerified}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            {term.term}
          </h1>
          {term.alsoKnownAs.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Also: {term.alsoKnownAs.join(" · ")}
            </p>
          )}
        </header>

        {/* ── Definition ──────────────────────────────────────────── */}
        <section aria-labelledby="def" className="mb-8">
          <h2
            id="def"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Definition
          </h2>
          <p className="text-base text-foreground leading-relaxed">
            {term.definition}
          </p>
        </section>

        {/* ── Why it matters ──────────────────────────────────────── */}
        <section aria-labelledby="matters" className="mb-8">
          <h2
            id="matters"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Why it matters for indie SaaS founders
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            {term.whyItMatters}
          </p>
        </section>

        {/* ── Origin ──────────────────────────────────────────────── */}
        <section aria-labelledby="origin" className="mb-8">
          <h2
            id="origin"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Origin
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            {term.origin}
          </p>
        </section>

        {/* ── Example / pitfall sidebar (optional) ────────────────── */}
        {term.exampleOrPitfall && (
          <section
            aria-labelledby="example"
            className="mb-8 rounded-md border border-primary/30 bg-primary/5 px-5 py-4"
          >
            <h2
              id="example"
              className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
            >
              Example or pitfall
            </h2>
            <p className="text-sm text-foreground leading-relaxed">
              {term.exampleOrPitfall}
            </p>
          </section>
        )}

        <Separator className="my-8" />

        {/* ── Related terms ───────────────────────────────────────── */}
        {related.length > 0 && (
          <section aria-labelledby="related" className="mb-8">
            <h2
              id="related"
              className="text-xs uppercase tracking-widest text-muted-foreground mb-3"
            >
              Related terms
            </h2>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.slug} className="text-sm">
                  <Link
                    href={`/glossary/${r.slug}`}
                    className="font-semibold underline underline-offset-4 hover:text-foreground"
                  >
                    {r.term}
                  </Link>{" "}
                  <span className="text-muted-foreground">
                    — {r.definition.split(". ")[0]}.
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Where this term appears on Unlock SaaS ──────────────── */}
        {term.unlockSaasSurfaces.length > 0 && (
          <section aria-labelledby="surfaces" className="mb-8">
            <h2
              id="surfaces"
              className="text-xs uppercase tracking-widest text-muted-foreground mb-3"
            >
              Where this appears on Unlock SaaS
            </h2>
            <ul className="space-y-2">
              {term.unlockSaasSurfaces.map((s) => (
                <li key={s.path} className="text-sm">
                  <Link
                    href={s.path}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {s.label}
                  </Link>{" "}
                  <code className="text-xs text-muted-foreground font-mono">
                    {s.path}
                  </code>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground text-center">
          Missing context? Email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>
          .
        </p>
      </article>
    </div>
  );
}
