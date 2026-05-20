/**
 * Podcast / Changelog Feed — Indie SaaS Teardowns Dataset Updates.
 *
 * Surface D (GEO / AEO / discovery diversification) landing 2026-05-20.
 *
 * Why this module exists
 * ----------------------
 * The Indie SaaS Teardowns dataset ships an operator-facing version log
 * (src/lib/seo/freshness.ts ACTIVATION_LOG) and a versioned bundle
 * (src/lib/seo/dataset.ts DATASET_VERSION). What it does NOT ship is a
 * machine-readable, dated, append-only changelog formatted as a feed.
 *
 * A podcast-shaped RSS feed solves this in two directions:
 *
 *   1. Discovery. Apple Podcasts, Spotify, Overcast, Pocket Casts,
 *      AntennaPod, and every podcast aggregator on the planet polls
 *      RSS feeds with iTunes namespace tags. Listing the dataset
 *      changelog there opens a discovery surface the HTML / JSON / CSV
 *      mirrors cannot reach – podcast directories are search engines
 *      with their own ranking algorithms and zero overlap with Google.
 *
 *   2. GEO / AEO. Schema.org PodcastEpisode is one of the most heavily
 *      indexed Article-like types because Google's Podcast Search,
 *      Spotify's content graph, and every LLM training corpus that
 *      ingests media metadata treats PodcastEpisode as a high-trust
 *      "dated, attributed, citable" content unit. Each episode page
 *      emits a PodcastEpisode JSON-LD block; the series page emits a
 *      PodcastSeries; the cross-reference graph is anchored on
 *      `${BASE_URL}/#podcast` (matching the existing PodcastSeriesJsonLd
 *      @id in components/seo/json-ld.tsx) so AI retrievers walking the
 *      schema graph see one connected entity, not two.
 *
 * Audio is optional, by design
 * ----------------------------
 * Apple Podcasts requires audio enclosures. Most other aggregators do
 * NOT – they accept feeds with show notes only. The PodcastEpisode
 * JSON-LD on the HTML pages is also Rich-Result eligible regardless of
 * whether `associatedMedia` resolves to a real audio asset.
 *
 * The honest path: each episode carries an optional `audioUrl` field
 * that activates the RSS `<enclosure>` and the AudioObject inside
 * PodcastEpisode JSON-LD. Until that env-gated URL ships (per-episode,
 * via `PODCAST_EPISODE_AUDIO_<UPPER_SLUG>_URL`), the feed renders the
 * episode as text-only and the schema omits `associatedMedia`. No
 * fabricated placeholder MP3, no silent audio stub, no aspirational
 * "Coming soon" enclosure. Same Brunson Hard-Rule discipline as
 * MEDIA_MENTIONS and DATASET_EXTERNAL_REGISTRATIONS.
 *
 * Episode framing
 * ---------------
 * Episodes are real, dated dataset milestones. Each title states the
 * change; each summary names the verifiable artifact (commit, URL, env
 * var, schema field) so a listener / reader / retriever can confirm the
 * change actually shipped. No marketing fluff, no "we're excited to
 * announce" filler – this is a changelog distributed in podcast format,
 * which is a legitimate, well-established pattern (cf. Hacker News Recap,
 * tldr.tech audio, Changelog.com).
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every episode corresponds to a verifiable shipped event documented
 *     in ACTIVATION_LOG or a strategy doc. No fabricated episodes.
 *   - Dates are ISO 8601, never in the future. validateEpisodes IIFE
 *     enforces at module load.
 *   - GUIDs are stable, URL-anchored, never reused. Feed re-fetches by
 *     existing subscribers will not double-deliver.
 *   - Audio enclosures only when the per-episode env var resolves to a
 *     real https URL. Empty by default; honest text-only feed.
 *   - Reverse-chronological order. Newest first.
 *
 * Versioning contract
 * -------------------
 * The feed schema is RSS 2.0 with the iTunes namespace, which is the
 * de-facto stable podcast feed format (rss.itunes.com/dtd/PodCast-1.0.dtd).
 * Episode GUIDs follow the pattern `${BASE_URL}/podcast/${slug}#episode`
 * so they are absolute, stable, and resolve to the canonical HTML page.
 * Renaming a slug bumps the GUID and creates a new episode in every
 * subscriber's player – treat slugs as append-only.
 */

