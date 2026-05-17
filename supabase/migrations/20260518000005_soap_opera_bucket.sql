-- Brunson Survey Funnel Day-0 personalization upgrade (DCS Secret 15).
--
-- The Free Diagnostic Bridge Page (app/src/app/(marketing)/diagnostic/result/page.tsx)
-- routes every visitor through one of seven survey buckets (assignBucket in
-- app/src/lib/diagnostic.ts). The bridge copy, the trial close, and the
-- destination CTA are all bucket-aware.
--
-- The Soap Opera Day-0 email opener was NOT — it collapsed back to the three
-- Claude labels (wrong_person / weak_offer / weak_belief). That is a Brunson
-- consistency break: the bridge page acknowledges "Customer Avoider" by name,
-- then the first email in the inbox calls them "Wrong Person." Same person,
-- two different labels, fifteen minutes apart.
--
-- This migration adds the bucket column so the subscribe → dispatch chain can
-- carry it from the diagnostic submission through to the Day-0 renderer.
--
-- Source: strategy/workbooks/04-building-your-funnels.md §5 (Soap Opera),
--         strategy/workbooks/01-sales-funnel-secrets.md §6 (parables, voice),
--         Brunson DotCom Secrets Secret 15.

alter table public.soap_opera_subscribers
  add column if not exists bucket text;

-- Soft enum check, mirrors supabase/migrations/20260518000000 diagnostic_leads
-- so the two tables stay in sync. We include 'error' for symmetry even though
-- the diagnostic route never subscribes error rows (app/src/app/api/diagnostic
-- /route.ts guards on diagnosis.label before calling subscribeToSoapOpera).
alter table public.soap_opera_subscribers
  add constraint soap_opera_subscribers_bucket_chk
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

-- Partial index for the per-bucket analytics view in
-- supabase/views/diagnostic_buckets.sql. Subscribers without a bucket are
-- pre-survey legacy rows or non-diagnostic intakes (funnel_hub, parables) —
-- they group under "(none)" in the view and don't need indexing.
create index if not exists soap_opera_subscribers_bucket_idx
  on public.soap_opera_subscribers (bucket)
  where bucket is not null;
