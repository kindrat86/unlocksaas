/**
 * Supported locales for UnlockSaaS.
 *
 * Why this file exists
 * --------------------
 * The locked Brunson strategy ships en-US as canonical (strategy/google-strategy.md
 * §A.4 monolingual declaration). The first audit pass flagged "International SEO
 * ceiling unlocks only when translated surfaces ship." The founder
 * (sales@sipiteno.com, 2026-05-18) explicitly approved building the pipeline for
 * es and pt-BR with the rule "no URL ships in sitemap until founder approves
 * the translation page-by-page."
 *
 * Architecture summary
 * --------------------
 * - `en-US` is the canonical, ALWAYS-shipped locale. Root URLs (`/`, `/faq`,
 *   `/funnel-teardown/<slug>`, etc.) serve en-US.
 * - `es` and `pt-BR` are GATED locales. Their URLs live under `/{locale}/...`
 *   (e.g. `/es/faq`, `/pt-BR/faq`). A locale-route ONLY exists for the
 *   (path, locale) pairs registered in `src/lib/i18n/registry.ts` with
 *   status `approved`. Unknown locale segments 404; unapproved
 *   (path, locale) pairs 404.
 * - Sitemap, hreflang, and JSON-LD `inLanguage` honour the registry. Nothing
 *   is advertised that isn't approved.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * Adding a new locale here is INFRASTRUCTURE only — it does not create any
 * indexable URL. Indexable URLs are created exclusively by adding rows to
 * `TRANSLATIONS` in `src/lib/i18n/registry.ts` with `status: "approved"`.
 *
 * Locale tag choice
 * -----------------
 * - `en-US`: BCP 47, matches existing Content-Language header and JSON-LD.
 * - `es`: BCP 47 language-only. Spanish-speaking indie SaaS communities are
 *   distributed across many regions (ES, MX, AR, CO, CL). A region-neutral
 *   `es` is the correct anchor; a region-specific subtag would over-claim.
 * - `pt-BR`: BCP 47 language + region. Indie SaaS Portuguese audience is
 *   overwhelmingly Brazilian; pt-PT (European Portuguese) is a different
 *   audience with different idioms and would mis-target. Declaring pt-BR
 *   explicitly is honest.
 */

export const SUPPORTED_LOCALES = ["en-US", "es", "pt-BR"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * The canonical, always-shipped locale. The default locale's URLs do NOT
 * carry a locale prefix; locale variants live under `/{locale}/...`.
 */
export const DEFAULT_LOCALE: Locale = "en-US";

/**
 * Locales available as URL-path segments (everything except the default).
 */
export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter(
  (l): l is Exclude<Locale, typeof DEFAULT_LOCALE> => l !== DEFAULT_LOCALE,
);

/** Runtime guard. */
export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Build a locale-prefixed path. Default locale gets no prefix.
 *
 *   localizedPath("/faq", "en-US") → "/faq"
 *   localizedPath("/faq", "es")    → "/es/faq"
 *   localizedPath("/", "pt-BR")    → "/pt-BR"
 */
export function localizedPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/**
 * BCP 47 → OpenGraph locale format. og:locale uses underscores.
 */
export const LOCALE_OG_FORMAT: Record<Locale, string> = {
  "en-US": "en_US",
  es: "es_ES",
  "pt-BR": "pt_BR",
};
