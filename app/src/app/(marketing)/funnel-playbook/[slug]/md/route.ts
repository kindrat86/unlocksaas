import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  FUNNEL_PLAYBOOK_SLUGS,
  getFunnelPlaybookBySlug,
} from "@/lib/funnel-playbooks";
import { renderFunnelPlaybookMarkdown } from "@/lib/seo/markdown";

/**
 * /funnel-playbook/<slug>/md — markdown mirror of each Brunson-funnel
 * archetype playbook. Mirrors the shape of /glossary/<slug>/md.
 *
 * Adding a new entry to src/lib/funnel-playbooks.ts auto-extends this
 * surface on the next deploy. Brunson Hard-Rule reconciliation: markdown
 * body is generated from the same FunnelPlaybookEntry the HTML page
 * renders.
 */

export function generateStaticParams() {
  return FUNNEL_PLAYBOOK_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const p = getFunnelPlaybookBySlug(slug);
  if (!p) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const body = renderFunnelPlaybookMarkdown(slug);
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
      link: `<${BASE_URL}/funnel-playbook/${p.slug}>; rel="canonical"`,
    },
  });
}

// Pre-render every playbook slug at build time. No request-time inputs.
