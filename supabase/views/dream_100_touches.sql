-- Views: dream_100_touches dashboards for the Friday Audible Call
-- Date: 2026-05-18
-- Chapter: DCS Secret #13 (Other People's Funnels) — the §8 dashboard row
-- Canonical doc: strategy/other-peoples-funnels.md §8, strategy/funnel-audibles.md Part 5
--
-- All five views are service-role-readable only (the underlying table is RLS-locked).
-- The Friday Audible Call reads these five views in order — the operator's full OPF
-- dashboard is this file plus the link-clicks views in supabase/views/fill_your_funnel.sql.

-- View 1: vw_dream_100_targets_stale
-- Returns Tier-A and Tier-B targets with zero touches in the last 14 days.
-- Audible: "schedule today's public reply for this target."
create or replace view public.vw_dream_100_targets_stale as
with tiered as (
  -- Tier A (5 highest priority) + Tier B (next 5) per dream-100-outreach.md §2
  select unnest(array[
    'castrio',     -- Anthony Castrio
    'marc_lou',    -- Marc Lou
    'damon_chen',  -- Damon Chen
    'arvid',       -- Arvid Kahl
    'mubs',        -- Mubashar Iqbal
    'tibo',        -- Tibo Louis-Lucas
    'pat_walls',   -- Pat Walls
    'nutlope',     -- Hassan El Mghari
    'justin_jackson',  -- Justin Jackson
    'sahil_lavingia'   -- Sahil Lavingia
  ]) as target_handle,
  unnest(array[
    'A','A','A','A','A',
    'B','B','B','B','B'
  ]) as tier
),
latest_touch as (
  select target_handle, max(created_at) as last_touch_at
  from public.dream_100_touches
  where action_type in ('public_reply','community_reply','newsletter_reply','dm','dm_response','pitch','pitch_response')
  group by target_handle
)
select
  t.target_handle,
  t.tier,
  l.last_touch_at,
  case
    when l.last_touch_at is null then 9999
    else extract(day from (now() - l.last_touch_at))::int
  end as days_since_last_touch,
  case
    when l.last_touch_at is null then 'stale_never'
    when l.last_touch_at < now() - interval '14 days' then 'stale_14d'
    when l.last_touch_at < now() - interval '7 days'  then 'stale_7d'
    else 'fresh'
  end as staleness
from tiered t
left join latest_touch l using (target_handle)
where (l.last_touch_at is null) or (l.last_touch_at < now() - interval '7 days')
order by t.tier, days_since_last_touch desc;

comment on view public.vw_dream_100_targets_stale is
  'OPF Friday Audible Call view #1 — Tier A/B targets with stale (>=7 day) or absent touches. Audible: schedule today''s public reply per dream-100-outreach.md §1 cadence.';

-- View 2: vw_dream_100_warmup_violations
-- Returns DMs sent before the warm-up rule was met (≥2 public_reply rows in the prior 30 days
-- for the same target). Per dream-100-outreach.md §5 pre-launch grading rule:
-- "If you ever send a dm with <2 logged public_reply for that target, you broke the warm-up rule."
create or replace view public.vw_dream_100_warmup_violations as
select
  d.id as dm_touch_id,
  d.target_handle,
  d.created_at as dm_sent_at,
  d.message_excerpt as dm_excerpt,
  d.public_url as dm_url,
  coalesce(prior_replies.reply_count, 0) as prior_reply_count_30d,
  case
    when coalesce(prior_replies.reply_count, 0) = 0 then 'critical_no_warmup'
    when coalesce(prior_replies.reply_count, 0) = 1 then 'warning_thin_warmup'
    else 'ok'
  end as violation_severity
from public.dream_100_touches d
left join lateral (
  select count(*) as reply_count
  from public.dream_100_touches p
  where p.target_handle = d.target_handle
    and p.action_type in ('public_reply','community_reply','newsletter_reply')
    and p.created_at < d.created_at
    and p.created_at >= d.created_at - interval '30 days'
) prior_replies on true
where d.action_type = 'dm'
  and coalesce(prior_replies.reply_count, 0) < 2
order by d.created_at desc;

comment on view public.vw_dream_100_warmup_violations is
  'OPF Friday Audible Call view #2 — DM rows sent with fewer than 2 prior public-reply rows in the previous 30 days for the same target. Brunson rule #1 violation. Audible: post-mortem the violation; document in build-log.md; do not repeat.';

