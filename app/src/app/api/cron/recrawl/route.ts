import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { deepAnalyzeUrl, type DeepDiagnosticResult } from "@/lib/diagnostic";
import { computeDelta, shouldAlert } from "@/lib/recrawl";
import { sendRecrawlEmail, sendSlackRecrawlAlert } from "@/lib/recrawl-email";
import { buildRecrawlMuteUrl } from "@/lib/recrawl-tokens";

// 5 minutes ceiling. Each user's deepAnalyzeUrl call typically resolves in
// 8-30s (fetch + Claude Sonnet 4.6); cap PER_RUN_LIMIT keeps the worst-case
// fan-out comfortably inside that. The cron runs daily, so any user we
// skip today gets picked up tomorrow — there is no irrecoverable miss.
export const maxDuration = 300;

/**
 * GET /api/cron/recrawl
 *
 * Scheduled daily via vercel.json. Each active Core subscriber is re-scored
 * at most once per ISO week (idempotency enforced at the table level via
 * the unique constraint on (user_id, week_of)). Picks the staleset users
 * first so the cadence stays even across the cohort.
 *
 * Per-run pipeline for each due user:
 *   1. Look up the most recent diagnostic_leads row by email to get the
 *      canonical product_url. Skip if missing (extremely defensive — a
 *      paying Core subscriber should always have done the diagnostic, but
 *      we never want to crawl a URL we can't justify).
 *   2. Call deepAnalyzeUrl(product_url). On failure, write a recrawl_alerts
 *      row with status='crawl_failed' and continue.
 *   3. Persist the result to diagnostic_snapshots (ON CONFLICT DO NOTHING
 *      keyed on user_id + week_of). The previous snapshot, if any, becomes
 *      the diff base.
 *   4. Compute the delta. Decide via shouldAlert() whether to notify.
 *   5. If alerting and recrawl_alerts_enabled = true: send the Resend email
 *      and, if SLACK_WEBHOOK_URL is set, tee a Slack message.
 *   6. Always write a recrawl_alerts audit row capturing what happened.
 *
 * The route is intentionally synchronous-per-user (no Promise.all): we have
 * a single Anthropic API budget and a single Resend reputation, and the
 * volume is small. If volume grows, the right migration is Vercel Queues
 * or Workflow DevKit, not faster fan-out.
 */

const PER_RUN_LIMIT = 25;
const MIN_DAYS_BETWEEN_CRAWLS = 6; // weekly cadence, with 1-day grace.

type DueUser = {
  user_id: string;
  email: string;
  recrawl_alerts_enabled: boolean;
  product_url: string;
  last_scored_at: string | null;
};

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (expected && provided !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (process.env.RECRAWL_AGENT_ENABLED !== "true") {
    // Hard kill switch. Until the operator sets RECRAWL_AGENT_ENABLED=true
    // in Vercel, the cron is a no-op that 200s. Lets us schedule the route
    // (and pay the build cost) without firing LLM + email volume the
    // operator hasn't approved yet.
    return NextResponse.json({
      ok: true,
      processed: 0,
      reason: "RECRAWL_AGENT_ENABLED!=true",
    });
  }

  const supabase = createAdminClient();
  const due = await selectDueUsers(supabase);

  if (due.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let crawled = 0;
  let alerted = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of due) {
    const outcome = await processOne(supabase, user);
    if (outcome === "alerted") alerted++;
    else if (outcome === "skipped") skipped++;
    else if (outcome === "crawl_failed") failed++;
    crawled++;
  }

  console.log("[recrawl-cron] complete", {
    processed: due.length,
    crawled,
    alerted,
    skipped,
    failed,
  });

  return NextResponse.json({
    ok: true,
    processed: due.length,
    crawled,
    alerted,
    skipped,
    failed,
  });
}

// ---------------------------------------------------------------------------
// User selection
// ---------------------------------------------------------------------------

