# Claude Code Resume Prompt: Unlock SaaS (Sprint 4 + Operator-Blockers Sweep)

## How to use this file

Open `unlocksaas/` in Claude Code. Start a fresh session. Paste the prompt block below between the horizontal rules. Hit enter. Claude Code will read the strategy, the build-log, and the existing code, then work the task list end to end.

This prompt assumes the prior Claude Code session shipped Sprints 1, 2, and 3 (everything documented in `build-log.md`). It does NOT re-build anything that already shipped. It closes the open follow-ups, regenerates stale types, applies the pending Supabase migration, wires the last two localStorage-to-server gaps, and gets the next prod deploy clean and green.

All paths are relative to the project root.

---

## THE PROMPT (copy everything between the lines)

---

You are resuming work on Unlock SaaS at unlocksaas.com. The strategy is locked in `strategy/`. Sprints 1, 2, and 3 are shipped. Your job is the Sprint 4 follow-ups plus the open items the last session left for the operator (the ones a coding agent can close without founder input).

Before you write a single line of code, read these files in order. Confirm in chat that you have read each one:

1. `00-RESUME-HERE.md`
2. `strategy/state.json` (the `founder_open_items_pre_launch`, `founder_open_items_post_launch`, and the full `expert_secrets.movement.identity_label.infrastructure` block matter here)
3. `strategy/BUILD-PROMPT-CLAUDE-CODE.md` (only the Hard Rules section and the Engine Extraction Pattern; everything else is historical)
4. `build-log.md` (full file; it tells you what shipped, what is staging-only, what the operator was asked to do next)
5. `strategy/workbooks/04-building-your-funnels.md` Sections 6 and 7 (outreach loop and convert/verify spec)
6. `strategy/workbooks/05-creating-your-movement.md` Section 7 (Verified Builders identity, milestone badges)
7. `strategy/workbooks/10-growth-hacking.md` Section 5 (Verified Builder share play)

### Hard Rules carried forward (re-read before each task)

These are the same Hard Rules from the original BUILD-PROMPT. They are non-negotiable. If a task in the list below conflicts with one of them, stop and ask the operator.

1. Framework lives in the engine, not in forms.
2. Reluctant Hero voice on every surface.
3. Stripe is the only proof. No invented success metrics.
4. The 60-day guarantee is machine-verifiable. Refund logic is automated.
5. Outreach happens in-tool. Never auto-post to social platforms.
6. The $1 Starter delivers Machine Steps 1 and 2 only.
7. The $49 sales page MUST consume workbook 07.
8. Machine Step 5 MUST consume workbook 08 Dream 100.
9. No artificial scarcity, ever.
10. Verified Builders identity ships from day one. The Verified vs Paid Builders A/B (cookies, beacons, Stripe metadata, SQL read query) is LIVE in code per the last session. Do not retire either variant. Do not change the read query. Do not change the convergence threshold of ~200 exposures per variant.

### Out of scope (do not touch these)

- Anything in `strategy/`. No edits. Reading only.
- The Reluctant Hero voice across existing pages. Do not "polish" copy.
- The hooks in workbook 01 Section 5. The operator will test those in market and swap.
- Workbook 01 Section 4 Story Result beat. The operator will upgrade it after the first real Stripe customer.
- The PostHog project setup (the operator does that). Your job ends at making sure the env-var contract and the event names in code match what `setup-posthog-key.py` writes and what the funnel sequence in the build-log expects.
- Filling rows 31-40 of `strategy/dream-100.csv` (founder judgment, not yours).
- The private 10-conversation dollar-objection re-mine (requires founder-authenticated MCP).

### Task list (work in this exact order, end-to-end-test each before moving on)

#### Task 1: Apply the pending Supabase migration in production

The migration `supabase/migrations/20260517020000_builder_badges.sql` is in the repo but the last session noted it is not yet applied in prod. Without it, `/machine/verified` and `/builder/[slug]` no-op, the OG image route returns 404, and the after-INSERT trigger on `verified_conversions` does not mirror `first_customer_at` into `profiles`.

