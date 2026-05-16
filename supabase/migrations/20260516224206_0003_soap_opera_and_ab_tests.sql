-- 0003_soap_opera_and_ab_tests
--
--   - public.soap_opera_subscribers  5-email SOS (workbook 04 §5) + Seinfeld nurture
--   - public.ab_tests                lightweight exposure/conversion event log

-- soap_opera_subscribers: 5-email Soap Opera Sequence (workbook 04 §5)
-- Plus Seinfeld nurture (workbook 08 §6) once 5-email arc completes.
create table public.soap_opera_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,                         -- 'free_diagnostic', 'funnel_hub', etc.
  current_day int not null default 0,  -- 0..5 for SOS, then >=6 for Seinfeld
  status text not null default 'active' check (status in ('active', 'paused', 'unsubscribed', 'completed', 'bounced')),
  diagnostic_result text check (diagnostic_result in ('wrong_person', 'weak_offer', 'weak_belief')),
  identity_variant text check (identity_variant in ('verified_builder', 'paid_builder')),  -- A/B test
  subscribed_at timestamptz not null default now(),
  next_send_at timestamptz,
  last_sent_at timestamptz,
  unsubscribed_at timestamptz
);
create unique index soap_opera_email_unique on public.soap_opera_subscribers(email);
create index soap_opera_due_idx on public.soap_opera_subscribers(next_send_at) where status = 'active';

-- ab_tests: lightweight event log (spec: key, variant, conversion_event, timestamp)
create table public.ab_tests (
  id uuid primary key default gen_random_uuid(),
  key text not null,             -- 'identity_label'
  variant text not null,         -- 'verified_builder' | 'paid_builder'
  subject_id text,               -- email, session id, user id, etc.
  conversion_event text,         -- null = exposure; 'opt_in', 'starter_purchase', 'core_purchase'
  recorded_at timestamptz not null default now()
);
create index ab_tests_key_variant_idx on public.ab_tests(key, variant);
create index ab_tests_subject_idx on public.ab_tests(subject_id) where subject_id is not null;
