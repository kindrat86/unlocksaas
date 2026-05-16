-- 0004_enable_rls_and_policies
--
-- Enables RLS on every public table and writes initial policies.
-- Service role bypasses RLS, so webhooks + server actions still work fine.
-- (Policies rewritten in 0006 to use (select auth.uid()) for per-query eval.)

alter table public.projects                enable row level security;
alter table public.project_state           enable row level security;
alter table public.dream_100_entries       enable row level security;
alter table public.outreach_actions        enable row level security;
alter table public.stripe_connections      enable row level security;
alter table public.verified_conversions    enable row level security;
alter table public.soap_opera_subscribers  enable row level security;
alter table public.ab_tests                enable row level security;

-- projects: user owns their project (one per user)
create policy "projects_select_own"
  on public.projects for select to authenticated
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- project_state
create policy "project_state_select_own"
  on public.project_state for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = auth.uid()
  ));

create policy "project_state_insert_own"
  on public.project_state for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = auth.uid()
  ));

create policy "project_state_update_own"
  on public.project_state for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = project_state.project_id and p.user_id = auth.uid()
  ));

-- dream_100_entries
create policy "dream_100_select_own"
  on public.dream_100_entries for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = auth.uid()
  ));

create policy "dream_100_insert_own"
  on public.dream_100_entries for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = auth.uid()
  ));

create policy "dream_100_update_own"
  on public.dream_100_entries for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = auth.uid()
  ));

create policy "dream_100_delete_own"
  on public.dream_100_entries for delete to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = dream_100_entries.project_id and p.user_id = auth.uid()
  ));

-- outreach_actions
create policy "outreach_select_own"
  on public.outreach_actions for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = auth.uid()
  ));

create policy "outreach_insert_own"
  on public.outreach_actions for insert to authenticated
  with check (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = auth.uid()
  ));

create policy "outreach_update_own"
  on public.outreach_actions for update to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = outreach_actions.project_id and p.user_id = auth.uid()
  ));

-- stripe_connections: read-only for users (writes happen via service role through OAuth callback)
create policy "stripe_connections_select_own"
  on public.stripe_connections for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = stripe_connections.project_id and p.user_id = auth.uid()
  ));

-- verified_conversions: read-only (webhook writes via service role)
create policy "verified_conversions_select_own"
  on public.verified_conversions for select to authenticated
  using (exists (
    select 1 from public.projects p
    where p.id = verified_conversions.project_id and p.user_id = auth.uid()
  ));

-- soap_opera_subscribers: anonymous opt-in (constrained in 0005); reads service-role only
create policy "soap_opera_anon_insert"
  on public.soap_opera_subscribers for insert to anon, authenticated
  with check (true);

-- ab_tests: anonymous can record (constrained in 0005); reads service-role only
create policy "ab_tests_anon_insert"
  on public.ab_tests for insert to anon, authenticated
  with check (true);
