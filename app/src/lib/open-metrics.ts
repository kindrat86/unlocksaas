/**
 * /open transparency page — aggregate metrics.
 *
 * Powers the build-in-public dashboard at /open. Pulls MRR, active subs,
 * lifetime signups, diagnostic completions, 30-day churn, and the last
 * 10 customers (first name + joined month) from the local Supabase mirror
 * of Stripe state — no live Stripe API calls in the hot path.
 *
 * Why local-only:
 *   - Page is rendered behind `'use cache'` (cacheLife minutes). A round-trip
 *     to Stripe per render would spike Active CPU and rate-limit on launch
 *     traffic.
 *   - Supabase mirror is updated by the Stripe webhook idempotently; the
 *     webhook also fires `revalidateTag("billing-mutation", "max")` (Next 16
 *     two-arg form — the second arg is a cacheLife profile) so the page goes
 *     fresh within the next request.
 *
 * Privacy:
 *   - FOUNDER.email (maryan@unlocksaas.com) is excluded from every aggregate
 *     and from the recent-builders list. Per feedback_display_timezone +
 *     project_unlocksaas_founder_identifiers — the founder is not a customer.
 *   - Recent builders show derived first-name only (email local-part,
 *     normalized). Generic role addresses ("info@", "admin@", etc.) collapse
 *     to "Builder" so we never publish someone's full email handle by
 *     accident.
 *
 * Empty-state honesty (per feedback_unlocksaas_visual_style):
 *   - Pre-launch this returns zeros. The page surfaces them honestly rather
 *     than fudging or hiding the section. Build-in-public is not pretending.
 */

import { cacheLife, cacheTag } from "next/cache";
import {
  createAdminClient,
  hasSupabaseAdminEnv,
} from "@/lib/supabase/server";
import { FOUNDER } from "@/lib/seo/entity";

/** $49/mo Core, locked in project_unlocksaas_stripe.md. In cents to match Stripe. */
export const CORE_PRICE_CENTS = 4900;
/** $1 Starter, locked in project_unlocksaas_stripe.md. */
export const STARTER_PRICE_CENTS = 100;

const FOUNDER_EMAIL = FOUNDER.email.toLowerCase();

function emptyOpenMetrics(generatedAt = new Date().toISOString()): OpenMetrics {
  return {
    activeCoreCount: 0,
    activeStarterCount: 0,
    mrrCents: 0,
    diagnosticCompletions: 0,
    lifetimeStartersPaid: 0,
    lifetimeCoresStarted: 0,
    churn30dPercent: null,
    canceledLast30d: 0,
    recentBuilders: [],
    generatedAt,
  };
}

/** Role-style local-parts that should never be published as a person's name. */
const ROLE_LOCAL_PARTS = new Set([
  "info", "admin", "hello", "hi", "contact", "support",
  "team", "sales", "marketing", "billing", "founder",
  "noreply", "no-reply", "press", "help", "ops",
]);

export interface RecentBuilder {
  /** Derived first name or "Builder" fallback. */
  firstName: string;
  /** ISO date when they entered the funnel (starter_purchased_at or core_started_at). */
  joinedAt: string;
  /** "starter" | "core". */
  tier: "starter" | "core";
}

export interface OpenMetrics {
  /** Active Core subscribers count (tier='core', not canceled). */
  activeCoreCount: number;
  /** Active Starter-only count (tier='starter'). */
  activeStarterCount: number;
  /** Lifetime Stripe MRR in cents (active core × $49). */
  mrrCents: number;
  /** Lifetime diagnostic_leads count (every email handed over). */
  diagnosticCompletions: number;
  /** Lifetime paid Starters (anyone who ever paid the $1). */
  lifetimeStartersPaid: number;
  /** Lifetime Cores started (anyone who ever paid for $49 once). */
  lifetimeCoresStarted: number;
  /**
   * 30-day net churn as a percentage. null if there were no active Cores
   * 30 days ago (cannot compute a rate from zero).
   */
  churn30dPercent: number | null;
  /** Number of Cores canceled in the last 30 days (numerator of churn rate). */
  canceledLast30d: number;
  /** Last 10 customers (first name + joined date + tier). Founder excluded. */
  recentBuilders: RecentBuilder[];
  /** When the snapshot was computed (ISO UTC). */
  generatedAt: string;
}

/**
 * Cached metrics. Wrapped in `'use cache'` so the dashboard is essentially
 * free per render; revalidated by the Stripe webhook via cacheTag.
 */
