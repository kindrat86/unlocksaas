/**
 * /builder/<slug>/oembed.json — oEmbed discovery endpoint.
 *
 * oEmbed (https://oembed.com) is the convention Substack, Ghost, Notion,
 * Medium, Discord, Slack, and several CMS platforms use to auto-render a
 * URL pasted into their editor as a rich embed instead of a raw link.
 *
 * When a founder pastes `https://unlocksaas.com/builder/marco` into a
 * Substack post body, Substack will:
 *   1. Fetch the URL.
 *   2. Look in the HTML `<head>` for a `<link rel="alternate"
 *      type="application/json+oembed" href="...">` discovery anchor.
 *   3. Fetch that anchor and render the JSON payload as a rich card.
 *
 * Type choices:
 *   - `type: "rich"` with an inline HTML iframe pointing at the
 *     `embed.html` route. The iframe inherits the JSON-LD Review schema
 *     that lives inside it.
 *
 * Provider and author fields:
 *   - `provider_name: "Unlock SaaS"` and `provider_url: "https://unlocksaas.com"`
 *     get rendered as the small attribution line under the embed in most
 *     hosts. This is additional surface for the brand on every embed
 *     placement.
 *   - `author_name` and `author_url` carry the builder identity for hosts
 *     that show "embedded from <author> on <provider>" stripes.
 *
 * Honest fallback:
 *   When no public badge exists, return a 404 with a minimal JSON body.
 *   Hosts will fall back to rendering a plain link, which is fine.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge, absoluteBadgeUrl } from "@/lib/builder-badge";

export const dynamic = "force-dynamic";

interface RouteCtx {
  params: Promise<{ slug: string }>;
}

const BASE = "https://unlocksaas.com";

export async function GET(req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;
  const url = new URL(req.url);
  // Per oEmbed spec, hosts may request a specific maxwidth/maxheight.
  // We honor the cap with sane defaults.
  const maxwidth = clampInt(url.searchParams.get("maxwidth"), 200, 800, 360);
  const maxheight = clampInt(url.searchParams.get("maxheight"), 80, 400, 140);

  let badge;
  try {
    badge = await loadPublicBadge(createAdminClient(), slug);
  } catch (err) {
    console.error("[builder/oembed.json] supabase read failed", {
      slug,
      err: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "oembed_unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!badge) {
    return NextResponse.json(
      { error: "not_found" },
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=60",
        },
      },
    );
  }

  const badgeUrl = absoluteBadgeUrl(badge.slug);
  const embedSrc = `${BASE}/builder/${badge.slug}/embed.html`;
  const thumbnail = `${BASE}/builder/${badge.slug}/badge.svg`;
  const product = badge.productName ?? "their product";

  // The HTML payload that the host inlines. Most hosts iframe sandbox this,
  // so it must be a complete, self-contained iframe element.
  const html = `<iframe src="${embedSrc}" title="${escapeAttr(badge.builderName)} — Verified Builder" width="${maxwidth}" height="${maxheight}" frameborder="0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="border:0;max-width:100%"></iframe>`;

  const payload = {
    version: "1.0",
    type: "rich",
    provider_name: "Unlock SaaS",
    provider_url: BASE,
    author_name: badge.builderName,
    author_url: badge.productUrl ?? badgeUrl,
    title: `${badge.builderName} — Verified Builder · ${product}`,
    cache_age: 300,
    width: maxwidth,
    height: maxheight,
    thumbnail_url: thumbnail,
    thumbnail_width: 360,
    thumbnail_height: 80,
    html,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      Vary: "Accept-Encoding",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "X-Content-Type-Options": "nosniff",
    },
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

function clampInt(
  raw: string | null,
  min: number,
  max: number,
  fallback: number,
): number {
  const n = raw ? parseInt(raw, 10) : NaN;
  if (Number.isFinite(n)) {
    return Math.max(min, Math.min(max, n));
  }
  return fallback;
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
