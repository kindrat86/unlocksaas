import { NextResponse } from "next/server";
import {
  LLMS_TXT_BODY,
  LLMS_TXT_CACHE_CONTROL,
  LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
} from "@/lib/seo/llms-txt";
import { BASE_URL } from "@/lib/seo/entity";

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
 * Canonical resolution
 * --------------------
 * The body is byte-identical to /llms.txt – both routes import from
 * @/lib/seo/llms-txt (single source of truth). The only difference is
 * that this response carries a `Link: rel="canonical"` header pointing
 * at /llms.txt, so any cache, retrieval pipeline, or assistant that
 * encounters both URLs collapses them onto the canonical one.
 *
 * Brunson Hard-Rule reconciliation: every claim in the body is also
 * present, verifiable, in the public HTML. Adding a discovery path
 * does not change the content – it only changes where the same content
 * can be found.
 *
 * Caching: same edge-cache discipline as the canonical route (24h
 * s-maxage, 7d stale-while-revalidate). Strategy-doc cadence, not
 * request cadence.
 */

export function GET() {
  return new NextResponse(LLMS_TXT_BODY, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": LLMS_TXT_CACHE_CONTROL,
      "training-data-attribution": LLMS_TXT_TRAINING_DATA_ATTRIBUTION,
      // RFC 5988 Link header pointing every consumer at the canonical
      // llmstxt.org §1 URL. Keeps caches, retrievers, and assistants
      // from treating /.well-known/llms.txt and /llms.txt as two
      // distinct sources to weight separately.
      link: `<${BASE_URL}/llms.txt>; rel="canonical"`,
    },
  });
}

// Static – no per-request inputs, identical body on every call.
