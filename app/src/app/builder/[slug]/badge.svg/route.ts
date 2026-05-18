/**
 * /builder/<slug>/badge.svg — hot-linkable SVG badge.
 *
 * Why this route exists (off-page lift):
 *   Verified Builders paste an `<img src="https://unlocksaas.com/builder/<slug>/badge.svg">`
 *   on their own homepage / README / Notion. The image must be:
 *     - hot-linkable (CORS open),
 *     - fast (edge-cached, small SVG payload),
 *     - stable (the URL never changes, so the founder can paste-and-forget),
 *     - honest (re-renders from the live builder_badges view; if the
 *       founder flips to private, the SVG renders the empty-state instead
 *       of an existing card going stale).
 *
 *   The badge image is purely illustrative. The clickable target is the
 *   surrounding `<a href="/builder/<slug>">` element, which is what the
 *   embed kit teaches founders to use. We intentionally do NOT hyperlink
 *   the SVG itself — that would create two link destinations (SVG asset
 *   URL and the surrounding anchor) which crawlers handle inconsistently.
 *
 * 404 semantics:
 *   When no public badge exists for the slug, we return a 404 SVG (not a
 *   404 HTML page) so embedding sites render the standard "broken image"
 *   icon rather than blowing up with a broken-document indicator.
 *
 * Caching:
 *   - `Cache-Control: public, s-maxage=300, stale-while-revalidate=86400`
 *     gives founder embeds near-zero perceived latency once an edge node
 *     warms up, while keeping fresh-data lag under five minutes if the
 *     founder updates their product name.
 *   - `Vary: Accept-Encoding` so gzipped delivery doesn't poison the cache
 *     for clients that request identity encoding.
 *   - `Access-Control-Allow-Origin: *` because the URL is intended to be
 *     loaded cross-origin (it's literally how the embed works).
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge } from "@/lib/builder-badge";
import { renderBadgeSvg } from "@/lib/seo/builder-review";

export const dynamic = "force-dynamic";
// We still set Cache-Control headers below; the edge respects them.

interface RouteCtx {
  params: Promise<{ slug: string }>;
}

const PLACEHOLDER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 80" width="360" height="80" role="img" aria-label="Verified Builder badge not found">
  <rect x="0.5" y="0.5" width="359" height="79" rx="9" ry="9" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="180" y="46" font-family="ui-sans-serif, -apple-system, system-ui, sans-serif" font-size="13" fill="#6b7280" text-anchor="middle">Verified Builder badge not found</text>
</svg>`;

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  let badge;
  try {
    badge = await loadPublicBadge(createAdminClient(), slug);
  } catch (err) {
    // Unhappy path observability. Kept terse so hot-path latency
    // is unaffected on the happy path. `console.error` survives the
    // production build per next.config removeConsole exclusion.
    console.error("[builder/badge.svg] supabase read failed", {
      slug,
      err: err instanceof Error ? err.message : String(err),
    });
    badge = null;
  }

  const headers: Record<string, string> = {
    "Content-Type": "image/svg+xml; charset=utf-8",
    // 5min edge cache, 1d stale-while-revalidate. Long enough to amortise
    // Supabase reads at scale, short enough that profile edits propagate.
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    Vary: "Accept-Encoding",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    // Defensive — the SVG carries no script, but some embed contexts
    // sniff inline SVGs for <script> tags. Make our intent explicit.
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    "X-Content-Type-Options": "nosniff",
  };

  if (!badge) {
    return new NextResponse(PLACEHOLDER_SVG, {
      status: 404,
      headers,
    });
  }

  return new NextResponse(renderBadgeSvg(badge), {
    status: 200,
    headers,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
