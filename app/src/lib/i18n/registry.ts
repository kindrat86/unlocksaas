/**
 * Translation approval registry — single source of truth for which
 * (path, locale) pairs are live.
 *
 * Why this file exists
 * --------------------
 * The Brunson Hard-Rule ("never advertise alternates that do not exist")
 * combined with the founder's locked AC flaw ("SEO addiction is the
 * documented avoidance pattern") means we cannot auto-publish translated
 * pages. Every (path, locale) pair must be translated, founder-reviewed
 * page-by-page, and explicitly flipped to `status: "approved"` here.
 *
 * Until approval lands, the translated page:
 *   - Does NOT appear in the sitemap.
 *   - Is NOT advertised via hreflang.
 *   - Renders with `robots: { index: false, follow: false }`.
 *   - Pre-renders so the founder can preview at the live URL.
 *
 * Adding a translation: see strategy/i18n-strategy.md for the workflow.
 *
 * Editorial standard: approval is identity-signed; only the founder
 * (per `approvedBy`) can mark a row approved. The pre-launch standard
 * is documented at /editorial-policy.
 */

import type { Locale } from "./locales";

export type TranslationStatus = "approved" | "pending-review" | "archived";

export interface TranslationRow {
  /** en-US canonical path the translation mirrors. */
  path: string;
  /** Target locale. Cannot be the default locale. */
  locale: Exclude<Locale, "en-US">;
  /** Approval state. Drives sitemap, hreflang, and robots. */
  status: TranslationStatus;
  /**
   * ISO 8601 date the founder approved (or archived). Sitemap reads this
   * as `lastModified`; JSON-LD reads it as `dateModified`. Omit for
   * pending-review rows.
   */
  approvedAt?: string;
  /** Identifier of the approver. */
  approvedBy?: "maryan";
  /** Founder review note shown inline on pending pages. */
  reviewNote?: string;
}

/**
 * The registry. Frozen at module load.
 *
 * /faq pilot translations approved 2026-05-18 by founder (Maryan) after
 * verifying both translation files end-to-end against canonical
 * FAQ_ENTRIES + PAGE_CHROME_FAQ:
 *   - 8/8 entry parity in both locales (es, pt-BR).
 *   - Reluctant-Hero voice intact; no startup-marketing buzzwords.
 *   - Neutral LATAM Spanish (no 'vosotros'); Brazilian Portuguese
 *     (não peninsular) idioms.
 *   - Brand-glossary preserved per faq.es.ts / faq.pt-br.ts header
 *     notes (Stripe, Playbook, Indie Hackers, Dream 100, Hook Story
 *     Offer, Reluctant Hero, Big Domino, webhook, dashboard,
 *     framework, milestones, founder, launch post, outreach).
 *   - Daniil Khanin attribution verbatim — "10.947 signups, 90 pagos,
 *     nueve años" (es) / "10.947 signups, 90 pagantes, nove anos"
 *     (pt-BR) — locale-formatted thousands separator preserved, the
 *     two anchor numbers and the nine-year duration intact.
 *   - Pricing in USD ($49/mo Core, $98 cap, 60-day guarantee, 20
 *     outreach floor) preserved in both locales.
 *
 * Effect: /es/faq and /pt-BR/faq now ship indexable, sitemap-listed,
 * with bidirectional hreflang back to canonical /faq. Aligns with
 * founder directive 2026-05-18 and Brunson Hard-Rule (only ship
 * translated URLs that are translated and approved).
 */
