/**
 * State of UnlockSaaS – live editorial snapshot.
 *
 * Surface C (linkable asset / off-page lift) addition – 2026-05-21.
 *
 * Why this module exists
 * ----------------------
 * /state-of-saas/snapshot is the dashboard surface that gives researchers, AI
 * citation pipelines, and indie founders a single dated machine- and
 * human-readable snapshot of every editorial signal UnlockSaaS exposes:
 * pSEO surface size, Brunson glossary depth, dataset row counts,
 * Knowledge-Graph anchor counts, locale coverage, earned-media count,
 * and the shipped/operator/gated activation state of every surface.
 *
 * Without it, the same facts live in twelve different module-level
 * arrays (catalog files, MEDIA_MENTIONS, ORGANIZATION_SAME_AS, the i18n
 * registry, the activation log) – discoverable only by walking the
 * repo. With it, the dashboard exposes the same facts as a single
 * `DataFeed` + `Dataset` JSON-LD node Google Dataset Search, AI
 * Overviews, and Perplexity-style retrievers can ingest in one fetch.
 * Each row becomes an `Observation` with `observationDate`,
 * `measuredProperty`, and `measuredValue` – the schema.org shape a
 * downstream citer recognises as quantitative ground truth.
 *
 * Update cadence
 * --------------
 * The underlying counts auto-refresh on every Vercel deploy because
 * each `value` is computed from a module-level constant array
 * (`GLOSSARY_SLUGS.length`, `ORGANIZATION_SAME_AS.length`, …). The
 * editorial cadence is monthly – every SNAPSHOT_REVIEW_CADENCE_DAYS
 * days a human re-reads the snapshot end-to-end against the underlying
 * catalogs and bumps SNAPSHOT_LAST_VERIFIED_DATE so the dashboard
 * carries an explicit "this snapshot was human-attested on X" anchor
 * separate from the build-time deploy stamp.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every observation `value` comes from a real, importable constant
 *     somewhere in this codebase. No fabricated metrics, no estimated
 *     ranges, no inferred user counts, no traffic numbers.
 *   - Honest zero-state by construction: a count of zero (earned-media
 *     mentions, off-platform sameAs anchors, external dataset catalogs)
 *     ships as `value: 0` – never hidden, never rounded up, never
 *     replaced with "coming soon". A reader of the dashboard can tell
 *     at a glance which signals are real and which are still gated on
 *     operator activation or evidence triggers.
 *   - The integrity gate (validateSnapshot below) runs at module load
 *     and refuses to start the server if any row violates the contract
 *     (non-negative integer, valid ISO date, unique key, non-empty
 *     label, valid https sourceUrl). Impossible to ship a malformed
 *     observation row.
 *   - `asOf` mirrors the underlying catalog's own freshness anchor
 *     where one exists (GLOSSARY_LATEST_VERIFIED for the glossary,
 *     etc.) – the dashboard never claims a freshness signal stronger
 *     than what the source row actually carries.
 *
 * Schema.org shape
 * ----------------
 * The dashboard renders three JSON-LD blocks (see
 * `SnapshotJsonLd` in components/seo/json-ld.tsx):
 *
 *   1. `Dataset` – the dashboard itself, a citable artifact with a
 *      stable URL, version, license, and creator/publisher @ids.
 *   2. `DataFeed` – the stream of dated observations, with
 *      `dataFeedElement` listing each Observation as a `DataFeedItem`.
 *   3. `BreadcrumbList` – two-deep navigation from /.
 *
 * Discovery
 * ---------
 *   - Listed in /sitemap.xml at priority 0.55 (above /dataset's
 *     supporting downloads, below the canonical /dataset landing).
 *   - Linked from /llms.txt under "## State of UnlockSaaS".
 *   - Mentioned in the markdown alternate at /state-of-saas/snapshot.md
 *     (handled by the existing markdownAlternate helper).
 *   - Crawlable by every AI user-agent on the /robots.txt allow-list.
 */

