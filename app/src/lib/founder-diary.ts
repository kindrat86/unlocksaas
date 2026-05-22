/**
 * /founder-diary/[date] pSEO catalog — daily build-in-public log.
 *
 * One entry per day, slugged by ISO date (YYYY-MM-DD). Each entry is a
 * truthful log of what shipped on that date, written in Brunson Hook
 * / Story / Offer voice and anchored to publicly-visible milestones
 * (merged PRs, deployed surfaces, docs updates). No fabricated metrics,
 * no private numbers — every claim here corresponds to something a
 * reader can verify on the live site or in the public repo.
 *
 * Why this surface exists (Isenberg overlay #2)
 * ---------------------------------------------
 * Greg Isenberg's content-franchise thesis: BIP logs are the most
 * under-indexed founder surface. Each daily entry = one perma-indexable
 * URL. Cross-posts to X / IH / r/saas reference the canonical here so
 * the link equity compounds on our domain, not the platforms.
 *
 * Authoring contract
 * ------------------
 * - `date` is the canonical slug; ISO 8601 YYYY-MM-DD.
 * - `hook` is the one-line headline a reader sees in feeds.
 * - `story` is 2-4 short paragraphs walking the why + what shipped.
 * - `offer` is the next-action CTA (almost always: take the diagnostic).
 * - `tags` keep clusters joinable (mcp, community, affiliate, …).
 * - `linkedSurfaces` are deep links into other parts of the site that
 *   the entry references, so the internal-link graph reinforces every
 *   build-log post.
 * - `crosspostUrls` records where this same log was syndicated, with
 *   the canonical reference on this surface. The diary is the source
 *   of truth; X / IH threads are downstream copies.
 *
 * Brunson Hard-Rule reconciliation: a diary entry is a public claim
 * about what shipped. Adding an entry here without the underlying
 * artifact (merged PR, live page, deployed env var) is dishonest and
 * forbidden. The author of an entry is the same operator who shipped
 * the work, which is how Brunson's Attractive Character mechanic stays
 * intact: the diary is the founder's own voice, not a content-farm.
 */

export interface DiaryEntry {
  /** ISO date slug (YYYY-MM-DD). Canonical key. */
  date: string;
  /** Brunson Hook — one-line headline, under 90 chars. */
  hook: string;
  /** SEO meta title, under 60 chars. */
  metaTitle: string;
  /** SEO meta description, under 160 chars. */
  metaDescription: string;
  /** TL;DR for the speakable block, ~40 words. */
  tldr: string;
  /** Brunson Story — 2-4 short paragraphs of context + what shipped. */
  story: ReadonlyArray<string>;
  /** Brunson Offer — what the reader should do next given this log. */
  offer: string;
  /** Tag keys for grouping in the hub and llms-feed. Kebab-case. */
  tags: ReadonlyArray<string>;
  /**
   * Internal surfaces referenced by this entry. Each becomes a "linked
   * surface" callout at the bottom of the detail page. Path-relative,
   * leading slash, no domain.
   */
  linkedSurfaces: ReadonlyArray<{ href: string; label: string }>;
  /**
   * Verified-public artifacts that ground the entry's truth claims.
   * Currently scoped to merged-PR numbers in the public repo.
   */
  pullRequests: ReadonlyArray<number>;
}

/**
 * The seeded log. Backfilled from publicly-documented milestones already
 * recorded in the operator's project memory. New entries are appended
 * in chronological order; the hub renders them reverse-chronologically.
 *
 * Voice rule: every entry is past-tense, founder-first-person plural
 * ("we shipped"), no first-name reference (per the no-dream-customer-
 * name-in-public-copy rule). Each story block names the concrete artifact
 * (PR number, surface path, env var) so an outside reader can verify
 * the claim without trusting the prose.
 */
