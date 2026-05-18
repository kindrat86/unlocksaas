/**
 * Site-wide search index for `/search`.
 *
 * Why this module exists
 * ----------------------
 * The audit pass that lifted Search/Answer optimization to 89/100 flagged
 * one missing voice/eligibility signal: no `SearchAction` declared on the
 * WebSite JSON-LD because no real `/search?q=…` surface existed to point
 * the action at. Brunson Hard-Rule forbids declaring a `potentialAction`
 * that resolves to a 404. Two options: stop declaring SearchAction (lose
 * the Sitelinks Search Box eligibility), or ship a real search surface
 * that uses the data the site already has. This module is the second one.
 *
 * Single source of truth
 * ----------------------
 * Every entry in the index is computed from the same `.ts` catalogs that
 * generate the pSEO pages and the markdown mirrors. We do NOT maintain a
 * parallel search-only data structure — the moment a new entry lands in
 * `alternatives.ts`, `funnel-teardowns.ts`, `pricing-teardowns.ts`,
 * `comparisons.ts`, or `categories.ts`, it auto-extends the search index.
 *
 * Server-only
 * -----------
 * The index is built at module load and never shipped to the client. The
 * `/search` page is a server component: it filters in Node.js and returns
 * only the matched results to the browser. This keeps the 600 KB of pSEO
 * catalog text out of the client bundle — critical for Core Web Vitals.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every URL in the index resolves to a real shipped page.
 *   - The "Static surfaces" rows are hand-curated against the sitemap so
 *     `/search` cannot link to a non-existent page.
 *   - No synonyms or query expansion — we match on the literal text the
 *     pages render. If a user types a term the page does not use, the
 *     page does not surface. That is honest.
 */

import { ALTERNATIVES } from "@/lib/alternatives";
import { TEARDOWNS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWNS } from "@/lib/pricing-teardowns";
import { COMPARISONS } from "@/lib/comparisons";
import { CATEGORIES } from "@/lib/categories";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  surface: SearchSurface;
  terms: string;
  category?: string;
}

export type SearchSurface =
  | "compare"
  | "funnel-teardown"
  | "pricing-teardown"
  | "alternatives-to"
  | "category"
  | "static";

export const SURFACE_LABELS: Readonly<Record<SearchSurface, string>> =
  Object.freeze({
    compare: "Head-to-head comparisons",
    "funnel-teardown": "Funnel teardowns",
    "pricing-teardown": "Pricing teardowns",
    "alternatives-to": "Alternatives",
    category: "Category roundups",
    static: "Main pages",
  });

const STATIC_SURFACES: ReadonlyArray<
  Omit<SearchResult, "terms" | "surface">
> = Object.freeze([
  {
    id: "/diagnostic",
    title: "Free Launch Diagnostic",
    description:
      "Paste your live product URL. In 90 seconds, get one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief.",
    url: "/diagnostic",
    category: "Diagnostic",
  },
  {
    id: "/playbook-sales",
    title: "The Playbook ($49/month)",
    description:
      "The full seven-step playbook. 60-day money-back guarantee tied to your first verified Stripe payment.",
    url: "/playbook-sales",
    category: "Product",
  },
  {
    id: "/starter",
    title: "$1 Starter",
    description:
      "Entry rung. A real Stripe charge proves intent and unlocks Playbook Steps 1 and 2.",
    url: "/starter",
    category: "Product",
  },
  {
    id: "/stories",
    title: "Five Stories for the Flat Stripe Line",
    description:
      "Long-form free essays on the work non-engineer founders skip. No email required.",
    url: "/stories",
    category: "Editorial",
  },
  {
    id: "/faq",
    title: "FAQ",
    description:
      "Verbatim objections and replies from real Indie Hackers and Hacker News threads.",
    url: "/faq",
    category: "Trust",
  },
  {
    id: "/about",
    title: "About Unlock SaaS",
    description:
      "Founder bio, topical expertise, editorial position, disclosures.",
    url: "/about",
    category: "Trust",
  },
  {
    id: "/press",
    title: "Press and Media Kit",
    description:
      "Brand facts, founder bio, descriptions in three lengths, and contact for media coverage.",
    url: "/press",
    category: "Trust",
  },
  {
    id: "/editorial-policy",
    title: "Editorial Policy",
    description:
      "How Unlock SaaS sources, dates, signs, and corrects every public claim.",
    url: "/editorial-policy",
    category: "Trust",
  },
  {
    id: "/builders",
    title: "Verified Builders",
    description:
      "Founders whose first paying customer was verified inside Stripe, not self-reported.",
    url: "/builders",
    category: "Proof",
  },
  {
    id: "/founding",
    title: "Founding Cohort",
    description:
      "The first founders to run the Playbook at launch pricing with the Founder-Cohort guarantee.",
    url: "/founding",
    category: "Product",
  },
  {
    id: "/repeatable",
    title: "Repeatable Revenue (Rung 2 spec)",
    description:
      "Published specification for the next product. Build is gated on three Core customer cycles completing.",
    url: "/repeatable",
    category: "Roadmap",
  },
  {
    id: "/bridge",
    title: "Cold-Traffic Bridge",
    description:
      "Lands between cold problem-aware traffic and the diagnostic.",
    url: "/bridge",
    category: "Entry",
  },
  {
    id: "/contact",
    title: "Contact",
    description: "Direct line to the founder.",
    url: "/contact",
    category: "Trust",
  },
] as const);

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildTerms(parts: ReadonlyArray<string | undefined>): string {
  return normalize(parts.filter(Boolean).join(" · "));
}

