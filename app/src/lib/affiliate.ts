/**
 * Affiliate program helpers (Isenberg overlay – 50% rev-share until $1M ARR).
 *
 * Schema in supabase/migrations/20260521000000_affiliate_program.sql.
 *   - affiliates              (one per profile, owns a code)
 *   - affiliate_clicks        (append-only click log)
 *   - affiliate_referrals     (one per referred visitor/email)
 *   - affiliate_commissions   (one per Stripe invoice/charge per affiliate)
 *   - affiliate_payouts       (manual payout records)
 *
 * Lifecycle:
 *   1. Profile in tier {starter|core} → `getOrIssueAffiliate(profileId)`
 *      lazily creates an affiliates row with a unique 8-char code.
 *   2. Visitor lands on /r/<code> → `recordClick(code, request)` writes a
 *      lightweight affiliate_clicks row + sets the `unlocksaas_ref` cookie.
 *   3. /api/checkout reads the cookie → stamps Stripe metadata.ref_code.
 *   4. Webhook checkout.session.completed → `attachReferralFromSession()`
 *      creates/updates the affiliate_referrals row.
 *   5. Webhook invoice.payment_succeeded (or starter checkout) →
 *      `recordCommissionForInvoice()` creates a commission row.
 *
 * All writes use the service-role admin client and bypass RLS. None of these
 * helpers are safe to call from a browser context.
 *
 * Type note: the affiliate_* tables aren't yet in the generated
 * database.types.ts; we cast the admin client through a local Loose type so
 * call sites stay readable. Re-run `supabase gen types typescript` to fold
 * them into the generated Database type.
 */

import { randomBytes, createHash } from "crypto";
import type Stripe from "stripe";
import type { SupabaseClient } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/server";

type Loose = SupabaseClient;
function db(): Loose {
  return createAdminClient() as unknown as Loose;
}

/** Lower bound for the rev share floor (after the platform hits $1M ARR). */
export const REV_SHARE_FLOOR_PCT = 50;
/** Default rev share for new affiliates. Bump down to 30 once $1M ARR is hit. */
export const DEFAULT_REV_SHARE_PCT = 50;
/** Cookie name carrying the ref code (90 days). */
export const REF_COOKIE = "unlocksaas_ref";
export const REF_COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90 days
/** URL-safe alphabet for codes; no ambiguous chars (0/O, 1/I/l). */
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 8;

// ── Codes ────────────────────────────────────────────────────────────────────

export function generateAffiliateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/**
 * Hash an IP address for the click log. We never store the raw IP. The hash
 * is salted with REF_CLICK_IP_SALT so different deployments can't cross-
 * correlate. The hash is one-way and used only for rate-limiting / spam
 * pattern detection on the dashboard.
 */