export const TRANSLATIONS: readonly TranslationRow[] = Object.freeze([
  {
    path: "/faq",
    locale: "es",
    status: "approved",
    approvedAt: "2026-05-18",
    approvedBy: "maryan",
  },
  {
    path: "/faq",
    locale: "pt-BR",
    status: "approved",
    approvedAt: "2026-05-18",
    approvedBy: "maryan",
  },
  // /contact — E-E-A-T trust column. Approved 2026-05-19 after verifying
  // chrome parity across all three locales in PAGE_CHROME_CONTACT, voice
  // discipline (Reluctant Hero, neutral LATAM Spanish, Brazilian
  // Portuguese), brand-glossary preservation (Unlock SaaS, Stripe,
  // Playbook, Starter, customer portal, Wrong Person / Weak Offer /
  // Weak Belief, partnership all kept in English), email address
  // verbatim (maryan@unlocksaas.com), pricing in USD ($1, $49, 60-day
  // guarantee).
  {
    path: "/contact",
    locale: "es",
    status: "approved",
    approvedAt: "2026-05-19",
    approvedBy: "maryan",
  },
  {
    path: "/contact",
    locale: "pt-BR",
    status: "approved",
    approvedAt: "2026-05-19",
    approvedBy: "maryan",
  },
  // /repeatable – Rung 2 (Repeatable Revenue Layer) published product
  // spec. Approved 2026-05-19 after verifying chrome parity across all
  // three locales in PAGE_CHROME_REPEATABLE, voice discipline (Reluctant
  // Hero, neutral LATAM Spanish, Brazilian Portuguese), brand-glossary
  // preservation (Unlock SaaS, Playbook, Core, Starter, Rung 1/2/3,
  // Dream 100, Attractive Character, Outreach Room, Reluctant Hero,
  // Product 1/Product 2, Stripe, value ladder, dream customer, outreach,
  // warmth flags, patterns, self-serve, coaching, tier, waitlist,
  // countdown, carry-over – all kept in English), pricing in USD ($1
  // Starter, $49 Core, $149 Rung 2), guarantee windows (60-day, 90-day)
  // preserved, and the public-commitment + hard-activation-gates
  // language intact in both locales.
  {
    path: "/repeatable",
    locale: "es",
    status: "approved",
    approvedAt: "2026-05-19",
    approvedBy: "maryan",
  },
  {
    path: "/repeatable",
    locale: "pt-BR",
    status: "approved",
    approvedAt: "2026-05-19",
    approvedBy: "maryan",
  },
  // /editorial-policy – E-E-A-T anchor required by Google Quality Rater
  // Guidelines §3.1 + §3.4 (clearly stated editorial policy + corrections
  // policy for sites that publish opinions and comparisons). Approved
  // 2026-05-19 after verifying chrome parity across all three locales in
  // PAGE_CHROME_EDITORIAL_POLICY, working-policy voice (Reluctant Hero,
  // not legal boilerplate), brand-glossary preservation (Unlock SaaS,
  // Maryan, founder, parable, funnel teardown, pricing teardown,
  // category roundup, byline, footer, Indie Hackers, Hacker News, Stripe,
  // ChatGPT, canonical audience, lastVerified, datePublished,
  // dateModified, schema.org/Article, affiliate links, paid placements,
  // Person schema graph, self-funded, funding – all kept English), USD
  // pricing verbatim ($1 Starter, $49/mo Playbook), corrections-log
  // empty-state honesty preserved in both locales, footer signature
  // signed by Maryan with locale-localized contact link.
  {
    path: "/editorial-policy",
    locale: "es",
    status: "approved",
    approvedAt: "2026-05-19",
    approvedBy: "maryan",
  },
  {
    path: "/editorial-policy",
    locale: "pt-BR",
    status: "approved",
    approvedAt: "2026-05-19",
    approvedBy: "maryan",
  },
  // /glossary + /benchmarks – ISO uplift #3 (2026-05-20). Both surfaces
  // shipped as PENDING-REVIEW so the founder can preview each translated
  // entry at /es/glossary, /es/glossary/<slug>, /es/benchmarks,
  // /es/benchmarks/<slug> (and pt-BR equivalents) before flipping to
  // `approved`. Brunson Hard-Rule:
  //   - Pending-review pages render with noindex.
  //   - Sitemap omits them.
  //   - No hreflang alternate is advertised on the en-US canonicals.
  //   - The pre-rendered preview is only reachable by typing the URL
  //     directly (the founder doing review).
  //
  // Translation files:
  //   - src/lib/i18n/translations/glossary.es.ts (16 terms)
  //   - src/lib/i18n/translations/glossary.pt-br.ts (16 terms)
  //   - src/lib/i18n/translations/benchmarks.es.ts (20 metrics)
  //   - src/lib/i18n/translations/benchmarks.pt-br.ts (20 metrics)
  //
  // Approval checklist (per locale, per surface):
  //   1. Read every entry against canonical glossary.ts / benchmarks.ts.
  //   2. Verify brand-glossary preservation (Hook, Story, Offer, Stripe,
  //      Playbook, Brunson, Reluctant Hero, Dream 100, Wrong/Weak labels,
  //      vendor names, metric abbreviations, USD pricing — all English).
  //   3. Voice check: Reluctant Hero, no marketing buzzwords; neutral
  //      LATAM Spanish (no 'vosotros') for es; Brazilian Portuguese
  //      (não peninsular) for pt-BR.
  //   4. Flip `status: "approved"`, set `approvedAt` ISO date, set
  //      `approvedBy: "maryan"`. Sitemap + hreflang activate on next
  //      build.
  {
    path: "/glossary",
    locale: "es",
    status: "pending-review",
    reviewNote:
      "16-term Brunson glossary translated to neutral LATAM Spanish. Brand terms (Hook, Story, Offer, Big Domino, Reluctant Hero, Stack Slide, SOS, Seinfeld, Dream 100, Perfect Webinar, Wrong/Weak labels, Value Ladder, Verified Builder, Brunson Hard-Rule) kept English by design. Preview at /es/glossary and /es/glossary/<slug>.",
  },
  {
    path: "/glossary",
    locale: "pt-BR",
    status: "pending-review",
    reviewNote:
      "16-term Brunson glossary translated to Brazilian Portuguese (não peninsular). Same brand-glossary preservation rules as es. Preview at /pt-BR/glossary and /pt-BR/glossary/<slug>.",
  },
  {
    path: "/benchmarks",
    locale: "es",
    status: "pending-review",
    reviewNote:
      "20-metric directional benchmarks translated to neutral LATAM Spanish. Vendor names (Baymard, ConvertKit, ProfitWell, OpenView, Bessemer, Apollo, Hunter, Lemlist, ContentSquare, Hotjar), metric abbreviations (LTV, CAC, MRR, ARR, ICP, PLG, OTO), Core Web Vitals (LCP/INP/CLS), email auth (SPF/DKIM/DMARC), and USD pricing kept English. Preview at /es/benchmarks and /es/benchmarks/<slug>.",
  },
  {
    path: "/benchmarks",
    locale: "pt-BR",
    status: "pending-review",
    reviewNote:
      "20-metric directional benchmarks translated to Brazilian Portuguese. Same brand-glossary preservation rules as es. Preview at /pt-BR/benchmarks and /pt-BR/benchmarks/<slug>.",
  },
]);

