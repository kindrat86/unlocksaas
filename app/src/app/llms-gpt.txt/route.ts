import { NextResponse } from "next/server";
import {
  LLMS_TXT_CACHE_CONTROL,
  LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
} from "@/lib/seo/llms-txt";
import {
  getCachedLlmsTxtForModel,
} from "@/lib/seo/llms-txt-per-model";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /llms-gpt.txt – per-model static URL variant of /llms.txt for GPT retrievers.
 *
 * Why this dedicated route exists
 * -------------------------------
 * /llms.txt honours `?model=gpt`, but some retrievers and registry crawlers
 * prefer a static, model-named URL they can link to directly. This route is
 * that surface: a fixed URL an agent operator can paste into a Custom GPT,
 * an Anthropic Claude skills directory, a Gemini extension, or a Perplexity
 * collection, with no query-string magic and no need to set a custom header.
 *
 * The body is identical to GET /llms.txt?model=gpt: the curated body
 * produced by `getCachedLlmsTxtForModel("gpt")` from the shared
 * per-model module (lib/seo/llms-txt-per-model.ts). No exclusive content
 * per model (Brunson Hard-Rule) – the curated body only re-orders surfaces.
 *
 * Discovery
 * ---------
 * Listed in /sitemap.xml under the llms.txt cluster so crawlers walking
 * the sitemap discover every model variant in one pass.
 *
 * Canonical link header
 * ---------------------
 * Points at /llms.txt (the canonical surface per llmstxt.org §1). Any
 * cache, retrieval pipeline, or assistant that encounters both URLs
 * collapses them onto the canonical one – the static URL is a routing
 * hint, the canonical body is the source of truth.
 *
 * Caching: same edge-cache discipline as the canonical route (24h
 * s-maxage, 7d stale-while-revalidate). Strategy-doc cadence, not
 * request cadence. Body is memoised at module scope inside
 * getCachedLlmsTxtForModel, so the per-request cost is a string lookup.
 */

export function GET() {
  const body = getCachedLlmsTxtForModel("gpt");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": LLMS_TXT_CACHE_CONTROL,
      "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
      link: `<${BASE_URL}/llms.txt>; rel="canonical"`,
      "x-llms-model-resolved": "gpt",
    },
  });
}

// Static – no per-request inputs, identical body on every call.
