/**
 * Source-aware landing variant resolver.
 *
 * Detects the visitor's acquisition channel (Twitter/X, IndieHackers,
 * Hacker News, Marc Lou, MicroConf, LinkedIn, Reddit, launch directory,
 * organic) from utm_source + Referer on first touch, then sticky-cookies
 * the normalized channel for 90 days. The home Hero block reads the
 * cookie server-side and renders a channel-native eyebrow + scar-tissue
 * subhead + CTA verb tuned to where the visitor came from.
 *
 * Cookie discipline mirrors the existing identity_label A/B (src/lib/ab.ts):
 *
 *   usaas_source — the normalized channel string. First-touch wins; the
 *     proxy does NOT overwrite an existing value on later visits so the
 *     cookie carries the true first-touch attribution for 90 days.
 *
 * This is deliberately distinct from src/lib/diagnostic-hook-variant.ts
 * (which resolves per-request and maps to Eugene Schwartz awareness for
 * the /diagnostic squeeze). That module drives the diagnostic H1; this
 * module drives the home Hero. Different surfaces, different storage,
 * different copy decks — kept separate by design.
 *
 * Why the lift exists: the May 2026 distribution research (research
 * stream "Indie founder distribution 2026") flagged dynamic-by-referrer
 * landing pages converting at 37.1% vs 19.2% for static — near-2x
 * conversion lift. This is the cheapest possible version of that play:
 * one cookie, eight copy decks, no JS.
 *
 * Hard rules across every variant:
 *   1. Never claim a relationship that isn't real (no "as seen on HN"
 *      unless we actually were). The copy nods to the channel without
 *      fabricating endorsement.
 *   2. No em dash anywhere (per the user memory rule). Use en dash or a
 *      sentence break.
 *   3. The polarity move ("Or refunded, automatically.") stays on every
 *      variant — it is the page's most-tested line.
 *   4. Brunson voice: founder-to-founder, not agency polish.
 */

import { cookies } from "next/headers";

export const SOURCE_COOKIE = "usaas_source";

/**
 * 90 days. Shorter than the identity A/B (1 year) because acquisition
 * channel decays as a meaningful signal much faster than collective
 * identity preference — a visitor who clicked from IH three months ago
 * is closer to "organic returning" than "fresh IH lead" by then.
 */
export const SOURCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export type AcquisitionSource =
  | "default"
  | "indiehackers"
  | "marclou"
  | "twitter"
  | "hackernews"
  | "linkedin"
  | "microconf"
  | "reddit"
  | "directory";

const VALID_SOURCES: ReadonlySet<string> = new Set([
  "default",
  "indiehackers",
  "marclou",
  "twitter",
  "hackernews",
  "linkedin",
  "microconf",
  "reddit",
  "directory",
]);

/**
 * UTM / source / ref token → channel. Lowercased + trimmed before lookup.
 * Explicit overrides like `?source=marclou` always beat referer inference.
 */
const UTM_TOKEN_MAP: Record<string, AcquisitionSource> = {
  indiehackers: "indiehackers",
  ih: "indiehackers",
  "indie-hackers": "indiehackers",
  marclou: "marclou",
  "marc-lou": "marclou",
  ml: "marclou",
  shipfast: "marclou",
  shipfa_st: "marclou",
  twitter: "twitter",
  x: "twitter",
  tweet: "twitter",
  hn: "hackernews",
  hackernews: "hackernews",
  "hacker-news": "hackernews",
  linkedin: "linkedin",
  li: "linkedin",
  microconf: "microconf",
  reddit: "reddit",
  r_saas: "reddit",
  r_microsaas: "reddit",
  r_indiehackers: "reddit",
  r_sideproject: "reddit",
  betalist: "directory",
  microlaunch: "directory",
  uneed: "directory",
  peerlist: "directory",
  producthunt: "directory",
  tinylaunch: "directory",
};