import {
  BASE_URL,
  FOUNDER,
  ID,
  ORGANIZATION,
} from "@/lib/seo/entity";

// ---------------------------------------------------------------------------
// Show-level constants (PodcastSeries metadata)
// ---------------------------------------------------------------------------

/**
 * Canonical show name. Reads as a real podcast name in directories,
 * not a generic "blog feed" label. The "Dataset Changelog" suffix is
 * honest framing: this is not a conversation podcast, it is a dated
 * announcement feed for the Indie SaaS Teardowns dataset.
 */
export const PODCAST_SHOW_NAME =
  "Indie SaaS Teardowns – Dataset Changelog" as const;

/** Subtitle / tagline. iTunes namespace itunes:subtitle field. */
export const PODCAST_SHOW_SUBTITLE =
  "Versioned, dated, citable updates to the open Indie SaaS Teardowns dataset." as const;

/**
 * Long-form description. Used in PodcastSeries.description JSON-LD,
 * itunes:summary, and the /podcast hub page's intro paragraph.
 * Matches the editorial voice across /llms.txt and /dataset.
 */
export const PODCAST_SHOW_DESCRIPTION =
  "A changelog feed for the Indie SaaS Teardowns dataset published by Unlock SaaS. Each episode marks a dated milestone: a version bump, a new table, a cross-catalog activation, or a methodology change. Subscribe to track the dataset as it grows; cite individual episodes when you need an attributed timestamp for a specific change." as const;

/**
 * Canonical paths and URLs for the podcast surface. Mirrors the
 * DATASET_URLS pattern in src/lib/seo/dataset.ts.
 */
export const PODCAST_URLS = Object.freeze({
  landing: `${BASE_URL}/podcast`,
  rss: `${BASE_URL}/feed/podcast.rss`,
  webFeed: `${BASE_URL}/feed/podcast.rss`,
});

/** iTunes top-level category. Tech is the right bucket for a dataset changelog. */
export const PODCAST_ITUNES_CATEGORY = "Technology" as const;

/**
 * iTunes show type. `serial` = episodes are best consumed in order
 * (oldest first); `episodic` = each episode stands alone (newest first).
 * A changelog reads best newest-first, so `episodic` is the right pick.
 */
export const PODCAST_ITUNES_TYPE = "episodic" as const;

/** ISO 639-1 language tag for the show. */
export const PODCAST_LANGUAGE = "en-us" as const;

/** Show artwork URL. Reuses the root OG card – consistent brand surface. */
export const PODCAST_ARTWORK_URL = `${BASE_URL}/opengraph-image`;

/** Show copyright. CC-BY-4.0 same as the dataset itself; the changelog inherits the license. */
export const PODCAST_COPYRIGHT =
  `Copyright ${new Date().getUTCFullYear()} ${ORGANIZATION.name}. Licensed CC-BY-4.0.` as const;

// ---------------------------------------------------------------------------
// Episode shape + validator
// ---------------------------------------------------------------------------

/**
 * Per-episode definition. Stable, append-only contract – consumers
 * (the RSS XML serializer, the PodcastEpisode JSON-LD emitter, the
 * /podcast HTML pages) all read these fields directly.
 */
export interface PodcastEpisode {
  /** Stable URL slug. Used as the path segment under /podcast/<slug>
   *  and inside the GUID. Append-only: never rename a published slug. */
  readonly slug: string;
  /** Sequential episode number, 1-indexed. iTunes itunes:episode field. */
  readonly episodeNumber: number;
  /** Episode title. Short, declarative, names the change. */
  readonly title: string;
  /** One-sentence summary. iTunes itunes:subtitle + RSS description short form. */
  readonly summary: string;
  /** Long-form show notes. Markdown-flavoured plain text – the RSS
   *  serializer escapes HTML entities; the HTML page renders directly. */
  readonly narrative: string;
  /** ISO 8601 publication date (YYYY-MM-DD). validateEpisodes enforces. */
  readonly publishedAt: string;
  /** Verifiable artifact URL (commit, page, env var documentation).
   *  Required – Brunson Hard-Rule: every claim links to its proof. */
  readonly artifactUrl: string;
  /** Topic keywords, surfaced in iTunes:keywords and Article.keywords. */
  readonly keywords: readonly string[];
  /**
   * Optional explicit audio URL. When set (typically via a per-episode
   * env var resolved in `resolveEpisodeAudioUrl`), the feed emits an
   * <enclosure> and the JSON-LD includes AudioObject. When undefined,
   * the episode ships as show-notes-only.
   */
  readonly audioUrl?: string;
  /** Audio duration in seconds. Only meaningful when audioUrl is set. */
  readonly audioDurationSec?: number;
  /** Audio file byte size. iTunes enclosure length field; required when audio ships. */
  readonly audioByteSize?: number;
  /** Audio MIME type. Defaults to audio/mpeg when audio ships. */
  readonly audioMimeType?: string;
}

