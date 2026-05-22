/**
 * /.well-known/nlweb.json – Microsoft NLWeb discovery manifest.
 *
 * NLWeb (github.com/microsoft/NLWeb) recommends a discovery file at
 * /.well-known/nlweb.json so an NLWeb-aware agent can locate the
 * /ask endpoint without scraping HTML or guessing path conventions.
 * Same .well-known/ pattern as mcp.json, ai-plugin.json, ai-policy.json,
 * security.txt.
 *
 * Three uses for this file:
 *   1. NLWeb-aware agents (the Microsoft reference client, any NLWeb
 *      integration in Shopify/Tripadvisor/Eventbrite-style apps)
 *      crawl /.well-known/nlweb.json to discover the /ask endpoint.
 *   2. NLWeb registries can be pointed at the manifest URL to ingest
 *      the site listing without operator-side maintenance.
 *   3. Human operators can curl the manifest to validate corpus size
 *      and capabilities before pointing an agent at the site.
 *
 * Schema
 * ------
 * The NLWeb spec is still in early-version flux; this file mirrors the
 * fields the reference implementation reads:
 *   - version           – NLWeb spec version this site implements
 *   - site_name         – display name
 *   - site_description  – one-paragraph what-it-is
 *   - ask_endpoint      – canonical /ask URL
 *   - mcp_endpoint      – companion MCP server URL (NLWeb interops
 *                         with MCP; the reference client treats them
 *                         as complementary surfaces)
 *   - schema_org_types  – which schema.org types the corpus contains
 *   - corpus_size       – total indexed item count
 *
 * Brunson Hard-Rule reconciliation: every advertised capability is
 * implementable by the live /api/nlweb/ask endpoint. No fabricated
 * counts: corpus_size is read live from the corpus module.
 */

import { NextResponse } from "next/server";
import { cacheLife } from "next/cache";
import { NLWEB_CORPUS_SIZE, NLWEB_SURFACES } from "@/lib/nlweb/corpus";

const BASE = "https://unlocksaas.com";

const MANIFEST = {
  version: "0.1",
  site_name: "UnlockSaaS",
  site_description:
    "A guided seven-step Brunson Playbook for post-launch pre-revenue indie SaaS founders. Free Diagnostic labels what is broken (Wrong Person / Weak Offer / Weak Belief). $1 Starter unlocks the first two Playbook steps. $49/mo Playbook runs the full seven-step engine with a 60-day Stripe-verified guarantee.",
  ask_endpoint: `${BASE}/api/nlweb/ask`,
  mcp_endpoint: `${BASE}/api/mcp`,
  // Human-facing companion to the protocol endpoint. A founder lands
  // here directly; the page server-renders the same BM25 retrieval
  // result the ask_endpoint returns, plus an optional streaming LLM
  // gloss as a progressive enhancement. NLWeb-aware agents that want
  // to surface a "view this in a browser" affordance can deep-link
  // visitors at the ui_endpoint with ?q= populated.
  ui_endpoint: `${BASE}/ask`,
  // Companion discovery surfaces. NLWeb-aware agents that also speak
  // MCP, OpenAPI, or the llmstxt.org convention can pick the protocol
  // their runtime supports.
  related: {
    mcp_manifest: `${BASE}/.well-known/mcp.json`,
    openapi: `${BASE}/openapi.json`,
    llms_txt: `${BASE}/llms.txt`,
    llms_feed: `${BASE}/llms-feed.json`,
    ask_ui: `${BASE}/ask`,
    ask_ui_markdown: `${BASE}/ask.md`,
  },
  publisher: {
    name: "UnlockSaaS",
    url: BASE,
    contact_email: "maryan@unlocksaas.com",
  },
  // Concrete capability declarations. Every value is verifiable by
  // calling the /ask endpoint; nothing here is aspirational.
  capabilities: {
    methods: ["GET", "POST"] as const,
    accepts: {
      query: "string, required",
      top_k: "integer, default 10, max 50",
      site: "string, optional, accepted for protocol conformance",
    },
    returns: "schema.org ItemList JSON-LD with deterministic NL summary",
    retriever: "bm25-v1",
    summary: "deterministic-template",
  },
  // schema.org @type values present in the corpus. Agents can use this
  // to pre-filter queries (e.g. "give me only DefinedTerm matches").
  schema_org_types: [
    "Product",
    "Article",
    "HowTo",
    "DefinedTerm",
    "Question",
    "QAPage",
  ],
  // Live corpus size + surface inventory. Read at module load from the
  // corpus aggregator so the manifest cannot drift from what /ask
  // actually returns.
  corpus_size: NLWEB_CORPUS_SIZE,
  surfaces: NLWEB_SURFACES,
  // Single-site index. NLWeb's reference client also supports federated
  // ask across multiple sites; we accept the `site` parameter for
  // protocol conformance but only one site is served.
  sites: [
    {
      site_id: "unlocksaas.com",
      site_url: BASE,
    },
  ],
  documentation: `${BASE}/mcp`,
} as const;

/**
 * Cached manifest. Pattern mirrors /.well-known/mcp.json: the manifest
 * is a build-time constant, so `cacheLife("max")` is correct – the
 * build-id-keyed cache invalidates on every deploy.
 */
async function getManifest(): Promise<typeof MANIFEST> {
  "use cache";
  cacheLife("max");
  return MANIFEST;
}

export async function GET() {
  const manifest = await getManifest();
  return NextResponse.json(manifest, {
    headers: {
      // Long edge cache; manifest only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Open CORS – discovery surfaces must be readable from any origin.
      "access-control-allow-origin": "*",
    },
  });
}
