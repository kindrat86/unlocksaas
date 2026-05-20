import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  PRESS_TOPIC_SLUGS,
  getPressTopicBySlug,
} from "@/lib/press-topics";
import { renderPressTopicMarkdown } from "@/lib/seo/markdown";

/**
 * /press/topics/<slug>/md – markdown mirror of the per-topic press
 * package page.
 *
 * Why this URL shape (not /press/topics/<slug>.md)
 * ------------------------------------------------
 * Next.js App Router treats `[slug].md/` as a literal folder name, not a
 * dynamic segment with a `.md` suffix. The cleanest dynamic-mirror URL
 * the router actually supports is a child route, `/press/topics/<slug>/md`.
 * Documented convention; see also alternatives-to/[slug]/md/route.ts.
 *
 * Static generation
 * -----------------
 * Every entry in PRESS_TOPIC_SLUGS gets a pre-rendered mirror at build.
 * Adding a new topic to src/lib/press-topics.ts auto-extends this surface
 * on the next deploy – same pattern as the sitemap.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Markdown body is generated from the same PressTopic entry the HTML page
 * renders. Drift is impossible by construction.
 *
 * Function runtime
 * ----------------
 * Default Node.js runtime, default 300s timeout – more than enough for a
 * pure synchronous markdown render of a module-level constant. No
 * cookies/headers/searchParams read, so the response is fully cacheable
 * at the edge.
 */

export function generateStaticParams() {
  return PRESS_TOPIC_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const topic = getPressTopicBySlug(slug);
  if (!topic) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderPressTopicMarkdown(slug);
  if (!body) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // Static markdown – data-doc cadence, not request cadence. Edge-cache
      // for a day, stale-while-revalidate for a week. Build-id keyed cache
      // key handles invalidation on deploy.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Point retrieval pipelines at the HTML canonical, not the mirror,
      // so citations in AI answers land on the human-readable page.
      link: `<${BASE_URL}/press/topics/${topic.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every topic at build time. No request-time inputs.
