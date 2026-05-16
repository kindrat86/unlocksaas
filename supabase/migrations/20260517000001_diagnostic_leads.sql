-- Diagnostic leads: every submission of the Free Diagnostic squeeze form.
--
-- One row per (email, product_url) — re-submitting the same URL with the same
-- email is treated as a re-diagnosis (upsert). Different URLs from the same
-- email each get their own row (multi-product founders happen).
--
-- The `converted_to_starter_at` column is set by the Stripe webhook handler
-- when the same email later shows up in billing_payments with tier='starter'.
-- That gives us first-touch attribution from Diagnostic → $1 buy without
-- needing UTM cookies.
--
-- Writes are service-role only (the /api/diagnostic route uses the admin
-- client). Reads on the result page also use the admin client, keyed by the
-- row id handed to the visitor at submit time.

create table if not exists public.diagnostic_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product_url text not null,
  -- Diagnosis label assigned by Claude. 'error' is reserved for the path
  -- where classifyUrl threw a recoverable failure (fetch blocked, page empty,
  -- engine glitch) — the visitor still gets a row + a recovery message.
  label text not null check (label in ('wrong_person','weak_offer','weak_belief','error')),
  -- Reluctant-Hero copy returned by the classifier. headline is ~6-12 words,
  -- explanation is ~100 words, evidence quotes the page, next_step is the CTA.
  headline text not null default '',
  explanation text not null,
  evidence text,
  next_step text,
  source text,
  -- A/B variant from workbook 05 §7 (verified_builder vs paid_builder). Same
  -- subject keeps the same variant across surfaces; we mirror the value
  -- written into soap_opera_subscribers so the soap_opera worker can read it
  -- without a join.
  identity_variant text check (identity_variant in ('verified_builder','paid_builder')),
  subscriber_id uuid references public.soap_opera_subscribers(id) on delete set null,
  user_agent text,
  ip inet,
  -- Attribution: set by the Stripe webhook when this lead's email lands a
  -- successful checkout.session.completed for the Starter price.
  converted_to_starter_at timestamptz,
  converted_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Re-diagnosis of the same URL by the same email is an update, not a new row.
create unique index if not exists diagnostic_leads_email_url_idx
  on public.diagnostic_leads (lower(email), product_url);

create index if not exists diagnostic_leads_email_idx
  on public.diagnostic_leads (lower(email));

create index if not exists diagnostic_leads_created_idx
  on public.diagnostic_leads (created_at desc);

create index if not exists diagnostic_leads_unconverted_idx
  on public.diagnostic_leads (created_at desc)
  where converted_to_starter_at is null;

create index if not exists diagnostic_leads_subscriber_idx
  on public.diagnostic_leads (subscriber_id)
  where subscriber_id is not null;

-- Reuse the set_updated_at function defined in the billing migration.
drop trigger if exists diagnostic_leads_set_updated_at on public.diagnostic_leads;
create trigger diagnostic_leads_set_updated_at
  before update on public.diagnostic_leads
  for each row execute function public.set_updated_at();

-- RLS on but no policies → service-role only.
alter table public.diagnostic_leads enable row level security;

comment on table public.diagnostic_leads is
  'Free Diagnostic squeeze-form submissions. Service-role writes; result page reads by id.';
comment on column public.diagnostic_leads.label is
  'wrong_person | weak_offer | weak_belief | error. Assigned by Claude.';
comment on column public.diagnostic_leads.converted_to_starter_at is
  'Set by Stripe webhook when this email buys the $1 Starter. First-touch attribution.';
comment on column public.diagnostic_leads.converted_session_id is
  'Stripe checkout session id that triggered the conversion. For audit + dedup.';
comment on column public.diagnostic_leads.source is
  'Where the lead came from. e.g. "funnel-hub", "x", "indiehackers". Defaults to null.';
comment on column public.diagnostic_leads.identity_variant is
  'A/B variant from workbook 05 §7. Mirrors soap_opera_subscribers.identity_variant.';
