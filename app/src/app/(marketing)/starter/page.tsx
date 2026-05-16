"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

export default function StarterSalesPage() {
  async function handleCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceType: "starter" }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Hero Hook */}
        <Badge variant="secondary" className="mb-4">
          The $1 Starter
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          Finish your dream customer and your offer this week. For one dollar.
        </h1>

        {/* Sub-headline: AC three-line about opener */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          I&apos;m a marketer. I have never written a line of production code.
          In 2026, Lovable and Claude opened the door and I shipped real AI
          products in weeks, watched them flatline in Stripe, and ran from the
          truth into SEO tactics for almost a year. What broke me out was sitting
          with more than ten other founders telling my own story back to me. So I
          built the machine I wish someone had handed me.
        </p>

        <Separator className="my-8" />

        {/* Star Story Solution */}
        <section className="space-y-6 mb-12">
          {/* The Star */}
          <div>
            <h2 className="text-xl font-bold mb-3">The Destination</h2>
            <p className="text-muted-foreground leading-relaxed">
              In sixty days, with the same product you already shipped, you can
              have your first paying customer. Verified by your own Stripe. Or
              you do not pay. That is the destination of this machine. You are
              buying the first $1 of the road to it.
            </p>
          </div>

          {/* The Story */}
          <div>
            <h2 className="text-xl font-bold mb-3">The Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              I built a dozen products nobody paid for. I told myself it was the
              product, then the funnel, then the traffic. I went embarrassingly
              deep into SEO so I would not have to look at the flat line. What
              broke me was sitting with more than ten other founders and hearing
              my own story back. So I sat down to write the offer for this
              product and found nothing. No promise. No specific person. That was
              the moment. I had been building beautiful things for no one in
              particular.
            </p>
          </div>

          {/* The Solution */}
          <div>
            <h2 className="text-xl font-bold mb-3">What $1 Gets You</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You finish two things this week. A real dream customer, named and
              specific, not a vibe. A real offer, written, with a guaranteed
              result you can defend to a skeptic. That is Machine Steps 1 and 2,
              complete, yours to keep.
            </p>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong>Step 1: Pin Your Dream Customer</strong> — A
                      guided conversation that pushes back on vague answers until
                      you have one real person, named and specific.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong>Step 2: Build Your Offer</strong> — Four questions.
                      The engine assembles your guarantee, your stack, your 10x
                      value math.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Guarantee Teaser */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              The full Machine carries a 60-day guarantee: your first paying
              customer verified by Stripe, or both months back. The $1 Starter
              delivers a real finished WHO and WHAT, yours to keep, no recurring
              charge.
            </p>
          </CardContent>
        </Card>

        {/* Polarity AGAINST line */}
        <p className="text-sm text-muted-foreground italic mb-8">
          This is not &ldquo;validate your idea&rdquo; advice. You already built
          the thing. This is the work that comes after.
        </p>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleCheckout}>
            Start the Machine for $1
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            One-time payment. No subscription. No auto-upgrade.
          </p>
        </div>
      </div>
    </div>
  );
}