/** Referrer hostname → channel. Used when no UTM token is present. */
const REFERER_HOST_MAP: Record<string, AcquisitionSource> = {
  "indiehackers.com": "indiehackers",
  "www.indiehackers.com": "indiehackers",
  "shipfa.st": "marclou",
  "marclou.com": "marclou",
  "twitter.com": "twitter",
  "www.twitter.com": "twitter",
  "x.com": "twitter",
  "www.x.com": "twitter",
  "t.co": "twitter",
  "mobile.twitter.com": "twitter",
  "news.ycombinator.com": "hackernews",
  "hn.algolia.com": "hackernews",
  "linkedin.com": "linkedin",
  "www.linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
  "microconf.com": "microconf",
  "www.microconf.com": "microconf",
  "reddit.com": "reddit",
  "www.reddit.com": "reddit",
  "old.reddit.com": "reddit",
  "betalist.com": "directory",
  "www.betalist.com": "directory",
  "microlaunch.net": "directory",
  "uneed.best": "directory",
  "peerlist.io": "directory",
  "producthunt.com": "directory",
  "www.producthunt.com": "directory",
  "tinylaunch.com": "directory",
};

/**
 * Copy deck per variant. The Hero block reads one of these and renders
 * the corresponding eyebrow + headline + subhead + CTA.
 *
 * The `headline*` fields are split into Lead + Muted spans because the
 * Hero renders the second half of each sentence in `text-muted-foreground`
 * for visual rhythm (matches the original DotCom-Secrets §2 H1 cadence
 * Brunson teaches: emotional promise, soft tail).
 */
export type HeroVariant = {
  /** Top eyebrow badge text. Should signal channel without lying. */
  eyebrow: string;
  /** H1 first sentence, foreground span. */
  headlineLead: string;
  /** H1 first sentence, muted-foreground tail. */
  headlineLeadMuted: string;
  /** H1 second sentence (polarity move), foreground span. */
  headlineTailLead: string;
  /** H1 second sentence, muted-foreground tail. */
  headlineTailMuted: string;
  /** Scar-tissue subhead paragraph. */
  subheadOpener: string;
  /** Founder credit line under the subhead. */
  subheadCloser: string;
  /** Primary CTA button verb. */
  primaryCta: string;
};

export const HERO_VARIANTS: Record<AcquisitionSource, HeroVariant> = {
  default: {
    eyebrow: "Founding rate · first 100 builders only",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or your money back,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "Unlock SaaS gets you your first paying customer in 60 days with a free 90-second funnel diagnostic — Wrong Person, Weak Offer, or Weak Belief — and a $49/mo playbook that fixes what the diagnosis found; if 60 days pass without a paying customer, the refund fires automatically. I built it after shipping 12 AI products nobody paid for and finally figuring out why.",
    subheadCloser: "– Maryan, non-engineer founder",
    primaryCta: "Get my free 90-second diagnosis →",
  },

  indiehackers: {
    eyebrow: "From Indie Hackers · 60-day refund, code-enforced",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "If you came over from IH, you already know the pattern: shipped, posted, flat Stripe line. Same loop I was in. This is the playbook that broke it, written for the founder who has tried the IH-favourite tactics and still has zero MRR.",
    subheadCloser: "– Maryan, fellow IH builder",
    primaryCta: "Run the free 90-second diagnosis →",
  },

  marclou: {
    eyebrow: "From Marc's audience · 60-day Stripe-verified guarantee",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "Marc's playbook ships fast. The piece that is harder to copy is the offer that earns the first Stripe charge after the launch tweet. That is what this diagnostic labels, and what the $49 playbook fixes, without replacing anything in your ShipFast stack.",
    subheadCloser: "– Maryan, non-engineer founder",
    primaryCta: "Diagnose my offer (free, 90 sec) →",
  },

  twitter: {
    eyebrow: "From X · 60-day refund, code-enforced",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "If you have been reading my build-in-public posts, this is the inside view. The diagnostic labels the same three flaws I keep posting receipts on: Wrong Person, Weak Offer, Weak Belief. The playbook is the work that actually moves the line.",
    subheadCloser: "– Maryan, building in public",
    primaryCta: "Get my free 90-second diagnosis →",
  },

  hackernews: {
    eyebrow: "From HN · refund auto-fires at day 60, no support ticket",
    headlineLead: "First paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically by code.",
    subheadOpener:
      "For HN: it is not another funnel-bro course. A Stripe webhook checks for a real customer charge on day 60. If none, the refund fires without a support ticket. Editorial policy, corrections log, and the public CC-BY-4.0 dataset of teardowns are all linked in the footer.",
    subheadCloser: "– Maryan, shipped 12 AI products, two paid",
    primaryCta: "Run the free 90-second diagnostic →",
  },

  linkedin: {
    eyebrow: "From LinkedIn · for post-launch pre-revenue founders",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "If you saw this on LinkedIn, you probably saw the receipts first: 12 shipped products, two paid me, the line stayed flat until I stopped fixing products and started fixing the order. This is the playbook that ran the new order, end to end.",
    subheadCloser: "– Maryan, non-engineer founder",
    primaryCta: "Get my free 90-second diagnosis →",
  },

  microconf: {
    eyebrow: "From MicroConf · for the post-launch pre-revenue founder",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "MicroConf hammers one lesson: the bottleneck is rarely the product, it is the offer and the conversation. This is the playbook for the conversation, written specifically for the founder who has shipped, posted, and is still pre-revenue.",
    subheadCloser: "– Maryan, non-engineer founder",
    primaryCta: "Run the free 90-second diagnostic →",
  },

  reddit: {
    eyebrow: "From Reddit · 60-day Stripe-verified guarantee",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "Honest version: I shipped 12 AI products and only two paid me. The playbook I wish someone had handed me at zero MRR is built into this site. Diagnostic is free, no email, no card. The $49 tier is the work that follows the diagnosis.",
    subheadCloser: "– Maryan, non-engineer founder",
    primaryCta: "Run the free 90-second diagnostic →",
  },

  directory: {
    eyebrow: "Founding rate · first 100 builders only",
    headlineLead: "Your first paying customer",
    headlineLeadMuted: "in 60 days.",
    headlineTailLead: "Or refunded,",
    headlineTailMuted: "automatically.",
    subheadOpener:
      "Discovered this on a launch directory? Short version: a free 90-second diagnostic labels what is broken on your offer page, then a $1 Starter shows you the fix in action. Code-enforced refund on day 60 if no real Stripe charge.",
    subheadCloser: "– Maryan, non-engineer founder",
    primaryCta: "Run the free 90-second diagnostic →",
  },
};

