import type { Metadata } from "next";
import Link from "next/link";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

// Public placeholder for the Annual Pre-Paid Machine (DCS Secret #23 variant).
// Spec source: strategy/decisions/dcs-23-high-ticket-3-step.md.
// Build gate: 3 verified Core customer cycles + 1 unprompted-or-renewed signal
// + Maryan dry-run pass + operational readiness (Calendly + Stripe annual price
// + admin review queue).
//
// Until activation, this page exists to:
//   (a) prove the structural slot of Brunson Chapter 23 is honestly occupied,
//       not silently skipped via "lean-ladder discipline holds";
//   (b) teach the visitor what an application + 1:1 close-call shape looks like
//       in the UnlockSaaS variant, so the surprise is removed before activation;
//   (c) route the visitor back to the live $49/mo funnel — same Machine, same
//       guarantee, different billing cadence is a Phase 2 decision;
//   (d) preserve the Reluctant Hero rule of no-fake-doors: no application
//       submit endpoint behind this page until the gate fires.
//
// The five questions below are RENDERED AS TEXT — not as an interactive form —
// during the pre-activation window. Same honesty-as-polarity discipline used on
// /repeatable: the visitor sees the qualifying questions, recognizes whether
// they would survive them, and chooses to walk through /starter or /machine-sales
// instead of waiting on a 1:1 they have not earned the right to sit in.
//
// Audit history:
//   v3 row #23 (audit AM) — N/A "Lean-ladder discipline holds"
//   v3.1 (this push, audit PM) — N/A → 40 under stage-appropriate scoring;
//     spec locked + this placeholder + workbook addendum + state.json block +
//     audit re-grade addendum shipped.

