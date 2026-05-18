/**
 * Onboarding state assembler.
 *
 * After a Core checkout completes, the user is sent to /onboarding (see
 * /api/checkout/route.ts). The page shows three cards:
 *
 *   1. Your 60-day clock — sourced from profiles.guarantee_expires_at
 *      (the webhook sets this on the first invoice.payment_succeeded with
 *      billing_reason='subscription_create'; see api/webhooks/stripe).
 *
 *   2. Carry over from the $1 Starter — if project_state.dream_customer or
 *      project_state.offer are populated, surface them. Otherwise link to
 *      Playbook Step 1.
 *
 *   3. Connect your Stripe — the user's OWN Stripe account, used by
 *      verified_conversions to detect their first paying customer. This
 *      gives the guarantee verifier (lib/guarantee.ts) a signal it can act
 *      on. Without it, "first paying customer detected" can only be entered
 *      manually by the operator.
 *
 * The assembler runs as a Server Component with the RLS-respecting client.
 * It also lazily creates the `projects` row on first visit so the user
 * never sees a 500 if their checkout fired before any project state existed.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export interface OnboardingProfile {
  id: string;
  email: string;
  tier: "none" | "starter" | "core";
  starter_purchased_at: string | null;
  core_started_at: string | null;
  guarantee_expires_at: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
}

export interface OnboardingProject {
  id: string;
  user_id: string;
  name: string;
}

export interface OnboardingStripeConnection {
  stripe_account_id: string;
  connected_at: string;
  disconnected_at: string | null;
}

export interface StarterCarryover {
  has_dream_customer: boolean;
  has_offer: boolean;
  dream_customer_summary: string | null;
  offer_summary: string | null;
}

export interface ClockState {
  status: "running" | "pending" | "expired";
  /** ms from now to expiry; negative once expired; 0 if not yet started. */
  msRemaining: number;
  daysRemaining: number;
  startedAt: Date | null;
  expiresAt: Date | null;
}

export interface OnboardingStatus {
  profile: OnboardingProfile | null;
  project: OnboardingProject;
  stripeConnection: OnboardingStripeConnection | null;
  starterCarryover: StarterCarryover;
  clock: ClockState;
}

/**
 * Ensure the signed-in user has a single `projects` row, and return it.
 * Idempotent: re-running returns the same row.
 *
 * Uses the admin client because RLS on `projects` requires auth.uid() = user_id
 * and the INSERT-then-SELECT pattern can race with a parallel insert from
 * another tab. The admin client also lets us upsert without UPDATE policies.
 */
export async function getOrCreateProject(
  userId: string,
  userEmail: string | null
): Promise<OnboardingProject> {
  const admin = createAdminClient();

  // Try to read the existing project first.
  const { data: existing } = await admin
    .from("projects")
    .select("id,user_id,name")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    return existing as OnboardingProject;
  }

  // Otherwise insert. The unique index on user_id catches races.
  const defaultName = userEmail ? `${userEmail.split("@")[0]}'s Playbook` : "My Playbook";
  const { data: created, error } = await admin
    .from("projects")
    .insert({ user_id: userId, name: defaultName })
    .select("id,user_id,name")
    .single();

  if (error) {
    // Race with a parallel insert — re-read.
    const { data: retry } = await admin
      .from("projects")
      .select("id,user_id,name")
      .eq("user_id", userId)
      .single();
    if (retry) return retry as OnboardingProject;
    throw new Error(`getOrCreateProject: ${error.message}`);
  }

  // Initialize an empty project_state row so later upserts have something to
  // patch. project_state.project_id is the PK so this is also idempotent.
  await admin
    .from("project_state")
    .upsert({ project_id: created.id }, { onConflict: "project_id" });

  return created as OnboardingProject;
}

/**
 * Load the profile row by user_id. Returns null if no profile exists yet
 * (this happens when the user signs up before any Stripe checkout completes).
 */
export async function getProfileByUserId(
  db: SupabaseClient,
  userId: string
): Promise<OnboardingProfile | null> {
  const { data } = await db
    .from("profiles")
    .select(
      "id,email,tier,starter_purchased_at,core_started_at,guarantee_expires_at,subscription_status,stripe_customer_id"
    )
    .eq("user_id", userId)
    .maybeSingle();
  return (data ?? null) as OnboardingProfile | null;
}

/**
 * Fallback profile lookup by email. Used when the auth.users → profiles link
 * hasn't fired yet (e.g. the link_profile_on_user_create trigger is racing
 * with the user's first /onboarding request).
 */
