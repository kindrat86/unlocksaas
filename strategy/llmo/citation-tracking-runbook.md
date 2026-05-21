# LLM-Citation Tracking — Operator Runbook

**Shipped:** 2026-05-21  
**Cron:** `GET /api/cron/llmo-citations` — Mondays 09:00 UTC (12:00 EEST summer)  
**Queries:** 20 — see `strategy/llmo/priority-queries.csv`  
**Storage:** Supabase table `llmo_citations` + view `v_llmo_citation_share`  
**PostHog events:** `llmo_citation_won` (per win) + `llmo_citations_synced` (per tick)

---

## What this does

Every Monday at 09:00 UTC the cron asks each configured LLM provider:

> "best SaaS for post-launch pre-revenue founders"  
> "Brunson framework software for indie SaaS founders"  
> ... (18 more)

For each response it records whether unlocksaas.com appears as a cited URL or brand mention, and stores the full response text. The `v_llmo_citation_share` view computes a rolling 12-week citation share per (query, provider) pair.

---

## One-time setup (operator)

### Step 1 — Apply the Supabase migration

The migration at `supabase/migrations/20260521000000_llmo_citations.sql` creates the `llmo_citations` table and `v_llmo_citation_share` view.

```bash
# Option A: via Supabase CLI (recommended)
supabase db push

# Option B: via Supabase dashboard
# SQL editor → New query → paste the migration file → Run
```

Verify:
```sql
select * from v_llmo_citation_share limit 5;
-- should return 0 rows (empty, no data yet)
```

### Step 2 — Push at least one provider API key to Vercel

ANTHROPIC_API_KEY is **already set** from the diagnostic feature. You get Claude coverage with zero new accounts.

For the other providers:

```bash
# OpenAI (web-search-enabled gpt-4o)
# Get key: platform.openai.com → API keys
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_API_KEY preview
vercel env add OPENAI_API_KEY development

# Perplexity (sonar-pro — native citation list)
# Get key: www.perplexity.ai/settings/api
vercel env add PERPLEXITY_API_KEY production
vercel env add PERPLEXITY_API_KEY preview
vercel env add PERPLEXITY_API_KEY development

# Google (Gemini 2.5-pro with grounding)
# Get key: aistudio.google.com → API keys
vercel env add GOOGLE_AI_API_KEY production
vercel env add GOOGLE_AI_API_KEY preview
vercel env add GOOGLE_AI_API_KEY development
```

The cron silently skips any provider whose key is unset. Start with one, add more over time.

### Step 3 — Redeploy

```bash
git push origin main
# or in your git UI: push to main
```

The cron entry is already in `app/vercel.json`. The next scheduled tick fires automatically on the following Monday 09:00 UTC.

### Step 4 — Verify manually

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://unlocksaas.com/api/cron/llmo-citations
```

Expected response (Anthropic only configured):
```json
{
  "ok": true,
  "citations_won": 0,
  "inserted": 20,
  "failed": 0,
  "queries": 20,
  "providers_used": ["anthropic"],
  "providers_skipped": ["openai", "perplexity", "google"],
  "duration_ms": 48200,
  "errors": []
}
```

`citations_won: 0` is expected on first run — the site needs to accumulate citations over time.

---

## Reading the dashboard

### Supabase view

```sql
-- Weekly citation share per query, all providers
select
  query_id,
  provider,
  last_run_at,
  currently_cited,
  citation_share,   -- 0.0..1.0 over last 12 weeks
  weeks_cited_12,
  weeks_with_data_12