export const metadata: Metadata = {
  title: "The Annual Pre-Paid Machine — by application | Unlock SaaS",
  description:
    "Same Machine. Same guarantee. Different cadence and a different identity. $588 a year, qualified by application, closed by a 15-minute call. Spec published; gate is three verified Core customers. — Maryan",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default function AnnualPlaceholderPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <AbExposureBeacon />

      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The Annual Pre-Paid Machine
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Paying for a year up front is a different promise.
            <br />
            So is the way you get qualified for it.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            This is the annual-cadence variant of the $49/mo Core. Same Machine,
            same guarantee, $588 paid once instead of $49 paid twelve times.{" "}
            <strong className="text-foreground">No discount.</strong>{" "}
            $588 = $49 × 12, exactly. The reason this page exists is the SHAPE,
            not the price: a five-question application and a fifteen-minute call
            with me, before a single dollar moves. It is spec&apos;d, not
            shipped — the build is gated by three paying Core customers
            finishing their loop first. Until then, you are reading a public
            commitment, not a buy button.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">Why an application at this price</h2>
          <p className="text-muted-foreground leading-relaxed">
            Brunson&apos;s 3-Step Application Funnel was built for $2K+ offers.
            Phone time costs more than a self-serve checkout, and at four-figure
            prices the application gate earns its keep by filtering bad-fit
            buyers before they cost the operator a call.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            $588 a year is well below that canonical band — but the structural
            shape still earns its keep here for three reasons. First, an annual
            customer who churns at month 2 with a refund demand is more expensive
            than a monthly customer doing the same; the application
            pre-qualifies fit so the refund-rate stays flat. Second, the
            fit-signal compresses my time: bad-fit applicants self-disqualify
            by reading the questions and not submitting. Third, the
            Verified-Annual identity is earned, not bought — and identity
            anchored in earned commitment is the only kind that survives
            contact with cold traffic.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            None of that means I am offering you a strategy session.{" "}
            <strong className="text-foreground">
              The 15-minute call is fit-qualification + close, not coaching.
            </strong>{" "}
            No homework. No follow-up call. No curriculum. I walk you through
            your Stripe, ask you three specific questions, and either process
            $588 over the call or send you back to the monthly path with a clean
            no.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">The shape, in three steps</h2>
          <Card className="bg-muted/40">
            <CardContent className="pt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Step 1 — The sales document.
                </p>
                <p>
                  Same long-form as the monthly path:{" "}
                  <Link
                    href="/machine-sales"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    /machine-sales
                  </Link>
                  . Same Big Domino, same Three Secrets, same Stack. There is
                  no separate annual sales page because there is no separate
                  product. The annual prepay rides on the same belief work.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Step 2 — The application.
                </p>
                <p>
                  Five questions. All five are real filters tied to a locked
                  workbook rule. They are below, rendered as text. When the
                  gate opens, the same five questions become a server-enabled
                  form. Until then, reading them is the application.
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Step 3 — The 15-minute Zoom.
                </p>
                <p>
                  One-on-one with me. Three questions, two buttons. No deck. No
                  demo. The call is your Stripe situation, your avoided work,
                  and a yes-or-no on processing the $588 over the call. If no,
                  I send you back to monthly in the chat and we end at twelve
                  minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">The five application questions</h2>
          <p className="text-muted-foreground leading-relaxed">
            These do not change between the placeholder and the live form. If
            you would not pass them today, walk one step downhill — the $1
            Starter or the free Diagnostic — and come back when you would.
          </p>
          <ol className="list-decimal pl-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">
                Have you already shipped a product? Live URL, please.
              </strong>
              <br />
              Pre-launch founders are the wrong avatar. This is for the founder
              with a flat Stripe line on a real product.
            </li>
            <li>
              <strong className="text-foreground">
                Is your Stripe live and accepting payments?
              </strong>
              <br />
              Without Stripe the guarantee mechanic cannot verify a charge.
              Stripeless = no guarantee = no annual.
            </li>
            <li>
              <strong className="text-foreground">
                Have you started or completed The Machine, at any tier (free
                Diagnostic, $1 Starter, $49/mo Core)?
              </strong>
              <br />
              Cold inbound at $588/year converts at almost zero without an
              upstream rung touched. Walk through the door first.
            </li>
            <li>
              <strong className="text-foreground">
                In one sentence: who is your dream customer?
              </strong>
              <br />
              The Marco-Meter. Vague answers waste a fifteen-minute call. A
              specific person and a specific situation earns the call.
            </li>
            <li>
              <strong className="text-foreground">
                If the Machine produces your first paying customer inside the
                60-day window, what is $588 worth to you today?
              </strong>
              <br />
              Honest self-quantified outcome. If you cannot answer this, the
              close call cannot answer it for you.
            </li>
          </ol>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">What you are buying</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">
                    The same Machine.
                  </strong>{" "}
                  Seven steps. Same Stripe-verified guarantee. Same 60-day
                  refund window, capped at $98 — identical to monthly.
                </li>
                <li>
                  <strong className="text-foreground">
                    Lifetime $588/year price lock.
                  </strong>{" "}
                  Your annual rate never goes up for the life of your active
                  subscription. The list price will rise; yours will not.
                </li>
                <li>
                  <strong className="text-foreground">
                    The Verified-Annual badge variant
                  </strong>{" "}
                  on your public /builder/[slug] page. Distinct visual frame
                  from monthly Verified. Identity-anchored social proof — the
                  signal you committed annually before you had to.
                </li>
                <li>
                  <strong className="text-foreground">
                    A 30-day direct line to me on every renewal anniversary.
                  </strong>{" "}
                  First thirty days of each annual year, I reply to anything at
                  maryan@unlocksaas.com within one business day.
                </li>
              </ul>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground italic">
            Total honest math: $1,292 of value at $588 = 2.2×. Below the 10×
            rule, on purpose — the 10× rule applies to the anchor product (the
            Machine at $49/mo, where the ratio is 10.1×). The annual prepay is
            a billing-cadence + identity decision, not a new offer. Inflating
            it to 10× would mean inventing value, which is the disease this
            brand was built to treat.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">What it is not</h2>
          <Card className="bg-muted/40">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>— Not a discount. $588 = $49 × 12. Math, not marketing.</li>
                <li>
                  — Not coaching. The 15-minute call is fit-qualification +
                  close, not strategy. No homework. No follow-up call.
                </li>
                <li>
                  — Not done-for-you. You run the Machine. I never run it for
                  you. Workbook 01 §3 rule, preserved.
                </li>
                <li>
                  — Not a cohort. The 1:1 call is one-on-one. No group calls,
                  no shared room.
                </li>
                <li>
                  — Not a new product. Same engine, same steps, same guarantee.
                  Only the billing cadence and the identity bonuses differ.
                </li>
                <li>
                  — Not the Founding-Cohort PLF. That runs once as a 50-seat
                  cart event at $49/mo. This is evergreen at $588/year,
                  application-gated, no countdown.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">Hard activation gates</h2>
          <p className="text-muted-foreground leading-relaxed">
            I refuse to ship this before:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>
              Three paying Core customers have completed the full Machine loop
              (Step 1 → Step 7 → First Paying Customer Verified). Without three
              case studies I would be opening the close call with &ldquo;I have
              never seen this work,&rdquo; which is Brunson-incredible.
            </li>
            <li>
              At least one of those three has either renewed past month two OR
              asked, unprompted, about an annual option. No supply without
              demand signal.
            </li>
            <li>
              I have run a dry-run close call on myself with a friend playing
              the candidate. The Reluctant Hero rule: never sell a 1:1 motion
              you have not personally practiced.
            </li>
            <li>
              Calendly, the Stripe annual price, and the admin review queue
              work end-to-end on a test charge. Operational readiness, not
              spec readiness.
            </li>
          </ol>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">
            This is not for you if&hellip;
          </h2>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>
                  — You want a steeper discount for paying annually. There
                  isn&apos;t one. Walk down to monthly.
                </li>
                <li>
                  — You want a coach on the call. There isn&apos;t one. The
                  call is qualification + close.
                </li>
                <li>
                  — You have not shipped a product yet. Go ship. Come back when
                  Stripe is flat.
                </li>
                <li>
                  — You want me to run the Machine for you. That product does
                  not exist. The Machine is the doing-environment, not the
                  done-for-you service.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-8" />

        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The door upstairs opens after you walk through the door
              downstairs.
            </p>
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/machine-sales">Start at the $49/mo Core Machine</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Or take the{" "}
              <Link
                href="/starter"
                className="underline underline-offset-4 hover:text-foreground"
              >
                $1 Starter
              </Link>{" "}
              and earn your way to the annual variant.
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground italic">— Maryan</p>
      </article>
    </div>
  );
}
