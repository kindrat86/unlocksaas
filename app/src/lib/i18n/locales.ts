/**
 * Supported locales for UnlockSaaS.
 *
 * en-US is the canonical locale. es and pt-BR have real, founder-
 * reviewed translation files under src/lib/i18n/translations/.
 *
 * FIX: previously listed "de" (no translation files exist) and omitted
 * "pt-BR" (translation files exist). Swapped to match reality.
 */

export const SUPPORTED_LOCALES = [
  "en-US",
  "es",
  "pt-BR",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en-US";

export const NON_DEFAULT_LOCALES = SUPPORTED_LOCALES.filter(
  (l): l is Exclude<Locale, typeof DEFAULT_LOCALE> => l !== DEFAULT_LOCALE,
);

/** Runtime guard. */
export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function localizedPath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/**
 * BCP 47 → OpenGraph locale format. og:locale uses underscores.
 */
export function ogLocaleFormat(locale: Locale): string {
  const map: Record<Locale, string> = {
    "en-US": "en_US",
    "es": "es_ES",
    "pt-BR": "pt_BR",
  };
  return map[locale] ?? "en_US";
}

/** Human-readable display name for the language switcher. */
export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  "en-US": "English",
  "es": "Español",
  "pt-BR": "Português (Brasil)",
};

/** RTL locales — need dir="rtl" on the html/div wrapper. */
export const RTL_LOCALES = new Set<string>(["ar", "ur", "fa", "he", "ps", "ug"]);

/** Whether the locale is written right-to-left. */
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}
