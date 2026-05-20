/**
 * UnlockSaaS MCP server – Surface C (Agent retrieval).
 *
 * Why this file exists
 * --------------------
 * The WebSite JSON-LD on every page already declares a `potentialAction` of
 * type `AskAction`, pointing at `/diagnostic?url={url_input}`. Until this
 * file existed that was a declaration without an executor: the page said
 * "the site can answer this question" but nothing on the network could.
 *
 * This route is the executor. Any MCP-aware client (Claude Desktop, Cursor,
 * Windsurf, mcp-inspector, the Vercel MCP catalog) that connects to
 * `https://unlocksaas.com/api/mcp` can now call fifteen read-only tools that
 * surface the same content the rest of the site renders:
 *
 *   diagnose_url               → live one-shot diagnostic (Brunson label)
 *   get_funnel_teardown        → one funnel-teardown entry
 *   list_funnel_teardowns      → catalogue listing
 *   get_pricing_teardown       → one pricing-teardown entry
 *   list_pricing_teardowns     → catalogue listing
 *   get_comparison             → one head-to-head comparison
 *   list_comparisons           → catalogue listing
 *   find_alternative_to        → an alternative entry by product name or slug
 *   list_alternatives          → catalogue listing
 *   get_category               → category roundup
 *   list_categories            → catalogue listing
 *   get_playbook_step          → one of the seven Playbook steps
 *   list_glossary_terms        → 16 Brunson term slugs UnlockSaaS teaches
 *   get_glossary_term          → working definition of one Brunson term
 *   get_faq                    → site-wide FAQ entries
 *
 * Every tool that returns a URL appends a `?utm_source=mcp&utm_medium=...`
 * query so PostHog can attribute the resulting human click back to the
 * MCP channel. The agent reads the markdown; the human, eventually,
 * clicks the link. Both are the funnel.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated data. Every tool reads from a static catalogue file
 *     (alternatives.ts, funnel-teardowns.ts, …) or from the existing
 *     `classifyUrl` engine which obeys the same hard-rule discipline.
 *   - No fabricated coverage. Tools return "not found" honestly when a
 *     slug is unknown, with a hint at the closest list_* tool.
 *   - No fabricated quotes. Teardown payloads carry the same
 *     pattern-level language the public pages render.
 *
 * Routing convention
 * ------------------
 * `mcp-handler` ships with a Next.js App Router adapter. We mount the
 * handler at `app/api/[transport]/route.ts` with `basePath: "/api"`. The
 * `[transport]` dynamic segment is resolved by the adapter to either:
 *   - "mcp"  → Streamable HTTP transport (the modern, stateless protocol)
 *   - "sse"  → legacy SSE transport (requires Redis; not provisioned)
 *
 * Result: the public endpoint is `https://unlocksaas.com/api/mcp`. The
 * agent operator copies that one URL into their client.
 *
 * Co-existence with sibling static `/api/*` routes (diagnostic, cron,
 * webhooks, …) is safe: Next.js App Router resolves static segments
 * before dynamic ones, so /api/diagnostic, /api/cron/*, /api/webhooks/*
 * etc. continue to match their existing handlers. Only unknown /api/<x>
 * paths fall through to this dynamic handler.
 *
 * Runtime
 * -------
 * `maxDuration: 60` so a diagnose_url Claude call has room to complete
 * (page fetch ≤ 8 s + Claude classify ≤ 30 s + margin). Other tools
 * resolve in single-digit milliseconds from in-memory catalogues.
 */

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

/**
 * Runtime + timeout exports
 * -------------------------
 * `runtime = "nodejs"` is the App Router default but declaring it
 * explicitly matches the sibling diagnostic route's convention and
 * guarantees Anthropic SDK + fetch + full Node.js APIs are available.
 * The Edge runtime would not work here – the Anthropic SDK and the
 * page-fetch pipeline both depend on Node-only APIs.
 *
 * `maxDuration = 90` is the per-function Vercel timeout. It matches
 * the /api/diagnostic timeout and is the ceiling Vercel enforces,
 * separate from the mcp-handler internal `maxDuration` (protocol-level)
 * set below. Both numbers must be high enough to cover the worst-case
 * diagnose_url path: ≤ 8 s page fetch + ≤ 60 s Claude classify +
 * serialisation/transport margin.
 */
