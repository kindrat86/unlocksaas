-- 0006_rls_initplan_and_fk_index
--
-- Fixes flagged by Supabase PERFORMANCE advisors after 0005:
--   - 0003 auth_rls_initplan -- rewrite every auth.uid() as (select auth.uid())
--     so it's evaluated ONCE per query instead of once per row
--   - 0001 unindexed_foreign_keys -- add covering index for outreach_actions.target_id

-- projects
drop policy "projects_select_own" on public.projects;
drop policy "projects_insert_own" on public.projects;
drop policy "projects_update_own" on public.projects;

create policy "projects_select_own"
  on public.projects for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "projects_update_own"
  on public.projects for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- project_state
drop policy "project_state_select_own" on public.project_state;
drop policy "project_state_insert_own" on public.project_state;
drop policy "project_state_update_own" on public.project_state;

create policy "project_state_select_own"
  on public.project_state for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = (select auth.uid())
  ));

create policy "project_state_insert_own"
  on public.project_state for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = (select auth.uid())
  ));

create policy "project_state_update_own"
  on public.project_state for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = (select auth.uid())
  ));

-- dream_100_entries
drop policy "dream_100_select_own" on public.dream_100_entries;
drop policy "dream_100_insert_own" on public.dream_100_entries;
drop policy "dream_100_update_own" on public.dream_100_entries;
drop policy "dream_100_delete_own" on public.dream_100_entries;

create policy "dream_100_select_own"
  on public.dream_100_entries for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = (select auth.uid())
  ));

create policy "dream_100_insert_own"
  on public.dream_100_entries for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = (select auth.uid())
  ));

create policy "dream_100_update_own"
  on public.dream_100_entries for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = (select auth.uid())
  ));

create policy "dream_100_delete_own"
  on public.dream_100_entries for delete to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = (select auth.uid())
  ));

-- outreach_actions
drop policy "outreach_select_own" on public.outreach_actions;
drop policy "outreach_insert_own" on public.outreach_actions;
drop policy "outreach_update_own" on public.outreach_actions;

create policy "outreach_select_own"
  on public.outreach_actions for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = (select auth.uid())
  ));

create policy "outreach_insert_own"
  on public.outreach_actions for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = (select auth.uid())
  ));

create policy "outreach_update_own"
  on public.outreach_actions for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = (select auth.uid())
  ));

-- stripe_connections
drop policy "stripe_connections_select_own" on public.stripe_connections;
create policy "stripe_connections_select_own"
  on public.stripe_connections for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = stripe_connections.project_id and p.user_id = (select auth.uid())
  ));

-- verified_conversions
drop policy "verified_conversions_select_own" on public.verified_conversions;
create policy "verified_conversions_select_own"
  on public.verified_conversions for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = verified_conversions.project_id and p.user_id = (select auth.uid())
  ));

-- Covering index for outreach_actions.target_id FK (advisor 0001)
create index outreach_target_id_idx on public.outreach_actions(target_id);
