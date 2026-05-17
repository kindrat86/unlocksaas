/**
 * Best-Bait audience-temperature hook variant resolver.
 *
 * Brunson DotCom Secrets Chapter 11 (The Best Bait) + Chapter 19
 * (Cold Traffic / Eugene Schwartz awareness levels) explicitly call for
 * different bait copy by audience temperature. The squeeze used one hook
 * for every visitor pre-revision. This module is the rotation.
 *
 * Source of truth for the awareness-to-hook mapping:
 *   strategy/workbooks/10-growth-hacking.md §4 (Cold Traffic Hook priority)
 *   strategy/workbooks/01-sales-funnel-secrets.md §5 (twelve hooks)
 *
 * Why server-side: the squeeze page is server-rendered with `force-dynamic`,
 * so we resolve the variant once per request from search params + referrer.
 * The variant is passed into both the visible H1 and (via prop drilling) the
 * client form for PostHog property tagging.
 *
 * No cookies, no A/B coin-flip, no convergence math. This is a deterministic
 * Eugene-Schwartz mapping by source — different from the workbook-05
 * Verified vs Paid Builders identity A/B which IS a coin-flip on the home
 * page hero. Kept separate by design: identity is the brand-level test,
 * hook variant is the cold-traffic-temperature optimization.
 */

import type {
  DiagnosticHookVariant,
  DiagnosticHookVariantProps,
} from "@/lib/analytics/events";

export type HookCopy = {
  variant: DiagnosticHookVariant;
  /** Awareness level Eugene Schwartz would put this hook at. */
  awareness: "problem" | "solution" | "product";
  /** H1 on the squeeze. */
  headline: string;
  /** Sub-headline / lede paragraph below the H1. */
  lede: string;
  /** CTA button copy on Step 1 + Step 5 (Brunson rule: CTA matches hook). */
  cta: string;
};

// The three locked variants. Wording is taken VERBATIM from workbook 01 §5.
// Do not rewrite without amending the workbook first.
export const HOOK_COPY: Record<DiagnosticHookVariant, HookCopy> = {
  // Hook #3 — pain mirror. Highest cold-traffic CTR per workbook 10 §4.
  default: {
    variant: "default",
    awareness: "problem",
    headline:
      "Your product is not broken. It was built for no one in particular.",
    lede:
      "Paste the live URL. In ninety seconds I label what is actually wrong with one of three diagnoses — Wrong Person, Weak Offer, or Weak Belief — and hand you the door that fixes it.",
    cta: "See why your launch is flat",
  },
  // Hook #10 — contrarian reframe. Solution-aware visitor who has tried
  // tactics. r/SaaS, r/microsaas, IH posts, build-in-public commenters.
  contrarian: {
    variant: "contrarian",
    awareness: "solution",
    headline:
      "You tried more traffic. The line is still flat. Here is the work nobody told you to do.",
    lede:
      "Paste the live URL. Ninety seconds. I tell you which of three things is broken upstream of the product — Wrong Person, Weak Offer, or Weak Belief — and hand you the door that fixes the one that is actually broken.",
    cta: "Show me the upstream fix",
  },
  // Hook #7 — guarantee/result. Product-aware visitor: retargeting,
  // founding-waitlist, anyone who already knows what UnlockSaaS does.
  guarantee: {
    variant: "guarantee",
    awareness: "product",
    headline:
      "Your first real paying customer in 60 days — even if your launch already flopped.",
    lede:
      "Before the guarantee starts, the diagnostic finds the upstream break. Paste the URL. Ninety seconds. One of three labels — Wrong Person, Weak Offer, or Weak Belief — plus the door that fixes the labeled one.",
    cta: "Run the diagnostic first",
  },
};

// Source-token taxonomy. Kept narrow so PostHog cohort splits stay stable.
const SOLUTION_AWARE_SOURCES = new Set([
  "reddit",
  "r_saas",
  "r_microsaas",
  "indiehackers",
  "ih",
  "hn",
  "hackernews",
]);

const PRODUCT_AWARE_SOURCES = new Set([
  "retarget",
  "founding",
  "founding_waitlist",
  "founding_v1",
  "founding_v2",
  "founding_v3",
  "soap_opera",
  "seinfeld",
  "challenge",
]);

const REFERRER_HOSTS_SOLUTION_AWARE = [
  "reddit.com",
  "old.reddit.com",
  "indiehackers.com",
  "www.indiehackers.com",
  "news.ycombinator.com",
];

const REFERRER_HOSTS_PRODUCT_AWARE: readonly string[] = [
  // Vercel / Resend / our own re-engagement surfaces would land here in the
  // future; today this is the empty list. Product-aware traffic is gated by
  // explicit source token, not by referrer host.
];

/**
 * Resolve the hook variant from incoming request signals.
 *
 *   1. Explicit ?h=contrarian|guarantee|default short-circuit (Brunson
 *      manual override for direct A/B experiments).
 *   2. ?utm_source / ?source token match.
 *   3. Referrer hostname match.
 *   4. Default to Hook #3 (pain mirror).
 */
export function resolveHookVariant(input: {
  searchParams?: Record<string, string | string[] | undefined> | undefined;
  referer?: string | null | undefined;
}): DiagnosticHookVariantProps {
  const sp = input.searchParams ?? {};

  // 1. Explicit override.
  const explicit = stringParam(sp.h ?? sp.hook);
  if (
    explicit === "contrarian" ||
    explicit === "guarantee" ||
    explicit === "default"
  ) {
    return {
      variant: explicit,
      source: stringParam(sp.utm_source ?? sp.source) ?? `explicit:${explicit}`,
    };
  }

  // 2. UTM / source token.
  const sourceToken = (
    stringParam(sp.utm_source) ??
    stringParam(sp.source) ??
    ""
  )
    .toLowerCase()
    .trim();

  if (sourceToken) {
    if (PRODUCT_AWARE_SOURCES.has(sourceToken)) {
      return { variant: "guarantee", source: sourceToken };
    }
    if (SOLUTION_AWARE_SOURCES.has(sourceToken)) {
      return { variant: "contrarian", source: sourceToken };
    }
  }

  // 3. Referrer hostname.
  const refererHost = parseHost(input.referer ?? null);
  if (refererHost) {
    if (REFERRER_HOSTS_PRODUCT_AWARE.includes(refererHost)) {
      return { variant: "guarantee", source: `ref:${refererHost}` };
    }
    if (REFERRER_HOSTS_SOLUTION_AWARE.includes(refererHost)) {
      return { variant: "contrarian", source: `ref:${refererHost}` };
    }
  }

  // 4. Default.
  return {
    variant: "default",
    source: sourceToken || (refererHost ? `ref:${refererHost}` : "direct"),
  };
}

function stringParam(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v.trim() || undefined;
  if (Array.isArray(v)) return v[0]?.trim() || undefined;
  return undefined;
}

function parseHost(referer: string | null): string | null {
  if (!referer) return null;
  try {
    return new URL(referer).hostname.toLowerCase();
  } catch {
    return null;
  }
}
