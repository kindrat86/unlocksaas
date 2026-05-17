import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";

/**
 * Cold traffic bridge page.
 *
 * Workbook 10 §4: cold traffic NEVER goes straight to the $49 sales page.
 * It lands here. Hook #3 (pain mirror) above the fold; one sentence of
 * Reluctant Hero context; one CTA to the Free Diagnostic.
 *
 * Used as the destination for solo ads, sponsored content, and cold
 * social posts that need their own pre-frame before the diagnostic.
 */
export default function ColdTrafficBridge() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <AbExposureBeacon />
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          For founders who already shipped
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
          You shipped a real product. The line in Stripe is flat. You have
          been told the answer is more building, more traffic, or a better
          course. None of those produce your first paying customer.
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          The work that does is one thing, done in one order: name one real
          person, write one real promise, sell it before it feels ready.
          The page on the other side of this button reads your live product
          page and tells you which of the three is actually broken.
        </p>

        <p className="text-sm text-muted-foreground italic mb-8">
          — Maryan, marketer, non-engineer, built a dozen AI products that
          nobody paid for. Then I figured out why.
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-semibold">
              The diagnostic is free. No card. No bait-and-switch.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>— Two fields: your email + your product URL.</li>
              <li>— Labelled diagnosis (Wrong Person / Weak Offer / Weak Belief).</li>
              <li>— One concrete next step. One short email a day for five days.</li>
              <li>— No course, no coach, no $2,000 community.</li>
            </ul>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/diagnostic?from=bridge">Get my free diagnosis</Link>
        </Button>

        <Separator className="my-10" />

        <p className="text-xs text-muted-foreground italic">
          Why this page exists: cold traffic does not buy a $49/mo
          subscription from a single ad. It buys a labelled diagnosis from
          someone who sounds like a founder, not a guru. That is what is on
          the other side of this button.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Already know what is broken?{" "}
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