function hashIp(ip: string): string {
  const salt = process.env.REF_CLICK_IP_SALT ?? "unlocksaas-default-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// ── Affiliate row ────────────────────────────────────────────────────────────

export interface AffiliateRow {
  id: string;
  profile_id: string;
  code: string;
  status: "active" | "paused" | "banned";
  rev_share_pct: number;
  rev_share_floor_pct: number;
  payout_email: string | null;
  payout_method: "wise" | "stripe_connect" | "paypal" | "other" | null;
}

/**
 * Idempotent: returns an existing affiliate for the profile if one exists,
 * otherwise creates a new row with a freshly minted unique code.
 *
 * Retries on rare code collisions (the unique constraint on `code` is the
 * source of truth; we just regenerate and try again).
 */
export async function getOrIssueAffiliate(profileId: string): Promise<AffiliateRow> {
  // Fast path: existing affiliate.
  const existing = await db()
    .from("affiliates")
    .select("id,profile_id,code,status,rev_share_pct,rev_share_floor_pct,payout_email,payout_method")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing.data) return existing.data as unknown as AffiliateRow;

  // Slow path: insert. Retry on unique violation (code collision is astronomically
  // unlikely with 8 chars × 31 alphabet = ~8.5e11 keyspace, but cheap to be safe).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode();
    const { data, error } = await db()
      .from("affiliates")
      .insert({
        profile_id: profileId,
        code,
        status: "active",
        rev_share_pct: DEFAULT_REV_SHARE_PCT,
        rev_share_floor_pct: REV_SHARE_FLOOR_PCT,
      })
      .select(
        "id,profile_id,code,status,rev_share_pct,rev_share_floor_pct,payout_email,payout_method",
      )
      .maybeSingle();

    if (!error && data) return data as unknown as AffiliateRow;

    // 23505 = unique_violation. profile_id collision means a concurrent insert
    // already created a row; re-read it. code collision means we just lost a
    // dice roll; try again.
    const code23505 = (error as { code?: string } | null)?.code === "23505";
    if (!code23505) {
      throw new Error(`getOrIssueAffiliate insert failed: ${error?.message ?? "unknown"}`);
    }

    const recheck = await db()
      .from("affiliates")
      .select(
        "id,profile_id,code,status,rev_share_pct,rev_share_floor_pct,payout_email,payout_method",
      )
      .eq("profile_id", profileId)
      .maybeSingle();
    if (recheck.data) return recheck.data as unknown as AffiliateRow;
    // Else: it was a code collision, loop and regenerate.
  }
  throw new Error("getOrIssueAffiliate: exceeded code-generation retries");
}

/**
 * Look up an affiliate by its referral code. Case-insensitive.
 * Returns null if no row exists or the affiliate is paused/banned.
 */
export async function getActiveAffiliateByCode(
  code: string,
): Promise<AffiliateRow | null> {
  const trimmed = code.trim().toLowerCase();
  if (!trimmed) return null;

  const { data } = await db()
    .from("affiliates")
    .select(
      "id,profile_id,code,status,rev_share_pct,rev_share_floor_pct,payout_email,payout_method",
    )
    .eq("code", trimmed)
    .eq("status", "active")
    .maybeSingle();

  return (data as unknown as AffiliateRow | null) ?? null;
}

// ── Clicks ───────────────────────────────────────────────────────────────────

interface RecordClickArgs {
  affiliate: AffiliateRow;
  codeUsed: string;
  ip: string | null;
  userAgent: string | null;
  referer: string | null;
  utm: { source?: string; medium?: string; campaign?: string };
  landingPath?: string | null;
}

/** Record a click. Errors are logged, never thrown – we never want a tracking
 *  failure to break the redirect. */
export async function recordClick(args: RecordClickArgs): Promise<void> {
  try {
    await db().from("affiliate_clicks").insert({
      affiliate_id: args.affiliate.id,
      code_used: args.codeUsed,
      ip_hash: args.ip ? hashIp(args.ip) : null,
      user_agent_excerpt: args.userAgent ? args.userAgent.slice(0, 240) : null,
      referer: args.referer ? args.referer.slice(0, 500) : null,
      utm_source: args.utm.source?.slice(0, 60) ?? null,
      utm_medium: args.utm.medium?.slice(0, 60) ?? null,
      utm_campaign: args.utm.campaign?.slice(0, 120) ?? null,
      landing_path: args.landingPath?.slice(0, 200) ?? null,
    });
  } catch (err) {
    console.error("[affiliate] recordClick failed:", err);
  }
}

// ── Referrals ────────────────────────────────────────────────────────────────

/**
 * Attach a referral to a completed Stripe checkout session.
 *
 * Called from the webhook's checkout.session.completed branch. If
 * session.metadata.ref_code matches an active affiliate, upsert a row in
 * affiliate_referrals.
 *
 * Self-referrals (the affiliate's own email) are silently skipped – nobody
 * gets to pay themselves 50% by checking out via their own link.
 *
 * Returns the referral row id, or null if no attribution applied.
 */
