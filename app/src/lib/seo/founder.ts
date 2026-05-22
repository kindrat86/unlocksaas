/**
 * Founder-level Person enrichment helpers.
 *
 * Single source of truth for the env-driven slots that hang off the
 * `Person` JSON-LD block in src/components/seo/json-ld.tsx. Mirrors the
 * env-gate pattern used by ORGANIZATION_SAME_AS / ORGANIZATION_MAIN_ENTITY_OF_PAGE
 * in entity.ts: each value resolves once at module load; an unset env var
 * becomes a frozen empty array (or undefined), and the consumer omits the
 * key entirely – never ships `null`, `undefined`, or a `[]` placeholder.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - `alumniOf`, `award`, and `sameAs` are operator-gated. A fresh checkout
 *     ships nothing; the schema lights up only after the operator drops
 *     real values into Vercel.
 *   - `knowsAbout` is hard-coded but every entry is verifiable: the entries
 *     are sourced from DEFINED_TERMS (the Brunson glossary the site
 *     publishes at /glossary) plus the broader KNOWS_ABOUT topical-authority
 *     list. The product teaches every term in DEFINED_TERMS; the founder is
 *     the one teaching it. Both statements are independently provable on
 *     the public surface.
 *   - `subjectOf` from earned media is built in the consumer from
 *     getEarnedMentions(), which carries the build-time integrity gate
 *     (validateMentions IIFE in src/lib/media-mentions.ts). No fabricated
 *     mention can ship.
 *
 * Env naming convention: NEXT_PUBLIC_FOUNDER_* mirrors the existing
 * NEXT_PUBLIC_UNLOCKSAAS_* slots in entity.ts. The `NEXT_PUBLIC_` prefix is
 * the existing project-wide convention for build-time JSON-LD values – the
 * Organization sameAs slots use the same prefix even though none of those
 * URLs are sensitive.
 */

import { DEFINED_TERMS, KNOWS_ABOUT, extractWikidataQid } from "@/lib/seo/entity";

/**
 * Reads a candidate URL from env. Returns undefined if the env var is
 * unset, empty, or doesn't look like an absolute https URL. Strict by
 * design – a malformed sameAs row tanks Knowledge Graph eligibility for
 * the whole block, so we drop bad values silently rather than ship them.
 *
 * Duplicated from entity.ts's `readSocialEnv` rather than imported so
 * this module stays self-contained for callers that want founder-only
 * env reads without pulling the rest of entity.ts.
 */
