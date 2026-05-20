-- 0021_agent_runs
--
-- Agentic execution layer for The Machine (Isenberg vertical-agent overlay).
-- Today The Machine is framework delivery (Q&A → assembled deliverable). This
-- table backs the next move: the engine *does the work* for each step where
-- Marco was historically going to procrastinate.
--
-- Three agent kinds in v1 (more will follow):
--   - offer_scorer    Step 2: scores the assembled offer against Brunson rubric, rewrites the weakest beat
--   - outreach_drafter Step 6: drafts the Reluctant-Hero message for a specific target before Marco can avoid it
--   - page_rewriter    Step 4: rewrites Marco's live landing page (pasted text) using locked WHO/WHAT/VOICE
--
-- Each row captures input + output as jsonb so we can ship new agent kinds
-- without further migrations. The agent_kind text column is the discriminator.
-- We persist runs (vs. fire-and-forget) so the UI hydrates on return and so
-- we can later score Brunson Results-in-Advance: did the founder USE the
-- agent output, or just generate it.

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  agent_kind text not null check (
    agent_kind in ('offer_scorer', 'outreach_drafter', 'page_rewriter')
  ),
  -- Free-form per-kind payload. For offer_scorer this is { source_step_output }.
  -- For outreach_drafter: { target_channel, target_name, notes }.
  -- For page_rewriter: { pasted_text }.
  input jsonb not null,
  -- Structured agent output. Shape varies by kind:
  --   offer_scorer: { scorecard: { specificity, guarantee, math, irresistibility, total }, weakness, rewrite }
  --   outreach_drafter: { draft, channel, target }
  --   page_rewriter: { headlines: string[], hero: string, oto: string, notes: string }
  output jsonb not null,
  -- Best-effort token + duration metering for operator-side cost tracking.
  duration_ms int,
  model text,
  created_at timestamptz not null default now()
);

create index agent_runs_project_kind_created_idx
  on public.agent_runs(project_id, agent_kind, created_at desc);

alter table public.agent_runs enable row level security;

-- User can read their own agent runs (RLS via the projects join, same pattern
-- as project_state).
create policy "agent_runs_select_own"
  on public.agent_runs for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = agent_runs.project_id and p.user_id = (select auth.uid())
  ));

-- Inserts go through the server (service role) on /api/engine/agent, but we
-- still want the policy in place in case a future server action runs under
-- the user's session.
create policy "agent_runs_insert_own"
  on public.agent_runs for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = agent_runs.project_id and p.user_id = (select auth.uid())
  ));
