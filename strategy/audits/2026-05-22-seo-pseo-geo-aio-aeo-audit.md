# SEO, pSEO, GEO, AIO, AEO Audit - UnlockSaaS

**Date:** 2026-05-22  
**Repo:** `/Users/sipi/.codex/worktrees/2bf6/unlocksaas`  
**Commit audited:** `90cf83c`  
**Scope:** local codebase, live local Next dev/production render, sitemap/robots/headers/schema routes, package audit, and official search/AI-search guidance checked on 2026-05-22.  

## Executive Summary

UnlockSaaS is far ahead of a normal early SaaS site on pSEO, AEO, GEO, and machine-readable retrieval surfaces. It has a 650 URL sitemap, a large data-driven pSEO inventory, markdown mirrors, `llms.txt`, model-specific `llms.txt` variants, `llms-feed.json`, MCP/OpenAPI discovery, dataset routes, structured data, hreflang plumbing, AI crawler policy, and public citation surfaces.

The initial audit score was capped by four P0 issues:

1. **Production build fragility:** `npm run build` does not complete in a clean local checkout. It typechecks and compiles, then fails during prerender on `/open` because Supabase env vars are missing. It also logs a Next prerender `cookies()` hanging-promise rejection for `/api/founder-memory/context`.
2. **Structured data validation failures:** the repo's own `validate:jsonld` check finds 13 errors across 5 representative authority surfaces.
3. **Contradictory AI policy signals:** `/ai.txt` and `robots.txt` block training-only crawlers, but `/.well-known/ai-policy.json` and `training-data-attribution: allow` say training is allowed.
4. **Entity/off-page weakness:** `Organization.sameAs` is empty in a fresh checkout, `MEDIA_MENTIONS` is empty, and trust relies mostly on first-party claims.

Autonomous remediation completed on the same audit date fixed the first three P0 blockers and the localized FAQ schema issue:

- `npm run build` now completes: 2,029 static pages generated.
- `VALIDATE_BASE_URL=http://localhost:3003 npm run validate:jsonld` now passes all 33 sampled URLs.
- `/.well-known/ai-policy.json`, `/ai.txt`, `llms.txt`, `llms-full.txt`, `llms-feed.json`, and podcast feed headers now consistently allow retrieval/citation and disallow model training.
- `/es/faq` now emits FAQ JSON-LD with localized `inLanguage: "es"` while keeping global site/entity schema in `en-US`.

**Current post-remediation composite rating: 87 / 100.**  
Architecture is near 90. The remaining ceiling is mostly off-domain authority, dependency trust debt, and unmeasured Core Web Vitals.

## Evidence Collected

Commands and checks run:

- `npm ci`: installed 1329 packages; npm audit later reported 18 production vulnerabilities.
- Initial `npm run build`: compile and TypeScript passed; prerender failed.
- Post-remediation `npm run build`: passed; generated 2,029 static pages.
- `npm run validate:jsonld` without server: failed because the validator expects `localhost:3000`.
- `npm run dev` with harmless placeholder env: started successfully.
- Initial `VALIDATE_BASE_URL=http://localhost:3000 npm run validate:jsonld`: crawled 33 representative URLs; found 13 JSON-LD errors.
- Post-remediation `VALIDATE_BASE_URL=http://localhost:3003 npm run validate:jsonld`: crawled the same 33 representative URLs against the built app served with placeholder runtime env; OK.
- `curl /sitemap.xml`: 650 `<url>` entries.
- Route inventory: 117 `page.tsx` pages, 136 `route.ts` handlers, 23 `opengraph-image.tsx` routes.
- Sampled headers for `/`, `/faq`, `/glossary/hook`, `/benchmarks/landing-page-conversion-rate`, `/llms.txt`, `/llms-feed.json`, and dataset JSON.
- Sampled `robots.txt`, `ai.txt`, `/.well-known/ai-policy.json`, `/.well-known/entity.jsonld`, `/.well-known/mcp.json`, `/openapi.json`, `/humans.txt`.

Official references used for scoring:

