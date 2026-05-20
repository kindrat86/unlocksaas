/**
 * Date-stamped first-line for pSEO answer surfaces.
 *
 * Why this component exists
 * -------------------------
 * Google AI Overviews, Perplexity, ChatGPT browsing, and Claude search all
 * use temporal framing ("As of <date>, …") as a freshness signal when
 * deciding which sentence to extract as the citation. Without an explicit
 * date prefix the model has to guess freshness from the surrounding HTML;
 * with it, the model gets the answer + its provenance in a single span and
 * is much more likely to surface that exact wording in a generated answer.
 *
 * This component renders the leading sentence of every pSEO answer block
 * as one speakable span:
 *
 *   "As of {formattedDate}, the answer is: {children}"
 *
 * Pairs with src/lib/seo/freshness.ts (the site-wide LAST_VERIFIED_DATE
 * stamp) and the per-entry `lastVerified` field on every pSEO catalog.
 * The per-entry date is preferred because it is more granular and is the
 * one already wired into Article datePublished / dateModified for each
 * surface.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - The date is rendered through formatVerifiedDate (en-US "Month D,
 *     YYYY"), the same format used in the "Verified" footer on each
 *     pSEO page. One source of truth, no drift between header and footer.
 *   - The visible <time> tag carries the raw ISO date so machine parsers
 *     read the exact YYYY-MM-DD value while humans read the prose form.
 *   - The lead phrase is variant-driven (answer / definition / benchmark
 *     / diagnosis / verdict) so the wording feels native to each surface
 *     instead of grafted on.
 *   - No fabricated dates: malformed ISO input falls back to the raw
 *     string via formatVerifiedDate's own honest-fallback behaviour.
 */

import type { ReactNode } from "react";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { cn } from "@/lib/utils";

/**
 * The lead-phrase variant. Each pSEO surface picks the one that reads
 * naturally for its content type:
 *
 *   answer     – "/answers/[slug]" direct-answer cards
 *   definition – "/glossary/[slug]" short-definition cards
 *   benchmark  – "/benchmarks/[slug]" benchmark direct-answer cards
 *   diagnosis  – "/why-isnt-my/[slug]" TL;DR diagnosis lead
 *   verdict    – "/compare/[slug]", "/alternatives-to/[slug]" verdicts
 */
export type DateStampedVariant =
  | "answer"
  | "definition"
  | "benchmark"
  | "diagnosis"
  | "verdict";

const LEAD_PHRASES: Record<DateStampedVariant, string> = {
  answer: "the answer is",
  definition: "the short definition is",
  benchmark: "the benchmark is",
  diagnosis: "the diagnosis is",
  verdict: "the verdict is",
};

export interface DateStampedAnswerProps {
  /**
   * ISO 8601 date (YYYY-MM-DD) – almost always entry.lastVerified from
   * the originating pSEO catalog (answers.ts, glossary.ts, benchmarks.ts,
   * why-isnt-my.ts). The same value is already wired into the page's
   * Article datePublished / dateModified, so this keeps the visible
   * prose and the structured-data stamp in lockstep.
   */
  lastVerified: string;
  /**
   * Which lead-phrase variant to render. Defaults to "answer". Pick the
   * one that matches the surface's content type.
   */
  variant?: DateStampedVariant;
  /**
   * Override the lead-phrase entirely when none of the variants fit.
   * The component will render: "As of {date}, {customLead}: {children}".
   * Use this for one-off surfaces; prefer a new variant when the same
   * phrasing repeats across pages.
   */
  customLead?: string;
  /** Optional className passed to the wrapping <p>. */
  className?: string;
  /**
   * The canonical answer body that follows the lead. Must be a plain
   * string or a flat inline ReactNode so the whole <p> stays speakable
   * (no nested block elements – voice engines fall through aria
   * boundaries).
   */
  children: ReactNode;
}

/**
 * Render a date-stamped speakable lead paired with the canonical answer.
 *
 * Output shape:
 *
 *   <p data-speakable>
 *     <span class="font-semibold">
 *       As of <time datetime="2026-05-18">May 18, 2026</time>, the answer is:
 *     </span>{" "}
 *     {children}
 *   </p>
 *
 * The data-speakable attribute matches the [data-speakable] selector in
 * SPEAKABLE_SELECTORS (see src/components/seo/json-ld.tsx) so voice
 * engines and AI Overviews pick up exactly this sentence as the canonical
 * spoken answer.
 */
export function DateStampedAnswer({
  lastVerified,
  variant = "answer",
  customLead,
  className,
  children,
}: DateStampedAnswerProps) {
  const formattedDate = formatVerifiedDate(lastVerified);
  const lead = customLead ?? LEAD_PHRASES[variant];
  return (
    <p
      className={cn("text-base leading-relaxed", className)}
      data-speakable
    >
      <span className="font-semibold">
        As of{" "}
        <time dateTime={lastVerified}>{formattedDate}</time>, {lead}:
      </span>{" "}
      {children}
    </p>
  );
}
