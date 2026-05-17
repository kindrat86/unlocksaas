# RESUME HERE: Unlock SaaS

**Project:** Unlock SaaS, a micro-SaaS for post-launch pre-revenue founders.
**Domain:** unlocksaas.com (purchased via Namecheap, 2026-05-16).
**Strategy status:** COMPLETE. All 10 chapters of the Brunson "Unlock the Secrets" workbook done.
**Next phase:** BUILD.
**Last updated:** 2026-05-16.

## Folder layout

```
unlocksaas/                          (project root)
├── README.md                         (dev-facing orientation)
├── 00-RESUME-HERE.md                 (this file: strategic resume for AI sessions)
├── projects.json                     (project registry)
├── strategy/                         (all Brunson assets, locked)
│   ├── state.json                    (machine-readable record of every locked decision)
│   ├── BUILD-PROMPT-CLAUDE-CODE.md   (the prompt to paste into Claude Code)
│   └── workbooks/
│       ├── 01-sales-funnel-secrets.md
│       ├── 02-funnels-value-ladder.md
│       ├── 03-funnel-scripts.md
│       ├── 04-building-your-funnels.md
│       ├── 05-creating-your-movement.md
│       ├── 06-creating-belief.md
│       ├── 07-10x-secrets-one-to-many.md
│       ├── 08-your-dream-customer.md
│       ├── 09-fill-your-funnel.md
│       └── 10-growth-hacking.md
└── (code will be added by Claude Code at root)
```

## How to resume (AI session)

Load the **brunson-architect** skill, read `strategy/state.json` (every locked decision is there), then skim the 10 workbook files in numeric order. Memory of this project lives in these files, not in any single conversation.

## How to start building (developer / operator)

Open this folder in Claude Code. Paste the prompt block from `strategy/BUILD-PROMPT-CLAUDE-CODE.md`. Claude Code reads the 10 workbooks and starts the first sprint.

## The locked decisions, in brief

- **Dream customer:** Marco, 36, non-engineer, post-launch pre-revenue, flat Stripe line. Core false belief: "the problem is the product." Marco is the founder himself.
- **Offer:** Marco gets his first paying customer, verified by Stripe, within 60 days, or full refund. Price $49/mo. Core product is **The Machine**, a 7-step system.
- **Value ladder:** free diagnostic, then $1 one-time Starter (Machine Steps 1+2), then $49/mo core (Machine Steps 3-7 + guarantee).
- **Attractive Character:** Reluctant Hero. Three backstory lengths. Five named parables. Four flaws. Polarity with enemy sentence.
- **Movement:** Manifesto locked. Identity: **Verified Builders** (canonical / SSR default, LOCKED 2026-05-17). 50/50 A/B against "Paid Builders" is LIVE in production code (cookies + beacons + Stripe-metadata attribution shipped; awaiting Vercel deploy for first exposures). Future-based cause: "founders who build real things with AI deserve to get paid for them."
- **Belief work:** Full Epiphany Bridge (7 elements). Four Core Stories: Vehicle, 4 Internal rewrites with kinda-like bridges, 5 External rewrites, 3 chain breakers.
- **Long-form $49 sales page:** Big Domino written. Three Secrets fully scripted with Story-Strategy-Case Study. Stack slides 16-30. 16 mini-closes in 4 categories. Scarcity deliberately rejected.
- **Dream 100:** 100 specific entries across 7 categories. Category 2 LOCKED 2026-05-17 (rows 31-40 filled with Castrio / Chen / Nutlope / Tibo / Mubs / Walling / Lavingia / Walls / Jackson / Gascoigne). Podcast warm-up plan locked in workbook 08 §3 (5 Tier-1 targets with contact path + pitch angle + lead time).
- **Launch channels:** X + Indie Hackers + r/SaaS + r/microsaas. All others deferred.
- **Growth map:** Three phases, evidence-based not time-based. Phase 2 trigger: 3 verified customer cycles. Phase 3 trigger: 50 paying customers.
- **Design principle:** framework into the engine, not onto the user.
- **Funnel hacks:** v3 LOCKED 2026-05-17 — 7 competitors hacked + 1 anti-hack + 2 medium-pass hacks (Reddit/IH converting-thread structure + newsletter sequence patterns from public archives). Full breakdown in `strategy/funnel-hacks.md`; structured array in `state.json` `funnel_hacks` (8 entries) + `funnel_hacks_synthesis` (v1+v2+v3 patterns); 17-row action matrix status-stamped against shipped state (9 SHIPPED / 2 PARTIAL / 1 BLOCKED-ON-OPERATOR / 5 DEFERRED-WITH-GATE). Cookbook expanded to 15 swipes covering all v1+v2 competitors + v3 medium-pass sources. Closes DCS Secret #5 + #8 + ES Secret #20 at **100** under stage-appropriate scoring.
- **Google strategy:** LOCKED 2026-05-17 — three-surface plan in `strategy/google-strategy.md`. Surface A (Organic Search) + Surface B (AEO/GEO) SHIPPED at launch via `app/src/app/sitemap.ts`, `app/src/app/robots.ts`, `metadataBase` on the root layout, and schema.org JSON-LD on `/` (Organization + WebSite), `/diagnostic` (Service + HowTo), `/machine-sales` (Product). Surface C (Paid Search) DEFERRED behind workbook 09 §5 gates (≥30% diagnostic conversion + ≥5% Starter conversion + ≥3 verified customer cycles). One launch-day exception: brand-defense exact-match $5/day campaign on `unlocksaas`. Closes Traffic Secrets Secret #11 (Google) from N/A → 100. AC-flaw guardrail (workbook 01 §6 Beat 4 SEO-as-avoidance) vetoes generic high-volume keyword targeting at the spec level.

