import { StarterSalesClient } from "./starter-client";

/**
 * /starter — Server-component entry for the $1 Starter sales page.
 *
 * Why this file exists (and is tiny)
 * ----------------------------------
 * The page is interactive (Stripe POST, order-bump state, attribution from
 * URL params, diagnostic handoff banner), so the body has to live in a
 * "use client" component (starter-client.tsx). But the previous implementation
 * inlined that client body and wrapped it in `<Suspense fallback={null}>`
 * because `useSearchParams()` requires a Suspense boundary in client trees
 * that may be prerendered.
 *
 * That pattern made SSR render `null` (the Suspense fallback) for every
 * crawler. Vercel's CDN then cached the empty render and served it to
 * every subsequent crawler request — 18 of 19 user-agents tested by the
 * 2026-05-22 crawler citation audit saw zero substantive content; only
 * Applebot (whose responses carried `cache-control: private, no-store`)
 * received a fresh dynamic render and saw the real page. See
 * `strategy/audits/2026-05-22-crawler-citation-audit.md` for the
 * full reproduction and the per-UA divergence table.
 *
 * The fix is structural, not a Suspense fallback band-aid: read
 * searchParams on the server (where they are available at request time
 * via the props promise), pass them to the client component as a normal
 * prop, and drop the Suspense wrapper entirely. The client component
 * never calls `useSearchParams()` so there is nothing to suspend, the
 * server fully renders the static + dynamic HTML in one pass, and the
 * CDN now caches a complete page for every crawler.
 *
 * Metadata for /starter still lives in `layout.tsx` (the page itself
 * cannot export metadata because the body is a client component, and
 * we want to keep the body server-rendered).
 */
export default async function StarterSalesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Resolve the searchParams promise on the server, then hand the
  // concrete object down to the client component. No useSearchParams()
  // anywhere in the client tree → no Suspense boundary needed → SSR
  // returns the complete page HTML on every request.
  const searchParams = await props.searchParams;
  return <StarterSalesClient searchParams={searchParams} />;
}
