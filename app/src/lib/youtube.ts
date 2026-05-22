/**
 * The Founder's Diary — YouTube episode registry.
 *
 * Source of truth for the /youtube hub page and any later transcript or
 * episode-detail surfaces. Mirrors the discipline of `lib/podcasts.ts`
 * (which the strategy doc planned but is not yet shipped): typed shape,
 * validated at module load, honest empty state pre-launch.
 *
 * The 30-episode backlog spec lives in strategy/youtube-founders-diary-
 * backlog.md. Episodes graduate from that doc into this registry only
 * after the operator (Maryan) actually publishes them on YouTube — never
 * before. The Brunson Hard-Rule from workbook 09 applies: no fake counts,
 * no invented past episodes, status flipped to "live" manually.
 *
 * UTM convention (see strategy/youtube-faceless-channel.md §6):
 *   utm_source=youtube
 *   utm_medium=video        (description CTA)
 *   utm_campaign=founders-diary
 *   utm_content=ep<NN>      (zero-padded)
 *
 * See also:
 *   - strategy/youtube-faceless-channel.md            (channel spec)
 *   - strategy/youtube-founders-diary-backlog.md      (30-episode arc)
 *   - strategy/youtube-production-runbook.md          (per-episode workflow)
 */

export type BrunsonBeat = "hook" | "story" | "offer" | "polarity" | "proof";

export type EpisodeStatus = "draft" | "voiced" | "cut" | "scheduled" | "live";

export type FoundersDiaryEpisode = {
  /** Permanent id, e.g. "E07". Used as the React key + becomes the utm_content stem. */
  id: string;
  /** Zero-padded episode number, e.g. 7 → "ep07". Matches utm_content. */
  utm_content: string;
  /** Episode number as integer for sorting. */
  number: number;
  /** Full episode title (without the "E07 ·" prefix; the UI renders that). */
  title: string;
  /** First 3 seconds of voice-over. Renders as the visible card description. */
  hook_3s: string;
  /** Which Brunson beat the episode lands. */
  brunson_beat: BrunsonBeat;
  /** Target length in seconds (4–7 min per the channel spec). */
  length_target_seconds: number;
  /** ISO-8601 UTC publish target. */
  publish_at: string;
  /** Manual lifecycle flag. Only "live" episodes render their YouTube URL. */
  status: EpisodeStatus;
  /** Set ONLY once status === "live" and operator confirms the URL is up. */
  youtube_url?: string;
  /**
   * Long-form body copy for the /youtube/[slug] episode page. Renders as
   * the article lede under the embed; the hub page only uses hook_3s. Plain
   * text or short markdown; multi-paragraph supported (split on \n\n at
   * render time). Optional pre-launch; required-ish post-launch because
   * the episode page without it falls back to hook_3s and looks thin.
   *
   * Brunson Hard-Rule: never auto-generated. Operator writes this as the
   * publish-day artifact. The runbook step is "paste the script abstract,
   * not the full script".
   */
  long_description?: string;
  /**
   * Full episode transcript. The single most valuable SEO asset on the
   * page — a 5-minute episode at ~150wpm = ~750 words of indexable, AEO-
   * citable content. Render inline under <details> so the page weight
   * stays sane for users who do not expand it.
   *
   * Format: plain text with paragraph breaks. NOT markdown — the renderer
   * is intentionally dumb so the operator can paste from Descript or
   * YouTube auto-caption export without massaging.
   */
  transcript?: string;
  /**
   * Per-episode keyword overrides for Article + VideoObject JSON-LD. If
   * omitted, the channel-level keywords ladder is used. Use for episodes
   * that anchor an unusual long-tail term ("lovable landing page rewrite",
   * "stripe customer portal first config") that the default ladder misses.
   */
  keywords?: readonly string[];
};

/**
 * Live episodes. Empty at launch — the /youtube page renders an honest
 * "we ship the first episode after these gates close" state.
 *
 * DO NOT add an entry here speculatively. The operator promotes an episode
 * from `strategy/youtube-founders-diary-backlog.md` into this array on
 * publish day, not before.
 */
