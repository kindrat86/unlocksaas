/**
 * Verified Builders community gate.
 *
 * Isenberg overlay (memory: project_unlocksaas_isenberg_playbook.md): the $49/mo
 * Core seat wraps a private community so the tier stops being "just software"
 * and starts being "the room." Platform-agnostic by design – the operator
 * (Maryan) pastes a Skool or Discord invite URL into COMMUNITY_INVITE_URL via
 * the Vercel dashboard; the platform is detected from the host for copy.
 *
 * Brunson alignment: the locked Verified Builders identity (workbook 04, Hard
 * Rule #10) ships unchanged. This adds the room they gather in; it does not
 * touch offer, price, avatar, or value ladder.
 *
 * Webhook integration:
 *   - handleCheckoutSessionCompleted (mode=subscription)  → grantCoreCommunityAccess
 *   - handleInvoicePaymentSucceeded (first invoice)       → grantCoreCommunityAccess (safety net)
 *   - handleSubscriptionDeleted                            → revokeCoreCommunityAccess
 *
 * All helpers are idempotent and defensive: if the community_access_* columns
 * or community_access_events table do not yet exist in the target environment
 * (migration 20260521000000_community_access.sql not yet applied), the helpers
 * log and return false rather than throwing. Billing flow is never blocked.
 *
 * Platform automation (auto-add on grant, auto-remove on revoke) is out of
 * scope for v1. Until the operator picks Skool vs Discord and provisions bot
 * credentials, revoke is a logged event that the operator acts on manually.
 * Core cohort is < 50 members through the founding window – manual is fine.
 */
import { after } from "next/server";
import type { SupabaseClient } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/server";
import { sendCommunityInviteEmail } from "@/lib/community-invite-email";

export type CommunityPlatform = "skool" | "discord" | "other";

export type CommunityEventType =
  | "granted"
  | "revoked"
  | "invite_sent"
  | "invite_failed"
  | "invite_resent";

export type CommunityEventSource =
  | "stripe_webhook"
  | "onboarding_resend"
  | "operator_manual";

interface CommunityProfile {
  id: string;
  email: string;
  builder_name?: string | null;
  product_name?: string | null;
  community_access_granted_at?: string | null;
  community_access_revoked_at?: string | null;
  community_invite_sent_at?: string | null;
  community_invite_sent_count?: number | null;
}

// Loose admin client – community_access_* columns and the events table aren't
// in the generated Database type yet (regenerate after migration applies).
type CommunityDb = SupabaseClient;
function db(): CommunityDb {
  return createAdminClient() as unknown as CommunityDb;
}

// ── Public read helpers (used by /onboarding card) ───────────────────────────

/**
 * Read the invite URL from env. Returns null when unset – the onboarding card
 * uses null as the signal to render the "Maryan will email you when the room
 * opens" placeholder state.
 *
 * Set in Vercel dashboard via env var COMMUNITY_INVITE_URL.
 * Reference: project_unlocksaas_vercel.md memory.
 */
export function getCommunityInviteUrl(): string | null {
  const raw = process.env.COMMUNITY_INVITE_URL?.trim();
  if (!raw) return null;
  try {
    new URL(raw);
  } catch {
    console.warn(
      `[community] COMMUNITY_INVITE_URL is set but not a valid URL: ${raw}`,
    );
    return null;
  }
  return raw;
}

/**
 * Infer the platform name from the invite URL host so the email + onboarding
 * card copy say "Discord" or "Skool" specifically. Falls back to "other" for
 * unrecognised hosts (custom Circle / Mighty Networks / Slack workspaces).
 */
export function detectCommunityPlatform(
  url: string | null = getCommunityInviteUrl(),
): CommunityPlatform {
  if (!url) return "other";
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "other";
  }
  if (host === "discord.gg" || host.endsWith(".discord.com") || host === "discord.com") {
    return "discord";
  }
  if (host === "skool.com" || host.endsWith(".skool.com")) {
    return "skool";
  }
  return "other";
}

/**
 * Human-readable platform label for copy. "Skool", "Discord", or "the community
 * room" for unrecognised hosts.
 */
export function communityPlatformLabel(platform: CommunityPlatform): string {
  if (platform === "skool") return "Skool";
  if (platform === "discord") return "Discord";
  return "the community room";
}

// ── Audit log ────────────────────────────────────────────────────────────────

interface RecordEventArgs {
  profile_id?: string | null;
  email: string;
  event_type: CommunityEventType;
  source: CommunityEventSource;
  stripe_customer_id?: string | null;
  stripe_event_id?: string | null;
  invite_url?: string | null;
  platform?: CommunityPlatform | null;
  detail?: Record<string, unknown> | null;
}

