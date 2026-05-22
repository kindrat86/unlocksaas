import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DIARY_DATES,
  DIARY_ENTRIES,
  getDiaryEntryByDate,
  formatDiaryDateLong,
} from "@/lib/founder-diary";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * /founder-diary — hub page for the daily build-in-public log.
 *
 * Lists every diary entry in reverse-chronological order with the hook
 * + first paragraph of the story as the card body. CollectionPage +
 * Blog + BreadcrumbList JSON-LD so retrievers (Google AI Overviews,
 * Perplexity, ClaudeBot) can model the surface as a blog cluster, and
 * speakable on the H1 + intro for voice surfaces.
 *
 * Why a hub vs raw chronological list: the hub becomes the recurring
 * backlink target for cross-posts on X / IH / r/saas. Every external
 * thread links to /founder-diary; the link equity compounds on this
 * domain instead of fragmenting across hundreds of detail URLs.
 *
 * Brunson Hard-Rule reconciliation: the surface only renders entries
 * that exist in src/lib/founder-diary.ts. Empty registry = empty hub
 * (no fabricated "coming soon" placeholders). Adding a new entry
 * extends this page automatically on the next build.
 */

const CANONICAL = "/founder-diary";

export const metadata: Metadata = {
  title: "Founder Diary (Build-in-Public Log)",
  description:
    "Daily build-in-public log for UnlockSaaS. One URL per build day, in Brunson Hook / Story / Offer voice. Every claim grounded in a merged PR or shipped surface.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Founder Diary — UnlockSaaS Build Log",
    description:
      "One URL per build day. Daily log of what shipped on UnlockSaaS, in Brunson voice, grounded in public artifacts.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Founder Diary",
    description:
      "Daily UnlockSaaS build log. One indexable URL per day.",
  },
};

function buildJsonLd(): string[] {
  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Founder Diary",
    url: `${BASE_URL}/founder-diary`,
    description:
      "Daily build-in-public log for UnlockSaaS, with one perma-indexable URL per build day.",
    isPartOf: { "@id": ID.website },
    inLanguage: "en-US",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: DIARY_DATES.length,
      itemListElement: DIARY_DATES.map((date, i) => {
        const e = getDiaryEntryByDate(date);
        return {
          "@type": "ListItem",
          position: i + 1,
          name: e?.hook ?? date,
          url: `${BASE_URL}/founder-diary/${date}`,
          description: e?.tldr ?? "",
        };
      }),
    },
  };

  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Founder Diary",
    url: `${BASE_URL}/founder-diary`,
    description:
      "Daily UnlockSaaS build-in-public log.",
    inLanguage: "en-US",
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    blogPost: DIARY_DATES.map((date) => {
      const e = getDiaryEntryByDate(date);
      return {
        "@type": "BlogPosting",
        headline: e?.hook ?? date,
        url: `${BASE_URL}/founder-diary/${date}`,
        datePublished: date,
        dateModified: date,
        abstract: e?.tldr ?? "",
        author: { "@id": ID.person },
      };
    }),
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
    ],
  };

  return [
    JSON.stringify(collection),
    JSON.stringify(blog),
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

export default function FounderDiaryHubPage() {
  const [collectionJson, blogJson, breadcrumbJson] = buildJsonLd();

  return (
    <main className="min-h-screen">
      <JsonLdBlock json={collectionJson} />
      <JsonLdBlock json={blogJson} />
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
          <li aria-current="page" className="text-foreground">
            Founder Diary
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Build-in-public log
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Founder Diary.
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
        >
          One URL per build day. Every entry is a truthful log of what
          shipped that day on UnlockSaaS, written in Brunson Hook / Story
          / Offer voice and anchored to a merged PR or a live surface
          you can verify. Cross-posts on X, Indie Hackers, and the
          faceless YouTube channel point back to the canonical entry here.
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="entries"
      >
        <h2 id="entries" className="text-2xl font-bold mb-6 leading-tight">
          {DIARY_DATES.length} {DIARY_DATES.length === 1 ? "entry" : "entries"}
        </h2>
        {DIARY_DATES.length === 0 ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            No entries yet. Check back tomorrow.
          </p>
        ) : (
          <ol className="space-y-4">
            {DIARY_DATES.map((date) => {
              const e = getDiaryEntryByDate(date);
              if (!e) return null;
              return (
                <li key={date}>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        <time dateTime={date}>{formatDiaryDateLong(date)}</time>
                      </p>
                      <h3 className="text-lg font-semibold mb-3 leading-tight">
                        <Link
                          href={`/founder-diary/${date}`}
                          className="text-primary hover:underline"
                        >
                          {e.hook}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {e.tldr}
                      </p>
                      {e.tags.length > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Tags:{" "}
                          {e.tags.map((t, i) => (
                            <span key={t}>
                              <span className="font-mono">{t}</span>
                              {i < e.tags.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="why"
      >
        <h2 id="why" className="text-xl font-semibold mb-3 leading-tight">
          Why a diary, why now
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Greg Isenberg&rsquo;s 2026 content-franchise thesis: build-in-public
          logs are the most under-indexed founder surface. Most founders post
          their wins on X or Indie Hackers and watch the link equity evaporate
          when the thread scrolls off.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We post the same threads, but the canonical lives here. Every
          downstream cross-post references this URL. Over a year, the diary
          becomes the highest-density backlink target on the site without
          requiring a single piece of content not already grounded in a
          merged PR.
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Take the free 90-second Launch Diagnostic
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Reading what someone else shipped is interesting. Knowing
              which of those pieces apply to your own funnel is more
              useful. The diagnostic checks Hook / Story / Offer on your
              live page and tells you the one thing to rebuild first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/youtube">The Founder&rsquo;s Diary on YouTube</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
