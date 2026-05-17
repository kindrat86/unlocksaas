import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  parseStackLayer,
  readStackSubjectFromCookies,
  readAffiliateFromCookies,
  type StackLayerValue,
} from "@/lib/stack-attribution";

/**
 * POST /api/stack/event
 *
 * Bridge-event ingestion for the eight-layer Funnel Stack
 * (DotCom Secrets Secret #27 / strategy/funnel-stack.md).
 *
 * The visitor's stack cookies are written sticky in middleware on every
 * request. This endpoint persists the *transitions* — when the visitor
 * crosses a known bridge (e.g. the Diagnostic result page's "Fix this for $1"
 * CTA into Starter), the client beacon POSTs here so the row in
 * public.stack_events captures the bridge_out / bridge_in pair.
 *
 * Why a beacon and not pure middleware: middleware sees every request but
 * doesn't know which clicks are "real bridges" vs scroll/refresh. The page
 * surfaces that own the bridges (DiagnosticResult, StarterSalesPage, OTO,
 * etc.) call the beacon explicitly on the click that crosses a layer.
 *
 * Conversions (event='convert') are written by the Stripe webhook with the
 * service_role client — never via this endpoint. The anon RLS policy on the
 * stack_events table refuses 'convert' events from the beacon so a malicious
 * caller can't fabricate purchase rows.
 *
 * Shape:
 *   POST body: {
 *     event: 'enter' | 'bridge_out' | 'bridge_in' | 'exit',
 *     layer: number (0..8),
 *     source_layer?: number,
 *     destination_layer?: number,
 *     utm_source?: string,
 *     utm_medium?: string,
 *     utm_campaign?: string,
 *   }
 *   Subject id is read from the usaas_stack_subject cookie. Affiliate slug
 *   from usaas_affiliate cookie.
 *   Returns 204 on success; never returns row data (visitor doesn't need it).
 *
 * Rate-limit posture: defense-in-depth via input shape validation. A more
 * aggressive per-subject limit lives in middleware (deferred until traffic
 * justifies — current expected volume is < 100 events/day pre-PMF).
 */
type StackEventBody = {
  event?: unknown;
  layer?: unknown;
  source_layer?: unknown;
  destination_layer?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
};

const ALLOWED_BEACON_EVENTS = new Set<string>([
  "enter",
  "bridge_out",
  "bridge_in",
  "exit",
]);

function clampString(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: NextRequest) {
  let body: StackEventBody = {};
  try {
    body = (await req.json()) as StackEventBody;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const event = typeof body.event === "string" ? body.event : "";
  if (!ALLOWED_BEACON_EVENTS.has(event)) {
    return NextResponse.json({ error: "bad_event" }, { status: 400 });
  }

  const layer = parseStackLayer(
    typeof body.layer === "number" ? String(body.layer) : null,
  );
  if (layer === null) {
    return NextResponse.json({ error: "bad_layer" }, { status: 400 });
  }

  // source/destination layers are optional but if present must parse.
  let sourceLayer: StackLayerValue | null = null;
  if (body.source_layer !== undefined && body.source_layer !== null) {
    sourceLayer = parseStackLayer(
      typeof body.source_layer === "number" ? String(body.source_layer) : null,
    );
    if (sourceLayer === null) {
      return NextResponse.json({ error: "bad_source_layer" }, { status: 400 });
    }
  }
  let destinationLayer: StackLayerValue | null = null;
  if (body.destination_layer !== undefined && body.destination_layer !== null) {
    destinationLayer = parseStackLayer(
      typeof body.destination_layer === "number"
        ? String(body.destination_layer)
        : null,
    );
    if (destinationLayer === null) {
      return NextResponse.json(
        { error: "bad_destination_layer" },
        { status: 400 },
      );
    }
  }

  // Subject is server-derived from the cookie — the client cannot lie about
  // their subject id and corrupt another visitor's path.
  const subjectId = readStackSubjectFromCookies();
  if (!subjectId || subjectId.length < 8 || subjectId.length > 64) {
    // No cookie = visitor blocks cookies. Silently no-op; the path will still
    // converge via the Stripe webhook attribution which generates a one-shot
    // subject id at checkout.
    return new NextResponse(null, { status: 204 });
  }

  const affiliate = readAffiliateFromCookies();
  const utm_source = clampString(body.utm_source);
  const utm_medium = clampString(body.utm_medium);
  const utm_campaign = clampString(body.utm_campaign);

  // Use the admin client because the table's RLS allows anon INSERT but the
  // typed insert path through @supabase/ssr's anon client would also work.
  // Using admin keeps the path uniform with the webhook's insert path and
  // avoids an extra round-trip through middleware's session refresh.
  //
  // Cast: stack_events not yet in generated database.types.ts (the migration
  // 20260518000007_stack_events.sql is fresh; same pattern as
  // cart_abandonment_subscribers in lib/cart-recovery/subscribe.ts).
  const admin = createAdminClient();
  const { error } = await (
    admin as unknown as { from: (t: string) => any }
  )
    .from("stack_events")
    .insert({
      subject_id: subjectId,
      layer,
      event,
      source_layer: sourceLayer,
      destination_layer: destinationLayer,
      affiliate_slug: affiliate,
      utm_source,
      utm_medium,
      utm_campaign,
    });

  if (error) {
    // Log but do not surface to the visitor — the beacon is fire-and-forget.
    // eslint-disable-next-line no-console
    console.error("[stack-events] insert failed:", error.message, {
      subject_id: subjectId,
      event,
      layer,
    });
    // Still return 204: the visitor's experience must not depend on our
    // ability to attribute. Brunson rule: never let the funnel teach the
    // buyer that the seller has a bug.
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
