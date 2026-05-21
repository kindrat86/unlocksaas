import { NextRequest } from "next/server";
import {
  assignBucket,
  deepAnalyzeUrlStreaming,
  isBiggestAttempt,
  isDiagnosticError,
  isRecentRevenue,
  isTimeSinceLaunch,
  normalizeUrl,
  type Bucket,
  type DeepDiagnosticResult,
  type StreamingPhase,
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

/**
 * Streaming Free Diagnostic endpoint — visible-reasoning UX.
 *
 *   POST /api/diagnostic/stream
 *   body: { email, productUrl, referrer?, source?, survey? }
 *   200:  text/event-stream-ish NDJSON, one JSON object per line. Phases:
 *           { phase: "fetching", host }
 *           { phase: "parsed", chars }
 *           { phase: "analyzing" }
 *           { phase: "thinking", delta }   (many)
 *           { phase: "compiling" }
 *           { phase: "saving" }
 *           { phase: "done", id, redirectTo }
 *           { phase: "already_used", id, previousUrl }
 *           { phase: "error", message }
 *
 * The synchronous /api/diagnostic endpoint is preserved as the no-JS fallback
 * and the Google-OAuth /diagnostic/finish hand-off. This route is only called
 * by the squeeze form when JavaScript is available.
 *
 * 2026 GEO/AI-features rationale: 72.4% of ChatGPT-cited pages have a direct
 * answer in the first 60 words; visible agentic reasoning is the 2026 wow
 * moment. Replacing a 30-45 s spinner with streamed founder-facing reasoning
 * is the activation lift.
 *
 * Runtime: Node.js (Anthropic SDK + Supabase need full Node).
 * maxDuration: 90 s (matches /api/diagnostic).
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

type StreamEvent =
  | StreamingPhase
  | { phase: "saving" }
  | { phase: "done"; id: string; redirectTo: string }
  | {
      phase: "already_used";
      id: string;
      previousUrl: string | null;
      redirectTo: string;
    }
  | { phase: "error"; message: string };

export async function POST(req: NextRequest) {
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
    return ndjsonError("Invalid JSON body.", 400);
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

  let survey: SurveyAnswers | null = null;
  if (body.survey && typeof body.survey === "object") {
    const s = body.survey as {
      time_since_launch?: unknown;
      recent_revenue?: unknown;
      biggest_attempt?: unknown;
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
      };
    }
  }

  if (!EMAIL_RE.test(email)) {
    return ndjsonError("Enter a real email address.", 400);
  }

  if (!isPreVerifiedSource(explicitSource)) {
    const deliverability = await verifyDeliverableEmail(email);
    if (!deliverability.ok) {
      const msg =
        deliverability.reason === "invalid_syntax"
          ? "Enter a real email address."
          : "That domain doesn't seem to receive email. Double-check the spelling.";
      return ndjsonError(msg, 400);
    }
  }

  const parsedUrl = normalizeUrl(rawUrl);
  if (!parsedUrl) {
    return ndjsonError(
      "Paste your product URL — something like https://yourproduct.com.",
      400,
    );
  }
  const productUrl = parsedUrl.toString();
  const source = explicitSource ?? (referrer ? "referrer" : null);

  // One-free-report-per-email quota gate. Mirror the sync route's behavior:
  // if this email has a prior row, emit a single 'already_used' event with
  // the redirect target and close. No new Anthropic call.
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
      return ndjsonOnce({
        phase: "already_used",
        id: prior.id,
        previousUrl: prior.product_url ?? null,
        redirectTo: `/diagnostic/result?id=${prior.id}`,
      });
    }
  }

  // Capture request metadata before we hand control to the streaming body.
  const userAgent = req.headers.get("user-agent");
  const ip = clientIp(req);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // Controller closed by the client (navigation away). Swallow.
        }
      };

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
        diagnosis = await deepAnalyzeUrlStreaming(productUrl, (event) =>
          send(event),
        );
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
          console.error(
            "[diagnostic/stream] unexpected error",
            message,
            err,
          );
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

      send({ phase: "saving" });

      // Persist + soap-opera subscribe — same logic as /api/diagnostic.
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

      const bucket: Bucket =
        diagnosis.label === "error"
          ? "error"
          : survey
            ? assignBucket(diagnosis.label, survey)
            : "customer_avoider";

      const isReturning = false;

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
          subscriberId = outcome.id;
          console.error("[diagnostic/stream] day-0 send failed", {
            email,
            detail: outcome.detail,
          });
        } else if (outcome.reason === "confirmation_send_failed") {
          subscriberId = outcome.id;
          console.error("[diagnostic/stream] confirmation send failed", {
            email,
            detail: outcome.detail,
          });
        } else {
          console.error("[diagnostic/stream] soap-opera subscribe failed", {
            reason: outcome.reason,
            detail:
              outcome.reason === "db_upsert_failed" ? outcome.detail : undefined,
          });
        }
      }

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
        bucket,
        is_returning: isReturning,
        analysis_detail: analysisDetail,
      };

      const { data, error } = await supabase
        .from("diagnostic_leads")
        .insert(row as unknown as never)
        .select("id")
        .single();

      let finalId: string | null = data?.id ?? null;

      if (!finalId && (error as { code?: string } | null)?.code === "23505") {
        const { data: existing } = await supabase
          .from("diagnostic_leads")
          .select("id")
          .ilike("email", email)
          .eq("product_url", productUrl)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (existing?.id) finalId = existing.id;
      }

      if (finalId) {
        send({
          phase: "done",
          id: finalId,
          redirectTo: `/diagnostic/result?id=${finalId}`,
        });
      } else {
        console.error("[diagnostic/stream] db insert failed", error);
        send({
          phase: "error",
          message:
            "I read your page but could not save the result. Try again in a minute, or email me at maryan@unlocksaas.com.",
        });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function ndjsonError(message: string, status: number): Response {
  const line = JSON.stringify({ phase: "error", message }) + "\n";
  return new Response(line, {
    status,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function ndjsonOnce(event: StreamEvent): Response {
  const line = JSON.stringify(event) + "\n";
  return new Response(line, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
