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
  // /glossary – ISO uplift #3 (2026-05-20). Approved 2026-05-20 after
  // verifying production previews under both /es/glossary and
  // /pt-BR/glossary plus four detail-page samples (big-domino,
  // perfect-webinar, reluctant-hero, brunson-hard-rule). Verification:
  //   - 16/16 terms render in target locale with category headings
  //     localized via PAGE_CHROME_GLOSSARY.hubCategoryLabel
  //     (es: "Capa Hook…Editorial"; pt-BR: "Camada Hook…Editorial").
  //   - H1 of every detail page stays the Brunson canonical proper noun
  //     ("Hook", "Big Domino", "Reluctant Hero", "Stack Slide", "Soap
  //     Opera Sequence", "Seinfeld Email", "Perfect Webinar", "Dream
  //     100", "Wrong Person", "Weak Offer", "Weak Belief", "Value
  //     Ladder", "Verified Builder", "Brunson Hard-Rule") — drift-free
  //     from entity.DEFINED_TERMS by construction (the resolver overlay
  //     only swaps text fields, not the `term` display name).
  //   - JSON-LD per detail page: DefinedTerm + Article + FAQPage +
  //     BreadcrumbList. `inLanguage` on the new locale blocks matches
  //     the locale tag (es / pt-BR); Organization/WebSite/Person stay
  //     en-US (entity graph is locale-independent). DefinedTerm @id
  //     resolves to the en-US canonical anchor
  //     (/glossary#defined-term-set) so the schema graph is one entity
  //     across locales.
  //   - Voice discipline: Reluctant Hero, plain register, no marketing
  //     buzzwords. Neutral LATAM Spanish (no 'vosotros'). Brazilian
  //     Portuguese (não peninsular) — verified against representative
  //     sentences in big-domino and perfect-webinar prose.
  //   - Brand-glossary preserved: Hook, Story, Offer, Big Domino,
  //     Reluctant Hero, Stack Slide, SOS / Soap Opera Sequence,
  //     Seinfeld Email, Dream 100, Perfect Webinar, Wrong/Weak labels,
  //     Value Ladder, Verified Builder, Brunson Hard-Rule, Stripe,
  //     Playbook, Indie Hackers, Hacker News, ChatGPT, founder,
  //     outreach, webhook, dashboard, framework, milestones all kept
  //     English in both locales.
  //   - Content-Language HTTP header now serves `es` / `pt-BR` for the
  //     prefixed paths (fixed in e567734 on the same audit cadence;
  //     verified live before approval).
  //
  // Effect of this approval: /es/glossary, /pt-BR/glossary, and every
  // /{locale}/glossary/<slug> URL ship indexable, sitemap-listed, with
  // bidirectional hreflang back to canonical /glossary. The pending-
  // review amber banner disappears; robots flip from noindex to
  // index, follow.
  {
    path: "/glossary",
    locale: "es",
    status: "approved",
    approvedAt: "2026-05-20",
    approvedBy: "maryan",
  },
  {
    path: "/glossary",
    locale: "pt-BR",
    status: "approved",
    approvedAt: "2026-05-20",
    approvedBy: "maryan",
  },
  // /benchmarks – ISO uplift #3 (2026-05-20). Approved 2026-05-20 after
  // verifying production previews under both /es/benchmarks and
  // /pt-BR/benchmarks plus four detail-page samples (landing-page-
  // conversion-rate, saas-churn-rate, cold-email-reply-rate,
  // first-customer-time). Verification:
  //   - 20/20 metrics render with localized `metric` display name
  //     ("tasa de conversión de landing page", "taxa de churn de SaaS",
  //     etc.). Slug is preserved English for stable URLs across locales.
  //   - aeoAnswer paragraph (40-60 word direct answer) is locale-native
  //     prose with brand-glossary preserved English: confirmed on
  //     saas-churn-rate that SMB / B2B / ICP / Wrong Person / cohort /
  //     positioning / Soap Opera all came through in their canonical
  //     spelling; same on cold-email-reply-rate for Dream 100 / Apollo
  //     / Hunter / Lemlist / Reply.io / SDR / outreach / founder /
  //     Brunson.
  //   - Band labels (Underperforming / Typical range / Outperforming)
  //     stay as TypeScript discriminated union literals in the data,
  //     localized for display only via PAGE_CHROME_BENCHMARKS
  //     (es: "Por debajo / Rango típico / Por encima del rango";
  //     pt-BR: "Abaixo / Faixa típica / Acima da faixa").
  //   - JSON-LD per detail page: QAPage (localized primary question
  //     "¿Cuál es una buena {metric}?" / "Qual é uma boa {metric}?")
  //     + Article + FAQPage + BreadcrumbList. All `inLanguage` values
  //     match the locale tag.
  //   - Source attribution prose preserves vendor names (Baymard
  //     Institute, ConvertKit, ProfitWell, Lenny Rachitsky, OpenView
  //     Partners, Bessemer, ContentSquare, Hotjar, IndieHackers) and
  //     metric abbreviations (LTV, CAC, MRR, ARR, AOV, ICP, PLG, OTO,
  //     SPF, DKIM, DMARC, LCP, INP, CLS) in their canonical English
  //     casing. USD pricing ($1, $9, $19, $27, $49, $99, $149, $497,
  //     $1.000, $2.000, $5.000, $50.000) preserved.
  //
  // Effect of this approval: /es/benchmarks, /pt-BR/benchmarks, and
  // every /{locale}/benchmarks/<slug> URL ship indexable, sitemap-
  // listed, with bidirectional hreflang back to canonical /benchmarks.
  {
    path: "/benchmarks",
    locale: "es",
    status: "approved",
    approvedAt: "2026-05-20",
    approvedBy: "maryan",
  },
  {
    path: "/benchmarks",
    locale: "pt-BR",
    status: "approved",
    approvedAt: "2026-05-20",
    approvedBy: "maryan",
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

/**
 * pSEO surface plumbing extension – 2026-05-21
 * --------------------------------------------
 * Locale-aware `/[locale]/{route}/page.tsx` + `/[locale]/{route}/[slug]/page.tsx`
 * shells now exist for the eight pSEO surfaces that previously lacked
 * locale variants:
 *
 *   - /alternatives-to
 *   - /compare
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
