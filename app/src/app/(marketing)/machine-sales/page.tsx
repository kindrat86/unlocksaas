import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { CheckoutButton } from "@/components/checkout-button";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { BeforeAfter } from "@/components/blocks/before-after";
import { ComparisonTable } from "@/components/blocks/comparison-table";
import { HonestTestimonials } from "@/components/blocks/honest-testimonials";
import { FounderTimeline } from "@/components/blocks/founder-timeline";
import { VslBlock } from "@/components/blocks/vsl-block";
import {
  MachineProductJsonLd,
  FaqPageJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { MACHINE_SALES_FAQS } from "@/lib/faqs";
import { Event } from "@/lib/analytics/events";

/**
 * Per-page metadata. Surface A of strategy/google-strategy.md — this page is
 * the product-aware decision page that the LLM-citation Product schema
 * (MachineProductJsonLd, rendered below) anchors to. Title is question-shaped
 * to grease AEO featured-snippet capture for "is unlock saas legit",
 * "unlock saas review", "what is the machine unlock saas" intent classes.
 *
 * `alternates.canonical` is path-relative; the metadataBase in app/layout.tsx
 * resolves it to https://unlocksaas.com/machine-sales.
 */
export const metadata: Metadata = {
  title: "The Machine — First Paying Customer in 60 Days or You Don't Pay",
  description:
    "A seven-step machine for already-shipped, pre-revenue SaaS founders. $49/month. If it does not produce a verified paying customer in 60 days, you do not pay. Built by a non-engineer for non-engineer founders.",
  alternates: { canonical: "/machine-sales" },
  openGraph: {
    type: "website",
    title: "The Machine — First Paying Customer in 60 Days or You Don't Pay",
    description:
      "Seven steps. Sixty days. $49/month. A verified paying customer or your money back.",
    url: "/machine-sales",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Machine — First Paying Customer in 60 Days or You Don't Pay",
    description:
      "Seven steps. Sixty days. $49/month. A verified paying customer or your money back.",
  },
  robots: { index: true, follow: true },
};

/**
 * Long-form $49 Machine sales page.
 *
 * Structure is locked by workbook 07 (10x Secrets / One-to-Many Selling):
 *   Block 1 — Big Domino (slides 1–6): Hook #7 as H1, Big Domino statement,
 *     acknowledgement of Marco's lost year, name reveal, three-secrets bridge.
 *   Block 2 — Three Secrets (slides 7–15): Vehicle / Internal / External,
 *     each with Story / Strategy / Case Study explicitly labelled.
 *   Block 3 — The Stack (slides 16–30): one Card per slide, NOT collapsed
 *     into a single table. Math cards. Bonus-expansion cards. Re-stack.
 *   Block 4 — The Guarantee in writing (workbook 01 §2).
 *   Block 5 — Trial Closes (workbook 07 §3, three of them).
 *   Block 6 — Mini Closes (workbook 07 §3, Categories 1–3, 9 closes).
 *     Category 4 (urgency / scarcity) is DELIBERATELY rejected — the avatar
 *     is a skeptic and fake scarcity destroys trust.
 *   Block 7 — FAQ from the 6 External Belief rewrites (workbook 06 §4).
 *   Block 8 — Disqualifying line + final CTA.
 *
 * Voice: Reluctant Hero, first person, scars, no guru energy. The identity
 * label ("Verified Builders") is the canonical default shipped per the
 * cookie default in lib/ab.ts; the AbExposureBeacon logs the A/B exposure
 * row so the variant the visitor actually sees gets counted.
 *
 * Rendered as a Server Component. The two pieces that genuinely need the
 * browser — the page-view event and the Stripe Checkout POST — are tiny
 * client islands (<PageViewTracker> and <CheckoutButton>) that hydrate
 * around an otherwise-static long-form sales page. This keeps the ~1000
 * lines of sales copy out of the client bundle (CWV: smaller LCP, lower
 * INP) and lets the page export per-route Metadata (SEO: real title +
 * description + canonical, not the layout-template fallback).
 */
export default function MachineSalesPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/GEO) — strategy/google-strategy.md §B.2.
          Product schema so the $49 Machine is citable when an LLM
          answers comparator queries ("alternatives to ShipFast",
          "tool that helps me get my first SaaS customer").
          BreadcrumbList earns the SERP sitelink and helps Google render
          the (Home › The Machine) crumb under the page title. */}
      <MachineProductJsonLd />
      <FaqPageJsonLd items={MACHINE_SALES_FAQS} />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          {
            name: "The Machine",
            url: "https://unlocksaas.com/machine-sales",
          },
        ]}
      />
      <AbExposureBeacon />
      <PageViewTracker
        event={Event.MachineSalesPageViewed}
        properties={{ surface: "machine_sales" }}
      />
      <div className="max-w-3xl mx-auto">
        {/* ============================================================ */}
        {/* BLOCK 1 — BIG DOMINO (slides 1–6)                             */}
        {/* Workbook 07 §1                                                */}
        {/* ============================================================ */}
        <section className="mb-16">
          <Badge variant="secondary" className="mb-6">
            The $49 Machine
          </Badge>

          {/* Slide 1 — Hook. Workbook 01 §5 Hook #7, verbatim. */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 sm:mb-8">
            How to get your first real paying customer in 60 days, even if
            your launch already flopped.
          </h1>

          {/* Slide 2 — Big Domino statement. Verbatim from workbook 07 §1. */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-snug mb-6">
            Your first paying customer is reachable in 60 days through
            software, not through more building and not through more
            traffic.
          </h2>

          {/* Slide 3 — Why this is hard to believe. Acknowledge Marco's
              history: a year of failed tactics. Workbook 07 §1 + workbook
              01 §6 Beat 3 Story 3 (SEO escape hatch). */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            I know that sentence sounds like every other promise you have
            already collected. I spent almost a year not believing it
            either. I shipped a real product with Lovable, opened Stripe
            every night, saw the same flat line, and ran. I went deep into
            SEO, then AEO, then GEO. I got embarrassingly good at being
            found. The line stayed flat. The year of tactics did not work
            because the tactics were not the missing piece.
          </p>

          {/* Slide 4 — Setup for proof. Workbook 07 §1 slide-4 wording. */}
          <p className="text-muted-foreground leading-relaxed mb-6">
            There is one method nobody told me about. It is mechanical, it
            is verified by my own Stripe webhook, and it has a name.
          </p>

          {/* Slide 5 — The name. */}
          <p className="text-lg leading-relaxed mb-6">
            It is called <strong>The Machine</strong>.
          </p>

          {/* Slide 6 — Transition into the three secrets. */}
          <p className="text-muted-foreground leading-relaxed">
            Here are the three things you have to believe for The Machine
            to work for you.
          </p>
        </section>

        {/* Building Block #20 — Social Proof Bar (honest variant). */}
        <SocialProofBar />

        <Separator className="my-12" />

        {/* Building Block #20 — Founder VSL framework (six-line intro). */}
        <VslBlock />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 2 — THREE SECRETS (slides 7–15)                         */}
        {/* Workbook 07 §2 — Vehicle, Internal, External                  */}
        {/* Each: Story / Strategy / Case Study explicitly labelled.      */}
        {/* ============================================================ */}
        <section className="space-y-14 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold">The Three Secrets</h2>

          {/* SECRET 1 — VEHICLE (slides 7–9) */}
          <article className="space-y-5">
            <Badge>Secret #1 — The Vehicle</Badge>
            <h3 className="text-2xl font-bold leading-snug">
              Why The Machine works where every other tool failed you.
            </h3>

            {/* Story — Vehicle Story from workbook 06 §4 */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Story
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The Machine works because it removes the option to skip.
                Every founder I talked to skipped the same three things in
                the same order: naming one real person, writing one real
                promise, sending one real message. The Machine refuses to
                let any of them happen out of order. Step 1 will not let
                you write an offer until you have pinned a real customer.
                Step 5 will not mark itself complete until 20 outreach
                actions have been verified in-tool. The 60-day guarantee
                is enforced by code, not by promise. The reason this works
                where willpower fails is mechanical: the avoidant founder
                is not asked to overcome avoidance. The tool removes the
                avoidance option.
              </p>
            </div>

            {/* Strategy — 7 steps named in order, one sentence each */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Strategy
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Seven steps, fixed order, each one locked until the
                previous one is real. <strong>Step 1</strong> pins your
                dream customer with engine pushback on every vague answer.{" "}
                <strong>Step 2</strong> builds the offer with a guaranteed
                result you can defend to a skeptic.{" "}
                <strong>Step 3</strong> defines the Attractive Character
                voice that will sell it. <strong>Step 4</strong> generates
                the hook and the page copy in your voice.{" "}
                <strong>Step 5</strong> generates the outreach assets and
                a target list, then makes you do the outreach inside the
                tool — you generate the message, you post it, the tool
                logs the public link and verifies it is live.{" "}
                <strong>Step 6</strong> connects your Stripe and watches
                for the first charge. <strong>Step 7</strong> closes the
                loop and ships you the proof.
              </p>
            </div>

            {/* Case Study — HONEST: founder running it on himself.
                The "real customer" beat is flagged, not fabricated. */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Case Study
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The first person to run The Machine on themselves was me,
                on this product. Step 1 produced Marco — 36, non-engineer,
                shipped with Lovable, flat Stripe line — the first dream
                customer I had ever written who was specific enough to
                argue with. Step 2 produced the offer you are reading
                right now, including this guarantee. Step 3 produced the
                Reluctant-Hero voice this whole page is written in. The
                page you are on is itself proof the system produces
                saleable output, not theory.{" "}
                <em>
                  The real customer story goes here once a customer has
                  run The Machine end-to-end. I will not fake one. The day
                  the first one lands, this paragraph upgrades and the
                  date goes on it.
                </em>
              </p>
            </div>
          </article>

          {/* SECRET 2 — INTERNAL (slides 10–12) */}
          <article className="space-y-5">
            <Badge>Secret #2 — The Internal Belief</Badge>
            <h3 className="text-2xl font-bold leading-snug">
              Why the work that breaks the flat line is work you have been
              avoiding, and how The Machine removes the avoidance option.
            </h3>

            {/* Story — Story 2 (Stripe Refresh) + Story 3 (SEO Escape
                Hatch) from workbook 01 §6 Beat 3. */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Story
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                For about a year my evenings looked the same. Day job
                done. Dinner done. Laptop open. Refresh Stripe. Same
                number. Tweak one small thing. Call it progress. Close the
                laptop. Technically I was working on my business every
                single night. I had nothing to show for any of it. That
                ritual was not work. It was a way to feel like I was not
                failing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When the line stayed flat, I did not panic. I went deeper.
                I learned SEO. Then AEO. Then GEO. I got embarrassingly
                good at being found. I could have taught a class on it.
                The line stayed flat. The truth I would not say out loud
                was simple. Learning more about traffic was not solving my
                problem. It was a respectable way of never looking at it.
              </p>
            </div>

            {/* Strategy — framework-into-the-engine: tool removes the
                avoidance option, not willpower. */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Strategy
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You do not overcome avoidance. You remove the option.
                Machine Step 5 — outreach — happens inside the tool. You
                generate the message, the tool picks the target from a
                Dream 100 it built from your Step-1 dream customer, you
                press send, the tool logs the public link, the tool
                watches the link. If you have not logged 20 outreach
                actions when your 60 days are up, the guarantee does not
                fire. There is no way to claim the refund without having
                done the work. That is the whole design. The framework
                lives in the engine. You answer human questions. You never
                see a 14-field form.
              </p>
            </div>

            {/* Case Study — founder's own SEO year reframed */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Case Study
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The case study is my own SEO year. The most expensive
                thing I owned was the time I spent looking productive
                while not selling. I did not solve avoidance by trying
                harder, or by reading a better book on discipline. I
                solved it by building a tool that does not let me move
                forward without an outreach action logged. The same tool
                is what you are being offered access to here.
              </p>
            </div>
          </article>

          {/* SECRET 3 — EXTERNAL (slides 13–15) */}
          <article className="space-y-5">
            <Badge>Secret #3 — The External World</Badge>
            <h3 className="text-2xl font-bold leading-snug">
              Why a 60-day guarantee is even possible on software, when
              every other guarantee in this space is a lie.
            </h3>

            {/* Story — guarantee mechanics from workbook 01 §2:
                work conditions machine-verifiable, Stripe-verified result */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Story
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Most guarantees in this category fail the test the moment
                you ask them what they actually mean. They are written to
                feel good in the buying moment. They are not engineered to
                fire. The Machine&apos;s guarantee is different because it
                is not a copywriting flourish. It is a contract enforced
                by code. The work conditions are machine-verifiable: the
                tool watches Steps 1 through 5 and counts your outreach
                actions in its own logs. The result is Stripe-verified:
                the tool watches your connected Stripe account for a new
                paying customer. Nothing on either side is a self-report.
                You cannot lie to a log, and I cannot wriggle out of a
                Stripe webhook.
              </p>
            </div>

            {/* Strategy — economics */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Strategy
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The economics of the guarantee depend on the success rate
                of the Machine itself. If the Machine genuinely produces a
                first paying customer for most of the founders who finish
                the in-product work, the refund line item is bounded and
                the business survives. If it does not, the refunds force
                me to fix it or shut it down. Refunds are enforced by
                code, not by my willingness to honour them. That is the
                whole point.
              </p>
            </div>

            {/* Case Study — $98 two-payment cap */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Case Study
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The math survives at the design level. The maximum remedy
                is two months of $49 — $98 per refunding user. The Machine
                cannot cost the business more than $98 per refunding user.
                At any reasonable conversion rate, and given how few
                founders actually finish the in-product work, the business
                model survives even a high refund rate. That is the
                arithmetic that lets the guarantee exist in writing. That
                is the arithmetic no other tool in this category will
                run.
              </p>
            </div>
          </article>
        </section>

        <Separator className="my-12" />

        {/* Building Block #22 — Before / After. Makes the transformation
            concrete BEFORE the price reveal. */}
        <BeforeAfter />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 3 — THE STACK (slides 16–30)                            */}
        {/* Workbook 07 §3 — one Card per slide, NOT collapsed into one   */}
        {/* table. Stack itself + math + each bonus expanded.             */}
        {/* ============================================================ */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold">Here is what you get for $49.</h2>
          <p className="text-muted-foreground leading-relaxed">
            One core system. Three bonuses. One guarantee in writing. The
            full standalone math, in the open.
          </p>

          {/* Slide 16 — The Machine */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-2">
                <p className="font-bold">Slide 16 — The Machine</p>
                <p className="font-semibold whitespace-nowrap">$259 / mo</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The 7-step system itself. Pin dream customer, build offer,
                define Attractive Character, generate copy, generate
                outreach assets, do tracked outreach, Stripe-verified
                first paying customer. Locked order. Engine pushback on
                every step. The core product.
              </p>
            </CardContent>
          </Card>

          {/* Slide 17 — Bonus 1 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-2">
                <p className="font-bold">
                  Slide 17 — Bonus 1: The 14-Day First-Customer Sprint
                </p>
                <p className="font-semibold whitespace-nowrap">$89</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Step 5, the outreach step, is where customer-avoidant
                founders stall. The Sprint breaks it into one small
                tracked action per day for 14 days. Defeats the
                &ldquo;the mountain is too big&rdquo; objection.
              </p>
            </CardContent>
          </Card>

          {/* Slide 18 — Bonus 2 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-2">
                <p className="font-bold">
                  Slide 18 — Bonus 2: The Outreach Room
                </p>
                <p className="font-semibold whitespace-nowrap">$79 / mo</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-moderated peer community of post-launch pre-revenue
                founders doing outreach together, in the same room, at the
                same time. Defeats isolation — doing outreach alone is
                terrifying.
              </p>
            </CardContent>
          </Card>

          {/* Slide 19 — Bonus 3 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-2">
                <p className="font-bold">
                  Slide 19 — Bonus 3: The Outreach Script Kit
                </p>
                <p className="font-semibold whitespace-nowrap">$69</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Done-for-you messages and reply scripts per channel — X,
                Indie Hackers, r/SaaS, cold email — for the moment Step 5
                hands you a blank text box. Defeats the blank page.
              </p>
            </CardContent>
          </Card>

          {/* Slide 20 — TOTAL VALUE */}
          <Card className="border-primary/40">
            <CardContent className="pt-6 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Slide 20 — Total standalone value
              </p>
              <p className="text-3xl sm:text-4xl font-bold">$496</p>
            </CardContent>
          </Card>

          {/* Slide 21 — YOUR PRICE */}
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6 text-center">
              <p className="text-xs uppercase tracking-widest text-primary mb-2">
                Slide 21 — Your price
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-primary">
                $49 / mo
              </p>
            </CardContent>
          </Card>

          {/* Slide 22 — RATIO */}
          <Card className="border-primary/40">
            <CardContent className="pt-6 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Slide 22 — Value-to-price ratio
              </p>
              <p className="text-3xl sm:text-4xl font-bold">10.1×</p>
              <p className="text-xs text-muted-foreground italic mt-2">
                Honest math. Every line item is a defensible category
                comstory. A skeptic will check. The math holds.
              </p>
            </CardContent>
          </Card>

          {/* Slides 23–29 — bonuses expanded. Workbook 01 §2 logic. */}

          {/* Slide 23 — Machine, why it matters */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 23 — The Machine, what it does for you
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Most tools in this category assume you have already done
                the upstream work — that you know the customer, that you
                have an offer, that you know what to say. The Machine does
                not. It begins where the avoidance begins, and refuses to
                let you skip any step that an avoidant founder
                historically skips. The whole sequence ends at a real
                charge in your real Stripe.
              </p>
            </CardContent>
          </Card>

          {/* Slide 24 — Sprint, what it does */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 24 — The 14-Day Sprint, what it does for you
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Sprint is structure for the part of the work that
                makes you want to close the laptop. One action a day, 14
                days, every one of them logged. By day 14 you have done
                more outreach than 90% of the founders who said outreach
                does not work for them.
              </p>
            </CardContent>
          </Card>

          {/* Slide 25 — Sprint, why it matters */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 25 — Why the Sprint is included, not sold separately
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Because Step 5 is the failure point. Selling the
                anti-failure cure as a separate $89 product is the move of
                someone who has never watched a founder stall on outreach.
                It belongs inside the offer, not next to it.
              </p>
            </CardContent>
          </Card>

          {/* Slide 26 — Outreach Room, what it does */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 26 — The Outreach Room, what it does for you
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A live room of founders doing the same uncomfortable thing
                at the same time. You log in, you can see other founders
                sending their outreach in real time, you send yours, the
                room sees the count tick up. Aloneness is the biggest
                hidden cost of being a solo founder. The Room kills it
                during the only hours that matter — the ones where you
                might otherwise close the laptop.
              </p>
            </CardContent>
          </Card>

          {/* Slide 27 — Outreach Room, why it matters */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 27 — Why the Room is included, not sold separately
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Because community as an upsell becomes a $79/mo cost
                center the avoidant founder cancels first. Folded in, it
                is the room you are already in the day you need it most.
              </p>
            </CardContent>
          </Card>

          {/* Slide 28 — Script Kit, what it does */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 28 — The Script Kit, what it does for you
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Channel-specific scripts for the moment the cursor blinks
                on a blank message box. Cold email. Indie Hackers comment.
                r/SaaS DM. X reply. Plus reply scripts for the three or
                four responses you actually get. Nobody is in the mood to
                write outreach from scratch at 9pm.
              </p>
            </CardContent>
          </Card>

          {/* Slide 29 — Script Kit, why it matters */}
          <Card>
            <CardContent className="pt-6">
              <p className="font-bold mb-2">
                Slide 29 — Why the Kit is included, not sold separately
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Because a script kit on its own is a PDF nobody opens. In
                Step 5, the right script is pre-loaded at the moment of
                send. The Kit is muscle for the moment, not a deliverable
                you skim once.
              </p>
            </CardContent>
          </Card>

          {/* Slide 30 — Re-stack summary */}
          <Card className="border-primary/40 bg-muted/20">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Slide 30 — Re-stacked
              </p>
              <p className="text-base leading-relaxed">
                $496 of work, tools, and community for $49 a month, with a
                written 60-day guarantee enforced by code and capped at
                $98 of your money.
              </p>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Building Block #17 — Comparison Table. Marco counts the green
            checks. Polarity from workbook 01 §6 Beat 5 made visual. */}
        <ComparisonTable />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 4 — THE GUARANTEE IN WRITING                            */}
        {/* Workbook 01 §2                                                */}
        {/* ============================================================ */}
        <section className="mb-16">
          <Card className="border-primary/40">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  The 60-Day Guarantee, in writing
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Do the work the tool tracks. If 60 days pass and your
                connected Stripe shows no new paying customer, you get
                both months back, in full.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Timeframe.</strong> 60 days from your first
                    charge.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Work conditions.</strong> Machine-verified
                    in-product milestones only: Steps 1 and 2 complete,
                    copy generated in Step 4, outreach assets generated in
                    Step 5, at least 20 outreach actions logged in the
                    tool. You cannot lie to a log.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Result.</strong> Stripe-verified. The tool
                    watches your connected Stripe for a new paying
                    customer.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Remedy.</strong> Full refund of the two
                    monthly payments made inside the window. $98 maximum.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>
                    <strong>Judged.</strong> At the 60-day mark. The code
                    fires the refund. There is no &ldquo;please describe
                    your experience.&rdquo; There is no
                    email-the-founder.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Building Block #7 — Honest Testimonials (public-pain mirror).
            Marco recognizes himself in real founder quotes from
            strategy/dollar-objections.md. No fabricated testimonials. */}
        <HonestTestimonials />

        <Separator className="my-12" />

        {/* Building Block #21 — Founder Timeline. The Reluctant Hero arc
            (workbook 06 §2) made visible. External events left, internal
            shifts right. */}
        <FounderTimeline />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 5 — TRIAL CLOSES (slides 31–33)                         */}
        {/* Workbook 07 §3 — exactly three, soft yes questions            */}
        {/* ============================================================ */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Three honest questions before you keep reading.
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">
                Can you imagine your Stripe dashboard showing your first
                new paying customer in the next 60 days?
              </strong>
            </p>
            <p>
              <strong className="text-foreground">
                If a tool refused to let you skip the work that actually
                gets you paid, would you let it?
              </strong>
            </p>
            <p>
              <strong className="text-foreground">
                If the only risk is two months of $49, and even those come
                back if it does not work, what is the actual downside?
              </strong>
            </p>
          </div>
        </section>

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 6 — MINI CLOSES (slides 34–42)                          */}
        {/* Workbook 07 §3 — Categories 1, 2, 3 = 9 closes total.         */}
        {/* Category 4 (urgency / scarcity, slide 43) is REJECTED.        */}
        {/* ============================================================ */}
        <section className="space-y-8 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold">Nine more things to weigh.</h2>

          {/* Category 1 — Risk Reversal (slides 34–36) */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Category 1 — Risk reversal
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 34 — Guarantee
                  </p>
                  <p className="text-sm leading-relaxed">
                    If you do the work the tool tracks and your Stripe
                    shows no new paying customer in 60 days, you get the
                    $98 back. In writing.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 35 — Reverse risk
                  </p>
                  <p className="text-sm leading-relaxed">
                    We carry the risk. You do not. That is the whole
                    reason the guarantee is there.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 36 — Stake
                  </p>
                  <p className="text-sm leading-relaxed">
                    If you do not try, you will be in the same place in
                    60 days. The cost of doing nothing is the cost of
                    staying stuck.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Category 2 — Logic (slides 37–39) */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Category 2 — Logic
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 37 — Math
                  </p>
                  <p className="text-sm leading-relaxed">
                    $49 a month is two coffees a week. The first paying
                    customer at your current product price covers it for
                    a year.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 38 — Comparison
                  </p>
                  <p className="text-sm leading-relaxed">
                    A course costs $497, no guarantee, no
                    doing-environment, no Stripe integration. $49 a month
                    with a 60-day guarantee is a 10× better offer.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 39 — ROI
                  </p>
                  <p className="text-sm leading-relaxed">
                    If The Machine produces ONE recurring customer at
                    your price, the math is permanent.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Category 3 — Emotion (slides 40–42) */}
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Category 3 — Emotion
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 40 — Story re-anchor
                  </p>
                  <p className="text-sm leading-relaxed">
                    Remember the flat Stripe line. Remember the ritual of
                    refresh-tweak-close. Remember what you wanted when
                    you first launched.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 41 — Identity
                  </p>
                  <p className="text-sm leading-relaxed">
                    Pick: you can be a praised builder for another year,
                    or you can be a Verified Builder by August.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Slide 42 — Future pacing
                  </p>
                  <p className="text-sm leading-relaxed">
                    Picture the next conversation when someone asks how
                    the launch is going. Picture saying &ldquo;we got our
                    first paying customer last week.&rdquo; That sentence
                    is what you are buying.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Category 4 — deliberately rejected. Workbook 07 §3. */}
          <p className="text-xs text-muted-foreground italic">
            There is no countdown timer on this page. There is no
            &ldquo;3 seats left.&rdquo; The avatar is a skeptic and fake
            scarcity destroys trust faster than it sells. The only
            urgency is in slide 36 above: another year of the flat line
            is expensive in a way the $98 cap is not.
          </p>
        </section>

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 7 — FAQ                                                 */}
        {/* Workbook 06 §4 — six External Belief rewrites verbatim        */}
        {/* (5 originals + "build it myself" from dollar-objections.md)   */}
        {/* ============================================================ */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Six things you might be telling yourself right now.
          </h2>

          {/* MACHINE_SALES_FAQS is the single source of truth — the same
              constant feeds the FAQPage JSON-LD rendered at the top of the
              page. Any copy edit here MUST happen in lib/faqs.ts; the
              schema/DOM-divergence trap (penalty under Google structured-data
              policy + lowers AI Overview pickup) is exactly what shared data
              prevents. */}
          <div className="space-y-6">
            {MACHINE_SALES_FAQS.map((item) => (
              <div key={item.q}>
                <p className="font-bold">&ldquo;{item.q}&rdquo;</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 8 — DISQUALIFIER + FINAL CTA                            */}
        {/* Workbook 01 §6 Beat 5 polarity AGAINST                        */}
        {/* ============================================================ */}
        <section className="mb-12">
          <p className="text-sm text-muted-foreground italic mb-8">
            This is not for you if you have not shipped anything yet. Go
            ship first. Come back when your Stripe is flat.
          </p>

          <div className="text-center space-y-4">
            <CheckoutButton
              priceType="machine"
              surface="machine_sales"
              className="text-base sm:text-lg h-auto px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto whitespace-normal leading-tight"
            >
              Start the Machine — $49/mo, 60-day guarantee
            </CheckoutButton>
            <p className="text-xs text-muted-foreground">
              Cancel anytime. No long-term contract. The guarantee
              covers both monthly payments.
            </p>
            <p className="text-xs text-muted-foreground">
              Or start at{" "}
              <Link href="/starter" className="underline underline-offset-4">
                $1
              </Link>{" "}
              and upgrade once Steps 1 and 2 are done.
            </p>
            <p className="text-sm text-muted-foreground italic pt-4">
              — Maryan
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