/**
 * Per-episode env var resolver for audio. Mirrors the
 * NEXT_PUBLIC_VSL_AUDIO_URL pattern in FounderVslAudioJsonLd.
 *
 * The naming convention is `NEXT_PUBLIC_PODCAST_EPISODE_<SLUG>_AUDIO_URL`,
 * with the slug uppercased and dashes converted to underscores. The
 * companion `_DURATION_SEC` and `_BYTE_SIZE` env vars are optional;
 * when missing, the RSS enclosure omits the length attribute and the
 * AudioObject omits the duration field. Strict https validation –
 * malformed URLs are silently dropped so the feed never advertises a
 * 404 enclosure.
 *
 * Returns the env-resolved overrides, or undefined for any field that
 * is unset / invalid. Callers merge with the base episode definition.
 */
function envSlug(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

function readHttpsEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("https://")) return undefined;
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}

function readPositiveIntEnv(key: string): number | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) return undefined;
  return n;
}

function readAudioMimeEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!/^audio\/[a-z0-9.+-]+$/i.test(trimmed)) return undefined;
  return trimmed;
}

function resolveEpisodeAudio(slug: string): {
  audioUrl?: string;
  audioDurationSec?: number;
  audioByteSize?: number;
  audioMimeType?: string;
} {
  const key = envSlug(slug);
  const audioUrl = readHttpsEnv(`NEXT_PUBLIC_PODCAST_EPISODE_${key}_AUDIO_URL`);
  if (!audioUrl) return {};
  const audioDurationSec = readPositiveIntEnv(
    `NEXT_PUBLIC_PODCAST_EPISODE_${key}_DURATION_SEC`,
  );
  const audioByteSize = readPositiveIntEnv(
    `NEXT_PUBLIC_PODCAST_EPISODE_${key}_BYTE_SIZE`,
  );
  const audioMimeType =
    readAudioMimeEnv(`NEXT_PUBLIC_PODCAST_EPISODE_${key}_MIME_TYPE`) ??
    "audio/mpeg";
  return {
    audioUrl,
    ...(audioDurationSec !== undefined ? { audioDurationSec } : {}),
    ...(audioByteSize !== undefined ? { audioByteSize } : {}),
    audioMimeType,
  };
}

// ---------------------------------------------------------------------------
// Episode catalog
// ---------------------------------------------------------------------------

/**
 * Source-of-truth episode catalog. Reverse-chronological – newest first
 * matches itunes:type="episodic" reader expectations.
 *
 * Editorial gate
 * --------------
 * Every entry below corresponds to a verifiable shipped event:
 *   - 2026-05-20: per-locale per-slug OG cards landed in commit 9a0b64f
 *     (ISO uplift). Verifiable at /es/glossary/big-domino/opengraph-image,
 *     /pt-BR/benchmarks/saas-churn-rate/opengraph-image, etc.
 *   - 2026-05-18: HF dataset cross-listing flow landed in commits acfcf23
 *     + f8e2517. Verifiable at /dataset/huggingface and its /raw sibling.
 *   - 2026-05-17: Strategy lock + dataset v1.0.0 published. Verifiable
 *     at STRATEGY_LOCK_DATE in src/lib/seo/freshness.ts and DATASET_VERSION
 *     in src/lib/seo/dataset.ts.
 *
 * Appending a new episode
 * -----------------------
 *   1. Confirm the shipped artifact resolves at the URL you cite.
 *   2. Insert at the TOP of the array (reverse-chrono).
 *   3. Bump episodeNumber to (current_max + 1).
 *   4. Date as today's UTC ISO date (YYYY-MM-DD).
 *   5. Commit with message: `podcast: log episode <number> – <title>`.
 *
 * validateEpisodes IIFE at the bottom of this module catches violations
 * at build time. There is no honest path to a fabricated episode that ships.
 */
