/**
 * Dream 100 touch log — typed wrapper around the `dream_100_touches` table.
 *
 * Chapter: DCS Secret #13 (Other People's Funnels) — Brunson rule #7
 *          ("track every touch or it didn't happen")
 * Canonical doc: strategy/other-peoples-funnels.md §1, §5, §8
 * Migration:     supabase/migrations/20260518000007_dream_100_touches.sql
 * Views:         supabase/views/dream_100_touches.sql
 *
 * This module is server-only — the underlying table is RLS-locked with no
 * anon or authenticated read/write. All inserts go through the service-role
 * client. The Friday Audible Call dashboards (the five vw_* views) are read
 * separately, also service-role only.
 *
 * Insert path: today this is called from scripts/log-touch.py (planned). When
 * the in-product touch-logging UI ships post-launch, it calls this module
 * from a /api/dream-100/touches route guarded by the magic-link operator
 * session (operator = Maryan only).
 */

import { createServerClient } from "@/lib/supabase";

// Channel + action_type vocabularies mirror the CHECK constraints in the
// migration. Keep them in sync if either side changes.

export const TOUCH_CHANNELS = [
  // Cat 1 communities
  "community_reply",
  "community_post",
  "ih_reply",
  "ih_longform",
  "reddit_reply",
  "reddit_post",
  "lovable_discord",
  // Cat 2 individuals
  "x_reply",
  "x_dm",
  "newsletter_reply",
  // Cat 3 podcasts
  "podcast_pitch",
  "podcast_recorded",
  "podcast_live",
  // Cat 5 partner SaaS / integrations
  "integration_warmup",
  "integration_pitch",
  "integration_active",
  // Summit
  "summit_pitch",
  "summit_confirmed",
  "summit_promoting",
  // Affiliate
  "affiliate_application",
  "affiliate_approved",
  "affiliate_first_conversion",
  // Internal
  "correction",
] as const;

export type TouchChannel = (typeof TOUCH_CHANNELS)[number];

export const TOUCH_ACTION_TYPES = [
  "follow",
  "read",
  "public_reply",
  "community_reply",
  "newsletter_reply",
  "dm",
  "dm_response",
  "pitch",
  "pitch_response",
  "agreement",
  "go_live",
  "correction",
] as const;

export type TouchActionType = (typeof TOUCH_ACTION_TYPES)[number];

/**
 * Tier-A and Tier-B target categories per dream-100-outreach.md §2.
 * Used by the views to bucket targets; documented here for ergonomic typing.
 */
export const TARGET_CATEGORIES = [
  "cat_1_community",
  "cat_2_influencer",
  "cat_3_podcast",
  "cat_4_newsletter",
  "cat_5_partner_saas",
  "cat_6_youtube",
  "cat_7_blog",
] as const;

export type TargetCategory = (typeof TARGET_CATEGORIES)[number];

export interface TouchInsert {
  targetDream100Id?: number;
  targetHandle: string;
  targetCategory: TargetCategory;
  channel: TouchChannel;
  actionType: TouchActionType;
  publicUrl?: string;
  messageExcerpt?: string;
  responseExcerpt?: string;
  founderConfirmedAt?: string;
  founderNotes?: string;
  sourceSubjectId?: string;
  sourceCookieValue?: string;
  correctsTouchId?: string;
}

export interface TouchRow extends TouchInsert {
  id: string;
  createdAt: string;
}

/**
 * Insert one touch row. Service-role only.
 * Returns the created row's id, or throws on validation failure.
 *
 * Caller is responsible for one prior check: if action_type='dm', the OPF
 * playbook's warm-up rule (≥2 prior public_reply rows for the same target
 * in the previous 30 days) must already be satisfied. This is enforced
 * downstream by vw_dream_100_warmup_violations rather than blocked here,
 * because the founder may have a legitimate reason to override (e.g.,
 * warm-up happened off-platform). Violations are visible in the Friday
 * Audible Call view.
 */
