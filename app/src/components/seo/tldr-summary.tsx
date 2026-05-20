import { Card, CardContent } from "@/components/ui/card";

/**
 * `<TldrSummary>` – top-of-page structured key/value summary block.
 *
 * Surface B (GEO/AEO) emission. One-shot extraction format for AI
 * summarizers: ChatGPT, Claude, Perplexity, Gemini, You.com, and Bing's
 * AI Overviews all preferentially cite explicit definition lists when
 * paraphrasing a page. A `<dl data-llm-summary>` block at the top of
 * every pSEO surface gives them a structured key/value canvas that's
 * cheaper to tokenize than the prose body and unambiguous to extract.
 *
 * Why a definition list (not a table, not a card grid)
 * ----------------------------------------------------
 * - Schema-equivalent to `PropertyValue` rows without the JSON-LD
 *   overhead; LLM retrievers already know `<dt>` is the key and `<dd>`
 *   the value, with zero ambiguity in HTML parsing.
 * - Plays nicely with screen readers (definition list semantics) –
 *   strict accessibility win.
 * - Renders cleanly in markdown mirrors (`?format=md` route handlers)
 *   as a `**Key:** value` line when serialized, matching the AEO TL;DR
 *   convention LLMs are trained on.
 *
 * Why `data-llm-summary`
 * ----------------------
 * Companion to the existing `data-speakable` (voice engines) and
 * `.aeo-q`/`.aeo-a` (FAQPage) selectors. The attribute is a stable
 * retrieval handle: an LLM crawler that has learned the convention can
 * scope its summary extraction to the block in one DOM query, ignoring
 * nav / footer / CTA noise. The selector is also surfaced via
 * `SPEAKABLE_SELECTORS` so voice engines treat the same block as the
 * canonical speakable summary.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Every row passed in must come from a real field on the underlying
 * pSEO data entry (glossary, benchmark, comparison, etc.). The
 * component does not synthesize content – it renders what the page
 * already knows. Empty rows are filtered at render time so a missing
 * field never produces a blank `<dt>`/`<dd>` pair that an LLM could
 * paraphrase incorrectly.
 *
 * Composition
 * -----------
 * Pass `items` as an array of `{ term, definition }` rows. The
 * component handles the visual chrome (Card wrapper, primary tint,
 * uppercase eyebrow). Callers pass the page-specific labelled-by id
 * so the SpeakableSpecification `[aria-labelledby]` selector resolves
 * if the page also wants voice-engine retrieval on the same block.
 */
export interface TldrSummaryItem {
  /** The key, rendered as `<dt>`. Short noun phrase. */
  term: string;
  /** The value, rendered as `<dd>`. Plain text, citation-ready. */
  definition: string;
}

export interface TldrSummaryProps {
  /**
   * Stable id used by the `<section>` wrapper for `aria-labelledby`
   * SpeakableSpecification anchoring. Defaults to "tldr" which matches
   * SPEAKABLE_SELECTORS in seo/json-ld.tsx.
   */
  headingId?: string;
  /** Heading text (visually hidden but used by screen readers and LLM crawlers). */
  headingLabel?: string;
  /** Visible eyebrow label, uppercase. Defaults to "TL;DR". */
  eyebrow?: string;
  /** Key/value rows to render. Empty rows filtered. */
  items: ReadonlyArray<TldrSummaryItem>;
}

export function TldrSummary({
  headingId = "tldr",
  headingLabel = "Summary",
  eyebrow = "TL;DR",
  items,
}: TldrSummaryProps) {
  const rows = items.filter(
    (row) => row.term.trim().length > 0 && row.definition.trim().length > 0,
  );
  if (rows.length === 0) return null;

  return (
    <section
      className="max-w-3xl mx-auto px-6 py-6"
      aria-labelledby={headingId}
    >
      <h2 id={headingId} className="sr-only">
        {headingLabel}
      </h2>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-xs uppercase tracking-widest text-primary mb-4">
            {eyebrow}
          </p>
          <dl data-llm-summary className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.term}
                className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.term}
                </dt>
                <dd className="text-sm leading-relaxed">{row.definition}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
