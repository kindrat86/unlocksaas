/**
 * /mcp.md — playbook-readable mirror of /mcp for AI crawlers.
 *
 * Standalone (not registered in src/lib/seo/markdown.ts SURFACES) because
 * the MCP server documentation has its own self-contained shape:
 * install commands, JSON config snippets, and a tool catalog list. Lives
 * here so an LLM that lands on /mcp via Google or a registry catalog can
 * fetch the markdown sibling directly without having to parse the React
 * component tree.
 *
 * Body is hand-rolled to match the rendered /mcp page section-for-section.
 * Brunson Hard-Rule reconciliation: every fact below is also visible on
 * /mcp HTML. Drift between this markdown and the HTML is a maintenance bug
 * — the install snippets are the only place a discrepancy could land
 * silently, so changes to MCP_URL must update both files in the same PR.
 *
 * Caching aligns with the rest of the markdown mirrors: a day at the edge,
 * a week stale-while-revalidate. Build-id keyed so deploys invalidate.
 */

import { NextResponse } from "next/server";
import { cacheLife } from "next/cache";
import { BASE_URL } from "@/lib/seo/entity";

const MCP_URL = `${BASE_URL}/api/mcp`;

const BODY = `# UnlockSaaS MCP server

A Model Context Protocol server that lets Claude, Cursor, Windsurf, and any other MCP-aware client diagnose a live SaaS landing page, pull structured data from the 157 funnel, pricing, alternative, comparison, and category teardowns UnlockSaaS publishes, retrieve the structural Brunson canon (Dream 100 framework, four funnel archetypes, eight dollar-objection patterns with verbatim public source quotes), and (for authenticated founders) write back Playbook step progress.

## Endpoint

One URL. Stateless Streamable HTTP transport. Read tools require no auth; the single write tool (\`update_progress\`) requires a per-founder API key:

\`\`\`
${MCP_URL}
\`\`\`

Discovery manifest: ${BASE_URL}/.well-known/mcp.json

## Install (Claude Desktop)

Append the following to \`claude_desktop_config.json\` and restart Claude:

\`\`\`json
{
  "mcpServers": {
    "unlocksaas": {
      "command": "npx",
      "args": ["mcp-remote", "${MCP_URL}"]
    }
  }
}
\`\`\`

## Install (Cursor)

Append the following to \`.cursor/mcp.json\` in your home directory or project root:

\`\`\`json
{
  "mcpServers": {
    "unlocksaas": {
      "url": "${MCP_URL}"
    }
  }
}
\`\`\`

## Inspect (MCP Inspector)

Before installing, run the inspector against the URL:

\`\`\`
npx @modelcontextprotocol/inspector ${MCP_URL}
\`\`\`

## Tools

- \`diagnose_url\` — read a live public SaaS landing page, label it as Wrong Person / Weak Offer / Weak Belief, return the next concrete step. Takes ~30 seconds.
- \`deep_diagnose_url\` — read a live public SaaS landing page and return the FULL UnlockSaaS V2 teardown: three-axis scorecard (each axis 1-10 with diagnosis + evidence quotes), hero/CTA/value-prop rewrites (3 alternates each), four-week 30-day plan, two same-category competitor pulls, 2-3 item strengths list. Takes ~30-45 seconds.
- \`list_funnel_teardowns\` — slug + display name + category for every indie-SaaS funnel teardown.
- \`get_funnel_teardown\` — Hook / Story / Offer breakdown and Brunson lens for a single product.
- \`list_pricing_teardowns\` — slug + display name + category for every indie-SaaS pricing teardown.
- \`get_pricing_teardown\` — tier-by-tier pricing analysis, anchor mechanic, upgrade trigger, payment mechanics.
- \`list_comparisons\` — slug, both product names, and category for every head-to-head comparison.
- \`get_comparison\` — dimension-by-dimension head-to-head, symmetric framing, honest verdict.
- \`list_alternatives\` — slug + display name for every named-competitor UnlockSaaS-vs-X comparison.
- \`find_alternative_to\` — resolve a free-text product name to the matching UnlockSaaS-vs-X entry.
- \`list_categories\` — slug + display name + one-line summary for every category roundup.
- \`get_category\` — category roundup with intent paragraph plus every funnel teardown, pricing teardown, and comparison in that category.
- \`list_playbook_steps\` — step number + short imperative name for every Playbook step (the seven-step system).
- \`get_playbook_step\` — one of the seven Playbook steps by number (1-7).
- \`list_glossary_terms\` – slug + term name for every Brunson concept UnlockSaaS teaches (Hook, Story, Offer, Value Ladder, Stack Slide, Dream 100, Reluctant Hero, Brunson Hard-Rule, Big Domino, etc.).
- \`get_glossary_term\` – working definition of one Brunson term in the founder's own words, by slug.
- \`list_podcast_episodes\` — every episode of the dataset-changelog podcast (slug, episode number, publication date, audio-shipped flag).
- \`get_podcast_episode\` — one dataset-changelog episode by slug, with audio enclosure metadata when env-gated audio has shipped.
- \`list_media_assets\` — unified inventory of every audio/video asset on the site (dataset-changelog podcast + glossary TTS audio); filter by kind.
- \`get_glossary_audio\` — TTS audio metadata for one Brunson term (URL, duration, byte size, voice, transcript sha256). Empty until the operator runs the generation script.
- \`get_faq\` — search or list UnlockSaaS FAQ entries (objection answers, guarantee mechanics).
- \`get_offer\` — canonical UnlockSaaS offer in one call: who it is for, three-rung value ladder (free Diagnostic → $1 Starter → $49/mo Playbook with 60-day guarantee), guarantee mechanics (window length, refund cap, required milestones), and clickable URLs.
- \`get_dream_100_template\` — seven-category Brunson Dream 100 framework (Communities, Influencers, Podcasts, Newsletters, Products, YouTube, Blogs) with target counts summing to 100, intent, worked examples, and work-your-way-in vs buy-your-way-in tactic split. Niche-agnostic structural template.
- \`get_value_ladder_archetype\` — one of the four Brunson funnel archetypes (Lead Funnel Rung 0 free, Unboxing Funnel Rung 1 $1-$50, Presentation Funnel Rung 2 $49-$300/mo, Phone Funnel Rung 3 $2,000+) with pages, Hook/Story/Offer shape, build-order rule, worked example, common indie-scale failure.
- \`get_objection_pattern\` — one of eight dollar-objection patterns with verbatim public source quote (Indie Hackers / Hacker News, link-attributed), Brunson External Belief classification, answer copy, sales-page disqualifier line, and funnel placement. Categories: subscription-fatigue, cash-constraint, burned-by-gurus, not-tools-job, build-it-myself, price-scales-badly, praise-without-payment, built-beside-not-inside.
- \`get_diagnostic\` — fetch a stored, publicly-shared diagnostic by id (v1 Brunson label + headline + explanation + evidence + next step). Privacy-gated to \`share_visibility='public'\` rows only; no PII returned.
- \`get_thirty_day_plan\` — fetch the four-week plan from a publicly-shared V2 deep diagnostic (week-by-week theme + deliverables). Graceful fallback if row ran V1 only.
- \`get_rewrites\` — fetch the hero / primary-CTA / value-prop rewrites from a publicly-shared V2 deep diagnostic. Each includes current + 3 alternates + why-better rationale.
- \`update_progress\` — (authenticated) record the founder's status on one of the seven Playbook steps. Requires a founder-scoped API key (\`usk_<22 chars>\`) minted from the dashboard. Returns the updated full 7-step state and a suggested next step.

## Auth

The read tools (25 of 30) require no auth. The one write tool, \`update_progress\`, requires a per-founder API key:

- Key format: \`usk_<22 base64url chars>\`
- Mint from the dashboard (settings → MCP key) or rotate by overwriting.
- Pass as the \`api_key\` argument to \`update_progress\`. Never logged. Stored only on \`profiles.mcp_api_key\` behind RLS.
- Invalid keys return a generic error; the server never reveals whether a key existed.

## What it will not do

- No checkout, no email capture, no Stripe calls.
- No fabricated payloads. Every teardown is sourced verbatim from the static manifest that renders the public HTML.
- No invented diagnostic results. \`diagnose_url\` returns the same Brunson label the live diagnostic engine produces.
- No tracking of agent identity beyond the optional founder API key on \`update_progress\`.
- No reads of private diagnostics. The \`get_diagnostic\` / \`get_thirty_day_plan\` / \`get_rewrites\` tools only return rows the founder explicitly shared (\`share_visibility = 'public'\`).

## Why this exists

The WebSite JSON-LD on every UnlockSaaS page declares a \`potentialAction\` of type \`AskAction\`, pointing at \`/diagnostic\`. Until this MCP server existed, that was a declaration without an executor. Now it is the executor — any agent context can call \`diagnose_url\` directly and quote the result back to its user, with a referrer-tagged link to the full deep diagnostic.

Maintained by Maryan (maryan@unlocksaas.com). See ${BASE_URL}/editorial-policy for sourcing standards.
`;

/**
 * Cached body builder. `'use cache'` requires a serializable return value, so
 * we cache the BODY string (deterministic, derived from BASE_URL at module
 * load) and let GET wrap it fresh in a NextResponse on every call. BODY is
 * already a build-time constant, so cacheLife('max') is fine — the cached
 * payload is valid until the next deploy invalidates the build-id-keyed cache.
 */
async function getBody(): Promise<string> {
  "use cache";
  cacheLife("max");
  return BODY;
}

export async function GET() {
  const body = await getBody();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/mcp>; rel="canonical"`,
    },
  });
}
