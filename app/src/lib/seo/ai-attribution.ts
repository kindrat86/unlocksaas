/**
 * AI engine citation attribution.
 *
 * Why this exists
 * ---------------
 * The MCP server already tags every URL it returns with
 * `utm_source=mcp&utm_medium=ai-agent&utm_campaign=<tool>` so PostHog
 * can bucket agent-mediated clicks (see /api/[transport]/route.ts
 * `withRef()`). This module extends the same pattern to every other
 * AI-publisher surface so we can see, in one dashboard, which engine
 * actually drove the click:
 *
 *   - /llms.txt + per-model variants (Claude, ChatGPT, Perplexity,
 *     Gemini, Grok, You.com, Cohere, Mistral, Apple, Kagi, Mojeek,
 *     Brave, Marginalia)
 *   - /llms-full.txt, /llms-feed.json
 *   - /.well-known/ai-policy.json discovery surfaces
 *   - MCP tool returns (kept as `utm_source=mcp`; the calling host
 *     engine is added as `utm_content=<engine>` via UA detection)
 *
 * When the engine that emitted the link cites the URL in an answer,
 * the user clicks through and PostHog attributes the session to that
 * engine. Without this we only see "AI search referral" – we cannot
 * tell whether the credit goes to Claude, ChatGPT, Perplexity, etc.
 *
 * Brunson Hard-Rule discipline
 * ----------------------------
 * Adding utm parameters never changes the canonical URL. The canonical
 * <link> + canonical Link header still point to the untagged URL
 * (see proxy.ts `setCanonicalLinkHeader`). UTM params are read on
 * first touch and stripped from the cache key by the proxy. No engine
 * gets exclusive content; tagging only changes attribution.
 *
 * Inbound capture
 * ---------------
 * The proxy reads `utm_source` on first visit, normalises it via
 * `resolveEngineFromUtmSource()`, and writes a 90-day first-touch
 * cookie at `usaas_ai_engine`. The browser PostHog provider then
 * registers `ai_engine` as a super-property so every event in the
 * session carries the same value – no per-event tagging required.
 *
 * Synchronisation contract
 * ------------------------
 * - llms-txt-per-model.ts ALIAS_MAP and this module's
 *   UTM_SOURCE_ALIASES intentionally overlap on the bot-name → engine
 *   mapping. Both should stay in sync: adding a new engine alias
 *   means adding it both here and there.
 * - acquisition-source.ts handles channel attribution (Twitter,
 *   IndieHackers, etc.) – a separate cookie + a separate concern.
 *   The two co-exist on a single visit; the AI engine cookie does
 *   not overwrite or read the channel cookie.
 */
import { BASE_URL } from "@/lib/seo/entity";

/**
 * Canonical AI engine identifiers. These strings appear verbatim as
 * `utm_source` values, PostHog property values, and cookie values –
 * do NOT rename them without coordinating a PostHog dashboard
 * migration. The dashboard filters key on these exact strings.
 */
export type AiEngine =
  | "chatgpt"
  | "claude"
  | "perplexity"
  | "copilot"
  | "google-ai"
  | "mcp"
  | "ai-search"
  | "you"
  | "cohere"
  | "mistral"
  | "grok"
  | "apple"
  | "kagi"
  | "duckai"
  | "nlweb";

export const AI_ENGINES: readonly AiEngine[] = [
  "chatgpt",
  "claude",
  "perplexity",
  "copilot",
  "google-ai",
  "mcp",
  "ai-search",
  "you",
  "cohere",
  "mistral",
  "grok",
  "apple",
  "kagi",
  "duckai",
  "nlweb",
] as const;

const ENGINE_SET: ReadonlySet<string> = new Set(AI_ENGINES);

/**
 * Free-form `utm_source` value → canonical engine. Aliases mirror
 * the bot-name aliases in llms-txt-per-model.ts ALIAS_MAP plus the
 * historical convention values (e.g. `mcp` from the existing MCP
 * tagging, `nlweb` from the existing /api/nlweb/ask tagging).
 *
 * Lowercased comparison. Unknown values return null so the caller
 * can decide whether to treat the visit as "ai-search" or not-AI.
 */
