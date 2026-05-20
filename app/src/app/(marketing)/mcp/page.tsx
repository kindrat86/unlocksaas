import type { Metadata } from "next";
import Link from "next/link";
import {
  OrganizationJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /mcp – marketing + install page for the UnlockSaaS MCP server.
 *
 * Why this surface exists
 * -----------------------
 * The MCP server itself lives at /api/mcp – machine-readable, no UI.
 * A human operator (a founder using Claude Desktop, a Cursor user, a
 * registry curator) needs a single landing page that answers:
 *
 *   1. What is this?
 *   2. Why would I install it?
 *   3. How do I install it (Claude Desktop / Cursor / Vercel MCP / curl)?
 *   4. What tools does it expose?
 *   5. Where is the discovery manifest for self-registering my registry?
 *
 * This page is the answer to all five. Stays narrow – no upsell to the
 * Playbook, no $1 Starter cross-link in the body. Brunson Hard-Rule
 * polarity: the page that serves the agent-installer reader should
 * NOT also try to convert them into a $49 customer in the same scroll.
 * Footer link to the rest of the site is enough.
 *
 * SEO posture
 * -----------
 * Indexable. Carries Organization + BreadcrumbList JSON-LD. The page
 * itself is the canonical answer to "does UnlockSaaS have an MCP
 * server" – a query that will trend up sharply through 2026 as AI
 * coding assistants standardise on MCP for tool integration. Pre-
 * occupying this surface now is exactly the same play as having shipped
 * the llms.txt + llms-feed.json couple in 2025: the early-mover
 * indexing position compounds.
 *
 * No `aggregateRating` – the MCP server has no reviews. Honest empty.
 */

const CANONICAL_PATH = "/mcp";
const MD_PATH = "/mcp.md";

export const metadata: Metadata = {
  title: "MCP server – install in Claude, Cursor, Windsurf",
  description:
    "The UnlockSaaS MCP server gives agents read-only access to live SaaS landing-page diagnostics plus 157 honest funnel, pricing, alternative, comparison, and category teardowns. Stateless Streamable HTTP, no auth required, brought up by Maryan.",
  alternates: markdownAlternate(`${BASE_URL}${CANONICAL_PATH}`, MD_PATH),
  openGraph: {
    title: "UnlockSaaS MCP server – install in Claude, Cursor, Windsurf",
    description:
      "Read-only MCP access to live SaaS landing-page diagnostics plus 157 funnel, pricing, alternative, comparison, and category teardowns.",
    url: CANONICAL_PATH,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnlockSaaS MCP server",
    description:
      "Read-only MCP server: diagnose a SaaS URL, fetch any teardown or comparison, ask in Claude / Cursor / Windsurf.",
  },
  robots: { index: true, follow: true },
};

const TRAIL = [
  { name: "Unlock SaaS", url: `${BASE_URL}/` },
  { name: "MCP server", url: `${BASE_URL}${CANONICAL_PATH}` },
] as const;

// The canonical MCP endpoint URL. Single source of truth for every
// install snippet on the page – the configs all derive from this so a
// rename never desynchronises the doc page.
const MCP_URL = `${BASE_URL}/api/mcp`;

// The 15 tools the server exposes, mirrored from the registration
// order in app/api/[transport]/route.ts. Kept in sync manually – the
// MCP server is the source of truth, this list is a teaching mirror.
// Brunson Hard-Rule: if a tool is removed from the route it MUST also
// be removed here, and vice-versa. Drift check: this list, the BODY
// string in app/src/app/mcp.md/route.ts, and the `tools` array in
// app/src/app/.well-known/mcp.json/route.ts must all carry the same
// tool count and the same registration order as the route handler.
const TOOLS: ReadonlyArray<{ name: string; description: string }> = [
  {
    name: "diagnose_url",
    description:
      "Reads a live public SaaS landing page, labels it as Wrong Person / Weak Offer / Weak Belief, returns the next concrete step. Takes ~30 seconds (Claude-backed).",
  },
  {
    name: "list_funnel_teardowns",
    description:
      "Slug + display name + category for every indie-SaaS funnel teardown UnlockSaaS publishes.",
  },
  {
    name: "get_funnel_teardown",
    description:
      "Hook / Story / Offer breakdown and Brunson lens for a single product, by slug.",
  },
  {
    name: "list_pricing_teardowns",
    description:
      "Slug + display name + category for every indie-SaaS pricing teardown.",
  },
  {
    name: "get_pricing_teardown",
    description:
      "Tier-by-tier pricing analysis, anchor mechanic, upgrade trigger, payment mechanics, Brunson lens.",
  },
  {
    name: "list_comparisons",
    description:
      "Slug, both product names, and category for every head-to-head comparison.",
  },
  {
    name: "get_comparison",
    description:
      "Dimension-by-dimension head-to-head comparison, symmetric framing, honest verdict for indie SaaS founders.",
  },
  {
    name: "list_alternatives",
    description:
      "Slug + display name for every named-competitor UnlockSaaS-vs-X comparison.",
  },
  {
    name: "find_alternative_to",
    description:
      "Resolves a free-text product name (capitalisation-tolerant) to the matching UnlockSaaS-vs-X entry.",
  },
  {
    name: "list_categories",
    description:
      "Slug + display name + one-line summary for every category roundup.",
  },
  {
    name: "get_category",
    description:
      "Category roundup with intent paragraph plus every funnel teardown, pricing teardown, and comparison in that category.",
  },
  {
    name: "get_playbook_step",
    description:
      "One of the seven Playbook steps by number (1-7), name + canonical description.",
  },
  {
    name: "list_glossary_terms",
    description:
      "Slug + term name for every Brunson concept UnlockSaaS teaches (Hook, Story, Offer, Value Ladder, Stack Slide, Dream 100, Reluctant Hero, Brunson Hard-Rule, Big Domino, etc.).",
  },
  {
    name: "get_glossary_term",
    description:
      "Working definition of one Brunson term, in the founder's own words, by slug (e.g. 'hook', 'value-ladder', 'big-domino', 'brunson-hard-rule').",
  },
  {
    name: "get_faq",
    description:
      "Search or list UnlockSaaS FAQ entries (objection answers, guarantee mechanics).",
  },
];

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "unlocksaas": {
      "command": "npx",
      "args": ["mcp-remote", "${MCP_URL}"]
    }
  }
}`;

const CURSOR_CONFIG = `{
  "mcpServers": {
    "unlocksaas": {
      "url": "${MCP_URL}"
    }
  }
}`;

const INSPECTOR_CMD = `npx @modelcontextprotocol/inspector ${MCP_URL}`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted text-foreground rounded-md border p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

export default function MCPPage() {
  return (
    <main className="px-6 py-12 md:py-16">
      <OrganizationJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />

      <article className="max-w-2xl mx-auto space-y-8">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:underline">
            Unlock SaaS
          </Link>{" "}
          <span aria-hidden>›</span> MCP server
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            UnlockSaaS MCP server
          </h1>
          <p className="text-lg text-muted-foreground">
            A read-only MCP server that lets Claude, Cursor, Windsurf, and any
            other MCP-aware client diagnose a live SaaS landing page and pull
            structured data from the 157 funnel, pricing, alternative,
            comparison, and category teardowns UnlockSaaS publishes.
          </p>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The endpoint</h2>
          <p>
            One URL. Stateless Streamable HTTP transport. No auth, no rate
            keys, no client registration. Paste it into any MCP client:
          </p>
          <CodeBlock>{MCP_URL}</CodeBlock>
          <p className="text-sm text-muted-foreground">
            Discovery manifest at{" "}
            <Link
              href="/.well-known/mcp.json"
              className="underline underline-offset-4"
            >
              /.well-known/mcp.json
            </Link>
            . Markdown mirror of this page at{" "}
            <Link
              href={MD_PATH}
              className="underline underline-offset-4"
            >
              {MD_PATH}
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Install in Claude Desktop
          </h2>
          <p>
            Claude Desktop currently bridges remote MCP servers through{" "}
            <code className="text-sm">mcp-remote</code>. Add this block to
            your Claude Desktop config (
            <code className="text-sm">claude_desktop_config.json</code>) and
            restart Claude:
          </p>
          <CodeBlock>{CLAUDE_DESKTOP_CONFIG}</CodeBlock>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Install in Cursor</h2>
          <p>
            Cursor supports remote MCP servers natively. Add this block to{" "}
            <code className="text-sm">.cursor/mcp.json</code> in your home
            directory or project root:
          </p>
          <CodeBlock>{CURSOR_CONFIG}</CodeBlock>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Inspect with the MCP Inspector
          </h2>
          <p>
            Before installing, point the official MCP Inspector at the URL to
            see every tool with its input schema and run-test interface:
          </p>
          <CodeBlock>{INSPECTOR_CMD}</CodeBlock>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Tools</h2>
          <ul className="space-y-3">
            {TOOLS.map((t) => (
              <li key={t.name} className="border-l-2 pl-4 border-muted">
                <code className="font-mono text-sm">{t.name}</code>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">What it will not do</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>
              No write operations. No checkout, no email capture, no Stripe
              calls. Every tool is read-only.
            </li>
            <li>
              No fabricated payloads. Every teardown / comparison /
              alternative is sourced verbatim from the same static manifest
              that renders the public HTML pages.
            </li>
            <li>
              No invented diagnostic results. The diagnose_url tool returns
              the same Brunson label the live diagnostic engine produces,
              with the same Reluctant-Hero voice.
            </li>
            <li>
              No tracking of agent identity. The server logs invocation
              telemetry through the same PostHog pipeline as the rest of the
              site, with no MCP-client fingerprinting.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Why this exists</h2>
          <p>
            The WebSite JSON-LD on every UnlockSaaS page already declares a{" "}
            <code className="text-sm">potentialAction</code> of type{" "}
            <code className="text-sm">AskAction</code>, pointing at{" "}
            <Link
              href="/diagnostic"
              className="underline underline-offset-4"
            >
              /diagnostic
            </Link>
            . Until this MCP server existed, that was a declaration without
            an executor. Now it is the executor – any agent context can call{" "}
            <code className="text-sm">diagnose_url</code> directly and quote
            the result back to its user, with a referrer-tagged link to the
            full deep diagnostic.
          </p>
          <p>
            Tools and registries that already index this server:{" "}
            <a
              href="https://modelcontextprotocol.io"
              className="underline underline-offset-4"
              rel="noopener noreferrer"
            >
              modelcontextprotocol.io
            </a>
            ,{" "}
            <a
              href="https://vercel.com/changelog/mcp-on-vercel"
              className="underline underline-offset-4"
              rel="noopener noreferrer"
            >
              Vercel MCP catalog
            </a>
            ,{" "}
            <a
              href="https://mcp.run"
              className="underline underline-offset-4"
              rel="noopener noreferrer"
            >
              mcp.run
            </a>
            .
          </p>
        </section>

        <footer className="pt-8 border-t text-sm text-muted-foreground">
          Maintained by Maryan ·{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4"
          >
            maryan@unlocksaas.com
          </a>{" "}
          ·{" "}
          <Link
            href="/editorial-policy"
            className="underline underline-offset-4"
          >
            Editorial policy
          </Link>{" "}
          ·{" "}
          <Link href="/about" className="underline underline-offset-4">
            About
          </Link>
        </footer>
      </article>
    </main>
  );
}
