-- Migration: dream_100_touches — the OPF touch log
-- Date: 2026-05-18
-- Chapter: DCS Secret #13 (Other People's Funnels) — Brunson rule #7 ("track every touch or it didn't happen")
-- Canonical doc: strategy/other-peoples-funnels.md §1, §5, §8
-- Companion files: app/src/lib/dream-100/touches.ts, supabase/views/dream_100_touches.sql
--
-- This table is append-only. Touches are physical events (an X reply was posted at a URL,
-- a DM was sent, a podcast was pitched). They are never edited or deleted; corrections
-- happen by appending a new row with action_type='correction' that references the original.
--
-- Service-role write only. No anon insert (there is no public flow that writes touches —
-- the founder logs via scripts/log-touch.py or future in-product UI, both auth'd as
-- service-role).
--
-- RLS denies all reads to anon and authenticated. Service-role reads everything.
-- Public-facing aggregates (if any are ever needed) go through views.

create table public.dream_100_touches (
  id                uuid primary key default gen_random_uuid(),

  -- Target identification ---------------------------------------------------------
  -- target_dream_100_id is a soft FK to the dream-100 list (currently a CSV file, not
  -- a table). When dream_100.csv is promoted to a supabase table, add a real FK then.
  target_dream_100_id  int,
  target_handle        text not null,    -- e.g., 'castrio', 'lovable', 'arvid'
  target_category      text not null,    -- e.g., 'cat_2_influencer', 'cat_5_partner_saas', 'cat_3_podcast'

  -- Action ------------------------------------------------------------------------
  -- channel is WHERE the touch happened (X reply, IH long-form, etc.)
  -- action_type is WHAT happened (read, public_reply, dm, pitch, etc.)
  channel           text not null check (channel in (
    -- Cat 1 communities
    'community_reply',
    'community_post',
    'ih_reply',
    'ih_longform',
    'reddit_reply',
    'reddit_post',
    'lovable_discord',
    -- Cat 2 individuals
    'x_reply',
    'x_dm',
    'newsletter_reply',
    -- Cat 3 podcasts
    'podcast_pitch',
    'podcast_recorded',
    'podcast_live',
    -- Cat 5 partner SaaS / integrations
    'integration_warmup',
    'integration_pitch',
    'integration_active',
    -- Summit
    'summit_pitch',
    'summit_confirmed',
    'summit_promoting',
    -- Affiliate
    'affiliate_application',
    'affiliate_approved',
    'affiliate_first_conversion',
    -- Internal
    'correction'
  )),
  action_type       text not null check (action_type in (
    'follow',
    'read',
    'public_reply',
    'community_reply',
    'newsletter_reply',
    'dm',
    'dm_response',
    'pitch',
    'pitch_response',
    'agreement',
    'go_live',
    'correction'
  )),

  -- Evidence ----------------------------------------------------------------------
  public_url        text,                              -- URL of the public reply / post (for public_reply, community_reply, podcast_live)
  message_excerpt   text,                              -- First 200 chars of the message sent / posted (for audit + dedup detection)
  response_excerpt  text,                              -- If they replied, first 200 chars of the response

  -- Founder confirmation ----------------------------------------------------------
  -- Per project_unlocksaas_email_identity.md, customer-facing sends require per-message
  -- Maryan confirmation. founder_confirmed_at proves it happened.
  founder_confirmed_at  timestamptz,
  founder_notes         text,

  -- Source linkage ----------------------------------------------------------------
  -- If the touch eventually converts a subject, source_subject_id links back so we can
  -- audit which touches actually drove customers. Filled in by Stripe webhook when
  -- attribution chain matches.
  source_subject_id     uuid,
  source_cookie_value   text,    -- e.g., usaas_first_touch cookie value if the touch URL was tracked

  -- Correction link ---------------------------------------------------------------
  -- For action_type='correction', references the original touch being corrected.
  corrects_touch_id     uuid references public.dream_100_touches(id),

  created_at        timestamptz not null default now()
);

-- Indexes -------------------------------------------------------------------------
-- Lookup pattern 1: "show me all touches for Anthony Castrio" → target_handle
create index idx_dream_100_touches_target_handle on public.dream_100_touches(target_handle);

-- Lookup pattern 2: "show me all touches in the last 14 days by channel" → created_at + channel
create index idx_dream_100_touches_recency on public.dream_100_touches(created_at desc, channel);

-- Lookup pattern 3: "which touches drove this customer?" → source_subject_id
create index idx_dream_100_touches_subject on public.dream_100_touches(source_subject_id)
  where source_subject_id is not null;

-- Lookup pattern 4: "warm-up rule violation check" → target_handle + action_type + created_at
create index idx_dream_100_touches_warmup on public.dream_100_touches(target_handle, action_type, created_at desc);

-- RLS ----------------------------------------------------------------------------
alter table public.dream_100_touches enable row level security;

-- Anon: no access at all (no policies created)
-- Authenticated users (member-area): no access (this is operator-only data)
-- Service role: full access (no policy needed — service role bypasses RLS)

-- Comment on table for future maintainers ----------------------------------------
comment on table public.dream_100_touches is
  'OPF touch log per strategy/other-peoples-funnels.md §1, §5 (Brunson Rule #7 enforcement). Append-only; corrections via action_type=correction + corrects_touch_id. Service-role writes only. Read by views in supabase/views/dream_100_touches.sql for the Friday Audible Call.';

comment on column public.dream_100_touches.target_dream_100_id is
  'Soft reference to strategy/dream-100.csv id column. Will become a real FK when dream-100 is promoted to a supabase table.';

comment on column public.dream_100_touches.channel is
  'WHERE the touch happened. Controlled vocabulary. Extend only when a new OPF mechanism activates (e.g., adding ''summit_speaker_recorded'' when summit goes live).';

comment on column public.dream_100_touches.action_type is
  'WHAT happened. Controlled vocabulary mirroring dream-100-outreach.md §5.';

comment on column public.dream_100_touches.founder_confirmed_at is
  'Per project_unlocksaas_email_identity.md, customer-facing sends require per-message Maryan confirmation. NULL means "auto-logged but not yet operator-acknowledged"; non-NULL means "Maryan confirmed the send/post happened".';

comment on column public.dream_100_touches.source_subject_id is
  'Filled in by Stripe webhook (lib/checkout) when a customer''s usaas_first_touch cookie matches a touch''s source_cookie_value. Enables per-target ROI attribution: "which touches drove which customers".';
