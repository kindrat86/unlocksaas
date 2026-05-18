# Awesome-list submission entries

Pre-formatted entries for each list, with the exact section to insert into.
Each list has different contribution rules — follow them or the PR gets closed.

Open these PRs **only after** the package has at least 50 GitHub stars,
otherwise most maintainers reject as "too new."

---

## awesome-seo

**Repo:** https://github.com/marioluan/awesome-seo

**Section to edit:** `README.md` → search for `## Tools` or `## Libraries`.
Most awesome-seo forks use a flat `## Tools` list.

**Entry to add (alphabetical placement, before existing entries that start with later letters):**

```markdown
- [@unlocksaas/seo](https://github.com/kindrat86/unlocksaas-seo) - Honesty-first JSON-LD, llms.txt, and verification primitives. Includes a `validate-claims` CLI that diffs schema against rendered HTML. MIT.
```

**Commit message:**

```
Add @unlocksaas/seo
```

**PR body:**

```
Adds @unlocksaas/seo — a TypeScript library for emitting honest JSON-LD
plus a CLI that audits deployed pages for schema-vs-rendered drift.
MIT licensed. Active. Documented.
```

---

## awesome-nextjs

**Repo:** https://github.com/unicodeveloper/awesome-nextjs

**Section to edit:** `README.md` → `## Resources` → `### Tools`.

**Entry:**

```markdown
- [@unlocksaas/seo](https://github.com/kindrat86/unlocksaas-seo) — Drop-in JSON-LD, hreflang, llms.txt, and verification helpers for Next.js App Router. Includes a `validate-claims` CLI.
```

---

## awesome-typescript

**Repo:** https://github.com/dzharii/awesome-typescript

**Section to edit:** `README.md` → look for the most recently merged PR to identify the active section. Usually `## Libraries` or `## Tools`.

**Entry:**

```markdown
- [@unlocksaas/seo](https://github.com/kindrat86/unlocksaas-seo) — Framework-free TypeScript primitives for honest schema.org JSON-LD, with a `validate-claims` CLI for CI.
```

---

## awesome-llms / awesome-ai-tools (GEO-adjacent)

**Repos:**

- https://github.com/Hannibal046/Awesome-LLM
- https://github.com/mahseema/awesome-ai-tools
- https://github.com/EgoAlpha/prompt-in-context-learning (more research-leaning, skip)

**Entry for both:**

```markdown
- [@unlocksaas/seo](https://github.com/kindrat86/unlocksaas-seo) — Generate `/llms.txt` and `/llms-feed.json` for AI-discoverable websites. Brunson Hard-Rule discipline: no fabricated claims, dated freshness, registry-gated hreflang.
```

---

## awesome-nodejs / awesome-nodejs-cli

**Repo:** https://github.com/sindresorhus/awesome-nodejs

**Section:** `## CLI` → `### Apps`.

**Entry:**

```markdown
- [unlocksaas-seo](https://github.com/kindrat86/unlocksaas-seo) - Audit deployed pages for fabricated JSON-LD and schema-vs-rendered drift.
```

**Note:** Sindre's contribution bar is high. Read https://github.com/sindresorhus/awesome/blob/main/contributing.md
before opening. Likely requires:
- README has a logo
- Continuous activity (commits in last 30 days)
- Open issues/PRs being responded to
- The package itself solves a real problem (this is the easiest hurdle)
- Listed in alphabetical order with a `-` (not `*`) bullet and capital-first description

---

## awesome-schema-org / awesome-structured-data

**Note:** No widely-followed awesome-list exists for schema.org specifically (verified via search 2026-05-18). The closest is:

- https://github.com/google/structured-data-testing-tool (Google's own, not a list)

**Action:** Skip this category. Instead, open an issue on Yandex's `schema.org-json-ld-validator` repo if @unlocksaas/seo would be a useful complementary tool. Do not fabricate listings.

---

## awesome-static-analysis

**Repo:** https://github.com/analysis-tools-dev/static-analysis

**Section:** `tools.yml` (it's a YAML-driven static site).

**Entry to add:**

```yaml
- name: '@unlocksaas/seo'
  categories:
    - other
  languages:
    - html
  other:
    - seo
    - structured-data
  homepage: https://github.com/kindrat86/unlocksaas-seo
  description: 'CLI that audits deployed pages for fabricated JSON-LD and drift between schema and rendered HTML. Exits non-zero on violations.'
  license: MIT
  source: https://github.com/kindrat86/unlocksaas-seo
```

This list's maintainer (analysis-tools-dev) reviews via the auto-generated PR
template. Submission is YAML, no markdown, less friction than the others.

---

## Tracking sheet

Use this to track PRs after they're opened:

| List | PR URL | Status | Notes |
|---|---|---|---|
| awesome-seo | | | |
| awesome-nextjs | | | |
| awesome-typescript | | | |
| awesome-llms | | | |
| awesome-ai-tools | | | |
| awesome-nodejs | | | strict criteria, last |
| awesome-static-analysis | | | YAML PR, easiest |

Open the easiest two first (awesome-static-analysis, awesome-llms) to
prove the package is real before approaching the higher-bar lists.
