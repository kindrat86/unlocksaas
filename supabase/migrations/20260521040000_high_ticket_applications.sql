-- High-Ticket Application Funnel (DotCom Secrets Secret #18).
--
-- Backs the /apply page. Adds the "Done-With-You Verified Builder Sprint"
-- rung to the value ladder above the $49/mo Playbook.
--
-- Two SKUs:
--   * $997 one-time   – self-paced Sprint
--   * $1,997 one-time – Sprint + one 1-hour 1:1 with the founder
--
-- Brunson logic: this is the application funnel, not a public buy button.
-- Visitors fill the 6-question form; we auto-qualify on (budget = yes) and
-- route to /apply/qualified (Calendly embed). Non-qualified visitors land on
-- /apply/not-yet which routes them back to the $1 Starter or $49/mo Playbook.
--
-- RLS rule: anon CAN insert (the form is public) with strict CHECK validation.
-- No SELECT/UPDATE/DELETE for anon — operator reads happen through the admin
-- client (Vercel server runtime, service-role key).

create table public.high_ticket_applications (
  id                    uuid primary key default gen_random_uuid(),

  -- Identity
  email                 text not null,
  first_name            text not null,
  product_url           text,

  -- The 6 application questions
  mrr_band              text not null
                          check (mrr_band in (
                            'pre_revenue',
                            'under_1k',
                            '1k_to_5k',
                            '5k_to_20k',
                            'over_20k'
                          )),
  biggest_blocker       text not null
                          check (length(biggest_blocker) between 10 and 1000),
  why_now               text not null
                          check (length(why_now) between 10 and 1000),
  has_budget            boolean not null,
  preferred_tier        text
                          check (preferred_tier is null
                            or preferred_tier in ('sprint_997', 'sprint_1997')),
  calendar_preference   text
                          check (calendar_preference is null
                            or calendar_preference in (
                              'this_week',
                              'next_week',
                              'flexible'
                            )),

  -- Attribution + tracking
  source                text not null default 'apply_page'
                          check (length(source) <= 64),
  ref_code              text
                          check (ref_code is null or length(ref_code) <= 16),
  identity_variant      text
                          check (identity_variant is null or identity_variant in (
                            'verified_builder',
                            'paid_builder'
                          )),

  -- Operator workflow state
  qualification         text not null default 'pending'
                          check (qualification in (
                            'pending',
                            'qualified',
                            'not_yet'
                          )),
  qualification_reason  text,
  status                text not null default 'new'
                          check (status in (
                            'new',
                            'scheduled',
                            'closed_won',
                            'closed_lost',
                            'no_show',
                            'archived'
                          )),
  scheduled_at          timestamptz,
  closed_at             timestamptz,
  notes                 text,

  -- Timestamps
  submitted_at          timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- One application per email at a time. If the same person applies again, the
-- upsert resets qualification/status so the operator sees a fresh row. Brunson
-- rule: respect the second touch — they're more serious the second time.
create unique index high_ticket_applications_email_unique
  on public.high_ticket_applications (lower(email));

-- Operator dashboard scan: newest pending qualifications first.
create index high_ticket_applications_pending_idx
  on public.high_ticket_applications (submitted_at desc)
  where qualification = 'pending';

-- Operator dashboard scan: qualified-and-not-yet-scheduled leads.
create index high_ticket_applications_to_schedule_idx
  on public.high_ticket_applications (submitted_at desc)
  where qualification = 'qualified' and status = 'new';

-- Reuse the existing helper (defined in migration 0001).
create trigger high_ticket_applications_updated_at
  before update on public.high_ticket_applications
  for each row execute function public.set_updated_at();

alter table public.high_ticket_applications enable row level security;

-- anon insert policy: validates shape + initial state.
-- All operator-mutated columns must be at their initial values; the admin
-- client (service-role) does qualification/status updates.
create policy "high_ticket_applications_anon_insert"
  on public.high_ticket_applications
  for insert
  to anon
  with check (
    length(email) between 3 and 320
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and length(first_name) between 1 and 60
    and (product_url is null or length(product_url) <= 2048)
    and length(biggest_blocker) between 10 and 1000
    and length(why_now) between 10 and 1000
    and qualification = 'pending'
    and status = 'new'
    and scheduled_at is null
    and closed_at is null
    and qualification_reason is null
    and notes is null
  );

-- No SELECT/UPDATE/DELETE policies → service-role only. RLS is fully enforced.

comment on table public.high_ticket_applications is
  'High-Ticket Application Funnel (Sprint $997 / $1,997). Rung 3 of the value ladder. Operator-reviewed via admin client.';
