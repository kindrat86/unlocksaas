/**
 * /funnel-playbook/{funnel}-for-{niche} matrix pSEO — funnel × niche.
 *
 * Cross-product of FUNNEL_PLAYBOOK_ENTRIES (n=8) and NICHE_ENTRIES (n=12),
 * producing 96 combo pages. Targets the money-keyword shape founders
 * actually type: "tripwire funnel for course creators", "VSL for AI
 * wrappers", "soap opera sequence for agency owners".
 *
 * Synthesis rules (deliberate, kept honest):
 *   - The funnel mechanics (steps, when-to-use, common mistakes) are the
 *     funnel's; we never invent new steps per cohort.
 *   - The cohort lens (price band, vocabulary, the one mistake this
 *     cohort makes with this funnel) is the niche's; we never invent new
 *     pain per funnel.
 *   - The per-combo synthesis bridges the two – it does NOT generate
 *     unique claims. Every sentence is derivable from the source entries.
 *
 * Brunson Hard-Rule reconciliation:
 *   - No invented testimonials, no per-cohort fake stats.
 *   - Same Hook / Story / Offer triage, same Playbook, same Stack –
 *     the matrix page is a discoverable surface, not a different product.
 *   - Each combo page funnels back to /diagnostic for the personalised
 *     read, and crosslinks to both /funnel-playbook/{funnel} and
 *     /for/{niche} so a reader who landed on the combo can climb to
 *     either parent hub.
 *
 * URL strategy:
 *   - Combo slug is `${funnel.slug}-for-${niche.slug}`.
 *   - Parsing splits on the first occurrence of "-for-" and validates
 *     both sides against the two dictionaries. Neither funnel slugs nor
 *     niche slugs contain "-for-" as a substring (audited 2026-05-21),
 *     so the split is unambiguous.
 *   - The bare-funnel route /funnel-playbook/{funnel} continues to live
 *     in the same [slug]/page.tsx; matrix combos extend its
 *     generateStaticParams output.
 */

import {
  FUNNEL_PLAYBOOK_ENTRIES,
  getFunnelPlaybookBySlug,
  type FunnelPlaybookEntry,
} from "@/lib/funnel-playbooks";
import {
  NICHE_ENTRIES,
  getNicheBySlug,
  type NicheEntry,
} from "@/lib/niches";

/**
 * Combo entry surfaced to the per-page renderer. Every field is
 * derivable from `funnel` and `niche` – the page can reach back to
 * either source for additional surfaces.
 */
export interface FunnelMatrixEntry {
  /** Combo URL slug: `${funnel.slug}-for-${niche.slug}`. */
  slug: string;
  /** Funnel half of the combo (full FunnelPlaybookEntry). */
  funnel: FunnelPlaybookEntry;
  /** Niche half of the combo (full NicheEntry). */
  niche: NicheEntry;
  /** "Tripwire funnel for course creators". */
  displayName: string;
  /** "Tripwire Funnel for Course Creators (Brunson Playbook)" ≤ 60 chars. */
  metaTitle: string;
  /** ≤ 160 chars; combines funnel mechanic with cohort lens. */
  metaDescription: string;
  /** 1-paragraph synthesis used as the hero subhead + Article abstract. */
  tldr: string;
  /** Fit verdict text – does this funnel slot into this cohort's money mechanics. */
  fitVerdict: string;
  /** What the standard funnel playbook needs to shift for this cohort. */
  cohortAdaptation: string;
  /** The cohort's specific failure mode when running this funnel. */
  cohortFailureMode: string;
  /** Combined FAQs: 2 from funnel + 2 from niche, deduped by question. */
  faqs: ReadonlyArray<{ q: string; a: string }>;
  /** Union of related glossary slugs. */
  relatedGlossary: ReadonlyArray<string>;
  /** ISO date – max(funnel.lastVerified, niche.lastVerified). */
  lastVerified: string;
}

const MATRIX_SEPARATOR = "-for-";

/**
 * Capitalise the first letter of a string (used for title-casing the
 * funnel/niche display names when they appear at the start of a
 * sentence).
 */
