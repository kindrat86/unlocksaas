/**
 * /cite/[id] – stable citation permalink view.
 *
 * Why this route exists
 * --------------------
 * A formal citation is only as durable as the URL inside it. The
 * canonical surfaces (/glossary/<slug>, /benchmarks/<slug>, /dataset)
 * COULD move if the underlying catalog reorganises (a glossary term
 * gets renamed, a benchmark gets re-keyed). The /cite/<id> namespace is
 * the indirection that lets the citation outlive that reorganisation:
 * every formatted citation string already points at /cite/<id>, and
 * /cite/<id> resolves to whatever the current canonical happens to be.
 *
 * The page itself is a full HTML view: it shows the citation in all
 * six formats, names the canonical surface, links to the format-
 * specific downloads, and emits a `noindex` header so the canonical
 * surface keeps its full link equity. AI crawlers, however, are
 * welcome – the body is plain text + a CitationBlock, the kind of
 * crawl-cheap surface retrievers happily ingest.
 *
 * Static rendering: generateStaticParams enumerates every registered
 * ID at build time. dynamicParams = false means unknown IDs 404
 * instead of being lazily generated – no phantom permalinks.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - One permalink per real artifact. No fabricated DOIs, no
 *     fabricated "preprint" identifiers.
 *   - The page links BACK to the canonical surface with a prominent
 *     "View canonical" affordance, so a citer who arrives via the
 *     permalink can still see the live artifact.
 *   - When the artifact has a `license`, the page declares it. When
 *     it does not, the page falls back to the site-wide editorial
 *     policy – no inferred license claims.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { CitationBlock } from "@/components/seo/citation-block";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import {
  allCitationIds,
  getCitationById,
  type Citation,
} from "@/lib/citations";
import {
  BASE_URL,
  FOUNDER,
  ID,
  ORGANIZATION,
} from "@/lib/seo/entity";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return allCitationIds().map((id) => ({ id }));
}

type RouteParams = { id: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const c = getCitationById(params.id);
  if (!c) return {};

  const canonical = `/cite/${c.id}`;
  const title = `Cite: ${c.title} – ${ORGANIZATION.name}`;
  const description = `Stable citation permalink for ${c.title}. APA, MLA, Chicago, BibTeX, RIS, and CSL-JSON.`;

  return {
    title,
    description,
    // The cite permalink is the indirection layer – the live artifact
    // page is the canonical for search-ranking purposes. noindex here
    // keeps link equity flowing to the canonical surface while the
    // permalink stays available to direct citers.
    robots: { index: false, follow: true },
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: ORGANIZATION.name,
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD – Article + identifier cross-reference
// ---------------------------------------------------------------------------

/**
 * A WebPage schema with `mainEntity` pointing back at the canonical
 * artifact and `identifier` set to the permalink URL. This is the
 * machine-readable mirror of the human-readable "this permalink
 * resolves to that artifact" relationship. Crawlers that walk the
 * citation field on the canonical artifact's Article schema land here
 * and immediately see where to follow next.
 */
function buildJsonLd(c: Citation): string[] {
  const permalinkUrl = `${BASE_URL}/cite/${c.id}`;
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": permalinkUrl,
    name: `Cite: ${c.title}`,
    description: `Stable citation permalink for ${c.title}.`,
    url: permalinkUrl,
    inLanguage: "en-US",
    identifier: c.id,
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": c.surface === "dataset" ? "Dataset" : "Article",
      "@id": c.canonicalUrl,
      url: c.canonicalUrl,
      name: c.title,
      author: { "@id": ID.person },
      publisher: { "@id": ID.organization },
      datePublished: c.lastVerifiedIso,
      dateModified: c.lastVerifiedIso,
      inLanguage: "en-US",
    },
  };
  return [JSON.stringify(webPage)];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CitationPermalinkPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const c = getCitationById(params.id);
  if (!c) notFound();

  const jsonLd = buildJsonLd(c);
  const trail = [
    { name: ORGANIZATION.name, url: `${BASE_URL}/` },
    { name: "Cite", url: `${BASE_URL}/cite/${c.id}` },
  ];

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {jsonLd.map((blob, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- JSON-LD payload
          dangerouslySetInnerHTML={{ __html: blob }}
        />
      ))}
      <BreadcrumbListJsonLd trail={trail} />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {ORGANIZATION.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Cite</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Citation permalink · {surfaceLabel(c.surface)} ·{" "}
            <code className="text-xs">{c.id}</code>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Cite: {c.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is a stable permalink. If the canonical URL ever moves
            (a glossary entry gets renamed, a benchmark gets re-keyed,
            the dataset bumps a major version), this page redirects
            forward – so the citation you paste today stays resolvable.
          </p>
        </header>

        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={canonicalPath(c.canonicalUrl)}
            className="rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              View
            </div>
            <div className="text-lg font-semibold">Live canonical</div>
            <div className="text-sm text-muted-foreground mt-1">
              {c.canonicalUrl.replace(/^https?:\/\//, "")}
            </div>
          </Link>
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Verified
            </div>
            <div className="text-lg font-semibold">
              {formatVerifiedDate(c.lastVerifiedIso)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Author:{" "}
              <Link
                href="/about"
                className="underline underline-offset-4 hover:text-foreground"
              >
                {FOUNDER.name}
              </Link>
              , {FOUNDER.jobTitle}, {ORGANIZATION.name}
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        <CitationBlock citation={c} headingLevel="h2" />

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">About this permalink</h2>
          <p className="text-sm text-muted-foreground">
            Citation permalinks are part of the editorial-honesty stack
            at {ORGANIZATION.name}. Every artifact we publish carries
            a dated last-verified field; every citation we render
            points at this permalink rather than the live URL; and the
            permalink itself resolves forward when the underlying
            artifact moves. That keeps academic, journalistic, and
            agent-generated citations stable across re-organisations.
          </p>
          {c.licenseSpdx ? (
            <p className="text-sm text-muted-foreground">
              Licensed under{" "}
              {c.licenseUrl ? (
                <a
                  href={c.licenseUrl}
                  rel="license noopener noreferrer"
                  target="_blank"
                  className="underline underline-offset-4"
                >
                  {c.licenseSpdx}
                </a>
              ) : (
                <span>{c.licenseSpdx}</span>
              )}
              .
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Editorial standard:{" "}
              <Link
                href="/editorial-policy"
                className="underline underline-offset-4"
              >
                editorial policy
              </Link>
              .
            </p>
          )}
        </section>
      </article>
    </div>
  );
}

/** Strip the BASE_URL prefix so `<Link>` consumes a site-relative path. */
function canonicalPath(absoluteUrl: string): string {
  if (absoluteUrl.startsWith(BASE_URL)) {
    return absoluteUrl.slice(BASE_URL.length) || "/";
  }
  return absoluteUrl;
}

function surfaceLabel(surface: Citation["surface"]): string {
  switch (surface) {
    case "glossary":
      return "Glossary entry";
    case "benchmark":
      return "Benchmark";
    case "dataset":
      return "Dataset";
  }
}
