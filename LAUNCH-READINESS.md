# UnlockSaaS — Launch Readiness Checklist

**Updated:** 2026-05-17 (autonomous Brunson 100% push)
**Audit baseline:** 63/100 → target 100 — see audit-100-push entry in build-log.md.

This file is the operator's pre-launch checklist. Everything below is the
gap between code-shipped and revenue-flowing. Items grouped by who can
finish them — only Maryan can do the operator items; everything else is
done.

---

## ✅ DONE — code, copy, strategy

### Funnel surfaces (all live as Sprint-3 long-form or better)
- `/` — Funnel Hub with hero, manifesto (A/B Verified/Paid Builders),
  founder bio + timeline, comparison table, FAQ (6 items mined from
  dollar-objections.md), wired newsletter signup, honest "as seen in" note,
  social links, cold-traffic footer link.
- `/diagnostic` — Free Diagnostic squeeze with Hook #3, AC opener,
  polarity AGAINST line, real 2-field form. POSTs to `/api/diagnostic`,
  routes to result page.
- `/diagnostic/result` — Labelled diagnosis with handoff to $1 Starter.
- `/starter` — $1 Starter sales page with Star/Story/Solution structure,
  AC opener, attribution forwarding.
- `/oto` — One-decision OTO with Return Path reassurance.
- `/welcome` — Profit Maximizer / Return Path (handles core_activated +
  starter_only paths, auto-redirect to /playbook).
- `/playbook-sales` — Sprint 3 long-form $49 Playbook sales page. Big Domino,
  Three Secrets (Story-Strategy-Case Study each), Stack with 10x math,
  Closes (risk reversal, logic, identity, future pacing, stake), FAQ from
  dollar-objections.md, disqualifying copy, signed — Maryan.
- `/bridge` — Cold traffic bridge page for solo ads + sponsored content.
- `/playbook` + `/playbook/step/[id]` — Member area + Steps 1-2 wired with
  engine pushback.
- `/builder/[slug]` — Public Verified Builder badge OG-image route.

### Email + scheduling
- 3-email Soap Opera Sequence spine + 2 behavioral branches
  (`soft_sell`, `objection_handler`). Day 0 / 2 / 4 spine + day 6
  branch pass gated on E3 open/click. Code-complete; awaits
  `CRON_SECRET` for the spine cron and `RESEND_WEBHOOK_SECRET` +
  Resend dashboard configuration for the engagement-routing webhook.
  Decision doc: `strategy/decisions/sos-3-spine-2-branch.md`.
- Seinfeld daily nurture (code-complete, awaits CRON_SECRET).
- `/api/unsubscribe` with HMAC tokens + RFC 8058 one-click POST.

### Infrastructure
- Supabase: 8 migrations + concurrent billing/diagnostic_leads/profiles.
- Stripe: $1 Starter + $49 Core products + webhook + Customer Portal config
  pushed to Vercel prod.
- Resend: domain verified, DKIM live, smoke test passed.
- A/B: Verified vs Paid Builders cookie-based 50/50 live in production,
  attribution wired to Stripe metadata + webhook.
- PostHog: instrumentation surface installed, awaits project key.
- Sentry: scaffolded, awaits operator project creation.

### Strategy (workbook completeness)
- 10/10 Brunson workbooks complete.
- Funnel Hacks: 4 competitor funnels analyzed (Marc Lou, Pieter Levels,
  Arvid Kahl + 1) — `strategy/funnel-hacks.md`.
- VSL Script: locked, awaits recording — `strategy/vsl-script.md`.
- Dollar Objections: 30+ verbatim public-source quotes mapped to 7
  categories — `strategy/dollar-objections.md`.
- Dream 100: 100 entries across 7 categories, all 40 Category 2 slots
  populated — `strategy/dream-100.csv`.

---

## ⏳ OPERATOR ONLY — Maryan must do these

### Tier 1 — blocks revenue today

1. **Generate + push `AI_GATEWAY_API_KEY` to Vercel** (all 3 environments).

   Generate a key at: https://vercel.com/[team]/~/ai-gateway/api-keys
   Then push to all three environments:

   ```bash
   vercel env add AI_GATEWAY_API_KEY production
   # CLI bug for preview: use Vercel dashboard or REST API (see feedback_vercel_cli_preview_env_bug.md)
   vercel env add AI_GATEWAY_API_KEY development
   ```

   Until set, all LLM calls fall back to direct Anthropic via `ANTHROPIC_API_KEY`
   (safe zero-state -- no revenue impact). When set, all calls route through
   Vercel AI Gateway with token observability in the Vercel dashboard (AI > Observability).
   Model fallback chain: Claude Sonnet 4.6 (primary) -- gateway auto-retries
   across Anthropic direct, Bedrock Anthropic, and Vertex Anthropic on failure.

