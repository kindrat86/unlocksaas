/**
 * Founder-level credentials + memberships.
 *
 * Why this module exists (E-E-A-T uplift, 2026-05-21):
 *   The discovery-surface audit flagged the absence of structured
 *   credential / certification / membership data on the founder
 *   Person node. The fix is env-gated registries that stay empty
 *   by default – nothing fabricated, nothing aspirational – and
 *   light up the moment the operator drops a real credential into
 *   Vercel.
 *
 *   This mirrors the existing FOUNDER_AWARDS / FOUNDER_ALUMNI_OF
 *   pattern in src/lib/seo/founder.ts. Same env naming convention
 *   (NEXT_PUBLIC_FOUNDER_*), same CSV parser, same Object.freeze
 *   guarantee, same Brunson Hard-Rule discipline: empty unless real.
 *
 * Schema.org alignment
 * --------------------
 *   - hasCredential → EducationalOccupationalCredential. Schema.org
 *     accepts a short Text label like "Y Combinator W22 alumnus" or
 *     "Certified Stripe Developer". One env var per credential to
 *     keep the operator workflow trivial.
 *   - memberOf → Organization. Used for professional society / club
 *     memberships (Indie Hackers Pro, MicroConf, MegaMaker, etc.).
 *     Each entry is a {name, url} pair so the schema can declare
 *     both the human-readable name and a resolvable URL for the
 *     organization.
 *
 * Activation flow when the operator earns a credential or joins a
 * group:
 *   1. Confirm the credential / membership is real, currently held,
 *      and verifiable on a public page that names the founder.
 *   2. For a single credential string:
 *        vercel env add NEXT_PUBLIC_FOUNDER_HAS_CREDENTIAL production
 *        # paste: "Y Combinator W26 alumnus, MicroConf Connect member"
 *   3. For a single membership URL pair:
 *        vercel env add NEXT_PUBLIC_FOUNDER_MEMBER_OF production
 *        # paste: "Indie Hackers|https://www.indiehackers.com/, ..."
 *   4. Redeploy. Person.hasCredential / Person.memberOf light up on
 *      the next prerender. No code edit, no audit cycle.
 */

/**
 * Reads a comma-separated env var. Returns a frozen array of trimmed
 * non-empty entries. An unset / empty env yields a frozen empty array.
 *
 * Duplicated from src/lib/seo/founder.ts rather than imported so this
 * module stays self-contained. The duplication is six lines and the
 * indirection cost of an import for two callsites is higher than
 * inlining.
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
 * EducationalOccupationalCredential strings the founder holds. Each
 * entry becomes a Person.hasCredential row with @type
 * EducationalOccupationalCredential and the string as the name.
 *
 * Brunson Hard-Rule: empty until the operator provides real, held,
 * verifiable credentials. A fabricated "Certified X Developer" entry
 * here would silently propagate into the Knowledge Graph and the
 * recovery cost is high (Google's KG caches authority signals for
 * months; a single fake credential could undermine the entire
 * Person node's trust score).
 *
 * Format: comma-separated short credential names. Example:
 *   "Y Combinator W26 alumnus, Certified Stripe Developer 2025"
 */
export const FOUNDER_HAS_CREDENTIAL: readonly string[] = readCsvEnv(
  "NEXT_PUBLIC_FOUNDER_HAS_CREDENTIAL",
);

/**
 * Organizational memberships the founder holds. Each row pairs a
 * human-readable name with a resolvable URL.
 *
 * Env format: pipe-delimited name|url pairs, comma-separated rows.
 * Example:
 *   "Indie Hackers|https://www.indiehackers.com/,MicroConf|https://microconf.com/"
 *
 * Brunson Hard-Rule: empty until the operator holds real, current,
 * verifiable memberships. Past memberships are dropped from this
 * surface – schema.org/Person.memberOf is a present-tense claim.
 *
 * Validation: a row that doesn't contain `|` or whose URL isn't an
 * absolute https URL is silently dropped (never throws – an empty
 * array is the honest fallback for a malformed env value, same
 * pattern as FOUNDER_SAME_AS in founder.ts).
 */
export interface FounderMembership {
  /** Human-readable organization name. Used as Organization.name. */
  readonly name: string;
  /** Resolvable absolute https URL of the organization. */
  readonly url: string;
}

function parseMembershipRow(row: string): FounderMembership | undefined {
  const pipeIdx = row.indexOf("|");
  if (pipeIdx <= 0 || pipeIdx === row.length - 1) return undefined;
  const name = row.slice(0, pipeIdx).trim();
  const url = row.slice(pipeIdx + 1).trim();
  if (!name) return undefined;
  if (!url.startsWith("https://")) return undefined;
  try {
    new URL(url);
  } catch {
    return undefined;
  }
  return Object.freeze({ name, url });
}

function buildFounderMemberOf(): readonly FounderMembership[] {
  const raw = process.env.NEXT_PUBLIC_FOUNDER_MEMBER_OF;
  if (!raw) return Object.freeze([]);
  const rows = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map(parseMembershipRow)
    .filter((r): r is FounderMembership => r !== undefined);
  // De-dupe by URL defensively.
  const seen = new Set<string>();
  const unique: FounderMembership[] = [];
  for (const row of rows) {
    if (!seen.has(row.url)) {
      seen.add(row.url);
      unique.push(row);
    }
  }
  return Object.freeze(unique);
}

export const FOUNDER_MEMBER_OF: readonly FounderMembership[] =
  buildFounderMemberOf();
