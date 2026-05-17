import type { Metadata } from "next";
import Link from "next/link";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Public placeholder for Rung 2 (Repeatable Revenue Layer).
// Spec source: strategy/decisions/rung-2-repeatable-revenue.md.
// Build gate: 3 verified Core customer cycles + 1 unprompted ask + founder
// dogfood pass. Until then, this page exists to (a) prove the ladder is
// real and published, (b) route the visitor back to the live $49 funnel,
// (c) preserve the Reluctant Hero rule of no-fake-doors.

export const metadata: Metadata = {
  title: "The Repeatable Revenue Layer — Rung 2 | Unlock SaaS",
  description:
    "What ships after your first paying customer: a self-serve layer that carries dream customer, attractive character, outreach, and Stripe pattern across Product 2. Spec published; build gated on three Core customer cycles.",
  robots: { index: true, follow: true },
  // Self-referencing canonical + hreflang. Without this override, the root
  // layout's `canonical: "/"` propagates here and tells Google /repeatable
  // is duplicate of the homepage. /repeatable is listed in sitemap.ts at
  // priority 0.5 and is the public spec of the next product rung; it must
  // be indexed on its own URL. Closed 2026-05-17.
  alternates: {
    canonical: "/repeatable",
    languages: {
      "en-US": "/repeatable",
      "x-default": "/repeatable",
    },
  },
};

export const dynamic = "force-dynamic";

export default function RepeatablePlaceholderPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <AbExposureBeacon />

      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Rung 2 — The Repeatable Revenue Layer
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            The next yes, published before I am ready to sell it.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is the layer of the value ladder that sits above $49/mo Core.
            It is spec&apos;d, not shipped. The build is gated on three
            paying Core customers completing the full Playbook loop. Until
            then this page is a public commitment — not a waitlist, not a
            countdown.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">What it is</h2>
          <p className="text-muted-foreground leading-relaxed">
            Once the Playbook gets you to your first paying customer on
            Product 1, the most expensive thing you can do is start Product
            2 from zero. Re-define the dream customer. Re-write the
            offer. Re-build the outreach list. Re-discover which Dream 100
            targets actually convert. That is a week of avoidance dressed
            up as productive work — the exact disease the Playbook treats.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The Repeatable Revenue Layer carries the assets you earned on
            Product 1 forward into Product 2, automatically: dream
            customer pre-fill, Attractive Character lock, outreach
            template clone, Dream 100 with warmth flags, Stripe pattern
            library. Same Playbook, same guarantee mechanic, with a
            90-day window for Product 2&apos;s first paying customer.
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
                <li>— Not an agency / unlimited-products tier. That is Rung 3, still deferred.</li>
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
              Three paying Core customers have completed the full Playbook
              loop (Step 1 → Step 7 → First Paying Customer Verified).
              Carry-over assumptions are unvalidated below three.
            </li>
            <li>
              At least one Core customer has asked, unprompted, for a next
              layer. No supply without demand signal.
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

        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Rung 2 is the door that opens AFTER you walk through Rung 1.
            </p>
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/playbook-sales">Start at the $49 Core Playbook</Link>
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

        <p className="text-sm text-muted-foreground italic">
          — Maryan
        </p>
      </article>
    </div>
  );
}
