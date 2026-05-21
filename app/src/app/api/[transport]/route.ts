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
 * `https://unlocksaas.com/api/mcp` can now call thirty tools (26
 * read-only + 4 founder-scoped) that surface the same content the rest of
 * the site renders:
 *
 *   diagnose_url               → live one-shot diagnostic (Brunson label)
 *   deep_diagnose_url          → live full V2 teardown (scorecard + rewrites + 30-day plan)
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
 *   list_playbook_steps        → discovery listing for the seven Playbook steps
 *   get_playbook_step          → one of the seven Playbook steps
 *   list_glossary_terms        → 16 Brunson term slugs UnlockSaaS teaches
 *   get_glossary_term          → working definition of one Brunson term
 *   list_podcast_episodes      → dataset-changelog podcast episode index
 *   get_podcast_episode        → one episode (env-gated audio metadata)
 *   list_media_assets          → unified audio/video inventory
 *   get_glossary_audio         → one Brunson-term TTS audio episode
 *   get_faq                    → site-wide FAQ entries
 *   get_offer                  → canonical offer + value ladder + guarantee mechanics
 *   get_dream_100_template     → seven-category Dream 100 framework (any niche)
 *   get_value_ladder_archetype → one of four Brunson funnel-type patterns
 *   get_objection_pattern      → one of eight dollar-objection patterns with verbatim source
 *   nlweb_ask                  → natural-language search across the full schema.org corpus (Microsoft NLWeb compatible)
 *   get_diagnostic             → fetch a stored, publicly-shared diagnostic by id (v1 Brunson label + evidence)
 *   get_thirty_day_plan        → fetch the 4-week plan from a shared deep diagnostic
 *   get_rewrites               → fetch the hero/CTA/value-prop rewrites from a shared deep diagnostic
 *   update_progress            → write Playbook step status for an authenticated founder (api-key gated; first write tool)
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
  deepAnalyzeUrl,
  isDiagnosticError,
  type DeepDiagnosticResult,
  type DiagnosticLabel,
} from "@/lib/diagnostic";
import {
  GUARANTEE_WINDOW_DAYS,
  REFUND_CAP_CENTS,
  CORE_MONTHLY_PRICE_CENTS,
  REFUND_REQUIRED_MILESTONES,
  MILESTONE_DISPLAY,
} from "@/lib/guarantee";
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
import {
  PODCAST_EPISODES,
  PODCAST_EPISODE_SLUGS,
  PODCAST_SHOW_NAME,
  PODCAST_SHOW_SUBTITLE,
  PODCAST_URLS,
  getEpisodeBySlug,
  episodeUrl,
  type PodcastEpisode,
} from "@/lib/seo/podcast";
import {
  getAllGlossaryAudio,
  getGlossaryAudio,
  glossaryAudioAbsoluteUrl,
  isGlossaryAudioActive,
  glossaryAudioEpisodeCount,
  totalGlossaryAudioSeconds,
  GLOSSARY_AUDIO_PODCAST_CONFIG,
  type GlossaryAudioEntry,
} from "@/lib/seo/glossary-audio";
import {
  DREAM_100_CATEGORIES,
  DREAM_100_TARGET_TOTAL,
  VALUE_LADDER_FUNNEL_SLUGS,
  getFunnelArchetypeBySlug,
  OBJECTION_SLUGS,
  getObjectionPatternBySlug,
  type FunnelArchetype,
  type ObjectionPattern,
} from "@/lib/brunson-frameworks";
import { NLWEB_CORPUS, NLWEB_CORPUS_SIZE } from "@/lib/nlweb/corpus";
import { buildIndex, rank } from "@/lib/nlweb/bm25";
import { summarise } from "@/lib/nlweb/summary";
import { createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const BASE = "https://unlocksaas.com";

function looseAdminDb(): SupabaseClient {
  return createAdminClient() as unknown as SupabaseClient;
}

/**
 * Pre-built BM25 index for NLWeb retrieval. Built once at module load,
 * reused across every request.
 */
const NLWEB_BM25_INDEX = buildIndex(NLWEB_CORPUS);

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
    `Full page: ${withRef(`/vs/${c.slug}`, tool)}`,
    `Markdown mirror: ${withRef(`/vs/${c.slug}/md`, tool)}`,
  ].join("\n");
}

/**
 * Render a PodcastEpisode as compact markdown for an agent. Includes the
 * audio enclosure URL only when the per-episode env-gated audioUrl resolved
 * (Brunson Hard-Rule: never advertise a fabricated audio asset).
 */
function renderPodcastEpisode(ep: PodcastEpisode, tool: string): string {
  const lines: string[] = [
    `# Episode ${ep.episodeNumber}: ${ep.title}`,
    "",
    `**Show:** ${PODCAST_SHOW_NAME}`,
    "",
    `**Summary:** ${ep.summary}`,
    "",
    `**Narrative:** ${ep.narrative}`,
    "",
    `**Published:** ${ep.publishedAt}`,
    "",
    `**Keywords:** ${ep.keywords.join(", ")}`,
    "",
    `**Verifiable artifact:** ${ep.artifactUrl}`,
  ];
  if (ep.audioUrl) {
    lines.push("");
    lines.push(`**Audio enclosure:** ${ep.audioUrl}`);
    lines.push(`**MIME type:** ${ep.audioMimeType ?? "audio/mpeg"}`);
    if (ep.audioDurationSec !== undefined) {
      lines.push(`**Duration:** ${ep.audioDurationSec}s`);
    }
    if (ep.audioByteSize !== undefined) {
      lines.push(`**File size:** ${ep.audioByteSize} bytes`);
    }
  } else {
    lines.push("");
    lines.push(
      "_Audio enclosure not yet shipped for this episode (env-gated). The episode is show-notes-only; the canonical HTML page is the citable surface._",
    );
  }
  lines.push("");
  lines.push(`Episode page: ${withRef(episodeUrl(ep.slug), tool)}`);
  lines.push(`Show feed (RSS): ${withRef(PODCAST_URLS.rss, tool)}`);
  return lines.join("\n");
}

/**
 * Render a glossary-audio episode as compact markdown for an agent. Always
 * carries a real audioUrl (operator script never publishes a manifest entry
 * without an existing file on disk); duration + byte size are honest
 * measurements from the encoded MP3.
 */
