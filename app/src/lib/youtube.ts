/**
 * The Founder's Diary — YouTube episode registry.
 *
 * Source of truth for the /youtube hub page and the per-episode landing
 * pages at /youtube/[episode-slug]. Mirrors the discipline of
 * `lib/podcasts.ts` (typed shape, validated at module load, honest
 * scheduled-vs-live state pre-launch).
 *
 * The 30-episode backlog spec lives in strategy/youtube-founders-diary-
 * backlog.md. Each entry below mirrors that doc one-to-one, neutralized
 * of internal production notes (spine, b-roll, dream-customer first name)
 * per [[feedback_no_dream_customer_name_in_public_copy]].
 *
 * Lifecycle (Brunson Hard-Rule from workbook 09: no fake counts, no
 * invented past episodes, status flipped to "live" manually):
 *   - All 30 entries ship at status "draft" — the per-episode page
 *     renders an honest "scheduled, not yet aired" state with the hook,
 *     Brunson beat, phase, and diagnostic CTA. Indexable URL ahead of
 *     publish without claiming the episode is live.
 *   - When an episode actually airs on YouTube, the operator (Maryan)
 *     edits THE EXISTING entry in place: status → "live", add
 *     youtube_url, add publish_at (ISO), optionally add transcript +
 *     key_takeaways. The slug, id, number, utm_content stay frozen as
 *     permanent attribution keys.
 *   - liveEpisodes() keeps its existing semantics (status === "live"),
 *     so the hub page renders the same honest empty-state pre-launch.
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

import { BASE_URL } from "@/lib/seo/entity";

export type BrunsonBeat = "hook" | "story" | "offer" | "polarity" | "proof";

export type EpisodeStatus = "draft" | "voiced" | "cut" | "scheduled" | "live";

/**
 * Arc phase. Maps to the 5-block structure in
 * strategy/youtube-founders-diary-backlog.md:
 *   1 = Setup (E01–E05)
 *   2 = Doing The Machine (E06–E15)
 *   3 = Outreach + objection-handling (E16–E25)
 *   4 = Cycle closes / cycle fails (E26–E29)
 *   5 = First Paying Customer Verified (E30, HELD)
 */
export type FoundersDiaryPhase = 1 | 2 | 3 | 4 | 5;

export type FoundersDiaryEpisode = {
  /** Permanent id, e.g. "E07". Used as the React key + becomes the utm_content stem. */
  id: string;
  /** Zero-padded episode number, e.g. 7 → "ep07". Matches utm_content. */
  utm_content: string;
  /** Episode number as integer for sorting. */
  number: number;
  /**
   * URL slug. e.g. "e07-the-irresistible-offer-mine-wasnt".
   * Format: /^e\d{2}-[a-z0-9](-?[a-z0-9])*$/. Frozen as a permanent
   * attribution key — never edit the slug of a published episode.
   */
  slug: string;
  /** Full episode title (without the "E07 ·" prefix; the UI renders that). */
  title: string;
  /** First 3 seconds of voice-over. Renders as the visible card description. */
  hook_3s: string;
  /** Which Brunson beat the episode lands. */
  brunson_beat: BrunsonBeat;
  /** Arc phase (1–5). Used for per-episode page context + sectioning. */
  phase: FoundersDiaryPhase;
  /** Target length in seconds (4–7 min per the channel spec). */
  length_target_seconds: number;
  /**
   * ISO-8601 UTC publish target. Required when status === "live".
   * Pre-live entries omit this — no fake schedule dates.
   */
  publish_at?: string;
  /** Manual lifecycle flag. Only "live" episodes render their YouTube URL. */
  status: EpisodeStatus;
  /** Set ONLY once status === "live" and operator confirms the URL is up. */
  youtube_url?: string;
  /**
   * Inline verbatim transcript (markdown allowed). Surfaced on the
   * per-episode page only when status === "live" and the operator has
   * uploaded the cut. Strongest signal for AEO citations + voice-engine
   * readouts (see strategy/google-strategy.md §AEO). Brunson Hard-Rule:
   * never auto-synthesise a transcript before the cut is in the can.
   */
  transcript?: string;
  /**
   * Spoken-style takeaways (3–5 entries). Renders below the transcript
   * on live pages. Optional even for live episodes — surface only the
   * ones the operator hand-edits from the cut.
   */
  key_takeaways?: ReadonlyArray<string>;
};

