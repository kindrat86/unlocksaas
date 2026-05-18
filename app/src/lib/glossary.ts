/**
 * Glossary slug + lookup helpers – Surface A topical-reservoir uplift.
 *
 * Why this module exists
 * ----------------------
 * `DEFINED_TERMS` in `src/lib/seo/entity.ts` is the canonical data: every
 * Brunson concept the site teaches, in the founder's own words. The
 * funnel hub already renders these as schema.org `DefinedTermSet`
 * JSON-LD. What was missing until 2026-05-18 was a dedicated HTML
 * surface that gives each term its own indexable anchor.
 *
 * `/glossary` is that surface. It targets the long-tail intent class
 * the pSEO catalogs do not cover: "what is X" / "X meaning" / "X
 * definition" queries on the Brunson terms (`hook story offer`,
 * `value ladder`, `stack slide`, `dream 100`, etc). Each term gets
 * a stable in-page anchor (`/glossary#hook`) AND the term is rendered
 * inside a DefinedTermSet JSON-LD whose `@id` is the page itself, so
 * AI Overview / Perplexity / Bing Copilot citation surfaces resolve
 * to one canonical URL per term.
 *
 * Single-source-of-truth contract
 * -------------------------------
 *   - `DEFINED_TERMS` (entity.ts) is the data.
 *   - `glossaryTermSlug` is the canonical slug for any term.
 *   - `getDefinedTermBySlug` is the inverse.
 *   - `GLOSSARY_TERM_SLUGS` is the typed enumeration.
 *
 * Adding a term: append to `DEFINED_TERMS` in entity.ts. The slug,
 * the page section anchor, the markdown mirror entry, and the MCP
 * tool surface all pick it up automatically on next build.
 *
 * Brunson Hard-Rule reconciliation: nothing in this module fabricates
 * a definition. Slugs are derived deterministically from the term
 * string in entity.ts – if the term is not in `DEFINED_TERMS`, the
 * slug does not exist.
 */

import { DEFINED_TERMS } from "@/lib/seo/entity";

/**
 * Deterministic kebab-case slug for a glossary term.
 *
 * Examples:
 *   "Hook"                 → "hook"
 *   "Big Domino"           → "big-domino"
 *   "Brunson Hard-Rule"    → "brunson-hard-rule"
 *   "Soap Opera Sequence"  → "soap-opera-sequence"
 *
 * Idempotent under repeated application. Strips non-alphanumerics,
 * collapses runs of separators, trims leading/trailing dashes.
 */
export function glossaryTermSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Typed-narrow lookup. Returns the canonical DEFINED_TERMS entry
 * for a slug, or `undefined` if the slug is unknown.
 *
 * Brunson Hard-Rule: when the slug is unknown, return `undefined`.
 * Callers MUST NOT fabricate a definition; they should 404 or
 * point the reader at the hub.
 */
export function getDefinedTermBySlug(slug: string):
  | { term: string; definition: string }
  | undefined {
  return DEFINED_TERMS.find((t) => glossaryTermSlug(t.term) === slug);
}

/**
 * Enumerated slug list, derived once at module load. Use for
 * `generateStaticParams`, sitemap generation, and MCP catalog tools.
 */
export const GLOSSARY_TERM_SLUGS: ReadonlyArray<string> = Object.freeze(
  DEFINED_TERMS.map((t) => glossaryTermSlug(t.term)),
);

/**
 * Reverse-lookup helper used by JSON-LD anchors and the canonical
 * `@id` for each DefinedTerm. Returns the absolute hash fragment
 * `/glossary#<slug>` for any term string. Crawlers and LLM retrieval
 * pipelines resolve this as the citable anchor for the term.
 *
 * Example: `glossaryTermAnchor("Big Domino")` → `"/glossary#big-domino"`.
 */
export function glossaryTermAnchor(term: string): string {
  return `/glossary#${glossaryTermSlug(term)}`;
}
