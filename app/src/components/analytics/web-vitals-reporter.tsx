"use client";

/**
 * Core Web Vitals + Next.js custom-metric beacon.
 *
 * Why this surface exists
 * -----------------------
 * The 2026-05-17 SEO/SXO audit flagged "no INP/CLS field-data instrumentation
 * visible." PostHog was wired but no web-vitals stream was reaching it, so
 * the brunson-funnel-metrics skill couldn't see real-user latency by route.
 * Lab metrics from Lighthouse / Vercel Speed Insights are useful but they
 * are NOT field data – they don't see the conditions the dream customer
 * actually loads the page under (mid-range Android, throttled cellular,
 * battery saver, etc.). Without RUM CWV, the first signal a regression
 * shipped is the conversion rate dropping a week later. With it, we see
 * the LCP jump within minutes of the bad deploy.
 *
 * Next.js 14 already collects the metrics natively. The
 * `useReportWebVitals` hook from `next/web-vitals` fires its callback once
 * per metric emission with the standard web-vitals v3 `Metric` shape.
 * We hand each one to the existing `track()` API, which lazy-loads
 * posthog-js, queues events that arrive before the SDK resolves, and
 * flushes them in order once it is ready.
 *
 * What is reported
 * ----------------
 * Per the web-vitals v3 spec (the library Next re-exports):
 *   - LCP   – Largest Contentful Paint (loading)
 *   - INP   – Interaction to Next Paint (interactivity, replaces FID)
 *   - CLS   – Cumulative Layout Shift (visual stability)
 *   - FCP   – First Contentful Paint (loading)
 *   - TTFB  – Time to First Byte (server response)
 *   - FID   – First Input Delay (deprecated; still emitted for back-compat)
 *
 * Plus three Next-specific timing metrics that fire automatically:
 *   - Next.js-hydration               (hydration cost)
 *   - Next.js-route-change-to-render  (client nav -> first paint)
 *   - Next.js-render                  (post-nav render cost)
 *
 * The standard CWV metrics carry a `rating` ("good" / "needs-improvement" /
 * "poor") tied to Google's thresholds. The Next custom metrics do not – we
 * send `null` so the PostHog row schema stays consistent.
 *
 * Why a separate component (not folded into PostHogPageView)
 * ----------------------------------------------------------
 *   - PostHogPageView reads `usePathname()` and `useSearchParams()` to fire
 *     `$pageview` on every soft navigation. It belongs inside a Suspense
 *     boundary because `useSearchParams()` opts the tree into CSR.
 *   - useReportWebVitals does NOT read navigation hooks. It subscribes to
 *     the browser's Performance Observer once and emits whenever a new
 *     metric value is available. Putting it inside Suspense would change
 *     nothing functionally but couples two unrelated lifecycles.
 *   - The route property below is read from `window.location.pathname`
 *     inside the callback – not from `usePathname()` – so the component
 *     never re-renders on route change, and the metric carries the
 *     pathname that was live when the metric fired (correct for INP,
 *     which often fires post-navigation).
 *
 * Bundle impact
 * -------------
 * `next/web-vitals` re-exports a Performance Observer wrapper that Next
 * already bundles for its own dev metrics. The hook itself adds <1kb gz.
 * posthog-js is still loaded lazily via the analytics client – first paint
 * is unaffected.
 *
 * Sampling
 * --------
 * No sampling. Pre-launch traffic is low enough that 100% capture is fine.
 * If volume ever crosses ~50k page views/day the PostHog plan tier should
 * be considered before sampling – sampling distorts INP percentiles more
 * than it saves cost. Documented here so the choice is deliberate, not
 * default.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 * No fabricated metric values. The hook only reports values the browser
 * actually emitted via Performance Observer. No synthetic metrics, no
 * "estimated" anything.
 */

import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics/client";
import { Event, type WebVitalReportedProps } from "@/lib/analytics/events";

/**
 * Standard CWV metric names that carry a Google-defined `rating`. Next.js
 * custom timing metrics (prefixed `Next.js-`) do not.
 */
const RATED_METRICS = new Set([
  "LCP",
  "INP",
  "CLS",
  "FCP",
  "TTFB",
  "FID",
]);

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Window guard: useReportWebVitals only runs client-side, but the
    // type narrow keeps SSR-strict mode happy and survives the eventual
    // Next 16 RSC boundary tightening flagged in the migration plan.
    const route =
      typeof window !== "undefined" ? window.location.pathname : "";

    const props: WebVitalReportedProps = {
      metric_name: metric.name,
      metric_id: metric.id,
      // round to 3 decimals so PostHog dashboards aren't littered with
      // floating-point noise like 412.99999999999994. CWV thresholds are
      // measured to the millisecond; sub-microsecond precision is noise.
      value: Math.round(metric.value * 1000) / 1000,
      delta: Math.round(metric.delta * 1000) / 1000,
      // `rating` is only present on the standard CWV metrics. The Next.js
      // custom timing metrics omit it; send null so every row in PostHog
      // has the same shape and dashboards can group cleanly.
      rating: RATED_METRICS.has(metric.name)
        ? (metric as { rating?: WebVitalReportedProps["rating"] }).rating ??
          null
        : null,
      // `navigationType` is the browser-defined nav class. Lets us split
      // BFCache restores from cold navs in the dashboard – BFCache restores
      // skew LCP numbers low and should be reported separately.
      navigation_type:
        (metric as { navigationType?: string | null }).navigationType ?? null,
      route,
    };

    track(Event.WebVitalReported, props);
  });

  // Beacon component – renders nothing.
  return null;
}
