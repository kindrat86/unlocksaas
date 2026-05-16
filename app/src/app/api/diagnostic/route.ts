import { NextRequest, NextResponse } from "next/server";
import {
  classifyUrl,
  isDiagnosticError,
  normalizeUrl,
  type DiagnosticResult,
} from "@/lib/diagnostic";
import { createAdminClient } from "@/lib/supabase/server";
import {
  subscribeToSoapOpera,
  type IdentityVariant,
} from "@/lib/soap-opera/subscribe";
import type { DiagnosticResult as SoapDiagnosis } from "@/lib/soap-opera/emails";

/**
 * Free Diagnostic submission endpoint.
 *
 *   POST /api/diagnostic
 *   body: { email, productUrl, referrer?, source? }
 *   200:  { id: <uuid> }                — diagnostic_leads.id; the form routes
 *                                         to /diagnostic/result?id=<id>.
 *   4xx:  { error: <reluctant-hero> }
 *
 * Flow:
 *   1. Validate email + URL.
 *   2. Run classifyUrl() — fetch + strip + Claude label. Any expected failure
 *      path (invalid URL, blocked host, fetch failure, empty page, engine
 *      failure) is caught and persisted as label='error' so the funnel never
 *      dead-ends and we have an audit trail.
 *   3. Upsert into diagnostic_leads keyed on (lower(email), product_url). A
 *      founder re-diagnosing the same URL updates their row; a different URL
 *      from the same email gets a new row.
 *   4. Return the row id so the result page can read the full diagnosis.
 *
 * The classification is synchronous so the result page is renderable the
 * moment the client navigates. Tradeoff: the form sits on "Running the
 * diagnostic…" for the duration of the Claude call (typically 4–8 s). That
 * is the correct UX for "the engine is reading your page" — the verb
 * describes the wait honestly. A background-job + polling architecture would
 * be over-engineered for v1.
 *
 * Runtime: Node.js (Anthropic SDK + Supabase need full Node).
 * maxDuration: 60 s (page fetch ≤8 s + Claude ≤30 s typical + margin).
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip");
}

export async function POST(req: NextRequest) {
  let body: {
    email?: unknown;
    url?: unknown;
    productUrl?: unknown;
    referrer?: unknown;
    source?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    console.warn("[diagnostic] bad JSON body");
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const rawUrl =
    typeof body.productUrl === "string"
      ? body.productUrl.trim()
      : typeof body.url === "string"
        ? body.url.trim()
        : "";
  const referrer = typeof body.referrer === "string" ? body.referrer : "";
  const explicitSource =
    typeof body.source === "string" && body.source.trim()
      ? body.source.trim()
      : null;

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a real email address." },
      { status: 400 },
    );
  }

  const parsedUrl = normalizeUrl(rawUrl);
  if (!parsedUrl) {
    return NextResponse.json(
      {
        error:
          "Paste your product URL — something like https://yourproduct.com.",
      },
      { status: 400 },
    );
  }
  const productUrl = parsedUrl.toString();
  const source = explicitSource ?? (referrer ? "referrer" : null);

  // Classify. classifyUrl throws DiagnosticError on expected failures; anything
  // else is logged and turned into an "error" row so the visitor still lands
  // on a page that tells them what to do next.
  let diagnosis:
    | DiagnosticResult
    | {
        label: "error";
        headline: string;
        explanation: string;
        evidence: string;
        nextStep: string;
      };
  try {
    diagnosis = await classifyUrl(productUrl);
  } catch (err) {
    if (isDiagnosticError(err)) {
      diagnosis = {
        label: "error",
        headline: "I could not finish the read.",
        explanation: err.message,
        evidence: `kind=${err.kind}`,
        nextStep: "Start the Machine for $1",
      };
    } else {
      const message =
        err instanceof Error ? err.message : "unknown engine failure";
      console.error("[diagnostic] unexpected error", message, err);
      diagnosis = {
        label: "error",
        headline: "Something I did not plan for went wrong.",
        explanation:
          "The engine choked in a way I have not seen before. The lead is captured. Try again in a minute, or email me at maryan@unlocksaas.com.",
        evidence: `unexpected: ${message}`,
        nextStep: "Start the Machine for $1",
      };
    }
  }

  const supabase = createAdminClient();
  const userAgent = req.headers.get("user-agent");
  const ip = clientIp(req);

  // A/B split from workbook 05 §7 / 09 §3. Same lead, same variant across
  // surfaces — we look up an existing subscriber by email and reuse their
  // variant; new leads coin-flip 50/50.
  let identityVariant: IdentityVariant =
    Math.random() < 0.5 ? "verified_builder" : "paid_builder";
  {
    const { data: existing } = await supabase
      .from("soap_opera_subscribers")
      .select("identity_variant")
      .eq("email", email)
      .maybeSingle();
    const prev = (existing as { identity_variant?: string } | null)
      ?.identity_variant;
    if (prev === "verified_builder" || prev === "paid_builder") {
      identityVariant = prev;
    }
  }

  // Subscribe to the 5-email Soap Opera sequence and fire Email 1 (Day 0).
  // Skipped when the diagnostic itself failed — sending "Your diagnosis came
  // back: X" when there was no real diagnosis would be a lie. The lead is
  // still captured in diagnostic_leads below for manual retargeting.
  //
  // Only the three labelled outcomes map to soap_opera_subscribers.diagnostic_result
  // (the column has a CHECK constraint enforcing this set or null).
  let subscriberId: string | null = null;
  if (
    diagnosis.label === "wrong_person" ||
    diagnosis.label === "weak_offer" ||
    diagnosis.label === "weak_belief"
  ) {
    const outcome = await subscribeToSoapOpera({
      email,
      source: source ?? "free_diagnostic",
      diagnostic_result: diagnosis.label as SoapDiagnosis,
      identity_variant: identityVariant,
    });
    if (outcome.ok) {
      subscriberId = outcome.id;
    } else if (outcome.reason === "day_0_send_failed") {
      // The row exists; we just couldn't send Email 1. Set the FK so
      // diagnostic_leads links correctly, and rely on operator retry. The
      // cron will NOT pick this up (cron filters emails_sent >= 1).
      subscriberId = outcome.id;
      console.error("[diagnostic] day-0 send failed", {
        email,
        detail: outcome.detail,
      });
    } else {
      // invalid_email shouldn't happen here (we validated upstream).
      // db_upsert_failed: don't fail the whole request — diagnostic_leads
      // is the higher-value side.
      console.error("[diagnostic] soap-opera subscribe failed", {
        reason: outcome.reason,
        detail:
          outcome.reason === "db_upsert_failed" ? outcome.detail : undefined,
      });
    }
  }

  // Persist the labeled diagnosis. Service role bypasses RLS; the result
  // page reads back by id (also service role) and renders.
  const { data, error } = await supabase
    .from("diagnostic_leads")
    .upsert(
      {
        email,
        product_url: productUrl,
        label: diagnosis.label,
        headline: diagnosis.headline,
        explanation: diagnosis.explanation,
        evidence: diagnosis.evidence,
        next_step: diagnosis.nextStep,
        source,
        identity_variant: identityVariant,
        subscriber_id: subscriberId,
        user_agent: userAgent,
        ip,
      },
      { onConflict: "lower(email),product_url" },
    )
    .select("id")
    .single();

  if (error || !data) {
    console.error("[diagnostic] db upsert failed", error);
    return NextResponse.json(
      {
        error:
          "I read your page but could not save the result. Try again in a minute, or email me at maryan@unlocksaas.com.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id });
}
