import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { CASE_STUDY_SLUGS, getCaseStudyBySlug } from "@/lib/case-studies";

/**
 * /case-studies/<slug>/md – markdown mirror of the case study detail page.
 */
export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const c = getCaseStudyBySlug(slug);
  if (!c) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const changed = c.whatChanged.map((item, i) => `${i + 1}. ${item}`).join("\n");
  const lessons = c.keyLessons.map((item, i) => `${i + 1}. ${item}`).join("\n");

  const body = [
    `# ${c.title}`,
    ``,
    `> ${c.oneLine}`,
    ``,
    `**Founder:** ${c.founderProfile}`,
    `**Category:** ${c.category}`,
    `**Last verified:** ${c.lastVerified}`,
    ``,
    `---`,
    ``,
    `## Backstory`,
    ``,
    c.backstory,
    ``,
    `## The problem`,
    ``,
    c.theProblem,
    ``,
    `## What changed`,
    ``,
    changed,
    ``,
    `## The result`,
    ``,
    c.theResult,
    ``,
    `## Key lessons`,
    ``,
    lessons,
    ``,
    `---`,
    `*Source: [${BASE_URL}/case-studies/${c.slug}](${BASE_URL}/case-studies/${c.slug})*`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/case-studies/${c.slug}>; rel="canonical"`,
    },
  });
}
