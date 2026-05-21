import { NextRequest, NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import {
  assignBucket,
  deepAnalyzeUrl,
  isBiggestAttempt,
  isBiggestFear,
  isDiagnosticError,
  isHoursPerWeek,
  isPrimaryGoal,
  isRecentRevenue,
  isTimeSinceLaunch,
  normalizeUrl,
  type Bucket,
  type DeepDiagnosticResult,
  type SurveyAnswers,
} from "@/lib/diagnostic";
import { createAdminClient } from "@/lib/supabase/server";
import {
  subscribeToSoapOpera,
  type IdentityVariant,
} from "@/lib/soap-opera/subscribe";
import type { DiagnosticResult as SoapDiagnosis } from "@/lib/soap-opera/emails";
import {
  verifyDeliverableEmail,
  isPreVerifiedSource,
} from "@/lib/email-verification";
import { writeFounderMemoryAfter } from "@/lib/founder-memory";

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
 *   2. Run deepAnalyzeUrl() — fetch + strip + Claude deep-analysis. Returns the
 *      v1 fields (label, headline, explanation, evidence, nextStep) PLUS the
 *      v2 payload (three-axis scorecard, rewrites, 30-day plan, competitors,
 *      strengths). Any expected failure path is caught and persisted as
 *      label='error' so the funnel never dead-ends and we have an audit trail.
 *   3. Insert into diagnostic_leads. The quota gate above intercepts every
 *      repeat email; this is effectively-an-insert. Both the v1 columns and
 *      the v2 `analysis_detail` JSONB are written.
 *   4. Return the row id so the result page can read the full diagnosis.
 *
 * The analysis is synchronous so the result page is renderable the moment the
 * client navigates. Tradeoff: the form sits on "Running the diagnostic…" for
 * ~30-45 s while Claude reads the page and writes the teardown. The squeeze
 * sets a 90-second expectation, so this fits within the promise. A background-
 * job + polling architecture would be over-engineered for v1.
 *
 * Runtime: Node.js (Anthropic SDK + Supabase need full Node).
 * maxDuration: 90 s (page fetch ≤8 s + deep Claude call ≤60 s typical + margin).
 */

export const maxDuration = 90;

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
  // BotID protection: blocks confirmed bot traffic (LLM-scraping / Anthropic
  // cost prevention). Fail-open: any verification error lets the request
  // through so a BotID outage never blocks a real founder's diagnostic.
  try {
    const botCheck = await checkBotId();
    if (botCheck.isBot) {
      return NextResponse.json({ error: "bot_detected" }, { status: 403 });
    }
  } catch (err) {
    console.warn("[botid] diagnostic verification failed, proceeding fail-open", err);
  }

  let body: {
    email?: unknown;
    url?: unknown;
    productUrl?: unknown;
    referrer?: unknown;
    source?: unknown;
    survey?: unknown;
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

  // Survey answers (Brunson Survey Funnel — DCS Secret 15).
  //
  // The legacy three fields (time_since_launch, recent_revenue, biggest_attempt)
  // are still required to populate the `survey` block — they drive the bucket
  // assignment. The 2026-05-21 quiz-funnel expansion adds three more fields
  // (primary_goal, hours_per_week, biggest_fear) which are OPTIONAL at the API
  // edge so:
  //   - legacy callers (the Google OAuth round-trip handed off pre-expansion
  //     leads, or any external script hitting /api/diagnostic) keep working
  //     unchanged
  //   - the variant resolver in lib/diagnostic-variants.ts gracefully degrades
  //     to "default" headline / "sober" tone / "default" plan emphasis when
  //     a field is missing
  let survey: SurveyAnswers | null = null;
  if (body.survey && typeof body.survey === "object") {
    const s = body.survey as {
      time_since_launch?: unknown;
      recent_revenue?: unknown;
      biggest_attempt?: unknown;
      primary_goal?: unknown;
      hours_per_week?: unknown;
      biggest_fear?: unknown;
    };
    if (
      isTimeSinceLaunch(s.time_since_launch) &&
      isRecentRevenue(s.recent_revenue) &&
      isBiggestAttempt(s.biggest_attempt)
    ) {
      survey = {
        time_since_launch: s.time_since_launch,
        recent_revenue: s.recent_revenue,
        biggest_attempt: s.biggest_attempt,
        primary_goal: isPrimaryGoal(s.primary_goal) ? s.primary_goal : null,
        hours_per_week: isHoursPerWeek(s.hours_per_week)
          ? s.hours_per_week
          : null,
        biggest_fear: isBiggestFear(s.biggest_fear) ? s.biggest_fear : null,
      };
    }
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a real email address." },
      { status: 400 },
    );
  }

  // MX gate: catches typo'd domains (gnail.com, hotmial.com) before we spend
  // an Anthropic call analysing their product URL. Skipped for Google OAuth
  // sign-ins – Google has already proven the address is real.
  if (!isPreVerifiedSource(explicitSource)) {
    const deliverability = await verifyDeliverableEmail(email);
    if (!deliverability.ok) {
      const msg =
        deliverability.reason === "invalid_syntax"
          ? "Enter a real email address."
          : "That domain doesn't seem to receive email. Double-check the spelling.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
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

  // One-free-report-per-email quota gate. Before spending an Anthropic call,
  // check whether this email has ever been diagnosed. If yes, return the
  // existing row id with `already_used: true` so the client can show the
  // upsell panel (Starter primary + Core secondary) without re-classifying.
  const supabase = createAdminClient();
  {
    const { data: prior } = await supabase
      .from("diagnostic_leads")
      .select("id, product_url")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (prior?.id) {
      return NextResponse.json({
        id: prior.id,
        already_used: true,
        previous_url: prior.product_url,
      });
    }
  }

  // Deep-analyze. deepAnalyzeUrl throws DiagnosticError on expected failures;
  // anything else is logged and turned into an "error" row so the visitor
  // still lands on a page that tells them what to do next. The "error" branch
  // returns the v1 shape (no analysis_detail); the result page renders the
  // engine-error bridge for those.
  let diagnosis:
    | DeepDiagnosticResult
    | {
        label: "error";
        headline: string;
        explanation: string;
        evidence: string;
        nextStep: string;
      };
  try {
    // Quiz expansion (2026-05-21): pass the survey context so the LLM can
    // tune plan_30_day deliverables to match the variant preface the result
    // page will render. When `survey` is null (legacy 2-field caller) the
    // helper returns "" and the prompt is byte-identical to the pre-expansion
    // version.
    diagnosis = await deepAnalyzeUrl(productUrl, survey);
  } catch (err) {
    if (isDiagnosticError(err)) {
      diagnosis = {
        label: "error",
        headline: "I could not finish the read.",
        explanation: err.message,
        evidence: `kind=${err.kind}`,
        nextStep: "Start the Playbook for $1",
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
        nextStep: "Start the Playbook for $1",
      };
    }
  }

  // Carve the deep-analysis payload out for JSONB storage. The five top-level
  // v1 fields stay in their own columns for backward compat with old rows;
  // the rest of the structured report lives in analysis_detail.
  const analysisDetail =
    diagnosis.label === "error"
      ? null
      : {
          product_snapshot: diagnosis.product_snapshot,
          scores: diagnosis.scores,
          rewrites: diagnosis.rewrites,
          plan_30_day: diagnosis.plan_30_day,
          competitors: diagnosis.competitors,
          strengths: diagnosis.strengths,
        };

  const userAgent = req.headers.get("user-agent");
  const ip = clientIp(req);

  // Compute the Brunson Survey Funnel bucket. When the survey is missing
  // (legacy 2-field caller), the bucket falls back to "customer_avoider" for
  // labeled rows and "error" for error rows — the result page treats this
  // as the Prospect Bridge default.
  const bucket: Bucket =
    diagnosis.label === "error"
      ? "error"
      : survey
        ? assignBucket(diagnosis.label, survey)
        : "customer_avoider";

  // is_returning is now always false on insert — the quota gate above
  // intercepts every repeat email before we reach this point. The column
  // remains in schema for historical rows and for the Customer Bridge UX on
  // the result page if we ever loosen the gate.
  const isReturning = false;

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

  // Subscribe to the Soap Opera Sequence and fire E1 (Day 0). Sequence
  // shape is 3 spine emails (day 0/2/4) + up to one behavioral branch
  // (soft_sell or objection_handler) on day 6 gated on E3 engagement.
  // Decision: strategy/decisions/sos-3-spine-2-branch.md
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
      // outcome.day_0_send === 'deferred_pending_confirmation' for email signups
      // (Google OAuth path returns 'ok' and Day 0 has already fired). Either
      // way the row exists and the FK is valid.
    } else if (outcome.reason === "day_0_send_failed") {
      // The row exists; we just couldn't send Email 1. Set the FK so
      // diagnostic_leads links correctly, and rely on operator retry. The
      // cron will NOT pick this up (cron filters emails_sent >= 1).
      subscriberId = outcome.id;
      console.error("[diagnostic] day-0 send failed", {
        email,
        detail: outcome.detail,
      });
    } else if (outcome.reason === "confirmation_send_failed") {
      // Row is pending_confirmation but the confirm email didn't go out. Keep
      // the FK so we can resend manually; user sees the diagnostic anyway.
      subscriberId = outcome.id;
      console.error("[diagnostic] confirmation send failed", {
        email,
        detail: outcome.detail,
      });
    } else {
      // invalid_email / undeliverable_email shouldn't happen here (we
      // validated upstream). db_upsert_failed: don't fail the whole request –
      // diagnostic_leads is the higher-value side.
      console.error("[diagnostic] soap-opera subscribe failed", {
        reason: outcome.reason,
        detail:
          outcome.reason === "db_upsert_failed" ? outcome.detail : undefined,
      });
    }
  }

  // Persist the labeled diagnosis. Service role bypasses RLS; the result
  // page reads back by id (also service role) and renders.
  //
  // We insert (not upsert) because the quota gate above intercepts every
  // repeat email before we get here. PostgREST's `on_conflict` parameter
  // cannot reference the expression-based unique index on
  // (lower(email), product_url) — it only accepts plain column identifiers
  // — so a real upsert would 400. On the rare concurrent-first-submit race
  // we catch the unique-violation (23505) and read back the winner's row.
  const row = {
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
    time_since_launch: survey?.time_since_launch ?? null,
    recent_revenue: survey?.recent_revenue ?? null,
    biggest_attempt: survey?.biggest_attempt ?? null,
    // Quiz expansion (2026-05-21). Columns added by migration
    // 20260521000020_diagnostic_quiz_expansion.sql. Nullable on the DB side so
    // legacy rows (and the legacy 3-field API caller) keep working unchanged;
    // PostgREST will write NULL for any field the caller did not supply.
    primary_goal: survey?.primary_goal ?? null,
    hours_per_week: survey?.hours_per_week ?? null,
    biggest_fear: survey?.biggest_fear ?? null,
    bucket,
    is_returning: isReturning,
    analysis_detail: analysisDetail,
  };

  // `analysis_detail` was added by migration 20260518000010 but the auto-
  // generated database.types.ts has not been regenerated yet, so the cast
  // bypasses the column-name check at the boundary. Same pattern used by
  // the result page on the read side.
  const { data, error } = await supabase
    .from("diagnostic_leads")
    .insert(row as unknown as never)
    .select("id")
    .single();

  if (data?.id) {
    // Persistent founder memory – fire-and-forget. Hydrates founder_memory
    // from the deep-analysis findings so every downstream surface (dashboard,
    // onboarding, future chat sidebar) reads from the same blob instead of
    // re-asking intake. Never blocks the response; failures are logged.
    if (diagnosis.label !== "error") {
      writeFounderMemoryAfter({
        leadId: data.id as string,
        email,
        findings: diagnosis as DeepDiagnosticResult,
        productUrl,
        stage: survey
          ? {
              time_since_launch: survey.time_since_launch,
              recent_revenue: survey.recent_revenue,
              biggest_attempt: survey.biggest_attempt,
            }
          : null,
        bucket: bucket === "error" ? null : bucket,
      });
    }
    return NextResponse.json({ id: data.id });
  }

  if ((error as { code?: string } | null)?.code === "23505") {
    const { data: existing } = await supabase
      .from("diagnostic_leads")
      .select("id")
      .ilike("email", email)
      .eq("product_url", productUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing?.id) {
      return NextResponse.json({ id: existing.id });
    }
  }

  console.error("[diagnostic] db insert failed", error);
  return NextResponse.json(
    {
      error:
        "I read your page but could not save the result. Try again in a minute, or email me at maryan@unlocksaas.com.",
    },
    { status: 500 },
  );
}
