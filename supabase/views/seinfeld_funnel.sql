-- ============================================================================
-- Seinfeld Funnel SQL Views
-- ============================================================================
-- Source: DotCom Secrets Secret #7 (Seinfeld Daily) + Brunson Audibles
-- (Secret #28). Companion to strategy/funnel-audibles.md and
-- strategy/follow-up-funnels.md Part 2 cadence #2.
--
-- These views feed the Friday Audible Call's Seinfeld panel. They cover what
-- lives in Supabase (subscriber state + send counters + status). Per-send
-- detail (opens, clicks, JK5 bucket for any individual delivery) lives in
-- Resend's dashboard via the tags this dispatcher sets: sequence, kind, jk5,
-- content_id, ps_target, tier.
--
-- ----------------------------------------------------------------------------
-- HOW TO APPLY
-- ----------------------------------------------------------------------------
-- These are read-only views. Apply ad-hoc via the Supabase SQL editor, or
-- promote to a numbered migration when stable:
--     supabase/migrations/YYYYMMDDhhmmss_seinfeld_funnel_views.sql
-- All views are accessible to authenticated + service_role (no anon).
--
-- ----------------------------------------------------------------------------
-- COLUMN-NAME ASSUMPTIONS (matches supabase/migrations/20260517020000_seinfeld.sql)
-- ----------------------------------------------------------------------------
-- seinfeld_subscribers(
--   id uuid, email text, source text, source_subscriber_id uuid,
--   status text -- 'active' | 'paused' | 'unsubscribed' | 'bounced' | 'errored'
--   current_index int, sends_count int,
--   last_sent_at timestamptz, last_error text, unsubscribed_at timestamptz,
--   created_at timestamptz, updated_at timestamptz
-- )
-- ============================================================================

set search_path = public;


-- ----------------------------------------------------------------------------
-- 1. Daily enrollments — top of the Seinfeld funnel.
-- ----------------------------------------------------------------------------
-- Read: are new subscribers landing here? Split by source so we can tell
-- which intake path (Soap Opera graduation vs manual subscribe form) is
-- producing list growth.
create or replace view public.funnel_audibles__seinfeld_enrollments as
select
  date_trunc('day', created_at)::date as day,
  source,
  count(*) as enrollments
from public.seinfeld_subscribers
where created_at > now() - interval '90 days'
group by 1, 2
order by 1 desc, 2;

comment on view public.funnel_audibles__seinfeld_enrollments is
  'Daily new Seinfeld subscribers split by source over the last 90 days. Trigger Matrix: list-growth signal.';


-- ----------------------------------------------------------------------------
-- 2. Status mix — what state is the list in right now?
-- ----------------------------------------------------------------------------
-- Read: of every Seinfeld subscriber ever, what % are still active vs paused
-- (post-purchase) vs unsubscribed vs bounced vs errored?
--
-- Two rows that matter most:
--   status='paused' — paid Core conversions (Brunson stop-on-buy worked)
--   status='errored' — two-strike bounce escalation (deliverability decay)
create or replace view public.funnel_audibles__seinfeld_status_mix as
select
  status,
  count(*) as subs,
  round(
    100.0 * count(*) / nullif(sum(count(*)) over (), 0),
    1
  ) as pct
from public.seinfeld_subscribers
group by 1
order by 2 desc;

comment on view public.funnel_audibles__seinfeld_status_mix is
  'Current Seinfeld subscriber state breakdown. paused = paid-customer pauses; errored = two-strike bounces.';


-- ----------------------------------------------------------------------------
-- 3. Engagement depth — how far into the rotation are people?
-- ----------------------------------------------------------------------------
-- Read: distribution of lifetime sends per subscriber. The shape of this
-- distribution tells the operator whether the cadence is doing its job
-- (subscribers accumulate sends) or whether unsubscribe pressure is
-- truncating most subscribers in the first 1–5 sends.
--
-- Buckets are chosen to match the 26-item rotation: 0–4 = first JK5 cycle,
-- 5–9 = second cycle, 25+ = approaching first repeat in any single category.
create or replace view public.funnel_audibles__seinfeld_engagement_depth as
select
  case
    when sends_count = 0 then '0 (never sent)'
    when sends_count between 1 and 4  then '1-4 (first JK5 cycle)'
    when sends_count between 5 and 9  then '5-9 (second cycle)'
    when sends_count between 10 and 24 then '10-24 (mid rotation)'
    when sends_count between 25 and 49 then '25-49 (approaching first repeat)'
    else '50+ (deep, multiple repeats)'
  end as depth_bucket,
  count(*) as subs,
  round(avg(sends_count)::numeric, 1) as avg_sends_in_bucket
from public.seinfeld_subscribers
where status = 'active'
group by 1
order by min(sends_count);

comment on view public.funnel_audibles__seinfeld_engagement_depth is
  'Lifetime sends_count distribution among active subscribers. Tail-heavy = the cadence is doing its job.';


-- ----------------------------------------------------------------------------
-- 4. Last JK5 category — what did each subscriber last receive?
-- ----------------------------------------------------------------------------
-- Read: if a subscriber's last send was JK5 category X, the next will be
-- (X+1) mod 5. This view is the cohort-level "next ticket" preview without
-- having to call /api/seinfeld/preview per subscriber.
--
-- The JK5 picker logic in lib/seinfeld/content.ts ties send-N to
-- JK5_ORDER[N mod 5] where JK5_ORDER = [personal, process, pattern,
-- polarity, proof]. Encoded here as a CASE so this view is self-contained
-- (no PostgREST function call required).
--
-- Subscribers with sends_count = 0 have no last category yet; they appear
-- with last_jk5='(none)'.
create or replace view public.funnel_audibles__seinfeld_last_jk5 as
select
  case
    when sends_count = 0 then '(none)'
    when ((sends_count - 1) % 5) = 0 then 'personal'
    when ((sends_count - 1) % 5) = 1 then 'process'
    when ((sends_count - 1) % 5) = 2 then 'pattern'
    when ((sends_count - 1) % 5) = 3 then 'polarity'
    when ((sends_count - 1) % 5) = 4 then 'proof'
  end as last_jk5,
  count(*) as subs
from public.seinfeld_subscribers
where status = 'active'
group by 1
order by 2 desc;

comment on view public.funnel_audibles__seinfeld_last_jk5 is
  'JK5 category most recently sent per active subscriber. Next send is (this + 1) mod 5.';


-- ----------------------------------------------------------------------------
-- 5. Rotation health — when will the content pool wrap?
-- ----------------------------------------------------------------------------
-- Read: the JK5 picker indexes pool[floor(N / 5) mod pool.length]. With
-- 5 items per pool (Personal/Process/Pattern/Proof) and 6 in Polarity, the
-- first within-category repeat lands at sends_count = 25 (5 cycles × 5
-- categories). Polarity's longer pool means it repeats at 30.
--
-- This view flags subscribers whose NEXT send would be the first repeat in
-- any category. When this view returns non-empty rows, the operator should
-- add at least one new item to the smallest pool BEFORE the next Mon/Wed/Fri
-- send day. Otherwise the affected subscribers see the same email twice.
create or replace view public.funnel_audibles__seinfeld_rotation_health as
select
  email,
  sends_count,
  status,
  last_sent_at,
  case
    when sends_count >= 30 then 'CRITICAL: repeating in every category'
    when sends_count >= 25 then 'WARN: repeating in Personal/Process/Pattern/Proof'
    else 'OK'
  end as health
from public.seinfeld_subscribers
where status = 'active'
  and sends_count >= 25
order by sends_count desc;

comment on view public.funnel_audibles__seinfeld_rotation_health is
  'Active subscribers approaching or past the content-pool wrap point. Empty = no action needed.';


-- ----------------------------------------------------------------------------
-- 6. Weekly top-of-funnel — the Friday Audible Call screen, Seinfeld panel.
-- ----------------------------------------------------------------------------
-- Single-row summary. Read in 20 seconds during the Friday call.
--
-- Six numbers:
--   subs_active                — total active list size
--   subs_paused_lifetime       — Brunson stop-on-buy lift (post-launch growth)
--   subs_unsubscribed_lifetime — unsubscribe count (deliverability signal)
--   subs_errored_lifetime      — two-strike escalations (hard-bounce proxy)
--   enrollments_7d             — new subscribers in the last 7 days
--   sends_7d                   — actual sends in the last 7 days (rough — based
--                                 on last_sent_at; double-count safe because
--                                 22h cron tolerance ensures one send/day max)
create or replace view public.funnel_audibles__seinfeld_weekly as
select
  count(*) filter (where status = 'active') as subs_active,
  count(*) filter (where status = 'paused') as subs_paused_lifetime,
  count(*) filter (where status = 'unsubscribed') as subs_unsubscribed_lifetime,
  count(*) filter (where status = 'errored') as subs_errored_lifetime,
  count(*) filter (where status = 'bounced') as subs_bounced_lifetime,
  count(*) filter (where created_at > now() - interval '7 days') as enrollments_7d,
  count(*) filter (
    where last_sent_at > now() - interval '7 days'
  ) as recently_sent_7d,
  round(
    100.0 * count(*) filter (where status = 'unsubscribed')
    / nullif(count(*), 0),
    2
  ) as unsubscribe_pct,
  round(
    100.0 * count(*) filter (where status = 'paused')
    / nullif(count(*), 0),
    2
  ) as conversion_pause_pct
from public.seinfeld_subscribers;

comment on view public.funnel_audibles__seinfeld_weekly is
  'Single-row Seinfeld panel for the Friday Audible Call. 6 lifetime + 2 rolling-7d metrics.';


-- ----------------------------------------------------------------------------
-- View registry — convenience SELECT that lists every Seinfeld view at once.
-- ----------------------------------------------------------------------------
-- Used by the audit close in build-log.md and the funnel-audibles.md playbook
-- as the single canonical list. If a future migration adds another view,
-- append it here.
create or replace view public.funnel_audibles__seinfeld_registry as
select view_name from (
  values
    ('funnel_audibles__seinfeld_enrollments'),
    ('funnel_audibles__seinfeld_status_mix'),
    ('funnel_audibles__seinfeld_engagement_depth'),
    ('funnel_audibles__seinfeld_last_jk5'),
    ('funnel_audibles__seinfeld_rotation_health'),
    ('funnel_audibles__seinfeld_weekly')
) as v(view_name);

comment on view public.funnel_audibles__seinfeld_registry is
  'Canonical list of Seinfeld funnel views. SELECT * FROM this to confirm deploy.';
