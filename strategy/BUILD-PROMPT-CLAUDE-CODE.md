# Claude Code Build Prompt: Unlock SaaS

## How to use this file

Open the project folder (`unlocksaas/`) in Claude Code. Start a fresh Claude Code session. Paste the prompt block below into the session and hit enter. Claude Code will read the workbook files in `strategy/workbooks/` and begin building. This prompt is designed for Claude Code (CLI / IDE with file system access), not for a regular Claude.ai chat.

If you would rather build in Lovable: paste the same prompt block into Lovable's chat as the project brief. Lovable cannot read the workbook files directly, so first paste the contents of `strategy/workbooks/04-building-your-funnels.md` (the build spec), `strategy/workbooks/07-10x-secrets-one-to-many.md` (the $49 sales-page long-form), and `strategy/workbooks/08-your-dream-customer.md` (the Dream 100) into Lovable along with this prompt.

All paths below are relative to the project root (`unlocksaas/`).

---

## THE PROMPT (copy everything between the lines)

---

You are building Unlock SaaS at unlocksaas.com, a micro-SaaS for post-launch pre-revenue founders. The strategy is fully locked in `strategy/`. Before you write a single line of code, read these files in order:

1. `00-RESUME-HERE.md` (plain-language project briefing and folder map).
2. `strategy/state.json` (playbook-readable record of every locked decision).
3. `strategy/workbooks/01-sales-funnel-secrets.md` (dream customer, offer, value ladder, story, hooks, attractive character).
4. `strategy/workbooks/02-funnels-value-ladder.md` (funnel-type-per-rung mapping).
5. `strategy/workbooks/03-funnel-scripts.md` (page copy templates).
6. `strategy/workbooks/04-building-your-funnels.md` (page-by-page build spec, your primary source for WHAT to build).
7. `strategy/workbooks/05-creating-your-movement.md` (manifesto, framework name "The Playbook", Verified Builders identity, milestone awards).
8. `strategy/workbooks/06-creating-belief.md` (Four Core Stories used as engine pushback inside the Playbook).
9. `strategy/workbooks/07-10x-secrets-one-to-many.md` (Big Domino, Three Secrets, Stack, Closes for the $49 sales page long-form).
10. `strategy/workbooks/08-your-dream-customer.md` (the Dream 100 list that seeds Playbook Step 5 outreach targets).
11. `strategy/workbooks/09-fill-your-funnel.md` (launch channels X + Indie Hackers + Reddit; JK5 publishing plan).
12. `strategy/workbooks/10-growth-hacking.md` (Funnel Hub build alongside launch; Phase 2/3 growth map).

Confirm you have read all twelve. Then proceed.

### Tech stack

- Frontend: Next.js 14 App Router with TypeScript and Tailwind. (Lovable as alternative for page surfaces.)
- Backend: Supabase (auth + postgres). Default for fastest setup.
- Payments: Stripe. Subscriptions for the $49 tier, one-time charge for the $1 Starter. Stripe webhooks for the guarantee verifier.
- AI: Anthropic Claude API for the in-product Playbook engine (the pushback, the AC extraction, the offer assembly, the outreach copy generation). Default model: claude-sonnet-4.
- Hosting: Vercel.
- Email: Resend (or Postmark) for the Soap Opera + Seinfeld sequences.
- Auth: Supabase Auth (email magic link).
- Domain: unlocksaas.com (purchased via Namecheap, point DNS to Vercel).

### Build sequence (one funnel at a time, per Brunson Secret #26)

Build in this exact order. Do not parallelize.

1. **Funnel Hub (homepage at unlocksaas.com).** Small static page. Build first because every other piece links to it. Spec in `strategy/workbooks/10-growth-hacking.md` Section 1.
2. **$1 Starter Unboxing Funnel.** Front door for the offer. End to end, with live Stripe.
3. **Free Diagnostic Lead Funnel.** Squeeze + result page + 5-email Soap Opera.
4. **$49/mo Playbook Presentation Funnel.** Long-form sales page consuming workbook 07 (Big Domino, Three Secrets with Story-Strategy-Case Study, full Stack and Closes inventory), then onboarding, then the 7 Playbook steps.

After each funnel is end-to-end live (or demoable on staging with test-mode Stripe), pause and ask the operator to review before starting the next.

### Hard rules (non-negotiable)

