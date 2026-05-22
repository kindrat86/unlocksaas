# Crawler Citation Audit

**Generated:** 2026-05-22T19:19:30.415Z
**Base URL:** `https://unlocksaas.com`
**Total combinations:** 627 (33 URLs × 19 user-agents)
**Passed:** 171
**Failed:** 456

## Summary by user-agent

| User-Agent | Pass | Fail |
|---|---:|---:|
| ✗ `Chrome/Browser-Baseline` | 9 | 24 |
| ✗ `OAI-SearchBot` | 9 | 24 |
| ✗ `ChatGPT-User` | 9 | 24 |
| ✗ `ClaudeBot` | 9 | 24 |
| ✗ `Claude-SearchBot` | 9 | 24 |
| ✗ `Claude-Web` | 9 | 24 |
| ✗ `Claude-User` | 9 | 24 |
| ✗ `anthropic-ai` | 9 | 24 |
| ✗ `GoogleOther` | 9 | 24 |
| ✗ `PerplexityBot` | 9 | 24 |
| ✗ `Perplexity-User` | 9 | 24 |
| ✗ `Applebot` | 9 | 24 |
| ✗ `DuckAssistBot` | 9 | 24 |
| ✗ `MistralAI-User` | 9 | 24 |
| ✗ `YouBot` | 9 | 24 |
| ✗ `cohere-ai` | 9 | 24 |
| ✗ `Bravebot` | 9 | 24 |
| ✗ `MojeekBot` | 9 | 24 |
| ✗ `Kagibot` | 9 | 24 |

## Summary by URL

| URL | Pass | Fail |
|---|---:|---:|
| ✓ `/` | 19 | 0 |
| ✗ `/about` | 0 | 19 |
| ✗ `/faq` | 0 | 19 |
| ✗ `/press` | 0 | 19 |
| ✗ `/editorial-policy` | 0 | 19 |
| ✗ `/founding` | 0 | 19 |
| ✗ `/stories` | 0 | 19 |
| ✓ `/dont-buy-unlock-saas` | 19 | 0 |
| ✓ `/diagnostic` | 19 | 0 |
| ✗ `/playbook-sales` | 0 | 19 |
| ✗ `/starter` | 0 | 19 |
| ✓ `/glossary` | 19 | 0 |
| ✗ `/alternatives-to` | 0 | 19 |
| ✗ `/compare` | 0 | 19 |
| ✗ `/funnel-teardown` | 0 | 19 |
| ✗ `/pricing-teardown` | 0 | 19 |
| ✗ `/category` | 0 | 19 |
| ✗ `/for` | 0 | 19 |
| ✗ `/stack-for` | 0 | 19 |
| ✗ `/benchmarks` | 0 | 19 |
| ✗ `/funnel-playbook` | 0 | 19 |
| ✗ `/answers` | 0 | 19 |
| ✗ `/why-isnt-my` | 0 | 19 |
| ✗ `/press/topics` | 0 | 19 |
| ✓ `/glossary/hook` | 19 | 0 |
| ✓ `/benchmarks/landing-page-conversion-rate` | 19 | 0 |
| ✗ `/stack-for/saas-founders` | 0 | 19 |
| ✗ `/state-of-saas` | 0 | 19 |
| ✓ `/four-indie-search-engines` | 19 | 0 |
| ✗ `/dataset` | 0 | 19 |
| ✗ `/podcast` | 0 | 19 |
| ✓ `/es/faq` | 19 | 0 |
| ✓ `/pt-BR/faq` | 19 | 0 |

## ⚠️  UA-divergent failures (CRITICAL)

These URLs serve different content to different user-agents. That is the exact bug class this audit was built to catch: it means a crawler sees less than a browser does.

### `/starter`

| User-Agent | Failed checks |
|---|---|
| `Chrome/Browser-Baseline` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `OAI-SearchBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `ChatGPT-User` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `ClaudeBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Claude-SearchBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Claude-Web` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Claude-User` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `anthropic-ai` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `GoogleOther` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `PerplexityBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Perplexity-User` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Applebot` | og-image-present |
| `DuckAssistBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `MistralAI-User` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `YouBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `cohere-ai` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Bravebot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `MojeekBot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |
| `Kagibot` | h1-present, body-text-substantive, og-image-present, no-empty-shell |

