import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  LAUNCH_CHECKLIST_SLUGS,
  getLaunchChecklistBySlug,
} from "@/lib/launch-checklists";
import { renderLaunchChecklistMarkdown } from "@/lib/seo/markdown";

/**
 * /launch-checklist/<slug>/md – markdown mirror of each niche-specific
 * launch checklist. Mirrors the shape of /for/<slug>/md.
 *
 * Adding a new entry to src/lib/launch-checklists.ts (which itself must
 * track src/lib/niches.ts) auto-extends this surface on the next deploy.
 *
 * Brunson Hard-Rule reconciliation: markdown body is generated from the
 * same LaunchChecklistEntry the HTML page renders – no drift class.
 */

export function generateStaticParams() {
  return LAUNCH_CHECKLIST_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const e = getLaunchChecklistBySlug(slug);
  if (!e) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderLaunchChecklistMarkdown(slug);
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
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/launch-checklist/${e.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every slug at build time. No request-time inputs.
