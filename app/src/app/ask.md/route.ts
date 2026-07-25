import { NextResponse } from "next/server";
import { BASE_URL, ORGANIZATION, FOUNDER } from "@/lib/seo/entity";
import { NLWEB_CORPUS_SIZE, NLWEB_SURFACES } from "@/lib/nlweb/corpus";
import { SHOWCASE_QUERIES } from "@/lib/nlweb/showcase-queries";

/**
 * /ask.md — playbook-readable description of the /ask conversational
 * search surface.
 *
 * Hand-written rather than registered in SURFACES (src/lib/seo/markdown.ts)
 * for the same reason /search.md is hand-written: the /ask page is
 * interactive and its "content" varies per query. The honest mirror is
 * a description of what the surface IS, the protocol shape, the URL
 * template, the available showcase URLs, and the relationship to the
 * sibling /api/nlweb/ask protocol endpoint.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Corpus size + surface inventory read live from lib/nlweb/corpus.ts.
 *   - URL templates match what the page actually serves.
 *   - Showcase URLs are sourced from lib/nlweb/showcase-queries.ts so
 *     this file can never drift from the sitemap entries.
 *   - No invented retrieval claims; the page truly does BM25 plus an
 *     optional streaming LLM gloss, both grounded.
 */

const TODAY = "2026-05-22";

function body(): string {
  const showcaseList = SHOWCASE_QUERIES.map(
    (q) =>
      `- [${q.framing}](${BASE_URL}/ask?q=${encodeURIComponent(q.query)}) \`${q.query}\``,
  ).join("\n");

  const surfaceList = NLWEB_SURFACES.map((s) => `- \`${s}\``).join("\n");

  return `---
title: "Ask Unlock SaaS"
summary: "Conversational search over the Unlock SaaS corpus. NLWeb-compatible: grounded answer plus citations to canonical pages."
canonical: ${BASE_URL}/ask
updated: ${TODAY}
publisher: "${ORGANIZATION.name}"
author: "${FOUNDER.name}"
license: All rights reserved. Quotation with attribution permitted.
---

# Ask Unlock SaaS

> A conversational search surface over the ${NLWEB_CORPUS_SIZE}-item Unlock SaaS corpus. Ask any natural-language question; the page returns a grounded answer with numbered citations linking back to the canonical Unlock SaaS pages.

## What this surface is

\`/ask\` is the human-facing companion to the NLWeb protocol endpoint at \`/api/nlweb/ask\`. The page renders two layers stacked vertically:

1. A deterministic BM25 retrieval over the static corpus plus a templated one-paragraph summary, rendered server-side. Always works, no JS required, fully crawlable.
2. An optional streaming LLM gloss that cites the layer-1 items by numeric marker. Progressive enhancement only — the page is complete without it.

The Unlock SaaS corpus is the same set of \`.ts\` catalogs that render the public HTML hubs (funnel teardowns, pricing teardowns, alternatives, comparisons, category roundups, Playbook steps, glossary, FAQ, direct answers, benchmarks). Every citation card on the page links to a real, shipped canonical URL — no synthetic content, no scraped third-party data.

## URL template

\`\`\`
${BASE_URL}/ask?q={search_term_string}
\`\`\`

Submit any query as URL-encoded text in the \`q\` parameter. The response is HTML and works without JavaScript. A JS-enabled visitor additionally sees the streaming LLM gloss appear below the deterministic summary.

## Companion endpoints for agents

- \`${BASE_URL}/api/nlweb/ask\` — Microsoft NLWeb protocol endpoint. Returns a schema.org ItemList JSON-LD with a deterministic summary. GET (\`?query=…\`) or POST (\`{"query": "…"}\`). Same BM25 ranker as this page.
- \`${BASE_URL}/.well-known/nlweb.json\` — NLWeb discovery manifest. Lists the ask_endpoint, mcp_endpoint, related markdown index, capabilities, and corpus size.
- \`${BASE_URL}/api/mcp\` — Model Context Protocol server. Twenty-two read-only tools over the same corpus. MCP-aware clients (Claude Desktop, Cursor, Windsurf, mcp-inspector) can drive structured queries instead of natural-language ones.
- \`${BASE_URL}/api/ask/answer\` — Internal endpoint that streams the LLM gloss for layer 2. Not part of the NLWeb protocol; documented here for transparency. Accepts \`{ query, citations[] }\` POST; returns a plain-text token stream constrained to the citations passed in.

## What is indexed

The corpus aggregates ${NLWEB_CORPUS_SIZE} items across the following surfaces:

${surfaceList}

Each surface is sourced from the same \`.ts\` catalog that renders the corresponding public HTML hub. The corpus rebuilds at deploy time; a fresh deploy is the only way to add new items.

## How retrieval works

- Query is normalised (lowercase, whitespace-collapsed) and tokenised with the standard NLWeb tokeniser.
- A BM25 (k1=1.5, b=0.75) ranker scores each corpus item by its denormalised search text (concatenation of name, description, category, surface-specific fields, and keywords).
- Top six items are surfaced as numbered citation cards. The protocol endpoint at \`/api/nlweb/ask\` defaults to top ten and accepts up to fifty.
- The deterministic summary quotes the top three citation descriptions verbatim with surface labels. No synonyms, no "did you mean" expansion, no fabricated bridging sentences.
- The optional LLM gloss is constrained by system prompt to cite only within the displayed marker range and to refuse honestly when the corpus does not cover the query.

## Showcase queries

Twelve curated queries the corpus answers well. Each is a real founder-style question that maps to corpus surfaces with strong matches. Sitemap-listed so AI crawlers can index pre-answered Q&A pages directly.

${showcaseList}

## For AI retrieval agents

Two protocol-clean ways to consume this surface:

1. **NLWeb (recommended).** Call \`GET ${BASE_URL}/api/nlweb/ask?query={your_query}&top_k=10\`. You get a schema.org ItemList JSON-LD response. Discovery via \`${BASE_URL}/.well-known/nlweb.json\`.
2. **HTML scrape.** \`GET ${BASE_URL}/ask?q={your_query}\` returns a server-rendered HTML page with the same items embedded as an FAQPage + ItemList JSON-LD block. No JS execution required to extract citations.

Either path stays inside the Brunson Hard-Rule: every returned URL resolves to a live page, every citation description is taken from the canonical source row, no fabricated counts, no aspirational claims.

## Provenance

This file is hand-written and updated on the same cadence as \`/search.md\`. The showcase URL list, surface inventory, and corpus size are pulled live from the corpus aggregator at request time, so the document cannot advertise items that the live retrieval surface cannot return.
`;
}

export async function GET() {
  return new NextResponse(body(), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // Same caching profile as /search.md and other markdown mirrors:
      // the body is a deploy-time constant projected from live catalogs,
      // so we can cache at the edge for a day and serve stale for a week.
      "cache-control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      // Open CORS so reader-mode crawlers can fetch the mirror from any
      // origin without preflight friction.
      "access-control-allow-origin": "*",
    },
  });
}