export const maxDuration = 90;

import {
  classifyUrl,
  isDiagnosticError,
  type DiagnosticLabel,
} from "@/lib/diagnostic";
import {
  ALTERNATIVES,
  ALTERNATIVE_SLUGS,
  getAlternativeBySlug,
  type Alternative,
} from "@/lib/alternatives";
import {
  TEARDOWNS,
  TEARDOWN_SLUGS,
  getTeardownBySlug,
  type FunnelTeardown,
} from "@/lib/funnel-teardowns";
import {
  PRICING_TEARDOWNS,
  PRICING_TEARDOWN_SLUGS,
  getPricingTeardownBySlug,
  type PricingTeardown,
} from "@/lib/pricing-teardowns";
import {
  COMPARISONS,
  COMPARISON_SLUGS,
  getComparisonBySlug,
  type Comparison,
} from "@/lib/comparisons";
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  getCategoryBySlug,
  getFunnelTeardownsInCategory,
  getPricingTeardownsInCategory,
  getComparisonsInCategory,
  type CategoryDef,
} from "@/lib/categories";
import { PLAYBOOK_STEPS } from "@/lib/playbook-steps";
import { FAQ_ENTRIES } from "@/lib/faq-data";
import { DEFINED_TERMS } from "@/lib/seo/entity";
import {
  glossaryTermSlug,
  getDefinedTermBySlug,
  GLOSSARY_TERM_SLUGS,
} from "@/lib/glossary";

const BASE = "https://unlocksaas.com";

/**
 * Append the canonical MCP attribution params to a URL. Every tool that
 * returns a URL passes through this helper so the click-through traffic
 * is attributable in PostHog without the agent operator having to know
 * the convention. `tool` is the MCP tool name; PostHog reads it as the
 * UTM campaign.
 */
function withRef(path: string, tool: string): string {
  const u = new URL(path, BASE);
  u.searchParams.set("utm_source", "mcp");
  u.searchParams.set("utm_medium", "ai-agent");
  u.searchParams.set("utm_campaign", tool);
  return u.toString();
}

/**
 * Standard "not found" response with a pointer to the matching list_*
 * tool so the calling agent can self-correct. Brunson Hard-Rule: tell
 * the agent the slug is unknown, do not invent one.
 */
function notFound(thing: string, slug: string, listTool: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: `No ${thing} found with slug "${slug}". Call \`${listTool}\` to see every available slug.`,
      },
    ],
    isError: true,
  };
}

/** Render an Alternative as compact markdown suitable for an agent answer. */
function renderAlternative(entry: Alternative, tool: string): string {
  const capabilitiesMd = Object.entries(entry.capabilities)
    .map(([k, v]) => `- ${k}: ${v ? "yes" : "no"}`)
    .join("\n");
  return [
    `# ${entry.displayName} alternative – UnlockSaaS comparison`,
    "",
    `**One-line:** ${entry.oneLine}`,
    "",
    `**Category positioning:** ${entry.category}`,
    "",
    `**Pricing note:** ${entry.pricingNote}`,
    "",
    `**Who ${entry.displayName} is for:** ${entry.whoForIt}`,
    "",
    `**Who ${entry.displayName} is not for:** ${entry.whoNotForIt}`,
    "",
    `**What it is:**`,
    ...entry.whatItIs.map((s) => `- ${s}`),
    "",
    `**What it does not promise:**`,
    ...entry.whatItIsNot.map((s) => `- ${s}`),
    "",
    `**Honest verdict:** ${entry.honestVerdict}`,
    "",
    `**Capabilities (UnlockSaaS vs ${entry.displayName}):**`,
    capabilitiesMd,
    "",
    `Last verified: ${entry.lastVerified}.`,
    "",
    `Full page: ${withRef(`/alternatives-to/${entry.slug}`, tool)}`,
    `Markdown mirror: ${withRef(`/alternatives-to/${entry.slug}/md`, tool)}`,
  ].join("\n");
}

