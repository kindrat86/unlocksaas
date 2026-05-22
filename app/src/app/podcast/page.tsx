import type { Metadata } from "next";
import Link from "next/link";

import {
  BreadcrumbListJsonLd,
  PodcastSeriesCanonicalJsonLd,
} from "@/components/seo/json-ld";
import { Separator } from "@/components/ui/separator";
import { BASE_URL, ORGANIZATION } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import {
  PODCAST_EPISODES,
  PODCAST_SHOW_DESCRIPTION,
  PODCAST_SHOW_NAME,
  PODCAST_SHOW_SUBTITLE,
  PODCAST_URLS,
  episodeUrl,
} from "@/lib/seo/podcast";

/**
 * /podcast — Hub page for the Indie SaaS Teardowns Dataset Changelog
 * podcast. Surface D (GEO / AEO / discovery diversification) landing
 * 2026-05-21.
 *
 * Why this page exists
 * --------------------
 * The RSS feed at /feed/podcast.rss is the machine-readable
 * distribution; this page is the human-readable canonical that
 * podcast directories, journalists, and AI summarisers cite when
 * referring to the show. Three jobs:
 *
 *   1. Discovery target. A subscribe URL works in every podcast app
 *      (Apple Podcasts, Spotify, Overcast, Pocket Casts) – this page
 *      provides the copy-pasteable URL and a direct subscribe button
 *      that uses the podcast:// URI scheme, which most podcast apps
 *      auto-handle.
 *   2. PodcastSeries schema anchor. Renders
 *      PodcastSeriesCanonicalJsonLd which always emits (unlike the
 *      env-gated PodcastSeriesJsonLd on /press), so the @id graph is
 *      always present even before an external aggregator mirror lives.
 *   3. Episode index. Reverse-chronological listing of every shipped
 *      episode with title, date, summary, and link to the per-episode
 *      page. Reads from PODCAST_EPISODES in src/lib/seo/podcast.ts so
 *      every appended episode auto-extends this index on next deploy.
 *
 * Honest empty state: if PODCAST_EPISODES were empty (it is not at
 * launch – three real prior milestones seed it), the page renders the
 * "no episodes yet" copy instead of fabricating placeholder content.
 *
 * E-E-A-T discipline
 * ------------------
 *   - Author named (FOUNDER.name), editorial policy linked, license
 *     stated unambiguously (CC-BY-4.0, inherited from the dataset).
 *   - Per-episode artifact URL named on every list row so a reader
 *     can verify the underlying change exists.
 *   - No fabricated "as featured in" badges, no fake subscriber
 *     counts, no aspirational "thousands of listeners" claims.
 */

export const metadata: Metadata = {
  title: `${PODCAST_SHOW_NAME} – Subscribe`,
  description: PODCAST_SHOW_DESCRIPTION,
  openGraph: {
    type: "website",
    title: PODCAST_SHOW_NAME,
    description: PODCAST_SHOW_SUBTITLE,
    url: "/podcast",
    siteName: ORGANIZATION.name,
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: PODCAST_SHOW_NAME,
    description: PODCAST_SHOW_SUBTITLE,
  },
  // Merge canonical + self-hreflang with the RSS type alternate so search
  // engines see a canonical URL for the hub AND podcast directories still
  // pick up the application/rss+xml link. Without pageAlternates the page
  // was missing both rel="canonical" and any hreflang declaration — caught
  // by the 2026-05-22 crawler citation audit.
  alternates: {
    ...pageAlternates("/podcast"),
    types: {
      "application/rss+xml": PODCAST_URLS.rss,
    },
  },
  robots: { index: true, follow: true },
};

// Static – every value derives from module-level constants.

const TRAIL = [
  { name: ORGANIZATION.name, url: `${BASE_URL}/` },
  { name: "Podcast", url: PODCAST_URLS.landing },
] as const;

/** Subscribe URL using the podcast:// scheme. Most podcast apps
 *  (Apple Podcasts, Overcast, Pocket Casts, Castro) auto-handle this
 *  protocol on tap. Honest fallback: copy the https URL into any
 *  reader. */
