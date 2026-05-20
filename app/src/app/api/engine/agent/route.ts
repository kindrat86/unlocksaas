import { NextRequest, NextResponse } from "next/server";
import {
  AGENT_KINDS,
  loadMostRecentAgentRuns,
  loadProjectAgentContext,
  persistAgentRun,
  runOfferScorer,
  runOutreachDrafter,
  runPageRewriter,
  type AgentKind,
} from "@/lib/agents";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { getProjectIdForUser } from "@/lib/step-outputs";

/**
 * Hydrate the most-recent run per agent kind for the signed-in user's
 * project. Step pages call this on mount so a previous offer-score or
 * page-rewrite re-renders without forcing a re-run.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ runs: {} }, { status: 200 });
  }
  const admin = createAdminClient();
  const projectId = await getProjectIdForUser(admin, user.id);
  if (!projectId) {
    return NextResponse.json({ runs: {} }, { status: 200 });
  }
  const runs = await loadMostRecentAgentRuns(admin, projectId);
  return NextResponse.json({ runs }, { status: 200 });
}

/**
 * Agentic execution layer for The Machine (Isenberg vertical-agent overlay).
 *
 * Single dispatch endpoint. POST body: { kind, payload }.
 *   - offer_scorer     payload: {} — pulls the user's locked Step 2 output from project_state
 *   - outreach_drafter payload: { target_channel, target_name, notes? }
 *   - page_rewriter    payload: { page_text }
 *
 * Auth: requires a signed-in user with a project row. Anonymous calls are
 * rejected — these agents read locked WHO/WHAT/VOICE from the user's saved
 * step outputs, which doesn't exist without a project.
 *
 * Side-effects: persists each run to public.agent_runs so the UI can hydrate
 * on return. Persistence failure is non-fatal — the caller already has the
 * agent output in their hands.
 */
export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  let kind: AgentKind | undefined;

  // Fail loudly when the engine has no Anthropic key — same contract as the
  // Q&A route at /api/engine. A degraded engine that silently fakes output
  // would corrupt Brunson Results-in-Advance.
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[agent] ANTHROPIC_API_KEY missing — refusing to run");
    return NextResponse.json(
      {
        error:
          "The engine is not yet keyed up. Reach out to maryan@unlocksaas.com and I will turn it on.",
      },
      { status: 503 }
    );
  }

  let body: { kind?: string; payload?: unknown };
  try {
    body = (await req.json()) as { kind?: string; payload?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.kind || !AGENT_KINDS.includes(body.kind as AgentKind)) {
    return NextResponse.json(
      { error: `Unknown agent kind. Use one of: ${AGENT_KINDS.join(", ")}` },
      { status: 400 }
    );
  }
  kind = body.kind as AgentKind;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      {
        error:
          "Sign in first. These agents read your saved WHO/WHAT/VOICE — they need an account to read from.",
      },
      { status: 401 }
    );
  }

  const admin = createAdminClient();
  const projectId = await getProjectIdForUser(admin, user.id);
  if (!projectId) {
    return NextResponse.json(
      {
        error:
          "No project found. Finish onboarding first, then come back to this step.",
      },
      { status: 409 }
    );
  }

  const ctx = await loadProjectAgentContext(admin, projectId);

  try {
    switch (kind) {
      case "offer_scorer": {
        if (!ctx["2"]) {
          return NextResponse.json(
            {
              error:
                "Finish Step 2 (Build Your Offer) first. The scorer needs your locked offer to score it.",
            },
            { status: 409 }
          );
        }
        const result = await runOfferScorer({ offerOutput: ctx["2"] });
        const durationMs = Date.now() - startedAt;
        await persistAgentRun({
          adminClient: admin,
          projectId,
          kind,
          input: { offerOutput: ctx["2"] },
          output: result,
          durationMs,
        }).catch(() => false);
        return NextResponse.json({ kind, output: result, durationMs });
      }

      case "outreach_drafter": {
        const payload = (body.payload ?? {}) as {
          target_channel?: string;
          target_name?: string;
          notes?: string;
        };
        const targetChannel = (payload.target_channel ?? "").trim();
        const targetName = (payload.target_name ?? "").trim();
        if (!targetChannel || !targetName) {
          return NextResponse.json(
            {
              error:
                "Need a target_channel and target_name to draft. Tell me where and who.",
            },
            { status: 400 }
          );
        }
        // Outreach drafter only runs after Step 5 is locked (uses voice +
        // offer + AC). Pushback rather than silently produce a worse draft.
        if (!ctx["3"] || !ctx["2"] || !ctx["1"]) {
          return NextResponse.json(
            {
              error:
                "Finish Steps 1, 2, and 3 first. The drafter needs your locked WHO, WHAT, and VOICE.",
            },
            { status: 409 }
          );
        }
        const result = await runOutreachDrafter(
          {
            targetChannel,
            targetName,
            notes: payload.notes,
          },
          {
            dreamCustomer: ctx["1"],
            offer: ctx["2"],
            ac: ctx["3"],
            outreachAssets: ctx["5"],
          }
        );
        const durationMs = Date.now() - startedAt;
        await persistAgentRun({
          adminClient: admin,
          projectId,
          kind,
          input: { targetChannel, targetName, notes: payload.notes ?? null },
          output: result,
          durationMs,
        }).catch(() => false);
        return NextResponse.json({ kind, output: result, durationMs });
      }

      case "page_rewriter": {
        const payload = (body.payload ?? {}) as { page_text?: string };
        const pageText = (payload.page_text ?? "").trim();
        if (pageText.length < 80) {
          return NextResponse.json(
            {
              error:
                "Paste at least 80 characters of your current landing page. A subhead alone is not enough to rewrite.",
            },
            { status: 400 }
          );
        }
        if (!ctx["1"] || !ctx["2"] || !ctx["3"]) {
          return NextResponse.json(
            {
              error:
                "Finish Steps 1, 2, and 3 first. The rewriter needs your locked WHO, WHAT, and VOICE.",
            },
            { status: 409 }
          );
        }
        const result = await runPageRewriter(
          { pageText },
          {
            dreamCustomer: ctx["1"],
            offer: ctx["2"],
            ac: ctx["3"],
            scripts: ctx["4"],
          }
        );
        const durationMs = Date.now() - startedAt;
        await persistAgentRun({
          adminClient: admin,
          projectId,
          kind,
          // Don't persist the full pasted page text into agent_runs — keep
          // just the first 400 chars for operator debug. Full text is the
          // founder's IP and doesn't need to live on our DB indefinitely.
          input: {
            page_text_preview: pageText.slice(0, 400),
            page_text_length: pageText.length,
          },
          output: result,
          durationMs,
        }).catch(() => false);
        return NextResponse.json({ kind, output: result, durationMs });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[agent] handler error", {
      kind,
      message,
      durationMs: Date.now() - startedAt,
    });
    // Distinguish parse/validation failures (4xx territory) from upstream LLM
    // failures (5xx) by message convention. The agents throw with "try again"
    // when the LLM returned malformed JSON.
    const transient = /try again/i.test(message);
    return NextResponse.json(
      { error: message },
      { status: transient ? 502 : 500 }
    );
  }

  // Unreachable — exhaustive switch above.
  return NextResponse.json({ error: "Unknown agent kind" }, { status: 400 });
}
