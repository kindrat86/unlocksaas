-- 0020_email_verification_and_double_opt_in
--
-- Adds plumbing for:
--   1. Double opt-in: new `pending_confirmation` status + confirmation_token +
--      confirmation_sent_at columns on every funnel subscriber table.
--   2. Resend bounce/complaint webhook: adds `complained` to every status enum
--      and backfills `bounced` on challenge_subscribers (was missing).
--
-- All four funnel tables get the same treatment so the webhook handler and the
-- /api/confirm/[token] endpoint can iterate over them uniformly.
--
-- Existing FunnelFixer carry-over subscribers (status='paused') are untouched:
-- they were verified during the original FunnelFixer signup and don't need to
-- re-confirm.
--
-- Service-role inserts (createAdminClient) bypass RLS, so the anon-insert
-- policies that hard-code status='active' continue to work for the existing
-- anon paths (none of which write 'pending_confirmation' directly).

-- ===========================================================================
-- soap_opera_subscribers
-- ===========================================================================
alter table public.soap_opera_subscribers
  drop constraint if exists soap_opera_subscribers_status_check;

alter table public.soap_opera_subscribers
  add constraint soap_opera_subscribers_status_check
  check (status in (
    'active',
    'paused',
    'unsubscribed',
    'completed',
    'bounced',
    'complained',
    'pending_confirmation'
  ));

alter table public.soap_opera_subscribers
  add column if not exists confirmation_token uuid;
alter table public.soap_opera_subscribers
  add column if not exists confirmation_sent_at timestamptz;

create unique index if not exists soap_opera_confirmation_token_idx
  on public.soap_opera_subscribers (confirmation_token)
  where confirmation_token is not null;

-- ===========================================================================
-- seinfeld_subscribers
-- ===========================================================================
alter table public.seinfeld_subscribers
  drop constraint if exists seinfeld_subscribers_status_check;

alter table public.seinfeld_subscribers
  add constraint seinfeld_subscribers_status_check
  check (status in (
    'active',
    'paused',
    'unsubscribed',
    'bounced',
    'errored',
    'complained',
    'pending_confirmation'
  ));

alter table public.seinfeld_subscribers
  add column if not exists confirmation_token uuid;
alter table public.seinfeld_subscribers
  add column if not exists confirmation_sent_at timestamptz;

create unique index if not exists seinfeld_confirmation_token_idx
  on public.seinfeld_subscribers (confirmation_token)
  where confirmation_token is not null;

-- ===========================================================================
-- challenge_subscribers (also gaining 'bounced' which was missing)
-- ===========================================================================
alter table public.challenge_subscribers
  drop constraint if exists challenge_subscribers_status_check;

alter table public.challenge_subscribers
  add constraint challenge_subscribers_status_check
  check (status in (
    'active',
    'complete',
    'unsubscribed',
    'paused',
    'bounced',
    'complained',
    'pending_confirmation'
  ));

alter table public.challenge_subscribers
  add column if not exists confirmation_token uuid;
alter table public.challenge_subscribers
  add column if not exists confirmation_sent_at timestamptz;

create unique index if not exists challenge_confirmation_token_idx
  on public.challenge_subscribers (confirmation_token)
  where confirmation_token is not null;

-- ===========================================================================
-- founding_waitlist
-- ===========================================================================
alter table public.founding_waitlist
  drop constraint if exists founding_waitlist_status_check;

alter table public.founding_waitlist
  add constraint founding_waitlist_status_check
  check (status in (
    'active',
    'complete',
    'unsubscribed',
    'bounced',
    'complained',
    'pending_confirmation'
  ));

alter table public.founding_waitlist
  add column if not exists confirmation_token uuid;
alter table public.founding_waitlist
  add column if not exists confirmation_sent_at timestamptz;

create unique index if not exists founding_waitlist_confirmation_token_idx
  on public.founding_waitlist (confirmation_token)
  where confirmation_token is not null;

-- ===========================================================================
-- Backfill: existing FunnelFixer carry-over subscribers are exempt from
-- double opt-in. They're already at status='paused' from the import script,
-- so nothing to update — just documenting the intent.
-- ===========================================================================
