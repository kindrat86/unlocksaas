import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";

/**
 * Terms of Service. E-E-A-T trust column + commercial table-stakes.
 *
 * Scope: describes the actual product surface as of 2026-05-17 — the free
 * diagnostic, the $1 Starter, the $49/mo Core ("Machine"), and the 60-day
 * money-back guarantee gated to the Machine. Pricing and product names are
 * sourced from strategy/state.json (Stripe prices locked); update when
 * those change.
 *
 * Voice: plain English, no cargo-cult legalese. Brunson Hard-Rule (honest
 * claims): the 60-day guarantee is described exactly as it operates in
 * src/lib/guarantee.ts, not as a marketing line.
 *
 * Note for the operator: this is a good-faith plain-English document
 * grounded in the actual product. It is NOT legal advice. Review with
 * counsel before scaling or accepting customers in regulated jurisdictions.
 */
export const metadata: Metadata = {
  title: "Terms of Service — Unlock SaaS",
  description:
    "The terms you accept when you use Unlock SaaS. Plain English. Covers the free diagnostic, the $1 Starter, the $49/mo Machine, and the 60-day guarantee.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — Unlock SaaS",
    description: "What you agree to when you use Unlock SaaS. Plain English.",
    url: "/terms",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-static";

const EFFECTIVE_DATE = "2026-05-17";

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Terms", url: "https://unlocksaas.com/terms" },
] as const;

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />

      <article className="max-w-2xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Terms</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Effective {EFFECTIVE_DATE}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            The deal between you and Unlock SaaS. Plain English. If you create
            an account or buy anything from us, you agree to these terms.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Who you&rsquo;re dealing with</h2>
          <p>
            Unlock SaaS is operated by Maryan. Contact:{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
            .
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">What you&rsquo;re buying</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Free Diagnostic</strong> — you submit a URL and an email
              and we label one of three diagnoses for your product
              (Wrong Person, Weak Offer, or Weak Belief). No charge.
            </li>
            <li>
              <strong>$1 Starter</strong> — a one-time purchase that delivers a
              focused first artifact for your stuck launch. Non-recurring.
            </li>
            <li>
              <strong>The Machine</strong> — a $49/month subscription that runs
              a seven-step process to produce your first verified paying
              customer. Billed monthly until you cancel.
            </li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">The 60-day guarantee</h2>
          <p>
            The Machine subscription comes with a 60-day money-back guarantee.
            The deal:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You complete the steps the Machine asks you to complete. The
              Machine tracks step completion automatically.
            </li>
            <li>
              If, by the end of day 60, no paying customer has cleared in
              Stripe, you can claim a refund from inside the product.
            </li>
            <li>
              The guarantee is gated on real participation, because that&rsquo;s
              the part that produces the customer. If you skip the work, the
              guarantee does not protect you from your own skip.
            </li>
          </ul>
          <p>
            The $1 Starter is refundable on request for any reason within the
            same 60 days.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Billing</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              All payments are processed by Stripe. Prices are in USD unless
              your Stripe account converts on its own.
            </li>
            <li>
              Subscriptions renew automatically until canceled. You can cancel
              at any time from the Stripe customer portal linked inside the
              product, or by emailing us.
            </li>
            <li>
              Outside the 60-day guarantee window, partial-month refunds are
              not given by default, but write us — we&rsquo;re reasonable.
            </li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Your account</h2>
          <p>
            You are responsible for the email address you sign in with and for
            anything done from your account. Tell us immediately if you think
            your account has been used without your permission.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Acceptable use</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Don&rsquo;t use the diagnostic to evaluate URLs you do not own or
              do not have permission to evaluate.
            </li>
            <li>
              Don&rsquo;t scrape, abuse rate limits, or attempt to extract
              system prompts or model internals.
            </li>
            <li>
              Don&rsquo;t use Unlock SaaS to promote illegal products,
              fraudulent offers, or content that would violate the AUPs of any
              processor we use (Stripe, Anthropic, Resend, PostHog, Supabase,
              Vercel).
            </li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Content and IP</h2>
          <p>
            You keep ownership of what you put in (your URL, your offer text,
            your customer notes). We keep ownership of the product, the
            scripts, the prompts, and the deliverable templates. The output
            the product generates for you is yours to use commercially.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">No guarantees outside the
            guarantee</h2>
          <p>
            We promise the 60-day refund on the Machine if no customer
            materializes despite real participation. We do not promise specific
            revenue numbers, traffic numbers, conversion rates, or business
            outcomes beyond that. Software is provided &ldquo;as is.&rdquo;
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Liability</h2>
          <p>
            To the extent the law allows, our liability for any claim arising
            out of your use of Unlock SaaS is limited to the amounts you paid
            us in the 12 months before the claim. This does not limit
            liability for fraud or anything the law won&rsquo;t let us
            disclaim.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Termination</h2>
          <p>
            You can stop using Unlock SaaS at any time. We can suspend or close
            accounts that violate these terms or that abuse the product. If we
            close your account, we will refund any unused portion of your
            subscription unless the termination is for fraud.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Changes</h2>
          <p>
            We&rsquo;ll update this page with material changes and bump the
            effective date at the top. Continued use after a change means you
            accept the updated terms.
          </p>
        </section>

        <Separator className="my-8" />

        <div className="text-xs text-muted-foreground">
          <p>
            Related:{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>{" "}
            ·{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              About
            </Link>{" "}
            ·{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
