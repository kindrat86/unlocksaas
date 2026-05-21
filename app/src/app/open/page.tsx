import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getOpenMetrics,
  formatMrr,
  formatJoinedMonth,
  formatAthensTimestamp,
  type OpenMetrics,
} from "@/lib/open-metrics";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";

/**
 * /open — Build-in-public transparency dashboard.
 *
 * Lives at https://unlocksaas.com/open. The single public source of truth
 * for "is this thing actually working." Surfaces MRR, active subscribers,
 * lifetime signups, diagnostic completions, 30-day churn, and the last 10
 * customers by first name + joined month.
 *
 * Why this page exists (from the 2026 trend research):
 *
 *   "Build-in-public + transparent revenue is explicitly the dominant
 *    solo-founder distribution strategy in 2026; pioneers (Levels, Marc Lou)
 *    cited as exemplars. Doubles as trust signal for an 'attractive
 *    character' brand."
 *
 * Honest-zero policy:
 *   Pre-launch this page renders zeros, not estimates or projections. Per
 *   feedback_unlocksaas_visual_style + the locked "honest empty-state
 *   public-counter" pattern shipped in 2026-05-17's audit response, hiding
 *   the section would erode the trust the page is supposed to create. The
 *   number is the number.
 *
 * Founder-exclusion:
 *   FOUNDER.email (maryan@unlocksaas.com) is excluded at the query layer in
 *   lib/open-metrics.ts. Test runs from the founder's own browser do not
 *   appear in these aggregates.
 *
 * Caching:
 *   Data is computed inside `'use cache'` (cacheLife minutes); the Stripe
 *   webhook calls `revalidateTag("billing-mutation", "max")` on every paid
 *   event so the page reflects new customers within one request. Pre-render
 *   ships the shell; <MetricsBoard /> streams in under Suspense.
 */

export const metadata: Metadata = {
  title: "The numbers · UnlockSaaS",
  description:
    "MRR, active subscribers, signups, churn, and last 10 customers. Updated automatically from Stripe + Supabase. No fluff, no rounding up.",
  alternates: { canonical: `${BASE_URL}/open` },
  openGraph: {
    title: "UnlockSaaS in public",
    description:
      "Live numbers from the Unlock SaaS funnel. MRR, signups, churn, and recent builders.",
    url: `${BASE_URL}/open`,
    type: "website",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "UnlockSaaS in public",
    description:
      "Live numbers from the Unlock SaaS funnel. MRR, signups, churn, and recent builders.",
  },
  robots: { index: true, follow: true },
};

export default function OpenPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <header className="mb-12 sm:mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Build in public
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-balance mb-4">
            The numbers.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Every metric on this page is pulled straight from Stripe and
            Supabase. Founder transactions are excluded. No rounding up, no
            projections, no &quot;coming soon&quot; placeholders. If a number
            is zero, the page says zero.
          </p>
        </header>

        <Suspense fallback={<MetricsBoardSkeleton />}>
          <MetricsBoard />
        </Suspense>

        <Separator className="my-12" />

        <section className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-lg font-semibold text-foreground">
            Why we publish this
          </h2>
          <p>
            UnlockSaaS sells a playbook for getting to first paying customer.
            The fastest way to disqualify ourselves would be to hide whether
            we use it on our own product. So we do not hide it.
          </p>
          <p>
            The page updates within a few minutes of every paid event. The
            list of recent builders shows first names only, derived from the
            email handle. Role addresses like &quot;info@&quot; or
            &quot;admin@&quot; collapse to &quot;Builder&quot; instead of
            being published. No customer is named past their first name.
          </p>
          <p>
            Pricing is locked at $1 for the Starter and $49/month for Core.
            MRR is computed as active Core subscribers &times; $49. When the
            pricing model changes, this paragraph and the math change with
            it &ndash; not before.
          </p>
        </section>

        <Suspense fallback={null}>
          <UpdatedAtFooter />
        </Suspense>

        <Suspense fallback={null}>
          <OpenJsonLd />
        </Suspense>
      </article>
    </main>
  );
}

// ── Metrics ──────────────────────────────────────────────────────────────────

async function MetricsBoard() {
  const m = await getOpenMetrics();

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard
          label="Monthly recurring revenue"
          value={formatMrr(m.mrrCents)}
          sub={`${m.activeCoreCount} active Core ${
            m.activeCoreCount === 1 ? "subscriber" : "subscribers"
          } × $49`}
          tone={m.mrrCents > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          label="Active Starter buyers"
          value={String(m.activeStarterCount)}
          sub="Paid $1, not yet upgraded to Core."
          tone="neutral"
        />
        <MetricCard
          label="Lifetime diagnostics run"
          value={String(m.diagnosticCompletions)}
          sub="Every email handed over on the free diagnostic."
          tone="neutral"
        />
        <MetricCard
          label="30-day net churn"
          value={
            m.churn30dPercent === null
              ? "–"
              : `${m.churn30dPercent.toFixed(1)}%`
          }
          sub={
            m.churn30dPercent === null
              ? "Need at least one Core sub 30 days ago to compute."
              : `${m.canceledLast30d} cancellation${
                  m.canceledLast30d === 1 ? "" : "s"
                } in the last 30 days.`
          }
          tone="neutral"
        />
      </div>

      <LifetimeRow m={m} />

      <RecentBuilders m={m} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  tone: _tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "positive" | "neutral";
}) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-3xl sm:text-4xl font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {sub}
        </p>
      </CardContent>
    </Card>
  );
}

