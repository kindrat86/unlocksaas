import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /press.md — markdown mirror of /press for AI crawlers and journalists
 * who want the press kit in plain-text form. See src/lib/seo/markdown.ts
 * for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/press");
}

