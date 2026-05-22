/**
 * Content-negotiation path mapping for the markdown twin surface.
 *
 * Maps an incoming HTML pathname to its markdown mirror pathname so the
 * proxy can transparently rewrite `Accept: text/markdown` and
 * `?format=md` requests to the corresponding `.md` route.
 *
 * Two URL conventions exist on this site:
 *   - Top-level pages use a `.md` suffix      (e.g. /founding → /founding.md)
 *   - pSEO slug detail pages use a `/md` child (e.g. /glossary/foo → /glossary/foo/md)
 *
 * Why two shapes?
 * ----------------
 * The Next.js App Router only treats `[slug]` as a dynamic segment when the
 * entire folder name is bracketed. `[slug].md` is parsed as a literal
 * folder, not a dynamic segment with a `.md` suffix, so slug-level mirrors
 * must live at `[slug]/md/`. Top-level pages don't have that constraint,
 * so they use the cleaner `.md` suffix.
 *
 * This helper is the canonical mapping. Keep it deterministic and pure —
 * the proxy calls it on every request that opts into markdown content
 * negotiation, so it must not perform I/O or allocations beyond the
 * returned string.
 */

/**
 * Top-level paths whose `.md` mirror lives at `<path>.md`. Derived from the
 * 20 route handlers under app/<surface>.md/route.ts. Update this list when
 * a new top-level mirror is added.
 *
 * Note: `/` maps to `/index.md` (special-cased below), not `/.md`.
 */
const TOP_LEVEL_MD_SURFACES: ReadonlySet<string> = new Set([
  "/about",
  "/alternatives-to",
  "/category",
  "/compare",
  "/vs",
  "/dataset",
  "/diagnostic",
  "/dont-buy-unlock-saas",
  "/editorial-policy",
  "/faq",
  "/founding",
  "/funnel-teardown",
  "/glossary",
  "/mcp",
  "/playbook-sales",
  "/press",
  "/pricing-teardown",
  "/search",
  "/starter",
  "/stories",
]);

/**
 * pSEO roots whose slug detail pages have a `/md` child mirror. Adding a
 * new root to this set + its corresponding render function in markdown.ts
 * is all that's needed to make the new surface negotiable.
 *
 * `/press/topics` is listed verbatim because it's a two-segment root, not
 * `/press`. The proxy must match the longer prefix first.
 */
const PSEO_SLUG_ROOTS: ReadonlyArray<string> = [
  "/alternatives-to",
  "/funnel-teardown",
  "/pricing-teardown",
  "/vs",
  "/compare",
  "/category",
  "/glossary",
  "/press/topics",
  "/benchmarks",
  "/answers",
  "/funnel-playbook",
  "/why-isnt-my",
  "/for",
  "/launch-checklist",
  "/swipe-file",
];

/**
 * True when a request already targets one of the markdown mirror URL shapes.
 * These routes emit their own `Link: rel="canonical"` response header from
 * the route handler, pointing back to the HTML page.
 */
export function isMarkdownMirrorPath(pathname: string): boolean {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return normalized.endsWith(".md") || normalized.endsWith("/md");
}

/**
 * Map an HTML pathname to its markdown mirror pathname, or `null` if no
 * mirror exists for the requested path.
 *
 * Inputs that already point at a markdown route (e.g. `/foo.md`, `/foo/md`)
 * return `null` so we don't loop the rewrite on the rewritten request.
 */
export function toMarkdownPath(pathname: string): string | null {
  // Already a markdown URL — no-op so the proxy doesn't loop.
  if (isMarkdownMirrorPath(pathname)) {
    return null;
  }

  // Homepage maps to /index.md (not /.md).
  if (pathname === "/" || pathname === "") {
    return "/index.md";
  }

  // Trailing-slash tolerance: /foo/ behaves like /foo for mapping purposes.
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  // Top-level mirror: /foo → /foo.md.
  if (TOP_LEVEL_MD_SURFACES.has(normalized)) {
    return `${normalized}.md`;
  }

  // pSEO slug mirror: /<root>/<slug> → /<root>/<slug>/md.
  // Match longest prefix first so /press/topics/<slug> wins over /press.
  const sortedRoots = [...PSEO_SLUG_ROOTS].sort(
    (a, b) => b.length - a.length,
  );
  for (const root of sortedRoots) {
    const prefix = `${root}/`;
    if (normalized.startsWith(prefix)) {
      const rest = normalized.slice(prefix.length);
      // Only single-segment slugs are valid pSEO detail URLs. If the rest
      // contains a `/`, this is a deeper route (e.g. a sub-tool) — don't
      // rewrite, the caller can serve the HTML normally.
      if (rest.length === 0 || rest.includes("/")) {
        continue;
      }
      return `${normalized}/md`;
    }
  }

  return null;
}

/**
 * Decide whether the request opts into markdown via:
 *   - `?format=md` query parameter (explicit, easiest for AI agents)
 *   - `Accept: text/markdown` header (HTTP content negotiation)
 *
 * Accept-header parsing is conservative on purpose: a request whose Accept
 * header is the wildcard pair or `text/html, ...` does NOT trigger
 * markdown. Only an explicit `text/markdown` token in the Accept header
 * (regardless of position) qualifies — pSEO and home-page traffic from
 * real browsers always advertises text/html and must continue to receive
 * the HTML page.
 */
export function wantsMarkdown(args: {
  searchParams: URLSearchParams;
  acceptHeader: string | null;
}): boolean {
  const formatParam = args.searchParams.get("format");
  if (formatParam === "md" || formatParam === "markdown") return true;

  const accept = args.acceptHeader?.toLowerCase() ?? "";
  if (!accept) return false;

  // text/html in the Accept header means a real browser — never rewrite,
  // even if text/markdown is also listed. This avoids breaking the
  // human-facing page for users whose browser advertises markdown support.
  if (accept.includes("text/html")) return false;

  return (
    accept.includes("text/markdown") ||
    accept.includes("text/x-markdown")
  );
}
