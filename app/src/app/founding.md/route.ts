import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /founding.md — markdown mirror of /founding for AI crawlers.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/founding");
}

export const dynamic = "force-static";
