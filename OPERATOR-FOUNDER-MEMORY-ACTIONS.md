# Operator Action Items — Founder Memory Feature

**Feature:** Persistent founder memory (PR #138)  
**Status:** Merged & live on production main  
**Merge commit:** f994520  
**Merged at:** 2026-05-21T10:19:10Z  

---

## What Just Shipped

Every founder surface after the Free Diagnostic now knows who they are:
- Their offer + one-liner
- Their ICP (ideal customer profile)
- Their stage (time since launch, recent revenue, biggest attempt)
- Their biggest bottleneck (from the diagnostic scorecard)
- Their next 30 days (action plan we drafted)

This eliminates re-asking intake questions on the dashboard — a 2023 product feel.

**Unblocks:** Chat sidebar (PR #101) can now pull full context without re-asking.

---

## 3 Steps to Activate

### Step 1: Apply Supabase Migration

Run this from the repo root:

```bash
supabase db push --linked
```

This creates the `founder_memory` table with:
- pgvector embeddings (for future chat RAG)
- Indexes for fast lookups
- Row-level security (users can only read their own memory)

**If you get an error about `--linked`:** Make sure you have a linked Supabase project (check `supabase projects list`). If none exist, link your project first: `supabase link`.

### Step 2: Set Embedding API Key in Vercel

The system embeds founder context for semantic search (future chat RAG). You need to set an embedding API key in Vercel for all 3 environments.

**Pick ONE option:**

#### Option A: Direct OpenAI (simplest)

```bash
vercel env add OPENAI_API_KEY production preview development --sensitive
```

Then paste your OpenAI API key (starts with `sk-proj-`). The system will use this for embeddings.

#### Option B: Via Vercel AI Gateway (recommended if you're already using it)

```bash
vercel env add AI_GATEWAY_API_KEY production preview development --sensitive
```

Then paste your Vercel AI Gateway key. The code will check for this first, fall back to OpenAI if not set, and gracefully degrade to memory-without-embeddings if neither is set.

**After setting the key:** Push to main to trigger a production redeploy. Vercel will pick up the new env var.

### Step 3: Verify It Works

Once the migration is applied and the env var is set, test:

#### Test 1: Create a diagnostic
1. Go to your production app
2. Run the Free Diagnostic
3. Complete it fully and get to the result page
4. Check your Supabase `founder_memory` table — there should be a new row

#### Test 2: Check chat context endpoint
In your terminal:

```bash
# This should return 401 (not signed in)
curl -X GET https://unlocksaas.com/api/founder-memory/context

# If you're signed in on your domain, you'll get 200 with context JSON
```

#### Test 3: Check "We remember:" banner
1. Sign up or log in
2. Go to `/onboarding` or `/playbook`
3. You should see a "We remember:" banner at the top with your offer, ICP, and stage

---

## What Happens Automatically

- **After diagnostic completion:** The system writes founder memory to the database (non-blocking — doesn't slow down the response)
- **On dashboard visit:** Memory is read and displayed in a "We remember:" banner
- **For chat sidebar:** GET `/api/founder-memory/context` will return a system-prompt-ready context string

---

## Troubleshooting

### Migration fails with "extension not found"

You might not have the `vector` extension enabled on your Supabase project. The migration attempts to create it idempotently, but some projects need it pre-enabled. Contact Supabase support if this happens (it's rare).

### "We remember:" banner doesn't show

- Verify memory row was created in Supabase (`SELECT * FROM founder_memory;`)
- Verify you're signed in (banner only shows for authenticated users)
- Check browser console for errors

### Embeddings aren't being computed

- Verify your API key is set correctly: `vercel env list` (check production, preview, and development)
- If using AI Gateway, verify your account has credits
- If using OpenAI, verify your account has credits and the API key is active

The feature **still works without embeddings** — memory reads will succeed, but semantic recall (future chat RAG) will be unavailable.

---

## Reference Docs

- **Full implementation details:** `FOUNDER-MEMORY-IMPLEMENTATION.md`
- **Build log entry:** `build-log.md` (top of file)
- **Operator requirements:** `LAUNCH-READINESS.md` (Tier 1, item #6)

---

## Questions?

If anything breaks or seems wrong, check these:
1. Is the migration applied? (`\dt founder_memory` in psql)
2. Is the env var set? (`vercel env list`)
3. Are there error messages in Vercel Function logs?
4. Is the Supabase RLS blocking reads? (Check the policy: `SELECT * FROM auth.rls_policies;`)

---

**Feature status:** Production-ready pending these 3 steps.  
**Time to complete:** ~10 minutes.  
**Next step after completion:** PR #101 (chat sidebar) can proceed.
