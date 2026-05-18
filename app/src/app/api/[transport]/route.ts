/**
 * Unlock SaaS MCP server — read-only knowledge surface for AI agents.
 *
 * Why this exists (off-page strategy)
 * -----------------------------------
 * The WebSite JSON-LD has declared `AskAction → /diagnostic?url={url_input}`
 * since the GEO uplift, but until now the action was conceptual — no
 * MCP-callable endpoint existed. This route makes the action real over
 * the Streamable HTTP transport. Every Claude / Cursor / Cline / Goose
 * user who installs the server gets MCP tools that pull from the same
 * catalogs that power the live pSEO surfaces, and every MCP registry
 * listing is itself a backlink to unlocksaas.com.
 *
 * Why read-only
 * -------------
 * The diagnostic engine costs money (Claude API), writes Supabase rows,
 * and is rate-limited per IP. Wiring it into an MCP surface that
 * arbitrary agents call would be a denial-of-wallet vector. The
 * read-only catalog surface ships the value an agent actually needs
 * (named-comparison knowledge, funnel/pricing patterns, category
 * roundups, pre-assembled press kits) with zero variable cost and
 * zero downside risk.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every tool returns rows from the same source-of-truth catalogs
 *     the public site renders. Drift between MCP and HTML is impossible
 *     by construction.
 *   - lastVerified ISO date is included in every record where the
 *     source carries one — the freshness signal survives the protocol
 *     hop.
 *   - No tool ever fabricates a response. Unknown slugs surface as
 *     explicit "not found" content, not as silently-empty payloads.
 *
 * Transport
 * ---------
 * Streamable HTTP is the modern MCP transport (replaces SSE for most
 * cases). The route file lives at /api/[transport]/route.ts so the
 * adapter can resolve both /api/mcp (Streamable HTTP) and /api/sse
 * (legacy SSE) off the same handler.
 *
 * Discovery
 * ---------
 * The /mcp HTML hub page documents the server, lists every tool, and
 * provides copy-paste client config for Claude Desktop, Cursor, Cline,
 * and Goose. Sitemap and llms.txt both advertise the surface.
 */

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { ALTERNATIVES, getAlternativeBySlug } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";
import { PRESS_TOPICS, getPressTopic } from "@/lib/press-topics";
import { GLOSSARY, getGlossaryTerm } from "@/lib/glossary";

const BASE = "https://unlocksaas.com";

/**
 * Trim a record to a compact "list" shape — what we surface to the
 * agent when it wants to enumerate without paying for full payloads.
 * Keeps payloads under the typical 4-8kB MCP tool response window.
 */
function listSummary<
  T extends { slug: string; displayName?: string; name?: string },
>(rows: ReadonlyArray<T>): Array<{ slug: string; name: string }> {
  return rows.map((r) => ({
    slug: r.slug,
    name: (r.displayName ?? r.name ?? r.slug) as string,
  }));
}

