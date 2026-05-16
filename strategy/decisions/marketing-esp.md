# Decision: Marketing/Sequence ESP

**Status:** Vendor locked. Activation deferred.
**Locked on:** 2026-05-17
**Choice:** Kit (ConvertKit)
**Activation trigger:** 100 list subscribers
**Until activation:** Resend handles Sprint 2 Soap Opera Sequence via `soap_opera_subscribers` table + day-based cron, per `strategy/BUILD-PROMPT-CLAUDE-CODE.md` Sprint 2 §3.

## The candidates

| | Kit (ConvertKit) | Loops.so |
|---|---|---|
| Free tier | 10,000 subscribers | 1,000 subscribers |
| Built for | Creators, newsletters, course launches | SaaS lifecycle + transactional |
| Sequences | Visual Automations (mature) | Loops (newer, dev-API-first) |
| Broadcasts | Core competency | Supported, less polish |
| Tagging / segmentation | Tag + segment + condition trees | Simpler, lifecycle-event-driven |
| API ergonomics | REST, well-documented, long history | Cleaner DX, TS SDK, more modern |
| Deliverability reputation | 12+ years of shared sender warmup | Newer pool, still solid |
| Brunson framework fit | Direct — ConvertKit is the canonical creator-newsletter platform Brunson-style sellers use | Indirect — works, but is not what Soap Opera + Seinfeld were designed against |

## Why Kit wins for UnlockSaaS specifically

1. **Brunson framework alignment.** The Soap Opera Sequence (workbook 04 §5) and Seinfeld Sequence (workbook 08 §6) were designed against the creator-newsletter playbook. Kit is the canonical tool for that playbook — it ships visual flows that mirror Brunson funnel diagrams 1:1, including tag-gated branches for Diagnostic Taker → Starter Buyer → Core Subscriber → Refunded → Churned.
2. **Free-tier headroom.** 10k subs vs 1k means no paid-plan decision during validation. Even if UnlockSaaS hits 5k subscribers before product–market fit, Kit stays $0. Loops would force a $49/mo decision at 1k.
3. **Identity fit.** "Verified Builders" is a movement/newsletter brand. Reluctant Hero voice is parasocial-creator voice. Kit's positioning, sender reputation, and feature set are built for exactly that archetype.
4. **Tag system maps to milestones.** Kit's tags + Visual Automations make it trivial to express the rules in `strategy/state.json`: tag = milestone badge, automation step = next sequence email. No custom code needed beyond the API webhook in/out.
5. **Brunson's own ecosystem.** ClickFunnels, Two Comma Club coaches, and the broader Brunson world tilt heavily toward ConvertKit/Kit. Lower friction to study and copy patterns that already work.

## Why not Loops.so

Loops.so is excellent for SaaS lifecycle + transactional-style nurture (trial expiry, feature adoption, churn rescue). UnlockSaaS *does* need some of that — but Resend already covers the dev-API-native transactional surface, and the marketing sequences here are not lifecycle nudges; they're creator-style indoctrination + daily Seinfeld emails. Loops would be a forced fit.

## Two-vendor split (clean separation)

| Layer | Vendor | Examples |
|---|---|---|
| **Transactional** | Resend (already provisioned, DKIM/SPF/DMARC live) | Receipts, magic links, password resets, 60-day guarantee work-condition reminders, refund confirmations |
| **Marketing / sequences** | Kit, post-activation | Free Diagnostic confirmation, 5-email Soap Opera, Seinfeld daily nurture, Dream 100 outreach broadcasts, launch announcements |

Both send from `maryan@unlocksaas.com` with the Reluctant Hero "— Maryan" signature (per `project_unlocksaas_email_identity` memory). DKIM works for both: Resend uses selector `resend._domainkey`, Kit will get its own selector during onboarding (typically `kit._domainkey` or similar).

## Until activation: Sprint 2 Soap Opera in Resend

Sprint 2 (per BUILD-PROMPT §"Sprint 2 (Week 2 to 3)") wires the 5-email Soap Opera through Resend with day-based delays. Concrete shape:

- Supabase table `soap_opera_subscribers` (email, source, current_day, status, opted_out_at, created_at) — already in the BUILD-PROMPT DB schema.
- A Vercel cron (daily, `0 14 * * *` Europe/Kyiv = mid-morning EST = mid-afternoon CET) reads subscribers due for their next email and calls Resend.
- Day 0 = capture confirmation, Day 1, Day 2, Day 3, Day 5 = sequence emails (workbook 04 §5).
- Opt-out link in every email writes `opted_out_at` and skips future sends.

This is good enough for 0 → 100 subscribers. The 5-email arc is finite — once a subscriber finishes, they don't need a broadcast cadence yet.

## Activation: when subscriber count hits 100

1. Provision Kit account at https://kit.com (free plan, no credit card).
2. Add `unlocksaas.com` as authenticated sending domain — DNS records pushed via `scripts/namecheap-dns.py` (extend with `add-kit` subcommand modeled on `add-resend`).
3. Configure sender: `Maryan <maryan@unlocksaas.com>`, signature `— Maryan`.
4. Rebuild Soap Opera Sequence as a Kit Visual Automation (5 emails, day-delay triggers).
5. Build Seinfeld Sequence as a Kit Broadcast list (workbook 08 §6) — daily-ish cadence, evergreen Brunson-style stories with embedded soft CTAs.
6. Migration script: export `soap_opera_subscribers` from Supabase → import to Kit with tags reflecting `current_day` so mid-sequence subscribers don't restart from Day 0.
7. Cut over: switch Sprint-2 cron from "send via Resend" to "ensure subscriber is in Kit with correct tag". Resend Soap Opera path goes dormant; Resend keeps transactional.
8. Hard cutover, not parallel send — to avoid duplicate emails.
9. Update `project_unlocksaas_infra` memory's ESP row from "activation deferred" → "active, since YYYY-MM-DD".

Budget the migration as 2–4 hours of work.

## Escape hatch: Loops.so

Re-evaluate if any of these become true after activating Kit:

- Kit's Visual Automation builder feels clunkier than a 30-minute Loops API setup would have.
- Deliverability degrades (open rates < 25%, gmail spam-folder rate > 5%).
- Maryan wants to express sequences as code (TypeScript-defined flows checked into the repo) rather than in a SaaS UI.
- Kit free tier becomes restrictive in a way that Loops free tier doesn't (unlikely given the 10×subscriber differential).

If switched, migration is symmetric: export Kit subscribers + tags → import to Loops as audiences. Both ESPs have CSV import.

## Costs at relevant scale

| Subscribers | Kit | Loops | Resend (transactional-only) |
|---|---|---|---|
| 0–100 | $0 | $0 | within Resend free tier |
| 100–1,000 | $0 | $0 | free |
| 1,000–10,000 | $0 | $49/mo | free or paid depending on volume |
| 10,000+ | $29–$79/mo depending on plan | $99+/mo | tier-dependent |

The free-tier crossover at 1,000 subs is the single biggest financial argument for Kit over Loops at UnlockSaaS's pre-revenue stage.

## What changes in code today

Nothing. This decision is a vendor lock, not an integration. The first code touchpoint is Sprint 2 Soap Opera in Resend (already planned). The first Kit code touchpoint is at the 100-subscriber activation milestone.

## What changes in memory

`project_unlocksaas_infra` memory row updated from "TBD — Loops.so vs Kit (ConvertKit)" to "Kit (ConvertKit) — vendor locked 2026-05-17, activation deferred until 100 list subs" with a pointer to this file.
