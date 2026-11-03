import { NextRequest, NextResponse } from "next/server";
import { findThreads } from "@/lib/thread-finder";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/thread-finder
 *
 * Body: { problem: string, product?: string, maxAgeDays?: number, limit?: number }
 * Returns top-N live public threads (default 20) where people describe the
 * given problem, with matched quotes, scores and per-source status. Source
 * failures are reported honestly in `sources`, never faked. Results are
 * cached in-memory for 1h per query. The tool never posts anywhere.
 */

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(request, {
    keyPrefix: "thread-finder",
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retry_after: rl.retryAfter },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 }
    );
  }

  const { problem, product, maxAgeDays, limit } = (body ?? {}) as {
    problem?: unknown;
    product?: unknown;
    maxAgeDays?: unknown;
    limit?: unknown;
  };

  if (typeof problem !== "string" || problem.trim().length < 10) {
    return NextResponse.json(
      {
        error: "invalid_problem",
        detail:
          "Describe the customer's problem in your own words (at least 10 characters).",
      },
      { status: 400 }
    );
  }
  if (problem.length > 500) {
    return NextResponse.json(
      { error: "problem_too_long", detail: "Keep it under 500 characters." },
      { status: 400 }
    );
  }

  try {
    const result = await findThreads(
      {
        problem,
        product: typeof product === "string" ? product.slice(0, 200) : undefined,
        maxAgeDays:
          typeof maxAgeDays === "number" && Number.isFinite(maxAgeDays)
            ? maxAgeDays
            : undefined,
        limit:
          typeof limit === "number" && Number.isFinite(limit)
            ? limit
            : undefined,
      },
      { disableReddit: false }
    );
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: "finder_failed",
        detail: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
