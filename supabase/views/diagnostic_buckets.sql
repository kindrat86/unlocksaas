-- ============================================================================
-- Per-bucket diagnostic conversion — Brunson Survey Funnel (DCS Secret 15).
--
-- Companion to supabase/views/funnel_audibles.sql, which has the per-LABEL
-- diagnostic view (3 buckets: wrong_person / weak_offer / weak_belief). This
-- file adds the per-BUCKET view (7 buckets from app/src/lib/diagnostic.ts
-- assignBucket()). The bucket is the cross-tab of Claude label × the three
-- survey signals (time_since_launch × recent_revenue × biggest_attempt) and is
-- the unit at which the Bridge Pages, Day-0 emails, and Starter/Core handoff
-- banners are personalized.
--
-- Why a separate view file:
--   - funnel_audibles.sql is the operational Friday Audible Call read; its
--     row-shape is locked to the Trigger Matrix in strategy/funnel-audibles.md
--     and changing it would break the rest of the SQL there.
--   - The per-bucket view is for a different operator question: "which survey
--     segment is leaking?" rather than "which Claude label?". Different scan,
--     different cadence, different decision.
--   - Adding a new file keeps both readable.
--
-- Read recipe (paste into a Supabase SQL editor or psql):
--
--   select * from public.funnel_audibles__diagnostic_buckets
--   where day > now() - interval '30 days'
--   order by day desc, diagnoses desc;
--
-- ----------------------------------------------------------------------------
-- Idempotent. Drop/replace freely. No data here; only views and an index.
-- ----------------------------------------------------------------------------

set search_path = public;

-- ----------------------------------------------------------------------------
-- 1. Per-day, per-bucket diagnostic counts and Starter conversion.
-- ----------------------------------------------------------------------------
-- Brunson rule: every Bridge Page must be measurable end-to-end. This view is
-- the read side of that promise — for each of the seven survey buckets, how
-- many leads did we route there, and how many bought the Starter the bridge
-- pointed at?
--
-- Note: bucket=null rows are pre-survey legacy + non-diagnostic intakes. They
-- group under '(none)' so the operator can see the migration tail shrinking.
create or replace view public.funnel_audibles__diagnostic_buckets as
select
  date_trunc('day', dl.created_at)::date           as day,
  coalesce(dl.bucket, '(none)')                    as bucket,
  count(*)                                         as diagnoses,
  count(*) filter (where dl.converted_to_starter_at is not null)
                                                   as starter_buys,
  round(
    100.0 * count(*) filter (where dl.converted_to_starter_at is not null)
    / nullif(count(*), 0),
    1
  )                                                as starter_conv_pct
from public.diagnostic_leads dl
group by 1, 2
order by 1 desc, diagnoses desc;

comment on view public.funnel_audibles__diagnostic_buckets is
  'Per-bucket diagnostic counts and Starter conversion (DCS Secret 15 Survey Funnel).';


-- ----------------------------------------------------------------------------
-- 2. Per-bucket Starter → Core take-rate (cohort by Starter purchase week).
-- ----------------------------------------------------------------------------
-- Joins diagnostic_leads → profiles via email. Different buckets should have
-- different OTO take-rates — ready_to_scale should be much higher than
-- customer_avoider (they came in pre-qualified). If the data ever inverts, the
-- bucket logic in assignBucket() needs revisiting.
create or replace view public.funnel_audibles__bucket_oto as
select
  coalesce(dl.bucket, '(none)')                     as bucket,
  count(distinct lower(dl.email))                   as bucketed_diagnoses,
  count(distinct lower(dl.email))
    filter (where p.starter_purchased_at is not null)
                                                    as starter_buyers,
  count(distinct lower(dl.email))
    filter (where p.core_started_at is not null)
                                                    as core_subs,
  round(
    100.0 * count(distinct lower(dl.email))
      filter (where p.starter_purchased_at is not null)
    / nullif(count(distinct lower(dl.email)), 0),
    1
  )                                                 as bucket_to_starter_pct,
  round(
    100.0 * count(distinct lower(dl.email))
      filter (where p.core_started_at is not null)
    / nullif(
        count(distinct lower(dl.email))
          filter (where p.starter_purchased_at is not null),
        0
      ),
    1
  )                                                 as starter_to_core_pct
from public.diagnostic_leads dl
left join public.profiles p
  on lower(p.email) = lower(dl.email)
group by 1
order by bucketed_diagnoses desc;

comment on view public.funnel_audibles__bucket_oto is
  'Lifetime per-bucket cohort: diagnosis → Starter → Core. The OTO take-rate per Survey Funnel segment.';


-- ----------------------------------------------------------------------------
-- 3. Soap Opera per-bucket fan-out (audit Day-0 personalization).
-- ----------------------------------------------------------------------------
-- After migration 20260518000005 the soap_opera_subscribers table carries the
-- same bucket column. This view confirms the migration is taking effect: every
-- new subscription from /api/diagnostic should have a non-null bucket, while
-- subscriptions from /api/soap-opera/subscribe (funnel hub, parables) may stay
-- null. If the diagnostic-source rows show null buckets, the diagnostic→
-- subscribe handoff is regressing.
create or replace view public.funnel_audibles__soap_opera_buckets as
select
  date_trunc('day', subscribed_at)::date            as day,
  source,
  coalesce(bucket, '(none)')                        as bucket,
  count(*)                                          as subscribers,
  count(*) filter (where emails_sent >= 1)          as day_0_sent,
  count(*) filter (where status = 'complete')       as completed_sequence
from public.soap_opera_subscribers
group by 1, 2, 3
order by 1 desc, subscribers desc;

comment on view public.funnel_audibles__soap_opera_buckets is
  'Soap Opera subscriber fan-out by source + bucket; audits the diagnostic→Day-0 chain.';
