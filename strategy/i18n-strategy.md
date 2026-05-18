# i18n Strategy — UnlockSaaS

**Source:** Founder directive 2026-05-18 unlocking the previously-locked monolingual stance after reading the SEO/GEO/AEO audit's "International SEO ceiling" deduction.
**Status:** INFRASTRUCTURE COMPLETE 2026-05-18. Two pilot translations (`/faq → es`, `/faq → pt-BR`) seeded as `pending-review`. ZERO translated URLs in sitemap, zero hreflang alternates advertised. Activation is operator-gated per row.
**Pre-conditions:** All ten Brunson workbooks complete (✓). Lean ladder canonical (✓). Brunson Hard-Rule (no fabricated alternates) (✓, enforced via registry). Reluctant Hero voice preserved through translation (pending founder review per row).

> "The work that turns a flat Stripe line into a verified customer is not new translations. The work is the first verified customer. Translations are infrastructure that compounds AFTER the first cycle." — founder commentary on the unlock, paraphrased.

---

## Why this document exists

The audit on 2026-05-18 noted: *"the score ceiling unlocks only when surfaces ship."* The founder unlocked the previously-locked monolingual stance and approved the full ES + PT-BR pipeline, founder-reviewed page-by-page.

The rule that protects everything below: **a translated URL does not exist in the world until the founder flips `status: "approved"` in [`src/lib/i18n/registry.ts`](../app/src/lib/i18n/registry.ts).** Until then:

- Page renders but is `noindex, nofollow`.
- Sitemap omits the URL.
- en-US canonical does NOT advertise an hreflang alternate.
- Founder can still preview at the live URL during review.

---

## The locale set

| Tag | Locale | Rationale |
|---|---|---|
| `en-US` | Default, canonical | Existing monolingual surface. Root URLs (`/`, `/faq`, …) serve this. |
| `es` | Region-neutral Spanish | Indie SaaS Spanish-speaking audience distributes across MX, AR, CO, CL, ES. Bare `es` is the honest anchor. |
| `pt-BR` | Brazilian Portuguese | Brazilian indie SaaS audience is the target. pt-PT is a different audience with different idioms. |

Adding a new locale = one row in `SUPPORTED_LOCALES` in [`src/lib/i18n/locales.ts`](../app/src/lib/i18n/locales.ts). Adding a locale is infrastructure-only; URLs ship only via registry approval.

---

## URL pattern

```
en-US (default):  /faq
es:               /es/faq
pt-BR:            /pt-BR/faq
```

The default locale carries NO prefix — PageRank on the en-US canonical is preserved. Locale variants are unambiguous to crawlers without redirect chains.

---

## The translation registry — single source of truth

[`src/lib/i18n/registry.ts`](../app/src/lib/i18n/registry.ts). Every (path, locale) pair lives here. Every consumer reads from it:

| Consumer | What it reads | What happens for `pending-review` |
|---|---|---|
| [`sitemap.ts`](../app/src/app/sitemap.ts) | `allApprovedTranslations()` | URL omitted from sitemap. |
| [`robots.ts`](../app/src/app/robots.ts) | `localesWithApprovedContent()` | `/{locale}/*` not mentioned. |
| `pageAlternates()` / `selfHreflang()` ([markdown-alternates.ts](../app/src/lib/seo/markdown-alternates.ts)) | `approvedLocalesForPath(path)` | No hreflang alternate emitted. |
| `app/[locale]/<path>/page.tsx` `generateMetadata` | `isApproved(path, locale)` | `robots: { index: false, follow: false }`. |
| `app/[locale]/layout.tsx` `generateStaticParams` | `localesWithApprovedContent()` | Locale shell not pre-rendered if zero approved. |
| Per-page `generateStaticParams` | `renderableLocalesForPath(path)` | Pending-review pages pre-render for founder preview, but are noindex. |

---

## The page-by-page approval workflow

### Step 1 — Generate the translation

Mirror the canonical's data file in `src/lib/i18n/translations/<basename>.<locale>.ts`.

