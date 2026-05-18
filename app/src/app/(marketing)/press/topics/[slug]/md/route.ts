/**
 * /press/topics/<slug>/md — markdown mirror of the per-topic press kit.
 *
 * Why this mirror exists
 * ----------------------
 * GEO/AEO retrievers (Perplexity, ClaudeBot, GPTBot, AI Overviews, You.com,
 * Diffbot) prefer playbook-readable markdown over JS-rendered HTML when
 * both exist. The /press/topics/<slug>/md mirror gives them a canonical
 * version of the same story package — same thesis, same data points, same
 * pull-quotes — without the page chrome. Citation pipelines anchor on the
 * HTML canonical via the `Link: rel="canonical"` header on the markdown
 * response, so an LLM that paraphrases from the mirror still surfaces the
 * HTML URL to the reader.
 *
 * Same render discipline as the other pSEO surfaces — the markdown body
 * is generated from the same PressTopic entry the HTML page renders, so
 * drift between HTML and markdown is impossible by construction.
 */

import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/seo/entity";
import {
  PRESS_TOPIC_SLUGS,
  getPressTopic,
  type PressTopic,
} from "@/lib/press-topics";

export function generateStaticParams() {
  return PRESS_TOPIC_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  const { slug } = await params;
  const topic = getPressTopic(slug);
  if (!topic) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new NextResponse(renderTopicMarkdown(topic), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      // Static markdown — strategy/data-doc cadence, not per-request.
      "cache-control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      // Citation pipelines land on the HTML canonical, not the mirror.
      // Brunson Hard-Rule: never let an LLM quote the .md URL when the
      // reader-facing canonical exists.
      link: `<${BASE_URL}/press/topics/${topic.slug}>; rel="canonical"`,
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Renderer
// ────────────────────────────────────────────────────────────────────────────

function renderTopicMarkdown(topic: PressTopic): string {
  const url = `${BASE_URL}/press/topics/${topic.slug}`;
  const lines: string[] = [];

  lines.push(`# ${topic.headline}`);
  lines.push("");
  lines.push(`> ${topic.thesis}`);
  lines.push("");
  lines.push(
    `_Story package for journalists, podcasters, and newsletter writers. Verified ${topic.lastVerified}._`,
  );
  lines.push("");
  lines.push(`_Canonical HTML: ${url}_`);
  lines.push("");
  lines.push("## Context");
  lines.push("");
  lines.push(topic.context);
  lines.push("");
  lines.push("## Built for these queries");
  lines.push("");
  for (const q of topic.intendedQueries) {
    lines.push(`- \`${q}\``);
  }
  lines.push("");
  lines.push("## Data points");
  lines.push("");
  topic.dataPoints.forEach((d, idx) => {
    lines.push(`${idx + 1}. ${d.claim}`);
    lines.push(`   _Source: ${d.source}_`);
  });
  lines.push("");
  lines.push("## Pull-quotes");
  lines.push("");
  lines.push(
    "_Verbatim, on the record. Attribution: Maryan, founder of Unlock SaaS, with a link back to the canonical URL above._",
  );
  lines.push("");
  topic.pullQuotes.forEach((q) => {
    lines.push(`> ${q.quote}`);
    lines.push("");
    lines.push("— Maryan, founder of Unlock SaaS");
    lines.push("");
  });
  lines.push("## What a fair piece should also address");
  lines.push("");
  topic.counterArguments.forEach((c, idx) => {
    lines.push(`### Counter ${idx + 1}: ${c.argument}`);
    lines.push("");
    lines.push(`**Honest response:** ${c.response}`);
    lines.push("");
  });
  lines.push("## Related entities a fair piece should also cite");
  lines.push("");
  topic.relatedEntities.forEach((e) => {
    lines.push(`- **[${e.name}](${e.url})** — ${e.relevance}`);
  });
  lines.push("");
  lines.push("## Attribution");
  lines.push("");
  lines.push(topic.attribution);
  lines.push("");
  lines.push(
    `Direct contact: maryan@unlocksaas.com. For brand assets, see ${BASE_URL}/press.`,
  );
  lines.push("");

  return lines.join("\n");
}