- Google Search Central: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- Google Search Central: [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- Google Search Central: [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- Google Search Central: [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- Google Search Central: [Robots.txt interpretation](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)
- Google Search Central: [Google common crawlers, including Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- OpenAI Help: [ChatGPT search](https://help.openai.com/en/articles/9237897-chatgpt-search)
- OpenAI Help: [Publishers and developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)

## Scorecard

| Acronym / Layer | Meaning | Score | Verdict |
|---|---:|---:|---|
| SEO | Search Engine Optimization, overall | 87 | Very strong technical/content foundation; remaining cap is authority/security/CWV proof. |
| TSEO | Technical SEO | 86 | Sitemap, canonicals, robots, redirects, headers are strong; clean build now passes. |
| OSEO | On-page SEO | 84 | Titles, H1s, metadata, direct-answer blocks, visible FAQs are strong. |
| pSEO | Programmatic SEO | 91 | Excellent data-driven surface area and internal consistency; monitor thinness/duplication. |
| GEO | Generative Engine Optimization | 91 | `llms.txt`, markdown mirrors, MCP, OpenAPI, dataset, citations, and AI policy are now aligned. |
| AIO | AI Overviews / AI Search Optimization | 84 | Google says classic SEO fundamentals still apply; project has them and schema now validates. |
| AEO | Answer Engine Optimization | 92 | FAQ/QAPage/direct-answer/speakable patterns are strong and localized FAQ schema is fixed. |
| LLMO | Large Language Model Optimization | 92 | Strong retriever files, full-corpus exports, and consistent retrieval-vs-training policy. |
| KGO | Knowledge Graph Optimization | 61 | Entity graph exists, but `sameAs` is empty and no Wikidata/Wikipedia/Crunchbase/OpenCorporates activation. |
| E-E-A-T | Experience, Expertise, Authoritativeness, Trust | 76 | About, editorial policy, open metrics, citations help; external proof remains the cap. |
| SDO | Schema/Data Optimization | 90 | Very broad JSON-LD coverage; repo validator now passes all sampled pages. |
| SERP | Search result feature eligibility | 85 | Breadcrumb, Article, FAQ, Dataset, Podcast, Product-like blocks exist and sampled schema is clean. |
| CWV | Core Web Vitals | 68 | Code shows optimization work, but no Lighthouse/PageSpeed run was completed in this audit. |
| SXO | Search Experience Optimization | 74 | Fast answer blocks and CTAs are good; heavy scripts/videos and unmeasured mobile UX leave risk. |
| CRO | Conversion Rate Optimization | 86 | Funnel architecture, diagnostic, guarantee, CTA ladder, objection pages are strong. |
| ISEO | International SEO | 78 | Hreflang and sitemap plumbing are good; localized FAQ JSON-LD now matches page language. |
| Image SEO | Image/OG discovery | 78 | Image sitemap and many dynamic OG routes; not every major hub has dedicated images. |
| Video SEO | Video discovery | 68 | Founder videos exist in public assets; schema/video-indexing depth not as mature as text. |
| Audio SEO | Podcast/audio discovery | 82 | Podcast RSS, transcript pages, audio JSON-LD and glossary audio plumbing are strong. |
| Dataset SEO | Dataset Search / data citation | 90 | Dataset JSON/CSV, schema, license, BibTeX/citation routes are excellent; DOI/HF/Zenodo slots need activation. |
| VSO | Voice Search Optimization | 80 | Speakable selectors, direct answers, Alexa feed, podcast audio. Google support is limited, but architecture is good. |
| DPR | Digital PR / off-page SEO | 43 | Strategy exists, but code shows empty earned media and no activated external authority. |
| A11Y SEO | Accessibility as crawl/UX support | 72 | Semantic structure is decent; no automated axe/manual accessibility pass was run. |
| Security SEO | Trust/security hygiene | 65 | HSTS/CSP/referrer/permissions headers are good; npm audit still reports 6 high vulnerabilities. |
| Local SEO | Local/maps optimization | 20 | Mostly not applicable; no local business intent. |
| ASO | App Store Optimization | N/A | No app-store product in scope. |

## Critical Findings

### 1. Initial clean production build failed

Status after remediation: **resolved**. `npm run build` now completes in a clean checkout and generates 2,029 static pages.

`npm run build` result:

- Workflow bundle created.
- Next 16 compiled successfully.
- TypeScript finished successfully.
- Static generation started: `0/2029`.
- Warning: Next inferred workspace root as `/Users/sipi` because of multiple lockfiles.
- Error logged: `/api/founder-memory/context` hits `cookies()` during prerender and triggers `HANGING_PROMISE_REJECTION`.
- Fatal error: `/open` prerender fails with `Error: supabaseUrl is required`.

Impact:

- Technical SEO cannot be scored as production-stable from a clean checkout.
- Any CI/Vercel environment missing Supabase service envs would fail deployment.
- The `/open` transparency page is good for E-E-A-T, but right now it is an env-sensitive build risk.

Recommended fix:

- Make `/open` dynamic/runtime-only or provide an honest zero-state fallback when Supabase envs are absent.
- Ensure `/api/founder-memory/context` is force dynamic or structured so `cookies()` is only evaluated during actual requests.
- Set `turbopack.root` to the app/worktree root to remove root inference ambiguity.

### 2. Initial JSON-LD validator failed 13 checks

Status after remediation: **resolved**. `VALIDATE_BASE_URL=http://localhost:3003 npm run validate:jsonld` now passes all 33 sampled URLs.

`VALIDATE_BASE_URL=http://localhost:3000 npm run validate:jsonld` crawled 33 URLs and found:

- `/`, `/about`, `/press`, `/press/topics`: `Person.workExample[0]` Dataset missing `license`.
- `/`, `/about`, `/press`, `/press/topics`: `Person.workExample[5]` and `[6]` Article missing `headline`.
- `/editorial-policy`: `ClaimReview.itemReviewed` Article missing `headline`.

Impact:

- Google's structured data guidelines emphasize completeness, visible-content alignment, and required properties.
- These errors likely do not hurt normal ranking directly, but they reduce rich-result eligibility and entity confidence.

Recommended fix:

- Add `license` to Dataset-shaped `workExample` entries.
- Add `headline` to Article-shaped `workExample` entries.
- Add `headline` to the `itemReviewed` Article in the editorial-policy correction/claim review block.
- Add this validator to CI after starting a local server or against the Vercel preview URL.

### 3. Initial AI policy signals contradicted each other

Status after remediation: **resolved** for first-party policy files and headers. The public stance is now: AI search/retrieval/citation allowed; model training and training-dataset storage disallowed.

Observed:

- `/ai.txt`: "We do NOT consent to use of this content as training data..."
- `robots.txt`: blocks GPTBot, Google-Extended, CCBot, Bytespider, Meta, Applebot-Extended, Amazonbot, Cohere training, Diffbot.
- `/.well-known/ai-policy.json`: says "welcomes AI training..." and `preferences.training.default = allow`.
- `/llms.txt`, `/llms-full.txt`, `/llms-feed.json`: return `training-data-attribution: allow`.

Impact:

- This is the largest GEO/AIO trust issue. A careful crawler gets mutually exclusive instructions.
- It also weakens your own strategic posture: are you allowing retrieval/citation only, or training too?

Recommended fix:

- Choose one policy.
- If the intended policy is "retrieval/citation yes, model training no", update `ai-policy.ts` and the `training-data-attribution` headers to reflect that distinction.
- Keep `OAI-SearchBot` and `ChatGPT-User` allowed if ChatGPT Search inclusion matters. OpenAI states inclusion requires allowing OAI-SearchBot and not blocking relevant pages.

### 4. Initial locale JSON-LD was wrong on at least `/es/faq`

Status after remediation: **resolved** for localized FAQ schema. Spot-check: `/es/faq` emits 9 Spanish FAQ `inLanguage: "es"` values; the remaining 6 `en-US` values are global site/entity schema.

Observed:

- `/es/faq` HTML has localized Spanish copy, `content-language: es`, canonical `/es/faq`, and hreflang links.
- Its FAQ JSON-LD emits `"inLanguage":"en-US"` fifteen times.

Impact:

- Hreflang and visible-language signals are good, but JSON-LD language conflicts with the page.
- This reduces international SEO and answer extraction confidence for Spanish and likely Portuguese pages using shared schema helpers.

Recommended fix:

- Pass locale into localized FAQ JSON-LD and nested Answer nodes.
- Add a test that crawls `/es/faq` and `/pt-BR/faq` and asserts no localized page emits only `inLanguage: en-US` for localized content.

### 5. Entity authority is under-activated

Observed:

- `Organization.sameAs` renders as `[]` in local entity JSON-LD.
- `MEDIA_MENTIONS` is empty.
- Strategy docs mention Wikidata, sameAs, Dream 100, dataset submission, citations, and outreach, but many are not activated.

Impact:

- The site is structurally ready for entity authority, but not externally corroborated.
- KGO/E-E-A-T/GEO scores cannot reach the 80s until real off-domain anchors exist.

Recommended activation order:

1. Founder LinkedIn, GitHub, X/YouTube if real and bidirectionally linked.
2. Product Hunt / Indie Hackers / Wellfound / Crunchbase where appropriate.
3. Hugging Face dataset mirror.
4. Zenodo DOI.
5. Wikidata only when notability is legitimately supportable.
6. Earned mentions through the existing press topics and Dream 100 strategy.

### 6. Dependency trust debt

`npm audit --omit=dev` reports after remediation:

- 18 total production vulnerabilities.
- 6 high, 2 moderate, 10 low.
- High-severity chain includes `workflow -> @workflow/* -> undici/devalue`.
- Moderate chain includes `next -> postcss`.

Impact:

- This is not a direct ranking factor.
- It is a product trust and operational risk, especially because the app exposes public APIs, MCP, OpenAPI, diagnostic ingestion, and webhooks.

Recommended fix:

- Triage `workflow` package version first.
- Review whether the audit's suggested semver-major downgrade paths are sane; do not blindly apply `npm audit fix --force`.
- Add a production dependency audit gate once the toolchain has a safe upgrade path.

## What Is Excellent

### Technical SEO foundations

- `metadataBase` is set to `https://unlocksaas.com`.
- Canonical links render on sampled pages.
- Trailing slash redirects are clean (`/about/` -> `/about` 308).
- Historical renames redirect cleanly (`/compare/*` -> `/vs/*`, `/machine-sales` -> `/playbook-sales`).
- Security and language headers are deliberate.
- Private/auth/API/post-purchase routes are blocked by robots and noindex headers.
- Sitemap references itself in robots.
- Image sitemap entries are included.

### pSEO architecture

The project has a real pSEO machine, not a loose blog:

- 650 sitemap URLs.
- Major clusters include funnel playbooks, comparisons, teardowns, pricing teardowns, alternatives, categories, glossary, benchmarks, answer pages, launch checklists, stacks, swipe files, scripts, conversion-rate pages, citations, dataset surfaces, podcast surfaces, and locale variants.
- Detail pages are data-driven from typed source files.
- Many pages have markdown mirrors, Article/FAQ/Breadcrumb schema, direct answers, visible TL;DR blocks, citations, and internal links.

Risk:

- The volume is high enough that quality control matters more than adding more URLs.
- Add crawl analytics per cluster before expanding further.

### AEO / Answer extraction

Strengths:

- Direct answer blocks.
- FAQPage and QAPage patterns.
- `People Also Ask` style components.
- Date-stamped answers.
- Speakable selectors.
- Benchmark pages answer "what is a good X" intent directly.
- FAQ uses visible, crawlable Q/A text.

Main improvement:

- Clean schema errors and localized `inLanguage`.

### GEO / LLMO

Strengths:

- `/llms.txt`
- `/.well-known/llms.txt`
- `/llms-full.txt`
- `/llms-feed.json`
- Per-model `llms.txt?model=...` variants
- Markdown mirrors
- Link canonical headers on mirrors
- MCP manifest
- OpenAPI spec
- ChatGPT plugin manifest
- Dataset JSON/CSV
- Citation permalinks
- Podcast transcripts
- Entity manifest

Main improvement:

- Keep the retrieval/citation-versus-training policy consistent as new AI surfaces are added.

### Dataset and citation SEO

This is one of the strongest parts of the project:

- Public dataset landing.
- JSON bundle.
- Full CSV and per-table CSV.
- CC-BY-4.0 licensing.
- BibTeX and citation metadata.
- Hugging Face and Zenodo handoff surfaces.
- Cite permalinks and export formats.

The next leap is off-site catalog activation: Hugging Face, Zenodo DOI, OSF/Kaggle if appropriate.

## Prioritized Remediation Roadmap

### P0 - Fixed in this remediation pass

1. `npm run build` passes in a clean checkout with safe fallbacks for public proof counters.
2. The 13 JSON-LD validator errors are fixed.
3. AI policy signals are aligned across `robots.txt`, `/ai.txt`, `/.well-known/ai-policy.json`, and `training-data-attribution` headers.
4. Localized FAQ JSON-LD `inLanguage` is fixed for `/es/*` and `/pt-BR/*`.

### P1 - Raise SEO/GEO from strong to elite

5. Activate real `sameAs` anchors.
6. Submit/activate dataset mirrors: Hugging Face first, Zenodo DOI second.
7. Wire JSON-LD validation into CI against preview deploys.
8. Run Lighthouse/PageSpeed on production pages now that build passes.
9. Add Search Console/Bing Webmaster verification envs if not already set in production.
10. Triage production dependency vulnerabilities, especially `workflow`'s `devalue`/`undici` chain and Next's transitive `postcss`.
11. Track LLM referrals and citations from ChatGPT, Perplexity, Claude, Gemini, Bing/Copilot.

### P2 - Growth and authority

12. Publish and distribute press topic pages to real journalists/newsletters.
13. Ship earned mentions into `MEDIA_MENTIONS` only after they exist.
14. Use the Dream 100 list to earn founder interviews and dataset citations.
15. Create a cluster quality dashboard: impressions, indexed count, clicks, assisted conversions, LLM citations, crawl errors by pSEO cluster.
16. Stop expanding pSEO volume until each existing cluster has at least one measurable signal.

## Final Ratings

**Overall organic visibility readiness:** 87 / 100  
**Best layer:** pSEO and dataset SEO  
**Most differentiated layer:** GEO/LLMO agent-readable infrastructure  
**Most urgent blocker:** off-domain authority activation + dependency trust debt  
**Biggest strategic risk:** relying on first-party entity proof without enough external corroboration  
**Biggest growth ceiling:** lack of off-domain entity authority and earned mentions  

The P0 layer is now fixed. If P1/P2 are activated with real off-site proof, dependency debt is reduced, and CWV passes on production, this can become a **92+ / 100** search and AI-retrieval asset.
