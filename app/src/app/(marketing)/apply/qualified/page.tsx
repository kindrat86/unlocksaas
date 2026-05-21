import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// noindex – this is a post-submit destination, not a SERP target.
export const metadata: Metadata = {
  title: "Your application is in – book the 15-minute call",
  description:
    "Pick a 15-minute slot on the Calendly below. No pitch, no slides – it's a real conversation about your numbers and your block.",
  robots: { index: false, follow: false },
};

/**
 * Thank-you destination for qualified Sprint applications. The Calendly URL
 * is env-gated: until CALENDLY_APPLY_URL is set in Vercel, the page shows
 * the awaiting-link copy instead of the embed. This keeps the funnel
 * shippable before the Calendly is provisioned.
 */
export default function QualifiedPage() {
  const calendlyUrl = process.env.CALENDLY_APPLY_URL ?? "";
  const hasCalendly =
    calendlyUrl.length > 0 && /^https:\/\/calendly\.com\//i.test(calendlyUrl);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          Application received
        </Badge>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          You passed the gate. Pick a 15-minute slot below.
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your six answers told me you are exactly the kind of founder this
          Sprint is for. The call is 15 minutes. No pitch deck, no slides.
          Just a real conversation about your numbers, your blocker, and
          whether the Sprint is the right next step. If it is not, I tell you
          that on the call.
        </p>

        <Separator className="my-8" />

        {hasCalendly ? (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">
              Book the 15-minute discovery call
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pick the soonest slot that works. Calendly will email both of us
              a confirmation with the meeting link.
            </p>
            <Card className="overflow-hidden">
              <iframe
                src={calendlyUrl}
                title="Book a 15-minute Sprint discovery call"
                className="w-full"
                style={{ minHeight: "680px", border: "none" }}
                loading="lazy"
              />
            </Card>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Calendly not loading?{" "}
              <a
                href={calendlyUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Open it in a new tab
              </a>
              .
            </p>
          </section>
        ) : (
          <Card className="mb-12 border-primary/30">
            <CardContent className="pt-6">
              <h3 className="text-base font-semibold mb-2">
                Calendar link arriving by email
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You should already have an auto-reply from
                maryan@unlocksaas.com confirming your application. I send the
                Calendly link by hand within one business day so I can match
                your timezone to the right block on my calendar. If it has
                been more than a business day, reply to that auto-reply – the
                inbox is real and so am I.
              </p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* What happens on the call */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">What happens on the call</h2>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li>
              – Minutes 0–5: I read your application back to you. You correct
              anything I got wrong.
            </li>
            <li>
              – Minutes 5–12: We look at your real numbers together. Stripe,
              traffic, inbox. The thing you have been avoiding.
            </li>
            <li>
              – Minutes 12–15: I tell you whether the Sprint is the right
              next step, and which tier. If it is not, I tell you that too,
              and I tell you the one thing to do this week instead.
            </li>
          </ul>
        </section>

        {/* Polarity */}
        <p className="text-sm text-muted-foreground italic mb-10">
          No pitch deck. No &ldquo;limited time pricing.&rdquo; No closing
          sequence. The Sprint is the same price after the call as before. The
          only thing the call decides is whether we work together.
        </p>

        <p className="text-xs text-muted-foreground text-center">
          Question between now and the call?{" "}
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