const CAMPAIGN = "founders-diary";
const SOURCE = "youtube";

/**
 * Default target length when an episode doesn't explicitly call out one
 * in the backlog doc. 6 minutes lands inside the 4–7 min channel spec
 * window (see strategy/youtube-faceless-channel.md §3).
 */
const DEFAULT_LENGTH_SECONDS = 360;

/**
 * The 30-episode backlog manifest. One entry per episode in
 * strategy/youtube-founders-diary-backlog.md. All start at status
 * "draft" pre-launch; the operator edits in place to flip an entry
 * to "live" with youtube_url + publish_at + (optional) transcript.
 *
 * Title and hook_3s mirror the backlog doc verbatim. Spine and b-roll
 * intentionally do NOT surface here — those are production notes that
 * reference the internal dream-customer first name and would violate
 * [[feedback_no_dream_customer_name_in_public_copy]] if exposed.
 */
export const FOUNDERS_DIARY_EPISODES: ReadonlyArray<FoundersDiaryEpisode> = [
  // --- Phase 1: Setup (E01–E05) ----------------------------------------
  {
    id: "E01",
    number: 1,
    utm_content: "ep01",
    slug: "e01-i-shipped-six-products-none-paying",
    title: "I shipped six products. None of them have a paying customer.",
    hook_3s: "Six products. Zero paying customers. I stopped opening Stripe.",
    brunson_beat: "hook",
    phase: 1,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E02",
    number: 2,
    utm_content: "ep02",
    slug: "e02-i-took-my-own-90-second-diagnostic",
    title:
      "I took my own 90-second diagnostic. It said 'Weak Offer.' I disagreed.",
    hook_3s:
      "The tool said my offer was weak. I built the tool. I was furious.",
    brunson_beat: "story",
    phase: 1,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E03",
    number: 3,
    utm_content: "ep03",
    slug: "e03-the-most-expensive-sentence-a-founder-says",
    title:
      "The most expensive sentence a founder ever says: 'The problem is the product.'",
    hook_3s: "I said this for nine months. It cost me nine months.",
    brunson_beat: "polarity",
    phase: 1,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E04",
    number: 4,
    utm_content: "ep04",
    slug: "e04-the-day-i-deleted-my-features-page",
    title: "The day I deleted my features page.",
    hook_3s:
      "I deleted the features page. The conversion rate doubled. From 0.2 to 0.4.",
    brunson_beat: "proof",
    phase: 1,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E05",
    number: 5,
    utm_content: "ep05",
    slug: "e05-the-avatar-exercise-that-broke-me",
    title: "The avatar exercise that broke me (and how it un-broke the offer).",
    hook_3s:
      "I wrote my avatar's name on a sticky note. It's been on my monitor for eight months.",
    brunson_beat: "story",
    phase: 1,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },

  // --- Phase 2: Doing The Machine (E06–E15) ----------------------------
  {
    id: "E06",
    number: 6,
    utm_content: "ep06",
    slug: "e06-the-first-time-i-said-no-to-founders",
    title: "Step 1: pin the customer. The first time I said no to 'founders.'",
    hook_3s:
      "I tried to sell to 'founders' for a year. 'Founders' is not a person.",
    brunson_beat: "story",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E07",
    number: 7,
    utm_content: "ep07",
    slug: "e07-the-irresistible-offer-mine-wasnt",
    title: "Step 2: the irresistible offer. Mine wasn't.",
    hook_3s:
      "My offer was: pay me, maybe it'll help. That's not an offer.",
    brunson_beat: "story",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E08",
    number: 8,
    utm_content: "ep08",
    slug: "e08-the-guarantee-i-was-scared-to-write",
    title: "The guarantee I was scared to write.",
    hook_3s:
      "If I refund every founder who doesn't get a customer, I will refund every founder.",
    brunson_beat: "polarity",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E09",
    number: 9,
    utm_content: "ep09",
    slug: "e09-writing-the-hook-when-you-are-not-a-copywriter",
    title: "Step 3: writing the hook when you are not a copywriter.",
    hook_3s:
      "I am a non-engineer who is also not a copywriter. I wrote the hook anyway.",
    brunson_beat: "hook",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E10",
    number: 10,
    utm_content: "ep10",
    slug: "e10-the-page-i-almost-shipped-the-page-i-shipped",
    title: "The page I almost shipped. The page I shipped.",
    hook_3s: "I almost shipped the version with the buzzwords.",
    brunson_beat: "proof",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E11",
    number: 11,
    utm_content: "ep11",
    slug: "e11-building-the-target-list-100-people",
    title:
      "Step 4: building the target list. (Or: how to find 100 people who feel exactly like the founder.)",
    hook_3s: "Dream 100 sounded like a brag. It's just a spreadsheet.",
    brunson_beat: "story",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E12",
    number: 12,
    utm_content: "ep12",
    slug: "e12-the-dm-i-rewrote-14-times",
    title: "The DM I rewrote 14 times.",
    hook_3s: "Fourteen drafts. The fourteenth was twelve words.",
    brunson_beat: "story",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E13",
    number: 13,
    utm_content: "ep13",
    slug: "e13-send-the-dm-the-step-the-founder-avoids",
    title: "Step 5: send the DM. (The step the founder avoids.)",
    hook_3s:
      "This is the step everyone skips. Including me. Until today.",
    brunson_beat: "story",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E14",
    number: 14,
    utm_content: "ep14",
    slug: "e14-the-first-reply-not-interested-felt-like-winning",
    title: "The first reply: 'Not interested.' It felt like winning.",
    hook_3s: "First reply: no. I have never been so relieved.",
    brunson_beat: "story",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E15",
    number: 15,
    utm_content: "ep15",
    slug: "e15-the-first-paid-lead-magnet-i-rejected",
    title:
      "The first paid lead magnet I rejected. (Why a free diagnostic beats every $7 trip-wire.)",
    hook_3s:
      "$7 trip-wires don't filter the founder. The diagnostic does.",
    brunson_beat: "polarity",
    phase: 2,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },

  // --- Phase 3: Outreach + objection-handling (E16–E25) ----------------
  {
    id: "E16",
    number: 16,
    utm_content: "ep16",
    slug: "e16-the-i-cant-afford-it-objection",
    title: "The 'I can't afford it' objection. The real one underneath it.",
    hook_3s:
      "When they say 'I can't afford it,' they mean 'I don't believe it'll work.'",
    brunson_beat: "story",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E17",
    number: 17,
    utm_content: "ep17",
    slug: "e17-the-20-dm-week-19-nos-one-reply",
    title: "The 20-DM week. 19 nos. 1 reply that changed the page.",
    hook_3s:
      "Twenty messages. Nineteen ignored or no'd. The 20th rewrote my hero.",
    brunson_beat: "story",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E18",
    number: 18,
    utm_content: "ep18",
    slug: "e18-the-follow-up-that-doubled-my-reply-rate",
    title:
      "The follow-up that doubled my reply rate. (Spoiler: it's one sentence.)",
    hook_3s: "One sentence. Sent six days later. Reply rate doubled.",
    brunson_beat: "proof",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E19",
    number: 19,
    utm_content: "ep19",
    slug: "e19-the-objection-i-couldnt-handle",
    title: "The objection I couldn't handle (and what I did instead).",
    hook_3s:
      "They said the thing I had no answer for. I sent the diagnostic link.",
    brunson_beat: "polarity",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E20",
    number: 20,
    utm_content: "ep20",
    slug: "e20-the-dm-i-deleted-three-minutes-after-sending",
    title: "The DM I deleted three minutes after sending.",
    hook_3s: "I sent it. Then I uninstalled X for the night.",
    brunson_beat: "story",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E21",
    number: 21,
    utm_content: "ep21",
    slug: "e21-day-30-stripe-still-flat",
    title: "Day 30. Stripe still flat. (Showing the screenshot anyway.)",
    hook_3s: "Day 30. Zero. Showing it anyway.",
    brunson_beat: "proof",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E22",
    number: 22,
    utm_content: "ep22",
    slug: "e22-the-friend-who-told-me-to-lower-the-price",
    title: "The friend who told me to 'just lower the price.' Why I didn't.",
    hook_3s: "He said drop to $19. I didn't. Here's why $49 is the line.",
    brunson_beat: "polarity",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E23",
    number: 23,
    utm_content: "ep23",
    slug: "e23-the-competitor-i-keep-losing-to",
    title:
      "The competitor I keep losing to. (And the one feature I will never copy.)",
    hook_3s:
      "They have a feature I will never ship. That's why I will eventually win.",
    brunson_beat: "polarity",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E24",
    number: 24,
    utm_content: "ep24",
    slug: "e24-the-third-conversation-felt-like-a-sale",
    title: "The third real conversation. The first one that felt like a sale.",
    hook_3s: "Third conversation. First time I forgot I was selling.",
    brunson_beat: "story",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E25",
    number: 25,
    utm_content: "ep25",
    slug: "e25-the-day-someone-asked-for-the-link",
    title: "The day someone asked for the link without me sending it.",
    hook_3s:
      "He asked for the link. I had not pasted it. That's the moment the loop closes.",
    brunson_beat: "proof",
    phase: 3,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },

  // --- Phase 4: Cycle closes / cycle fails (E26–E29) -------------------
  {
    id: "E26",
    number: 26,
    utm_content: "ep26",
    slug: "e26-the-kill-list-three-things-i-am-cutting",
    title: "The kill list. Three things I am cutting this week.",
    hook_3s: "Three things. All my ideas. All cut.",
    brunson_beat: "polarity",
    phase: 4,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E27",
    number: 27,
    utm_content: "ep27",
    slug: "e27-the-email-that-brought-back-a-paused-subscriber",
    title: "The single email that brought back a paused subscriber.",
    hook_3s: "One email. One paused founder. Re-engaged.",
    brunson_beat: "story",
    phase: 4,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E28",
    number: 28,
    utm_content: "ep28",
    slug: "e28-why-i-am-not-running-ads",
    title:
      "Why I am not running ads. (Even though every 'growth' person is yelling at me.)",
    hook_3s: "Ads at $0 MRR is renting failure. I'm not running ads.",
    brunson_beat: "polarity",
    phase: 4,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
  {
    id: "E29",
    number: 29,
    utm_content: "ep29",
    slug: "e29-the-post-that-hit-100k-impressions",
    title: "The post that hit 100k impressions. The opt-ins it didn't get.",
    hook_3s: "100k impressions. 11 opt-ins. Vanity ≠ traffic you own.",
    brunson_beat: "proof",
    phase: 4,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },

  // --- Phase 5: First Paying Customer Verified (E30, HELD) -------------
  {
    id: "E30",
    number: 30,
    utm_content: "ep30",
    slug: "e30-the-stripe-ping-ive-been-waiting-for",
    title: "The Stripe ping I have been waiting nine months for.",
    hook_3s: "Stripe pinged at 4:14am. I cried at 4:15.",
    brunson_beat: "proof",
    phase: 5,
    length_target_seconds: DEFAULT_LENGTH_SECONDS,
    status: "draft",
  },
];

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
 * Per-episode page URL. Centralised so the slug → URL contract is enforced
 * at the type level (not via string concat scattered across the codebase).
 */
export function episodePath(ep: Pick<FoundersDiaryEpisode, "slug">): string {
  return `/youtube/${ep.slug}`;
}

/**
 * Absolute canonical URL for an episode landing page. JSON-LD nodes and
 * sitemap entries want the BASE_URL-prefixed form; in-page <Link href>
 * keeps using `episodePath` for relative routing.
 */
export function episodeUrl(ep: Pick<FoundersDiaryEpisode, "slug">): string {
  return `${BASE_URL}${episodePath(ep)}`;
}

/**
 * Per-episode transcript page path. Sibling URL under /youtube/<slug>/
 * mirroring the /podcast/<slug>/transcript pattern. Exists as a second
 * indexable surface per video so VideoObject.transcript can resolve to a
 * real URL (highest-leverage AEO signal once an episode actually publishes).
 *
 * Brunson Hard-Rule: the route returns notFound() unless the episode is
 * status="live" AND has a populated transcript field. No empty transcript
 * pages.
 */
export function episodeTranscriptPath(
  ep: Pick<FoundersDiaryEpisode, "slug">,
): string {
  return `/youtube/${ep.slug}/transcript`;
}

export function episodeTranscriptUrl(
  ep: Pick<FoundersDiaryEpisode, "slug">,
): string {
  return `${BASE_URL}${episodeTranscriptPath(ep)}`;
}

/**
 * Markdown twin of the transcript page. Same body, served with
 * `Content-Type: text/markdown` for LLM retrievers + citation managers.
 * Mirrors /podcast/<slug>/transcript/md.
 */
export function episodeTranscriptMdPath(
  ep: Pick<FoundersDiaryEpisode, "slug">,
): string {
  return `/youtube/${ep.slug}/transcript/md`;
}

export function episodeTranscriptMdUrl(
  ep: Pick<FoundersDiaryEpisode, "slug">,
): string {
  return `${BASE_URL}${episodeTranscriptMdPath(ep)}`;
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
 * Human-readable phase label. Used on per-episode pages for arc context.
 */
export function phaseLabel(phase: FoundersDiaryPhase): string {
  switch (phase) {
    case 1:
      return "Phase 1 · Setup";
    case 2:
      return "Phase 2 · Doing The Machine";
    case 3:
      return "Phase 3 · Outreach + objection-handling";
    case 4:
      return "Phase 4 · Cycle closes / cycle fails";
    case 5:
      return "Phase 5 · First Paying Customer Verified";
  }
}

/**
 * Validate the registry shape at module load (matches the pattern the
 * link-registry spec calls out in strategy/state.json). Fails the build
 * loudly if anyone hand-edits an entry into an invalid state.
 */
function validateRegistry(): void {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const seenNumbers = new Set<number>();
  for (const ep of FOUNDERS_DIARY_EPISODES) {
    if (seenIds.has(ep.id)) {
      throw new Error(`[youtube] duplicate episode id: ${ep.id}`);
    }
    seenIds.add(ep.id);
    if (seenSlugs.has(ep.slug)) {
      throw new Error(`[youtube] duplicate episode slug: ${ep.slug}`);
    }
    seenSlugs.add(ep.slug);
    if (seenNumbers.has(ep.number)) {
      throw new Error(`[youtube] duplicate episode number: ${ep.number}`);
    }
    seenNumbers.add(ep.number);
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
    // Slug format: e<NN>-<kebab>. Anchors the slug to the episode number
    // so cross-references stay coherent if a title ever rewords.
    const expectedSlugPrefix = `e${String(ep.number).padStart(2, "0")}-`;
    if (!ep.slug.startsWith(expectedSlugPrefix)) {
      throw new Error(
        `[youtube] slug must start with "${expectedSlugPrefix}" for ${ep.id} — got "${ep.slug}"`,
      );
    }
    if (!/^[a-z0-9-]+$/.test(ep.slug) || ep.slug.includes("--") ||
        ep.slug.endsWith("-")) {
      throw new Error(
        `[youtube] slug must be kebab-case (lowercase a-z, 0-9, single dashes, no trailing dash) — got "${ep.slug}"`,
      );
    }
    if (ep.phase < 1 || ep.phase > 5) {
      throw new Error(
        `[youtube] phase must be 1–5 for ${ep.id} — got ${ep.phase}`,
      );
    }
    if (ep.status === "live") {
      if (!ep.youtube_url) {
        throw new Error(
          `[youtube] episode ${ep.id} is marked live but has no youtube_url`,
        );
      }
      if (!ep.publish_at) {
        throw new Error(
          `[youtube] episode ${ep.id} is marked live but has no publish_at`,
        );
      }
      // Lightweight ISO check — full ISO-8601 grammar is more than we need;
      // this catches the common drift (publish_at: "2026-05-22" without time).
      if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})?)?$/.test(
        ep.publish_at,
      )) {
        throw new Error(
          `[youtube] episode ${ep.id} publish_at is not ISO-8601: "${ep.publish_at}"`,
        );
      }
    } else if (ep.youtube_url) {
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
  // Count gate: the backlog manifest must match the channel spec total.
  if (
    FOUNDERS_DIARY_EPISODES.length !==
    FOUNDERS_DIARY_CHANNEL.total_episodes_planned
  ) {
    throw new Error(
      `[youtube] episode count drift: array has ${FOUNDERS_DIARY_EPISODES.length}, channel spec says ${FOUNDERS_DIARY_CHANNEL.total_episodes_planned}`,
    );
  }
}

