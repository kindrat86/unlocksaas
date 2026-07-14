import { Suspense } from "react";
import { connection } from "next/server";
import { isCorePriceConfigured } from "@/lib/offers";
import { StarterSalesClient } from "./starter-client";

/**
 * /starter — Server-component entry for the $1 Starter sales page.
 *
 * Why this file exists (and is tiny)
 * ----------------------------------
 * The page is interactive (Stripe POST, order-bump state, attribution from
 * URL params, diagnostic handoff banner), so the body has to live in a
 * "use client" component (starter-client.tsx). Two prior implementations:
 *
 *   1. Inlined the client body and wrapped it in `<Suspense fallback={null}>`
 *      because `useSearchParams()` requires a Suspense boundary in client
 *      trees that may be prerendered. SSR rendered `null` for every crawler;
 *      Vercel's CDN cached the empty render; 18 of 19 user-agents tested
 *      by the 2026-05-22 crawler citation audit saw zero substantive
 *      content. See `strategy/audits/2026-05-22-crawler-citation-audit.md`.
 *
 *   2. Read `searchParams` on the server (await props.searchParams) and
 *      pass them down to the client as a concrete object. This worked
 *      pre-Cache Components but trips the strict cacheComponents:true
 *      rule once re-enabled — `await props.searchParams` is uncached
 *      dynamic data that requires a Suspense ancestor during prerender,
 *      so /starter started failing the static export with:
 *
 *        Error: Route "/starter": Uncached data was accessed outside of
 *        <Suspense>. [posthog-provider.tsx:91 / body / html]
 *
 *      The error frame points at the closest matchable server boundary
 *      (PostHogProvider in the root layout) but the actual cause is the
 *      `await props.searchParams` here.
 *
 * Current shape (option 3): the default export is a synchronous Suspense
 * wrapper; the body is an async function that calls `await connection()`
 * before awaiting searchParams. This is the canonical Next 16 +
 * cacheComponents pattern already used by /ask, /diagnostic, and
 * /diagnostic/result. The crawler issue from option 1 is acknowledged
 * but not re-litigated here: the immediate goal is unblocking the
 * production deploy; the SEO-fallback question is a separate follow-up
 * tracked against the audit doc above.
 *
 * Metadata for /starter still lives in `layout.tsx` (the page itself
 * cannot export metadata because the body is a client component, and
 * we want to keep the body server-rendered).
 */
export default function StarterSalesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={null}>
      <StarterSalesPageBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function StarterSalesPageBody(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // `connection()` marks this boundary dynamic so the prerender shell
  // can build while the body resolves. Without it, the strict
  // cacheComponents:true rule treats `await props.searchParams` as an
  // uncached read outside a Suspense ancestor and fails the static
  // export.
  await connection();
  const searchParams = await props.searchParams;
  // Server-side env check: until STRIPE_STARTER_PRICE_ID is pasted, the buy
  // CTA degrades to the honest founding-waitlist capture (never a dead
  // button, never a 500). Resolved here because the client bundle must not
  // read process.env.
  const checkoutEnabled = isCorePriceConfigured("starter");
  return (
    <StarterSalesClient
      searchParams={searchParams}
      checkoutEnabled={checkoutEnabled}
    />
  );
}
