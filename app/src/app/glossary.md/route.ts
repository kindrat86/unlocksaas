import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /glossary.md – markdown mirror of /glossary for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/glossary");
}

export const dynamic = "force-static";
