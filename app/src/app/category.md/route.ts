import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /category.md — markdown mirror of the /category hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/category");
}

export const dynamic = "force-static";
