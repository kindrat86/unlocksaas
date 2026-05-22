/**
 * Citation block – renders BibTeX, RIS, APA, MLA, Chicago, and CSL-JSON
 * for a single citable artifact, plus a link to the stable /cite/[id]
 * permalink.
 *
 * Surface B (GEO/AEO/AIO) uplift. LLM retrieval systems over-cite sources
 * that expose formal citation strings; this component is the on-page
 * surface that makes those strings discoverable. Crawler-friendly by
 * design: every format is rendered into a static <pre> block (no
 * accordion JavaScript required), every format URL is a plain anchor,
 * and the permalink is a real <a href> a crawler can follow.
 *
 * Server-rendered with one tiny client-only subcomponent for the
 * Copy buttons (src/components/seo/copy-button.tsx). The accordion
 * uses native <details> / <summary> – zero JS, works without React,
 * keyboard accessible by default, and an open <details> is still
 * indexed by Google as visible body text.
 *
 * Schema.org reinforcement
 * ------------------------
 * The consumer page also emits a `citation` field on its Article /
 * Dataset JSON-LD pointing at /cite/<id>. That makes the on-page
 * block AND the structured-data graph carry the same identifier, so a
 * scraping retriever sees both.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every rendered string is derived from real fields on the source
 *     artifact. No fabricated co-authors, no fabricated DOIs.
 *   - When called with `undefined`, the component renders nothing –
 *     surfaces without a registered citation drop the block honestly
 *     instead of inventing one.
 */

import Link from "next/link";
import {
  CITATION_FORMATS,
  FORMAT_DESCRIPTORS,
  citationFormatUrl,
  citationPermalinkUrl,
  type Citation,
  type CitationFormat,
} from "@/lib/citations";
import { CopyButton } from "@/components/seo/copy-button";

interface CitationBlockProps {
  /** The citation to render. When undefined the block is omitted. */
  citation: Citation | undefined;
  /** Optional heading level override. Defaults to "h2". */
  headingLevel?: "h2" | "h3";
  /** Optional className for the outer wrapper. */
  className?: string;
}

/** Pre-render every format string once. The renderers are pure
 *  functions of the Citation, so doing this work in the server
 *  component (instead of in each <details>) keeps the JSX cleaner
 *  and prevents accidental re-renders if the consumer ever migrates
 *  to a client wrapper. */
function renderAllFormats(
  citation: Citation,
): ReadonlyArray<{ format: CitationFormat; text: string }> {
  return CITATION_FORMATS.map((format) => ({
    format,
    text: FORMAT_DESCRIPTORS[format].render(citation),
  }));
}

export function CitationBlock({
  citation,
  headingLevel = "h2",
  className,
}: CitationBlockProps) {
  if (!citation) return null;

  const Heading = headingLevel;
  const permalink = citationPermalinkUrl(citation.id);
  const formats = renderAllFormats(citation);

  return (
    <section
      className={
        className ??
        "mb-10 space-y-4 leading-relaxed"
      }
      aria-labelledby={`cite-${citation.id}-heading`}
    >
      <Heading
        id={`cite-${citation.id}-heading`}
        className="text-2xl font-bold"
      >
        Cite this {labelForSurface(citation.surface)}
      </Heading>
      <p className="text-sm text-muted-foreground">
        Pick the format your reference manager uses. Every citation
        points at the stable permalink{" "}
        <Link
          href={`/cite/${citation.id}`}
          className="underline underline-offset-4"
        >
          {permalink.replace(/^https?:\/\//, "")}
        </Link>{" "}
        – use that URL if you need the citation to outlive a future
        canonical-URL change.
      </p>

      <div className="border border-border rounded-lg divide-y divide-border">
        {formats.map(({ format, text }) => {
          const descriptor = FORMAT_DESCRIPTORS[format];
          // First format opens by default (APA – the most common
          // academic format). Lets the citer see one rendered
          // example without clicking; the rest stay collapsed for
          // signal density.
          const defaultOpen = format === CITATION_FORMATS[0];
          return (
            <details
              key={format}
              open={defaultOpen}
              className="group"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    {descriptor.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {descriptor.hint}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={citationFormatUrl(citation.id, format)}
                    className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    aria-label={`Download ${descriptor.label} citation`}
                  >
                    Download
                  </a>
                  <span
                    aria-hidden
                    className="text-muted-foreground/60 text-xs transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </div>
              </summary>
              <div className="px-4 pb-4 space-y-2">
                <pre className="bg-muted/40 border border-border rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-words">
                  {text}
                </pre>
                <div className="flex justify-end">
                  <CopyButton
                    value={text}
                    label={`Copy ${descriptor.label}`}
                    copiedLabel="Copied"
                    ariaLabel={`Copy ${descriptor.label} citation to clipboard`}
                  />
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function labelForSurface(
  surface: Citation["surface"],
): "page" | "benchmark" | "dataset" {
  switch (surface) {
    case "glossary":
      return "page";
    case "benchmark":
      return "benchmark";
    case "dataset":
      return "dataset";
    case "research":
      // Research pieces are derived datasets at the citation layer.
      return "dataset";
  }
}
