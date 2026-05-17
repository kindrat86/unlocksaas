import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /parables.md — markdown mirror of /parables for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/parables");
}

export const dynamic = "force-static";
