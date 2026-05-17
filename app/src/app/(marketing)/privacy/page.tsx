import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";

/**
 * Privacy policy. E-E-A-T trust column + table-stakes for any commercial
 * SaaS that takes payments and emails.
 *
 * Scope: this document describes the data actually flowing through the
 * production stack as of 2026-05-17 — Vercel (hosting), Supabase (auth +
 * Postgres), Stripe (payments), Resend (transactional email), PostHog
 * (product analytics), Anthropic (Claude API for the diagnostic). Adding
 * a new processor requires updating this document; do not silently expand
 * the data plane.
 *
 * Voice: direct, plain English. Brunson Hard-Rule (honest claims): no
 * cargo-cult legalese, no "we may share with third parties" sleight of
 * hand — every processor is named.
 *
 * Note for the operator: this is a good-faith plain-English policy
 * grounded in the actual stack. It is NOT legal advice. Review with
 * counsel before scaling outside founder-customer territory. The doc
 * lives under version control so amendments leave an audit trail.
 */
export const metadata: Metadata = {
  title: "Privacy Policy — Unlock SaaS",
  description:
    "What data Unlock SaaS collects, why, who processes it, how long it lives, and how to ask for it back. Plain English, every processor named.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy — Unlock SaaS",
    description:
      "What data we collect, why, who processes it, and how to ask for it back. Plain English.",
    url: "/privacy",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-static";

// Effective date is module-level so the build embeds a stable string; bump
// when a substantive change ships. Format is ISO for playbook-readability.
const EFFECTIVE_DATE = "2026-05-17";

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Privacy", url: "https://unlocksaas.com/privacy" },
] as const;

export default function PrivacyPage() {
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
          <span>Privacy</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Effective {EFFECTIVE_DATE}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is the plain-English version. Every processor we share data
            with is named below — no &ldquo;we may share with third
            parties&rdquo; without telling you who.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Who we are</h2>
          <p>
            Unlock SaaS is operated by Maryan. You can reach a human at{" "}
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
          <h2 className="text-2xl font-bold">What we collect, and why</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Email address</strong> — when you take the free
              diagnostic, sign up for the newsletter, or purchase. Used to send
              you the thing you asked for (diagnosis, email sequence, receipt,
              deliverables) and to support your account.
            </li>
            <li>
              <strong>The URL you submit</strong> to the diagnostic — passed to
              Anthropic&rsquo;s Claude API so the model can read it and label
              the diagnosis. Stored in our database alongside the resulting
              label so we can show you the result and so you can refer back to
              it.
            </li>
            <li>
              <strong>Payment information</strong> — handled entirely by
              Stripe. We never see or store your card number. We do see the
              last four digits, the country, and a Stripe customer ID.
            </li>
            <li>
              <strong>Product analytics</strong> — anonymous-by-default page
              views and feature usage via PostHog. Used to know which surfaces
              actually work. Identified to your account only after you sign in.
            </li>
            <li>
              <strong>A/B variant cookies</strong> —
              <code className="mx-1 px-1 rounded bg-muted">
                usaas_ab_identity
              </code>
              and
              <code className="mx-1 px-1 rounded bg-muted">
                usaas_ab_subject
              </code>
              . First-party, no third-party tracking, used to keep your version
              of the page stable across visits. Expire after one year.
            </li>
            <li>
              <strong>Server logs</strong> — IP address and user-agent,
              retained by Vercel for the platform&rsquo;s standard window. Used
              for abuse prevention and debugging.
            </li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Who processes your data</h2>
          <p>
            We use the following sub-processors. Each one only sees the slice
            of data described.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Vercel</strong> — application hosting and server logs.
            </li>
            <li>
              <strong>Supabase</strong> — authentication and our primary
              database (your email, diagnosis label, account state).
            </li>
            <li>
              <strong>Stripe</strong> — all payment processing and subscription
              state.
            </li>
            <li>
              <strong>Resend</strong> — outbound transactional and sequence
              email.
            </li>
            <li>
              <strong>PostHog</strong> — product analytics.
            </li>
            <li>
              <strong>Anthropic</strong> — Claude API processes the URL you
              submit to the diagnostic and the text it returns. Anthropic does
              not train on API data by default.
            </li>
          </ul>
          <p>
            We do not sell your data, and we do not share it with advertising
            networks.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">How long we keep it</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Diagnostic submissions and labels: retained as long as your
              account exists, so you can refer back to them.
            </li>
            <li>
              Account data: retained as long as your account exists. Deleted on
              request, subject to legal retention requirements (e.g. Stripe
              tax/payment records).
            </li>
            <li>
              Server logs: retained per Vercel&rsquo;s standard window
              (typically 30 days for application logs).
            </li>
          </ul>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Your rights</h2>
          <p>
            You can ask us to show you what we have on you, correct it, export
            it, or delete it. Email{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>{" "}
            and we will respond within 30 days. If you&rsquo;re in the EU/EEA
            or UK, GDPR/UK-GDPR rights apply; if you&rsquo;re in California,
            CCPA rights apply. We honor those everywhere by default.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Cookies and similar storage</h2>
          <p>
            The only cookies we set ourselves are the two A/B identity cookies
            listed above. Stripe sets cookies on its checkout pages. PostHog
            uses its own first-party storage; if you do not want product
            analytics, you can opt out from within the product or by emailing
            us.
          </p>
        </section>

        <section className="mb-8 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Changes</h2>
          <p>
            If we add a new sub-processor or substantively change what we
            collect, we update this page and the effective date at the top.
            Material changes that affect existing customers also get an email.
          </p>
        </section>

        <Separator className="my-8" />

        <div className="text-xs text-muted-foreground">
          <p>
            Related:{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms of Service
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
