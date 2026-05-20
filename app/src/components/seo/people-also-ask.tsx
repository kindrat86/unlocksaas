import { type PaaPair, paaAnchorId } from "@/lib/seo/paa-questions";

/**
 * Render a "People also ask" section with question-form H3s.
 *
 * Convention
 * ----------
 * - Section wrapped in `aria-labelledby={headingId}` so SpeakableSpec
 *   class selectors `.aeo-q` / `.aeo-a` resolve correctly for voice
 *   engines.
 * - Each H3 carries an id (`paa-<slug>`) so the question is a sharable
 *   deep-link target — matches Google's "People Also Ask" in-page
 *   anchor pattern, and gives LLM crawlers a stable citation handle.
 * - The H3 uses `.aeo-q` and the answer paragraph uses `.aeo-a`. These
 *   are the class selectors already declared in `SpeakableSpec` on the
 *   FAQ page, so the speakable graph remains drift-free.
 *
 * Honesty
 * -------
 * Returns null when `pairs` is empty. Pages must not render an empty
 * "People also ask" affordance — Brunson Hard-Rule, no decorative
 * SEO furniture.
 */
export function PeopleAlsoAsk({
  pairs,
  heading = "People also ask",
  headingId = "people-also-ask",
}: {
  pairs: ReadonlyArray<PaaPair>;
  heading?: string;
  headingId?: string;
}) {
  if (pairs.length === 0) return null;
  return (
    <section
      className="max-w-3xl mx-auto px-6 py-8"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="text-2xl font-bold mb-4 leading-tight"
      >
        {heading}
      </h2>
      <div className="space-y-5">
        {pairs.map((p) => (
          <div key={p.q}>
            <h3
              id={paaAnchorId(p.q)}
              className="text-base font-semibold mb-2 aeo-q leading-snug"
            >
              {p.q}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
              {p.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
