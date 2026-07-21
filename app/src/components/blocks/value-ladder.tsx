/**
 * Value Ladder — Brunson DotCom Secrets Chapter 4 (The Secret of the Value Ladder).
 *
 * Brunson says: "You must have a value ladder. If you don't have one, you don't
 * have a business." The homepage describes the offers (free diagnostic, $1 starter,
 * $49 playbook, $297 lifetime) but never arranges them as a VISIBLE ladder the
 * visitor can trace with their eyes.
 *
 * A visual value ladder serves four jobs:
 *   1. Shows the progression from low-commitment to high-commitment.
 *   2. Anchors each rung against what the visitor gets and what it would cost
 *      separately (the "Stack" logic repurposed for the ladder itself).
 *   3. Creates an implicit "climb path" — the visitor sees where they will land
 *      after each step, reducing the uncertainty that kills the $1 Starter purchase.
 *   4. Demonstrates that the $49/mo Playbook is the NORMAL rung, not a premium
 *      upsell — the ladder puts it in context.
 *
 * Placement: after the Stack Slide (the offer reveal) but before the Guarantee,
 * so the visitor sees the path upward before they see the refund backstop.
 *
 * 2026-07-14 conversion audit: the homepage had ZERO links to /challenge
 * (the free 14-Day Sprint — strongest free nurture asset) and ZERO links to
 * /apply (the high-ticket rung). Both now sit in the ladder: the free Sprint
 * as the habit rung after the diagnostic, the Done-With-You Sprint as the
 * application-only top rung. Prices quoted verbatim from /challenge (free)
 * and /apply ($997 / $1,997) — no invented numbers.
 *
 * Voice: Reluctant Hero, factual stack values, no fabricated prices.
 */
