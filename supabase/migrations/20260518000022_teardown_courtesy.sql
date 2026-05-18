-- 0022_teardown_courtesy
--
-- Dream 100 teardown-courtesy outreach queue.
--
-- Off-page distribution for the funnel-teardown pSEO catalog
-- (src/lib/funnel-teardowns.ts). Every entry in that catalog names a real
-- indie SaaS we have written about. This table is the operator-curated
-- send queue: one row per (catalog, slug), populated by /api/teardown-courtesy/seed,
-- gated by the operator before any email goes out, dispatched one-per-weekday
-- by /api/cron/teardown-courtesy.
--
-- Brunson Hard-Rule reconciliation:
--   - contact_email starts NULL. No fabricated addresses. Cron skips any
--     row without an operator-confirmed email AND a populated approved_at.
--   - The praise body is generated VERBATIM from the teardown's
--     whatsWorking[] field. No LLM, no paraphrase, no fabrication risk.
--   - Subject + body are persisted on each send to teardown_courtesy_sends,
--     so the audit log proves exactly what went out. Disputes are
--     resolvable by SQL.
--   - One send per weekday total (cap enforced in cron). Caps blast radius,
--     protects sender reputation, keeps the cadence personal.
--
-- Schema overview:
--   teardown_courtesy_targets   - per-target queue row (catalog, slug, email,
--                                  state machine, dedup unique key)
--   teardown_courtesy_sends     - per-send audit log (immutable, full body)

create table public.teardown_courtesy_targets (
  id uuid primary key default gen_random_uuid(),

  -- Source catalog. Phase 1 ships funnel-teardown only; phase 2 may add
  -- pricing-teardown. compare/alternatives are unlikely to make sense
  -- here (the framing on those pages is "different category", not "we
  -- admire what you do"), so the check stays narrow.
  catalog text not null check (catalog in ('funnel-teardown', 'pricing-teardown')),

  -- Catalog slug (e.g. "tally", "plausible"). Combined with catalog,
  -- uniquely identifies a target.
  slug text not null,

  -- Display name copied from the catalog at seed time. Denormalized so
  -- a catalog rename never silently changes the recorded recipient.
  display_name text not null,

  -- Canonical homepage URL from the catalog. Denormalized for the same
  -- reason as display_name.
  homepage_url text,

  -- Parsed greeting candidate ("Marie and Filip" from
  -- "Marie Martens and Filip Minev"). Operator can edit this directly
  -- before approving. Cron refuses to send a row with NULL greeting.
  greeting text,

  -- Contact email. NULL until the operator finds and confirms a real
  -- address (founder X-handle DM, public site, AngelList, etc.). Cron
  -- skips NULL rows. No defaults, no guesses.
  contact_email text check (contact_email is null or position('@' in contact_email) > 0),

  -- Lifecycle:
  --   pending   - seeded from catalog, no email yet, not ready to send
  --   approved  - operator populated contact_email + approved_at, ready
  --   queued    - cron picked this up and is about to send (transient)
  --   sent      - email delivered to Resend (resend_id populated)
  --   bounced   - Resend webhook reported permanent bounce
  --   replied   - operator marked it manually after seeing a reply
  --   skipped   - operator decided not to send (notes column says why)
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'queued', 'sent', 'bounced', 'replied', 'skipped')
  ),

  -- Operator approval gate. NOT-NULL means "go". The cron requires both
  -- this AND a contact_email before selecting the row.
  approved_at timestamptz,

  -- Send timestamps + Resend message id for audit.
  sent_at timestamptz,
  resend_id text,

  -- Reply tracking. The reply itself lands in maryan@unlocksaas.com's
  -- inbox (Private Email). The operator marks reply state here.
  replied_at timestamptz,
  reply_note text,

  -- Free-form operator notes (e.g. "found email via Twitter DM",
  -- "do not send, founder is on sabbatical", "skipped, acquired by
  -- Stripe so the org email is no longer right").
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per target. Idempotent reseeds.
create unique index teardown_courtesy_targets_catalog_slug_unique
  on public.teardown_courtesy_targets(catalog, slug);

-- Cron lookup: find the next approved-and-not-yet-sent row.
create index teardown_courtesy_targets_send_queue_idx
  on public.teardown_courtesy_targets(status, approved_at)
  where status = 'approved';

create trigger set_teardown_courtesy_targets_updated_at
  before update on public.teardown_courtesy_targets
  for each row execute function public.set_updated_at();

-- Immutable per-send audit log.
create table public.teardown_courtesy_sends (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references public.teardown_courtesy_targets(id) on delete cascade,

  -- Exact subject + body that went out. Persisted so the operator can
  -- reconstruct any send under dispute, and so future-template-changes
  -- never overwrite history.
  email_subject text not null,
  email_body_text text not null,

  -- The "to" address at the moment of send (in case the operator later
  -- updates contact_email on the target).
  to_address text not null,

  -- Resend response. resend_id is the message id; error captures the
  -- error class for retry triage.
  resend_id text,
  resend_error text,

  sent_at timestamptz not null default now()
);

create index teardown_courtesy_sends_target_idx
  on public.teardown_courtesy_sends(target_id, sent_at desc);

-- RLS: service-role-only (operator dashboards + cron). No client surface.
-- Mirrors the dream_100_entries / outreach_actions posture: nothing here
-- is reachable from a browser bundle, and the admin client used by the
-- cron route bypasses RLS by service-role key.
alter table public.teardown_courtesy_targets enable row level security;
alter table public.teardown_courtesy_sends enable row level security;

-- No policies created: default-deny is the right posture. Service role
-- bypasses RLS, anon/authenticated have no access.

comment on table public.teardown_courtesy_targets is
  'Dream 100 teardown-courtesy outreach queue. Operator-curated, cron-dispatched, Brunson Hard-Rule discipline (no fabricated addresses, verbatim praise). See app/src/lib/teardown-courtesy/.';

comment on table public.teardown_courtesy_sends is
  'Immutable per-send audit log for teardown_courtesy_targets. Persists the exact subject/body/to-address that went out.';