import { ALTERNATIVES, ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { ANSWER_ENTRIES, ANSWER_SLUGS } from "@/lib/answers";
import { SHOULD_I_ENTRIES, SHOULD_I_SLUGS } from "@/lib/should-i";
import { BENCHMARK_ENTRIES, BENCHMARK_SLUGS } from "@/lib/benchmarks";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/categories";
import { COMPARISONS, COMPARISON_SLUGS } from "@/lib/comparisons";
import {
  FUNNEL_PLAYBOOK_ENTRIES,
  FUNNEL_PLAYBOOK_SLUGS,
} from "@/lib/funnel-playbooks";
import { TEARDOWNS, TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { GLOSSARY, GLOSSARY_SLUGS } from "@/lib/glossary";
import { NICHE_ENTRIES, NICHE_SLUGS } from "@/lib/niches";
import { PRESS_TOPICS, PRESS_TOPIC_SLUGS } from "@/lib/press-topics";
import {
  PRICING_TEARDOWNS,
  PRICING_TEARDOWN_SLUGS,
} from "@/lib/pricing-teardowns";
import { WHY_ISNT_MY_ENTRIES, WHY_ISNT_MY_SLUGS } from "@/lib/why-isnt-my";
import {
  allApprovedTranslations,
  localesWithApprovedContent,
} from "@/lib/i18n/registry";
import { getEarnedMentions } from "@/lib/media-mentions";
import {
  BASE_URL,
  DATASET_EXTERNAL_REGISTRATIONS,
  DEFINED_TERMS,
  KNOWS_ABOUT,
  MENTIONED_ENTITIES,
  ORGANIZATION_SAME_AS,
} from "@/lib/seo/entity";
import { DATASET_BUNDLE } from "@/lib/seo/dataset";
import { ACTIVATION_LOG } from "@/lib/seo/freshness";

// ---------------------------------------------------------------------------
// Stable freshness anchors
// ---------------------------------------------------------------------------

/**
 * The date the dashboard was last re-read end-to-end by a human and
 * confirmed accurate against the underlying catalogs and constants.
 *
 * Update cadence: every SNAPSHOT_REVIEW_CADENCE_DAYS days
 * (see SNAPSHOT_NEXT_REVIEW_DATE below). Format: ISO 8601 date
 * (YYYY-MM-DD), UTC.
 *
 * Operator workflow for bumping this date:
 *   1. Re-read /state-of-saas/snapshot end-to-end against each underlying
 *      catalog (GLOSSARY, BENCHMARK_ENTRIES, …) and the freshness
 *      module's ACTIVATION_LOG.
 *   2. Spot-check three randomly picked observation rows: visit the
 *      `sourceUrl`, confirm the live page reflects the listed count.
 *   3. Confirm the strategy lock + audit dates carried in
 *      src/lib/seo/freshness.ts still match this file's category
 *      breakdown.
 *   4. Bump SNAPSHOT_LAST_VERIFIED_DATE to today's UTC date.
 *   5. Commit with message: `chore(state-of-saas): monthly snapshot review`.
 */
export const SNAPSHOT_LAST_VERIFIED_DATE = "2026-05-20";

/**
 * Snapshot review cadence in days. Monthly so the dashboard reflects
 * a freshness signal one tier sharper than the quarterly /llms.txt
 * review (REVIEW_CADENCE_DAYS = 90 in src/lib/seo/freshness.ts).
 * The underlying counts auto-refresh on every deploy; the cadence is
 * the human-attested-correctness cycle, not the value-refresh cycle.
 */
export const SNAPSHOT_REVIEW_CADENCE_DAYS = 30;

/**
 * Computed next-review date. Recomputed at module load so a build
 * shipping after the prior review window emits a deterministic next
 * stamp without a manual edit.
 */
export const SNAPSHOT_NEXT_REVIEW_DATE: string = (() => {
  const last = new Date(`${SNAPSHOT_LAST_VERIFIED_DATE}T00:00:00Z`);
  last.setUTCDate(last.getUTCDate() + SNAPSHOT_REVIEW_CADENCE_DAYS);
  return last.toISOString().slice(0, 10);
})();

/**
 * SemVer for the snapshot. Mirrors the dataset versioning contract:
 * additive observation rows bump `patch`; removed or renamed rows
 * bump `minor` and publish a migration note; structural shape changes
 * to the SnapshotObservation interface bump `major`.
 */
export const SNAPSHOT_VERSION = "1.0.0" as const;

/**
 * Public stable slug for the snapshot. Used in JSON-LD identifier.
 *
 * Distinct from the parent `state-of-saas` namespace (which hosts the
 * annual report index at `/state-of-saas` and per-year reports at
 * `/state-of-saas/<year>`). The snapshot lives at `/state-of-saas/snapshot`
 * as the live monthly companion to those yearly editions.
 */
export const SNAPSHOT_SLUG = "state-of-saas-snapshot" as const;

/** Display name for the dashboard – appears in DataFeed.name + Dataset.name. */
export const SNAPSHOT_NAME =
  "State of UnlockSaaS – Live Editorial Snapshot" as const;

/** Canonical URL of the dashboard surface. */
export const SNAPSHOT_URL = `${BASE_URL}/state-of-saas/snapshot` as const;

/** Markdown mirror URL – served via the markdownAlternate helper. */
export const SNAPSHOT_MD_URL = `${BASE_URL}/state-of-saas/snapshot.md` as const;

// ---------------------------------------------------------------------------
// Observation type
// ---------------------------------------------------------------------------

/**
 * Observation category. Keeps the dashboard groupable: editorial
 * (catalog row counts), authority (topical-expertise anchors), entity
 * graph (Knowledge-Graph signals), international (locale coverage),
 * earned media, activation state (shipped vs operator vs gated).
 */
export type SnapshotCategory =
  | "editorial-corpus"
  | "topical-authority"
  | "entity-graph"
  | "international"
  | "earned-media"
  | "activation-state";

/**
 * A single dated observation row. Each becomes one schema.org
 * `Observation` inside the DataFeed.
 *
 * Fields:
 *   - `key`        snake_case stable machine key; never changes once shipped.
 *                  Used as the `name` of the Observation schema and as the
 *                  JSON-LD `additionalProperty.propertyID`.
 *   - `category`   one of SnapshotCategory above.
 *   - `label`      short human-readable label rendered on the dashboard.
 *   - `value`      the measured value (non-negative integer).
 *   - `unit`       human-readable unit ("pages", "terms", "locales", …).
 *                  Mirrors UN/CEFACT or QUDT where applicable.
 *   - `description` one-sentence description for the dashboard body and
 *                   the Observation `description` field.
 *   - `sourceUrl`  optional canonical URL where the value is independently
 *                  verifiable. Mirrors schema.org `Observation.isBasedOn`.
 *   - `asOf`       ISO date the value was current as of. For counts derived
 *                  from a freshness-tracked catalog (glossary,
 *                  benchmarks), this mirrors the catalog's own
 *                  `lastVerified` aggregate. For counts derived from
 *                  module-level constants without their own freshness
 *                  anchor, this falls back to SNAPSHOT_LAST_VERIFIED_DATE.
 */
export interface SnapshotObservation {
  readonly key: string;
  readonly category: SnapshotCategory;
  readonly label: string;
  readonly value: number;
  readonly unit: string;
  readonly description: string;
  readonly sourceUrl?: string;
  readonly asOf: string;
}

// ---------------------------------------------------------------------------
// Aggregate helpers
// ---------------------------------------------------------------------------

/**
 * Reduce a catalog of objects each carrying a `lastVerified` ISO string
 * to the latest date observed. Returns SNAPSHOT_LAST_VERIFIED_DATE
 * as the fallback when the catalog is empty (e.g. a future surface ships
 * empty before its first row lands).
 *
 * Hoisted to the module scope per `server-hoist-static-io` from the
 * React Best Practices guide – called once per import, never per render.
 */
function latestLastVerified(
  rows: ReadonlyArray<{ lastVerified?: string }>,
  fallback: string,
): string {
  if (rows.length === 0) return fallback;
  let latest = fallback;
  for (const r of rows) {
    if (r.lastVerified && r.lastVerified > latest) latest = r.lastVerified;
  }
  return latest;
}

/**
 * Aggregate freshness anchors for catalogs that already carry per-row
 * `lastVerified` ISO dates. Each is the date of the most recently
 * audited row in that catalog – the dashboard surfaces this as the
 * Observation's `asOf`, not the deploy time.
 */
const GLOSSARY_AS_OF: string = latestLastVerified(
  GLOSSARY,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const BENCHMARK_AS_OF: string = latestLastVerified(
  BENCHMARK_ENTRIES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const FUNNEL_TEARDOWN_AS_OF: string = latestLastVerified(
  TEARDOWNS,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const PRICING_TEARDOWN_AS_OF: string = latestLastVerified(
  PRICING_TEARDOWNS,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const COMPARISON_AS_OF: string = latestLastVerified(
  COMPARISONS,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const ALTERNATIVE_AS_OF: string = latestLastVerified(
  ALTERNATIVES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const ANSWER_AS_OF: string = latestLastVerified(
  ANSWER_ENTRIES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const SHOULD_I_AS_OF: string = latestLastVerified(
  SHOULD_I_ENTRIES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const WHY_ISNT_MY_AS_OF: string = latestLastVerified(
  WHY_ISNT_MY_ENTRIES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const NICHE_AS_OF: string = latestLastVerified(
  NICHE_ENTRIES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const FUNNEL_PLAYBOOK_AS_OF: string = latestLastVerified(
  FUNNEL_PLAYBOOK_ENTRIES,
  SNAPSHOT_LAST_VERIFIED_DATE,
);
const PRESS_TOPIC_AS_OF: string = latestLastVerified(
  PRESS_TOPICS,
  SNAPSHOT_LAST_VERIFIED_DATE,
);

/**
 * Total programmatic SEO surface size – the sum of every pSEO catalog
 * count. Hoisted because it's reused in both the editorial-corpus
 * observation row and the dashboard's headline counter.
 */
const TOTAL_PSEO_PAGES: number =
  GLOSSARY_SLUGS.length +
  BENCHMARK_SLUGS.length +
  TEARDOWN_SLUGS.length +
  PRICING_TEARDOWN_SLUGS.length +
  COMPARISON_SLUGS.length +
  ALTERNATIVE_SLUGS.length +
  ANSWER_SLUGS.length +
  SHOULD_I_SLUGS.length +
  WHY_ISNT_MY_SLUGS.length +
  NICHE_SLUGS.length +
  FUNNEL_PLAYBOOK_SLUGS.length +
  CATEGORY_SLUGS.length +
  PRESS_TOPIC_SLUGS.length;

/**
 * Activation log breakdown – counts of shipped/operator/gated rows.
 * Hoisted to module scope so the dashboard and the integrity gate both
 * read from the same numbers.
 */
const ACTIVATION_BREAKDOWN: {
  shipped: number;
  operator: number;
  gated: number;
} = (() => {
  let shipped = 0;
  let operator = 0;
  let gated = 0;
  for (const row of ACTIVATION_LOG) {
    if (row.state === "shipped") shipped += 1;
    else if (row.state === "operator") operator += 1;
    else if (row.state === "gated") gated += 1;
  }
  return { shipped, operator, gated };
})();

// ---------------------------------------------------------------------------
// Snapshot assembly
// ---------------------------------------------------------------------------

/**
 * Stable ordered observation list. Order is deliberately editorial:
 *   - top group is the editorial corpus (the "what we publish" answer),
 *   - then topical authority (the "what we are an authority on" answer),
 *   - then entity graph (the "who we are connected to" answer),
 *   - then international (the "who we publish to" answer),
 *   - then earned media (the "who cites us" answer),
 *   - then activation state (the "what is shipped vs gated" answer).
 *
 * Within each group, the rows are ordered by impact – the headline
 * count first, the supporting counts under it.
 *
 * Append-only contract: an observation row's `key` MUST stay stable
 * once shipped. A consumer pinning to the dashboard JSON by key
 * cannot tolerate renames. Adding a new row is free; removing a row
 * is a v1.x bump and ships a migration note in this module's header.
 */
function buildSnapshot(): ReadonlyArray<SnapshotObservation> {
  return [
    // ---------------------------------------------------------------
    // Editorial corpus
    // ---------------------------------------------------------------
    {
      key: "pseo_total_pages",
      category: "editorial-corpus",
      label: "Programmatic SEO pages",
      value: TOTAL_PSEO_PAGES,
      unit: "pages",
      description:
        "Sum of every shipped programmatic SEO surface: glossary, benchmarks, funnel teardowns, pricing teardowns, comparisons, alternatives, answers, why-isn't-my element diagnostics, niche pages, funnel playbooks, category roundups, press topics.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "dataset_rows_total",
      category: "editorial-corpus",
      label: "Open dataset rows",
      value: DATASET_BUNDLE.counts.total_rows,
      unit: "rows",
      description:
        "Total editorially verified rows in the open CC-BY-4.0 Indie SaaS Teardowns dataset bundle across five tables: funnel teardowns, pricing teardowns, comparisons, alternatives, categories.",
      sourceUrl: `${BASE_URL}/dataset`,
      asOf: DATASET_BUNDLE.lastVerified,
    },
    {
      key: "glossary_terms",
      category: "editorial-corpus",
      label: "Glossary entries",
      value: GLOSSARY_SLUGS.length,
      unit: "terms",
      description:
        "Brunson sales-funnel concept entries published under /glossary. Each carries a short definition, a long definition, why-it-matters context, how-to-apply bullets, a worked example, common confusions, related terms, and an FAQ.",
      sourceUrl: `${BASE_URL}/glossary`,
      asOf: GLOSSARY_AS_OF,
    },
    {
      key: "funnel_teardowns",
      category: "editorial-corpus",
      label: "Funnel teardowns",
      value: TEARDOWN_SLUGS.length,
      unit: "pages",
      description:
        "Indie SaaS funnel teardowns published under /funnel-teardown. Hook/story/offer pattern analysis for each company; no fabricated metrics, no quoted copy.",
      sourceUrl: `${BASE_URL}/funnel-teardown`,
      asOf: FUNNEL_TEARDOWN_AS_OF,
    },
    {
      key: "pricing_teardowns",
      category: "editorial-corpus",
      label: "Pricing teardowns",
      value: PRICING_TEARDOWN_SLUGS.length,
      unit: "pages",
      description:
        "Indie SaaS pricing teardowns published under /pricing-teardown. Tier structure, anchor mechanics, upgrade triggers, payment mechanics; approximate prices with dated lastVerified per row.",
      sourceUrl: `${BASE_URL}/pricing-teardown`,
      asOf: PRICING_TEARDOWN_AS_OF,
    },
    {
      key: "comparisons",
      category: "editorial-corpus",
      label: "Head-to-head comparisons",
      value: COMPARISON_SLUGS.length,
      unit: "pages",
      description:
        "Symmetric A-vs-B comparison pages under /vs. Each scores both sides on six to nine dimensions and names a verdict for the indie SaaS founder cohort.",
      sourceUrl: `${BASE_URL}/vs`,
      asOf: COMPARISON_AS_OF,
    },
    {
      key: "alternatives",
      category: "editorial-corpus",
      label: "Named-competitor alternative pages",
      value: ALTERNATIVE_SLUGS.length,
      unit: "pages",
      description:
        "Honest named-competitor comparison pages under /alternatives-to. Each respects the competitor's value proposition and names the category difference, not a quality gap.",
      sourceUrl: `${BASE_URL}/alternatives-to`,
      asOf: ALTERNATIVE_AS_OF,
    },
    {
      key: "answers",
      category: "editorial-corpus",
      label: "Direct-answer AEO pages",
      value: ANSWER_SLUGS.length,
      unit: "pages",
      description:
        "Two-to-four-sentence direct answers under /answers, formatted for AI assistant citation. QAPage + Article + BreadcrumbList JSON-LD per page.",
      sourceUrl: `${BASE_URL}/answers`,
      asOf: ANSWER_AS_OF,
    },
    {
      key: "should_i",
      category: "editorial-corpus",
      label: "Should I…? decision-helper AEO pages",
      value: SHOULD_I_SLUGS.length,
      unit: "pages",
      description:
        "Binary-verdict decision-helper pages under /should-i targeting the 'should I X?' query shape that LLM assistants cite verbatim. Each page carries one yes / no / depends / not-yet verdict plus reasoning. QAPage + Article + FAQPage + BreadcrumbList JSON-LD per page.",
      sourceUrl: `${BASE_URL}/should-i`,
      asOf: SHOULD_I_AS_OF,
    },
    {
      key: "benchmarks",
      category: "editorial-corpus",
      label: "Funnel metric benchmark pages",
      value: BENCHMARK_SLUGS.length,
      unit: "pages",
      description:
        "Directional metric ranges under /benchmarks. Each page carries an AEO-formatted direct answer, a three-band breakdown, drivers in order of impact, common misreadings, and source attribution.",
      sourceUrl: `${BASE_URL}/benchmarks`,
      asOf: BENCHMARK_AS_OF,
    },
    {
      key: "why_isnt_my_pages",
      category: "editorial-corpus",
      label: "Panic-mode diagnostic pages",
      value: WHY_ISNT_MY_SLUGS.length,
      unit: "pages",
      description:
        "Per-element panic-mode diagnostic pages under /why-isnt-my. Each labels the issue as Wrong Person, Weak Offer, or Weak Belief and names the one fix to ship this week.",
      sourceUrl: `${BASE_URL}/why-isnt-my`,
      asOf: WHY_ISNT_MY_AS_OF,
    },
    {
      key: "niche_pages",
      category: "editorial-corpus",
      label: "Niche/cohort landing pages",
      value: NICHE_SLUGS.length,
      unit: "pages",
      description:
        "Cohort-tuned landing pages under /for. Same Hook/Story/Offer diagnostic applied to the vocabulary, money mechanics, and common mistakes of one specific cohort per page.",
      sourceUrl: `${BASE_URL}/for`,
      asOf: NICHE_AS_OF,
    },
    {
      key: "funnel_playbooks",
      category: "editorial-corpus",
      label: "Brunson funnel playbooks",
      value: FUNNEL_PLAYBOOK_SLUGS.length,
      unit: "pages",
      description:
        "Step-by-step playbooks for the Brunson funnel archetypes under /funnel-playbook. Each carries when-to-use criteria, sequential build steps with HowTo JSON-LD, common mistakes, and ladder-position guidance.",
      sourceUrl: `${BASE_URL}/funnel-playbook`,
      asOf: FUNNEL_PLAYBOOK_AS_OF,
    },
    {
      key: "category_pages",
      category: "editorial-corpus",
      label: "Category roundup pages",
      value: CATEGORY_SLUGS.length,
      unit: "pages",
      description:
        "Canonical category buckets under /category that aggregate funnel teardowns, pricing teardowns, and comparisons in that category into a single high-intent landing page.",
      sourceUrl: `${BASE_URL}/category`,
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "press_topics",
      category: "editorial-corpus",
      label: "Press topic packages",
      value: PRESS_TOPIC_SLUGS.length,
      unit: "topics",
      description:
        "Pre-assembled story packages under /press/topics. Each carries thesis, founder quote, three data points, three counter-points, fact sheet, and embed code for journalists and AI summarisers.",
      sourceUrl: `${BASE_URL}/press/topics`,
      asOf: PRESS_TOPIC_AS_OF,
    },

    // ---------------------------------------------------------------
    // Topical authority
    // ---------------------------------------------------------------
    {
      key: "defined_terms",
      category: "topical-authority",
      label: "Defined-term entries",
      value: DEFINED_TERMS.length,
      unit: "terms",
      description:
        "Brunson sales-funnel terms taught on the site, declared as schema.org DefinedTermSet entries with founder-authored definitions. LLM retrieval and citation pipelines ingesting DefinedTermSet treat the publisher as a primary citation source for the term.",
      sourceUrl: `${BASE_URL}/glossary`,
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "knows_about_topics",
      category: "topical-authority",
      label: "Declared topical expertise areas",
      value: KNOWS_ABOUT.length,
      unit: "topics",
      description:
        "Topical-expertise areas declared in Organization.knowsAbout and Person.knowsAbout. Each is verifiable against a Brunson workbook section, a shipped pSEO surface, or a strategy document.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "mentioned_entities",
      category: "topical-authority",
      label: "Mentioned third-party entities",
      value: MENTIONED_ENTITIES.length,
      unit: "entities",
      description:
        "Real third-party entities (Persons, Organizations, Books, SoftwareApplications) the public marketing surface names. Declared in Organization.mentions for entity-graph density.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },

    // ---------------------------------------------------------------
    // Entity graph
    // ---------------------------------------------------------------
    {
      key: "same_as_anchors",
      category: "entity-graph",
      label: "Off-platform sameAs anchors",
      value: ORGANIZATION_SAME_AS.length,
      unit: "anchors",
      description:
        "Off-platform profile URLs declared in Organization.sameAs (Wikidata, Wikipedia, X, LinkedIn, GitHub, Indie Hackers, Product Hunt, Crunchbase, YouTube). Env-driven; ships at zero until the operator creates each profile and the bio credibly links back to unlocksaas.com.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "external_dataset_catalogs",
      category: "entity-graph",
      label: "External dataset catalog cross-listings",
      value: DATASET_EXTERNAL_REGISTRATIONS.length,
      unit: "catalogs",
      description:
        "External DataCatalog registrations of the Indie SaaS Teardowns dataset (Hugging Face, Kaggle, Zenodo). Env-driven; ships at zero until the operator creates the catalog listing and sets the matching NEXT_PUBLIC_UNLOCKSAAS_*_DATASET_URL env var.",
      sourceUrl: `${BASE_URL}/dataset`,
      asOf: DATASET_BUNDLE.lastVerified,
    },

    // ---------------------------------------------------------------
    // International
    // ---------------------------------------------------------------
    {
      key: "approved_translations",
      category: "international",
      label: "Approved (path, locale) translations",
      value: allApprovedTranslations().length,
      unit: "pairs",
      description:
        "Approved (path, locale) translation pairs from the i18n registry. Pending and archived rows are excluded. Each pair is founder-reviewed and Brunson-voice-compliant.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "locales_with_approved_content",
      category: "international",
      label: "Locales with at least one approved page",
      value: localesWithApprovedContent().length,
      unit: "locales",
      description:
        "Distinct locales (excluding en-US) carrying at least one approved translation row. Drives hreflang fan-out in /sitemap.xml.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },

    // ---------------------------------------------------------------
    // Earned media
    // ---------------------------------------------------------------
    {
      key: "earned_media_mentions",
      category: "earned-media",
      label: "Earned media mentions",
      value: getEarnedMentions().length,
      unit: "mentions",
      description:
        "Independently verifiable earned-media mentions of UnlockSaaS published in third-party outlets (excludes paid placements). Each entry is gated by a Python CLI that fetches the URL and confirms the article names UnlockSaaS verbatim before the row can land in MEDIA_MENTIONS. Honest zero state by default.",
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },

    // ---------------------------------------------------------------
    // Activation state
    // ---------------------------------------------------------------
    {
      key: "activation_shipped",
      category: "activation-state",
      label: "Surfaces shipped in production",
      value: ACTIVATION_BREAKDOWN.shipped,
      unit: "surfaces",
      description:
        "Activation-log rows in state `shipped`: live in production at the last verified date.",
      sourceUrl: `${BASE_URL}/llms.txt`,
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "activation_operator",
      category: "activation-state",
      label: "Surfaces gated on operator activation",
      value: ACTIVATION_BREAKDOWN.operator,
      unit: "surfaces",
      description:
        "Activation-log rows in state `operator`: code is live in production but an operator action (env var paste, DNS record, account creation) is the only thing blocking the public signal from lighting up.",
      sourceUrl: `${BASE_URL}/llms.txt`,
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
    {
      key: "activation_gated",
      category: "activation-state",
      label: "Surfaces gated on evidence trigger",
      value: ACTIVATION_BREAKDOWN.gated,
      unit: "surfaces",
      description:
        "Activation-log rows in state `gated`: deliberately not shipped, waiting on an evidence trigger documented in workbook 09 §5 (free diagnostic conversion >= 30%, $1 Starter conversion >= 5%, verified customer cycles >= 3).",
      sourceUrl: `${BASE_URL}/llms.txt`,
      asOf: SNAPSHOT_LAST_VERIFIED_DATE,
    },
  ];
}

// ---------------------------------------------------------------------------
// Integrity gate
// ---------------------------------------------------------------------------

/** ISO-8601 calendar-date matcher. Hoisted per js-hoist-regexp. */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Snake_case key matcher (lowercase + digits + underscore). */
const KEY_RE = /^[a-z][a-z0-9_]*$/;

/**
 * Build-time integrity gate. Runs at module load and refuses to start
 * the server if any observation row violates the contract. Throws on
 * first violation – the surrounding stack trace points to the bad row.
 *
 * Mirrors the validateMentions discipline shipped in src/lib/media-mentions.ts:
 *   - impossible to ship a malformed row,
 *   - impossible to ship a fabricated value (every value derives from a
 *     real importable constant – the gate validates the row, not the
 *     truth of the underlying constant; that truth is enforced by the
 *     constant's own integrity contract),
 *   - impossible to ship duplicate keys (a consumer pinning to the
 *     JSON by key cannot tolerate ambiguity).
 *
 * Brunson Hard-Rule reconciliation: this gate is the "no fabricated
 * row" technical implementation. A row with `value: NaN` or
 * `value: -1` or a future `asOf` date would not pass.
 */
function validateSnapshot(
  rows: ReadonlyArray<SnapshotObservation>,
): void {
  if (rows.length === 0) {
    throw new Error(
      "state-of-saas: SNAPSHOT_OBSERVATIONS is empty. The dashboard must ship at least one observation row.",
    );
  }

  const seenKeys = new Set<string>();
  const todayISO = new Date().toISOString().slice(0, 10);

  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    const where = `SNAPSHOT_OBSERVATIONS[${i}] (key="${r.key ?? "<unset>"}")`;

    if (!r.key || !KEY_RE.test(r.key)) {
      throw new Error(
        `${where}: key must be snake_case [a-z][a-z0-9_]*, got "${r.key}".`,
      );
    }
    if (seenKeys.has(r.key)) {
      throw new Error(
        `${where}: duplicate key. Each observation key must be unique.`,
      );
    }
    seenKeys.add(r.key);

    if (!r.label || !r.label.trim()) {
      throw new Error(`${where}: label must be a non-empty string.`);
    }
    if (!r.description || !r.description.trim()) {
      throw new Error(`${where}: description must be a non-empty string.`);
    }
    if (!r.unit || !r.unit.trim()) {
      throw new Error(`${where}: unit must be a non-empty string.`);
    }
    if (
      typeof r.value !== "number" ||
      !Number.isFinite(r.value) ||
      r.value < 0 ||
      !Number.isInteger(r.value)
    ) {
      throw new Error(
        `${where}: value must be a non-negative integer, got ${String(r.value)}.`,
      );
    }
    if (!ISO_DATE_RE.test(r.asOf)) {
      throw new Error(
        `${where}: asOf must be ISO 8601 calendar date YYYY-MM-DD, got "${r.asOf}".`,
      );
    }
    if (r.asOf > todayISO) {
      throw new Error(
        `${where}: asOf must not be a future date (got "${r.asOf}", today UTC is "${todayISO}").`,
      );
    }
    if (r.sourceUrl !== undefined) {
      if (typeof r.sourceUrl !== "string" || !r.sourceUrl.startsWith("https://")) {
        throw new Error(
          `${where}: sourceUrl must be an https URL when provided, got "${r.sourceUrl}".`,
        );
      }
      try {
        new URL(r.sourceUrl);
      } catch {
        throw new Error(`${where}: sourceUrl is not a valid URL.`);
      }
    }
  }
}

/**
 * Pre-built, frozen snapshot. Built at module load; per-render cost is
 * a single property read. Importers receive the same reference across
 * renders – per `server-hoist-static-io`.
 */
export const SNAPSHOT_OBSERVATIONS: ReadonlyArray<SnapshotObservation> =
  Object.freeze(buildSnapshot());

// Module-load integrity gate. The thrown error is intentional – a
// malformed snapshot must fail the build, not silently degrade the
// dashboard.
validateSnapshot(SNAPSHOT_OBSERVATIONS);

// ---------------------------------------------------------------------------
// Grouping helpers (consumed by the dashboard page)
// ---------------------------------------------------------------------------

export const SNAPSHOT_CATEGORY_LABELS: Readonly<
  Record<SnapshotCategory, string>
> = Object.freeze({
  "editorial-corpus": "Editorial corpus",
  "topical-authority": "Topical authority",
  "entity-graph": "Entity graph anchors",
  international: "International coverage",
  "earned-media": "Earned media",
  "activation-state": "Activation state",
});

export const SNAPSHOT_CATEGORY_DESCRIPTIONS: Readonly<
  Record<SnapshotCategory, string>
> = Object.freeze({
  "editorial-corpus":
    "Counts of every shipped editorial surface. Each row maps to a public URL where the underlying content can be read in full.",
  "topical-authority":
    "Machine-readable signals declaring what UnlockSaaS is an authority on. Consumed by Knowledge-Graph crawlers and LLM retrieval pipelines.",
  "entity-graph":
    "Off-platform anchors connecting the UnlockSaaS entity to its representations on other indexed sites and dataset catalogs.",
  international:
    "Approved-locale translation coverage. Pending and archived rows are intentionally excluded – nothing is claimed until the founder approves the translation.",
  "earned-media":
    "Independently verifiable mentions of UnlockSaaS in third-party publications. Each row passes the load-time integrity gate that fetches the URL and confirms verbatim naming.",
  "activation-state":
    "Distilled from strategy/google-strategy.md §Activation log into machine-readable structure. Encodes the difference between shipped (live in production), operator-gated (code is live; env var or account creation flips the signal), and evidence-gated (deliberately not shipped, waiting on an evidence trigger).",
});

/** Ordered category list, matching the snapshot iteration order. */
export const SNAPSHOT_CATEGORIES_ORDERED: ReadonlyArray<SnapshotCategory> =
  Object.freeze([
    "editorial-corpus",
    "topical-authority",
    "entity-graph",
    "international",
    "earned-media",
    "activation-state",
  ]);

/**
 * Group the snapshot by category for the dashboard render. Hoisted to
 * module scope per `server-hoist-static-io` – the grouping never
 * changes between renders, and a per-render `reduce()` over the
 * snapshot would re-allocate the buckets on every page hit.
 */
export const SNAPSHOT_BY_CATEGORY: Readonly<
  Record<SnapshotCategory, ReadonlyArray<SnapshotObservation>>
> = Object.freeze(
  SNAPSHOT_CATEGORIES_ORDERED.reduce(
    (acc, category) => {
      acc[category] = Object.freeze(
        SNAPSHOT_OBSERVATIONS.filter((r) => r.category === category),
      );
      return acc;
    },
    {} as Record<SnapshotCategory, ReadonlyArray<SnapshotObservation>>,
  ),
);

/**
 * Headline counter for the dashboard hero – sum of all pSEO pages plus
 * the dataset rows. The single number a journalist or AI summariser
 * would lead a sentence with.
 */
export const SNAPSHOT_HEADLINE_TOTAL: number =
  TOTAL_PSEO_PAGES + DATASET_BUNDLE.counts.total_rows;

/**
 * Stable, version-pinned snapshot identifier. Becomes the JSON-LD
 * `Dataset.identifier` for the dashboard.
 */
export const SNAPSHOT_PRIMARY_IDENTIFIER = `${SNAPSHOT_URL}#${SNAPSHOT_SLUG}-v${SNAPSHOT_VERSION}` as const;

/**
 * Plain-text citation for academic / newsletter footnote use. Mirrors
 * DATASET_CITATION's shape but resolves to the dashboard URL, not the
 * dataset landing.
 */
export const SNAPSHOT_CITATION = `Maryan (${SNAPSHOT_LAST_VERIFIED_DATE}). ${SNAPSHOT_NAME}, v${SNAPSHOT_VERSION}. Unlock SaaS. ${SNAPSHOT_URL}. CC-BY-4.0.` as const;

/**
 * Top-level keywords for `Dataset.keywords` and `DataFeed.keywords`.
 * Every term is present in the body copy of the dashboard or in at
 * least one of the underlying catalogs.
 */
export const SNAPSHOT_KEYWORDS: readonly string[] = Object.freeze([
  "state of indie SaaS",
  "indie SaaS dashboard",
  "UnlockSaaS editorial snapshot",
  "programmatic SEO surface size",
  "open SaaS data",
  "Brunson glossary depth",
  "Knowledge Graph anchors",
  "AEO benchmarks corpus",
  "SaaS funnel teardowns",
  "dataset cross-listing",
]);
