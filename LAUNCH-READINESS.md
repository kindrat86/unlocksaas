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

1. **Generate + push `CRON_SECRET` and `UNSUBSCRIBE_SECRET` to Vercel** (all
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

### Tier 2 — blocks the Reluctant-Hero proof, not revenue

4. **Record the VSL + 3 Founding PLVs in ONE shoot.** Single shoot,
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

5. **Re-mine private 10-conversation founder set** for niche-specific
   dollar-objection language via Slack DMs / Gmail threads / Granola
   recordings. Append findings to `strategy/dollar-objections.md`. This
   replaces the public IH/HN proxies with verbatim language from Marco-
   adjacent real founders.

### Tier 2.5 — Crawlability + AI-engine discoverability

These close the SEO audit deductions on item §9 (crawlability + indexability).
None block revenue, all compound visibility once shipped.

5a. **Push `INDEXNOW_KEY` + create the Vercel deployment webhook.** Three
    steps, ~5 minutes total:

    ```bash
    # 1. Generate + push the public IndexNow key to Vercel (production).
    python3 scripts/setup-indexnow-key.py
    ```

    Then in the Vercel dashboard:

    - Project settings → Webhooks → **Create webhook**
    - Endpoint URL: `https://unlocksaas.com/api/webhooks/vercel/deployment`
    - Events: `deployment.succeeded`
    - Copy the signing secret shown ONCE on creation.

    ```bash
    # 2. Paste the signing secret into the env (input is not echoed).
    python3 scripts/setup-vercel-webhook-secret.py
    ```

    After the next production deploy:
    - `https://unlocksaas.com/indexnow.txt` will serve the key.
    - The deployment webhook fires the IndexNow ping to Bing + Yandex +
      Naver + Seznam + Yep within seconds of promote.
    - The weekly cron at `/api/cron/indexnow` re-submits the full sitemap
      every Sunday at 12:00 UTC as belt-and-suspenders.

5b. **Push Webmaster verification tokens + verify in each console.** Each
    token is a public meta-tag value — the script only emits the
    corresponding `<meta>` tag when the env var is set, so partial
    completion is safe (you can verify Google today and Bing next week).

    ```bash
    # Prompts for each token in turn; leave blank to skip any.
    python3 scripts/setup-webmaster-verification.py
    ```

    Then in each console:
    - Google Search Console → property → Verify
    - Bing Webmaster Tools → site → Verify
    - Yandex Webmaster → site → Verify
    - Pinterest business → claim website → Verify

    With these verified, you get indexing telemetry (impressions, CTR,
    average position) from each engine, plus the ability to submit
    sitemap updates manually if the IndexNow flow ever misfires.

### Tier 3 — first 100 visitors

6. **Post the launch X thread.** Lead with Story #1 (The Blank Offer
   Page). Drop link to /diagnostic at the end. Tag two of the Dream 100.

7. **Submit to Indie Hackers /show, r/microsaas, r/SaaS, Hacker News
   Show HN.** Reluctant Hero voice on all four. Workbook 09 §1 cadence
   rules apply.

8. **DM the first 5 Dream 100 entries.** One question per DM. No pitch.
   Workbook 09 §1 + Dream 100 CSV row 1–10 for the warmest targets.

9. **Tier A YouTube warm-up reps** — pre-positions guest spots for the week
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
