/**
 * Search-engine and platform ownership verification — env-driven slots.
 *
 * Surface A (organic) extension landing 2026-05-17 in response to the SEO
 * audit deduction "no Bing Webmaster verification meta tag visible." The
 * deduction was correct; the implementation gap was that Next.js exposes
 * `Metadata.verification` but the root layout never declared the field at
 * all, so every console requiring meta-tag proof was forced into slower
 * DNS verification (delays AI-Overview eligibility, Bing Copilot citation
 * metrics, Pinterest rich pin enablement, etc.).
 *
 * Slot list — each one corresponds to a real, currently-operating
 * webmaster console UnlockSaaS WILL claim once the operator creates the
 * account. Adding a verification slot for a service we'll never use
 * would be fabrication.
 *
 *   - Google Search Console        google-site-verification
 *   - Bing Webmaster Tools         msvalidate.01
 *   - Yandex Webmaster             yandex-verification
 *   - Pinterest                    p:domain_verify
 *   - Facebook (Meta) Business     facebook-domain-verification
 *   - Naver Webmaster              naver-site-verification
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every slot is empty in a fresh checkout — no fabricated codes,
 *     no placeholder strings, no "TODO" tokens.
 *   - Each entry is documented (the env var name maps to a real console
 *     the operator will visit when claiming the property).
 *   - If the env var is unset or empty, the corresponding meta tag is
 *     omitted from the page entirely.
 *
 * Why a separate module instead of inline in layout.tsx:
 *   The Next.js Metadata.verification type splits known consoles
 *   (`google` / `yahoo` / `yandex` / `me`) from arbitrary `other` entries
 *   with platform-specific tag names. Encapsulating the field assembly
 *   keeps layout.tsx readable and lets the verification surface evolve
 *   (e.g. adding Apple News, DuckDuckGo, or Brave Search) without
 *   touching the root layout.
 */

import type { Metadata } from "next";

/**
 * Read a single verification code from env. Returns undefined for unset,
 * empty, or whitespace-only values. Trims surrounding whitespace because
 * the Vercel env UI sometimes leaves trailing newlines on pasted values
 * and a stray newline inside a meta tag content breaks parsing in older
 * crawlers (Yandex in particular is known to choke on it).
 *
 * Unlike the social-URL reader in `entity.ts`, this does NOT enforce
 * an https:// prefix — verification codes are opaque tokens, not URLs.
 */
function readVerificationEnv(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  return trimmed;
}

/**
 * Build the verification block from env at module load. Returns
 * `undefined` for empty configurations so Next.js omits the field
 * entirely (cleaner than emitting an empty `verification: {}` block,
 * which some serialisers expand to no-op meta tags).
 *
 * The `other` sub-object collects every console whose verification
 * tag name does not match Next's first-class set. Each entry below
 * uses the EXACT tag name the console expects — Bing requires
 * `msvalidate.01`, Pinterest requires `p:domain_verify` with the
 * literal colon, Facebook requires `facebook-domain-verification`.
 * These string literals are part of each console's published spec.
 */
export function buildVerification(): Metadata["verification"] | undefined {
  const google = readVerificationEnv("NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION");
  const yandex = readVerificationEnv("NEXT_PUBLIC_YANDEX_VERIFICATION");
  const bing = readVerificationEnv("NEXT_PUBLIC_BING_SITE_VERIFICATION");
  const pinterest = readVerificationEnv("NEXT_PUBLIC_PINTEREST_SITE_VERIFICATION");
  const facebook = readVerificationEnv("NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION");
  const naver = readVerificationEnv("NEXT_PUBLIC_NAVER_SITE_VERIFICATION");

  // Build the `other` sub-object only when at least one entry is set.
  // An empty `other: {}` is harmless but emits noise in the serialized
  // metadata and complicates diffing against the rendered HTML in tests.
  const otherEntries: Record<string, string> = {};
  if (bing) otherEntries["msvalidate.01"] = bing;
  if (pinterest) otherEntries["p:domain_verify"] = pinterest;
  if (facebook) otherEntries["facebook-domain-verification"] = facebook;
  if (naver) otherEntries["naver-site-verification"] = naver;

  const hasAny =
    google !== undefined ||
    yandex !== undefined ||
    Object.keys(otherEntries).length > 0;

  if (!hasAny) return undefined;

  const block: Metadata["verification"] = {};
  if (google) block.google = google;
  if (yandex) block.yandex = yandex;
  if (Object.keys(otherEntries).length > 0) block.other = otherEntries;
  return block;
}
