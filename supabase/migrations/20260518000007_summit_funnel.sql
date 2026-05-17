-- Summit Funnel data layer (DotCom Secrets Secret #16)
--
-- Pre-stage tables for the Verified Builder Summit. Build is GATED behind
-- 3+ verified UnlockSaaS customers per `strategy/summit-funnel.md`
-- §"Activation gate". Tables exist as storage; no write paths in the
-- codebase reach them yet. They sit empty until the activation gate fires.
--
-- Three tables:
--   1. summit_speakers   — one row per confirmed speaker (service-role write).
--      Filtered view summit_speakers_public exposes display columns to anon.
--   2. summit_referrals  — affiliate commission tracking (service-role only).
--   3. summit_optins     — squeeze-form captures (anon-insert with shape check,
--      service-role read). Feeds the Soap Opera Day 0 on activation via a
--      conditional in lib/soap-opera/templates.ts (source.startsWith('summit-')).
--
-- Schema mirrors founding_cohort / cart_abandonment_subscribers conventions:
--   - text-CHECK enums for status/tier/source (no enum types — easier to
--     amend without an alter-type migration)
--   - case-insensitive email indexing via lower(email)
--   - set_updated_at trigger on mutable rows
--   - service-role-only writes; anon access mediated by views with explicit
--     column whitelists

set local search_path = public, pg_catalog;

-- ---------------------------------------------------------------------------
-- summit_speakers
-- ---------------------------------------------------------------------------
create table if not exists public.summit_speakers (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text not null,                                            -- public, URL-safe; e.g. "anthony-castrio"
  name                     text not null,
  email                    text not null,                                            -- private; service-role only
  tier                     text not null check (tier in ('Z', 'A', 'B', 'C', 'D')),  -- per summit-funnel.md §"Speaker tiers"
  source                   text check (source in (
                              'verified_customer',         -- Tier Z (anchored by Stripe-verified UnlockSaaS customer)
                              'dream_100_cat_2',           -- Tiers A/B/D from workbook 08 §2
                              'dream_100_cat_2_cold',      -- Tier C (cold-but-aligned)
                              'inbound_pitch'              -- speaker pitched themselves; very rare
                            ) or source is null),
  bio                      text,                                                     -- one-paragraph
  topic_paragraph          text,                                                     -- one-paragraph on what they cover
  headshot_url             text,
  social_x                 text,
  social_linkedin          text,
  social_other             text,
  status                   text not null default 'pitched'
                           check (status in (
                             'pitched',           -- Email 1 sent
                             'reminded',          -- Email 2 sent, no reply
                             'declined',          -- speaker said no or didn't reply within 30 days
                             'confirmed',         -- speaker said yes; Email 3 sent
                             'signed',            -- speaker agreement returned
                             'recorded',          -- 20-min interview recording received
                             'aired',             -- session went live in the broadcast window
                             'withdrew'           -- speaker opted out post-recording (7-day clause)
                           )),
  day_number               int check (day_number between 1 and 3),                   -- which day of the 3-day broadcast
  slot_number              int check (slot_number between 1 and 7),                  -- order within the day
  pitch_sent_at            timestamptz,
  reminded_at              timestamptz,
  confirmed_at             timestamptz,
  agreement_signed_at      timestamptz,
  recording_received_at    timestamptz,
  aired_at                 timestamptz,
  promo_email_1_sent_at    timestamptz,                                              -- speaker D-21 announce (self-reported via dashboard ping)
  promo_email_4_sent_at    timestamptz,                                              -- speaker D+1 conversion email (the load-bearing one)
  affiliate_url_clicks     int  not null default 0,
  aap_referrals_purchased  int  not null default 0,
  revenue_cents_paid       int  not null default 0,                                  -- $48.50/sale × purchases × payout_status
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create unique index if not exists summit_speakers_slug_uq
  on public.summit_speakers (slug);

create unique index if not exists summit_speakers_email_uq
  on public.summit_speakers (lower(email));

create index if not exists summit_speakers_status_idx
  on public.summit_speakers (status)
  where status in ('pitched', 'reminded', 'confirmed', 'signed');

create index if not exists summit_speakers_day_slot_idx
  on public.summit_speakers (day_number, slot_number)
  where status in ('signed', 'recorded', 'aired');

create trigger summit_speakers_set_updated_at
  before update on public.summit_speakers
  for each row execute function public.set_updated_at();

-- Public-facing view: explicit column whitelist. NO email, NO revenue, NO
-- pitch state. Used by /summit speaker-grid + /summit/speaker/[slug] bio.
-- Renders only signed-and-later (no one sees a "pitched" speaker on the
-- public grid).
create or replace view public.summit_speakers_public as
  select
    slug,
    name,
    tier,
    bio,
    topic_paragraph,
    headshot_url,
    social_x,
    social_linkedin,
    day_number,
    slot_number,
    case
      when status in ('aired') then 'aired'
      when status in ('recorded', 'signed') then 'confirmed'
      else 'pending'
    end as public_status
  from public.summit_speakers
  where status in ('signed', 'recorded', 'aired');

comment on view public.summit_speakers_public is
  'Anon-readable speaker roster for /summit + /summit/speaker/[slug]. Filters to signed-and-later; whitelists display columns only (no email, no revenue, no pitch state). Build is gated on summit activation gate — see strategy/summit-funnel.md.';

-- ---------------------------------------------------------------------------
-- summit_referrals
-- ---------------------------------------------------------------------------
-- One row per All-Access Pass purchase attributed to a speaker.
-- Speaker visibility is via /summit/speaker/[slug]/stats (magic-link auth),
-- NOT a direct view — the dashboard queries via service-role API.
create table if not exists public.summit_referrals (
  id                      uuid primary key default gen_random_uuid(),
  speaker_slug            text not null references public.summit_speakers (slug) on delete restrict,
  subject_id              text,                                                     -- usaas_stack_subject cookie at click time
  purchase_email          text not null,
  purchase_session_id     text not null,                                            -- Stripe checkout session
  purchase_cents          int  not null,                                            -- gross $97 in cents
  commission_cents        int  not null,                                            -- 50% = $48.50
  cookie_set_at           timestamptz,                                              -- when the speaker URL was first clicked (90-day window)
  purchased_at            timestamptz not null default now(),
  payout_status           text not null default 'pending'
                          check (payout_status in ('pending', 'paid', 'refunded', 'disputed')),
  payout_paid_at          timestamptz,
  payout_method           text check (payout_method in ('stripe_connect', 'wise', 'paypal', 'manual') or payout_method is null),
  notes                   text,
  created_at              timestamptz not null default now()
);

create unique index if not exists summit_referrals_session_uq
  on public.summit_referrals (purchase_session_id);

create index if not exists summit_referrals_speaker_idx
  on public.summit_referrals (speaker_slug, purchased_at desc);

create index if not exists summit_referrals_payout_pending_idx
  on public.summit_referrals (payout_status)
  where payout_status = 'pending';

-- ---------------------------------------------------------------------------
-- summit_optins
-- ---------------------------------------------------------------------------
-- /summit squeeze form lands here. Feeds Soap Opera Day 0 with a summit-
-- specific Email 1 opener (see strategy/summit-funnel.md §"Post-summit
-- ascension paths"). Anon-insert with shape validation.
create table if not exists public.summit_optins (
  id                       uuid primary key default gen_random_uuid(),
  email                    text not null,
  source                   text not null check (source ~ '^summit-'),                -- enforces slug prefix; matches link-registry taxonomy
  speaker_referral_slug    text,                                                     -- nullable; set when ?speaker=<slug> cookie present at opt-in
  subject_id               text,                                                     -- usaas_stack_subject cookie value at opt-in time
  identity_variant         text check (identity_variant in ('verified_builder', 'paid_builder') or identity_variant is null),
  user_agent_hash          text,                                                     -- one-way SHA256 of UA for spam dedup; never raw UA
  ip_country               text,                                                     -- 2-letter country from edge geo; never raw IP
  forwarded_to_soap_opera  boolean not null default false,                           -- flipped true when the SOS Day-0 hand-off completes
  forwarded_at             timestamptz,
  created_at               timestamptz not null default now()
);

create unique index if not exists summit_optins_email_uq
  on public.summit_optins (lower(email));

create index if not exists summit_optins_speaker_idx
  on public.summit_optins (speaker_referral_slug)
  where speaker_referral_slug is not null;

create index if not exists summit_optins_pending_forward_idx
  on public.summit_optins (created_at)
  where forwarded_to_soap_opera = false;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.summit_speakers   enable row level security;
alter table public.summit_referrals  enable row level security;
alter table public.summit_optins     enable row level security;

-- summit_speakers: service-role only (no anon/auth direct access).
-- Public read is via the summit_speakers_public view; security_invoker is
-- false by default on views, so the view runs with the table owner's
-- privileges. We grant select on the VIEW to anon, not the table.
revoke select, insert, update, delete on public.summit_speakers
  from anon, authenticated;

grant select on public.summit_speakers_public to anon, authenticated;

-- summit_referrals: financial data. Service-role only. Speaker dashboard
-- queries via authenticated API route running as admin client.
revoke select, insert, update, delete on public.summit_referrals
  from anon, authenticated;

-- summit_optins: anon may insert if shape passes the CHECK constraints
-- (source must start with 'summit-'). Anon cannot read or update.
revoke update, delete on public.summit_optins from anon, authenticated;
revoke select         on public.summit_optins from anon;

create policy summit_optins_anon_insert on public.summit_optins
  for insert
  to anon
  with check (
    source ~ '^summit-' and
    email is not null and
    length(email) between 4 and 320 and
    email like '%_@_%.__%'                                              -- minimal email shape check
  );

-- ---------------------------------------------------------------------------
-- Table comments (canonical doc pointers)
-- ---------------------------------------------------------------------------
comment on table public.summit_speakers is
  'Verified Builder Summit speakers (DCS Secret #16). One row per pitched / confirmed / signed / aired speaker. Public roster via summit_speakers_public view. Build gated on activation gate — see strategy/summit-funnel.md.';

comment on table public.summit_referrals is
  'Affiliate commission tracking for All-Access Pass purchases. 50% revenue share = $48.50 per $97 AAP sale. Service-role only; speaker dashboard reads via authenticated admin API. See strategy/summit-funnel.md §"Affiliate tracking".';

comment on table public.summit_optins is
  'Free 3-day summit access opt-ins. Anon-insert with source-prefix shape check. Feeds Soap Opera Day 0 with summit-specific Email 1 opener via forwarded_to_soap_opera flag. See strategy/summit-funnel.md §"Post-summit ascension paths".';
