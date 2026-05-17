-- Brunson Survey Funnel + Bridge Scripts upgrade (DCS Secret 15).
--
-- The Free Diagnostic ships as a 2-field squeeze (URL + email) + Claude label
-- (wrong_person | weak_offer | weak_belief | error). That's enough to triage,
-- not enough to BRIDGE — Brunson's framework wants:
--   1. multi-question survey to segment leads into discriminating buckets
--   2. a unique bridge page per bucket
--   3. Prospect Bridge Script for new visitors; Customer Bridge for returning
--   4. differentiated downstream destinations per bucket
--
-- This migration adds the columns that make 1-4 possible. All additive,
-- nullable, no constraints that would break the existing in-flight rows.
--
-- Source: strategy/workbooks/04-building-your-funnels.md §3 (Diagnostic),
--         strategy/workbooks/01-sales-funnel-secrets.md §6 (Bridge voice),
--         Brunson DotCom Secrets Secret 15.

alter table public.diagnostic_leads
  -- Survey signals (free text restricted to enum values by app code).
  add column if not exists time_since_launch text,
  add column if not exists recent_revenue text,
  add column if not exists biggest_attempt text,
  -- Computed bucket; the cross-tab of Claude label × the 3 survey signals.
  -- See app/src/lib/diagnostic.ts assignBucket().
  add column if not exists bucket text,
  -- True if the same email already had a diagnostic_leads row when this one
  -- was created. Drives the Prospect Bridge / Customer Bridge variant on the
  -- result page.
  add column if not exists is_returning boolean not null default false;

-- Soft enum check — keeps garbage out without an enum type ceremony. Values
-- match app/src/lib/diagnostic.ts SURVEY_VALUES + BUCKETS.
alter table public.diagnostic_leads
  add constraint diagnostic_leads_time_since_launch_chk
    check (
      time_since_launch is null
      or time_since_launch in ('under_30', '30_to_90', '90_plus')
    ),
  add constraint diagnostic_leads_recent_revenue_chk
    check (
      recent_revenue is null
      or recent_revenue in ('zero', 'under_100', '100_to_1k', 'over_1k')
    ),
  add constraint diagnostic_leads_biggest_attempt_chk
    check (
      biggest_attempt is null
      or biggest_attempt in (
        'more_building',
        'seo_content',
        'paid_ads',
        'customer_conversations',
        'nothing_yet'
      )
    ),
  add constraint diagnostic_leads_bucket_chk
    check (
      bucket is null
      or bucket in (
        'customer_avoider',
        'stuck_builder',
        'tactic_shopper',
        'premature',
        'traction_but_stuck',
        'ready_to_scale',
        'error'
      )
    );

-- Index used by the bridge-page funnel-analytics SQL (count exposed/converted
-- per bucket) and by the operator dashboard once we ship it.
create index if not exists diagnostic_leads_bucket_idx
  on public.diagnostic_leads (bucket)
  where bucket is not null;

-- Index used to detect returning visitors quickly during the upsert. Email is
-- already case-insensitive unique via the existing unique index on
-- (lower(email), product_url), but we frequently look up by lower(email) alone
-- to see whether ANY prior row exists for this person across products.
create index if not exists diagnostic_leads_lower_email_idx
  on public.diagnostic_leads (lower(email));
