import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendTestimonialFarmOffer } from "@/lib/testimonial-farm/dispatch";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/testimonial-farm-offer
 *
 * Schedule: "25,55 * * * *" (every 30 minutes, offset by 25 minutes from
 * /api/cron/funnelfixer-tick which runs on "* /30 * * * *" → :00,:30).
 * The 25-minute offset keeps each pair of funnelfixer-cohort sends
 * (carry-over SOS drip + this one-shot reactivation) at least 25 minutes
 * apart, close to the operator's 30-minute deliverability discipline for
 * the unwarmed unlocksaas.com sending domain.
 *
 * The funnel:
 *   1. 36 FunnelFixer carry-over subscribers were imported paused
 *      (memory: project_funnelfixer_carryover_list.md).
 *   2. /api/cron/activate-funnelfixer-carryover activates 5/day with
 *      bounce-tier ordering.
 *   3. Each activated row flows through the 5-email Soap Opera at one
 *      send per 24 hours (dispatched by /api/cron/funnelfixer-tick).
 *   4. After Email 5 the row's status flips to 'complete'.
 *   5. THIS cron picks up complete funnelfixer rows and sends the one-shot
 *      reactivation offer – $1 Starter at $0 for 14 days via the
 *      operator-configured Stripe Payment Link – then stamps the row so
 *      it never sends again.
 *
 * One row per tick. The cohort is small (≤36 rows over the campaign's
 * lifetime) so a fan-out cron is overkill, and a tick-throttled cron
 * matches the existing funnelfixer-tick discipline – at most one
 * carry-over-cohort send per tick across the whole pipeline.
 *
 * Runtime throttle guard: even with the 25-minute schedule offset, if
 * /api/cron/funnelfixer-tick happened to send within the last 25 minutes
 * (e.g. the cron platform delayed a tick), this handler defers and lets
 * the next tick try again. The check is cheap – it reads max(next_send_at)
 * on active funnelfixer rows and subtracts 24h to recover the last send
 * time.
 *
 * Honesty gate: dispatch returns ok:false reason:'payment_link_not_configured'
 * when STRIPE_FUNNELFIXER_TESTIMONIAL_PAYMENT_LINK_URL is unset; this
 * route surfaces that as a normal {ok:true, processed:0, reason:...}
 * response. No fabricated CTA, no broken link, no send. Operator setup:
 *
 *   1. Create a one-time Stripe Coupon: 100% off, duration=once,
 *      max_redemptions=36, redeem_by = now + 14 days.
 *   2. Create a Stripe Payment Link on the Starter price with that coupon
 *      applied. Copy the link URL.
 *   3. vercel env add STRIPE_FUNNELFIXER_TESTIMONIAL_PAYMENT_LINK_URL production
 *      Paste the URL when prompted.
 *   4. Redeploy. The next cron tick that finds a graduate sends the offer.
 */
export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // ── Throttle guard ───────────────────────────────────────────────────────
  // Recover the most-recent funnelfixer Soap Opera send time from
  // max(next_send_at) - 24h on active funnelfixer rows. The dispatcher
  // schedules next_send_at = now + 24h on every send, so this is an honest
  // proxy for "last time a funnelfixer-cohort email left the building."
  const THIRTY_MIN_MS = 30 * 60 * 1000;
  const { data: lastScheduled, error: throttleErr } = await supabase
    .from("soap_opera_subscribers")
    .select("next_send_at")
    .ilike("source", "funnelfixer_%")
    .eq("status", "active")
    .gt("emails_sent", 0)
    .not("next_send_at", "is", null)
    .order("next_send_at", { ascending: false })
    .limit(1);

  if (throttleErr) {
    console.error("[testimonial-farm-cron] throttle_query_failed", throttleErr);
    // Fail open – better to risk a tight send window than to stall the
    // whole campaign on a transient query failure.
  } else if (lastScheduled && lastScheduled.length > 0) {
    const sched = lastScheduled[0]?.next_send_at;
    if (sched) {
      const lastSendMs = Date.parse(sched as string) - 24 * 60 * 60 * 1000;
      const sinceMs = Date.now() - lastSendMs;
      if (sinceMs < THIRTY_MIN_MS) {
        return NextResponse.json({
          ok: true,
          processed: 0,
          reason: "throttled_funnelfixer_overlap",
          last_funnelfixer_send_ms_ago: sinceMs,
        });
      }
    }
  }

  // ── Pick the next due row ────────────────────────────────────────────────
  // Partial-index'd query (see migration 0030). Order by subscribed_at so
  // the earliest graduate gets the offer first – matches the activate-cron's
  // recency-priority tier (most-recent first) inverted on graduation, which
  // is fine: by this stage the deliverability tier no longer matters,
  // fairness does.
  const { data: due, error: dueErr } = await supabase
    .from("soap_opera_subscribers")
    .select("id, email, subscribed_at")
    .ilike("source", "funnelfixer_%")
    .eq("status", "complete")
    .is("testimonial_offer_sent_at", null)
    .order("subscribed_at", { ascending: true })
    .limit(1);

  if (dueErr) {
    console.error("[testimonial-farm-cron] select_failed", dueErr);
    return NextResponse.json(
      { error: "select_failed", detail: dueErr.message },
      { status: 500 }
    );
  }

  if (!due || due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  const row = due[0]!;
  const result = await sendTestimonialFarmOffer({
    id: row.id,
    email: row.email,
  });

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      processed: 1,
      email: row.email,
      error: result.error,
    });
  }

  return NextResponse.json({
    ok: true,
    processed: 1,
    email: row.email,
    payment_link_url: result.paymentLinkUrl,
  });
}