async function selectDueUsers(
  supabase: ReturnType<typeof createAdminClient>
): Promise<DueUser[]> {
  // 1. All active Core subscribers, in order of stalest-snapshot-first.
  //
  // The recrawl_alerts_enabled column is new (migration 20260521000020).
  // Until Supabase regenerates the types, we cast the result as unknown
  // and narrow to the shape we expect. In production, this select will
  // succeed once the migration is applied.
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "user_id, email, recrawl_alerts_enabled, tier, subscription_status, core_started_at"
    )
    .eq("tier", "core")
    .not("core_started_at", "is", null);

  if (profilesError) {
    console.error("[recrawl-cron] profiles_select_failed", profilesError);
    return [];
  }
  if (!profiles || profiles.length === 0) return [];

  // Filter canceled subscriptions in JS — Supabase REST has no easy
  // "is NULL or != 'canceled'" combinator and we already have the rows.
  // Cast through unknown to handle the ungenerated type for recrawl_alerts_enabled.
  const profilesTyped = profiles as unknown as Array<{
    user_id: string;
    email: string;
    recrawl_alerts_enabled?: boolean;
    tier: string;
    subscription_status: string;
    core_started_at: string;
  }>;

  const active = profilesTyped.filter(
    (p) =>
      p.subscription_status !== "canceled" &&
      p.subscription_status !== "incomplete_expired"
  );
  if (active.length === 0) return [];

  // 2. For each active profile, look up the latest snapshot scored_at.
  const userIds = active.map((p) => p.user_id);
  type SnapRow = { user_id: string; scored_at: string };
  // diagnostic_snapshots is new — cast through unknown until types regenerate.
  const snapshotsClient = supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        in: (
          col: string,
          ids: string[]
        ) => {
          order: (
            col: string,
            opts: { ascending: boolean }
          ) => Promise<{ data: SnapRow[] | null; error: { message: string } | null }>;
        };
      };
    };
  };
  const { data: snaps, error: snapsError } = await snapshotsClient
    .from("diagnostic_snapshots")
    .select("user_id, scored_at")
    .in("user_id", userIds)
    .order("scored_at", { ascending: false });

  if (snapsError) {
    console.error("[recrawl-cron] snapshots_select_failed", snapsError);
  }

  const latestByUser = new Map<string, string>();
  for (const s of snaps ?? []) {
    if (!latestByUser.has(s.user_id)) {
      latestByUser.set(s.user_id, s.scored_at);
    }
  }

  // 3. For each active profile, look up the latest diagnostic_leads row
  // by email to get the canonical product_url.
  const emails = active.map((p) => p.email.toLowerCase());
  type LeadRow = { email: string; product_url: string; created_at: string };
  const { data: leads, error: leadsError } = await supabase
    .from("diagnostic_leads")
    .select("email, product_url, created_at")
    .in("email", emails)
    .order("created_at", { ascending: false });

  if (leadsError) {
    console.error("[recrawl-cron] leads_select_failed", leadsError);
    return [];
  }

  const productUrlByEmail = new Map<string, string>();
  for (const lead of (leads as LeadRow[] | null) ?? []) {
    const key = lead.email.toLowerCase();
    if (!productUrlByEmail.has(key) && lead.product_url) {
      productUrlByEmail.set(key, lead.product_url);
    }
  }

  // 4. Filter to actually-due rows and sort by stalest-first.
  const cutoffMs =
    Date.now() - MIN_DAYS_BETWEEN_CRAWLS * 24 * 60 * 60 * 1000;
  const due: DueUser[] = [];
  for (const p of active) {
    const product_url = productUrlByEmail.get(p.email.toLowerCase());
    if (!product_url) continue;

    const last = latestByUser.get(p.user_id);
    const last_ms = last ? Date.parse(last) : 0;
    if (last_ms > cutoffMs) continue; // crawled within the past 6 days
    due.push({
      user_id: p.user_id,
      email: p.email,
      recrawl_alerts_enabled: p.recrawl_alerts_enabled !== false, // null defaults to true
      product_url,
      last_scored_at: last ?? null,
    });
  }

  due.sort((a, b) => {
    const aMs = a.last_scored_at ? Date.parse(a.last_scored_at) : 0;
    const bMs = b.last_scored_at ? Date.parse(b.last_scored_at) : 0;
    return aMs - bMs; // oldest first
  });

  return due.slice(0, PER_RUN_LIMIT);
}

// ---------------------------------------------------------------------------
// Per-user pipeline
// ---------------------------------------------------------------------------

type Outcome = "alerted" | "skipped" | "crawl_failed";

