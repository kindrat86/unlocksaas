import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /alternatives-to.md — markdown mirror of the /alternatives-to hub page.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/alternatives-to");
}

export const dynamic = "force-static";
