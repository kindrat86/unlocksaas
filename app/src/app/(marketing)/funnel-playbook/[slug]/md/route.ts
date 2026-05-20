import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  FUNNEL_PLAYBOOK_SLUGS,
  getFunnelPlaybookBySlug,
} from "@/lib/funnel-playbooks";
import {
  FUNNEL_MATRIX_SLUGS,
  getMatrixEntry,
} from "@/lib/funnel-playbook-matrix";
import {
  renderFunnelPlaybookMarkdown,
  renderFunnelMatrixMarkdown,
} from "@/lib/seo/markdown";

/**
 * /funnel-playbook/<slug>/md – markdown mirror of each Brunson-funnel
 * archetype playbook AND each funnel × niche matrix combo. Mirrors the
 * shape of /glossary/<slug>/md.
 *
 * Adding a new entry to src/lib/funnel-playbooks.ts or src/lib/niches.ts
 * auto-extends this surface on the next deploy. Brunson Hard-Rule
 * reconciliation: markdown body is generated from the same entries the
 * HTML page renders, so the two surfaces never drift.
 */

export function generateStaticParams() {
  return [...FUNNEL_PLAYBOOK_SLUGS, ...FUNNEL_MATRIX_SLUGS].map((slug) => ({
    slug,
  }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Bare-funnel branch.
  const bare = getFunnelPlaybookBySlug(slug);
  if (bare) {
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
        link: `<${BASE_URL}/funnel-playbook/${bare.slug}>; rel="canonical"`,
      },
    });
  }

  // Matrix combo branch.
  const matrix = getMatrixEntry(slug);
  if (matrix) {
    const body = renderFunnelMatrixMarkdown(slug);
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
        link: `<${BASE_URL}/funnel-playbook/${matrix.slug}>; rel="canonical"`,
      },
    });
  }

  return new NextResponse("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

// Pre-render every playbook slug + every combo slug at build time. No
// request-time inputs.
