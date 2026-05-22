# Indie Hackers — submission copy

> Pre-filled copy for the Indie Hackers product page creation at
> https://www.indiehackers.com/products/new.

## Strategic note

Indie Hackers is the audience-fit gold standard for UnlockSaaS – it is
literally where the dream customer hangs out. The product page itself
is the backlink anchor (one inbound link from a high-DA domain), but
the bigger compound effect is **sustained posting**: weekly check-ins,
milestone updates, and revenue posts that the algorithm surfaces and
that the community engages with.

**Submit once, then commit to posting.** A neglected IH product page is
worse than no IH product page – the community reads the gap as
abandonment.

## Required fields

### Product name

```
Unlock SaaS
```

### Tagline (one short line)

```
A seven-step playbook for non-engineer founders who shipped with AI tools and have no paying customers.
```

### Website URL

```
https://unlocksaas.com
```

### Description (around 200 words)

Paste the 200-word block from `/press`.

### Stage

- **Live / Public** (UnlockSaaS is live in production)

### Looking for

- Pick the options that are genuinely true. Suggested honest set:
  - Feedback on the playbook
  - First paying customers
  - Co-marketing with adjacent indie tools

Do NOT pick "Cofounder" or "Funding" – neither is the ask.

### Pricing

- Free tier: Yes (Launch Diagnostic)
- Paid tier: $1 Starter, $49/mo Core

### Tags

```
saas, marketing, sales, funnel, conversion, founder-tools, lean-startup, ai-tools
```

### Founder profile

The product page links to the founder profile. Ensure the IH founder
profile is created first with:

- Display name: Maryan
- Bio: "I'm a marketer (not an engineer). I built Unlock SaaS because I
  shipped a dozen products with AI tools and watched them flatline in
  Stripe."
- Website: https://unlocksaas.com
- Twitter / X: paste once the account exists with bidirectional claim.

### Logo + screenshots

Logo from `/icon`. Hero image from `/opengraph-image`. 2-3 screenshots
of the actual product (homepage, diagnostic, playbook).

## Recurring posting cadence (the actual work)

After the product page goes live, commit to:

1. **Weekly check-in** – every Monday EU morning, post a "What I did
   last week" update. 200-400 words. Honest. Numbers when they exist.
2. **Monthly revenue** – first of each month, post the previous
   month's revenue (or zero, honestly, until it changes). IH rewards
   the zero-and-real over fake-and-impressive.
3. **Milestone moments** – first paying customer, first refund, first
   ten paying customers, first churn event. Each is a post.
4. **Long-form essay quarterly** – one 1500-word essay per quarter
   that ties the playbook's seven steps to a specific lesson. Cross-
   link to the relevant `/playbook` step.

The posting is the marketing. The product page is the index.

## After approval

(Indie Hackers does not "approve" – the page is live as soon as the
form submits.)

1. Copy the canonical URL (looks like
   `https://www.indiehackers.com/product/unlock-saas`).
2. Run:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL production
   ```
3. Trigger redeploy.

## Notes

- Product page created date: _to be filled by operator_
- Approved URL: _to be filled by operator_
- Env var set on Vercel: _to be filled by operator (date)_
- First weekly check-in posted: _to be filled by operator_
- First milestone posted: _to be filled by operator_
