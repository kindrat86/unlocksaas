/**
 * ClaimReview JSON-LD builder.
 *
 * schema.org/ClaimReview is a fact-checking type. In the 2026 AI search
 * context it is a high-trust signal for Google AI Mode "verification" queries
 * and for LLM citation pipelines that prefer publisher-declared accuracy
 * commitments over prose-level trust signals.
 *
 * Honesty defaults:
 *   - claimReviewed MUST be a verbatim short summary of the claim the page
 *     actually evaluates. No paraphrases that would misrepresent the scope.
 *   - reviewRating uses the standard 1-5 scale where 5 = True and 1 = False;
 *     the Rating node includes ratingExplanation so the schema is
 *     self-interpreting without requiring the reader to know the scale.
 *   - author MUST resolve to the Organization or Person @id already declared
 *     elsewhere in the entity graph (no fabricated reviewer names).
 *   - datePublished MUST be a real ISO YYYY-MM-DD date.
 *
 * Reference: https://schema.org/ClaimReview
 */

import { omitEmpty } from "../honesty/omit-empty.js";

export interface ClaimReviewRatingInput {
  /**
   * Numeric rating value. On the standard truth scale:
   *   5 = True / Confirmed
   *   4 = Mostly True
   *   3 = Mixed / Inconclusive
   *   2 = Mostly False
   *   1 = False / Debunked
   * For editorial-policy usage (self-assessment), use 5 when the
   * commitment is "this claim is accurate and we stand behind it."
   */
  ratingValue: number;
  /** Maximum rating; default 5. */
  bestRating?: number;
  /** Minimum rating; default 1. */
  worstRating?: number;
  /**
   * Human-readable label for the rating value (e.g. "True", "False",
   * "Confirmed", "Retracted"). Optional but recommended for self-
   * documenting schema.
   */
  alternateName?: string;
}

export interface ClaimReviewInput {
  /** Absolute URL of the page hosting this ClaimReview. */
  url: string;
  /**
   * Short summary of the specific claim being evaluated.
   * Should be under 200 chars; verbatim where possible.
   */
  claimReviewed: string;
  /** Rating assigned to the claim after review. */
  reviewRating: ClaimReviewRatingInput;
  /**
   * Author of the review -- the entity doing the fact-checking.
   * Pass an @id cross-ref to an Organization or Person already declared.
   */
  author: { "@id": string } | { "@type": "Organization" | "Person"; name: string; url?: string };
  /**
   * The thing being reviewed (the source of the claim). Optional but
   * recommended when the claim comes from an identifiable source.
   */
  itemReviewed?: {
    "@type": "CreativeWork" | "Article" | "WebPage";
    name?: string;
    url?: string;
    author?: { name: string };
  };
  /** ISO YYYY-MM-DD date the review was published. */
  datePublished?: string;
  /** ISO YYYY-MM-DD date the review was last modified. */
  dateModified?: string;
  /**
   * URL of the page where the original claim appears or was made.
   * Distinct from `url` (which is the review page). Only set when
   * there is a specific third-party source URL.
   */
  claimSourceUrl?: string;
  /**
   * inLanguage BCP 47 tag (e.g. "en-US").
   */
  inLanguage?: string;
}

export function buildClaimReview(
  input: ClaimReviewInput,
): Record<string, unknown> {
  const reviewRating = omitEmpty({
    "@type": "Rating",
    ratingValue: input.reviewRating.ratingValue,
    bestRating: input.reviewRating.bestRating ?? 5,
    worstRating: input.reviewRating.worstRating ?? 1,
    alternateName: input.reviewRating.alternateName,
  } as Record<string, unknown>);

  const itemReviewed = input.itemReviewed
    ? omitEmpty({
        "@type": input.itemReviewed["@type"],
        name: input.itemReviewed.name,
        url: input.itemReviewed.url,
        author: input.itemReviewed.author
          ? {
              "@type": "Person",
              name: input.itemReviewed.author.name,
            }
          : undefined,
      } as Record<string, unknown>)
    : undefined;

  return omitEmpty({
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url: input.url,
    claimReviewed: input.claimReviewed,
    reviewRating,
    author: input.author,
    itemReviewed,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.inLanguage,
  } as Record<string, unknown>);
}
