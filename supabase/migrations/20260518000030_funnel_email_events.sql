-- 0030_funnel_email_events
--
-- Captures one row per Resend delivery-status event we want to surface in the
-- monitoring dashboard: opened, clicked, delivered. Bounce and complaint are
-- handled separately (they flip status on the subscriber row instead) and so
-- are intentionally NOT logged here.
--
-- The webhook handler (POST /api/webhooks/resend) inserts rows using the
-- service-role client. No user-facing read path exists yet — dashboards read
-- with the same service-role client server-side.
--
-- Aggregation rule used by scripts/build-dashboard.py:
--   open_rate(email)  = count(distinct resend_email_id) where event='opened'  / emails_sent
--   click_rate(email) = count(distinct resend_email_id) where event='clicked' / emails_sent
-- Distinct-by-message dedupes the multiple opens that fire from pixel reloads.

create table public.funnel_email_events (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  resend_email_id text,
  event_type      text not null check (event_type in ('opened', 'clicked', 'delivered')),
  occurred_at     timestamptz not null default now(),
  raw             jsonb
);

create index funnel_email_events_email_idx
  on public.funnel_email_events (email);

create index funnel_email_events_resend_email_idx
  on public.funnel_email_events (resend_email_id)
  where resend_email_id is not null;

create index funnel_email_events_occurred_at_idx
  on public.funnel_email_events (occurred_at);

-- RLS: lock the table down. Only service-role (which bypasses RLS) can read or
-- write. No anon / authenticated policy is granted.
alter table public.funnel_email_events enable row level security;
