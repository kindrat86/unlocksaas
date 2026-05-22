/**
 * Aggregator / review-directory listings registry.
 *
 * Why this module exists
 * ----------------------
 * Off-platform discovery surfaces (G2, Capterra, Product Hunt, Indie Hackers,
 * BetaList, SaaSHub, AlternativeTo, etc.) are three things at once for a
 * pre-revenue SaaS:
 *
 *   1. **High-DA backlinks** — every approved listing is one inbound link
 *      from a 60+ DA domain. Aggregate effect on topical authority is
 *      measurable inside 30 days of indexing.
 *   2. **AI-crawler citation surfaces** — Perplexity, ClaudeBot, OAI-Search,
 *      Google AI Overviews routinely cite G2 / Capterra / Product Hunt
 *      profile pages when answering "what is X?" or "X alternatives".
 *      Each live listing is a candidate citation that links back to
 *      unlocksaas.com.
 *   3. **Entity-graph anchors** — every public URL the operator paste-
 *      activates lights up another `sameAs` row on Organization JSON-LD
 *      (via src/lib/seo/entity.ts buildSameAs), increasing Knowledge
 *      Graph entity confidence.
 *
 * This registry is the operator-facing index: which directories we target,
 * the submission URL, the env var that activates the live profile in
 * schema, and a category for sorting on the /press/listings hub page.
 *
 * Honest pattern (Brunson Hard-Rule)
 * ----------------------------------
 * No directory is "claimed" by this file. The registry merely declares the
 * INTENT to submit. The actual presence of a live listing is gated by the
 * env var: if `NEXT_PUBLIC_UNLOCKSAAS_G2_URL` is unset, the row renders as
 * "Submission pending" with no claim of presence. The moment the operator
 * sets the env var on Vercel and redeploys, the row flips to a live link
 * AND the Organization.sameAs schema picks it up.
 *
 * No fabricated review counts, no aspirational badges, no placeholder
 * "Award winner" claims. The page is a status board the operator works.
 *
 * Single source of truth
 * ----------------------
 * The env-var name in `profileUrlEnvVar` MUST match a slot declared in
 * src/lib/seo/entity.ts buildSameAs(). Mismatch = schema doesn't pick up
 * the URL even after the operator sets it. CI lint (TODO) could enforce
 * this; for now the two files are co-edited.
 *
 * Submission order (priority field): smaller numbers go first. Default
 * ordering follows GEO / backlink ROI per hour of operator work –
 * Product Hunt is the largest single discovery event a pre-launch SaaS
 * can engineer; G2 + Capterra are the biggest AI Overview citation
 * surfaces; AlternativeTo + SaaSHub are highest-velocity backlinks; Indie
 * Hackers and BetaList are community-fit, lower velocity but tightest
 * audience match. Numbers are spaced by 10 to allow future inserts
 * without renumbering.
 */

export type DirectoryCategory =
  | "launch" // One-shot launch event (Product Hunt, BetaList)
  | "review" // Reviews / ratings (G2, Capterra, SoftwareAdvice, GetApp)
  | "discovery" // Alternative-finding / comparison (AlternativeTo, SaaSHub)
  | "community"; // Community profile + activity (Indie Hackers)

/**
 * One directory we're targeting for a listing. Every field is documented
 * because the operator copy-pastes from this struct into submission forms.
 */
