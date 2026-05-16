-- 0008_reharden_after_billing_clobber
--
-- The concurrent `billing` migration (20260516225103) ran
-- `create or replace function set_updated_at()` without `set search_path = ''`,
-- undoing the hardening from 0005. Reapply.
--
-- Also revoke EXECUTE on link_profile_on_user_create from anon/authenticated --
-- it's a SECURITY DEFINER trigger function for `after insert on auth.users`,
-- never meant to be invoked via REST RPC. Postgres triggers fire as the
-- function owner regardless of who initiated the insert, so revoking REST/RPC
-- execution does NOT break the trigger -- it just closes the public RPC
-- surface area flagged by advisors 0028/0029.

-- 1. Re-harden set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Revoke RPC execution of the trigger function
revoke execute on function public.link_profile_on_user_create() from anon;
revoke execute on function public.link_profile_on_user_create() from authenticated;
revoke execute on function public.link_profile_on_user_create() from public;
