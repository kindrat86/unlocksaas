/**
 * /builder/<slug>/review.json — Review JSON-LD payload.
 *
 * Off-page lift: founders paste this URL (or its body) into a
 * `<script type="application/ld+json" src="...">`-equivalent pattern on
 * their own site. Google harvests the Review on the founder's domain,
 * resolves `itemReviewed.@id` to the unlocksaas Playbook SoftwareApplication,
 * and aggregates citation signal across every domain that hosts a Verified
 * Builder badge.
 *
 * NOTE on `<script src>` semantics: HTML `<script type="application/ld+json">`
 * tags do NOT honor the `src` attribute — the spec requires inline JSON.
 * So the embed-code kit teaches founders to INLINE the payload (the embed
 * page renders a copyable inline `<script>` block). This route exists for
 * three secondary use cases:
 *   1. Founders pulling the body server-side (Next.js / Astro / Nuxt /
 *      Eleventy templates that fetch-and-inline at build time).
 *   2. Crawlers and structured-data parsers fetching the canonical
 *      machine-readable form of a builder's review (Diffbot, RustyBrick,
 *      LLM retrievers that look at sibling URLs).
 *   3. Future MCP / agent integrations that consume Review payloads.
 *
 * Content-Type discipline: `application/ld+json` is the canonical media
 * type per the schema.org and JSON-LD specs. Google's structured-data
 * tester accepts both `application/ld+json` and `application/json`; we
 * ship the strict form so the response is unambiguous.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge } from "@/lib/builder-badge";
import { buildReviewJsonLd } from "@/lib/seo/builder-review";

export const dynamic = "force-dynamic";

interface RouteCtx {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, ctx: RouteCtx) {
  const { slug } = await ctx.params;

  let badge;
  try {
    badge = await loadPublicBadge(createAdminClient(), slug);
  } catch (err) {
    console.error("[builder/review.json] supabase read failed", {
      slug,
      err: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "review_unavailable" },
      {
        status: 503,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store",
        },
      },
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

  const payload = buildReviewJsonLd(badge);

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/ld+json; charset=utf-8",
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
