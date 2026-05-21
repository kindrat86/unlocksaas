-- 0020_sos_three_spine_two_branch
--
-- Restructures the Soap Opera Sequence from a 5-email spine into a
-- 3-email spine + 2 behavioral branches (one of which fires on day 6,
-- gated on E3 open/click signal forwarded via the Resend webhook).
--
-- Decision doc: strategy/decisions/sos-3-spine-2-branch.md
-- Empirical wedge: 58% of cold replies arrive on email 1, 80% by email 3
-- — so we keep the Reluctant Hero narrative intact (Star + Backstory,
-- The Wall, Epiphany + offer) and add two behavioral follow-ups instead
-- of mechanical day-3/day-4 sends.
--
-- New columns:
--   e3_opened_at         set by Resend webhook (email.opened on E3)
--   e3_clicked_at        set by Resend webhook (email.clicked on E3)
--   branch_fired         'none' | 'soft_sell' | 'objection_handler'
--                        — exactly one branch fires per subscriber, ever
--   branch_fired_at      audit + idempotency guard for the day-6 cron pass
--
-- Index supports the cron's day-6 candidate query:
--   where branch_fired = 'none' and e3_sent_at <= now() - 2d
-- — partial on branch_fired='none' so the index stays small as the
-- objection_handler/soft_sell rows accumulate.
--
-- Schema continuity:
--   We do NOT add a column called `e3_sent_at`. Existing logic already
--   stores last_sent_at + emails_sent, and the cron derives "E3 was sent"
--   as (emails_sent >= 3 AND last_sent_at IS NOT NULL). Keeping that
--   semantic untouched means no backfill on existing rows.
--
-- Operator note:
--   This migration does NOT auto-apply to prod via Supabase MCP. Run
--     supabase db push
--   (or apply via the Supabase SQL editor) after the PR merges.

alter table public.soap_opera_subscribers
  add column if not exists e3_opened_at  timestamptz null,
  add column if not exists e3_clicked_at timestamptz null,
  add column if not exists branch_fired  text not null default 'none',
  add column if not exists branch_fired_at timestamptz null;

alter table public.soap_opera_subscribers
  drop constraint if exists soap_opera_subscribers_branch_fired_check;

alter table public.soap_opera_subscribers
  add constraint soap_opera_subscribers_branch_fired_check
  check (branch_fired in ('none', 'soft_sell', 'objection_handler'));

-- Day-6 candidate index. Partial index keeps it small: only rows that
-- have not yet been routed to a branch are candidates. Once branch_fired
-- flips off 'none', the row drops out of the index.
create index if not exists soap_opera_branch_pending_idx
  on public.soap_opera_subscribers (last_sent_at)
  where branch_fired = 'none';