1. **The framework lives in the engine, not in forms.** No in-product step may become a 14-field form. Each Playbook step is a guided conversation. The user answers 1 to 5 human questions per step. The engine assembles the framework output. Engine question maps live in workbooks 01 Section 6, 03 Engine Implications, 04 Section 2 and Section 6, 06 Section 6, and 07 Section 6.
2. **Reluctant Hero voice on every surface.** Voice samples in workbook 01 Section 6. Manifesto in workbook 05 Section 7. Every header, button, email, and confirmation message uses this voice.
3. **Stripe is the only proof.** Do not invent in-app "success" metrics. The guarantee verifier reads Stripe. First paying customer is detected by a webhook reading the user's connected Stripe account.
4. **The 60-day guarantee is playbook-verifiable.** See `strategy/state.json` `dotcom_secrets.offer_stack.guarantee` for work conditions and remedy. Refund logic is automated. Encode the in-product milestones (Dream Customer Pinned, Offer Locked, AC Defined, Copy Generated, Outreach Assets Generated, 20 Outreach Actions Logged) and gate refund eligibility on them.
5. **Outreach happens in-tool (Playbook Step 5).** Cold email sends and tracks natively (user connects their inbox). Other channels (Indie Hackers, r/SaaS, X, Lovable Discord, etc.) generate copy + log the public link after the user posts it manually. Verify the link is live. Never auto-post to social platforms.
6. **The $1 Starter delivers Playbook Steps 1 and 2 only.** Steps 3 through 7 are locked behind the $49 tier. Restraint is the discipline.
7. **The $49 sales page MUST consume workbook 07.** Big Domino slide block at the top, Three Secrets with Story-Strategy-Case Study, Stack slides 16 to 30 as a vertical block (not a single table row), 16 mini-closes from workbook 07 Section 3.
8. **Playbook Step 5 MUST consume workbook 08.** The Dream 100 list (`strategy/state.json` -> `traffic_secrets.dream_100`) is what the engine picks outreach targets from. The 20 actions for the guarantee come from the top 20 most-relevant entries given the user's niche.
9. **No artificial scarcity, ever.** No countdown timers, no "only X seats left," no fake urgency. Workbook 07 Section 3 Category 4 is rejected. The stake close carries the urgency message.
10. **The Verified Builders identity ships from day one.** Manifesto on the about page (full) and homepage (half). Milestone badges visible in the Playbook sidebar. Badge name "Verified Builder" is provisional; A/B test against "Paid Builder" on the Free Diagnostic email form. Whichever wins ships.

### First sprint (Week 1), concrete deliverables

By end of week one, on a staging URL:

1. Project scaffolded (Next.js + Supabase + Stripe + Claude API + Resend wired).
2. The Funnel Hub homepage live at staging.unlocksaas.com: hero, three CTAs, manifesto, founder intro video placeholder, social links. Workbook 10 Section 1.
3. The $1 Starter sales page live, with copy from workbook 03 Script 3 (Star Story Solution) plus the Verified Builders identity language from workbook 05.
4. Stripe one-time $1 checkout working in test mode.
5. The OTO page with workbook 03 Script 4 copy: two buttons, one decision.
6. Member area shell with sidebar showing all 7 Playbook steps (1 and 2 unlocked, 3 through 7 locked) and the milestone badges from workbook 05 Section 7.
7. Playbook Step 1 (Dream Customer) as a guided conversation with the five questions from workbook 04 Section 2. Engine pushback on vague answers using Internal Belief rewrites from workbook 06 Section 4.
8. Playbook Step 2 (Offer) similarly with the four questions.
9. End-to-end smoke test: a real test user pays $1, lands in the member area, completes Steps 1 and 2 with engine pushback engaging at least once, exits with a finished WHO and WHAT.

Ship this end-to-end before touching anything else.

### Sprint 2 (Week 2 to 3), Free Diagnostic + Soap Opera

1. Free Diagnostic squeeze page (workbook 04 Section 3, copy from workbook 03 Script 2).
2. Diagnostic result page returning one of three labels (Wrong Person, Weak Offer, Weak Belief) using Claude API.
3. 5-email Soap Opera Sequence (workbook 04 Section 5) wired through Resend with day-based delays.
4. Free Diagnostic to $1 Starter handoff working.

### Sprint 3 (Week 4 onward), $49 Playbook + Long-form Sales Page + Steps 3-7