export type DirectoryListing = {
  /** Stable slug. Used as DOM id on /press/listings + cross-ref to strategy/aggregator-submissions/<id>.md. */
  readonly id: string;
  /** Human-readable directory name as it appears in the directory's own branding. */
  readonly name: string;
  /** Bare hostname, no scheme. Shown as the row's secondary label on /press/listings. */
  readonly hostname: string;
  /** Bucket used to group rows on /press/listings into sections with shared submission cadence. */
  readonly category: DirectoryCategory;
  /** The directory's public submission / "add product" landing URL. Operator clicks this to begin submission. */
  readonly submissionUrl: string;
  /**
   * The env var that holds the LIVE listing URL once approved. MUST match
   * a slot declared in src/lib/seo/entity.ts buildSameAs(). Set on Vercel
   * after the directory team approves the listing. Schema picks it up on
   * next deploy with no code edit.
   */
  readonly profileUrlEnvVar: string;
  /**
   * Submission order — smaller numbers go first. Spaced by 10 to allow
   * future inserts without renumbering existing rows.
   */
  readonly priority: number;
  /**
   * One-line strategic note for the operator. Why this directory matters
   * for UnlockSaaS specifically. Surfaces on the /press/listings page as
   * the row's tertiary copy.
   */
  readonly note: string;
  /**
   * Slug of the strategy doc with pre-filled submission copy. Resolved as
   * strategy/aggregator-submissions/<runbookSlug>.md. Not all directories
   * have one (community + simple discovery directories ship with the
   * default press kit copy from /press). undefined = use /press as-is.
   */
  readonly runbookSlug?: string;
};

/**
 * Frozen registry. Order in this array is documentation only; the page
 * sorts by `priority` then by `name`. Adding a row here is the first step
 * in onboarding a new aggregator – the second is declaring its env var in
 * src/lib/seo/entity.ts buildSameAs(); the third is documenting the env
 * var in .env.example.
 */
export const DIRECTORY_LISTINGS: ReadonlyArray<DirectoryListing> = Object.freeze(
  [
    // ── Launch directories ─────────────────────────────────────────────
    // Single-shot events. Product Hunt is the single largest pre-revenue
    // discovery surface available to an indie SaaS; the launch day itself
    // is the conversion event, but the indexed product page becomes a
    // permanent high-DA backlink and a recurring AI citation surface.
    {
      id: "product-hunt",
      name: "Product Hunt",
      hostname: "producthunt.com",
      category: "launch",
      submissionUrl: "https://www.producthunt.com/posts/new",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_PRODUCT_HUNT_URL",
      priority: 10,
      note: "Single-shot launch event. Coordinate relaunch with the $1 Starter price drop – the gallery rewards a sub-$5 entry tier.",
      runbookSlug: "product-hunt",
    },
    {
      id: "betalist",
      name: "BetaList",
      hostname: "betalist.com",
      category: "launch",
      submissionUrl: "https://betalist.com/submit",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_BETALIST_URL",
      priority: 20,
      note: "Early-adopter audience. Best paired with a waitlist or a private-beta gate – the directory rewards exclusivity framing.",
      runbookSlug: "betalist",
    },

    // ── Review aggregators ─────────────────────────────────────────────
    // High-DA review platforms. These are the surfaces ChatGPT, Perplexity,
    // and Google AI Overviews cite when summarising a category ("best X
    // for Y"). Listing approval is gated on category fit + a baseline of
    // real customer reviews; the Brunson Hard-Rule for these is: do NOT
    // farm reviews. Submit when there are genuine paying customers willing
    // to review honestly, and not before.
    {
      id: "g2",
      name: "G2",
      hostname: "g2.com",
      category: "review",
      submissionUrl: "https://sell.g2.com/get-listed",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_G2_URL",
      priority: 30,
      note: "Largest review platform AI Overviews cite. Submit only when there are 3+ paying customers ready to review honestly – the directory rejects single-customer listings.",
      runbookSlug: "g2",
    },
    {
      id: "capterra",
      name: "Capterra",
      hostname: "capterra.com",
      category: "review",
      submissionUrl: "https://www.capterra.com/vendors/sign-up",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_CAPTERRA_URL",
      priority: 40,
      note: "Gartner-owned. Listing also auto-syndicates to GetApp + SoftwareAdvice (one submission, three surfaces).",
      runbookSlug: "capterra",
    },

    // ── Discovery / comparison directories ─────────────────────────────
    // Alternative-finding sites. High velocity for backlinks because the
    // submission process is lightweight and approval is automatic for any
    // real product. AI Overviews cite AlternativeTo extensively when
    // answering "X alternatives" queries.
    {
      id: "alternativeto",
      name: "AlternativeTo",
      hostname: "alternativeto.net",
      category: "discovery",
      submissionUrl: "https://alternativeto.net/account/submit-app/",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_ALTERNATIVETO_URL",
      priority: 50,
      note: "AI Overviews cite this heavily for 'X alternatives' queries. Lightweight submission, near-automatic approval.",
      runbookSlug: "alternativeto",
    },
    {
      id: "saashub",
      name: "SaaSHub",
      hostname: "saashub.com",
      category: "discovery",
      submissionUrl: "https://www.saashub.com/submit-software",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_SAASHUB_URL",
      priority: 60,
      note: "Peer of AlternativeTo focused on SaaS. Indexed quickly; submission is one form.",
      runbookSlug: "saashub",
    },

    // ── Community directories ──────────────────────────────────────────
    // Indie Hackers is the audience-fit gold standard for UnlockSaaS – it
    // is literally the dream-customer's hang-out. The profile is a backlink
    // anchor, but the on-platform posting / milestone activity is the
    // bigger compound effect.
    {
      id: "indie-hackers",
      name: "Indie Hackers",
      hostname: "indiehackers.com",
      category: "community",
      submissionUrl: "https://www.indiehackers.com/products/new",
      profileUrlEnvVar: "NEXT_PUBLIC_UNLOCKSAAS_INDIE_HACKERS_URL",
      priority: 70,
      note: "Audience-fit dream-customer hangout. Profile is the backlink anchor; sustained posting + milestone updates compound over time.",
      runbookSlug: "indie-hackers",
    },
  ],
);

