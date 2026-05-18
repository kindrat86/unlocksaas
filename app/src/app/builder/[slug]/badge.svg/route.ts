/**
 * Verified Builder SVG badge — distributed-backlink lift surface.
 *
 * Why this exists (off-page strategy, code-only lever)
 * ----------------------------------------------------
 * The existing /builder/<slug>/embed page already produces HTML, plain-link,
 * and markdown snippets, but a `<a>` tag is rejected by every markdown-
 * rendered surface that strips arbitrary HTML: GitHub README, Substack,
 * Medium, Reddit (in many subs), most issue trackers, Notion exports.
 * An SVG served with `image/svg+xml` and embedded via `<img>` is the lowest
 * common denominator — it renders everywhere `<img>` renders, which is
 * effectively everywhere. Markdown form: `![](.../badge.svg)`.
 *
 * Strategically: every Verified Builder who pastes the SVG into their
 * GitHub README ships one do-follow editorial backlink to unlocksaas.com
 * from a DR-100 surface. Brunson Hard-Rule reconciliation: the link is
 * honest (the founder really is a Verified Builder, Stripe really did
 * verify the cycle), and the image is plain SVG with no tracking, no
 * pixel, no script.
 *
 * Caching discipline
 * ------------------
 * Each badge changes only when the founder edits their profile or revokes
 * visibility. That happens roughly never. We serve with:
 *   - `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-
 *     revalidate=604800`
 * so first-byte hits the edge cache for a day, stays warm in
 * stale-while-revalidate for a week, and a single revoke flip is reflected
 * within 5 minutes for clients holding a stale local copy. The s-maxage
 * matches the cron cadence at which we'd most plausibly bust the cache
 * if we wanted to.
 *
 * Privacy + Brunson Hard-Rule
 * ---------------------------
 * Same surface as the existing /builder/<slug> page: reads through
 * loadPublicBadge which is RLS-gated to `share_visibility=public` rows
 * via the builder_badges view. Private profiles → 404. Refunded founders
 * stay verified (the customer was real). No email, no Stripe id, no IP
 * ever embedded in the SVG.
 *
 * Visual style
 * ------------
 * Matches the locked light shadcn theme (project_unlocksaas_visual_style):
 * no purple, no yellow, no orange, no script fonts, no attention bars.
 * Single border-radius, neutral border, system-ui font stack, foreground/
 * muted-foreground hex values from the live token set. The badge survives
 * dark backgrounds because the card has its own `background="#ffffff"` —
 * any host site is treated as untrusted-CSS, the SVG draws its own world.
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge } from "@/lib/builder-badge";

export const runtime = "nodejs";
// Per-slug Supabase read; revalidate every 5 minutes is the right freshness
// target for "founder revoked visibility" (worst case 5-min stale before the
// SVG starts 404ing). Edge caches still hold stale for the s-maxage window.
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

// ── SVG layout constants ────────────────────────────────────────────────────
// Tuned so the badge reads at the default README rendering width (~720px in
// GitHub README, ~600px on Substack) without scaling artifacts. 600x80 is the
// sweet spot — wider than a typical shields.io badge but narrower than a card.
const WIDTH = 600;
const HEIGHT = 80;
const PADDING = 18;
const RADIUS = 10;

// Neutral palette pulled from the locked light theme token set so the badge
// renders identically to /builder/<slug>'s in-page card. No theme switch
// inside SVG — host sites may render the SVG in dark contexts, which is
// fine; the card draws its own white background.
const COLORS = {
  background: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
  accent: "#111827", // monochrome checkmark, no brand color leakage
} as const;

export async function GET(_req: Request, props: Props) {
  let slug = "<unknown>";
  try {
    const params = await props.params;
    slug = params.slug;

    const badge = await loadPublicBadge(createAdminClient(), slug);

    if (!badge) {
      // 404 with a tiny placeholder SVG so a stale README doesn't render
      // a broken image icon. The placeholder is intentionally minimal — it
      // shows "Badge unavailable" so a host-site visitor who notices it
      // can act on it, but it doesn't leak any UnlockSaaS branding or
      // imply the founder is verified when they aren't. 404 + a short
      // cache so a revoke is visible within the 5-min window without
      // hammering the DB on every README hit.
      const placeholder = renderPlaceholderSvg();
      return new NextResponse(placeholder, {
        status: 404,
        headers: {
          "content-type": "image/svg+xml; charset=utf-8",
          "cache-control": "public, max-age=300, s-maxage=300",
        },
      });
    }

    const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const productLabel = badge.productName ?? "their product";

    const svg = renderBadgeSvg({
      builderName: badge.builderName,
      productLabel,
      dateStr,
    });

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        // Edge cache 24h; client cache 5min; SWR window 7 days. Discussion
        // in the file header. The combination keeps GitHub README renders
        // fast while keeping the worst-case stale window short.
        "cache-control":
          "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
        // Defence-in-depth: SVG containing user-controlled text needs
        // CSP-friendly delivery. We render plain SVG with no <script>, no
        // foreignObject, no external <image href=> — but explicit is
        // better.
        "content-security-policy":
          "default-src 'none'; style-src 'unsafe-inline'",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (err) {
    // Single unified error path. loadPublicBadge already logs its own
    // Supabase failures (return null + console.error), so the only way
    // to land here is an unexpected throw — programming error in
    // renderBadgeSvg, params unwrap failure on a malformed URL, or a
    // service-role client init crash. Log once with the slug tag so the
    // production log gives us the bad input, then return a 500 placeholder
    // with NO long-cache headers so a transient bug can't poison the edge
    // for 24h.
    console.error(
      "[builder/badge.svg] unhandled error rendering badge",
      { slug, err: err instanceof Error ? err.message : String(err) },
    );
    return new NextResponse(renderPlaceholderSvg(), {
      status: 500,
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        // No s-maxage. Server errors must never poison the edge.
        "cache-control": "no-store",
      },
    });
  }
}

// ────────────────────────────────────────────────────────────────────────────
// SVG template
// ────────────────────────────────────────────────────────────────────────────

interface RenderArgs {
  builderName: string;
  productLabel: string;
  dateStr: string;
}

function renderBadgeSvg({
  builderName,
  productLabel,
  dateStr,
}: RenderArgs): string {
  // Truncate to fit. Builder names + product names are user-controlled and
  // can be arbitrarily long. Width budget per line is roughly 56 chars at
  // 14px system font; we cap with ellipsis. Truncate BEFORE escape so the
  // escape can't be partially applied to an entity.
  const safeName = truncate(builderName, 38);
  const safeProduct = truncate(productLabel, 38);
  const safeDate = truncate(dateStr, 24);

  // XML-escape every interpolation. SVG is XML — `<`, `>`, `&`, `"`, `'`
  // all carry meaning in attribute and text contexts.
  const nameXml = escapeXml(safeName);
  const productXml = escapeXml(safeProduct);
  const dateXml = escapeXml(safeDate);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${WIDTH}" height="${HEIGHT}"
     viewBox="0 0 ${WIDTH} ${HEIGHT}"
     role="img"
     aria-label="${nameXml} — Verified Builder — Stripe-verified first paying customer on ${dateXml}">
  <title>${nameXml} — Verified Builder</title>
  <desc>${nameXml} shipped ${productXml} and got a paying customer. Verified by Stripe on ${dateXml}.</desc>

  <!-- Card background. The host site may apply its own background; we draw
       our own white card so contrast is predictable. -->
  <rect x="0.5" y="0.5"
        width="${WIDTH - 1}" height="${HEIGHT - 1}"
        rx="${RADIUS}" ry="${RADIUS}"
        fill="${COLORS.background}"
        stroke="${COLORS.border}"
        stroke-width="1"/>

  <!-- Checkmark circle. Mono path so the badge inherits no brand color
       from any future theme palette change. -->
  <g transform="translate(${PADDING}, ${HEIGHT / 2 - 12})">
    <circle cx="12" cy="12" r="12" fill="${COLORS.accent}"/>
    <path d="M6.5 12.5 l3.5 3.5 l8 -8.5"
          fill="none"
          stroke="#ffffff"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </g>

  <!-- Text block. Three lines: VERIFIED BUILDER kicker, builder/product
       headline, Stripe + date subline. system-ui font stack so the
       badge picks up the host platform's UI font (San Francisco on macOS,
       Segoe UI on Windows, Roboto on Android) without us shipping a
       webfont. -->
  <g transform="translate(${PADDING + 38}, 0)"
     font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
     fill="${COLORS.text}">
    <text x="0" y="24"
          font-size="10"
          font-weight="600"
          letter-spacing="1.2"
          fill="${COLORS.muted}">VERIFIED BUILDER</text>
    <text x="0" y="44"
          font-size="14"
          font-weight="600">${nameXml} — ${productXml}</text>
    <text x="0" y="62"
          font-size="11"
          fill="${COLORS.muted}">Verified by Stripe · ${dateXml}</text>
  </g>

  <!-- Right-edge wordmark. Anchors the badge to its source so a screenshot
       still carries attribution. text-anchor=end + x at width-padding so
       the wordmark sits flush right regardless of badge name length. -->
  <text x="${WIDTH - PADDING}"
        y="${HEIGHT - PADDING}"
        font-family="ui-sans-serif, system-ui, -apple-system, sans-serif"
        font-size="11"
        font-weight="500"
        fill="${COLORS.muted}"
        text-anchor="end">unlocksaas.com</text>
</svg>`;
}

function renderPlaceholderSvg(): string {
  // Plain neutral box for stale READMEs pointing at a slug whose visibility
  // was revoked or that never existed. No branding promise, no implication
  // the founder is verified. Reads "Badge unavailable" so a viewer can act.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${WIDTH}" height="${HEIGHT}"
     viewBox="0 0 ${WIDTH} ${HEIGHT}"
     role="img"
     aria-label="Badge unavailable">
  <rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}"
        rx="${RADIUS}" ry="${RADIUS}"
        fill="${COLORS.background}"
        stroke="${COLORS.border}"
        stroke-width="1"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 5}"
        font-family="ui-sans-serif, system-ui, sans-serif"
        font-size="13"
        fill="${COLORS.muted}"
        text-anchor="middle">Badge unavailable</text>
</svg>`;
}

// ── helpers ─────────────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  // Use a horizontal ellipsis (U+2026) so the character count stays within
  // budget — three dots would visually equal a wider char in some fonts.
  return s.slice(0, max - 1).replace(/\s+$/, "") + "…";
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