Steps:
1. Confirm the migration is still pending: `supabase migration list` against the linked prod project.
2. Apply with `supabase db push` (or via the Supabase dashboard if CLI is not authenticated, in which case ask the operator for a one-time login).
3. Verify in prod: `select column_name from information_schema.columns where table_name='profiles' and column_name in ('builder_slug','builder_name','product_name','product_url','share_visibility','first_customer_at');` should return all six.
4. Verify the public view: `select * from builder_badges limit 0;` should succeed under the anon role.
5. Verify the trigger exists: `select tgname from pg_trigger where tgrelid = 'verified_conversions'::regclass;` should list the insert trigger.

Done criterion: the migration is in `supabase migration list` as applied. Append a note to `build-log.md` under a new heading `## Sprint 4, Task 1: Builder Badges migration applied`.

#### Task 2: Regenerate `app/src/lib/database.types.ts` from the live schema

The previous session left `as never` and `as unknown` casts in three places, each marked `TODO: regen database.types.ts`. Find them with: `rg -n "TODO: regen database.types.ts" app/src`. Expect hits in:

- `app/src/app/api/cron/soap-opera/route.ts` (the `current_day` vs `emails_sent` drift)
- `app/src/app/api/webhooks/stripe/route.ts` (the `diagnostic_leads.converted_to_starter_at` drift)
- `app/src/app/api/soap-opera/subscribe/route.ts` (same family)

Steps:
1. `supabase gen types typescript --linked > app/src/lib/database.types.ts`. If `--linked` is not authed, ask the operator.
2. Remove every `as never` and `as unknown as { ... }` cast that the TODO comment points to. Replace with the correctly typed payload.
3. Remove the `TODO: regen database.types.ts` comments.
4. `cd app && npx next build`. The build MUST be green with no type errors.

Done criterion: zero matches for `TODO: regen database.types.ts` in `app/src`, and `next build` clean.

#### Task 3: Wire `outreach-log.tsx` to `/api/outreach` (server-backed)

Today the outreach log persists in localStorage. The server endpoints `/api/outreach` (GET list, POST log) and `/api/outreach/verify-link` already exist and are authoritative for the 20-action milestone. The component is the only missing leg.

Steps:
1. Read `app/src/app/(app)/machine/step/[id]/outreach-log.tsx` and the two API routes to understand the existing contracts.
2. Replace localStorage reads with a SWR-style fetch from `/api/outreach` on mount, keyed by `project_id`.
3. Replace localStorage writes with `POST /api/outreach` on submit. Optimistic UI is fine; reconcile from the response.
4. When the user pastes a public link, call `POST /api/outreach/verify-link` and reflect `verified_live` in the row.
5. Drop the localStorage code entirely. No fallback. Server is the only source of truth.
6. Keep the "X of 20 logged" counter, but read the count from the API response. The server already fires `twenty_outreach_actions_logged` idempotently when count hits exactly 20; do NOT fire it client-side.
7. Verify analytics: `MachineOutreachLogged` (or whatever the existing event name is in `app/src/lib/analytics/events.ts`) still fires per action. Do not duplicate the milestone event.

Done criterion: open `/machine/step/6` in two different browsers signed in as the same user, log an action in one, refresh the other, the action appears. `next build` clean. Append to `build-log.md`.

#### Task 4: Persist engine-assembled outputs to `project_state`

Steps 1 through 5 assemble outputs and currently cache them in localStorage. The Sprint 3 follow-up note says: persist to `project_state` JSONB columns so WHO, WHAT, VOICE, COPY, OUTREACH ASSETS survive logout and device change.