-- View 3: vw_dream_100_cadence_health
-- Returns the rolling 4-week touches per target for Tier-A and Tier-B targets.
-- Audible: any Tier-A target with <1 touch/week sustained is yellow; rebalance week's targets.
create or replace view public.vw_dream_100_cadence_health as
with tiered as (
  select unnest(array[
    'castrio','marc_lou','damon_chen','arvid','mubs',
    'tibo','pat_walls','nutlope','justin_jackson','sahil_lavingia'
  ]) as target_handle,
  unnest(array[
    'A','A','A','A','A',
    'B','B','B','B','B'
  ]) as tier
),
weekly_counts as (
  select
    target_handle,
    date_trunc('week', created_at) as week_start,
    count(*) as touches_in_week
  from public.dream_100_touches
  where created_at >= now() - interval '4 weeks'
    and action_type in ('public_reply','community_reply','newsletter_reply','dm','dm_response','pitch','pitch_response')
  group by target_handle, date_trunc('week', created_at)
),
rolled_up as (
  select
    target_handle,
    sum(touches_in_week)::int as total_touches_4w,
    count(distinct week_start)::int as active_weeks,
    (sum(touches_in_week)::numeric / 4.0)::numeric(10,2) as touches_per_week_avg
  from weekly_counts
  group by target_handle
)
select
  t.target_handle,
  t.tier,
  coalesce(r.total_touches_4w, 0) as total_touches_4w,
  coalesce(r.active_weeks, 0) as active_weeks,
  coalesce(r.touches_per_week_avg, 0.0) as touches_per_week_avg,
  case
    when t.tier = 'A' and coalesce(r.touches_per_week_avg, 0) < 1.0 then 'red_undercadence'
    when t.tier = 'A' and coalesce(r.touches_per_week_avg, 0) >= 2.0 then 'green'
    when t.tier = 'A' then 'yellow'
    when t.tier = 'B' and coalesce(r.touches_per_week_avg, 0) < 0.5 then 'red_undercadence'
    when t.tier = 'B' and coalesce(r.touches_per_week_avg, 0) >= 1.0 then 'green'
    when t.tier = 'B' then 'yellow'
    else 'unknown'
  end as cadence_status
from tiered t
left join rolled_up r using (target_handle)
order by t.tier, touches_per_week_avg asc;

comment on view public.vw_dream_100_cadence_health is
  'OPF Friday Audible Call view #3 — rolling 4-week touches per Tier-A/B target. Red below 1/week for Tier A or 0.5/week for Tier B. Audible: rebalance the next week''s targets so red rows get the most attention.';

-- View 4: vw_opf_per_channel_volume
-- Returns touch volume per channel over the last 7 / 30 / 90 days.
-- Audible: any channel with sudden drop-off (e.g., 0 ih_longforms last 7 days) gets flagged.
create or replace view public.vw_opf_per_channel_volume as
select
  channel,
  count(*) filter (where created_at >= now() - interval '7 days')  as touches_7d,
  count(*) filter (where created_at >= now() - interval '30 days') as touches_30d,
  count(*) filter (where created_at >= now() - interval '90 days') as touches_90d,
  max(created_at) as most_recent
from public.dream_100_touches
group by channel
order by touches_30d desc;

comment on view public.vw_opf_per_channel_volume is
  'OPF Friday Audible Call view #4 — touch volume per channel over multiple windows. Audible: any channel with touches_30d=0 that was active 90d ago gets flagged.';

-- View 5: vw_opf_attribution
-- Returns touches that have led to a subject conversion (source_subject_id set).
-- The "what actually worked" view — feeds back into next quarter's OPF prioritization.
create or replace view public.vw_opf_attribution as
select
  target_handle,
  channel,
  count(*) filter (where source_subject_id is not null) as attributed_subjects,
  count(*) as total_touches,
  (count(*) filter (where source_subject_id is not null))::numeric
    / nullif(count(*), 0) as attribution_rate
from public.dream_100_touches
where created_at >= now() - interval '180 days'
group by target_handle, channel
having count(*) filter (where source_subject_id is not null) > 0
order by attributed_subjects desc;

comment on view public.vw_opf_attribution is
  'OPF Friday Audible Call view #5 — which target/channel combinations have actually produced subject conversions in the last 180 days. Reprioritize the Dream 100 cadence based on signal, not bias.';
