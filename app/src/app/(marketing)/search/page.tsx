/**
 * /search — site-wide search across the 158 indexable surfaces.
 *
 * Why this page exists
 * --------------------
 * Two reasons. First, the SEO/AEO audit flagged that no `SearchAction` was
 * declared on the WebSite JSON-LD because no real `/search?q=…` surface
 * existed; Brunson Hard-Rule forbids declaring a potentialAction that
 * resolves to 404. Second, with 137 pSEO slugs + 21 static surfaces, the
 * site genuinely needed an in-site way to find the right teardown without
 * scrolling 5 different hubs.
 *
 * Server component, no JS required
 * --------------------------------
 * The whole flow is server-rendered. The form posts back to /search via a
 * vanilla `<form method="GET">` — the page works with JavaScript disabled,
 * which is also exactly how every AI retrieval agent + Lynx + reader-mode
 * crawler interacts with the page. That keeps the SearchAction declaration
 * honest: an AI agent submitting `/search?q=…` gets the same HTML response
 * a JS-less human gets.
 *
 * Note on Next.js version: this project is on Next 14.2.35, so
 * `searchParams` arrives as a sync object (Next 15+ migrated to a Promise).
 * The migration plan at strategy/next-16-migration-plan.md tracks the
 * upgrade; until then this signature is correct.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every linked URL resolves to a shipped page (search index built from
 *     the same .ts catalogs that generate the pages).
 *   - No invented "Did you mean" suggestions — empty-result state shows
 *     the canonical entry points (diagnostic, playbook, hubs).
 *   - Total-pages count and result-counts surface the true index size.
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  BreadcrumbListJsonLd,
  OrganizationJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import {
  groupBySurface,
  searchIndex,
  SEARCH_INDEX_SIZE,
  SURFACE_LABELS,
  type SearchSurface,
} from "@/lib/search";

export const metadata: Metadata = {
  title: "Search — Unlock SaaS",
  description: `Search ${SEARCH_INDEX_SIZE} pages across funnel teardowns, pricing teardowns, head-to-head comparisons, alternatives, category roundups, and the main marketing surfaces.`,
  // markdownAlternate emits canonical + self-referencing hreflang + the
  // text/markdown alternate link in one fragment; no need to merge with
  // pageAlternates separately.
  alternates: markdownAlternate("/search", "/search.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "Search — Unlock SaaS",
    description: `Search ${SEARCH_INDEX_SIZE} pages across the Unlock SaaS site.`,
    url: "/search",
    type: "website",
  },
};

interface SearchPageProps {
  // Next 14 sync searchParams. Migrate to Promise<…> when the Next 16
  // upgrade ships per strategy/next-16-migration-plan.md.
  searchParams?: Promise<{ q?: string | string[] }>;
}

/**
 * Pull `q` out of searchParams. Arrays collapse to the first entry —
 * `?q=foo&q=bar` resolves to "foo" so the page never has to reason about
 * multi-value query semantics.
 */
function readQuery(sp: Awaited<SearchPageProps["searchParams"]>): string {
  if (!sp) return "";
  const raw = sp.q;
  if (Array.isArray(raw)) return raw[0]?.trim() ?? "";
  return (raw ?? "").trim();
}

const BREADCRUMB_TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Search", url: "https://unlocksaas.com/search" },
] as const;

/**
 * Under Cache Components (Next 16+) any route that reads `searchParams` must
 * place that read inside a `<Suspense>` boundary so the static shell can
 * prerender while the dynamic results stream in. The outer default export is
 * a synchronous Suspense wrapper; the original async body moves into a child.
 */
export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={null}>
      <SearchPageBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SearchPageBody(props: SearchPageProps) {
  await connection();
  const searchParams = await props.searchParams;
  const query = readQuery(searchParams);
  const results = query ? searchIndex(query) : [];
  const grouped = groupBySurface(results);
  const hasResults = grouped.length > 0;

  return (
    <main
      className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-12"
      // VEO — the result column is the prose voice assistants should read
      // aloud when this page is the target of a SearchAction.
      data-speakable="search-results"
    >
      {/*
        Organization + BreadcrumbList. We do NOT render the full WebSite
        block here because OrganizationJsonLd renders it (kept paired so
        SearchAction lands on the funnel-hub render path AND on /search).
      */}
      <OrganizationJsonLd />
      <BreadcrumbListJsonLd trail={BREADCRUMB_TRAIL} />

      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Search
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold leading-tight mb-3"
          id="tldr"
        >
          {query
            ? `Results for “${query}”`
            : `Search ${SEARCH_INDEX_SIZE} pages on Unlock SaaS`}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Funnel teardowns, pricing teardowns, head-to-head comparisons,
          alternatives, category roundups, and the main marketing surfaces.
          Type the product name, the category, or the slug.
        </p>
      </header>

      {/*
        Native <form method="GET"> — no JS dependency. Search engines and
        AI agents can POST `?q=…` and read the rendered HTML response,
        which is what a SearchAction promises.
      */}
      <form
        action="/search"
        method="GET"
        role="search"
        aria-label="Site search"
        className="mb-10 flex flex-col sm:flex-row gap-3"
      >
        <label htmlFor="q" className="sr-only">
          Search Unlock SaaS
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="e.g. tally, stripe vs paypal, payments, lovable"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary text-primary-foreground px-6 py-3 font-medium hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {query && !hasResults ? (
        <EmptyState query={query} />
      ) : query && hasResults ? (
        <Results
          grouped={grouped}
          totalResults={results.length}
          query={query}
        />
      ) : (
        <PromptedExamples />
      )}

      <footer className="mt-16 pt-8 border-t border-border text-sm text-muted-foreground space-y-2">
        <p>
          The index covers {SEARCH_INDEX_SIZE} canonical pages. Results match
          the page&rsquo;s display name, category, and one-line summary.
        </p>
        <p>
          Looking for the markdown mirror?{" "}
          <Link
            href="/search.md"
            className="underline underline-offset-2 hover:text-foreground"
          >
            /search.md
          </Link>{" "}
          describes the index for AI agents.
        </p>
      </footer>
    </main>
  );
}