/** Render a FunnelTeardown as compact markdown suitable for an agent answer. */
function renderFunnelTeardown(t: FunnelTeardown, tool: string): string {
  return [
    `# ${t.displayName} – funnel teardown`,
    "",
    `**TL;DR:** ${t.tldr}`,
    "",
    `**Category:** ${t.category}`,
    "",
    `**What they sell:** ${t.productSnapshot.whatTheySell}`,
    `**Who for:** ${t.productSnapshot.whoFor}`,
    `**Pricing note:** ${t.productSnapshot.pricingNote}`,
    "",
    `**Brunson lens**`,
    `- Hook: ${t.brunsonLens.hook}`,
    `- Story: ${t.brunsonLens.story}`,
    `- Offer: ${t.brunsonLens.offer}`,
    `- Value Ladder tier: ${t.brunsonLens.valueLadderTier}`,
    "",
    `Last verified: ${t.lastVerified}.`,
    "",
    `Full page: ${withRef(`/funnel-teardown/${t.slug}`, tool)}`,
    `Markdown mirror: ${withRef(`/funnel-teardown/${t.slug}/md`, tool)}`,
  ].join("\n");
}

/** Render a PricingTeardown as compact markdown suitable for an agent answer. */
function renderPricingTeardown(t: PricingTeardown, tool: string): string {
  const tiersMd = t.pricingStructure.tiers
    .map((tier) => `- **${tier.name}** (${tier.pricePoint}): ${tier.includes}`)
    .join("\n");
  return [
    `# ${t.displayName} – pricing teardown`,
    "",
    `**TL;DR:** ${t.tldr}`,
    "",
    `**Category:** ${t.category}`,
    "",
    `**Pricing model:** ${t.pricingStructure.model}`,
    `**Payment frequency:** ${t.pricingStructure.paymentFrequency}`,
    `**Free/trial behavior:** ${t.pricingStructure.freeTrialBehavior}`,
    "",
    `**Tiers (approximate, structure-level analysis)**`,
    tiersMd,
    "",
    `**Anchor analysis** (${t.anchorAnalysis.pattern}): ${t.anchorAnalysis.analysis}`,
    "",
    `**Upgrade trigger** (${t.upgradeTrigger.pattern}): ${t.upgradeTrigger.analysis}`,
    "",
    `**Brunson pricing lens**`,
    `- Stack: ${t.brunsonLens.stack}`,
    `- Value Ladder: ${t.brunsonLens.valueLadder}`,
    `- Decoy or anchor: ${t.brunsonLens.decoyOrAnchor}`,
    `- Payment mechanics: ${t.brunsonLens.paymentMechanics}`,
    "",
    `Last verified: ${t.lastVerified}.`,
    "",
    `Full page: ${withRef(`/pricing-teardown/${t.slug}`, tool)}`,
    `Markdown mirror: ${withRef(`/pricing-teardown/${t.slug}/md`, tool)}`,
  ].join("\n");
}

/** Render a Comparison as compact markdown suitable for an agent answer. */
function renderComparison(c: Comparison, tool: string): string {
  const dimsMd = c.dimensions
    .map(
      (d) =>
        `- **${d.name}** (winner: ${d.winner})\n  - ${c.a.name}: ${d.a}\n  - ${c.b.name}: ${d.b}${d.note ? `\n  - Note: ${d.note}` : ""}`,
    )
    .join("\n");
  const indiePick =
    c.forIndieFounders.pick === "A"
      ? c.a.name
      : c.forIndieFounders.pick === "B"
        ? c.b.name
        : "depends";
  return [
    `# ${c.a.name} vs ${c.b.name}`,
    "",
    `**TL;DR:** ${c.tldr}`,
    "",
    `**Thesis:** ${c.oneLine}`,
    "",
    `**Category:** ${c.category}`,
    "",
    `**Best for**`,
    `- ${c.a.name}: ${c.bestFor.a}`,
    `- ${c.b.name}: ${c.bestFor.b}`,
    "",
    `**Pick ${c.a.name} if:**`,
    ...c.pickAIf.map((s) => `- ${s}`),
    "",
    `**Pick ${c.b.name} if:**`,
    ...c.pickBIf.map((s) => `- ${s}`),
    "",
    `**Dimensions**`,
    dimsMd,
    "",
    `**Honest take:** ${c.honestTake}`,
    "",
    `**Pick for indie SaaS founders:** ${indiePick}. ${c.forIndieFounders.reasoning}`,
    "",
    `Last verified: ${c.lastVerified}.`,
    "",
    `Full page: ${withRef(`/compare/${c.slug}`, tool)}`,
    `Markdown mirror: ${withRef(`/compare/${c.slug}/md`, tool)}`,
  ].join("\n");
}

