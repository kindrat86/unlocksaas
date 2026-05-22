import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DIARY_DATES,
  getDiaryEntryByDate,
  getAdjacentEntries,
  formatDiaryDateAthens,
  formatDiaryDateLong,
  type DiaryEntry,
} from "@/lib/founder-diary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * /founder-diary/[date] — per-day build-in-public log detail page.
 *
 * Slug shape: ISO 8601 YYYY-MM-DD. Strict validation in
 * `isValidDiaryDate()` means the route 404s on anything that isn't a
 * real calendar date in the registry — no soft 200s on typos.
 *
 * Schema graph per page: BlogPosting + BreadcrumbList. Author + publisher
 * IDs reference the entity graph anchored at `lib/seo/entity.ts` so the
 * person + organization nodes resolve once and every diary entry inherits
 * the verified-organization signal.
 *
 * Voice contract: every entry is past-tense, founder-first-person plural,
 * grounded in a public artifact (merged PR number, deployed surface,
 * shipped env var). The "no fabricated metrics" Brunson Hard-Rule applies
 * — copy edits to a diary entry never invent numbers the operator can't
 * point to.
 */

export function generateStaticParams() {
  return DIARY_DATES.map((date) => ({ date }));
}

type RouteParams = { date: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getDiaryEntryByDate(params.date);
  if (!e) return {};

  const canonical = `/founder-diary/${e.date}`;
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
      publishedTime: e.date,
      modifiedTime: e.date,
    },
    twitter: {
      card: "summary_large_image",
      title: e.metaTitle,
      description: e.metaDescription,
    },
  };
}

function buildJsonLd(e: DiaryEntry, canonicalUrl: string): string[] {
  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: e.hook,
    name: e.metaTitle,
    description: e.metaDescription,
    abstract: e.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.date,
    dateModified: e.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      "build in public",
      "indie SaaS founder diary",
      "UnlockSaaS build log",
      ...e.tags,
    ].join(", "),
    inLanguage: "en-US",
    articleSection: "Founder Diary",
    // Speakable: TL;DR is the canonical voice answer. Voice surfaces
    // read the TL;DR, not the full story block, so the spoken
    // result is concise and scannable.
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Founder Diary",
        item: `${BASE_URL}/founder-diary`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: formatDiaryDateLong(e.date),
        item: canonicalUrl,
      },
    ],
  };

  return [JSON.stringify(blogPosting), JSON.stringify(breadcrumbs)];
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default async function FounderDiaryEntryPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getDiaryEntryByDate(params.date);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/founder-diary/${e.date}`;
  const [blogPostingJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);
  const { newer, older } = getAdjacentEntries(e.date);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={blogPostingJson} />
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
            <Link href="/founder-diary" className="hover:underline">
              Founder Diary
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {formatDiaryDateAthens(e.date)}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          <time dateTime={e.date}>{formatDiaryDateLong(e.date)}</time>
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.hook}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
        >
          {e.tldr}
        </p>
      </header>

      <Separator className="my-2" />

      <TldrSummary
        headingLabel="Build day TL;DR"
        items={[
          { term: "Date", definition: formatDiaryDateLong(e.date) },
          { term: "Hook", definition: e.hook },
          { term: "TL;DR", definition: e.tldr },
          {
            term: "Tags",
            definition: e.tags.length > 0 ? e.tags.join(", ") : "—",
          },
          {
            term: "Pull requests",
            definition:
              e.pullRequests.length > 0
                ? e.pullRequests.map((n) => `#${n}`).join(", ")
                : "—",
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="story"
      >
        <h2 id="story" className="text-2xl font-bold mb-4 leading-tight">
          What shipped, and why
        </h2>
        <div className="space-y-4 text-base leading-relaxed text-foreground">
          {e.story.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {e.linkedSurfaces.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="linked"
        >
          <h2 id="linked" className="text-xl font-semibold mb-3 leading-tight">
            Linked surfaces
          </h2>
          <ul className="space-y-2 list-disc list-inside">
            {e.linkedSurfaces.map((link) => (
              <li key={link.href} className="text-base leading-relaxed">
                <Link
                  href={link.href}
                  className="text-primary hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="offer"
      >
        <h2 id="offer" className="text-xl font-semibold mb-3 leading-tight">
          What you should do next
        </h2>
        <p className="text-base leading-relaxed text-foreground">{e.offer}</p>
      </section>

      {newer || older ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
          aria-labelledby="adjacent"
        >
          <h2 id="adjacent" className="sr-only">
            Adjacent build days
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {older ? (
              <Link
                href={`/founder-diary/${older.date}`}
                className="block group"
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      ← Older
                    </p>
                    <p className="text-sm font-semibold mb-1 leading-snug group-hover:text-primary">
                      {older.hook}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={older.date}>
                        {formatDiaryDateLong(older.date)}
                      </time>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div aria-hidden="true" />
            )}
            {newer ? (
              <Link
                href={`/founder-diary/${newer.date}`}
                className="block group"
              >
                <Card className="h-full">
                  <CardContent className="pt-6 text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Newer →
                    </p>
                    <p className="text-sm font-semibold mb-1 leading-snug group-hover:text-primary">
                      {newer.hook}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={newer.date}>
                        {formatDiaryDateLong(newer.date)}
                      </time>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <div aria-hidden="true" />
            )}
          </div>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Apply the lesson to your own funnel
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Reading the log is half. The other half is checking whether
              the same constraint is hiding on your live page. The free
              90-second Launch Diagnostic returns Hook / Story / Offer
              scores plus the one thing to rebuild first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/founder-diary">Back to the diary</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