export async function attachReferralFromSession(
  session: Stripe.Checkout.Session,
): Promise<{ referralId: string; affiliateId: string } | null> {
  const refCode = (session.metadata?.ref_code ?? "").trim().toLowerCase();
  if (!refCode) return null;

  const affiliate = await getActiveAffiliateByCode(refCode);
  if (!affiliate) {
    console.warn(
      `[affiliate] session ${session.id} carries unknown ref_code=${refCode}; ignoring`,
    );
    return null;
  }

  const email =
    session.customer_details?.email?.toLowerCase() ??
    session.customer_email?.toLowerCase() ??
    null;

  // Self-referral guard: look up the affiliate's profile email.
  if (email) {
    const { data: ownerProfile } = await db()
      .from("profiles")
      .select("email")
      .eq("id", affiliate.profile_id)
      .maybeSingle();
    const ownerEmail = (ownerProfile?.email as string | undefined)?.toLowerCase();
    if (ownerEmail && ownerEmail === email) {
      console.warn(
        `[affiliate] self-referral blocked: ${email} used own code ${refCode}`,
      );
      return null;
    }
  }

  const isCore = session.mode === "subscription";
  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  // Upsert by stripe_session_id (unique). Idempotent on Stripe retry.
  const { data: row, error } = await db()
    .from("affiliate_referrals")
    .upsert(
      {
        affiliate_id: affiliate.id,
        referred_email: email,
        stripe_customer_id: stripeCustomerId,
        stripe_session_id: session.id,
        converted_at: new Date().toISOString(),
        kind: isCore ? "core" : "starter",
        status: "converted",
      },
      { onConflict: "stripe_session_id" },
    )
    .select("id")
    .single();

  if (error || !row) {
    console.error(
      `[affiliate] referral upsert failed for session ${session.id}:`,
      error?.message,
    );
    return null;
  }

  // If we know the referred profile (by email), link it.
  if (email) {
    const { data: prof } = await db()
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (prof?.id) {
      await db()
        .from("affiliate_referrals")
        .update({ referred_profile_id: prof.id })
        .eq("id", (row as { id: string }).id)
        .is("referred_profile_id", null);
    }
  }

  return {
    referralId: (row as { id: string }).id,
    affiliateId: affiliate.id,
  };
}

/**
 * Find a referral by Stripe customer id. Used by invoice.payment_succeeded
 * (recurring) handlers since the invoice doesn't carry session metadata.
 */
export async function findReferralByCustomerId(
  customerId: string,
): Promise<{
  id: string;
  affiliate_id: string;
  rev_share_pct: number;
  rev_share_floor_pct: number;
  status: string;
} | null> {
  if (!customerId) return null;
  const { data } = await db()
    .from("affiliate_referrals")
    .select(
      `id,affiliate_id,status,
       affiliate:affiliates!inner(rev_share_pct,rev_share_floor_pct,status)`,
    )
    .eq("stripe_customer_id", customerId)
    .order("first_seen_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const row = data as unknown as {
    id: string;
    affiliate_id: string;
    status: string;
    affiliate: {
      rev_share_pct: number;
      rev_share_floor_pct: number;
      status: string;
    };
  };
  // Suspended affiliate: still tracked, just don't compute new commissions.
  if (row.affiliate.status !== "active") return null;
  return {
    id: row.id,
    affiliate_id: row.affiliate_id,
    rev_share_pct: row.affiliate.rev_share_pct,
    rev_share_floor_pct: row.affiliate.rev_share_floor_pct,
    status: row.status,
  };
}

// ── Commissions ──────────────────────────────────────────────────────────────

interface RecordCommissionArgs {
  affiliateId: string;
  referralId: string | null;
  revSharePctSnapshot: number;
  stripeInvoiceId?: string | null;
  stripeChargeId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeCustomerId?: string | null;
  kind: "starter" | "core_initial" | "core_renewal" | "other";
  grossAmountCents: number;
  currency?: string;
  invoiceDateIso: string;
}

/**
 * Insert a commission row. Idempotent via UNIQUE indexes on (affiliate, invoice)
 * and (affiliate, charge). Returns true if inserted, false if duplicate.
 */
