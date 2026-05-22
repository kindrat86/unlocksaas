# Wikidata Q-ID application kit – UnlockSaaS

Operator runbook for getting `Unlock SaaS` a Wikidata Q-ID once notability
criteria are met. The Q-ID is the single highest-leverage GEO multiplier in
the entity-graph stack: Google Knowledge Graph, every major LLM training
corpus (which ingests Wikidata + Wikipedia as primary sources), Bing Copilot,
Perplexity, and Apple Intelligence all use Q-IDs to disambiguate brands.

This kit is the paste-and-go layer. It does NOT auto-submit. Wikidata
submission is human-only by design – the platform's patrollers reject
items that look automated and Brunson Hard-Rule forbids fabricated
identity claims regardless.

When the threshold gate flips to GREEN, submission takes 5 minutes via
QuickStatements. Until then, this kit stays dormant.

---

## State machine

```
┌─────────────────┐   threshold met    ┌──────────────────┐   submit    ┌────────────────┐
│  NOT-READY      │ ─────────────────► │  READY-TO-SUBMIT │ ──────────► │  SUBMITTED     │
│  (current)      │                    │                  │             │  (Q-ID issued) │
└─────────────────┘                    └──────────────────┘             └────────┬───────┘
                                                                                 │
                                                                                 │ paste Q-URL
                                                                                 ▼
                                                                        ┌────────────────┐
                                                                        │  LIVE          │
                                                                        │  schema lights │
                                                                        │  up site-wide  │
                                                                        └────────────────┘
```

### Current state: **NOT-READY**

Verified 2026-05-20 against `app/src/lib/media-mentions.ts`:
- `MEDIA_MENTIONS.length` = **0**
- Required (matches `MEDIA_BAR_MIN_COUNT` in same file): **3**
- Verified Builders (per Stripe): **0** (pre-revenue, no cycles closed)
- Wikipedia article (any language): **none**

See [notability-checklist.md](./notability-checklist.md) for the per-criterion
breakdown and the watch list of publications + podcasts that, when one of
them publishes about UnlockSaaS, would flip the gate.

---

## What this kit ships

| File | Purpose |
|---|---|
| [`notability-checklist.md`](./notability-checklist.md) | Wikidata WD:N criteria, current state per criterion, watch list |
| [`quickstatements.txt`](./quickstatements.txt) | Wikidata QuickStatements V1 paste-ready submission – verifiable facts only |
| `README.md` (this file) | Operator runbook, state machine, post-submission wiring |

---

## When the gate flips

Two paths get UnlockSaaS to READY-TO-SUBMIT:

### Path A – Earned secondary sources (most common)

Three independent, non-trivial, secondary sources publish about UnlockSaaS.
Each must satisfy:

1. **Independent** – not a press release, not paid placement, not affiliated.
2. **Non-trivial** – more than a one-line directory listing or roundup mention.
3. **Editorial oversight** – the publication has a named editor or
   moderation process (TechCrunch, The Information, Indie Hackers
   front-page feature, Hacker News front-page discussion with substantive
   thread, a podcast episode in a show with > 1k regular listeners).
4. **About UnlockSaaS** – the article names UnlockSaaS as the subject, not
   as a tangential example in a broader piece.

