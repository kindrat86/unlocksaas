/**
 * Marco's Diary — YouTube episode registry.
 *
 * Source of truth for the /youtube hub page and any later transcript or
 * episode-detail surfaces. Mirrors the discipline of `lib/podcasts.ts`
 * (which the strategy doc planned but is not yet shipped): typed shape,
 * validated at module load, honest empty state pre-launch.
 *
 * The 30-episode backlog spec lives in strategy/youtube-marcos-diary-
 * backlog.md. Episodes graduate from that doc into this registry only
 * after the operator (Maryan) actually publishes them on YouTube — never
 * before. The Brunson Hard-Rule from workbook 09 applies: no fake counts,
 * no invented past episodes, status flipped to "live" manually.
 *
 * UTM convention (see strategy/youtube-faceless-channel.md §6):
 *   utm_source=youtube
 *   utm_medium=video        (description CTA)
 *   utm_campaign=marcos-diary
 *   utm_content=ep<NN>      (zero-padded)
 *
 * See also:
 *   - strategy/youtube-faceless-channel.md            (channel spec)
 *   - strategy/youtube-marcos-diary-backlog.md        (30-episode arc)
 *   - strategy/youtube-production-runbook.md          (per-episode workflow)
 */

export type BrunsonBeat = "hook" | "story" | "offer" | "polarity" | "proof";

export type EpisodeStatus = "draft" | "voiced" | "cut" | "scheduled" | "live";

export type MarcosDiaryEpisode = {
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
};

/**
 * Live episodes. Empty at launch — the /youtube page renders an honest
 * "we ship the first episode after these gates close" state.
 *
 * DO NOT add an entry here speculatively. The operator promotes an episode
 * from `strategy/youtube-marcos-diary-backlog.md` into this array on
 * publish day, not before.
 */
export const MARCOS_DIARY_EPISODES: ReadonlyArray<MarcosDiaryEpisode> = [];

const CAMPAIGN = "marcos-diary";
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
export const MARCOS_DIARY_CHANNEL = {
  name: "Marco's Diary",
  tagline: "$0 to first paying customer, in public, in real time.",
  description:
    "The public log of a non-engineer founder going from $0 to his first verified paying customer. Two short episodes a week. No talking-head, no fake urgency, no neon. Just the work, screen-recorded.",
  cadence: "Tuesday + Friday",
  total_episodes_planned: 30,
  hub_path: "/youtube",
} as const;

/**
 * Validate the registry shape at module load (matches the pattern the
 * link-registry spec calls out in strategy/state.json). Fails the build
 * loudly if anyone hand-edits an entry into an invalid state.
 */
function validateRegistry(): void {
  const seen = new Set<string>();
  for (const ep of MARCOS_DIARY_EPISODES) {
    if (seen.has(ep.id)) {
      throw new Error(`[youtube] duplicate episode id: ${ep.id}`);
    }
    seen.add(ep.id);
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
export function liveEpisodes(): ReadonlyArray<MarcosDiaryEpisode> {
  return MARCOS_DIARY_EPISODES.filter((ep) => ep.status === "live");
}
