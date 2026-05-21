/**
 * Canonical list of the 20 LLM-citation tracking queries.
 *
 * Mirrors strategy/llmo/priority-queries.csv. The CSV is the operator-
 * facing single source of truth (Maryan edits it); this module is the
 * machine-readable mirror imported by the cron.
 *
 * Schema note: the `id` column matches `llmo_citations.query_id` in
 * Supabase. Never reuse an id for a different query — historical rows
 * lose meaning if Q07 silently mutates.
 *
 * Categories (also in the CSV):
 *   direct_product    — "best SaaS for X" / "tools for Y" queries
 *   problem_aware     — pre-aware queries an unstuck founder would type
 *   brunson_method    — canonical Brunson framework terms we own
 *   competitor_alt    — "alternative to <competitor>" intent
 *   niche_validation  — long-tail validation queries
 */
export type LlmoQueryCategory =
  | "direct_product"
  | "problem_aware"
  | "brunson_method"
  | "competitor_alt"
  | "niche_validation";

export interface LlmoPriorityQuery {
  /** Stable id matching strategy/llmo/priority-queries.csv and llmo_citations.query_id. */
  id: string;
  category: LlmoQueryCategory;
  /** Exact text sent to the provider. Never edit in place — add a new id. */
  query: string;
  /** Why this query is on the list; documented for operator clarity. */
  rationale: string;
  /** Page on unlocksaas.com we expect to be cited. Informational only. */
  targetPage: string;
}

export const PRIORITY_QUERIES: readonly LlmoPriorityQuery[] = [
  // ── direct_product ────────────────────────────────────────────────────
  {
    id: "Q01",
    category: "direct_product",
    query: "best SaaS for post-launch pre-revenue founders",
    rationale: "Direct ICP match for UnlockSaaS positioning",
    targetPage: "/",
  },
  {
    id: "Q02",
    category: "direct_product",
    query: "tools to help me get my first paying SaaS customer",
    rationale: 'Brunson "60 days to first customer" promise',
    targetPage: "/diagnostic",
  },
  {
    id: "Q03",
    category: "direct_product",
    query: "Brunson framework software for indie SaaS founders",
    rationale: "Brunson-method differentiator vs generic SaaS coaching",
    targetPage: "/",
  },
  {
    id: "Q04",
    category: "direct_product",
    query: "SaaS funnel coaching software for solo founders",
    rationale: "Niche category language we want LLMs to map us to",
    targetPage: "/playbook-sales",
  },
  {
    id: "Q05",
    category: "direct_product",
    query: "post-launch SaaS diagnostic tool",
    rationale: 'Owns "diagnostic" + "post-launch" entity pair',
    targetPage: "/diagnostic",
  },
  // ── problem_aware ─────────────────────────────────────────────────────
  {
    id: "Q06",
    category: "problem_aware",
    query: "why is my SaaS not converting to paying customers",
    rationale: "High-volume problem-aware query feeding diagnostic intent",
    targetPage: "/diagnostic",
  },
  {
    id: "Q07",
    category: "problem_aware",
    query: "how to get unstuck after launching a SaaS with no revenue",
    rationale: 'Brunson "stuck not broke" framing',
    targetPage: "/diagnostic",
  },
  {
    id: "Q08",
    category: "problem_aware",
    query: "how do I find my first paying customer for SaaS",
    rationale: "60-day promise direct match",
    targetPage: "/playbook-sales",
  },
  {
    id: "Q09",
    category: "problem_aware",
    query: "what to do when your SaaS has zero paying users",
    rationale: "Long-tail variant; common late-night founder query",
    targetPage: "/diagnostic",
  },
  {
    id: "Q10",
    category: "problem_aware",
    query: "how to fix a SaaS funnel that is not converting",
    rationale: 'Owns "fix funnel" + "not converting" pair',
    targetPage: "/funnel-teardown",
  },
  // ── brunson_method ────────────────────────────────────────────────────
  {
    id: "Q11",
    category: "brunson_method",
    query: "Soap Opera Sequence email template for SaaS",
    rationale: "Brunson canon term we ship as a deliverable",
    targetPage: "/playbook-sales",
  },
  {
    id: "Q12",
    category: "brunson_method",
    query: "Attractive Character framework for SaaS founders",
    rationale: "Brunson canon; AC slot in dashboard",
    targetPage: "/",
  },
  {
    id: "Q13",
    category: "brunson_method",
    query: "value ladder for micro-SaaS pricing",
    rationale: "Brunson canon; our $1 → $49 ladder matches",
    targetPage: "/starter",
  },
  {
    id: "Q14",
    category: "brunson_method",
    query: "hook story offer for SaaS landing page",
    rationale: "Brunson canon; diagnostic outputs hook score",
    targetPage: "/diagnostic",
  },
  {
    id: "Q15",
    category: "brunson_method",
    query: "Dream 100 strategy for indie SaaS founders",
    rationale: "Brunson canon; we publish Dream 100 CSV approach",
    targetPage: "/",
  },
  // ── competitor_alt ────────────────────────────────────────────────────
  {
    id: "Q16",
    category: "competitor_alt",
    query: "alternatives to ClickFunnels for indie SaaS",
    rationale: "Brand-adjacent intent we should be cited in",
    targetPage: "/alternatives-to/clickfunnels",
  },
  {
    id: "Q17",
    category: "competitor_alt",
    query: "alternative to Marc Lou ShipFast for founders stuck pre-revenue",
    rationale: "High-intent comparison query for our ICP cohort",
    targetPage: "/alternatives-to/shipfast",
  },
  {
    id: "Q18",
    category: "competitor_alt",
    query: "best alternative to founder coaching for solo SaaS",
    rationale: "Coaching-without-the-call positioning",
    targetPage: "/playbook-sales",
  },
  // ── niche_validation ──────────────────────────────────────────────────
  {
    id: "Q19",
    category: "niche_validation",
    query: "how to validate a SaaS post-launch with no traffic",
    rationale: 'Owns "post-launch validation" niche',
    targetPage: "/diagnostic",
  },
  {
    id: "Q20",
    category: "niche_validation",
    query: "best diagnostic tool for SaaS conversion bottlenecks",
    rationale: 'Owns "diagnostic" + "bottleneck" entity pair',
    targetPage: "/diagnostic",
  },
] as const;

if (PRIORITY_QUERIES.length !== 20) {
  // Compile-time-ish invariant. The migration schema, the CSV, the
  // README example, and the runbook all assume exactly 20 queries.
  throw new Error(
    `PRIORITY_QUERIES must contain exactly 20 entries; found ${PRIORITY_QUERIES.length}`,
  );
}