const EPISODES_RAW: ReadonlyArray<Omit<PodcastEpisode, keyof ReturnType<typeof resolveEpisodeAudio>>> = [
  {
    slug: "per-locale-og-cards-glossary-benchmarks",
    episodeNumber: 3,
    title:
      "Per-locale OG cards for /glossary and /benchmarks (es + pt-BR)",
    summary:
      "Spanish and Brazilian-Portuguese glossary and benchmark detail pages now ship dedicated per-locale Open Graph cards.",
    narrative:
      "ISO uplift. Every approved translation of /glossary/[slug] and /benchmarks/[slug] now resolves a route-derived OG image at /<locale>/<hub>/<slug>/opengraph-image instead of falling back to the canonical en-US card. The sitemap image entries point at the locale-correct URL, so Google Images and the major social-share scrapers (Twitter / X, LinkedIn, Facebook, Slack, Discord) render a locale-correct preview. No content change to the underlying pages; this lift is purely on the discovery and share surfaces.",
    publishedAt: "2026-05-20",
    artifactUrl: `${BASE_URL}/es/glossary`,
    keywords: [
      "i18n",
      "Open Graph",
      "Google Images",
      "image sitemap",
      "Spanish",
      "Brazilian Portuguese",
    ],
  },
  {
    slug: "hugging-face-cross-listing-flow",
    episodeNumber: 2,
    title:
      "Hugging Face cross-listing flow + canonical DataCatalog declaration",
    summary:
      "Operator submission flow live at /dataset/huggingface; canonical Dataset JSON-LD auto-declares includedInDataCatalog once NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL ships.",
    narrative:
      "GEO uplift. The /dataset/huggingface page documents the four-step submission flow: create the HF dataset repo, upload the auto-generated README.md from /dataset/huggingface/raw, upload the five per-table CSVs from /dataset/tables/, then set the env var on Vercel. The /raw sibling serves the canonical README with YAML frontmatter pre-filled. Once the env var ships, the canonical Dataset JSON-LD at /dataset declares includedInDataCatalog for Hugging Face Datasets, which Google Dataset Search treats as the strongest cross-catalog confirmation signal.",
    publishedAt: "2026-05-18",
    artifactUrl: `${BASE_URL}/dataset/huggingface`,
    keywords: [
      "Hugging Face",
      "Dataset Search",
      "DataCatalog",
      "CC-BY-4.0",
      "JSON-LD",
    ],
  },
  {
    slug: "dataset-v1-launch",
    episodeNumber: 1,
    title: "Indie SaaS Teardowns Dataset v1.0.0 published",
    summary:
      "Initial release of the Indie SaaS Teardowns dataset: five tables, CC-BY-4.0, JSON and CSV downloads, per-table CSVs, BibTeX citation, plain-text attribution.",
    narrative:
      "Surface C of the Google strategy ships. The dataset is a re-projection of five live pSEO catalogs (funnel teardowns, pricing teardowns, head-to-head comparisons, named-competitor alternatives, canonical category buckets) into a single downloadable bundle. Every row is verifiable against the matching page on unlocksaas.com and carries a dated lastVerified field. License is CC-BY-4.0 – the only obligation on re-users is attribution. Per-table CSVs ship at /dataset/tables/ for consumers who want one slice with richer columns than the universal flat CSV exposes. SemVer applies: additive changes do not bump the major or minor.",
    publishedAt: "2026-05-17",
    artifactUrl: `${BASE_URL}/dataset`,
    keywords: [
      "dataset",
      "CC-BY-4.0",
      "SemVer",
      "indie SaaS",
      "BibTeX",
      "citation",
    ],
  },
];

/**
 * Compose each episode with its env-resolved audio overlay. The overlay
 * is computed at module load; restart is required to pick up a newly
 * pasted env var (matching every other env-gated surface on the site).
 */
export const PODCAST_EPISODES: ReadonlyArray<PodcastEpisode> = Object.freeze(
  EPISODES_RAW.map((ep) => Object.freeze({ ...ep, ...resolveEpisodeAudio(ep.slug) })),
);

