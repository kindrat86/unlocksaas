/**
 * 90-second walkthrough transcript for /diagnostic – VEO/AEO uplift
 * (2026-05-20).
 *
 * Why this file exists
 * --------------------
 * Voice engines (Siri Reader, Alexa, Google Assistant podcast surface,
 * ChatGPT Voice, Perplexity voice) and AI summarisers (ChatGPT, Claude,
 * Gemini, Perplexity) consume `VideoObject.transcript` directly. By
 * publishing the verbatim narration BEFORE the video itself ships, we:
 *
 *   1. Remove ambiguity for AI engines that transcribe video unevenly –
 *      they cite our text rather than guessing from audio.
 *   2. Give the page a textual walkthrough surface that stands alone for
 *      AEO purposes (the visible <section> still wins voice answers even
 *      with no video recorded yet).
 *   3. When the video lands on a CDN, dropping DIAGNOSTIC_VIDEO_URL into
 *      Vercel env lights up the VideoObject JSON-LD with this same
 *      transcript inline – no copy edit needed.
 *
 * Brunson Hard-Rule honest claims:
 *   - The transcript is the script for a planned walkthrough video. The
 *     visible HTML render frames it as "the 90-second walkthrough" with
 *     no claim that a recording exists. The VideoObject JSON-LD is
 *     env-gated and emits nothing until DIAGNOSTIC_VIDEO_URL is set.
 *   - The narration content mirrors the existing /diagnostic page copy
 *     and the /diagnostic.md markdown mirror – no claims the page itself
 *     does not already make.
 *
 * Source of truth: this module. Both the visible <section> render in
 * /diagnostic and the VideoObject JSON-LD transcript field import from
 * here, so the schema↔DOM contract cannot drift.
 */

/**
 * One narrated segment. `start` is seconds from the beginning of the
 * planned video – used to render visible cue markers and to populate
 * `Clip` schema once the video ships.
 */
export type WalkthroughSegment = {
  /** Seconds from the start of the walkthrough. */
  readonly start: number;
  /** Spoken text for the segment. Sentence-cased, narration cadence. */
  readonly text: string;
};

/**
 * Eight-segment walkthrough. Cadence: ~140 words per minute (slower than
 * a podcast, faster than a Loom narration) → 210 words across ~90 seconds.
 *
 * Voice convention: first-person from Maryan, matching the diagnostic
 * page's "I am reading your page" frame and the founder-bio section.
 *
 * No em dash anywhere in this file. Display copy uses en dash only.
 */
export const DIAGNOSTIC_WALKTHROUGH: ReadonlyArray<WalkthroughSegment> = [
  {
    start: 0,
    text: "Hi. I am Maryan, the founder of Unlock SaaS. This is the free diagnostic. Here is how it works in ninety seconds.",
  },
  {
    start: 9,
    text: "You paste the live URL of your product page. You enter the email you actually read. That is the only input. No card. No scope of work. No calendar.",
  },
  {
    start: 22,
    text: "I read your page the way a stranger does, and I check three things.",
  },
  {
    start: 27,
    text: "Wrong Person. Is the page written for a category like founders, teams, or creators, instead of one named person with a known pain. If it is a category, the page is invisible to the visitor you actually want.",
  },
  {
    start: 43,
    text: "Weak Offer. Does the page list features, or does it promise a specific, defensible result inside a timeframe. Features without a promise is Weak Offer.",
  },
  {
    start: 58,
    text: "Weak Belief. Does the page assume a story the visitor does not yet believe. No copy edit fixes that on its own; the upstream story has to be built first.",
  },
  {
    start: 72,
    text: "You get back a short read-out that names which of the three is the binding constraint on your page, and one concrete door to fix it. For five days after, I send one short note a day walking you through the fix. Reply STOP and the notes end.",
  },
  {
    start: 85,
    text: "The diagnostic is free forever. The one-dollar Starter is open if you want the playbook itself. Either way, paste your URL above and let us see your page.",
  },
] as const;

/** Total planned video duration, in seconds. Matches the last segment's
 *  start plus its narration length. Used as default for the VideoObject
 *  `duration` field; override via DIAGNOSTIC_VIDEO_DURATION_MS env when
 *  the recorded asset measurably diverges. */
export const DIAGNOSTIC_WALKTHROUGH_DURATION_SEC = 95;

/**
 * Plain-text transcript with timestamps inline – what voice engines and
 * AI summarisers receive in the VideoObject.transcript JSON-LD field.
 *
 * Format chosen so it reads cleanly in both:
 *   - LLM retrieval corpora (one line per segment, timestamp anchored)
 *   - human-eye verification (a journalist or builder can read it top to
 *     bottom and check the script against the published walkthrough).
 *
 * Frozen at module load. Pure derivation – no per-render allocation.
 */
export const DIAGNOSTIC_WALKTHROUGH_TRANSCRIPT_TEXT: string = Object.freeze(
  DIAGNOSTIC_WALKTHROUGH.map((segment) => {
    const minutes = Math.floor(segment.start / 60);
    const seconds = segment.start % 60;
    const stamp = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    return `[${stamp}] ${segment.text}`;
  }).join("\n"),
) as unknown as string;
