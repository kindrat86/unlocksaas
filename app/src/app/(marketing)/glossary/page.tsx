/**
 * /glossary — indie SaaS marketing + Brunson framework reference.
 *
 * Why a glossary surface
 * ----------------------
 * Covered in the self-audit two turns ago: "no /glossary, /tools,
 * /learn — topical reservoir is narrow." The pSEO catalogs already
 * cover head-to-head intent ("X vs Y", "X alternatives"); the
 * glossary covers the definition long tail ("what is X?") which is
 * the highest-volume class of citation queries on AI Overviews.
 *
 * Schema choice
 * -------------
 * schema.org DefinedTermSet (hub) + DefinedTerm (per-term) is the
 * canonical glossary pattern. AI Overviews, Perplexity, and Google
 * News all anchor on DefinedTerm when answering "what is X?" — Article
 * schema would compete with the editorial pSEO surfaces for the same
 * query class and dilute signal.
 *
 * Each per-term page also cross-links into the live site surfaces where
 * the term appears in context, so the glossary doubles as a routing
 * layer into the deeper catalogs.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

const BASE = "https://unlocksaas.com";

export const metadata: Metadata = {
  title: "Indie SaaS Marketing Glossary",
  description: `Definitions of ${GLOSSARY.length} marketing, funnel, and indie-SaaS-economics terms relevant to post-launch pre-revenue founders. Hook Story Offer, Value Ladder, Stripe Connect, Verified Builder, ICP, churn, and more.`,
  alternates: pageAlternates("/glossary"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Marketing Glossary",
    description: `${GLOSSARY.length} definitions covering Brunson framework, indie SaaS economics, and the Unlock SaaS vocabulary.`,
    url: `${BASE}/glossary`,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Marketing Glossary",
    description: `${GLOSSARY.length} definitions — Hook Story Offer, Value Ladder, ICP, MRR, Verified Builder, and more.`,
  },
};

export const dynamic = "force-static";

const definedTermSetJsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  "@id": `${BASE}/glossary#set`,
  name: "Unlock SaaS Indie SaaS Marketing Glossary",
  description:
    "Marketing, funnel, and indie SaaS economics vocabulary used across Unlock SaaS surfaces. Every entry carries a definition, why-it-matters note for post-launch pre-revenue founders, term origin, related terms, and live cross-links into the catalog where the term appears in context.",
  url: `${BASE}/glossary`,
  inLanguage: "en-US",
  publisher: { "@id": `${BASE}/#organization` },
  hasDefinedTerm: GLOSSARY.map((t) => ({
    "@type": "DefinedTerm",
    "@id": `${BASE}/glossary/${t.slug}#term`,
    name: t.term,
    description: t.definition,
    url: `${BASE}/glossary/${t.slug}`,
    inDefinedTermSet: { "@id": `${BASE}/glossary#set` },
    alternateName: t.alsoKnownAs,
  })),
};

// Group terms alphabetically for index navigation.
const ALPHABET_GROUPS = (() => {
  const map = new Map<string, typeof GLOSSARY[number][]>();
  for (const t of GLOSSARY) {
    const letter = t.term.charAt(0).toUpperCase();
    const list = map.get(letter) ?? [];
    list.push(t);
    map.set(letter, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
})();

export default function GlossaryHubPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(definedTermSetJsonLd),
        }}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "Glossary", url: `${BASE}/glossary` },
        ]}
      />

      <article className="max-w-3xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Reference · {GLOSSARY.length} terms
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Indie SaaS marketing glossary
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Definitions of the {GLOSSARY.length} marketing, funnel, and
            indie SaaS economics terms you&rsquo;ll see across Unlock
            SaaS. Each entry names where the term comes from, why it
            matters specifically for post-launch pre-revenue founders,
            and links into the deeper site where the term shows up in
            context.
          </p>
        </header>

        {/* ── Letter index (skipped if only one letter shipped) ──── */}
        {ALPHABET_GROUPS.length > 3 && (
          <nav
            aria-label="Glossary index by letter"
            className="mb-8 rounded-md border bg-muted/40 px-5 py-3"
          >
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {ALPHABET_GROUPS.map(([letter]) => (
                <li key={letter}>
                  <a
                    href={`#letter-${letter}`}
                    className="font-mono underline underline-offset-4 hover:text-foreground"
                  >
                    {letter}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {ALPHABET_GROUPS.map(([letter, terms]) => (
          <section
            key={letter}
            id={`letter-${letter}`}
            aria-labelledby={`heading-${letter}`}
            className="mb-10 scroll-mt-20"
          >
            <h2
              id={`heading-${letter}`}
              className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-mono"
            >
              {letter}
            </h2>
            <ul className="space-y-4">
              {terms.map((t) => (
                <li
                  key={t.slug}
                  className="rounded-md border bg-card p-5 space-y-2"
                >
                  <div className="flex items-baseline justify-between gap-4 flex-wrap">
                    <h3 className="text-lg font-semibold leading-snug">
                      <Link
                        href={`/glossary/${t.slug}`}
                        className="hover:underline underline-offset-4"
                      >
                        {t.term}
                      </Link>
                    </h3>
                    {t.alsoKnownAs.length > 0 && (
                      <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                        also: {t.alsoKnownAs.slice(0, 2).join(" · ")}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.definition.split(". ")[0]}.
                  </p>
                  <Link
                    href={`/glossary/${t.slug}`}
                    className="text-xs underline underline-offset-4 hover:text-foreground inline-block"
                  >
                    Read the full definition →
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="text-xs text-muted-foreground text-center mt-12">
          Missing a term? Email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>
          . The glossary grows by founder requests.
        </p>
      </article>
    </div>
  );
}
