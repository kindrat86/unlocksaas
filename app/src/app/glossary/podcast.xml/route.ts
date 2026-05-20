import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { getGlossaryBySlug } from "@/lib/glossary";
import {
  GLOSSARY_AUDIO_PODCAST_CONFIG,
  getAllGlossaryAudio,
  glossaryAudioAbsoluteUrl,
  type GlossaryAudioEntry,
} from "@/lib/seo/glossary-audio";

/**
 * /glossary/podcast.xml — RSS 2.0 podcast feed for the Unlock SaaS
 * Glossary audio episodes.
 *
 * Why this exists
 * ---------------
 * Apple Podcasts, Spotify, Google Podcasts, Pocket Casts, Overcast, and
 * every podcast directory ingest via iTunes-namespace RSS 2.0. Once
 * submitted (operator action documented in
 * strategy/glossary-audio-playbook.md), every new glossary audio episode
 * lands automatically in their indexes – the directories re-poll the feed.
 *
 * That gives the glossary three new acquisition surfaces:
 *   1. Apple Podcasts search ("hook funnel definition", "soap opera
 *      sequence brunson") – cited by Siri voice queries.
 *   2. Spotify podcast search – cited by Spotify's own AI summary cards.
 *   3. Google Podcasts → Google Search audio carousel (the audio
 *      equivalent of the video carousel that VideoObject unlocks).
 *
 * AI audio-search pipelines (Whisper-based ingestion at OpenAI, Google's
 * Universal Speech Model corpus) also walk podcast RSS feeds for
 * transcript-backed audio – a transcript-backed feed is preferred over a
 * raw-audio feed because the transcript is the canonical paraphrase
 * target for citations.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Empty manifest = zero `<item>` entries. The channel still renders
 *     (a valid empty feed) so directory probes don't 404, but no episode
 *     is claimed that does not exist.
 *   - Every `<enclosure>` URL resolves to a real MP3 on the CDN (the
 *     manifest validator guarantees this).
 *   - `<itunes:duration>` reads the real measured duration; no rounded
 *     marketing claim.
 *   - The square `<itunes:image>` is generated from the same source as
 *     the canonical cover route (1400×1400 PNG); Apple's submission
 *     validator requires it inside the channel block.
 *
 * Discovery
 * ---------
 * The feed URL is published in the sitemap, the llms.txt index, and
 * linked from every /glossary/[slug] detail page. Submission to Apple
 * Podcasts / Spotify / Google is gated on at least one episode existing.
 *
 * Caching
 * -------
 * The manifest only changes on redeploy (no per-request inputs), so the
 * feed body is byte-stable between deploys. Cache aggressively at the
 * edge; the `s-maxage` window covers a typical day of audio additions.
 */

const ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd";
const ATOM_NS = "http://www.w3.org/2005/Atom";
const CONTENT_NS = "http://purl.org/rss/1.0/modules/content/";
const PODCAST_NAMESPACE_NS = "https://podcastindex.org/namespace/1.0";

const FEED_URL = `${BASE_URL}/glossary/podcast.xml`;
const HUB_URL = `${BASE_URL}/glossary`;
const COVER_URL = `${BASE_URL}/glossary/podcast-cover`;

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc2822(iso: string): string {
  // RSS 2.0 spec requires RFC 2822 dates in <pubDate> and <lastBuildDate>.
  // Date#toUTCString is RFC 7231 / RFC 2822-compatible.
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    // Defensive: validator on glossary-audio.ts already rejects invalid
    // dates at module load, so this branch is unreachable in practice.
    return new Date(0).toUTCString();
  }
  return d.toUTCString();
}

