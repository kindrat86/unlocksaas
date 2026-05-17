-- 14-Day First-Customer Sprint Challenge subscribers.
--
-- Source: strategy/workbooks/04-building-your-funnels.md §10 (Challenge Funnel)
-- + DotCom Secrets Secret #19 (Challenge Funnel).
--
-- Mirrors the soap_opera_subscribers shape so the existing dispatch / cron
-- pattern transfers wholesale. Counter semantics:
--   emails_sent = 0  → not yet subscribed (transient; never persisted)
--   emails_sent = 1  → Day 0 welcome sent (Day 1 next)
--   emails_sent = 2  → Day 1 sent
--   ...
--   emails_sent = 15 → Day 14 sent, sequence complete
--
-- The subscribe endpoint sends Day 0 inline and advances to 1. The cron
-- handles 1..14 (Days 1..14). Sequence length: 15.
--
-- RLS rule: anon CAN insert (opt-in form posts as anon) with input validation
-- baked into the policy CHECK. Reads are service-role only — the dispatcher
-- and cron use the admin client. No SELECT policy = no read access for anon
-- or authenticated.

create table public.challenge_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  first_name        text not null,
  product_url       text,
  identity_variant  text check (identity_variant in ('verified_builder','paid_builder')),
  source            text not null default 'challenge_optin'
                      check (length(source) <= 64),
  status            text not null default 'active'
                      check (status in ('active','complete','unsubscribed','paused')),
  emails_sent       smallint not null default 0
                      check (emails_sent between 0 and 15),
  last_sent_at      timestamptz,
  next_send_at      timestamptz,
  subscribed_at     timestamptz not null default now(),
  completed_at      timestamptz,
  last_reply_at     timestamptz,
  last_error        text,
  unsubscribed_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Case-insensitive uniqueness on email so the upsert key (lower(email)) holds.
create unique index challenge_subscribers_email_unique
  on public.challenge_subscribers (lower(email));

-- The cron's primary scan: active rows whose next_send_at is past, ordered by
-- next_send_at. Partial index keeps it tight as the table grows.
create index challenge_subscribers_due_idx
  on public.challenge_subscribers (next_send_at)
  where status = 'active';

-- updated_at touched on every UPDATE. Reuses helper fn from migration 0001.
create trigger challenge_subscribers_updated_at
  before update on public.challenge_subscribers
  for each row execute function public.set_updated_at();

alter table public.challenge_subscribers enable row level security;

-- anon insert policy: validates email shape, name length, initial state.
-- Mirrors the hardened policy on soap_opera_subscribers (migrations 0004 + 0005).
create policy "challenge_anon_insert"
  on public.challenge_subscribers
  for insert
  to anon
  with check (
    length(email) <= 320
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and length(first_name) between 1 and 60
    and (product_url is null or length(product_url) <= 2048)
    and emails_sent = 0
    and status = 'active'
    and unsubscribed_at is null
    and completed_at is null
    and last_sent_at is null
    and next_send_at is null
  );

-- No SELECT/UPDATE/DELETE policies → service-role only. RLS is fully enforced.

comment on table public.challenge_subscribers is
  '14-Day First-Customer Sprint Challenge subscribers. Front-end lead funnel; daily drip via /api/cron/challenge.';