import Link from "next/link";
import {
  CalendarCheck,
  DollarSign,
  Zap,
  Crown,
  Infinity,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LadderRung = {
  label: string;
  price: string;
  oneLiner: string;
  whatYouGet: string[];
  equivalentValue: string;
  cta: string;
  href: string;
  icon: React.ReactNode;
  highlighted?: boolean;
};

const LADDER: LadderRung[] = [
  {
    label: "Free Diagnosis",
    price: "$0",
    oneLiner: "Know why the line is flat in 90 seconds.",
    whatYouGet: [
      "Labels your problem (Wrong Person / Weak Offer / Weak Belief).",
      "Names the single next move that fixes the labeled problem.",
      "No email gate on the URL paste.",
    ],
    equivalentValue: "Comparable to a $147 audit",
    cta: "Run the diagnosis",
    href: "/diagnostic",
    icon: <Zap className="h-4 w-4" />,
  },
  {
    label: "14-Day Sprint",
    price: "$0",
    oneLiner: "Fourteen days, fourteen actions, one per day.",
    whatYouGet: [
      "One email a day naming the single selling action for that day.",
      "The work most founders skip between launch and revenue.",
      "No card, no course — email only.",
    ],
    equivalentValue: "Free, email-only",
    cta: "Join the free Sprint",
    href: "/challenge",
    icon: <CalendarCheck className="h-4 w-4" />,
  },
  {
    label: "Starter",
    price: "$1",
    oneLiner: "Pin one real customer and write one real offer.",
    whatYouGet: [
      "Step 1 — Dream Customer (pushback on vague answers).",
      "Step 2 — Offer Builder (rejects features masquerading as promises).",
      "Stripe-verified completion tracking.",
    ],
    equivalentValue: "Comparable to a $249 workshop",
    cta: "Start for $1",
    href: "/starter",
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: "Core Playbook",
    price: "$49 / mo",
    oneLiner: "The full seven-step engine. The guarantee. The room.",
    whatYouGet: [
      "All 7 Playbook steps with engine pushback at each gate.",
      "The Outreach Room (live AI-moderated working space).",
      "14-Day First-Customer Sprint (one tracked action per day).",
      "60-day Stripe-verified guarantee.",
    ],
    equivalentValue: "$4,900 in equivalent courses",
    cta: "Start the Playbook",
    href: "/playbook-sales",
    icon: <Crown className="h-4 w-4" />,
    highlighted: true,
  },
  {
    label: "Lifetime Builders",
    price: "$297",
    oneLiner: "The whole stack, forever, one payment.",
    whatYouGet: [
      "Everything in Core Playbook, no monthly payment.",
      "Lifetime access to the Outreach Room and all future upgrades.",
      "Priority queue for founder coaching sessions.",
    ],
    equivalentValue: "$8,700 vs lifetime subscription",
    cta: "Go lifetime",
    href: "/oto/lifetime",
    icon: <Infinity className="h-4 w-4" />,
  },
  {
    label: "Done-With-You Sprint",
    price: "$997+",
    oneLiner: "Thirty days working the system with Maryan. Application only.",
    whatYouGet: [
      "The full Playbook run WITH you, not handed to you.",
      "$997 self-paced or $1,997 with a 1-hour 1:1.",
      "Six honest application questions — no pitch on the call.",
    ],
    equivalentValue: "Application-gated",
    cta: "Apply for the Sprint",
    href: "/apply",
    icon: <Users className="h-4 w-4" />,
  },
];

import { cacheLife } from "next/cache";

export async function ValueLadder() {
  "use cache";
  cacheLife("days");
  return (
    <section
      aria-labelledby="value-ladder-heading"
      className="py-14 sm:py-20 px-4 sm:px-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            DotCom Secrets Chapter 4 — The Value Ladder
          </p>
          <h2
            id="value-ladder-heading"
            className="text-2xl sm:text-3xl font-bold leading-tight text-balance"
          >
            Six rungs. Each one earns the next.
          </h2>
          <p className="text-sm text-muted-foreground italic leading-relaxed mt-3 max-w-xl mx-auto">
            The diagnostic labels the problem. The free Sprint builds the daily
            habit. The Starter names the person and the promise. The Core
            Playbook delivers the customer. The lifetime option removes the
            clock. The Done-With-You Sprint is for founders who want Maryan in
            the room. You climb one rung at a time.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div
            aria-hidden="true"
            className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/20 to-primary/10 hidden sm:block"
          />

          <div className="space-y-6">
            {LADDER.map((rung, idx) => (
              <div key={rung.label} className={`relative ${idx < LADDER.length - 1 ? "pb-2" : ""}`}>
                <div className={`flex items-start gap-4 sm:gap-6 ${rung.highlighted ? "scale-[1.02]" : ""}`}>
                  {/* Number + connector */}
                  <div
                    aria-hidden="true"
                    className={`shrink-0 relative z-10 h-14 w-14 rounded-full border-2 grid place-items-center ${
                      rung.highlighted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {rung.icon}
                  </div>

                  {/* Content card */}
                  <Card
                    className={`flex-1 ${
                      rung.highlighted
                        ? "border-primary/40 shadow-sm"
                        : "border-border/60"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {rung.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {rung.oneLiner}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xl font-bold ${rung.highlighted ? "text-primary" : "text-foreground"}`}>
                            {rung.price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {rung.equivalentValue}
                          </p>
                        </div>
                      </div>

                      {/* What you get */}
                      <ul className="space-y-1.5 mb-4">
                        {rung.whatYouGet.map((item) => (
                          <li
                            key={item}
                            className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2"
                          >
                            <span className="shrink-0 mt-0.5" aria-hidden="true">
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="text-primary/60"
                              >
                                <polyline points="2,6 5,9 10,3" />
                              </svg>
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Button
                        asChild
                        variant={rung.highlighted ? "default" : "outline"}
                        size="sm"
                      >
                        <Link href={rung.href}>{rung.cta}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic text-center mt-8 max-w-lg mx-auto leading-relaxed">
          The ladder is honest. Each rung is a real piece of software, not a
          pre-order or a promise. The work is done; the doors are open.
        </p>
      </div>
    </section>
  );
}
