import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  AB_COOKIE_MAX_AGE,
  IDENTITY_COOKIE,
  SUBJECT_COOKIE,
  pickIdentityVariant,
  pickSubjectId,
} from "@/lib/ab";
import {
  SOURCE_COOKIE,
  SOURCE_COOKIE_MAX_AGE,
  detectSourceFromRequest,
  parseSource,
} from "@/lib/acquisition-source";
import {
  isMarkdownMirrorPath,
  toMarkdownPath,
  wantsMarkdown,
} from "@/lib/seo/markdown-path";
import { BASE_URL } from "@/lib/seo/entity";
import {
  AI_ENGINE_COOKIE,
  AI_ENGINE_COOKIE_MAX_AGE,
  isAiEngine,
  resolveEngineFromUtmSource,
} from "@/lib/seo/ai-attribution";

// Affiliate program (see lib/affiliate.ts). Re-declared here to avoid importing
// the full lib (which transitively pulls Supabase + crypto) into the proxy
// bundle. The full constants live in lib/affiliate.ts and must stay in sync.
const REF_COOKIE = "unlocksaas_ref";
const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const REF_CODE_RE = /^[a-z0-9]{6,16}$/i; // permissive: matches lib/affiliate's CODE_ALPHABET
const MACHINE_READABLE_FILE_EXT_RE =
  /\.(?:atom|bib|csv|html|ics|json|jsonld|m4a|md|mp3|mp4|pdf|ris|rss|txt|webmanifest|xml)$/i;
const MACHINE_READABLE_PATH_PREFIXES = [
  "/.well-known/",
  "/feed/",
] as const;
const MACHINE_READABLE_EXACT_PATHS = new Set([
  "/dataset/huggingface/raw",
  "/dataset/zenodo/raw",
  "/glossary/podcast-cover",
  "/glossary/podcast.xml",
]);

