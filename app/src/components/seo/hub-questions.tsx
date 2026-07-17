import type { ReactNode } from "react";

/**
 * `<HubQuestions>` – visible question-and-answer section for hub pages.
 *
 * Why this exists (G3 extractability audit, 2026-07-17)
 * -----------------------------------------------------
 * Answer engines treat a page as "extractable" when it carries either a
 * table, two or more question-form headings, or several short factual
 * sentences. The hub pages carry rich ItemList grids but almost no
 * question-form headings, so retrievers had nothing to anchor a direct
 * answer to. This block renders each question as a real `<h3>` ending
 * in "?" followed by a single 40-60 word answer paragraph — the exact
 * shape featured-snippet and AI-overview extractors quote.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Answers must only restate facts the page (or its data module) already
 * declares — counts come from the live data arrays, never hard-coded.
 * No fabricated benchmarks, no invented claims. Callers pass JSX so
 * dynamic counts and internal links stay first-class.
 */
export interface HubQuestion {
  /** Question phrased as the reader would ask it. Must end with "?". */
  q: string;
  /** One direct answer paragraph, 40-60 words, citation-ready. */
  a: ReactNode;
}

export interface HubQuestionsProps {
  /** Stable id for aria-labelledby anchoring. */
  headingId?: string;
  /** Visible section heading. */
  heading?: string;
  questions: ReadonlyArray<HubQuestion>;
}

export function HubQuestions({
  headingId = "common-questions",
  heading = "Common questions",
  questions,
}: HubQuestionsProps) {
  if (questions.length === 0) return null;
  return (
    <section
      className="max-w-3xl mx-auto px-6 py-10"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="text-2xl font-bold mb-6 leading-tight">
        {heading}
      </h2>
      <div className="space-y-8">
        {questions.map((item) => (
          <div key={item.q}>
            <h3 className="text-lg font-semibold mb-2 leading-snug">
              {item.q}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
