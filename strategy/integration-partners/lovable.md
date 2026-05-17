# Integration Partner Packet — Lovable

**Project:** UnlockSaaS
**Partner:** Lovable (lovable.dev)
**Status:** SPEC READY. PITCH GATED on 3+ verified UnlockSaaS customer cycles closed.
**Parent doc:** `strategy/integration-partners/README.md`
**Priority:** #1 of 5 — largest single niche overlap, perfect ICP match.

---

## §1 — Lovable, in one paragraph

Lovable is the no-code-AI build platform Marco actually uses to ship products. Their users are non-engineers who type prompts and get working AI-powered apps. Lovable's #1 user-journey pain point — explicitly named in their Discord every week — is the moment *after* the user ships: they have a working app, no users, no customers, no idea what to do next. UnlockSaaS exists precisely for that moment. The audience overlap with Marco is the highest of any partner on the Dream 100; every Lovable user who is post-ship and pre-revenue is the Marco avatar verbatim.

---

## §2 — Why Lovable specifically (over Bubble, Cursor, Replit, Webflow)

| Dimension | Lovable | Bubble | Cursor | Replit | Webflow |
|---|---|---|---|---|---|
| Non-engineer-friendly | Yes | Yes | No (devs) | Mixed | Yes |
| AI-native | Yes | Adding | Yes | Mixed | Adding |
| Post-ship user-flow pain explicitly visible in their community | Yes (their #1 forum complaint) | Yes but distributed | No (devs build, ship, repeat) | Mixed | Yes but creative-not-product |
| Marco's actual build tool (per `project_unlocksaas_strategy.md`) | YES (the founder ships on Lovable) | Sometimes | Sometimes | Rarely | Rarely |
| Existing UnlockSaaS Discord presence | YES (`lovable-discord-reply-bank.md` exists) | No | No | No | No |
| Audience overlap with Marco (estimated) | ~70% | ~30% | ~15% | ~20% | ~10% |

**The math:** Lovable is the right partner if we pick one. The audience overlap and the founder's own use of the tool make the pitch self-evident ("hi, I built a dozen products on your platform, here's what I built for the moment your users disappear after shipping").

---

## §3 — Warm-up cadence (pre-gate, parallel to launch)

Already partly in flight per `dream-100-outreach.md` §1 parallel-track ("Comment on 1 Lovable Discord help thread per day"). The integration warm-up extends that to a 12-week play:

| Weeks | Action | Visibility to Lovable |
|---|---|---|
| 1–4 | Daily Lovable Discord presence (per existing reply bank in `strategy/lovable-discord-reply-bank.md`) — answer monetization / post-ship / pricing questions value-first | Founder name appears in the help channels; community recognizes "Maryan from UnlockSaaS" |
| 5–8 | Publish 1 Indie Hackers long-form referencing specific Lovable users' shipping stories (with permission); tag Lovable's account when it's natural; reply to Lovable's tweets with substantive case-study additions | Lovable's marketing / community team sees the founder's name show up in their content feeds |
| 9–10 | DM the Lovable community lead (e.g., Anton Osika via X `@antonosika`, or Lovable's community manager — handle TBD) with a value-only opening — share an insight from the Discord that would help Lovable's onboarding, no pitch | First 1:1 contact, framed as community contribution, not pitch |
| 11–12 | Send the pitch (§4 below) — by now 12 weeks of community presence makes "who is this Maryan" a 4-second answer instead of a research task | Pitch lands warm |

**Touch logging:** every action above is a `dream_100_touches` row with `target_handle='lovable'`, `channel` per action type (`community_reply` / `ih_longform_tag` / `x_reply` / `integration_warmup` / `integration_pitch`).

---

## §4 — The pitch (verbatim, gated)

```
Subject: Lovable + UnlockSaaS — "after you ship" partnership pitch

Hey {Anton / Lovable partnerships lead},

Maryan from UnlockSaaS. Quick frame: I built {N} products in Lovable in 2026,
watched all of them flatline in Stripe, and ran a year of denial-coded SEO
before I figured out the real bottleneck was upstream of the build.

I'm now the founder of a tool specifically for the Lovable-shipped, pre-revenue
founder — a 7-step doing-environment with a 60-day-or-refund guarantee
enforced by code. {Customer name from your community}, {Customer name #2},
and {Customer name #3} have all completed the Machine cycle and verified
first paying customers. Stripe screenshots and their permissions attached.

I think there's a clean co-marketing shape:

1. Free Diagnostic specifically for shipped-Lovable apps (reads the live URL,
   labels the failure mode, points at the door). Co-branded squeeze at
   unlocksaas.com/from/lovable.
2. Featured slot in your "after you ship" docs or post-launch onboarding email.
3. Reciprocal: Lovable becomes the recommended build tool in our member
   onboarding (already true in practice — happy to make it explicit).

20 minutes to see if the shape fits, or not the right time?

— Maryan
maryan@unlocksaas.com
unlocksaas.com
```

**Blanks documented:**
- `{N}` — the literal product count from the founder's own portfolio (typically "a dozen")
- `{Customer name from your community}` — three verified UnlockSaaS customers who built on Lovable. Pitch does not fire until at least one of these is real.
- `{Anton / Lovable partnerships lead}` — current best contact path: Anton Osika (CEO, X `@antonosika`) or whoever runs partnerships at Lovable when the gate fires.

---

## §5 — The assets we propose to co-build

### Asset 1 — Co-branded Diagnostic at `/from/lovable`

A version of the existing Free Diagnostic, skinned with Lovable's brand alongside ours, that:
- Detects on URL-paste that the submitted product is a Lovable-shipped app (Lovable's hosted-domain pattern or a meta tag they ship)
- Returns one of the three labels (Wrong Person / Weak Offer / Weak Belief) with copy tuned to Lovable users' specific patterns ("we see this often in apps shipped quickly with Lovable: the offer page describes capabilities, not a result")
- Routes to the standard $1 Starter with a Lovable-specific cookie that gives access to a Lovable-themed Verified Builder badge

**Build cost on our side:** ~6 hours (route + diagnostic prompt tuning + cookie). Reuses existing diagnostic infrastructure.

**Build cost on Lovable side:** zero. They just link to it.

### Asset 2 — "After You Ship" content piece

A co-authored piece for Lovable's docs or blog titled approximately *"What to Do the Week After You Ship on Lovable (When Your First Stripe Charge Doesn't Show Up)"* with:
- 5-step checklist anchored in The Machine's first 5 steps
- Specific Lovable-app screenshots
- Quotes from 3 Lovable-shipped founders who got to first paying customer
- Single embed at the bottom: the Free Diagnostic squeeze

**Build cost on our side:** ~8 hours drafting + 2 rounds of edits.

**Build cost on Lovable side:** editorial review + publish slot.

### Asset 3 — Onboarding email mention

In Lovable's standard "you just shipped your app" email (whenever they send one), one short sentence + link: *"If you want to find out who this is actually for and get to your first paying customer, our friends at UnlockSaaS built a diagnostic specifically for Lovable apps."*

**Build cost:** Lovable adds one sentence + URL to a template.

---

## §6 — Value-exchange math

| What Lovable gets | Defensible value (in Lovable's currency) |
|---|---|
| Editorial asset addressing their #1 user-experience complaint ("I shipped, now what") | Lovable's content team would otherwise build this themselves — ~$3,000 of editorial labor avoided |
| Distribution piece that uses their tool's #1 friction as a feature (post-ship is hard for everyone; Lovable + UnlockSaaS solves it) | Improves Lovable's retention by giving post-ship users a productive next step instead of churn |
| Co-marketing OG image / social proof on the Free Diagnostic being Lovable-aware | Free distribution to our growing audience |
| Customer success stories of Lovable-shipped founders getting paid | Lovable can cite these in their own marketing ("Verified Builders shipping on Lovable") |

| What UnlockSaaS gets | Defensible value (in our currency) |
|---|---|
| Direct traffic from Lovable's post-ship surface — highest-intent Marco moment | Lovable ships ~N apps per week (public estimate ~1,000+); even 1% click-through to /from/lovable is 10+ qualified leads/week |
| Trust transfer from Lovable's brand to ours | Reduces the "is this another guru thing" objection that costs us conversion on cold traffic |
| Permanent editorial asset on Lovable's docs (Brunson rule: traffic you own includes traffic you've earned permanent placement for) | Compounds over years |
| Reciprocal "build on Lovable" mention in our member area | Helps Lovable but costs us nothing (Marcos overwhelmingly use Lovable anyway) |

**The asymmetry that makes this work:** Lovable already needs to solve post-ship retention. We already need to find post-ship founders. The integration solves both sides of the same problem.

---

## §7 — Objection bank

Five objections Lovable is most likely to raise, with the response to each.

| # | Objection | Response |
|---|---|---|
| 1 | "We don't want to recommend a paid tool to our users — feels like an upsell." | "Free Diagnostic stays free. The $1 Starter is a one-time charge for a result, not a recurring trap. No paid product appears on the surface you embed; the diagnostic itself is the asset. The $1 ascent happens off your surface, not on it." |
| 2 | "We have our own community content; why partner?" | "Your content is excellent. The gap is: who covers the *week after launch*, specifically? Looking at your docs and Discord, the post-launch question is the most-asked, least-documented topic. We've built the doing-environment for that specific week. The integration plugs that exact gap." |
| 3 | "Editorial bandwidth — we don't have time to co-author a piece." | "We draft. You review. Two rounds, two hours of your time, end-to-end. We can have a publishable draft on your editor's desk inside a week." |
| 4 | "What if your tool's quality drops? We'll have recommended something that hurts our users." | "Two-fold answer. (a) Every recommendation we make is verifiable in code — the 60-day refund is enforced by Stripe webhook, not by us judging. (b) The exit clause in §9 lets you withdraw the recommendation in 7 days, no questions, no fault." |
| 5 | "We'd want to see usage data — what gets clicked from our surface." | "Built-in. Every link from your surface carries `?from=lovable` (registered as `integration-lovable` in our link-registry), so we can ship you a monthly per-partner report: clicks, opt-ins, $1 conversions, $49 conversions. Visible to you in real time on a magic-link-authenticated page." |

---

## §8 — Success-metric agreement (written before launch)

Before the integration goes live, both sides agree on these metrics in writing (exchanged in email or in a Notion page). At day 90, both sides read the same numbers and decide together: continue, modify, or fire the exit clause.

| Metric | Target at day 90 | Source |
|---|---|---|
| Click-through rate from Lovable surfaces to `/from/lovable` | ≥ 2% of post-ship users in the cohort | Our `link_clicks` view, filtered to `slug='integration-lovable'` |
| Diagnostic opt-in rate from Lovable-routed traffic | ≥ 30% (matches our standard `/diagnostic` benchmark) | PostHog `diagnostic_form_submitted` filtered to `from_partner='lovable'` |
| $1 Starter conversion from Lovable-routed traffic | ≥ 5% | Stripe metadata `usaas_stack_subject` filter |
| Verified Builder count among Lovable-routed customers | ≥ 1 per quarter | `builder_badges` view filtered to `source_partner='lovable'` |
| Retention impact on Lovable's side | Measurable — Lovable's team self-reports any change in post-ship-30-day retention for the cohort that visited `/from/lovable` | Lovable's internal analytics |
| Public testimonial slot for the integration | Lovable willing to publicly cite the integration in their marketing after 1 quarter | Both teams' Twitter / blog |

**Failure mode:** if click-through is < 1% at day 90, fire the exit clause. The integration is either invisible to Lovable users or framed wrong; both are correctable, neither is worth dragging.

---

## §9 — Exit clause (clean break)

Either side can end the integration at any time with 7 days' notice. The other side:
- Removes the link / embed within 7 days
- Receives a CSV of any data attributable to the partnership (subject IDs, opt-ins, conversions tagged `from_partner='lovable'`) for their own retention
- Public statement (if any) is mutually drafted and approved before publication
- No financial obligation transfers — no claw-back, no continued affiliate payments past the 7-day window

**Why this clause matters:** Brunson rule. The cleanest partnerships are the ones with a 7-day exit clause written into the opening doc. Lovable can say yes without thinking "what if this becomes a year of dragged maintenance." We can say yes without thinking "what if their team changes priority and we're stuck on a dead surface."

---

## §10 — Specific contact paths (research-ready)

- **Anton Osika** — Lovable CEO, X `@antonosika`, also publishes on `lovable.dev/blog`. Likely the first contact for any high-level partnership.
- **Lovable Community Manager** — TBD via the Lovable Discord (`#general` admin handles); name changes; verify on the day.
- **Lovable Partnerships email** — likely `partnerships@lovable.dev` or `hello@lovable.dev`; check their current site footer.
- **Backup path** — DM via Lovable's official X account `@lovable_dev` (or the current handle); use a short variant of the §4 pitch with one click target.

---

*Generated 2026-05-17 during DCS #13 autonomous push. Reconciled against `strategy/dream-100-outreach.md` §4 (the 10-line teaser this replaces), `strategy/lovable-discord-reply-bank.md` (the warm-up channel), `traffic_secrets.fill_funnel.activation_manifest` (link slug `integration-lovable` registered). Pitch fires after the 3+ verified-customer gate in `strategy/other-peoples-funnels.md` §6.*
