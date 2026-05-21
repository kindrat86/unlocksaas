/**
 * LLM-citation tracker — provider clients + detection.
 *
 * Each `run<Provider>` function calls the provider's web-search /
 * grounded-completion endpoint with a single query, and returns a
 * provider-agnostic envelope the cron stores in `llmo_citations`.
 *
 * Design notes
 * ------------
 * 1. Raw fetch only. The Anthropic SDK is already in the bundle but the
 *    other three providers are not — using fetch keeps dependencies flat
 *    and the four adapters symmetric.
 *
 * 2. Provider APIs drift. We treat each provider's response as
 *    best-effort: we extract a `responseText` string and a `citedUrls`
 *    array, and fall back to regex-on-text if the structured citation
 *    field shape changes. This keeps the cron green even if one
 *    provider's payload shape moves under us.
 *
 * 3. Detection is two-pronged:
 *      brandMentioned  — case-insensitive substring match for
 *                        "unlocksaas" in the response text.
 *      urlCited        — host match on the cited-urls list OR a URL
 *                        regex over the response text.
 *    Both flags are stored independently because LLMs sometimes mention
 *    the brand without linking, and sometimes link without mentioning
 *    (e.g. inside a citation list at the end).
 *
 * 4. Each adapter returns `null` when the provider's API key env var is
 *    unset. The cron treats `null` as "not configured — skip silently"
 *    and reports a `skipped[]` array in its response. This is the same
 *    pattern as the gsc-feedback cron's 503-on-unconfigured behaviour
 *    but per-provider so the cron is partial-success tolerant.
 */

import { PRIORITY_QUERIES, type LlmoPriorityQuery } from "./priority-queries";

/** Domain we are looking to see cited. Used by the detection regex. */
const OWN_HOST = "unlocksaas.com";

/** Substring (lowercased) we count as a brand mention. */
const BRAND_TOKEN = "unlocksaas";

/** Providers tracked. Keep in sync with the migration's check constraint. */
export type Provider = "openai" | "perplexity" | "anthropic" | "google";

/** Default model per provider. Overridable via env if a future model lands. */
const DEFAULT_MODELS: Record<Provider, string> = {
  openai: process.env.LLMO_OPENAI_MODEL ?? "gpt-4o-search-preview",
  perplexity: process.env.LLMO_PERPLEXITY_MODEL ?? "sonar-pro",
  anthropic: process.env.LLMO_ANTHROPIC_MODEL ?? "claude-sonnet-4-5",
  google: process.env.LLMO_GOOGLE_MODEL ?? "gemini-2.5-pro",
};

/**
 * Provider-agnostic envelope returned by every adapter.
 *
 * `null` is reserved for "API key not configured" — the cron skips and
 * does not insert a row. To record a real failure (HTTP 500 from the
 * provider, parse error, etc.) the adapter returns an envelope with
 * `responseText: ""` and the error payload in `raw.error`.
 */
export interface ProviderResult {
  provider: Provider;
  model: string;
  responseText: string;
  citedUrls: string[];
  latencyMs: number;
  raw: unknown;
}

/**
 * Final row shape inserted into `llmo_citations`. Computed by
 * `detectCitation` from a ProviderResult + the LlmoPriorityQuery that
 * produced it.
 */
export interface CitationRow {
  query_id: string;
  query_text: string;
  provider: Provider;
  model: string;
  url_cited: boolean;
  brand_mentioned: boolean;
  rank_in_answer: number | null;
  cited_urls: string[];
  response_text: string;
  raw: unknown;
  latency_ms: number;
}

// ── Detection ──────────────────────────────────────────────────────────

/**
 * Compute the detection flags for a single ProviderResult.
 *
 * Exported separately from the adapters so it can be unit-tested in
 * isolation and reused by ad-hoc operator scripts that replay stored
 * `response_text` after a parser tweak.
 */
export function detectCitation(
  query: LlmoPriorityQuery,
  result: ProviderResult,
): CitationRow {
  const text = result.responseText ?? "";
  const lowerText = text.toLowerCase();

  // Brand mention: simple substring check. We accept either casing
  // and either with/without the dot — both "UnlockSaaS" and
  // "unlocksaas.com" trip it.
  const brand_mentioned = lowerText.includes(BRAND_TOKEN);

  // URL detection: combine two sources of truth.
  //   a) provider-supplied citation list (most reliable)
  //   b) URL regex over the response text (catches inline links the
  //      structured-citation field may have missed)
  const urlsFromList = (result.citedUrls ?? [])
    .map((u) => normalizeUrl(u))
    .filter(Boolean);
  const urlsFromText = extractUrls(text);
  const allUrls = Array.from(new Set([...urlsFromList, ...urlsFromText]));

  const ownUrls = allUrls.filter((u) => u.toLowerCase().includes(OWN_HOST));
  const url_cited = ownUrls.length > 0;

  // Rank: 1-based index of the first own-host URL in the cited list.
  // Falls back to the URL-regex order if the provider list did not
  // include us. Null when we are not cited at all.
  let rank_in_answer: number | null = null;
  if (url_cited) {
    const orderedList = urlsFromList.length > 0 ? urlsFromList : urlsFromText;
    const idx = orderedList.findIndex((u) => u.toLowerCase().includes(OWN_HOST));
    rank_in_answer = idx >= 0 ? idx + 1 : null;
  }

  return {
    query_id: query.id,
    query_text: query.query,
    provider: result.provider,
    model: result.model,
    url_cited,
    brand_mentioned,
    rank_in_answer,
    cited_urls: allUrls,
    response_text: text,
    raw: result.raw,
    latency_ms: result.latencyMs,
  };
}

