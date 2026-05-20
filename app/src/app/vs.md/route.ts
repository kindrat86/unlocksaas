import { markdownResponseForPath } from "@/lib/seo/md-route";

/**
 * /vs.md – markdown mirror of the /vs hub.
 * Was /compare.md before the 2026-05-21 rename to the /vs URL shape that
 * Google actually serves for "[A] vs [B]" queries. The lookup key in
 * markdownResponseForPath stays "/vs" – see src/lib/seo/markdown.ts.
 */
export function GET() {
  return markdownResponseForPath("/vs");
}