function Results({
  grouped,
  totalResults,
  query,
}: {
  grouped: ReturnType<typeof groupBySurface>;
  totalResults: number;
  query: string;
}) {
  return (
    <div className="space-y-10" aria-live="polite">
      <p className="text-sm text-muted-foreground">
        {totalResults === 1
          ? "1 result"
          : `${totalResults} results`}{" "}
        for{" "}
        <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
        {totalResults >= 50 ? " (capped at 50; refine your query)" : ""}.
      </p>
      {grouped.map((group) => (
        <section
          key={group.surface}
          aria-labelledby={`group-${group.surface}`}
        >
          <h2
            id={`group-${group.surface}`}
            className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4"
          >
            {group.label}{" "}
            <span className="text-xs font-normal normal-case">
              ({group.rows.length})
            </span>
          </h2>
          <ul className="space-y-4">
            {group.rows.map((r) => (
              <li
                key={`${group.surface}:${r.id}`}
                className="border border-border rounded-lg p-4 hover:bg-muted/30 transition"
              >
                <Link
                  href={r.url}
                  className="font-semibold text-base hover:underline underline-offset-2"
                  prefetch={false}
                >
                  {r.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {r.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-2">
                  {r.category ? (
                    <span className="px-2 py-0.5 rounded bg-muted">
                      {r.category}
                    </span>
                  ) : null}
                  <span className="px-2 py-0.5 rounded bg-muted">
                    {SurfaceShortLabel(group.surface)}
                  </span>
                  <span className="font-mono">{r.url}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="space-y-6">
      <p className="text-base">
        No pages on Unlock SaaS match{" "}
        <span className="font-medium">&ldquo;{query}&rdquo;</span>.
      </p>
      <p className="text-sm text-muted-foreground">
        The index covers the products, categories, and topics this site has
        actually shipped a page on. If your query is about a product or
        category not yet covered, the closest canonical entry points are:
      </p>
      <ul className="space-y-2 text-sm">
        <li>
          <Link href="/diagnostic" className="underline underline-offset-2">
            Free Launch Diagnostic
          </Link>{" "}
          — paste your live URL, get one of three diagnoses in 90 seconds.
        </li>
        <li>
          <Link href="/funnel-teardown" className="underline underline-offset-2">
            All funnel teardowns
          </Link>
        </li>
        <li>
          <Link href="/pricing-teardown" className="underline underline-offset-2">
            All pricing teardowns
          </Link>
        </li>
        <li>
          <Link href="/compare" className="underline underline-offset-2">
            All head-to-head comparisons
          </Link>
        </li>
        <li>
          <Link href="/category" className="underline underline-offset-2">
            Category roundups
          </Link>
        </li>
      </ul>
    </div>
  );
}

/**
 * Pre-search "examples" block. Renders only on the bare /search page (no
 * query) so a visitor sees what kinds of queries are useful before typing.
 * Hard-coded examples are honest — every one of them hits a real page.
 *
 * EXAMPLES is hoisted to module scope (rendering-hoist-jsx /
 * server-hoist-static-io): the array is identity-stable across renders, so
 * React's reconciler sees the same reference and per-render allocation is
 * zero.
 */
const PROMPTED_EXAMPLES: ReadonlyArray<{ q: string; hint: string }> =
  Object.freeze([
    { q: "tally", hint: "Tally funnel + pricing teardowns" },
    { q: "tally vs typeform", hint: "Head-to-head comparison" },
    { q: "stripe", hint: "Stripe teardowns + comparisons" },
    { q: "lovable", hint: "Lovable as an Unlock SaaS alternative" },
    { q: "payments", hint: "Payments category roundup" },
    { q: "newsletter", hint: "Newsletter platforms category" },
    { q: "shipfast", hint: "ShipFast alternative comparison" },
    { q: "guarantee", hint: "Refund + guarantee policy" },
  ]);

function PromptedExamples() {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Try one of these
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROMPTED_EXAMPLES.map((ex) => (
          <li key={ex.q}>
            <Link
              href={`/search?q=${encodeURIComponent(ex.q)}`}
              className="block border border-border rounded-md px-4 py-3 hover:bg-muted/30 transition"
              prefetch={false}
            >
              <span className="block font-medium">&ldquo;{ex.q}&rdquo;</span>
              <span className="block text-xs text-muted-foreground mt-1">
                {ex.hint}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SurfaceShortLabel(s: SearchSurface): string {
  switch (s) {
    case "compare":
      return "compare";
    case "funnel-teardown":
      return "funnel";
    case "pricing-teardown":
      return "pricing";
    case "alternatives-to":
      return "alternative";
    case "category":
      return "category";
    case "static":
      return SURFACE_LABELS.static.toLowerCase();
  }
}
