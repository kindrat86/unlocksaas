# Persistent Founder Memory Implementation

**Date:** 2026-05-21  
**PR:** #138  
**Status:** ✅ MERGED & LIVE (commit f994520)  
**Unblocks:** PR #101 (Playbook Coach chat sidebar)

## Overview

Persistent founder memory is a 2026 SaaS table-stakes feature that prevents re-asking questions across diagnostic → dashboard → chat surfaces. Every founder interaction after the initial Free Diagnostic now carries context forward.

**Key insight:** Re-asking intake questions on the dashboard is a 2023 product feel. The feature eliminates that friction.

## What Was Built

### 1. Supabase Schema
**Migration:** `supabase/migrations/20260521000020_founder_memory.sql`

- **Table:** `founder_memory` with pgvector embeddings (1536-dim, HNSW index)
- **Columns:**
  - `id` (uuid, primary key)
  - `lead_id` (uuid, fk to diagnostic_leads, unique when set)
  - `email`, `user_id` (identity fan-out; one of both must be set)
  - `structured` (JSONB, render-ready blob)
  - `summary` (text, 1-2 sentence canonical recap)
  - `embedding` (vector(1536), nullable for graceful degradation)
  - `model` (text, default 'text-embedding-3-small')
  - `created_at`, `updated_at` (timestamptz)

- **Indexes:**
  - Unique on `lead_id` (supports upsert on re-diagnosis)
  - B-tree on `email`, `user_id`, `created_at` (identity + temporal lookups)
  - HNSW on `embedding` (cosine similarity for semantic recall)

- **RLS:** Authenticated users can read rows where `user_id = auth.uid()` OR `email = jwt.email` (covers pre-signup diagnostics)

### 2. API Library
**File:** `app/src/lib/founder-memory.ts`

#### Interfaces
- **`FounderMemoryStructured`**: Render-ready blob shape
  ```typescript
  {
    product_name: string
    product_url: string
    one_liner: string
    audience_stated: string
    pricing_visible: boolean
    stage: { time_since_launch, recent_revenue, biggest_attempt }
    bucket: string (Brunson segment)
    diagnosis: { label, headline, explanation, evidence, next_step }
    scorecard: { wrong_person, weak_offer, weak_belief with scores }
    next_30_days: { action items }
    strengths: string[]
  }
  ```

- **`FounderMemoryRow`**: Database row shape (includes embedding)

#### Core Functions
- **`embedText(text)`**: REST call to OpenAI text-embedding-3-small or AI Gateway
  - Graceful null return if unconfigured
  - Provider detection: AI_GATEWAY_API_KEY → OPENAI_API_KEY → null

- **`canonicalText(m)`**: Serializes `FounderMemoryStructured` to plain text for embedding

- **`buildSummary(m)`**: Generates 1-2 sentence recap for chat prompts and dashboard banner

- **`findingsToStructured(findings)`**: Converts diagnostic findings to memory shape

- **`writeFounderMemory(args)`**: Upserts memory row with embeddings (service-role client, synchronous)

- **`writeFounderMemoryAfter(args)`**: Fire-and-forget wrapper using Next.js `after()` (async, non-blocking)

- **`readFounderMemory(args)`**: Returns latest memory by `user_id` or `email` (defensive lookup)

- **`semanticRecall(args)`**: pgvector cosine search across founder's memory history (future chat RAG)

- **`toChatContext(memory)`**: Returns system-prompt-ready fragment
  ```
  The founder's business: X. Stage: Y. ICP: Z. Biggest bottleneck: A. Next 30 days: B.
  ```

### 3. API Endpoint
**File:** `app/src/app/api/founder-memory/context/route.ts`

- **Route:** GET `/api/founder-memory/context`
- **Auth:** Cookie-session via SSR client (RLS enforced)
- **Response:**
  ```json
  {
    "context": "string (system-prompt-ready fragment)",
    "summary": "string | null",
    "has_memory": boolean
  }
  ```
- **Status codes:**
  - 200: Authed, memory found or not found (still 200)
  - 401: Not signed in
  - 500: Unexpected error
- **Caching:** `private, no-store` (freshest copy needed for chat sidebar)

### 4. UI Components
**File:** `app/src/components/founder-memory-banner.tsx`

- **"We remember:" affordance** on dashboard surfaces
- **Shows when memory exists:** offer, ICP, stage summary
- **Skips duplicate intake questions** when memory is present
- **Rendered on:**
  - `/onboarding` — before intake form
  - `/playbook` — before Step 1

### 5. Wiring to Surfaces

#### Diagnostic Completion → Memory Write
**File:** `app/src/app/api/diagnostic/route.ts`

```typescript
// After deepAnalyzeUrl resolves
await writeFounderMemoryAfter({
  leadId: lead.id,
  findings,
  email: lead.email,
  userId: user?.id ?? null,
})
```
- Uses fire-and-forget pattern (`after()`) so user response is never blocked
- Embedding happens async in the background

#### Onboarding & Playbook → Memory Read
**Files:** 
- `app/src/app/(app)/onboarding/page.tsx`
- `app/src/app/(app)/playbook/page.tsx`

```typescript
const memory = await readFounderMemory({
  userId: userData.user.id,
  email: userData.user.email ?? null,
})

// Render banner if memory exists
{memory && <FounderMemoryBanner {...} />}
```

