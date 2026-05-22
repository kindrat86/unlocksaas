import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
  PodcastEpisodeJsonLd,
} from "@/components/seo/json-ld";
import { Separator } from "@/components/ui/separator";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  PODCAST_EPISODE_SLUGS,
  PODCAST_SHOW_NAME,
  PODCAST_URLS,
  episodeTranscriptMdUrl,
  getEpisodeBySlug,
  podcastAudioDisclosure,
} from "@/lib/seo/podcast";

/**
 * /podcast/[slug] – per-episode page for the Indie SaaS Teardowns
 * Dataset Changelog podcast. Surface D (GEO / AEO / discovery
 * diversification) landing 2026-05-21.
 *
 * Why this page exists
 * --------------------
 * The RSS feed at /feed/podcast.rss carries the machine-readable
 * episode list. This page is the human-readable canonical for a single
 * episode – the URL podcast players link to from their episode-detail
 * view, the URL Spotify and Apple Podcasts list as the episode website,
 * the URL AI summarisers cite when paraphrasing the changelog.
 *
 * Two schema blocks render per episode:
 *   - PodcastEpisode JSON-LD: heavily indexed by Google Podcasts (RIP),
 *     Spotify's content graph, and AI audio-retrieval pipelines. associatedMedia
 *     (AudioObject) is only emitted when the per-episode audio env var
 *     resolved.
 *   - Article JSON-LD: gives every episode page an Article shape, which
 *     is the format LLM citation pipelines prefer for text content. The
 *     two schemas coexist – schema.org permits multiple @type per page
 *     (and recommends it for hybrid content), and the two @id anchors
 *     are distinct so neither overrides the other.
 *
 * Static rendering pattern
 * ------------------------
 * generateStaticParams enumerates PODCAST_EPISODE_SLUGS at build time;
 * unknown slugs 404 via notFound(). Matches the pSEO discipline of every
 * other [slug] route in the codebase – crawlers cannot discover phantom
 * episode URLs and we never serve lazily generated content.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every episode references a verifiable artifact URL; the page
 *     surfaces it prominently so a reader / retriever can confirm.
 *   - lastVerified == publishedAt for changelog episodes (the episode
 *     IS the verification event).
 *   - No fabricated metrics (listener count, ratings, downloads).
 *   - Audio asset surfaced only when env-gated URL resolved.
 */

export function generateStaticParams() {
  return PODCAST_EPISODE_SLUGS.map((slug) => ({ slug }));
}


type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const episode = getEpisodeBySlug(params.slug);
  if (!episode) return {};

  const canonical = `/podcast/${episode.slug}`;
  const title = `${episode.title} – ${PODCAST_SHOW_NAME}`;

  return {
    title,
    description: episode.summary,
    keywords: episode.keywords as readonly string[] as string[],
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: episode.title,
      description: episode.summary,
      url: canonical,
      siteName: ORGANIZATION.name,
      publishedTime: episode.publishedAt,
      modifiedTime: episode.publishedAt,
      authors: [FOUNDER.name],
    },
    twitter: {
      card: "summary_large_image",
      title: episode.title,
      description: episode.summary,
    },
    alternates: {
      types: {
        "application/rss+xml": PODCAST_URLS.rss,
        "text/markdown": episodeTranscriptMdUrl(episode.slug),
      },
    },
  };
}

export default async function PodcastEpisodePage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const episode = getEpisodeBySlug(params.slug);
  if (!episode) notFound();

  const canonicalUrl = `${BASE_URL}/podcast/${episode.slug}`;
  const trail = [
    { name: ORGANIZATION.name, url: `${BASE_URL}/` },
    { name: "Podcast", url: PODCAST_URLS.landing },
    { name: episode.title, url: canonicalUrl },
  ] as const;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={trail} />
      <PodcastEpisodeJsonLd episode={episode} />
      <ArticleJsonLd
        headline={episode.title}
        description={episode.summary}
        url={canonicalUrl}
        datePublished={episode.publishedAt}
        dateModified={episode.publishedAt}
        articleSection="Podcast"
        keywords={episode.keywords}
      />

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
          <Link
            href="/podcast"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Podcast
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Ep {episode.episodeNumber}</span>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 tabular-nums">
            Episode {episode.episodeNumber} ·{" "}
            <time dateTime={episode.publishedAt}>{episode.publishedAt}</time>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {episode.title}
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed"
            data-speakable
          >
            {episode.summary}
          </p>
        </header>

        {episode.audioUrl ? (
          <section className="mb-8" aria-label="Episode audio">
            {/* Native HTML5 audio element. Apple Podcasts / Spotify
                clients fetch the enclosure URL directly from the RSS
                feed; this player is for visitors who arrive at the
                canonical page first. controls + preload="none" so the
                element occupies meaningful space without forcing an
                MP3 download until the user clicks play. */}
            <audio
              controls
              preload="none"
              src={episode.audioUrl}
              className="w-full"
            >
              Your browser does not support the audio element. Download
              the episode at{" "}
              <a href={episode.audioUrl} className="underline">
                {episode.audioUrl}
              </a>
              .
            </audio>
            <p className="text-xs text-muted-foreground mt-3">
              {podcastAudioDisclosure()}{" "}
              <Link
                href={`/podcast/${episode.slug}/transcript`}
                className="underline underline-offset-4"
              >
                Read the full transcript
              </Link>
              .
            </p>
          </section>
        ) : (
          <section className="mb-8" aria-label="Episode transcript link">
            <p className="text-sm text-muted-foreground">
              No audio enclosure for this episode yet.{" "}
              <Link
                href={`/podcast/${episode.slug}/transcript`}
                className="underline underline-offset-4"
              >
                Read the transcript
              </Link>
              .
            </p>
          </section>
        )}

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Show notes</h2>
          <p
            className="text-muted-foreground whitespace-pre-line"
            data-speakable
          >
            {episode.narrative}
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Verifiable artifact</h2>
          <p className="text-sm text-muted-foreground">
            Every episode names the shipped surface that proves the
            change. Open the artifact and you should see the version,
            URL, schema field, or operator flow described in the show
            notes above.
          </p>
          <a
            href={episode.artifactUrl}
            className="block rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            rel="noopener"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Open artifact
            </div>
            <div className="text-sm font-medium break-all">
              {episode.artifactUrl}
            </div>
          </a>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Topics</h2>
          <ul className="flex flex-wrap gap-2">
            {episode.keywords.map((k) => (
              <li
                key={k}
                className="text-xs uppercase tracking-widest border border-border rounded-full px-3 py-1 text-muted-foreground"
              >
                {k}
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Subscribe</h2>
          <p className="text-sm text-muted-foreground">
            Paste the RSS URL into any podcast app or RSS reader to
            receive future episodes automatically. The feed inherits
            the dataset's CC-BY-4.0 license – quote, embed, and remix
            with attribution to {ORGANIZATION.name}.
          </p>
          <ul className="text-sm space-y-2">
            <li>
              RSS:{" "}
              <a
                href={PODCAST_URLS.rss}
                className="underline underline-offset-4 break-all"
              >
                {PODCAST_URLS.rss}
              </a>
            </li>
            <li>
              Show page:{" "}
              <Link
                href="/podcast"
                className="underline underline-offset-4"
              >
                /podcast
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
