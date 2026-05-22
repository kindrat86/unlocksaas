# AI Attribution Dashboard — Operator Runbook

**Shipped:** 2026-05-22
**Surface:** PostHog (EU project 181784)
**Code:** `src/lib/seo/ai-attribution.ts` + `src/proxy.ts` + `src/components/analytics/posthog-provider.tsx`
**Related:** `strategy/llmo/citation-tracking-runbook.md` (the outbound side — does our brand appear in AI answers?)

This runbook tells the operator how to build the PostHog dashboard for "AI-attributed sessions" — i.e. visitors who landed on unlocksaas.com after clicking a link that an AI engine surfaced. The outbound LLMO citation tracker measures whether AI answers cite us; this dashboard measures whether those citations actually drive clicks.

---

## What gets captured

Every URL the site publishes to an AI surface now carries a `utm_source` tag:

| Surface                           | utm_source        | utm_medium  | utm_campaign     | utm_content (optional)    |
|-----------------------------------|-------------------|-------------|------------------|---------------------------|
| `/llms.txt` (canonical)           | `ai-search`       | `llms-txt`  | `llms_corpus`    | `canonical`               |
| `/.well-known/llms.txt`           | `ai-search`       | `llms-txt`  | `llms_corpus`    | `well-known-alias`        |
| `/llms-full.txt`                  | `ai-search`       | `llms-txt`  | `llms_corpus`    | `llms-full`               |
| `/llms.txt?model=claude`          | `claude`          | `llms-txt`  | `llms_corpus`    | `claude`                  |
| `/llms.txt?model=gpt`             | `chatgpt`         | `llms-txt`  | `llms_corpus`    | `gpt`                     |
| `/llms.txt?model=perplexity`      | `perplexity`      | `llms-txt`  | `llms_corpus`    | `perplexity`              |
| `/llms.txt?model=gemini`          | `google-ai`       | `llms-txt`  | `llms_corpus`    | `gemini`                  |
| `/llms-claude.txt`                | `claude`          | `llms-txt`  | `llms_corpus`    | `claude`                  |
| `/llms-gpt.txt`                   | `chatgpt`         | `llms-txt`  | `llms_corpus`    | `gpt`                     |
| `/llms-perplexity.txt`            | `perplexity`      | `llms-txt`  | `llms_corpus`    | `perplexity`              |
| `/llms-gemini.txt`                | `google-ai`       | `llms-txt`  | `llms_corpus`    | `gemini`                  |
| `/api/mcp` tool returns           | `mcp`             | `ai-agent`  | `<tool name>`    | host engine (UA-detected) |
| `/api/nlweb/ask` (existing)       | `nlweb`           | `ai-agent`  | (none)           | (none)                    |

Inbound capture:
1. **Proxy** (`src/proxy.ts`) reads `utm_source` on first visit, normalises it via `resolveEngineFromUtmSource()`, writes a 90-day sticky cookie `usaas_ai_engine`.
2. **PostHog provider** (`src/components/analytics/posthog-provider.tsx`) reads the cookie on mount and calls `posthog.register({ ai_engine: <value> })` so every subsequent event in the session carries the property.

Result: every event in PostHog — `$pageview`, `diagnostic_form_submitted`, `starter_checkout_clicked`, `playbook_subscribed`, etc. — carries `ai_engine` as a top-level property. No per-event tagging required.

Canonical engine identifiers (used as both `utm_source` values and PostHog property values — do NOT rename without coordinating a dashboard migration):

```
chatgpt
claude
perplexity
copilot
google-ai
mcp
ai-search       (canonical llms.txt fallback)
you
cohere
mistral
grok
apple
kagi
duckai
nlweb           (on-site conversational search)
```

---

## The dashboard

Create a new PostHog dashboard titled **"AI-attributed sessions"**.

### Insight 1 — Sessions by AI engine (weekly trend)

