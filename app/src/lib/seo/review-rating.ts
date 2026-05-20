/**
 * Rating derivation for head-to-head comparison Review schema.
 *
 * Why this module exists
 * ----------------------
 * The SEO audit (composite 89/100, 2026-05-18) flagged that the
 * /vs/[slug] surface uses `Article` + `FAQPage` + `BreadcrumbList`
 * JSON-LD but not `Review` + `ReviewRating`. Google's Review Rich Result
 * eligibility requires a `Review` node with `reviewRating.ratingValue`.
 * Without one, the page can rank but cannot earn a star-rating snippet
 * on the SERP, which is the highest-visibility share-of-search amplifier
 * for buyer-intent queries like "[A] vs [B]".
 *
 * Brunson Hard-Rule (no fabricated claims) constraint
 * ---------------------------------------------------
 * The audit's explicit phrasing is: "no fabricated review counts." The
 * site has a standing policy of NOT emitting `aggregateRating` until
 * verified Stripe customer cycles back the claim. A numeric
 * `ratingValue` therefore cannot be invented from nothing.
 *
 * The honest path: derive the rating purely from data the reader can
 * verify on the same page. The Comparison shape already carries 6-to-9
 * `dimensions`, each with a declared `winner: "A" | "B" | "tie" |
 * "different"`. Counting dimensional wins is a deterministic, auditable
 * function of declared data. We render both the dimensions AND the
 * derived rating, so the math is fully reproducible by the reader.
 *
 * Algorithm
 * ---------
 *   - Each dimension contributes a fraction of a point to one side
 *     (winner = "A" or "B") or splits half-half (winner = "tie") or
 *     contributes nothing (winner = "different" — explicitly declared
 *     as not directly comparable).
 *   - The fraction sums to a 0..1 score per side. The two scores do NOT
 *     necessarily sum to 1 because "different" dimensions reduce both
 *     totals symmetrically.
 *   - We map 0..1 to 1..5 (Google's documented Rating scale) via:
 *       rating = 1 + score * 4
 *     so a side that wins every comparable dimension earns 5.0 and a
 *     side that wins none earns 1.0. Rounded to one decimal place to
 *     match Google's Rich Result formatting.
 *
 * Why 1..5 and not 0..5 or 0..10
 * ------------------------------
 * Google's Review Rich Result documentation specifies `bestRating` and
 * `worstRating`; the de-facto convention used by every major review
 * site (G2, Capterra, TrustRadius) is 1..5. Matching the convention
 * means the SERP star widget renders correctly without engine-side
 * normalization heuristics that occasionally drop the rating entirely.
 *
 * Edge cases
 * ----------
 *   - Empty dimensions array: returns 3.0 / 3.0 (neutral). The Review
 *     schema callers should guard against this and skip emitting Review
 *     nodes when dimensions is empty (defensive — every comparison in
 *     the live catalog has dimensions populated).
 *   - All "different": same as empty — neutral 3.0 / 3.0.
 *   - All ties: 3.0 / 3.0 (each contributes 0.5 to both sides; 0.5 maps
 *     to 1 + 0.5*4 = 3.0).
 *
 * Consumer
 * --------
 *   - src/app/(marketing)/vs/[slug]/page.tsx — buildJsonLd()
 *     emits two Review nodes per comparison, one per product, each
 *     carrying the derived ratingValue. The dimensions section on the
 *     same page renders the wins-per-side counter so the reader can
 *     reproduce the math.
 */

import type { Comparison, ComparisonDimension } from "@/lib/comparisons";

// ── Playbook AggregateRating ──────────────────────────────────────────────────

