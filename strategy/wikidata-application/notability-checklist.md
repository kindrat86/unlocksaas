# Wikidata notability checklist – UnlockSaaS

Per Wikidata's notability policy (WD:N), an item is notable if it satisfies
at least one of the following criteria:

1. **Sitelink** – the item links to a page on Wikipedia, Wikinews, Wiktionary,
   Wikibooks, Wikiquote, Wikisource, Wikispecies, Wikivoyage, or
   Wikiversity in any language.
2. **Clearly identifiable entity** – the item refers to an instance of a
   clearly identifiable conceptual or material entity that can be described
   using **serious and publicly available references**.
3. **Structural need** – the item fulfils some structural need, e.g. it is
   needed as the value of an item statement on a different notable item.

This file tracks UnlockSaaS against each criterion. The Wikidata application
gate flips GREEN the moment any one criterion is satisfied.

Reference: <https://www.wikidata.org/wiki/Wikidata:Notability>

---

## Criterion 1 – Wikipedia sitelink

**Current state: ✗ NOT MET**

No Wikipedia article exists about Unlock SaaS in any language. Verified
2026-05-20 by direct search:

- English Wikipedia: <https://en.wikipedia.org/wiki/Special:Search?search=Unlock+SaaS> – no result
- Spanish Wikipedia: <https://es.wikipedia.org/wiki/Special:Search?search=Unlock+SaaS> – no result
- Portuguese Wikipedia: <https://pt.wikipedia.org/wiki/Special:Search?search=Unlock+SaaS> – no result

Pre-revenue SaaS rarely qualifies for Wikipedia in its own right – Wikipedia's
notability bar (WP:CORP / WP:NCORP) is significantly higher than Wikidata's.
This criterion is unlikely to be satisfied first; criterion 2 is the realistic
path.

---

## Criterion 2 – Clearly identifiable entity with serious public references

**Current state: ✗ NOT MET (0 / 3 sources)**

UnlockSaaS is clearly identifiable (one domain, one founder, one slogan, one
product, one stable canonical entity manifest at
<https://unlocksaas.com/.well-known/entity.jsonld>). The blocking question is
"serious and publicly available references" – Wikidata interprets this as
non-trivial coverage in independent secondary sources with editorial oversight.

### The bar

| Requirement | Convention |
|---|---|
| Minimum source count | 3 (mirrors `MEDIA_BAR_MIN_COUNT` in `app/src/lib/media-mentions.ts`) |
| Independence | No press releases, no paid placements, no founder-authored content |
| Non-trivial | More than a one-line directory listing or single-sentence mention in a roundup |
| Editorial oversight | Publication has a named editor or established moderation process |
| About the subject | Article names UnlockSaaS as the subject, not a tangential example |

### Sources counted so far

```
$ grep -c "publication:" app/src/lib/media-mentions.ts
0
```

Source: `MEDIA_MENTIONS` array in `app/src/lib/media-mentions.ts` (verified 2026-05-20).

---

## Criterion 3 – Structural need

**Current state: ✗ NOT MET (and unlikely to apply)**

Criterion 3 typically covers things like "this item is the value of a
statement on another notable item." UnlockSaaS does not currently appear as
the value of any statement on any Wikidata item, so this criterion is
moot. It could theoretically activate if e.g. a Wikidata item about
Russell Brunson or about a notable customer named UnlockSaaS in a
statement (P127 owned by, P50 author, P710 participant), but that is
downstream of the founder + product getting independent coverage – which
is criterion 2 anyway.

---

## Watch list – publications + shows that, if they cover UnlockSaaS, count

This is the list of outlets a single feature in which would qualify as a
"serious public reference." The list is curated for editorial oversight, not
audience size. A single Indie Hackers homepage feature with substantive
content counts; a hundred no-name Medium posts do not.

### Tier A – instant criterion-2 satisfaction (any one + 2 of tier B)

- TechCrunch
- The Information
- Bloomberg / Reuters / Financial Times tech desk
- Wired
- MIT Technology Review
- IEEE Spectrum
- Hacker News front page (top 30 for > 4 hours, with substantive comment thread)
- Indie Hackers homepage feature (not just a community post)
- Product Hunt #1 of the day with editorial writeup

### Tier B – counts as one secondary source

- Substantive podcast episode (named show with > 1k regular listeners),
  e.g. Indie Hackers Podcast, My First Million, Lenny's Podcast,
  Default Alive, Acquired, The Twenty Minute VC, This Week in Startups.
- Substack newsletter feature in a publication with > 5k subscribers,
  e.g. Lenny's Newsletter, The Pragmatic Engineer, Stratechery,
  Not Boring, Newcomer.
- Trade-publication feature with named editor:
  SaaStr, SaaS Mag, Forrester / Gartner blog post,
  IndieMag, Failory case study.

### What does NOT count

- Founder-authored guest posts (not independent).
- "10 best SaaS playbooks" roundup with one paragraph (trivial mention).
- Affiliate-driven review (not editorially independent).
- AI-generated content farm (no editorial oversight).
- Reddit / X / LinkedIn user posts (not a publication).
- Press release republished verbatim by a newswire (not editorial).

---

## Gate flip procedure

When the threshold gate flips:

1. Verify `MEDIA_MENTIONS.length >= 3` in
   `app/src/lib/media-mentions.ts`.
2. Verify each mention satisfies the per-source bar (independent + non-trivial
   + editorial oversight + about-subject).
3. Open [`README.md`](./README.md) and follow the **Submission process**
   section.

The codebase's `MEDIA_MENTIONS` array is the single source of truth – the
same array that controls whether the funnel hub renders the earned-media bar.
If the bar is rendering, the Wikidata gate is GREEN. If the bar is hidden,
the Wikidata gate is RED. The two signals cannot drift by construction.

Last verified: 2026-05-20.