/**
 * Append a row to community_access_events. Best-effort: if the table does not
 * exist (migration not applied) we log and return without raising. Callers
 * should not branch on the return value.
 */
async function recordEvent(args: RecordEventArgs): Promise<void> {
  try {
    const { error } = await db()
      .from("community_access_events")
      .insert({
        profile_id: args.profile_id ?? null,
        email: args.email.trim().toLowerCase(),
        event_type: args.event_type,
        source: args.source,
        stripe_customer_id: args.stripe_customer_id ?? null,
        stripe_event_id: args.stripe_event_id ?? null,
        invite_url: args.invite_url ?? null,
        platform: args.platform ?? null,
        detail: args.detail ?? null,
      });
    if (error) {
      console.warn(
        `[community] recordEvent(${args.event_type}) skipped: ${error.message}`,
      );
    }
  } catch (err) {
    console.warn(
      `[community] recordEvent(${args.event_type}) threw:`,
      err instanceof Error ? err.message : err,
    );
  }
}

// ── Profile mutators ─────────────────────────────────────────────────────────

/**
 * Stamp profiles.community_access_granted_at = now() if it is null OR the
 * previous grant was revoked. Returns true on a fresh stamp, false if the
 * row already had a live grant (idempotent), null if the columns do not
 * exist yet (migration pending).
 */