function capitaliseFirst(s: string): string {
  if (s.length === 0) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Title-case for the meta title (Capitalise Every Word). Keeps short
 * connector words ("for", "a", "and", "or", "the") lowercase per
 * standard meta-title conventions.
 */
function titleCase(s: string): string {
  const small = new Set(["a", "and", "for", "or", "the", "to", "of", "in"]);
  return s
    .split(" ")
    .map((word, i) => {
      if (i > 0 && small.has(word.toLowerCase())) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Produce the combo slug from two source entries.
 */
function buildSlug(funnel: FunnelPlaybookEntry, niche: NicheEntry): string {
  return `${funnel.slug}${MATRIX_SEPARATOR}${niche.slug}`;
}

/**
 * Combo display name. "Tripwire funnel for course creators".
 *
 * The funnel's displayName already includes "funnel" or the funnel
 * category word ("Soap Opera Sequence", "Seinfeld Email pattern"), so
 * we don't append "funnel" here – we just join.
 */
function buildDisplayName(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): string {
  return `${funnel.displayName} for ${niche.displayName}`;
}

/**
 * SEO meta title. Target shape ≤ 60 chars where possible. The longest
 * combo today is "Soap Opera Sequence for Info Product Creators" = 47
 * chars + " – Unlock SaaS" = 63 chars. We accept slight overflow on the
 * longest combos rather than truncate the cohort name (the cohort word
 * is the click-driver).
 */
function buildMetaTitle(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): string {
  return `${titleCase(buildDisplayName(funnel, niche))} – Unlock SaaS`;
}

/**
 * SEO meta description. Two-clause shape: "[Funnel mechanic in one
 * sentence]. Tuned to [niche]'s [money-mechanic shorthand]." Caps the
 * description at ≤ 160 chars by re-using the funnel's short
 * metaDescription as the lead clause, then appending the cohort hook.
 */
function buildMetaDescription(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): string {
  const lead = funnel.metaDescription.split(".")[0].trim();
  const tail = `Tuned for ${niche.displayName}.`;
  const candidate = `${lead}. ${tail}`;
  if (candidate.length <= 160) return candidate;
  // Fallback: truncate the lead clause and keep the cohort hook intact
  // because the cohort word is what drives the SERP click.
  const max = 160 - tail.length - 2; // 2 = ". "
  return `${lead.substring(0, max)}. ${tail}`;
}

/**
 * Combo TL;DR. Synthesises funnel.tldr (the mechanic) with niche.cohortPain
 * (the audience-specific shape of the problem). Reads as one paragraph;
 * keeps both source statements intact rather than paraphrasing them.
 */
function buildTldr(funnel: FunnelPlaybookEntry, niche: NicheEntry): string {
  return `${funnel.tldr} For ${niche.displayName}, the shape of the problem this funnel solves looks like this: ${niche.cohortPain}`;
}

/**
 * Fit verdict – does the funnel slot into the cohort's money mechanics.
 *
 * Honest hedge: we don't pretend the matrix algorithmically grades
 * fit. We re-state the funnel's ladder position alongside the niche's
 * money mechanics and let the reader draw the conclusion.
 */
function buildFitVerdict(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): string {
  return `Where ${funnel.displayName.toLowerCase()} sits on the value ladder: ${funnel.ladderPosition} How ${niche.displayName} typically price and collect revenue: ${niche.moneyMechanics} Read those two side by side – if the funnel's typical price band overlaps with the cohort's revenue mechanics, the funnel fits. If it doesn't, a different funnel from the same playbook will probably slot in better.`;
}

/**
 * What the standard funnel playbook needs to shift for this cohort.
 * Bridges the funnel's when-not-to-use against the niche's vocabulary
 * and what-compounds. Reads as a single paragraph; deterministic.
 */
function buildCohortAdaptation(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): string {
  return `The mechanic is the same – the wording shifts. ${capitaliseFirst(niche.displayName)} talk about ${niche.vocabulary.slice(0, 4).join(", ")}, so the Hook and Stack copy on this funnel should land in that vocabulary, not in generic founder-speak. What compounds for this cohort: ${niche.whatCompounds} That compounding pattern is what makes this funnel worth running for ${niche.displayName} specifically – the same funnel run against a different cohort would compound differently.`;
}

/**
 * The cohort's specific failure mode when running this funnel. Pulls
 * niche.commonMistake and frames it explicitly through the funnel lens.
 */
function buildCohortFailureMode(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): string {
  return `Where ${niche.displayName} most often break this funnel: ${niche.commonMistake} The funnel's general failure modes still apply on top of this one – see the implementation mistakes section below for the full list.`;
}

/**
 * Merge two FAQ sets into one, deduped by case-insensitive question
 * text. Niche FAQs win ties (they're the cohort-tuned wording that
 * matches search intent). Cap at four total – more than four reads as
 * an SEO content farm, fewer reads as undercooked.
 */
function buildFaqs(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): ReadonlyArray<{ q: string; a: string }> {
  const normalise = (s: string) =>
    s.toLowerCase().trim().replace(/\s+/g, " ");
  const seen = new Set<string>();
  const out: Array<{ q: string; a: string }> = [];
  // Niche FAQs first (2)
  for (const f of niche.faqs.slice(0, 2)) {
    const key = normalise(f.q);
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ q: f.q, a: f.a });
    }
  }
  // Funnel FAQs after (2)
  for (const f of funnel.faqs.slice(0, 2)) {
    const key = normalise(f.q);
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ q: f.q, a: f.a });
    }
  }
  return out;
}

