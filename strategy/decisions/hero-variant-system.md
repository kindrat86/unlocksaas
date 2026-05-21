# Decision: Source-Aware Hero Variant System

**Date:** 2026-05-21
**Status:** Shipped (commit d371500, main branch)

---

## Why

May 2026 distribution research ("Indie founder distribution 2026") found
dynamic-by-referrer landing pages converting at 37.1% vs 19.2% for static --
a near-2x lift. Visitors arriving from X/Twitter, IndieHackers, a Marc Lou
link, MicroConf, or organic search are different people with different pain
vocabulary. The hero should speak to each of them, not to a generic "founder."

This is the cheapest possible version of that play: one cookie, one server
component read, no client-side JS. The organic/direct variant renders the
same HTML as before, so Googlebot/Bingbot/Perplexity always index the default
copy unchanged.

---

## The 5 primary variants (plus 3 extras)

| Source        | Trigger signals                                           |
|--------------|-----------------------------------------------------------|
| `default`    | No match -- organic, direct, unknown                      |
| `twitter`    | `utm_source=x`, `utm_source=twitter`, `utm_source=tweet`, or Referer from `twitter.com`, `x.com`, `t.co` |
| `indiehackers`| `utm_source=indiehackers`, `utm_source=ih`, or Referer from `indiehackers.com` |
| `marclou`    | `utm_source=marclou`, `utm_source=shipfast`, `utm_source=ml`, or Referer from `marclou.com`, `shipfa.st` |
| `microconf`  | `utm_source=microconf`, or Referer from `microconf.com`   |
| `hackernews` | `utm_source=hn`, `utm_source=hackernews`, or Referer from `news.ycombinator.com` |
| `linkedin`   | `utm_source=linkedin`, `utm_source=li`, or Referer from `linkedin.com`, `lnkd.in` |
| `reddit`     | `utm_source=reddit`, or Referer from `reddit.com`         |
| `directory`  | `utm_source=betalist`, `producthunt`, `peerlist`, etc., or matching Referer |

---

## Cookie pattern

- **Cookie name:** `usaas_source`
- **Values:** one of the `AcquisitionSource` enum values above
- **Max-age:** 90 days
- **SameSite:** lax
- **Path:** /
- **First-touch wins:** the proxy never overwrites an existing `usaas_source`
  cookie. A returning visitor retains their original attribution for 90 days.
  Organic return visits do not reset a visitor cookied as `indiehackers` on
  first touch.

---

## What changes per variant

Each variant specifies:

- `eyebrow` -- the top badge text (channel cue or scarcity signal)
- `headlineLead` -- H1 first phrase (foreground span)
- `headlineLeadMuted` -- H1 first phrase tail (muted-foreground span)
- `headlineTailLead` -- H1 second phrase (the polarity move, foreground)
- `headlineTailMuted` -- H1 second phrase tail (muted-foreground)
- `subheadOpener` -- the scar-tissue paragraph (channel-native pain mirror)
- `subheadCloser` -- the founder credit line
- `primaryCta` -- button text (CTA verb adapted to channel)

Everything else on the page (CTAs, sections, FAQs, footer, exit-intent popup)
stays identical across all variants.

---

## What does NOT change

- The identity_label A/B cookie (`usaas_ab_identity`: "verified_builder" vs
  "paid_builder") is entirely separate. It drives the manifesto section title.
  Both cookies can be set simultaneously on the same visitor without conflict.

- The polarity move ("Or refunded, automatically.") is present in every
  variant -- it is the page's highest-tested line and must never be variant-
  gated.

- The diagnostic as primary CTA (`/diagnostic`) is invariant. Every variant
  points the primary button to the diagnostic. Only the button verb changes.

- Copy outside the hero H1 + sub-headline is untouched.

---

## Distinct from diagnostic hook variants

`src/lib/diagnostic-hook-variant.ts` maps to Eugene Schwartz awareness levels
for the `/diagnostic` squeeze page. That is a different surface (the squeeze,
not the home hero) with different storage and different copy decks. These two
systems are deliberately kept separate.

---

## Next step: A/B test copy variants against real traffic

Once PostHog has enough volume (project 181784, EU), create PostHog feature
flags that serve alternative H1 copy within each channel bucket. The current
implementation gives us channel attribution (usaas_source) as the segmentation
dimension; PostHog events already carry `utm_source` as a property. A holdout
experiment against `default` copy within each channel is the natural next
experiment once PostHog is live.

Hard constraint: the test variants must continue to satisfy Brunson voice rules
(founder-to-founder, specific, no em dashes, no hype adjectives).
