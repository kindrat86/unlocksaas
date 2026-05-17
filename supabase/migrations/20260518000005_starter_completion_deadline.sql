-- 20260518000005_starter_completion_deadline
--
-- Brunson DotCom Secrets Secret #12 (Results-in-Advance), Beat 6:
-- "The result is time-bound — delivery is verifiable."
--
-- A buyer who pays $1 and never finishes Steps 1+2 didn't receive the
-- result-in-advance — they received an option on it. Brunson's chapter
-- is about delivery, not availability.
--
-- Three columns on public.profiles to make Starter completion a
-- first-class, time-bound, auditable event:
--
--   starter_completion_deadline_at        — set at Stripe webhook
--                                           (starter checkout completed)
--                                           to NOW + interval '48 hours'.
--   starter_completion_reminder_sent_at   — set by the daily cron at
--                                           deadline - 24h if both
--                                           steps not yet complete.
--   starter_completed_at                  — set by /api/engine when
--                                           project_state.dream_customer
--                                           AND project_state.offer are
--                                           both present.
--
-- Spec: strategy/results-in-advance.md beat 6 + beat 7.

alter table public.profiles
  add column if not exists starter_completion_deadline_at timestamptz,
  add column if not exists starter_completion_reminder_sent_at timestamptz,
  add column if not exists starter_completed_at timestamptz;

-- Index supports the daily cron's selection clause:
--   where starter_completion_deadline_at is not null
--     and starter_completion_reminder_sent_at is null
--     and starter_completed_at is null
--     and starter_completion_deadline_at <= now() + interval '24 hours'
--     and starter_completion_deadline_at >  now()
--
-- The cron has tight selectivity once we are above ~100 buyers — the
-- index keeps it cheap.
create index if not exists profiles_starter_deadline_pending_idx
  on public.profiles (starter_completion_deadline_at)
  where starter_completion_reminder_sent_at is null
    and starter_completed_at is null
    and starter_completion_deadline_at is not null;

-- Index supports the per-week completion-ratio aggregation:
--   group by date_trunc('week', starter_purchased_at)
create index if not exists profiles_starter_purchased_week_idx
  on public.profiles (starter_purchased_at)
  where starter_purchased_at is not null;

comment on column public.profiles.starter_completion_deadline_at is
  'Brunson RIA beat 6: 48h deadline set at Stripe starter checkout completion';
comment on column public.profiles.starter_completion_reminder_sent_at is
  'Brunson RIA beat 6: timestamp the deadline-minus-24h reminder fired';
comment on column public.profiles.starter_completed_at is
  'Brunson RIA beat 6: when /api/engine confirmed both Step 1 + Step 2 outputs are persisted';