const PODCAST_SUBSCRIBE_URI = PODCAST_URLS.rss.replace(
  /^https?:\/\//,
  "podcast://",
);

export default function PodcastPage() {
  const hasEpisodes = PODCAST_EPISODES.length > 0;
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      <PodcastSeriesCanonicalJsonLd />

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
          <span>Podcast</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Podcast · Changelog feed · CC-BY-4.0
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {PODCAST_SHOW_NAME}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {PODCAST_SHOW_DESCRIPTION}
          </p>
        </header>

        <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={PODCAST_SUBSCRIBE_URI}
            className="rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            data-speakable
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Subscribe
            </div>
            <div className="text-lg font-semibold">In any podcast app</div>
            <div className="text-sm text-muted-foreground mt-1">
              Opens directly in Apple Podcasts, Overcast, Pocket Casts,
              Castro, AntennaPod, or any reader registered for the{" "}
              <code className="text-xs">podcast://</code> URI scheme.
            </div>
          </a>
          <a
            href={PODCAST_URLS.rss}
            className="rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            data-speakable
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Raw feed
            </div>
            <div className="text-lg font-semibold">RSS 2.0 XML</div>
            <div className="text-sm text-muted-foreground mt-1">
              Paste{" "}
              <code className="text-xs break-all">{PODCAST_URLS.rss}</code>{" "}
              into Spotify for Podcasters, NewsBlur, Feedly, Inoreader, or
              any RSS reader.
            </div>
          </a>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">What this feed is</h2>
          <p className="text-muted-foreground">
            A dated, append-only log of changes to the open{" "}
            <Link
              href="/dataset"
              className="underline underline-offset-4 text-foreground"
            >
              Indie SaaS Teardowns Dataset
            </Link>
            . Each episode marks a real shipped milestone – a version
            bump, a new table, a cross-catalog activation, or a
            methodology change. Cite individual episodes when you need
            an attributed timestamp for a specific change.
          </p>
          <p className="text-muted-foreground">
            Episodes ship as show-notes-only by default. When a
            recorded audio version exists, an{" "}
            <code className="text-xs">&lt;enclosure&gt;</code> activates
            in the RSS body and the per-episode page renders an
            AudioObject schema. No placeholder MP3s, no silent stubs.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-12 space-y-6">
          <h2 className="text-2xl font-bold">
            Episodes{" "}
            <span className="text-sm font-normal text-muted-foreground tabular-nums">
              ({PODCAST_EPISODES.length})
            </span>
          </h2>
          {hasEpisodes ? (
            <ol className="space-y-4">
              {PODCAST_EPISODES.map((ep) => (
                <li
                  key={ep.slug}
                  className="border border-border rounded-lg px-5 py-4"
                >
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground tabular-nums">
                      Ep {ep.episodeNumber} · {ep.publishedAt}
                    </div>
                    {ep.audioUrl ? (
                      <span className="text-xs uppercase tracking-widest text-foreground">
                        Audio
                      </span>
                    ) : (
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Show notes
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold leading-snug mb-1">
                    <Link
                      href={`/podcast/${ep.slug}`}
                      className="underline underline-offset-4 hover:text-muted-foreground"
                    >
                      {ep.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ep.summary}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Verifiable artifact:{" "}
                    <a
                      href={ep.artifactUrl}
                      className="underline underline-offset-4 break-all"
                      rel="noopener"
                    >
                      {ep.artifactUrl.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg px-5 py-6">
              No episodes published yet. The feed activates the moment
              the first real dataset milestone ships – no aspirational
              episodes, no placeholder content.
            </p>
          )}
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">License + attribution</h2>
          <p className="text-sm text-muted-foreground">
            The show notes inherit the{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              rel="license noopener"
              target="_blank"
              className="underline underline-offset-4"
            >
              CC-BY-4.0
            </a>{" "}
            license from the underlying dataset. Quote, embed, or
            re-publish freely – attribute to {ORGANIZATION.name} and
            link back to{" "}
            <Link
              href="/podcast"
              className="underline underline-offset-4 text-foreground"
            >
              this page
            </Link>{" "}
            or the specific episode you cite.
          </p>
        </section>
      </article>
    </div>
  );
}
