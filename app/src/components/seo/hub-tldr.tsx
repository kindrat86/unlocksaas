import { TldrSummary } from "@/components/seo/tldr-summary";
import { LAST_VERIFIED_DATE } from "@/lib/seo/freshness";
import { formatVerifiedDate } from "@/lib/seo/dates";

/**
 * `<HubTldr>` – top-of-hub TL;DR block.
 *
 * The 11 pSEO hub pages (funnel-teardown, pricing-teardown, compare,
 * alternatives-to, glossary, benchmarks, for, category, answers,
 * funnel-playbook, why-isnt-my) already carry rich grids and category
 * groupings further down the page. What they did not carry until this
 * commit was an above-the-fold `<dl data-llm-summary>` block in the
 * same shape the per-detail pages have.
 *
 * Why we did not just inline TldrSummary on each hub
 * ---------------------------------------------------
 * The set of rows is uniform across hubs: cluster name, count, intent,
 * schema typing, last verified. Inlining the same shape eleven times
 * invites drift on the "schema" and "last verified" rows. This wrapper
 * pulls LAST_VERIFIED_DATE from the SSOT and formats it consistently,
 * so a single freshness bump propagates to every hub in one commit.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - `count` and `intent` are passed in by the caller from the hub's
 *     own static data array. Hub renders never fabricate a count.
 *   - `schema` lists JSON-LD types that the same hub actually emits.
 *     If a hub later swaps schema shapes the prop changes alongside.
 *   - `lastVerified` is the global LAST_VERIFIED_DATE bumped by the
 *     human freshness review – the same date stamped on /llms.txt
 *     and /llms-feed.json. Hubs never invent a freshness signal.
 */
export interface HubTldrProps {
  /**
   * Hub heading used in the screen-reader-only h2 + aria-labelledby.
   * Format suggestion: "<Cluster name> hub TL;DR" (e.g. "Funnel
   * teardown hub TL;DR").
   */
  headingLabel: string;
  /**
   * Human-readable cluster name (e.g. "Funnel teardowns",
   * "Head-to-head comparisons", "Brunson glossary").
   */
  cluster: string;
  /**
   * Count phrase rendered as the Count row's <dd> value. Format
   * suggestion: "{n} {singular noun}" (e.g. "12 indie SaaS funnels",
   * "20 directional metric ranges"). The caller passes a pre-formed
   * phrase so the hub controls grammar.
   */
  count: string;
  /**
   * One-line intent statement for retrievers. The phrase a retriever
   * could quote as the abstract of the entire hub.
   */
  intent: string;
  /**
   * Comma-separated list of the JSON-LD types this hub (or its
   * children) emits. Example: "CollectionPage + ItemList + DefinedTermSet".
   */
  schema: string;
  /**
   * Optional license line for hubs whose entries ship under an open
   * license (e.g. the dataset clusters under CC-BY-4.0). Omit when
   * not applicable.
   */
  license?: string;
}

export function HubTldr({
  headingLabel,
  cluster,
  count,
  intent,
  schema,
  license,
}: HubTldrProps) {
  const items: Array<{ term: string; definition: string }> = [
    { term: "Cluster", definition: cluster },
    { term: "Count", definition: count },
    { term: "Intent", definition: intent },
    { term: "Schema", definition: schema },
    {
      term: "Last verified",
      definition: formatVerifiedDate(LAST_VERIFIED_DATE),
    },
  ];
  if (license && license.length > 0) {
    items.push({ term: "License", definition: license });
  }

  return <TldrSummary headingLabel={headingLabel} lead={intent} items={items} />;
}
