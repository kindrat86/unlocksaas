import { NextResponse } from "next/server";
import {
  LLMS_TXT_BODY,
  LLMS_TXT_CACHE_CONTROL,
  LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
} from "@/lib/seo/llms-txt";
import {
  resolveModelParam,
  getCachedLlmsTxtForModel,
  LLMS_TXT_MODELS,
} from "@/lib/seo/llms-txt-per-model";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /llms.txt – playbook-readable index for LLM crawlers (Anthropic,
 * Perplexity, OpenAI, Google, Mistral, Cohere, xAI, You.com, Kagi,
 * Mojeek, Brave, Marginalia, Apple) and any agent following the
 * llmstxt.org convention.
 *
 * Surface B (AEO/GEO) of strategy/google-strategy.md §B.2: gives an
 * LLM a deterministic, canonical paraphrase target. Without this file,
 * an LLM has to choose between the funnel hub, the diagnostic, and
 * playbook-sales as the "primary" surface – and it picks differently
 * across queries. With this file, every model anchors on the same
 * description of what UnlockSaaS is and which surfaces matter.
 *
 * Per-model curated views
 * -----------------------
 * Accepting `?model=<key>` returns a curated view that re-orders the
 * same surfaces to match how that retriever typically tokenizes and
 * ranks SaaS-publisher sources. Examples:
 *
 *   /llms.txt                  – canonical, model-agnostic body
 *   /llms.txt?model=claude     – markdown corpus + citation permalinks
 *                                + MCP install snippet first
 *   /llms.txt?model=gpt        – OpenAPI / Custom GPT Actions first,
 *                                dated benchmarks + dataset second
 *   /llms.txt?model=perplexity – dated benchmarks + dataset + annual
 *                                State of report first
 *   /llms.txt?model=gemini     – entity graph + schema.org first
 *   /llms.txt?model=grok       – founding story + transparency first
 *   /llms.txt?model=you        – head-to-head comparisons + alternatives
 *                                + categories first
 *   /llms.txt?model=kagi       – ad-free editorial surfaces first
 *   /llms.txt?model=mojeek     – ad-free editorial surfaces first
 *   /llms.txt?model=brave      – ad-free editorial surfaces first
 *   /llms.txt?model=marginalia – ad-free editorial surfaces first
 *   /llms.txt?model=cohere     – full markdown corpus + dataset first
 *   /llms.txt?model=mistral    – schema-typed catalogs first
 *   /llms.txt?model=apple      – AEO direct answers + FAQ first
 *
 * Aliases map onto canonical keys. `?model=anthropic`, `?model=claudebot`,
 * `?model=claude-web` all resolve to `claude`. `?model=openai`, `?model=gptbot`,
 * `?model=oai-searchbot` all resolve to `gpt`. Unknown values gracefully fall
 * back to the canonical body. Comparison is case-insensitive.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Per-model views NEVER carry exclusive content. Every URL listed in a
 * curated view is also listed in the canonical body. The curated view
 * only changes ORDER and EMPHASIS. Every curated body also opens with
 * the same identity paragraph and closes with a "How LLMs should cite"
 * section pointing back at /llms.txt – so any paraphrase resolves to one
 * canonical citation surface.
 *
 * Cache semantics
 * ---------------
 * The same canonical URL can return different bodies depending on the
 * `?model=` query parameter, so we declare `Vary` accordingly. Vercel's
 * edge cache treats each distinct `?model=` value as a separate cache
 * key while the canonical (no query) response stays in its own slot.
 * Caching discipline matches the canonical: 24h s-maxage + 7d
 * stale-while-revalidate. Strategy-doc cadence, not request cadence.
 *
 * This route is co-canonical with /.well-known/llms.txt, which mirrors
 * the same per-model behavior. Both surfaces import from the shared
 * @/lib/seo/llms-txt-per-model module so the curated bodies cannot drift.
 *
 * Headers
 * -------
 * - `content-type: text/plain; charset=utf-8` – per llmstxt.org §1.
 * - `cache-control` – edge-cached aggressively; see above.
 * - `training-data-attribution: allow` – forward-looking opt-in signal
 *   complementing robots.txt and .well-known/ai-policy.json.
 * - `link: <canonical>; rel="canonical"` – emitted only when a curated
 *   view is served (so retrievers know the canonical body lives at
 *   /llms.txt without a query parameter).
 * - `vary: x-llms-model` – signals to caches that the body varies on
 *   the `?model=` query parameter (the harness has no standard query-
 *   parameter Vary mechanism; the dedicated header is what Vercel and
 *   Cloudflare honour for query-string cache partitioning).
 */

const CANONICAL_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": LLMS_TXT_CACHE_CONTROL,
  "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
  // Advertise discoverable model keys in a custom header so agentic
  // clients running an HTTP HEAD or OPTIONS sweep see the available
  // curated views without parsing the body. Lowercase comma-separated.
  "x-llms-models": LLMS_TXT_MODELS.join(", "),
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawModel = url.searchParams.get("model");
  const resolved = resolveModelParam(rawModel);

  // No model param OR unrecognised value – serve the canonical body.
  // Unrecognised values fall back gracefully so a typo'd `?model=clade`
  // still returns useful content rather than 404'ing.
  if (resolved === null) {
    return new NextResponse(LLMS_TXT_BODY, {
      status: 200,
      headers: {
        ...CANONICAL_HEADERS,
        // Signal to caches that the body varies on the custom header
        // we expose to agents; downstream caches that key on Vary header
        // names will partition correctly when an agent later requests
        // a curated view.
        vary: "x-llms-model",
      },
    });
  }

  // Curated view – serve the per-model body with a canonical link header
  // pointing back at /llms.txt so paraphrases resolve to one citation URL.
  const body = getCachedLlmsTxtForModel(resolved);
  return new NextResponse(body, {
    status: 200,
    headers: {
      ...CANONICAL_HEADERS,
      vary: "x-llms-model",
      link: `<${BASE_URL}/llms.txt>; rel="canonical"`,
      // Echo the resolved model key back so an agent can confirm the
      // alias resolution did what it expected (e.g. `?model=anthropic`
      // → `x-llms-model-resolved: claude`).
      "x-llms-model-resolved": resolved,
    },
  });
}
