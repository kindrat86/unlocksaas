import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { captureServer, captureServerAndFlush } from "@/lib/analytics/server";
import {
  Event,
  LLMO_DISTINCT_ID,
  type LlmoCitationWonProps,
  type LlmoCitationsSyncedProps,
} from "@/lib/analytics/events";
import {
  PRIORITY_QUERIES,
  configuredProviders,
  runQueryAllProviders,
} from "@/lib/llmo/citation-tracker";

/**
 * Weekly cron: GET /api/cron/llmo-citations
 *
 * Runs the 20 priority queries from strategy/llmo/priority-queries.csv
 * against every configured LLM provider (OpenAI, Perplexity, Anthropic,
 * Google) and stores one row per (query, provider) tick in the
 * `llmo_citations` Supabase table.
 *
 * Scheduled in app/vercel.json at "0 9 * * 1" — Mondays 09:00 UTC. The
 * Athens-displayed equivalent (per the locked display-timezone rule) is
 * 12:00 EEST in summer / 11:00 EET in winter. One run per week is enough
 * to see week-over-week share without burning a meaningful share of any
 * provider's pricing tier.
 *
 * Auth
 * ----
 *   - CRON_SECRET bearer header — same pattern as every other cron in
 *     this project. Vercel injects it on cron-fired requests.
 *
 * Per-provider activation
 * -----------------------
 * Each provider is independently optional. Set the env var and the next
 * tick picks the provider up; leave it unset and the cron silently
 * skips it. Configured-provider list is reported in the response body
 * so the operator can see which providers ran without grepping logs.
 *
 *     OPENAI_API_KEY        # OpenAI gpt-4o web-search
 *     PERPLEXITY_API_KEY    # Perplexity sonar-pro
 *     ANTHROPIC_API_KEY     # Claude with web_search tool — already
 *                           # set elsewhere in this app
 *     GOOGLE_AI_API_KEY     # Gemini 2.5-pro with google_search grounding
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - No fabricated data. Every row is a real provider call we made.
 *     When zero providers are configured the response is 503 +
 *     `error: "llmo_no_providers_configured"` rather than inserting
 *     placeholder rows.
 *   - Cost cap: 20 queries × 4 providers × ~1 call each = ~80 outbound
 *     HTTP requests per tick. Each provider call is timeout-capped at
 *     60s inside the adapter; the cron's own `maxDuration` is 300s
 *     (Vercel platform default).
 */

export const maxDuration = 300;

/** Reported by the response body so the operator can spot config drift. */
interface RunSummary {
  inserted: number;
  failed: number;
  queries: number;
  providers_used: string[];
  providers_skipped: string[];
  duration_ms: number;
  errors: Array<{ query_id: string; provider: string; message: string }>;
}

export async function GET(req: NextRequest) {
  const started = Date.now();

  // ── Auth: CRON_SECRET bearer ─────────────────────────────────────────
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!expected) {
    // Mirrors gsc-feedback: a 503 surfaces the "not yet wired" state
    // clearly in the cron dashboard rather than silently 200ing.
    return NextResponse.json(
      {
        error: "cron_secret_unset",
        detail: "Set CRON_SECRET in Vercel before enabling this cron.",
      },
      { status: 503 },
    );
  }

  // ── Provider configuration check ─────────────────────────────────────
  const used = configuredProviders();
  const all = ["openai", "perplexity", "anthropic", "google"] as const;
  const skipped = all.filter((p) => !used.includes(p));

  if (used.length === 0) {
    return NextResponse.json(
      {
        error: "llmo_no_providers_configured",
        detail:
          "Set at least one of OPENAI_API_KEY, PERPLEXITY_API_KEY, " +
          "ANTHROPIC_API_KEY, GOOGLE_AI_API_KEY in Vercel to activate. " +
          "See strategy/llmo/citation-tracking-runbook.md.",
      },
      { status: 503 },
    );
  }

  // ── Supabase service-role client ─────────────────────────────────────
  // The cron writes with the admin client so RLS doesn't apply. We
  // bail before any provider call if the service-role key is missing —
  // there's no point burning paid LLM tokens we can't persist.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "supabase_service_role_key_unset" },
      { status: 503 },
    );
  }
  const supabase = createAdminClient();

  const summary: RunSummary = {
    inserted: 0,
    failed: 0,
    queries: PRIORITY_QUERIES.length,
    providers_used: used,
    providers_skipped: skipped,
    duration_ms: 0,
    errors: [],
  };
  let citationsWon = 0;

  // ── Sequential by query to stay polite + simplify rate-limit math ────
  // Inside one query we fan out across providers in parallel (cheap +
  // bounded by `used.length`). Between queries we go serial so a 20-
  // query × 4-provider matrix lands ~80 HTTP calls inside one 300s
  // window without tripping per-second quotas on any provider.
  for (const q of PRIORITY_QUERIES) {
    try {
      const rows = await runQueryAllProviders(q);
      if (rows.length === 0) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("llmo_citations").insert(rows as any);
      if (error) {
        summary.failed += rows.length;
        summary.errors.push({
          query_id: q.id,
          provider: "supabase",
          message: error.message,
        });
        continue;
      }
      summary.inserted += rows.length;

      // Per-row error envelopes (model: "error" was filtered inside
      // runQueryAllProviders; here we surface HTTP-error provider
      // responses that did insert but had empty response_text).
      for (const r of rows) {
        if (
          r.response_text === "" &&
          r.raw &&
          typeof r.raw === "object" &&
          "error" in (r.raw as Record<string, unknown>)
        ) {
          summary.errors.push({
            query_id: q.id,
            provider: r.provider,
            message: JSON.stringify((r.raw as Record<string, unknown>).error).slice(0, 200),
          });
        }

        // PostHog: emit one event per citation win so the dashboard
        // can chart per-query / per-provider share over time. Fire-
        // and-forget — the summary event flushes at the end.
        if (r.url_cited) {
          citationsWon += 1;
          const props: LlmoCitationWonProps = {
            query_id: r.query_id,
            query_text: r.query_text,
            provider: r.provider,
            model: r.model,
            rank_in_answer: r.rank_in_answer,
            brand_mentioned: r.brand_mentioned,
          };
          captureServer(LLMO_DISTINCT_ID, Event.LlmoCitationWon, props as unknown as Record<string, unknown>);
        }
      }
    } catch (err) {
      summary.failed += used.length;
      summary.errors.push({
        query_id: q.id,
        provider: "fanout",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  summary.duration_ms = Date.now() - started;

  // ── Summary: one PostHog event + one console line per tick ───────────
  // captureServerAndFlush mirrors the gsc-feedback cron — the function
  // freeze immediately after a fire-and-forget capture would otherwise
  // drop the summary event.
  const syncedProps: LlmoCitationsSyncedProps = {
    inserted: summary.inserted,
    failed: summary.failed,
    queries: summary.queries,
    providers_used: summary.providers_used.join(","),
    providers_skipped: summary.providers_skipped.join(","),
    citations_won: citationsWon,
    elapsed_ms: summary.duration_ms,
  };
  await captureServerAndFlush(LLMO_DISTINCT_ID, Event.LlmoCitationsSynced, syncedProps as Record<string, unknown>);

  // Vercel function logs: single grep-able line for quick health checks.
  console.log(
    `[llmo-citations] inserted=${summary.inserted} won=${citationsWon} ` +
      `failed=${summary.failed} providers=${summary.providers_used.join("+")} ` +
      `ms=${summary.duration_ms}`,
  );

  return NextResponse.json({ ok: true, citations_won: citationsWon, ...summary });
}
