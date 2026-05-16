-- 0002_dream_100_outreach_stripe_conversions
--
--   - public.dream_100_entries     per-project list; seeded from workbook 08 or custom
--   - public.outreach_actions      Machine Step 5/6 send + verify log
--   - public.stripe_connections    user's OWN Stripe account via Connect (guarantee verification)
--   - public.verified_conversions  first-paying-customer evidence detected via webhook

-- dream_100_entries: per-project; seeded from workbook 08 for own niche, custom for others
create table public.dream_100_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  -- workbook 08 has 7 categories
  category int not null check (category between 1 and 7),
  name text not null,
  handle text,
  platform text,            -- 'x', 'indie_hackers', 'reddit', 'youtube', 'newsletter', 'podcast', etc.
  url text,
  audience_size int,
  relevance_score int check (relevance_score between 0 and 100),
  notes text,
  source text not null default 'custom' check (source in ('workbook_seed', 'custom')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index dream_100_project_category_idx on public.dream_100_entries(project_id, category);
create trigger set_dream_100_updated_at
  before update on public.dream_100_entries
  for each row execute function public.set_updated_at();

-- outreach_actions: spec exactly (channel, target_from_dream_100, message_sent, public_link, verified_live, response_received, converted, timestamps)
create table public.outreach_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  channel text not null check (channel in ('email', 'indie_hackers', 'reddit', 'twitter_x', 'lovable_discord', 'other')),
  target_id uuid references public.dream_100_entries(id) on delete set null,
  message_sent text not null,
  public_link text,                                 -- non-email channels post-and-verify
  verified_live bool not null default false,        -- link confirmed live (workbook 04 §6)
  response_received bool not null default false,
  converted bool not null default false,
  sent_at timestamptz not null default now(),
  verified_at timestamptz,
  responded_at timestamptz,
  converted_at timestamptz
);
create index outreach_project_sent_idx on public.outreach_actions(project_id, sent_at desc);

-- stripe_connections: user's OWN Stripe account (Connect), used for guarantee verification.
-- Distinct from projects.stripe_customer_id which is UnlockSaaS's billing relationship with the user.
create table public.stripe_connections (
  project_id uuid primary key references public.projects(id) on delete cascade,
  stripe_account_id text not null,    -- acct_*
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz
);
create unique index stripe_connections_account_unique on public.stripe_connections(stripe_account_id);

-- verified_conversions: first-paying-customer evidence, read off connected account via webhook
create table public.verified_conversions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  stripe_charge_id text not null,
  amount_cents int not null,
  currency text not null default 'usd',
  customer_email text,
  detected_at timestamptz not null default now()
);
create unique index verified_conversions_charge_unique on public.verified_conversions(stripe_charge_id);
create index verified_conversions_project_idx on public.verified_conversions(project_id, detected_at desc);
