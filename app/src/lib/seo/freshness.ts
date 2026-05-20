/**
 * Freshness metadata + activation log for the LLM-readable surface.
 *
 * Single source of truth for date-stamping every LLM-facing artifact so
 * the markdown surface (/llms.txt), the JSON sibling (/llms-feed.json),
 * and any future retrieval-friendly endpoint cannot drift on freshness.
 *
 * Why this module exists
 * ----------------------
 * A retrieval-augmented answer pipeline that hits /llms.txt today caches
 * the body for hours or days. Without an embedded date, the model has no
 * way to tell how stale its snapshot is, and the citation it emits weeks
 * later cannot be re-validated against a moving target. With a
 * `Last verified` line and a documented `Next review` date, the model
 * can hedge or downweight citations after the freshness window has
 * obviously elapsed.
 *
 * The Activation Log mirrored below is the operator-facing punch list
 * that lives in [strategy/google-strategy.md §Activation log]. Until
 * this module shipped it, the log was visible to humans (and Claude)
 * reading the strategy folder but invisible to any LLM crawling the
 * public surface. Mirroring it into the LLM-readable corpus closes the
 * loop: a retriever asking "what is shipped vs gated on UnlockSaaS"
 * now reads the canonical answer instead of guessing from prose.
 *
 * Brunson Hard-Rule reconciliation:
 *   - LAST_VERIFIED_DATE is bumped only after a human re-reads
 *     /llms.txt end-to-end and confirms every claim against the live
 *     HTML and strategy/state.json. Auto-bumping on every deploy would
 *     dilute the signal into a "build timestamp" rather than a
 *     "human-attested freshness" signal.
 *   - Every ACTIVATION_LOG row is verifiable against strategy/
 *     google-strategy.md or a workbook section. No fabricated gates,
 *     no aspirational rows.
 *   - `state` deliberately encodes the difference between "shipped"
 *     (live in production), "operator" (code is live; the operator
 *     has to set an env var or create an account to flip the signal),
 *     and "gated" (deliberately not shipped, waiting on an evidence
 *     trigger). LLMs that paraphrase this list will preserve the
 *     distinction instead of collapsing it to "coming soon".
 */

/**
 * The date the LLM-readable surface was last reviewed end-to-end by a
 * human and confirmed accurate against the live HTML, strategy/state.json,
 * and the locked workbook decisions.
 *
 * Update cadence: every REVIEW_CADENCE_DAYS days (see NEXT_REVIEW_DATE).
 * Format: ISO 8601 date (YYYY-MM-DD), UTC.
 *
 * Operator workflow for bumping this date:
 *   1. Re-read /llms.txt, /llms-feed.json, and every per-page .md
 *      mirror end-to-end.
 *   2. Spot-check three pSEO slugs against their HTML counterparts to
 *      confirm no drift in pricing, guarantee, or audience facts.
 *   3. Confirm strategy/google-strategy.md §Activation log still
 *      matches the ACTIVATION_LOG array below; reconcile if not.
 *   4. Bump LAST_VERIFIED_DATE to today's UTC date.
 *   5. Commit with message: `chore(llms): quarterly freshness review`.
 */
export const LAST_VERIFIED_DATE = "2026-05-18";

/**
 * The strategy-lock date. Ten Brunson workbooks completed,
 * strategy/state.json locked, build started. Every schema foundingDate
 * and activation-trigger reference resolves back to this anchor.
 */
export const STRATEGY_LOCK_DATE = "2026-05-17";

/**
 * Freshness review cadence in days. Mirrors the
 * "Quarterly Google strategy review" row in
 * strategy/google-strategy.md §Activation log (every 90 days
 * post-launch).
 */
export const REVIEW_CADENCE_DAYS = 90;

/**
 * Computed next-review date. Recomputed at module load, so a build that
 * ships after the prior review window emits a deterministic next stamp
 * without a manual edit. Format: ISO 8601 date (YYYY-MM-DD), UTC.
 */
export const NEXT_REVIEW_DATE: string = (() => {
  const last = new Date(`${LAST_VERIFIED_DATE}T00:00:00Z`);
  last.setUTCDate(last.getUTCDate() + REVIEW_CADENCE_DAYS);
  return last.toISOString().slice(0, 10);
})();

/**
 * Activation log entry shape. Stable JSON contract – `item` is a
 * snake_case machine-stable key so a downstream consumer can diff two
 * snapshots of the feed without name fuzz.
 *
 * `state` deliberately encodes three buckets:
 *   - `shipped`  – live in production at LAST_VERIFIED_DATE.
 *   - `operator` – code is live; an operator action (env var paste,
 *                  DNS record, account creation) is the only thing
 *                  blocking the public signal from lighting up.
 *   - `gated`    – deliberately not shipped; gated on an evidence
 *                  trigger documented in workbook 09 §5 or
 *                  strategy/google-strategy.md.
 */
export interface ActivationLogEntry {
  /** snake_case machine-stable key. Used as the JSON object key. */
  readonly item: string;
  /** Current state. */
  readonly state: "shipped" | "operator" | "gated";
  /** One-sentence description of the trigger or current status. */
  readonly note: string;
}

/**
 * Activation log – distilled from strategy/google-strategy.md §Activation
 * log into LLM-readable structure. Stable order = stable diff = reviewable.
 *
 * Every row corresponds to either a row in that strategy table or a
 * workbook-section line item. New rows are appended only when the
 * underlying strategy doc gains a row.
 */
