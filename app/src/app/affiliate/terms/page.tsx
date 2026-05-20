import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Program Terms",
  description:
    "How the UnlockSaaS referral program works: 50% rev share, 90-day cookie, 30-day refund hold, lifetime grandfather on the floor.",
  alternates: { canonical: "/affiliate/terms" },
};

/**
 * Public terms page. Plain prose, no auth gate, no Supabase reads.
 *
 * Cache Components: this is a static text page; no `connection()` call,
 * no Suspense needed. It pre-renders at build time and ships from the CDN.
 */
export default function AffiliateTermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Affiliate Program Terms</h1>
      <p className="text-sm text-muted-foreground mb-10">
        Last updated 21-05-2026
      </p>

      <section className="space-y-6 text-[15px]">
        <p>
          UnlockSaaS pays you cash for sending other builders my way. The
          program is open to any active UnlockSaaS customer (Starter or
          Core). Here's the deal in plain English – the lawyer-grade version
          isn't worth writing for a 50-customer program.
        </p>

        <Block title="What you get">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>50% of every dollar</strong> UnlockSaaS earns from someone you
              referred, for as long as they stay paying.
            </li>
            <li>
              The 50% rate is grandfathered for you as long as the program
              runs. When UnlockSaaS hits $1M ARR the floor for new affiliates
              drops to 30% – your existing rate doesn't move.
            </li>
            <li>
              No cap, no clawback after payout, no tier ladder, no
              "platinum partner" nonsense.
            </li>
          </ul>
        </Block>

        <Block title="How attribution works">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Your unique link is{" "}
              <code className="font-mono text-sm">
                unlocksaas.com/r/&lt;your-code&gt;
              </code>{" "}
              – also works as{" "}
              <code className="font-mono text-sm">
                unlocksaas.com/?ref=&lt;your-code&gt;
              </code>
              .
            </li>
            <li>
              A click sets a 90-day cookie. If the visitor buys anytime within
              those 90 days, you get credit – even if they came in via your
              link once and bought from an organic Google search later.
            </li>
            <li>
              <strong>First touch wins.</strong> If someone clicked another
              affiliate's link before yours, that affiliate keeps the
              attribution.
            </li>
            <li>
              You cannot refer yourself. Self-checkouts via your own link are
              detected and the commission is blocked.
            </li>
          </ul>
        </Block>

        <Block title="When you actually get paid">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Pending</strong> – the customer just paid. The commission
              sits 30 days while Stripe's refund window runs.
            </li>
            <li>
              <strong>Payable</strong> – 30 days clear. Commission is locked.
            </li>
            <li>
              <strong>Paid</strong> – I pay all Payable commissions via Wise on
              the 1st of the next month. Reply to my emails (or update your
              dashboard) with the email tied to your Wise account.
            </li>
            <li>
              Minimum payout: $25. Below that, balance rolls to the next
              month.
            </li>
          </ul>
        </Block>

        <Block title="What kills attribution">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Customer refunds inside the 60-day guarantee window: that
              commission is voided.
            </li>
            <li>
              Customer churns: existing commissions stay paid / payable, but
              no new commissions accrue.
            </li>
            <li>
              Spam, fake signups, paid traffic that doesn't disclose, or
              brand-bidding on Google ads (anyone bidding on "unlocksaas"):
              account paused, all pending balances voided.
            </li>
          </ul>
        </Block>

        <Block title="What you can and can't say">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              Disclose the affiliate relationship per FTC / your country's
              equivalent (the usual "I'll earn a commission if you buy" line).
              That's on you.
            </li>
            <li>
              Don't promise outcomes UnlockSaaS doesn't promise. The product
              has a 60-day money-back guarantee, not a guaranteed paying
              customer.
            </li>
            <li>
              Don't impersonate Maryan or UnlockSaaS. Don't run cold email
              blasts from a domain that looks like ours.
            </li>
          </ul>
        </Block>

        <Block title="Changes to these terms">
          <p>
            If I change the program (rates, payout schedule, eligibility) I
            email every active affiliate at least 30 days before it takes
            effect. Commissions already accrued at the old rate stay at the
            old rate – the only direction the floor moves for you is up.
          </p>
        </Block>

        <Block title="Questions">
          <p>
            Reply to any of my emails, or write to{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-2"
            >
              maryan@unlocksaas.com
            </a>
            . I read everything.
          </p>
        </Block>
      </section>

      <div className="mt-12 border-t pt-6 text-sm text-muted-foreground">
        <Link href="/affiliate" className="underline underline-offset-2">
          Back to your dashboard
        </Link>
        <span className="px-2">·</span>
        <Link href="/" className="underline underline-offset-2">
          unlocksaas.com
        </Link>
      </div>
    </main>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="text-[15px] text-muted-foreground">{children}</div>
    </div>
  );
}
