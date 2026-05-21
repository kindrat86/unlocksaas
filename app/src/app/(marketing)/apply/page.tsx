import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { ApplicationForm } from "./application-form";

// Per-page metadata. Targets problem-aware long-tail searches for high-ticket
// SaaS coaching ("done with you saas sprint", "saas first customer coach"),
// names the deliverable, and previews the application gate so SERP clickers
// arrive already pre-framed for the application format.
export const metadata: Metadata = {
  title: "The Done-With-You Verified Builder Sprint – application only",
  description:
    "A 30-day Done-With-You Sprint to your first paying customer (or your second-to-tenth). Application only. $997 self-paced or $1,997 with a 1-hour 1:1. Six honest questions, one auto-reply, no pitch on the call.",
  alternates: pageAlternates("/apply"),
  openGraph: {
    title: "The Done-With-You Sprint – Unlock SaaS",
    description:
      "Application-only. $997 self-paced or $1,997 with a 1-hour 1:1 with Maryan. Six honest questions, no pitch on the call.",
    url: "/apply",
    type: "website",
  },
};

/**
 * High-Ticket Application Funnel (DotCom Secrets Secret #18).
 *
 * Position in the value ladder:
 *   /diagnostic (free)
 *     → /starter ($1)
 *       → /playbook-sales ($49/mo)
 *         → /apply ($997 or $1,997)   ← this page
 *
 * Voice rule: Reluctant Hero. Same as the rest of the funnel. The Sprint is
 * explicitly framed as "the compress" – it does not replace the $49 Playbook,
 * it shortens the gap between the second and the tenth paying customer for
 * founders who have the budget and the urgency to skip the slow lane.
 *
 * Brunson rule: the application IS the disqualifier. We do not "sell" the
 * Sprint on this page. We earn the right to the 15-minute call by asking six
 * honest questions; the auto-reply routes qualified leads to Calendly and
 * everyone else back to the $1 Starter or $49/mo Playbook.
 */
export default function ApplyPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          {
            name: "The Playbook",
            url: "https://unlocksaas.com/playbook-sales",
          },
          {
            name: "The Done-With-You Sprint",
            url: "https://unlocksaas.com/apply",
          },
        ]}
      />
      <div className="max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          The Done-With-You Sprint
        </Badge>

        {/* Hero – Hook, Story, Offer */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          The 30-day compress: from where you are now to the next three paying
          customers, working alongside me.
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          I am Maryan. I built UnlockSaaS because I am the founder it is for –
          a marketer who shipped real AI products in weeks, watched them
          flatline in Stripe, and ran from the truth into SEO tactics for
          almost a year. The $49 Playbook is the seven-step system that
          undoes that. The Sprint is the compressed, 1:1 version for founders
          who have the budget and the urgency to skip the slow lane.
        </p>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          This is application only. Not because of fake scarcity. Because if I
          take more than three Sprint clients at a time the work stops being
          real and starts being a coaching deck. Six honest questions below.
          You get an auto-reply within a minute that tells you which rung to
          start on, and if you qualify, a Calendly link to a 15-minute call.
        </p>

        <Separator className="my-10" />

        {/* The Big Domino – what the Sprint claims */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What the Sprint actually is</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            30 days, with me directly inside the work. We name the avatar.
            We write the one promise. We build the list of twenty specific
            people in their congregation. We send the messages together. We
            triage the replies together. We get on the live calls together. We
            run the offer, defend the price, and refund cleanly when we have
            to. The Sprint ends when your next three paying customers are
            verified in Stripe, or 30 days have passed – whichever comes first.
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h3 className="text-base font-semibold mb-4">
                What the 30 days actually include
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>Two 60-minute working sessions per week</strong>{" "}
                    with me directly. Not group calls. Not slides. We sit in
                    your Stripe, your inbox, your outreach doc.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>Async between sessions</strong> – my personal email
                    on a one-business-day reply window for the full 30 days.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>The Playbook itself</strong> – your $49 Playbook
                    seat is included for the duration of the Sprint. You keep
                    the seat after at the same price.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>The Dream 100 spreadsheet</strong> – 45 named
                    communities and operators where your dream customer
                    already lives, plus the work-your-way-in playbook per row.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">
                    <strong>The Outreach Script Kit</strong> – cold email,
                    cold DM, warm parable, and the live-call open / discovery
                    / close scripts, hand-edited for your offer.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-10" />

        {/* The two tiers */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">The two tiers</h2>

          <Card className="mb-4">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Self-paced
              </p>
              <p className="text-2xl font-bold mb-1">$997 one-time</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Everything above, except the live working sessions are
                replaced by async-only review on a one-business-day reply
                window. For founders who already know how to drive their own
                week and want the assets and the eyes-on-the-work without the
                Zoom calendar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                With 1:1 – recommended
              </p>
              <p className="text-2xl font-bold mb-1">$1,997 one-time</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Everything in the self-paced tier, plus one 60-minute 1:1
                with me at the start of the Sprint and two 30-minute live
                check-ins at Day 10 and Day 20. Designed for founders whose
                blocker is execution, not strategy.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Guarantee */}
        <Card className="mb-10 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">The honest guarantee</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If by Day 30 no new paying customer has hit your Stripe and you
              show up for every scheduled session, I refund the Sprint fee in
              full – minus a flat $99 covering the Outreach Script Kit and
              the Dream 100 spreadsheet, which are yours to keep. The
              guarantee is binary and Stripe-verifiable: either a new charge
              landed or it did not. No self-reporting. No &ldquo;feels
              like.&rdquo;
            </p>
          </CardContent>
        </Card>

        {/* Who this is NOT for – polarity */}
        <Card className="mb-12 border-muted">
          <CardContent className="pt-6">
            <h3 className="text-base font-semibold mb-3">
              Who this is not for
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                – Founders who have not yet shipped a product. Start with the{" "}
                <Link
                  href="/challenge"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  free 14-Day Sprint
                </Link>
                .
              </li>
              <li>
                – Founders whose blocker is &ldquo;more ideas.&rdquo; The
                Sprint is for monetizing what you already have, not for
                pivoting.
              </li>
              <li>
                – Founders shopping for a coach who will tell them they are
                doing great. I will tell you what is true. If that is not
                what you want, this is not the right offer.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-10" />

        {/* The application form */}
        <section id="apply" className="scroll-mt-12 mb-12">
          <h2 className="text-2xl font-bold mb-2">Apply for the Sprint</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Six honest questions. Two minutes. You get an auto-reply within a
            minute and, if you qualify, a Calendly link to book a
            15-minute call.
          </p>

          <Suspense fallback={null}>
            <ApplicationForm source="apply_page" />
          </Suspense>
        </section>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          Not ready for the Sprint?{" "}
          <Link
            href="/starter"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Start with the $1 Starter
          </Link>{" "}
          or{" "}
          <Link
            href="/playbook-sales"
            className="underline underline-offset-4 hover:text-foreground"
          >
            join the $49/mo Playbook
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
