/**
 * Earned-media mentions of UnlockSaaS.
 *
 * Source pattern: Brunson Funnel Hacker's Cookbook v1, Swipe 3 ("As seen in"
 * media bar above the fold). See strategy/funnel-hackers-cookbook.md.
 *
 * Identity guardrails (non-negotiable):
 *   1. Real mentions only. No paid placements badged as earned.
 *   2. Each entry MUST link to a public artifact — the article, the podcast
 *      episode, the X thread, the IH feature. Linking to a publication's
 *      homepage is dishonest and fails the acceptance test.
 *   3. The bar renders only when 3+ entries exist (Brunson canon: "three is
 *      the minimum credible bar"). With 0–2 entries the bar stays hidden
 *      and the funnel hub falls back to the honest empty-state copy.
 *   4. Order is reverse-chronological (most recent first).
 *
 * Operator workflow when a real mention lands:
 *   - Read the artifact end-to-end. Confirm it actually names UnlockSaaS
 *     (not a generic "AI tools" roundup that happens to include the URL).
 *   - Append a new entry below.
 *   - Commit with message: `media: log <publication> mention (<date>)`.
 *   - The next deploy auto-renders the bar once length >= 3.
 */

export interface MediaMention {
  /** Publication / show / handle name. Shown as the visible label in the bar. */
  publication: string;
  /** Direct URL to the artifact (article, episode, thread). Required. */
  url: string;
  /** ISO date the mention published. Used for ordering + tooltip. */
  publishedAt: string;
  /** One-sentence note for hover tooltip. Optional but recommended. */
  context?: string;
  /** Whether this was earned (default) or paid. Paid mentions are filtered out of the public bar. */
  type?: "earned" | "paid";
}

/**
 * Reverse-chronological list of earned mentions.
 *
 * Empty at launch. This is deliberate — the funnel hub's honest empty-state
 * copy ("Nowhere yet. Reluctant Hero rule: no fake logos.") stays visible
 * until three earned mentions accumulate.
 */
export const MEDIA_MENTIONS: MediaMention[] = [];

/**
 * Minimum count required for the public bar to render.
 * Per the Cookbook acceptance test: three is the minimum credible bar.
 */
export const MEDIA_BAR_MIN_COUNT = 3;

/**
 * Earned, ordered list — the only thing the public bar should consume.
 */
export function getEarnedMentions(): MediaMention[] {
  return MEDIA_MENTIONS.filter((m) => m.type !== "paid").sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

/**
 * True when the public bar should render. Pure — safe to call from a
 * server component during render without async work.
 */
export function shouldRenderMediaBar(): boolean {
  return getEarnedMentions().length >= MEDIA_BAR_MIN_COUNT;
}