For the /faq pilot (shipped 2026-05-18):
- [`src/lib/i18n/translations/faq.es.ts`](../app/src/lib/i18n/translations/faq.es.ts)
- [`src/lib/i18n/translations/faq.pt-br.ts`](../app/src/lib/i18n/translations/faq.pt-br.ts)

Translation source: per current founder directive, LLM-translated, founder-reviewed end-to-end. Translations live under version control so audit trail is automatic.

### Step 2 — Register as pending-review

Add a row to `TRANSLATIONS` in [`src/lib/i18n/registry.ts`](../app/src/lib/i18n/registry.ts):

```ts
{ path: "/faq", locale: "es", status: "pending-review", reviewNote: "Pilot..." }
```

### Step 3 — Wire the locale route (one-time per canonical path)

If `app/[locale]/<canonical-path>/page.tsx` doesn't exist, create it. Pattern: [`app/src/app/[locale]/faq/page.tsx`](../app/src/app/[locale]/faq/page.tsx).

### Step 4 — Founder preview

`npm run dev` → visit `http://localhost:3000/{locale}/{path}` (e.g. `/es/faq`). The page renders with:
- Amber "Pending review — not indexed yet" banner with the registry's `reviewNote`.
- `<meta name="robots" content="noindex, nofollow">`.
- Sitemap omits the URL; no link points at it.

Brunson Hard-Rule review checklist:

