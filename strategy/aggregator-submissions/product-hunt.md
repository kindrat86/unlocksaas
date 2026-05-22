# Product Hunt — submission copy

> Pre-filled copy for the Product Hunt submission form at
> https://www.producthunt.com/posts/new. Open this file in one tab,
> the form in another, paste field-by-field.

## Strategic timing

Coordinate the launch with the $1 Starter price drop. Product Hunt
rewards a sub-$5 entry tier in the gallery filter. Schedule the launch
for a Tuesday or Wednesday in the operator's local morning so peak EU +
US visibility align.

Re-launch (not first launch) framing is allowed if the previous launch
was a different product or a meaningfully different version. UnlockSaaS
in its current shape (seven-step Playbook + $1 Starter + 60-day
guarantee) is a re-launch versus the prior FunnelFixer iteration.

## Required fields (in form order)

### Name

```
Unlock SaaS
```

### Tagline (60 characters max)

```
Your first paying customer in 60 days, or you don't pay.
```

### URL

```
https://unlocksaas.com
```

### Description (260 characters)

```
A guided seven-step playbook that turns an already-shipped SaaS into a verified paying customer in 60 days. Built by a non-engineer marketer for non-engineer founders shipping with Lovable, Claude, Cursor, v0, or Bolt. Refund automatic if no paying customer arrives.
```

### Topics (pick up to 4)

- Marketing
- Startup Lessons
- SaaS
- Productivity

### First Comment (operator paste verbatim or adjust)

```
Hey Product Hunt 👋

I'm Maryan – I'm a marketer, not an engineer. Over the last two years I
shipped a dozen products with Lovable, Claude, and Cursor. Every single
one of them flatlined in Stripe. I watched friends ship the same way
and stop opening their Stripe dashboard within six weeks.

The work AI does not do for you is naming one real customer, writing
one real promise, and sending one real message – and verifying every
step inside Stripe so you can't lie to yourself about traction.

Unlock SaaS is the seven-step playbook I wish I'd had. Free Launch
Diagnostic, $1 Starter for the first two steps, $49/mo for the full
playbook. 60-day money-back guarantee tied to the first verified
Stripe payment – refund automatic if no paying customer arrives.

Honest counter-points to "is this for me?":

  • If you have a paying customer already, skip this; the playbook is
    aimed at pre-revenue.
  • If you're pre-launch (not yet shipped), skip this; ship first,
    then come back.
  • If you want growth hacks, skip this; the playbook is the opposite
    of growth hacking.

Happy to answer anything. Roasts welcome.
```

### Maker comment (after launch)

Within the first hour, post the most honest "what's broken" follow-up
the founder can write that day. PH rewards transparency on launch day.

### Media (gallery)

- Hero image: `/opengraph-image` exported as PNG (1200×630). Will be
  auto-resized by PH.
- Screenshot 1: homepage funnel hub at 1280×800 from production.
- Screenshot 2: `/diagnostic` input panel mid-flow.
- Screenshot 3: `/diagnostic/result` example output.
- Screenshot 4: `/playbook` overview showing the seven steps.
- Optional video: 60-second walkthrough (deferred per
  strategy/founder-vsl-script.md until shot).

## After approval

1. Copy the public canonical URL (looks like
   `https://www.producthunt.com/products/unlock-saas`).
2. Run:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL production
   # Paste the PH URL when prompted
   ```
3. Trigger redeploy. `/press/listings` flips the row to live and
   Organization.sameAs picks up the URL on every page.

## Notes

- Submission date: _to be filled by operator_
- Expected approval window: same day (PH posts go live on submit; the
  "approval" is the upvote curation).
- Approved URL: _to be filled by operator_
- Env var set on Vercel: _to be filled by operator (date)_
