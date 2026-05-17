-- Email Events — Resend webhook event sink
--
-- Closes DCS Secret #6 (Soap Opera Sequence) audit gap by capturing
-- delivery, bounce, complaint, open, and click events from Resend.
-- Without this, the Soap Opera + Seinfeld + Cart Recovery + Founding +
-- Challenge cadences are half-blind: we know we sent but not whether the
-- inbox accepted, the user opened, or the address bounced.
--
-- One row per Resend webhook event. Populated by the route handler at
-- app/src/app/api/webhooks/resend/route.ts which verifies the Svix
-- signature against RESEND_WEBHOOK_SECRET.
--
-- Schema design:
--   - email is the join key against all 5 subscriber tables (always
--     stored lowercase for case-insensitive joins)
--   - resend_email_id captured for direct correlation with Resend's
--     own dashboard
--   - sequence + email_index + diagnosis lifted from the Resend
--     `tags` array (set by dispatch.ts on every send)
--   - svix_id is unique to dedupe webhook replays (Svix retries failed
--     deliveries with the same id)
--   - payload jsonb is the full event for forensics
--
-- Brunson rule for follow-up: stop chasing the second they reject you.
-- The webhook handler auto-flips subscriber status to 'bounced' on hard
-- bounce and 'unsubscribed' on complaint, across all 5 cadence tables.

set local search_path = public, pg_catalog;

create table if not exists public.email_events (
  id                uuid primary key default gen_random_uuid(),
  event_type        text not null
                    check (event_type in (
                      'email.sent',
                      'email.delivered',
                      'email.delivery_delayed',
                      'email.bounced',
                      'email.complained',
                      'email.opened',
                      'email.clicked',
                      'email.failed'
                    )),
  email             text not null,
  resend_email_id   text,
  sequence          text check (sequence in (
                      'soap_opera',
                      'seinfeld',
                      'founding',
                      'cart_recovery',
                      'challenge',
                      'transactional'
                    ) or sequence is null),
  email_index       int check (email_index is null or email_index >= 0),
  diagnosis         text check (diagnosis in (
                      'wrong_person',
                      'weak_offer',
                      'weak_belief',
                      'none'
                    ) or diagnosis is null),
  occurred_at       timestamptz not null,
  received_at       timestamptz not null default now(),
  payload           jsonb,
  svix_id           text
);

-- Dedupe webhook replays. Resend (via Svix) retries failed deliveries
-- with the same svix_id; the partial unique index makes the insert
-- harmless on retry.
create unique index if not exists email_events_svix_id_uq
  on public.email_events (svix_id)
  where svix_id is not null;

-- Per-recipient lookup (the join key against the 5 subscriber tables).
create index if not exists email_events_email_idx
  on public.email_events (lower(email));

-- "Show me bounces in the last 7 days" / Friday Audible Call.
create index if not exists email_events_type_occurred_idx
  on public.email_events (event_type, occurred_at desc);

-- "What's the open rate of Soap Opera email 3?" join query.
create index if not exists email_events_sequence_idx
  on public.email_events (sequence, email_index, event_type)
  where sequence is not null;

-- ---------------------------------------------------------------------------
-- RLS — service-role only. The webhook handler runs as admin client;
-- no public/authenticated read path. If a dashboard surface is ever added,
-- expose via a security-definer view, not direct table access.
-- ---------------------------------------------------------------------------
alter table public.email_events enable row level security;

revoke select, insert, update, delete on public.email_events
  from anon, authenticated;

comment on table public.email_events is
  'Resend webhook event sink (DCS Secret #6 / Soap Opera Sequence + ES Secret #17 / Email Follow-Up). One row per email.sent / delivered / bounced / complained / opened / clicked event. Populated by app/src/app/api/webhooks/resend/route.ts with Svix signature verification. Auto-flips subscriber status on bounce/complaint per Brunson follow-up rule. Doc: strategy/follow-up-funnels.md.';