const UTM_SOURCE_ALIASES: Record<string, AiEngine> = {
  // ── Canonical names ────────────────────────────────────────────
  chatgpt: "chatgpt",
  claude: "claude",
  perplexity: "perplexity",
  copilot: "copilot",
  "google-ai": "google-ai",
  mcp: "mcp",
  "ai-search": "ai-search",
  you: "you",
  cohere: "cohere",
  mistral: "mistral",
  grok: "grok",
  apple: "apple",
  kagi: "kagi",
  duckai: "duckai",
  nlweb: "nlweb",
  // ── OpenAI / ChatGPT aliases ───────────────────────────────────
  openai: "chatgpt",
  gpt: "chatgpt",
  gptbot: "chatgpt",
  "oai-searchbot": "chatgpt",
  "chatgpt-user": "chatgpt",
  "chatgpt-plugin": "chatgpt",
  // ── Anthropic / Claude aliases ─────────────────────────────────
  anthropic: "claude",
  claudebot: "claude",
  "claude-user": "claude",
  "claude-searchbot": "claude",
  "claude-web": "claude",
  // ── Perplexity aliases ─────────────────────────────────────────
  perplexitybot: "perplexity",
  "perplexity-user": "perplexity",
  // ── Microsoft Copilot / Bing aliases ───────────────────────────
  bing: "copilot",
  "bing-chat": "copilot",
  bingbot: "copilot",
  msnbot: "copilot",
  "microsoft-copilot": "copilot",
  // ── Google AI / Gemini aliases ─────────────────────────────────
  gemini: "google-ai",
  bard: "google-ai",
  "google-extended": "google-ai",
  googleother: "google-ai",
  "ai-overviews": "google-ai",
  // ── You.com aliases ────────────────────────────────────────────
  youbot: "you",
  "you.com": "you",
  // ── Cohere aliases ─────────────────────────────────────────────
  "cohere-ai": "cohere",
  // ── Mistral aliases ────────────────────────────────────────────
  "mistralai-user": "mistral",
  // ── xAI / Grok aliases ─────────────────────────────────────────
  xai: "grok",
  // ── Apple Intelligence aliases ─────────────────────────────────
  applebot: "apple",
  "applebot-extended": "apple",
  // ── Kagi aliases ───────────────────────────────────────────────
  kagibot: "kagi",
  // ── DuckDuckGo AI aliases ──────────────────────────────────────
  "duck-assist-bot": "duckai",
  duckassistbot: "duckai",
  duckduckgo: "duckai",
};

/**
 * Map a free-form `utm_source` value to a canonical AI engine, or
 * null if no rule matches. Used by the proxy first-touch cookie
 * write and the PostHog super-property setter.
 */
export function resolveEngineFromUtmSource(
  raw: string | null | undefined,
): AiEngine | null {
  if (!raw) return null;
  const normalised = raw.trim().toLowerCase();
  if (normalised.length === 0) return null;
  const aliased = UTM_SOURCE_ALIASES[normalised];
  if (aliased) return aliased;
  // Direct membership – any future AiEngine added to the union without
  // an alias entry still resolves.
  if (ENGINE_SET.has(normalised)) return normalised as AiEngine;
  return null;
}

/**
 * Type-guard for free-form strings. Used by code paths that read an
 * AI engine from a cookie value (proxy first-touch read).
 */
export function isAiEngine(raw: string | null | undefined): raw is AiEngine {
  if (!raw) return false;
  return ENGINE_SET.has(raw);
}

/**
 * User-Agent string → canonical AI engine.
 *
 * Used by:
 *   - the .md mirror handler (so /<page>.md fetched by ClaudeBot can
 *     emit a x-detected-ai-engine response header for telemetry).
 *   - the MCP server (so a tool return from a Claude Desktop-hosted
 *     agent gets `utm_content=claude` in addition to `utm_source=mcp`).
 *
 * Order-sensitive: more specific patterns first to avoid the generic
 * "google" matcher swallowing GoogleOther vs Googlebot (which is
 * vanilla Google search, not AI).
 *
 * `Googlebot` (vanilla web crawler) is intentionally NOT matched –
 * we only want to attribute AI-Overviews-bound traffic, which uses
 * the distinct `Google-Extended` / `GoogleOther` UAs.
 */
