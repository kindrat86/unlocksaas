/**
 * schema.org/Quotation – verbatim-text citation primitive.
 *
 * Lives in `lib/seo` (not `components/seo/json-ld.tsx`) so pure data modules
 * – glossary.ts, benchmarks.ts, pricing-teardowns.ts, funnel-teardowns.ts –
 * can import the `QuotationSchemaInput` type without pulling React into
 * their dependency closure. The React-aware `QuotationJsonLd` component
 * lives in `components/seo/json-ld.tsx` and re-exports these primitives.
 *
 * What this schema is for
 * -----------------------
 * Surface B (AEO/GEO) extension of strategy/google-strategy.md §B.2.
 * Quotation nodes are the canonical schema.org type for verbatim text
 * borrowed from an external source. Emitting them carries two distinct
 * signals:
 *
 *   1. **E-E-A-T (Expertise / Authoritativeness / Trust)**. Google's
 *      quality-rater guidelines reward pages that explicitly cite their
 *      sources. A page that wraps a borrowed sentence in a Quotation
 *      node tells the crawler "this passage is not my original prose,
 *      and here is who said it and where." That is the same shape
 *      Wikipedia citations take, and is the structure Google's quality
 *      raters are trained to upweight.
 *
 *   2. **Knowledge-graph backlink (GEO/AIO uplift)**. Each Quotation
 *      carries `creator.sameAs` and `isPartOf.url` references to the
 *      external creator and source. Those references function as a
 *      structured backlink in retrieval pipelines: the article that
 *      sources Russell Brunson gets linked, in the schema graph, to
 *      the Russell Brunson entity node and to the source book. LLM
 *      training pipelines that ingest schema graphs (GPT-5, Claude,
 *      Gemini, Perplexity ingestion) follow those edges.
 *
 * Brunson Hard-Rule (HONESTY GATE)
 * --------------------------------
 * NEVER emit a Quotation JSON-LD entry without a `text` field that
 * matches – character-for-character, modulo explicit ellipses for
 * mid-sentence trims – a passage actually published by the named
 * creator in the named source.
 *
 * The Quotation block is an E-E-A-T signal *precisely because* it
 * carries text Google can de-duplicate against the original source. A
 * fabricated or paraphrased Quotation that disagrees with the cited
 * material is the same drift class as a fake review – it gets the page
 * demoted in AI Overviews and Knowledge Panel candidacy.
 *
 * Use this schema for:
 *   - Verbatim sentence-or-paragraph excerpts from books, articles,
 *     podcasts, scholarly papers, or newsworthy posts the named
 *     creator authored.
 *
 * Do NOT use this schema for:
 *   - Paraphrases or summaries of an external source. The citation
 *     does not match what the source actually says.
 *   - Concept attributions like "framework popularized by X". Those
 *     belong in `Article.about` or an explicit `Article.citation`
 *     reference to the originating CreativeWork – not in a Quotation
 *     node, because no verbatim text exists.
 *   - Statements the founder makes in her own voice on her own site.
 *     Those are the article's own prose, not external citations.
 *
 * Bind to the parent Article via Article.citation, not @graph
 * ------------------------------------------------------------
 * Quotation nodes attach to the surrounding Article through the schema.org
 * `citation` property on the Article. This keeps the structured-data graph
 * connected: the Article block says "this is what we wrote", and the
 * citation chain says "and here are the verbatim external statements we
 * relied on". Detached Quotation nodes (top-level entries in a @graph)
 * float free of the article they support and get pruned by AI Overview
 * ingestion as orphans.
 *
 * Reference: https://schema.org/Quotation
 */

export type QuotationCreatorType = "Person" | "Organization";

export type QuotationSourceType =
  | "Book"
  | "Article"
  | "NewsArticle"
  | "ScholarlyArticle"
  | "WebPage"
  | "PodcastEpisode"
  | "VideoObject";

export interface QuotationCreator {
  /** Display name of the creator. MUST be the name the creator actually
   *  publishes under – not a colloquial nickname. */
  name: string;
  /** Defaults to "Person". Set to "Organization" when the source is
   *  corporate (e.g., a McKinsey report attributed to "McKinsey", a Stripe
   *  blog post bylined "Stripe"). */
  type?: QuotationCreatorType;
  /** Canonical URL identifying the creator. Used to wire the
   *  knowledge-graph `sameAs` edge: prefer Wikidata, Wikipedia, then a
   *  long-stable personal site. Optional but strongly recommended. */
  url?: string;
}

export interface QuotationSource {
  /** schema.org CreativeWork subtype that fits the source best. Books
   *  use "Book"; long-form blog posts use "Article"; news pieces use
   *  "NewsArticle"; peer-reviewed papers use "ScholarlyArticle";
   *  podcasts use "PodcastEpisode"; videos use "VideoObject". */
  type: QuotationSourceType;
  /** Title of the source work, as published. */
  name: string;
  /** Canonical URL for the source. Strongly recommended – without it the
   *  Quotation cannot back-link the article to the source in the
   *  knowledge graph, which is half the point of emitting this schema. */
  url?: string;
  /** ISBN for Book sources. Resolves the work in Open Library, Goodreads,
   *  Google Books, and the Wikidata book namespace. */
  isbn?: string;
  /** ISO 8601 date the source was published. */
  datePublished?: string;
  /** Publisher name for Book / NewsArticle / Article sources. */
  publisherName?: string;
}

