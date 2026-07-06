import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import { HOW_TO_SLUGS, getHowToBySlug } from "@/lib/how-to";

/**
 * /how-to/<slug>/md – markdown mirror of the how-to detail page.
 */
export function generateStaticParams() {
  return HOW_TO_SLUGS.map((slug) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const h = getHowToBySlug(slug);
  if (!h) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const steps = h.steps
    .map((s, i) => `### ${i + 1}. ${s.heading}\n\n${s.body}`)
    .join("\n\n");
  const tips = h.proTips.map((t, i) => `${i + 1}. ${t}`).join("\n");

  const body = [
    `# ${h.title}`,
    ``,
    `> ${h.oneLine}`,
    ``,
    `**Category:** ${h.category}`,
    `**Last verified:** ${h.lastVerified}`,
    ``,
    h.lead,
    ``,
    `---`,
    ``,
    steps,
    ``,
    `## Pro tips`,
    ``,
    tips,
    ``,
    `---`,
    `*Source: [${BASE_URL}/how-to/${h.slug}](${BASE_URL}/how-to/${h.slug})*`,
  ].join("\n");

  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/how-to/${h.slug}>; rel="canonical"`,
    },
  });
}
