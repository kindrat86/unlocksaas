import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  AB_COOKIE_MAX_AGE,
  IDENTITY_COOKIE,
  SUBJECT_COOKIE,
  pickIdentityVariant,
  pickSubjectId,
} from "@/lib/ab";
import {
  STACK_COOKIE_MAX_AGE,
  STACK_SUBJECT_COOKIE,
  STACK_ENTRY_COOKIE,
  STACK_CURRENT_COOKIE,
  STACK_PATH_COOKIE,
  StackLayer,
  pickStackSubjectId,
} from "@/lib/stack-attribution";

/**
 * Refreshes the Supabase auth session cookie on every (non-static) request,
 * then assigns the sticky A/B identity variant + subject id on first visit.
 *
 * Filename is `middleware.ts` — correct for Next.js 14.2.x.
 * (Renamed to `proxy.ts` only in Next.js 16. Don't migrate until the rest of
 * the app is upgraded.)
 */

/**
 * Map the first-touch pathname to a StackLayer for the `stack_entry` cookie.
 *
 * Bridge-into-layer events that occur AFTER first touch are written by the
 * client-side beacon at /api/stack/event — this map only seeds the entry
 * layer so the path always has a first element even if the visitor never
 * crosses a tracked bridge.
 *
 * See strategy/funnel-stack.md "The eight layers" for the source of truth.
 */
function pathnameToEntryLayer(pathname: string): number {
  if (pathname.startsWith("/diagnostic") || pathname.startsWith("/parables")) {
    return StackLayer.DIAGNOSIS;
  }
  if (pathname.startsWith("/starter")) return StackLayer.STARTER;
  if (pathname.startsWith("/oto") || pathname.startsWith("/welcome")) {
    return StackLayer.CORE;
  }
  if (pathname.startsWith("/machine-sales") || pathname.startsWith("/founding")) {
    return StackLayer.LONG_FORM;
  }
  if (pathname.startsWith("/machine")) return StackLayer.IN_PRODUCT;
  // Everything else (funnel hub `/`, `/bridge`, marketing routes, etc.) is
  // ATTENTION layer.
  return StackLayer.ATTENTION;
}

export async function middleware(request: NextRequest) {
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

  // ── Funnel Stack: cross-funnel attribution (DotCom Secrets Secret #27) ──
  //
  // Four sticky cookies, one year, mirror the A/B pattern. Set once on the
  // visitor's first request; preserved across every layer transition. The
  // Stripe checkout route reads these and stamps them onto session.metadata
  // so the webhook can attribute a conversion to a full path even if the
  // browser session ended. See strategy/funnel-stack.md "Cross-funnel
  // attribution scheme".
  //
  //   usaas_stack_subject  stable UUID, distinct from the A/B subject so a
  //                        ten-year subject migration on either axis doesn't
  //                        invalidate the other
  //   usaas_stack_entry    integer layer of first touch (0..8)
  //   usaas_stack_current  integer layer of current view (advances per request)
  //   usaas_stack_path     JSON array of visited layers (capped at 32 to bound
  //                        cookie size; truncated from the head)
  //
  // The path cookie is updated every request whose entry-layer differs from
  // the last entry. The client-side beacon at /api/stack/event is used for
  // bridge-OUT and exit events; the cookie write here is sufficient for the
  // initial entry and ascension cases.
  const currentLayer = pathnameToEntryLayer(request.nextUrl.pathname);

  const existingStackSubject = request.cookies.get(STACK_SUBJECT_COOKIE)?.value;
  if (!existingStackSubject) {
    const stackSubjectId = pickStackSubjectId();
    request.cookies.set(STACK_SUBJECT_COOKIE, stackSubjectId);
    response.cookies.set(STACK_SUBJECT_COOKIE, stackSubjectId, {
      maxAge: STACK_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

  const existingStackEntry = request.cookies.get(STACK_ENTRY_COOKIE)?.value;
  if (!existingStackEntry) {
    const entry = String(currentLayer);
    request.cookies.set(STACK_ENTRY_COOKIE, entry);
    response.cookies.set(STACK_ENTRY_COOKIE, entry, {
      maxAge: STACK_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

  // Current layer is REPLACED, not preserved — that is its job.
  const newCurrent = String(currentLayer);
  request.cookies.set(STACK_CURRENT_COOKIE, newCurrent);
  response.cookies.set(STACK_CURRENT_COOKIE, newCurrent, {
    maxAge: STACK_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });

  // Path is APPENDED. Read existing, parse, dedup against the last entry,
  // append, cap at 32. Defensive parsing — never throw on visitor data.
  const STACK_PATH_MAX = 32;
  const existingPathRaw = request.cookies.get(STACK_PATH_COOKIE)?.value;
  let path: number[] = [];
  if (existingPathRaw) {
    try {
      const parsed = JSON.parse(existingPathRaw);
      if (Array.isArray(parsed)) {
        path = parsed
          .map((entry) => (typeof entry === "number" ? entry : Number(entry)))
          .filter((n) => Number.isInteger(n) && n >= 0 && n <= 8);
      }
    } catch {
      path = [];
    }
  }
  if (path.length === 0 || path[path.length - 1] !== currentLayer) {
    path.push(currentLayer);
    if (path.length > STACK_PATH_MAX) {
      path = path.slice(path.length - STACK_PATH_MAX);
    }
    const serialized = JSON.stringify(path);
    request.cookies.set(STACK_PATH_COOKIE, serialized);
    response.cookies.set(STACK_PATH_COOKIE, serialized, {
      maxAge: STACK_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  }

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
