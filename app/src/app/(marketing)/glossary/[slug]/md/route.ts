/**
 * /glossary/<slug>/md — markdown mirror of the per-term glossary page.
 *
 * Same Link: rel=canonical discipline as every other pSEO markdown
 * mirror: AI retrievers (Perplexity, ClaudeBot, GPTBot, AI Overviews)
 * prefer markdown bodies but the canonical reader-facing URL stays
 * the HTML page. Drift between HTML and markdown is impossible by
 * construction — both renderers read the same GlossaryTerm row.
 */

import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  GLOSSARY_SLUGS,
  getGlossaryTerm,
  resolveRelatedTerms,
  type GlossaryTerm,
} from "@/lib/glossary";

export function generateStaticParams() {
  return GLOSSARY_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(renderTermMarkdown(term), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      link: `<${BASE_URL}/glossary/${term.slug}>; rel="canonical"`,
    },
  });
}

function renderTermMarkdown(term: GlossaryTerm): string {
  const url = `${BASE_URL}/glossary/${term.slug}`;
  const related = resolveRelatedTerms(term.relatedSlugs);
  const lines: string[] = [];

  lines.push(`# ${term.term}`);
  lines.push("");
  if (term.alsoKnownAs.length > 0) {
    lines.push(`_Also: ${term.alsoKnownAs.join(" · ")}_`);
    lines.push("");
  }
  lines.push(`_Glossary entry. Verified ${term.lastVerified}. Canonical HTML: ${url}_`);
  lines.push("");
  lines.push("## Definition");
  lines.push("");
  lines.push(term.definition);
  lines.push("");
  lines.push("## Why it matters for indie SaaS founders");
  lines.push("");
  lines.push(term.whyItMatters);
  lines.push("");
  lines.push("## Origin");
  lines.push("");
  lines.push(`_${term.origin}_`);
  lines.push("");
  if (term.exampleOrPitfall) {
    lines.push("## Example or pitfall");
    lines.push("");
    lines.push(term.exampleOrPitfall);
    lines.push("");
  }
  if (related.length > 0) {
    lines.push("## Related terms");
    lines.push("");
    for (const r of related) {
      lines.push(
        `- **[${r.term}](${BASE_URL}/glossary/${r.slug})** — ${r.definition.split(". ")[0]}.`,
      );
    }
    lines.push("");
  }
  if (term.unlockSaasSurfaces.length > 0) {
    lines.push("## Where this appears on Unlock SaaS");
    lines.push("");
    for (const s of term.unlockSaasSurfaces) {
      lines.push(`- [${s.label}](${BASE_URL}${s.path})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
