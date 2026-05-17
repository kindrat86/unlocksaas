/**
 * Pricing Breakdown — Brunson Building Block #18.
 *
 * The Stack made explicit: workbook 01 §2 offer_stack + workbook 07 §3
 * stack slides 16-30. Each line gets its value. Total is summed. Price
 * sits below total. The 10.1x ratio is the "values_caveat" math — defensible,
 * not fabricated.
 *
 * No fake "limited time" pricing. No fabricated "regular price". This is
 * the value of the deliverables when priced as standalone things; the offer
 * compresses them into $49/mo. Workbook 07 §3.
 */
import { Card, CardContent } from "@/components/ui/card";

type StackItem = {
  name: string;
  description: string;
  value: string;
};

const STACK: StackItem[] = [
  {
    name: "The Playbook (7-step system)",
    description:
      "Engine-led conversation. Pushes back on vague answers. Produces a real dream customer, offer, outreach, and a Stripe-verified customer.",
    value: "$259 / mo",
  },
  {
    name: "Bonus 1 — 14-Day First-Customer Sprint",
    description:
      "Breaks Step 5 outreach into one tracked action per day for 14 days. Fights the Mountain.",
    value: "$89",
  },
  {
    name: "Bonus 2 — The Outreach Room",
    description:
      "Live room of post-launch pre-revenue founders doing the work together. AI-moderated.",
    value: "$79 / mo",
  },
  {
    name: "Bonus 3 — The Outreach Script Kit",
    description:
      "Done-for-you messages and reply scripts per channel. Fights the blank page.",
    value: "$69",
  },
];

export function PricingBreakdown() {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Stack
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          $496 of work compressed into one $49/mo line.
        </h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ul className="space-y-5">
            {STACK.map((item) => (
              <li
                key={item.name}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 md:gap-6 pb-5 border-b border-border/40 last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold leading-snug">{item.name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
                <p className="text-sm font-mono text-foreground md:text-right whitespace-nowrap pt-1">
                  {item.value}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-border space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Total value</span>
              <span className="text-sm font-mono">$496</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="font-semibold">Your price</span>
              <span className="text-2xl font-bold font-mono text-primary">
                $49 / mo
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-muted-foreground">Value-to-price ratio</span>
              <span className="text-sm font-mono text-muted-foreground">10.1x</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic mt-6 leading-relaxed">
            Cap on your downside: $98 (two monthly payments). If the Playbook does not
            produce a verified Stripe charge in 60 days AND you completed the in-product
            milestones, you get the $98 back. The remedy is enforced by code, not by promise.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