/**
 * Union of related glossary slugs across funnel + niche.
 */
function buildRelatedGlossary(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): ReadonlyArray<string> {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of [...funnel.relatedGlossary, ...niche.relatedGlossary]) {
    if (!seen.has(slug)) {
      seen.add(slug);
      out.push(slug);
    }
  }
  return out;
}

/**
 * Lexicographic max of two ISO dates (both are YYYY-MM-DD).
 */
function maxIsoDate(a: string, b: string): string {
  return a >= b ? a : b;
}

/**
 * Synthesise a single combo entry from two source entries.
 */
export function buildMatrixEntry(
  funnel: FunnelPlaybookEntry,
  niche: NicheEntry,
): FunnelMatrixEntry {
  return {
    slug: buildSlug(funnel, niche),
    funnel,
    niche,
    displayName: buildDisplayName(funnel, niche),
    metaTitle: buildMetaTitle(funnel, niche),
    metaDescription: buildMetaDescription(funnel, niche),
    tldr: buildTldr(funnel, niche),
    fitVerdict: buildFitVerdict(funnel, niche),
    cohortAdaptation: buildCohortAdaptation(funnel, niche),
    cohortFailureMode: buildCohortFailureMode(funnel, niche),
    faqs: buildFaqs(funnel, niche),
    relatedGlossary: buildRelatedGlossary(funnel, niche),
    lastVerified: maxIsoDate(funnel.lastVerified, niche.lastVerified),
  };
}

/**
 * All combo slugs. Stable order: funnels in their source order, niches
 * in their source order. Used by generateStaticParams and sitemap.ts.
 *
 * Length = FUNNEL_PLAYBOOK_ENTRIES.length × NICHE_ENTRIES.length
 *        = 8 × 12 = 96 as of 2026-05-21.
 */
export const FUNNEL_MATRIX_SLUGS: ReadonlyArray<string> = Object.freeze(
  FUNNEL_PLAYBOOK_ENTRIES.flatMap((f) =>
    NICHE_ENTRIES.map((n) => buildSlug(f, n)),
  ),
);

/**
 * Parse a combo URL slug into its two source entries, or undefined if
 * the slug doesn't match the matrix pattern. Validates both sides
 * against the source dictionaries so that malformed slugs (or future
 * slugs that happen to contain "-for-") don't accidentally match.
 */
export function parseMatrixSlug(combo: string):
  | { funnel: FunnelPlaybookEntry; niche: NicheEntry }
  | undefined {
  const i = combo.indexOf(MATRIX_SEPARATOR);
  if (i < 0) return undefined;
  const funnelSlug = combo.substring(0, i);
  const nicheSlug = combo.substring(i + MATRIX_SEPARATOR.length);
  const funnel = getFunnelPlaybookBySlug(funnelSlug);
  const niche = getNicheBySlug(nicheSlug);
  if (!funnel || !niche) return undefined;
  return { funnel, niche };
}

/**
 * Resolve a combo slug to its FunnelMatrixEntry, or undefined if the
 * slug isn't a valid combo. Cheap to call – the matrix entries are
 * synthesised on each call (no large allocations, deterministic).
 */
export function getMatrixEntry(
  combo: string,
): FunnelMatrixEntry | undefined {
  const parsed = parseMatrixSlug(combo);
  if (!parsed) return undefined;
  return buildMatrixEntry(parsed.funnel, parsed.niche);
}

/**
 * All combo entries for hub-page listings. Pre-built once at module
 * load (the matrix is small – 96 entries, ~50KB in memory).
 */
export const FUNNEL_MATRIX_ENTRIES: ReadonlyArray<FunnelMatrixEntry> =
  Object.freeze(
    FUNNEL_PLAYBOOK_ENTRIES.flatMap((f) =>
      NICHE_ENTRIES.map((n) => buildMatrixEntry(f, n)),
    ),
  );

/**
 * Helper for the niche hub – "funnels that fit this cohort". Returns
 * one combo entry per funnel for the given niche slug, in funnel order.
 */
export function matrixEntriesForNiche(
  nicheSlug: string,
): ReadonlyArray<FunnelMatrixEntry> {
  return FUNNEL_MATRIX_ENTRIES.filter((e) => e.niche.slug === nicheSlug);
}

/**
 * Helper for the funnel hub – "cohorts this funnel ships best for".
 * Returns one combo entry per niche for the given funnel slug, in
 * niche order.
 */
export function matrixEntriesForFunnel(
  funnelSlug: string,
): ReadonlyArray<FunnelMatrixEntry> {
  return FUNNEL_MATRIX_ENTRIES.filter((e) => e.funnel.slug === funnelSlug);
}