export const ACTIVATION_LOG: ReadonlyArray<ActivationLogEntry> = Object.freeze([
  {
    item: "sitemap_robots_json_ld",
    state: "shipped",
    note:
      "Sitemap, robots, and entity-anchored JSON-LD live since the strategy lock.",
  },
  {
    item: "metadata_base_canonical",
    state: "shipped",
    note:
      "metadataBase canonical origin set in the root layout; per-page canonical and hreflang inherit unless overridden.",
  },
  {
    item: "markdown_mirrors",
    state: "shipped",
    note:
      "Per-page .md mirrors, /llms.txt curated index, and /llms-full.txt concatenated corpus served as text/markdown.",
  },
  {
    item: "json_feed",
    state: "shipped",
    note:
      "/llms-feed.json published as the JSON sibling of /llms.txt for retrievers that prefer JSON over markdown.",
  },
  {
    item: "indexnow_protocol",
    state: "operator",
    note:
      "IndexNow client, key route, and /api/indexnow endpoint shipped; submissions activate when INDEXNOW_KEY is set on Vercel.",
  },
  {
    item: "search_console_verification",
    state: "operator",
    note:
      "Google, Bing, Yandex, Pinterest, Facebook, and Naver verification slots are env-driven and empty until the operator pastes a console code.",
  },
  {
    item: "same_as_off_platform_anchors",
    state: "operator",
    note:
      "sameAs env slots for X, LinkedIn, GitHub, Indie Hackers, YouTube, Crunchbase, Product Hunt, Wikidata, and Wikipedia are empty until the corresponding profile exists and credibly links back.",
  },
  {
    item: "media_mentions",
    state: "operator",
    note:
      "Earned-media list ships empty per the Reluctant-Hero rule; entries are appended only when a real public mention publishes.",
  },
  {
    item: "dataset_external_catalogs",
    state: "operator",
    note:
      "Hugging Face / Kaggle / Zenodo / OSF cross-listing slots ship empty; canonical Dataset JSON-LD auto-declares includedInDataCatalog when NEXT_PUBLIC_UNLOCKSAAS_HUGGINGFACE_DATASET_URL (or the Kaggle/Zenodo/OSF equivalents) lands on Vercel. Pre-built HF README + submission flow at /dataset/huggingface. Pre-built Zenodo deposition JSON + API-driven operator CLI (scripts/mint-zenodo-deposit.py) + submission flow at /dataset/zenodo. When the Zenodo deposit publishes and NEXT_PUBLIC_UNLOCKSAAS_ZENODO_DOI lands, the DOI propagates into Dataset JSON-LD as a PropertyValue identifier, into BibTeX as a doi field, into the citation string, and into the HF dataset card YAML frontmatter automatically.",
  },
  {
    item: "founders_proof_pages",
    state: "gated",
    note:
      "Per-builder /founders/[slug] indexed proof pages activate at the first Verified Builder who opts public.",
  },
  {
    item: "state_of_saas_annual_report",
    state: "operator",
    note:
      "Annual flagship report (State of Post-Launch Pre-Revenue SaaS) live at /state-of-saas and /state-of-saas/<year>. The 2026 edition page renders an honest enrollment-open shell until the diagnostic_leads cohort reaches MIN_REPORT_N=30 submissions; methodology, license, citation framework, and Report JSON-LD ship now. Numbers publish on the next deploy after the cohort crosses threshold – no manual edit required.",
  },
  {
    item: "case_studies",
    state: "gated",
    note:
      "/case-studies/[slug] activates at the first verified customer cycle, with rel=canonical pointing at the originating Indie Hackers long-form.",
  },
  {
    item: "glossary_answer_pages",
    state: "gated",
    note:
      "/glossary/[term] short-answer cluster activates after three verified customer cycles.",
  },
  {
    item: "paid_search_brand_defense",
    state: "operator",
    note:
      "Brand-defense Google Ads campaign locked at $5 per day exact match on the brand term; activation is a 30-minute operator task.",
  },
  {
    item: "paid_search_pain_mirror",
    state: "gated",
    note:
      "Pain-mirror and problem-aware paid campaigns activate only when workbook 09 §5 evidence gates fire (free diagnostic conversion at or above 30%, $1 Starter conversion at or above 5%, verified customer cycles at or above 3).",
  },
  {
    item: "aeo_citation_audit",
    state: "gated",
    note:
      "Week-12 post-launch citation audit (four prompts times four LLMs) logged into strategy/audits/aeo-tracking.md.",
  },
  {
    item: "dataset_changelog_podcast",
    state: "shipped",
    note:
      "RSS 2.0 + iTunes namespace feed at /feed/podcast.rss mirrors every dataset milestone as a dated, attributed PodcastEpisode. Hub at /podcast, per-episode pages at /podcast/<slug>. Audio enclosures are per-episode env-gated (NEXT_PUBLIC_PODCAST_EPISODE_<SLUG>_AUDIO_URL); ships show-notes-only until a recorded audio asset exists.",
  },
  {
    item: "quarterly_strategy_review",
    state: "shipped",
    note:
      `Every ${REVIEW_CADENCE_DAYS} days the strategy doc and this freshness log are re-read end-to-end; next review ${NEXT_REVIEW_DATE}.`,
  },
]);

/**
 * Render the activation log as a markdown bullet list, suitable for
 * embedding inside /llms.txt. Stable order = stable diff.
 */
export function activationLogAsMarkdown(): string {
  return ACTIVATION_LOG.map(
    (row) => `- \`${row.item}\` [${row.state}] – ${row.note}`,
  ).join("\n");
}