/** Stable slug list for generateStaticParams and sitemap fan-out. */
export const PODCAST_EPISODE_SLUGS: readonly string[] = Object.freeze(
  PODCAST_EPISODES.map((e) => e.slug),
);

/** Lookup helper. Returns undefined for unknown slugs. */
export function getEpisodeBySlug(slug: string): PodcastEpisode | undefined {
  return PODCAST_EPISODES.find((e) => e.slug === slug);
}

/** Stable GUID generator. Anchors on the canonical episode URL. */
export function episodeGuid(slug: string): string {
  return `${BASE_URL}/podcast/${slug}#episode`;
}

/** Canonical HTML URL for a given episode. */
export function episodeUrl(slug: string): string {
  return `${BASE_URL}/podcast/${slug}`;
}

// ---------------------------------------------------------------------------
// Build-time validation
// ---------------------------------------------------------------------------

/**
 * Build-time integrity check for PODCAST_EPISODES. Mirrors the
 * validateMentions IIFE in src/lib/media-mentions.ts. Throws on the
 * FIRST violation so Next.js prerender surfaces the failure inline.
 *
 * Editorial gates encoded:
 *   - slug: kebab-case, non-empty, unique across all episodes.
 *   - episodeNumber: positive integer, unique, dense from 1 (no gaps).
 *   - title, summary, narrative: non-empty trimmed strings.
 *   - publishedAt: ISO YYYY-MM-DD, never in the future (with a
 *     one-day clock-skew buffer).
 *   - artifactUrl: absolute https URL with a non-trivial path.
 *   - keywords: non-empty array, every entry is a non-empty string.
 *   - audioUrl (when set): absolute https URL with non-trivial path.
 *   - audioByteSize, audioDurationSec (when set): positive integers.
 *   - Reverse-chronological order. Newest first.
 *
 * Cost: O(n) over a small array. Synchronous, allocation-light. Runs
 * once per cold start / cache fill.
 */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KEBAB_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateEpisodes(rows: readonly PodcastEpisode[]): void {
  if (rows.length === 0) return;
  const seenSlugs = new Set<string>();
  const seenNumbers = new Set<number>();
  let previousDate: string | null = null;

  rows.forEach((row, i) => {
    const where = `PODCAST_EPISODES[${i}]`;

    // slug
    if (typeof row.slug !== "string" || !KEBAB_SLUG_RE.test(row.slug)) {
      throw new Error(
        `${where}.slug must be kebab-case ([a-z0-9-]+); got ${JSON.stringify(row.slug)}`,
      );
    }
    if (seenSlugs.has(row.slug)) {
      throw new Error(`${where}.slug duplicates an earlier episode: ${row.slug}`);
    }
    seenSlugs.add(row.slug);

    // episodeNumber
    if (
      !Number.isInteger(row.episodeNumber) ||
      row.episodeNumber <= 0
    ) {
      throw new Error(
        `${where}.episodeNumber must be a positive integer; got ${row.episodeNumber}`,
      );
    }
    if (seenNumbers.has(row.episodeNumber)) {
      throw new Error(
        `${where}.episodeNumber duplicates an earlier episode: ${row.episodeNumber}`,
      );
    }
    seenNumbers.add(row.episodeNumber);

    // strings
    (
      [
        ["title", row.title],
        ["summary", row.summary],
        ["narrative", row.narrative],
      ] as const
    ).forEach(([field, value]) => {
      if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`${where}.${field} must be a non-empty string`);
      }
    });

    // publishedAt
    if (!ISO_DATE_RE.test(row.publishedAt)) {
      throw new Error(
        `${where}.publishedAt must be ISO YYYY-MM-DD; got ${JSON.stringify(row.publishedAt)}`,
      );
    }
    const parsedDate = new Date(`${row.publishedAt}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(
        `${where}.publishedAt is not a real calendar date: ${row.publishedAt}`,
      );
    }
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (parsedDate > tomorrow) {
      throw new Error(
        `${where}.publishedAt is in the future: ${row.publishedAt}`,
      );
    }

    // artifactUrl
    if (
      typeof row.artifactUrl !== "string" ||
      !row.artifactUrl.startsWith("https://")
    ) {
      throw new Error(`${where}.artifactUrl must be an absolute https URL`);
    }
    let parsedArtifact: URL;
    try {
      parsedArtifact = new URL(row.artifactUrl);
    } catch {
      throw new Error(`${where}.artifactUrl is not a valid URL: ${row.artifactUrl}`);
    }
    if (parsedArtifact.pathname === "" || parsedArtifact.pathname === "/") {
      throw new Error(
        `${where}.artifactUrl has an empty path – pick a specific page that proves the change, not a homepage.`,
      );
    }

    // keywords
    if (!Array.isArray(row.keywords) || row.keywords.length === 0) {
      throw new Error(`${where}.keywords must be a non-empty array`);
    }
    row.keywords.forEach((k, ki) => {
      if (typeof k !== "string" || k.trim() === "") {
        throw new Error(`${where}.keywords[${ki}] must be a non-empty string`);
      }
    });

    // optional audio fields
    if (row.audioUrl !== undefined) {
      if (!row.audioUrl.startsWith("https://")) {
        throw new Error(
          `${where}.audioUrl must be absolute https; got ${row.audioUrl}`,
        );
      }
      try {
        const parsed = new URL(row.audioUrl);
        if (parsed.pathname === "" || parsed.pathname === "/") {
          throw new Error(
            `${where}.audioUrl has empty path – not a real enclosure target.`,
          );
        }
      } catch {
        throw new Error(`${where}.audioUrl is malformed: ${row.audioUrl}`);
      }
    }
    if (
      row.audioByteSize !== undefined &&
      (!Number.isInteger(row.audioByteSize) || row.audioByteSize <= 0)
    ) {
      throw new Error(
        `${where}.audioByteSize must be a positive integer; got ${row.audioByteSize}`,
      );
    }
    if (
      row.audioDurationSec !== undefined &&
      (!Number.isInteger(row.audioDurationSec) || row.audioDurationSec <= 0)
    ) {
      throw new Error(
        `${where}.audioDurationSec must be a positive integer; got ${row.audioDurationSec}`,
      );
    }

    // ordering
    if (previousDate !== null && row.publishedAt > previousDate) {
      throw new Error(
        `${where} breaks reverse-chronological order – ${row.publishedAt} comes after ${previousDate}. Insert newer episodes at the top.`,
      );
    }
    previousDate = row.publishedAt;
  });
}

validateEpisodes(PODCAST_EPISODES);

// ---------------------------------------------------------------------------
// RSS 2.0 + iTunes namespace serializer
// ---------------------------------------------------------------------------

/**
 * XML special-character escaper for RSS body text. RSS bodies are not
 * CDATA-wrapped by spec – they accept entity-escaped text. The serializer
 * here is intentionally narrow: it covers the five XML predefined entities
 * and nothing else. Unicode passes through unchanged (UTF-8 declared in
 * the XML prolog), which is what every modern podcast aggregator expects.
 */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Format an ISO date as RFC 822 (pubDate format required by RSS 2.0). */
function rfc822Date(isoDate: string): string {
  // Anchor every episode date at 12:00 UTC so that timezone-shifted
  // readers (Apple Podcasts in particular) never roll the day backward
  // when rendering the publish date.
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

/** ISO 8601 duration helper for itunes:duration (HH:MM:SS form). */
function formatItunesDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/**
 * Build the full RSS 2.0 XML for the podcast feed. Pre-serialized at
 * module load and exported for the route handler – per-request cost is
 * a single string return.
 *
 * Standards compliance:
 *   - RSS 2.0 spec (cyber.harvard.edu/rss/rss.html)
 *   - iTunes Podcast Connect spec (help.apple.com/itc/podcasts_connect/#/itcb54353390)
 *   - Atom self-link (RFC 4287 §4.2.7.2) for IndexNow-style feed
 *     auto-discovery by aggregators.
 */
function buildRssXml(): string {
  const lastBuildDate = new Date().toUTCString();
  const channelLines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"',
    '  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"',
    '  xmlns:atom="http://www.w3.org/2005/Atom"',
    '  xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    '  xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${xmlEscape(PODCAST_SHOW_NAME)}</title>`,
    `    <link>${xmlEscape(PODCAST_URLS.landing)}</link>`,
    `    <atom:link href="${xmlEscape(PODCAST_URLS.rss)}" rel="self" type="application/rss+xml"/>`,
    `    <description>${xmlEscape(PODCAST_SHOW_DESCRIPTION)}</description>`,
    `    <language>${PODCAST_LANGUAGE}</language>`,
    `    <copyright>${xmlEscape(PODCAST_COPYRIGHT)}</copyright>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <generator>unlocksaas.com podcast.ts</generator>`,
    `    <managingEditor>${xmlEscape(ORGANIZATION.email)} (${xmlEscape(FOUNDER.name)})</managingEditor>`,
    `    <webMaster>${xmlEscape(ORGANIZATION.email)} (${xmlEscape(FOUNDER.name)})</webMaster>`,
    `    <itunes:author>${xmlEscape(FOUNDER.name)}</itunes:author>`,
    `    <itunes:owner>`,
    `      <itunes:name>${xmlEscape(FOUNDER.name)}</itunes:name>`,
    `      <itunes:email>${xmlEscape(ORGANIZATION.email)}</itunes:email>`,
    `    </itunes:owner>`,
    `    <itunes:subtitle>${xmlEscape(PODCAST_SHOW_SUBTITLE)}</itunes:subtitle>`,
    `    <itunes:summary>${xmlEscape(PODCAST_SHOW_DESCRIPTION)}</itunes:summary>`,
    `    <itunes:type>${PODCAST_ITUNES_TYPE}</itunes:type>`,
    `    <itunes:explicit>false</itunes:explicit>`,
    `    <itunes:category text="${xmlEscape(PODCAST_ITUNES_CATEGORY)}"/>`,
    `    <itunes:image href="${xmlEscape(PODCAST_ARTWORK_URL)}"/>`,
    `    <image>`,
    `      <url>${xmlEscape(PODCAST_ARTWORK_URL)}</url>`,
    `      <title>${xmlEscape(PODCAST_SHOW_NAME)}</title>`,
    `      <link>${xmlEscape(PODCAST_URLS.landing)}</link>`,
    `    </image>`,
  ];

  for (const ep of PODCAST_EPISODES) {
    const url = episodeUrl(ep.slug);
    const guid = episodeGuid(ep.slug);
    const pubDate = rfc822Date(ep.publishedAt);
    channelLines.push("    <item>");
    channelLines.push(`      <title>${xmlEscape(ep.title)}</title>`);
    channelLines.push(`      <link>${xmlEscape(url)}</link>`);
    channelLines.push(`      <guid isPermaLink="false">${xmlEscape(guid)}</guid>`);
    channelLines.push(`      <pubDate>${pubDate}</pubDate>`);
    channelLines.push(
      `      <dc:creator>${xmlEscape(FOUNDER.name)}</dc:creator>`,
    );
    channelLines.push(`      <description>${xmlEscape(ep.summary)}</description>`);
    // Content-encoded carries the long-form narrative; aggregators that
    // render markdown / HTML show notes use this when present.
    channelLines.push(
      `      <content:encoded><![CDATA[${ep.narrative}\n\nVerifiable artifact: ${ep.artifactUrl}]]></content:encoded>`,
    );
    channelLines.push(
      `      <itunes:title>${xmlEscape(ep.title)}</itunes:title>`,
    );
    channelLines.push(
      `      <itunes:episode>${ep.episodeNumber}</itunes:episode>`,
    );
    channelLines.push(`      <itunes:episodeType>full</itunes:episodeType>`);
    channelLines.push(
      `      <itunes:subtitle>${xmlEscape(ep.summary)}</itunes:subtitle>`,
    );
    channelLines.push(
      `      <itunes:summary>${xmlEscape(ep.narrative)}</itunes:summary>`,
    );
    channelLines.push(
      `      <itunes:author>${xmlEscape(FOUNDER.name)}</itunes:author>`,
    );
    channelLines.push(`      <itunes:explicit>false</itunes:explicit>`);
    channelLines.push(
      `      <itunes:keywords>${xmlEscape(ep.keywords.join(", "))}</itunes:keywords>`,
    );
    channelLines.push(
      `      <itunes:image href="${xmlEscape(PODCAST_ARTWORK_URL)}"/>`,
    );
    // Audio enclosure – only when the per-episode env var resolved.
    if (ep.audioUrl) {
      const mimeType = ep.audioMimeType ?? "audio/mpeg";
      const lengthAttr =
        ep.audioByteSize !== undefined ? ` length="${ep.audioByteSize}"` : "";
      channelLines.push(
        `      <enclosure url="${xmlEscape(ep.audioUrl)}" type="${xmlEscape(mimeType)}"${lengthAttr}/>`,
      );
      if (ep.audioDurationSec !== undefined) {
        channelLines.push(
          `      <itunes:duration>${formatItunesDuration(ep.audioDurationSec)}</itunes:duration>`,
        );
      }
    }
    channelLines.push("    </item>");
  }

  channelLines.push("  </channel>");
  channelLines.push("</rss>");
  return channelLines.join("\n");
}