validateRegistry();

/**
 * Only episodes the operator has confirmed are live on YouTube. Hub page
 * iterates this; pre-launch it stays empty (all entries are status="draft")
 * and the hub renders the honest "shipping after these gates close" state.
 */
export function liveEpisodes(): ReadonlyArray<FoundersDiaryEpisode> {
  return FOUNDERS_DIARY_EPISODES.filter((ep) => ep.status === "live");
}

/**
 * Episodes eligible for a standalone transcript surface. Strictly the
 * subset of live episodes whose operator has hand-pasted the transcript
 * body — pre-launch (or post-launch-without-transcript) this stays empty.
 * Sitemap iterates this so a transcript URL is only advertised once there
 * is a real transcript to index, never as a phantom URL.
 */
export function liveEpisodesWithTranscript(): ReadonlyArray<
  FoundersDiaryEpisode
> {
  return FOUNDERS_DIARY_EPISODES.filter(
    (ep) =>
      ep.status === "live" &&
      typeof ep.transcript === "string" &&
      ep.transcript.trim().length > 0,
  );
}

/**
 * All 30 backlog entries, sorted by episode number. Used by the
 * /youtube/[episode-slug] static-params generator and the sitemap.
 * Every URL is real — each slug maps to a locked backlog manifest entry.
 */
