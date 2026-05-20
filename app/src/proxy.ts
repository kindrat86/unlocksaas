import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  AB_COOKIE_MAX_AGE,
  IDENTITY_COOKIE,
  SUBJECT_COOKIE,
  pickIdentityVariant,
  pickSubjectId,
} from "@/lib/ab";
import { toMarkdownPath, wantsMarkdown } from "@/lib/seo/markdown-path";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * Emit an explicit `Link: <…>; rel="canonical"` HTTP header on every proxied
 * response (2026-05-21 SEO audit fix).
 *
 * Why a header on top of the metadataBase-inferred <link rel="canonical">?
 *
 *   - Google honours the HTML <link> tag but several non-Google retrievers
 *     (some indie crawlers, citation-following AI agents, RSS/Atom readers
 *     that don't parse HTML body) only inspect HTTP headers. Without the
 *     header, those clients have no canonical signal at all.
 *   - The same header is what /cite/[id]/[format] uses to anchor citation
 *     formats back to the human page; emitting it everywhere makes the
 *     site's canonical-claim policy uniform.
 *   - It's defence-in-depth: if a per-page metadata override forgets a
 *     canonical, the header still names one.
 *
 * Skip rules:
 *   – `/api/*` is a pure RPC surface (returns JSON, not indexable HTML).
 *   – `/cite/*` already emits its own canonical pointing to the HUMAN page
 *     rather than to itself; overriding here would create two competing
 *     rel="canonical" Link values.
 *
 * For markdown-rewrite responses, the canonical points to the ORIGINAL HTML
 * URL (e.g., /about), not the rewritten .md path, because /about is the
 * canonical surface and /about.md is its mirror.
 *
 * Trailing slash defensive-strip: `trailingSlash: false` in next.config.mjs
 * already 308-redirects /about/ → /about, but if a request ever reaches the
 * proxy with a stray trailing slash we still emit a clean canonical.
 */
function setCanonicalLinkHeader(
  response: NextResponse,
  originalPathname: string,
): void {
  if (originalPathname.startsWith("/api/")) return;
  if (originalPathname.startsWith("/cite/")) return;
  const path =
    originalPathname.length > 1 && originalPathname.endsWith("/")
      ? originalPathname.slice(0, -1)
      : originalPathname;
  response.headers.set("Link", `<${BASE_URL}${path}>; rel="canonical"`);
}

/**
 * Refreshes the Supabase auth session cookie on every (non-static) request,
 * then assigns the sticky A/B identity variant + subject id on first visit.
 *
 * Filename is `proxy.ts` – the Next.js 16+ convention for the network-boundary
 * request interceptor that used to live at `middleware.ts` in Next 14/15. The
 * exported function is `proxy` to match (Next 16 renamed it from `middleware`,
 * partly motivated by CVE-2025-29927). Next 16 still accepts the old filename
 * but logs a deprecation warning and will remove it in a future version.
 *
 * Markdown content negotiation
 * ----------------------------
 * Before any session work, the proxy checks whether the caller wants the
 * markdown twin of the requested page (via `?format=md` or
 * `Accept: text/markdown`). If yes and the page has a mirror, rewrite to
 * the `.md` route. AI crawlers and CLI tools get clean markdown without
 * having to know the URL shape; browsers continue to receive HTML because
 * `text/html` in the Accept header short-circuits the check.
 */
export async function proxy(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname;

  // 1) Markdown content negotiation — runs before session refresh because
  //    .md routes are pure static content; no Supabase or A/B work needed.
  if (
    wantsMarkdown({
      searchParams: request.nextUrl.searchParams,
      acceptHeader: request.headers.get("accept"),
    })
  ) {
    const mdPath = toMarkdownPath(originalPathname);
    if (mdPath) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = mdPath;
      // Strip the `format` param so the rewritten URL is cache-key clean.
      rewriteUrl.searchParams.delete("format");
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      // Canonical points to the original HTML URL, not the .md mirror.
      setCanonicalLinkHeader(rewriteResponse, originalPathname);
      return rewriteResponse;
    }
  }

  const response = await updateSession(request);

  // A/B: identity_label sticky variant assignment.
  // Verified Builders (current ship) vs Paid Builders (the polar alternative)
  // per Hard Rule #10 of strategy/BUILD-PROMPT-CLAUDE-CODE.md.
  //
  // Two cookies, one year sticky:
  //   - usaas_ab_identity: the variant string ("verified_builder" | "paid_builder")
  //   - usaas_ab_subject:  a stable UUID used as ab_tests.subject_id
  //
  // Writing to request.cookies makes the assignment visible to the current
  // request's Server Components (no double-render). Writing to response.cookies
  // sets the Set-Cookie header so the browser persists it.
  const existingIdentity = request.cookies.get(IDENTITY_COOKIE)?.value;
  if (
    existingIdentity !== "verified_builder" &&
    existingIdentity !== "paid_builder"
  ) {
    const variant = pickIdentityVariant();
    request.cookies.set(IDENTITY_COOKIE, variant);
    response.cookies.set(IDENTITY_COOKIE, variant, {
      maxAge: AB_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

  const existingSubject = request.cookies.get(SUBJECT_COOKIE)?.value;
  if (!existingSubject) {
    const subjectId = pickSubjectId();
    request.cookies.set(SUBJECT_COOKIE, subjectId);
    response.cookies.set(SUBJECT_COOKIE, subjectId, {
      maxAge: AB_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

  setCanonicalLinkHeader(response, originalPathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - _next/static, _next/image (build assets)
     * - favicon, public images
     * - api/webhooks/stripe (must not have its body wrapped/buffered by mw)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