- **Type:** Trends → Sessions
- **Series:** `$pageview` event
- **Breakdown:** `ai_engine` (event property)
- **Filter:** `ai_engine is set`
- **Date range:** Last 12 weeks, weekly buckets
- **Chart:** Stacked area

Reads: "Are AI-attributed sessions growing? Which engine is the biggest source?"

### Insight 2 — Engine → diagnostic conversion funnel

- **Type:** Funnels
- **Steps:** `$pageview` → `diagnostic_page_viewed` → `diagnostic_form_submitted` → `diagnostic_result_viewed`
- **Breakdown:** `ai_engine`
- **Date range:** Last 30 days
- **Display:** Step conversion rate

Reads: "Which engine sends visitors that actually run the diagnostic?"

### Insight 3 — Engine → first-paying-customer conversion

- **Type:** Funnels
- **Steps:** `$pageview` → `diagnostic_form_submitted` → `starter_checkout_clicked` → `starter_purchased`
- **Breakdown:** `ai_engine`
- **Date range:** Last 90 days
- **Display:** Total conversion %

Reads: "Which engine sends paying customers?" — the only metric that matters per the Brunson Hard-Rule.

### Insight 4 — llms-txt corpus shape A/B

- **Type:** Trends → Unique sessions
- **Series:** `$pageview` event
- **Filter:** `utm_medium = llms-txt`
- **Breakdown:** `utm_content` (event property)
- **Date range:** Last 30 days

Reads: "Which curated llms.txt variant draws the most click-through? Are the per-model bodies pulling their weight vs the canonical?" This is the corpus-shape A/B the SEO recommendation called out — change the variant body, watch this insight.

### Insight 5 — MCP host breakdown

- **Type:** Trends → Unique sessions
- **Series:** `$pageview` event
- **Filter:** `utm_source = mcp`
- **Breakdown:** `utm_content`
- **Date range:** Last 30 days

Reads: "Among MCP-attributed clicks, which host engine (Claude Desktop, Cursor, ChatGPT, etc.) is driving them?" Detected from the incoming HTTP User-Agent on `/api/mcp` calls.

### Insight 6 — Engine → revenue (server-side)

- **Type:** Trends → Total
- **Series:** `playbook_subscribed` event (Stripe-webhook-source, see `src/lib/analytics/events.ts`)
- **Breakdown:** `ai_engine` (on the identified user, set by `identify()` when the session is logged in)
- **Date range:** Last 90 days

Reads: "Engine-attributed Stripe revenue, end-to-end." This is the ultimate signal — every step before this is a leading indicator.

### Insight 7 — Latest 50 AI-attributed visits (raw feed)

- **Type:** Insights → SQL (or HogQL if available)
- **Query:**

```sql
select
  timestamp,
  properties.ai_engine,
  properties.utm_medium,
  properties.utm_campaign,
  properties.utm_content,
  properties.$current_url,
  distinct_id
from events
where event = '$pageview'
  and properties.ai_engine is not null
order by timestamp desc
limit 50
```

Reads: "Raw eye-the-data feed. Caught the operator the moment a previously-unseen engine starts driving clicks." Useful when expanding the engine catalog (see "Adding a new engine" below).

---

## Reading the dashboard

- **Insight 1 trending up + Insight 3 flat:** the corpus is being indexed/cited more often but the click-throughs don't convert. Two likely causes: the cited URLs are informational hubs without strong CTAs (audit which URLs are getting clicks via Insight 7), or the answer-quality drift means engines are surfacing the wrong page.
- **Insight 2 funnel narrow on `ai-search` but wide on `claude`:** the canonical body is doing too much heavy lifting; specific engines need more diagnostic-leading content in their curated variant.
- **Insight 5 dominated by one host:** OK as a signal, but check whether other host engines have fallen out of UA detection (the `detectEngineFromUserAgent()` regex in `src/lib/seo/ai-attribution.ts` may need a new pattern — see "Adding a new engine").
- **Insight 6 zero across all engines:** the AI surface isn't (yet) a paid-customer source. That's honest. The bet is that the volume in Insight 1 leads the revenue in Insight 6 by 8-12 weeks (AI engines take time to re-crawl + re-cite + cumulatively drive measurable traffic).

