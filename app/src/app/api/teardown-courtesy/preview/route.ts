import { NextRequest, NextResponse } from "next/server";
import {
  getAllFunnelTargets,
  getTargetByCatalogSlug,
  type CourtesyCatalog,
} from "@/lib/teardown-courtesy/targets";
import { buildCourtesyEmail } from "@/lib/teardown-courtesy/template";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Operator-triggered preview: GET /api/teardown-courtesy/preview
 *
 * Dry-run renderer. Builds the exact subject + body the cron WOULD send
 * for a target, without touching Resend or the database. Operator uses
 * this to spot-check the praise quality, greeting parse, and overall
 * tone before flipping a row to status='approved'.
 *
 * Auth: CRON_SECRET bearer. Same gate as seed + cron.
 *
 * Modes:
 *   GET /api/teardown-courtesy/preview
 *     -> renders all 33 funnel-teardown previews as an array. Used for
 *        bulk review (one HTTP call, paste into a notebook, scan).
 *
 *   GET /api/teardown-courtesy/preview?catalog=funnel-teardown&slug=tally
 *     -> renders one. Useful after editing the catalog whatsWorking[]
 *        or the parsed greeting.
 *
 *   GET /api/teardown-courtesy/preview?catalog=funnel-teardown&slug=tally&greeting=Marie+and+Filip
 *     -> renders with an operator-supplied greeting override. The cron
 *        uses the targets row's greeting column at send time; this query
 *        param simulates that override at preview time.
 *
 * Brunson Hard-Rule reconciliation: preview NEVER persists, NEVER sends,
 * NEVER fabricates content. If a target has no parsed greeting and no
 * override is provided, the preview surfaces { greeting: null,
 * preview: null, reason: "missing_greeting" } so the operator immediately
 * sees what needs fixing.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const catalogParam = url.searchParams.get("catalog");
  const slugParam = url.searchParams.get("slug");
  const greetingOverride = url.searchParams.get("greeting");

  // Single-target mode.
  if (catalogParam && slugParam) {
    if (catalogParam !== "funnel-teardown" && catalogParam !== "pricing-teardown") {
      return NextResponse.json(
        { error: "invalid_catalog", catalog: catalogParam },
        { status: 400 },
      );
    }
    const target = getTargetByCatalogSlug(
      catalogParam as CourtesyCatalog,
      slugParam,
    );
    if (!target) {
      return NextResponse.json(
        { error: "unknown_target", catalog: catalogParam, slug: slugParam },
        { status: 404 },
      );
    }

    const greeting = greetingOverride?.trim() || target.greeting;
    if (!greeting) {
      return NextResponse.json({
        target: {
          catalog: target.catalog,
          slug: target.slug,
          displayName: target.displayName,
          greeting: null,
          praises: target.praises,
        },
        preview: null,
        reason: "missing_greeting",
      });
    }
    if (target.praises.length === 0) {
      return NextResponse.json({
        target: {
          catalog: target.catalog,
          slug: target.slug,
          displayName: target.displayName,
          greeting,
          praises: [],
        },
        preview: null,
        reason: "no_praise",
      });
    }

    const email = buildCourtesyEmail({ target, greeting });
    return NextResponse.json({
      target: {
        catalog: target.catalog,
        slug: target.slug,
        displayName: target.displayName,
        creatorRaw: target.creatorRaw,
        greeting,
        praises: target.praises,
      },
      preview: email,
    });
  }

  // Bulk mode: all funnel targets, with each preview shown alongside any
  // operator-attention reason (missing greeting / no praise).
  const all = getAllFunnelTargets();
  const previews = all.map((target) => {
    if (!target.greeting) {
      return {
        catalog: target.catalog,
        slug: target.slug,
        displayName: target.displayName,
        greeting: null,
        praises: target.praises,
        preview: null,
        reason: "missing_greeting" as const,
      };
    }
    if (target.praises.length === 0) {
      return {
        catalog: target.catalog,
        slug: target.slug,
        displayName: target.displayName,
        greeting: target.greeting,
        praises: [],
        preview: null,
        reason: "no_praise" as const,
      };
    }
    const email = buildCourtesyEmail({ target, greeting: target.greeting });
    return {
      catalog: target.catalog,
      slug: target.slug,
      displayName: target.displayName,
      creatorRaw: target.creatorRaw,
      greeting: target.greeting,
      praises: target.praises,
      preview: email,
      reason: null,
    };
  });

  return NextResponse.json({
    catalog_size: all.length,
    needs_attention: previews.filter((p) => p.reason !== null).length,
    previews,
  });
}
