/**
 * MCP-tools catalog – programmatic SEO surface for the
 * "MCP server / MCP client / MCP tool directory" intent class.
 *
 * Why this surface exists
 * -----------------------
 * 2026 is the year MCP graduates from "interesting protocol" to default
 * AI-agent integration surface. The query class "best MCP server for X",
 * "how to install Y MCP", "is there an MCP for Z" trends up sharply, and
 * early movers on directory real estate compound – the same dynamic that
 * llms.txt occupied in 2025.
 *
 * The /mcp page we already ship documents OUR server. This catalog is the
 * Switzerland-style directory of MCP servers the indie SaaS founder would
 * plausibly install alongside ours. Each entry funnels back to UnlockSaaS
 * the same way every other pSEO surface does – diagnostic CTA in the
 * footer, no slag on the listed vendors.
 *
 * Brunson Hard-Rule discipline
 * ----------------------------
 *   - No fabricated tool counts. We do not claim "Server X exposes 23
 *     tools" unless that count is verifiable from the vendor's own docs.
 *     `toolHighlights` is a short, named list of capabilities – not a
 *     drift-prone exact tool inventory.
 *   - Install snippets reproduce the vendor's documented install command
 *     verbatim. If the vendor's docs change, we update on the next
 *     `lastVerified` cycle.
 *   - `lastVerified` is ISO, present on every entry, surfaced on the
 *     detail page so the reader knows when we last sanity-checked.
 *   - No quoted copy from the vendor. We describe their server in our
 *     own words.
 *
 * Cross-pattern linking
 * ---------------------
 * The detail page deep-links to /mcp (our own server) and to /diagnostic
 * (the offer). The hub appears in the sitemap as block #11. The MCP
 * server route exposes `list_mcp_directory_tools` so agents can read
 * the catalog without scraping HTML.
 */

// ----- Types ----------------------------------------------------------------

/** A single tool capability the server exposes. Capability-level, not exact tool-name. */
export interface McpToolHighlight {
  /** Short imperative label (e.g. "Read repository files"). */
  label: string;
  /** One-line plain-English description of what an agent can do with it. */
  description: string;
}

export interface McpToolFaq {
  q: string;
  a: string;
}

/**
 * A directory entry for one MCP server.
 *
 * Slug convention: kebab-case, prefixed with `mcp-` only for our own
 * server (`unlocksaas`). Third-party servers use the vendor's own slug
 * (`stripe`, `github`, `linear`) so URLs read naturally:
 * `/mcp-tools/stripe`, not `/mcp-tools/mcp-stripe`.
 */
export interface McpTool {
  /** URL slug. */
  slug: string;
  /** Display name (proper-noun). */
  name: string;
  /** Vendor / publisher. */
  vendor: string;
  /** Canonical product URL (vendor's docs page or repo). */
  vendorUrl: string;
  /**
   * Where the MCP server itself is documented or hosted:
   *  - "remote"  – hosted HTTPS endpoint the client connects to
   *  - "npm"     – npm-distributed local server, run via npx
   *  - "binary"  – distributed as a standalone binary
   *  - "repo"    – source-only, build it yourself
   */
  distribution: "remote" | "npm" | "binary" | "repo";
  /**
   * The install handle:
   *  - distribution "remote" → the https URL
   *  - distribution "npm"    → the package name (e.g. "@modelcontextprotocol/server-filesystem")
   *  - distribution "binary" → the binary name
   *  - distribution "repo"   → the repo URL
   */
  installHandle: string;
  /** Category bucket. Used for hub grouping. */
  category: string;
  /** Whether the server is published by the vendor (true) or community (false). */
  official: boolean;
  /** Whether UnlockSaaS built it. Surfaces a "Built by UnlockSaaS" badge. */
  builtByUnlocksaas?: boolean;
  /** One-line thesis of the server. Used on the hub card + meta description. */
  oneLine: string;
  /**
   * 40-to-60 word TL;DR for AEO. Must name the server, name the vendor,
   * name the category, and end with the indie-founder fit verdict.
   */
  tldr: string;
  /** Why an indie SaaS founder specifically should care. 2-3 sentences. */
  founderFit: string;
  /** 3-to-6 capability highlights (label + one-line description). */
  toolHighlights: ReadonlyArray<McpToolHighlight>;
  /** Optional pricing/auth note ("free, no auth", "requires API key", etc.). */
  accessNote?: string;
  /** 3-to-5 FAQs. */
  faqs: ReadonlyArray<McpToolFaq>;
  /** Tags for the hub filter chips. */
  tags: ReadonlyArray<string>;
  /** ISO date of last manual verification. */
  lastVerified: string;
}

// ----- Catalog --------------------------------------------------------------

const LAST_VERIFIED = "2026-05-22";