## Founder open items before launch

1. **Execute Week 1 from `strategy/launch-content/week-1-execution-playbook.md`.** Single Mon-Fri operator script (~90 min/day, ~8 hours total) that collapses six cross-referenced kits into one paste-and-go sheet. Cross-references: `strategy/dream-100-outreach.md` (20 dossiers + 5 Tier-A DMs + 5 podcast pitches + 5 integration pitches + affiliate one-pager + 4-week cadence + tracking schema), `strategy/dream-100-reply-bank.md` (Tue/Wed public-reply templates by post-shape with per-target priors), `strategy/dream-100-first-response-playbook.md` (6 inbound-reply scenarios with paste-ready responses + decision flowchart), `strategy/dream-100-outreach.csv` (pre-populated 26-row Week-1 tracker), `strategy/dream-100-bench.md` (Tier E/F/G rotation for Week 5+ if Tier A goes silent), `strategy/lovable-discord-reply-bank.md` (10 daily-help patterns for the parallel-track), `strategy/launch-content/launch-kit.md` and `strategy/content-queue-week-1.md` (X threads + IH long-forms + Reddit posts). **Week 1 Tier A targets** (highest ICP overlap): Anthony Castrio, Marc Lou, Damon Chen, Arvid Kahl, Mubashar Iqbal. **Show HN slot** for Week 2 or Week 3 (per `strategy/launch-content/hn-show-launch.md` — one-shot per quarter, Tue/Wed 8-10am ET). Per-message Maryan confirmation enforced for every send. Per-touch operator cost with this pack: ≤2 minutes; without it: 20-30 minutes (~9 hours/week of decision-fatigue eliminated).
2. Re-mine the private 10-conversation set via authenticated MCP (Slack / Gmail / Granola) to refine niche-specific dollar-objection language for $49 FAQ + disqualifier copy. Public-source mine already shipped in `strategy/dollar-objections.md` (30+ quotes, 7 categories).
3. Record the six-line founder-intro video (workbook 01 §6 Beat 2 verbatim) and replace the placeholder on `/`. Phone-camera quality is fine — Reluctant Hero voice beats polish.
4. ~~Push `CRON_SECRET` + `UNSUBSCRIBE_SECRET`~~ + PostHog key + Sentry credentials to Vercel envs. **`CRON_SECRET` + `UNSUBSCRIBE_SECRET` are DONE** (verified via `vercel env ls` on 2026-05-17 — encrypted, present in all 3 environments since 16h ago; latest prod deploy fires `/api/cron/seinfeld` returning 200, proving the Bearer auth wire is live). Remaining gate is **PostHog key + Sentry credentials** — setup scripts exist (`scripts/setup-posthog-key.py`, `scripts/setup-sentry.py`).
5. Post-launch (~200 exposures per variant, once cron is live): read Verified vs Paid Builders A/B results — SQL query in `state.json` `expert_secrets.movement.identity_label.infrastructure.read_query`.
6. **Tier A YouTube warm-up reps** (Mon-Wed of any week before first verified customer): Riley Brown ([@rileybrownai](https://www.youtube.com/@rileybrownai)) + Indy Dev Dan ([@indydevdan](https://www.youtube.com/@indydevdan)). Subscribe each → watch 5 most-recent videos in full → leave 3 substantive timestamped comments per host (no link, no UnlockSaaS mention) → 1 X-engagement each. ~3 hours total founder time. Pre-positions both Tier-A pitches for Thu of the week after first verified-customer cycle closes. Kit at `strategy/youtube-outreach.md`. Gate + 4-condition host-channel deferral at `strategy/decisions/youtube-channel-stance.md`.
7. **Verify `unlocksaas.com` in Google Search Console** (DNS TXT method at Namecheap; 15 min); after verify, submit `sitemap.xml` (30 seconds). Sitemap is already shipped at `app/src/app/sitemap.ts`. Reference: `strategy/google-strategy.md` §A.6.
8. **Create Google Ads account + activate the brand-defense campaign** ($5/day exact-match on `unlocksaas`; max CPC $2.00; ad copy templated in `strategy/google-strategy.md` §C.2.5 "Brand"). Log the campaign ID back into this file once activated. Reference: `strategy/google-strategy.md` "Brand defense, day one". 30 min one-time. This is the **only** Google Ads spend permitted before the workbook 09 §5 evidence gates fire.

## Tech stack (locked in BUILD-PROMPT)

Next.js 14 + Supabase + Stripe + Anthropic Claude API + Resend, deployed to Vercel.

## If you are an AI session resuming this work

Read in this order: this file, then `strategy/state.json`, then the ten workbook files in numeric order. Load the **brunson-architect** skill. If the operator asks to start building, point them at `strategy/BUILD-PROMPT-CLAUDE-CODE.md`. If they ask for Brunson revisions, enter Revision Mode and update both the relevant workbook file and `state.json`. If they ask for competitive analysis, use the `brunson-funnel-hacker` skill.