export async function getOpenMetrics(): Promise<OpenMetrics> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 1800 });
  cacheTag("open-metrics", "billing-mutation");

  if (!hasSupabaseAdminEnv()) {
    return emptyOpenMetrics();
  }

  const admin = createAdminClient();
  const now = new Date();
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgoIso = new Date(now.getTime() - THIRTY_DAYS_MS).toISOString();

  // ── parallel queries against the local Stripe mirror ──────────────────────
  // Service role client, bypasses RLS. Founder email excluded at the query
  // level so the aggregates can never accidentally include Maryan's own
  // test transactions.
  const [
    activeCoreRes,
    activeStarterRes,
    diagnosticCountRes,
    lifetimeStartersRes,
    lifetimeCoresRes,
    canceledLast30Res,
    activeCoreThirtyDaysAgoRes,
    recentRes,
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("tier", "core")
      .neq("email", FOUNDER_EMAIL),

    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("tier", "starter")
      .neq("email", FOUNDER_EMAIL),

    admin
      .from("diagnostic_leads")
      .select("*", { count: "exact", head: true })
      .neq("email", FOUNDER_EMAIL),

    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("starter_purchased_at", "is", null)
      .neq("email", FOUNDER_EMAIL),

    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("core_started_at", "is", null)
      .neq("email", FOUNDER_EMAIL),

    admin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("canceled_at", thirtyDaysAgoIso)
      .neq("email", FOUNDER_EMAIL),

    // Active-30-days-ago = "Core started 30+ days ago AND
    // (still active OR cancelled after the 30-day-ago mark)".
    // Approximated by Cores that started 30+ days ago and are not yet
    // canceled before that cutoff. Good enough for a public churn number.
    admin
      .from("profiles")
      .select("id, canceled_at, core_started_at")
      .not("core_started_at", "is", null)
      .lte("core_started_at", thirtyDaysAgoIso)
      .neq("email", FOUNDER_EMAIL),

    admin
      .from("profiles")
      .select("email, tier, starter_purchased_at, core_started_at")
      .or("starter_purchased_at.not.is.null,core_started_at.not.is.null")
      .neq("email", FOUNDER_EMAIL)
      .order("core_started_at", { ascending: false, nullsFirst: false })
      .limit(20), // over-fetch a bit so we can dedupe/sort by greatest()
  ]);

  const activeCoreCount = activeCoreRes.count ?? 0;
  const activeStarterCount = activeStarterRes.count ?? 0;
  const diagnosticCompletions = diagnosticCountRes.count ?? 0;
  const lifetimeStartersPaid = lifetimeStartersRes.count ?? 0;
  const lifetimeCoresStarted = lifetimeCoresRes.count ?? 0;
  const canceledLast30d = canceledLast30Res.count ?? 0;

  // Churn denominator: rows that were on Core 30 days ago.
  const activeThirtyAgoRows = (activeCoreThirtyDaysAgoRes.data ?? []) as Array<{
    canceled_at: string | null;
    core_started_at: string | null;
  }>;
  const activeThirtyAgoCount = activeThirtyAgoRows.filter((r) => {
    if (!r.canceled_at) return true;
    return r.canceled_at > thirtyDaysAgoIso;
  }).length;

  const churn30dPercent =
    activeThirtyAgoCount > 0
      ? Math.round((canceledLast30d / activeThirtyAgoCount) * 1000) / 10
      : null;

  // Recent builders — sort by max(starter_purchased_at, core_started_at) desc,
  // then take 10. Done in JS so we don't need a generated column on the table.
  const recentRows = (recentRes.data ?? []) as Array<{
    email: string;
    tier: "none" | "starter" | "core";
    starter_purchased_at: string | null;
    core_started_at: string | null;
  }>;
  const recentBuilders: RecentBuilder[] = recentRows
    .map((row) => {
      const joinedAt =
        row.core_started_at && row.starter_purchased_at
          ? row.core_started_at > row.starter_purchased_at
            ? row.core_started_at
            : row.starter_purchased_at
          : row.core_started_at ?? row.starter_purchased_at ?? null;
      return joinedAt
        ? {
            firstName: deriveFirstName(row.email),
            joinedAt,
            tier: row.tier === "core" ? ("core" as const) : ("starter" as const),
          }
        : null;
    })
    .filter((b): b is RecentBuilder => b !== null)
    .sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1))
    .slice(0, 10);

  return {
    activeCoreCount,
    activeStarterCount,
    mrrCents: activeCoreCount * CORE_PRICE_CENTS,
    diagnosticCompletions,
    lifetimeStartersPaid,
    lifetimeCoresStarted,
    churn30dPercent,
    canceledLast30d,
    recentBuilders,
    generatedAt: now.toISOString(),
  };
}

/**
 * Take an email and return a publishable first name.
 *
 *   "anna@x.com"          → "Anna"
 *   "anna.smith@x.com"    → "Anna"
 *   "anna-smith@x.com"    → "Anna"
 *   "anna+tag@x.com"      → "Anna"
 *   "anna_smith42@x.com"  → "Anna"
 *   "info@x.com"          → "Builder"   (role address)
 *   "abc123@x.com"        → "Builder"   (digits in the would-be name)
 *   "x@y.com"             → "Builder"   (too short)
 */
export function deriveFirstName(email: string): string {
  const local = (email.split("@")[0] ?? "").toLowerCase();
  if (!local) return "Builder";

  // Take everything before the first delimiter ('.', '-', '_', '+').
  const head = local.split(/[._\-+]/)[0] ?? "";
  if (!head) return "Builder";

  if (ROLE_LOCAL_PARTS.has(head)) return "Builder";
  if (/\d/.test(head)) return "Builder";
  if (head.length < 2 || head.length > 16) return "Builder";

  return head.charAt(0).toUpperCase() + head.slice(1);
}

/** Display MRR like "$245" with no decimals. Pre-launch zero shows "$0". */
export function formatMrr(cents: number): string {
  const dollars = Math.round(cents / 100);
  return `$${dollars.toLocaleString("en-US")}`;
}

/**
 * Athens-time human label for "joined Month Year".
 * Per feedback_display_timezone — operator-facing surfaces show times in
 * Europe/Athens; the underlying ISO stays UTC.
 */
export function formatJoinedMonth(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Athens",
  }).format(d);
}

/**
 * Athens-time DD-MM-YYYY HH:MM:SS for the "Last updated" footer.
 * Per feedback_display_timezone — locked format.
 */
export function formatAthensTimestamp(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Europe/Athens",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get(
    "minute"
  )}:${get("second")}`;
}
