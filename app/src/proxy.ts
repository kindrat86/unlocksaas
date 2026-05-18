import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  AB_COOKIE_MAX_AGE,
  IDENTITY_COOKIE,
  SUBJECT_COOKIE,
  pickIdentityVariant,
  pickSubjectId,
} from "@/lib/ab";

/**
 * Refreshes the Supabase auth session cookie on every (non-static) request,
 * then assigns the sticky A/B identity variant + subject id on first visit.
 *
 * Filename is `middleware.ts` — correct for Next.js 14.2.x.
 * (Renamed to `proxy.ts` only in Next.js 16. Don't migrate until the rest of
 * the app is upgraded.)
 */
export async function proxy(request: NextRequest) {
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
