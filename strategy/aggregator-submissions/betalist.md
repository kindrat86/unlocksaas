# BetaList — submission copy

> Pre-filled copy for the BetaList submission form at
> https://betalist.com/submit.

## Strategic framing

BetaList rewards exclusivity. The directory positions itself as a
discovery channel for early-adopter founders looking for new tools to
try. The strongest framing is "waitlist + private beta", which fits the
50-seat Founding Cohort framing already locked in
strategy/project_unlocksaas_strategy.md.

Submit BetaList AFTER Product Hunt – the PH launch day creates the
initial traffic + social proof BetaList curators look for when vetting
the submission queue.

## Required fields

### Name

```
Unlock SaaS
```

### Tagline (one short sentence)

```
A seven-step playbook for non-engineer founders who shipped a SaaS with AI tools and have no paying customers.
```

### Website

```
https://unlocksaas.com
```

### Description (around 100 words)

Paste the 100-word block from `/press` ("Descriptions" section):

```
Unlock SaaS is a guided seven-step playbook for post-launch pre-revenue founders. It names one real customer, writes one real promise, sends one real message, and verifies every step inside Stripe. Built by Maryan, a marketer (not an engineer), for non-engineer founders who shipped with Lovable, Claude, Cursor, v0, or Bolt and are now staring at a flat Stripe line. Sixty-day money-back guarantee tied to the first verified Stripe payment – refund automatic if no paying customer arrives.
```

### Category

- SaaS
- Marketing
- Founder Tools

### Founder name

```
Maryan
```

### Email

```
maryan@unlocksaas.com
```

### Twitter / X

Only paste once the X account exists and the bio links back to
unlocksaas.com. Skip otherwise.

### Logo

Upload exported PNG from `/icon`.

### Screenshot

Upload the homepage funnel hub at 1280×800 captured from production.

## After approval

1. Copy the public canonical URL (looks like
   `https://betalist.com/startups/unlock-saas`).
2. Run:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_BETALIST_URL production
   ```
3. Trigger redeploy.

## Notes

- Submission date: _to be filled by operator_
- Expected approval window: 1-3 weeks (BetaList curates manually).
- Approved URL: _to be filled by operator_
- Env var set on Vercel: _to be filled by operator (date)_