function LifetimeRow({ m }: { m: OpenMetrics }) {
  return (
    <Card className="border-border/60 bg-muted/30">
      <CardContent className="py-6">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Lifetime Starters paid
            </p>
            <p className="text-2xl font-bold">{m.lifetimeStartersPaid}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Lifetime Cores started
            </p>
            <p className="text-2xl font-bold">{m.lifetimeCoresStarted}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentBuilders({ m }: { m: OpenMetrics }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-2">Last 10 builders to join</h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        First name only, derived from the email handle. Tier shows whether
        they paid the $1 Starter or the $49 Core. Newest first.
      </p>

      {m.recentBuilders.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-10 text-center">
            <p className="text-2xl font-bold mb-2">0</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Nobody yet. The list fills in the moment the first builder
              pays. We are not pretending otherwise.
            </p>
            <Link
              href="/diagnostic"
              className="inline-block mt-4 text-sm underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Run the free diagnostic &rarr;
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {m.recentBuilders.map((b, idx) => (
            <li
              key={`${b.firstName}-${b.joinedAt}-${idx}`}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">{b.firstName}</span>
                <Badge
                  variant={b.tier === "core" ? "default" : "secondary"}
                  className="text-[10px] uppercase tracking-wider"
                >
                  {b.tier}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatJoinedMonth(b.joinedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MetricsBoardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse" aria-hidden>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="h-3 w-32 bg-muted rounded" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-10 w-24 bg-muted rounded mb-2" />
              <div className="h-3 w-40 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="py-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="h-12 bg-muted rounded" />
            <div className="h-12 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
      <div className="h-48 bg-muted/30 rounded-lg" />
    </div>
  );
}

// ── Footer + JSON-LD ─────────────────────────────────────────────────────────

async function UpdatedAtFooter() {
  const m = await getOpenMetrics();
  return (
    <footer className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground">
      <p>
        Last updated{" "}
        <time dateTime={m.generatedAt}>
          {formatAthensTimestamp(m.generatedAt)}
        </time>{" "}
        Athens time. Refresh cadence: ~5 minutes, immediate on any paid event.
      </p>
      <p className="mt-2">
        Source of truth: Stripe (revenue, subscriptions) and Supabase
        (diagnostic submissions). Founder transactions excluded.
      </p>
    </footer>
  );
}

async function OpenJsonLd() {
  const m = await getOpenMetrics();

  // Two JSON-LD blobs: a WebPage for general discovery + a Dataset for
  // GEO/AEO citation. Dataset is the high-leverage one — per the May 2026
  // GEO research, original-stat datasets get the strongest AI-citation lift.
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "UnlockSaaS in public",
    url: `${BASE_URL}/open`,
    description:
      "Live transparency dashboard for UnlockSaaS. MRR, active subscribers, lifetime signups, diagnostic completions, 30-day churn, and the last 10 builders by first name.",
    isPartOf: { "@type": "WebSite", url: BASE_URL, name: ORGANIZATION.name },
    publisher: { "@type": "Organization", name: ORGANIZATION.name, url: BASE_URL },
    author: { "@type": "Person", name: FOUNDER.name, url: BASE_URL },
    dateModified: m.generatedAt,
  };

  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "UnlockSaaS public revenue + funnel metrics",
    description:
      "Snapshot of UnlockSaaS revenue, subscriber, and funnel metrics. Founder transactions excluded. Updated within minutes of each paid Stripe event.",
    url: `${BASE_URL}/open`,
    creator: { "@type": "Person", name: FOUNDER.name, url: BASE_URL },
    publisher: { "@type": "Organization", name: ORGANIZATION.name, url: BASE_URL },
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    isAccessibleForFree: true,
    dateModified: m.generatedAt,
    variableMeasured: [
      { "@type": "PropertyValue", name: "Monthly recurring revenue (USD)", value: m.mrrCents / 100 },
      { "@type": "PropertyValue", name: "Active Core subscribers", value: m.activeCoreCount },
      { "@type": "PropertyValue", name: "Active Starter buyers", value: m.activeStarterCount },
      { "@type": "PropertyValue", name: "Lifetime diagnostic submissions", value: m.diagnosticCompletions },
      { "@type": "PropertyValue", name: "Lifetime Starters paid", value: m.lifetimeStartersPaid },
      { "@type": "PropertyValue", name: "Lifetime Cores started", value: m.lifetimeCoresStarted },
      ...(m.churn30dPercent === null
        ? []
        : [{ "@type": "PropertyValue", name: "30-day net churn (percent)", value: m.churn30dPercent }]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset) }}
      />
    </>
  );
}
