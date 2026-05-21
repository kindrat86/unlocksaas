-- ---------------------------------------------------------------------------
-- Founder Memory – persistent context across diagnostic → dashboard → chat
-- ---------------------------------------------------------------------------
--
-- Every surface a founder touches after they complete the Free Diagnostic
-- should already know who they are: their offer, ICP, stage, the scorecard
-- their last diagnosis returned, the 30-day plan we drafted for them. Re-
-- asking intake on the dashboard is a 2023 product feel.
--
-- This table is the canonical memory blob. One row per (lead_id) – the
-- diagnostic_leads row is the natural unique key, since a founder may run
-- the diagnostic multiple times (multi-product, re-run after a rewrite).
-- The same email or user_id can therefore have several memory rows; the
-- libraries (app/src/lib/founder-memory.ts) read the most recent row for
-- the founder by default, and the semantic-recall helper does pgvector
-- search across ALL of a founder's memory rows so a future chat sidebar
-- can pull up a months-old diagnosis when it's relevant.
--
-- Structured + semantic. The `structured` JSONB column carries the shape
-- the dashboard / onboarding / chat-context API render directly (offer,
-- ICP, stage, scorecard, etc). The `embedding` column carries a 1536-dim
-- vector computed from a canonical text serialization of `structured` so
-- chat-style retrieval (RAG) works across the founder's own history.
--
-- The pgvector extension is enabled idempotently. Supabase supports HNSW
-- on pgvector >= 0.5; we use HNSW (cosine) because the founder cohort is
-- small (< 10k rows expected through year 1) and HNSW gives us better
-- recall than IVFFlat with no tuning.
--
-- RLS: enabled. End-user reads (own row by user_id OR email JWT claim).
-- All writes go through the service-role client in app/src/lib/founder-
-- memory.ts – the /api/diagnostic handler is the producer, the chat
-- context endpoint is the consumer. No public-anon writes.

create extension if not exists vector;

create table if not exists public.founder_memory (
  id          uuid primary key default gen_random_uuid(),

  -- The diagnostic_leads row this memory was hydrated from. Nullable
  -- because future producers (eg. Step 2 offer save, Step 1 dream-
  -- customer save) may write a memory row without a fresh diagnostic
  -- behind it. Unique when present so the diagnostic-completion
  -- handler can upsert cleanly by lead.
  lead_id     uuid references public.diagnostic_leads(id) on delete set null,

  -- Identity fan-out. At minimum one of (email, user_id) must be set;
  -- both is the common case after Google OAuth links the lead.
  email       text,
  user_id     uuid references auth.users(id) on delete set null,

  -- Render-ready blob. Shape documented in app/src/lib/founder-memory.ts
  -- (FounderMemoryStructured). Default to an empty object so partial
  -- rows are valid; consumers pattern-match defensively.
  structured  jsonb not null default '{}'::jsonb,

  -- 1-2 sentence canonical recap. Plugged into chat system prompts so
  -- a future sidebar never has to reconstruct context from JSON. Also
  -- the source of truth for the dashboard "We remember:" banner.
  summary     text,

  -- pgvector embedding of the canonical text serialization of
  -- `structured`. Nullable so writes succeed even when the embedding
  -- provider is unconfigured – degradation is graceful (the structured
  -- read path still works; only semantic recall is off).
  embedding   vector(1536),

  -- Provider/model the embedding was computed with. Useful when we
  -- rotate models so the recall helper can filter out stale vectors.
  model       text default 'text-embedding-3-small',

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One memory row per diagnostic. Lets writeFounderMemory() upsert
-- by lead_id without contortions. Repeated runs of the same lead
-- (re-diagnosis) refresh the same row in-place.
create unique index if not exists founder_memory_lead_unique
  on public.founder_memory (lead_id)
  where lead_id is not null;

-- Identity lookups – the dashboard reads by user_id, the chat-context
-- endpoint reads by either. Email is normalized via the writer (lower-
-- cased) so a plain index is sufficient.
create index if not exists founder_memory_email_idx
  on public.founder_memory (email)
  where email is not null;

create index if not exists founder_memory_user_idx
  on public.founder_memory (user_id)
  where user_id is not null;

create index if not exists founder_memory_created_idx
  on public.founder_memory (created_at desc);

-- HNSW cosine index for semantic recall. m=16, ef_construction=64 are
-- the pgvector defaults that work well on small (< 1M rows) tables.
-- IVFFlat is the fallback if a particular Supabase environment is on
-- pgvector < 0.5 – the helper degrades to a sequential scan in that
-- case, which is fine at our scale.
do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'vector'
  ) then
    begin
      execute 'create index if not exists founder_memory_embedding_hnsw
                 on public.founder_memory
                 using hnsw (embedding vector_cosine_ops)
                 with (m = 16, ef_construction = 64)';
    exception when others then
      -- HNSW unsupported (pgvector < 0.5). Fall back to IVFFlat.
      execute 'create index if not exists founder_memory_embedding_ivf
                 on public.founder_memory
                 using ivfflat (embedding vector_cosine_ops)
                 with (lists = 100)';
    end;
  end if;
end$$;

-- Reuse the set_updated_at function defined in 0001.
drop trigger if exists founder_memory_set_updated_at on public.founder_memory;
create trigger founder_memory_set_updated_at
  before update on public.founder_memory
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS – authenticated users can read their own memory rows.
-- ---------------------------------------------------------------------------
-- Match policy: row.user_id = auth.uid() OR row.email matches the JWT email
-- claim (covers the case where the diagnostic captured an email before the
-- founder ever signed up). Writes always go through the service-role client
-- so no write policies are exposed to authenticated/anon roles.

alter table public.founder_memory enable row level security;

drop policy if exists founder_memory_self_select on public.founder_memory;
create policy founder_memory_self_select
  on public.founder_memory
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or (email is not null and email = (select auth.jwt() ->> 'email'))
  );

-- ---------------------------------------------------------------------------
-- Column / table comments – discoverable in Supabase Studio.
-- ---------------------------------------------------------------------------
comment on table public.founder_memory is
  'Persistent founder context across diagnostic → dashboard → chat. One row per diagnostic_leads.id; the structured JSONB is the render-ready blob, the embedding column powers semantic recall (pgvector cosine). Writes are service-role only.';
comment on column public.founder_memory.lead_id is
  'Unique per row when set. The diagnostic_leads row this memory was hydrated from. Null = memory written from a non-diagnostic surface (future).';
comment on column public.founder_memory.structured is
  'Render-ready blob. Shape lives in app/src/lib/founder-memory.ts (FounderMemoryStructured). Default {} so partial rows are valid.';
comment on column public.founder_memory.summary is
  '1-2 sentence canonical recap. Plugged into chat system prompts. Source of truth for the dashboard "We remember:" banner.';
comment on column public.founder_memory.embedding is
  'pgvector(1536) cosine. Computed from a canonical text serialization of structured. Nullable – degrades gracefully when the embedding provider is unconfigured.';
comment on column public.founder_memory.model is
  'Provider/model the embedding was computed with. Default text-embedding-3-small. Lets semantic recall filter stale vectors after a model rotation.';
