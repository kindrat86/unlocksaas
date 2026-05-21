-- MCP write-tool support: per-founder API keys + playbook progress storage.
--
-- Context
-- -------
-- The MCP server at /api/mcp shipped 22 read-only tools (V1+V2 diagnosis,
-- catalogue listings, glossary, podcast inventory, canonical offer). This
-- migration adds the storage layer the first MCP **write** tool needs:
--
--   1. profiles.mcp_api_key — a per-founder secret an agent can present to
--      identify which founder's playbook progress it is updating. The key
--      lives only in this table; it is never logged, never returned in MCP
--      responses, and is rotatable by overwriting the column from the
--      future settings UI.
--
--   2. playbook_progress — per-founder, per-step status of the seven
--      Playbook steps defined in src/lib/playbook-steps.ts. Step IDs are
--      1..7 matching the existing public /playbook/step/<n> URLs and the
--      existing get_playbook_step MCP tool's input schema.
--
-- Why an API key (not a Supabase JWT)
-- -----------------------------------
-- The MCP transport is JSON-RPC over HTTP. Most MCP clients (Claude
-- Desktop, Cursor, Windsurf) have first-class support for static bearer
-- tokens and no support for the Supabase OAuth dance. A long-lived,
-- revocable per-founder key matches the agentic-web auth pattern other
-- 2026 SaaS MCP servers ship (Stripe, Notion, Linear).
--
-- Privacy gate
-- ------------
-- The read tools added in the same PR (get_diagnostic, get_thirty_day_plan,
-- get_rewrites) do NOT use the API key. They read diagnostic_leads where
-- share_visibility = 'public', i.e. exactly the same gate the public
-- /diagnosis/<id> page already enforces. The API key only exists for the
-- write tool (update_progress) and any future tools that need to write or
-- read founder-scoped state.

-- ── profiles.mcp_api_key ──────────────────────────────────────────────────
alter table public.profiles
  add column if not exists mcp_api_key text;

-- Unique partial index: many profiles have null keys, but no two profiles
-- may share the same non-null key. Partial keeps the index small.
create unique index if not exists profiles_mcp_api_key_idx
  on public.profiles (mcp_api_key)
  where mcp_api_key is not null;

comment on column public.profiles.mcp_api_key is
  'Per-founder bearer token for the MCP server. Format: usk_<22 base64url chars>. Null = no MCP access yet. Generated via public.mint_mcp_api_key(profile_id) by the future settings UI; rotated by overwriting the column.';

-- ── mint_mcp_api_key() helper ─────────────────────────────────────────────
-- Server-side key generator. Service-role-only by revocation below. The
-- future /api/profile/mcp-key route handler (not in this PR) will call
-- this via the admin client to mint or rotate a key.
create or replace function public.mint_mcp_api_key(p_profile_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  -- 24 random bytes → 32 base64 chars. Replace url-unsafe chars and strip
  -- padding so the key is safe in URLs, headers, and shell quoting.
  v_key := 'usk_' || replace(replace(replace(encode(gen_random_bytes(24), 'base64'), '+', '-'), '/', '_'), '=', '');
  update public.profiles set mcp_api_key = v_key where id = p_profile_id;
  return v_key;
end;
$$;

-- Lock the helper to service-role. Anon/authenticated must never mint a
-- key — that would let any signed-in user enumerate or rotate keys for
-- other profiles by guessing UUIDs.
revoke execute on function public.mint_mcp_api_key(uuid) from anon;
revoke execute on function public.mint_mcp_api_key(uuid) from authenticated;
revoke execute on function public.mint_mcp_api_key(uuid) from public;

-- ── playbook_progress ─────────────────────────────────────────────────────
-- One row per (founder, playbook step). Composite primary key gives us a
-- natural upsert target so update_progress is a single ON CONFLICT.
create table if not exists public.playbook_progress (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  step integer not null check (step between 1 and 7),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  notes text,
  updated_at timestamptz not null default now(),
  primary key (profile_id, step)
);

create index if not exists playbook_progress_profile_updated_idx
  on public.playbook_progress (profile_id, updated_at desc);

-- Auto-stamp updated_at on every UPDATE so the column tracks the real
-- last-write time even when the caller forgets to set it.
drop trigger if exists playbook_progress_set_updated_at on public.playbook_progress;
create trigger playbook_progress_set_updated_at
  before update on public.playbook_progress
  for each row execute function public.set_updated_at();

comment on table public.playbook_progress is
  'Per-founder Playbook step state. Step is 1..7, matching src/lib/playbook-steps.ts and the public /playbook/step/<n> URLs. Updated by the MCP update_progress tool (and, eventually, the in-product Playbook UI).';
comment on column public.playbook_progress.status is
  'not_started | in_progress | completed. Default not_started. Set by MCP update_progress or by the in-product Playbook UI.';
comment on column public.playbook_progress.notes is
  'Free-text founder note attached to the step transition. Optional, ≤ 2000 chars (enforced by the MCP handler, not the column type).';

-- ── RLS ──────────────────────────────────────────────────────────────────
alter table public.playbook_progress enable row level security;

-- A signed-in founder can read their own progress.
drop policy if exists playbook_progress_self_read on public.playbook_progress;
create policy playbook_progress_self_read on public.playbook_progress
  for select to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );

-- A signed-in founder can write their own progress. The MCP update_progress
-- handler runs as service-role and bypasses RLS, but a future in-product
-- Playbook UI driven by the session client will use this policy.
drop policy if exists playbook_progress_self_write on public.playbook_progress;
create policy playbook_progress_self_write on public.playbook_progress
  for all to authenticated
  using (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  )
  with check (
    profile_id in (select id from public.profiles where user_id = auth.uid())
  );
