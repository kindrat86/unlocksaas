# Results-in-Advance — Canonical Example (anonymized)

**Brunson rule (DotCom Secrets, Secret #12 + Frank Kern):** the result must be
**visible** to a skeptic *before* they pay. Describing what the buyer walks
out with is not the same as showing it. A page that promises "you'll get a
finished dream customer + offer" without an example is a teaser. A page that
shows an actual finished dream customer + offer, side by side, with the
buyer's name redacted, is the chapter executed.

This file is the canonical anonymized example surfaced on `/starter` and
quoted on `/diagnostic/result`. It is the result of one real run of The
Machine, Steps 1 + 2, with the operator's name, product name, and customer
names changed. The structure and the Reluctant Hero voice are preserved
verbatim — anything you can read here is what the engine actually produced.

The avatar is deliberately **not Marco**. Marco is the founder. The example
needs to demonstrate the chapter for a buyer who is Marco-adjacent but not
Marco — a parallel ICP, so the cold reader does not pattern-match "this only
works for the founder talking to himself." We use **Priya**, a B2B SaaS
indie hacker shipping analytics for Shopify stores.

---

## Step 1 output — Priya's Dream Customer

> **One real person, named and specific.**
>
> **Name:** Elena Ramos.
> **Where:** Buenos Aires.
> **What she runs:** A Shopify store called *Casa Lunar*, selling handmade
> ceramics to North America. Two years live, ~$11k/mo revenue, one employee
> (her sister, part-time).
>
> **The flat line:** She's been doing $11k/mo for nine months. She tried two
> things that didn't move it: a "summer sale" promo that pulled revenue
> forward instead of growing it, and a Klaviyo flow she copied from a
> Reddit thread that doubled her unsubscribe rate.
>
> **What she actually says when I ask:** "I don't know if it's the ads, the
> emails, the price, or the audience. Every consultant tells me a
> different bottleneck. I've stopped trying anything because I can't
> afford to be wrong twice in a row."
>
> **What she secretly wants:** To stop second-guessing every dollar. One
> dashboard that shows her, in one sentence, which lever to pull next.
>
> **What she's already tried:** Triple Whale (too expensive, churned),
> Lifetimely (good but lives inside Shopify analytics, which she's
> already lost trust in), a free Klaviyo audit (the consultant disappeared
> after the discovery call).
>
> **What she will NEVER pay for:** "another tool with a dashboard." She's
> burned on dashboards. She wants conclusions, not data.
>
> **Where she congregates:** r/ShopifyEntrepreneurs, the Shopify Mastermind
> Telegram group (~400 members), the @repeatcustomer newsletter, and Two
> in-person meetups in BA for Latin-American ecommerce founders.

**Engine pushback that produced this** (excerpt): The user's first answer was
"my customer is a Shopify store owner." The engine returned: *"Shopify store
owner" is a category, not a person. Name one store owner you have spoken to
in the last thirty days. What did they say when you asked what was stuck?*
The above is the third pass after the engine refused two vaguer answers.

---

## Step 2 output — Priya's Offer

> **The ONE result, guaranteed.**
>
> Elena learns, in 14 days, exactly which one of her four levers (ads,
> emails, price, audience) is responsible for her flat $11k line — and gets
> a Friday-call answer she can act on Monday. If she doesn't have a
> single-lever answer she's confident enough to act on by day 14, she
> doesn't pay.
>
> **The stack:**
>
> | Item | Value |
> |---|---|
> | Core: The Lever Diagnostic (14-day, one operator-led answer) | $890 |
> | Bonus 1: 30-min recorded Friday call walking through the answer in plain language | $190 |
> | Bonus 2: A two-page "what to do Monday" playbook tailored to the lever | $140 |
> | Bonus 3: One follow-up Loom video 30 days later, checking the bet | $90 |
> | **Total value** | **$1,310** |
> | **Your price** | **$129 one-time** |
>
> **Value-to-price:** 10.2×.
>
> **Guarantee:** 14 days. Work condition: Elena ships me her Shopify
> revenue history, her Klaviyo flow, her Facebook ads dashboard, and one
> 45-minute call. If she does the work and I cannot hand her one lever
> answer she is confident enough to test, she gets the $129 back.
>
> **Why this is 10x:** A Shopify consultant charging by the hour would
> bill 8–12 hours for the same diagnostic, at $90–$150/hr, which is
> $720–$1,800. A SaaS tool that "shows you everything" is what she has
> rejected. The offer's value is the *one-sentence answer*, not the
> hours spent producing it.

**Engine pushback that produced this** (excerpt): The user's first offer was
"I'll help Elena grow her store." The engine returned: *"Help her grow"
isn't a guaranteed result — it's a feeling. Name the lever, the timeframe,
and the remedy if the lever isn't named.* The above is the second pass.

---

## What the buyer leaves with

A markdown document in their inbox (sent via Resend, signed "— Maryan") plus
a copy in `project_state` they can retrieve from any device. Two sections,
roughly the length above. The header reads:

> **Priya — Your Dream Customer is locked.** Here is your copy, in your
> inbox, where the tab cannot close on it.

Plus a paragraph naming what to do with the result next (use it in every
piece of copy from now on, or take it next door to the $49 Machine to keep
going).

---

## Source

One real anonymized run, 2026-05-12, by an early-access tester who
volunteered the use of their output as the canonical example. Real text
preserved; identifying details (name, store name, customer names, exact
revenue numbers, location) changed under a per-field swap. The engine
prompts, voice rules, and 10x value math are unchanged.

---

## How this file is consumed

- **`app/src/lib/results-in-advance/example.ts`** exports a typed version of
  the Step 1 and Step 2 strings above for server-side rendering on the
  `/starter` and `/diagnostic/result` pages. The component is
  `<RiaPreview />` (`app/src/components/blocks/ria-preview.tsx`).
- The markdown above is the canonical source. Any edit here must be mirrored
  in the typed TS export and re-deployed. The TS export carries a
  `source_path = "strategy/results-in-advance-example.md"` constant so the
  pair stays auditable.

— Maryan
