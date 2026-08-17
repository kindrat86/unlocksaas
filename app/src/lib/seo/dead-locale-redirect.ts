/**
 * Dead-locale URL recovery — GSC "Not found (404)" remediation (2026-08-17).
 *
 * History: before 2026-07-07 the sitemap advertised ~97 locales × 15 paths
 * (~1,455 URLs) via an AUTO_TRANSLATIONS block. Only `es` and `pt-BR` ever
 * had real, founder-approved translation files. Commits 2b2e96a/c674503
 * removed the rest — every one of those URLs now hard-404s while Google
 * still crawls them from its cached sitemap history. GSC reported the wave
 * as "Not found (404)" + "Duplicate, Google chose different canonical than
 * user" on 2026-08-17.
 *
 * Fix strategy (Google's guidance for retired URL families): 308 the dead
 * `/{locale}/{path}` URLs to the canonical English page. Surviving link
 * equity consolidates onto the English canonicals, the 404 wave stops, and
 * the duplicate-canonical noise clears as Google re-crawls. Live locales
 * (`es`, `pt-BR`) on approved paths are untouched; `es`/`pt-BR` on
 * NON-approved paths also redirect (those pages never legitimately existed
 * — they 404 today).
 *
 * The registry import is proxy-safe: `@/lib/i18n/registry` is a pure,
 * frozen-in-memory module whose only import is a type from `./locales`.
 */

import { approvedLocalesForPath } from "@/lib/i18n/registry";
import { isLocale } from "@/lib/i18n/locales";

/**
 * Locale codes that were once auto-generated and are now retired.
 * Exactly the SUPPORTED_LOCALES list recovered from git history
 * (commit 86eb247, 110 codes) minus the three real ones:
 * en-US (default, never prefixed), es, pt-BR. Lowercase-compared
 * because the old sitemap used lowercase codes (e.g. /pt-br/faq).
 */
const RETIRED_LOCALE_CODES: ReadonlySet<string> = new Set(
  [
    "zh-CN", "hi", "fr", "ar", "bn", "pt", "ru", "ur", "id", "de",
    "ja", "mr", "te", "tr", "ta", "vi", "yue", "pa-PK", "ko", "fa",
    "it", "th", "gu", "kn", "ml", "or", "pl", "uk", "nl", "ro",
    "el", "cs", "hu", "sv", "fi", "no", "da", "he", "sw", "am",
    "so", "ha", "yo", "ig", "zu", "xh", "af", "ms", "my", "km",
    "lo", "ne", "si", "ps", "kk", "uz", "az", "ka", "hy", "mn",
    "bo", "ug", "tl", "ceb", "ilo", "jv", "su", "mad", "hmn", "ku",
    "bal", "tg", "tk", "sq", "sr", "hr", "bs", "sk", "sl", "lt",
    "lv", "et", "be", "bg", "mk", "ca", "eu", "gl", "cy", "ga",
    "gd", "br", "is", "lb", "mt",
  ].map((l) => l.toLowerCase()),
);

/** Paths that are files/feeds/assets rather than pages — never locale-prefixed. */
const ASSET_OR_MACHINE_RE =
  /\.(?:atom|bib|csv|html|ics|json|jsonld|m4a|md|mp3|mp4|pdf|ris|rss|txt|webmanifest|xml|svg|png|jpg|jpeg|gif|webp)$/i;
const MACHINE_PREFIXES = ["/.well-known/", "/feed/", "/api/", "/_next/"] as const;

function isAssetOrMachinePath(pathname: string): boolean {
  if (MACHINE_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return ASSET_OR_MACHINE_RE.test(pathname);
}

/**
 * If `pathname` is a dead-locale URL, return the canonical English path to
 * 308-redirect to. Returns null for everything else (live locale pages,
 * non-locale paths, asset paths).
 *
 *   /de/faq            → /faq
 *   /ja/glossary/hook  → /glossary/hook
 *   /es/vs             → /vs      (es live, but /es/vs never approved)
 *   /pt-br/faq         → /faq     (case-insensitive; canonical prefix is pt-BR)
 *   /de                → /        (bare locale root)
 *   /faq               → null     (not a locale URL)
 *   /es/faq            → null     (live approved translation — serve it)
 *   /es/faq.json       → null     (asset — never had a locale mirror)
 */
export function deadLocaleRedirect(pathname: string): string | null {
  // Strip a trailing slash before matching (trailingSlash: false anyway).
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  const m = /^\/([a-zA-Z]{2,3}(?:-[a-zA-Z]{2,8})?)(\/.*)?$/.exec(path);
  if (!m) return null;
  const [, rawLocale, rest = ""] = m;
  const localeLower = rawLocale.toLowerCase();

  // Machine-readable surfaces and assets never had locale mirrors — let
  // them 404/serve normally instead of minting /{path}.json redirects.
  if (isAssetOrMachinePath(path)) return null;

  // Case-variants of the live locales (/PT-BR/faq) normalise to the live
  // prefix check below; everything else retired redirects.
  if (RETIRED_LOCALE_CODES.has(localeLower)) {
    return rest === "" ? "/" : rest;
  }

  if (localeLower === "pt-br") {
    // Case-variant of the live prefix; treat as the canonical pt-BR.
    const englishPath = rest === "" ? "/" : rest;
    if (approvedLocalesForPath(englishPath).length > 0) return null;
    return englishPath;
  }

  if (isLocale(rawLocale) && rawLocale !== "en-US") {
    const englishPath = rest === "" ? "/" : rest;
    if (approvedLocalesForPath(englishPath).length > 0) return null; // live page
    return englishPath; // live locale, never-approved path → English canonical
  }

  return null;
}