Steps:
1. Read the existing `project_state` schema (look at the earliest migrations and the database.types.ts after Task 2 regen). Confirm columns exist for `dream_customer`, `offer`, `ac`, `scripts`, `outreach`, `conversions`, `badges_earned`. If a column is missing for any step output, add a new migration in `supabase/migrations/` named `20260517030000_project_state_engine_outputs.sql` to add only the missing JSONB columns. Do NOT rewrite existing ones.
2. In the engine route `app/src/app/api/engine/route.ts`, after the assembled output is generated for each step, write it to the corresponding `project_state` field via the service-role Supabase client.
3. In `app/src/app/(app)/machine/step/[id]/page.tsx`, on mount, read prior step outputs from `project_state` instead of localStorage when building the `needsPriorOutputs` preambles for Step 4 and Step 5.
4. Keep localStorage as a transient editor buffer ONLY (so the user does not lose their in-progress edits to the assembled output before saving). On save, the JSONB is the source of truth.
5. Backfill helper: if a project has localStorage data but no `project_state` row, write the localStorage data to `project_state` on first save. Do NOT do a silent migration on mount.

Done criterion: clear localStorage in the browser, log out, log back in, the assembled outputs from Steps 1, 2, 3, 4, 5 are still there. `next build` clean. Append to `build-log.md`.

#### Task 5: Register the Stripe Connect webhook for `charge.succeeded`

