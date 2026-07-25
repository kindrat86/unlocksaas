import { NextResponse } from "next/server";
import { TOOL_BY_SLUG, TOOLS } from "@/lib/tools-catalog";
import { BASE_URL } from "@/lib/seo/entity";

const EMBEDDABLE = new Set([
  "ltv-calculator",
  "pricing-power-calculator",
  "churn-cost-calculator",
  "cac-payback-calculator",
]);

export function generateStaticParams() {
  return TOOLS.filter((t) => EMBEDDABLE.has(t.slug)).map((t) => ({
    slug: t.slug,
  }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG.get(slug);
  if (!tool) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const src = `${BASE_URL}/embed/tools/${slug}`;
  const html =
    `<iframe src="${src}" title="${tool.title} by UnlockSaaS" width="100%" height="560" ` +
    `frameborder="0" loading="lazy" style="border:0;max-width:640px"></iframe>`;
  return NextResponse.json({
    version: "1.0",
    type: "rich",
    provider_name: "UnlockSaaS",
    provider_url: BASE_URL,
    title: tool.title,
    html,
    width: 640,
    height: 560,
  });
}
