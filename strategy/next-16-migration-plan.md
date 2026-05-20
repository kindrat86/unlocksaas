# Next.js 16 + Cache Components migration plan

**Status:** PARTIALLY EXECUTED. Phases 0–2 + 5 shipped 2026-05-20. Phases 3–4 (the risk-bearing pSEO surfaces) remain DEFERRED.
**Trigger to execute remaining phases:** first verified Stripe customer (or eight days of zero deploy-related Sentry errors after the operator finishes Tier 1 of LAUNCH-READINESS.md, whichever comes first).
**Owner:** Maryan (or an autonomous Claude run, gated on the trigger).
**Source skills:** vercel-plugin:next-cache-components, vercel-plugin:next-upgrade, vercel-plugin:nextjs.
**Updated:** 2026-05-20 (reflects observed repo state, supersedes the original 14.2.35-premised spec).

---

## What's actually shipped (verify before assuming)

Anyone re-opening this plan should grep the repo before trusting any section below. As of 2026-05-20:

| Concern | State | Evidence |
|---|---|---|
| Next.js version | 16.2.6 | `app/package.json` `"next": "^16.2.6"` |
| React version | 19.2.0 | `app/package.json` `"react": "^19.2.0"` |
| Cache Components flag | ON | `app/next.config.mjs:62` `cacheComponents: true` |
| `middleware.ts` → `proxy.ts` | DONE | `app/src/proxy.ts` exists; only Supabase helper at `app/src/lib/supabase/middleware.ts` keeps the legacy name (library file, not Next route) |
| Async `params` / `searchParams` | DONE | codemods + hand-fixes presumed done in the 16.2.6 upgrade commit set |
| `"use cache"` adoption | LIMITED | only 4 surfaces: `app/src/app/indexnow-key/route.ts`, `app/src/app/mcp.md/route.ts`, `app/src/app/.well-known/mcp.json/route.ts`, `app/src/app/(marketing)/playbook-sales/page.tsx` |
| `unstable_cache` leakage | NONE | grep returns nothing |
| pSEO manifest getters wrapped | NOT YET | `app/src/lib/funnel-teardowns.ts:2932` `getTeardownBySlug` is sync `export function`, no `"use cache"` — same shape for `alternatives.ts`, `categories.ts`, `comparisons.ts`, `pricing-teardowns.ts` |
| pSEO `[slug]` pages PPR-converted | NOT YET | every page still declares `force-static` + `dynamicParams = false`; grep `force-static` in `app/src` returns 15+ hits, all expected pSEO surfaces |

The original plan's premise ("we're on Next 14.2.35") is dead. The opt-in landed without breaking the auth/checkout/email path; that's the credibility gate the plan flagged as Phase 1's purpose.

---

## Why the remaining phases stay deferred

The shipped parts (toolchain bump, flag on, proxy rename, three low-traffic routes + the Playbook sales page using `"use cache"`) are the **low-risk surface area**. The pending parts (Phases 3 + 4) touch every pSEO slug — the surfaces that catch all the long-tail commercial-intent traffic that's about to land.

Specifically:

- Phase 3 wraps `getTeardownBySlug` (and the four sibling getters) in `"use cache"`. The cache keying is automatic from the slug arg, so a logic bug in the wrapper poisons every per-slug render until a deploy busts the build-id cache key. Low-probability but high-blast-radius.
- Phase 4 removes `force-static` + `dynamicParams = false` from the slug pages. That is the explicit hand-off from "every variant is prerendered at build" to "the static shell prerenders, dynamic islands stream in." If a Suspense boundary is missing or a non-serializable prop sneaks past the RSC boundary, the page falls back to fully dynamic and a sub-50ms TTFB regresses to 200ms+ on the first request.

Both classes of regression are silent in CI and only show up under real traffic. The Brunson-correct call from the original plan still holds: ship verified wins now, run the risky parts AFTER first verified customer or after eight days of clean Sentry on the Tier-1-complete production.

---

## The remaining phases (in execution order)

### Phase 3 – opt the pSEO manifests into `use cache` (1 hour)

The five pSEO manifests in `app/src/lib/` are the single highest-value target. They're pure, deterministic, and read on every pSEO render.

For each of `alternatives.ts`, `categories.ts`, `comparisons.ts`, `funnel-teardowns.ts`, `pricing-teardowns.ts`, convert the `getXBySlug` and any other public, slug-keyed reader to an async function with `"use cache"`:

```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getTeardownBySlug(slug: string) {
  "use cache";
  cacheLife("weeks");
  cacheTag("funnel-teardowns", `funnel-teardown:${slug}`);
  return TEARDOWNS.find((t) => t.slug === slug);
}
```

Notes vs the original spec:
- The function MUST become async — `"use cache"` requires it. Every call site is already awaited in the slug pages, so this is a signature change at the lib boundary only.
- Cache life is `weeks` because the manifests change on commit (and a deploy busts the build-id cache key anyway).
- The current `cacheLife` shape per skill docs and the in-repo usage at `app/src/app/(marketing)/playbook-sales/page.tsx:61` is `cacheLife({ revalidate: ... })`. Verify the string-arg form (`cacheLife("weeks")`) is still supported in the installed Next 16.2.6 against https://nextjs.org/docs/app/api-reference/directives/use-cache before shipping — if not, use the explicit object form.

