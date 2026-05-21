import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// noindex – this is a post-submit destination, not a SERP target.
export const metadata: Metadata = {
  title: "Your application is in – here is the honest path",
  description:
    "The Sprint is not the right starting point right now. Two honest options that fit better – the $1 Starter or the $49/mo Playbook.",
  robots: { index: false, follow: false },
};

/**
 * Thank-you destination for not-yet-qualified Sprint applications.
 *
 * The goal here is NOT to soften the rejection. It is to route the visitor
 * back to the rung they actually need – $1 Starter for not-yet-committed
 * founders, $49/mo Playbook for ones who have the budget but no urgency
 * proof. The auto-reply email already said this; this page mirrors it so
 * the visitor sees the same path on the screen they are looking at.
 */
export default function ApplyNotYetPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          Application received
        </Badge>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          Thanks for applying. I am going to be honest, which is the only way
          this works.
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          The Sprint is not the right starting point for you right now. Not
          because of who you are. Because of where you are. The Sprint
          assumes you have an offer and a price you can defend and the
          budget and urgency to compress 90 days of selling into 30. One of
          those is not yet true today, and paying $997 or $1,997 before it is
          would be me taking your money.
        </p>

        <p className="text-muted-foreground mb-10 leading-relaxed">
          Here is the path that actually fits:
        </p>

        <Separator className="my-8" />

        {/* Option 1: $1 Starter */}
        <Card className="mb-6 border-primary/30">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Option 1 – if you have not yet locked the avatar
            </p>
            <h2 className="text-xl font-bold mb-3">
              The $1 Starter
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The first two steps of the Playbook plus the dream-customer
              module. One dollar. No upsell trickery. By the end of Step 2
              you will know who your one paying customer is and the one
              promise you make to them. If after that you still believe the
              Sprint fits, apply again – I will see the second application.
            </p>
            <Link
              href="/starter"
              className="text-sm font-semibold underline underline-offset-4 hover:text-foreground"
            >
              Start with the $1 Starter →
            </Link>
          </CardContent>
        </Card>

        {/* Option 2: $49/mo Playbook */}
        <Card className="mb-10">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Option 2 – if you have the budget but not the urgency proof
            </p>
            <h2 className="text-xl font-bold mb-3">
              The $49/mo Playbook
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              The full seven-step system. 60-day Stripe-verified guarantee –
              two months back if your first paying customer is not real by
              Day 60. Same engine as the Sprint, same Reluctant Hero voice.
              Slower lane, lower commitment.
            </p>
            <Link
              href="/playbook-sales"
              className="text-sm font-semibold underline underline-offset-4 hover:text-foreground"
            >
              Join the $49/mo Playbook →
            </Link>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Re-apply later */}
        <Card className="mb-10 border-muted">
          <CardContent className="pt-6">
            <h3 className="text-base font-semibold mb-2">
              When to apply for the Sprint again
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you have a first paying customer in Stripe, the budget,
              and a real reason that next month is too late. Apply again
              then. The form is the same form. The decision will be
              different.
            </p>
          </CardContent>
        </Card>

        {/* Polarity */}
        <p className="text-sm text-muted-foreground italic mb-10">
          I would rather route you to a $1 rung today and have you back at
          the Sprint in three months than take $997 from you this week and
          watch us both lose the work.
        </p>

        <p className="text-xs text-muted-foreground text-center">
          Want to talk it through anyway?{" "}
          <Link
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Reply to the auto-reply
          </Link>
          . I read every message myself.
        </p>
      </div>
    </div>
  );
}
