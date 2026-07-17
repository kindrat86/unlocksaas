/**
 * /numbers -- Public metrics transparency page.
 *
 * Build-in-public trust signal: real MRR, customer count, and weekly
 * founder commentary. Data lives in app/data/public-metrics.json.
 * The operator updates that file, commits, and pushes -- no database,
 * no API call, no CMS. The source of truth is the JSON file and the
 * git history is the audit trail.
 *
 * Visibility gate: gated by NEXT_PUBLIC_NUMBERS_VISIBLE env var (server-
 * side read at request time). When unset or not 'true', renders a
 * placeholder -- the URL is always accessible, just shows "coming soon".
 *
 * Dataset JSON-LD: structured first-party statistics for AI citation
 * eligibility (+41% citation lift on pages with original statistics,
 * per 2026 GEO research).
 *
 * Brunson Hard-Rule: zero is an honest number. No fabricated traction,
 * no "under construction" framing that hides the real state.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import metrics from "../../../data/public-metrics.json";

export const metadata: Metadata = {
  title: "The Numbers | UnlockSaaS",
  description:
    "Real-time MRR, customer count, and weekly milestones from UnlockSaaS -- published publicly by the founder.",
  alternates: { canonical: "/numbers" },
  openGraph: {
    type: "website",
    title: "The Numbers | UnlockSaaS",
    description:
      "Honest MRR, customer count, and weekly founder commentary. No agency polish -- just the actual Stripe numbers.",
    url: "/numbers",
  },
  robots: { index: true, follow: true },
};

const DATASET_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "UnlockSaaS Public Metrics",
  description:
    "Weekly MRR, customer count, and founder commentary for UnlockSaaS. Updated manually by the founder and published in the open.",
  url: "https://unlocksaas.com/numbers",
  creator: { "@id": "https://unlocksaas.com/#org" },
  dateModified: metrics.last_updated,
  license: "https://creativecommons.org/licenses/by/4.0/",
  isAccessibleForFree: true,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border border-border rounded-lg p-5 flex flex-col gap-1">
      <span className="text-3xl font-bold tabular-nums">{value}</span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NumbersPage() {
  const isVisible = process.env.NEXT_PUBLIC_NUMBERS_VISIBLE === "true";

  if (!isVisible) {
    // Pre-publication state. The C4 thin-content audit (2026-07-17) flagged
    // this placeholder at 68 words; it now explains -- honestly -- what will
    // be published and why it is not live yet, without inventing a single
    // number. Every claim below describes the visible-state page code in
    // this same file or pages that already exist on the site.
    return (
      <main className="min-h-screen py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Build in public · Coming soon
          </p>
          <h1 className="text-2xl font-bold">The Numbers</h1>
          <p className="text-muted-foreground leading-relaxed">
            Maryan will share the numbers publicly once the first week of data
            is in. Honest revenue, real customer count, week-by-week commentary
            -- no polish.
          </p>
          <h2 className="text-lg font-semibold">What will be published here?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seven headline metrics, straight from Stripe and the mailing list:
            monthly recurring revenue, annual run rate, paying customers, $1
            Starter purchases, diagnostic submissions, email subscribers, and
            weeks since launch. Under them, a weekly log -- one honest founder
            note per week on what happened, what was learned, and what changed
            on the Stripe line.
          </p>
          <h2 className="text-lg font-semibold">Why is it not live yet?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Because publishing starts when the first full week of Stripe data
            exists, not before. Zero is an honest number and will be shown as
            zero: no vanity metrics, no screenshots cropped at a flattering
            angle. The metrics live in a version-controlled file, so the git
            history doubles as the audit trail for every figure.
          </p>
          <h2 className="text-lg font-semibold">Why publish revenue at all?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The playbook this site sells tells founders to name one person,
            write one promise, and sell it before it feels ready. Publishing
            the raw numbers holds Unlock SaaS to the same standard it asks of
            its customers -- and shows pre-revenue founders exactly what the
            early weeks of that work look like.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In the meantime, the rest of the site is already public: the{" "}
            <Link
              href="/diagnostic"
              className="font-semibold underline underline-offset-4"
            >
              90-second diagnostic
            </Link>{" "}
            labels what is broken on a shipped product, the{" "}
            <Link
              href="/stories"
              className="font-semibold underline underline-offset-4"
            >
              five founder stories
            </Link>{" "}
            explain the frame the playbook teaches, and the{" "}
            <Link
              href="/tools"
              className="font-semibold underline underline-offset-4"
            >
              five free calculators
            </Link>{" "}
            run the same unit-economics math the paid tier walks through -- no
            email gate on any of them.
          </p>
          <p className="text-sm text-muted-foreground">-- Maryan</p>
        </div>
      </main>
    );
  }

  // Sort weekly log descending (most recent first)
  const log = [...metrics.weekly_log].sort((a, b) => b.week - a.week);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DATASET_JSONLD) }}
      />

      <main className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-muted-foreground mb-6"
          >
            <Link
              href="/"
              className="underline underline-offset-4 hover:text-foreground"
            >
              UnlockSaaS
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span>The Numbers</span>
          </nav>

          {/* Hero */}
          <header className="mb-10">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Build in public · Updated {metrics.last_updated} · Week{" "}
              {metrics.weeks_since_launch}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              UnlockSaaS: The Real Numbers
            </h1>
            <p
              className="text-base text-muted-foreground leading-relaxed"
              data-speakable
            >
              I&apos;m posting these publicly because the founders I&apos;m
              trying to help deserve to know if what I&apos;m building actually
              works. No agency polish. No vanity metrics dressed up as
              traction. Just the actual Stripe numbers -- and an honest
              note each week on what happened.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              -- Maryan
            </p>
          </header>

          <Separator className="my-8" />

          {/* Key metrics grid */}
          <section aria-labelledby="metrics-heading" className="mb-10">
            <h2 id="metrics-heading" className="text-2xl font-bold mb-5">
              Key metrics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <MetricCard
                label="MRR (EUR)"
                value={formatEur(metrics.mrr_eur)}
              />
              <MetricCard
                label="ARR (EUR)"
                value={formatEur(metrics.arr_eur)}
              />
              <MetricCard
                label="Paying customers"
                value={metrics.paying_customers}
              />
              <MetricCard
                label="Starter purchases"
                value={metrics.starter_purchases}
              />
              <MetricCard
                label="Diagnostic submissions"
                value={metrics.diagnostic_submissions}
              />
              <MetricCard
                label="Email subscribers"
                value={metrics.email_subscribers}
              />
              <MetricCard
                label="Weeks since launch"
                value={metrics.weeks_since_launch}
              />
            </div>
          </section>

          <Separator className="my-8" />

          {/* Weekly log */}
          <section aria-labelledby="log-heading" className="mb-10">
            <h2 id="log-heading" className="text-2xl font-bold mb-5">
              Weekly log
            </h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              One honest note per week. What happened, what I learned, what
              changed on the Stripe line.
            </p>

            <div className="space-y-4">
              {log.map((entry) => (
                <div
                  key={entry.week}
                  className="border border-border rounded-lg p-5"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-3 flex-wrap">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Week {entry.week} -- {entry.date}
                    </span>
                    <div className="flex gap-4 text-sm tabular-nums">
                      <span>
                        <span className="text-muted-foreground">MRR:</span>{" "}
                        <strong>{formatEur(entry.mrr_eur)}</strong>
                      </span>
                      <span>
                        <span className="text-muted-foreground">
                          Customers:
                        </span>{" "}
                        <strong>{entry.customers}</strong>
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {entry.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-8" />

          {/* CTA */}
          <section className="mb-10 space-y-3">
            <h2 className="text-xl font-bold">
              If you&apos;re a pre-revenue founder reading this
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              This is exactly the problem UnlockSaaS solves. You shipped
              something, the Stripe line is flat, and you&apos;re not sure if
              the problem is the person you&apos;re selling to, the offer, or
              how you&apos;re explaining it. The free diagnostic takes under
              two minutes and gives you a label -- so you know where to fix
              first.
            </p>
            <p className="text-sm">
              <Link
                href="/diagnostic"
                className="font-semibold underline underline-offset-4"
              >
                Run your free diagnostic --&gt;
              </Link>
            </p>
          </section>

        </article>
      </main>
    </>
  );
}
