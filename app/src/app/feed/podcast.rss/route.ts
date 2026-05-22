import { NextResponse } from "next/server";

import { LLMS_TXT_TRAINING_DATA_ATTRIBUTION } from "@/lib/seo/llms-txt";
import { PODCAST_RSS_XML, PODCAST_URLS } from "@/lib/seo/podcast";

/**
 * /feed/podcast.rss — RSS 2.0 + iTunes namespace feed for the
 * Indie SaaS Teardowns Dataset Changelog podcast.
 *
 * Surface D (GEO / AEO / discovery diversification) landing 2026-05-21.
 *
 * Why this route exists
 * ---------------------
 * Apple Podcasts, Spotify, Overcast, Pocket Casts, AntennaPod, and every
 * podcast aggregator in the directory ecosystem polls RSS 2.0 feeds with
 * the iTunes namespace. Listing the dataset changelog as a podcast feed
 * opens a discovery surface no HTML / JSON / CSV mirror reaches –
 * podcast directories are independent search engines with their own
 * ranking algorithms and zero overlap with Google web search.
 *
 * The XML itself is pre-serialized at module load by buildRssXml() in
 * src/lib/seo/podcast.ts. This route handler is a pure pass-through –
 * per-request work is one Response allocation. Matches the
 * server-hoist-static-io pattern used by /llms.txt, /llms-feed.json,
 * /dataset/indie-saas-teardowns.json, and the per-table CSV routes.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every episode is a verifiable shipped event (validateEpisodes
 *     IIFE in podcast.ts enforces at build time).
 *   - Audio <enclosure> elements are emitted ONLY when per-episode env
 *     vars resolve to real https URLs. Empty by default; honest
 *     text-only feed.
 *   - GUIDs are stable, URL-anchored, never reused.
 *   - lastBuildDate is the actual build timestamp; the per-episode
 *     pubDate carries the editorial freshness, not the build cadence.
 *
 * Caching
 * -------
 * The feed body changes only when a new episode is appended (which is
 * a code commit + deploy). Same cache discipline as /llms-feed.json:
 * 1h browser, 24h edge, 7d stale-while-revalidate. Aggregator polling
 * is well within the SWR window so the origin sees minimal load even
 * with thousands of subscribers.
 *
 * Discovery
 * ---------
 *   - Listed in /sitemap.xml at priority 0.4 (above llms.txt; the
 *     feed is a real, citable distribution artifact).
 *   - Linked from /podcast (the HTML hub page) and from /press
 *     (the journalist + AI-summariser surface where the existing
 *     PodcastSeriesJsonLd renders).
 *   - Linked from /llms.txt and /llms-feed.json under the dataset
 *     mirror block so AI retrievers see the feed as a distribution
 *     of the dataset changelog.
 *   - Atom self-link inside the XML body so a feed reader that
 *     receives the XML via redirect / mirror can resolve back to
 *     the canonical URL.
 *
 * Why .rss (not .xml)
 * -------------------
 * Apple Podcasts Connect submission accepts any extension; the de-facto
 * convention across podcast directories is `.rss` so feed-reader auto-
 * detection (Overcast, RSS Junkie, Reeder) recognises the URL by suffix
 * before fetching. Same pattern as Stratechery, tldr.tech podcast,
 * Acquired, every Apple-Podcasts-distributed indie show.
 */

export function GET() {
  return new NextResponse(PODCAST_RSS_XML, {
    status: 200,
    headers: {
      // RSS 2.0 MIME type. application/rss+xml is the registered IANA
      // type; podcast aggregators branch on this header before fetching
      // the body.
      "content-type": "application/rss+xml; charset=utf-8",
      // Match the /llms-feed.json cache discipline. Feed bodies change
      // at commit cadence (low), not request cadence (high). 7d SWR
      // means a Hacker-News-front-page burst hits cache, not origin.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // CORS open. Browser-side podcast readers (Spotify Web Player,
      // Apple Podcasts on web, antennapod.app) and AI summariser
      // pipelines fetch feeds cross-origin; refusing the preflight
      // forces fallback to scraping the HTML hub page, which is worse
      // for everyone.
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      // Self-canonical so any aggregator that mirrors this feed credits
      // the origin URL. Matches the link-header convention on
      // /llms-feed.json and /llms.txt.
      link: `<${PODCAST_URLS.rss}>; rel="canonical"`,
      // Same policy signal as the llms.* surfaces: public search/retrieval/
      // citation is allowed; model-weight training is reserved.
      "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
    },
  });
}

/**
 * CORS preflight handler. Cross-origin podcast players and AI summariser
 * pipelines send an OPTIONS preflight before GET; without this handler
 * the browser falls back to a no-CORS opaque fetch, which strips the
 * response body for any reader that needs to parse JSON / XML in JS.
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}