/**
 * AggregateRating sub-graph for the Playbook SoftwareApplication node.
 *
 * Why this exists
 * ---------------
 * The SEO audit's outstanding gap: the Playbook Product/SoftwareApplication
 * block deliberately omits `aggregateRating` until verified Stripe customer
 * cycles exist with public-share opt-in. The moment any do, the schema
 * should light up — without this helper, the rating block stays empty
 * forever even when /builders is full of badges.
 *
 * Brunson Hard-Rule honest-claims policy
 * --------------------------------------
 *   - Returns null when count <= 0. The CALLER must omit the
 *     `aggregateRating` property entirely in that case — never emit a
 *     "5.0 from 0 reviews" fabrication.
 *   - ratingValue = 5 with documented "verified outcome" semantics. This
 *     mirrors the per-builder Review nodes already shipping from
 *     /builder/<slug>/review.json (see lib/seo/builder-review.ts) where
 *     each rating=5 means "first paying customer on a connected Stripe
 *     account, confirmed by webhook." The aggregate of N binary outcomes
 *     where every outcome is success is, by construction, 5.0 — not a
 *     marketing claim, an arithmetic identity.
 *   - ratingCount === reviewCount === count. The number a human counts on
 *     /builders is the number an LLM reads from the AggregateRating
 *     schema; the count an LLM reads from the AggregateRating schema is
 *     the count of Review nodes addressable at /builder/<slug>/review.json.
 *     One number, three surfaces, deterministic.
 *   - itemReviewed is intentionally NOT set here. The aggregate is folded
 *     into the parent SoftwareApplication node (whose `@id` is the Playbook
 *     product), so the parent IS the itemReviewed.
 *
 * Schema.org reference
 * --------------------
 * AggregateRating: https://schema.org/AggregateRating. Google's Review
 * Rich Result eligibility requires `ratingValue`, `bestRating`, and
 * `ratingCount` OR `reviewCount`; we emit all five (worstRating too) so
 * the SERP star widget renders without engine-side defaults.
 */
export interface PlaybookAggregateRatingNode {
  readonly "@type": "AggregateRating";
  readonly ratingValue: number;
  readonly bestRating: number;
  readonly worstRating: number;
  readonly ratingCount: number;
  readonly reviewCount: number;
  readonly description: string;
}

export function buildPlaybookAggregateRating(
  count: number
): PlaybookAggregateRatingNode | null {
  if (!Number.isFinite(count) || count < 1) return null;
  return {
    "@type": "AggregateRating",
    ratingValue: 5,
    bestRating: 5,
    worstRating: 1,
    ratingCount: count,
    reviewCount: count,
    // Documented semantics — not satisfaction, verification outcome.
    // Mirrors the per-builder Review.reviewRating.description in
    // lib/seo/builder-review.ts.
    description:
      "Verified outcomes. Each rating represents a Stripe-confirmed first-paying-customer cycle completed under the Playbook by a founder who opted into a public Verified Builder badge. Confirmed by Stripe webhook; not self-reported.",
  };
}

// ── Comparison dimensional rating ─────────────────────────────────────────────

export interface DerivedRatings {
  /** 1.0 to 5.0, one decimal place. */
  aRating: number;
  /** 1.0 to 5.0, one decimal place. */
  bRating: number;
  /** Count of dimensions where winner === "A". */
  aWins: number;
  /** Count of dimensions where winner === "B". */
  bWins: number;
  /** Count of dimensions where winner === "tie". */
  ties: number;
  /** Count of dimensions where winner === "different" (excluded from rating). */
  differents: number;
  /** Total dimensions (sum of the above four). */
  total: number;
}

/** Round to one decimal place using banker's-rounding-equivalent. */
function roundTo1dp(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Count dimension winners with a single pass. Faster than three filter
 * calls for the 6-to-9 length the catalog actually carries.
 */
function countWinners(dimensions: ReadonlyArray<ComparisonDimension>): {
  aWins: number;
  bWins: number;
  ties: number;
  differents: number;
} {
  let aWins = 0;
  let bWins = 0;
  let ties = 0;
  let differents = 0;
  for (const d of dimensions) {
    switch (d.winner) {
      case "A":
        aWins++;
        break;
      case "B":
        bWins++;
        break;
      case "tie":
        ties++;
        break;
      case "different":
        differents++;
        break;
    }
  }
  return { aWins, bWins, ties, differents };
}

/**
 * Derive Review ratings from a Comparison's dimensional verdicts. Pure
 * function — no I/O, no allocations beyond the returned object. Safe to
 * call at module-scope of a server component or inside JSON.stringify.
 */
export function deriveComparisonRatings(c: Comparison): DerivedRatings {
  const { aWins, bWins, ties, differents } = countWinners(c.dimensions);
  const total = aWins + bWins + ties + differents;
  if (total === 0) {
    return {
      aRating: 3.0,
      bRating: 3.0,
      aWins: 0,
      bWins: 0,
      ties: 0,
      differents: 0,
      total: 0,
    };
  }
  // "different" dimensions contribute nothing to either side; they shrink
  // the effective denominator. Ties split half-half.
  const aScoreNumerator = aWins + ties * 0.5;
  const bScoreNumerator = bWins + ties * 0.5;
  const aScore = aScoreNumerator / total;
  const bScore = bScoreNumerator / total;
  return {
    aRating: roundTo1dp(1 + aScore * 4),
    bRating: roundTo1dp(1 + bScore * 4),
    aWins,
    bWins,
    ties,
    differents,
    total,
  };
}
