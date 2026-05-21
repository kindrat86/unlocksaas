/**
 * /api/nlweb/ask – Microsoft NLWeb compatible ask endpoint.
 *
 * NLWeb (github.com/microsoft/NLWeb) turns a schema.org-annotated site
 * into a conversational/agentic interface. The convention is a single
 * /ask endpoint that accepts a natural-language query and returns an
 * `ItemList` JSON-LD payload with top-k matching items plus a one-shot
 * summary. Shopify, Tripadvisor, and Eventbrite are already on it.
 *
 * Why UnlockSaaS exposes this surface
 * -----------------------------------
 * The site already publishes hundreds of schema.org-annotated pSEO
 * surfaces (Article, FAQPage, HowTo, DefinedTerm, Product, QAPage)
 * over a static corpus of funnel teardowns, pricing teardowns,
 * comparisons, alternatives, category roundups, Playbook steps,
 * glossary terms, benchmarks, FAQ entries, and direct answers. NLWeb
 * is the lowest-friction protocol layer for letting any NLWeb-aware
 * agent ask questions against that corpus without scraping per-page
 * HTML or learning the per-surface URL conventions.
 *
 * This is Surface E of the agent-retrieval stack (alongside Surface C
 * MCP and Surface D OpenAPI). Same Brunson Hard-Rule discipline as the
 * other surfaces: every returned item is sourced from the same static
 * registries that render the public HTML.
 *
 * Contract
 * --------
 * Inputs (GET query params OR POST JSON body):
 *   - query  (string, required): the natural-language ask
 *   - top_k  (int, default 10, max 50): how many items to return
 *   - site   (string, default "unlocksaas.com"): NLWeb spec field;
 *            we accept it for protocol conformance but only one
 *            site is indexed (this one)
 *
 * Output (NLWeb spec):
 *   {
 *     "@context": "https://schema.org",
 *     "@type": "ItemList",
 *     "name": "NLWeb results for: <query>",
 *     "numberOfItems": N,
 *     "itemListElement": [
 *       { "@type": "ListItem", "position": 1, "item": {...} },
 *       ...
 *     ],
 *     "summary": "<deterministic NL summary>"
 *   }
 *
 * Retrieval is BM25 over the static corpus aggregated in lib/nlweb/corpus.ts.
 * Summary is deterministic-template from lib/nlweb/summary.ts – no
 * ANTHROPIC_API_KEY round-trip on the hot path. A later iteration can
 * swap in an LLM summariser behind a flag without changing this contract.
 *
 * Runtime
 * -------
 * `runtime = "nodejs"` (the App Router default; declared for parity
 * with the MCP server). `maxDuration` is the function ceiling – the
 * BM25 ranker resolves in single-digit milliseconds against the
 * ~700-item corpus so the timeout is generous headroom, not a
 * hot-path concern.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { NLWEB_CORPUS } from "@/lib/nlweb/corpus";
import { buildIndex, rank } from "@/lib/nlweb/bm25";
import { summarise } from "@/lib/nlweb/summary";

export const maxDuration = 30;

const BASE = "https://unlocksaas.com";
const MAX_TOP_K = 50;
const DEFAULT_TOP_K = 10;

/**
 * Validation schema. `query` is required and trimmed; `top_k` clamps
 * to [1, 50]; `site` is accepted for NLWeb-spec conformance but we
 * never branch on it (single-site index).
 */
const AskInput = z.object({
  query: z.string().trim().min(1, "query is required").max(500),
  top_k: z
    .number()
    .int()
    .min(1)
    .max(MAX_TOP_K)
    .default(DEFAULT_TOP_K)
    .optional(),
  site: z.string().optional(),
});

/**
 * BM25 index. Built once on first import, reused across every request
 * in the lifetime of the function instance.
 */
const INDEX = buildIndex(NLWEB_CORPUS);

/**
 * Compose the NLWeb-spec ItemList response. Each list item is wrapped
 * in a ListItem with a 1-indexed `position` per the schema.org spec.
 */
function buildResponse(query: string, topK: number) {
  const ranked = rank(INDEX, NLWEB_CORPUS, query, topK);
  const items = ranked.map((r) => r.item);

  const itemListElement = items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": item["@type"],
      "@id": item["@id"],
      name: item.name,
      description: item.description,
      url: withRef(item.url),
      dateModified: item.dateModified,
      keywords: item.keywords,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `NLWeb results for: ${query}`,
    numberOfItems: itemListElement.length,
    itemListElement,
    summary: summarise(query, items),
    // Non-standard but stable extension: declare which retrieval
    // mechanism produced this response, so an agent can branch on it.
    // Matches the convention used by the MCP server (`utm_source=mcp`).
    "unlocksaas:retriever": "bm25-v1",
    "unlocksaas:corpusSize": NLWEB_CORPUS.length,
  };
}

/**
 * Attribution helper – every URL the /ask endpoint emits carries a
 * `utm_source=nlweb` query so PostHog can attribute the resulting
 * human click back to the NLWeb channel. Same pattern as the MCP
 * server's `withRef`.
 */
function withRef(path: string): string {
  const u = new URL(path, BASE);
  u.searchParams.set("utm_source", "nlweb");
  u.searchParams.set("utm_medium", "ai-agent");
  u.searchParams.set("utm_campaign", "ask");
  return u.toString();
}

/** Standard NLWeb response headers: CORS open, edge-cached briefly. */
const RESPONSE_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  // Brief edge cache – the corpus changes at deploy time, the BM25
  // scoring is deterministic, so identical queries can share an edge
  // cache entry for an hour without risk of staleness.
  "cache-control":
    "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type",
} as const;

/**
 * GET handler. Query params: `query`, `top_k`, `site`. NLWeb agents
 * may use either GET or POST; GET is convenient for curl/debugging.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = {
    query: url.searchParams.get("query") ?? url.searchParams.get("q") ?? "",
    top_k: url.searchParams.get("top_k")
      ? Number(url.searchParams.get("top_k"))
      : undefined,
    site: url.searchParams.get("site") ?? undefined,
  };
  const parsed = AskInput.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
      { status: 400, headers: RESPONSE_HEADERS },
    );
  }
  const { query, top_k } = parsed.data;
  const payload = buildResponse(query, top_k ?? DEFAULT_TOP_K);
  return NextResponse.json(payload, { status: 200, headers: RESPONSE_HEADERS });
}

/**
 * POST handler. JSON body: { query, top_k, site }. NLWeb agents that
 * carry long queries prefer POST (no URL-length cap).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_request", message: "body must be valid JSON" },
      { status: 400, headers: RESPONSE_HEADERS },
    );
  }
  const parsed = AskInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: parsed.error.issues.map((i) => i.message).join("; "),
      },
      { status: 400, headers: RESPONSE_HEADERS },
    );
  }
  const { query, top_k } = parsed.data;
  const payload = buildResponse(query, top_k ?? DEFAULT_TOP_K);
  return NextResponse.json(payload, { status: 200, headers: RESPONSE_HEADERS });
}

/**
 * OPTIONS handler for CORS preflight. NLWeb client libraries running
 * in a browser context need this to succeed before the GET/POST fires.
 */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
    },
  });
}