export const FOUNDERS_DIARY_EPISODES: ReadonlyArray<FoundersDiaryEpisode> = [];

const CAMPAIGN = "founders-diary";
const SOURCE = "youtube";

/**
 * Build the canonical CTA URL for an episode's description card. Centralised
 * here so every surface (hub page, episode detail, repurpose threads) emits
 * the same UTM stamp without copy-paste drift.
 */
export function episodeDiagnosticUrl(utmContent: string): string {
  const params = new URLSearchParams({
    utm_source: SOURCE,
    utm_medium: "video",
    utm_campaign: CAMPAIGN,
    utm_content: utmContent,
  });
  return `/diagnostic?${params.toString()}`;
}

/**
 * Hub-page CTA (visitors who land on /youtube directly, not from an episode).
 */
export function hubDiagnosticUrl(): string {
  return episodeDiagnosticUrl("hub");
}

/**
 * Channel-level metadata. Kept in code (not env) because it is part of the
 * brand surface, not an operator secret. Change here triggers a real
 * commit + diff in code review.
 */
export const FOUNDERS_DIARY_CHANNEL = {
  name: "The Founder's Diary",
  tagline: "$0 to first paying customer, in public, in real time.",
  description:
    "The public log of a non-engineer founder going from $0 to his first verified paying customer. Two short episodes a week. No talking-head, no fake urgency, no neon. Just the work, screen-recorded.",
  cadence: "Tuesday + Friday",
  total_episodes_planned: 30,
  hub_path: "/youtube",
} as const;

/**
 * Title slug helper. Lowercased, hyphen-separated, ASCII-only, capped at
 * 60 characters so the URL stays grep-friendly. Always prefixed with the
 * lowercased episode id so two episodes that happen to share a title-stub
 * (e.g. two parts of a Part 1 / Part 2 arc with the same root) never
 * collide on the URL.
 *
 * Example: id="E07", title="Build the machine in public" →
 *   "e07-build-the-machine-in-public"
 *
 * Slugs are derived, not stored. That means the operator never hand-edits
 * a slug, and renaming an episode title automatically renames the URL —
 * which is fine pre-publish but a hard 301 surface after publish. See the
 * runbook for the redirect protocol if a published title is renamed.
 */
export function episodeSlug(ep: Pick<FoundersDiaryEpisode, "id" | "title">): string {
  const titlePart = ep.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return titlePart.length > 0
    ? `${ep.id.toLowerCase()}-${titlePart}`
    : ep.id.toLowerCase();
}

/**
 * Lookup by slug. Used by the [slug] route's generateStaticParams +
 * notFound() resolver. Returns undefined when the slug is unknown, when
 * the episode is not yet live, or when the slug drifted (rare; only if
 * the operator renamed a title without 301-ing the old slug).
 */
export function getLiveEpisodeBySlug(
  slug: string,
): FoundersDiaryEpisode | undefined {
  return liveEpisodes().find((ep) => episodeSlug(ep) === slug);
}

/**
 * Pull the 11-char YouTube video id out of any of the common url shapes:
 *   https://youtu.be/VIDEOID
 *   https://www.youtube.com/watch?v=VIDEOID
 *   https://www.youtube.com/embed/VIDEOID
 *   https://m.youtube.com/watch?v=VIDEOID
 *
 * Returns null if the url is shaped unexpectedly — the page-side caller
 * then falls back to a "Watch on YouTube" link without an embed, rather
 * than rendering a broken iframe.
 */
export function extractYouTubeId(url: string): string | null {
  const patterns: readonly RegExp[] = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m && m[1]) return m[1];
  }
  return null;
}

