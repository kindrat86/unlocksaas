/**
 * Shared response helper for `<page>.md` route handlers.
 *
 * Every per-surface markdown mirror under app/<page>.md/route.ts calls
 * this with its canonical HTML path. Centralizing the response shape
 * means cache headers, content-type, and the `Link: rel=canonical` header
 * are consistent across every mirror, and a future change (e.g. adding
 * ETag support) lands in one place.
 *
 * Why a helper instead of a single catch-all
 * ------------------------------------------
 * Next.js App Router doesn't accept dynamic-segment + literal-suffix
 * folder names (`[slug].md/` is parsed as a literal folder, not a dynamic
 * segment), so the cleanest way to serve `/founding.md`, `/faq.md`, etc.
 * is one route handler per page. Each handler is one line — this helper
 * absorbs the rest of the boilerplate.
 */

import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  getSurfaceByPath,
  renderSurfaceMarkdown,
} from "@/lib/seo/markdown";

/**
 * Build a markdown response for a registered surface. Returns 404 if the
 * surface isn't in the registry — which only fires if a route handler is
 * pointed at a path the registry doesn't know about, i.e. a bug.
 */
export function markdownResponseForPath(path: string): NextResponse {
  const surface = getSurfaceByPath(path);
  if (!surface) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(renderSurfaceMarkdown(surface), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // Static markdown — strategy/data-doc cadence, not request cadence.
      // Edge-cache for a day, stale-while-revalidate for a week. Build-id
      // keyed cache key handles invalidation on deploy.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Point retrieval pipelines at the HTML canonical, not at the mirror.
      // Without this, an LLM may cite the .md URL in its answer, which
      // confuses users clicking through to "read more."
      link: `<${BASE_URL}${surface.path}>; rel="canonical"`,
    },
  });
}