async function processOne(
  supabase: ReturnType<typeof createAdminClient>,
  user: DueUser
): Promise<Outcome> {
  // 1. Crawl.
  let curr: DeepDiagnosticResult;
  try {
    curr = await deepAnalyzeUrl(user.product_url);
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    console.warn("[recrawl-cron] crawl_failed", {
      user_id: user.user_id,
      url: user.product_url,
      reason,
    });
    await insertAlert(supabase, {
      user_id: user.user_id,
      email: user.email,
      prev_snapshot_id: null,
      curr_snapshot_id: null,
      delta_summary: null,
      status: "crawl_failed",
      channel: "none",
      error_message: reason.slice(0, 500),
    });
    return "crawl_failed";
  }

  // 2. Persist the new snapshot.
  const insertedSnapshot = await insertSnapshot(supabase, {
    user_id: user.user_id,
    email: user.email,
    product_url: user.product_url,
    label: curr.label,
    scores: curr.scores as unknown as Record<string, unknown>,
    analysis_detail: curr as unknown as Record<string, unknown>,
  });

  if (!insertedSnapshot) {
    // ON CONFLICT DO NOTHING fired because there is already a row for
    // (user, current ISO week). The previous cron already handled this
    // user this week — treat as a noop.
    return "skipped";
  }

  // 3. Find the previous snapshot for diff.
  const prevSnapshot = await fetchPrevSnapshot(
    supabase,
    user.user_id,
    insertedSnapshot.id
  );

  if (!prevSnapshot) {
    // First-ever snapshot for this user. No diff possible. Record the
    // crawl, skip the email.
    await insertAlert(supabase, {
      user_id: user.user_id,
      email: user.email,
      prev_snapshot_id: null,
      curr_snapshot_id: insertedSnapshot.id,
      delta_summary: null,
      status: "skipped_first",
      channel: "none",
      error_message: null,
    });
    return "skipped";
  }

  // 4. Compute the delta and the alert decision.
  const delta = computeDelta(
    prevSnapshot.analysis_detail as unknown as DeepDiagnosticResult,
    curr
  );
  const willAlert = shouldAlert(delta);

  if (!willAlert) {
    await insertAlert(supabase, {
      user_id: user.user_id,
      email: user.email,
      prev_snapshot_id: prevSnapshot.id,
      curr_snapshot_id: insertedSnapshot.id,
      delta_summary: delta as unknown as Record<string, unknown>,
      status: "skipped_noop",
      channel: "none",
      error_message: null,
    });
    return "skipped";
  }

  if (!user.recrawl_alerts_enabled) {
    await insertAlert(supabase, {
      user_id: user.user_id,
      email: user.email,
      prev_snapshot_id: prevSnapshot.id,
      curr_snapshot_id: insertedSnapshot.id,
      delta_summary: delta as unknown as Record<string, unknown>,
      status: "skipped_optout",
      channel: "none",
      error_message: null,
    });
    return "skipped";
  }

  // 5. Send. Compose URLs and the human greeting.
  const baseUrl = canonicalAppUrl();
  const greeting = greetingFromEmail(user.email);
  const productName = curr.product_snapshot.name?.trim() || urlHostname(user.product_url);

  const emailResult = await sendRecrawlEmail({
    to: user.email,
    greeting,
    productUrl: user.product_url,
    productName,
    delta,
    prev: prevSnapshot.analysis_detail as unknown as DeepDiagnosticResult,
    curr,
    dashboardUrl: `${baseUrl}/playbook`,
    unsubscribeUrl: buildRecrawlMuteUrl(user.email, baseUrl),
  });

  let slackResult: { ok: true } | { ok: false; reason: string } | null = null;
  if (process.env.SLACK_WEBHOOK_URL) {
    slackResult = await sendSlackRecrawlAlert({
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      delta,
      productName,
      productUrl: user.product_url,
      dashboardUrl: `${baseUrl}/playbook`,
    });
  }

  // 6. Audit.
  const channel = describeChannel(emailResult, slackResult);
  let status: "sent" | "sent_partial" | "failed_send";
  let error_message: string | null = null;

  if (emailResult.ok && (!slackResult || slackResult.ok)) {
    status = "sent";
  } else if (!emailResult.ok && (!slackResult || !slackResult.ok)) {
    status = "failed_send";
    error_message = !emailResult.ok ? emailResult.reason : "all channels failed";
  } else {
    status = "sent_partial";
    error_message = !emailResult.ok
      ? `email: ${emailResult.reason}`
      : slackResult && !slackResult.ok
        ? `slack: ${slackResult.reason}`
        : null;
  }

  await insertAlert(supabase, {
    user_id: user.user_id,
    email: user.email,
    prev_snapshot_id: prevSnapshot.id,
    curr_snapshot_id: insertedSnapshot.id,
    delta_summary: delta as unknown as Record<string, unknown>,
    status,
    channel,
    error_message,
  });

  return status === "failed_send" ? "skipped" : "alerted";
}

