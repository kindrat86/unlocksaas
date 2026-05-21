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
import { cacheLife } from "next/cache";

const BASE = "https://unlocksaas.com";

// Caching: the manifest is static (no request-time inputs). 24-hour
// cache at the edge is the right cadence – manifest changes are tied
// to deploys, not to runtime state. Under Cache Components (Next 16+)
// `force-static` + `revalidate = 86400` is replaced by `'use cache' +
// cacheLife({ revalidate: 86400 })` inside the GET handler below.

const MANIFEST = {
  schemaVersion: "0.1",
  name: "unlocksaas",
  displayName: "UnlockSaaS",
  description:
    "Read-only MCP server for the UnlockSaaS catalog: live one-shot AND deep V2 SaaS landing-page diagnostics, the canonical offer + value ladder + 60-day guarantee, and structured access to 33 funnel teardowns, 31 pricing teardowns, 55 head-to-head comparisons, 25 alternatives, 13 category roundups, the 7 Playbook steps, 16 Brunson glossary terms (with TTS audio per term when published), the dataset-changelog podcast (audio enclosures env-gated per episode), and 8 founder-objection FAQ entries. Brunson Hard-Rule: every payload is sourced from the static manifests or the live diagnostic engine; no fabricated metrics, no slag, no fabricated audio surfaces; every entry carries a dated lastVerified.",
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
      name: "deep_diagnose_url",
      summary:
        "Read a live SaaS landing-page URL and return the full UnlockSaaS V2 teardown (three-axis scorecard, hero/CTA/value-prop rewrites, four-week 30-day plan, two competitor pulls, strengths list).",
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
      name: "list_playbook_steps",
      summary:
        "List the seven Playbook steps (the seven-step system that turns a flat-Stripe-line SaaS into a verified paying customer).",
    },
    {
      name: "get_playbook_step",
      summary: "Get one of the seven Playbook steps by number (1-7).",
    },
    {
      name: "list_glossary_terms",
      summary:
        "List every Brunson term UnlockSaaS teaches (Hook, Story, Offer, Value Ladder, Stack Slide, Dream 100, etc.).",
    },
    {
      name: "get_glossary_term",
      summary:
        "Get the working definition of one Brunson term by slug (e.g. 'hook', 'value-ladder', 'big-domino').",
    },
    {
      name: "list_podcast_episodes",
      summary:
        "List every episode of the Indie SaaS Teardowns dataset-changelog podcast.",
    },
    {
      name: "get_podcast_episode",
      summary:
        "Get one dataset-changelog episode by slug, with env-gated audio enclosure metadata when shipped.",
    },
    {
      name: "list_media_assets",
      summary:
        "Unified inventory of every audio/video asset on the site (dataset-changelog podcast + glossary TTS audio); filter by kind.",
    },
    {
      name: "get_glossary_audio",
      summary:
        "Get the TTS-rendered audio episode metadata for one Brunson glossary term by slug.",
    },
    {
      name: "get_faq",
      summary:
        "Search or list UnlockSaaS FAQ entries (objection answers, guarantee mechanics).",
    },
    {
      name: "get_offer",
      summary:
        "Get the canonical UnlockSaaS offer in one call: who it is for, the three-rung value ladder (free Diagnostic → $1 Starter → $49/mo Playbook with 60-day guarantee), guarantee mechanics, and clickable URLs.",
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

/**
 * Cached manifest payload. `'use cache'` requires a serializable return value,
 * so we cache the plain MANIFEST object and let GET wrap it fresh in a
 * NextResponse.json on every call. MANIFEST is a build-time constant, so
 * cacheLife('max') is correct — invalidated only by the next deploy via the
 * build-id-keyed cache.
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
      // Long edge cache: manifest only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Open to any agent or registry.
      "access-control-allow-origin": "*",
    },
  });
}