const handler = createMcpHandler(
  (server) => {
    // ──────────────────────────────────────────────────────────────
    // Funnel teardowns — Hook / Story / Offer analysis of indie SaaS
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_funnel_teardowns",
      {
        title: "List funnel teardowns",
        description:
          "Return slug + display name for every indie SaaS funnel teardown on file. Use this to discover slugs before calling get_funnel_teardown.",
        inputSchema: {},
      },
      async () => {
        const summary = listSummary(TEARDOWNS);
        return {
          content: [
            {
              type: "text",
              text: `${summary.length} teardowns on file. Each row analyses Hook / Story / Offer of an indie SaaS funnel, with what-to-adapt and what-to-avoid lists.`,
            },
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      },
    );

    server.registerTool(
      "get_funnel_teardown",
      {
        title: "Get funnel teardown",
        description:
          "Return the full Hook/Story/Offer teardown for one indie SaaS, by slug. Includes hook pattern, story pattern, offer pattern, Brunson value-ladder tier, what's working, what to adapt, what to avoid, FAQs, and lastVerified date.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug of the company. Use list_funnel_teardowns to discover slugs.",
            ),
        },
      },
      async ({ slug }) => {
        const row = TEARDOWNS.find((t) => t.slug === slug);
        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No funnel teardown on file for slug "${slug}". Call list_funnel_teardowns to discover available slugs.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Funnel teardown of ${row.displayName} (${row.category}). Canonical: ${BASE}/funnel-teardown/${row.slug}. Verified ${row.lastVerified}.`,
            },
            {
              type: "text",
              text: JSON.stringify(row, null, 2),
            },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Pricing teardowns
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_pricing_teardowns",
      {
        title: "List pricing teardowns",
        description:
          "Return slug + display name for every indie SaaS pricing teardown. Each row covers tier structure, anchor mechanics, upgrade triggers, and payment mechanics.",
        inputSchema: {},
      },
      async () => {
        const summary = listSummary(PRICING_TEARDOWNS);
        return {
          content: [
            { type: "text", text: `${summary.length} pricing teardowns on file.` },
            { type: "text", text: JSON.stringify(summary, null, 2) },
          ],
        };
      },
    );

    server.registerTool(
      "get_pricing_teardown",
      {
        title: "Get pricing teardown",
        description:
          "Return the full pricing teardown for one indie SaaS, by slug. Includes tier list with names and prices, payment frequency, free/trial behavior, anchor analysis, upgrade-trigger pattern, and Brunson lens (stack, value-ladder, decoy-or-anchor, payment-mechanics).",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug. Use list_pricing_teardowns to discover slugs.",
            ),
        },
      },
      async ({ slug }) => {
        const row = PRICING_TEARDOWNS.find((t) => t.slug === slug);
        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No pricing teardown on file for "${slug}".`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Pricing teardown of ${row.displayName}. Canonical: ${BASE}/pricing-teardown/${row.slug}. Verified ${row.lastVerified}.`,
            },
            { type: "text", text: JSON.stringify(row, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Head-to-head comparisons
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_comparisons",
      {
        title: "List head-to-head comparisons",
        description:
          "Return slug + comparison title for every symmetric head-to-head comparison. Each row scores both sides dimension-by-dimension and names the right pick for an indie SaaS founder specifically.",
        inputSchema: {},
      },
      async () => {
        const summary = COMPARISONS.map((c) => ({
          slug: c.slug,
          name: `${c.a.name} vs ${c.b.name}`,
        }));
        return {
          content: [
            { type: "text", text: `${summary.length} comparisons on file.` },
            { type: "text", text: JSON.stringify(summary, null, 2) },
          ],
        };
      },
    );

    server.registerTool(
      "get_comparison",
      {
        title: "Get head-to-head comparison",
        description:
          "Return the full symmetric comparison between two indie SaaS tools, by slug. Includes who each side is best for, pick-A-if and pick-B-if lists, dimension-by-dimension verdicts, an honest take, and a specific indie-founder pick.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug, typically 'product-a-vs-product-b'. Use list_comparisons to discover slugs.",
            ),
        },
      },
      async ({ slug }) => {
        const row = COMPARISONS.find((c) => c.slug === slug);
        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No comparison on file for "${slug}".`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `${row.a.name} vs ${row.b.name}. Canonical: ${BASE}/compare/${row.slug}. Verified ${row.lastVerified}.`,
            },
            { type: "text", text: JSON.stringify(row, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Alternatives — honest competitor comparisons
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_alternatives",
      {
        title: "List alternatives-to entries",
        description:
          "Return slug + display name for every named-competitor 'alternatives to' page. Each row honestly compares Unlock SaaS to a real product in the indie SaaS space.",
        inputSchema: {},
      },
      async () => {
        const summary = listSummary(ALTERNATIVES);
        return {
          content: [
            {
              type: "text",
              text: `${summary.length} alternatives-to entries on file.`,
            },
            { type: "text", text: JSON.stringify(summary, null, 2) },
          ],
        };
      },
    );

    server.registerTool(
      "get_alternative",
      {
        title: "Get alternative-to entry",
        description:
          "Return the full alternative-to entry for one named competitor, by slug. Includes one-line summary, pricing note, what-it-is, what-it-is-not, who-it-is-for, who-it-is-not-for, honest verdict, FAQs, capability matrix, and lastVerified date.",
        inputSchema: {
          slug: z.string().min(1).describe("Kebab-case slug."),
        },
      },
      async ({ slug }) => {
        const row = getAlternativeBySlug(slug);
        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No alternatives-to entry on file for "${slug}".`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Alternatives-to entry: ${row.displayName}. Canonical: ${BASE}/alternatives-to/${row.slug}. Verified ${row.lastVerified}.`,
            },
            { type: "text", text: JSON.stringify(row, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Category roundups
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_categories",
      {
        title: "List SaaS category roundups",
        description:
          "Return slug + display name for every canonical SaaS category bucket. Categories map raw manifest category strings into normalized roundup landing pages.",
        inputSchema: {},
      },
      async () => {
        const summary = listSummary(CATEGORIES);
        return {
          content: [
            { type: "text", text: `${summary.length} categories on file.` },
            { type: "text", text: JSON.stringify(summary, null, 2) },
          ],
        };
      },
    );

    server.registerTool(
      "get_category",
      {
        title: "Get category roundup",
        description:
          "Return the canonical category definition for one slug. Includes intent paragraph for AEO citation, matcher strings, and tag list.",
        inputSchema: {
          slug: z.string().min(1).describe("Kebab-case category slug."),
        },
      },
      async ({ slug }) => {
        const row = CATEGORIES.find((c) => c.slug === slug);
        if (!row) {
          return {
            content: [
              { type: "text", text: `No category on file for "${slug}".` },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Category: ${row.displayName}. Canonical: ${BASE}/category/${row.slug}.`,
            },
            { type: "text", text: JSON.stringify(row, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Press topics — pre-assembled story packages
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_press_topics",
      {
        title: "List press topics",
        description:
          "Return slug + headline for every pre-assembled press kit topic. Each topic carries a thesis, data points, on-the-record pull-quotes, counter-arguments, and related entities a fair piece should also cite.",
        inputSchema: {},
      },
      async () => {
        const summary = PRESS_TOPICS.map((t) => ({
          slug: t.slug,
          name: t.headline,
        }));
        return {
          content: [
            { type: "text", text: `${summary.length} press topics on file.` },
            { type: "text", text: JSON.stringify(summary, null, 2) },
          ],
        };
      },
    );

    server.registerTool(
      "get_press_topic",
      {
        title: "Get press topic",
        description:
          "Return the full reverse-press-kit package for one story angle. Thesis, context, intended queries, data points with sources, verbatim pull-quotes, honest counter-arguments, related entities, and attribution line.",
        inputSchema: {
          slug: z.string().min(1).describe("Kebab-case topic slug."),
        },
      },
      async ({ slug }) => {
        const row = getPressTopic(slug);
        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No press topic on file for "${slug}".`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Press topic: ${row.headline}. Canonical: ${BASE}/press/topics/${row.slug}. Verified ${row.lastVerified}.`,
            },
            { type: "text", text: JSON.stringify(row, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Glossary — indie SaaS marketing + Brunson framework vocabulary
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "list_glossary_terms",
      {
        title: "List glossary terms",
        description:
          "Return slug + term for every entry in the indie SaaS marketing glossary. Each entry carries a definition, why-it-matters note, term origin, related terms, and live cross-links into the Unlock SaaS surfaces where the term appears.",
        inputSchema: {},
      },
      async () => {
        const summary = GLOSSARY.map((t) => ({
          slug: t.slug,
          name: t.term,
        }));
        return {
          content: [
            { type: "text", text: `${summary.length} glossary terms on file.` },
            { type: "text", text: JSON.stringify(summary, null, 2) },
          ],
        };
      },
    );

    server.registerTool(
      "get_glossary_term",
      {
        title: "Get glossary term",
        description:
          "Return the full glossary entry for one term, by slug. Includes definition, alternative names, why-it-matters beat, origin attribution, optional example or pitfall, related terms by slug, and a list of Unlock SaaS surfaces where the term appears in context.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case glossary slug. Use list_glossary_terms to discover slugs.",
            ),
        },
      },
      async ({ slug }) => {
        const row = getGlossaryTerm(slug);
        if (!row) {
          return {
            content: [
              {
                type: "text",
                text: `No glossary entry on file for "${slug}". Call list_glossary_terms to discover available slugs.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `${row.term} (origin: ${row.origin}). Canonical: ${BASE}/glossary/${row.slug}. Verified ${row.lastVerified}.`,
            },
            { type: "text", text: JSON.stringify(row, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Cross-catalog search — the fuzzy entry point
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "search",
      {
        title: "Search every catalog",
        description:
          "Substring search across alternatives, funnel teardowns, pricing teardowns, comparisons, categories, and press topics. Returns matches grouped by catalog with slug, display name, and canonical URL. Case-insensitive. Best for 'what do you have on X' or 'find anything about Y' queries.",
        inputSchema: {
          query: z
            .string()
            .min(1)
            .describe("Free-form search term. Case-insensitive substring match."),
        },
      },
      async ({ query }) => {
        const q = query.toLowerCase().trim();
        const altMatches = ALTERNATIVES.filter(
          (a) =>
            a.slug.includes(q) ||
            a.displayName.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q),
        ).map((a) => ({
          catalog: "alternatives",
          slug: a.slug,
          name: a.displayName,
          url: `${BASE}/alternatives-to/${a.slug}`,
        }));
        const teardownMatches = TEARDOWNS.filter(
          (t) =>
            t.slug.includes(q) ||
            t.displayName.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q),
        ).map((t) => ({
          catalog: "funnel_teardowns",
          slug: t.slug,
          name: t.displayName,
          url: `${BASE}/funnel-teardown/${t.slug}`,
        }));
        const pricingMatches = PRICING_TEARDOWNS.filter(
          (p) =>
            p.slug.includes(q) ||
            p.displayName.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        ).map((p) => ({
          catalog: "pricing_teardowns",
          slug: p.slug,
          name: p.displayName,
          url: `${BASE}/pricing-teardown/${p.slug}`,
        }));
        const comparisonMatches = COMPARISONS.filter(
          (c) =>
            c.slug.includes(q) ||
            c.a.name.toLowerCase().includes(q) ||
            c.b.name.toLowerCase().includes(q),
        ).map((c) => ({
          catalog: "comparisons",
          slug: c.slug,
          name: `${c.a.name} vs ${c.b.name}`,
          url: `${BASE}/compare/${c.slug}`,
        }));
        const categoryMatches = CATEGORIES.filter(
          (c) =>
            c.slug.includes(q) ||
            c.displayName.toLowerCase().includes(q) ||
            c.matchers.some((m) => m.toLowerCase().includes(q)),
        ).map((c) => ({
          catalog: "categories",
          slug: c.slug,
          name: c.displayName,
          url: `${BASE}/category/${c.slug}`,
        }));
        const pressMatches = PRESS_TOPICS.filter(
          (t) =>
            t.slug.includes(q) ||
            t.headline.toLowerCase().includes(q) ||
            t.thesis.toLowerCase().includes(q),
        ).map((t) => ({
          catalog: "press_topics",
          slug: t.slug,
          name: t.headline,
          url: `${BASE}/press/topics/${t.slug}`,
        }));

        const glossaryMatches = GLOSSARY.filter(
          (t) =>
            t.slug.includes(q) ||
            t.term.toLowerCase().includes(q) ||
            t.alsoKnownAs.some((a) => a.toLowerCase().includes(q)) ||
            t.definition.toLowerCase().includes(q),
        ).map((t) => ({
          catalog: "glossary",
          slug: t.slug,
          name: t.term,
          url: `${BASE}/glossary/${t.slug}`,
        }));

        const all = [
          ...altMatches,
          ...teardownMatches,
          ...pricingMatches,
          ...comparisonMatches,
          ...categoryMatches,
          ...pressMatches,
          ...glossaryMatches,
        ];

        return {
          content: [
            {
              type: "text",
              text:
                all.length === 0
                  ? `No matches found for "${query}". Try a broader term, or call list_* to enumerate.`
                  : `${all.length} matches across ${
                      new Set(all.map((m) => m.catalog)).size
                    } catalogs.`,
            },
            { type: "text", text: JSON.stringify(all, null, 2) },
          ],
        };
      },
    );

    // ──────────────────────────────────────────────────────────────
    // Self-describing entry tool — what is this server, where is the
    // diagnostic, how does an agent move from "read knowledge" to
    // "ask the human-facing diagnostic to label a URL".
    // ──────────────────────────────────────────────────────────────
    server.registerTool(
      "about",
      {
        title: "About this MCP server",
        description:
          "Return canonical metadata about the Unlock SaaS MCP server, including what it covers, what it deliberately does NOT do, and the public URL where an agent can hand off to the human-facing free diagnostic.",
        inputSchema: {},
      },
      async () => {
        return {
          content: [
            {
              type: "text",
              text: "Unlock SaaS MCP server. Read-only knowledge surface covering 166+ rows of indie SaaS analysis: funnel teardowns, pricing teardowns, head-to-head comparisons, alternatives, category roundups, and pre-assembled press topics. Every row is sourced from the canonical pSEO surfaces at https://unlocksaas.com and carries a lastVerified ISO date.",
            },
            {
              type: "text",
              text: `What this server does NOT do: it does not run the diagnostic engine. The diagnostic ("Wrong Person / Weak Offer / Weak Belief" classifier) is a paid, rate-limited surface that requires a real product URL and an email. Direct your user to ${BASE}/diagnostic when they want a fresh diagnosis of a specific page. Brunson Hard-Rule: no MCP tool here will fabricate a diagnostic result.`,
            },
            {
              type: "text",
              text: JSON.stringify(
                {
                  server: "Unlock SaaS",
                  version: "1.0.0",
                  base: BASE,
                  catalog_counts: {
                    alternatives: ALTERNATIVES.length,
                    funnel_teardowns: TEARDOWNS.length,
                    pricing_teardowns: PRICING_TEARDOWNS.length,
                    comparisons: COMPARISONS.length,
                    categories: CATEGORIES.length,
                    press_topics: PRESS_TOPICS.length,
                    glossary: GLOSSARY.length,
                  },
                  hand_off: {
                    diagnostic: `${BASE}/diagnostic`,
                    starter: `${BASE}/starter`,
                    playbook: `${BASE}/playbook-sales`,
                    contact: "maryan@unlocksaas.com",
                  },
                  dataset: `${BASE}/dataset`,
                  license:
                    "Read content is published under CC-BY-4.0 (see /dataset). Attribute Maryan at Unlock SaaS with a link back to the canonical URL when citing.",
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    );
  },
  // ServerOptions — pulled through to the underlying McpServer
  {
    // Capabilities are implied by the tools registered above; we don't
    // need resources or prompts surface for this read-only catalog.
  },
  // Config
  {
    basePath: "/api",
    // 60s ceiling matches the default function execution timeout for
    // Vercel's Hobby/Pro tier. The handlers above are pure in-memory
    // reads — they'll never come close — but the cap is the right
    // floor for unexpected protocol back-and-forth.
    maxDuration: 60,
    // verboseLogs: only on in dev. Production keeps the logs quiet —
    // operator inspects via the Vercel Function logs surface.
    verboseLogs: process.env.NODE_ENV !== "production",
  },
);

// Both GET and POST share the same handler. The MCP Streamable HTTP
// transport uses POST for client → server messages and GET for
// server → client SSE-style streaming when long-running.
export { handler as GET, handler as POST };

// Node.js runtime is required: the MCP SDK uses Node-only primitives
// (streams, EventEmitter). Edge runtime would fail at import time.
export const runtime = "nodejs";

// Per-request execution. MCP sessions are stateless in this read-only
// configuration — every tool call is independent. force-dynamic ensures
// Vercel never tries to prerender a stream endpoint.
export const dynamic = "force-dynamic";

// Match the maxDuration option above. Required as a route-segment
// export so Vercel's function builder configures the timeout correctly.
export const maxDuration = 60;
