/**
 * Teardown-courtesy target registry.
 *
 * Unifies the funnel-teardown and pricing-teardown catalogs into a single
 * CourtesyTarget shape so the seed + cron + template code can treat them
 * polymorphically. Adding a new catalog (e.g. /vs) means extending
 * the `catalog` union in BOTH this module AND the migration's
 * check constraint — kept in sync deliberately, no auto-broadening.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Praise lines are picked VERBATIM from the source catalog's
 *     whatsWorking[] (funnel) or whatsWorking[]/equivalent. No LLM, no
 *     paraphrase. If the catalog claim is wrong, the email is wrong, and
 *     /editorial-policy's corrections log is the proof loop.
 *   - greeting is PARSED, not invented. If the parser cannot extract a
 *     first-name list, greeting is null and the seed marks the row as
 *     "needs operator greeting" — the cron then refuses to send it.
 *
 * Phase 1 ships funnel-teardown only. Pricing-teardown adapter is stubbed
 * for symmetry but its whatsWorking[] equivalent is the per-tier analysis;
 * wiring that in is a follow-up that does not affect the funnel batch.
 */

import { TEARDOWNS, type FunnelTeardown } from "@/lib/funnel-teardowns";

/** Source catalog identifier. Mirrors the SQL check constraint. */
export type CourtesyCatalog = "funnel-teardown" | "pricing-teardown";

/** Unified shape consumed by the template + cron + seeder. */
export interface CourtesyTarget {
  catalog: CourtesyCatalog;
  slug: string;
  displayName: string;
  /** Raw catalog `creator` string ("Marie Martens and Filip Minev"). */
  creatorRaw?: string;
  /** Parsed greeting candidate ("Marie and Filip"). null = operator must fill in. */
  greeting: string | null;
  /** Canonical homepage URL from the catalog. */
  homepageUrl?: string;
  /**
   * The three praise lines, picked verbatim from the source catalog. We
   * surface the source field name + index so the audit log can prove
   * which catalog row was the source if a claim is ever disputed.
   */
  praises: ReadonlyArray<{ text: string; sourceField: string; sourceIndex: number }>;
  /** Public URL of the teardown itself. */
  teardownUrl: string;
}

const BASE = "https://unlocksaas.com";

/**
 * Parse a catalog `creator` string into a first-name-list greeting.
 *
 * Heuristic, conservative, refuses ambiguity:
 *   "Marie Martens and Filip Minev"            -> "Marie and Filip"
 *   "Tyler Denk"                               -> "Tyler"
 *   "Wes Bos and team"                         -> "Wes"
 *   "Tella team"                               -> null  (no first-name, operator decides)
 *   "JR Farr and team (acquired by Stripe in 2024)" -> "JR"
 *   "Ivan Zhao, Simon Last and team"           -> "Ivan and Simon"
 *   undefined                                  -> null
 *
 * The cron MUST NOT send a row with null greeting — the operator either
 * writes a custom greeting in the targets row or marks it skipped.
 */
export function parseGreeting(creatorRaw: string | undefined): string | null {
  if (!creatorRaw) return null;

  // Strip parenthetical notes ("acquired by Stripe in 2024", "co-founder"...).
  const cleaned = creatorRaw.replace(/\s*\([^)]*\)\s*/g, " ").trim();

  // Split on commas AND " and ". This handles "Ivan, Simon and team".
  const tokens = cleaned
    .split(/,|\s+and\s+/i)
    .map((t) => t.trim())
    .filter(Boolean);

  // Reject tokens that look like role descriptors, not first names.
  const isRealName = (token: string): boolean => {
    const lower = token.toLowerCase();
    if (lower === "team" || lower === "co" || lower === "co-founder") return false;
    if (lower.endsWith(" team")) return false;
    if (/^the\s+/.test(lower)) return false;
    return true;
  };

  const firstNames = tokens
    .filter(isRealName)
    .map((token) => {
      // "Marie Martens" -> "Marie". Single-word tokens ("Tyler") pass through.
      const first = token.split(/\s+/)[0];
      return first;
    })
    // Single-letter "first names" are almost always artifacts ("J" from
    // "J.R."). Drop them rather than greet "Hey J,".
    .filter((n) => n.length >= 2)
    // "JR Farr" -> "JR" is valid; we keep tokens >= 2 chars.
    .slice(0, 3); // Never greet more than three names by first name.

  if (firstNames.length === 0) return null;
  if (firstNames.length === 1) return firstNames[0];
  if (firstNames.length === 2) return `${firstNames[0]} and ${firstNames[1]}`;
  return `${firstNames.slice(0, -1).join(", ")} and ${firstNames[firstNames.length - 1]}`;
}

/**
 * Adapter: FunnelTeardown -> CourtesyTarget.
 *
 * Picks the first three entries from whatsWorking[] verbatim. The
 * catalog promises 5-7 entries per teardown, ordered most-important-first
 * by editorial convention. If a teardown ever ships fewer than three
 * entries, we surface fewer rather than back-fill.
 */
function funnelTeardownToTarget(t: FunnelTeardown): CourtesyTarget {
  const praises = t.whatsWorking.slice(0, 3).map((text, sourceIndex) => ({
    text,
    sourceField: "whatsWorking",
    sourceIndex,
  }));

  return {
    catalog: "funnel-teardown",
    slug: t.slug,
    displayName: t.displayName,
    creatorRaw: t.creator,
    greeting: parseGreeting(t.creator),
    homepageUrl: t.homepageUrl,
    praises,
    teardownUrl: `${BASE}/funnel-teardown/${t.slug}`,
  };
}

/**
 * Every funnel-teardown row, ordered as in the catalog. Used by the seed
 * route to populate teardown_courtesy_targets.
 */
export function getAllFunnelTargets(): ReadonlyArray<CourtesyTarget> {
  return TEARDOWNS.map(funnelTeardownToTarget);
}

/**
 * One target by (catalog, slug). Used by the preview + cron rebuilds.
 * Phase 1 only knows the funnel-teardown catalog.
 */
export function getTargetByCatalogSlug(
  catalog: CourtesyCatalog,
  slug: string,
): CourtesyTarget | null {
  if (catalog === "funnel-teardown") {
    const t = TEARDOWNS.find((x) => x.slug === slug);
    return t ? funnelTeardownToTarget(t) : null;
  }
  // Pricing-teardown adapter not yet wired (see file header).
  return null;
}
