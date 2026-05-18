# Shipping `@unlocksaas/seo`

Single source of truth for every step that requires operator hands. Each section is a paste-ready command block.

Display timezone for any timestamps below: Europe/Athens, 24h.

---

## 0. Pre-flight

```bash
cd packages/seo
npm install
npm run build
node dist/cli/index.js validate-claims ./examples/fixture-bad.html ; echo "should print EXIT=1 above"
node dist/cli/index.js validate-claims ./examples/fixture-good.html ; echo "should print EXIT=0 above"
```

If both lines print the right exit code, the package is in shape.

---

## 1. Pick a publish identity (one-time decision)

You have three ways to publish. Pick one. Each has different downstream consequences.

### Option A — `@unlocksaas/seo` (recommended)

Best long-term. The scope matches the brand. Free on npm.

```bash
# 1. Create the npm scope (one-time, do this in browser):
#    https://www.npmjs.com/org/create
#    Pick "Free" plan, org name: unlocksaas
#    Set sales@sipiteno.com as the admin email.

# 2. Verify the scope exists:
npm org ls unlocksaas

# 3. Login on this machine if you have not already:
npm login           # interactive, requires 2FA

# 4. Publish:
cd packages/seo
npm publish --access public
```

**No change required to `package.json`.** The current config (`"name": "@unlocksaas/seo"`) is already correct.

### Option B — `unlocksaas-seo` (unscoped fallback)

Faster — no npm org creation step. Trade: less recognizable, no scope namespace if you later ship `@unlocksaas/<otherpkg>`.

```bash
# 1. Edit packages/seo/package.json:
#      "name": "unlocksaas-seo",
# 2. Publish:
cd packages/seo
npm login
npm publish              # --access public not needed; unscoped is public by default
```

### Option C — Skip npm, GitHub Packages only

Useful for private/preview testing. Not recommended for the off-page-SEO play because awesome-lists and most consumers want npmjs.com URLs.

```bash
# Create .npmrc in this directory:
echo '@kindrat86:registry=https://npm.pkg.github.com' >> .npmrc
# Then publish with GITHUB_TOKEN.
```

---

## 2. Create the standalone GitHub repo (optional but high-leverage)

Why this matters: awesome-lists and most discovery surfaces want a top-level repo URL, not a monorepo deep-link. A standalone mirror gets you the GitHub Topics SEO + stars-as-a-signal that the monorepo path can't earn.

### Option A — Use `kindrat86/unlocksaas-seo` (works today)

```bash
gh auth status                # confirm gh is logged in as kindrat86
gh repo create kindrat86/unlocksaas-seo --public --description "Honesty-first JSON-LD, llms.txt, and verification primitives. Extracted from unlocksaas.com." --homepage "https://unlocksaas.com"
```

Then mirror this directory into the new repo:

```bash
cd /tmp
git clone --no-checkout https://github.com/kindrat86/unlocksaas.git unlocksaas-seo-mirror
cd unlocksaas-seo-mirror
# Extract just the packages/seo/ history using git filter-repo (faster + cleaner than subtree split):
pip install git-filter-repo  # or: brew install git-filter-repo
git filter-repo --subdirectory-filter packages/seo
git remote add origin git@github.com:kindrat86/unlocksaas-seo.git
git push -u origin main
```

After this:

1. Update `packages/seo/package.json` `repository.url` to `git+https://github.com/kindrat86/unlocksaas-seo.git` and drop the `directory` field.
2. Update README links from `kindrat86/unlocksaas/issues` to `kindrat86/unlocksaas-seo/issues`.
3. Add a CI step to the monorepo that rsyncs `packages/seo/` to the mirror on every merge to main (or do it manually for v0.x).

### Option B — Wait until `github.com/unlocksaas` org exists

Skip the standalone mirror for now. The monorepo path works for v0.x. The package.json already lists the monorepo URL with the `directory` field, which npmjs.com renders correctly.

---

## 3. Announce (only after npm publish succeeds)

Drafts are in `packages/seo/marketing/`:

- `marketing/show-hn.md` — Hacker News submission
- `marketing/indiehackers.md` — Indie Hackers post
- `marketing/reddit-saas.md` — `/r/SaaS` post
- `marketing/reddit-programming.md` — `/r/programming` post (different angle)
- `marketing/awesome-lists.md` — pre-formatted entries for each awesome-list

