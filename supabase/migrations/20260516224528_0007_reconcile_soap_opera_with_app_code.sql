-- 0007_reconcile_soap_opera_with_app_code
--
-- Reconciles soap_opera_subscribers with the actual app code shipped in
-- app/src/lib/soap-opera/dispatch.ts + app/src/app/api/cron/soap-opera/route.ts.
-- Three mismatches my original 0001/0005 schema introduced:
--   1. current_day -> emails_sent (semantic match with how code increments it)
--   2. missing last_error column (cron persists Resend failures here for triage)
--   3. status: 'completed' (my schema) vs 'complete' (code) -- pick code's value

alter table public.soap_opera_subscribers rename column current_day to emails_sent;
alter table public.soap_opera_subscribers add column last_error text;

alter table public.soap_opera_subscribers drop constraint if exists soap_opera_subscribers_status_check;
alter table public.soap_opera_subscribers add constraint soap_opera_subscribers_status_check
  check (status in ('active', 'paused', 'unsubscribed', 'complete', 'bounced'));

-- RLS anon policy referenced the renamed column + the old status value.
drop policy "soap_opera_anon_insert" on public.soap_opera_subscribers;
create policy "soap_opera_anon_insert"
  on public.soap_opera_subscribers for insert to anon, authenticated
  with check (
    email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and char_length(email) <= 320
    and (source is null or char_length(source) <= 64)
    -- Anon can only opt in fresh; service role bypasses RLS for sequence advancement.
    and emails_sent = 0
    and status = 'active'
    and (diagnostic_result is null or diagnostic_result in ('wrong_person', 'weak_offer', 'weak_belief'))
    and (identity_variant is null or identity_variant in ('verified_builder', 'paid_builder'))
  );