2. **Generate + push `CRON_SECRET` and `UNSUBSCRIBE_SECRET` to Vercel** (all
   3 environments — production, preview, development).

   Per the secret-entry convention (locked 2026-05-17 after the zsh-leak
   incident), generation + push MUST go through the dedicated getpass
   scripts. Raw secret values must NEVER appear in any markdown file, chat
   scrollback, or shell history — including this checklist.

   ```bash
   # Each script generates a fresh 32-byte hex secret, confirms with you,
   # and pushes to Vercel via the CLI for all three environments:
   ./scripts/setup-cron-secret.py
   ./scripts/setup-unsubscribe-secret.py
   ```

   Until both are set in Vercel, the Soap Opera + Seinfeld daily crons
   cannot fire and unsubscribe links cannot verify against a stable secret.

   Notes:
   - `--sensitive` works on production + preview but fails server-side on
     development (Vercel CLI limitation). The setup scripts handle this
     branching automatically.
   - Any candidate values that ever appeared in a plaintext file or chat
     transcript are considered compromised — regenerate fresh ones via the
     scripts above.

2. **Create PostHog project + push project key.**
   Sign in at posthog.com → New project (EU region recommended for GDPR) →
   copy project API key → run `scripts/setup-posthog-key.py` (already
   exists) → then `vercel env add NEXT_PUBLIC_POSTHOG_KEY` to all 3 envs.

3. **Create Sentry project + push four env vars.**
   Sign in at sentry.io → New project (Next.js) → copy DSN + create auth
   token with scopes `project:releases` + `project:read` → run
   `scripts/setup-sentry.py` → push `NEXT_PUBLIC_SENTRY_DSN`,
   `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` to Vercel.

4. **Configure the Resend webhook + push `RESEND_WEBHOOK_SECRET`.**
   The SOS day-6 branch pass needs to know whether E3 was opened or
   clicked. That signal arrives through the Resend webhook at
   `/api/webhooks/resend`. Without it the spine still ships, but the
   `branch_fired` column stays `'none'` forever (no soft_sell, no
   objection_handler).

   ```
   1. Resend dashboard (https://resend.com/webhooks) → Add endpoint
        URL:    https://unlocksaas.com/api/webhooks/resend
        Events: email.opened, email.clicked, email.delivered,
                email.bounced, email.complained
   2. Copy the generated signing secret (starts with whsec_…).
   3. Push to Vercel for all 3 environments:
        vercel env add RESEND_WEBHOOK_SECRET production --sensitive
        vercel env add RESEND_WEBHOOK_SECRET preview --sensitive
        vercel env add RESEND_WEBHOOK_SECRET development --sensitive
   4. Mirror to .env.development.local so `vercel env pull` doesn't
      strip it (per feedback_local_only_secrets_in_vercel_dev.md).
   ```

   Smoke test after the env var is set: `curl -X POST
   https://unlocksaas.com/api/webhooks/resend` should return 400
   (`missing_svix_headers`), not 503 (`not_configured`).

5. **Apply migration `20260521000020_sos_three_spine_two_branch` to
   prod Supabase.** Per project memory
   (`feedback_supabase_postgrest_quirks.md`), the Supabase MCP does NOT
   auto-apply repo migrations to prod. Run:

   ```
   supabase db push
   ```

   from the repo root after the PR merges. This adds the four new
   columns (`e3_opened_at`, `e3_clicked_at`, `branch_fired`,
   `branch_fired_at`) and the partial index
   `soap_opera_branch_pending_idx`.