function isMachineReadablePath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return false;
  if (pathname === "/dataset") return false;
  if (pathname.endsWith("/md")) return true;
  if (MACHINE_READABLE_FILE_EXT_RE.test(pathname)) return true;
  if (MACHINE_READABLE_EXACT_PATHS.has(pathname)) return true;

  return MACHINE_READABLE_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

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
 *   – markdown mirror routes (dot-md suffixes and slash-md children)
 *     already emit their own canonical from the route handler, pointing
 *     back to the HTML page.
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
  if (isMarkdownMirrorPath(originalPathname)) return;
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
      // The markdown route handler owns the canonical Link header. Adding
      // another one here duplicates the final response header.
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // Public machine-readable surfaces are cacheable crawler/agent resources,
  // not visitor sessions. Let the route handler answer directly so llms.txt,
  // markdown mirrors, feeds, manifests, dataset assets, and similar URLs do
  // not receive Supabase refresh cookies or sticky A/B attribution cookies.
  if (isMachineReadablePath(originalPathname)) {
    // ── CSP override for cross-origin-embeddable iframes ─────────────
    // Editorial-backlink widget farm. /embed/*, /network/widget.html,
    // /widgets/* MUST be iframeable so bloggers can embed the UnlockSaaS
    // calculators (with "Powered by UnlockSaaS" credit link) and earn us
    // genuine inbound links. These .html paths land in this branch via
    // MACHINE_READABLE_FILE_EXT_RE; we must apply the override HERE before
    // the early return, because the main response-shaping block below is
    // never reached.
    const EMBED_PATH_RE =
      /^\/(?:embed|network\/widget\.html|widgets)(?:\/|$)/;
    if (EMBED_PATH_RE.test(originalPathname)) {
      const embedResponse = NextResponse.next();
      embedResponse.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors *",
      );
      embedResponse.headers.delete("X-Frame-Options");
      return embedResponse;
    }
    return NextResponse.next();
  }

  const response = await updateSession(request);

  // Affiliate attribution: persist `?ref=<code>` query into a 90-day cookie
  // so a Verified Builder posting `unlocksaas.com/?ref=marco_x` on social gets
  // the same first-touch attribution as the canonical /r/<code> deeplink.
  //
  // The cookie is read by /api/checkout and stamped onto Stripe metadata.
  // We do NOT validate the code against the DB here – the proxy must stay
  // free of Supabase calls (it runs on every request, including static
  // assets). The webhook does the affiliate lookup before crediting; an
  // unknown code in a cookie is harmless.
  //
  // Self-overwrite policy: first-touch wins. Don't overwrite an existing
  // cookie – otherwise a competing referrer in the same browser session
  // could steal the attribution mid-funnel.
  const refParam = request.nextUrl.searchParams.get("ref");
  if (refParam && REF_CODE_RE.test(refParam)) {
    const normalised = refParam.toLowerCase();
    const existingRef = request.cookies.get(REF_COOKIE)?.value;
    if (!existingRef) {
      request.cookies.set(REF_COOKIE, normalised);
      response.cookies.set(REF_COOKIE, normalised, {
        maxAge: REF_COOKIE_MAX_AGE,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  // Acquisition source attribution: first-touch sticky cookie that drives
  // the home Hero block's source-aware variant copy (see
  // src/lib/acquisition-source.ts). Detected from utm_source / source / ref
  // tokens, then Referer hostname. Decoupled from the affiliate REF cookie
  // because affiliate codes are revenue attribution (per-creator) while
  // acquisition source is channel attribution (per-platform); the two can
  // and do co-exist on a single visit.
  //
  // First-touch wins, same discipline as REF: if the cookie already holds
  // a valid source value, we do NOT overwrite. A later visit from a
  // different channel cannot steal the attribution mid-funnel.
  //
  // Self-write-skip: detectSourceFromRequest returns null when no rule
  // matches (organic / direct / unknown referrer). In that case we leave
  // the cookie alone — uncookied visitors render the `default` variant
  // via readSourceFromCookies's null-fallback, no Set-Cookie header needed.
  const existingSource = parseSource(
    request.cookies.get(SOURCE_COOKIE)?.value,
  );
  if (!existingSource) {
    const detectedSource = detectSourceFromRequest({
      searchParams: request.nextUrl.searchParams,
      refererHeader: request.headers.get("referer"),
    });
    if (detectedSource) {
      request.cookies.set(SOURCE_COOKIE, detectedSource);
      response.cookies.set(SOURCE_COOKIE, detectedSource, {
        maxAge: SOURCE_COOKIE_MAX_AGE,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  // AI engine attribution: first-touch sticky cookie that drives the
  // PostHog `ai_engine` super-property (see components/analytics/
  // posthog-provider.tsx). Captured from the `utm_source` query
  // parameter we publish in llms.txt + llms-*.txt + MCP tool returns
  // (see src/lib/seo/ai-attribution.ts).
  //
  // Decoupled from `usaas_source` (acquisition-source.ts) because
  // those tag indie-channel attribution (Twitter, IndieHackers, etc.)
  // while this one tags WHICH AI ENGINE drove the click. The two
  // co-exist on a single visit; a click from Claude posted on Twitter
  // gets `ai_engine=claude` AND `source=twitter`.
  //
  // First-touch wins. We do NOT overwrite an existing cookie – a
  // later utm_source on the same browser cannot steal attribution
  // mid-funnel.
  //
  // resolveEngineFromUtmSource() returns null when no rule matches
  // (organic, direct, or a utm_source from a non-AI channel like
  // twitter/indiehackers). In that case we leave the cookie alone –
  // the acquisition-source pipeline handles non-AI channels.
  const existingAiEngine = request.cookies.get(AI_ENGINE_COOKIE)?.value;
  if (!existingAiEngine || !isAiEngine(existingAiEngine)) {
    const utmSourceRaw = request.nextUrl.searchParams.get("utm_source");
    const detectedEngine = resolveEngineFromUtmSource(utmSourceRaw);
    if (detectedEngine) {
      request.cookies.set(AI_ENGINE_COOKIE, detectedEngine);
      response.cookies.set(AI_ENGINE_COOKIE, detectedEngine, {
        maxAge: AI_ENGINE_COOKIE_MAX_AGE,
        sameSite: "lax",
        secure: true,
        path: "/",
      });
    }
  }

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
      secure: true,
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
      secure: true,
      path: "/",
    });
  }

  // ── CSP override for cross-origin-embeddable iframes ─────────────────
  // The editorial-backlink widget farm: /embed/*, /network/widget.html,
  // /widgets/* MUST be iframeable from any origin so bloggers can embed
  // UnlockSaaS calculators (with a "Powered by UnlockSaaS" credit link) and
  // earn us genuine inbound links. The baseline CSP sets frame-ancestors
  // 'none' everywhere; the vercel.json + next.config.mjs header overrides
  // proved unreliable (Next's terminal catch-all route overwrites them in
  // the Build Output config). Middleware is the final authority — its
  // response.headers overwrite whatever the framework/route produced.
  // See skill: authority-backlink-building.
  const EMBED_PATH_RE =
    /^\/(?:embed|network\/widget\.html|widgets)(?:\/|$)/;
  if (EMBED_PATH_RE.test(originalPathname)) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors *",
    );
    response.headers.delete("X-Frame-Options");
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
     * - .well-known/workflow/* (Workflow DevKit internal routes — must not
     *   pass through Supabase session refresh, A/B cookies, or canonical
     *   header logic; see node_modules/@workflow/next/docs/next.mdx)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|\\.well-known/workflow/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
