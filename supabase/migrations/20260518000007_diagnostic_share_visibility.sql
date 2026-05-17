-- Brunson DCS Secret #11 (The Best Bait) 88 → 100 push.
--
-- Butterfly Marketing readiness: a bait that converts is good; a bait whose
-- RESULT is shareable compounds. The shareable diagnosis is the bait's viral
-- side. The diagnostic_leads row already carries the diagnosis content; this
-- migration adds the visibility gate that turns a single diagnosis into a
-- public artifact when (and only when) the lead consents.
--
-- Privacy model:
--   - Default: 'private'. The /diagnosis/<id> public page returns 404.
--     The result page at /diagnostic/result?id=<id> stays private always —
--     that page carries the bridge offer and is not the shareable surface.
--   - 'public': the /diagnosis/<id> public page renders. The OG card is
--     served from the colocated opengraph-image.tsx. Anyone with the link
--     can read it. Consent is the explicit click on the "Share my
--     diagnosis" CTA, which calls POST /api/diagnostic/[id]/share.
--   - 'revoked': the lead opted in, then opted back out. The public page
--     returns 404 again. We keep the row state for audit.
--
-- Source:
--   - strategy/workbooks/04-building-your-funnels.md §3 (Diagnostic Result)
--   - strategy/workbooks/10-growth-hacking.md §5 (Butterfly Marketing,
--     Loop 1: shareable diagnostic result)
--   - Brunson DotCom Secrets Chapter 11 (The Best Bait) — share-worthy
--     bait result is the explicit chapter directive
--   - Brunson Traffic Secrets Chapter 19 (Butterfly Marketing) — bait
--     result amplification

alter table public.diagnostic_leads
  add column if not exists share_visibility text not null default 'private',
  add column if not exists shared_at timestamptz,
  add column if not exists share_revoked_at timestamptz;

alter table public.diagnostic_leads
  add constraint diagnostic_leads_share_visibility_chk
    check (share_visibility in ('private', 'public', 'revoked'));

-- Public-share index: the only place the /diagnosis/<id> route reads. Tight
-- partial index keeps the index small as the table grows — private rows
-- (the majority) never enter it.
create index if not exists diagnostic_leads_public_share_idx
  on public.diagnostic_leads (id)
  where share_visibility = 'public';

-- Operator dashboard read: how many diagnoses are publicly shared, by day.
-- Honest "X founders made their diagnosis public" counter on the squeeze
-- reads from this. Today the count is 0 — the squeeze surface auto-hides
-- the counter at < 10 (Brunson rule, mirrors media-bar / avatar-wall).
create index if not exists diagnostic_leads_shared_at_idx
  on public.diagnostic_leads (shared_at desc)
  where shared_at is not null;

comment on column public.diagnostic_leads.share_visibility is
  'private | public | revoked. Drives /diagnosis/<id> render gate. Default private.';
comment on column public.diagnostic_leads.shared_at is
  'First time the lead opted into public visibility. Null = never shared.';
comment on column public.diagnostic_leads.share_revoked_at is
  'Set when share_visibility flips from public → revoked. Null = still public or never shared.';