---

## Adding a new engine

When a new AI engine ships and starts crawling the site, three edits in lockstep:

1. **`src/lib/seo/ai-attribution.ts`**
   - Add the canonical key to the `AiEngine` union and `AI_ENGINES` array.
   - Add free-form aliases (utm_source variants the engine might land with) to `UTM_SOURCE_ALIASES`.
   - Add a User-Agent regex to `UA_PATTERNS` if the engine identifies itself in its crawl UA.
   - If the engine has a per-model llms.txt variant, add a mapping to `ENGINE_BY_LLMS_TXT_MODEL`.

2. **`src/lib/seo/llms-txt-per-model.ts`**
   - Add the model key to `LlmsTxtModel` union + `LLMS_TXT_MODELS` array.
   - Add the alias-to-canonical entries to `ALIAS_MAP`.
   - Add the per-model body function (`fooBody()`) and the case in `renderLlmsTxtForModel()`.

3. **Sitemap + robots**
   - Add the static `/llms-<engine>.txt` URL to the sitemap if a dedicated static route ships with the engine.
   - Add the engine's crawler UA to the appropriate allow/disallow list in `src/app/robots.ts`.

Then redeploy. The PostHog dashboard's `ai_engine` breakdown will surface the new value automatically — no PostHog schema work required (PostHog auto-discovers properties).

---

## Operator tasks for first activation

1. **Verify env vars:** PostHog is already live (project 181784); no new env needed for AI attribution. `NEXT_PUBLIC_POSTHOG_KEY` + `NEXT_PUBLIC_POSTHOG_HOST` must be set in all three Vercel environments (already confirmed per memory `project_unlocksaas_posthog.md`).

2. **Smoke test once deployed:** From a fresh browser session, visit `unlocksaas.com/?utm_source=claude` and confirm:
   - The `usaas_ai_engine=claude` cookie is set (DevTools → Application → Cookies).
   - In PostHog Live Events, the `$pageview` event has `ai_engine: claude` as a property.
   - Subsequent navigation (no UTM in URL) still carries `ai_engine: claude` on every event — the super-property propagation is what makes this work.
   - Repeat with `utm_source=chatgpt`, `utm_source=perplexity`, `utm_source=copilot`, `utm_source=gemini` (alias for google-ai), `utm_source=mcp`.

3. **Build the dashboard:** Open PostHog → Dashboards → New → "AI-attributed sessions". Add the seven insights above (each is a normal PostHog insight; no SQL beyond Insight 7).

4. **Pin the dashboard** to the project home so the funnel-metrics review surfaces it on every weekly check-in.

5. **Set a 90-day re-review reminder:** AI engines ship new crawlers monthly. The dashboard's signal decays if the alias map + UA patterns aren't kept current. The 90-day cookie max-age sets the natural cadence.

---

## Why this matters

Pre-revenue founders don't know which AI surface is actually driving their first customer. The default PostHog view shows "$direct" or "$organic" for any AI-driven session, because Claude/ChatGPT/Perplexity don't pass a Referer when they cite a URL in an answer. Without explicit utm_source tagging on the publisher side, the engine identity is lost.

By tagging every URL we publish to AI surfaces and capturing first-touch on the client, we turn a black hole into a measurable funnel. The corpus-shape A/B (Insight 4) is the new lever: the curated llms.txt bodies are now individually attributable, so editing them and watching the conversion rate per variant becomes a closed feedback loop.

Brunson Hard-Rule: this never invents engine identity. If the UA doesn't announce itself and the utm_source isn't recognised, the session stays untagged. No fabricated attribution.
