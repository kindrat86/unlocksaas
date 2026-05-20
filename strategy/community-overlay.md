# Verified Builders Community Overlay

**Status:** shipped 2026-05-21 (gate + audit + invite email + onboarding card).
**Framework source:** Isenberg overlay (memory: `project_unlocksaas_isenberg_playbook.md`),
specifically "Community is the new moat – products copy, communities don't."
**Brunson impact:** none. Offer, price, avatar, value ladder all unchanged. This
overlay wraps the existing Core tier with a room; it does not rewrite the deal.

## What shipped

1. **Migration** `supabase/migrations/20260521000010_community_access.sql`
   - `profiles.community_access_granted_at`, `community_access_revoked_at`,
     `community_invite_sent_at`, `community_invite_sent_count`.
   - New table `community_access_events` (append-only audit log).
   - Partial index for "live access" operator query.
   - RLS: events table locked from end-user reads.

2. **Helper** `app/src/lib/community.ts`
   - `grantCoreCommunityAccess()` / `revokeCoreCommunityAccess()` – idempotent,
     defensive (works pre- and post-migration).
   - `scheduleGrantForCheckout()` / `scheduleRevokeForCustomer()` – `after()`-
     wrapped webhook glue so billing returns 200 immediately.
   - `getCommunityCardState()` – read-only state for the /onboarding card.
   - `detectCommunityPlatform()` – infers Skool / Discord / other from URL host.

3. **Email** `app/src/lib/community-invite-email.ts`
   - Reluctant Hero voice, Maryan signature, no em dashes.
   - Platform-aware copy ("It is a Discord server" / "It is a Skool community").

4. **Webhook wiring** `app/src/app/api/webhooks/stripe/route.ts`
   - `handleCheckoutSessionCompleted` (Core branch) schedules grant.
   - `handleInvoicePaymentSucceeded` (first invoice) schedules grant as safety
     net for dropped checkout events.
   - `handleSubscriptionDeleted` schedules revoke.

5. **Onboarding card** `app/src/app/(app)/onboarding/page.tsx`
   - New "Join the Verified Builders room" card (4th in the sequence).
   - States: configured-and-granted (Step Into Room button), configured-pending
     (Resend invite form), unconfigured (operator placeholder).

6. **Env var** `app/.env.local.example`
   - Added `COMMUNITY_INVITE_URL` template entry with operator notes.

## What is intentionally NOT in scope

- **Platform selection (Skool vs Discord).** The operator (Maryan) picks at
  runtime by pasting the invite URL into Vercel env. No code change required to
  flip platforms. Reasoning: cost-conscious pre-revenue (Discord = $0 vs Skool
  = $99/mo), and the audience (Marco, technical post-launch pre-revenue) is
  more likely to already be on Discord. Skool's gamification advantage matters
  more at 50+ members – revisit then.
- **Bot-driven auto-add on grant / auto-remove on revoke.** Manual operator
  removal is fine while cohort < 50. The audit table makes weekly sweeps
  trivial. Revisit when retention math says automation pays for itself.
- **Sales page copy update.** "Join the Verified Builders room" is implied by
  the Core deliverable list, but the explicit copy change to /core and
  /founding lives in a separate revision (Brunson-locked surfaces don't auto-
  rewrite from an Isenberg overlay).

## Operator runbook

1. **Pick the platform.** Skool (skool.com/<name>) or Discord (discord.gg/<code>).
2. **Create the room.** One welcome channel + one "what's working" channel is
   enough to start.
3. **Apply migration.** Supabase Dashboard → SQL Editor → paste contents of
   `supabase/migrations/20260521000010_community_access.sql`.
4. **Set env var.** Vercel Dashboard → Settings → Environment Variables. Add
   `COMMUNITY_INVITE_URL` with the invite URL for production + preview +
   development. (CLI bug `vercel env add preview` is broken per memory; use
   dashboard or REST API.)
5. **Test.** Trigger a Core checkout with a test card. Confirm the webhook log
   shows `[community] grant recorded`, the email arrives, and the onboarding
   card flips to "Step into the room".
6. **Weekly revoke sweep.** Query `select email, created_at from
   community_access_events where event_type = 'revoked' and created_at > now()
   - interval '7 days';` and remove those members from the room manually.

## When to upgrade this overlay

Promote this from "advisory overlay" to "locked strategy memory" when:
- Core has 25+ active subscribers AND
- The room generates measurable retention lift OR a Verified Builder posts a
  first-paying-customer story that sells the next 5 Core seats.

At that point, write `project_unlocksaas_community.md` (locked memory) and
either build the auto-add/auto-remove bot or migrate to Skool for the
gamification engine.