1. $49 sales page consuming workbook 07 in full: Big Domino slides 1-6, Three Secrets, Stack slides 16-30, Closes block, founder video, FAQ, disqualifying copy.
2. $49 Stripe subscription checkout with 60-day guarantee block above the button.
3. Onboarding flow: connect Stripe, import from $1 Starter, set 60-day clock.
4. Playbook Step 3 (Attractive Character) using the engine extraction spec from workbook 01 Section 6 + Four Core Stories generator from workbook 06 Section 6.
5. Playbook Step 4 (Copy) using workbook 03 templates.
6. Playbook Step 5 (Outreach Assets + Target List) consuming the Dream 100 from workbook 08.
7. Playbook Step 6 (Do Outreach) with the send-vs-track loop from workbook 04 Section 6.
8. Playbook Step 7 (Convert + Verify) with the Stripe webhook listener from workbook 04 Section 7.
9. Seinfeld Sequence (workbook 08 Section 6) for post-Day-5 nurture.
10. First Paying Customer Verified celebration + shareable Verified Builder badge (workbook 10 Section 5 butterfly play #2).

### Engine extraction pattern (use this for every Playbook step)

```
For each step:
  - Display a short Reluctant Hero intro paragraph.
  - Ask 3 to 5 human questions, one at a time, with progress indicator.
  - Validate each answer:
     - if vague (category-not-person, feature-not-result, generic platitude),
       respond with a specific pushback in voice, drawing from workbook 06 Section 4's Internal/External rewrites.
     - if specific, accept and proceed.
  - On completion: call Claude API with a step-specific prompt that takes the user's answers + the locked framework knowledge + the AC voice samples, and returns the assembled output.
  - Display the output in editable form.
  - Save to user's project state in Supabase.
  - Fire the corresponding milestone badge (workbook 05 Section 7).
  - Unlock next step (if tier permits).
```

### Database schema (start with this)

```
users                  (Supabase Auth handles)
projects               (one per user, named, current_step pointer, niche, identity_choice)
project_state          (jsonb, mirrors state.json: dream_customer, offer, ac, scripts, outreach, conversions, badges_earned)
outreach_actions       (project_id, channel, target_from_dream_100, message_sent, public_link, verified_live, response_received, converted, timestamps)
stripe_connections     (project_id, stripe_account_id, connected_at)
verified_conversions   (project_id, stripe_charge_id, amount, detected_at)
dream_100_entries      (per-project Dream 100; seeded from workbook 08 for own niche, custom for others)
soap_opera_subscribers (email, source, current_day, status)
ab_tests               (key, variant, conversion_event, timestamp)
```

### What "done" looks like for v1 launch

- A real founder lands on unlocksaas.com, takes the Free Diagnostic, gets a labeled result, enters the 5-email Soap Opera.
- They buy the $1 Starter. They finish their dream customer and their offer (Playbook Steps 1 and 2) with engine pushback that improved their answers.
- They see the OTO and either upgrade to $49/mo (60-day clock starts, full Playbook unlocks) or walk away with a complete small win.
- The $49 sales page is live with the full Perfect Webinar Lite structure from workbook 07.
- Playbook Step 5 generates a real 20-target outreach list from the Dream 100. Step 6 tracks sends. Step 7 listens for first Stripe charge.
- The 60-day clock and refund logic are tested end-to-end with a fake-payment scenario.
- The Reluctant Hero voice and Verified Builders identity are unmistakable across every surface.

### Open items to flag to the operator

1. Confirm Verified Builders vs Paid Builders via the email-form A/B test.
2. Fill 10 specific Category 2 influencer names in the Dream 100.
3. Create `strategy/dream-100.csv` from the workbook 08 seed.
4. Re-mine the 10+ founder conversations for exact dollar-objection language.
5. Hooks in workbook 01 Section 5 are v1 drafts. Test in market and swap.
6. Section 4 Story's Result beat is honest by design. Upgrade once Stripe shows a real customer.
7. Funnel-hacking targets (workbook 10 Section 9) for Phase 2: Lovable, ClickFunnels, one Indie Hackers micro-SaaS at $29 to $99/mo.

### Communication protocol

After completing each numbered step in any sprint, write a short status update to `build-log.md` at the project root (create if it does not exist). One paragraph per step. Note what shipped, what is staging-only, what is blocked.

Do not delete files in `strategy/`. You may create new files anywhere. Update existing files only with explicit user approval.

Begin.

---

## End of prompt block

## Notes for the operator (Maryan)

- The prompt above is self-contained. Claude Code will not need anything else to begin.
- First sprint is 5 to 7 working days for a competent solo developer using Claude Code as a pair.
- Hardest two components: (1) Playbook Step 5 (the outreach send-vs-track loop and the Dream 100 picker), (2) Stripe webhook + 60-day guarantee refund logic.
- Stop after the $1 funnel is live. Run it on yourself. If you cannot finish a real dream customer and a real offer using your own tool in 30 minutes, the engine pushback is wrong. Fix it before building further.

## When to come back to me (Brunson Architect)

- After the $1 funnel is live and you have your first 10 real users.
- If sales-page conversion is under 1%: Hook or Story problem (workbook 01 Sections 4 and 5).
- If sales-page conversion is over 5% but the OTO is under 10%: Script 4 problem (workbook 03).
- If users hit Playbook Step 5 (outreach) and stall: the avoidance disease (workbook 06 Section 4 External rewrite #3).
- If you hit 3 verified customer cycles, fire Phase 2 (workbook 10 Section 6).
- If you hit 50 paying customers, fire Phase 3.

Good. Go build.
