import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /pricing-teardown.md — markdown mirror of the /pricing-teardown hub.
 * See src/lib/seo/markdown.ts for the content registry and rationale.
 */
export function GET() {
  return markdownResponseForPath("/pricing-teardown");
}

export const dynamic = "force-static";
