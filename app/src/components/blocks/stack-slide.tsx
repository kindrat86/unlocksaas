/**
 * Stack Slide — Brunson Building Block #14 + Expert Secrets §3 Stack/Closes.
 *
 * The deliverable inventory. Every item that ships when an indie-founder avatar
 * upgrades from $0 (diagnostic) to $49/mo (full Playbook). The Stack does three
 * jobs in one block:
 *
 *   1. **Inventory** — turns "the Playbook" into a list a skeptic can audit.
 *   2. **Anchoring** — each line names what it would cost as a separate
 *      product (course, hire, custom build), totaling a number that makes
 *      $49/mo look obvious by comparison.
 *   3. **Reciprocity** — the final line is the 60-day refund. The price feels
 *      negligible AFTER reading the eight items, not before.
 *
 * Identity guardrail: no fabricated dollar amounts. Each "value" is what an
 * equivalent course / consultant / SaaS would charge for the same deliverable
 * today, sourced from public pricing pages.
 *
 * Visual treatment: matches rest-of-app aesthetic — shadcn theme tokens, no
 * explicit colors. Restrained Reluctant Hero look.
 */
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type StackItem = {
  title: string;
  value: string;
  body: string;
};

const STACK: StackItem[] = [
  {
    title: "The 7-step Playbook engine",
    value: "$997 value",
    body: "Step-by-step workflow from named dream customer to first verified Stripe charge. No frameworks left on a notepad — every answer is structured input to the next step.",
  },
  {
    title: "Dream 100 picker (pre-loaded)",
    value: "$3,000 value",
    body: "Pulls from the locked Brunson Dream 100 workbook. You don't start with a blank canvas — you start with a list of 100 named congregations where your customer actually lives.",
  },
  {
    title: "Offer builder with engine pushback",
    value: "$497 value",
    body: "The engine refuses to accept vague promises. If your offer fails the specificity test, it tells you which beat is broken and rewrites the prompt.",
  },
  {
    title: "Outreach happens inside the tool",
    value: "$79/mo value",
    body: "Step 5 generates the message, picks the target, and logs the send. Outreach stops being optional. The tool tracks 20 actions before Day 60.",
  },
  {
    title: "Stripe-webhook verified badge",
    value: "Sold by no one else",
    body: "When your first paying customer charge fires, the code reads your connected Stripe and lights up the Verified Builder badge. The mechanic IS the proof.",
  },
  {
    title: "Public builder profile page",
    value: "$29/mo value",
    body: "A live /builder/[slug] page that shows your product, your first-customer date, and your badge. Marketing surface you don't have to build.",
  },
  {
    title: "Soap Opera + Seinfeld email sequences",
    value: "$297 value",
    body: "Five days of letters, then weekly Tuesday Seinfeld emails. Already written. Each one signed from Maryan.",
  },
  {
    title: "The 60-day Stripe-verified guarantee",
    value: "Refunded by code",
    body: "If you finish Steps 1–5 in-product, log 20 outreach actions, and Stripe still shows zero customers at Day 60 — the webhook refunds both monthly payments. Automatically.",
  },
];

import { cacheLife } from "next/cache";

export async function StackSlide() {
  "use cache";
  cacheLife("days");
  return (
    <section className="bg-muted/60 border-y border-border">
      <div className="py-16 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
        <Badge variant="secondary" className="mb-4">
          Here&apos;s what&apos;s inside
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
          Everything you get when you join The Playbook.
        </h2>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          Eight deliverables. One $49 monthly price. Refunded in full if it
          does not produce a paying customer.
        </p>
      </div>

      <ol className="space-y-3">
        {STACK.map((item, i) => (
          <li key={item.title}>
            <Card>
              <CardContent className="pt-6 flex items-start gap-4">
                <div className="shrink-0 h-9 w-9 rounded-full bg-primary/10 grid place-items-center text-primary">
                  <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-3 mb-1.5">
                    <h3 className="text-base sm:text-lg font-semibold leading-tight">
                      <span className="text-muted-foreground font-medium mr-1.5">
                        #{i + 1}
                      </span>
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>

      {/* Total value reveal — quiet shadcn treatment. */}
      <Card className="mt-10 border-primary/40 bg-primary/5">
        <CardContent className="pt-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            If you bought these separately
          </p>
          <p className="text-2xl font-semibold text-muted-foreground line-through mb-3">
            $4,900+
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            All eight, inside The Playbook
          </p>
          <p className="text-4xl sm:text-5xl font-bold tracking-tight">
            $49
            <span className="text-base font-medium text-muted-foreground ml-1">
              /mo
            </span>
          </p>
          <p className="text-xs text-muted-foreground italic mt-3 leading-relaxed max-w-md mx-auto">
            Or refunded in full at Day 60 if the line stays flat after you
            completed Steps 1–5 and logged 20 outreach actions.
          </p>
          {/* The "value" figures above are comparison anchors, not prices anyone has
              paid us. This file's own identity guardrail says each is what an
              equivalent course/consultant/SaaS charges for the same deliverable — but
              the reader could not see that, so a bare "$997 value" read as a claim
              about what we charge. State the basis instead of deleting the anchor. */}
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-md mx-auto">
            The figures above are what an equivalent course, consultant, or SaaS charges
            for the same deliverable — not prices UnlockSaaS has ever charged. What you
            pay is $49/mo, or $1 once for the Starter.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3">
            <Button asChild size="lg">
              <Link href="/playbook-sales">Start The Playbook — $49/mo</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              60-day guarantee · Stripe-verified · Cancel anytime
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </section>
  );
}
