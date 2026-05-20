import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { Separator } from "@/components/ui/separator";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  PODCAST_EPISODE_SLUGS,
  PODCAST_SHOW_NAME,
  episodeTranscriptMdUrl,
  episodeTranscriptUrl,
  episodeUrl,
  getEpisodeBySlug,
  podcastAudioDisclosure,
} from "@/lib/seo/podcast";
import { getPodcastAudio } from "@/lib/seo/podcast-audio";

/**
 * /podcast/[slug]/transcript – per-episode human-readable transcript.
 *
 * Why this page exists (VEO uplift landing 2026-05-21)
 * ----------------------------------------------------
 * Schema.org PodcastEpisode supports a `transcript` field – populating it
 * requires a real URL where the transcript text lives. This page is that
 * URL. AI summarisers (Apple Podcast Transcripts, Spotify, Google's
 * podcast indexer, Whisper-trained retrievers) follow `transcript` URLs
 * to pull verbatim text instead of attempting to transcribe the audio
 * themselves. Surfacing the transcript at a stable URL is the single
 * highest-leverage VEO move once audio enclosures ship.
 *
 * Editorial honesty
 * -----------------
 * The audio enclosures on this site are synthesized narration of the
 * show notes (see PODCAST_AUDIO_VOICE.disclosure in the manifest). The
 * "transcript" is therefore the canonical source text – the audio is
 * downstream of it, not the other way around. The page surfaces the
 * disclosure verbatim so listeners and retrievers know what they are
 * consuming.
 *
 * Static rendering pattern
 * ------------------------
 * generateStaticParams enumerates PODCAST_EPISODE_SLUGS at build time;
 * unknown slugs 404 via notFound(). Mirrors every other [slug] route in
 * the codebase – no lazy ISR, no phantom URLs.
 *
 * Schema.org payload
 * ------------------
 *   - Article JSON-LD anchored on the transcript URL.
 *   - BreadcrumbList with three levels (root → /podcast → episode →
 *     transcript) so the trail is visible in Google sitelinks.
 *   - The transcript URL is also referenced from the episode page's
 *     PodcastEpisode JSON-LD via the `transcript` property (see
 *     buildPodcastEpisodeJson in src/lib/seo/podcast.ts) – bidirectional
 *     graph linkage so AI retrievers walking either entity reach the
 *     other.
 */

export function generateStaticParams() {
  return PODCAST_EPISODE_SLUGS.map((slug) => ({ slug }));
}

// dynamicParams = false removed in #78: Cache Components (cacheComponents:
// true) rejects route-segment configs at compile time. Unknown slugs still
// 404 cleanly via the notFound() call in the page body below — the registry
// is a closed set, so any /podcast/<unknown>/transcript hit lands on the
// generic not-found.tsx the same way it did under dynamicParams: false.

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const episode = getEpisodeBySlug(params.slug);
  if (!episode) return {};

  const canonical = `/podcast/${episode.slug}/transcript`;
  const title = `Transcript – ${episode.title}`;

  return {
    title,
    description: `Full transcript of episode ${episode.episodeNumber} of ${PODCAST_SHOW_NAME}: ${episode.summary}`,
    keywords: episode.keywords as readonly string[] as string[],
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      types: {
        "text/markdown": episodeTranscriptMdUrl(episode.slug),
      },
    },
    openGraph: {
      type: "article",
      title,
      description: episode.summary,
      url: canonical,
      siteName: ORGANIZATION.name,
      publishedTime: episode.publishedAt,
      modifiedTime: episode.publishedAt,
      authors: [FOUNDER.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: episode.summary,
    },
  };
}

export default async function PodcastTranscriptPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const episode = getEpisodeBySlug(params.slug);
  if (!episode) notFound();

  const canonicalUrl = episodeTranscriptUrl(episode.slug);
  const audio = getPodcastAudio(episode.slug);
  const trail = [
    { name: ORGANIZATION.name, url: `${BASE_URL}/` },
    { name: "Podcast", url: `${BASE_URL}/podcast` },
    { name: episode.title, url: episodeUrl(episode.slug) },
    { name: "Transcript", url: canonicalUrl },
  ] as const;

  // Split the narrative on blank lines so each paragraph is its own
  // <p> with data-speakable. Voice readers, Apple Podcast Transcripts,
  // and AI summarisers all chunk on paragraph boundaries – giving them
  // explicit <p> tags beats relying on whitespace heuristics.
  const paragraphs = episode.narrative
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={trail} />
      <ArticleJsonLd
        headline={`Transcript – ${episode.title}`}
        description={`Full transcript of episode ${episode.episodeNumber} of ${PODCAST_SHOW_NAME}.`}
        url={canonicalUrl}
        datePublished={episode.publishedAt}
        dateModified={episode.publishedAt}
        articleSection="Podcast Transcript"
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
          <Link
            href={`/podcast/${episode.slug}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Ep {episode.episodeNumber}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Transcript</span>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 tabular-nums">
            Transcript · Episode {episode.episodeNumber} ·{" "}
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

        {audio ? (
          <section className="mb-8" aria-label="Episode audio">
            <audio
              controls
              preload="none"
              src={`/audio/podcast/${audio.filename}`}
              className="w-full"
            >
              Your browser does not support the audio element. Download the
              episode at{" "}
              <a
                href={`/audio/podcast/${audio.filename}`}
                className="underline"
              >
                /audio/podcast/{audio.filename}
              </a>
              .
            </audio>
            <p className="text-xs text-muted-foreground mt-3">
              {podcastAudioDisclosure()}
            </p>
          </section>
        ) : null}

        <Separator className="my-8" />

        <section
          className="mb-10 space-y-4 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
          aria-label="Full transcript"
        >
          <h2 className="text-2xl font-bold not-prose">Full transcript</h2>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-base leading-relaxed"
              data-speakable
            >
              {para}
            </p>
          ))}
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">Verifiable artifact</h2>
          <p className="text-sm text-muted-foreground">
            Every episode names the shipped surface that proves the change.
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
          <h2 className="text-2xl font-bold">Machine-readable mirror</h2>
          <p className="text-sm text-muted-foreground">
            Need the transcript as plain Markdown for an LLM pipeline or
            citation manager? The same body is available at the URL below
            with <code>Content-Type: text/markdown</code>.
          </p>
          <a
            href={`/podcast/${episode.slug}/transcript/md`}
            className="block rounded-lg border border-border bg-card px-5 py-4 hover:border-foreground/40 transition-colors"
            rel="noopener"
          >
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Markdown mirror
            </div>
            <div className="text-sm font-medium break-all">
              {episodeTranscriptMdUrl(episode.slug)}
            </div>
          </a>
        </section>

        <p className="text-xs text-muted-foreground">
          Licensed CC-BY-4.0. Quote, embed, and remix with attribution to{" "}
          {ORGANIZATION.name}.
        </p>
      </article>
    </div>
  );
}