const ALTERNATIVE_RESULTS: ReadonlyArray<SearchResult> = Object.freeze(
  ALTERNATIVES.map((a): SearchResult => ({
    id: a.slug,
    title: `Unlock SaaS vs ${a.displayName}`,
    description: a.oneLine,
    url: `/alternatives-to/${a.slug}`,
    surface: "alternatives-to",
    category: a.category,
    terms: buildTerms([
      a.slug,
      a.displayName,
      a.category,
      a.creator,
      a.oneLine,
      a.whoForIt,
      a.honestVerdict,
    ]),
  })),
);

const TEARDOWN_RESULTS: ReadonlyArray<SearchResult> = Object.freeze(
  TEARDOWNS.map((t): SearchResult => ({
    id: t.slug,
    title: `${t.displayName} funnel teardown`,
    description: t.oneLine,
    url: `/funnel-teardown/${t.slug}`,
    surface: "funnel-teardown",
    category: t.category,
    terms: buildTerms([
      t.slug,
      t.displayName,
      t.category,
      t.creator,
      t.oneLine,
      t.tldr,
    ]),
  })),
);

const PRICING_RESULTS: ReadonlyArray<SearchResult> = Object.freeze(
  PRICING_TEARDOWNS.map((p): SearchResult => ({
    id: p.slug,
    title: `${p.displayName} pricing teardown`,
    description: p.oneLine,
    url: `/pricing-teardown/${p.slug}`,
    surface: "pricing-teardown",
    category: p.category,
    terms: buildTerms([
      p.slug,
      p.displayName,
      p.category,
      p.creator,
      p.oneLine,
      p.tldr,
    ]),
  })),
);

const COMPARISON_RESULTS: ReadonlyArray<SearchResult> = Object.freeze(
  COMPARISONS.map((c): SearchResult => ({
    id: c.slug,
    title: `${c.a.name} vs ${c.b.name}`,
    description: c.oneLine,
    url: `/compare/${c.slug}`,
    surface: "compare",
    category: c.category,
    terms: buildTerms([
      c.slug,
      c.a.name,
      c.b.name,
      c.category,
      c.oneLine,
      c.tldr,
    ]),
  })),
);

const CATEGORY_RESULTS: ReadonlyArray<SearchResult> = Object.freeze(
  CATEGORIES.map((c): SearchResult => ({
    id: c.slug,
    title: c.displayName,
    description: c.oneLine,
    url: `/category/${c.slug}`,
    surface: "category",
    category: c.displayName,
    terms: buildTerms([
      c.slug,
      c.displayName,
      c.oneLine,
      c.intent,
      ...c.tags,
    ]),
  })),
);

const STATIC_RESULTS: ReadonlyArray<SearchResult> = Object.freeze(
  STATIC_SURFACES.map((s): SearchResult => ({
    ...s,
    surface: "static",
    terms: buildTerms([s.id, s.title, s.description, s.category]),
  })),
);

export const SEARCH_INDEX: ReadonlyArray<SearchResult> = Object.freeze([
  ...COMPARISON_RESULTS,
  ...TEARDOWN_RESULTS,
  ...PRICING_RESULTS,
  ...ALTERNATIVE_RESULTS,
  ...CATEGORY_RESULTS,
  ...STATIC_RESULTS,
]);

export const SEARCH_INDEX_SIZE = SEARCH_INDEX.length;

export function searchIndex(
  query: string,
  opts: { limit?: number } = {},
): ReadonlyArray<SearchResult> {
  const limit = opts.limit ?? 50;
  const normalized = normalize(query);
  if (!normalized) return [];

  const tokens = normalized.split(" ").slice(0, 8).filter(Boolean);
  if (tokens.length === 0) return [];

  const scored: Array<{ row: SearchResult; score: number; orderIdx: number }> =
    [];

  SEARCH_INDEX.forEach((row, orderIdx) => {
    let score = 0;
    for (const tok of tokens) {
      if (!row.terms.includes(tok)) {
        score = 0;
        break;
      }
      let from = 0;
      let count = 0;
      while (true) {
        const at = row.terms.indexOf(tok, from);
        if (at === -1) break;
        count += 1;
        from = at + tok.length;
      }
      score += count;
    }
    if (score > 0) {
      scored.push({ row, score, orderIdx });
    }
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.orderIdx - b.orderIdx;
  });

  return scored.slice(0, limit).map((s) => s.row);
}

export function groupBySurface(
  results: ReadonlyArray<SearchResult>,
): ReadonlyArray<{ surface: SearchSurface; label: string; rows: SearchResult[] }> {
  const order: SearchSurface[] = [
    "compare",
    "funnel-teardown",
    "pricing-teardown",
    "alternatives-to",
    "category",
    "static",
  ];
  const buckets = new Map<SearchSurface, SearchResult[]>();
  for (const surface of order) buckets.set(surface, []);
  for (const row of results) {
    const arr = buckets.get(row.surface);
    if (arr) arr.push(row);
  }
  return order
    .map((surface) => ({
      surface,
      label: SURFACE_LABELS[surface],
      rows: buckets.get(surface) ?? [],
    }))
    .filter((g) => g.rows.length > 0);
}
