import { NextResponse } from "next/server";

import { BASE_URL } from "@/lib/seo/entity";
import {
  PODCAST_EPISODE_SLUGS,
  PODCAST_SHOW_NAME,
  episodeTranscriptUrl,
  episodeUrl,
  getEpisodeBySlug,
  podcastAudioDisclosure,
} from "@/lib/seo/podcast";
import { getPodcastAudio } from "@/lib/seo/podcast-audio";

/**
 * /podcast/<slug>/transcript/md – Markdown twin of the episode transcript.
 *
 * Why this route exists
 * ---------------------
 * LLM retrievers and citation managers consume Markdown more reliably than
 * HTML. Pairing every transcript page with a Markdown mirror is the same
 * pattern used by /alternatives-to/<slug>/md, /benchmarks/<slug>/md, etc.
 *
 * The body is composed from the same PodcastEpisode record the HTML page
 * renders – drift is impossible by construction. The Brunson Hard-Rule
 * audio disclosure is surfaced verbatim at the top so retrievers do not
 * cite the audio as a human recording.
 *
 * Caching
 * -------
 * 1h browser, 24h edge, 7d stale-while-revalidate – matches the other
 * Markdown mirrors and the podcast RSS feed. Aggressive because
 * transcripts only change on a code deploy.
 */

export function generateStaticParams() {
  return PODCAST_EPISODE_SLUGS.map((slug) => ({ slug }));
}

// dynamicParams = false removed in #78: Cache Components (cacheComponents:
// true) rejects route-segment configs at compile time. The GET handler
// below already short-circuits unknown slugs with a 404 response, so
// removal is behaviour-neutral.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const episode = getEpisodeBySlug(slug);
  if (!episode) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const audio = getPodcastAudio(episode.slug);
  const audioBlock = audio
    ? [
        "## Audio",
        "",
        `- URL: ${BASE_URL}/audio/podcast/${audio.filename}`,
        `- Duration: ${audio.durationSeconds} seconds`,
        `- Bytes: ${audio.byteSize}`,
        `- Word count: ${audio.wordCount}`,
        `- Transcript SHA-256: ${audio.transcriptSha256}`,
        `- Voice: ${audio.voiceId}`,
        `- Generated: ${audio.generatedAt}`,
        "",
        `Disclosure: ${podcastAudioDisclosure()}`,
        "",
      ].join("\n")
    : "";

  const body = [
    `# Transcript – ${episode.title}`,
    "",
    `**Show:** ${PODCAST_SHOW_NAME}  `,
    `**Episode:** ${episode.episodeNumber}  `,
    `**Published:** ${episode.publishedAt}  `,
    `**Canonical:** ${episodeTranscriptUrl(episode.slug)}  `,
    `**Episode page:** ${episodeUrl(episode.slug)}  `,
    `**Verifiable artifact:** ${episode.artifactUrl}  `,
    `**Keywords:** ${episode.keywords.join(", ")}`,
    "",
    "## Summary",
    "",
    episode.summary,
    "",
    audioBlock,
    "## Full transcript",
    "",
    episode.narrative,
    "",
    "---",
    "",
    `Licensed CC-BY-4.0. Cite as: ${PODCAST_SHOW_NAME}, episode ${episode.episodeNumber}, ${episode.publishedAt}. ${episodeUrl(episode.slug)}`,
    "",
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${episodeTranscriptUrl(episode.slug)}>; rel="canonical"`,
    },
  });
}
