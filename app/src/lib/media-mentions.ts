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
 * Empty at launch. This is deliberate – the funnel hub's honest empty-state
 * copy ("Nowhere yet. Reluctant Hero rule: no fake logos.") stays visible
 * until three earned mentions accumulate.
 *
 * Operator append rail
 * --------------------
 * Run `python3 scripts/log-mention.py --help` from the repo root. The CLI
 * validates each field, fetches the artifact, asserts the response body
 * actually names UnlockSaaS / Unlock SaaS / unlocksaas.com, refuses
 * publication-homepage URLs, and rewrites this file in place.
 *
 * Even without the CLI, the `validateMentions` IIFE below runs at module
 * load and throws at build time if any entry violates the editorial
 * standard. There is no honest path to a fabricated entry that ships.
 */
export const MEDIA_MENTIONS: MediaMention[] = [];

/**
 * Build-time integrity check. Throws on the FIRST violation so the
 * Next.js prerender pipeline surfaces the failure inline rather than
 * shipping a silently-broken schema graph.
 *
 * Editorial gates encoded:
 *   - publication is a non-empty trimmed string.
 *   - url is https with a non-trivial path (no publication homepages).
 *   - publishedAt is a real ISO YYYY-MM-DD date, never in the future.
 *   - type, when set, is one of the documented values.
 *   - URLs are unique – never log the same artifact twice.
 *   - Order is reverse-chronological. The public bar reads from
 *     getEarnedMentions() which re-sorts defensively, but an unsorted
 *     source array is a code smell that indicates a hand-edit drifted.
 *
 * Cost: O(n) over an array that will not exceed ~20 entries in the
 * lifetime of the brand. Synchronous, allocation-free per row. The empty
 * array case is a single length-zero check – effectively free at every
 * Next.js cold start or cache fill.
 */
function validateMentions(rows: readonly MediaMention[]): void {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const seenUrls = new Set<string>();
  let previousDate: string | null = null;
  rows.forEach((row, i) => {
    const where = `MEDIA_MENTIONS[${i}]`;
    if (typeof row.publication !== "string" || row.publication.trim() === "") {
      throw new Error(`${where}.publication must be a non-empty string`);
    }
    if (typeof row.url !== "string" || !row.url.startsWith("https://")) {
      throw new Error(`${where}.url must be an absolute https URL`);
    }
    let parsed: URL;
    try {
      parsed = new URL(row.url);
    } catch {
      throw new Error(`${where}.url is not a valid URL: ${row.url}`);
    }
    if (parsed.pathname === "" || parsed.pathname === "/") {
      throw new Error(
        `${where}.url has empty path – that is the publication homepage, ` +
          "not the artifact. Use the direct article / episode / thread URL.",
      );
    }
    if (seenUrls.has(row.url)) {
      throw new Error(
        `${where}.url is a duplicate of an earlier entry: ${row.url}`,
      );
    }
    seenUrls.add(row.url);
    if (!isoDate.test(row.publishedAt)) {
      throw new Error(
        `${where}.publishedAt must be ISO YYYY-MM-DD; got ${JSON.stringify(
          row.publishedAt,
        )}`,
      );
    }
    const parsedDate = new Date(`${row.publishedAt}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error(
        `${where}.publishedAt is not a real calendar date: ${row.publishedAt}`,
      );
    }
    // Future dates are a fabrication tell. Mentions are logged after they
    // publish, never before. A small clock-skew buffer (one calendar day)
    // tolerates timezone edges without opening the door to "next week"
    // entries.
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (parsedDate > tomorrow) {
      throw new Error(
        `${where}.publishedAt is in the future: ${row.publishedAt}`,
      );
    }
    if (row.type !== undefined && row.type !== "earned" && row.type !== "paid") {
      throw new Error(
        `${where}.type must be "earned" | "paid" | undefined; got ${JSON.stringify(
          row.type,
        )}`,
      );
    }
    if (previousDate !== null && row.publishedAt > previousDate) {
      throw new Error(
        `${where} breaks reverse-chronological order – ${row.publishedAt} ` +
          `comes after the previous entry's ${previousDate}. Insert newer ` +
          "entries at the top of the array.",
      );
    }
    previousDate = row.publishedAt;
  });
}

// Module-load IIFE. Runs once per cold start / cache fill. An empty
// MEDIA_MENTIONS array passes trivially – the cost only materialises the
// moment a real entry lands.
validateMentions(MEDIA_MENTIONS);

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
