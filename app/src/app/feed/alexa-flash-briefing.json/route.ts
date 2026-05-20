import { NextResponse } from "next/server";

import { BASE_URL } from "@/lib/seo/entity";
import {
  PODCAST_EPISODES,
  episodeTranscriptUrl,
  episodeUrl,
  podcastAudioDisclosure,
} from "@/lib/seo/podcast";
import { getPodcastAudio } from "@/lib/seo/podcast-audio";

/**
 * /feed/alexa-flash-briefing.json — Alexa Flash Briefing skill feed.
 *
 * Spec: https://developer.amazon.com/en-US/docs/alexa/flashbriefing/flash-briefing-skill-api-feed-reference.html
 *
 * Why this route exists (VEO uplift landing 2026-05-21)
 * -----------------------------------------------------
 * Amazon Alexa is the largest residual voice-assistant surface that still
 * accepts third-party content feeds for the home-speaker form factor.
 * Google Assistant Conversational Actions sunset 2023-06; Apple's
 * SiriKit does not accept content feeds. Alexa's Flash Briefing API
 * remains live and ingests JSON feeds of short news/update items, with
 * optional audio (streamUrl) per item.
 *
 * This feed projects the existing podcast changelog into Alexa's
 * required shape: one item per episode, ordered newest-first, with the
 * synthesized-narration audio enclosure as streamUrl when present.
 * Users say "Alexa, what's my flash briefing?" and the device reads
 * titleText then plays streamUrl (or reads mainText if no audio).
 *
 * Schema requirements (Alexa Flash Briefing feed reference)
 * ---------------------------------------------------------
 *   - JSON array of items.
 *   - uid: stable per-item ID. We use the episode GUID.
 *   - updateDate: ISO 8601 with timezone offset. We use ${publishedAt}T12:00:00.0Z
 *     (matches the pubDate in podcast.rss for cross-feed parity).
 *   - titleText: <= 120 characters, plain text only.
 *   - mainText: <= 4500 characters, plain text only. We use the
 *     episode summary (not the full narrative) because Alexa reads the
 *     mainText aloud only when there is no streamUrl; the audio is the
 *     primary mode when available.
 *   - streamUrl: HTTPS URL to the audio file. Optional; we emit only
 *     when the audio manifest resolves a real enclosure.
 *   - redirectionUrl: where listeners can read more. We point at the
 *     transcript page (not the episode page) because the transcript IS
 *     the canonical text companion to the audio.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Audio is disclosed in mainText (synthesized narration) so Alexa
 *     listeners are told what they are about to hear.
 *   - No fabricated episodes; the feed is generated from PODCAST_EPISODES,
 *     which is itself gated by validateEpisodes at module load.
 *   - HTTPS-only enforced for streamUrl (Alexa rejects HTTP feeds).
 *   - updateDate values are real ISO timestamps anchored on the
 *     editorial publish date – no fake "Updated today" drift.
 *
 * Caching
 * -------
 * Alexa devices poll the feed on demand when the user invokes the
 * skill. 1h browser, 24h edge, 7d SWR is generous: a new episode
 * lands in the feed at the next deploy, and Alexa picks it up on the
 * next invocation. Matches the cache discipline of /feed/podcast.rss.
 */

interface AlexaFlashBriefingItem {
  uid: string;
  updateDate: string;
  titleText: string;
  mainText: string;
  redirectionUrl: string;
  streamUrl?: string;
}

const FEED_BODY: string = (() => {
  // Alexa: titleText hard ceiling is 120 characters. Truncate with a
  // trailing ellipsis if needed (none of the current titles approach
  // this, but the guard is permanent so a long future title cannot
  // silently break the skill).
  function truncate120(s: string): string {
    if (s.length <= 120) return s;
    return s.slice(0, 117).trimEnd() + "...";
  }
  // mainText ceiling is 4500 characters. Our summaries are well under
  // that; the disclosure suffix is the only growth vector. The episodes
  // surface uses summary (not full narrative) because Alexa reads
  // mainText only when streamUrl is absent – so the summary is the
  // audio-less fallback content.
  const disclosureSuffix = ` (Note: ${podcastAudioDisclosure()})`;
  function buildMainText(summary: string, hasAudio: boolean): string {
    const body = hasAudio ? summary + disclosureSuffix : summary;
    if (body.length <= 4500) return body;
    return body.slice(0, 4497).trimEnd() + "...";
  }

  const items: AlexaFlashBriefingItem[] = PODCAST_EPISODES.map((ep) => {
    const audio = getPodcastAudio(ep.slug);
    // Anchor the updateDate at 12:00 UTC on the published date so
    // Alexa never rolls the day backward in timezone-shifted regions
    // (matches the rfc822Date helper in podcast.ts).
    const updateDate = `${ep.publishedAt}T12:00:00.0Z`;
    const item: AlexaFlashBriefingItem = {
      // The episode GUID is already a stable, URL-anchored unique ID.
      // Alexa hashes uid to detect "new" items between polls.
      uid: `${BASE_URL}/podcast/${ep.slug}#episode`,
      updateDate,
      titleText: truncate120(ep.title),
      mainText: buildMainText(ep.summary, Boolean(audio)),
      // Send users to the transcript page – it carries the audio
      // player, full text, and the verifiable-artifact link.
      redirectionUrl: episodeTranscriptUrl(ep.slug),
    };
    if (audio) {
      item.streamUrl = `${BASE_URL}/audio/podcast/${audio.filename}`;
    }
    return item;
  });

  // Pretty-printed for human inspection; Alexa parses either way.
  return JSON.stringify(items, null, 2) + "\n";
})();

export async function GET() {
  return new NextResponse(FEED_BODY, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      "access-control-allow-origin": "*",
      "x-robots-tag": "noindex",
      link: `<${episodeUrl(PODCAST_EPISODES[0].slug)}>; rel="related"`,
    },
  });
}