export function getTranslationStatus(
  path: string,
  locale: Exclude<Locale, "en-US">,
): TranslationRow | null {
  return (
    TRANSLATIONS.find((r) => r.path === path && r.locale === locale) ?? null
  );
}

export function isApproved(
  path: string,
  locale: Exclude<Locale, "en-US">,
): boolean {
  return getTranslationStatus(path, locale)?.status === "approved";
}

export function approvedLocalesForPath(
  path: string,
): ReadonlyArray<Exclude<Locale, "en-US">> {
  return TRANSLATIONS.filter(
    (r) => r.path === path && r.status === "approved",
  ).map((r) => r.locale);
}

export function allApprovedTranslations(): ReadonlyArray<TranslationRow> {
  return TRANSLATIONS.filter((r) => r.status === "approved");
}

export function localesWithApprovedContent(): ReadonlyArray<
  Exclude<Locale, "en-US">
> {
  const seen = new Set<Exclude<Locale, "en-US">>();
  for (const row of TRANSLATIONS) {
    if (row.status === "approved") seen.add(row.locale);
  }
  return Array.from(seen);
}

export function isArchived(
  path: string,
  locale: Exclude<Locale, "en-US">,
): boolean {
  return getTranslationStatus(path, locale)?.status === "archived";
}

/**
 * Every locale that has a row for the path with status `approved` OR
 * `pending-review`. Used by `generateStaticParams` so the page pre-renders
 * for preview even before approval — metadata flips it to noindex.
 */
export function renderableLocalesForPath(
  path: string,
): ReadonlyArray<Exclude<Locale, "en-US">> {
  return TRANSLATIONS.filter(
    (r) =>
      r.path === path &&
      (r.status === "approved" || r.status === "pending-review"),
  ).map((r) => r.locale);
}

/**
 * Every locale with ANY renderable row (approved OR pending-review)
 * across all paths. Used by the `app/[locale]/layout.tsx`
 * `generateStaticParams` so the locale SHELL pre-renders even when all
 * content is still pending review — without this, the layout's
 * generateStaticParams would return [] and no /{locale}/* URL would
 * exist at all, breaking the founder-preview workflow.
 *
 * Brunson Hard-Rule: a locale shell rendering for a pending-review row
 * is not a fabricated alternate — the page itself is noindex, the
 * sitemap omits it, no hreflang advertises it. The shell is only
 * reachable by someone who types the URL directly (the founder doing
 * review).
 */
export function localesWithRenderableContent(): ReadonlyArray<
  Exclude<Locale, "en-US">
> {
  const seen = new Set<Exclude<Locale, "en-US">>();
  for (const row of TRANSLATIONS) {
    if (row.status === "approved" || row.status === "pending-review") {
      seen.add(row.locale);
    }
  }
  return Array.from(seen);
}