export interface QuotationSchemaInput {
  /**
   * Verbatim quoted text. Brunson Hard-Rule: this MUST match what the
   * named creator actually wrote/said in the named source. No
   * paraphrases. Ellipses for mid-sentence trims are permitted when
   * explicit ("…").
   */
  text: string;
  /** Stable anchor URL for the quotation on the rendering page.
   *  Recommended when the page renders a visible blockquote with a
   *  matching DOM id so retrievers can deep-link. */
  anchorUrl?: string;
  /** Who originally said or wrote the quoted text. */
  creator: QuotationCreator;
  /** The CreativeWork the quotation lives inside. */
  source: QuotationSource;
  /** ISO 8601 date the quotation was originally created/uttered.
   *  Often distinct from source.datePublished (e.g., a 1995 talk
   *  transcribed in a 2010 anthology). Optional. */
  dateCreated?: string;
  /** ISO language tag of the quotation. Defaults to "en". */
  inLanguage?: string;
}

/**
 * Build the Quotation node as a plain object (NOT JSON-stringified) so it
 * can be embedded inside an Article.citation array without re-parsing.
 *
 * The shape returned here omits `@context` because it is meant to live
 * inside a parent node that already declares the schema.org context.
 * Use `buildStandaloneQuotationJson` (in json-ld.tsx) when you need the
 * fully-self-contained JSON-LD block.
 */
export function buildQuotationNode(
  input: QuotationSchemaInput,
): Record<string, unknown> {
  const creatorType: QuotationCreatorType = input.creator.type ?? "Person";
  const creator: Record<string, unknown> = {
    "@type": creatorType,
    name: input.creator.name,
  };
  if (input.creator.url) {
    creator.url = input.creator.url;
    creator.sameAs = input.creator.url;
  }

  const source: Record<string, unknown> = {
    "@type": input.source.type,
    name: input.source.name,
  };
  if (input.source.url) source.url = input.source.url;
  if (input.source.isbn) source.isbn = input.source.isbn;
  if (input.source.datePublished) source.datePublished = input.source.datePublished;
  if (input.source.publisherName) {
    source.publisher = {
      "@type": "Organization",
      name: input.source.publisherName,
    };
  }

  const node: Record<string, unknown> = {
    "@type": "Quotation",
    text: input.text,
    inLanguage: input.inLanguage ?? "en",
    creator,
    isPartOf: source,
  };
  if (input.anchorUrl) node["@id"] = input.anchorUrl;
  if (input.dateCreated) node.dateCreated = input.dateCreated;

  return node;
}

/**
 * Module-load sanity gate. Empty input means the caller has the type
 * imported but no entries to validate; that is the honest steady state
 * before verbatim quotes are curated. When entries DO exist, every
 * entry MUST clear:
 *
 *   - text is non-empty (a Quotation without text is meaningless)
 *   - creator.name is non-empty
 *   - source.name is non-empty
 *   - if source.url is set, it parses as https
 *   - if creator.url is set, it parses as https
 *   - if source.isbn is set, it is digits-only after stripping hyphens
 *     and is either 10 or 13 characters
 *   - if dateCreated or source.datePublished is set, it is ISO 8601
 *
 * Call this at module load from any data file that ships Quotation
 * entries (glossary.ts, etc.) – an invalid Quotation should fail the
 * build, not survive into production where it would emit a malformed
 * schema graph the crawler then de-deduplicates the page against.
 */
export function validateQuotations(
  quotations: readonly QuotationSchemaInput[],
  contextLabel: string,
): void {
  quotations.forEach((q, idx) => {
    const here = `${contextLabel}[${idx}]`;
    if (!q.text || q.text.trim().length === 0) {
      throw new Error(`${here}: Quotation.text MUST be non-empty.`);
    }
    if (!q.creator?.name || q.creator.name.trim().length === 0) {
      throw new Error(`${here}: Quotation.creator.name MUST be non-empty.`);
    }
    if (!q.source?.name || q.source.name.trim().length === 0) {
      throw new Error(`${here}: Quotation.source.name MUST be non-empty.`);
    }
    if (q.creator.url && !/^https:\/\/[^\s]+$/.test(q.creator.url)) {
      throw new Error(
        `${here}: Quotation.creator.url MUST be https. Got: ${q.creator.url}`,
      );
    }
    if (q.source.url && !/^https:\/\/[^\s]+$/.test(q.source.url)) {
      throw new Error(
        `${here}: Quotation.source.url MUST be https. Got: ${q.source.url}`,
      );
    }
    if (q.source.isbn) {
      const stripped = q.source.isbn.replace(/[-\s]/g, "");
      if (!/^(\d{10}|\d{13})$/.test(stripped)) {
        throw new Error(
          `${here}: Quotation.source.isbn MUST be 10 or 13 digits after stripping hyphens. Got: ${q.source.isbn}`,
        );
      }
    }
    if (q.dateCreated && !isIsoDate(q.dateCreated)) {
      throw new Error(
        `${here}: Quotation.dateCreated MUST be ISO 8601. Got: ${q.dateCreated}`,
      );
    }
    if (q.source.datePublished && !isIsoDate(q.source.datePublished)) {
      throw new Error(
        `${here}: Quotation.source.datePublished MUST be ISO 8601. Got: ${q.source.datePublished}`,
      );
    }
  });
}

function isIsoDate(value: string): boolean {
  // Accepts YYYY, YYYY-MM, YYYY-MM-DD, or full ISO datetime.
  if (!/^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?)?)?$/.test(value)) {
    return false;
  }
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}