The celebration flow only fires when a `charge.succeeded` event arrives from a CONNECTED account (the user's Stripe). The existing endpoint `we_1TXqTQCwGoUDklReXjsqFUML` is platform-side and does not have `connected_account_id` enabled.

Steps:
1. Decide between (a) enabling `connected_account_id` on the existing endpoint, or (b) registering a new endpoint at the same URL `https://unlocksaas.com/api/webhooks/stripe` scoped to Connect with event `charge.succeeded`. Recommended: option (b), so platform-side and Connect-side signing secrets stay independent.
2. Use the Stripe MCP if connected, or the Stripe CLI: `stripe webhook_endpoints create --url https://unlocksaas.com/api/webhooks/stripe --connect --enabled-events charge.succeeded,charge.refunded`.
3. Copy the new endpoint's signing secret to `STRIPE_CONNECT_WEBHOOK_SECRET` and push to Vercel: `vercel env add STRIPE_CONNECT_WEBHOOK_SECRET production` (then preview + development). Mark `--sensitive` on production and preview.
4. Update `app/src/app/api/webhooks/stripe/route.ts` to verify the signature against `STRIPE_CONNECT_WEBHOOK_SECRET` when `event.account` is present (the existing handler branch already routes by `event.account`; only the secret check needs to be split).
5. End-to-end test in test mode: `stripe trigger charge.succeeded --connected-account acct_TEST` against a seeded `stripe_connections` row should write a `verified_conversions` row, fire `FirstCustomerVerified` to PostHog (if PostHog is live), send the celebration email, and flip the sidebar badge.

Done criterion: a triggered Connect `charge.succeeded` lands cleanly in dev with no signature errors. Append to `build-log.md`.

#### Task 6: End-to-end test the Starter to Core upgrade and tier gating

The layout's `unlockedSteps` keys off `profiles.tier`. The OTO route exists. Last session noted this path needs full end-to-end verification.

Steps:
1. In test-mode Stripe, simulate a user buying the $1 Starter, landing in the member area, completing Steps 1 and 2, hitting the OTO, upgrading to $49/mo.
2. After the subscription webhook fires, confirm `profiles.tier = 'core'` and Steps 3 through 7 unlock in the sidebar.
3. Negative case: confirm a `tier = 'starter'` user CANNOT navigate directly to `/machine/step/3` (the layout should redirect to `/machine` or render a locked state, not the step content). If the redirect is missing, add it in the layout.
4. Capture the test results in `build-log.md` with the Stripe test customer email and the subscription ID.

Done criterion: both positive and negative cases pass. Append to `build-log.md`.

#### Task 7: Smoke-test `/machine/verified` and `/builder/[slug]` in dev

After Task 1 is done, the celebration flow renders real data. Validate end to end before pushing.

Steps:
1. While signed in as a dev user with no verified conversions, visit `/machine/verified`. Expect the NO_CONVERSION_YET state with the dev-only "simulate verified customer" form.
2. Submit the simulate form. Expect: row in `verified_conversions`, celebration email sent (check Resend logs), redirect or refresh to the VERIFIED state showing amount + customer + date + charge id.
3. Fill the share-settings form (display name + product name + product URL + visibility = public). Expect a `builder_slug` allocated on first flip to public.
4. Visit `/builder/<slug>` in an incognito window. Expect the public Verified Builder card, the manifesto excerpt, the quiet UnlockSaaS attribution.
5. Visit `/builder/<slug>/opengraph-image`. Expect the 1200x630 dark-theme PNG.
6. Re-flip visibility to private. Expect `/builder/<slug>` to 404.

Done criterion: all six checks pass. Append a short note to `build-log.md` with screenshots saved under `logs/sprint-4/`.

#### Task 8: Get the next prod deploy green

The last two prod deploys failed in ERROR (Stripe SDK v22 type drift), not BLOCKED (account-level). The Stripe drift was patched. After Tasks 1 through 7, the codebase should deploy clean. Confirm.

Steps:
1. `cd app && npx next build`. Must be clean. Fix any new errors before pushing.
2. Lint: `npx next lint`. Must be clean or each warning explicitly suppressed with a comment explaining why.
3. Push to `main`. Watch the Vercel deploy logs (via Vercel MCP if connected, else CLI `vercel logs <deploymentId>`).
4. If the deploy lands READY: visit `https://unlocksaas.com/` and confirm the homepage, the Verified Builders identity copy (SSR default), the funnel-hub CTAs.
5. Confirm the cron schedule registered: in `app/vercel.json` the Soap Opera (14:00 UTC) and Seinfeld (15:00 UTC) cron jobs should be listed. Vercel dashboard should show both.
6. If the deploy fails: read the build log, fix the cause, push again. Do NOT skip type errors with `// @ts-ignore`. If you cannot fix the type cleanly, stop and report to the operator.

Done criterion: a green prod deploy AND the cron jobs visible in the Vercel dashboard. Append a Sprint 4 close-out summary to `build-log.md` with the deployment id and commit sha.

#### Task 9: Verify the PostHog event contract (no PostHog account needed)

The operator will create the PostHog account and run `scripts/setup-posthog-key.py`. Your job is to make sure the events the code FIRES match the funnel sequence in the build-log so the operator can plug the keys in and see the funnel populate immediately.

Steps:
1. Read `app/src/lib/analytics/events.ts`. Confirm every event in this sequence is exported with the exact string name expected by PostHog: `funnel_hub_viewed`, `starter_page_viewed`, `starter_checkout_clicked`, `starter_purchased`, `oto_page_viewed`, `oto_upgrade_clicked`, `machine_subscribed`, `machine_step_started`, `machine_step_completed`, `first_customer_verified`.
2. For each event, grep the codebase to confirm at least one fire site exists. Use: `rg -n "Event\.(FunnelHubViewed|StarterPageViewed|...)"` etc.
3. If any event is missing a fire site or named differently than the funnel expects, fix the fire site (not the funnel sequence). Document any rename in `build-log.md`.
4. Do NOT set `NEXT_PUBLIC_POSTHOG_KEY` yourself. The operator will.

Done criterion: every event in the funnel sequence has at least one fire site with the exact expected name. `next build` clean. Append to `build-log.md`.

### Engine and database invariants (do not violate)

- Row Level Security policies in `20260516224236_0004_enable_rls_and_policies.sql` and the rehardening in `20260516225408_0008_reharden_after_billing_clobber.sql` are tuned. Adding a new column via the Task 4 migration must NOT broaden those policies.
- The `verified_conversions` table is the single proof source for the guarantee. Do not write to it from any path other than the Stripe webhook (Task 5) or the dev-only simulate form on `/machine/verified` (guarded by `NODE_ENV !== 'production'`).
- The `twenty_outreach_actions_logged` milestone fires server-side when the count hits exactly 20. Never fire it client-side. Never fire it twice.
- `builder_slug` is unique. The collision retry logic lives in `app/src/lib/builder-badge.ts`. Do not duplicate it.

### Communication protocol

For every task above:
1. Before you start, write a one-line plan to the chat ("Task N: ...").
2. After it ships, append a paragraph to `build-log.md` under a heading `## Sprint 4, Task N: <title>`. State what changed, what files moved, what is verified, what is blocked.
3. If a task surfaces a question only the operator can answer, STOP. Do not guess. Post the question in chat with the smallest possible context the operator needs to decide.

### Files you are allowed to modify

- Anything under `app/src/`
- Anything under `supabase/migrations/` (new migrations only; do NOT edit existing ones)
- `app/package.json` (only to add dependencies you actually need)
- `build-log.md` (append-only)
- `app/vercel.json` (only if a new cron or env var requires it)

### Files you must NOT modify

- Anything under `strategy/`
- `README.md`
- `00-RESUME-HERE.md`
- `CLAUDE-CODE-RESUME-PROMPT.md` (this file)
- `projects.json`

### When you finish

Write a final summary to chat with:
1. Tasks completed, with a one-line "what changed" each.
2. Tasks blocked, with the blocker named.
3. The current state of the next deploy (commit sha + Vercel deployment id + status).
4. A short list of follow-ups the operator must now do (PostHog signup, fill rows 31-40 of dream-100, private-conversation re-mine, the post-launch A/B read, hooks-in-market test, Story result-beat upgrade after first real customer).

Begin.

---

## End of prompt block

## Notes for the operator (Maryan)

- This prompt does not regenerate strategy. It only closes engineering follow-ups and operator-blockers a coding agent can finish.
- Tasks 1, 2, 5, 8 require credentials (Supabase CLI, Stripe CLI or Stripe MCP, Vercel CLI). If Claude Code asks you to log in to one of these, do it once and let it continue.
- Task 5 will move a small amount of real config in Stripe (new Connect webhook endpoint). It will NOT execute trades, charges, or transfers.
- If Claude Code stops on a "question only the operator can answer," answer it in chat. The session preserves context.
- After the session ends, run a smoke test yourself: visit the staging URL, submit your own email to the Free Diagnostic against any fake product URL, confirm you get Email 1 within seconds.

## Self-audit on this prompt

- The task list is built from the explicit "operator next steps" and "What is still TODO for Sprint 4" sections of `build-log.md` plus the `founder_open_items_pre_launch` and `founder_open_items_post_launch` in `state.json`. I did not read every line of the 69 KB build-log; a later log entry could have already closed Task 1, 2, 3, 4, 5, 6, 7, or 9. If a task is already done when Claude Code checks, it should skip it and note "already shipped" in the build-log update.
- Task 4 assumes the `project_state` columns named in the original BUILD-PROMPT (`dream_customer`, `offer`, `ac`, `scripts`, `outreach`, `conversions`, `badges_earned`) are still the schema. If the live schema diverged, Claude Code should add only the missing columns via a new migration, not rewrite existing ones.
- Task 5 assumes the existing platform-side webhook endpoint id (`we_1TXqTQCwGoUDklReXjsqFUML`) is still the one in use. If Stripe shows a different active endpoint id, Claude Code should use whatever is live, not the id from the build-log.
- The Stripe CLI command in Task 5 (`stripe webhook_endpoints create ... --connect ...`) is from memory of the Stripe CLI; the exact flag name (`--connect` vs `--connect-only` vs a `connect` boolean) may have changed in recent CLI versions. Claude Code should run `stripe webhook_endpoints create --help` first.
- The Supabase CLI commands (`supabase migration list`, `supabase db push`, `supabase gen types typescript --linked`) are the standard Supabase CLI v1.x interface. If the project uses a different CLI version, syntax may differ slightly.
- I did not verify which PostHog event names are actually exported today in `app/src/lib/analytics/events.ts`. Task 9's expected names come from the funnel sequence Maryan was told to configure in the build-log. If the code uses different names, Task 9 is the place to reconcile.
