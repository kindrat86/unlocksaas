"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { VslPlayer } from "@/components/vsl/vsl-player";
import { FoundingBuilder } from "@/components/blocks/founding-builder";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

// Per-label / per-bucket one-liner that opens the page when the visitor comes
// from the diagnostic Bridge Page (/diagnostic/result/). The Bridge Page owns
// the long-form pattern interrupt + identification + story + strategy + trial
// close. This banner is the short re-anchor on the Starter — "you came here
// because of X, and X is exactly what the $1 buys."
//
// Voice rule: name the bucket in their own words, then point at what the
// Starter actually does. Workbook 04 §3 Page 2 + workbook 06 §3 + Brunson
// DCS Secret 15 (the bridge points to the door; the door confirms the bridge).
//
// Resolution order in DiagnosticHandoffBanner():
//   1. bucket (if present)         → bucket-specific copy
//   2. label  (if present)         → legacy fallback for pre-survey rows
//   3. "missing"                   → no diagnostic param at all
//
// Keys must stay in sync with app/src/lib/diagnostic.ts BUCKETS + DiagnosticLabel.
const DIAGNOSTIC_HANDOFF: Record<string, { title: string; body: string }> = {
  // -- Bucket-aware (Brunson Survey Funnel + Bridge Scripts) ----------------
  customer_avoider: {
    title: "Customer Avoider. The bridge said it; the door confirms it.",
    body: "The $1 below is Playbook Steps 1 and 2: pin one real customer, write one real offer for them. The two pieces of work you have been avoiding, finished this week.",
  },
  stuck_builder: {
    title: "Stuck Builder. The bridge said it; the door confirms it.",
    body: "Step 2 — Build Offer — has engine pushback that rejects features, hedging, and unnamed timeframes. That is what the $1 below buys. Plus Step 1 for the person it is for.",
  },
  tactic_shopper: {
    title: "Tactic Shopper. The bridge said it; the door confirms it.",
    body: "More tactics on a wrong-person page produces more flat. The $1 below pins a real customer (Step 1) and rewrites the offer (Step 2). Then tactics start working.",
  },
  traction_but_stuck: {
    title: "Traction but Stuck. The bridge said it; the door confirms it.",
    body: "You already have a few buyers. The $1 below sits with them, finds the pattern, and rewrites the offer around what they actually bought. Steps 1 and 2.",
  },
  premature: {
    title: "You said skip the wait. Eyes open.",
    body: "Most founders less than 30 days post-launch benefit more from sitting with the silence than running the Playbook. If you have made up your mind, the $1 below still does the same work. Just know I told you.",
  },
  ready_to_scale: {
    title: "You took the downgrade door. That is allowed.",
    body: "The $1 below is Steps 1 and 2 — the part of the Playbook you may already have done. Run it anyway as a sanity check, then the $49 upgrade is on the next page.",
  },

  // -- Legacy label fallback (rows from before the survey shipped) ----------
  wrong_person: {
    title: "Wrong Person. Got it. Here is the door.",
    body: "Steps 1 and 2 of the Playbook are exactly the work that pins a real person and writes a real offer for them. That is what the $1 below buys.",
  },
  weak_offer: {
    title: "Weak Offer. Got it. Here is the door.",
    body: "Step 2 of the Playbook is offer construction with engine pushback on every hedge. Step 1 is the dream customer it is for. That is what the $1 below buys.",
  },
  weak_belief: {
    title: "Weak Belief. Got it. Here is the door — for the upstream part.",
    body: "Belief gets fully rebuilt in Step 4 (behind the full Playbook). The work that has to come first is a real WHO and a real WHAT — Steps 1 and 2. That is what the $1 below buys.",
  },
  error: {
    title: "I could not finish the read. The door is still open.",
    body: "We skip the diagnosis. The $1 below puts you in front of the same engine the diagnosis was going to point at: Steps 1 and 2 of the Playbook.",
  },
  missing: {
    title: "Skipped the diagnostic. Good — here is the door.",
    body: "The Starter is the same destination either way: finish your dream customer and your offer this week, for one dollar.",
  },
};