const UA_PATTERNS: ReadonlyArray<readonly [RegExp, AiEngine]> = [
  [/claudebot|claude-user|claude-searchbot|claude-web|anthropic/i, "claude"],
  [/perplexitybot|perplexity-user/i, "perplexity"],
  [/oai-searchbot|chatgpt-user|gptbot|openai/i, "chatgpt"],
  [/google-extended|googleother|google-ai|bard/i, "google-ai"],
  [/gemini/i, "google-ai"],
  [/microsoft-copilot|copilotbot|bingchat|copilot/i, "copilot"],
  [/youbot|you\.com/i, "you"],
  [/cohere-ai|cohere/i, "cohere"],
  [/mistralai-user|mistral-/i, "mistral"],
  [/grok|xai|x\.ai/i, "grok"],
  [/applebot-extended|applebot/i, "apple"],
  [/kagibot/i, "kagi"],
  [/duck-?assist-?bot/i, "duckai"],
  // Generic fallback: any UA self-identifying as an AI/LLM bot but
  // not matching a known engine maps to "ai-search". Keeps the
  // attribution pipeline closed (every AI-flagged hit gets bucketed).
  [/\b(llm|ai-bot|ai-crawler|ai-agent)\b/i, "ai-search"],
] as const;

export function detectEngineFromUserAgent(
  ua: string | null | undefined,
): AiEngine | null {
  if (!ua) return null;
  for (const [re, engine] of UA_PATTERNS) {
    if (re.test(ua)) return engine;
  }
  return null;
}

/**
 * Should a given path receive UTM tagging?
 *
 * Tagging is for end-user clickable surfaces. Infrastructure paths
 * (/api/*, /.well-known/*) and raw data formats (.txt, .json, .csv,
 * .md, .xml, .rss, .atom, .jsonld) stay clean so AI tooling can
 * fetch them without polluting cache keys or breaking content-type
 * negotiation.
 */
export function shouldTagPath(path: string): boolean {
  if (!path || path[0] !== "/") return false;
  if (path.startsWith("/api/")) return false;
  if (path.startsWith("/.well-known/")) return false;
  // Strip any existing query so we can fence on the path proper.
  const bare = path.split("?", 1)[0];
  if (/\.(txt|json|csv|rss|xml|md|atom|jsonld)$/i.test(bare)) return false;
  return true;
}

export interface AttributionOpts {
  /** PostHog `utm_campaign`. Defaults to "ai_citation". */
  campaign?: string;
  /**
   * PostHog `utm_medium`. Defaults to "ai-search". MCP returns set
   * "ai-agent" (preserves the historical MCP convention); llms-txt
   * routes set "llms-txt"; the JSON feed sets "ai-feed".
   */
  medium?: string;
  /**
   * PostHog `utm_content`. Optional free-form context (e.g. MCP
   * tool name, llms-txt model variant, or host engine when MCP can
   * detect it via User-Agent).
   */
  content?: string;
}

/**
 * Build an engine-attributed absolute URL for a given path.
 *
 * Rules:
 *   - Absolute URLs (`https://…`) are returned unchanged. Defends
 *     against accidental double-tagging when a body already has a
 *     prebuilt URL.
 *   - Relative paths that fail `shouldTagPath()` get joined with
 *     BASE_URL but no UTM appended.
 *   - Existing `utm_*` params on the input path are overwritten
 *     (last-write-wins, matches PostHog ingestion behaviour).
 */