export async function logTouch(touch: TouchInsert): Promise<string> {
  // Validate enums client-side for early failure (CHECK constraint catches at DB
  // layer too, but error UX is better here).
  if (!TOUCH_CHANNELS.includes(touch.channel)) {
    throw new Error(
      `Invalid channel: ${touch.channel}. Must be one of: ${TOUCH_CHANNELS.join(", ")}`,
    );
  }
  if (!TOUCH_ACTION_TYPES.includes(touch.actionType)) {
    throw new Error(
      `Invalid actionType: ${touch.actionType}. Must be one of: ${TOUCH_ACTION_TYPES.join(", ")}`,
    );
  }
  if (!TARGET_CATEGORIES.includes(touch.targetCategory)) {
    throw new Error(
      `Invalid targetCategory: ${touch.targetCategory}. Must be one of: ${TARGET_CATEGORIES.join(", ")}`,
    );
  }
  if (!touch.targetHandle || touch.targetHandle.trim().length === 0) {
    throw new Error("targetHandle is required and cannot be empty");
  }
  // Truncate excerpts at 200 chars (audit + dedup; full content lives in the
  // public_url for public replies).
  const trim = (s: string | undefined, n: number) =>
    s ? s.slice(0, n) : undefined;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("dream_100_touches")
    .insert({
      target_dream_100_id: touch.targetDream100Id ?? null,
      target_handle: touch.targetHandle.trim().toLowerCase(),
      target_category: touch.targetCategory,
      channel: touch.channel,
      action_type: touch.actionType,
      public_url: touch.publicUrl ?? null,
      message_excerpt: trim(touch.messageExcerpt, 200) ?? null,
      response_excerpt: trim(touch.responseExcerpt, 200) ?? null,
      founder_confirmed_at: touch.founderConfirmedAt ?? null,
      founder_notes: touch.founderNotes ?? null,
      source_subject_id: touch.sourceSubjectId ?? null,
      source_cookie_value: touch.sourceCookieValue ?? null,
      corrects_touch_id: touch.correctsTouchId ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to log touch: ${error?.message ?? "unknown"}`);
  }
  return data.id as string;
}

/**
 * Read the staleness view for the Friday Audible Call.
 * Returns Tier A/B targets with no touch in the last 7+ days.
 */
export interface StaleTarget {
  target_handle: string;
  tier: "A" | "B";
  last_touch_at: string | null;
  days_since_last_touch: number;
  staleness: "stale_never" | "stale_14d" | "stale_7d" | "fresh";
}

export async function readStaleTargets(): Promise<StaleTarget[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("vw_dream_100_targets_stale")
    .select("*");
  if (error || !data) return [];
  return data as StaleTarget[];
}

/**
 * Read the warm-up violations view for the Friday Audible Call.
 * Returns DMs sent with <2 prior public-reply rows in the previous 30 days.
 * Empty result is the desired state.
 */
export interface WarmupViolation {
  dm_touch_id: string;
  target_handle: string;
  dm_sent_at: string;
  dm_excerpt: string | null;
  dm_url: string | null;
  prior_reply_count_30d: number;
  violation_severity: "critical_no_warmup" | "warning_thin_warmup" | "ok";
}

export async function readWarmupViolations(): Promise<WarmupViolation[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("vw_dream_100_warmup_violations")
    .select("*");
  if (error || !data) return [];
  return data as WarmupViolation[];
}

/**
 * Read the cadence health view for the Friday Audible Call.
 * Returns rolling 4-week touches per Tier-A/B target with red/yellow/green status.
 */
export interface CadenceHealth {
  target_handle: string;
  tier: "A" | "B";
  total_touches_4w: number;
  active_weeks: number;
  touches_per_week_avg: number;
  cadence_status: "red_undercadence" | "yellow" | "green" | "unknown";
}

export async function readCadenceHealth(): Promise<CadenceHealth[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("vw_dream_100_cadence_health")
    .select("*");
  if (error || !data) return [];
  return data as CadenceHealth[];
}