6. **Apply founder-memory Supabase migration + embedding API key.**
   Persistent founder context is required before chat sidebar (PR #101)
   ships. Two steps:

   A. Apply migration to production database:
   ```bash
   supabase db push --remote
   ```
   This creates the `founder_memory` table with pgvector embeddings,
   indexes, and RLS policies. The schema is idempotent and safe to
   re-run.

   B. Configure the embedding API (set in Vercel for all 3 environments):
   ```bash
   # Option 1: Direct OpenAI (recommended for simplicity)
   vercel env add OPENAI_API_KEY production preview development --sensitive

   # Option 2: Via Vercel AI Gateway (recommended if using AI Gateway elsewhere)
   # Set AI_GATEWAY_API_KEY instead. The code checks for AI_GATEWAY_API_KEY
   # first, falls back to direct OpenAI, then gracefully skips embedding if
   # neither is set. Memory reads still work, but semantic recall is off.
   ```

   Verify after prod migration: POST to `/api/diagnostic` should succeed
   and create a founder_memory row in Supabase. GET `/api/founder-memory/context`
   should return 401 (if unauthenticated) or 200 with context (if authed).

### Tier 2 — blocks the Reluctant-Hero proof, not revenue

7. **Record the VSL + 3 Founding PLVs in ONE shoot.** Single shoot,
   same shirt, same lighting, same camera angle. Four outputs:

   - VSL (3–5 min) — script at `strategy/founder-vsl-script.md`
   - PLV1 "The Door That Opened" (5–7 min) — `strategy/founding-plv-scripts.md`
   - PLV2 "How the Playbook Actually Works" (8–10 min) — same file
   - PLV3 "What It Looks Like on the Inside" (10–12 min) — same file

   **Pre-staged 2026-05-17 (this push):** the entire Mux upload pipeline +
   embed wiring is now ready-to-run. Walkthrough at
   `strategy/OPERATOR-SHOOT-DAY.md`. The shoot day cost reduces to:

   ```bash
   # Once, before shoot day
   python3 scripts/setup-mux-credentials.py

   # After the shoot (one command per video, or batched)
   python3 scripts/upload-shoot.py path/to/vsl.mp4  NEXT_PUBLIC_VSL_URL
   python3 scripts/upload-shoot.py path/to/plv1.mp4 FOUNDING_PLV1_PLAYBACK
   python3 scripts/upload-shoot.py path/to/plv2.mp4 FOUNDING_PLV2_PLAYBACK
   python3 scripts/upload-shoot.py path/to/plv3.mp4 FOUNDING_PLV3_PLAYBACK
   ```

   `PlvBlock` already renders native `<video>` from the Mux MP4 rendition
   the moment any `FOUNDING_PLV*_PLAYBACK` env var is populated. The VSL
   player consumes `NEXT_PUBLIC_VSL_URL` directly. The 45s `/` cut and the
   90s SOS Email 1 cut are derivative edits — defer to post-launch.

8. **Re-mine private 10-conversation founder set** for niche-specific
   dollar-objection language via Slack DMs / Gmail threads / Granola
   recordings. Append findings to `strategy/dollar-objections.md`. This
   replaces the public IH/HN proxies with verbatim language from Alex-
   adjacent real founders.

### Tier 3 — first 100 visitors

9. **Generate + push `INDEXNOW_KEY` and claim webmaster consoles.**
   Two parts, both cheap, both unlock AI-Overview citation parity on the
   non-Google engines. Roughly 30 minutes total.

   Part A — IndexNow (Bing + Yandex + Naver + Seznam push-notification).
   Once-off setup; the daily cron at `/api/cron/indexnow` (18:00 UTC,
   wired in `app/vercel.json`) does the actual submissions automatically.

   ```bash
   ./scripts/setup-indexnow-key.py --env all
   # After the next production deploy, https://unlocksaas.com/indexnow-key
   # serves the key, and the daily cron starts pinging api.indexnow.org
   # with every public marketing URL. Requires CRON_SECRET (Tier 1 #1).
   ```

   Part B — claim ownership on each webmaster console you intend to use.
   Each console emits a short verification token; paste each into the
   matching Vercel env var. None are sensitive (they're meant to be
   served in HTML). Skip a console if you don't plan to use it.

   ```bash
   # The slot list (paste real values from each console, then redeploy):
   #   Google Search Console        NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
   #   Bing Webmaster Tools         NEXT_PUBLIC_BING_SITE_VERIFICATION
   #   Yandex Webmaster             NEXT_PUBLIC_YANDEX_VERIFICATION
   #   Pinterest                    NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION
   #   Facebook (Meta Business)     NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION
   #   Naver Webmaster              NEXT_PUBLIC_NAVER_SITE_VERIFICATION
   #
   # For each token the console hands you:
   vercel env add NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION production preview
   # then redeploy.
   ```

   Until these are set, every console falls back to slower DNS
   verification (delays AI Overview eligibility on Google, Bing Copilot
   citation metrics, etc.). With them, verification completes on the
   next deploy.

10. **Post the launch X thread.** Lead with Story #1 (The Blank Offer
   Page). Drop link to /diagnostic at the end. Tag two of the Dream 100.

