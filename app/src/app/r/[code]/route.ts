import { NextResponse, type NextRequest } from "next/server";
import {
  getActiveAffiliateByCode,
  recordClick,
  REF_COOKIE,
  REF_COOKIE_MAX_AGE,
} from "@/lib/affiliate";

// Node runtime is the default under Fluid Compute + cacheComponents in Next 16;
// no `export const runtime = "nodejs"` is needed (and it conflicts with
// cacheComponents per next/build errors). The redirect handler uses crypto
// via lib/affiliate (hashIp) which runs under Node fine.

/**
 * Affiliate tracking redirect.
 *
 *   GET /r/<code>?utm_source=…&landing=/diagnostic
 *
 * Behaviour:
 *   - If the code maps to an active affiliate: log a click row, set the
 *     `unlocksaas_ref` cookie (90 days, lax), and 302 to the landing page
 *     (defaults to /diagnostic — that's the squeeze in the locked value
 *     ladder). The cookie is later read by /api/checkout and stamped onto
 *     Stripe metadata for attribution.
 *   - If the code is unknown or banned: 302 to /diagnostic with no cookie.
 *     We never reveal whether a code exists; bots probing the namespace see
 *     the same response as legitimate misses.
 *
 * Privacy:
 *   - IP is hashed with a salted SHA-256, never stored raw.
 *   - User-Agent is truncated to 240 chars.
 *
 * The cookie is read-only from the browser perspective (HttpOnly off so the
 * frontend could surface "you came in via <affiliate>" in copy if we want
 * to in the future — for now it's just attribution).
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const codeNormalised = (code ?? "").trim().toLowerCase();

  // Compute the landing URL. Allow an optional ?landing= override but only
  // accept same-origin paths — never let the redirect carry to an external
  // domain via crafted ?landing=https://attacker.example .
  const landingParam = req.nextUrl.searchParams.get("landing");
  const landingPath =
    landingParam && landingParam.startsWith("/") && !landingParam.startsWith("//")
      ? landingParam
      : "/diagnostic";
  const landingUrl = new URL(landingPath, req.nextUrl.origin);

  // Forward utm + carry the ref code on the URL so analytics tags can see it
  // even before the cookie round-trips.
  const utmSource = req.nextUrl.searchParams.get("utm_source") ?? "affiliate";
  const utmMedium = req.nextUrl.searchParams.get("utm_medium") ?? "referral";
  const utmCampaign = req.nextUrl.searchParams.get("utm_campaign") ?? codeNormalised;
  landingUrl.searchParams.set("utm_source", utmSource);
  landingUrl.searchParams.set("utm_medium", utmMedium);
  landingUrl.searchParams.set("utm_campaign", utmCampaign);
  landingUrl.searchParams.set("ref", codeNormalised);

  let affiliate: Awaited<ReturnType<typeof getActiveAffiliateByCode>>;
  try {
    affiliate = await getActiveAffiliateByCode(codeNormalised);
  } catch (err) {
    // DB hiccup must not 500 the redirect – attribution failure is recoverable
    // (we lose this one click), a broken /r/<code> link is a public bug.
    console.error(
      `[affiliate] /r/${codeNormalised} lookup failed:`,
      err instanceof Error ? err.message : err,
    );
    return NextResponse.redirect(landingUrl, { status: 302 });
  }

  // Unknown / banned code: silent 302, no cookie.
  if (!affiliate) {
    console.log(`[affiliate] /r/${codeNormalised} missed (no active code)`);
    return NextResponse.redirect(landingUrl, { status: 302 });
  }

  // Pull IP via the X-Forwarded-For chain Vercel injects; fall back to the
  // remote socket. (NextRequest.ip is undefined under Fluid Compute.)
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const ip = xff.split(",")[0]?.trim() || null;

  await recordClick({
    affiliate,
    codeUsed: codeNormalised,
    ip,
    userAgent: req.headers.get("user-agent"),
    referer: req.headers.get("referer"),
    utm: { source: utmSource, medium: utmMedium, campaign: utmCampaign },
    landingPath,
  });

  const response = NextResponse.redirect(landingUrl, { status: 302 });
  response.cookies.set(REF_COOKIE, affiliate.code, {
    maxAge: REF_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
    // HttpOnly off – we may want to surface affiliate-name personalisation
    // client-side later; cookie value is just an opaque code.
  });

  return response;
}