#### Shared Diagnosis → Memory Footer
**File:** `app/src/app/diagnosis/[id]/page.tsx`

```
"This diagnosis is now in your founder memory. Every future surface 
will pick up where this leaves off."
```

## How It Works: End-to-End

1. **Founder runs diagnostic** → answers questions about offer, ICP, stage, bottlenecks
2. **Diagnostic completes** → `deepAnalyzeUrl()` generates structured findings
3. **Memory write fires** (via `after()`)
   - Convert findings to `FounderMemoryStructured`
   - Generate 1-2 sentence summary
   - Compute embedding (if API key set)
   - Upsert to `founder_memory` table
4. **Founder visits dashboard** (onboarding or playbook)
   - Query latest memory by user_id or email
   - Render "We remember:" banner if found
   - Skip duplicate intake questions
5. **Founder opens chat sidebar** (future PR #101)
   - GET `/api/founder-memory/context` returns system-prompt fragment
   - Chat gets full context without re-asking
6. **Future visits** → semantic recall across memory history for RAG

## Embedding Provider

The feature gracefully handles three states:

| Config | Behavior | Impact |
|--------|----------|--------|
| `AI_GATEWAY_API_KEY` set | Routes to Vercel AI Gateway | Full-featured: reads + semantic recall |
| `OPENAI_API_KEY` set | Direct OpenAI text-embedding-3-small | Full-featured: reads + semantic recall |
| Neither set | Skips embedding step | Graceful degradation: reads work, semantic recall off |

**Default:** Memory reads work in all states. Only semantic recall (future chat RAG) depends on embedding.

## Build & Deployment

### Fixed Build Error
- **Issue:** Line 28 of `route.ts` had `export const runtime = "nodejs";`
- **Cause:** Incompatible with Cache Components enabled in `next.config`
- **Fix:** Removed runtime export (route handler defaults to Node.js anyway)
- **Commit:** d36b287

### Preview Deploy
- **Status:** ✅ SUCCESS (Vercel deployment BFG6Cc4Hp2XqnrRyG4DAEakBzhPY)
- **Checks:**
  - Vercel build: ✅ SUCCESS
  - Vercel Preview Comments: ✅ SUCCESS

### Production Merge
- **PR:** #138 merged to main
- **Merge commit:** f994520
- **Merged by:** kindrat86 (Operator)
- **Merged at:** 2026-05-21T10:19:10Z
- **Deployment:** Triggered automatically by Vercel on push to main

## Operator Action Items

### Tier 1 — Required Before Feature Works

1. **Apply Supabase migration to production:**
   ```bash
   supabase db push --linked
   ```
   - Creates `founder_memory` table with pgvector, indexes, RLS
   - Idempotent: safe to re-run

2. **Set embedding API key in Vercel (all 3 environments):**
   ```bash
   # Option A: Direct OpenAI (simplest)
   vercel env add OPENAI_API_KEY production preview development --sensitive

   # OR Option B: Via Vercel AI Gateway (recommended if using elsewhere)
   vercel env add AI_GATEWAY_API_KEY production preview development --sensitive
   ```

3. **Verify after prod migration:**
   - POST to `/api/diagnostic` → check `founder_memory` table has new row
   - GET `/api/founder-memory/context` → returns 401 (unauthenticated) or 200 with context (authed)

### Documented in LAUNCH-READINESS.md
- Location: Tier 1, item #6
- Full operator workflow documented with verification steps

## Testing Checklist

- [x] Supabase migration idempotent (uses `create ... if not exists`)
- [x] RLS policies permit authenticated user reads
- [x] Memory write doesn't block diagnostic response (fire-and-forget)
- [x] Memory read gracefully handles missing rows
- [x] Embedding provider detection works (API_GATEWAY → OPENAI → null)
- [x] Chat context format valid for system-prompt injection
- [x] Vercel build succeeds with Cache Components
- [x] All 10 files implemented and committed
- [x] Documentation complete

## Files Changed

**New:**
- `supabase/migrations/20260521000020_founder_memory.sql`
- `app/src/lib/founder-memory.ts`
- `app/src/app/api/founder-memory/context/route.ts`
- `app/src/components/founder-memory-banner.tsx`

**Modified:**
- `LAUNCH-READINESS.md` — added Tier 1 item #6 operator workflow
- `app/src/app/api/diagnostic/route.ts` — fire-and-forget memory write
- `app/src/app/(app)/onboarding/page.tsx` — memory read + banner
- `app/src/app/(app)/playbook/page.tsx` — memory read + banner
- `app/src/app/(marketing)/diagnostic/result/page.tsx` — memory footer message
- `app/src/app/diagnosis/[id]/page.tsx` — memory footer message

## Unblocked Work

**PR #101 (Playbook Coach chat sidebar)** can now proceed:
- Chat sidebar can query `/api/founder-memory/context`
- System prompt will include founder context
- No re-asking required

## Trend Rationale

**2026 SaaS table-stakes:** Persistent memory prevents founder re-engagement friction. Products that re-ask questions feel 2023. This feature:
- ✅ Matches current product best practices
- ✅ Improves founder retention (fewer form fills)
- ✅ Enables chat RAG without external context
- ✅ Prepares for multi-product diagnosis future

---

**Session:** Memory agent (acad37ac82420a21e)  
**Total implementation time:** ~3 hours (code, fix, merge, docs)  
**Status:** Production-ready, operator action pending