/**
 * The pretty label shown above each category section on /press/listings.
 */
export const CATEGORY_LABELS: Readonly<Record<DirectoryCategory, string>> =
  Object.freeze({
    launch: "Launch events",
    review: "Review aggregators",
    discovery: "Discovery and comparison directories",
    community: "Community profiles",
  });

/**
 * Short prose describing what the operator should do for each category.
 * Shown as the section subheading on /press/listings; doubles as the
 * cadence rule in strategy/aggregator-listings-runbook.md.
 */
export const CATEGORY_NOTES: Readonly<Record<DirectoryCategory, string>> =
  Object.freeze({
    launch:
      "One-shot events. Time the submission to a product moment (relaunch, price change, public-beta open). Sustained AI-citation traffic continues for months after launch day.",
    review:
      "Reviews-gated platforms. Only submit when there are genuine paying customers willing to leave honest reviews. No farming, no incentivised reviews.",
    discovery:
      "Lightweight comparison surfaces. Approval is fast; each row is a permanent inbound link AI Overviews cite for 'alternatives' queries.",
    community:
      "Audience-fit profiles. The backlink is half the value; sustained posting and milestone updates are the other half.",
  });

/**
 * Resolve the live profile URL from env for a given listing. Returns
 * undefined when the env var is unset, empty, or fails the same strict
 * `https://` validation enforced by lib/seo/entity.ts readSocialEnv.
 *
 * Used by /press/listings to decide whether each row renders as a live
 * link or as "Submission pending". MUST match readSocialEnv's behaviour
 * exactly – otherwise the page would advertise a URL that the schema
 * silently rejected, which would be a fabrication by inconsistency.
 */
export function resolveLiveProfileUrl(
  listing: DirectoryListing,
): string | undefined {
  const raw = process.env[listing.profileUrlEnvVar];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("https://")) return undefined;
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return undefined;
  }
}

/**
 * Group the registry by category, preserving priority sort within each
 * group. Convenience for the /press/listings page render.
 */
export function listingsByCategory(): ReadonlyArray<{
  category: DirectoryCategory;
  label: string;
  note: string;
  rows: ReadonlyArray<DirectoryListing>;
}> {
  const categories: DirectoryCategory[] = [
    "launch",
    "review",
    "discovery",
    "community",
  ];
  return categories.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    note: CATEGORY_NOTES[category],
    rows: DIRECTORY_LISTINGS.filter((row) => row.category === category).slice().sort(
      (a, b) => a.priority - b.priority || a.name.localeCompare(b.name),
    ),
  }));
}