export const DIARY_ENTRIES: ReadonlyArray<DiaryEntry> = [
  {
    date: "2026-05-17",
    hook: "Diagnostic v2 turned a one-page score into a full teardown.",
    metaTitle: "Diary 2026-05-17: Diagnostic v2 deep analysis ships",
    metaDescription:
      "Build log: Diagnostic v2 expanded the 90-second result page into a scorecard, rewrites, 30-day plan, competitors, and browser-native PDF export.",
    tldr:
      "The free 90-second Launch Diagnostic stopped being a single score and became a full post-launch teardown: scorecard, copy rewrites, 30-day plan, competitor lens, and a browser-native PDF export. Same intake, much higher delivered value.",
    story: [
      "Before today the diagnostic returned a single composite score and a short list of issues. That was useful but it didn't feel like a real teardown — and an indie SaaS founder reading it once doesn't come back unless the artifact is worth living with.",
      "We rebuilt the result page as a deep analysis surface: an explicit scorecard per Hook / Story / Offer lens, suggested copy rewrites that point at named patterns from the swipe-file catalog, a 30-day post-launch plan, a competitor sidebar drawing from the funnel-teardown set, and a strengths section so the founder isn't only reading the deficit list.",
      "The PDF export is browser-native (no headless Chrome service, no Vercel build of Puppeteer) which means the founder can save a copy that survives our pricing or product changes. That matters because we want the diagnostic to read as a gift, not a lead-magnet.",
    ],
    offer:
      "Run the 90-second diagnostic again and watch what changed. The intake is identical; the result page is a different artifact.",
    tags: ["diagnostic", "product"],
    linkedSurfaces: [
      { href: "/diagnostic", label: "Run the free 90-second diagnostic" },
      { href: "/swipe-file", label: "Swipe-file catalog (where rewrites come from)" },
      { href: "/funnel-teardown", label: "Funnel-teardown set (competitor lens)" },
    ],
    pullRequests: [],
  },
  {
    date: "2026-05-18",
    hook: "Analytics live. Now we actually know who's reading.",
    metaTitle: "Diary 2026-05-18: PostHog analytics wired up",
    metaDescription:
      "Build log: PostHog project 181784 (EU) is ingesting events end-to-end. Founder identifiers excluded from the data set.",
    tldr:
      "PostHog project 181784 on the EU cluster is now ingesting events from every public surface, with the founder's own machine identifiers excluded so the data set isn't polluted by the operator. Personal API key configured for downstream scripts.",
    story: [
      "Up to this point we had been shipping pSEO surfaces without seeing what readers were actually doing on them — which is how indie SaaS founders quietly waste six months of work. Today PostHog is live end to end, on the EU cluster (project 181784), with the personal API key configured for offline analysis scripts.",
      "Founder traffic is excluded from the data set at the source: distinct_id c7c29d8d-… plus country GR are filtered out so the operator's own browsing doesn't show up as engagement. That matters more than it sounds — without it, the first thirty days of analytics would have been pure self-noise.",
      "The point of getting analytics on now is the same as the diagnostic: before traffic arrives, not after. Once the first cohorts of paid traffic hit, we want clean data from day one, not a retroactive 'huh, that didn't track.'",
    ],
    offer:
      "If you're pre-traffic too, wire analytics before launch — not after. The diagnostic checks whether your tracking actually fires.",
    tags: ["analytics", "infra"],
    linkedSurfaces: [
      { href: "/diagnostic", label: "Run the diagnostic (tracks Hook / Story / Offer events)" },
      { href: "/numbers", label: "Public metrics dashboard" },
    ],
    pullRequests: [],
  },
  {
    date: "2026-05-19",
    hook: "Our MCP server is live. AI agents can now buy the diagnostic.",
    metaTitle: "Diary 2026-05-19: UnlockSaaS MCP server ships",
    metaDescription:
      "Build log: 18 read-only MCP tools at /api/mcp covering diagnostic, playbook, offer catalog, and full SEO surface. Agent-mediated discovery is on.",
    tldr:
      "UnlockSaaS shipped its own MCP server at /api/mcp with 18 read-only tools — the diagnostic intake, all seven Playbook steps, the canonical offer card, and the full SEO catalog. Discovery via /.well-known/mcp.json and /mcp.md.",
    story: [
      "Greg Isenberg's 2026 thesis is that MCP servers are the new mobile-2010 distribution surface and that early movers own the directory. We agree — and we shipped before agreeing was free.",
      "The server exposes 18 read-only tools spanning the diagnostic intake (V1 + V2), every step of the post-launch Playbook, the canonical $1 Starter / $49 Core offer card, and the full programmatic SEO catalog. An AI agent walking the site for a founder can read the same artifacts a human reads, without scraping HTML.",
      "Discovery is wired through /.well-known/mcp.json (the emerging convention) and a human-readable /mcp.md page. Every return URL from a tool call carries a utm_source=mcp parameter, so agent-mediated traffic is distinguishable from organic in the analytics PostHog just lit up.",
    ],
    offer:
      "Add the MCP server to Claude Desktop or Cursor and ask your agent to run the diagnostic against your live page.",
    tags: ["mcp", "infra", "isenberg"],
    linkedSurfaces: [
      { href: "/mcp", label: "MCP install + tool catalog" },
      { href: "/.well-known/mcp.json", label: "MCP discovery manifest" },
      { href: "/diagnostic", label: "Run the diagnostic (callable via MCP)" },
    ],
    pullRequests: [85],
  },
  {
    date: "2026-05-20",
    hook: "Buying the Playbook now gets you the room, not just the doc.",
    metaTitle: "Diary 2026-05-20: Verified Builders community gate ships",
    metaDescription:
      "Build log: $49/mo Core now grants access to the Verified Builders community room via idempotent Stripe-webhook grant/revoke. Audit table included.",
    tldr:
      "The $49/mo Core tier now grants room access to the Verified Builders community on subscription start, and revokes on cancel — both idempotent, both audited. The Playbook stopped being a doc and became a doc plus a room.",
    story: [
      "Greg Isenberg again: products copy, communities don't. The framework we ship inside Core is replicable. The room of post-launch indie founders running it together isn't.",
      "Today the gate is shipped (PR #86). When a Stripe subscription for the Core price flips to active, the webhook grants room access; on cancel or non-payment, it revokes. Both directions are idempotent — replaying the same webhook is a no-op — and every grant or revoke is written to an audit table so we can answer 'why does X have access' without guessing.",
      "The platform is intentionally swappable. A single environment variable (COMMUNITY_INVITE_URL) decides whether the invite lands on Skool or Discord, so we can move the room without re-deploying the gate logic.",
    ],
    offer:
      "If you bought the Playbook, your invite is in your dashboard. If you didn't, the diagnostic still tells you whether you should.",
    tags: ["community", "billing", "isenberg"],
    linkedSurfaces: [
      { href: "/playbook-sales", label: "Playbook sales page ($49/mo Core)" },
      { href: "/diagnostic", label: "Run the diagnostic first" },
    ],
    pullRequests: [86],
  },
  {
    date: "2026-05-21",
    hook: "Affiliates can now earn 50% of every Playbook subscription. For life.",
    metaTitle: "Diary 2026-05-21: Affiliate program (50%, lifetime) ships",
    metaDescription:
      "Build log: 50% lifetime rev-share affiliate program live with /r/<code> tracking and a partner dashboard. Rev-share snapshotted per commission row.",
    tldr:
      "We shipped a 50% lifetime rev-share affiliate program with /r/<code> attribution and a partner dashboard. The rev-share rate is snapshotted onto each commission row, so a future rate change can't quietly rewrite history.",
    story: [
      "Isenberg's aggressive-affiliate frame says the cleanest path to $1M ARR for a sub-$100/mo SaaS is to share half the revenue with people who already trust the founders they recommend. We agree, and shipped it (PR #89).",
      "Every customer of the $49/mo Core can become a Verified Builder partner and recruit other founders. Attribution rides on a short /r/<code> URL that resolves to a cookie + DB write. The partner dashboard shows clicks, conversions, MRR attributed, and lifetime payouts.",
      "The detail that took the most thinking: each commission row carries the rev-share rate it was created under, not a global config value. If we ever change the rate (we won't lower 50% — Isenberg's right, half is the right number), the historical payouts still calculate against the rate that existed when the sale was made.",
    ],
    offer:
      "If you're already paying for the Playbook, claim your affiliate code from the dashboard and start tracking. Otherwise the diagnostic still comes first.",
    tags: ["affiliate", "billing", "isenberg"],
    linkedSurfaces: [
      { href: "/affiliate", label: "Affiliate program details" },
      { href: "/playbook-sales", label: "Playbook sales page" },
    ],
    pullRequests: [89],
  },
  {
    date: "2026-05-22",
    hook: "We're documenting every build day on its own indexable URL.",
    metaTitle: "Diary 2026-05-22: Founder Diary launches",
    metaDescription:
      "Build log: /founder-diary/[YYYY-MM-DD] now ships one perma-indexable URL per build day. Faceless-YouTube channel and X cross-posts reference the canonical here.",
    tldr:
      "Today /founder-diary went live with one URL per build day. The faceless-YouTube channel of the same name, X threads, and IH cross-posts will all reference the canonical entry here, so link equity compounds on this domain instead of the platforms.",
    story: [
      "Greg Isenberg's content-franchise thesis says build-in-public logs are the most under-indexed founder surface. We've been quietly shipping milestones (diagnostic v2, analytics, MCP, the community gate, the affiliate program) without giving any of them a perma-indexable home.",
      "So today's diary entry is the diary itself. /founder-diary/[YYYY-MM-DD] is now a generated route with JSON-LD BlogPosting schema, breadcrumbs, speakable TL;DR, and a canonical that the X / IH / r/saas posts will reference. The faceless-YouTube channel of the same name (already wired in lib/youtube.ts) will syndicate per-episode videos that link back here.",
      "Compounding kicks in at the volume layer: 365 entries a year, each its own URL, each cross-linking the others. The hub page acts as the recurring backlink magnet that 'state-of-saas' style annual posts wish they were.",
    ],
    offer:
      "Bookmark /founder-diary and check back daily. Or run the diagnostic and see which of these shipped pieces apply to your funnel.",
    tags: ["diary", "pseo", "isenberg"],
    linkedSurfaces: [
      { href: "/youtube", label: "The Founder's Diary YouTube channel" },
      { href: "/diagnostic", label: "Run the diagnostic" },
      { href: "/mcp", label: "MCP server (where agents discover this content)" },
    ],
    pullRequests: [],
  },
] as const;