function buildItem(audio: GlossaryAudioEntry, idx: number): string {
  const term = getGlossaryBySlug(audio.slug);
  if (!term) {
    // The validator in glossary-audio.ts already throws when an entry
    // references a non-existent slug; this is belt-and-braces defensive
    // and silently skips rather than emitting a broken item.
    return "";
  }
  const canonicalUrl = `${BASE_URL}/glossary/${audio.slug}`;
  const audioUrl = glossaryAudioAbsoluteUrl(audio.slug, BASE_URL);
  const title = `${term.term} — audio definition`;
  const description = term.shortDefinition;
  const duration = Math.max(1, Math.round(audio.durationSeconds));
  const episodeNumber = idx + 1;

  return `    <item>
      <title>${xmlEscape(title)}</title>
      <description>${xmlEscape(description)}</description>
      <content:encoded><![CDATA[<p>${xmlEscape(description)}</p>
<p>Read the full definition, the long-form explanation, the worked example, and the FAQ at <a href="${xmlEscape(canonicalUrl)}">${xmlEscape(canonicalUrl)}</a>.</p>]]></content:encoded>
      <link>${xmlEscape(canonicalUrl)}</link>
      <guid isPermaLink="false">${xmlEscape(canonicalUrl)}#audio</guid>
      <pubDate>${rfc2822(audio.generatedAt)}</pubDate>
      <enclosure url="${xmlEscape(audioUrl)}" length="${audio.byteSize}" type="${xmlEscape(audio.contentType)}" />
      <itunes:title>${xmlEscape(title)}</itunes:title>
      <itunes:subtitle>${xmlEscape(description)}</itunes:subtitle>
      <itunes:summary>${xmlEscape(description)}</itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      <itunes:author>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.author)}</itunes:author>
      <itunes:explicit>${GLOSSARY_AUDIO_PODCAST_CONFIG.explicit ? "true" : "false"}</itunes:explicit>
      <itunes:episodeType>full</itunes:episodeType>
      <itunes:episode>${episodeNumber}</itunes:episode>
      <itunes:keywords>${xmlEscape([term.term, term.category, "Brunson", "indie SaaS", "glossary"].join(", "))}</itunes:keywords>
      <itunes:image href="${xmlEscape(COVER_URL)}" />
    </item>`;
}

export function GET() {
  const episodes = getAllGlossaryAudio();
  const channelTitle = GLOSSARY_AUDIO_PODCAST_CONFIG.title;
  const channelDescription = GLOSSARY_AUDIO_PODCAST_CONFIG.description;
  const lastBuildDate =
    episodes.length > 0
      ? rfc2822(episodes[0].generatedAt)
      : new Date().toUTCString();

  const items = episodes.map(buildItem).filter(Boolean).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:itunes="${ITUNES_NS}"
  xmlns:atom="${ATOM_NS}"
  xmlns:content="${CONTENT_NS}"
  xmlns:podcast="${PODCAST_NAMESPACE_NS}">
  <channel>
    <title>${xmlEscape(channelTitle)}</title>
    <link>${xmlEscape(HUB_URL)}</link>
    <atom:link href="${xmlEscape(FEED_URL)}" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(channelDescription)}</description>
    <language>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.language)}</language>
    <copyright>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.copyright)}</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>unlocksaas.com/glossary/podcast.xml</generator>
    <itunes:author>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.author)}</itunes:author>
    <itunes:summary>${xmlEscape(channelDescription)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.author)}</itunes:name>
      <itunes:email>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:category text="${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.category)}">
      <itunes:category text="${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.subcategory)}" />
    </itunes:category>
    <itunes:explicit>${GLOSSARY_AUDIO_PODCAST_CONFIG.explicit ? "true" : "false"}</itunes:explicit>
    <itunes:type>${xmlEscape(GLOSSARY_AUDIO_PODCAST_CONFIG.type)}</itunes:type>
    <itunes:image href="${xmlEscape(COVER_URL)}" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      // Manifest only changes on redeploy → safe to cache aggressively
      // at the CDN. Browsers keep a shorter copy so podcatcher apps that
      // poll directly (Overcast, Pocket Casts) still see fresh data fast.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
