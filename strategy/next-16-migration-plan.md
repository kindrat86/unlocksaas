# Next.js 16 + Cache Components migration plan

**Status:** DEFERRED. Specced, not executed.
**Trigger to execute:** first verified Stripe customer (or eight days of zero deploy-related Sentry errors after the operator finishes Tier 1 of LAUNCH-READINESS.md, whichever comes first).
**Owner:** Maryan (or an autonomous Claude run, gated on the trigger).
**Source skills:** vercel-plugin:next-cache-components, vercel-plugin:next-upgrade, vercel-plugin:nextjs.

---

## Why this is deferred

The 2026-05-17 SEO/SXO audit flagged the project's biggest remaining performance gap: it's on Next 14.2.35, and three Next 15/16-only primitives would materially improve Core Web Vitals on every pSEO page:

1. **Cache Components / PPR** – mix static, cached, and dynamic in one route, so the static shell streams instantly while dynamic islands fill in.
2. **`use cache` directive** – replaces `unstable_cache` and the file-level `force-static` heuristic with a per-function caching surface, with `cacheLife` + `cacheTag` for granular invalidation.
3. **`updateTag` / `revalidateTag`** – same-request vs background invalidation, no more full-page revalidation when one row in a manifest changes.

The win is real. The risk is that Next 16 also rolls up:
- **`middleware.ts` → `proxy.ts` rename** – file move + import renames, affects auth flow.
- **Async `params` / `searchParams`** – every page that destructures `params.slug` synchronously needs an `await params` rewrite. About 30 surfaces here, including all 5 pSEO `[slug]` routes.
- **Async `cookies()` / `headers()`** – server components that read cookies for the diagnostic hook variant + auth surfaces need rewrites.
- **A few RSC boundary tightenings** – passing non-serializable props from server → client now fails harder.

That's a multi-hour migration with a real possibility of breaking auth, checkout, or the entire pSEO surface on the day a real customer arrives. Pre-launch, with the audit's verdict that the code is already at 88/100 implementation, the Brunson-correct call is to ship verified wins now and run this migration AFTER first verified customer.

---

## The migration itself, in execution order

### Phase 0 – preflight (30 minutes)

1. Run `npx @next/codemod@canary upgrade latest` in a fresh worktree – auto-runs the official migration codemods (`next-async-request-api`, `middleware-to-proxy`, etc.).
2. Run `./node_modules/.bin/tsc --noEmit` – capture the diff. Expected: ~30 errors from sync params destructuring.
3. Run `npm run build` – capture every build error. Expected: middleware import errors, async API errors, possibly a Suspense boundary that wasn't strictly required before.
4. Stash. Don't ship. This is purely to size the actual blast radius before touching the production branch.

### Phase 1 – codemods only (1–2 hours)

1. Re-run codemods on the production branch.
2. Hand-fix everything they couldn't (typically: dynamic OG image routes where `params` is the prop name, anything custom in middleware that the rename codemod didn't catch).
3. `tsc --noEmit` + `npm run build` clean.
4. Smoke-test locally: `/`, `/diagnostic`, `/diagnostic/finish`, `/playbook-sales`, `/starter`, `/oto`, one pSEO slug from each manifest, `/auth/callback`. Confirm visual + form behavior.
5. Ship as ONE commit, no Cache Components yet. Tagged `next-16-baseline`.

This phase alone is the credibility gate – if anything in the auth/checkout/email path regresses, it's caught before adding new caching behavior on top.

### Phase 2 – enable Cache Components, opt nothing in yet (15 minutes)

1. Add `cacheComponents: true` to next.config.mjs (the new flag, replacing `experimental.ppr` which we never enabled).
2. Convert `next.config.mjs` → `next.config.ts` for typed config + dynamic logic if it pays off.
3. `npm run build` – every existing page should still build because `force-static` and the implicit dynamic default are both still respected. The new flag turns ON the new caching primitives but doesn't change the default rendering mode.
4. Ship as one commit.