from v_llmo_citation_share
order by citation_share desc, query_id, provider;
```

```sql
-- Queries where we are cited right now
select query_id, provider, last_rank
from v_llmo_citation_share
where currently_cited = true
order by last_rank asc;
```

```sql
-- Full response text for a specific query/provider (debug)
select response_text, cited_urls, run_at
from llmo_citations
where query_id = 'Q03' and provider = 'perplexity'
order by run_at desc
limit 5;
```

### PostHog

Two events appear in the brunson-funnel-metrics dashboard:

- **`llmo_citation_won`** — fires once per (query, provider) where we were cited. Properties: `query_id`, `query_text`, `provider`, `model`, `rank_in_answer`, `brand_mentioned`. Chart: "Citation wins over time" grouped by `query_id` or `provider`.
- **`llmo_citations_synced`** — fires once per tick, regardless of wins. Properties: `inserted`, `failed`, `citations_won`, `providers_used`, `elapsed_ms`. Use as a heartbeat: if this event stops appearing on Mondays, the cron is broken.

Distinct id for both events: `server:llmo`.

---

## Adding or editing queries

1. Edit `strategy/llmo/priority-queries.csv` — the operator-facing canonical list.
2. Mirror the change in `app/src/lib/llmo/priority-queries.ts` — the machine-readable list the cron imports.  
   **Never reuse an existing `id` (Q01..Q20) for a different query.** Historical rows retain the meaning of the id at the time they were inserted. Append new ids (Q21, Q22, etc.) for new queries.
3. The next scheduled tick picks up new queries automatically.

---

## Cost estimate

| Provider | Model | Per-query cost (est.) | 20 queries/week |
|---|---|---|---|
| OpenAI | gpt-4o-search-preview | ~$0.01 | ~$0.20/week |
| Perplexity | sonar-pro | ~$0.005 | ~$0.10/week |
| Anthropic | claude-sonnet-4-5 + web_search | ~$0.008 | ~$0.16/week |
| Google | gemini-2.5-pro + grounding | ~$0.005 | ~$0.10/week |
| **Total (all 4)** | | | **~$0.56/week (~$2.40/mo)** |

Costs are estimates based on public pricing as of May 2026. The cron caps each provider call at 60s and exits cleanly on timeout. Web-search tools on some providers count additional tokens.

---

## Optional: Otterly.ai cross-check

Otterly.ai (otterly.ai, free tier available) is a third-party LLM-citation tracker. It runs independently of this cron — it calls providers on its own schedule and presents a shared dashboard.

To add Otterly as a secondary lens:

1. Create an account at otterly.ai.
2. Add the 20 queries from `strategy/llmo/priority-queries.csv`.
3. Set your site domain to `unlocksaas.com`.
4. Note your API key and paste it into Vercel:  
   `vercel env add OTTERLY_API_KEY production`  
   (No code uses this key yet — it's a stub for a future webhook push.)

Use Otterly's dashboard alongside `v_llmo_citation_share` to cross-validate. If both show a win for Q03 on OpenAI in the same week, it's a genuine signal. If they disagree, check the `response_text` in Supabase.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `error: cron_secret_unset` | CRON_SECRET not in Vercel | Run `./scripts/setup-cron-secret.py` |
| `error: llmo_no_providers_configured` | All provider keys missing | Push at least ANTHROPIC_API_KEY |
| `error: supabase_service_role_key_unset` | SUPABASE_SERVICE_ROLE_KEY missing | Check Vercel env vars |
| `inserted: 0, failed: 20` | Migration not applied | Run `supabase db push` |
| `citations_won` stays 0 for >4 weeks | Not cited yet | Focus on GEO tasks: comparison pages, answer-first blocks, LinkedIn articles |
| Cron not firing on Mondays | Vercel Cron dashboard shows error | Check function logs for the previous Monday 09:00 UTC |
| Provider returns empty `response_text` | API key wrong or rate-limited | Check `raw.error` column in Supabase |

---

## Files changed by this feature

```
app/src/lib/llmo/
  priority-queries.ts          — canonical query list (20 queries)
  citation-tracker.ts          — provider adapters + detection logic

app/src/app/api/cron/llmo-citations/
  route.ts                     — weekly cron handler

app/src/lib/analytics/events.ts
  LlmoCitationWon              — PostHog event (per win)
  LlmoCitationsSynced          — PostHog event (per tick summary)
  LLMO_DISTINCT_ID             — "server:llmo"
  LlmoCitationWonProps         — property shape
  LlmoCitationsSyncedProps     — property shape

app/vercel.json                — cron entry: Mon 09:00 UTC
.env.example                   — OPENAI_API_KEY, PERPLEXITY_API_KEY,
                                  GOOGLE_AI_API_KEY, OTTERLY_API_KEY slots

supabase/migrations/
  20260521000000_llmo_citations.sql
                               — table + indexes + v_llmo_citation_share view

strategy/llmo/
  priority-queries.csv         — operator-facing query list
  citation-tracking-runbook.md — this file
```