const MCP_TOOLS_LIST: McpTool[] = [
  // ----- Built by UnlockSaaS ------------------------------------------------
  {
    slug: "unlocksaas",
    name: "UnlockSaaS MCP server",
    vendor: "UnlockSaaS",
    vendorUrl: "https://unlocksaas.com/mcp",
    distribution: "remote",
    installHandle: "https://unlocksaas.com/api/mcp",
    category: "Indie SaaS strategy",
    official: true,
    builtByUnlocksaas: true,
    oneLine:
      "Read-only MCP access to a live SaaS landing-page diagnostic plus the full UnlockSaaS teardown, comparison, glossary, and playbook catalog.",
    tldr:
      "The UnlockSaaS MCP server gives agents read-only access to a 30-second SaaS landing-page diagnostic and the full library of funnel, pricing, alternative, comparison, category, and glossary teardowns. Stateless Streamable HTTP, no auth required. The right MCP for any agent helping a post-launch pre-revenue indie SaaS founder think through their offer.",
    founderFit:
      "If you are an indie SaaS founder using Claude, Cursor, or Windsurf to think through your offer, this server lets the assistant pull live structured data instead of guessing. Ask Claude to diagnose your live URL, fetch the funnel teardown of a competitor, or pull the Brunson definition of a term – all without leaving the chat.",
    toolHighlights: [
      {
        label: "Diagnose a live SaaS URL",
        description:
          "Reads any public SaaS landing page and labels it Wrong Person, Weak Offer, or Weak Belief with the next concrete step.",
      },
      {
        label: "Fetch any teardown",
        description:
          "Pull the full funnel, pricing, alternative, or comparison teardown for any indexed product, by slug.",
      },
      {
        label: "Look up Brunson concepts",
        description:
          "Glossary entries for Hook, Story, Offer, Value Ladder, Stack Slide, Dream 100, and the rest of the lexicon UnlockSaaS teaches.",
      },
      {
        label: "Walk the Playbook",
        description:
          "Read any of the seven Playbook steps by number with the canonical description.",
      },
    ],
    accessNote: "Free, no auth, stateless Streamable HTTP.",
    faqs: [
      {
        q: "Do I need an UnlockSaaS account to use the MCP server?",
        a: "No. The MCP server is read-only and unauthenticated. Any MCP-aware client can connect.",
      },
      {
        q: "Where is the discovery manifest?",
        a: "At /.well-known/mcp.json on unlocksaas.com. A markdown mirror of the install page lives at /mcp.md.",
      },
      {
        q: "Can the server write data back into my UnlockSaaS account?",
        a: "No – it is strictly read-only by design. Account-mutating actions stay inside the web UI.",
      },
    ],
    tags: ["strategy", "diagnostic", "indie-saas", "remote", "free"],
    lastVerified: LAST_VERIFIED,
  },

  // ----- Anthropic reference servers ---------------------------------------
  {
    slug: "filesystem",
    name: "Filesystem MCP server",
    vendor: "Anthropic (reference)",
    vendorUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    distribution: "npm",
    installHandle: "@modelcontextprotocol/server-filesystem",
    category: "Reference servers",
    official: true,
    oneLine:
      "Reference MCP server that gives an agent scoped read and write access to a directory on the local filesystem.",
    tldr:
      "The Filesystem reference server is one of the canonical MCP examples published by Anthropic. It exposes a sandboxed read and write surface scoped to a directory you pass at startup, so an agent can browse, read, edit, and create files inside that root without ever leaving the sandbox. The right baseline server for any local agent workflow.",
    founderFit:
      "If you are pair-programming with Claude on the codebase of your indie SaaS, this is the first MCP server you install. It lets the assistant read and write files in the project root without asking you to copy-paste, while keeping anything outside the chosen root off-limits.",
    toolHighlights: [
      {
        label: "Read files",
        description:
          "Read text or binary file contents anywhere inside the sandboxed root.",
      },
      {
        label: "Write and edit files",
        description:
          "Create new files, overwrite existing files, or apply targeted edits.",
      },
      {
        label: "Browse directories",
        description:
          "List contents, search, and follow the tree without leaving the sandbox.",
      },
    ],
    accessNote: "Local, free, sandboxed to the directory you pass at startup.",
    faqs: [
      {
        q: "Can the server access files outside the directory I configure?",
        a: "No – the sandbox root is enforced. Paths outside it are rejected.",
      },
      {
        q: "Does the server require a network connection?",
        a: "No. Filesystem MCP is local-only.",
      },
      {
        q: "How do I install it in Claude Desktop?",
        a: "Add an mcpServers entry that runs `npx -y @modelcontextprotocol/server-filesystem /absolute/path/to/your/sandbox` and restart Claude.",
      },
    ],
    tags: ["reference", "local", "filesystem", "developer-tools"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "git",
    name: "Git MCP server",
    vendor: "Anthropic (reference)",
    vendorUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    distribution: "npm",
    installHandle: "@modelcontextprotocol/server-git",
    category: "Reference servers",
    official: true,
    oneLine:
      "Reference MCP server that lets an agent run common git operations against a local repository.",
    tldr:
      "The Git reference server wraps the local git CLI in MCP tools so an agent can read history, inspect diffs, stage changes, and create commits without shelling out. Pairs naturally with the Filesystem server when an agent is editing code in a repo. The right baseline for any code-editing workflow that needs version control awareness.",
    founderFit:
      "If you are shipping daily on your indie SaaS and want Claude to help you review what changed, draft commit messages, or trace a regression to its introducing commit, this server gives the assistant first-class git access against your local repo.",
    toolHighlights: [
      {
        label: "Read history and diffs",
        description: "Walk commits, inspect diffs, blame lines.",
      },
      {
        label: "Stage and commit",
        description: "Stage selected paths, draft commit messages, commit.",
      },
      {
        label: "Branch inspection",
        description: "List branches, switch context, compare branches.",
      },
    ],
    accessNote: "Local, free, requires git installed on the host.",
    faqs: [
      {
        q: "Does the Git server push to remotes?",
        a: "Out of the box it focuses on local operations; review the latest tool list before relying on push semantics in automated flows.",
      },
      {
        q: "Can I scope it to one repository?",
        a: "Yes – pass the repository path at startup and the server operates against that working tree.",
      },
    ],
    tags: ["reference", "local", "git", "developer-tools"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "memory",
    name: "Memory MCP server",
    vendor: "Anthropic (reference)",
    vendorUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    distribution: "npm",
    installHandle: "@modelcontextprotocol/server-memory",
    category: "Reference servers",
    official: true,
    oneLine:
      "Reference MCP server that gives an agent a persistent key-value knowledge graph it can read and write across sessions.",
    tldr:
      "The Memory reference server is Anthropic's canonical example of a stateful MCP. It stores entities, relations, and observations in a local knowledge graph the agent can query, extend, and prune across conversations. The right baseline server when you want the assistant to remember things between chats without you re-explaining context.",
    founderFit:
      "If you find yourself re-pasting your founder bio, product positioning, or current focus into every new chat, install this server and let the assistant build up a private knowledge graph about your business it can consult automatically.",
    toolHighlights: [
      {
        label: "Persist entities and relations",
        description:
          "Store named entities and the relationships between them across sessions.",
      },
      {
        label: "Read the graph",
        description:
          "Query the graph by entity, relation, or free-text observation.",
      },
      {
        label: "Update or prune",
        description: "Add, modify, or remove observations as facts change.",
      },
    ],
    accessNote: "Local, free, persists to a JSON file you control.",
    faqs: [
      {
        q: "Where does Memory store its data?",
        a: "In a local JSON file at the path you configure. You own the file, so you can back it up, version it, or delete it at will.",
      },
      {
        q: "Is the data sent anywhere?",
        a: "No. The server is local. Only the assistant in your chat reads from it during a session.",
      },
    ],
    tags: ["reference", "local", "memory", "stateful"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "fetch",
    name: "Fetch MCP server",
    vendor: "Anthropic (reference)",
    vendorUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    distribution: "npm",
    installHandle: "@modelcontextprotocol/server-fetch",
    category: "Reference servers",
    official: true,
    oneLine:
      "Reference MCP server that lets an agent fetch a URL and convert the response to a representation suited to the model.",
    tldr:
      "The Fetch reference server exposes a single, focused capability: pull a URL and return the body in a form the model can read directly. Plain text, markdown, or chunked HTML, depending on what the page returns. The right baseline when you want the assistant to look at a live web page without a heavyweight browser MCP.",
    founderFit:
      "When you want Claude to read your own live landing page, a competitor's pricing page, or a public docs page and reason about it, Fetch is the minimum-friction way to give the assistant eyes on the web.",
    toolHighlights: [
      {
        label: "Fetch a URL",
        description:
          "Pull the body of any public HTTP/HTTPS URL the agent has permission to access.",
      },
      {
        label: "Convert to model-friendly format",
        description:
          "Returns markdown or text rather than raw HTML where possible.",
      },
    ],
    accessNote:
      "Local, free, respects standard network rules of the host machine.",
    faqs: [
      {
        q: "Can Fetch authenticate to private URLs?",
        a: "Out of the box it makes plain HTTP requests. For authenticated APIs, use the vendor-specific MCP for that service instead.",
      },
      {
        q: "Does Fetch render JavaScript?",
        a: "No – for client-rendered pages use a browser MCP such as Playwright.",
      },
    ],
    tags: ["reference", "web", "http", "developer-tools"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "time",
    name: "Time MCP server",
    vendor: "Anthropic (reference)",
    vendorUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
    distribution: "npm",
    installHandle: "@modelcontextprotocol/server-time",
    category: "Reference servers",
    official: true,
    oneLine:
      "Reference MCP server that exposes the current time and timezone conversions to the agent.",
    tldr:
      "The Time reference server gives the assistant a deterministic answer to questions like the current time in a given timezone or the conversion between two zones. Tiny, focused, and useful any time the model needs to reason about scheduling, cohorts, or anything time-dependent without hallucinating the current moment.",
    founderFit:
      "If you ever ask Claude to draft a launch announcement, schedule a cohort kickoff, or convert a webinar time across timezones, install this server so the answer is anchored in real clock state and not in the model's training-data sense of 'now'.",
    toolHighlights: [
      {
        label: "Get current time",
        description: "Return the current time in any IANA timezone.",
      },
      {
        label: "Convert between timezones",
        description: "Translate a timestamp from one zone to another.",
      },
    ],
    accessNote: "Local, free, no auth.",
    faqs: [
      {
        q: "Why install a time MCP at all?",
        a: "Language models do not know the current time on their own. A trivial MCP that returns the clock prevents a whole class of date-confusion mistakes.",
      },
    ],
    tags: ["reference", "local", "time", "utility"],
    lastVerified: LAST_VERIFIED,
  },

  // ----- Indie SaaS infrastructure -----------------------------------------
  {
    slug: "vercel",
    name: "Vercel MCP server",
    vendor: "Vercel",
    vendorUrl: "https://vercel.com/docs/mcp",
    distribution: "remote",
    installHandle: "https://mcp.vercel.com",
    category: "Indie SaaS infrastructure",
    official: true,
    oneLine:
      "Vercel's official MCP server that lets an agent inspect deployments, read logs, and reason about projects on your Vercel account.",
    tldr:
      "Vercel's official MCP server gives an authenticated agent read access to the deployments, logs, projects, and environment surface of your Vercel account. The right server when you want Claude or Cursor to investigate a failing deploy, summarize recent activity, or trace an error in a function log without you tabbing back to the dashboard.",
    founderFit:
      "If your indie SaaS is hosted on Vercel – and the audience this site is built for usually is – this server makes the assistant a competent operator inside your Vercel project. Ask Claude why a deploy failed, what the last successful preview was, or what changed between two builds, and get an answer grounded in your real account state.",
    toolHighlights: [
      {
        label: "Inspect deployments",
        description:
          "Read deployment metadata, status, build duration, and the URL of any deploy on your account.",
      },
      {
        label: "Read function logs",
        description:
          "Stream or read recent function and edge runtime logs to diagnose production issues.",
      },
      {
        label: "Read project configuration",
        description:
          "Pull project settings, domains, and environment variable names that the agent has permission to see.",
      },
    ],
    accessNote: "Authenticated; uses your Vercel account permissions.",
    faqs: [
      {
        q: "Will the MCP server expose my Vercel secrets to the agent?",
        a: "The server respects your account's permission model. Treat the agent as if it were a teammate with your account's read access and review the docs for the exact scope.",
      },
      {
        q: "Can the agent trigger deploys?",
        a: "The server is read-heavy by design. For write actions, prefer running the Vercel CLI in a controlled context.",
      },
    ],
    tags: ["hosting", "deployments", "remote", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "supabase",
    name: "Supabase MCP server",
    vendor: "Supabase",
    vendorUrl: "https://supabase.com/docs",
    distribution: "npm",
    installHandle: "@supabase/mcp-server-supabase",
    category: "Indie SaaS infrastructure",
    official: true,
    oneLine:
      "Supabase's official MCP server that lets an agent inspect schemas, run read queries, and reason about your Postgres database.",
    tldr:
      "Supabase's official MCP server gives the assistant a structured view into a Supabase project. Schema introspection, project metadata, and scoped query access. The right server when your indie SaaS lives on Supabase and you want Claude to help you write a migration, diagnose a slow query, or design a new table without copy-pasting schema diagrams.",
    founderFit:
      "Most post-launch pre-revenue indie SaaS founders are running Supabase. This MCP turns the assistant into a competent collaborator on your database – it can read the schema, explain a row-level-security policy, or draft a migration grounded in what your tables actually look like today.",
    toolHighlights: [
      {
        label: "Introspect the schema",
        description:
          "Read table, column, and index definitions across the project's schemas.",
      },
      {
        label: "Read project metadata",
        description:
          "Pull project, branch, and environment metadata the agent has permission to see.",
      },
      {
        label: "Run scoped queries",
        description:
          "Execute read queries under the access scope you configure for the server.",
      },
    ],
    accessNote:
      "Requires a Supabase access token. Scope the token to read-only when possible.",
    faqs: [
      {
        q: "Can the agent destroy data?",
        a: "Only if the access token you configure grants write permissions. Scope the token narrowly and start with read-only.",
      },
      {
        q: "Does it work with self-hosted Supabase?",
        a: "Read the latest docs – official support targets hosted Supabase first.",
      },
    ],
    tags: ["database", "postgres", "indie-stack", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "stripe",
    name: "Stripe MCP server",
    vendor: "Stripe",
    vendorUrl: "https://stripe.com/docs/agents",
    distribution: "npm",
    installHandle: "@stripe/mcp",
    category: "Indie SaaS infrastructure",
    official: true,
    oneLine:
      "Stripe's official MCP server that lets an agent query and act on your Stripe account through scoped API access.",
    tldr:
      "Stripe's official MCP server exposes the Stripe API to MCP-aware clients as a set of structured tools. The agent can look up customers, list charges, draft refunds, or design new products – all using the same API key scopes you would grant a regular Stripe integration. The right server when payments are at the centre of your indie SaaS.",
    founderFit:
      "If your indie SaaS is collecting payments via Stripe, this server lets the assistant answer real billing questions grounded in your account: who paid for what, which subscription failed, what the latest refund looked like. Use a restricted key for the level of access you actually want the agent to have.",
    toolHighlights: [
      {
        label: "Read customers, subscriptions, charges",
        description:
          "Look up account state across the standard Stripe object model.",
      },
      {
        label: "Draft new products and prices",
        description:
          "Have the agent propose product and price objects you then review before persisting.",
      },
      {
        label: "Inspect events and webhooks",
        description:
          "Walk recent events to diagnose a failed webhook delivery or trace a payment lifecycle.",
      },
    ],
    accessNote:
      "Requires a Stripe API key. Always use a restricted key – never the live unrestricted secret.",
    faqs: [
      {
        q: "What if the agent tries to issue a refund I did not authorise?",
        a: "Use a restricted key that only grants the scopes you want the assistant to have. For mutations, prefer keeping the agent in read-only mode and execute writes yourself.",
      },
      {
        q: "Is there a hosted version?",
        a: "Read the Stripe docs for the latest distribution shape – both npm-distributed and hosted patterns are common.",
      },
    ],
    tags: ["payments", "billing", "indie-stack", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "posthog",
    name: "PostHog MCP server",
    vendor: "PostHog",
    vendorUrl: "https://posthog.com/docs/llm-observability",
    distribution: "npm",
    installHandle: "@posthog/mcp-server",
    category: "Indie SaaS infrastructure",
    official: true,
    oneLine:
      "PostHog's official MCP server that lets an agent query events, run insights, and inspect feature flags in your PostHog project.",
    tldr:
      "PostHog's official MCP server exposes product analytics, insights, and feature flag state as MCP tools. The agent can ask questions like 'how many users hit the diagnostic page yesterday' or 'which flag is gating onboarding' and get a structured answer grounded in your PostHog project, not a guess.",
    founderFit:
      "If you are already using PostHog for product analytics, this server turns Claude into a competent product-analyst pair. Drop in a question about activation, retention, or a specific event and let the assistant write the insight against your real project rather than hallucinating numbers.",
    toolHighlights: [
      {
        label: "Query events and insights",
        description:
          "Run structured insight queries and inspect event volume by name and property.",
      },
      {
        label: "Inspect feature flags",
        description:
          "Read flag state, payloads, and rollouts the agent has permission to see.",
      },
      {
        label: "Trace funnels and retention",
        description:
          "Surface funnel conversion and retention cohort answers without leaving the chat.",
      },
    ],
    accessNote: "Requires a PostHog personal API key with appropriate scopes.",
    faqs: [
      {
        q: "Does the agent see PII in events?",
        a: "It sees whatever your PostHog project sees. If you mask or filter PII at ingest, the agent is bound by the same view.",
      },
    ],
    tags: ["analytics", "feature-flags", "indie-stack", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "cloudflare",
    name: "Cloudflare MCP server",
    vendor: "Cloudflare",
    vendorUrl: "https://developers.cloudflare.com/agents/",
    distribution: "remote",
    installHandle: "https://mcp.cloudflare.com",
    category: "Indie SaaS infrastructure",
    official: true,
    oneLine:
      "Cloudflare's official MCP server that gives an agent scoped access to your zones, Workers, KV, R2, and edge configuration.",
    tldr:
      "Cloudflare's official MCP server lets an agent inspect zones, Workers, and the broader edge surface attached to your Cloudflare account. The right server when your indie SaaS sits behind Cloudflare for DNS, caching, or Workers and you want the assistant to read your real configuration when answering an ops question.",
    founderFit:
      "If you are using Cloudflare for DNS, caching, or as your edge compute layer, this server lets Claude reason about your actual setup. Ask about cache rules, recently deployed Worker versions, or why a request hit origin – and get an answer grounded in your account, not in generic Cloudflare docs.",
    toolHighlights: [
      {
        label: "Inspect zones and DNS",
        description: "Read zones, DNS records, and routing rules.",
      },
      {
        label: "Read Worker deployments",
        description: "List Workers, recent versions, and bindings.",
      },
      {
        label: "Inspect KV and R2 metadata",
        description:
          "Browse KV namespaces, R2 bucket metadata, and object listings.",
      },
    ],
    accessNote: "Authenticated via Cloudflare account scopes.",
    faqs: [
      {
        q: "Does this expose Worker source code?",
        a: "Only to the extent your account permissions allow. Treat it like a teammate with your read scope.",
      },
    ],
    tags: ["edge", "dns", "workers", "remote", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "sentry",
    name: "Sentry MCP server",
    vendor: "Sentry",
    vendorUrl: "https://docs.sentry.io",
    distribution: "npm",
    installHandle: "@sentry/mcp-server",
    category: "Indie SaaS infrastructure",
    official: true,
    oneLine:
      "Sentry's official MCP server that lets an agent read issues, events, and release health from your Sentry organisation.",
    tldr:
      "Sentry's official MCP server exposes your error-tracking project to MCP-aware clients. The agent can list new issues, inspect a stack trace, read release health, and reason about regressions without you tab-switching. The right server when something broke in production and you want Claude to help you triage.",
    founderFit:
      "When a production error hits, the difference between five minutes and an hour is often whether the assistant can read the actual stack trace. This server gives Claude direct access to your Sentry issues – paste an error ID into the chat and let the agent walk the trace, recent commits, and likely cause.",
    toolHighlights: [
      {
        label: "List and inspect issues",
        description:
          "Read recent issues, stack traces, breadcrumbs, and event counts.",
      },
      {
        label: "Read release health",
        description:
          "Compare error rates between releases to spot regressions.",
      },
      {
        label: "Search by tag or fingerprint",
        description: "Slice issues by environment, release, or user tag.",
      },
    ],
    accessNote: "Requires a Sentry auth token with read scopes.",
    faqs: [
      {
        q: "Can the agent resolve or assign issues?",
        a: "Only if the auth token grants write scopes. Prefer read-only by default.",
      },
    ],
    tags: ["errors", "observability", "indie-stack", "official"],
    lastVerified: LAST_VERIFIED,
  },

  // ----- Project + collaboration -------------------------------------------
  {
    slug: "github",
    name: "GitHub MCP server",
    vendor: "GitHub",
    vendorUrl: "https://github.com/github/github-mcp-server",
    distribution: "binary",
    installHandle: "github-mcp-server",
    category: "Project and collaboration",
    official: true,
    oneLine:
      "GitHub's official MCP server that lets an agent read repositories, issues, pull requests, and Actions across your account.",
    tldr:
      "GitHub's official MCP server is the canonical way for an agent to reason about a GitHub account. The agent can search code, read PRs and reviews, list issues, and trace Actions runs – all through scoped access tied to a personal access token or installation. The right server when GitHub is the centre of your build workflow.",
    founderFit:
      "Any indie SaaS founder shipping code on GitHub benefits from giving the assistant first-class GitHub awareness. Triage open issues, summarise a long PR, find the introducing commit for a regression, or draft a release note – all grounded in your real repo state.",
    toolHighlights: [
      {
        label: "Search code and repos",
        description: "Run code search and repo search across the scopes you grant.",
      },
      {
        label: "Read issues and PRs",
        description: "List, inspect, comment-read across issues and pull requests.",
      },
      {
        label: "Inspect Actions runs",
        description: "Read recent workflow runs, job logs, and failure context.",
      },
    ],
    accessNote: "Authenticated via personal access token or GitHub App install.",
    faqs: [
      {
        q: "Can the agent merge PRs?",
        a: "Only if the token grants the corresponding write scopes. Prefer read-only scopes for casual use.",
      },
      {
        q: "Does it work with private repos?",
        a: "Yes – as long as the token has access to them.",
      },
    ],
    tags: ["code", "version-control", "collaboration", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "linear",
    name: "Linear MCP server",
    vendor: "Linear",
    vendorUrl: "https://linear.app/docs/mcp",
    distribution: "remote",
    installHandle: "https://mcp.linear.app/sse",
    category: "Project and collaboration",
    official: true,
    oneLine:
      "Linear's official MCP server that lets an agent read and act on issues, projects, and cycles in your Linear workspace.",
    tldr:
      "Linear's official MCP server gives an agent native access to your Linear workspace – issues, projects, cycles, comments. The right server when Linear is your roadmap of record and you want the assistant to triage backlog, draft issues, or summarise a cycle without you copy-pasting back and forth.",
    founderFit:
      "If you run your indie SaaS roadmap in Linear, this server lets Claude be a competent project manager. Ask it to draft an issue from a customer report, summarise what shipped last cycle, or surface the open issues blocking the next launch.",
    toolHighlights: [
      {
        label: "Read and write issues",
        description: "Create, edit, comment on issues; transition status.",
      },
      {
        label: "Browse projects and cycles",
        description: "Inspect roadmap structure and progress.",
      },
      {
        label: "Search across the workspace",
        description: "Find issues by query, label, or assignee.",
      },
    ],
    accessNote: "Authenticated via Linear OAuth.",
    faqs: [
      {
        q: "Can the agent close issues?",
        a: "Yes if the OAuth scope grants the write permissions. Linear's auth flow lets you scope the install.",
      },
    ],
    tags: ["project-management", "roadmap", "remote", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "notion",
    name: "Notion MCP server",
    vendor: "Notion",
    vendorUrl: "https://developers.notion.com",
    distribution: "npm",
    installHandle: "@notionhq/notion-mcp-server",
    category: "Project and collaboration",
    official: true,
    oneLine:
      "Notion's official MCP server that lets an agent read and write pages, databases, and blocks across your Notion workspace.",
    tldr:
      "Notion's official MCP server exposes Notion's page and database model as MCP tools. The agent can read a doc, query a database, create a new page, or update a block – all under the integration scopes you grant. The right server when your indie SaaS knowledge base lives in Notion.",
    founderFit:
      "If your roadmap, customer notes, or strategy docs live in Notion, this server lets Claude reason about them in place. Draft a blog from a Notion outline, update a customer record from a chat transcript, or pull a recurring template into a new project.",
    toolHighlights: [
      {
        label: "Read pages and databases",
        description: "Inspect page content, database rows, and block trees.",
      },
      {
        label: "Create or update content",
        description: "Add new pages, append blocks, edit existing entries.",
      },
      {
        label: "Query databases",
        description: "Filter and sort database queries by property.",
      },
    ],
    accessNote:
      "Authenticated via Notion internal integration token. Scope the integration to the pages and databases you want exposed.",
    faqs: [
      {
        q: "Can the agent see pages outside the integration scope?",
        a: "No – Notion's integration model limits visibility to pages you explicitly share with the integration.",
      },
    ],
    tags: ["docs", "knowledge-base", "indie-stack", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "slack",
    name: "Slack MCP server",
    vendor: "Anthropic (reference)",
    vendorUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    distribution: "npm",
    installHandle: "@modelcontextprotocol/server-slack",
    category: "Project and collaboration",
    official: true,
    oneLine:
      "Reference MCP server that lets an agent read channels, search history, and post messages in a Slack workspace.",
    tldr:
      "The Slack reference server gives an MCP-aware client access to a Slack workspace through a bot token. The agent can read channel history, search across workspaces, and post messages where the bot is invited. The right server when your indie SaaS team or community lives in Slack and you want the assistant to operate inside it.",
    founderFit:
      "If you run your founder community or your build-in-public team channel in Slack, this server lets Claude summarise the day, draft replies, or pull historical decisions out of the archive without you scrolling.",
    toolHighlights: [
      {
        label: "Read channels and threads",
        description: "Pull recent messages from channels the bot is in.",
      },
      {
        label: "Search history",
        description: "Search across the workspace within the bot's permissions.",
      },
      {
        label: "Post messages",
        description: "Send messages or threaded replies to channels the bot can write to.",
      },
    ],
    accessNote: "Requires a Slack bot token and OAuth scopes.",
    faqs: [
      {
        q: "Can the agent see private channels?",
        a: "Only channels the bot user has been invited to.",
      },
    ],
    tags: ["chat", "community", "reference", "official"],
    lastVerified: LAST_VERIFIED,
  },

  // ----- Design + testing --------------------------------------------------
  {
    slug: "figma",
    name: "Figma Dev Mode MCP server",
    vendor: "Figma",
    vendorUrl: "https://help.figma.com/hc/en-us/articles/32132100833559",
    distribution: "binary",
    installHandle: "figma-desktop",
    category: "Design and testing",
    official: true,
    oneLine:
      "Figma's official Dev Mode MCP server that lets an agent read selected frames, components, and styles from the running Figma desktop app.",
    tldr:
      "Figma ships an official MCP server inside the desktop app's Dev Mode. The agent can read the user's current selection, inspect components, and surface tokens – bridging the gap between a design and the code that should implement it. The right server when you are translating a Figma file into shipping UI.",
    founderFit:
      "If you are an indie SaaS founder using Figma to draft your landing page or app UI, this server lets Claude or Cursor read the design directly from the desktop app rather than asking you to copy values. Auto-grounded design-to-code, with no screenshot ping-pong.",
    toolHighlights: [
      {
        label: "Read the current selection",
        description:
          "Inspect the frame or component the user has selected in Figma.",
      },
      {
        label: "Inspect tokens and styles",
        description:
          "Surface design tokens and component definitions for code generation.",
      },
    ],
    accessNote:
      "Runs inside the Figma desktop app via a local loopback port. Enable Dev Mode and the MCP server toggle in preferences.",
    faqs: [
      {
        q: "Does this work without the Figma desktop app?",
        a: "No – the server is bundled with the desktop app and runs locally while Figma is open.",
      },
    ],
    tags: ["design", "design-to-code", "local", "official"],
    lastVerified: LAST_VERIFIED,
  },
  {
    slug: "playwright",
    name: "Playwright MCP server",
    vendor: "Microsoft",
    vendorUrl: "https://github.com/microsoft/playwright-mcp",
    distribution: "npm",
    installHandle: "@playwright/mcp",
    category: "Design and testing",
    official: true,
    oneLine:
      "Microsoft's official Playwright MCP server that drives a real browser so an agent can navigate, click, type, and read pages.",
    tldr:
      "Microsoft's Playwright MCP server gives an agent a real browser to drive. Unlike the Fetch server, Playwright executes JavaScript, follows interactions, and can verify rendered output. The right server when the assistant needs to actually use your live SaaS – log in, click through onboarding, screenshot a broken state.",
    founderFit:
      "If you want Claude to verify that a fix actually works on your live landing page, walk a buyer-journey through your funnel, or screenshot what your app looks like right now, install Playwright MCP. It is the gold standard for letting an agent see and use a rendered web app.",
    toolHighlights: [
      {
        label: "Navigate and interact",
        description:
          "Open URLs, click, type, scroll – full browser interaction surface.",
      },
      {
        label: "Read rendered DOM",
        description:
          "Inspect the rendered page including JS-hydrated content.",
      },
      {
        label: "Take screenshots",
        description:
          "Capture screenshots for the agent to reason about or hand back to you.",
      },
    ],
    accessNote: "Local, free, runs a headless or headed browser instance.",
    faqs: [
      {
        q: "Is this safe to point at authenticated pages?",
        a: "Treat the browser the agent drives as you would any tool with your session. Use a dedicated profile and scope what you log into.",
      },
    ],
    tags: ["browser", "testing", "verification", "official"],
    lastVerified: LAST_VERIFIED,
  },
];

// ---------------------------------------------------------------------------
// Exports + helpers
// ---------------------------------------------------------------------------

/** Frozen registry of every MCP tool entry. */
export const MCP_TOOLS: ReadonlyArray<McpTool> = Object.freeze(
  MCP_TOOLS_LIST,
);

/** Just the slugs – convenient for generateStaticParams and sitemap glue. */
export const MCP_TOOL_SLUGS: ReadonlyArray<string> = Object.freeze(
  MCP_TOOLS_LIST.map((t) => t.slug),
);

/** Index for O(1) detail-page lookup by slug. */
const BY_SLUG: ReadonlyMap<string, McpTool> = new Map(
  MCP_TOOLS_LIST.map((t) => [t.slug, t]),
);

/** Lookup a single tool by slug. Returns undefined for unknown slugs. */
export function getMcpToolBySlug(slug: string): McpTool | undefined {
  return BY_SLUG.get(slug);
}

/** Hub grouping by category, preserving registry order inside each group. */
export interface McpToolGroup {
  category: string;
  tools: ReadonlyArray<McpTool>;
}

export function groupMcpToolsByCategory(): ReadonlyArray<McpToolGroup> {
  const order: string[] = [];
  const map = new Map<string, McpTool[]>();
  for (const tool of MCP_TOOLS_LIST) {
    if (!map.has(tool.category)) {
      map.set(tool.category, []);
      order.push(tool.category);
    }
    map.get(tool.category)!.push(tool);
  }
  return order.map((category) => ({
    category,
    tools: Object.freeze(map.get(category)!),
  }));
}

/**
 * Latest lastVerified across the catalog. Used by the hub for Dataset
 * dateModified and the freshness stamp.
 */
export function latestMcpToolsVerifiedDate(): string {
  if (MCP_TOOLS_LIST.length === 0) return LAST_VERIFIED;
  return MCP_TOOLS_LIST.reduce(
    (latest, t) => (t.lastVerified > latest ? t.lastVerified : latest),
    MCP_TOOLS_LIST[0]!.lastVerified,
  );
}

/**
 * Up to N other tools in the same category, excluding the given slug.
 * Used by the detail page for the "Related MCP servers" rail.
 */
export function getRelatedMcpTools(slug: string, limit = 3): McpTool[] {
  const tool = BY_SLUG.get(slug);
  if (!tool) return [];
  return MCP_TOOLS_LIST.filter(
    (t) => t.slug !== slug && t.category === tool.category,
  ).slice(0, limit);
}

/**
 * Renders the Claude Desktop install snippet for a tool. Matches the
 * snippet shape used on the canonical /mcp page for our own server.
 */
export function renderClaudeDesktopSnippet(tool: McpTool): string {
  const name = tool.slug;
  if (tool.distribution === "remote") {
    return `{
  "mcpServers": {
    "${name}": {
      "command": "npx",
      "args": ["mcp-remote", "${tool.installHandle}"]
    }
  }
}`;
  }
  if (tool.distribution === "npm") {
    return `{
  "mcpServers": {
    "${name}": {
      "command": "npx",
      "args": ["-y", "${tool.installHandle}"]
    }
  }
}`;
  }
  if (tool.distribution === "binary") {
    return `{
  "mcpServers": {
    "${name}": {
      "command": "${tool.installHandle}"
    }
  }
}`;
  }
  // distribution === "repo"
  return `# Clone and build from source:
#   ${tool.installHandle}
# Then point Claude Desktop at the built binary.`;
}

/**
 * Renders the Cursor install snippet for a tool. Cursor supports remote
 * URLs natively; for npm-distributed servers it expects the same
 * command/args shape as Claude Desktop.
 */
export function renderCursorSnippet(tool: McpTool): string {
  const name = tool.slug;
  if (tool.distribution === "remote") {
    return `{
  "mcpServers": {
    "${name}": {
      "url": "${tool.installHandle}"
    }
  }
}`;
  }
  return renderClaudeDesktopSnippet(tool);
}
