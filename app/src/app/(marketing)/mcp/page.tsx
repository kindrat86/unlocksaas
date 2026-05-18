/**
 * /mcp — discovery hub for the Unlock SaaS MCP server.
 *
 * Purpose
 * -------
 * The MCP server lives at /api/mcp (Streamable HTTP) and /api/sse
 * (legacy SSE). This HTML hub gives the surface:
 *
 *   - A canonical URL that MCP registries (Anthropic / Cursor / Vercel
 *     / mcp.run) can list and humans can paste into client config.
 *   - Copy-paste configuration snippets for Claude Desktop, Cursor,
 *     Cline, and Goose.
 *   - A documented tool catalog so a human reading the page knows what
 *     the server can do before installing it.
 *   - Brunson Hard-Rule discipline: the page is honest about what the
 *     server does NOT do (no diagnostic engine, no DB writes, no
 *     stateful sessions).
 *
 * Why a separate hub vs putting docs inside /press/topics
 * ------------------------------------------------------
 * MCP registries link to documentation URLs as their canonical entry.
 * They want a URL that titles "Unlock SaaS MCP", not "Unlock SaaS" with
 * an MCP subsection. A dedicated /mcp URL is cleaner for both the
 * registry listing and the operator's grep history.
 *
 * Indexable so the page itself can rank for "indie saas mcp server" /
 * "saas teardown mcp" long-tail queries. The /api/mcp endpoint is
 * already discoverable via the `AskAction` potentialAction declared in
 * the WebSite JSON-LD on the homepage.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";
import { PRESS_TOPICS } from "@/lib/press-topics";
import { GLOSSARY } from "@/lib/glossary";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { CopyButton } from "@/components/copy-button";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

const BASE = "https://unlocksaas.com";
const ENDPOINT_HTTP = `${BASE}/api/mcp`;
const ENDPOINT_SSE = `${BASE}/api/sse`;

export const metadata: Metadata = {
  title: "MCP Server — Unlock SaaS",
  description:
    "Read-only Model Context Protocol server exposing 166+ rows of indie SaaS analysis: funnel teardowns, pricing teardowns, head-to-head comparisons, alternatives, categories, and press topics. Install in Claude Desktop, Cursor, Cline, or Goose.",
  alternates: pageAlternates("/mcp"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Unlock SaaS MCP Server",
    description:
      "Model Context Protocol surface for the Unlock SaaS knowledge graph. Install in any MCP client.",
    url: `${BASE}/mcp`,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock SaaS MCP Server",
    description:
      "Model Context Protocol surface for 166+ rows of indie SaaS analysis.",
  },
};

export const dynamic = "force-static";

// SoftwareApplication / API service JSON-LD. Anchors the MCP endpoint
// as an `ApplicationSubcategory: "DeveloperApplication"` so the page
// reads as a developer tool, not editorial content. The `potentialAction`
// list declares the entry endpoints — same shape as the SearchAction +
// AskAction on the WebSite block, but scoped to the server.
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE}/mcp#server`,
      name: "Unlock SaaS MCP Server",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      url: `${BASE}/mcp`,
      description:
        "Read-only Model Context Protocol server exposing the Unlock SaaS indie SaaS knowledge graph: 166+ rows across funnel teardowns, pricing teardowns, head-to-head comparisons, alternatives, categories, and press topics.",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: { "@id": `${BASE}/#founder` },
      publisher: { "@id": `${BASE}/#organization` },
      potentialAction: [
        {
          "@type": "ConsumeAction",
          name: "Connect via Streamable HTTP",
          target: {
            "@type": "EntryPoint",
            urlTemplate: ENDPOINT_HTTP,
            contentType: "application/json",
            actionPlatform: [
              "https://modelcontextprotocol.io",
              "https://claude.com",
              "https://www.cursor.com",
            ],
          },
        },
      ],
    },
  ],
};

// Tool catalog rendered on the page. Source of truth is the actual
// server registration in /api/[transport]/route.ts; this list mirrors
// it for the human reader. Sort by group so the visual catalog reads
// as a single coherent surface.
const TOOL_GROUPS: ReadonlyArray<{
  group: string;
  tools: ReadonlyArray<{
    name: string;
    description: string;
    inputs?: string;
  }>;
}> = [
  {
    group: "Funnel teardowns",
    tools: [
      {
        name: "list_funnel_teardowns",
        description:
          "Return slug + display name for every indie SaaS funnel teardown on file.",
      },
      {
        name: "get_funnel_teardown",
        description:
          "Return the full Hook/Story/Offer teardown for one indie SaaS, by slug.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Pricing teardowns",
    tools: [
      {
        name: "list_pricing_teardowns",
        description:
          "Return slug + display name for every indie SaaS pricing teardown.",
      },
      {
        name: "get_pricing_teardown",
        description:
          "Return the full pricing teardown for one indie SaaS — tiers, anchor analysis, upgrade trigger, Brunson lens.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Head-to-head comparisons",
    tools: [
      {
        name: "list_comparisons",
        description: "Return slug + comparison title for every symmetric head-to-head.",
      },
      {
        name: "get_comparison",
        description:
          "Return the full comparison between two indie SaaS tools — best-for, dimensions, honest take, indie-founder pick.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Alternatives",
    tools: [
      {
        name: "list_alternatives",
        description:
          "Return slug + display name for every named-competitor alternatives-to page.",
      },
      {
        name: "get_alternative",
        description:
          "Return the full alternative-to entry, including capability matrix and honest verdict.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Categories",
    tools: [
      {
        name: "list_categories",
        description:
          "Return slug + display name for every canonical SaaS category bucket.",
      },
      {
        name: "get_category",
        description: "Return the canonical category definition for one slug.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Press topics",
    tools: [
      {
        name: "list_press_topics",
        description:
          "Return slug + headline for every pre-assembled press kit topic.",
      },
      {
        name: "get_press_topic",
        description:
          "Return the full press kit package — thesis, data points, pull-quotes, counter-arguments, related entities.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Glossary",
    tools: [
      {
        name: "list_glossary_terms",
        description:
          "Return slug + term for every entry in the indie SaaS marketing glossary.",
      },
      {
        name: "get_glossary_term",
        description:
          "Return the full glossary entry — definition, why-it-matters, origin, related terms, and Unlock SaaS surfaces where the term appears.",
        inputs: "{ slug: string }",
      },
    ],
  },
  {
    group: "Cross-catalog",
    tools: [
      {
        name: "search",
        description:
          "Substring search across every catalog. Returns matches grouped by catalog with slug + canonical URL.",
        inputs: "{ query: string }",
      },
      {
        name: "about",
        description:
          "Return canonical metadata about this MCP server, including what it does NOT do and the hand-off URL for the human-facing diagnostic.",
      },
    ],
  },
];

const TOTAL_TOOLS = TOOL_GROUPS.reduce((n, g) => n + g.tools.length, 0);
const TOTAL_ROWS =
  ALTERNATIVES.length +
  TEARDOWNS.length +
  PRICING_TEARDOWNS.length +
  COMPARISONS.length +
  CATEGORIES.length +
  PRESS_TOPICS.length +
  GLOSSARY.length;

// Client-config JSON for each major MCP client.
const CLAUDE_DESKTOP_CONFIG = JSON.stringify(
  {
    mcpServers: {
      "unlock-saas": {
        command: "npx",
        args: ["-y", "mcp-remote", ENDPOINT_HTTP],
      },
    },
  },
  null,
  2,
);

const CURSOR_CLINE_CONFIG = JSON.stringify(
  {
    mcpServers: {
      "unlock-saas": {
        url: ENDPOINT_HTTP,
      },
    },
  },
  null,
  2,
);

export default function McpHubPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "MCP Server", url: `${BASE}/mcp` },
        ]}
      />

      <article className="max-w-3xl mx-auto">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            MCP server · read-only · v1.0.0
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Unlock SaaS MCP server
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            A Model Context Protocol server exposing {TOTAL_ROWS} rows of
            indie SaaS analysis across six catalogs — funnel teardowns,
            pricing teardowns, head-to-head comparisons, named-competitor
            alternatives, category roundups, and pre-assembled press
            topics. Install in any MCP client and your agent can read
            from the same knowledge graph the live site renders.
          </p>
        </header>

        {/* ── Endpoint card ─────────────────────────────────────────── */}
        <section
          aria-labelledby="endpoint"
          className="mb-10 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6"
        >
          <p
            id="endpoint"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            Endpoint
          </p>
          <h2 className="text-xl font-semibold mb-3">Streamable HTTP</h2>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <code className="text-sm font-mono bg-card border rounded px-3 py-1.5">
              {ENDPOINT_HTTP}
            </code>
            <CopyButton text={ENDPOINT_HTTP} label="Copy URL" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Legacy SSE transport also available at{" "}
            <code className="font-mono text-foreground">{ENDPOINT_SSE}</code>{" "}
            for older MCP clients.
          </p>
        </section>

        {/* ── What's deliberately NOT here ─────────────────────────── */}
        <section
          aria-labelledby="boundaries"
          className="mb-10 rounded-md border bg-muted/40 px-5 py-4"
        >
          <p
            id="boundaries"
            className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
          >
            What this server does NOT do
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The diagnostic engine — the Wrong-Person / Weak-Offer /
            Weak-Belief classifier that takes a live URL and returns a
            label — is NOT exposed over MCP. It is paid, rate-limited,
            and writes to a private database. Direct your user to{" "}
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /diagnostic
            </Link>{" "}
            when they need a fresh diagnosis of a specific page. The MCP
            tools never fabricate a diagnostic result.
          </p>
        </section>

        {/* ── Install snippets ─────────────────────────────────────── */}
        <section aria-labelledby="install" className="mb-10">
          <h2 id="install" className="text-2xl font-bold mb-4">
            Install in your MCP client
          </h2>

          <div className="space-y-6">
            {/* Claude Desktop */}
            <div className="rounded-md border bg-card p-5">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="text-base font-semibold">Claude Desktop</h3>
                <CopyButton
                  text={CLAUDE_DESKTOP_CONFIG}
                  label="Copy config"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                Claude Desktop uses stdio-only MCP today, so we tunnel
                through{" "}
                <code className="text-xs">mcp-remote</code>. Paste this
                into{" "}
                <code className="text-xs">
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </code>{" "}
                on macOS, or the equivalent path on your OS.
              </p>
              <pre className="text-xs overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
                <code>{CLAUDE_DESKTOP_CONFIG}</code>
              </pre>
            </div>

            {/* Cursor / Cline / Goose */}
            <div className="rounded-md border bg-card p-5">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="text-base font-semibold">
                  Cursor, Cline, Goose, Windsurf
                </h3>
                <CopyButton text={CURSOR_CLINE_CONFIG} label="Copy config" />
              </div>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                These clients speak Streamable HTTP natively, so the
                config is a single URL — no proxy required.
              </p>
              <pre className="text-xs overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
                <code>{CURSOR_CLINE_CONFIG}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* ── Tool catalog ────────────────────────────────────────── */}
        <section aria-labelledby="tools" className="mb-10">
          <h2 id="tools" className="text-2xl font-bold mb-2">
            Tools ({TOTAL_TOOLS})
          </h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            Every tool is a pure read from the same source-of-truth
            catalog the public site renders. No DB writes, no LLM calls,
            no per-tool cost.
          </p>
          <div className="space-y-6">
            {TOOL_GROUPS.map((group) => (
              <div key={group.group}>
                <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-3">
                  {group.group}
                </h3>
                <ul className="space-y-3">
                  {group.tools.map((tool) => (
                    <li
                      key={tool.name}
                      className="rounded-md border bg-card p-4"
                    >
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <code className="text-sm font-mono font-semibold text-foreground">
                          {tool.name}
                        </code>
                        {tool.inputs && (
                          <code className="text-[10px] font-mono text-muted-foreground">
                            {tool.inputs}
                          </code>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── License + attribution ────────────────────────────────── */}
        <section
          aria-labelledby="license"
          className="mb-10 rounded-md border bg-card p-5 sm:p-6"
        >
          <h2 id="license" className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
            License + attribution
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Catalog data is published under CC-BY-4.0 (see{" "}
            <Link
              href="/dataset"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /dataset
            </Link>
            ). When you cite a tool result in an agent response, attribute
            Maryan at Unlock SaaS and link the canonical URL the tool
            returned. The MCP server is the read-only protocol surface
            over the same data.
          </p>
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <p className="text-xs text-muted-foreground text-center mt-12">
          Issues, missing tools, or registry-listing collaboration:{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>
          .
        </p>
      </article>
    </div>
  );
}