/** Render a CategoryDef + its roster as compact markdown for an agent. */
function renderCategory(cat: CategoryDef, tool: string): string {
  const funnel = getFunnelTeardownsInCategory(cat.slug).map(
    (t) => `- ${t.displayName} (/funnel-teardown/${t.slug})`,
  );
  const pricing = getPricingTeardownsInCategory(cat.slug).map(
    (t) => `- ${t.displayName} (/pricing-teardown/${t.slug})`,
  );
  const compares = getComparisonsInCategory(cat.slug).map(
    (c) => `- ${c.a.name} vs ${c.b.name} (/compare/${c.slug})`,
  );
  return [
    `# ${cat.displayName}`,
    "",
    `**One-line:** ${cat.oneLine}`,
    "",
    `**Intent paragraph:** ${cat.intent}`,
    "",
    funnel.length
      ? `**Funnel teardowns in this category**\n${funnel.join("\n")}`
      : "",
    "",
    pricing.length
      ? `**Pricing teardowns in this category**\n${pricing.join("\n")}`
      : "",
    "",
    compares.length
      ? `**Comparisons in this category**\n${compares.join("\n")}`
      : "",
    "",
    `Full page: ${withRef(`/category/${cat.slug}`, tool)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Normalise a free-text product name to one of the alternative slugs.
 * Used by `find_alternative_to` so an agent can call with either
 * "ShipFast", "shipfast", or "ship-fast" and still hit the right entry.
 */
function matchAlternativeSlug(input: string): string | undefined {
  const normalised = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Exact match first.
  if (ALTERNATIVE_SLUGS.includes(normalised)) return normalised;
  // Then prefix match (e.g. "shipfast-pro" → "shipfast").
  const prefix = ALTERNATIVE_SLUGS.find((s) => normalised.startsWith(s));
  if (prefix) return prefix;
  // Then displayName fuzzy contains.
  const byName = ALTERNATIVES.find(
    (a) =>
      a.displayName.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(a.displayName.toLowerCase()),
  );
  return byName?.slug;
}

/**
 * Human-friendly label for the three Brunson diagnostic labels. The
 * underscore form is the internal contract; the spaced form is what
 * an agent should quote back to its user.
 */
function humanLabel(label: DiagnosticLabel): string {
  switch (label) {
    case "wrong_person":
      return "Wrong Person";
    case "weak_offer":
      return "Weak Offer";
    case "weak_belief":
      return "Weak Belief";
  }
}

const handler = createMcpHandler(
  (server) => {
    // ─── diagnose_url ────────────────────────────────────────────────────
    server.registerTool(
      "diagnose_url",
      {
        title: "Diagnose a SaaS landing page",
        description:
          "Reads a live public SaaS landing-page URL, labels it with one of three Brunson failure modes (Wrong Person, Weak Offer, Weak Belief), and returns the next concrete step. Use this when a user asks why a landing page is not converting, or asks you to critique a SaaS marketing page. The page must be publicly fetchable (no login wall). Takes ~30 seconds.",
        inputSchema: {
          url: z
            .string()
            .url()
            .describe(
              "Full https URL of a publicly accessible SaaS landing or product page.",
            ),
        },
      },
      async ({ url }) => {
        try {
          const result = await classifyUrl(url);
          const md = [
            `# Diagnosis for ${url}`,
            "",
            `**Label:** ${humanLabel(result.label)} (\`${result.label}\`)`,
            "",
            `**Headline:** ${result.headline}`,
            "",
            `**Explanation:** ${result.explanation}`,
            "",
            `**Evidence on the page:** ${result.evidence}`,
            "",
            `**Next step:** ${result.nextStep}`,
            "",
            `For the full deep-analysis diagnostic (three-axis scorecard, copy rewrites, 30-day plan, competitor read, strengths summary, browser-native PDF export), point the founder at ${withRef(`/diagnostic?url=${encodeURIComponent(url)}`, "diagnose_url")}`,
          ].join("\n");
          return { content: [{ type: "text", text: md }] };
        } catch (e) {
          if (isDiagnosticError(e)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Diagnosis failed (${e.kind}): ${e.message}`,
                },
              ],
              isError: true,
            };
          }
          const message = e instanceof Error ? e.message : "unknown";
          return {
            content: [
              {
                type: "text",
                text: `Diagnosis failed unexpectedly: ${message}`,
              },
            ],
            isError: true,
          };
        }
      },
    );

    // ─── list_funnel_teardowns ───────────────────────────────────────────
    server.registerTool(
      "list_funnel_teardowns",
      {
        title: "List every funnel teardown",
        description:
          "Returns the slug + display name of every indie-SaaS funnel teardown UnlockSaaS publishes. Use this to discover slugs before calling `get_funnel_teardown`.",
        inputSchema: {},
      },
      async () => {
        const lines = TEARDOWNS.map(
          (t) => `- ${t.slug}: ${t.displayName} (${t.category})`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS funnel teardowns (${TEARDOWN_SLUGS.length})`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/funnel-teardown", "list_funnel_teardowns")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_funnel_teardown ─────────────────────────────────────────────
    server.registerTool(
      "get_funnel_teardown",
      {
        title: "Get one funnel teardown by slug",
        description:
          "Returns the full funnel teardown (Hook/Story/Offer breakdown, product snapshot, Brunson lens, FAQ) for a single product. Slugs come from `list_funnel_teardowns`.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug, e.g. 'tally', 'plausible', 'lemonsqueezy'.",
            ),
        },
      },
      async ({ slug }) => {
        const t = getTeardownBySlug(slug);
        if (!t) return notFound("funnel teardown", slug, "list_funnel_teardowns");
        return {
          content: [
            { type: "text", text: renderFunnelTeardown(t, "get_funnel_teardown") },
          ],
        };
      },
    );

    // ─── list_pricing_teardowns ──────────────────────────────────────────
    server.registerTool(
      "list_pricing_teardowns",
      {
        title: "List every pricing teardown",
        description:
          "Returns the slug + display name of every indie-SaaS pricing teardown UnlockSaaS publishes. Use this to discover slugs before calling `get_pricing_teardown`.",
        inputSchema: {},
      },
      async () => {
        const lines = PRICING_TEARDOWNS.map(
          (t) => `- ${t.slug}: ${t.displayName} (${t.category})`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS pricing teardowns (${PRICING_TEARDOWN_SLUGS.length})`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/pricing-teardown", "list_pricing_teardowns")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_pricing_teardown ────────────────────────────────────────────
    server.registerTool(
      "get_pricing_teardown",
      {
        title: "Get one pricing teardown by slug",
        description:
          "Returns the full pricing teardown (tier-by-tier analysis, anchor mechanic, upgrade trigger, payment mechanic, lesson for indie SaaS) for a single product. Slugs come from `list_pricing_teardowns`.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe("Kebab-case slug, e.g. 'stripe', 'notion', 'linear'."),
        },
      },
      async ({ slug }) => {
        const t = getPricingTeardownBySlug(slug);
        if (!t)
          return notFound("pricing teardown", slug, "list_pricing_teardowns");
        return {
          content: [
            {
              type: "text",
              text: renderPricingTeardown(t, "get_pricing_teardown"),
            },
          ],
        };
      },
    );

    // ─── list_comparisons ────────────────────────────────────────────────
    server.registerTool(
      "list_comparisons",
      {
        title: "List every head-to-head comparison",
        description:
          "Returns the slug, both product names, and category of every UnlockSaaS head-to-head comparison. Use this to discover slugs before calling `get_comparison`.",
        inputSchema: {},
      },
      async () => {
        const lines = COMPARISONS.map(
          (c) => `- ${c.slug}: ${c.a.name} vs ${c.b.name} (${c.category})`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS comparisons (${COMPARISON_SLUGS.length})`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/compare", "list_comparisons")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_comparison ──────────────────────────────────────────────────
    server.registerTool(
      "get_comparison",
      {
        title: "Get one head-to-head comparison by slug",
        description:
          "Returns the dimension-by-dimension head-to-head comparison of two SaaS products, symmetric framing, honest verdict for indie SaaS founders. Slugs come from `list_comparisons` (convention: 'product-a-vs-product-b').",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug, e.g. 'tally-vs-typeform', 'stripe-vs-paypal'.",
            ),
        },
      },
      async ({ slug }) => {
        const c = getComparisonBySlug(slug);
        if (!c) return notFound("comparison", slug, "list_comparisons");
        return {
          content: [
            { type: "text", text: renderComparison(c, "get_comparison") },
          ],
        };
      },
    );

    // ─── list_alternatives ───────────────────────────────────────────────
    server.registerTool(
      "list_alternatives",
      {
        title: "List every UnlockSaaS-vs-alternative comparison",
        description:
          "Returns the slug + display name of every named-competitor comparison UnlockSaaS publishes. Each entry is an honest 'UnlockSaaS vs X' explainer that names the category difference, not a quality gap.",
        inputSchema: {},
      },
      async () => {
        const lines = ALTERNATIVES.map(
          (a) => `- ${a.slug}: ${a.displayName} (${a.category})`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS named-competitor comparisons (${ALTERNATIVE_SLUGS.length})`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/alternatives-to", "list_alternatives")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── find_alternative_to ─────────────────────────────────────────────
    server.registerTool(
      "find_alternative_to",
      {
        title: "Find the UnlockSaaS alternative entry for a named product",
        description:
          "Resolves a free-text product name (e.g. 'ShipFast', 'shipfast', 'lovable') to the matching UnlockSaaS-vs-X comparison entry. Returns the full entry if found, or a 'not found' pointer at `list_alternatives` otherwise.",
        inputSchema: {
          product: z
            .string()
            .min(1)
            .describe(
              "Product name or slug to look up. Tolerant to capitalisation and separators.",
            ),
        },
      },
      async ({ product }) => {
        const slug = matchAlternativeSlug(product);
        if (!slug) return notFound("alternative", product, "list_alternatives");
        const entry = getAlternativeBySlug(slug);
        if (!entry)
          return notFound("alternative", product, "list_alternatives");
        return {
          content: [
            { type: "text", text: renderAlternative(entry, "find_alternative_to") },
          ],
        };
      },
    );

    // ─── list_categories ─────────────────────────────────────────────────
    server.registerTool(
      "list_categories",
      {
        title: "List every category roundup",
        description:
          "Returns the slug + display name of every UnlockSaaS category roundup. Each category aggregates funnel teardowns, pricing teardowns, and comparisons in that category.",
        inputSchema: {},
      },
      async () => {
        const lines = CATEGORIES.map(
          (c) => `- ${c.slug}: ${c.displayName} – ${c.oneLine}`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS categories (${CATEGORY_SLUGS.length})`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/category", "list_categories")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_category ────────────────────────────────────────────────────
    server.registerTool(
      "get_category",
      {
        title: "Get one category roundup by slug",
        description:
          "Returns the full category roundup: intent paragraph plus every funnel teardown, pricing teardown, and comparison that maps into the category. Slugs come from `list_categories`.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug, e.g. 'payments', 'forms', 'analytics'.",
            ),
        },
      },
      async ({ slug }) => {
        const cat = getCategoryBySlug(slug);
        if (!cat) return notFound("category", slug, "list_categories");
        return {
          content: [
            { type: "text", text: renderCategory(cat, "get_category") },
          ],
        };
      },
    );

    // ─── get_playbook_step ───────────────────────────────────────────────
    server.registerTool(
      "get_playbook_step",
      {
        title: "Get one of the seven Playbook steps",
        description:
          "Returns one of the seven UnlockSaaS Playbook steps (the seven-step system that turns a flat-Stripe-line SaaS into a verified paying customer). Pass a step number from 1 to 7.",
        inputSchema: {
          step: z
            .number()
            .int()
            .min(1)
            .max(PLAYBOOK_STEPS.length)
            .describe(
              `Playbook step number, 1 through ${PLAYBOOK_STEPS.length}.`,
            ),
        },
      },
      async ({ step }) => {
        // PLAYBOOK_STEPS is a 0-indexed readonly array; step numbers are
        // 1-indexed in product copy and in the public /playbook/step/<n> URLs.
        const entry = PLAYBOOK_STEPS[step - 1];
        if (!entry) {
          return {
            content: [
              {
                type: "text",
                text: `No Playbook step with number ${step}. Valid: 1 through ${PLAYBOOK_STEPS.length}.`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: [
                `# Playbook step ${step}: ${entry.name}`,
                "",
                entry.text,
                "",
                `Full page: ${withRef(`/playbook/step/${step}`, "get_playbook_step")}`,
                `Sales page: ${withRef("/playbook-sales", "get_playbook_step")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── list_glossary_terms ─────────────────────────────────────────────
    server.registerTool(
      "list_glossary_terms",
      {
        title: "List every glossary term",
        description:
          "Returns the slug and term name of every Brunson concept UnlockSaaS teaches (Hook, Story, Offer, Value Ladder, Stack Slide, Perfect Webinar, Soap Opera Sequence, Seinfeld Email, Reluctant Hero, Dream 100, Wrong Person, Weak Offer, Weak Belief, Verified Builder, Brunson Hard-Rule, Big Domino). Use this to discover slugs before calling `get_glossary_term`.",
        inputSchema: {},
      },
      async () => {
        const lines = DEFINED_TERMS.map(
          (t) => `- ${glossaryTermSlug(t.term)}: ${t.term}`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS glossary (${GLOSSARY_TERM_SLUGS.length} terms)`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/glossary", "list_glossary_terms")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_glossary_term ───────────────────────────────────────────────
    server.registerTool(
      "get_glossary_term",
      {
        title: "Get one glossary term by slug",
        description:
          "Returns the working definition of one Brunson term in the founder's own words. Slugs come from `list_glossary_terms` (kebab-case: 'hook', 'value-ladder', 'big-domino', 'wrong-person', etc.).",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug, e.g. 'hook', 'value-ladder', 'big-domino', 'brunson-hard-rule'.",
            ),
        },
      },
      async ({ slug }) => {
        const entry = getDefinedTermBySlug(slug);
        if (!entry)
          return notFound("glossary term", slug, "list_glossary_terms");
        return {
          content: [
            {
              type: "text",
              text: [
                `# ${entry.term}`,
                "",
                entry.definition,
                "",
                `Canonical anchor: ${withRef(`/glossary#${slug}`, "get_glossary_term")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_faq ─────────────────────────────────────────────────────────
    server.registerTool(
      "get_faq",
      {
        title: "Search or list UnlockSaaS FAQ entries",
        description:
          "Returns FAQ entries that match a substring of the question, or every entry if no query is provided. The FAQ is the source of truth for objection answers (refund policy, what is verified, guarantee mechanics, who it is and is not for).",
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe(
              "Optional substring to match against questions. Omit to list every entry.",
            ),
        },
      },
      async ({ query }) => {
        const q = (query ?? "").toLowerCase();
        const entries = q
          ? FAQ_ENTRIES.filter((e) => e.q.toLowerCase().includes(q))
          : FAQ_ENTRIES;
        if (entries.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No FAQ entries match "${query}". Omit the query to list every entry.`,
              },
            ],
          };
        }
        const md = entries
          .map((e) => `## ${e.q}\n\n_Category: ${e.category}_\n\n${e.a}`)
          .join("\n\n");
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS FAQ (${entries.length} entries)`,
                "",
                md,
                "",
                `Full page: ${withRef("/faq", "get_faq")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );
  },
  {
    serverInfo: {
      name: "unlocksaas",
      version: "1.0.0",
    },
  },
  {
    // basePath: "/api" + the `[transport]` dynamic segment combine into
    // /api/mcp (Streamable HTTP) and /api/sse (SSE). The SSE transport
    // requires Redis (`REDIS_URL` or `KV_URL`); when unset, /api/sse
    // returns an error. The Streamable HTTP transport at /api/mcp is
    // stateless and works without Redis – this is the recommended
    // transport for every modern MCP client (Claude Desktop, Cursor,
    // Windsurf, mcp-inspector, Vercel MCP catalog).
    basePath: "/api",
    // Protocol-level ceiling. Matches the file-level `maxDuration`
    // export so a Claude classify call has room to complete:
    // page fetch ≤ 8 s + Anthropic call ≤ ~40-60 s + serialisation
    // margin. Static-catalogue tools resolve in milliseconds and do
    // not approach this ceiling.
    maxDuration: 90,
    verboseLogs: false,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