- [ ] Reluctant-Hero voice preserved (workbook 02 §3). Translation does not flatten the founder's "marketer-not-engineer" register into generic SaaS-marketing voice.
- [ ] Numeric claims unchanged ($49/mo, $98, 20 outreach, 60 days, Daniil Khanin's 10,947/90/9-years numbers). Honest claims survive translation.
- [ ] Brand-glossary terms (Dream 100, Hook Story Offer, Big Domino, Reluctant Hero, Playbook, Stripe, Indie Hackers, Hacker News) stay in English. These are DefinedTermSet entity anchors; translating them forks the entity.
- [ ] No fabricated cultural references or stereotypes.
- [ ] No fabricated quotes, no fabricated reviews, no fabricated approvals.
- [ ] Tone matches the audience — Brazilian PT leans founder-to-founder; LATAM Spanish stays neutral.

### Step 5 — Flip to approved

In [`registry.ts`](../app/src/lib/i18n/registry.ts):

```ts
{
  path: "/faq",
  locale: "es",
  status: "approved",       // was: pending-review
  approvedAt: "2026-05-19",
  approvedBy: "maryan",
}
```

Commit, deploy. On the next build:
- Sitemap includes `https://unlocksaas.com/es/faq` with `lastModified = approvedAt`.
- en-US canonical `/faq` advertises `<link rel="alternate" hreflang="es" href=".../es/faq">`.
- `/es/faq` flips to `index: true, follow: true`.
- Preview banner disappears.

IndexNow submission fires automatically once `INDEXNOW_KEY` is set on Vercel (see audit Top-5 action #2).

### Step 6 — Archive (if retired)

Flip to `status: "archived"`. Route handler returns 404 (future: 410 Gone). Row stays in registry forever as the audit log.

---

## Activation order (recommended)

| Order | Page | Why first | Effort |
|---|---|---|---|
| 1 | **`/faq`** (PILOT — shipped pending-review 2026-05-18) | Structured Q&A; highest AEO leverage per page of effort. | Low. |
| 2 | `/diagnostic` | Pain-mirror squeeze. Pre-revenue audience converts highest here. | Medium. |
| 3 | `/` (funnel hub) | Brand homepage. Locale visitors expect their locale at root. Long-form prose across 20+ blocks. | High. |
| 4 | `/stories` | Reverse-squeeze long-form. Five parables. | High. |
| 5 | `/about` | E-E-A-T trust column. Short prose. | Low. |
| 6 | `/editorial-policy` | E-E-A-T quality-rater anchor. Short prose. | Low. |
| 7 | `/playbook-sales` | $49 long-form sales page. Largest surface. | High. |
| 8 | `/starter` | $1 entry funnel. Short. | Low. |
| Defer | 137 pSEO slugs | Each has en-US-specific competitor naming. Honest internationalisation needs per-locale slug catalogs, not translation. | Very high — gated on operator decision. |

The pSEO surfaces are the deliberate hold-out: a Spanish indie founder doesn't compare "Tally vs Typeform" with the same intent set as an English-speaking one.

---

## `<html lang>` constraint accepted

Next.js App Router permits exactly ONE `<html>` tag at the root layout. Restructuring every existing route under `app/[locale]/*` is a multi-day refactor that risks regressing the en-US canonical.

Compromise: locale routes wrap content in `<div lang="{locale}">` (honoured by search engines and assistive tech on inner elements), plus:

- `Content-Language` HTTP header ([`app/next.config.mjs`](../app/next.config.mjs))
- `og:locale` metadata ([`app/[locale]/layout.tsx`](../app/src/app/[locale]/layout.tsx))
- hreflang alternates via registry-backed helpers
- `inLanguage` JSON-LD per page

This stack delivers the same locale signal weight as `<html lang>` in every documented search and AI-retrieval pipeline. The Next 16 upgrade ([next-16-migration-plan.md](./next-16-migration-plan.md)) will make restructuring under `app/[locale]/*` cheaper — that's the right time, not now.

---

## Brunson Hard-Rule reconciliation

| Rule | Enforcement |
|---|---|
| No fabricated alternates | Registry is the single gate. `pending-review` and `archived` rows NEVER advertised. |
| No fabricated identity | `approvedBy` field locks approval to the founder. |
| No fabricated dates | `approvedAt` required for approved rows; drives sitemap `lastModified`. |
| Honest empty state | Locales with zero approved content don't appear in robots, don't appear in sitemap. |
| Brand-glossary preservation | Translation files document the explicit untranslated-term list. DefinedTermSet entity is not forked. |
| Reluctant Hero voice | Translation review checklist puts voice as the first audit gate. |
| AC-flaw guardrail | Translating 314 pSEO surfaces without prior verified-customer evidence WOULD be the SEO-addiction relapse from workbook 01 §6 Beat 4. The activation order above explicitly defers the 137 pSEO slugs until per-locale competitor research is done. Pilots are infrastructure proof, not avoidance behaviour. |

---

## What ships right now (2026-05-18)

- ✓ Locale infrastructure complete: types, registry, helpers, locale-aware sitemap, robots, hreflang, layout, locale-aware Content-Language header.
- ✓ Pilot translations seeded as `pending-review`: `/es/faq`, `/pt-BR/faq`.
- ✓ Zero translated URLs in sitemap. Zero hreflang alternates declared. Zero robots presence for /es/, /pt-BR/.
- ✓ Preview surface lights up at `/es/faq` and `/pt-BR/faq` for founder review (noindex).
- ✓ Strategy doc (this file).

## What ships on founder approval

- Sitemap includes the URL with `lastModified = approvedAt`.
- en-US canonical advertises `<link rel="alternate" hreflang="...">`.
- Translated pages flip to `index: true, follow: true`.
- IndexNow submits to Bing / Yandex (once `INDEXNOW_KEY` is set).
- International SEO audit score moves from **88 → ~93** for each surface shipped.

---

## Activation log

| Date | Action | Status |
|---|---|---|
| 2026-05-18 | Strategy lock unlocked by founder directive after SEO audit review. | DONE |
| 2026-05-18 | Locale infrastructure shipped. | DONE |
| 2026-05-18 | Pilot translations: `/faq` → es, `/faq` → pt-BR (pending-review). | DONE |
| TBD | Founder review of `/es/faq` against Brunson Hard-Rule checklist. | PENDING |
| TBD | Founder review of `/pt-BR/faq`. | PENDING |
| TBD | Flip both `/faq` rows to `approved`. First international SEO surface live. | PENDING |
| TBD | Activation order step 2: `/diagnostic` translations. | DEFERRED |

---

## Cross-references

- [strategy/google-strategy.md](./google-strategy.md) §A.4 — locale declarations
- [strategy/next-16-migration-plan.md](./next-16-migration-plan.md)
- [app/src/lib/i18n/registry.ts](../app/src/lib/i18n/registry.ts) — the registry