/**
 * Resolve the acquisition source from a request's UTM + Referer signals.
 * Returns null if no rule matches; callers should treat null as "do not
 * overwrite an existing cookie" rather than "set default" — that way
 * organic direct traffic stays uncookied and a returning visitor's
 * first-touch attribution survives later organic visits.
 */
export function detectSourceFromRequest(input: {
  searchParams: URLSearchParams;
  refererHeader: string | null;
}): AcquisitionSource | null {
  // 1. UTM / source / ref token wins — explicit beats inferred.
  const utmToken = (
    input.searchParams.get("utm_source") ??
    input.searchParams.get("source") ??
    input.searchParams.get("ref") ??
    ""
  )
    .toLowerCase()
    .trim();
  if (utmToken && UTM_TOKEN_MAP[utmToken]) {
    return UTM_TOKEN_MAP[utmToken];
  }

  // 2. Referer hostname.
  const refererHost = parseHost(input.refererHeader);
  if (refererHost && REFERER_HOST_MAP[refererHost]) {
    return REFERER_HOST_MAP[refererHost];
  }

  return null;
}

/**
 * Read the source variant from cookies. Defaults to "default" when missing
 * — same SSR-no-flash discipline as readIdentityFromCookies in src/lib/ab.ts.
 *
 * Server-only (uses next/headers `await cookies()`).
 */
export async function readSourceFromCookies(): Promise<AcquisitionSource> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SOURCE_COOKIE)?.value;
  return parseSource(raw) ?? "default";
}

export function getHeroVariant(source: AcquisitionSource): HeroVariant {
  return HERO_VARIANTS[source];
}

/**
 * Normalize a raw cookie value into an AcquisitionSource or null. Used by
 * code paths that read source from arbitrary external input (e.g. future
 * PostHog event-tagging hooks).
 */
export function parseSource(
  raw: string | null | undefined,
): AcquisitionSource | null {
  if (raw && VALID_SOURCES.has(raw)) return raw as AcquisitionSource;
  return null;
}

function parseHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.toLowerCase();
  } catch {
    return null;
  }
}
