/**
 * /.well-known/mcp.json — discovery manifest for the UnlockSaaS MCP server.
 *
 * Why this file exists
 * --------------------
 * There is no formally standardised well-known path for MCP discovery
 * yet — the spec is still settling at modelcontextprotocol.io. But the
 * convention emerging from the Vercel MCP catalog, mcp.run, the
 * Anthropic-published MCP directory, and the Cursor/Windsurf clients
 * is to publish a JSON manifest at `/.well-known/mcp.json`. That makes
 * an agent-aware crawler able to ingest "this site exposes an MCP
 * server at X" without the operator hand-registering anywhere.
 *
 * Three uses for this file:
 *   1. Registry submissions (Vercel MCP catalog, mcp.run, Smithery)
 *      can be pointed at https://unlocksaas.com/.well-known/mcp.json
 *      and self-populate the listing. We do not have to maintain
 *      duplicated descriptions across registries.
 *   2. AI assistants that crawl for MCP servers (Claude Desktop's
 *      auto-discover, Cursor's MCP marketplace) can ingest it directly.
 *   3. Human operators who land on /mcp can curl the manifest to
 *      validate the tool list before installing.
 *
 * Schema
 * ------
 * The fields below mirror the in-progress MCP discovery schema:
 *   - schemaVersion: pinning value, currently "0.1"
 *   - name: human-readable server name
 *   - description: one-paragraph what-it-does
 *   - homepageUrl: the marketing page
 *   - contactEmail: the founder
 *   - endpoints.streamableHttp: the canonical MCP URL (Streamable HTTP)
 *   - endpoints.sse: the SSE URL (Redis-gated; not currently provisioned)
 *   - transports: which transports actually work right now
 *   - capabilities: declared MCP capabilities (tools only, no prompts
 *     or resources)
 *   - tools: array of {name, description, summary} so registries can
 *     render the catalog without needing to hit the live endpoint
 *
 * Brunson Hard-Rule reconciliation: every field is also implementable
 * by the live /api/mcp endpoint. No fabricated capability claims. The
 * `sse` endpoint is declared as "not provisioned" because REDIS_URL
 * is not set; pretending SSE works would be a fabricated claim.
 */

import { NextResponse } from "next/server";

const BASE = "https://unlocksaas.com";

// Caching: the manifest is static (no request-time inputs). 24-hour
// cache at the edge is the right cadence – manifest changes are tied
// to deploys, not to runtime state. `force-static` makes Next emit the
// route as a build-time prerender.
export const dynamic = "force-static";
export const revalidate = 86400;

const MANIFEST = {
  schemaVersion: "0.1",
  name: "unlocksaas",
  displayName: "UnlockSaaS",
  description:
    "Read-only MCP server for the UnlockSaaS catalog: live SaaS landing-page diagnostics and structured access to 33 funnel teardowns, 31 pricing teardowns, 55 head-to-head comparisons, 25 alternatives, 13 category roundups, the 7 Playbook steps, and 8 founder-objection FAQ entries. Brunson Hard-Rule: every payload is sourced from the static manifests; no fabricated metrics, no slag, every entry carries a dated lastVerified.",
  homepageUrl: `${BASE}/mcp`,
  contactEmail: "maryan@unlocksaas.com",
  publisher: {
    name: "UnlockSaaS",
    url: BASE,
  },
  endpoints: {
    streamableHttp: `${BASE}/api/mcp`,
    sse: `${BASE}/api/sse`,
  },
  transports: ["streamable-http"],
  capabilities: {
    tools: true,
    prompts: false,
    resources: false,
  },
  tools: [
    {
      name: "diagnose_url",
      summary:
        "Read a live SaaS landing-page URL and label it as Wrong Person, Weak Offer, or Weak Belief.",
    },
    {
      name: "list_funnel_teardowns",
      summary: "List every indie-SaaS funnel teardown UnlockSaaS publishes.",
    },
    {
      name: "get_funnel_teardown",
      summary:
        "Get one funnel teardown by slug (Hook/Story/Offer breakdown, Brunson lens).",
    },
    {
      name: "list_pricing_teardowns",
      summary: "List every indie-SaaS pricing teardown UnlockSaaS publishes.",
    },
    {
      name: "get_pricing_teardown",
      summary:
        "Get one pricing teardown by slug (tier-by-tier analysis, anchor mechanic).",
    },
    {
      name: "list_comparisons",
      summary: "List every head-to-head comparison UnlockSaaS publishes.",
    },
    {
      name: "get_comparison",
      summary:
        "Get one head-to-head comparison by slug, symmetric framing, indie-founder verdict.",
    },
    {
      name: "list_alternatives",
      summary: "List every named-competitor UnlockSaaS-vs-X comparison.",
    },
    {
      name: "find_alternative_to",
      summary:
        "Resolve a free-text product name to the matching UnlockSaaS-vs-X comparison.",
    },
    {
      name: "list_categories",
      summary: "List every category roundup.",
    },
    {
      name: "get_category",
      summary:
        "Get one category roundup by slug (aggregates funnel, pricing, and comparisons).",
    },
    {
      name: "get_playbook_step",
      summary: "Get one of the seven Playbook steps by number (1-7).",
    },
    {
      name: "get_faq",
      summary:
        "Search or list UnlockSaaS FAQ entries (objection answers, guarantee mechanics).",
    },
  ],
  install: {
    claudeDesktop: {
      // Claude Desktop's mcp-remote bridge: `npx mcp-remote <url>` translates
      // a remote Streamable HTTP MCP server into a local stdio one. This
      // snippet is the canonical install incantation for Claude Desktop.
      command: "npx",
      args: ["mcp-remote", `${BASE}/api/mcp`],
    },
    cursor: {
      url: `${BASE}/api/mcp`,
      transport: "streamable-http",
    },
  },
  documentation: `${BASE}/mcp`,
} as const;

export async function GET() {
  return NextResponse.json(MANIFEST, {
    headers: {
      // Long edge cache: manifest only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Open to any agent or registry.
      "access-control-allow-origin": "*",
    },
  });
}