export async function insertCommission(args: RecordCommissionArgs): Promise<boolean> {
  const commissionCents = Math.round(
    (args.grossAmountCents * args.revSharePctSnapshot) / 100,
  );
  // 30-day refund-window before commissions become payable. After this, we'll
  // accept them as final liability.
  const payableAt = new Date(
    new Date(args.invoiceDateIso).getTime() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await db().from("affiliate_commissions").insert({
    affiliate_id: args.affiliateId,
    referral_id: args.referralId,
    rev_share_pct_snapshot: args.revSharePctSnapshot,
    stripe_invoice_id: args.stripeInvoiceId ?? null,
    stripe_charge_id: args.stripeChargeId ?? null,
    stripe_payment_intent_id: args.stripePaymentIntentId ?? null,
    stripe_customer_id: args.stripeCustomerId ?? null,
    kind: args.kind,
    gross_amount_cents: args.grossAmountCents,
    commission_cents: commissionCents,
    currency: args.currency ?? "usd",
    status: "pending",
    invoice_date: args.invoiceDateIso,
    payable_at: payableAt,
  });

  if (!error) return true;
  if ((error as { code?: string }).code === "23505") return false;
  throw new Error(`insertCommission: ${error.message}`);
}

/**
 * Record a commission for a Starter checkout (mode=payment). One-shot.
 */
export async function recordCommissionForStarter(args: {
  session: Stripe.Checkout.Session;
  referralId: string;
  affiliateId: string;
  revSharePctSnapshot: number;
}): Promise<boolean> {
  if (!args.session.amount_total || args.session.amount_total <= 0) return false;
  return insertCommission({
    affiliateId: args.affiliateId,
    referralId: args.referralId,
    revSharePctSnapshot: args.revSharePctSnapshot,
    stripePaymentIntentId:
      typeof args.session.payment_intent === "string"
        ? args.session.payment_intent
        : args.session.payment_intent?.id ?? null,
    stripeCustomerId:
      typeof args.session.customer === "string"
        ? args.session.customer
        : args.session.customer?.id ?? null,
    kind: "starter",
    grossAmountCents: args.session.amount_total,
    currency: args.session.currency ?? "usd",
    invoiceDateIso: new Date().toISOString(),
  });
}

/**
 * Record a commission for a Core subscription invoice. Called from
 * webhook invoice.payment_succeeded once we've resolved the referral by
 * stripe_customer_id.
 */
export async function recordCommissionForInvoice(args: {
  invoice: Stripe.Invoice;
  referralId: string;
  affiliateId: string;
  revSharePctSnapshot: number;
}): Promise<boolean> {
  const inv = args.invoice;
  if (!inv.amount_paid || inv.amount_paid <= 0) return false;

  const legacy = inv as unknown as {
    charge?: string | { id?: string } | null;
    payment_intent?: string | { id?: string } | null;
    status_transitions?: { paid_at?: number | null } | null;
  };
  const chargeId =
    typeof legacy.charge === "string"
      ? legacy.charge
      : legacy.charge?.id ?? null;
  const paymentIntentId =
    typeof legacy.payment_intent === "string"
      ? legacy.payment_intent
      : legacy.payment_intent?.id ?? null;
  const paidAtUnix =
    legacy.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000);

  return insertCommission({
    affiliateId: args.affiliateId,
    referralId: args.referralId,
    revSharePctSnapshot: args.revSharePctSnapshot,
    stripeInvoiceId: inv.id,
    stripeChargeId: chargeId,
    stripePaymentIntentId: paymentIntentId,
    stripeCustomerId:
      typeof inv.customer === "string" ? inv.customer : inv.customer?.id ?? null,
    kind: inv.billing_reason === "subscription_create" ? "core_initial" : "core_renewal",
    grossAmountCents: inv.amount_paid,
    currency: inv.currency ?? "usd",
    invoiceDateIso: new Date(paidAtUnix * 1000).toISOString(),
  });
}

