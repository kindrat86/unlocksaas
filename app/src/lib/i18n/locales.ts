/**
 * Supported locales for UnlockSaaS.
 *
 * en-US is the canonical, always-shipped locale. All other locales live
 * under /{locale}/... and fall back to en-US chrome/data when no
 * translation file exists (the getters handle the fallback). This lets
 * 97 locales ship as URL routes immediately — translations land
 * progressively per cluster.
 */

export const SUPPORTED_LOCALES = [
  "en-US",
  // Top 20 by speaker count
  "zh-CN", "hi", "es", "fr", "ar", "bn", "pt", "ru", "ur", "id",
  "de", "ja", "mr", "te", "tr", "ta", "vi", "yue", "pa-PK", "ko",
  // Next tier
  "fa", "it", "th", "gu", "kn", "ml", "or", "pl", "uk", "nl",
  "ro", "el", "cs", "hu", "sv", "fi", "no", "da", "he", "sw",
  "am", "so", "ha", "yo", "ig", "zu", "xh", "af", "ms", "my",
  "km", "lo", "ne", "si", "ps", "kk", "uz", "az", "ka", "hy",
  "mn", "bo", "ug", "tl", "ceb", "ilo", "jv", "su", "mad", "hmn",
  "ku", "bal", "tg", "tk", "sq", "sr", "hr", "bs", "sk", "sl",
  "lt", "lv", "et", "be", "bg", "mk", "ca", "eu", "gl", "cy",
  "ga", "gd", "br", "is", "lb", "mt",
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
  "zh-CN": "中文",
  "hi": "हिन्दी",
  "es": "Español",
  "fr": "Français",
  "ar": "العربية",
  "bn": "বাংলা",
  "pt": "Português",
  "ru": "Русский",
  "ur": "اردو",
  "id": "Indonesia",
  "de": "Deutsch",
  "ja": "日本語",
  "mr": "मराठी",
  "te": "తెలుగు",
  "tr": "Türkçe",
  "ta": "தமிழ்",
  "vi": "Tiếng Việt",
  "yue": "粵語",
  "pa-PK": "پنجابی",
  "ko": "한국어",
  "fa": "فارسی",
  "it": "Italiano",
  "th": "ไทย",
  "gu": "ગુજરાતી",
  "kn": "ಕನ್ನಡ",
  "ml": "മലയാളം",
  "or": "ଓଡ଼ିଆ",
  "pl": "Polski",
  "uk": "Українська",
  "nl": "Nederlands",
  "ro": "Română",
  "el": "Ελληνικά",
  "cs": "Čeština",
  "hu": "Magyar",
  "sv": "Svenska",
  "fi": "Suomi",
  "no": "Norsk",
  "da": "Dansk",
  "he": "עברית",
  "sw": "Kiswahili",
  "am": "አማርኛ",
  "so": "Soomaali",
  "ha": "Hausa",
  "yo": "Yorùbá",
  "ig": "Igbo",
  "zu": "isiZulu",
  "xh": "isiXhosa",
  "af": "Afrikaans",
  "ms": "Melayu",
  "my": "မြန်မာ",
  "km": "ខ្មែរ",
  "lo": "ລາວ",
  "ne": "नेपाली",
  "si": "සිංහල",
  "ps": "پښتو",
  "kk": "Қазақ",
  "uz": "O'zbek",
  "az": "Azərbaycan",
  "ka": "ქართული",
  "hy": "Հայերեն",
  "mn": "Монгол",
  "bo": "བོད་ཡིག",
  "ug": "ئۇيغۇرچە",
  "tl": "Tagalog",
  "ceb": "Cebuano",
  "ilo": "Ilokano",
  "jv": "Basa Jawa",
  "su": "Basa Sunda",
  "mad": "Madhura",
  "hmn": "Hmoob",
  "ku": "Kurdî",
  "bal": "بلوچی",
  "tg": "Тоҷикӣ",
  "tk": "Türkmen",
  "sq": "Shqip",
  "sr": "Српски",
  "hr": "Hrvatski",
  "bs": "Bosanski",
  "sk": "Slovenčina",
  "sl": "Slovenščina",
  "lt": "Lietuvių",
  "lv": "Latviešu",
  "et": "Eesti",
  "be": "Беларуская",
  "bg": "Български",
  "mk": "Македонски",
  "ca": "Català",
  "eu": "Euskara",
  "gl": "Galego",
  "cy": "Cymraeg",
  "ga": "Gaeilge",
  "gd": "Gàidhlig",
  "br": "Brezhoneg",
  "is": "Íslenska",
  "lb": "Lëtzebuergesch",
  "mt": "Malti",
};

/** RTL locales — need dir="rtl" on the html/div wrapper. */
export const RTL_LOCALES = new Set<string>(["ar", "ur", "fa", "he", "ps", "ug"]);

/** Whether the locale is written right-to-left. */
export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}
