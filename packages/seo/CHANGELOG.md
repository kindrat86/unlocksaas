# Changelog

## 0.1.0 — 2026-05-18

Initial public release. Extracted from the production codebase at https://unlocksaas.com.

### Included

- **JSON-LD builders** (framework-free): `Organization`, `Person`, `WebSite` (with `SearchAction` + `AskAction`), `Article`, `FAQPage`, `BreadcrumbList`, `HowTo`, `Product` / `SoftwareApplication`, `Review`, `SpeakableSpecification`.
- **Honesty primitives**: `omitEmpty`, `isIsoDate`, `formatVerifiedDate`, `addDaysIso`, `auditJsonLd`, `checkAggregateRating`, `checkIsoDates`, `checkSameAs`.
- **`validate-claims` CLI**: fetches a URL, extracts JSON-LD + meta + visible text, audits for honesty violations and schema-vs-rendered drift. Exits non-zero on failure.
- **`generate-llms-txt` CLI**: reads a `SiteDescriptor` JSON config and writes `/llms.txt` + `/llms-feed.json`.
- **`init` CLI**: scaffolds a starter `site.config.json`.
- **Next.js adapter**: `pageAlternates`, `markdownAlternate`, `JsonLdScript` component. Next is an optional peer dep.
- **Verification env slots**: Google, Bing, Yandex, Pinterest, Facebook, Naver — empty until env var is set.
- **Freshness primitives**: `createFreshness`, `renderActivationLog`.
- **Rating derivation**: `deriveComparisonRatings` for honest head-to-head Review ratings.
