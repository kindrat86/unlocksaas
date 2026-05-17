-- 20260517030000_milestones
--
-- The `milestones` table tracks the six in-product milestones that gate the
-- 60-day guarantee per Hard Rule #4 of BUILD-PROMPT-CLAUDE-CODE.md.
--
-- It was created out-of-band on the live database (iihtadgnpheuwkcuumhw) by a
-- concurrent build session on 2026-05-17 but never committed as a migration,
-- so `supabase db reset` failed for fresh local environments. This migration
-- captures the live shape so the repo and DB agree.
--
-- Shape:
--   profile_id  → profiles.id (the user's billing identity, since the
--                 guarantee evaluator reads payments + conversions by profile_id)
--   key         → one of the canonical MILESTONE_KEYS in app/src/lib/guarantee.ts
--   source      → 'engine' | 'webhook' | 'manual' (provenance for ops debugging)
--   metadata    → optional jsonb (e.g. {stepId, questionIndex})
--   achieved_at → first time the milestone fired; duplicates suppressed by
--                 the unique (profile_id, key) index so markMilestone() is
--                 idempotent.
--
-- Idempotency is the load-bearing property: the engine fires markMilestone()
-- on every step completion, and we never want a duplicate ledger entry.

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  source text not null default 'engine' check (source in ('engine','webhook','manual')),
  metadata jsonb,
  achieved_at timestamptz not null default now()
);

create unique index if not exists milestones_profile_key_unique
  on public.milestones (profile_id, key);

create index if not exists milestones_profile_idx
  on public.milestones (profile_id, achieved_at desc);

-- RLS: users see only their own milestones; service-role writes are unrestricted.
alter table public.milestones enable row level security;

drop policy if exists "milestones_select_own" on public.milestones;
create policy "milestones_select_own"
  on public.milestones for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = milestones.profile_id
        and p.user_id = (select auth.uid())
    )
  );

-- INSERT / UPDATE happen via service-role only (admin client in
-- markMilestone()). No authenticated-write policy by design — the engine is
-- the only sanctioned milestone writer.
