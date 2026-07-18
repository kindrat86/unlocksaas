import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { submitApplication, type RawSubmission } from "@/lib/apply/submit";
import { REF_COOKIE } from "@/lib/affiliate";
import { readIdentityFromCookies } from "@/lib/ab";
import { guardPublicForm, honeypotTripped } from "@/lib/form-guard";

export const maxDuration = 60;

/**
 * POST /api/apply
 *
 * Submit the high-ticket Sprint application. Body shape matches RawSubmission
 * minus ref_code / identity_variant which are read server-side from cookies.
 *
 * Response shape (success):
 *   { ok: true, qualification: "qualified" | "not_yet", redirect: "/apply/..." }
 *
 * The client form follows the `redirect` field after the POST resolves.
 */
export async function POST(req: NextRequest) {
  // Rate limit + BotID, same stack as /api/checkout — an accepted
  // application triggers operator notification email.
  const guarded = await guardPublicForm(req, "apply");
  if (guarded) return guarded;

  let json: Record<string, unknown>;
  try {
    json = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot tripped: plausible fake response, nothing persisted or sent.
  if (honeypotTripped(json)) {
    return NextResponse.json({
      ok: true,
      qualification: "not_yet",
      redirect: "/apply/not-yet",
    });
  }

  // Read attribution cookies server-side. Cookie reads in route handlers are
  // safe and do not require fallback.
  let refCode: string | null = null;
  try {
    const cookieStore = await cookies();
    const refValue = cookieStore.get(REF_COOKIE)?.value;
    if (refValue && /^[a-z0-9]{6,16}$/i.test(refValue)) {
      refCode = refValue.toLowerCase();
    }
  } catch (err) {
    console.warn(
      "[apply] could not read ref cookie:",
      err instanceof Error ? err.message : err
    );
  }

  const identityVariant = await readIdentityFromCookies();

  const raw: RawSubmission = {
    email: json.email,
    first_name: json.first_name,
    product_url: json.product_url,
    mrr_band: json.mrr_band,
    biggest_blocker: json.biggest_blocker,
    why_now: json.why_now,
    has_budget: json.has_budget,
    preferred_tier: json.preferred_tier,
    calendar_preference: json.calendar_preference,
    source: json.source,
    ref_code: refCode,
    identity_variant: identityVariant,
  };

  const outcome = await submitApplication(raw);

  if (outcome.ok) {
    return NextResponse.json({
      ok: true,
      qualification: outcome.qualification,
      redirect:
        outcome.qualification === "qualified"
          ? "/apply/qualified"
          : "/apply/not-yet",
    });
  }

  const status = outcome.error === "db_upsert_failed" ? 500 : 400;
  return NextResponse.json(
    { ok: false, error: outcome.error, detail: outcome.detail },
    { status }
  );
}
