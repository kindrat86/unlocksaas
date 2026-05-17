/**
 * Founding Builder – honest scarcity (Brunson 10X Secrets §3 Category 4,
 * adapted for a skeptic avatar).
 *
 * Brunson's Category 4 mini-close (urgency / scarcity) is the default for cold
 * traffic. The /playbook-sales page originally rejected Category 4 because
 * fake "3 seats left" counters destroy trust with the Marco avatar.
 *
 * This block is the HONEST Category 4 – three real, defensible levers:
 *
 *   1. Founding-price lock. The first 100 Playbook subscribers pay $49/mo
 *      forever. After 100, monthly price moves to $79. No "limited-time
 *      discount" theatre – just: the first 100 builders take a known risk on
 *      an unproven product, and the price reflects that.
 *   2. Personal-capacity ceiling. Maryan reads every Step 1 dream-customer
 *      output in the first 90 days post-launch. That work has a ceiling, and
 *      the ceiling is named in writing.
 *   3. The 60-day clock starts the day you join. Every Tuesday you wait is
 *      another Tuesday of the refresh-tweak-close ritual. Cost-of-waiting
 *      framing, not fake spots-remaining.
 *
 * Visual treatment: restrained shadcn tokens – no countdown timer, no yellow
 * attention bar, no neon outlines. Same visual family as GuaranteeHero.
 *
 * Props:
 *   - tone="full"    – the homepage / $49 page variant (3 levers)
 *   - tone="starter" – the $1 page variant (the unboxing-funnel slice of the
 *     same logic: founding-price applies on the upgrade, not on the $1, but
 *     the calendar argument and the personal-capacity argument both still
 *     fire on the Starter)
 */
import { Clock, Users, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Lever = {
  icon: typeof Clock;
  eyebrow: string;
  title: string;
  body: string;
};

const FULL_LEVERS: readonly Lever[] = [
  {
    icon: Users,
    eyebrow: "Founding-price lock",
    title: "First 100 builders. $49/mo forever. Then it moves to $79.",
    body: "The first 100 founders inside the Playbook pay $49/mo for as long as they keep the subscription. After the 100th, the public price moves to $79/mo. Not a discount countdown. Not a fake sale. The honest exchange: you take a known risk on an unproven product, and the price reflects that – forever.",
  },
  {
    icon: TrendingDown,
    eyebrow: "Personal-capacity ceiling",
    title: "I read every Step 1 output in the first 90 days. That has a ceiling.",
    body: "The engine does the framework work, but for the first 90 days post-launch I personally read every Step 1 dream-customer output and reply with a one-paragraph pushback if the engine missed something. That has a real ceiling – my own waking hours. Once the queue fills, the door closes until the next batch opens.",
  },
  {
    icon: Clock,
    eyebrow: "The 60-day clock",
    title: "Every Tuesday you wait is another Tuesday with a flat Stripe line.",
    body: "The 60-day guarantee window starts the day you join. Joining today means the refund clause is judged on a date you can write in your calendar right now. Waiting until next month means another month of the refresh-tweak-close ritual you already know costs more than two coffees a week.",
  },
];

const STARTER_LEVERS: readonly Lever[] = [
  {
    icon: Users,
    eyebrow: "Founding-price lock (on the upgrade)",
    title: "The $1 stays $1. The upgrade is $49/mo until the first 100.",
    body: "The Starter is one dollar today and one dollar forever. The decision the next page asks – upgrade to the full Playbook for $49/mo – is locked at that price for the first 100 builders only. After the 100th subscription, the monthly price moves to $79. You finish Steps 1 and 2 either way; the founding rate is the part with a ceiling.",
  },
  {
    icon: TrendingDown,
    eyebrow: "Personal-capacity ceiling",
    title: "I read every Step 1 output. That has a ceiling.",
    body: "For the first 90 days I read every Step 1 dream-customer output – the work the $1 buys – and reply by hand if the engine missed something. That ceiling is my own waking hours. Once the queue fills the door closes until the next batch.",
  },
  {
    icon: Clock,
    eyebrow: "The cost of one more month of avoidance",
    title: "Another month of refreshing Stripe is not free. It is the most expensive month you have.",
    body: "The dollar is not the question. The question is whether you spend the next thirty evenings opening Stripe to the same flat line, or whether you spend ninety minutes this week pinning a real customer and writing a real offer. That swap is the only honest urgency on this page.",
  },
];

export function FoundingBuilder({ tone = "full" }: { tone?: "full" | "starter" }) {
  const levers = tone === "starter" ? STARTER_LEVERS : FULL_LEVERS;

  return (
    <section className="bg-muted/40 border-y border-border">
      <div className="py-14 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            Honest urgency
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
            There is no countdown timer. There is still a reason to decide today.
          </h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Three honest levers. No fake scarcity. No &ldquo;only 3 seats
            left.&rdquo; What is true: the first hundred founders pay one
            price forever, my reading capacity has a ceiling, and every
            Tuesday you postpone is a Tuesday you already know how to
            spend.
          </p>
        </div>

        <div className="space-y-4">
          {levers.map((lever, i) => {
            const Icon = lever.icon;
            return (
              <Card key={lever.title}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary">
                      <Icon
                        className="h-5 w-5"
                        strokeWidth={2.25}
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                        Lever #{i + 1} – {lever.eyebrow}
                      </p>
                      <h3 className="text-base sm:text-lg font-semibold leading-snug mb-2">
                        {lever.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {lever.body}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground italic text-center mt-8 max-w-xl mx-auto leading-relaxed">
          If any of this reads like manufactured urgency, walk. The $98 cap and
          the code-enforced refund are still on the table the day you do come
          back. The only thing that changes is whether you are inside the first
          100 or not.
        </p>
      </div>
    </section>
  );
}
