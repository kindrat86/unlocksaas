-- Builder badge fields on `profiles`.
--
-- Purpose: when a user's First Paying Customer Verified milestone fires, they
-- can opt in to a public "Verified Builder" badge at /builder/<slug>. The badge
-- is part of the Brunson Movement work in workbook 05 + workbook 10 §5
-- (butterfly play #2 — "Verified Builder badge for share"). It is the most
-- valuable piece of social proof UnlockSaaS has, by design: Stripe-verified,
-- not self-reported.
--
-- Columns added:
--
--   builder_slug         URL-safe identifier for /builder/<slug>. Unique.
--                        NULL means no public badge URL yet (auto-assigned
--                        on first share opt-in).
--   builder_name         Display name on the badge. Defaults to email local
--                        part on opt-in if not set.
--   product_name         Founder's product name (display).
--   product_url          Founder's product URL (display + link out).
--   share_visibility     'private' | 'public'. Default 'private'. Public badge
--                        page returns 404 when private.
--   first_customer_at    Timestamp of the first verified conversion. Mirrors
--                        the min(detected_at) from verified_conversions but
--                        avoids a join on every badge render.
--
-- The badge is rendered from these columns + the matching verified_conversions
-- row(s). Refunds DO NOT revoke the badge — the customer was real. If the user
-- later wants to take it down, they flip share_visibility back to private.

alter table public.profiles
  add column if not exists builder_slug text,
  add column if not exists builder_name text,
  add column if not exists product_name text,
  add column if not exists product_url text,
  add column if not exists share_visibility text
    not null default 'private'
    check (share_visibility in ('private','public')),
  add column if not exists first_customer_at timestamptz;

create unique index if not exists profiles_builder_slug_idx
  on public.profiles (builder_slug)
  where builder_slug is not null;

-- Public badge lookup needs to bypass RLS for unauthenticated visitors but
-- must NOT leak emails / billing data. We expose a narrow view limited to
-- the badge-relevant columns; the public page reads from this view.
create or replace view public.builder_badges as
  select
    p.id,
    p.builder_slug,
    p.builder_name,
    p.product_name,
    p.product_url,
    p.first_customer_at,
    p.share_visibility
  from public.profiles p
  where p.share_visibility = 'public'
    and p.builder_slug is not null
    and p.first_customer_at is not null;

comment on view public.builder_badges is
  'Public-facing badge data. Filters out private profiles + missing first-customer timestamp.';

-- The anon role can read the view (no email leakage). The view is filtered
-- so only public, badge-eligible rows are visible. Default Postgres view
-- permissions still apply — Supabase exposes this through PostgREST.
grant select on public.builder_badges to anon, authenticated;

-- Existing rows: if any profile already has a verified conversion before this
-- migration runs, mirror its earliest detected_at into first_customer_at so
-- the trigger doesn't have to back-fill on the next webhook hit.
update public.profiles p
   set first_customer_at = sub.first_at
  from (
    select profile_id, min(detected_at) as first_at
      from public.verified_conversions
     group by profile_id
  ) sub
 where sub.profile_id = p.id
   and p.first_customer_at is null;

-- Keep first_customer_at in sync via trigger on verified_conversions.
create or replace function public.sync_first_customer_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set first_customer_at = least(
       coalesce(first_customer_at, new.detected_at),
       new.detected_at
     )
   where id = new.profile_id;
  return new;
end;
$$;

drop trigger if exists verified_conversions_sync_first_at on public.verified_conversions;
create trigger verified_conversions_sync_first_at
  after insert on public.verified_conversions
  for each row execute function public.sync_first_customer_at();