function DiagnosticHandoffBanner() {
  const params = useSearchParams();
  const from = params.get("from");
  if (from !== "diagnostic") return null;

  // Bucket wins; label is the fallback for pre-survey rows.
  const bucketKey = params.get("bucket") ?? "";
  const labelKey = params.get("label") ?? "";
  const copy =
    DIAGNOSTIC_HANDOFF[bucketKey] ??
    DIAGNOSTIC_HANDOFF[labelKey] ??
    DIAGNOSTIC_HANDOFF.missing;

  return (
    <aside
      role="note"
      className="mb-8 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4"
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
        From your diagnosis
      </p>
      <h2 className="text-base font-semibold leading-snug mb-1">
        {copy.title}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {copy.body}
      </p>
    </aside>
  );
}

export default function StarterSalesPage() {
  return (
    // Suspense boundary required when useSearchParams reads inside a client
    // component that may be prerendered (the rule is unchanged in Next 16).
    // The shell still streams.
    <Suspense fallback={null}>
      <StarterSalesPageInner />
    </Suspense>
  );
}

function StarterSalesPageInner() {
  const params = useSearchParams();

  // Stable across renders so the click handler closes over the right values.
  // The bucket joins label as a first-class attribution key so the Stripe
  // webhook can stamp diagnostic_leads.bucket on conversion if we ever need
  // to back-fill it (currently bucket is written at diagnostic-submit time).
  const attribution = useMemo(() => {
    const from = params.get("from");
    const label = params.get("label");
    const bucket = params.get("bucket");
    const lead = params.get("lead");
    if (!from && !label && !bucket && !lead) return null;
    return {
      from: from ?? undefined,
      label: label ?? undefined,
      bucket: bucket ?? undefined,
      lead: lead ?? undefined,
    };
  }, [params]);

  useEffect(() => {
    track(Event.StarterPageViewed, attribution ? { ...attribution } : undefined);
  }, [attribution]);

  async function handleCheckout() {
    track(Event.StarterCheckoutClicked, {
      price_type: "starter",
      surface: "starter",
      ...(attribution ?? {}),
    });
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceType: "starter",
        // Forwarded to Stripe session metadata so the webhook can stamp
        // diagnostic_leads.converted_to_starter_at on this row.
        attribution,
      }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/GEO) — strategy/google-strategy.md §B.2.
          BreadcrumbList earns the SERP sitelink (Home › $1 Starter) and
          helps Google attach the Starter to the canonical funnel surface.
          The page itself is a "use client" Suspense surface because the
          diagnostic-handoff banner reads ?bucket / ?label from the URL;
          JSON-LD <script> still renders fine inside a client component. */}
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "$1 Starter", url: "https://unlocksaas.com/starter" },
        ]}
      />
      <AbExposureBeacon />
      <div className="max-w-2xl mx-auto">
        {/* Handoff acknowledgment — only renders when ?from=diagnostic. */}
        <DiagnosticHandoffBanner />

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
          built the playbook I wish someone had handed me.
        </p>

        {/* Founder VSL — the in-110-seconds version for cold scrollers who
            will not read the long-form below. Autoplay off here because the
            page is high-intent (visitor already clicked through); we want
            the visitor to opt-in to the watch rather than have motion start
            uninvited above the fold. */}
        <div className="mb-10">
          <VslPlayer
            surface="starter"
            showHeadline
            showCta={false}
            autoplay={false}
          />
        </div>

        <Separator className="my-8" />

        {/* Star Story Solution */}
        <section className="space-y-6 mb-12">
          {/* The Star — vivid, sensory destination. Workbook 03 Script 3
              expanded per the Brunson Book Funnel chapter: don't just name
              the result, paint it. Sense memory + the specific behaviour
              change the founder will notice. */}
          <div>
            <h2 className="text-xl font-bold mb-3">The Destination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              One verified paying customer in your Stripe within 60 days, or you do not pay. The $1 below buys the first two steps of that road: pinning one real named customer and writing one real defensible offer. Those two steps are the only reason a post-launch product stays flat -- and the only two pieces of work the $1 finishes for you tonight.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Picture sixty days from now. You open Stripe on a Tuesday
              morning, the same way you have opened it on every Tuesday
              morning of the last seven months. The line is not flat. There
              is a charge on it. It has a real person&apos;s name attached.
              You did not buy it from yourself. You did not pay anyone for a
              fake. You sent one specific message to one specific person, you
              used the product you already shipped, and they paid you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That is the destination of this playbook. One verified paying
              customer in your own Stripe within sixty days, or you do not
              pay. The $1 below buys you the first two steps of the road to
              it, yours to keep either way.
            </p>
          </div>

          {/* The Story — full 7-beat Epiphany Bridge, condensed for the
              $1 page. Workbook 06 §1: desire, external wall, internal wall,
              epiphany, plan, conflict, achievement. Each labeled paragraph
              hits one beat without breaking the Reluctant Hero voice. */}
          <div>
            <h2 className="text-xl font-bold mb-3">How I Got Here</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-semibold text-foreground">The desire.</span>{" "}
              I wanted to be one of the non-engineers who finally got paid for
              software they shipped. Lovable and Claude opened that door in
              2026. I walked through it and shipped a dozen products in months.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-semibold text-foreground">The external wall.</span>{" "}
              Every product launched to the same flat Stripe line. Twelve in a
              row. The dashboard mocked me every morning.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-semibold text-foreground">The internal wall.</span>{" "}
              I told myself it was the product, then the funnel, then the
              traffic. I went embarrassingly deep into SEO so I would not have
              to look at the flat line. The fear underneath: maybe a
              non-engineer who cannot code does not get to win this.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-semibold text-foreground">The epiphany.</span>{" "}
              I sat with more than ten other founders. Every one of them was
              me. Same flat Stripe, same SEO escape hatch, same private theory
              that they were the broken one. So I sat down to write the offer
              for this product and I found nothing. No promise. No specific
              person. That was the moment. I had been building beautiful things
              for no one in particular.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-semibold text-foreground">The plan.</span>{" "}
              Name one real person. Write one real promise. Sell it before it
              feels ready. The work the courses skip because it does not look
              like work.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-semibold text-foreground">The conflict.</span>{" "}
              The plan is short to read and brutal to do. Outreach is the home
              field of every avoidant founder. You will not do it on willpower.
              I did not.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">The achievement.</span>{" "}
              So I built a playbook that refuses to let me skip the work. It
              names the customer for me. It writes the offer with me. It picks
              the outreach targets and tracks every send. It only counts a win
              when Stripe says so. The Playbook is what you are buying the first
              two steps of below.
            </p>
          </div>

          {/* The Solution — name the method explicitly, then DEMONSTRATE.
              Brunson Magic Bullet rule: one concrete example of the engine
              doing its job beats three paragraphs of "AI-powered" copy. */}
          <div>
            <h2 className="text-xl font-bold mb-3">
              What $1 Gets You: The Playbook, Steps 1 and 2
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Playbook is a seven-step engine. The $1 buys the first two
              steps, complete, yours to keep. A real dream customer, named and
              specific, not a vibe. A real offer, written, with a guaranteed
              result you can defend to a skeptic. The work is done with you,
              not assigned to you.
            </p>
            <Card className="mb-4">
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong>Step 1: Pin Your Dream Customer.</strong> Five
                      guided questions. The engine pushes back on every vague
                      answer. The output is one named person with their real
                      congregation list — not a marketing persona.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>
                      <strong>Step 2: Build Your Offer.</strong> Four questions.
                      The engine assembles your headline, your stack, your
                      guarantee, and runs the 10x-value math. Hedges get
                      rejected. Feature lists get rejected.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Magic Bullet — show the engine doing its job. */}
            <div className="rounded-lg border border-border bg-muted/40 p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                What &ldquo;engine pushback&rdquo; actually looks like
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-mono text-foreground">You:</span> My
                  dream customer is founders.
                </p>
                <p className="text-muted-foreground">
                  <span className="font-mono text-foreground">Engine:</span>{" "}
                  &ldquo;Founders&rdquo; is a category, not a person. Name one
                  founder you have already spoken to in the last thirty days.
                  What did they say when you asked what they were stuck on?
                </p>
                <p className="text-muted-foreground">
                  <span className="font-mono text-foreground">You:</span> Marco.
                  He shipped a Lovable app in March. He has two paying users
                  out of twelve and he keeps refreshing Stripe.
                </p>
                <p className="text-muted-foreground">
                  <span className="font-mono text-foreground">Engine:</span>{" "}
                  Good. That is a person. Step 1 begins.
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                Every step works this way. The framework lives in the engine.
                You answer human questions. The engine refuses to let you
                hand-wave.
              </p>
            </div>
          </div>
        </section>

        {/* What happens when you click — Brunson Cart Funnel specificity
            block. Removes the "I don't know what I am buying" friction. */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              What happens when you click
            </p>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside leading-relaxed">
              <li>Stripe charges your card $1. One time. Not a subscription.</li>
              <li>
                You land inside the Playbook, logged in, with Steps 1 and 2
                unlocked.
              </li>
              <li>
                You finish both steps in about ninety minutes of focused work.
              </li>
              <li>
                On the next page you will see a one-time door to the full
                Playbook at $49/mo with the 60-day guarantee. You can take it
                or skip it. The $1 work is yours either way.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Guarantee Teaser */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The full Playbook carries a 60-day guarantee: your first paying
              customer verified by Stripe, or both months back. The $1 Starter
              is not on the guarantee because nothing $1 should be. The $1
              delivers a real finished WHO and WHAT, yours to keep, no
              recurring charge.
            </p>
          </CardContent>
        </Card>

        {/* Polarity AGAINST line */}
        <p className="text-sm text-muted-foreground italic mb-8">
          This is not &ldquo;validate your idea&rdquo; advice. You already built
          the thing. This is the work that comes after.
        </p>

        {/* Building Block #16 — Starter-specific FAQ (3 questions only; the $49 page
            carries the full 8-question accordion). Voice: Reluctant Hero, sourced
            from strategy/dollar-objections.md Categories 1, 5, and the OTO concern. */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-5">Three quick questions before you click.</h2>
          <div className="space-y-5">
            <div>
              <p className="font-semibold">Is the $1 a trial that auto-upgrades?</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                No. The $1 is a one-time charge. After you pay you see an
                upgrade door to the $49 Playbook — clicking it is one decision,
                clicking past it is another. The Starter you bought is yours
                either way.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                What if I finish Steps 1 and 2 and the offer still feels weak?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Then the engine pushed back well. The Starter delivers a real
                dream customer and a real offer — not a confident one. The
                belief-rebuild that hardens it is Step 4, behind the $49 door.
                You can walk back to the $49 page when you are ready.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                Could I not just write my dream customer and offer myself in a notebook?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Yes. You have not. Six months of notebook drafts is why your
                Stripe line is flat. The $1 buys the version of you that
                finishes — because the engine refuses to accept the vague
                answer your notebook tolerates.
              </p>
            </div>
          </div>
        </section>

        {/* The Cost of Waiting – Brunson loss-aversion close (Expert Secrets
            §3 "Stake" close + DotCom Secrets Story-Strategy-Service emotional
            reframe). The visitor has heard the upside; this block flips the
            mirror so they feel the downside of skipping the dollar.

            Voice: Reluctant Hero. No threats, no manipulation. Just the
            mechanical cost of one more month of the same ritual the visitor
            already knows by heart. */}
        <section className="mb-10 rounded-lg border border-border bg-muted/40 p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The honest cost of clicking away
          </p>
          <h2 className="text-xl font-bold mb-3 leading-snug">
            One dollar is not the question. Another month of refreshing Stripe is.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            If you do not click below, here is what tonight looks like.
            Dinner done. Laptop open. Refresh Stripe. Same flat line. Open a
            new tab. Read another founder&apos;s post about their launch. Tell
            yourself you&apos;ll &ldquo;sit with it.&rdquo; Close the laptop.
            That ritual costs nothing on the credit-card statement. It is
            still the most expensive hour you spent today, because you spent
            it not finishing the only two pieces of work that move the line.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One dollar buys the version of those ninety minutes where the
            work actually finishes. Same Tuesday night. Different outcome.
          </p>
        </section>

        {/* Logical Math – the Brunson "comparison" mini-close (workbook 07
            §3 Category 2 slide 38). Marco is a skeptic. Honest math beats
            adjectives. Three lines, three anchors, all defensible to a
            cynic with a calculator. */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The math, in the open
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  vs. nothing
                </p>
                <p className="text-base font-semibold leading-snug mb-1">
                  $1 vs. $0
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Free is what you have been paying for the flat line. The
                  dollar is the line item that ends that.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  vs. a course
                </p>
                <p className="text-base font-semibold leading-snug mb-1">
                  $1 vs. $497
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The same Step-1-and-2 work inside a typical cohort runs
                  $497 with no refund mechanism. You pay 497× less, and you
                  do the work tonight.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  vs. a consultant
                </p>
                <p className="text-base font-semibold leading-snug mb-1">
                  $1 vs. $300/hr
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A positioning consultant at $300/hr needs three hours to
                  reach a worse Step-1 output than the engine produces in
                  forty minutes. The math does not survive contact with the
                  reality.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trial Close – Brunson Workbook 07 §2, three trial closes instead
            of one. Each one a soft-yes question, in increasing emotional
            temperature. The CTA reads as a release after three small yeses,
            not as a cold ask. */}
        <section className="mb-8 space-y-3">
          <p className="text-base text-foreground font-medium leading-relaxed">
            Would you trade your next sixty days of tactic-shopping for one
            verified paying customer?
          </p>
          <p className="text-base text-foreground font-medium leading-relaxed">
            Would you spend ninety minutes this week pinning a real customer
            and writing a real offer, if it cost the same as a vending-machine
            soda?
          </p>
          <p className="text-base text-foreground font-medium leading-relaxed">
            Would you rather be the founder who decided, or the founder who
            scrolled to the next tab?
          </p>
        </section>

        {/* CTA */}
        <div className="text-center mb-2">
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleCheckout}>
            Start the Playbook for $1
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            One-time payment. No subscription. No auto-upgrade.
          </p>
        </div>

        {/* Reluctant Hero signature – per project_unlocksaas_email_identity
            memory: customer-facing surfaces close with "– Maryan". */}
        <div className="mt-12 mb-12 text-right text-sm text-muted-foreground italic">
          – Maryan
        </div>
      </div>

      {/* Honest scarcity block – full-bleed below the dollar CTA. The Starter
          variant of FoundingBuilder reframes the three levers for the $1
          surface: founding price applies to the $49 upgrade, capacity ceiling
          applies to the Step-1 reading queue, and the calendar argument is
          the same. */}
      <FoundingBuilder tone="starter" />

      {/* Final restate CTA – Brunson "close before the close": after the
          scarcity block, the visitor either acts or leaves. Do not let the
          page end on prose. */}
      <div className="max-w-2xl mx-auto py-14 sm:py-20 px-4 sm:px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 leading-tight text-balance">
          Same Tuesday night. Different outcome.
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed max-w-md mx-auto">
          One dollar. Ninety minutes. Steps 1 and 2 of the Playbook, finished,
          yours to keep – whether you upgrade or not.
        </p>
        <Button size="lg" className="text-lg px-8 py-6" onClick={handleCheckout}>
          Start the Playbook for $1
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          One-time payment. No subscription. No auto-upgrade.
        </p>
      </div>
    </div>
  );
}
