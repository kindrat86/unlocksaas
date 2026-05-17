import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";

/**
 * Contact page. E-E-A-T trust column + the canonical inbound channel.
 *
 * Why this page exists:
 *   The Organization JSON-LD declares maryan@unlocksaas.com as the
 *   customer-support contactPoint with `url: /contact`. That schema claim
 *   needs a real page to back it. The page also gives crawlers and
 *   quality-raters the "is there a way to reach a human" signal Google's
 *   guidelines call out for commercial sites.
 *
 * Voice: one inbox, one human. No contact form (the email link is the
 * form; we keep the surface honest with the actual stack — no captcha,
 * no ticketing system, no autoresponder pretending to be a person).
 * Brunson Hard-Rule (honest claims): no fabricated address, no phone we
 * do not answer.
 */
export const metadata: Metadata = {
  title: "Contact — Unlock SaaS",
  description:
    "One inbox, one human, real replies. Email maryan@unlocksaas.com. Diagnostic, refund, partnership, press — all the same address.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact — Unlock SaaS",
    description: "One inbox, one human. Email maryan@unlocksaas.com.",
    url: "/contact",
  },
  robots: { index: true, follow: true },
};

export const dynamic = "force-static";

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Contact", url: "https://unlocksaas.com/contact" },
] as const;

export default function ContactPage() {
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
          <span>Contact</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Contact
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            One inbox. One human. Real replies.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            There is no ticket system pretending to be a person. The address
            below is mine. I read every message.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Email</h2>
          <p>
            <a
              href="mailto:maryan@unlocksaas.com"
              className="text-lg underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Diagnostic questions, refund requests, partnership notes, press —
            same address. Replies usually within one business day. If you
            don&rsquo;t hear back within three, send a nudge — sometimes the
            spam filter eats things.
          </p>
        </section>

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">If you&rsquo;re stuck</h2>
          <p>
            The fastest path to an answer is usually the free diagnostic. Paste
            your live product page and you get a labeled diagnosis in about
            ninety seconds — Wrong Person, Weak Offer, or Weak Belief — plus
            the specific door that fixes it.
          </p>
          <p>
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Take the free diagnostic →
            </Link>
          </p>
        </section>

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">If you bought and want to cancel
            or refund</h2>
          <p>
            You can cancel a Machine subscription from the Stripe customer
            portal linked inside the product, or by emailing the address
            above. The 60-day money-back guarantee on the Machine and a
            standard refund on the $1 Starter are both honored by replying to
            any purchase email or writing fresh.
          </p>
        </section>

        <section className="mb-10 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">If you&rsquo;re a journalist or
            podcaster</h2>
          <p>
            Same address. Put the publication, the angle, and a deadline in the
            subject line. I prioritize anything tied to a real publication date
            over generic interview requests.
          </p>
        </section>

        <Separator className="my-8" />

        <div className="text-xs text-muted-foreground">
          <p>
            Related:{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              About Maryan
            </Link>{" "}
            ·{" "}
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Free diagnostic
            </Link>{" "}
            ·{" "}
            <Link
              href="/machine-sales"
              className="underline underline-offset-4 hover:text-foreground"
            >
              The Machine
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
