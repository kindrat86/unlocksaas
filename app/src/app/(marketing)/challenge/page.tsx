import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ChallengeForm } from "./challenge-form";

// Per-page metadata — Surface A of the Google strategy. Targets the
// problem-aware long-tail ("how to get first saas customer", "14 day
// challenge for founders") with a title that names the contract and a
// description that previews the daily-action structure.
export const metadata: Metadata = {
  title: "The 14-Day First-Customer Sprint — free, email-only",
  description:
    "14 days. 14 actions. One per day. By Day 14 you will have done more selling than in the last six months — or proven to yourself that you will not. Free, email-only, no card, no course.",
  alternates: { canonical: "/challenge" },
  openGraph: {
    title: "The 14-Day First-Customer Sprint — Unlock SaaS",
    description:
      "14 days. 14 actions. One per day. The work most founders skip between launch and revenue, broken into one-email-a-day. Free.",
    url: "/challenge",
    type: "website",
  },
};

/**
 * 14-Day First-Customer Sprint Challenge — opt-in landing page.
 *
 * Strategy: DotCom Secrets Secret #19 (Challenge Funnel), front-end version.
 * The same 14-day scaffold also lives inside the $49 Playbook as the Step 6
 * accelerator bonus. Front-end Challenge = free, email-only. Back-end Sprint
 * (inside $49) = engine-wired, Stripe-verified, baked into Playbook Step 6.
 *
 * Voice rule: Reluctant Hero throughout. Workbook 01 §6 Beat 1 + Beat 3
 * story references. No fake scarcity. No countdown timers. The only CTA is
 * "Start the 14-Day Sprint" — earned, free, public.
 *
 * Position in the value ladder (per workbook 02 + workbook 04 §10):
 *   Funnel hub → Challenge (free, 14-day process) → $1 Starter (Day 14 ramp)
 *                                                → OTO → $49 Playbook
 */
export default function ChallengePage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/SEO) — BreadcrumbList. Mirrors the visible "Want
          the one-shot diagnosis instead?" / "Skip to the $1 Starter"
          links in the footer block: Home → Challenge as the two-deep trail. */}
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "The 14-Day First-Customer Sprint", url: "https://unlocksaas.com/challenge" },
        ]}
      />
      <AbExposureBeacon />
      <div className="max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          The 14-Day Sprint
        </Badge>

        {/* Hero hook — Reluctant Hero confession + the contract */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          14 days. 14 actions. One per day. By Day 14 you will have done more
          selling than in the last six months. Or you will have proven to
          yourself that you will not.
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          I am a marketer. I have never written a line of production code. In
          2026, Lovable and Claude opened the door and I shipped real AI
          products in weeks, watched them flatline in Stripe, and ran from the
          truth into SEO tactics for almost a year. The Sprint is the work I
          should have been doing instead. It is free. It is one email per day.
          The only upgrade arrives on Day 14, and it is the one you earn the
          right to see.
        </p>

        <Separator className="my-8" />

        {/* Star Story Solution — abbreviated for a lead funnel */}
        <section className="space-y-6 mb-12">
          <div>
            <h2 className="text-xl font-bold mb-3">What the Sprint actually does</h2>
            <p className="text-muted-foreground leading-relaxed">
              Across 14 days, you do the work most founders quietly skip
              between launch and revenue. Naming one real customer. Writing one
              real promise. Defending the price. Building a real list of twenty
              specific people. Sending twenty real messages across two waves.
              Booking one real conversation. Each day asks for one small action
              and one reply, and the replies are what keep the Sprint honest.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Day 1–3:</strong> Name the WHO. Find one quote in
                    their words. Stop refreshing Stripe.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Day 4–6:</strong> Write the one promise, defend the
                    10x value math, write the refund policy.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Day 7–8:</strong> Pick 20 specific people across 3
                    congregations. Write the message.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Day 9–12:</strong> Send to the first 5. Triage the
                    replies. Send to the next 10 in a different community.
                    Send to the hard five you have been avoiding.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Day 13:</strong> Book one real live conversation.
                    15 minutes. Phone or video.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Day 14:</strong> Open Stripe. Read the number. See
                    the door you earned the right to open.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* The honest contract — what this isn't */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>What this is not:</strong> a course. A framework PDF. A
              video drip. There is no homework grading. No community to join.
              No live calls. Just one short email per day, written by me, with
              one specific action that takes less than 30 minutes. You reply
              with what you did, or what you did not. I read every reply.
            </p>
          </CardContent>
        </Card>

        {/* Polarity AGAINST line */}
        <p className="text-sm text-muted-foreground italic mb-8">
          This is not &ldquo;validate your idea&rdquo; advice. You already built
          the thing. This is the work that comes after, broken into 14 days so
          you can stop pretending you will get to it tomorrow.
        </p>

        <Separator className="my-8" />

        {/* The opt-in */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Start tomorrow morning.
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Day 0 arrives in your inbox within a minute of submitting. Day 1
            lands tomorrow at the same time.
          </p>
          <div className="max-w-md mx-auto">
            <Suspense fallback={null}>
              <ChallengeForm source="challenge_optin" />
            </Suspense>
          </div>
        </section>

        {/* Footer link back to the rest of the funnel */}
        <p className="text-xs text-muted-foreground text-center">
          Want the one-shot diagnosis instead?{" "}
          <Link
            href="/diagnostic"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Try the Free Diagnostic
          </Link>
          . Already convinced?{" "}
          <Link
            href="/starter"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Skip to the $1 Starter
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
