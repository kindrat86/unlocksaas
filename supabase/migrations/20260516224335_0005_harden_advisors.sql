-- 0005_harden_advisors
--
-- Fixes flagged by Supabase security advisors after 0001-0004:
--   - 0011 function_search_path_mutable -- pin set_updated_at search_path
--   - 0024 rls_policy_always_true (ab_tests_anon_insert, soap_opera_anon_insert)

-- Fix 1: lock down set_updated_at search_path
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

-- Fix 2: tighten ab_tests insert (length caps as table constraints + matching policy)
alter table public.ab_tests
  add constraint ab_tests_key_length      check (char_length(key) between 1 and 64),
  add constraint ab_tests_variant_length  check (char_length(variant) between 1 and 64),
  add constraint ab_tests_subject_length  check (subject_id is null or char_length(subject_id) <= 256),
  add constraint ab_tests_event_length    check (conversion_event is null or char_length(conversion_event) <= 64);

drop policy "ab_tests_anon_insert" on public.ab_tests;
create policy "ab_tests_anon_insert"
  on public.ab_tests for insert to anon, authenticated
  with check (
    char_length(key) between 1 and 64
    and char_length(variant) between 1 and 64
    and (subject_id is null or char_length(subject_id) <= 256)
    and (conversion_event is null or char_length(conversion_event) <= 64)
  );

-- Fix 3: tighten soap_opera_subscribers insert -- email format + length, no pre-seeded state
alter table public.soap_opera_subscribers
  add constraint soap_opera_email_format  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint soap_opera_email_length  check (char_length(email) <= 320),
  add constraint soap_opera_source_length check (source is null or char_length(source) <= 64);

drop policy "soap_opera_anon_insert" on public.soap_opera_subscribers;
create policy "soap_opera_anon_insert"
  on public.soap_opera_subscribers for insert to anon, authenticated
  with check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(email) <= 320
    and (source is null or char_length(source) <= 64)
    -- Anon can only opt in fresh; service role bypasses RLS for sequence advancement.
    and current_day = 0
    and status = 'active'
    and (diagnostic_result is null or diagnostic_result in ('wrong_person', 'weak_offer', 'weak_belief'))
    and (identity_variant is null or identity_variant in ('verified_builder', 'paid_builder'))
  );
