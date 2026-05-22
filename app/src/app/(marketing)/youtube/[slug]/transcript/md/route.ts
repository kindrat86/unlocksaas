import { NextResponse } from "next/server";

import {
  episodeTranscriptUrl,
  episodeUrl,
  findEpisodeBySlug,
  FOUNDERS_DIARY_CHANNEL,
  FOUNDERS_DIARY_SLUGS,
  phaseLabel,
} from "@/lib/youtube";

/**
 * /youtube/<slug>/transcript/md – Markdown twin of the YouTube episode
 * transcript.
 *
 * Why this route exists
 * ---------------------
 * LLM retrievers and citation managers consume Markdown more reliably
 * than HTML. Pairing every transcript page with a Markdown mirror is the
 * same pattern used by /podcast/<slug>/transcript/md, /alternatives-to/
 * <slug>/md, /benchmarks/<slug>/md, etc.
 *
 * The body is composed from the same FoundersDiaryEpisode record the
 * HTML page renders – drift is impossible by construction. Brunson
 * Hard-Rule: 404 unless the episode is live AND has a hand-pasted
 * transcript body. No synthetic content.
 *
 * Caching
 * -------
 * 1h browser, 24h edge, 7d stale-while-revalidate – matches the other
 * markdown mirrors and the podcast transcript md route. Aggressive
 * because transcripts only change on a code deploy (operator edits the
 * registry, ships a commit, the mirror flips with it).
 */

export function generateStaticParams() {
  return FOUNDERS_DIARY_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const ep = findEpisodeBySlug(slug);
  if (!ep) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Only emit the markdown body for transcript-eligible episodes.
  // Drafts and live entries without a transcript field 404 cleanly so
  // we never advertise a phantom URL.
  if (
    ep.status !== "live" ||
    !ep.transcript ||
    ep.transcript.trim().length === 0
  ) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const canonical = episodeTranscriptUrl(ep);
  const watchBlock = ep.youtube_url
    ? [
        "## Watch",
        "",
        `- YouTube: ${ep.youtube_url}`,
        "",
      ].join("\n")
    : "";

  const takeawaysBlock =
    ep.key_takeaways && ep.key_takeaways.length > 0
      ? [
          "## Key takeaways",
          "",
          ...ep.key_takeaways.map((t) => `- ${t}`),
          "",
        ].join("\n")
      : "";

  const body = [
    `# Transcript – ${ep.title}`,
    "",
    `**Show:** ${FOUNDERS_DIARY_CHANNEL.name}  `,
    `**Episode:** ${ep.id} (#${ep.number} of ${FOUNDERS_DIARY_CHANNEL.total_episodes_planned})  `,
    `**Phase:** ${phaseLabel(ep.phase)}  `,
    `**Brunson beat:** ${ep.brunson_beat}  `,
    ep.publish_at ? `**Published:** ${ep.publish_at}  ` : "",
    `**Canonical:** ${canonical}  `,
    `**Episode page:** ${episodeUrl(ep)}  `,
    "",
    "## Hook (first three seconds)",
    "",
    `> ${ep.hook_3s}`,
    "",
    watchBlock,
    "## Full transcript",
    "",
    ep.transcript,
    "",
    takeawaysBlock,
    "---",
    "",
    `Licensed CC-BY-4.0. Cite as: ${FOUNDERS_DIARY_CHANNEL.name}, episode ${ep.id}, ${ep.publish_at ?? "n/a"}. ${episodeUrl(ep)}`,
    "",
  ]
    .filter((section) => section !== "")
    .join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${canonical}>; rel="canonical"`,
    },
  });
}