### Phase 3 – opt the pSEO manifests into `use cache` (1 hour)

The five pSEO manifests in `app/src/lib/` are the single highest-value target. They're pure, deterministic, and read on every pSEO render.

For each of `alternatives.ts`, `categories.ts`, `comparisons.ts`, `funnel-teardowns.ts`, `pricing-teardowns.ts`:

```ts
import { cacheLife, cacheTag } from "next/cache";

export async function getTeardownBySlug(slug: string) {
  "use cache";
  cacheLife("weeks");
  cacheTag("funnel-teardowns", `funnel-teardown:${slug}`);
  return TEARDOWNS.find((t) => t.slug === slug);
}
```

The cache key is automatic from the slug argument. Cache life is `weeks` because the manifests change on commit (and a deploy busts the build-id cache key anyway).

Tag pattern lets a future "edit one row, invalidate one page" workflow ship via:

```ts
"use server";
import { updateTag } from "next/cache";
export async function updateTeardown(slug: string) {
  /* ... mutate ... */
  updateTag(`funnel-teardown:${slug}`);
}
```

### Phase 4 – convert pSEO slug pages to PPR mix (2 hours)

Today: every pSEO slug is `force-static` + `dynamicParams = false`. That's already fast – sub-50ms TTFB. PPR isn't a TTFB win here, it's a setup for adding dynamic islands without giving up the static shell. The win lands when we add:

- Per-visitor "your diagnosis label" callout above the teardown (dynamic).
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

Remove `dynamic = "force-static"` and `dynamicParams = false` per the migration table – Cache Components handles both via the `use cache` on `getTeardownBySlug` + the default-dynamic-with-Suspense pattern.

### Phase 5 – kill `unstable_cache` if any leaked in (15 minutes)

Grep for `unstable_cache`. The codebase doesn't use it as of 2026-05-17, but check.

### Phase 6 – verify (30 minutes)

1. `npm run build` – confirm First Load JS hasn't regressed from the 87.4 kB post-PostHog-surgery baseline.
2. Lighthouse on `/`, `/diagnostic`, `/playbook-sales`, `/funnel-teardown/tally`, `/compare/tally-vs-typeform`. Capture LCP / INP / CLS. Target: LCP < 1.2s on a throttled fast-3G (it's a sub-50ms TTFB site, this should be trivial).
3. Confirm sitemap.xml still renders all routes.
4. Confirm `/llms.txt`, `/llms-full.txt`, every `.md` mirror still serves with `text/markdown`.

---

## What the migration is NOT

- **Not a chance to add Edge runtime.** Cache Components require Node.js. Per the 2026-02-27 Vercel knowledge update, Fluid Compute is the default – Edge isn't recommended.
- **Not a chance to add `cacheComponents: true` half-way.** It's all-or-nothing for the build. If Phase 2 breaks anything, roll back the whole opt-in.
- **Not a chance to rewrite the analytics layer.** PostHog already dynamic-imports (2026-05-17 SXO push). Don't touch.
- **Not a chance to introduce a CMS or runtime data layer.** Manifests stay TypeScript modules. `use cache` over a TS module is fine and faster than any external cache.

---

## Estimated total time and SXO uplift

- **Time:** 5–6 hours focused, including verification.
- **SXO score uplift:** ~6 points (84 → 90), per the 2026-05-17 audit's projected gain.
- **Real-user impact:** marginal for the homepage (already fast), meaningful for any future surface that needs to mix dynamic personalization with cached pSEO content.

## When NOT to run this

- If the operator hasn't pushed `CRON_SECRET`, `UNSUBSCRIBE_SECRET`, or `NEXT_PUBLIC_POSTHOG_KEY` yet – finish Tier 1 of LAUNCH-READINESS.md first.
- If there's been a Sentry error inside the last 48 hours that you don't fully understand.
- If a paid campaign is currently live or about to launch – don't ship a framework migration into live traffic.
- If a deploy hasn't shipped successfully in the last 7 days – wash the pipe with a no-op deploy first.