// ---------------------------------------------------------------------------
// Persistence helpers (typed against the un-regenerated database.types.ts)
// ---------------------------------------------------------------------------

type SnapshotInsert = {
  user_id: string;
  email: string;
  product_url: string;
  label: string;
  scores: Record<string, unknown>;
  analysis_detail: Record<string, unknown>;
};

type SnapshotRow = {
  id: string;
  analysis_detail: unknown;
};

async function insertSnapshot(
  supabase: ReturnType<typeof createAdminClient>,
  row: SnapshotInsert
): Promise<{ id: string } | null> {
  const client = supabase as unknown as {
    from: (t: string) => {
      insert: (rows: SnapshotInsert[]) => {
        select: (cols: string) => {
          maybeSingle: () => Promise<{
            data: { id: string } | null;
            error: { code?: string; message: string } | null;
          }>;
        };
      };
    };
  };

  const { data, error } = await client
    .from("diagnostic_snapshots")
    .insert([row])
    .select("id")
    .maybeSingle();

  if (error) {
    // 23505 = unique_violation → already snapshotted for this ISO week.
    if (error.code === "23505") {
      return null;
    }
    console.error("[recrawl-cron] snapshot_insert_failed", error);
    return null;
  }
  return data;
}

async function fetchPrevSnapshot(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  excludeSnapshotId: string
): Promise<SnapshotRow | null> {
  const client = supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (
          col: string,
          v: string
        ) => {
          neq: (
            col: string,
            v: string
          ) => {
            order: (
              col: string,
              opts: { ascending: boolean }
            ) => {
              limit: (n: number) => {
                maybeSingle: () => Promise<{
                  data: SnapshotRow | null;
                  error: { message: string } | null;
                }>;
              };
            };
          };
        };
      };
    };
  };
  const { data, error } = await client
    .from("diagnostic_snapshots")
    .select("id, analysis_detail")
    .eq("user_id", userId)
    .neq("id", excludeSnapshotId)
    .order("scored_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("[recrawl-cron] prev_snapshot_fetch_failed", error);
    return null;
  }
  return data;
}

type AlertInsert = {
  user_id: string;
  email: string;
  prev_snapshot_id: string | null;
  curr_snapshot_id: string | null;
  delta_summary: Record<string, unknown> | null;
  status:
    | "sent"
    | "sent_partial"
    | "skipped_noop"
    | "skipped_first"
    | "skipped_optout"
    | "failed_send"
    | "crawl_failed";
  channel: string;
  error_message: string | null;
};

async function insertAlert(
  supabase: ReturnType<typeof createAdminClient>,
  row: AlertInsert
): Promise<void> {
  const client = supabase as unknown as {
    from: (t: string) => {
      insert: (rows: AlertInsert[]) => Promise<{
        error: { message: string } | null;
      }>;
    };
  };
  const { error } = await client.from("recrawl_alerts").insert([row]);
  if (error) {
    console.error("[recrawl-cron] alert_insert_failed", error);
  }
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function canonicalAppUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function greetingFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Builder";
  // First "word" of the local part, capitalized. "marc.lou" → "Marc",
  // "founder+spam" → "Founder", "amy" → "Amy".
  const first = local.split(/[._+\-]/)[0] ?? local;
  if (!first) return "Builder";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function urlHostname(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}

function describeChannel(
  email: { ok: boolean },
  slack: { ok: boolean } | null
): string {
  const parts: string[] = [];
  if (email.ok) parts.push("email");
  if (slack && slack.ok) parts.push("slack");
  return parts.length === 0 ? "none" : parts.join("+");
}
