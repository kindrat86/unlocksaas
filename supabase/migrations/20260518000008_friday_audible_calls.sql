-- Friday Audible Call audit log
--
-- Closes DotCom Secrets Secret #28 (Funnel Audibles) audit gap by converting
-- the manual Friday Audible Call ritual from a founder-discipline check into
-- a self-firing system that records every read of the audible dashboard,
-- whether triggered by cron, by a manual CLI run, or by an API tick.
--
-- Source spec: strategy/funnel-audibles.md Part 5 + Closing.
-- Read companion: public.funnel_audibles__weekly_top_of_funnel (SQL view).
-- Cron route: app/src/app/api/cron/friday-audible-call/route.ts.
-- CLI mirror: scripts/friday-audible-call.py.
--
-- Why a dedicated table instead of reusing cron_run_history:
--   1. The audit row needs more shape than {ok, processed, sent, failed}.
--      The Friday Call captures the full snapshot, the chosen worst metric,
--      the trigger-matrix row it crossed, the audible recommended, and the
--      prediction the operator (or system) made about what will move.
--   2. cron_run_history is bounded to cron-tick observability. Manual CLI
--      and API-triggered runs also need to be recorded — both are valid
--      sources for the Friday Call discipline.
--   3. The Friday-Friday delta read ("did last week's audible actually
--      move the metric?") needs row-to-row comparison, which is cleaner
--      against a dedicated table than against a generic cron log.

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- friday_audible_calls
-- ---------------------------------------------------------------------------
-- Every row is one Friday Call: one read of the weekly top-of-funnel view,
-- one computed worst-metric verdict, optionally one audible fired, and
-- optionally one founder-facing email sent.
--
-- The table is append-only. To reverse an audible, fire a new audible
-- (Brunson rule: every audible is reversible by a follow-up audible, not
-- by deleting the row that fired it).
create table if not exists public.friday_audible_calls (
  id                       uuid primary key default gen_random_uuid(),
  ran_at                   timestamptz not null default now(),

  -- Provenance: who fired this read.
  source                   text not null
                           check (source in ('cron', 'manual_cli', 'api', 'dry_run')),

  -- The whole view row, captured at read time. Lets a future audit
  -- reconstruct what the operator saw on a specific Friday even if the
  -- view definition changes later.
  snapshot                 jsonb not null,

  -- The computed verdict. Worst-metric key matches a column from
  -- funnel_audibles__weekly_top_of_funnel; trigger_matrix_row matches the
  -- numeric row from strategy/funnel-audibles.md Part 4.
  worst_metric_key         text,
  worst_metric_value       numeric,
  worst_metric_target      numeric,
  worst_metric_red_line    numeric,
  trigger_matrix_row       int,

  -- Status: pre_launch_no_data (windows unmet, no audible fires) /
  -- green (no red-lines crossed) / red (audible recommended) /
  -- inverted (existential row 16 — refunds > verified, escalate to
  -- Revision Mode) / cron_error (read failed).
  status                   text not null
                           check (status in (
                             'pre_launch_no_data',
                             'green',
                             'red',
                             'inverted',
                             'cron_error'
                           )),

  -- The recommended audible (e.g. "step_2_audible_a") from the playbook.
  -- NULL when status is green or pre_launch_no_data.
  audible_recommended      text,

  -- Did the operator (or the automation) actually fire the audible?
  -- Distinct from "recommended" because a recommendation can be vetoed
  -- per Part 9 (anti-audibles / veto list).
  audible_fired            text,

  -- One-sentence prediction the operator (or automation) makes about
  -- what will move next Friday. Compared against next Friday's read.
  prediction               text,

  -- Was an email sent to maryan@unlocksaas.com? Resend message ID is the
  -- proof.
  email_sent               boolean not null default false,
  email_message_id         text,

  -- Free-form notes. Used for the inaugural dry-run + any manual ops.
  notes                    text,

  created_at               timestamptz not null default now()
);

-- Most reads are "what was last Friday's call?" — order by ran_at desc.
create index if not exists friday_audible_calls_ran_at_idx
  on public.friday_audible_calls (ran_at desc);

-- The Friday-to-Friday delta read needs to find last Friday's row quickly
-- when computing this Friday's prediction-vs-actual.
create index if not exists friday_audible_calls_source_ran_at_idx
  on public.friday_audible_calls (source, ran_at desc);

-- ---------------------------------------------------------------------------
-- RLS — service-role only. No anon or authenticated reads.
-- The audit log holds revenue + refund signal in the snapshot column.
-- Founder access is via the Supabase SQL editor (service-role context) or
-- the email the cron sends.
-- ---------------------------------------------------------------------------
alter table public.friday_audible_calls enable row level security;

revoke select, insert, update, delete on public.friday_audible_calls
  from anon, authenticated;

comment on table public.friday_audible_calls is
  'Friday Audible Call audit log (DCS Secret #28). One row per read of public.funnel_audibles__weekly_top_of_funnel. Captures snapshot, worst metric, recommended audible, prediction. Append-only; reverse audibles by firing new ones. Doc: strategy/funnel-audibles.md.';
comment on column public.friday_audible_calls.source is
  'Provenance: cron (weekly Vercel cron), manual_cli (scripts/friday-audible-call.py), api (one-off POST), dry_run (pre-launch readiness fire).';
comment on column public.friday_audible_calls.snapshot is
  'Captured row from public.funnel_audibles__weekly_top_of_funnel at ran_at. Lets reads reconstruct what the operator saw on a specific Friday even if the view definition evolves.';
comment on column public.friday_audible_calls.status is
  'pre_launch_no_data: windows unmet across the trigger matrix. green: no red-lines crossed. red: audible recommended (and possibly fired). inverted: existential row 16 (refunds > verified) — escalate to Revision Mode. cron_error: read failed.';
comment on column public.friday_audible_calls.audible_recommended is
  'Recommended audible key from the playbook (e.g. step_2_audible_a). NULL when status is green or pre_launch_no_data.';
comment on column public.friday_audible_calls.audible_fired is
  'What was actually swapped in. Distinct from recommended because some recommendations are vetoed per Part 9.';
comment on column public.friday_audible_calls.prediction is
  'Operator (or automation) prediction about what moves next Friday. Compared against next Friday`s read for learning.';