Tag pattern lets a future "edit one row, invalidate one page" workflow ship via:

```ts
"use server";
import { updateTag } from "next/cache";
export async function updateTeardown(slug: string) {
  /* ... mutate ... */
  updateTag(`funnel-teardown:${slug}`);
}
```

Also wrap the related-content readers (`getRelatedTeardowns`, `groupTeardownsByCategory` in `funnel-teardowns.ts`, and the equivalents in the other four files) with the same `"use cache"` + same tag — they read the same TEARDOWNS array and the page typically calls them in the same render.

### Phase 4 – convert pSEO slug pages to PPR mix (2 hours)

Today: every pSEO slug declares `dynamic = "force-static"` + `dynamicParams = false`. That's already fast — sub-50ms TTFB. PPR isn't a TTFB win here, it's a setup for adding dynamic islands without giving up the static shell. The win lands when we add:

- Per-visitor "your diagnosis label" callout above the teardown (dynamic, reads cookie).
- "X other founders viewed this page this week" line (cached `minutes`, not page-rebuild).
- Recently-shipped manifest changes ("Updated 3 days ago: Tally pricing model changed").

Pattern per slug page:

```tsx
import { Suspense } from "react";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTeardownBySlug(slug);  // 'use cache'
  if (!t) notFound();
  return (
    <>
      <ArticleStaticShell t={t} />            {/* prerendered */}
      <Suspense fallback={<VisitorCalloutSkeleton />}>
        <VisitorCallout />                    {/* dynamic, streams in */}
      </Suspense>
    </>
  );
}
```

Remove `dynamic = "force-static"` and `dynamicParams = false` per the migration table — Cache Components handles both via the `"use cache"` on `getTeardownBySlug` + the default-dynamic-with-Suspense pattern. `generateStaticParams` stays as the build-time materialization hint.

Surfaces in scope (confirm by grepping `force-static` in `app/src/app/(marketing)/`):
- `alternatives-to/[slug]`
- `category/[slug]`
- `compare/[slug]` (and any siblings under `comparisons.ts`)
- `funnel-teardown/[slug]`
- `pricing-teardown/[slug]`
- `glossary/[slug]`
- `press/topics/[slug]`
- Any matching `opengraph-image.tsx` — these can stay `force-static` since they're served from a CDN edge and never need a dynamic island.

### Phase 6 – verify (30 minutes)

1. `npm run build` — confirm First Load JS hasn't regressed from the 87.4 kB post-PostHog-surgery baseline. The build will emit Cache Components diagnostics; read them.
2. Lighthouse on `/`, `/diagnostic`, `/playbook-sales`, `/funnel-teardown/tally`, `/compare/tally-vs-typeform`. Capture LCP / INP / CLS. Target: LCP < 1.2s on a throttled fast-3G (it's a sub-50ms TTFB site, this should be trivial).
3. Confirm `sitemap.xml` still renders all routes.
4. Confirm `/llms.txt`, `/llms-full.txt`, every `.md` mirror still serves with `text/markdown` (none of those are pSEO slug pages but they share the cache flag space).
5. Confirm `/api/cron/indexnow` still emits the correct URL list — it depends on the same manifest reads.

---

## What the remaining migration is NOT

- **Not a chance to add Edge runtime.** Cache Components require Node.js. Per the 2026-02-27 Vercel knowledge update, Fluid Compute is the default — Edge isn't recommended.
- **Not a chance to add `cacheComponents: true` half-way.** Already on. The only remaining decision is which surfaces opt in via `"use cache"`.
- **Not a chance to rewrite the analytics layer.** PostHog already dynamic-imports (2026-05-17 SXO push). Don't touch.
- **Not a chance to introduce a CMS or runtime data layer.** Manifests stay TypeScript modules. `"use cache"` over a TS module is fine and faster than any external cache.
- **Not a chance to drop `'unsafe-inline'` from CSP.** The nonce-based CSP hardening referenced in `next.config.mjs:167` is a separate workstream; do not bundle it into the Cache Components rollout.

---

## Estimated time and SXO uplift (remaining work only)

- **Time:** 3.5 hours focused, including verification.
- **SXO score uplift:** ~6 points (84 → 90), per the 2026-05-17 audit's projected gain (unchanged — the gain is entirely from Phase 3+4 since the shipped phases were neutral on real-user metrics).
- **Real-user impact:** marginal for the homepage (already fast), meaningful for any future surface that needs to mix dynamic personalization with cached pSEO content.

## When NOT to run the remaining phases

- If the operator hasn't pushed `CRON_SECRET`, `UNSUBSCRIBE_SECRET`, or `NEXT_PUBLIC_POSTHOG_KEY` yet — finish Tier 1 of LAUNCH-READINESS.md first.
- If there's been a Sentry error inside the last 48 hours that you don't fully understand.
- If a paid campaign is currently live or about to launch — don't ship a framework migration into live traffic.
- If a deploy hasn't shipped successfully in the last 7 days — wash the pipe with a no-op deploy first.
- If the autonomous run can't confirm by grep that the actual state matches the "What's actually shipped" table above. The repo may have moved between this plan's last update and the run.
