import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /funnel-teardown.md — markdown mirror of the /funnel-teardown hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/funnel-teardown");
}

export const dynamic = "force-static";
