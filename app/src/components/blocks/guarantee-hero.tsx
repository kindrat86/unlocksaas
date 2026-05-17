/**
 * Guarantee Hero — Brunson polarity move (Funnel Hacker's Cookbook §4).
 *
 * The cookbook line is explicit: "The 60-day Stripe-verified guarantee is our
 * polarity move — no competitor in this hack list offers it. It is the single
 * highest-leverage source of differentiation we have, and it deserves the
 * visual real estate that ShipFast gives to 'spots left' and Nomads.com gives
 * to its media bar."
 *
 * Before this block, the guarantee was buried as an italic footnote under the
 * Before/After. This block elevates it to a dedicated section — but in the
 * restrained Reluctant Hero aesthetic of the rest of the app, not the loud
 * funnel-builder treatment.
 *
 * Composition:
 *   - Quiet shield icon
 *   - Headline naming the guarantee
 *   - Four numbered conditions explaining what fires the refund
 *   - Closing line: this is code, not an inbox
 */
import { ShieldCheck, Zap, FileCheck, Wallet, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REFUND_CONDITIONS = [
  {
    icon: FileCheck,
    title: "You complete Steps 1–5 inside the Playbook",
    body: "Dream customer, offer, proof, story, outreach — not theoretical. The engine timestamps each one as you finish.",
  },
  {
    icon: Zap,
    title: "You log 20 outreach actions inside the tool",
    body: "Not screenshots, not promises. The tool counts the sends and the tracked replies. 20 is the floor.",
  },
  {
    icon: Wallet,
    title: "Stripe still shows zero paying customers at Day 60",
    body: "The webhook reads your own connected Stripe account. There is no honor system. There is no support ticket.",
  },
  {
    icon: RefreshCw,
    title: "Both monthly payments come back to the card you paid with",
    body: "$98 refunded automatically. The code fires the refund. You don't ask for it. You don't justify it.",
  },
];

export function GuaranteeHero() {
  return (
    <section className="bg-accent/40 border-y border-border">
      <div className="py-16 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
        <div className="flex justify-center mb-5">
          <div className="h-14 w-14 rounded-full bg-primary/10 grid place-items-center text-primary">
            <ShieldCheck className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
          </div>
        </div>
        <Badge variant="secondary" className="mb-4">
          The polarity move
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
          The 60-day Stripe-verified guarantee.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          No course on this planet refunds you when their system fails to
          produce a customer. We do — and the refund is enforced by code, not
          by an inbox.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REFUND_CONDITIONS.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={c.title}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-primary">
                    <Icon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Condition #{i + 1}
                    </p>
                    <h3 className="text-base font-semibold leading-tight mb-2">
                      {c.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground italic text-center mt-8 max-w-xl mx-auto leading-relaxed">
        Pre-revenue is the exact case the guarantee was written for. $98 capped
        exposure, two coffees a week, refunded by webhook if the line stays
        flat.
      </p>
      </div>
    </section>
  );
}
