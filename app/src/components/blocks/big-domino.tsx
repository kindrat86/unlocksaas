/**
 * Big Domino — Brunson Expert Secrets §3 "Stack and Closes" + 10X Secrets
 * Big Domino Statement.
 *
 * Brunson canon: every long-form sales surface must declare the ONE thing the
 * visitor has to believe. If they accept the big domino, every other objection
 * — price, time, "will this work for me", "what about my niche" — falls.
 *
 * For Unlock SaaS the big domino is:
 *
 *   "A code-enforced 60-day playbook can produce your first paying Stripe
 *    charge in 60 days."
 *
 * If Marco (the avatar) accepts that, $49/mo capped at $98 with a webhook
 * refund is rational. If he doesn't, no amount of testimonials, FAQs, or stack
 * anchoring will close him.
 *
 * Placement: directly under the hero, before any proof. The big domino is the
 * frame every following section either reinforces or defends. Without it the
 * rest of the page is "interesting reading"; with it the rest of the page is
 * evidence.
 *
 * Visual treatment: matches the GuaranteeHero icon-in-circle anchor pattern.
 * Quiet, restrained, shadcn tokens only. No script fonts, no neon outlines.
 */
import { Target } from "lucide-react";

export function BigDomino() {
  return (
    <section
      aria-labelledby="big-domino-heading"
      className="py-14 sm:py-20 px-4 sm:px-6"
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 grid place-items-center text-primary">
            <Target className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
        <p
          id="big-domino-heading"
          className="text-xs uppercase tracking-widest text-muted-foreground mb-4"
        >
          The one thing this page has to prove
        </p>
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug tracking-tight text-balance">
          If a playbook{" "}
          <span className="text-muted-foreground">– refunded in code –</span>{" "}
          can produce your first paying Stripe charge in 60 days, every other
          question stops mattering.
        </p>
        <p className="text-sm text-muted-foreground italic mt-6 max-w-xl mx-auto leading-relaxed">
          Everything below this line is either evidence for that claim or
          honest objection-handling against it.
        </p>
      </div>
    </section>
  );
}
