/**
 * /api/diagnostic/stream — SSE streaming diagnostic endpoint.
 *
 * Same inputs and business logic as /api/diagnostic, but streams Server-Sent
 * Events so the browser can display visible AI reasoning in real-time while
 * Claude analyzes the page. The "visible agentic reasoning" 2026 UX pattern.
 *
 * Event types emitted:
 *   { type: "step",  text: string }   — progress label (non-AI, discrete)
 *   { type: "reason", text: string }  — streaming reasoning token (AI prose)
 *   { type: "done",  id: string, already_used?: boolean, previous_url?: string }
 *   { type: "error", message: string }
 *
 * The "reason" events are the prose preamble Claude emits before the JSON
 * separator. The client displays them; the JSON itself is never sent over SSE
 * (it is parsed server-side and saved to the DB). On "done", the client
 * navigates to /diagnostic/result?id=<id>.
 *
 * Runtime: Node.js (Anthropic SDK requires full Node). maxDuration: 90s.
 */

import { NextRequest } from "next/server";
import {
  deepAnalyzeUrlStream,
  isDiagnosticError,
  isBiggestAttempt,
  isRecentRevenue,
  isTimeSinceLaunch,
  normalizeUrl,
  assignBucket,
  type DeepDiagnosticResult,
  type SurveyAnswers,
  type Bucket,
  type DiagnosticProgressEvent,
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
  // -------------------------------------------------------------------------
  // Parse + basic-validate the request body synchronously before starting the
  // SSE stream. If validation fails we return a plain JSON error (no SSE).
  // -------------------------------------------------------------------------
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
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
    return new Response(
      JSON.stringify({ error: "Enter a real email address." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const parsedUrl = normalizeUrl(rawUrl);
  if (!parsedUrl) {
    return new Response(
      JSON.stringify({
        error:
          "Paste your product URL — something like https://yourproduct.com.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const productUrl = parsedUrl.toString();
  const source = explicitSource ?? (referrer ? "referrer" : null);
  const userAgent = req.headers.get("user-agent");
  const ip = clientIp(req);

  // -------------------------------------------------------------------------
  // Set up the SSE stream. All async work happens inside the IIFE that runs
  // concurrently with returning the response to the client.
  // -------------------------------------------------------------------------
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  async function emit(event: Record<string, unknown>): Promise<void> {
    try {
      await writer.write(
        encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
      );
    } catch {
      // Client disconnected -- swallow write errors.
    }
  }

  // Kick off all async work. The response starts streaming immediately.
  void (async () => {
    try {
      const supabase = createAdminClient();

      // Email deliverability check (skipped for pre-verified sources like OAuth).
      if (!isPreVerifiedSource(source)) {
        await emit({ type: "step", text: "Verifying email..." });
        const deliverability = await verifyDeliverableEmail(email);
        if (!deliverability.ok) {
          const msg =
            deliverability.reason === "invalid_syntax"
              ? "Enter a real email address."
              : "That domain does not seem to receive email. Double-check the spelling.";
          await emit({ type: "error", message: msg });
          return;
        }
      }

      // Quota gate -- one free report per email.
      await emit({ type: "step", text: "Checking quota..." });
      const { data: prior } = await supabase
        .from("diagnostic_leads")
        .select("id, product_url")
        .ilike("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prior?.id) {
        await emit({
          type: "done",
          id: prior.id,
          already_used: true,
          previous_url: prior.product_url ?? null,
        });
        return;
      }

      // Deep analysis with streaming progress.
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
        diagnosis = await deepAnalyzeUrlStream(
          productUrl,
          async (event: DiagnosticProgressEvent) => {
            await emit(event);
          },
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
          console.error("[diagnostic/stream] unexpected error", message);
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

      // Save to DB.
      await emit({ type: "step", text: "Saving your diagnosis..." });

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

      // Soap Opera subscription.
      let subscriberId: string | null = null;
      if (
        diagnosis.label === "wrong_person" ||
        diagnosis.label === "weak_offer" ||
        diagnosis.label === "weak_belief"
      ) {
        let identityVariant: IdentityVariant =
          Math.random() < 0.5 ? "verified_builder" : "paid_builder";
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

        const outcome = await subscribeToSoapOpera({
          email,
          source: source ?? "free_diagnostic",
          diagnostic_result: diagnosis.label as SoapDiagnosis,
          identity_variant: identityVariant,
        });
        if (outcome.ok) {
          subscriberId = outcome.id;
        } else if (
          outcome.reason === "day_0_send_failed" ||
          outcome.reason === "confirmation_send_failed"
        ) {
          subscriberId = outcome.id;
        }
      }

      // DB insert.
      const row = {
        email,
        product_url: productUrl,
        label: diagnosis.label,
        headline: diagnosis.headline,
        explanation: diagnosis.explanation,
        evidence: diagnosis.evidence,
        next_step: diagnosis.nextStep,
        source,
        subscriber_id: subscriberId,
        user_agent: userAgent,
        ip,
        time_since_launch: survey?.time_since_launch ?? null,
        recent_revenue: survey?.recent_revenue ?? null,
        biggest_attempt: survey?.biggest_attempt ?? null,
        bucket,
        is_returning: false,
        analysis_detail: analysisDetail,
      };

      const { data, error } = await supabase
        .from("diagnostic_leads")
        .insert(row as unknown as never)
        .select("id")
        .single();

      if (data?.id) {
        await emit({ type: "done", id: data.id });
        return;
      }

      // Concurrent-first-submit race: read the winner's row.
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
          await emit({ type: "done", id: existing.id });
          return;
        }
      }

      console.error("[diagnostic/stream] db insert failed", error);
      await emit({
        type: "error",
        message:
          "I read your page but could not save the result. Try again in a minute, or email me at maryan@unlocksaas.com.",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[diagnostic/stream] unhandled error", message);
      await emit({
        type: "error",
        message:
          "Something went sideways. Try again in a minute, or email me at maryan@unlocksaas.com.",
      });
    } finally {
      try {
        await writer.close();
      } catch {
        // Already closed -- ignore.
      }
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
