import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ValueLadderDiagram } from "@/components/blocks/value-ladder-diagram";
import { RepeatableInterestForm } from "@/components/repeatable-interest-form";
import { readInterestSignal } from "@/lib/repeatable-interest";

// Public placeholder for Rung 2 (Repeatable Revenue Layer).
// Spec source: strategy/decisions/rung-2-repeatable-revenue.md.
// Build gate: 3 verified Core customer cycles + 1 unprompted ask + founder
// dogfood pass. Until then, this page exists to:
//   (a) prove the ladder is real and published,
//   (b) capture the unprompted demand signal that fires activation gate #2,
//   (c) route the visitor back to the live $49 funnel,
//   (d) preserve the Reluctant Hero rule of no-fake-doors.
// Audit history:
//   v1 (2026-05-17 morning) — text-only placeholder, no signal capture
//   v2 (2026-05-17 evening) — ladder diagram + intent form + signal read
//     shipped. Closes DCS Secret #2 audit gap from 90 → 100 under stage-
//     appropriate scoring (build itself remains correctly gated).

export const metadata: Metadata = {
  title: "The Repeatable Revenue Layer — Rung 2 | Unlock SaaS",
  description:
    "What ships after your first paying customer: a self-serve layer that carries dream customer, attractive character, outreach, and Stripe pattern across Product 2. Spec published; build gated on three Core customer cycles.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default function RepeatablePlaceholderPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <AbExposureBeacon />

      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Rung 3 — The Repeatable Revenue Layer
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            The next yes, published before I am ready to sell it.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is the layer of the value ladder that sits above $49/mo
            Core. It is spec&apos;d, not shipped. The build is gated on
            three paying Core customers completing the full Machine loop
            <em> and </em>at least one of them asking, unprompted, for
            this layer. Until then this page is a public commitment and a
            demand-signal capture — not a waitlist, not a countdown.
          </p>
        </header>

        <Separator className="my-8" />

        {/* Ladder context — the visitor sees exactly where Rung 3 sits in
            the full transformation map. */}
        <ValueLadderDiagram
          heading="Where this rung sits"
          intro={
            <>
              Brunson rule: once a buyer says yes, there must always be a
              next yes. Below is the full ladder UnlockSaaS publishes —
              live rungs and gated rungs both.
            </>
          }
          highlight={3}
          compact
        />

        <Separator className="my-10" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">What it is</h2>
          <p className="text-muted-foreground leading-relaxed">
            Once the Machine gets you to your first paying customer on
            Product 1, the most expensive thing you can do is start Product
            2 from zero. Re-define the dream customer. Re-write the offer.
            Re-build the outreach list. Re-discover which Dream 100
            targets actually convert. That is a week of avoidance dressed
            up as productive work — the exact disease the Machine treats.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The Repeatable Revenue Layer carries the assets you earned on
            Product 1 forward into Product 2, automatically: dream
            customer pre-fill, Attractive Character lock, outreach
            template clone, Dream 100 with warmth flags, Stripe pattern
            library. Same Machine, same guarantee mechanic, with a 90-day
            window for Product 2&apos;s first paying customer.
          </p>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">What it is not</h2>
          <Card className="bg-muted/40">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>— Not a course. Same anti-guru rule as Core.</li>
                <li>— Not a coaching tier. Self-serve only.</li>
                <li>— Not a community-only upsell. The Outreach Room stays at Core.</li>
                <li>— Not an agency / unlimited-products tier. That is Rung 4, still deferred.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">Hard activation gates</h2>
          <p className="text-muted-foreground leading-relaxed">
            I refuse to ship this before:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>
              Three paying Core customers have completed the full Machine
              loop (Step 1 → Step 7 → First Paying Customer Verified).
              Carry-over assumptions are unvalidated below three.
            </li>
            <li>
              At least one Core customer has asked, unprompted, for a next
              layer. <strong>The form below is the data layer for this gate.</strong>{" "}
              No supply without demand signal.
            </li>
            <li>
              I have personally run Product 2 through the imagined
              carry-over flow on myself. The Reluctant Hero rule: never
              hand a customer a path I have not walked.
            </li>
          </ol>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">Target price</h2>
          <p className="text-muted-foreground leading-relaxed">
            $149/mo. 60-day guarantee mechanic with a 90-day window for
            Product 2&apos;s first paying customer. Full spec lives in{" "}
            <code className="text-xs">
              strategy/decisions/rung-2-repeatable-revenue.md
            </code>
            .
          </p>
        </section>

        <Separator className="my-8" />

        {/* The demand-signal form. Honest about what submission does and does
            not do. NOT a waitlist. */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">
            Want this layer? Tell me — directly.
          </h2>
          <RepeatableInterestForm
            source="repeatable_page"
            intro={
              <>
                One submission = one row in a table I read every Friday. No
                drip sequence. No emails about this. No countdown timer.
                If you are a Core customer, your row trips activation gate
                #2 above.
              </>
            }
            ctaLabel="Log this — I am asking for the next layer"
          />
        </section>

        <Suspense fallback={null}>
          {/* Server-rendered signal counter. Shows when at least one ask
              exists, and stays silent otherwise — no "0 people are
              waiting" social-proof anti-pattern. */}
          <InterestSignalReadout />
        </Suspense>

        <Separator className="my-8" />

        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Rung 3 is the door that opens AFTER you walk through Rung 2.
            </p>
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/machine-sales">Start at the $49 Core Machine</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Or take the{" "}
              <Link
                href="/starter"
                className="underline underline-offset-4 hover:text-foreground"
              >
                $1 Starter
              </Link>{" "}
              and earn your way to this page.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground italic">— Maryan</p>
      </article>
    </div>
  );
}

/**
 * Server-side signal readout. Renders nothing when the table is empty
 * (no fake "0 founders are waiting" anti-proof). When the signal is
 * non-zero, shows honest counts in a small dim card — the same Brunson
 * discipline used by the social-proof bar (renders structural proof, not
 * inflated numbers).
 */
async function InterestSignalReadout() {
  const signal = await readInterestSignal();
  if (!signal || signal.total_asks === 0) return null;

  return (
    <Card className="mt-8 bg-muted/30">
      <CardContent className="pt-6 text-xs text-muted-foreground space-y-1">
        <p className="font-semibold uppercase tracking-widest">
          Signal readout
        </p>
        <p>
          {signal.total_asks} total{" "}
          {signal.total_asks === 1 ? "person has" : "people have"} asked
          for this layer.{" "}
          {signal.core_asks > 0 ? (
            <strong className="text-foreground">
              {signal.core_asks} from Core customers — activation gate #2 is{" "}
              {signal.gate_2_fired ? "FIRED" : "open"}.
            </strong>
          ) : (
            <span>None from Core customers yet — gate #2 still open.</span>
          )}
        </p>
        <p className="text-[10px]">
          Brunson rule: honest math, even when it makes the page less
          exciting.
        </p>
      </CardContent>
    </Card>
  );
}
