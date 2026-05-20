# Indie Search Engine Submission Playbook

**Source:** [google-strategy.md §B.1 (AI-crawler policy)](./google-strategy.md) + this doc (the indie-search counterpart).
**Status:** Activation roadmap. The robots.txt allow-list ships in code; per-engine submissions are documented here and tracked in [Submission ledger](#submission-ledger) at the foot.
**Verified against engine docs:** 2026-05-21.

---

## Why this exists

Four search engines outside the Google / Bing duopoly are over-indexed by exactly the buyer demographic UnlockSaaS targets: indie hackers and solo founders who deliberately use Google alternatives. Brave (Brave browser native default for a privacy-leaning user base), Mojeek (UK-based, indie, "no tracking"), Marginalia (small-web, text-only, dev/maker audience), and Kagi (paid, opinionated, founder-and-dev concentrated).

Absolute share is tiny (low single-digit percentage each). The argument is not share; the argument is buyer-density. A founder using Kagi or Marginalia by choice is closer to the UnlockSaaS ICP than the median Google searcher.

What this playbook covers:

1. The robots.txt allow-list (shipped — verified UA tokens)
2. The per-engine submission channel reality (most are passive)
3. The Marginalia GitHub PR (the one engine that accepts manual submission for a SaaS)
4. The Brave manual form (the second engine with a submission channel; not automatable)
5. Mojeek (passive only — no submission API)
6. Kagi Small Web (UnlockSaaS is ineligible — explicit note)
7. Ongoing verification script

---

## Brunson Hard-Rule constraint

Read once, never violate:

> Only submit UnlockSaaS to channels we are actually eligible for, and never claim a submission was made until the upstream channel confirms receipt. Crawl allowlists are a one-way claim — set them. Submissions are a two-way claim — do them honestly or not at all.

Kagi Small Web is the load-bearing example: their published criteria require "personal (single-author) blog, RSS/Atom feed, no LLM-generated content." UnlockSaaS is a commercial SaaS marketing site. We do NOT submit there. Empty is the honest signal.

---

## What ships in code

**robots.txt allow-list** ([app/src/app/robots.ts](../app/src/app/robots.ts), `INDIE_SEARCH_USER_AGENTS`)

Four verified UA tokens, each traced to the engine's own crawler help page:

| Engine | UA token | Source URL |
|---|---|---|
| Brave Search | `Bravebot` | https://search.brave.com/help/brave-search-crawler |
| Mojeek | `MojeekBot` | https://www.mojeek.com/bot.html |
| Marginalia | `search.marginalia.nu` | https://about.marginalia-search.com/article/crawler/ |
| Kagi | `Kagibot` | https://kagi.com/bot |

Each token gets the same Allow/Disallow shape as the AI-crawler block — public marketing yes, authenticated/transactional no. Sitemap reference is shared, so the indie crawlers see the same auto-extending pSEO catalog as the rest.

**Why allow-list at all when the default `*` rule already allows them?** Two reasons. First, explicit allow gives us a single per-engine row in robots.txt to apply per-engine Disallow tweaks later (e.g., excluding a specific surface from Mojeek but not Brave). Second, several of these engines log "did this site explicitly allow our bot?" as an editorial signal — Marginalia in particular weights it.

---

## Per-engine submission reality

### Brave Search

- **Channel:** Manual form at https://search.brave.com/submit-url
- **Mechanics:** Browser-only form. CAPTCHA-gated. No documented programmatic POST endpoint.
- **IndexNow:** Not a participant as of 2026-05-21.
- **What to do:** One-time, operator-driven, browser session. Submit the canonical homepage URL once production is stable and the `/builders` Suspense fix has landed. Track in the ledger.
- **Discovery fallback:** Brave Search has historically also ingested Bing's index; Bingbot allow-listed via AI_USER_AGENTS already covers indirect discovery.

### Mojeek

- **Channel:** None. From Mojeek's own blog: "Mojeek automatically discovers websites during its crawl of the web, for this reason there is currently no way to manually submit your site to Mojeek."
- **What to do:** Nothing active. The robots.txt allow-list + sitemap referenced in the allow-list is the entire signal Mojeek consumes. Ongoing verification (below) confirms presence.
- **IndexNow:** Not a participant.

### Marginalia

- **Channel:** GitHub PR to [MarginaliaSearch/submit-site-to-marginalia-search](https://github.com/MarginaliaSearch/submit-site-to-marginalia-search) — add the canonical URL to `sites.txt`, commit, open PR.
- **Mechanics:** Standard fork + PR flow.
- **Criteria:** Marginalia targets non-commercial, text-first, low-bloat sites. UnlockSaaS qualifies as "founder tooling with editorial content" — borderline but plausible. The dataset publication and the glossary make the editorial-density case.
- **IndexNow:** Not a participant.
- **What to do:** Open the PR. Track URL + status in the ledger.

### Kagi

- **Crawler:** Kagi runs `Kagibot` directly (not pure federation as previously assumed). Falls back to Googlebot directives if no `Kagibot` rule. Robots.txt allow-list ships with `Kagibot` explicit.
- **Small Web channel:** [kagisearch/smallweb](https://github.com/kagisearch/smallweb) — but the criteria are: "personal (single-author) blog, RSS/Atom feed, no LLM-generated content, recent post within 12 months, must add 2 other non-yours sites in the same commit." UnlockSaaS is a commercial SaaS — ineligible.
- **General feedback:** https://kagifeedback.org or vlad@kagi.com — for suggestions, not submissions.
- **IndexNow:** Not a participant.
- **What to do:** Nothing. Discovery happens via Kagibot crawl + Kagi's federation from other indexes (Brave is one of their upstream APIs). The robots.txt allow-list is the full code surface.

---

## Ongoing verification

[scripts/verify-indie-search-presence.py](../scripts/verify-indie-search-presence.py) is the operator-side check. Run it monthly. It:

1. HEAD-checks each engine's documented crawler help page (URLs above) to detect if the engine has changed its docs or moved the UA token.
2. Greps `app/src/app/robots.ts` to confirm the four UA tokens are still present (regression gate).
3. Probes each engine for `site:unlocksaas.com` where the engine exposes such a query (Brave + Mojeek + Marginalia all support it; Kagi requires a paid account, skipped).
4. Reports a status block in Athens local time (DD-MM-YYYY HH:MM:SS) for log consistency with the rest of the operator tooling.

Honest failure modes: the script reports "not indexed yet" or "engine UA token doc returned 404" rather than fabricating a positive result. Mirrors the rigor of [scripts/log-mention.py](../scripts/log-mention.py).

---

## Submission ledger

Format: append-only. Add a row when an action is taken. Do not edit historical rows.

| Date (Athens) | Engine | Action | Channel URL | PR / receipt URL | Verified? |
|---|---|---|---|---|---|
| 21-05-2026 | All four | robots.txt allow-list shipped | [robots.ts](../app/src/app/robots.ts) | n/a (in-repo) | Yes (build-time) |
| 21-05-2026 | Marginalia | GitHub PR to sites.txt | https://github.com/MarginaliaSearch/submit-site-to-marginalia-search | https://github.com/MarginaliaSearch/submit-site-to-marginalia-search/pull/553 | Pending merge |
| _pending_ | Brave | Submit-URL form (manual, browser) | https://search.brave.com/submit-url | _pending_ | _pending_ |
| n/a | Mojeek | Passive discovery (no submission API exists) | https://www.mojeek.com/bot.html | n/a | n/a |
| n/a | Kagi | Ineligible for Small Web (commercial SaaS); passive Kagibot crawl only | https://kagi.com/bot | n/a | n/a |
