# Capterra — submission copy

> Pre-filled copy for the Capterra vendor sign-up at
> https://www.capterra.com/vendors/sign-up.

## Strategic note

Capterra is owned by Gartner Digital Markets. A single Capterra
listing approval auto-syndicates the product across:

- **Capterra** (capterra.com) – buyer-side discovery
- **GetApp** (getapp.com) – business-software comparison
- **SoftwareAdvice** (softwareadvice.com) – Gartner advisory channel

One submission, three surfaces. This is the highest backlink ROI per
hour of operator work in the entire aggregator stack.

Same review-honesty rules apply as G2 – Gartner's review-fraud
detection is no less aggressive than G2's. Submit when there are real
paying customers willing to leave honest reviews.

## Required fields

### Vendor name

```
Unlock SaaS
```

### Product name

```
Unlock SaaS
```

### Product URL

```
https://unlocksaas.com
```

### Primary category

Capterra's closest matches (pick during the wizard – do not force-fit):

- **Sales Coaching Software**
- **Sales Enablement Software**
- **Sales Engagement Software**

If none fit cleanly, the wizard supports a "Suggest a new category"
flow – use that rather than mis-categorising.

### Tagline (around 80 chars)

```
Your first paying customer in 60 days, or you don't pay.
```

### Short description (paste 100-word block from /press)

```
Unlock SaaS is a guided seven-step playbook for post-launch pre-revenue founders. It names one real customer, writes one real promise, sends one real message, and verifies every step inside Stripe. Built by Maryan, a marketer (not an engineer), for non-engineer founders who shipped with Lovable, Claude, Cursor, v0, or Bolt and are now staring at a flat Stripe line. Sixty-day money-back guarantee tied to the first verified Stripe payment – refund automatic if no paying customer arrives.
```

### Long description (paste 200-word block from /press)

Use the canonical 200-word description on `/press` ("Descriptions",
"200 words" subsection).

### Pricing

- Starter tier: $1 (one-time)
- Core tier: $49 / month
- Free tier: Launch Diagnostic (no card required)
- Free trial available: No (the $1 Starter is the trial)
- Money-back guarantee: 60 days, automatic

### Deployment

- Cloud / SaaS: Yes
- On-premise: No
- Mobile native: No (responsive web)

### Languages supported

- English (US)
- Spanish (es)
- Portuguese (Brazil)

### Features checklist

Only mark genuinely shipped features:

- Sales playbook / coaching content
- Conversion-rate diagnostics
- Sales-message templates
- Funnel-step tracking
- Customer onboarding workflow

### Logo + media

- Logo: PNG from `/icon`.
- Hero image: `/opengraph-image` 1200×630 PNG.
- Screenshots: same five as G2 (homepage, diagnostic input, diagnostic
  result, playbook overview, pricing).

### Contact

- Vendor email: maryan@unlocksaas.com

## Domain verification

Capterra verifies vendor identity by either DNS TXT record or a meta
tag. If the wizard prompts for a meta tag, drop it through the existing
`buildVerification()` helper in `app/src/lib/seo/verification.ts` – add
a `NEXT_PUBLIC_CAPTERRA_VERIFICATION` env slot following the same
pattern as the other webmaster console slots if one is not already
declared.

## After approval

1. Wait for the three syndication URLs to come live (Capterra,
   GetApp, SoftwareAdvice). Sometimes takes 2-3 days after Capterra
   approval for GetApp + SoftwareAdvice to mirror.
2. Copy the canonical Capterra URL.
3. Run:
   ```bash
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL production
   ```
4. Trigger redeploy.
5. If GetApp + SoftwareAdvice URLs exist and the operator wants
   separate `sameAs` entries for them, add env slots
   `NEXT_PUBLIC_UNLOCKSAAS_GETAPP_URL` and
   `NEXT_PUBLIC_UNLOCKSAAS_SOFTWAREADVICE_URL` to
   `src/lib/seo/entity.ts buildSameAs()` and
   `src/lib/seo/directory-listings.ts` DIRECTORY_LISTINGS. This is
   currently NOT pre-wired because the Gartner syndication often
   makes those URLs redundant signals from the Knowledge Graph's
   perspective.

## Notes

- Submission date: _to be filled by operator_
- Expected approval window: 2-6 weeks (Capterra is the slowest
  reviewer in the stack).
- Approved URL (Capterra): _to be filled by operator_
- Syndicated URL (GetApp): _to be filled by operator_
- Syndicated URL (SoftwareAdvice): _to be filled by operator_
- Env var set on Vercel: _to be filled by operator (date)_
