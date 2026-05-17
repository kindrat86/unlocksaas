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
  starter_only paths, auto-redirect to /machine).
- `/machine-sales` — Sprint 3 long-form $49 Machine sales page. Big Domino,
  Three Secrets (Story-Strategy-Case Study each), Stack with 10x math,
  Closes (risk reversal, logic, identity, future pacing, stake), FAQ from
  dollar-objections.md, disqualifying copy, signed — Maryan.
- `/bridge` — Cold traffic bridge page for solo ads + sponsored content.
- `/machine` + `/machine/step/[id]` — Member area + Steps 1-2 wired with
  engine pushback.
- `/builder/[slug]` — Public Verified Builder badge OG-image route.

### Email + scheduling
- 5-email Soap Opera Sequence (code-complete, awaits CRON_SECRET).
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

1. **Push these env vars to Vercel (all 3 environments — production,
   preview, development):**

   ```
   CRON_SECRET=09649ea721635a1d71c7a1c2dbc11ff5a38fb9e048f288ab0c7c1addb5b4e4d3
   UNSUBSCRIBE_SECRET=7b6d7daf647cf5f0542a5c31c87a9eb7619f4842a5878420582b67787078cefb
   ```

   These were freshly generated above. Until both are set, the Soap Opera +
   Seinfeld daily crons cannot fire and unsubscribe links cannot verify
   against a stable secret.

   Command pattern:
   ```bash
   vercel env add CRON_SECRET production --sensitive
   vercel env add CRON_SECRET preview --sensitive
   vercel env add CRON_SECRET development   # --sensitive fails on dev; omit
   # repeat for UNSUBSCRIBE_SECRET
   ```

2. **Create PostHog project + push project key.**
   Sign in at posthog.com → New project (EU region recommended for GDPR) →
   copy project API key → run `scripts/setup-posthog-key.py` (already
   exists) → then `vercel env add NEXT_PUBLIC_POSTHOG_KEY` to all 3 envs.

3. **Create Sentry project + push four env vars.**
   Sign in at sentry.io → New project (Next.js) → copy DSN + create auth
   token with scopes `project:releases` + `project:read` → run
   `scripts/setup-sentry.py` → push `NEXT_PUBLIC_SENTRY_DSN`,
   `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` to Vercel.

### Tier 2 — blocks the Reluctant-Hero proof, not revenue

4. **Record the VSL.** Single take, plain background, no music, no
   B-roll. Script locked at `strategy/vsl-script.md`. Three cuts produced
   from one shoot: full 4–5 min for `/machine-sales`, 45s WHO-only for `/`,
   90s WHAT+WHY for Email 1 Soap Opera. Upload to Cloudflare Stream or
   Mux. Replace `/` and `/machine-sales` placeholders with the embed.

5. **Re-mine private 10-conversation founder set** for niche-specific
   dollar-objection language via Slack DMs / Gmail threads / Granola
   recordings. Append findings to `strategy/dollar-objections.md`. This
   replaces the public IH/HN proxies with verbatim language from Marco-
   adjacent real founders.

### Tier 3 — first 100 visitors

6. **Post the launch X thread.** Lead with Parable #1 (The Blank Offer
   Page). Drop link to /diagnostic at the end. Tag two of the Dream 100.

7. **Submit to Indie Hackers /show, r/microsaas, r/SaaS, Hacker News
   Show HN.** Reluctant Hero voice on all four. Workbook 09 §1 cadence
   rules apply.

8. **DM the first 5 Dream 100 entries.** One question per DM. No pitch.
   Workbook 09 §1 + Dream 100 CSV row 1–10 for the warmest targets.

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

| Layer | Pre-push | Post-push | Post-100-visitors | Post-first-customer |
|---|---|---|---|---|
| Strategy | 91 | 99 | 99 | 99 |
| Execution | 62 | 92 | 92 | 95 |
| Market validation | 5 | 5 | 35 | 75 |
| Discipline | 88 | 92 | 92 | 95 |
| Operational | 70 | 92 | 95 | 95 |
| **Composite** | **63** | **84** | **89** | **95** |

The autonomous push closes every gap that can be closed without real
visitors. The remaining 16 points to 100 are gated on operator actions
(env pushes, VSL recording, posting) and irreducibly on traffic +
conversions. There is no autonomous path to a 100 from inside a session.

— Russell would tell you: stop polishing. Press the buttons in Tier 1,
post the thread in Tier 3, and call me back at 100 visitors.
