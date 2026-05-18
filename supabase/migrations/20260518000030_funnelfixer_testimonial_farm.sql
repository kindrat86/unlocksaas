-- 0030_funnelfixer_testimonial_farm
--
-- One-time reactivation offer for FunnelFixer carry-over subscribers who
-- finish the Soap Opera (status='complete', source LIKE 'funnelfixer_%').
-- The offer: $1 Starter at $0 for 14 days; if Stripe verifies a paying
-- customer on the back of it, the founder agrees to land on /builders.
--
-- See /api/cron/testimonial-farm-offer + lib/testimonial-farm/* for the
-- send pipeline. This migration only adds the tracking columns + the
-- partial index the cron reads to find due rows cheaply.
--
-- Brunson Hard-Rule reconciliation: the column ends up NULL forever for
-- anyone who never finishes the SOS. No back-dated stamping, no fabricated
-- "offered" state. The cron is the only writer.

alter table public.soap_opera_subscribers
  add column if not exists testimonial_offer_sent_at timestamptz,
  add column if not exists testimonial_offer_session_url text;

-- Partial index. The cron's query is
--   where source like 'funnelfixer_%'
--     and status = 'complete'
--     and testimonial_offer_sent_at is null
-- which is exactly what the index covers. Tiny on-disk footprint because the
-- predicate is so narrow (max ~36 rows ever satisfy it).
create index if not exists soap_opera_testimonial_offer_due_idx
  on public.soap_opera_subscribers (id)
  where source like 'funnelfixer_%'
    and status = 'complete'
    and testimonial_offer_sent_at is null;