11. **Submit to Indie Hackers /show, r/microsaas, r/SaaS, Hacker News
   Show HN.** Reluctant Hero voice on all four. Workbook 09 §1 cadence
   rules apply.

12. **DM the first 5 Dream 100 entries.** One question per DM. No pitch.
   Workbook 09 §1 + Dream 100 CSV row 1–10 for the warmest targets.

11. **Publish /numbers transparency page.** Once week-1 data is in, update
   `app/data/public-metrics.json` with real numbers and a founder note, then
   flip the env gate:

   ```bash
   vercel env add NEXT_PUBLIC_NUMBERS_VISIBLE production
   # (enter: true)
   ```

   The URL `/numbers` is always live -- it shows a placeholder until this
   env var is set to `'true'`. After setting, redeploy (or let the next
   git push trigger a build). Update the JSON file weekly: edit
   `app/data/public-metrics.json` -- git commit -- git push -- done.

13. **Tier A YouTube warm-up reps** — pre-positions guest spots for the week
   after the first verified-customer cycle. Subscribe + watch 5 most-recent
   videos + 3 substantive timestamped comments each on Riley Brown
   ([@rileybrownai](https://www.youtube.com/@rileybrownai)) and Indy Dev Dan
   ([@indydevdan](https://www.youtube.com/@indydevdan)). ~3 hours founder
   time, Mon-Wed of any week. No link, no UnlockSaaS mention — workbook 09
   §1 channel rules. Deployable 7-channel pitch kit at
   `strategy/youtube-outreach.md` (B-roll library + 4-week cadence + reactive
   cues). Host-channel deferral rationale + 4 activation conditions at
   `strategy/decisions/youtube-channel-stance.md`.

---

## 📊 Read-outs once data lands

| Surface | Question | Where |
|---|---|---|
| /diagnostic conversion | What % of squeeze visitors hand over email? | PostHog → `diagnostic_form_submitted` / `diagnostic_page_viewed` |
| Diagnostic → $1 conversion | What % of labelled visitors buy the Starter? | Supabase → `diagnostic_leads` where `converted_to_starter_at` not null |
| $1 → $49 OTO conversion | What % of Starter buyers upgrade? | Stripe → subscription count / one-time count |
| A/B identity_label | Verified vs Paid Builders conversion rate | Supabase SQL in `state.json` `expert_secrets.movement.identity_label.infrastructure.read_query` |
| Soap Opera Email-N CTR | Where does the sequence leak? | Resend dashboard → tags `email_index` |
| First Paying Customer Verified | What % of starters reach Stripe verification? | Supabase `verified_conversions` count |

---

## Score forecast

| Layer | Pre-push | Post-push | Post-Best-Bait-100 | Post-100-visitors | Post-first-customer |
|---|---|---|---|---|---|
| Strategy | 91 | 99 | 99 | 99 | 99 |
| Execution | 62 | 92 | 93 | 93 | 95 |
| Market validation | 5 | 5 | 5 | 35 | 75 |
| Discipline | 88 | 92 | 92 | 92 | 95 |
| Operational | 70 | 92 | 92 | 95 | 95 |
| **Composite** | **63** | **84** | **84** | **89** | **95** |

**Post-Best-Bait-100 push (2026-05-17, v3.1):** DCS Chapter 11 lifted 88 → 100 under stage-appropriate scoring. Shipped the shareable diagnosis surface (`/diagnosis/[id]` + OG card + share endpoint + share card on the result page), audience-temperature hook variants on the squeeze (`default` / `contrarian` / `guarantee` mapped by `?utm_source` + Referer), explicit "This is NOT for you if..." disqualifier, honest empty-state public-counter, five new PostHog events. Composite stayed at 84 because the chapter was already at 88 — the lift was honest and the market-validation drag remains the only number that matters. See `build-log.md` entry "Audit Response: DCS Chapter 11 (The Best Bait) — moved from 88 to 100" and `strategy/audits/2026-05-17-brunson-trilogy-audit.md` addendum v3.1.

The autonomous push closes every gap that can be closed without real
visitors. The remaining 16 points to 100 are gated on operator actions
(env pushes, VSL recording, posting) and irreducibly on traffic +
conversions. There is no autonomous path to a 100 from inside a session.

— Russell would tell you: stop polishing. Press the buttons in Tier 1,
post the thread in Tier 3, and call me back at 100 visitors.