function readUrlEnv(key: string): string | undefined {
  const raw = process.env[key];
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
 * Reads a comma-separated env var and returns a frozen string[] of trimmed
 * non-empty entries. An unset / empty env yields a frozen empty array,
 * which the consumer should treat as "omit the schema key entirely."
 */
function readCsvEnv(key: string): readonly string[] {
  const raw = process.env[key];
  if (!raw) return Object.freeze([]);
  const entries = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return Object.freeze(entries);
}

/**
 * Knowledge-Graph anchors for the Founder Person entity – parallel to the
 * Organization-level slots in entity.ts. Maryan-the-Person and Unlock-SaaS-
 * the-Organization are SEPARATE entities in the Wikidata / Wikipedia graph;
 * each can have its own Q-item and its own Wikipedia article once notable.
 *
 * The Founder slots stay empty until the Person passes Wikidata notability
 * (typically: authorship of a notable work, founder of a notable company,
 * or two non-trivial secondary sources). Brunson Hard-Rule: never fabricate
 * Maryan's Q-ID. The empty default is honest and correct.
 *
 * Exposed as hoisted module-scope constants so consumers other than sameAs
 * can resolve them:
 *   - FOUNDER_WIKIDATA_URL    – Person.sameAs row.
 *   - FOUNDER_WIKIDATA_QID    – Person.identifier[] PropertyValue.
 *   - FOUNDER_WIKIPEDIA_URL   – Person.sameAs row AND Person.mainEntityOfPage
 *                               (one-to-one authoritative-description anchor).
 */
export const FOUNDER_WIKIDATA_URL: string | undefined = readUrlEnv(
  "NEXT_PUBLIC_FOUNDER_WIKIDATA_URL",
);

export const FOUNDER_WIKIPEDIA_URL: string | undefined = readUrlEnv(
  "NEXT_PUBLIC_FOUNDER_WIKIPEDIA_URL",
);

/**
 * Bare Wikidata Q-ID for the Founder Person (e.g. "Q987654321"). Derived
 * from FOUNDER_WIKIDATA_URL via the shared `extractWikidataQid` helper in
 * entity.ts – same validation, same rejection rules.
 *
 * Undefined until both:
 *   1. NEXT_PUBLIC_FOUNDER_WIKIDATA_URL is set to a valid https URL.
 *   2. That URL's last path segment matches `^Q\d+$`.
 */
export const FOUNDER_WIKIDATA_QID: string | undefined = extractWikidataQid(
  FOUNDER_WIKIDATA_URL,
);

/**
 * Build the founder's `sameAs` array from per-platform env vars.
 *
 * Each platform has its own env slot so the operator can flip one at a
 * time as profiles get round-trip claimed (the platform bio must name
 * unlocksaas.com – see strategy/sameas-activation-playbook.md for the
 * bidirectional rule). Empty / malformed values are silently dropped.
 *
 * Defaults to a frozen empty array. Consumers MUST omit the `sameAs`
 * key entirely when the array is empty – an empty array on Person.sameAs
 * is a fabrication tell to KG validators.
 *
 * Env vars consulted (suggested fill order by GEO/AIO leverage):
 *   1. NEXT_PUBLIC_FOUNDER_WIKIDATA_URL          (highest – KG anchor)
 *   2. NEXT_PUBLIC_FOUNDER_WIKIPEDIA_URL         (highest – LLM training corpus)
 *   3. NEXT_PUBLIC_FOUNDER_SAMEAS_LINKEDIN
 *   4. NEXT_PUBLIC_FOUNDER_SAMEAS_TWITTER
 *   5. NEXT_PUBLIC_FOUNDER_SAMEAS_GITHUB
 *   6. NEXT_PUBLIC_FOUNDER_SAMEAS_CRUNCHBASE
 *   7. NEXT_PUBLIC_FOUNDER_SAMEAS_PRODUCT_HUNT
 *   8. NEXT_PUBLIC_FOUNDER_SAMEAS_ANGELLIST
 */
function buildFounderSameAs(): readonly string[] {
  const candidates = [
    // Knowledge-Graph anchors first – strongest signals in the array.
    FOUNDER_WIKIDATA_URL,
    FOUNDER_WIKIPEDIA_URL,
    readUrlEnv("NEXT_PUBLIC_FOUNDER_SAMEAS_LINKEDIN"),
    readUrlEnv("NEXT_PUBLIC_FOUNDER_SAMEAS_TWITTER"),
    readUrlEnv("NEXT_PUBLIC_FOUNDER_SAMEAS_GITHUB"),
    readUrlEnv("NEXT_PUBLIC_FOUNDER_SAMEAS_CRUNCHBASE"),
    readUrlEnv("NEXT_PUBLIC_FOUNDER_SAMEAS_PRODUCT_HUNT"),
    readUrlEnv("NEXT_PUBLIC_FOUNDER_SAMEAS_ANGELLIST"),
  ].filter((v): v is string => typeof v === "string");
  return Object.freeze(Array.from(new Set(candidates)));
}

/**
 * Frozen at module load. Re-read only on cold start; Vercel env updates
 * are picked up at deploy time, not at request time.
 */
export const FOUNDER_SAME_AS: readonly string[] = buildFounderSameAs();

/**
 * EducationalOrganization names the founder is an alumnus of. Comma-
 * separated env. Each becomes a `{ "@type": "EducationalOrganization",
 * "name": "..." }` entry in `Person.alumniOf`.
 *
 * Brunson Hard-Rule: this stays empty until the operator provides real
 * institution names. The codebase has no source-of-truth bio claim for
 * Maryan's alma mater, so nothing ships by default.
 */
export const FOUNDER_ALUMNI_OF: readonly string[] = readCsvEnv(
  "NEXT_PUBLIC_FOUNDER_ALUMNI_OF",
);

/**
 * Award strings. Comma-separated env. Each becomes a plain-string entry
 * in `Person.award`. schema.org accepts `Text` for the award value, so a
 * short descriptor like "Indie Hackers Featured Maker 2025" is sufficient.
 *
 * Brunson Hard-Rule: empty until the operator provides real awards.
 */
export const FOUNDER_AWARDS: readonly string[] = readCsvEnv(
  "NEXT_PUBLIC_FOUNDER_AWARDS",
);

/**
 * Founder-level `knowsAbout` list. Hard-coded because every entry is
 * verifiable on the public surface – the product literally teaches each
 * term (see /glossary, /faq, /funnel-teardown, /pricing-teardown).
 *
 * Composed from three sources, in priority order:
 *   1. The Brunson glossary terms the site publishes (DEFINED_TERMS) –
 *      these are the exact strings the DefinedTermSet declares.
 *   2. The broader topical-authority list shared with Organization
 *      (KNOWS_ABOUT) – workbook-section / shipped-surface mappings.
 *   3. The 5 founder-specific skills the prior block carried, preserved
 *      so we don't drop signal the previous schema already declared.
 *
 * Deduplicated and frozen at module load. The DEFINED_TERMS entries are
 * listed FIRST so retrievers walking knowsAbout top-down hit the
 * Brunson-glossary anchors before the broader topical list – the same
 * order-of-importance pattern the Organization subjectOf block uses.
 */
const FOUNDER_BASELINE_SKILLS: readonly string[] = Object.freeze([
  "Customer development",
  "Sales funnel design",
  "Indie SaaS go-to-market",
  "Russell Brunson DotCom Secrets framework",
  "AI-assisted product development",
]);

function buildFounderKnowsAbout(): readonly string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const push = (s: string) => {
    if (!seen.has(s)) {
      seen.add(s);
      ordered.push(s);
    }
  };
  for (const t of DEFINED_TERMS) push(t.term);
  for (const k of KNOWS_ABOUT) push(k);
  for (const s of FOUNDER_BASELINE_SKILLS) push(s);
  return Object.freeze(ordered);
}

export const FOUNDER_KNOWS_ABOUT: readonly string[] = buildFounderKnowsAbout();
