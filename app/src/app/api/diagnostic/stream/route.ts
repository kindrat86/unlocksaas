import { NextRequest, NextResponse } from "next/server";
import {
  assignBucket,
  deepAnalyzeUrlStream,
  isBiggestAttempt,
  isDiagnosticError,
  isRecentRevenue,
  isTimeSinceLaunch,
  normalizeUrl,
  type Bucket,
  type DeepDiagnosticResult,
  type SurveyAnswers,
} from "@/lib/diagnostic";
import {
  DIAGNOSTIC_STEP_LABELS,
  DIAGNOSTIC_STREAM_CONTENT_TYPE,
  type DiagnosticStreamEmit,
  type DiagnosticStreamEvent,
} from "@/lib/diagnostic-stream-types";
import { createAdminClient } from "@/lib/supabase/server";
import {
  subscribeToSoapOpera,
  type IdentityVariant,
} from "@/lib/soap-opera/subscribe";
import { localSubscriberId } from "@/lib/soap-opera/subscriber-link";
import type { DiagnosticResult as SoapDiagnosis } from "@/lib/soap-opera/emails";
import {
  verifyDeliverableEmail,
  isPreVerifiedSource,
} from "@/lib/email-verification";
import { writeFounderMemoryAfter } from "@/lib/founder-memory";
import {
  insertedDiagnosticLeadId,
  newDiagnosticLeadId,
} from "@/lib/diagnostic/persistence";
import { captureDiagnosticEmail } from "@/lib/analytics/email-capture";

/**
 * Streaming variant of /api/diagnostic.
 *
 * Same business logic as the synchronous endpoint (email validation, quota
 * gate, deep analysis, A/B identity assignment, soap-opera subscribe, lead
 * insert) — but every boundary emits an NDJSON step event so the client
 * renders visible reasoning instead of a faked timer.
 *
 *   POST /api/diagnostic/stream
 *   body:    { email, productUrl, referrer?, source?, survey? }
 *   200:     newline-delimited JSON; one event per line. Final event is
 *            { type: "done", id, alreadyUsed?, previousUrl?, label? } or
 *            { type: "error", message }.
 *   4xx:     A JSON envelope (not a stream) for early body-parse errors that
 *            arrive before we know we want to stream. Once streaming starts
 *            we never switch back to a JSON envelope — all subsequent
 *            failures are emitted as `{ type: "error", message }` events.
 *
 * The non-streaming /api/diagnostic stays for the Google-OAuth `/diagnostic/finish`
 * path, which doesn't have a visible reasoning panel and is best served by
 * the simpler synchronous shape.
 *
 * Runtime: Node.js (Anthropic SDK + Supabase). maxDuration: 90s.
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

type ParsedBody = {
  email: string;
  productUrl: string;
  source: string | null;
  survey: SurveyAnswers | null;
};

/**
 * Parse + validate the incoming JSON body. Returns either a parsed payload
 * or a NextResponse with a 400 envelope. We only stream once parsing has
 * succeeded — body-parse failures are too early in the request lifecycle
 * for an event stream to be the right surface.
 */