/** Pre-serialized at module load. The route handler returns this verbatim. */
export const PODCAST_RSS_XML: string = buildRssXml();

// ---------------------------------------------------------------------------
// JSON-LD payload builders (consumed by app/podcast pages)
// ---------------------------------------------------------------------------

/**
 * Builds a single PodcastEpisode JSON-LD payload for a given episode.
 * Resolves the partOfSeries cross-reference to the same @id the
 * PodcastSeriesJsonLd in components/seo/json-ld.tsx emits, so the schema
 * graph is one connected entity, not two.
 *
 * AudioObject is included only when the episode's audioUrl env var
 * resolved. Without it, the episode is structurally a "show notes only"
 * announcement – still a valid PodcastEpisode per schema.org, still
 * Rich-Result eligible for non-audio podcast surfaces (Google Podcasts
 * deprecated 2024, but Spotify, Apple Podcasts, and the AI ingestion
 * pipelines still consume the schema).
 */
export function buildPodcastEpisodeJson(ep: PodcastEpisode): string {
  const url = episodeUrl(ep.slug);
  const associatedMedia = ep.audioUrl
    ? {
        "@type": "AudioObject",
        contentUrl: ep.audioUrl,
        encodingFormat: ep.audioMimeType ?? "audio/mpeg",
        ...(ep.audioDurationSec !== undefined
          ? { duration: `PT${ep.audioDurationSec}S` }
          : {}),
        uploadDate: ep.publishedAt,
        inLanguage: "en-US",
      }
    : undefined;
  const payload = {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    "@id": episodeGuid(ep.slug),
    url,
    name: ep.title,
    headline: ep.title,
    description: ep.summary,
    abstract: ep.narrative,
    datePublished: ep.publishedAt,
    inLanguage: "en-US",
    episodeNumber: ep.episodeNumber,
    keywords: ep.keywords.join(", "),
    partOfSeries: { "@id": `${BASE_URL}/#podcast` },
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    creator: { "@id": ID.person },
    isBasedOn: ep.artifactUrl,
    ...(associatedMedia ? { associatedMedia } : {}),
  };
  return JSON.stringify(payload);
}

