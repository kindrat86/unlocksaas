-- 0022_first_win_agent_kind
--
-- Extends the agent_runs CHECK constraint with a fourth agent kind:
-- `first_win_starter`.
--
-- The first-win agent is the AI onboarding flow that fires the moment a
-- founder completes the $1 Starter checkout. It drafts the founder's OWN
-- Attractive Character profile (Step 3 deliverable) and the founder's OWN
-- Soap Opera Email 1 (Step 4-adjacent deliverable for their list), seeded
-- from the diagnostic teardown they ran on the squeeze.
--
-- These are STARTER drafts – not final – designed to give the founder a
-- "first win" inside 5 minutes. They edit, accept, or regenerate from
-- /first-win, then the assets carry over into Steps 3 + 4 of the Playbook
-- where the engine takes them the rest of the way.
--
-- Why a new agent_kind and not a new table:
--   - Same input/output JSONB shape as the existing agents.
--   - Same persist + load helpers in lib/agents.ts work unchanged.
--   - Same RLS policy (project-id join) gates reads + writes.
--   - One less migration, one less typegen drift.
--
-- Output shape for first_win_starter:
--   {
--     ac_profile_draft: string (markdown),
--     sos_email_1_draft: string (markdown),
--     reasoning_steps: string[],   // visible-reasoning trace the UI showed
--     placeholders: string[]       // [PLACEHOLDER: ...] markers the founder must fill
--   }
--
-- Input shape:
--   {
--     diagnostic_lead_id?: string,  // diagnostic_leads.id when present
--     product_url?: string,
--     dream_customer_text?: string, // if the founder already filled Step 1
--     offer_text?: string           // if the founder already filled Step 2
--   }

alter table public.agent_runs
  drop constraint if exists agent_runs_agent_kind_check;

alter table public.agent_runs
  add constraint agent_runs_agent_kind_check
  check (
    agent_kind in (
      'offer_scorer',
      'outreach_drafter',
      'page_rewriter',
      'first_win_starter'
    )
  );

comment on constraint agent_runs_agent_kind_check on public.agent_runs is
  'Allowed agent kinds. Add new kinds via migration that alters this constraint.';
