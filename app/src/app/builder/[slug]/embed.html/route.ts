/**
 * /builder/<slug>/embed.html — self-contained iframe payload.
 *
 * Why this route exists:
 *   The card snippet on the embed-code page works for any host that allows
 *   raw HTML (most product sites, README files, footers). For hosts that
 *   only allow iframes (Notion, Substack inline embeds, many Webflow CMS
 *   fields, Ghost), the founder can paste:
 *
 *     <iframe src="https://unlocksaas.com/builder/marco/embed.html"
 *             title="Marco – Verified Builder badge"
 *             width="360" height="120"
 *             frameborder="0" loading="lazy"
 *             referrerpolicy="no-referrer-when-downgrade"
 *             style="border:0"></iframe>
 *
 *   The iframe HTML still contains the canonical `<a href="/builder/<slug>">`
 *   link, so the link relationship survives the iframe boundary AS LONG AS
 *   the search engine indexes the iframe contents (Googlebot does; some
 *   ad-network bots don't, which is fine — they aren't the audience).
 *
 *   IndieWeb `rel="me"` on the anchor lets identity-verification tools
 *   (Mastodon profile link verification, Bridgy, IndieAuth) honor the
 *   reciprocal identity chain even across the iframe.
 *
 *   The `<script type="application/ld+json">` Review block is included
 *   inline so the iframe document itself is a complete structured-data
 *   surface. Some crawlers parse JSON-LD inside iframes; some do not.
 *   Including it is strictly additive — we lose nothing by shipping it.
 *
 * Layout decisions:
 *   - Width 360, height 120: matches the card variant on the embed page.
 *   - No external resources: all CSS is inline, no fonts loaded, no images.
 *     The badge here is a CSS-only card (the SVG variant is at /badge.svg
 *     for the `<img>` use-case).
 *   - `<html lang="en-US">` carries the language signal for assistive tech.
 *   - `referrer-policy: no-referrer-when-downgrade` so the founder's
 *     visitors don't leak HTTPS→HTTPS referrers cross-origin. The link
 *     still passes Referer to unlocksaas.com (we want to know which
 *     domains are sending visitors).
 *
 * Frame-Options:
 *   - We INTENTIONALLY do not set `X-Frame-Options: DENY` or
 *     `Content-Security-Policy: frame-ancestors 'none'`. This route's
 *     entire purpose is to be iframed cross-origin. We do set
 *     `frame-ancestors *` explicitly to override any platform default.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge, absoluteBadgeUrl } from "@/lib/builder-badge";
import { buildReviewJsonLd } from "@/lib/seo/builder-review";


interface RouteCtx {
  params: Promise<{ slug: string }>;
}

const NOT_FOUND_HTML = `<!doctype html>
<html lang="en-US"><head><meta charset="utf-8"><title>Verified Builder badge not found</title><meta name="robots" content="noindex"></head>
<body style="margin:0;font:14px/1.4 system-ui,sans-serif;color:#6b7280;background:#fff;padding:24px">Verified Builder badge not found.</body></html>`;

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;

  let badge;
  try {
    badge = await loadPublicBadge(createAdminClient(), slug);
  } catch (err) {
    console.error("[builder/embed.html] supabase read failed", {
      slug,
      err: err instanceof Error ? err.message : String(err),
    });
    return new NextResponse(NOT_FOUND_HTML, {
      status: 503,
      headers: htmlHeaders(),
    });
  }

  if (!badge) {
    return new NextResponse(NOT_FOUND_HTML, {
      status: 404,
      headers: htmlHeaders(),
    });
  }

  const badgeUrl = absoluteBadgeUrl(badge.slug);
  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const product = badge.productName ?? "their product";
  const reviewJsonLd = JSON.stringify(buildReviewJsonLd(badge));

  const html = `<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(badge.builderName)} — Verified Builder · Unlock SaaS</title>
  <meta name="robots" content="noindex,follow">
  <meta name="referrer" content="no-referrer-when-downgrade">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    html,body{margin:0;padding:0;background:transparent;font:14px/1.4 ui-sans-serif,-apple-system,system-ui,"Segoe UI",sans-serif;color:#111827}
    a.card{display:flex;flex-direction:column;gap:6px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;text-decoration:none;color:inherit;max-width:340px;margin:8px}
    a.card:hover{border-color:#111827}
    .eyebrow{font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#6b7280;font-weight:600;display:flex;align-items:center;gap:6px}
    .eyebrow span.tick{display:inline-block;width:12px;height:12px;background:#111827;border-radius:999px;position:relative}
    .eyebrow span.tick:after{content:"";position:absolute;left:3px;top:5px;width:6px;height:3px;border:1px solid #fff;border-top:0;border-right:0;transform:rotate(-45deg)}
    .headline{font-weight:600;color:#111827}
    .meta{font-size:12px;color:#6b7280}
  </style>
  <script type="application/ld+json">${reviewJsonLd}</script>
</head>
<body>
  <a class="card" href="${badgeUrl}" rel="me external" target="_top">
    <div class="eyebrow"><span class="tick" aria-hidden="true"></span>Verified Builder</div>
    <div class="headline">${escapeHtml(badge.builderName)} shipped ${escapeHtml(product)} and got paid for it.</div>
    <div class="meta">Verified by Stripe · ${escapeHtml(dateStr)}</div>
  </a>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: htmlHeaders(),
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

function htmlHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    Vary: "Accept-Encoding",
    "Access-Control-Allow-Origin": "*",
    // Override any platform default that might block iframing. We WANT
    // this route iframed cross-origin from any domain.
    "Content-Security-Policy": "frame-ancestors *",
    "Referrer-Policy": "no-referrer-when-downgrade",
    "X-Content-Type-Options": "nosniff",
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
