/**
 * DirectAnswer — the canonical "above-the-fold" speakable answer block for
 * every pSEO surface.
 *
 * Why this component exists
 * -------------------------
 * AI Overviews (Google), Perplexity, ChatGPT browse, and Claude search all
 * give disproportionate weight to the FIRST in-body paragraph that reads
 * like a complete, self-contained answer to the page's H1. A key/value
 * table (TldrSummary) is great for entity extraction but is _not_ what
 * those engines lift verbatim into a Featured Snippet or AI Overview.
 *
 * DirectAnswer renders one Card + one speakable <p> (via DateStampedAnswer)
 * with consistent visual treatment, microdata-friendly attributes, and the
 * lead-phrase variants we already use across DateStampedAnswer. It is the
 * single source of truth for the "this paragraph is the answer" surface so
 * every pSEO hub renders the same shape — funnel-teardown, pricing-teardown,
 * vs, alternatives-to, why-isnt-my, scripts, conversion-rate, swipe-file,
 * stack-for, funnel-playbook, launch-checklist, pricing-page-examples,
 * category, for, post-mortem, etc.
 *
 * Visual position contract
 * ------------------------
 *   <header> H1 + one-line subtitle
 *   <Separator />
 *   <DirectAnswer />        ← THIS (40–60 word speakable paragraph)
 *   <TldrSummary />         ← key/value entity table (separate concern)
 *   ... body sections
 *
 * Extraction attributes
 * ---------------------
 * The wrapper carries:
 *   - aria-labelledby pointing at a sr-only heading (a11y)
 *   - data-direct-answer="true" — flat semantic flag for any crawler
 *   - data-speakable={slot} on the inner div — matches SPEAKABLE_SELECTORS
 *   - data-llm-summary — same handle TldrSummary uses, so the two surfaces
 *     are picked up together by an LLM doing a one-shot summary lift.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabrication: children come from the originating catalog's canonical
 *     TL;DR field (tldr / verdict / diagnosis / directAnswer / shortDefinition).
 *   - lastVerified is the same ISO date wired into the page's Article
 *     datePublished/dateModified — provenance is single-sourced.
 */

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DateStampedAnswer,
  type DateStampedVariant,
} from "@/components/seo/date-stamped-answer";

/**
 * Default heading label per variant. Hubs may override via `headingLabel`
 * when the surface uses different language (e.g. "Quick take" instead of
 * "TL;DR").
 */
const HEADING_LABELS: Record<DateStampedVariant, string> = {
  answer: "Direct answer",
  definition: "Short definition",
  benchmark: "Benchmark",
  diagnosis: "Diagnosis",
  verdict: "Verdict",
  tldr: "TL;DR",
  takeaway: "Takeaway",
};

export interface DirectAnswerProps {
  /**
   * ISO 8601 date (YYYY-MM-DD), almost always entry.lastVerified. Wired
   * through to the inner DateStampedAnswer so the visible "As of X"
   * lead matches the Article schema's datePublished/dateModified stamp.
   */
  lastVerified: string;
  /**
   * Lead-phrase variant. Picks the wording inside DateStampedAnswer
   * ("the answer is" / "the verdict is" / "the short version is" / etc.)
   */
  variant?: DateStampedVariant;
  /** Override the lead-phrase entirely. Pass-through to DateStampedAnswer. */
  customLead?: string;
  /**
   * Visible eyebrow label rendered above the answer paragraph. Falls back
   * to HEADING_LABELS[variant] when omitted.
   */
  headingLabel?: string;
  /**
   * id used by aria-labelledby on the section. Must be unique per page.
   * Default "direct-answer" works for any page that hosts a single
   * DirectAnswer; pages with multiple should pass an explicit id.
   */
  headingId?: string;
  /**
   * Optional data-speakable slot value. Defaults to "direct-answer", which
   * matches the SPEAKABLE_SELECTORS list used by json-ld.tsx.
   */
  speakableSlot?: string;
  /** Extra className appended to the outer <section>. */
  className?: string;
  /**
   * The canonical answer body (40–60 words). Plain string preferred so the
   * speakable span stays flat (voice engines fall through nested blocks).
   */
  children: ReactNode;
}

/**
 * Render the canonical "above-the-fold" speakable answer paragraph for a
 * pSEO surface. Sits between the page header and the TldrSummary table.
 */
export function DirectAnswer({
  lastVerified,
  variant = "tldr",
  customLead,
  headingLabel,
  headingId = "direct-answer",
  speakableSlot = "direct-answer",
  className,
  children,
}: DirectAnswerProps) {
  const eyebrow = headingLabel ?? HEADING_LABELS[variant];

  return (
    <section
      className={
        "max-w-3xl mx-auto px-6 py-6" + (className ? ` ${className}` : "")
      }
      aria-labelledby={headingId}
      data-direct-answer="true"
    >
      <h2 id={headingId} className="sr-only">
        {eyebrow}
      </h2>
      <Card className="border-primary/40 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-xs uppercase tracking-widest text-primary mb-3">
            {eyebrow}
          </p>
          <div data-speakable={speakableSlot} data-llm-summary>
            <DateStampedAnswer
              lastVerified={lastVerified}
              variant={variant}
              customLead={customLead}
            >
              {children}
            </DateStampedAnswer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
