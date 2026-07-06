import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { MISTAKE_SLUGS, getMistakeBySlug } from "@/lib/mistakes";

/**
 * /mistakes/<slug>/md – markdown mirror of the mistake detail page.
 */
export function generateStaticParams() {
  return MISTAKE_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const m = getMistakeBySlug(slug);
  if (!m) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const why = m.whyItHappens.map((item, i) => `${i + 1}. ${item}`).join("\n");
  const fix = m.theFix.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const body = [
    `# ${m.title}`,
    ``,
    `> ${m.oneLine}`,
    ``,
    `**Category:** ${m.category}`,
    `**Last verified:** ${m.lastVerified}`,
    ``,
    m.lead,
    ``,
    `---`,
    ``,
    `## Why this mistake happens`,
    ``,
    why,
    ``,
    `## The fix`,
    ``,
    fix,
    ``,
    `---`,
    `*Source: [${BASE_URL}/mistakes/${m.slug}](${BASE_URL}/mistakes/${m.slug})*`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/mistakes/${m.slug}>; rel="canonical"`,
    },
  });
}