/**
 * Privacy-enhanced embed url. Uses youtube-nocookie.com so no cookies hit
 * the visitor's browser until they actually press play. Mirrors the
 * recommendation in the YouTube Embedded Player help docs.
 */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/**
 * Canonical thumbnail url. maxresdefault.jpg is the largest available size
 * (1280x720); YouTube falls back to hqdefault.jpg automatically on the
 * CDN side if maxres was not generated for very short videos, so this
 * url is safe to use unconditionally.
 */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * ISO 8601 duration format ("PT4M30S") for VideoObject.duration. The
 * length_target_seconds is the planned length, not the cut length; if
 * those drift the operator updates length_target_seconds on the
 * registry entry at promote-to-live time so the schema stays honest.
 */
export function isoDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `PT${m}M${s}S`;
}

/**
 * Validate the registry shape at module load (matches the pattern the
 * link-registry spec calls out in strategy/state.json). Fails the build
 * loudly if anyone hand-edits an entry into an invalid state.
 */
function validateRegistry(): void {
  const seen = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const ep of FOUNDERS_DIARY_EPISODES) {
    if (seen.has(ep.id)) {
      throw new Error(`[youtube] duplicate episode id: ${ep.id}`);
    }
    seen.add(ep.id);
    const slug = episodeSlug(ep);
    if (seenSlugs.has(slug)) {
      throw new Error(
        `[youtube] duplicate episode slug "${slug}" produced by ${ep.id}; rename the title or rework the slug helper`,
      );
    }
    seenSlugs.add(slug);
    if (!/^E\d{2}$/.test(ep.id)) {
      throw new Error(
        `[youtube] episode id must match /^E\\d{2}$/ — got "${ep.id}"`,
      );
    }
    if (ep.utm_content !== `ep${String(ep.number).padStart(2, "0")}`) {
      throw new Error(
        `[youtube] utm_content drift for ${ep.id}: expected ep${String(
          ep.number,
        ).padStart(2, "0")}, got "${ep.utm_content}"`,
      );
    }
    if (ep.status === "live" && !ep.youtube_url) {
      throw new Error(
        `[youtube] episode ${ep.id} is marked live but has no youtube_url`,
      );
    }
    if (ep.status !== "live" && ep.youtube_url) {
      throw new Error(
        `[youtube] episode ${ep.id} has a youtube_url but status is "${ep.status}" — flip status to "live" or remove the url`,
      );
    }
    if (
      ep.length_target_seconds < 120 ||
      ep.length_target_seconds > 900
    ) {
      throw new Error(
        `[youtube] episode ${ep.id} length_target_seconds outside the 2–15 min sanity window: ${ep.length_target_seconds}`,
      );
    }
  }
}

validateRegistry();

/**
 * Only episodes the operator has confirmed are live on YouTube. Hub page
 * iterates this; pre-launch it is empty and the hub renders the honest
 * "shipping after these gates close" state.
 */
export function liveEpisodes(): ReadonlyArray<FoundersDiaryEpisode> {
  return FOUNDERS_DIARY_EPISODES.filter((ep) => ep.status === "live");
}

/**
 * Slug-form sentinel returned by buildEpisodeStaticParams() when the
 * registry has zero live episodes. The page resolver calls notFound() for
 * any slug that does not resolve to a real live episode, so this slug
 * 404s at runtime — it exists only to satisfy Next 16's Cache Components
 * requirement that generateStaticParams return at least one entry.
 *
 * Visible only as a 404 page; never linked from anywhere on the site
 * (sitemap iterates liveEpisodes() directly, not buildEpisodeStaticParams).
 */
const EMPTY_EPISODES_SENTINEL_SLUG = "_no-episodes-yet" as const;

/**
 * Single source of truth for the [slug] route's generateStaticParams.
 * Returns one entry per live episode; falls back to a single sentinel slug
 * when the registry is empty so the build does not crash on the Cache
 * Components empty-array guard. Used by both page.tsx and
 * opengraph-image.tsx so the two stay in lock-step.
 */
export function buildEpisodeStaticParams(): Array<{ slug: string }> {
  const live = liveEpisodes();
  if (live.length === 0) {
    return [{ slug: EMPTY_EPISODES_SENTINEL_SLUG }];
  }
  return live.map((ep) => ({ slug: episodeSlug(ep) }));
}