async function parseBody(
  req: NextRequest,
): Promise<{ ok: true; data: ParsedBody } | { ok: false; res: NextResponse }> {
  let raw: {
    email?: unknown;
    url?: unknown;
    productUrl?: unknown;
    referrer?: unknown;
    source?: unknown;
    survey?: unknown;
  };
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 },
      ),
    };
  }

  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const rawUrl =
    typeof raw.productUrl === "string"
      ? raw.productUrl.trim()
      : typeof raw.url === "string"
        ? raw.url.trim()
        : "";
  const referrer = typeof raw.referrer === "string" ? raw.referrer : "";
  const explicitSource =
    typeof raw.source === "string" && raw.source.trim()
      ? raw.source.trim()
      : null;

  let survey: SurveyAnswers | null = null;
  if (raw.survey && typeof raw.survey === "object") {
    const s = raw.survey as {
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
    return {
      ok: false,
      res: NextResponse.json(
        { error: "Enter a real email address." },
        { status: 400 },
      ),
    };
  }

  const parsedUrl = normalizeUrl(rawUrl);
  if (!parsedUrl) {
    return {
      ok: false,
      res: NextResponse.json(
        {
          error:
            "Paste your product URL — something like https://yourproduct.com.",
        },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true,
    data: {
      email,
      productUrl: parsedUrl.toString(),
      source: explicitSource ?? (referrer ? "referrer" : null),
      survey,
    },
  };
}

export async function POST(req: NextRequest) {
  const parsed = await parseBody(req);
  if (!parsed.ok) return parsed.res;

  const { email, productUrl, source, survey } = parsed.data;
  const userAgent = req.headers.get("user-agent");
  const ip = clientIp(req);

  // Combine the platform's request signal with a local controller so the
  // ReadableStream's `cancel` callback also aborts in-flight work (LLM call,
  // Supabase RPC) the moment the visitor closes the tab. Active CPU pricing
  // means we should release the worker as soon as nobody is listening.
  const abortCtl = new AbortController();
  const signal: AbortSignal =
    typeof AbortSignal !== "undefined" && "any" in AbortSignal
      ? AbortSignal.any([req.signal, abortCtl.signal])
      : abortCtl.signal;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      let closed = false;
      const send: DiagnosticStreamEmit = (event: DiagnosticStreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          closed = true;
        }
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      try {
        // ---- email deliverability ---------------------------------------
        // Google-OAuth signups skip this — Google has already proven the
        // address is real. Local emit so the user sees the gate, but only
        // when it actually runs.
        if (!isPreVerifiedSource(source)) {
          send({
            type: "step",
            id: "verify_email",
            label: DIAGNOSTIC_STEP_LABELS.verify_email,
            status: "start",
          });
          const deliverability = await verifyDeliverableEmail(email);
          if (!deliverability.ok) {
            const msg =
              deliverability.reason === "invalid_syntax"
                ? "Enter a real email address."
                : "That domain doesn't seem to receive email. Double-check the spelling.";
            send({ type: "error", message: msg });
            return;
          }
          send({
            type: "step",
            id: "verify_email",
            label: DIAGNOSTIC_STEP_LABELS.verify_email,
            status: "done",
          });
        }

        // ---- quota check ------------------------------------------------
        send({
          type: "step",
          id: "quota_check",
          label: DIAGNOSTIC_STEP_LABELS.quota_check,
          status: "start",
        });
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
            send({
              type: "step",
              id: "quota_check",
              label: DIAGNOSTIC_STEP_LABELS.quota_check,
              status: "done",
              detail: "Prior diagnosis found",
            });
            send({
              type: "done",
              id: prior.id,
              alreadyUsed: true,
              previousUrl: prior.product_url ?? null,
            });
            return;
          }
        }
        send({
          type: "step",
          id: "quota_check",
          label: DIAGNOSTIC_STEP_LABELS.quota_check,
          status: "done",
          detail: "First diagnosis on this address",
        });

        // ---- deep analysis (streams its own internal events) ------------
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
          diagnosis = await deepAnalyzeUrlStream(productUrl, send, signal);
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

        // ---- A/B identity (no user-visible step; instant) ---------------
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

        // ---- soap-opera subscribe (only for labelled outcomes) ----------
        let subscriberId: string | null = null;
        if (
          diagnosis.label === "wrong_person" ||
          diagnosis.label === "weak_offer" ||
          diagnosis.label === "weak_belief"
        ) {
          send({
            type: "step",
            id: "subscribe",
            label: DIAGNOSTIC_STEP_LABELS.subscribe,
            status: "start",
          });
          const outcome = await subscribeToSoapOpera({
            email,
            source: source ?? "free_diagnostic",
            diagnostic_result: diagnosis.label as SoapDiagnosis,
            identity_variant: identityVariant,
          });
          if (outcome.ok) {
            subscriberId = localSubscriberId(outcome.id);
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
                outcome.reason === "db_upsert_failed"
                  ? outcome.detail
                  : undefined,
            });
          }
          send({
            type: "step",
            id: "subscribe",
            label: DIAGNOSTIC_STEP_LABELS.subscribe,
            status: "done",
          });
        }

        // ---- bucket assignment ------------------------------------------
        const bucket: Bucket =
          diagnosis.label === "error"
            ? "error"
            : survey
              ? assignBucket(diagnosis.label, survey)
              : "customer_avoider";

        // ---- save -------------------------------------------------------
        send({
          type: "step",
          id: "save",
          label: DIAGNOSTIC_STEP_LABELS.save,
          status: "start",
        });
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

        const row = {
          id: newDiagnosticLeadId(),
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
          is_returning: false,
          analysis_detail: analysisDetail,
        };

        // `analysis_detail` was added by migration 20260518000010 but the
        // auto-generated database.types.ts has not been regenerated yet, so
        // the cast bypasses the column-name check. Same pattern used by the
        // synchronous /api/diagnostic route.
        const { data, error } = await supabase
          .from("diagnostic_leads")
          .insert(row as unknown as never)
          .select("id")
          .single();

        const insertedRowId = insertedDiagnosticLeadId(data);
        let rowId: string | null = insertedRowId;

        // Concurrent-first-submit race: the unique index on
        // (lower(email), product_url) fires 23505 and we read back the
        // winner's row.
        if (!rowId && (error as { code?: string } | null)?.code === "23505") {
          const { data: existing } = await supabase
            .from("diagnostic_leads")
            .select("id")
            .ilike("email", email)
            .eq("product_url", productUrl)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          rowId = existing?.id ?? null;
        }

        if (!rowId) {
          console.error("[diagnostic/stream] db insert failed", error);
          send({
            type: "error",
            message:
              "I read your page but could not save the result. Try again in a minute, or email me at maryan@unlocksaas.com.",
          });
          return;
        }

        // Primary conversion. Gated on the ID returned by this insert rather
        // than `rowId`: on the 23505 race above `rowId` is the winning
        // request's row, and that request fires its own capture. Awaited so
        // the event is out before the stream closes and the function freezes.
        if (insertedRowId) {
          await captureDiagnosticEmail({
            leadId: insertedRowId,
            email,
            productUrl,
            capture_surface: "stream",
          });
        }

        // Persistent founder memory – fire-and-forget. Mirrors the
        // non-streaming /api/diagnostic so streaming visitors get the same
        // downstream context (dashboard banner, chat sidebar) as visitors
        // on the synchronous path. Never blocks the stream; failures
        // logged inside the helper.
        if (!isDiagnosticError(diagnosis)) {
          writeFounderMemoryAfter({
            leadId: rowId,
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

        send({
          type: "step",
          id: "save",
          label: DIAGNOSTIC_STEP_LABELS.save,
          status: "done",
        });

        send({
          type: "done",
          id: rowId,
          label: diagnosis.label,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "unknown stream failure";
        console.error("[diagnostic/stream] caught", message, err);
        send({
          type: "error",
          message:
            "The engine fell over mid-read. Try once more, then email me at maryan@unlocksaas.com.",
        });
      } finally {
        finish();
      }
    },
    cancel() {
      // Client closed the connection. Abort downstream work so we stop
      // burning Active CPU minutes on a request nobody is reading.
      abortCtl.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": DIAGNOSTIC_STREAM_CONTENT_TYPE,
      "Cache-Control": "no-cache, no-transform",
      // Disable proxy buffering on platforms that respect this header.
      // Vercel doesn't buffer streaming responses, but the header makes the
      // intent explicit for any CDN that does.
      "X-Accel-Buffering": "no",
    },
  });
}