When a qualifying mention lands, the operator workflow is already wired:
append the row to `MEDIA_MENTIONS` in `app/src/lib/media-mentions.ts`
(workflow documented in that file's header). Once `MEDIA_MENTIONS.length >= 3`,
the funnel hub's earned-media bar auto-renders AND the Wikidata gate is GREEN.

### Path B – Wikipedia article first

Less likely for pre-revenue SaaS, but if a Wikipedia editor creates an
article about UnlockSaaS (in any language), Wikidata WD:N criterion 1 is
satisfied automatically via sitelink and the gate flips GREEN regardless of
secondary-source count.

---

## Submission process (5 minutes, when GREEN)

1. **Verify gate is GREEN.** Run the readiness check:
   ```sh
   cd app && node -e "
     const { MEDIA_MENTIONS, MEDIA_BAR_MIN_COUNT } = require('./src/lib/media-mentions.ts');
     console.log('mentions:', MEDIA_MENTIONS.length, '/', MEDIA_BAR_MIN_COUNT);
     console.log(MEDIA_MENTIONS.length >= MEDIA_BAR_MIN_COUNT ? 'GREEN' : 'NOT-READY');
   "
   ```
   (If the require fails due to TS extension, just open the file and count
   the `MEDIA_MENTIONS` array entries by eye – the check is informational.)

2. **Log in to Wikidata.** Use a Wikimedia account that has at least 4 days
   of edit history (Wikidata's autoconfirmed threshold). If you don't have
   one, create it at <https://www.wikidata.org/wiki/Special:CreateAccount>
   and make 5-10 small uncontroversial edits on existing items first to
   establish a clean edit pattern. Submitting a brand-new item from a
   zero-edit account looks like spam to patrollers.

3. **Open QuickStatements.** Go to
   <https://quickstatements.toolforge.org/#/batch> and authenticate via
   OAuth ("Sign in with Wikidata").

4. **Paste the submission.** Open [`quickstatements.txt`](./quickstatements.txt)
   in this folder. Copy its entire body into the QuickStatements text area.

5. **Run as batch.** Click "Import V1 commands", then "Run". QuickStatements
   creates the Q-item and applies each statement. Expect one new Q-ID
   (e.g. `Q123456789`) and a green per-statement success log.

6. **Note the Q-ID.** Copy the new Q-URL: `https://www.wikidata.org/wiki/Q<number>`.

7. **Activate the schema.** For a newly issued replacement Q-ID, push the
   Q-URL to Vercel:
   ```sh
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL production
   # paste: https://www.wikidata.org/wiki/Q<your-number>
   vercel env add NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL preview
   ```
   The current Q-ID (`Q139863921`) is already committed as a verified
   public default in `app/src/lib/seo/entity.ts`; the env var is now an
   override for a future canonical Q-ID change. Organization JSON-LD and
   the `/.well-known/entity.jsonld` manifest advertise the Q-URL
   automatically on the next build. Person JSON-LD remains limited to
   founder-owned profiles.

8. **Wait 24-48h for patrol.** Wikidata patrollers may flag the item for
   notability review. If flagged, respond in the talk page with the same
   three secondary sources from `MEDIA_MENTIONS`. If the item survives
   72h without deletion, it's permanent.

9. **Log the activation.** Append a row to
   `strategy/sameas-activation-playbook.md` (or whichever activation log
   the operator maintains) with the Q-ID, the submission date, and the
   three secondary sources used to clear notability. This is the audit
   trail Brunson Hard-Rule requires.

---

## Post-submission wiring (what the codebase already handles)

No further code changes needed. The verified default Q-URL, or an override
from `NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL`, flows through:

- `app/src/lib/seo/entity.ts` → `ORGANIZATION_SAME_AS` (Organization.sameAs)
- `app/src/lib/seo/entity.ts` → `ORGANIZATION_MAIN_ENTITY_OF_PAGE` only when
  Wikipedia URL is also set (currently uses `NEXT_PUBLIC_UNLOCKSAAS_WIKIPEDIA_URL`
  for the dedicated mainEntityOfPage slot, but the Q-URL also strengthens
  the schema graph via sameAs).
- `app/src/components/seo/json-ld.tsx` → embeds in Organization schema on
  every page (site-wide, via the root-layout OrganizationJsonLd).
- `app/src/app/.well-known/entity.jsonld/route.ts` → embeds in the
  canonical entity manifest.
- `app/src/app/llms-feed.json` → exposed to AI retrievers in the
  machine-typed JSON sibling.

The activation moves UnlockSaaS from "self-published entity manifest only"
to "Wikidata-anchored entity," which Knowledge Graph weights orders of
magnitude higher.

---

## If Wikidata rejects the item

Possible reasons and remedies:

| Rejection reason | Remedy |
|---|---|
| Notability not established | Wait for more secondary sources. Resubmit. Don't argue with patrollers; the bar is theirs. |
| "Promotional" tone | Rewrite the Description in `quickstatements.txt` to remove first-person, slogan-style language. The current draft already avoids this. |
| Premature P571 (inception) | Remove the `LAST	P571` line. Inception can be added later when there's a public source for the date. |
| Duplicate of existing item | Search Wikidata first: <https://www.wikidata.org/w/index.php?search=Unlock+SaaS>. If a Q-ID already exists, claim that one instead of creating a new one. |

---

## Brunson Hard-Rule reconciliation

- Every statement in `quickstatements.txt` is independently verifiable on
  the public site or in the `entity.ts` constants (single source of truth).
- No fabricated dates, no fabricated audience counts, no fabricated
  affiliations.
- The original `NOT-READY` state was the honest default before Q139863921
  existed. Now that the Q-ID is live and points at unlocksaas.com, the
  verified public default keeps fresh builds from regressing to an empty
  Organization.sameAs array.
- `NEXT_PUBLIC_UNLOCKSAAS_WIKIDATA_URL` remains available as an override
  for a future canonical Q-ID replacement; do not set it to a placeholder.

Last verified: 2026-05-22.