export async function getProfileByEmail(
  db: SupabaseClient,
  email: string
): Promise<OnboardingProfile | null> {
  const { data } = await db
    .from("profiles")
    .select(
      "id,email,tier,starter_purchased_at,core_started_at,guarantee_expires_at,subscription_status,stripe_customer_id"
    )
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return (data ?? null) as OnboardingProfile | null;
}

/**
 * Read project_state for the given project and summarize what (if anything)
 * was filled in during the $1 Starter (Playbook Steps 1 + 2).
 *
 * The shape of dream_customer/offer is the assembled output from the engine
 * route (see /api/engine/route.ts). We don't try to validate the shape —
 * we just report what's present so the onboarding UI can mention it.
 */
export async function getStarterCarryover(
  db: SupabaseClient,
  projectId: string
): Promise<StarterCarryover> {
  const { data } = await db
    .from("project_state")
    .select("dream_customer, offer")
    .eq("project_id", projectId)
    .maybeSingle();

  const dreamCustomer = (data?.dream_customer ?? null) as Record<string, unknown> | null;
  const offer = (data?.offer ?? null) as Record<string, unknown> | null;

  return {
    has_dream_customer: dreamCustomer !== null,
    has_offer: offer !== null,
    dream_customer_summary: summarizeJsonRecord(dreamCustomer, [
      "name",
      "headline",
      "summary",
      "description",
    ]),
    offer_summary: summarizeJsonRecord(offer, [
      "headline",
      "promise",
      "summary",
      "description",
    ]),
  };
}

function summarizeJsonRecord(
  record: Record<string, unknown> | null,
  preferredKeys: string[]
): string | null {
  if (!record) return null;
  for (const key of preferredKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim().slice(0, 240);
    }
  }
  // Fall back to the first string field.
  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim().slice(0, 240);
    }
  }
  return null;
}

/**
 * Read the stripe_connections row for the given project. Returns null if the
 * user hasn't connected (or has disconnected).
 */
export async function getStripeConnection(
  db: SupabaseClient,
  projectId: string
): Promise<OnboardingStripeConnection | null> {
  const { data } = await db
    .from("stripe_connections")
    .select("stripe_account_id, connected_at, disconnected_at")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;
  if (data.disconnected_at) return null;
  return data as OnboardingStripeConnection;
}

/**
 * Compute the 60-day clock state from the profile.
 *
 *   pending  → profile has no core_started_at yet. Either webhook hasn't
 *              fired or the user is on Starter. UI shows "Will start when
 *              your first $49 invoice clears."
 *   running  → core_started_at set, expiry in the future.
 *   expired  → core_started_at set, expiry passed.
 */
export function computeClockState(
  profile: OnboardingProfile | null,
  now: Date = new Date()
): ClockState {
  if (!profile?.core_started_at) {
    return {
      status: "pending",
      msRemaining: 0,
      daysRemaining: 0,
      startedAt: null,
      expiresAt: null,
    };
  }

  const startedAt = new Date(profile.core_started_at);
  const expiresAt = profile.guarantee_expires_at
    ? new Date(profile.guarantee_expires_at)
    : new Date(startedAt.getTime() + SIXTY_DAYS_MS);

  const msRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));

  return {
    status: msRemaining > 0 ? "running" : "expired",
    msRemaining,
    daysRemaining,
    startedAt,
    expiresAt,
  };
}

/**
 * One-shot: load everything the /onboarding page needs in a single async
 * pass. Uses the RLS-respecting server client for reads the user is allowed
 * to make directly, and the admin client only for project creation.
 */
export async function getOnboardingStatus(args: {
  userId: string;
  email: string;
}): Promise<OnboardingStatus> {
  const db = await createClient();
  const admin = createAdminClient();

  // Profile lookup: prefer by user_id, fall back to email (in case the
  // link_profile_on_user_create trigger has not yet fired).
  let profile = await getProfileByUserId(db, args.userId);
  if (!profile && args.email) {
    // Use admin to avoid RLS blocking when user_id is still null on the row.
    profile = await getProfileByEmail(admin, args.email);
  }

  const project = await getOrCreateProject(args.userId, args.email);

  // Run the remaining reads in parallel — they're independent.
  const [stripeConnection, starterCarryover] = await Promise.all([
    getStripeConnection(db, project.id),
    getStarterCarryover(db, project.id),
  ]);

  return {
    profile,
    project,
    stripeConnection,
    starterCarryover,
    clock: computeClockState(profile),
  };
}
