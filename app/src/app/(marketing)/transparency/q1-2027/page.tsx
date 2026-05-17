import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";

/**
 * Public quarterly transparency report — Q1 2027 cohort.
 *
 * Why this page exists at all, pre-launch: the $49 Machine sales page
 * (workbook 07 §2 Secret 3 Case Study) commits in writing that the
 * actual refund rate will be published every calendar quarter, at this
 * exact URL, as four honest numbers (cohort size, Step-5 completion
 * rate, verified-customer rate, refund rate). A commitment in copy
 * with no surface to land on is vaporware. This stub is the surface.
 *
 * Brunson Hard-Rule reconciliation: no fabricated numbers. Every cell
 * in the table below shows "—" until the cohort has actually fired
 * through the Stripe webhook + 60-day guarantee window. The cohort
 * definition + the schedule + the source SQL view live on the page so
 * anyone — operator, customer, auditor — can verify the math when
 * the numbers arrive.
 *
 * Update protocol: the page goes from stub to populated when the
 * first calendar-quarter cohort closes (all customers in the Q1-2027
 * intake have either hit their 60-day guarantee mark OR a verified
 * customer). At that point the four "—" cells fill with real numbers
 * from `supabase/views/funnel_audibles.sql::funnel_audibles__refund_eligible`
 * + the verified-customer count. The stub form is then archived to
 * the build log; the live page is the report.
 */
export const metadata: Metadata = {
  title: "Transparency Report Q1 2027 — Unlock SaaS",
  description:
    "Quarterly public refund-rate report for Unlock SaaS. Cohort size, Step-5 completion rate, verified-customer rate, refund rate. Honest numbers, no spin.",
  alternates: { canonical: "/transparency/q1-2027" },
  openGraph: {
    title: "Transparency Report Q1 2027 — Unlock SaaS",
    description:
      "Quarterly public refund-rate report. Four honest numbers from a real cohort.",
    url: "/transparency/q1-2027",
  },
  // Index this surface — it is a public commitment, not a private dashboard.
  // The schema markup is intentionally minimal at the stub stage; on
  // population, switch to a Report/Article JSON-LD with `datePublished`.
  robots: { index: true, follow: true },
};

// Effective stub date. Bump when the cohort populates.
const REPORT_STATUS = "STUB — cohort not yet closed";
const STUB_PUBLISHED_AT = "2026-05-17";
const COHORT_WINDOW = "Q1 2027 (Jan 1 – Mar 31, 2027)";
const COHORT_CLOSE = "Cohort report goes live after the last Q1-2027 subscriber clears their 60-day guarantee window — earliest publish date: May 30, 2027.";

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Transparency", url: "https://unlocksaas.com/transparency/q1-2027" },
] as const;

export default function TransparencyQ1_2027() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />

      <article className="max-w-2xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:underline">
            Unlock SaaS
          </Link>{" "}
          / Transparency / Q1 2027
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Quarterly transparency report
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Q1 2027 cohort — refund rate, in writing.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is the public record of how the 60-day guarantee
            performed against the founders who subscribed to The Machine
            during {COHORT_WINDOW}. Four numbers. No spin. Same format
            every quarter.
          </p>
        </header>

        <Card className="mb-8 border-primary/40">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Status
            </p>
            <p className="text-base font-semibold mb-2">{REPORT_STATUS}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {COHORT_CLOSE}
            </p>
          </CardContent>
        </Card>

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">The four honest numbers</h2>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-2 sm:pr-4 font-semibold">
                    Metric
                  </th>
                  <th className="text-right py-2 pl-2 sm:pl-4 font-semibold">
                    Q1 2027
                  </th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border">
                  <td className="py-3 pr-2 sm:pr-4">Cohort size</td>
                  <td className="py-3 pl-2 sm:pl-4 text-right">—</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-2 sm:pr-4">
                    Step-5 completion rate
                  </td>
                  <td className="py-3 pl-2 sm:pl-4 text-right">—</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-3 pr-2 sm:pr-4">
                    Verified-customer rate
                  </td>
                  <td className="py-3 pl-2 sm:pl-4 text-right">—</td>
                </tr>
                <tr>
                  <td className="py-3 pr-2 sm:pr-4">Refund rate</td>
                  <td className="py-3 pl-2 sm:pl-4 text-right">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground italic mt-4">
            Every cell shows &ldquo;—&rdquo; until the cohort closes.
            Fabricating numbers before the data exists would defeat the
            entire point of publishing them.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">How each number is computed</h2>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Cohort size</strong> —
              count of distinct{" "}
              <code className="text-xs">profiles.user_id</code> with a{" "}
              <code className="text-xs">billing_payments</code> row of
              type <code className="text-xs">machine_subscription</code>{" "}
              whose first charge falls inside the quarter window.
            </li>
            <li>
              <strong className="text-foreground">
                Step-5 completion rate
              </strong>{" "}
              — share of cohort with ≥20 outreach actions logged in{" "}
              <code className="text-xs">outreach_actions</code> by the
              60-day mark.
            </li>
            <li>
              <strong className="text-foreground">
                Verified-customer rate
              </strong>{" "}
              — share of cohort with at least one row in{" "}
              <code className="text-xs">verified_conversions</code>{" "}
              whose detected-charge date is after their machine-onboarding
              date and within the 60-day window.
            </li>
            <li>
              <strong className="text-foreground">Refund rate</strong> —
              share of cohort whose 60-day window closed with Step-5
              complete AND zero verified customer, triggering the
              automatic refund per{" "}
              <code className="text-xs">
                supabase/views/funnel_audibles.sql::funnel_audibles__refund_eligible
              </code>
              .
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Publishing schedule</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            One report per calendar quarter, in perpetuity, at{" "}
            <code className="text-xs">/transparency/q[1-4]-yyyy</code>.
            Each report goes live within 60 days of the last cohort
            subscriber clearing their guarantee window — so Q1 reports
            land late May, Q2 reports late August, Q3 reports late
            November, Q4 reports late February of the following year.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Past reports are never edited after publication. Errata, if
            any, append at the bottom of the relevant report.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Why this page exists</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The Machine&apos;s 60-day guarantee is enforced by code, not
            by my willingness to honour it. That mechanic only matters if
            the refund rate is visible. A guarantee whose performance is
            invisible is just marketing copy with one extra sentence in
            it.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Publishing the actual numbers — including the bad ones —
            converts the guarantee from a promise to a public scoreboard.
            If you are a skeptic, the scoreboard is the only thing that
            tells you whether the promise is real. If the scoreboard
            looks bad, your refund still fires automatically — but you
            also get to walk away before the second month renews.
          </p>
        </section>

        <Separator className="my-8" />

        <footer className="text-sm text-muted-foreground">
          <p className="mb-3">
            Stub published {STUB_PUBLISHED_AT}. Last updated{" "}
            {STUB_PUBLISHED_AT}. Cohort closes after May 30, 2027.
          </p>
          <p className="italic">— Maryan</p>
          <p className="mt-4">
            Back to{" "}
            <Link
              href="/machine-sales"
              className="underline underline-offset-4"
            >
              The Machine
            </Link>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