/**
 * Void any pending/payable commission rows linked to a charge that was just
 * refunded. Called from charge.refunded webhook.
 */
export async function voidCommissionsForCharge(chargeId: string): Promise<void> {
  if (!chargeId) return;
  await db()
    .from("affiliate_commissions")
    .update({ status: "voided", voided_at: new Date().toISOString() })
    .eq("stripe_charge_id", chargeId)
    .in("status", ["pending", "payable"]);
}

/**
 * Mark a referral as churned. Called from customer.subscription.deleted so
 * the affiliate's dashboard reflects that the recurring revenue stopped.
 * Does NOT clawback already-issued commissions (those stay payable/paid).
 */
export async function markReferralChurned(customerId: string): Promise<void> {
  if (!customerId) return;
  await db()
    .from("affiliate_referrals")
    .update({ status: "churned" })
    .eq("stripe_customer_id", customerId)
    .eq("status", "converted");
}

// ── Dashboard reads ──────────────────────────────────────────────────────────

export interface AffiliateDashboardStats {
  affiliate: AffiliateRow;
  shareUrl: string;
  clickCount: number;
  referralCount: number;
  convertedCount: number;
  activeCustomers: number;
  earningsCents: {
    pending: number;
    payable: number;
    paid: number;
    lifetime: number;
  };
}

/**
 * Read the dashboard slice for a given profile. Returns null if the profile
 * isn't enrolled yet – the caller decides whether to auto-issue.
 */
export async function getAffiliateDashboard(
  profileId: string,
  appUrl: string,
): Promise<AffiliateDashboardStats | null> {
  const { data: rawAffiliate } = await db()
    .from("affiliates")
    .select(
      "id,profile_id,code,status,rev_share_pct,rev_share_floor_pct,payout_email,payout_method",
    )
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!rawAffiliate) return null;
  const affiliate = rawAffiliate as unknown as AffiliateRow;

  const [{ count: clickCount }, { count: referralCount }, { count: convertedCount }, {
    count: activeCustomers,
  }, commissionsResult] = await Promise.all([
    db()
      .from("affiliate_clicks")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliate.id),
    db()
      .from("affiliate_referrals")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliate.id),
    db()
      .from("affiliate_referrals")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliate.id)
      .eq("status", "converted"),
    db()
      .from("affiliate_referrals")
      .select("id", { count: "exact", head: true })
      .eq("affiliate_id", affiliate.id)
      .eq("kind", "core")
      .in("status", ["converted"]),
    db()
      .from("affiliate_commissions")
      .select("commission_cents,status")
      .eq("affiliate_id", affiliate.id),
  ]);

  const earnings = { pending: 0, payable: 0, paid: 0, lifetime: 0 };
  for (const row of (commissionsResult.data ?? []) as Array<{
    commission_cents: number;
    status: string;
  }>) {
    const cents = row.commission_cents ?? 0;
    earnings.lifetime += cents;
    if (row.status === "pending") earnings.pending += cents;
    else if (row.status === "payable") earnings.payable += cents;
    else if (row.status === "paid") earnings.paid += cents;
  }

  return {
    affiliate,
    shareUrl: `${appUrl.replace(/\/$/, "")}/r/${affiliate.code}`,
    clickCount: clickCount ?? 0,
    referralCount: referralCount ?? 0,
    convertedCount: convertedCount ?? 0,
    activeCustomers: activeCustomers ?? 0,
    earningsCents: earnings,
  };
}

// ── State transition: promote pending → payable after refund window ─────────
//
// Called from a daily cron. Promotes commissions whose payable_at is in the past
// and whose underlying charge has not been voided. Idempotent.
//
// (Not wired to a cron route in this commit; safe to call manually via psql.)
export async function promotePayableCommissions(): Promise<number> {
  const { data } = await db()
    .from("affiliate_commissions")
    .update({ status: "payable" })
    .eq("status", "pending")
    .lte("payable_at", new Date().toISOString())
    .select("id");
  return (data?.length as number | undefined) ?? 0;
}
