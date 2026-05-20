# Indie-Search Companion Essay — Re-engagement Broadcast

**Project:** UnlockSaaS
**Artifact:** [`/four-indie-search-engines`](https://unlocksaas.com/four-indie-search-engines) (shipped 21-05-2026)
**Status:** DRAFT. Wiring path documented below; operator-driven send.
**Sender identity:** `maryan@unlocksaas.com`, friendly From "Maryan from UnlockSaaS," signed "– Maryan"
**Target list:** 36 paused FunnelFixer carry-over subscribers (per `MEMORY.md` → FunnelFixer carry-over list).

---

## Why this exists

The 36 paused subs in `soap_opera_subscribers` (with `source LIKE 'funnelfixer_%'`, status `paused`) are the warmest off-Stripe list UnlockSaaS has. They already said yes once. Brunson Soap Opera Sequence Secret #17: the cheapest customer is the one who already raised a hand. Re-engaging them with a values-match story costs nothing and gives the highest-density signal of any send.

This is **NOT** a new SOS sequence. The existing 5-email SOS (`app/src/lib/soap-opera/emails.ts`) carries its own state machine and the FunnelFixer testimonial-farm campaign downstream. Adding a 6th email would risk both. This is a **one-shot broadcast** to the carry-over cohort specifically – Brunson "Seinfeld email" form: a story-driven update from the founder, no offer push, soft CTA to the new artifact.

Editorial discipline: this broadcast does NOT mention pricing, the Playbook, the $1 starter, or any monetary offer. The only link is to the companion essay, which carries its own diagnostic CTA. The Brunson principle is that re-engagement emails are about **re-establishing presence**, not closing.

---

## Wiring path

The existing SOS dispatcher (`app/src/lib/soap-opera/dispatch.ts`) reads from the `soap_opera_subscribers` table and walks email indices 1-5. A 6th email is not supported and would require a schema migration + cron extension.

The cleanest send path that does NOT touch the existing infrastructure:

1. **Query the carry-over cohort directly** via Supabase SQL:
   ```sql
   SELECT email FROM soap_opera_subscribers
   WHERE source LIKE 'funnelfixer_%'
     AND status = 'paused'
     AND unsubscribed_at IS NULL;
   ```

2. **Send the broadcast via Resend** using the existing `app/src/lib/email/*` infrastructure (the same transactional sender the SOS uses). One-shot batch send with the body below; do NOT alter the SOS state for any subscriber.

3. **Log the send** to a tracking row (suggested: a new `re_engagement_broadcasts` table, or just a row in `strategy/state.json`). Track delivered / opened / clicked counts via Resend webhooks.

4. **Honor unsubscribes** by reading the existing `unsubscribed_at` and `soap_opera_subscribers.unsubscribed_at` columns before sending. Anyone with a non-null value is skipped silently.

**Hard constraint:** do not advance the subscriber's SOS email index. They remain `paused` after this broadcast. If a recipient clicks through and converts to a Stripe payment, the existing testimonial-farm campaign can engage them on the next event boundary (Stripe webhook).

**Manual alternative if the wiring is too invasive:** export the cohort to CSV, send the broadcast via Resend's dashboard "send to list" feature, paste the body below. Same outcome, zero code change. Recommended for v1 unless this exact broadcast shape is expected to recur.

---

## §1 The broadcast email

### Subject line
Three drafts to A/B if Resend supports it (it does, on the Broadcasts dashboard). If picking one, ship **A**.

**A (curiosity / counter-intuitive):**
> Why I shipped UnlockSaaS to four search engines no one uses

**B (founder-update / lower-key):**
> Quick update from UnlockSaaS – the indie-search bet

**C (specifics-first):**
> Four search engines, 1% share each, and the math that says I'm right

### Preheader (the inbox preview line under the subject)
> Yesterday I added four lines to robots.txt. By any sales-letter math, this was a waste of an afternoon. Here's why I bothered.

### Body

```
Hey,

It's Maryan from UnlockSaaS. A while back you signed up at FunnelFixer
before I closed it down. You've been on the quiet list since the
rebrand. No pitch in this email – just an update on what I shipped
yesterday and the math that says it was worth doing.

So: yesterday I added four lines to my robots.txt file. The four lines
allow-list the crawlers for four search engines you may not have heard
of: Brave Search, Mojeek, Marginalia, and Kagi. Combined market share
of the four: maybe 3% on a generous day. Three hours of work.

By any sales-letter math, this was a waste of an afternoon.

The reason I bothered:

Share is the wrong axis for indie SaaS. Share measures what percentage
of the general population uses an engine. The general population is
not my market – it isn't yours either, probably. The right axis is
buyer density: who deliberately uses an engine.

Who chooses Mojeek, Brave, Marginalia, or Kagi over Google? People
who self-host. People who pay ten dollars a month for ad-free search.
People who run anti-tracking extensions. People who deploy on Hetzner
before they deploy on AWS. People who hand-roll their own tooling
before they install someone else's SaaS.

Indie hackers. Founders. Solo operators.

The exact people I built UnlockSaaS for. Probably the exact people on
this list, too, given how you arrived.

A page-1 result on Mojeek puts me in front of fewer people than Google
would, yes. But a meaningfully higher percentage of those fewer people
are actually my buyer. That is the math that flips.

I wrote up the full reasoning – with the actual robots.txt commit,
the GitHub PR I opened to Marginalia, and the operator script I wrote
to audit all four monthly – at the URL below.

If you're a founder shipping a SaaS and Stripe is flat, the essay
itself carries the diagnostic CTA at the bottom. The 90-second free
diagnostic is the cheapest answer to "what should I actually work on
first." No email required, no card.

Here's the essay:

https://unlocksaas.com/four-indie-search-engines

That's it for this email. No upsell, no countdown timer, no follow-up
sequence triggered by opening this. If you want off the list, the
unsubscribe link is in the footer – one click and you're out forever.

If the indie-engine math made you think differently about your own
distribution mix, hit reply and tell me. I read every one.

– Maryan
founder, Unlock SaaS
unlocksaas.com

P.S. If you're wondering what happened to FunnelFixer: I shut it down
because the founders I was selling to had a problem upstream of the
funnel. UnlockSaaS answers that upstream question. The full story
of the rebrand sits at unlocksaas.com/about, signed by me.
```

### Plain-text vs HTML

Send as both, like the rest of the SOS:

- **Plain text:** the body above verbatim, line-wrapped at ~72 chars (Brunson recommends plaintext for re-engagement – feels personal, not promotional, more deliverable on Gmail / Outlook).
- **HTML:** identical body wrapped in the existing `app/src/lib/soap-opera/emails.ts` HTML scaffold (or whatever the transactional template is), single canonical link to `/four-indie-search-engines`, footer with unsubscribe + physical address per CAN-SPAM.

### Footer (HTML version)

The standard SOS footer applies verbatim:
- Sender business address (per CAN-SPAM 16 CFR Part 316).
- One-click HMAC unsubscribe link generated by `buildUnsubscribeUrl` in `app/src/lib/soap-opera/tokens.ts`.
- "You're receiving this because you signed up at FunnelFixer.com before the rebrand. If this is no longer relevant, click here once and you're out forever."

---

## §2 Sending discipline

- **Send window:** Tuesday or Wednesday, 10:00 Athens local. Both are highest-open-rate days for SaaS founder audiences. Avoid Monday (busy inbox) and Friday (people clock out mentally).
- **Do not send in the same week** as the Show HN / Indie Hackers posts in `indie-search-distribution.md` – the broadcast is for the OFF-platform demographic; the HN/IH posts are for the public timeline. Different audiences, do not collide.
- **Test on yourself first.** Send the email to `sales@sipiteno.com` (the founder's address) before the broadcast. Verify the canonical link works, the unsubscribe link works, the rendering is clean on Gmail web + iOS Mail + Outlook web.
- **Volume hint for Resend:** 36 subscribers is well under any deliverability ceiling. Send as a single batch; no rate-limiting needed.

---

## §3 Did-it-land tracking

For this broadcast, T+72h after the send:

1. **Resend dashboard → Broadcasts → this send:** delivered count, opened count, clicked count.
2. **PostHog → Web Analytics → Sources → Email:** confirm clicks landed on `/four-indie-search-engines`.
3. **PostHog → funnel-step counter on `/diagnostic`:** confirm any of the recipients started the diagnostic.
4. **Resend webhooks → bounces / complaints:** clean up the `soap_opera_subscribers` rows for any hard-bounce or spam-complaint event.

**Honest threshold:** if 36 subs return fewer than 1 click to `/diagnostic` in 72 hours, the email did not convert as a top-of-funnel touch. That is OK. Re-engagement broadcasts are a brand-presence move, not a conversion event. Note the outcome and try again with a different artifact in 60-90 days.

---

## §4 Launch journal

Append a row to `strategy/state.json → re_engagement_broadcasts[]` (new array, or `off_page_launches[]` with channel `"resend-broadcast"`):

```json
{
  "date_utc": "2026-MM-DDTHH:MMZ",
  "broadcast": "indie-search-companion-essay-2026-05-21",
  "artifact": "/four-indie-search-engines",
  "cohort": "funnelfixer_carryover_paused",
  "cohort_size": 36,
  "outcome": {
    "delivered": 0,
    "opened": 0,
    "clicked": 0,
    "unsubscribed_after": 0,
    "diagnostic_starts": 0,
    "replied": 0,
    "notes": ""
  }
}
```

---

## §5 Brunson Hard-Rule reconciliation

- **Honest claims.** Every number cited in the email body is hedged ("maybe 3% on a generous day"); the artifact PR + merge SHA can be verified by the recipient in one click.
- **No fabricated urgency.** No countdown timer, no "this offer expires," no scarcity language. The only urgency in the email is the freshness of the merge ("yesterday I added four lines").
- **No bundled offer.** The diagnostic CTA lives on the essay page, not in the email body. The email's only goal is "re-establish presence + drive curiosity click to the artifact."
- **One-click unsubscribe.** Existing HMAC token infrastructure honored. A click in the footer clears the recipient from every list permanently.
- **Re-engagement, not reactivation.** The recipient does not become an "active" SOS subscriber by opening or clicking this email. Their SOS status (`paused`) stays `paused`. Brunson Subscriber State Machine: state transitions only on explicit consent events (a Stripe payment, an opt-in click, a diagnostic completion).

---

# Status

| Section | State |
|---|---|
| §1 broadcast email | DRAFT – ready for operator copy-paste send |
| §2 sending discipline | LOCKED – Tuesday/Wednesday 10:00 Athens, not same week as HN/IH posts |
| §3 tracking | READY – Resend + PostHog + Resend webhooks |
| §4 launch journal | READY – append to strategy/state.json after send |
| Wiring | DEFERRED – operator-driven CSV export + Resend Broadcasts dashboard is the recommended v1 path. Code-side scheduler is a future PR if the broadcast shape recurs. |

Signed: – Maryan, founder, Unlock SaaS.

Document published: 21-05-2026. Last reviewed: 21-05-2026.
