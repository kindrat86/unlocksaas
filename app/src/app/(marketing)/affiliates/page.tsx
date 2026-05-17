import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getAffiliateGateState,
  AFFILIATE_TIERS,
  AFFILIATE_GATE_THRESHOLD,
} from "@/lib/affiliate";

/**
 * Public-facing affiliate landing page.
 *
 * Chapter:       DCS Secret #13 (Other People's Funnels) + workbook 10 §3 (Affiliate Army)
 * Canonical doc: strategy/other-peoples-funnels.md §1 row 5, §6 Gate 3
 * Gate trigger:  50+ paying customers (read via getAffiliateGateState)
 *
 * Two render modes:
 * 1. Gate CLOSED (< 50 verified customers): honest "N/50" page that explains
 *    why the program isn't open yet. No application form, no waitlist gate,
 *    no fake countdown. Per Brunson: "join my affiliate program" reads as
 *    desperation below 50 customers. Same honesty-as-polarity discipline as
 *    /diagnostic, /machine-sales, /repeatable in their pre-Sprint windows.
 * 2. Gate OPEN (≥ 50): renders the full tier breakdown + application form.
 *    Form submission is captured (out of scope for this page; future post-gate
 *    work).
 *
 * Per the OPF playbook §9, this page exists pre-gate so:
 * - Inbound traffic asking "do you have an affiliate program?" gets a real
 *   answer instead of a 404
 * - The brand's honesty-as-polarity discipline shows up where someone is
 *   specifically looking for an excuse to call us hypey
 * - The day the 50th verified customer's webhook fires, the page renders the
 *   full program with zero code change (gate state is data-driven)
 */

export const metadata: Metadata = {
  title: "Affiliate Program — UnlockSaaS",
  description:
    "How the UnlockSaaS affiliate program works, when it opens, and why we won't recruit affiliates before the funnel has proven itself.",
};

export const dynamic = "force-dynamic";

export default async function AffiliatesPage() {
  const gate = await getAffiliateGateState();

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            UnlockSaaS Affiliate Program
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {gate.isOpen
              ? "The affiliate program is open."
              : "The affiliate program opens at 50 verified customers."}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {gate.isOpen ? (
              <>
                If your audience is a non-engineer founder who shipped on AI
                tools and is staring at a flat Stripe line, we built UnlockSaaS
                for them — and we&apos;d like you to be paid for the
                introduction.
              </>
            ) : (
              <>
                Right now we&apos;ve verified{" "}
                <strong>
                  {gate.verifiedCustomerCount} of {gate.threshold}
                </strong>{" "}
                paying customers. Until that count crosses 50, we&apos;re not
                opening the affiliate program — and the reason is in the next
                paragraph.
              </>
            )}
          </p>
        </header>

        {!gate.isOpen && (
          <>
            <Card className="mb-8 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">
                  Why we&apos;re not recruiting affiliates yet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  Below 50 paying customers, &quot;join my affiliate
                  program&quot; reads as &quot;the founder is trying to
                  outsource the selling because the funnel doesn&apos;t work
                  yet.&quot;
                </p>
                <p>
                  That&apos;s a fair read. Affiliates need a track record they
                  can credibly point at when they recommend us to their
                  audience. Until we&apos;ve cycled 50 founders through The
                  Machine to a verified first paying customer, anyone who joins
                  the program is taking our word for an outcome we haven&apos;t
                  yet proven at scale.
                </p>
                <p>
                  The math is the same on both sides. An affiliate program
                  built on vapor stops compensating affiliates the moment the
                  vapor leaks. We&apos;d rather not recruit anyone than recruit
                  people who get burned.
                </p>
                <p className="font-medium text-foreground">
                  Verified count today:{" "}
                  <span className="font-mono">
                    {gate.verifiedCustomerCount} / {gate.threshold}
                  </span>
                  . Program opens automatically when that hits 50.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  What the program will look like
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-relaxed">
                <p>
                  Three tiers. Each tier&apos;s commission and audience match
                  are picked so the math works for both sides without anyone
                  having to over-promote.
                </p>
                <div className="space-y-4">
                  {Object.entries(AFFILIATE_TIERS).map(([tierKey, tier]) => (
                    <div
                      key={tierKey}
                      className="border-l-2 border-primary/30 pl-4 py-1"
                    >
                      <div className="font-semibold mb-1">{tier.label}</div>
                      <div className="text-muted-foreground">
                        {tier.description}
                      </div>
                    </div>
                  ))}
                </div>
                <p>
                  Payouts: monthly via Stripe Connect. Net-30 from the end of
                  the calendar month. Refunded subscriptions claw back the
                  commission — same rules everyone in the program plays by.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-10">
              <CardHeader>
                <CardTitle className="text-xl">
                  Want to be notified when the program opens?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  Email{" "}
                  <a
                    href="mailto:maryan@unlocksaas.com?subject=Affiliate%20program%20notification"
                    className="text-primary underline underline-offset-2"
                  >
                    maryan@unlocksaas.com
                  </a>{" "}
                  with the subject line &quot;Affiliate program
                  notification&quot; and one sentence about your audience.
                  When the gate opens, we send a one-shot email to everyone
                  who asked. No drip, no sequence — that&apos;s the deal.
                </p>
                <p className="text-xs text-muted-foreground">
                  Why not a form? A form on a closed program is theater. An
                  email to a real human is signal that you actually want this.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {gate.isOpen && (
          <>
            <Card className="mb-8 border-primary/30">
              <CardHeader>
                <CardTitle className="text-xl">The three tiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-relaxed">
                {Object.entries(AFFILIATE_TIERS).map(([tierKey, tier]) => (
                  <div
                    key={tierKey}
                    className="border-l-2 border-primary/40 pl-4 py-1"
                  >
                    <div className="font-semibold text-base mb-1">
                      {tier.label} —{" "}
                      <span className="font-mono">
                        {tier.commissionPercent}%
                        {tier.durationMonths
                          ? ` for ${tier.durationMonths} months`
                          : " for lifetime"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {tier.description}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="mb-10 border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Apply</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  Email{" "}
                  <a
                    href="mailto:maryan@unlocksaas.com?subject=Affiliate%20application"
                    className="text-primary underline underline-offset-2"
                  >
                    maryan@unlocksaas.com
                  </a>{" "}
                  with the subject line &quot;Affiliate application&quot; and
                  these four things:
                </p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Your name and where you publish</li>
                  <li>Audience size (X / newsletter / community)</li>
                  <li>The URL of one piece you published in the last 90 days</li>
                  <li>
                    Three sentences describing a Marco-shaped founder in your
                    audience
                  </li>
                </ol>
                <p>
                  First 50 applications get manual review by Maryan; templated
                  approval after.
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Separator className="my-10" />

        <section className="text-sm text-muted-foreground space-y-3">
          <p>
            The reasoning behind the gate, the tier math, and the
            who-we-accept / who-we-don&apos;t rules live in the public OPF
            playbook at{" "}
            <code className="text-xs">strategy/other-peoples-funnels.md</code>{" "}
            (visible in the repo).
          </p>
          <p>
            <Link href="/" className="text-primary underline underline-offset-2">
              Back to UnlockSaaS
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