/**
 * Builds the PodcastSeries JSON-LD anchored on the canonical first-party
 * feed. Unlike PodcastSeriesJsonLd in components/seo/json-ld.tsx (which
 * gates on NEXT_PUBLIC_PODCAST_FEED_URL and stays null otherwise), this
 * variant ALWAYS emits because the feed lives at /feed/podcast.rss – an
 * internal, always-present route. Use this on /podcast (the show's own
 * hub page); the env-gated PodcastSeriesJsonLd remains the right call
 * on /press for cross-surface visibility when an external aggregator
 * mirror lives.
 */
export function buildPodcastSeriesJson(): string {
  const payload = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    "@id": `${BASE_URL}/#podcast`,
    name: PODCAST_SHOW_NAME,
    description: PODCAST_SHOW_DESCRIPTION,
    url: PODCAST_URLS.landing,
    webFeed: PODCAST_URLS.rss,
    inLanguage: "en-US",
    image: PODCAST_ARTWORK_URL,
    publisher: { "@id": ID.organization },
    author: { "@id": ID.person },
    creator: { "@id": ID.person },
    about: [
      {
        "@type": "Thing",
        name: "Indie SaaS Teardowns dataset changelog",
      },
      {
        "@type": "Thing",
        name: "Post-launch pre-revenue SaaS founder activation",
      },
    ],
    keywords: [
      "dataset",
      "changelog",
      "indie SaaS",
      "Brunson",
      "CC-BY-4.0",
      "JSON-LD",
    ].join(", "),
    numberOfEpisodes: PODCAST_EPISODES.length,
  };
  return JSON.stringify(payload);
}
