-- 0021_fix_soap_opera_complete_status
--
-- Reverts a regression introduced by 20260518000020. Migration 0007 had
-- already standardised the soap_opera_subscribers status enum on 'complete'
-- (no 'd') to match the dispatcher in lib/soap-opera/dispatch.ts and the
-- Seinfeld auto-enroll cron in api/cron/seinfeld/route.ts. My 0020 migration
-- re-introduced the legacy 'completed' spelling while adding the new
-- 'complained' and 'pending_confirmation' values.
--
-- Net effect of the bug: a subscriber that finished Email 5 would trigger a
-- check_violation on the dispatcher's status update, and would never enter
-- the 'complete' state Seinfeld scans for. So Soap Opera graduates would
-- silently fail to graduate.
--
-- Fix: swap 'completed' for 'complete' in the constraint. No rows are
-- affected (no subscriber has reached completion yet — the migration window
-- between 0020 and now is hours).

alter table public.soap_opera_subscribers
  drop constraint if exists soap_opera_subscribers_status_check;

alter table public.soap_opera_subscribers
  add constraint soap_opera_subscribers_status_check
  check (status in (
    'active',
    'paused',
    'unsubscribed',
    'complete',
    'bounced',
    'complained',
    'pending_confirmation'
  ));
