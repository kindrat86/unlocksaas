# Reddit AMA – Ready-to-Publish Variants

**Companion:** [../newsletter-ama-combo.md](../newsletter-ama-combo.md)
**Use:** copy a variant verbatim, fill the four `{{SLOT}}` fields, post on Wed or Thu at 10am US ET.
**Sender identity:** Reddit handle `u/maryan-unlocksaas` (or the operator's chosen handle, **same name across every sub, no aliases**). Brunson Hard-Rule: identity locked. Trust accrues to one handle.
**Disclosure requirement:** every variant discloses the newsletter sponsorship in paragraph 1. See [../newsletter-ama-combo.md §0 rule 3](../newsletter-ama-combo.md).
**No link in body.** Link goes in a top-level comment ~20 to 40 minutes after the post, once it has 5 to 10 upvotes. See [../newsletter-ama-combo.md §4.c rule 3](../newsletter-ama-combo.md).

---

## Slot reference (fill these before publishing)

| Slot | Meaning | Example fill |
|---|---|---|
| `{{NEWSLETTER}}` | Newsletter where the sponsorship ran this week | `Indie Worldwide` |
| `{{CREATOR}}` | Newsletter creator's name | `Anthony Castrio` |
| `{{NEWSLETTER_URL}}` | Newsletter archive URL (for the disclosure paragraph if a reader asks) | `https://indieworldwide.com/newsletter` |
| `{{LINK_COMMENT_URL}}` | The single URL the link comment will point at; the `utm_source` must match the recognized taxonomy in [`diagnostic-hook-variant.ts`](../../app/src/lib/diagnostic-hook-variant.ts) so Reddit traffic routes to the contrarian hook (not the cold pain-mirror default). Pick the right token for the sub. | r/microsaas: `https://unlocksaas.com/diagnostic?utm_source=r_microsaas&utm_medium=social&utm_campaign=ama-rmicrosaas-2026-05` ▸ r/indiehackers: `?utm_source=indiehackers&utm_campaign=ama-rih-2026-05` ▸ r/SaaS: `?utm_source=r_saas&utm_campaign=ama-rsaas-2026-05` ▸ other Reddit subs: `?utm_source=reddit&utm_campaign=ama-<sub>-2026-05` |

---

## Variant A – r/microsaas (PRIMARY)

### Title options (A/B/C)

| # | Title | Why it works |
|---|---|---|
| **A1** | I shipped 12 AI products as a non-engineer before figuring out the real work is talking to one real person. AMA. | Names the role + the lesson; "AMA" closer fits the sub's pattern. |
| **A2** | Non-engineer, dozen AI products, flat Stripe line, then one specific thing fixed it. AMA. | Tighter; "flat Stripe line" is a phrase r/microsaas readers feel viscerally. |
| **A3** | I built UnlockSaaS for the post-launch pre-revenue founders, AMA – pre-revenue myself, here's the honest state. | Most disclosure-heavy; highest trust prior, lowest curiosity prior. Use if A1 or A2 underperform in a test thread. |

**Recommendation:** lead with **A2** in r/microsaas. Backup to A1 if Reddit's title-keyword filter flags A2 as too compressed.

### Body (copy verbatim, swap `{{SLOTS}}`)

```markdown
**Disclosure first, because Reddit deserves it:** I bought a small
sponsorship in {{CREATOR}}'s {{NEWSLETTER}} newsletter this week.
{{CREATOR}} is not involved in this AMA. You can ask me about
either – the parable I wrote, why I picked their list specifically,
or anything about the actual product. Sponsor archive is at
{{NEWSLETTER_URL}} if you want to read the version they ran.

Who I am:

Maryan. Non-engineer. Last 12 months I shipped a dozen products
with Lovable, Claude, and Cursor. Some of them are still online.
None of them have a paying customer.

What I figured out, the long way:

When you ship without an audience, your Stripe dashboard is the
news. You refresh it. It stays flat. So you go fix one more thing
on the product. Then you refresh Stripe again. Repeat for nine
months.

The work I'd been skipping was not engineering. It was talking to
one specific real person. Naming them. Writing one promise to them.
Sending them one message. Closing one Stripe charge.

I built a thing called UnlockSaaS – a playbook for founders in
that exact shape (post-launch, pre-revenue, AI-shipped). It is
not a course. It is a seven-step system that verifies each step
inside Stripe. 60-day money-back guarantee tied to the first
verified payment.

I am pre-revenue myself. I have zero verified Stripe-cycle
customers as I write this. That is not a sales hook. That is the
state. The Verified Builder ledger is public, updates when Stripe
says someone closed a cycle, and is empty today.

What I'll happily answer:

- How the parable maps to your specific shape (post the URL,
  I'll read it).
- Why a non-engineer should not learn to code yet.
- Why the diagnostic labels three diagnoses (Wrong Person, Weak
  Offer, Weak Belief) and not seventeen.
- How I picked {{NEWSLETTER}} for the sponsorship specifically
  and what I think Reddit's reaction to this post will be
  (calibration check).
- The math on the 60-day guarantee.
- Why I'm doing this AMA pre-revenue instead of waiting until I
  have proof.
- Any of the work that produced the playbook itself
  (Brunson trilogy applied to a non-engineer founder cohort).

What I'll decline to answer:

- "What's your MRR" – I just told you. Zero.
- Vague advice questions ("how do I get my first customer") that
  don't include a URL. I can't diagnose what I can't see.
- Anyone's specific pricing decisions in DMs. Post the URL; I'll
  reply in the thread so the answer benefits everyone reading.

I'll be here for 4 hours from now (it's currently {{TIME_ET}} ET),
and then again tomorrow morning for follow-ups.

– Maryan
```

### Pre-written FAQ replies (queue these before posting)

Have these in a draft pad ready to paste. Reddit's algorithm rewards reply-density in the first 30 minutes; pre-writing the most likely 8 to 12 questions is the single highest-leverage prep step. Substitute specifics live; never paste verbatim into multiple threads (Reddit detects).

**Q1: "Sounds like every other course. What's different?"**

> The honest version: it's $1 to start, $49/month, with a 60-day money-back guarantee tied to the first verified Stripe payment (not to "engagement," not to "completion"). If your first paying customer doesn't close in 60 days you don't pay. There are courses that are bigger, longer, prettier, more famous, and most of them are honestly fine. The thing that's different is the verification mechanism – the success criterion is one Stripe row, not a feeling.

**Q2: "Why should I trust a pre-revenue founder?"**

> You shouldn't, fully. Trust accrues with verified customer cycles. The Verified Builder ledger is public for exactly this reason – when it's still empty, you're choosing a $1 risk on a parable. When it has names on it, you're choosing a parable backed by other people's Stripe rows. Today is the first case. Six months from now I want it to be the second.

**Q3: "What's the actual seven-step thing?"**

> Step 1: Pin one real customer (workbook 01 §6, the "Alex" exercise). Step 2: Write one real offer to that one person (workbook 02). Step 3: Send one real message. Step 4: Close one verified Stripe payment. Step 5: Talk to that customer for 30 minutes. Step 6: Iterate the offer once. Step 7: Send the second message to the next person. The playbook page walks each step; the diagnostic puts you at the step you're actually at.

**Q4: "Is this Russell Brunson stuff?"**

> Frameworks are Brunson-adjacent, voice is not. I ran every Brunson workbook for this project (you can audit the strategy folder in the repo if you're inclined; it's public). The application is non-engineer-shaped: every Brunson example assumes you're selling info products to mass audiences, and the translation to "indie SaaS founder with one product" needed surgery.

**Q5: "Why a sponsorship if you're broke?"**

> $50 to $150 once per month is not broke money, it's distribution money. The math: a paid newsletter slot from a creator I've spent four weeks warming up converts at 1 to 3%. Cold ads convert at 0.1%. The cheapest learning per dollar is a warm sponsor slot + an AMA in the same week. Greg Isenberg writes about this play (the "buy a tiny newsletter" essay). I copied the play.

**Q6: "What if I'm pre-launch, not post-launch?"**

> Then this is not for you yet. Build the product first. The whole premise is that the product exists and the work blocking the first customer is offer + audience, not engineering. If you're pre-launch the equivalent indie playbook is something like Pieter Levels' Make Book or the Indie Hackers community – ship first.

**Q7: "Lovable vs Claude vs Cursor – which?"**

> I used Lovable for two-week prototypes, Claude for the long projects, Cursor as the daily driver. All three got me from idea to live product. None of them got me a customer. That's the lesson, not the tool ranking.

**Q8: "Why no link in the body?"**

> Reddit demotes posts with body links. Link's in a top-level comment now; if you want the diagnostic specifically it's at the top reply. (Or just Google "unlock saas diagnostic" – the page is the only result.)

**Q9: "Cite your customer wins."**

> I can't, today. Zero verified. Verified Builder ledger is public at /builders (will be empty when you check). Six months from now I want this answer to be different. Today it's "no customers yet, here's the parable + the diagnostic + the guarantee."

**Q10: "How long did this AMA prep take?"**

> About four hours total: two for the post, one for the pre-written replies, one for the disclosure paragraph to be honest about the sponsorship. I'm answering this one because the prep time IS the answer to "why this AMA might be different" – most AMAs go up cold. Reddit can tell.

**Q11: "What's the over-under on this post hitting 100 upvotes?"**

> Honest call: 60/40 against. r/microsaas readers are skeptical of founder-AMAs and the disclosure paragraph is unusual enough to either earn trust or trigger the same skepticism. I'll log the actual number in the post-mortem essay I'm publishing on Indie Hackers next Friday regardless.

**Q12: "I'll bite – Alex, here's my URL. [URL]"**

> Reading. Reply in this thread in 5 to 10 min.
> (Then actually read the URL, post a one-paragraph diagnosis using the Diagnostic's framework, end with "if this resonates, the Diagnostic walks the full version: {{LINK_COMMENT_URL}}". This is the highest-leverage reply pattern – a real person, a real URL, a real read, a real diagnosis. One of these per thread sells more $1 Starters than any other content the AMA produces.)

### Link comment (post ~30 min in)

```
For anyone asking where to start: free diagnostic at
{{LINK_COMMENT_URL}}. Takes about 90 seconds. Labels one of three
diagnoses + the specific next step. No email required.

(Paid product is $1 Starter at unlocksaas.com/starter or $49/mo
Playbook at unlocksaas.com/playbook-sales. The diagnostic stands
alone – if you only do that and nothing else, it's still useful.)
```

### Closing comment (post at hour 4)

```
Stepping away – I'll be back tomorrow morning ET for follow-ups,
and I'll be in the thread for the rest of the week. If you
DM'd me a URL I haven't replied to yet, I will tomorrow.

Real thank-you to {{CREATOR}} for the sponsor slot that made this
worth doing in the same week. Whatever you take from this thread,
go subscribe to {{NEWSLETTER}} – the audience overlap with this
sub is the closest I've found.

– Maryan
```

---

## Variant B – r/indiehackers (CROSSPOST)

Post 30 minutes after Variant A is live. Re-framed opener so Reddit doesn't penalize as duplicate; body section after the opener can mirror Variant A.

### Title options

| # | Title |
|---|---|
| **B1** | I'm the guy in {{NEWSLETTER}} this week. Pre-revenue, dozen shipped products, AMA. |
| **B2** | Non-engineer's flat-Stripe-line problem and the seven-step thing I built around it. AMA. |

**Recommendation:** **B1** if the newsletter has any overlap with r/indiehackers (Indie Worldwide does; MicroSaaS Idea does); **B2** if the newsletter audience is mostly outside this sub.

### Body opener (replaces the disclosure paragraph from Variant A; rest of body matches)

```markdown
Crossposting from r/microsaas earlier today
({{R_MICROSAAS_URL}}). Re-framed because r/indiehackers and
r/microsaas overlap about 30%, and the questions tend different
here – this sub usually goes harder on the offer + funnel design
where r/microsaas goes harder on the product strategy.

**Same disclosure as the other thread:** I bought a small
sponsorship in {{CREATOR}}'s {{NEWSLETTER}} newsletter this week.
{{CREATOR}} is not involved in this AMA. You can ask me about
the sponsor itself, the parable, the offer, or the funnel design
(I will happily nerd out on the Brunson value-ladder mechanics
this sub appreciates).

[... rest of Variant A body, starting at "Who I am" ...]
```

Use the same pre-written FAQ replies. Reddit's algorithm treats the two threads as independent if the openers are substantively different and the FAQ replies are not copy-pastes; same answers in different words is acceptable.

---

## Variant C – r/EntrepreneurRideAlong (OPTIONAL, T+24h crosspost)

Post only if Variant A has ≥50 upvotes at T+24h. r/EntrepreneurRideAlong is friendly to "building in public" framing but the sub's culture is more permissive of "I'm sharing my journey" framing. Less Brunson-discipline, more story.

### Title options

| # | Title |
|---|---|
| **C1** | 12 shipped products, 0 paying customers, then one specific change. Building a thing in public. AMA. |
| **C2** | Building UnlockSaaS in public for non-engineer founders with the same Stripe-line problem I had. Day 1 AMA. |

**Recommendation:** **C1** – this sub rewards specificity over framing.

### Body (different shape – longer narrative, less rule-heavy)

```markdown
Building in public, so this is the honest state at hour zero.

Last 12 months: I shipped a dozen products as a non-engineer
using Lovable, Claude, and Cursor. Some of them are still live.
None of them have a paying customer.

The thing I figured out after about month nine: I'd been doing
the wrong work the entire time. Every flat-Stripe-line week I'd
go fix one more thing on the product. Real work I was avoiding
was sitting down and writing one message to one specific person.

So I built UnlockSaaS – a playbook for founders in that shape.
Seven steps, each verified inside Stripe, 60-day money-back
guarantee tied to the first verified paying customer. $1 to
start, $49/mo for the full playbook.

I'm pre-revenue myself. Zero verified customers as I write this.
The Verified Builder ledger is public and currently empty.

Disclosure (because this sub is fair about it): I bought a small
sponsorship in {{CREATOR}}'s {{NEWSLETTER}} newsletter this week.
{{CREATOR}} is not involved in this AMA. The sponsor copy and
this AMA are the two pieces of one play I'm running for the next
month.

Ask me anything. I'll be here for 4 hours.

– Maryan
```

Use a subset of the FAQ replies from Variant A. Skip Q4 (Brunson reference – this sub is less framework-aware) and Q11 (over-under – this sub is less meta).

---

## Mod-permission protocol

Before posting in any sub, check the sub's wiki for AMA rules:

| Sub | Mod-permission needed? | Pre-post check |
|---|---|---|
| r/microsaas | No, but DM mods 24h before with a heads-up | Wiki search "AMA" + last 30 days of AMA posts |
| r/indiehackers | No, but stickied rules say no link in body | Wiki + sidebar |
| r/SaaS | **YES** – mods will remove AMAs from non-established accounts | Mod-mail 7 days ahead |
| r/Entrepreneur | **YES** – AMAs typically need verification | Mod-mail 7 days ahead, do not post if no reply |
| r/EntrepreneurRideAlong | No | Wiki + sidebar |
| r/SideProject | Not for AMAs (post format wrong); skip |

When DM'ing mods, paste this template:

```
Subject: AMA heads-up – pre-revenue indie SaaS founder

Hi mods,

Posting an AMA in r/{{SUB}} on {{DAY}} at {{TIME}} ET. Quick
disclosure: I bought a small newsletter sponsorship in
{{NEWSLETTER}} the same week; the post discloses it in paragraph 1.
No body link, link in a top-level comment per the sub's rules.

Pre-revenue. Zero verified customers today. AMA covers product
strategy, funnel design, and the parable behind the playbook.

If this format doesn't fit the sub, please tell me before I post
rather than after. Happy to adjust.

– Maryan, u/maryan-unlocksaas, maryan@unlocksaas.com
```

---

## Post-mortem template (commit to Indie Hackers as long-form essay 1 week after AMA)

Same week as the cycle close. Audience: Indie Hackers community. Format: 600 to 900 words, parable-led, no link in body (link in IH profile bio only).

```markdown
# What a {{$DOLLAR_AMOUNT}} newsletter sponsorship + a Reddit AMA actually moved

One week ago I bought a {{$DOLLAR_AMOUNT}} sponsor slot in
{{CREATOR}}'s {{NEWSLETTER}} and ran an AMA in r/microsaas
the same day. Total cost: {{$DOLLAR_AMOUNT}} plus about
{{N}} hours of operator time.

Here's what happened, with the numbers:

- Newsletter clicks: {{N}}
- Reddit AMA upvotes: {{N}}
- Reddit AMA clicks: {{N}}
- /diagnostic completions from the cycle: {{N}}
- $1 Starter conversions: {{N}}
- Earned mentions in subsequent indie-SaaS content: {{N}}

[... the parable of what worked and what didn't ...]

If you're running the Greg Isenberg "buy a tiny newsletter" play
and want a real prior on what it does for a pre-revenue indie
SaaS, this is the prior.

– Maryan
```

This essay itself becomes a third indexed page citing the play (IH archive = DR ~75), and it doubles as social proof for the next sponsorship pitch ("here's what the last cycle actually did").

---

## What to NOT do (failure modes from the off-page audit)

- **Do not post the same AMA across 4+ subs simultaneously.** Reddit treats this as spam. Two subs, 30 min apart, with re-framed openers, is the cap.
- **Do not use throwaway accounts.** The handle is the brand. One verified handle, used consistently, accrues karma trust. Reddit's algorithm hard-favors accounts with ≥6 months of history; brand-new accounts get auto-filtered in most large subs.
- **Do not delete the post if it underperforms.** Underperforming posts still index. Delete only if the post contains a factual error you cannot correct via edit.
- **Do not promise a customer count you don't have.** The whole disclosure paragraph is built around the honest pre-revenue state. The moment that state changes, the AMA template changes – do not let last-cycle's draft contradict this-cycle's ledger.
- **Do not pay for upvotes.** This is the single fastest way to get a Reddit-wide ban. Friend-seed (3 to 5 real friends with real upvotes and real questions) is the only sanctioned amplification.
- **Do not cross-link to your own funnel inside the AMA body.** Link belongs in the comment. The body links only to public, non-funnel surfaces (the homepage if at all, but better: zero links in body).
