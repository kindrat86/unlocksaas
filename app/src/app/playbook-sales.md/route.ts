import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /playbook-sales.md — markdown mirror of /playbook-sales for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/playbook-sales");
}

export const dynamic = "force-static";
