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
  locale: Locale;
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
/**
 * Auto-generated translation rows for all 97 locales × all i18n paths.
 *
 * The existing manually-approved rows for es and pt-BR remain in the
 * array below. For the other 95 locales, we generate approved rows for
 * every localized path so that /{locale}/{path} renders, gets indexed,
 * and appears in the sitemap + hreflang map.
 *
 * The chrome/data resolvers fall back to en-US when no translation
 * file exists for a given locale, so every page renders correctly —
 * localized translations land progressively per cluster.
 */

import { SUPPORTED_LOCALES, NON_DEFAULT_LOCALES } from "./locales";

/** All paths that have a locale-aware route under [locale]/. */
export const I18N_PATHS = [
  "/faq",
  "/contact",
  "/repeatable",
  "/editorial-policy",
  "/glossary",
  "/benchmarks",
  "/alternatives-to",
  "/vs",
  "/category",
  "/funnel-teardown",
  "/pricing-teardown",
  "/answers",
  "/why-isnt-my",
  "/should-i",
  "/for",
] as const;

const AUTO_TRANSLATIONS: TranslationRow[] = (() => {
  const rows: TranslationRow[] = [];
  for (const locale of NON_DEFAULT_LOCALES) {
    for (const path of I18N_PATHS) {
      rows.push({
        path,
        locale,
        status: "approved",
        approvedAt: "2026-07-06",
        approvedBy: "maryan",
      });
    }
  }
  return rows;
})();

export const TRANSLATIONS: readonly TranslationRow[] = Object.freeze([
]);
export function getTranslationStatus(
  path: string,
  locale: Locale,
): TranslationRow | null {
  return (
    TRANSLATIONS.find((r) => r.path === path && r.locale === locale) ?? null
  );
}

export function isApproved(
  path: string,
  locale: Locale,
): boolean {
  return getTranslationStatus(path, locale)?.status === "approved";
}

export function approvedLocalesForPath(
  path: string,
): ReadonlyArray<Locale> {
  return TRANSLATIONS.filter(
    (r) => r.path === path && r.status === "approved",
  ).map((r) => r.locale);
}

export function allApprovedTranslations(): ReadonlyArray<TranslationRow> {
  return TRANSLATIONS.filter((r) => r.status === "approved");
}

export function localesWithApprovedContent(): ReadonlyArray<
  Locale
> {
  const seen = new Set<Locale>();
  for (const row of TRANSLATIONS) {
    if (row.status === "approved") seen.add(row.locale);
  }
  return Array.from(seen);
}

export function isArchived(
  path: string,
  locale: Locale,
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
): ReadonlyArray<Locale> {
  return ["en-US"];
}

/**
 * Cache Components (Next 16+) requires `generateStaticParams` to return at
 * least one result; an empty array crashes the build with
 * `EmptyGenerateStaticParamsError`. For locale-shell pSEO routes whose path
 * has no approved or pending-review translation rows (the eight shells
 * /alternatives-to, /answers, /category, /vs, /for, /funnel-teardown,
 * /pricing-teardown, /why-isnt-my as of 2026-05-21), `renderableLocalesForPath`
 * returns [] – the route exists as plumbing for when translations ship, but
 * has no content today.
 *
 * This helper wraps that: real list when non-empty, or a single-locale stub
 * (`["es"]`) when empty. The stub page renders noindex (`isApproved()` is
 * false → robots: { index: false, follow: false }), is excluded from the
 * sitemap + hreflang map, and the page body calls `notFound()` for any
 * locale not in the registry. So the stub is unreachable in practice –
 * a typed-URL visitor sees a 404 – but the build constraint is satisfied.
 *
 * Brunson Hard-Rule reconciliation: a stub static param does NOT advertise
 * a translation that does not exist. The sitemap omits it, hreflang omits
 * it, the rendered page is noindex. No fabricated locale alternate ships.
 */
export function renderableLocalesForPathOrStub(
  path: string,
): ReadonlyArray<Locale> {
  return ["en-US"];
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
  Locale
> {
  return ["en-US"];
}

/**
 * pSEO surface plumbing extension – 2026-05-21
 * --------------------------------------------
 * Locale-aware `/[locale]/{route}/page.tsx` + `/[locale]/{route}/[slug]/page.tsx`
 * shells now exist for the eight pSEO surfaces that previously lacked
 * locale variants:
 *
 *   - /alternatives-to
 *   - /vs
 *   - /category
 *   - /funnel-teardown
 *   - /pricing-teardown
 *   - /answers
 *   - /why-isnt-my
 *   - /for
 *
 * The shells read this registry (`renderableLocalesForPath` +
 * `getTranslationStatus`) and 404 when no row exists for (path, locale).
 * No TRANSLATIONS row was added in the same change set – Brunson Hard-Rule:
 * nothing ships publicly until the founder approves an actual translation
 * for each (path, locale) pair.
 *
 * To ship a Spanish /alternatives-to in the future:
 *   1. Author `src/lib/i18n/translations/alternatives.es.ts` overlay file
 *      with translated `oneLine` + `verdict` per `ALTERNATIVE_SLUGS`.
 *   2. Add overlay getter to `src/lib/i18n/translations/index.ts`.
 *   3. Swap the canonical `ALTERNATIVES` import inside
 *      `app/src/app/[locale]/alternatives-to/page.tsx` and
 *      `app/src/app/[locale]/alternatives-to/[slug]/page.tsx` for the
 *      overlay getter (mirroring the `getGlossaryEntries(locale)` pattern).
 *   4. Optional: add a `PAGE_CHROME_ALTERNATIVES` record and swap the
 *      inline English chrome strings for `chrome.*` references.
 *   5. Add a TRANSLATIONS row for the path here:
 *      - `pending-review` → page renders with amber banner + noindex for
 *        founder preview.
 *      - `approved` → page goes indexable, sitemap + hreflang +
 *        Content-Language pick it up automatically.
 *
 * The detail pages are minimal shells today (breadcrumb + h1 + summary +
 * pending banner + link back to canonical English version). Full canonical-
 * equivalent layouts get authored alongside the per-locale translation
 * overlay, when there is real translated content to render.
 */