async function stampGrantOnProfile(profileId: string): Promise<boolean | null> {
  try {
    const { data: row, error: readErr } = await db()
      .from("profiles")
      .select(
        "community_access_granted_at,community_access_revoked_at",
      )
      .eq("id", profileId)
      .maybeSingle();
    if (readErr) {
      console.warn(`[community] stampGrantOnProfile read error: ${readErr.message}`);
      return null;
    }
    if (!row) return null;

    const granted = (row as { community_access_granted_at?: string | null })
      .community_access_granted_at;
    const revoked = (row as { community_access_revoked_at?: string | null })
      .community_access_revoked_at;
    const stillLive =
      granted != null && (revoked == null || revoked < granted);
    if (stillLive) return false;

    const { error: writeErr } = await db()
      .from("profiles")
      .update({
        community_access_granted_at: new Date().toISOString(),
        community_access_revoked_at: null,
      })
      .eq("id", profileId);
    if (writeErr) {
      console.warn(`[community] stampGrantOnProfile write error: ${writeErr.message}`);
      return null;
    }
    return true;
  } catch (err) {
    console.warn(
      "[community] stampGrantOnProfile threw:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Stamp profiles.community_access_revoked_at = now() so the operator
 * dashboard query "who has live access" excludes this row.
 *
 * SHORT-CIRCUIT: if the profile holds a lifetime seat (community_lifetime_at
 * is non-null) the revoke is silently skipped. The $297 OTO promises lifetime
 * access regardless of any subsequent Core subscription state, and the audit
 * + onboarding card still need to read "live access" as true for the row.
 */
async function stampRevokeOnProfile(profileId: string): Promise<void> {
  try {
    // Read lifetime flag first – if set, do NOT touch revoked_at.
    const { data: row } = await db()
      .from("profiles")
      .select("community_lifetime_at")
      .eq("id", profileId)
      .maybeSingle();
    const lifetimeAt = (row as { community_lifetime_at?: string | null } | null)
      ?.community_lifetime_at;
    if (lifetimeAt) {
      console.log(
        `[community] stampRevokeOnProfile skipped for ${profileId}: lifetime seat at ${lifetimeAt}`,
      );
      return;
    }

    const { error } = await db()
      .from("profiles")
      .update({ community_access_revoked_at: new Date().toISOString() })
      .eq("id", profileId);
    if (error) {
      console.warn(`[community] stampRevokeOnProfile error: ${error.message}`);
    }
  } catch (err) {
    console.warn(
      "[community] stampRevokeOnProfile threw:",
      err instanceof Error ? err.message : err,
    );
  }
}

/**
 * Stamp profiles.community_lifetime_at = now() if it is null. Idempotent –
 * already-set rows return true without re-stamping. Returns null when the
 * column does not exist yet (migration pending) so the caller can degrade.
 *
 * The lifetime stamp is intentionally separate from community_access_granted_at:
 *   - community_access_granted_at = "currently has access" (subscription-linked)
 *   - community_lifetime_at = "paid for permanent access via the $297 OTO"
 * Both can be set simultaneously; the union "has access" is computed at the
 * onboarding-card layer.
 */
async function stampLifetimeOnProfile(profileId: string): Promise<boolean | null> {
  try {
    const { data: row, error: readErr } = await db()
      .from("profiles")
      .select("community_lifetime_at")
      .eq("id", profileId)
      .maybeSingle();
    if (readErr) {
      console.warn(`[community] stampLifetimeOnProfile read error: ${readErr.message}`);
      return null;
    }
    if (!row) return null;
    const existing = (row as { community_lifetime_at?: string | null })
      .community_lifetime_at;
    if (existing) return true; // already lifetime; idempotent

    const nowIso = new Date().toISOString();
    const { error: writeErr } = await db()
      .from("profiles")
      .update({
        community_lifetime_at: nowIso,
        // Also clear any prior revoke + (re)stamp granted_at so the dashboard
        // reads "live access" without having to special-case the lifetime row.
        community_access_granted_at: nowIso,
        community_access_revoked_at: null,
      })
      .eq("id", profileId);
    if (writeErr) {
      console.warn(`[community] stampLifetimeOnProfile write error: ${writeErr.message}`);
      return null;
    }
    return true;
  } catch (err) {
    console.warn(
      "[community] stampLifetimeOnProfile threw:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

/**
 * Stamp invite_sent_at / increment invite_sent_count on the profile. Used by
 * grant + manual resend paths so the onboarding card can render "we sent your
 * invite – check your email at <when>" honestly.
 */
async function stampInviteSentOnProfile(
  profileId: string,
  countDelta: number = 1,
): Promise<void> {
  try {
    const { data: row } = await db()
      .from("profiles")
      .select("community_invite_sent_count")
      .eq("id", profileId)
      .maybeSingle();
    const current =
      (row as { community_invite_sent_count?: number | null } | null)
        ?.community_invite_sent_count ?? 0;
    const { error } = await db()
      .from("profiles")
      .update({
        community_invite_sent_at: new Date().toISOString(),
        community_invite_sent_count: current + countDelta,
      })
      .eq("id", profileId);
    if (error) {
      console.warn(`[community] stampInviteSentOnProfile error: ${error.message}`);
    }
  } catch (err) {
    console.warn(
      "[community] stampInviteSentOnProfile threw:",
      err instanceof Error ? err.message : err,
    );
  }
}

// ── Public grant / revoke API ────────────────────────────────────────────────

interface GrantArgs {
  profile: CommunityProfile;
  source: CommunityEventSource;
  stripeCustomerId?: string | null;
  stripeEventId?: string | null;
}

/**
 * Grant Core community access to a profile.
 *
 * Idempotent: a second call against a profile that already has a live grant
 * is a no-op (no duplicate email, no duplicate audit row beyond a single
 * granted event we silently skip).
 *
 * Flow:
 *   1. Stamp profiles.community_access_granted_at if missing/revoked.
 *   2. If COMMUNITY_INVITE_URL is set AND we have not already sent an invite
 *      this grant-cycle, send the invite email and stamp invite_sent_at.
 *   3. Append "granted" + ("invite_sent" | "invite_failed") rows to the audit.
 *
 * Returns true if any state change occurred, false if the grant was already
 * live (no-op).
 */
export async function grantCoreCommunityAccess(args: GrantArgs): Promise<boolean> {
  const { profile, source, stripeCustomerId, stripeEventId } = args;
  const inviteUrl = getCommunityInviteUrl();
  const platform = detectCommunityPlatform(inviteUrl);

  const stamped = await stampGrantOnProfile(profile.id);
  if (stamped === false) return false; // already live, idempotent no-op
  // stamped === null → migration pending; still emit audit + try to email.

  await recordEvent({
    profile_id: profile.id,
    email: profile.email,
    event_type: "granted",
    source,
    stripe_customer_id: stripeCustomerId,
    stripe_event_id: stripeEventId,
    invite_url: inviteUrl,
    platform,
  });

  if (!inviteUrl) {
    // Operator has not pasted the Discord/Skool URL yet. Grant is recorded;
    // when the URL lands in env, the onboarding "Resend invite" CTA can
    // backfill, or a one-shot operator script can sweep ungranted-but-paid
    // members.
    console.log(
      `[community] grant recorded without invite (COMMUNITY_INVITE_URL unset) for ${profile.email}`,
    );
    return true;
  }

  try {
    const sent = await sendCommunityInviteEmail({
      to: profile.email,
      builderName: profile.builder_name ?? null,
      inviteUrl,
      platform,
    });
    if (sent) {
      await stampInviteSentOnProfile(profile.id);
      await recordEvent({
        profile_id: profile.id,
        email: profile.email,
        event_type: source === "stripe_webhook" ? "invite_sent" : "invite_resent",
        source,
        stripe_customer_id: stripeCustomerId,
        invite_url: inviteUrl,
        platform,
      });
    } else {
      await recordEvent({
        profile_id: profile.id,
        email: profile.email,
        event_type: "invite_failed",
        source,
        stripe_customer_id: stripeCustomerId,
        invite_url: inviteUrl,
        platform,
        detail: { reason: "sendCommunityInviteEmail returned false" },
      });
    }
  } catch (err) {
    console.error(
      `[community] invite email threw for ${profile.email}:`,
      err instanceof Error ? err.message : err,
    );
    await recordEvent({
      profile_id: profile.id,
      email: profile.email,
      event_type: "invite_failed",
      source,
      stripe_customer_id: stripeCustomerId,
      invite_url: inviteUrl,
      platform,
      detail: { error: err instanceof Error ? err.message : String(err) },
    });
  }

  return true;
}

interface RevokeArgs {
  profile: CommunityProfile;
  source: CommunityEventSource;
  stripeCustomerId?: string | null;
  stripeEventId?: string | null;
}

/**
 * Revoke Core community access. Stamps profile + appends "revoked" audit row.
 *
 * Does NOT call any platform API to remove the user – manual removal is the
 * operator's job until the chosen platform (Skool or Discord) is wired in v2.
 * The audit row exists so the operator can grep "revoked since YYYY-MM-DD" and
 * batch-remove with one Discord/Skool admin pass per week.
 *
 * Idempotent: if the profile was never granted or is already revoked, this
 * still records a "revoked" event (the operator can dedupe). The double-write
 * cost is negligible vs. the operational risk of a dropped revoke.
 */
export async function revokeCoreCommunityAccess(args: RevokeArgs): Promise<void> {
  const { profile, source, stripeCustomerId, stripeEventId } = args;
  const inviteUrl = getCommunityInviteUrl();
  const platform = detectCommunityPlatform(inviteUrl);

  await stampRevokeOnProfile(profile.id);

  await recordEvent({
    profile_id: profile.id,
    email: profile.email,
    event_type: "revoked",
    source,
    stripe_customer_id: stripeCustomerId,
    stripe_event_id: stripeEventId,
    invite_url: inviteUrl,
    platform,
    detail: { note: "manual platform removal pending operator action" },
  });
}

// ── Webhook-facing entry points ──────────────────────────────────────────────

/**
 * Webhook glue: load the profile by id and grant. Wraps the work in `after()`
 * so the Stripe webhook can return 200 immediately while the grant + invite
 * email run in the background (Fluid Compute keeps the function warm).
 *
 * Failures inside `after()` are swallowed but logged. The webhook itself
 * never throws because of community-side errors – billing always takes
 * precedence.
 */
export function scheduleGrantForCheckout(opts: {
  profileId: string;
  email: string;
  stripeCustomerId: string | null;
  stripeEventId: string | null;
  source: CommunityEventSource;
}): void {
  const { profileId, email, stripeCustomerId, stripeEventId, source } = opts;
  after(async () => {
    try {
      // Load extra profile fields needed for the email greeting.
      const { data: row } = await db()
        .from("profiles")
        .select("id,email,builder_name,product_name")
        .eq("id", profileId)
        .maybeSingle();
      const profile: CommunityProfile = (row as CommunityProfile | null) ?? {
        id: profileId,
        email,
      };
      await grantCoreCommunityAccess({
        profile,
        source,
        stripeCustomerId,
        stripeEventId,
      });
    } catch (err) {
      console.error(
        "[community] scheduleGrantForCheckout failed:",
        err instanceof Error ? err.message : err,
      );
    }
  });
}

/**
 * Webhook glue: grant LIFETIME community access for the $297 OTO #2 buyer.
 *
 * Two stamps land on the profile:
 *   - community_lifetime_at  → permanent; survives subscription cancel
 *   - community_access_granted_at → re-stamped so the onboarding card reads
 *                                    "live access" immediately
 *
 * Then we call the same grantCoreCommunityAccess() helper Core uses so the
 * invite email + audit event fire through the same Resend template and audit
 * row. Both writes are idempotent; replaying the same Stripe event is safe.
 *
 * Wrapped in `after()` so the 200 OK to Stripe is not held by Resend +
 * Supabase round-trips for the email send.
 */
export function scheduleLifetimeGrantForCheckout(opts: {
  profileId: string;
  email: string;
  stripeCustomerId: string | null;
  stripeEventId: string | null;
  source: CommunityEventSource;
}): void {
  const { profileId, email, stripeCustomerId, stripeEventId, source } = opts;
  after(async () => {
    try {
      const stamped = await stampLifetimeOnProfile(profileId);
      if (stamped === null) {
        console.warn(
          `[community] lifetime stamp skipped for ${profileId}: migration pending`,
        );
        // Fall through – we still want to fire the invite email so the
        // buyer isn't left hanging while the operator applies the migration.
      }
      const { data: row } = await db()
        .from("profiles")
        .select("id,email,builder_name,product_name")
        .eq("id", profileId)
        .maybeSingle();
      const profile: CommunityProfile = (row as CommunityProfile | null) ?? {
        id: profileId,
        email,
      };
      await grantCoreCommunityAccess({
        profile,
        source,
        stripeCustomerId,
        stripeEventId,
      });
    } catch (err) {
      console.error(
        "[community] scheduleLifetimeGrantForCheckout failed:",
        err instanceof Error ? err.message : err,
      );
    }
  });
}

/**
 * Webhook glue: load the profile by Stripe customer id and revoke.
 */
export function scheduleRevokeForCustomer(opts: {
  stripeCustomerId: string;
  stripeEventId: string | null;
  source: CommunityEventSource;
}): void {
  const { stripeCustomerId, stripeEventId, source } = opts;
  after(async () => {
    try {
      const { data: row } = await db()
        .from("profiles")
        .select("id,email,builder_name,product_name")
        .eq("stripe_customer_id", stripeCustomerId)
        .maybeSingle();
      if (!row) {
        console.warn(
          `[community] scheduleRevokeForCustomer: no profile for ${stripeCustomerId}`,
        );
        return;
      }
      await revokeCoreCommunityAccess({
        profile: row as CommunityProfile,
        source,
        stripeCustomerId,
        stripeEventId,
      });
    } catch (err) {
      console.error(
        "[community] scheduleRevokeForCustomer failed:",
        err instanceof Error ? err.message : err,
      );
    }
  });
}

// ── Onboarding state (read-only) ─────────────────────────────────────────────

export interface CommunityCardState {
  /** True when the operator has set COMMUNITY_INVITE_URL in env. */
  configured: boolean;
  /** Detected platform for copy purposes. */
  platform: CommunityPlatform;
  platformLabel: string;
  /** The invite URL, or null when unconfigured. */
  inviteUrl: string | null;
  /** True when this profile has a live grant (granted and not revoked). */
  hasLiveAccess: boolean;
  /** ISO timestamp when access was granted, or null. */
  grantedAt: string | null;
  /** ISO timestamp when last invite email left, or null. */
  inviteSentAt: string | null;
  /** Number of invite emails sent for this profile. */
  inviteSentCount: number;
}

/**
 * Build the data the /onboarding CommunityCard needs without exposing the
 * underlying schema or admin client to the page. Read-only.
 */
export async function getCommunityCardState(profileId: string): Promise<CommunityCardState> {
  const inviteUrl = getCommunityInviteUrl();
  const platform = detectCommunityPlatform(inviteUrl);
  const platformLabel = communityPlatformLabel(platform);

  let grantedAt: string | null = null;
  let revokedAt: string | null = null;
  let inviteSentAt: string | null = null;
  let inviteSentCount = 0;

  try {
    const { data: row } = await db()
      .from("profiles")
      .select(
        "community_access_granted_at,community_access_revoked_at,community_invite_sent_at,community_invite_sent_count",
      )
      .eq("id", profileId)
      .maybeSingle();
    if (row) {
      const r = row as {
        community_access_granted_at?: string | null;
        community_access_revoked_at?: string | null;
        community_invite_sent_at?: string | null;
        community_invite_sent_count?: number | null;
      };
      grantedAt = r.community_access_granted_at ?? null;
      revokedAt = r.community_access_revoked_at ?? null;
      inviteSentAt = r.community_invite_sent_at ?? null;
      inviteSentCount = r.community_invite_sent_count ?? 0;
    }
  } catch (err) {
    // Migration not applied yet – return the safe pre-migration shape.
    console.warn(
      "[community] getCommunityCardState read failed (migration pending?):",
      err instanceof Error ? err.message : err,
    );
  }

  const hasLiveAccess =
    grantedAt != null && (revokedAt == null || revokedAt < grantedAt);

  return {
    configured: inviteUrl != null,
    platform,
    platformLabel,
    inviteUrl,
    hasLiveAccess,
    grantedAt,
    inviteSentAt,
    inviteSentCount,
  };
}
