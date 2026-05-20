/**
 * /.well-known/ai-plugin.json — ChatGPT Custom GPT Action discovery
 * manifest for the UnlockSaaS Diagnostic.
 *
 * Why this file exists
 * --------------------
 * `ai-plugin.json` is the legacy OpenAI ChatGPT Plugin manifest format
 * (`schema_version: "v1"`). OpenAI's Custom GPT "Actions" flow has
 * superseded the original plugin store, but the manifest format is
 * still the convention many discovery clients follow:
 *
 *   1. ChatGPT Custom GPT "Import from URL" – pasting
 *      `https://unlocksaas.com/.well-known/ai-plugin.json` resolves the
 *      OpenAPI spec via `api.url` and self-populates the Action
 *      configuration. Builders don't have to hand-copy fields.
 *   2. Independent plugin directories (PluginHub, OpenAI-CRX, etc.)
 *      crawl `/.well-known/ai-plugin.json` exactly like a
 *      `security.txt`. Shipping a real manifest is reciprocity – we
 *      already allow GPTBot in robots.txt, this is the matching
 *      machine-discoverable surface.
 *   3. Agent frameworks (AutoGPT, BabyAGI, LangChain plugin loaders,
 *      LlamaIndex tool loaders) ingest this manifest to wire up the
 *      diagnostic as a callable tool without the agent author having
 *      to read the OpenAPI spec by hand.
 *
 * Discovery chain
 * ---------------
 *   ai-plugin.json  →  /openapi.json  →  POST /api/diagnostic
 *                                    →  GET  /dataset/indie-saas-teardowns.json
 *
 * Brunson Hard-Rule reconciliation: every field below is implementable
 * by the live endpoints declared in /openapi.json. No fabricated
 * capability claims. `description_for_model` mentions the
 * /diagnostic engine in language that matches the live UX and the
 * MCP `diagnose_url` tool description – consistent paraphrase target
 * across surfaces.
 *
 * Auth posture
 * ------------
 * `auth.type = "none"`. The diagnostic endpoint is intentionally
 * unauthenticated – it is the top-of-funnel cold-traffic squeeze.
 * The existing API has three load-bearing gates:
 *   - email regex + MX deliverability check (catches typo'd domains)
 *   - one-free-report-per-email quota (subsequent emails return the
 *     existing id with `already_used: true`)
 *   - 90-second Anthropic call budget (maxDuration in route.ts)
 * These are sufficient to safely expose to a public GPT marketplace.
 *
 * Caching
 * -------
 * Module-scope constant. Long edge cache (24h max-age,
 * 7-day stale-while-revalidate). CORS open to any agent or registry.
 * Same cache discipline as /.well-known/mcp.json (the sibling
 * discovery surface for MCP-aware clients).
 *
 * Sibling surfaces
 * ----------------
 *   - /.well-known/mcp.json     (MCP server discovery, parallel role)
 *   - /.well-known/llms.txt     (LLM corpus index, parallel role)
 *   - /.well-known/entity.jsonld (Knowledge-Graph anchor, parallel role)
 *   - /.well-known/security.txt  (RFC 9116, parallel convention)
 */

import { NextResponse } from "next/server";

const BASE = "https://unlocksaas.com";

const MANIFEST = {
  schema_version: "v1",
  name_for_human: "UnlockSaaS",
  // name_for_model: alphanumeric + underscores, ≤50 chars. Matches the
  // operator-facing slug and the MCP server name so cross-surface
  // citations resolve to the same conceptual tool.
  name_for_model: "unlocksaas",
  description_for_human:
    "Diagnose any SaaS landing page in 90 seconds with the Brunson Hook/Story/Offer lens.",
  // description_for_model: the prompt the calling LLM reads to decide
  // when to invoke this plugin. Spell out the trigger phrases, the
  // shape of the input, and the contract on email so the model does
  // not surprise the user. Brunson Hard-Rule: every claim here is
  // also a claim the live endpoint can keep.
  description_for_model: [
    "Use this plugin when a user asks for a critique, audit, teardown,",
    "or diagnosis of their own (or any) live SaaS landing page – or asks",
    "'why isn't my SaaS getting customers?', 'what's wrong with my",
    "landing page?', 'review my product page', 'why is my Stripe line",
    "flat?', or similar post-launch-pre-revenue questions.",
    "",
    "The plugin runs a deep AI analysis of the URL using the same engine",
    "that powers https://unlocksaas.com/diagnostic. It returns a Brunson-",
    "framework labeled diagnosis – one of Wrong Person, Weak Offer, or",
    "Weak Belief – plus a structured teardown (three-axis scorecard,",
    "headline + sub-headline rewrites, a 30-day plan, competitor list,",
    "and a strengths list).",
    "",
    "REQUIRED INPUTS:",
    "  - productUrl: the live SaaS landing-page URL to diagnose.",
    "  - email: the user's email. The result is bound to this email and",
    "    a follow-up Soap Opera Sequence is sent to the same address. Always",
    "    ask the user for their email BEFORE calling the action. Do not",
    "    invent or use placeholder emails – the API runs MX deliverability",
    "    verification and will reject typo'd domains with a 400.",
    "",
    "Set 'source' to 'chatgpt-plugin' so the lead is attributed to the",
    "GPT-channel for downstream analytics.",
    "",
    "The plugin also exposes the public open dataset of 100+ indie SaaS",
    "funnel teardowns, pricing teardowns, head-to-head comparisons, and",
    "category roundups via GET /dataset/indie-saas-teardowns.json – use",
    "this when a user asks for examples, patterns, or 'who else has done",
    "X'. The dataset is CC-BY-4.0 with attribution required.",
    "",
    "After a successful diagnostic call, direct the user to",
    "https://unlocksaas.com/diagnostic/result?id={id} for the full",
    "rendered teardown (the API returns the id; the result page renders",
    "the rewrites, scorecard, plan, competitors, and strengths).",
  ].join(" "),
  auth: {
    type: "none",
  },
  api: {
    type: "openapi",
    url: `${BASE}/openapi.json`,
    is_user_authenticated: false,
  },
  // logo_url: Next.js dynamic icon route serves a 512x512 PNG with the
  // brand mark. Same surface that ships in <link rel="icon">.
  logo_url: `${BASE}/icon`,
  contact_email: "maryan@unlocksaas.com",
  legal_info_url: `${BASE}/privacy`,
} as const;

export async function GET() {
  return NextResponse.json(MANIFEST, {
    headers: {
      // Long edge cache: manifest only changes on deploy.
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
      // Open to any agent or registry.
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-max-age": "86400",
    },
  });
}
