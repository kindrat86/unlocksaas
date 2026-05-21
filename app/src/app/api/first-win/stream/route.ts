/**
 * SSE Route Handler for the First-Win agent.
 *
 * Auth: signed-in users only. The page at /first-win mounts only after the
 * /onboarding gate, so unauthed traffic should never reach this route. We
 * still guard with a 401 to fail loud rather than silently leak compute.
 *
 * Streaming protocol: standard server-sent events. Each event is a single
 * line of the form `data: {...}\n\n`. The client parses with EventSource or
 * (since we POST) with a manual ReadableStream reader – see
 * /first-win/first-win-client.tsx.
 *
 * Persistence: we accumulate the run output in memory while streaming, and
 * write to agent_runs once everything is in hand. That way a network blip
 * mid-stream does not leave a half-row in the table. The UI hydrates on
 * revisit via loadLatestFirstWinRun.
 *
 * Cost discipline: we honor `request.signal` so that if the founder closes
 * the tab mid-generation, the LLM call is aborted and we stop billing Active
 * CPU. Fluid Compute (the default on Vercel as of 2026) propagates the
 * cancellation into the Anthropic stream's controller.
 */
import { NextRequest } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  streamFirstWin,
  persistFirstWinRun,
  type FirstWinEvent,
  type FirstWinInput,
  type FirstWinOutput,
} from "@/lib/first-win";
import { getOrCreateProject } from "@/lib/onboarding";
import { loadStepOutput } from "@/lib/step-outputs";

interface DiagnosticRow {
  id: string;
  product_url: string;
  label: "wrong_person" | "weak_offer" | "weak_belief" | "error";
  analysis_detail: Record<string, unknown> | null;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return new Response(
      JSON.stringify({ error: "Not signed in" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  const user = authData.user;
  const userEmail = user.email ?? "";

  const admin = createAdminClient();

  // Resolve the founder's project (also creates it on first visit, so we
  // never 500 on a freshly-signed-up account).
  const project = await getOrCreateProject(user.id, userEmail);

  // Gather context: the most recent diagnostic the founder ran on their own
  // product, plus any Step 1 / Step 2 work they already finished. All of
  // these are optional – the agent has fallback prompting when they're missing.
  const diagnostic = await loadLatestDiagnostic(admin, userEmail);
  const [step1, step2] = await Promise.all([
    loadStepOutput(admin, project.id, "1"),
    loadStepOutput(admin, project.id, "2"),
  ]);

  const input: FirstWinInput = {
    diagnosticLeadId: diagnostic?.id ?? null,
    productUrl: diagnostic?.product_url ?? null,
    diagnosis: diagnostic?.label ?? null,
    diagnosticSummary: diagnostic?.analysis_detail
      ? JSON.stringify(diagnostic.analysis_detail).slice(0, 6000)
      : null,
    dreamCustomerText: step1?.output_text ?? null,
    offerText: step2?.output_text ?? null,
    founderEmail: userEmail,
  };

  const startedAt = Date.now();
  let finalOutput: FirstWinOutput | null = null;

  // Build the SSE stream. We pull events from the agent's async generator
  // and serialise them to the wire. Done/error events get persisted side-
  // effects before being forwarded.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: FirstWinEvent) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        );
      };

      // Send an initial comment so the client knows the connection is open
      // and intermediaries don't time out on a slow first byte.
      controller.enqueue(encoder.encode(`: connected\n\n`));

      try {
        for await (const event of streamFirstWin(input)) {
          // If the client aborted, stop pumping events.
          if (req.signal.aborted) {
            break;
          }
          if (event.type === "done") {
            finalOutput = event.output;
            // Persist before we tell the client we're done so the runId is
            // accurate. Persist failure is logged but does not break the
            // stream – the founder already has the drafts on screen.
            const runId = await persistFirstWinRun({
              adminClient: admin,
              projectId: project.id,
              input,
              output: event.output,
              durationMs: Date.now() - startedAt,
            });
            send({ ...event, runId });
          } else {
            send(event);
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "unknown stream error";
        console.error("[first-win/stream] generator error", { message });
        send({ type: "error", message });
      } finally {
        // Always close the stream so the client's reader resolves.
        controller.close();
        console.log("[first-win/stream] complete", {
          userId: user.id,
          projectId: project.id,
          aborted: req.signal.aborted,
          haveOutput: finalOutput !== null,
          durationMs: Date.now() - startedAt,
        });
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // X-Accel-Buffering hint for any intermediate proxy that does buffer
      // by default – Vercel doesn't buffer streamed responses but the header
      // is harmless and helpful for any self-hosted preview.
      "X-Accel-Buffering": "no",
    },
  });
}

async function loadLatestDiagnostic(
  admin: ReturnType<typeof createAdminClient>,
  email: string
): Promise<DiagnosticRow | null> {
  if (!email) return null;
  // database.types.ts has not been regenerated since the analysis_detail
  // column landed; cast through the loose client – same pattern as
  // /api/diagnostic/route.ts.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any)
    .from("diagnostic_leads")
    .select("id, product_url, label, analysis_detail")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return data as DiagnosticRow;
}