function renderGlossaryAudio(entry: GlossaryAudioEntry, tool: string): string {
  const url = glossaryAudioAbsoluteUrl(entry.slug, BASE);
  return [
    `# ${entry.slug} – glossary audio`,
    "",
    `**Show:** ${GLOSSARY_AUDIO_PODCAST_CONFIG.title}`,
    "",
    `**Audio URL:** ${url}`,
    `**MIME type:** ${entry.contentType}`,
    `**Duration:** ${entry.durationSeconds}s`,
    `**File size:** ${entry.byteSize} bytes`,
    `**Word count of narrated text:** ${entry.wordCount}`,
    `**Voice:** ${entry.voiceId}`,
    `**Generated:** ${entry.generatedAt}`,
    `**Transcript sha256:** ${entry.transcriptSha256}`,
    "",
    `_Transcript: the canonical /glossary/${entry.slug} page text is the source for this audio._`,
    "",
    `Glossary detail page: ${withRef(`/glossary/${entry.slug}`, tool)}`,
    `RSS feed (iTunes-namespaced): ${withRef("/glossary/podcast.xml", tool)}`,
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
    (c) => `- ${c.a.name} vs ${c.b.name} (/vs/${c.slug})`,
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

/** Render a DeepDiagnosticResult as compact markdown for an MCP agent. The
 *  full scorecard + rewrites + 30-day plan + competitors + strengths is the
 *  same payload the /diagnostic/result page renders for a human, restructured
 *  for an LLM to ingest in one pass. */
function renderDeepDiagnosis(d: DeepDiagnosticResult, url: string): string {
  const axis = (name: string, a: { score: number; diagnosis: string; evidence: string[] }) =>
    [
      `### ${name} – ${a.score}/10`,
      a.diagnosis,
      ...(a.evidence.length ? [`Evidence: ${a.evidence.map((e) => `"${e}"`).join("; ")}`] : []),
    ].join("\n\n");
  const week = (n: 1 | 2 | 3 | 4, w: { theme: string; deliverables: string[] }) =>
    [`**Week ${n} – ${w.theme}**`, ...w.deliverables.map((d) => `- ${d}`)].join("\n");
  return [
    `# Deep diagnosis for ${url}`,
    "",
    `**Primary label:** ${humanLabel(d.label)} (\`${d.label}\`)`,
    "",
    `**Headline:** ${d.headline}`,
    "",
    `**Explanation:** ${d.explanation}`,
    "",
    `**Evidence:** ${d.evidence}`,
    "",
    `**Next step:** ${d.nextStep}`,
    "",
    `## Product snapshot`,
    `- Name: ${d.product_snapshot.name}`,
    `- One-liner: ${d.product_snapshot.one_liner}`,
    `- Stated audience: ${d.product_snapshot.audience_stated}`,
    `- Visible pricing: ${d.product_snapshot.pricing_visible ?? "(not on page)"}`,
    "",
    `## Three-axis scorecard`,
    axis("Wrong Person (Vehicle / Avatar)", d.scores.wrong_person),
    "",
    axis("Weak Offer (External Belief)", d.scores.weak_offer),
    "",
    axis("Weak Belief (Internal Belief)", d.scores.weak_belief),
    "",
    `## Rewrites`,
    `**Hero headline**`,
    `- Current: ${d.rewrites.hero_headline.current}`,
    ...d.rewrites.hero_headline.alternates.map((a, i) => `- Alternate ${i + 1}: ${a}`),
    `- Why better: ${d.rewrites.hero_headline.why_better}`,
    "",
    `**Primary CTA**`,
    `- Current: ${d.rewrites.primary_cta.current}`,
    ...d.rewrites.primary_cta.alternates.map((a, i) => `- Alternate ${i + 1}: ${a}`),
    `- Why better: ${d.rewrites.primary_cta.why_better}`,
    "",
    `**Value props**`,
    `- Current: ${d.rewrites.value_props.current.map((c) => `"${c}"`).join("; ")}`,
    `- Rewritten: ${d.rewrites.value_props.rewritten.map((c) => `"${c}"`).join("; ")}`,
    `- Why better: ${d.rewrites.value_props.why_better}`,
    "",
    `## 30-day plan`,
    week(1, d.plan_30_day.week1),
    "",
    week(2, d.plan_30_day.week2),
    "",
    week(3, d.plan_30_day.week3),
    "",
    week(4, d.plan_30_day.week4),
    "",
    `## Competitors (same category)`,
    ...d.competitors.flatMap((c) => [
      `**${c.name}** – ${c.one_line}`,
      `- They do better: ${c.what_they_do_better.join("; ")}`,
      `- You do better: ${c.what_you_do_better.join("; ")}`,
      "",
    ]),
    `## Strengths on the diagnosed page`,
    ...d.strengths.map((s) => `- ${s}`),
    "",
    `For the full browser-rendered teardown (with browser-native PDF export and the email-gated save flow), point the founder at ${withRef(`/diagnostic?url=${encodeURIComponent(url)}`, "deep_diagnose_url")}`,
  ].join("\n");
}

/**
 * Render the Dream 100 seven-category framework as compact markdown for an
 * MCP agent. Returns the structural skeleton (categories + targets + intent
 * + worked examples + work-your-way-in vs buy-your-way-in tactics) any indie
 * founder can apply to their own niche. UnlockSaaS's specific 100 entries
 * stay private in `strategy/dream-100.csv`; only the framework ships here.
 */
function renderDream100Template(tool: string): string {
  const blocks = DREAM_100_CATEGORIES.map((c) =>
    [
      `## Category ${c.number}: ${c.name} (target ${c.target})`,
      "",
      `**Intent:** ${c.intent}`,
      "",
      `**Examples (worked, generic to any niche):**`,
      ...c.examples.map((e) => `- ${e}`),
      "",
      `**Work your way in:** ${c.workYourWayIn}`,
      "",
      `**Buy your way in:** ${c.buyYourWayIn}`,
    ].join("\n"),
  );
  return [
    `# Dream 100 – seven-category framework (target ${DREAM_100_TARGET_TOTAL} entries)`,
    "",
    `Brunson's Dream 100 (Traffic Secrets §1): the canonical seven gates where the dream customer already congregates. Build the list once; mine forever.`,
    "",
    `Each category below carries a target count, an intent paragraph (what the founder earns by being there), example entries any niche can adapt, and the work-your-way-in vs buy-your-way-in tactic split.`,
    "",
    ...blocks,
    "",
    `**Brunson canon:** Traffic Secrets §1 (Russell Brunson).`,
    "",
    `**UnlockSaaS application:** Homepage at ${withRef("/", tool)} and the locked Dream 100 list (private, 100 entries; 40 individuals named in workbook 08 §2).`,
  ].join("\n");
}

/** Render one Brunson funnel archetype as compact markdown for an MCP agent. */
function renderFunnelArchetype(f: FunnelArchetype, tool: string): string {
  return [
    `# ${f.name} (Rung ${f.rung}) – ${f.priceRange}`,
    "",
    `**Purpose:** ${f.purpose}`,
    "",
    `**Pages (in order):**`,
    ...f.pages.map((p, i) => `${i + 1}. ${p}`),
    "",
    `**Hook / Story / Offer shape:**`,
    `- **Hook:** ${f.hookStoryOffer.hookShape}`,
    `- **Story:** ${f.hookStoryOffer.storyShape}`,
    `- **Offer:** ${f.hookStoryOffer.offerShape}`,
    "",
    `**Build-order rule:** ${f.buildOrderRule}`,
    "",
    `**UnlockSaaS worked example:** ${f.unlockSaasExample}`,
    "",
    `**Common failure at indie scale:** ${f.commonFailure}`,
    "",
    `**Brunson canon:** DotCom Secrets §1 + Expert Secrets §3.`,
    "",
    `**UnlockSaaS rungs (worked examples):** ${withRef("/diagnostic", tool)} (free Lead Funnel), ${withRef("/starter", tool)} ($1 Unboxing Funnel), ${withRef("/playbook-sales", tool)} ($49/mo Presentation Funnel).`,
  ].join("\n");
}

/** Render one dollar-objection pattern as compact markdown for an MCP agent. */
function renderObjectionPattern(o: ObjectionPattern, tool: string): string {
  return [
    `# ${o.name} – dollar-objection pattern`,
    "",
    `**Objection (founder language):** ${o.objection}`,
    "",
    `**Verbatim source quote:**`,
    `> "${o.verbatimQuote.quote}"`,
    `> – ${o.verbatimQuote.user}, [${o.verbatimQuote.sourceLabel}](${o.verbatimQuote.sourceUrl})`,
    "",
    `**Brunson classification:** ${o.brunsonClassification}`,
    "",
    `**Answer (in Reluctant Hero voice):**`,
    o.answer,
    "",
    `**Sales-page disqualifier line:**`,
    `> ${o.disqualifier}`,
    "",
    `**Funnel placement:** ${o.funnelPlacement}`,
    "",
    `**UnlockSaaS application:** ${withRef("/faq", tool)} (live FAQ entries) and ${withRef("/playbook-sales", tool)} (sales page with disqualifier block).`,
  ].join("\n");
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

    // ─── deep_diagnose_url ───────────────────────────────────────────────
    // The V2 deep-analysis surface – three-axis scorecard, hero/CTA/value-prop
    // rewrites, four-week plan, competitor read, strengths list. Same engine
    // and same payload the human result page renders, but inline in a single
    // MCP response so an agent can ingest it and quote it back to its user
    // without ever loading a browser. Costs roughly 2× a `diagnose_url` call
    // because the Anthropic response is structurally larger; the page-fetch
    // half is identical.
    server.registerTool(
      "deep_diagnose_url",
      {
        title: "Deep diagnose a SaaS landing page",
        description:
          "Reads a live public SaaS landing-page URL and returns the FULL UnlockSaaS V2 teardown: Brunson label, three-axis scorecard (Wrong Person / Weak Offer / Weak Belief, each 1-10 with diagnosis + evidence quotes), hero-headline + primary-CTA + value-prop rewrites (3 alternates each), four-week 30-day plan, two same-category competitor pulls, and a 2-3 item strengths list. Use this when an agent needs more than a label – when the user asks 'rewrite my headline', 'what would I do for 30 days', or 'how do I compare to competitors'. Takes ~30-45 seconds (Anthropic call is larger than diagnose_url).",
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
          const result = await deepAnalyzeUrl(url);
          return {
            content: [{ type: "text", text: renderDeepDiagnosis(result, url) }],
          };
        } catch (e) {
          if (isDiagnosticError(e)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Deep diagnosis failed (${e.kind}): ${e.message}`,
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
                text: `Deep diagnosis failed unexpectedly: ${message}`,
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
                `Hub: ${withRef("/vs", "list_comparisons")}`,
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

    // ─── list_playbook_steps ─────────────────────────────────────────────
    // Discovery sibling for `get_playbook_step`. Existed implicitly via the
    // glossary + homepage copy, but an agent traversing the tool list needs
    // a list_* tool to know the seven steps exist before calling get_*.
    server.registerTool(
      "list_playbook_steps",
      {
        title: "List the seven Playbook steps",
        description:
          "Returns the step number + short imperative name of every UnlockSaaS Playbook step (the seven-step system that turns a flat-Stripe-line SaaS into a verified paying customer). Use this to discover step numbers before calling `get_playbook_step`.",
        inputSchema: {},
      },
      async () => {
        const lines = PLAYBOOK_STEPS.map(
          (s, i) => `- Step ${i + 1}: ${s.name}`,
        );
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS Playbook – ${PLAYBOOK_STEPS.length} steps`,
                "",
                ...lines,
                "",
                `Sales page: ${withRef("/playbook-sales", "list_playbook_steps")}`,
              ].join("\n"),
            },
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

    // ─── list_podcast_episodes ───────────────────────────────────────────
    server.registerTool(
      "list_podcast_episodes",
      {
        title: "List every dataset-changelog podcast episode",
        description:
          "Returns every episode of the 'Indie SaaS Teardowns – Dataset Changelog' podcast. Each row carries the slug, sequential episode number, title, publication date, and whether an audio enclosure has shipped. Use this to discover slugs before calling `get_podcast_episode`. The podcast tracks dated milestones of the open dataset – version bumps, new tables, cross-catalog activations, methodology changes – so an agent can cite a specific change with an attributed timestamp.",
        inputSchema: {},
      },
      async () => {
        const lines = PODCAST_EPISODES.map((ep) => {
          const audioFlag = ep.audioUrl ? "audio" : "show-notes-only";
          return `- ${ep.slug} (#${ep.episodeNumber}, ${ep.publishedAt}, ${audioFlag}): ${ep.title}`;
        });
        return {
          content: [
            {
              type: "text",
              text: [
                `# ${PODCAST_SHOW_NAME} (${PODCAST_EPISODE_SLUGS.length} episodes)`,
                "",
                `_${PODCAST_SHOW_SUBTITLE}_`,
                "",
                ...lines,
                "",
                `Hub: ${withRef("/podcast", "list_podcast_episodes")}`,
                `RSS feed: ${withRef("/feed/podcast.rss", "list_podcast_episodes")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_podcast_episode ─────────────────────────────────────────────
    server.registerTool(
      "get_podcast_episode",
      {
        title: "Get one dataset-changelog podcast episode by slug",
        description:
          "Returns the full payload for one dataset-changelog episode: title, summary, long-form narrative, publication date, keywords, verifiable artifact URL, and the audio enclosure metadata when env-gated audio has shipped. Slugs come from `list_podcast_episodes`. The audioUrl, audioDurationSec, audioByteSize, and audioMimeType fields are present only when the per-episode `NEXT_PUBLIC_PODCAST_EPISODE_<SLUG>_AUDIO_URL` env var resolves to a real https URL – Brunson Hard-Rule: no fabricated audio assets.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case slug, e.g. 'dataset-v1-launch', 'hugging-face-cross-listing-flow'.",
            ),
        },
      },
      async ({ slug }) => {
        const ep = getEpisodeBySlug(slug);
        if (!ep) return notFound("podcast episode", slug, "list_podcast_episodes");
        return {
          content: [
            { type: "text", text: renderPodcastEpisode(ep, "get_podcast_episode") },
          ],
        };
      },
    );

    // ─── list_media_assets ───────────────────────────────────────────────
    server.registerTool(
      "list_media_assets",
      {
        title: "List every audio/video asset UnlockSaaS publishes",
        description:
          "Returns a unified inventory of every media asset the site exposes for agents that prefer audio-native or multimodal retrieval: dataset-changelog podcast episodes (with audio enclosure flag) and glossary-term TTS audio (one MP3 per Brunson term that the operator generation script has produced). Each row carries the kind (podcast | glossary_audio), slug, canonical URL, and whether audio is currently live. Use this as the top-level catalog of multimodal surfaces; then call `get_podcast_episode` or `get_glossary_audio` for one entry.",
        inputSchema: {
          kind: z
            .enum(["podcast", "glossary_audio", "all"])
            .optional()
            .describe(
              "Filter the inventory to one kind. Omit to return all kinds.",
            ),
        },
      },
      async ({ kind }) => {
        const want = kind ?? "all";
        const blocks: string[] = [];

        if (want === "podcast" || want === "all") {
          const audioCount = PODCAST_EPISODES.filter((e) => Boolean(e.audioUrl)).length;
          const podcastLines = PODCAST_EPISODES.map((ep) => {
            const flag = ep.audioUrl ? "audio" : "show-notes-only";
            return `- podcast/${ep.slug} (#${ep.episodeNumber}, ${flag}): ${ep.title}`;
          });
          blocks.push(
            [
              `## Dataset-changelog podcast (${PODCAST_EPISODES.length} episodes, ${audioCount} with audio)`,
              "",
              ...podcastLines,
              "",
              `Feed: ${withRef("/feed/podcast.rss", "list_media_assets")}`,
              `Hub:  ${withRef("/podcast", "list_media_assets")}`,
            ].join("\n"),
          );
        }

        if (want === "glossary_audio" || want === "all") {
          const audio = getAllGlossaryAudio();
          if (audio.length === 0) {
            blocks.push(
              [
                `## Glossary TTS audio (0 episodes)`,
                "",
                "_Operator script `scripts/generate-glossary-audio.py` has not yet been run. The Brunson Hard-Rule prohibits advertising audio that does not exist on disk; this surface is empty until the script publishes real MP3 files. Definitions remain available as text via `list_glossary_terms` and `get_glossary_term`._",
              ].join("\n"),
            );
          } else {
            const glossaryLines = audio.map(
              (a) =>
                `- glossary_audio/${a.slug} (${a.durationSeconds}s, ${a.voiceId}): ${withRef(glossaryAudioAbsoluteUrl(a.slug, BASE), "list_media_assets")}`,
            );
            const total = totalGlossaryAudioSeconds();
            blocks.push(
              [
                `## Glossary TTS audio (${audio.length} episodes, ${total}s total)`,
                "",
                ...glossaryLines,
                "",
                `Feed: ${withRef("/glossary/podcast.xml", "list_media_assets")}`,
              ].join("\n"),
            );
          }
        }

        return {
          content: [
            {
              type: "text",
              text: [
                "# UnlockSaaS media assets",
                "",
                "Audio assets currently live on the site. Video is not yet a shipping surface – every entry below is audio. The catalog will extend to video the day the operator publishes a real first-party video asset (no placeholders, per Brunson Hard-Rule).",
                "",
                ...blocks,
              ].join("\n\n"),
            },
          ],
        };
      },
    );

    // ─── get_glossary_audio ──────────────────────────────────────────────
    server.registerTool(
      "get_glossary_audio",
      {
        title: "Get the TTS audio episode for one glossary term",
        description:
          "Returns the audio metadata (URL, MIME type, duration, byte size, voice, generation timestamp, transcript sha256) for the TTS-rendered narration of one Brunson term. Slugs come from `list_glossary_terms`. Returns a 'not found' pointer when the operator has not yet generated an audio file for that slug – the manifest is the integrity gate, so a slug being unknown to this tool is honest information, not a fabricated 404.",
        inputSchema: {
          slug: z
            .string()
            .min(1)
            .describe(
              "Kebab-case glossary slug, e.g. 'hook', 'value-ladder', 'big-domino'.",
            ),
        },
      },
      async ({ slug }) => {
        if (!isGlossaryAudioActive()) {
          return {
            content: [
              {
                type: "text",
                text: `Glossary TTS audio has not yet been generated by the operator. The text definition is still available via \`get_glossary_term\` for slug "${slug}".`,
              },
            ],
            isError: true,
          };
        }
        const entry = getGlossaryAudio(slug);
        if (!entry) {
          return {
            content: [
              {
                type: "text",
                text: `No glossary audio published for slug "${slug}". Run \`list_media_assets\` with kind="glossary_audio" to see the ${glossaryAudioEpisodeCount()} episode(s) that are live.`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: renderGlossaryAudio(entry, "get_glossary_audio"),
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

    // ─── get_offer ───────────────────────────────────────────────────────
    // The one-shot answer to "what is UnlockSaaS, what does it cost, what
    // is the guarantee, and how do I start." Sources every fact from the
    // same locked Brunson workbook surfaces the human pages render from:
    //
    //   - guarantee.ts → window length, refund cap, required milestones
    //   - playbook-steps.ts → the 7 steps
    //   - the public sales pages (free /diagnostic, $1 /starter, $49 /playbook-sales)
    //
    // No fabricated price, no fabricated guarantee. The agent reads this,
    // quotes it back to its user, and the human clicks through one of
    // three utm_source=mcp-attributed links into the value ladder.
    server.registerTool(
      "get_offer",
      {
        title: "Get the canonical UnlockSaaS offer + value ladder + guarantee",
        description:
          "Returns the canonical UnlockSaaS offer in one call: who it is for, what the promise is, the three-rung value ladder (free Diagnostic → $1 Starter → $49/mo Playbook with 60-day guarantee), the guarantee mechanics (window length, refund cap, required milestones), and clickable URLs for each rung. Use this when an agent is asked 'what is UnlockSaaS', 'how much does UnlockSaaS cost', 'is there a guarantee', 'how do I sign up', or 'should I try UnlockSaaS'. Sourced entirely from the locked Brunson workbook surfaces; no fabricated terms.",
        inputSchema: {},
      },
      async () => {
        const corePriceDollars = (CORE_MONTHLY_PRICE_CENTS / 100).toFixed(0);
        const refundCapDollars = (REFUND_CAP_CENTS / 100).toFixed(0);
        const milestoneLines = REFUND_REQUIRED_MILESTONES.map(
          (k) => `  - ${MILESTONE_DISPLAY[k]}`,
        ).join("\n");
        return {
          content: [
            {
              type: "text",
              text: [
                `# UnlockSaaS – offer, value ladder, guarantee`,
                "",
                `**Who it is for:** post-launch pre-revenue indie SaaS founders. The avatar is Marco – ~36, non-engineer, shipped a product, flat Stripe line, has spent more time building than talking to a customer.`,
                "",
                `**The promise:** Marco gets his first paying customer within ${GUARANTEE_WINDOW_DAYS} days of starting the paid Playbook, or full refund of the monthly payments made inside that window.`,
                "",
                `**Value ladder (3 rungs):**`,
                `1. **Free Diagnostic** – paste your product URL + email. Engine returns Brunson label (Wrong Person / Weak Offer / Weak Belief), three-axis scorecard, copy rewrites, 30-day plan, competitor read, strengths summary, and browser-native PDF export. ${withRef("/diagnostic", "get_offer")}`,
                `2. **$1 Starter** (one-time) – Playbook Steps 1+2: Pin one real customer + Write one real offer. Includes the engine output for those two steps and the Soap Opera onboarding sequence. ${withRef("/starter", "get_offer")}`,
                `3. **$${corePriceDollars}/mo Playbook (Core)** – Steps 3-7 of the engine plus the ${GUARANTEE_WINDOW_DAYS}-day guarantee. Refund-eligible if you complete the in-product milestones below and Stripe shows no new paying customer at the ${GUARANTEE_WINDOW_DAYS}-day mark. ${withRef("/playbook-sales", "get_offer")}`,
                "",
                `**Guarantee mechanics:**`,
                `- Window: ${GUARANTEE_WINDOW_DAYS} days from Playbook subscription start.`,
                `- Refund cap: $${refundCapDollars} ( = 2 × $${corePriceDollars} monthly payments inside the window ).`,
                `- Refund triggers ONLY if BOTH conditions hold:`,
                `  a) The user completed all required in-product milestones:`,
                milestoneLines,
                `  b) Stripe Connect shows no new paying customer on the user's account during the window.`,
                `- Automated end-to-end: the Stripe webhook records milestones, the ${GUARANTEE_WINDOW_DAYS}-day cron evaluates the verdict, and a refund-eligible user is offered the refund without operator action.`,
                "",
                `**The Playbook (the engine, 7 steps):**`,
                ...PLAYBOOK_STEPS.map((s, i) => `${i + 1}. ${s.name}`),
                "",
                `**Identity:** Verified Builders – the user joins a directory of founders who closed their first cycle and let Stripe verify it.`,
                "",
                `**Marketing positioning vs other indie-SaaS tools:** UnlockSaaS is not boilerplate, not a directory, not a course. It is a guaranteed engine for the post-launch pre-revenue gap. Founder is Maryan; contact maryan@unlocksaas.com.`,
                "",
                `**More:** ${withRef("/", "get_offer")} (homepage), ${withRef("/playbook-sales", "get_offer")} (Playbook details), ${withRef("/faq", "get_offer")} (objections).`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_dream_100_template ──────────────────────────────────────────
    // Brunson Dream 100 framework, distilled to its structural skeleton:
    // seven categories with target counts (summing to 100), intent
    // paragraphs, worked example entries, and the work-your-way-in vs
    // buy-your-way-in tactic split. UnlockSaaS's specific 100 entries
    // stay private in `strategy/dream-100.csv`; this tool exposes the
    // framework only. An agent helping a different founder design their
    // distribution plan calls this once and adapts the categories.
    server.registerTool(
      "get_dream_100_template",
      {
        title: "Get the Dream 100 seven-category framework",
        description:
          "Returns the canonical Brunson Dream 100 framework as a structural template any indie founder can apply to their own niche: seven categories (Communities, Influencers, Podcasts, Newsletters, Products, YouTube, Blogs) with target counts summing to 100, intent paragraphs, 3-5 worked example entries per category, and the work-your-way-in vs buy-your-way-in tactic split. UnlockSaaS's own locked 100 entries stay private; this tool exposes the framework, not the list. Use this when an agent helps a founder build their distribution plan from scratch, or wants to evaluate whether an existing distribution plan covers all seven gates.",
        inputSchema: {},
      },
      async () => {
        return {
          content: [
            {
              type: "text",
              text: renderDream100Template("get_dream_100_template"),
            },
          ],
        };
      },
    );

    // ─── get_value_ladder_archetype ──────────────────────────────────────
    // The four canonical Brunson funnel types, one per value-ladder rung,
    // each with the pages, the Hook/Story/Offer shape, the build-order
    // rule, the UnlockSaaS-specific worked example, and the common
    // failure mode at indie scale. Pairs naturally with
    // `get_dream_100_template` — Dream 100 is the audience side, value
    // ladder is the offer side, both required to ship a complete launch.
    server.registerTool(
      "get_value_ladder_archetype",
      {
        title: "Get one Brunson value-ladder funnel archetype",
        description:
          "Returns the canonical Brunson funnel-type pattern for one rung of the value ladder: Lead Funnel (Rung 0, free), Unboxing Funnel (Rung 1, $1-$50 one-time), Presentation Funnel (Rung 2, $49-$300/mo recurring), or Phone Funnel (Rung 3, $2,000+ high-ticket). Each archetype carries the canonical pages, the Hook/Story/Offer shape, the build-order rule, the UnlockSaaS-specific worked example, and the common failure mode at indie scale. Use this when an agent designs a value ladder for a different founder.",
        inputSchema: {
          funnel_type: z
            .enum(["lead", "unboxing", "presentation", "phone"])
            .describe(
              "Which Brunson funnel type to fetch. 'lead' = free, 'unboxing' = $1-$50 one-time, 'presentation' = $49-$300/mo recurring, 'phone' = $2,000+ high-ticket.",
            ),
        },
      },
      async ({ funnel_type }) => {
        const f = getFunnelArchetypeBySlug(funnel_type);
        if (!f) {
          return {
            content: [
              {
                type: "text",
                text: `Unknown funnel type "${funnel_type}". Valid: ${VALUE_LADDER_FUNNEL_SLUGS.join(", ")}.`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: renderFunnelArchetype(f, "get_value_ladder_archetype"),
            },
          ],
        };
      },
    );

    // ─── get_objection_pattern ───────────────────────────────────────────
    // Eight dollar-objection patterns mined from public Indie Hackers and
    // Hacker News threads (2026-05-17). Each entry returns the verbatim
    // founder quote with attribution, the Brunson External Belief
    // classification, the answer copy (already shipped on /faq for
    // UnlockSaaS), the sales-page disqualifier line, and the funnel
    // placement. Distinct from `get_faq` (UnlockSaaS-specific Q+A only):
    // this tool returns the structural pattern an agent can transfer
    // across niches when helping a different founder.
    server.registerTool(
      "get_objection_pattern",
      {
        title: "Get one dollar-objection pattern with verbatim source",
        description:
          "Returns one of the eight indie-SaaS dollar-objection patterns mined from public Indie Hackers and Hacker News threads: a verbatim founder quote with attribution and source URL, the Brunson External Belief classification, the answer copy (already shipped on /faq for UnlockSaaS), the sales-page disqualifier line, and the funnel placement. Categories: subscription-fatigue, cash-constraint, burned-by-gurus, not-tools-job, build-it-myself, price-scales-badly, praise-without-payment, built-beside-not-inside. Use this when an agent helps a different founder craft their own objection-handling — the structural pattern transfers across niches even when the niche-specific dollar language varies. Distinct from `get_faq` which returns UnlockSaaS-specific FAQ answers only.",
        inputSchema: {
          category: z
            .enum([
              "subscription-fatigue",
              "cash-constraint",
              "burned-by-gurus",
              "not-tools-job",
              "build-it-myself",
              "price-scales-badly",
              "praise-without-payment",
              "built-beside-not-inside",
            ])
            .describe(
              "Which dollar-objection category to fetch. Use the kebab-case slug.",
            ),
        },
      },
      async ({ category }) => {
        const o = getObjectionPatternBySlug(category);
        if (!o) {
          return {
            content: [
              {
                type: "text",
                text: `Unknown objection category "${category}". Valid: ${OBJECTION_SLUGS.join(", ")}.`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text",
              text: renderObjectionPattern(o, "get_objection_pattern"),
            },
          ],
        };
      },
    );

    // ─── nlweb_ask ──────────────────────────────────────────────────────────
    // Natural-language search against the full schema.org corpus using BM25.
    // Microsoft NLWeb compatible endpoint (Surface E of the agent-retrieval
    // stack). Returns top-k items with a deterministic summary, suitable for
    // both agent-native retrieval and programmatic corpus exploration.
    server.registerTool(
      "nlweb_ask",
      {
        title: "Ask a natural-language question against the UnlockSaaS corpus",
        description:
          "Search the UnlockSaaS schema.org corpus (700+ items across Articles, HowTos, Products, DefinedTerms, FAQPages, QAPages) using natural-language keywords. Returns the top-k matching items with a deterministic one-paragraph summary. Uses BM25 ranking for deterministic, sub-millisecond retrieval. Items span all surfaces: funnel teardowns, pricing teardowns, comparisons, alternatives, categories, Playbook steps, glossary terms, FAQ entries, direct answers, and benchmarks. Useful for helping agents discover relevant content without hardcoding paths or iterating through list_* tools.",
        inputSchema: {
          query: z
            .string()
            .trim()
            .min(1, "query is required")
            .max(500, "query too long")
            .describe(
              "Natural-language search query (1-500 characters). Examples: 'how to find first customers', 'SaaS pricing strategies', 'Typeform vs Tally'.",
            ),
          top_k: z
            .number()
            .int()
            .min(1)
            .max(20)
            .default(5)
            .optional()
            .describe(
              "How many top-ranked items to return (1-20, default 5). Higher values give more context but longer responses.",
            ),
        },
      },
      async ({ query, top_k }) => {
        const rankedItems = rank(
          NLWEB_BM25_INDEX,
          NLWEB_CORPUS,
          query,
          top_k ?? 5,
        );
        if (rankedItems.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No results in the UnlockSaaS corpus match the query "${query}". Try a different keyword, or explore the catalog hubs at /alternatives-to, /funnel-teardown, /pricing-teardown, /vs, /category, /benchmarks, /answers, /glossary, or /faq.`,
              },
            ],
          };
        }

        const items = rankedItems.map((r) => r.item);
        const itemListElement = items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": item["@type"],
            "@id": item["@id"],
            name: item.name,
            description: item.description,
            url: withRef(item.url, "nlweb_ask"),
            dateModified: item.dateModified,
            keywords: item.keywords,
          },
        }));

        const summary = summarise(query, items);

        const nlwebResponse = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `NLWeb results for: ${query}`,
          numberOfItems: itemListElement.length,
          itemListElement,
          summary,
          "unlocksaas:retriever": "bm25-v1",
          "unlocksaas:corpusSize": NLWEB_CORPUS_SIZE,
        };

        return {
          content: [
            {
              type: "text",
              text: [
                `# NLWeb search: "${query}"`,
                "",
                summary,
                "",
                "**Results:**",
                ...items.map((item, i) => {
                  const surface = item.surface || "unknown";
                  return `${i + 1}. **${item.name}** (${surface})\n   ${withRef(item.url, "nlweb_ask")}`;
                }),
                "",
                `**Full JSON-LD response available at:**`,
                `\`\`\`json`,
                JSON.stringify(nlwebResponse, null, 2),
                `\`\`\``,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_diagnostic ──────────────────────────────────────────────────
    // Fetch the v1 Brunson diagnostic (label + headline + explanation +
    // evidence + next_step) for a publicly-shared diagnostic_leads row.
    // No PII (email, IP, user_agent) is ever returned.
    server.registerTool(
      "get_diagnostic",
      {
        title: "Fetch a stored, publicly-shared diagnostic by id",
        description:
          "Returns the v1 Brunson diagnostic (Wrong Person / Weak Offer / Weak Belief label, headline, explanation, evidence quotes, and next step) for a lead_id where share_visibility='public'. PII fields (email, ip, user_agent, timezone) are never returned. Same privacy gate as the public /diagnosis/<id> page.",
        inputSchema: {
          lead_id: z
            .string()
            .uuid()
            .describe(
              "UUID of the diagnostic lead row. Same id used by the public /diagnosis/<id> page.",
            ),
        },
      },
      async ({ lead_id }) => {
        const supabase = looseAdminDb();
        const { data, error } = await supabase
          .from("diagnostic_leads")
          .select(
            "id, product_url, label, headline, explanation, evidence, next_step, share_visibility",
          )
          .eq("id", lead_id)
          .eq("share_visibility", "public")
          .maybeSingle();
        if (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to load diagnostic ${lead_id}: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        if (!data) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No publicly-shared diagnostic found with id "${lead_id}". The row may not exist, or its owner has not opted into public visibility. View the full catalog: ${withRef("/diagnostic", "get_diagnostic")}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: [
                `# Diagnostic result for ${data.product_url}`,
                "",
                `**Label:** ${data.label}`,
                "",
                `**Headline:** ${data.headline}`,
                "",
                `**Explanation:** ${data.explanation}`,
                "",
                `**Evidence:**`,
                ...((data.evidence as string[]) || []).map((e) => `- ${e}`),
                "",
                `**Next step:** ${data.next_step}`,
                "",
                `This is the v1 engine result (Brunson label only). For the full V2 teardown (3-axis scorecard, hero/CTA/value-prop rewrites, 4-week plan, competitor analysis, strengths), call \`get_thirty_day_plan\` or \`get_rewrites\`, or visit: ${withRef(`/diagnosis/${data.id}`, "get_diagnostic")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_thirty_day_plan ─────────────────────────────────────────────
    // Fetch the four-week plan from diagnostic_leads.analysis_detail.plan_30_day
    // for a publicly-shared deep diagnostic. Gracefully fall back if the row
    // ran the V1 engine only (analysis_detail is null).
    server.registerTool(
      "get_thirty_day_plan",
      {
        title: "Get the 4-week plan from a shared diagnostic",
        description:
          "Returns the week-by-week 30-day action plan from a publicly-shared V2 deep diagnostic: week 1-4 theme + deliverables. Gracefully falls back if the diagnostic ran V1 only (no plan generated). Only returns plans from rows the founder publicly shared.",
        inputSchema: {
          lead_id: z
            .string()
            .uuid()
            .describe(
              "UUID of the diagnostic lead row. Same id used by /diagnosis/<id>.",
            ),
        },
      },
      async ({ lead_id }) => {
        const supabase = looseAdminDb();
        const { data, error } = await supabase
          .from("diagnostic_leads")
          .select("id, product_url, analysis_detail, share_visibility")
          .eq("id", lead_id)
          .eq("share_visibility", "public")
          .maybeSingle();
        if (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to load diagnostic ${lead_id}: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        if (!data) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No publicly-shared diagnostic found with id "${lead_id}". The row may not exist, or its owner has not opted into public visibility.`,
              },
            ],
            isError: true,
          };
        }
        const detail = data.analysis_detail as
          | { plan_30_day?: DeepDiagnosticResult["plan_30_day"] }
          | null;
        const plan = detail?.plan_30_day;
        if (!plan || !plan.weeks || plan.weeks.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Diagnostic ${lead_id} ran the V1 engine only; no 4-week plan was generated. Re-run the diagnostic to get the V2 deep teardown: ${withRef("/diagnostic", "get_thirty_day_plan")}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: [
                `# 30-day plan for ${data.product_url}`,
                "",
                ...plan.weeks.map((w, i) => {
                  return [
                    `**Week ${i + 1}: ${w.theme}**`,
                    ...((w.deliverables as string[]) || []).map((d) => `- ${d}`),
                    "",
                  ].join("\n");
                }),
                `Full teardown: ${withRef(`/diagnosis/${data.id}`, "get_thirty_day_plan")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── get_rewrites ────────────────────────────────────────────────────
    // Fetch the hero / primary-CTA / value-prop rewrites stored in
    // diagnostic_leads.analysis_detail.rewrites for a publicly-shared deep
    // diagnostic. Each rewrite carries the current text plus three alternates
    // and a why-better explanation.
    server.registerTool(
      "get_rewrites",
      {
        title: "Get the hero/CTA/value-prop rewrites from a shared diagnostic",
        description:
          "Returns the copy rewrites from a publicly-shared deep diagnostic: hero headline (current + 3 alternates), primary CTA (current + 3 alternates), value props (current + rewritten). Each block carries the rationale for why the alternates score higher on the Brunson scorecard. Only returns rewrites from rows the founder publicly shared.",
        inputSchema: {
          lead_id: z
            .string()
            .uuid()
            .describe(
              "UUID of the diagnostic lead row. Same id used by /diagnosis/<id>.",
            ),
        },
      },
      async ({ lead_id }) => {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from("diagnostic_leads")
          .select("id, product_url, analysis_detail, share_visibility")
          .eq("id", lead_id)
          .eq("share_visibility", "public")
          .maybeSingle();
        if (error) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to load diagnostic ${lead_id}: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        if (!data) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No publicly-shared diagnostic found with id "${lead_id}". The row may not exist, or its owner has not opted into public visibility.`,
              },
            ],
            isError: true,
          };
        }
        const detail = data.analysis_detail as
          | { rewrites?: DeepDiagnosticResult["rewrites"] }
          | null;
        const rw = detail?.rewrites;
        if (
          !rw ||
          !rw.hero_headline ||
          !rw.primary_cta ||
          !rw.value_props
        ) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Diagnostic ${lead_id} ran the V1 engine only; no rewrites were generated. Re-run the diagnostic to get the V2 deep teardown: ${withRef("/diagnostic", "get_rewrites")}`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: [
                `# Copy rewrites for ${data.product_url}`,
                "",
                `**Hero headline**`,
                `- Current: ${rw.hero_headline.current}`,
                ...rw.hero_headline.alternates.map(
                  (a, i) => `- Alternate ${i + 1}: ${a}`,
                ),
                `- Why better: ${rw.hero_headline.why_better}`,
                "",
                `**Primary CTA**`,
                `- Current: ${rw.primary_cta.current}`,
                ...rw.primary_cta.alternates.map(
                  (a, i) => `- Alternate ${i + 1}: ${a}`,
                ),
                `- Why better: ${rw.primary_cta.why_better}`,
                "",
                `**Value props**`,
                `- Current: ${rw.value_props.current.map((c) => `"${c}"`).join("; ")}`,
                `- Rewritten: ${rw.value_props.rewritten.map((c) => `"${c}"`).join("; ")}`,
                `- Why better: ${rw.value_props.why_better}`,
                "",
                `Full teardown: ${withRef(`/diagnosis/${data.id}`, "get_rewrites")}`,
              ].join("\n"),
            },
          ],
        };
      },
    );

    // ─── update_progress ─────────────────────────────────────────────────
    // First MCP **write** tool. Authenticated via per-founder API key
    // (profiles.mcp_api_key, minted by public.mint_mcp_api_key()). The
    // key is presented as a tool argument because the MCP transport in
    // most current clients (Claude Desktop, Cursor, Windsurf) doesn't
    // surface request headers to tools; it does surface arguments.
    //
    // Auth flow: look up profile by exact key match (unique partial index
    // on profiles.mcp_api_key). On miss, return a generic "invalid api_key"
    // — never reveal whether a key existed but didn't match a step, etc.
    //
    // The response always includes the FULL 7-step state map so the
    // calling agent can render a useful summary to the founder without
    // a second read call.
    server.registerTool(
      "update_progress",
      {
        title: "Update Playbook step status for an authenticated founder",
        description:
          "Records the founder's status on one of the seven UnlockSaaS Playbook steps. Requires a founder-scoped API key (settings → MCP key in the dashboard; format usk_<22 chars>). Returns the updated full 7-step state and a suggested next step. Use this when a founder asks an agent to 'mark step N as done', 'I started step N', or 'reset step N'. Status is one of 'not_started' | 'in_progress' | 'completed'.",
        inputSchema: {
          api_key: z
            .string()
            .regex(/^usk_[A-Za-z0-9_-]{20,48}$/, {
              message: "API key must start with 'usk_' followed by 20-48 url-safe chars.",
            })
            .describe(
              "Per-founder MCP API key. Format: usk_<22 base64url chars>. Mint or rotate from the dashboard.",
            ),
          step: z
            .number()
            .int()
            .min(1)
            .max(PLAYBOOK_STEPS.length)
            .describe(
              `Playbook step number, 1 through ${PLAYBOOK_STEPS.length}. Use list_playbook_steps to discover the names.`,
            ),
          status: z
            .enum(["not_started", "in_progress", "completed"])
            .describe(
              "Step status. 'not_started' clears a prior status; 'in_progress' marks active work; 'completed' marks the step finished.",
            ),
          notes: z
            .string()
            .max(2000)
            .optional()
            .describe(
              "Optional free-text note attached to the status change (up to 2000 chars). E.g. 'Picked Acme Inc. as the pinned customer.'",
            ),
        },
      },
      async ({ api_key, step, status, notes }) => {
        const supabase = looseAdminDb();

        // Resolve api_key → profile_id.
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, email")
          .eq("mcp_api_key", api_key)
          .maybeSingle();
        if (profileError) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to look up api_key: ${profileError.message}`,
              },
            ],
            isError: true,
          };
        }
        if (!profile) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Invalid api_key. Mint or rotate one from the dashboard, then retry.`,
              },
            ],
            isError: true,
          };
        }

        // Upsert progress row (composite primary key on (profile_id, step)).
        const { error: upsertError } = await supabase
          .from("playbook_progress")
          .upsert(
            {
              profile_id: profile.id,
              step,
              status,
              notes: notes ?? null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "profile_id,step" },
          );
        if (upsertError) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Failed to record progress: ${upsertError.message}`,
              },
            ],
            isError: true,
          };
        }

        // Read back the full 7-step state so the agent can render a
        // useful summary without a second read call.
        const { data: rows, error: readError } = await supabase
          .from("playbook_progress")
          .select("step, status, updated_at, notes")
          .eq("profile_id", profile.id);
        if (readError) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Recorded the update, but failed to read back the full state: ${readError.message}`,
              },
            ],
            isError: true,
          };
        }

        // Build a summary object showing all 7 steps + status.
        const stateMap = new Map(
          (rows || []).map((r) => [r.step, r.status as string]),
        );
        const stateItems = PLAYBOOK_STEPS.map((ps, idx) => {
          const stepNum = idx + 1;
          const currentStatus = stateMap.get(stepNum) || "not_started";
          const icon =
            currentStatus === "completed"
              ? "✓"
              : currentStatus === "in_progress"
                ? "→"
                : "○";
          return `${icon} **Step ${stepNum}: ${ps.name}** (${currentStatus})`;
        });

        // Suggest the next incomplete step.
        let suggestedNext = null;
        for (const row of rows || []) {
          if (row.status === "in_progress") {
            suggestedNext = `Continue with Step ${row.step}: ${PLAYBOOK_STEPS[row.step - 1]?.name}.`;
            break;
          }
        }
        if (!suggestedNext) {
          const firstIncomplete = PLAYBOOK_STEPS.findIndex(
            (_, idx) => !(stateMap.get(idx + 1) === "completed"),
          );
          if (firstIncomplete >= 0 && firstIncomplete < PLAYBOOK_STEPS.length) {
            const nextNum = firstIncomplete + 1;
            suggestedNext = `Next: Step ${nextNum}: ${PLAYBOOK_STEPS[nextNum - 1].name}.`;
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `# Playbook progress updated for ${profile.email}`,
                "",
                `**7-step state:**`,
                ...stateItems,
                "",
                suggestedNext || "All steps completed!",
                "",
                `Dashboard: ${withRef("/playbook", "update_progress")}`,
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
      version: "1.4.0",
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
