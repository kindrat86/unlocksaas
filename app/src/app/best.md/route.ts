import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /best.md — markdown mirror of the "Best SaaS customer acquisition
 * playbooks" listicle. See src/lib/seo/markdown.ts for the content
 * registry and the AEO rationale: markdown mirrors give retrieval-
 * augmented answer pipelines a clean, JS-free parse of the content.
 */
export function GET() {
  return markdownResponseForPath("/best");
}