export function allEpisodes(): ReadonlyArray<FoundersDiaryEpisode> {
  return [...FOUNDERS_DIARY_EPISODES].sort((a, b) => a.number - b.number);
}

/**
 * All episode slugs for sitemap + generateStaticParams.
 */
export const FOUNDERS_DIARY_SLUGS: ReadonlyArray<string> =
  FOUNDERS_DIARY_EPISODES.map((ep) => ep.slug);

/**
 * Resolver: slug → episode. Returns undefined for unknown slugs so the
 * page can call notFound() rather than render a phantom URL.
 */
export function findEpisodeBySlug(
  slug: string,
): FoundersDiaryEpisode | undefined {
  return FOUNDERS_DIARY_EPISODES.find((ep) => ep.slug === slug);
}

/**
 * Previous and next episode in arc order. Used by the per-episode page
 * for prev/next navigation, which doubles as internal-link juice for
 * pSEO (each detail page links to two siblings).
 */
export function episodeNeighbors(ep: FoundersDiaryEpisode): {
  prev?: FoundersDiaryEpisode;
  next?: FoundersDiaryEpisode;
} {
  const sorted = allEpisodes();
  const i = sorted.findIndex((e) => e.id === ep.id);
  if (i === -1) return {};
  return {
    prev: i > 0 ? sorted[i - 1] : undefined,
    next: i < sorted.length - 1 ? sorted[i + 1] : undefined,
  };
}
