/**
 * Supported locales for UnlockSaaS.
 *
 * en-US is the canonical and only shipped locale.
 */

export const SUPPORTED_LOCALES = [
  "en-US",
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
 * For locales not in this map, we derive a best-effort og format.
 */
export function ogLocaleFormat(locale: Locale): string {
  if (locale === "en-US") return "en_US";
  const dashIdx = locale.indexOf("-");
  if (dashIdx > 0) {
    return locale.slice(0, dashIdx) + "_" + locale.slice(dashIdx + 1);
  }
  return locale + "_" + locale.toUpperCase();
}

/** Human-readable display name for the language switcher. */
export const LOCALE_DISPLAY_NAMES: Record<Locale, string> = {
  "en-US": "English",
};

/** RTL locales — need dir="rtl" on the html/div wrapper. */
export const RTL_LOCALES = new Set<string>(["ar", "ur", "fa", "he", "ps", "ug"]);

/** Whether the locale is written right-to-left. */
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}
