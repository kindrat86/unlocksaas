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
import { tagBodyLinks } from "@/lib/seo/ai-attribution";

/**
 * Canonical alias body with `ai-search` UTM tagging applied once at
 * module load. Matches the tagging applied by the canonical
 * /llms.txt route (see that file for the rationale).
 */
const TAGGED_LLMS_TXT_BODY = tagBodyLinks(LLMS_TXT_BODY, "ai-search", {
  medium: "llms-txt",
  campaign: "llms_corpus",
  content: "well-known-alias",
});

/**
 * /.well-known/llms.txt – alias for /llms.txt.
 *
 * Why this surface exists
 * -----------------------
 * The llmstxt.org §1 spec puts the canonical file at `/llms.txt` at the
 * site root. But the broader `/.well-known/*` discovery convention –
 * established by RFC 8615 and already shipped on this site for
 * security.txt (RFC 9116) and mcp.json (Vercel/Anthropic MCP catalog
 * discovery) – is the first place many crawlers, registries, and
 * agentic clients look for machine-discoverable metadata.
 *
 * Two reasons to mirror llms.txt under `.well-known/`:
 *   1. Coverage. Crawlers that follow the .well-known convention (and
 *      do NOT also check the llmstxt.org root path) find the file on
 *      their first request, not their second.
 *   2. Convention symmetry. We already publish .well-known/mcp.json
 *      and .well-known/security.txt. Adding .well-known/llms.txt
 *      means an agent's "what does this site expose for me" sweep
 *      finds every public machine-readable surface in one well-known
 *      directory.
 *
 * Per-model curated views
 * -----------------------
 * Accepting `?model=<key>` returns a curated view that re-orders the
 * same surfaces to match how that retriever ranks SaaS-publisher
 * sources. Mirrors the canonical /llms.txt route exactly; see that
 * route handler's header comment for the full model catalog and alias
 * map. Available keys: ${LLMS_TXT_MODELS.join(", ")}.
 *
 * Canonical resolution
 * --------------------
 * The body is byte-identical to /llms.txt (for the same model key) –
 * both routes import from @/lib/seo/llms-txt and
 * @/lib/seo/llms-txt-per-model (single sources of truth). The only
 * difference is that this response carries a `Link: rel="canonical"`
 * header pointing at /llms.txt (or /llms.txt?model=<key> for curated
 * views), so any cache, retrieval pipeline, or assistant that
 * encounters both URLs collapses them onto the canonical one.
 *
 * Brunson Hard-Rule reconciliation: every claim in the body is also
 * present, verifiable, in the public HTML. Adding a discovery path
 * does not change the content – it only changes where the same content
 * can be found. Per-model views NEVER carry exclusive content.
 *
 * Caching: same edge-cache discipline as the canonical route (24h
 * s-maxage, 7d stale-while-revalidate). Strategy-doc cadence, not
 * request cadence. The `Vary: x-llms-model` header partitions the
 * cache when a curated view is served so canonical and curated bodies
 * never collide.
 */

const ALIAS_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": LLMS_TXT_CACHE_CONTROL,
  "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
  "x-llms-models": LLMS_TXT_MODELS.join(", "),
} as const;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawModel = url.searchParams.get("model");
  const resolved = resolveModelParam(rawModel);

  // Canonical body – no model param or unrecognised value. Always points
  // back at the llmstxt.org §1 URL via Link header so this alias never
  // becomes a separately-weighted citation surface.
  if (resolved === null) {
    return new NextResponse(TAGGED_LLMS_TXT_BODY, {
      status: 200,
      headers: {
        ...ALIAS_HEADERS,
        vary: "x-llms-model",
        // RFC 5988 Link header pointing every consumer at the canonical
        // llmstxt.org §1 URL.
        link: `<${BASE_URL}/llms.txt>; rel="canonical"`,
      },
    });
  }

  // Curated view – canonical Link header points back at the curated
  // canonical (e.g. /llms.txt?model=claude), not the bare /llms.txt URL.
  // This keeps the per-model citation surface singular.
  const body = getCachedLlmsTxtForModel(resolved);
  return new NextResponse(body, {
    status: 200,
    headers: {
      ...ALIAS_HEADERS,
      vary: "x-llms-model",
      link: `<${BASE_URL}/llms.txt?model=${resolved}>; rel="canonical"`,
      "x-llms-model-resolved": resolved,
    },
  });
}