### Optimal cadence

Day 0 (publish day):
- 08:00 PT (18:00 Athens) — Show HN
- After HN settles (4h+): Indie Hackers
- Day +1: /r/SaaS
- Day +3: /r/programming (different angle, avoid double-dipping)
- Day +7: open the awesome-list PRs (need at least 50 GitHub stars to clear most lists' contribution bars)

### Recommended day-of-week

Tuesday or Wednesday. Avoid Mondays (HN front page is harder), avoid Fridays (decay over weekend).

---

## 4. Wire the CI dogfood loop (already present)

The workflow at `.github/workflows/seo-audit.yml` runs on every PR. It:

1. Builds `packages/seo/` and runs the fixture smoke tests.
2. If a Vercel preview URL is detected in the PR, runs `validate-claims` against it and posts the report as a PR comment.

Activation requires only that the workflow file is on `main`. No env vars, no secrets needed for the basic loop. To enable the preview-URL audit, ensure the Vercel GitHub integration is active on this repo (it already is — confirmed by the bot comment on PR #20).

---

## 5. Rollback

```bash
# Unpublish a freshly published version (within 72h):
npm unpublish @unlocksaas/seo@0.1.0
# After 72h, npm requires deprecation instead of unpublish:
npm deprecate @unlocksaas/seo@0.1.0 "0.1.0 deprecated, see CHANGELOG"
```

---

## 6. Health checklist post-launch

- [ ] `https://www.npmjs.com/package/@unlocksaas/seo` resolves and shows the README
- [ ] `npx @unlocksaas/seo help` works in a fresh shell
- [ ] `npx @unlocksaas/seo validate-claims https://unlocksaas.com/` returns a structured report
- [ ] GitHub repo (monorepo or mirror) has the "About" sidebar pointing at unlocksaas.com
- [ ] At least one awesome-list PR opened
- [ ] Show HN posted with no fabricated claims, no "we", first-person founder voice

---

## 7. Publishing 0.1.1 (and future patch releases)

`0.1.1` (2026-05-18 evening) is committed on this branch but unpublished. It drops the meta-description drift false-positive that was causing `validate-claims --strict` to fail against every SEO-optimized page on production. See `CHANGELOG.md` for the full reasoning.

To publish:

```bash
cd packages/seo
npm whoami                        # confirm logged in as the_data_nerd
git pull                          # make sure you have the 0.1.1 commit
npm version --no-git-tag-version  # confirms package.json says 0.1.1
npm publish --access public
# prompted for 2FA OTP — paste 6-digit code from authenticator
# success line: + @unlocksaas/seo@0.1.1
```

Verification after publish:

```bash
npm view @unlocksaas/seo version           # should print 0.1.1
npx -y @unlocksaas/seo@latest help         # should run from a clean shell
npx -y @unlocksaas/seo@latest validate-claims https://unlocksaas.com/ --strict
# Expected: PASS (exit 0)
```

What 0.1.1 unblocks:

- The CI workflow at `.github/workflows/seo-audit.yml` already passes `--strict`. With 0.1.1 deployed to npm, every PR preview audit will now report drift findings as real failures instead of swallowing them.
- The 0.1.1 release is non-breaking — any consumer of 0.1.0 can upgrade with no code changes. The exit code is now more conservative (fewer false `--strict` failures), not less.

### When to bump versions

- **0.1.x patch** — bug fixes in `validate-claims` (false positives, edge cases), CLI ergonomics, README clarifications.
- **0.2.x minor** — new JSON-LD builders, new CLI subcommands, new honesty rules.
- **1.0.x major** — only after the package has been stable in CI on three real consumer sites for 60+ days. Don't rush to 1.0; the 0.x signal is honest.

### Quick-rollback for 0.1.1

If 0.1.1 breaks something nobody anticipated:

```bash
npm deprecate @unlocksaas/seo@0.1.1 "Reverted. See CHANGELOG; use 0.1.0 or 0.1.2."
```

Then fix forward to 0.1.2 — don't try to unpublish 0.1.1 once anything has installed it.