## Per-URL failures (uniform across UAs)

For these URLs, every tested user-agent fails on the SAME set of checks. The fix lives in the page's metadata or render output, not in a UA gate.

### `/about`

- HTTP: 200 · bytes: 74602 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/about'
```

### `/faq`

- HTTP: 200 · bytes: 79387 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/faq'
```

### `/press`

- HTTP: 200 · bytes: 119005 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/press'
```

### `/editorial-policy`

- HTTP: 200 · bytes: 61571 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/editorial-policy'
```

### `/founding`

- HTTP: 200 · bytes: 64499 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/founding'
```

### `/stories`

- HTTP: 200 · bytes: 78487 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/stories'
```

### `/playbook-sales`

- HTTP: 200 · bytes: 237337 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/playbook-sales'
```

### `/alternatives-to`

- HTTP: 200 · bytes: 100866 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/alternatives-to'
```

### `/compare`

- HTTP: 200 · bytes: 210965 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/compare'
```

### `/funnel-teardown`

- HTTP: 200 · bytes: 141154 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/funnel-teardown'
```

### `/pricing-teardown`

- HTTP: 200 · bytes: 137216 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/pricing-teardown'
```

### `/category`

- HTTP: 200 · bytes: 82467 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/category'
```

### `/for`

- HTTP: 200 · bytes: 78976 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/for'
```

### `/stack-for`

- HTTP: 200 · bytes: 80755 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/stack-for'
```

### `/benchmarks`

- HTTP: 200 · bytes: 97298 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/benchmarks'
```

### `/funnel-playbook`

- HTTP: 200 · bytes: 119512 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/funnel-playbook'
```

### `/answers`

- HTTP: 200 · bytes: 95042 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/answers'
```

### `/why-isnt-my`

- HTTP: 200 · bytes: 144904 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/why-isnt-my'
```

### `/press/topics`

- HTTP: 200 · bytes: 84715 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/press/topics'
```

### `/stack-for/saas-founders`

- HTTP: 200 · bytes: 92133 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/stack-for/saas-founders'
```

### `/state-of-saas`

- HTTP: 200 · bytes: 48408 · affected user-agents: 19/19
- ✗ **hreflang-present** — hreflang-count=0

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/state-of-saas'
```

### `/dataset`

- HTTP: 200 · bytes: 109644 · affected user-agents: 19/19
- ✗ **og-image-present** — no og:image

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/dataset'
```

### `/podcast`

- HTTP: 200 · bytes: 52108 · affected user-agents: 19/19
- ✗ **canonical-present** — no canonical link
- ✗ **og-image-present** — no og:image
- ✗ **hreflang-present** — hreflang-count=0

Reproduce:
```bash
curl -sI -A 'PerplexityBot' 'https://unlocksaas.com/podcast'
```

## What was checked

Each (URL × user-agent) combination was tested against 12 checks:

1. `http-200` — server returned 200 OK
2. `content-type-html` — Content-Type includes `text/html`
3. `content-type-charset` — Content-Type declares a charset
4. `title-nonempty` — non-empty `<title>` element
5. `meta-description` — non-empty `<meta name="description">`
6. `h1-present` — at least one `<h1>`
7. `body-text-substantive` — `<main>` text length ≥ 800 chars (catches empty shells)
8. `json-ld-present` — at least one JSON-LD block
9. `canonical-present` — `<link rel="canonical">` declared
10. `og-image-present` — `<meta property="og:image">` declared
11. `hreflang-present` — at least one hreflang alternate
12. `no-empty-shell` — `<main>` is not just an empty mount point
13. `not-noscript-required` — substantive content lives outside `<noscript>`

User-agents tested (19):

- `Chrome/Browser-Baseline`
- `OAI-SearchBot`
- `ChatGPT-User`
- `ClaudeBot`
- `Claude-SearchBot`
- `Claude-Web`
- `Claude-User`
- `anthropic-ai`
- `GoogleOther`
- `PerplexityBot`
- `Perplexity-User`
- `Applebot`
- `DuckAssistBot`
- `MistralAI-User`
- `YouBot`
- `cohere-ai`
- `Bravebot`
- `MojeekBot`
- `Kagibot`