/**
 * Sorted-newest-first slugs for `generateStaticParams` and the hub list.
 * The registry above is authored chronologically; sorting once at module
 * load means consumers don't have to re-sort per render.
 */
export const DIARY_DATES: ReadonlyArray<string> = [...DIARY_ENTRIES]
  .map((e) => e.date)
  .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

/**
 * Strict ISO YYYY-MM-DD validator — used by the dynamic route to bail
 * on malformed slugs before any registry lookup. Returns true only for
 * the canonical 10-char shape with valid month / day ranges.
 */
export function isValidDiaryDate(slug: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slug)) return false;
  const [y, m, d] = slug.split("-").map(Number);
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  // Round-trip through Date to catch e.g. 2026-02-30.
  const dt = new Date(`${slug}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return false;
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
}

/**
 * Lookup by date slug. Returns null when the slug is malformed or the
 * date isn't in the registry. Pages call `notFound()` on null.
 */
export function getDiaryEntryByDate(date: string): DiaryEntry | null {
  if (!isValidDiaryDate(date)) return null;
  return DIARY_ENTRIES.find((e) => e.date === date) ?? null;
}

/**
 * Adjacent-entry helpers for the prev/next nav at the bottom of every
 * detail page. Returns null at the boundaries of the registry. Order
 * follows DIARY_DATES (newest first), so `previous` is the older entry
 * and `next` is the newer one — matching how a reader would walk the
 * archive from a current entry.
 */
export function getAdjacentEntries(date: string): {
  newer: DiaryEntry | null;
  older: DiaryEntry | null;
} {
  const idx = DIARY_DATES.indexOf(date);
  if (idx === -1) return { newer: null, older: null };
  const newerDate = idx > 0 ? DIARY_DATES[idx - 1] : null;
  const olderDate = idx < DIARY_DATES.length - 1 ? DIARY_DATES[idx + 1] : null;
  return {
    newer: newerDate ? getDiaryEntryByDate(newerDate) : null,
    older: olderDate ? getDiaryEntryByDate(olderDate) : null,
  };
}

/**
 * Athens-timezone display formatter, DD-MM-YYYY shape per the project's
 * display-timezone rule. The underlying date in the registry is UTC; we
 * only project it to Europe/Athens for human-facing surfaces.
 */
export function formatDiaryDateAthens(date: string): string {
  const dt = new Date(`${date}T12:00:00Z`); // noon UTC avoids DST edge.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Athens",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(dt);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")}`;
}

/**
 * Long-form human label used in H1 + JSON-LD headline contexts.
 * Example: "Friday, 22 May 2026".
 */
export function formatDiaryDateLong(date: string): string {
  const dt = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Athens",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
}