/** Best-effort URL extraction. */
function extractUrls(text: string): string[] {
  // Match http(s)://... up to whitespace or common terminator punctuation.
  // Keeps trailing periods/commas off the matched string.
  const URL_RE = /https?:\/\/[^\s<>"')\]}]+[^\s<>"')\]}.,;:!?]/g;
  return text.match(URL_RE) ?? [];
}

/** Lower-case + strip trailing slash so dedup buckets equivalents together. */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname.replace(/\/+$/, "")}${u.search}`;
  } catch {
    return url.trim();
  }
}

// ── Shared call helper ─────────────────────────────────────────────────

interface CallOpts {
  url: string;
  init: RequestInit;
  /** Hard cap on the network call. Defaults to 60s. */
  timeoutMs?: number;
}

async function callJson(opts: CallOpts): Promise<{ ok: boolean; status: number; json: unknown; latencyMs: number }> {
  const timeoutMs = opts.timeoutMs ?? 60_000;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(opts.url, { ...opts.init, signal: controller.signal });
    const latencyMs = Date.now() - started;
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      // Non-JSON body. Keep as null — caller surfaces via raw.error.
    }
    return { ok: res.ok, status: res.status, json, latencyMs };
  } catch (err) {
    const latencyMs = Date.now() - started;
    return {
      ok: false,
      status: 0,
      json: { error: err instanceof Error ? err.message : String(err) },
      latencyMs,
    };
  } finally {
    clearTimeout(timer);
  }
}

// ── Provider: OpenAI (gpt-4o with web search) ──────────────────────────

/**
 * OpenAI web-search-enabled completion via the Chat Completions API.
 *
 * Returns null when OPENAI_API_KEY is unset.
 *
 * Wire shape (May 2026): the web_search_preview tool returns annotations
 * with `type: "url_citation"` and `url` fields. We pull citations from
 * those when present; otherwise we fall back to regex on the answer.
 */
export async function runOpenAi(query: string): Promise<ProviderResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const model = DEFAULT_MODELS.openai;

  const { ok, status, json, latencyMs } = await callJson({
    url: "https://api.openai.com/v1/chat/completions",
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are answering as a recommendation engine. Cite specific products and link to their websites.",
          },
          { role: "user", content: query },
        ],
      }),
    },
  });

  let responseText = "";
  const citedUrls: string[] = [];
  if (ok && json && typeof json === "object") {
    const j = json as Record<string, unknown>;
    const choices = (j.choices as Array<{ message?: { content?: string; annotations?: unknown[] } }>) ?? [];
    const first = choices[0];
    responseText = first?.message?.content ?? "";
    const ann = first?.message?.annotations ?? [];
    for (const a of ann) {
      if (a && typeof a === "object") {
        const obj = a as Record<string, unknown>;
        const url = obj.url ?? (obj.url_citation as Record<string, unknown> | undefined)?.url;
        if (typeof url === "string") citedUrls.push(url);
      }
    }
  }

  return {
    provider: "openai",
    model,
    responseText,
    citedUrls,
    latencyMs,
    raw: ok ? { status } : { status, error: json },
  };
}

// ── Provider: Perplexity (sonar-pro with native citations) ─────────────

/**
 * Perplexity's sonar models return `citations` as a top-level array.
 * Native fit for citation tracking.
 *
 * Returns null when PERPLEXITY_API_KEY is unset.
 */
export async function runPerplexity(query: string): Promise<ProviderResult | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) return null;
  const model = DEFAULT_MODELS.perplexity;

  const { ok, status, json, latencyMs } = await callJson({
    url: "https://api.perplexity.ai/chat/completions",
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "Answer briefly and recommend specific products with their canonical homepages.",
          },
          { role: "user", content: query },
        ],
      }),
    },
  });

  let responseText = "";
  const citedUrls: string[] = [];
  if (ok && json && typeof json === "object") {
    const j = json as Record<string, unknown>;
    const choices = (j.choices as Array<{ message?: { content?: string } }>) ?? [];
    responseText = choices[0]?.message?.content ?? "";
    const cit = j.citations;
    if (Array.isArray(cit)) {
      for (const c of cit) if (typeof c === "string") citedUrls.push(c);
    }
  }

  return {
    provider: "perplexity",
    model,
    responseText,
    citedUrls,
    latencyMs,
    raw: ok ? { status } : { status, error: json },
  };
}

// ── Provider: Anthropic (Claude with web_search tool) ──────────────────

/**
 * Claude with the web_search tool. We hit the REST API directly (the
 * project SDK is in the bundle but using fetch here keeps all four
 * adapters symmetric).
 *
 * Returns null when ANTHROPIC_API_KEY is unset. Note: ANTHROPIC_API_KEY
 * is already used elsewhere in the app (app/src/lib/anthropic.ts) — no
 * new env var to provision unless the operator wants a dedicated key.
 */
export async function runAnthropic(query: string): Promise<ProviderResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const model = DEFAULT_MODELS.anthropic;

  const { ok, status, json, latencyMs } = await callJson({
    url: "https://api.anthropic.com/v1/messages",
    init: {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 5 }],
        messages: [{ role: "user", content: query }],
      }),
    },
  });

  let responseText = "";
  const citedUrls: string[] = [];
  if (ok && json && typeof json === "object") {
    const j = json as Record<string, unknown>;
    const content = j.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block && typeof block === "object") {
          const b = block as Record<string, unknown>;
          if (b.type === "text" && typeof b.text === "string") {
            responseText += b.text;
            // Citations attached to text blocks (web_search_result_location).
            const citations = b.citations;
            if (Array.isArray(citations)) {
              for (const c of citations) {
                if (c && typeof c === "object") {
                  const url = (c as Record<string, unknown>).url;
                  if (typeof url === "string") citedUrls.push(url);
                }
              }
            }
          } else if (b.type === "web_search_tool_result") {
            // Tool result block contains the raw search hits the model saw.
            const tcontent = b.content;
            if (Array.isArray(tcontent)) {
              for (const hit of tcontent) {
                if (hit && typeof hit === "object") {
                  const url = (hit as Record<string, unknown>).url;
                  if (typeof url === "string") citedUrls.push(url);
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    provider: "anthropic",
    model,
    responseText,
    citedUrls,
    latencyMs,
    raw: ok ? { status } : { status, error: json },
  };
}

// ── Provider: Google (Gemini with grounding) ───────────────────────────

/**
 * Gemini with Google Search grounding. Citations land in
 * groundingMetadata.groundingChunks[].web.uri.
 *
 * Returns null when GOOGLE_AI_API_KEY is unset.
 */
export async function runGoogle(query: string): Promise<ProviderResult | null> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return null;
  const model = DEFAULT_MODELS.google;

  const { ok, status, json, latencyMs } = await callJson({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: query }] }],
        tools: [{ google_search: {} }],
      }),
    },
  });

  let responseText = "";
  const citedUrls: string[] = [];
  if (ok && json && typeof json === "object") {
    const j = json as Record<string, unknown>;
    const candidates = j.candidates as Array<Record<string, unknown>> | undefined;
    const first = candidates?.[0];
    if (first) {
      const content = first.content as { parts?: Array<{ text?: string }> } | undefined;
      const parts = content?.parts ?? [];
      responseText = parts.map((p) => p.text ?? "").join("");
      const gm = first.groundingMetadata as Record<string, unknown> | undefined;
      const chunks = gm?.groundingChunks as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(chunks)) {
        for (const ch of chunks) {
          const web = ch.web as Record<string, unknown> | undefined;
          const uri = web?.uri;
          if (typeof uri === "string") citedUrls.push(uri);
        }
      }
    }
  }

  return {
    provider: "google",
    model,
    responseText,
    citedUrls,
    latencyMs,
    raw: ok ? { status } : { status, error: json },
  };
}

// ── Orchestration ──────────────────────────────────────────────────────

/** All adapters keyed by provider so the cron can iterate uniformly. */
export const PROVIDERS: Record<Provider, (q: string) => Promise<ProviderResult | null>> = {
  openai: runOpenAi,
  perplexity: runPerplexity,
  anthropic: runAnthropic,
  google: runGoogle,
};

/** Which providers are configured (have their env var set). */
export function configuredProviders(): Provider[] {
  return (Object.keys(PROVIDERS) as Provider[]).filter((p) => {
    switch (p) {
      case "openai":
        return Boolean(process.env.OPENAI_API_KEY);
      case "perplexity":
        return Boolean(process.env.PERPLEXITY_API_KEY);
      case "anthropic":
        return Boolean(process.env.ANTHROPIC_API_KEY);
      case "google":
        return Boolean(process.env.GOOGLE_AI_API_KEY);
    }
  });
}

/**
 * Run one query across every configured provider, in parallel.
 *
 * Returns the citation rows ready for insert. Providers without API
 * keys are silently skipped (their adapters return null).
 */
export async function runQueryAllProviders(
  query: LlmoPriorityQuery,
): Promise<CitationRow[]> {
  const results = await Promise.all(
    (Object.values(PROVIDERS) as Array<(q: string) => Promise<ProviderResult | null>>).map((fn) =>
      fn(query.query).catch((err) => ({
        provider: "openai" as Provider, // overwritten below; placeholder
        model: "error",
        responseText: "",
        citedUrls: [],
        latencyMs: 0,
        raw: { error: err instanceof Error ? err.message : String(err) },
      })),
    ),
  );
  return results
    .filter((r): r is ProviderResult => r !== null && r.model !== "error")
    .map((r) => detectCitation(query, r));
}

/** Convenience re-export so the cron has one import to grab queries. */
export { PRIORITY_QUERIES };