export function buildAttributedUrl(
  path: string,
  engine: AiEngine,
  opts: AttributionOpts = {},
): string {
  if (/^https?:\/\//i.test(path)) return path;
  const u = new URL(path.startsWith("/") ? path : `/${path}`, BASE_URL);
  if (!shouldTagPath(u.pathname)) return u.toString();
  u.searchParams.set("utm_source", engine);
  u.searchParams.set("utm_medium", opts.medium ?? "ai-search");
  u.searchParams.set("utm_campaign", opts.campaign ?? "ai_citation");
  if (opts.content) u.searchParams.set("utm_content", opts.content);
  return u.toString();
}

/**
 * Convenience factory: pre-bind `engine` (and optional defaults)
 * so call sites can do `linkFor('/diagnostic')` without repeating
 * the engine name on every call.
 *
 * Used by llms-txt-per-model.ts so each per-engine body builds its
 * own link helper once and reuses it across every link in the body.
 */
export function makeLinkFor(
  engine: AiEngine,
  opts: AttributionOpts = {},
): (path: string) => string {
  return (path: string) => buildAttributedUrl(path, engine, opts);
}

/**
 * Map an `LlmsTxtModel` key (used by /llms.txt?model= and the per-
 * model body builders in llms-txt-per-model.ts) to a canonical
 * AiEngine. Engines that the user prompt explicitly named
 * (chatgpt, claude, perplexity, copilot, google-ai) get distinct
 * identifiers. Tiny-traffic indie search engines (Mojeek, Brave,
 * Marginalia) collapse to "ai-search" so the dashboard stays
 * readable; if any of them grow material traffic we can split them
 * out without breaking historical events (existing rows stay
 * "ai-search", new rows get the specific engine).
 *
 * Imported as a string-keyed map (not as the LlmsTxtModel type)
 * to keep this module free of the per-model-body dependency graph.
 * llms-txt-per-model.ts is the consumer.
 */
export const ENGINE_BY_LLMS_TXT_MODEL: Readonly<Record<string, AiEngine>> = {
  claude: "claude",
  gpt: "chatgpt",
  perplexity: "perplexity",
  gemini: "google-ai",
  grok: "grok",
  you: "you",
  kagi: "kagi",
  mojeek: "ai-search",
  brave: "ai-search",
  marginalia: "ai-search",
  cohere: "cohere",
  mistral: "mistral",
  apple: "apple",
};

/**
 * Append UTM tags to every UnlockSaaS URL that appears inside a
 * markdown-link target (i.e. `(...)`). Used by the llms-txt body
 * builders to tag every published URL with the engine the body was
 * curated for.
 *
 * Only matches URLs inside `(...)` pairs – which is the markdown
 * link target syntax. URLs in code fences, code spans, plain prose
 * references, or display text (`[...]`) stay untouched because:
 *
 *   - Display text is what the AI engine sees and might quote
 *     verbatim. Showing a clean URL to the user is the polite
 *     default; the engine still gets the tagged target.
 *   - Code-fenced URLs are documentation (e.g. `npx mcp-remote
 *     ${BASE_URL}/api/mcp` install snippet) – tagging them would
 *     corrupt the example without any analytics gain.
 *
 * `shouldTagPath()` still applies inside the replacement, so /api,
 * /.well-known, and raw-data extensions stay clean.
 *
 * External URLs (other domains) pass through untouched.
 */
export function tagBodyLinks(
  body: string,
  engine: AiEngine,
  opts: AttributionOpts = {},
): string {
  // Match `(url)` markdown link target. The URL pattern is greedy up
  // to whitespace or closing paren – matches every form actually
  // generated by the body builders.
  return body.replace(/\((https?:\/\/[^\s)]+)\)/g, (match, raw) => {
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      return match;
    }
    // Only tag our own domain. External links stay clean.
    const base = new URL(BASE_URL);
    if (url.hostname !== base.hostname) return match;
    const path = url.pathname + (url.search ? url.search : "");
    const tagged = buildAttributedUrl(path, engine, opts);
    return `(${tagged})`;
  });
}

/**
 * Cookie name for first-touch AI engine attribution. Read by the
 * PostHog provider on bootstrap so every event in the session
 * carries `ai_engine: <value>` as a super-property.
 *
 * Distinct from `usaas_source` (acquisition-source.ts) which
 * stores channel attribution (Twitter, IndieHackers, etc.). The
 * two cookies co-exist on a single visit.
 */
export const AI_ENGINE_COOKIE = "usaas_ai_engine";

/** 90 days, mirrors `SOURCE_COOKIE_MAX_AGE` for parity. */
export const AI_ENGINE_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;
