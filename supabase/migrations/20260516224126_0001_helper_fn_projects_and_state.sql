-- 0001_helper_fn_projects_and_state
--
-- Core entities for the Brunson Machine product layer.
--   - public.set_updated_at()  shared trigger fn
--   - public.projects          one-per-user; tracks tier, billing customer, 60-day clock
--   - public.project_state     jsonb sections mirroring strategy/state.json
--
-- Spec: strategy/BUILD-PROMPT-CLAUDE-CODE.md §"Database schema"

-- Shared updated_at trigger function (hardened later in 0005 to set search_path)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- projects: one per user (spec: "one per user, named, current_step pointer, niche, identity_choice")
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'My Project',
  niche text,
  current_step int not null default 1 check (current_step between 1 and 7),
  identity_choice text check (identity_choice in ('verified_builder', 'paid_builder')),
  -- billing / tier (UnlockSaaS's own Stripe customer for this user)
  -- NOTE: overlaps with profiles.* in supabase/migrations/20260517000000_billing.sql.
  -- These columns may be removed in a future reconciling migration once profiles is applied.
  tier text not null default 'none' check (tier in ('none', 'starter', 'core')),
  stripe_customer_id text,
  stripe_subscription_id text,
  -- 60-day guarantee clock (starts at Core purchase)
  guarantee_started_at timestamptz,
  guarantee_refund_eligible bool not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Spec: "one per user" -- enforce
create unique index projects_user_id_unique on public.projects(user_id);
create unique index projects_stripe_customer_id_unique on public.projects(stripe_customer_id) where stripe_customer_id is not null;

create trigger set_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- project_state: jsonb sections that mirror strategy/state.json structure
create table public.project_state (
  project_id uuid primary key references public.projects(id) on delete cascade,
  dream_customer jsonb,    -- Machine Step 1 output (workbook 04 §2)
  offer jsonb,             -- Machine Step 2 output
  ac jsonb,                -- Machine Step 3 (Attractive Character -- workbook 01 §6 + workbook 06 §6)
  scripts jsonb,           -- Machine Step 4 (workbook 03 templates)
  outreach jsonb,          -- Machine Step 5 (assets + target list -- workbook 08)
  conversions jsonb,       -- Machine Step 7 (workbook 04 §7)
  badges_earned text[] not null default '{}',  -- workbook 05 §7 milestone badges
  updated_at timestamptz not null default now()
);

create trigger set_project_state_updated_at
  before update on public.project_state
  for each row execute function public.set_updated_at();
