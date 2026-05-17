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
import { ValueLadderDiagram } from "@/components/blocks/value-ladder-diagram";
import { DisqualifyingCopy } from "@/components/blocks/disqualifying-copy";
import { FounderPs } from "@/components/blocks/founder-ps";
import { PrintPageLink } from "@/components/print-page-link";
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
              01 §6 Beat 3 Parable 3 (SEO escape hatch). */}
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
          <p className="text-muted-foreground leading-relaxed mb-6">
            Here are the three things you have to believe for The Machine
            to work for you.
          </p>

          {/* Polarity AGAINST line under the Big Domino — Funnel Hacker's
              Cookbook v3 Action Matrix Row 13 closure. Workbook 01 §6 Beat
              5 enemy sentence belongs on every long-form surface; cold
              traffic reading the Big Domino needs the polarity that earned
              the right to make a 60-day claim. Italic + smaller weight so
              the AGAINST line reads as a footnote-to-belief, not a second
              headline. */}
          <p className="text-sm italic text-muted-foreground leading-relaxed border-l-2 border-muted pl-4">
            The problem stuck founders have is not the product. It is that
            an entire industry profits from teaching them to keep building
            when the only thing left is to sell.
          </p>
        </section>

        {/* ============================================================ */}
        {/* JUMP-NAV — Brunson long-form discipline (DCS Secret #22).     */}
        {/* A 1000-line sales page needs entry points. The skeptic-avatar */}
        {/* often skips to the FAQ or the guarantee first; if they cannot */}
        {/* navigate, they bounce. Hidden in print so the saved artifact   */}
        {/* reads like a clean letter.                                     */}
        {/* ============================================================ */}
        <nav
          aria-label="Jump to a section"
          className="print:hidden mb-12 rounded-lg border border-border/60 bg-muted/30 px-4 py-3 sm:px-5 sm:py-4"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2">
            What this page covers
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <li>
              <a
                href="#secrets"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Three Secrets
              </a>
            </li>
            <li>
              <a
                href="#stack"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                What you get for $49
              </a>
            </li>
            <li>
              <a
                href="#guarantee"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                The 60-day guarantee
              </a>
            </li>
            <li>
              <a
                href="#faq"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                FAQ
              </a>
            </li>
            <li>
              <a
                href="#disqualifier-heading"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Who this is not for
              </a>
            </li>
            <li>
              <a
                href="#checkout"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Start the Machine
              </a>
            </li>
          </ul>
        </nav>

        {/* Building Block #20 — Social Proof Bar (honest variant). */}
        <SocialProofBar />

        <Separator className="my-12" />

        {/* Building Block #20 — Founder VSL. Long-form 3:45 cut per Brunson
            Secret #20 chapter discipline: long-form sales pages get the full
            master VSL, not the 110s kinetic compact. When the operator pushes
            NEXT_PUBLIC_VSL_MASTER_URL, the master recording auto-replaces the
            fallback. Per-cut JSON-LD VideoObject activates simultaneously. */}
        <VslBlock surface="machine_sales" cut="full_long_form" />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 2 — THREE SECRETS (slides 7–15)                         */}
        {/* Workbook 07 §2 — Vehicle, Internal, External                  */}
        {/* Each: Story / Strategy / Case Study explicitly labelled.      */}
        {/* ============================================================ */}
        <section id="secrets" className="space-y-14 mb-16 scroll-mt-8">
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

            {/* Case Study — HONEST: founder self-application, three
                verifiable artifacts, dated window, falsifiable mechanism.
                The customer-side beat is kept as an explicit upgrade slot,
                not a placeholder. Brunson Hard-Rule: no fabricated wins. */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Case Study
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The first founder to run The Machine end-to-end was me, on
                this product, between January and May 2026. Three artifacts
                make that falsifiable, not a story.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>One — the offer itself.</strong> Step 1 produced
                Marco: 36, non-engineer, shipped with Lovable, flat Stripe
                line, the first dream customer I had ever written specific
                enough to argue with. Step 2 produced the $496 stack at
                $49/mo with the 60-day guarantee that you are reading right
                now. Both came out of the engine pushback, not out of a
                copywriting session. The full chain of work is auditable
                in the workbook files at{" "}
                <code className="text-xs">strategy/workbooks/01-sales-funnel-secrets.md</code>{" "}
                §1–§2.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>Two — the voice.</strong> The Reluctant-Hero voice
                this whole page is written in is Step 3 output. The same
                engine that will ask you about your origin asked me, and
                the answer became the six-line founder intro on the funnel
                hub, the five named parables in the Soap Opera Sequence,
                and the four character flaws on the about page. Every
                surface in the brand is the same voice because one engine
                produced all of them.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>Three — the guarantee is not policy.</strong> It
                is a Stripe webhook listening for{" "}
                <code className="text-xs">checkout.session.completed</code>{" "}
                on the customer&apos;s connected account. If 60 days pass
                from the first charge AND the in-product outreach
                milestones are met AND no new paying customer appears, the
                refund issues without me touching it. The mechanism lives
                at{" "}
                <code className="text-xs">app/src/lib/guarantee.ts</code>{" "}
                and the webhook handler at{" "}
                <code className="text-xs">app/src/app/api/webhooks/stripe</code>.
                A guarantee enforced by code is a different kind of
                promise than a guarantee enforced by my willingness to
                honour it.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <em>
                  The customer-side proof beat is empty by design. The day
                  the first founder runs The Machine end-to-end and the
                  Stripe webhook fires for their first paying customer,
                  this paragraph upgrades with their initials (or full
                  name if they prefer), the dollar amount of the first
                  charge, and the exact date. Until then it stays blank
                  on purpose, so you can see the difference between a
                  page that waits for proof and a page that invents it.
                </em>
              </p>
            </div>

            {/* Inline trial close after the Vehicle Secret.
                Workbook 07 §4 trial close #3. Brunson canon: trial closes
                fire after each major belief beat, not in a single clumped
                section. This one ladders the reader's own history of
                buying tactics they did not use. */}
            <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-4 leading-relaxed">
              Have you ever bought a course because you wanted permission to
              keep planning?
            </p>
          </article>

          {/* SECRET 2 — INTERNAL (slides 10–12) */}
          <article className="space-y-5">
            <Badge>Secret #2 — The Internal Belief</Badge>
            <h3 className="text-2xl font-bold leading-snug">
              Why the work that breaks the flat line is work you have been
              avoiding, and how The Machine removes the avoidance option.
            </h3>

            {/* Story — Parable 2 (Stripe Refresh) + Parable 3 (SEO Escape
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

            {/* Case Study — TWO honest case studies stacked. Founder's
                own SEO year + the synthesized 10-founder pattern. Names
                withheld pending release-form consent (Brunson Hard-Rule:
                no fabricated testimonials, including by composite). */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Case Study
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                There are two case studies for this Secret, and they are
                both honest.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>The first is mine.</strong> I ran the avoidance
                ritual for about a year — roughly 250 evenings of
                refresh-tweak-close, plus the SEO/AEO/GEO escape hatch
                stacked on top. Across that year I shipped zero new
                customers on the products I was avoiding selling. I did
                not solve avoidance by trying harder, by reading a better
                book on discipline, or by writing a new morning page. I
                solved it by building a tool that will not let me move
                forward without an outreach action logged. The same tool
                is what you are being offered access to here.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>The second is the pattern from 10+ founders I
                sat with</strong> across the same twelve months —
                non-engineers who shipped with Lovable, Cursor, Replit,
                or Claude Code, each with between 2 and 30 users and
                between 0 and 4 paying customers. Every one of them had
                the same Step-5 shape: they could describe their product
                in detail, they could not name one specific person they
                had pitched in the last thirty days, and their next move
                was always &ldquo;more building&rdquo; or &ldquo;more
                traffic&rdquo; — never &ldquo;more conversations.&rdquo;
                I am withholding names because none of them have signed
                a release form for a sales page; the synthesis that
                shaped the Internal Belief rewrites this page leans on
                lives at{" "}
                <code className="text-xs">strategy/workbooks/06-creating-belief.md</code>{" "}
                §3 if you want to audit how the pattern became the
                product. The pattern is what I am betting the guarantee
                against.
              </p>
            </div>

            {/* Inline trial close after the Internal Secret.
                Workbook 07 §4 trial close #9 — the one that catches Marco
                in his own avoidance pattern. The italics + soft border
                signal "honest question, not a sales line." */}
            <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-4 leading-relaxed">
              Do you suspect you have been avoiding the customer?
            </p>
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

            {/* Case Study — explicit refund-rate breakeven math + public
                commitment to publish quarterly refund metrics at a real
                URL. The commitment is backed by a live stub at
                /transparency/q1-2027 so the promise is not vaporware. */}
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                The Case Study
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The math survives at the design level, and I will show you
                both halves of it.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>The cap.</strong> The maximum remedy is two months
                of $49 — $98 per refunding user — written into the offer,
                into Stripe, and into the refund code path. The Machine
                cannot cost the business more than $98 per refunding user.
                That is the ceiling on the downside.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                <strong>The worst-case arithmetic.</strong> Imagine 100
                founders subscribe, every one of them completes the
                in-product work, and 80% of them still fail to get a first
                paying customer in 60 days. That is the worst plausible
                cohort. The refund line item is 80 × $98 = $7,840 against
                100 × $98 collected = $9,800. The business clears $1,960
                on the worst cohort. Not a number to celebrate; a number
                that means the doors stay open while I fix what is
                broken. At a realistic completion rate — closer to 40%
                actually finish Step 5 because outreach is the avoidance
                disease — the refund rate compresses and the business
                clears comfortably.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>The public commitment.</strong> I will publish the
                actual refund rate every calendar quarter, as four honest
                numbers: cohort size, Step-5 completion rate,
                verified-customer rate, refund rate. The first quarterly
                report goes live at{" "}
                <Link
                  href="/transparency/q1-2027"
                  className="underline underline-offset-4"
                >
                  /transparency/q1-2027
                </Link>{" "}
                — the page exists today as a stub that names the schedule
                and the numbers it will carry, so the commitment is not
                vaporware. If the worst-case math turns out to be the
                real math, you will see that before you buy a second
                month.
              </p>
            </div>

            {/* Inline trial close after the External Secret.
                Workbook 07 §4 trial close #11. Pure mechanical math
                question — the only close that lands on a skeptic after
                the refund-rate breakeven block. */}
            <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-4 leading-relaxed">
              Would a $98 cap on a 60-day risk be acceptable for the chance
              of recurring revenue?
            </p>
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
        <section id="stack" className="space-y-6 mb-16 scroll-mt-8">
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
                comparable. A skeptic will check. The math holds.
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
        <section id="guarantee" className="mb-16 scroll-mt-8">
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
        <section id="faq" className="space-y-6 mb-16 scroll-mt-8">
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
        {/* BLOCK 7.5 — VALUE LADDER DIAGRAM                              */}
        {/* DCS Secret #2 — the next-yes must be visible BEFORE the buy.  */}
        {/* Rendered after the FAQ so the reader knows what they are      */}
        {/* climbing into, not after the buy when it is too late. Gated   */}
        {/* Rung 3 links to /repeatable with the build gate stated.       */}
        {/* ============================================================ */}
        <ValueLadderDiagram
          heading="Where the $49 sits in the ladder"
          intro={
            <>
              You are about to buy Rung 2. Here is the rung above it (spec
              public, build gated on three verified Core cycles) and the
              one above that (deferred). Brunson rule: no fake doors.
            </>
          }
          highlight={2}
          compact
        />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 8 — DISQUALIFIER                                        */}
        {/* Workbook 01 §6 Beat 5 polarity AGAINST. The previous single-  */}
        {/* line disqualifier shipped one axis (wrong stage). Brunson     */}
        {/* canon: at least three disqualifying gates — stage, format,    */}
        {/* outcome. The shared <DisqualifyingCopy /> already ships five  */}
        {/* gates, so we mount it here instead of re-rolling inline.      */}
        {/* ============================================================ */}
        <DisqualifyingCopy />

        <Separator className="my-12" />

        {/* ============================================================ */}
        {/* BLOCK 9 — FINAL CTA CLUSTER                                   */}
        {/*                                                               */}
        {/* Brunson "rule of three" risk-reversal: stated once above the  */}
        {/* fold (the headline), once mid-page (the guarantee block),     */}
        {/* once above the final CTA (here). The Stake close (Workbook    */}
        {/* 07 §3 Cat 1 slide 36) fires here too — emotional cost of      */}
        {/* doing nothing is the only urgency the skeptic-avatar accepts. */}
        {/* Pre-checkout microcopy kills checkout-page anxiety (DCS       */}
        {/* Building Block #14).                                          */}
        {/* ============================================================ */}
        <section id="checkout" className="mb-12 scroll-mt-8">
          {/* Risk reversal restated — tight one-liner above CTA. */}
          <div className="flex items-start gap-3 mb-5 rounded-md border border-emerald-300/60 bg-emerald-50/60 px-4 py-3">
            <ShieldCheck
              className="h-5 w-5 text-emerald-700 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm text-emerald-950 leading-snug">
              <strong>Your downside is capped at $98.</strong> Run the
              Machine. If 60 days pass with no Stripe-verified paying
              customer, both monthly payments come back automatically —
              enforced by code, not by my willingness to honour it.
            </p>
          </div>

          {/* Stake close (slide 36) — restated here so the emotional
              cost lands at the decision moment, not 800 lines upstream. */}
          <p className="text-sm text-foreground leading-relaxed mb-8 italic">
            If you do not try, you will be in the same place in 60 days.
            The cost of doing nothing is the cost of staying stuck.
          </p>

          <div className="text-center space-y-4">
            <CheckoutButton
              priceType="machine"
              surface="machine_sales"
              className="text-base sm:text-lg h-auto px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto whitespace-normal leading-tight"
            >
              Start the Machine — $49/mo, 60-day guarantee
            </CheckoutButton>

            {/* Pre-checkout microcopy — Brunson canon "what happens when
                you click." Kills checkout-page anxiety the moment before
                the buyer leaves the page. Three short lines, no fluff. */}
            <div className="mx-auto max-w-md text-left text-xs text-muted-foreground space-y-1 pt-2 print:hidden">
              <p>
                <strong className="text-foreground">When you click:</strong>{" "}
                you go to a secure Stripe checkout page on{" "}
                <code className="text-[10px]">checkout.stripe.com</code>.
              </p>
              <p>
                <strong className="text-foreground">$49 charges today.</strong>{" "}
                The 60-day clock starts at the moment of charge. Cancel
                anytime — no long-term contract.
              </p>
              <p>
                <strong className="text-foreground">Then:</strong> you land
                on Machine Step 1 with the engine asking the first question.
                No onboarding video to skip.
              </p>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Or start at{" "}
              <Link href="/starter" className="underline underline-offset-4">
                $1
              </Link>{" "}
              and upgrade once Steps 1 and 2 are done.
            </p>

            {/* PWP — Brunson Perfect Webinar Print discipline. The
                skeptic saves the page to read offline, share with a
                partner, or revisit before buying. Hidden in print so
                the saved artifact does not include the "print this
                page" button. */}
            <div className="pt-3 print:hidden">
              <PrintPageLink />
            </div>

            <p className="text-sm text-muted-foreground italic pt-4">
              — Maryan
            </p>
          </div>
        </section>

        {/* ============================================================ */}
        {/* BLOCK 10 — PS                                                 */}
        {/* Brunson sales-letter rule: the PS is the second-most-read     */}
        {/* piece of copy on a long-form page, after the headline. The    */}
        {/* shared <FounderPs /> restates the asymmetric stake (free      */}
        {/* diagnostic, no card, signed) and gives the page a true        */}
        {/* letter close instead of ending on the signature line.         */}
        {/* ============================================================ */}
        <FounderPs />

        {/* PWP footer — only renders in print. Tells whoever holds the
            paper or PDF where the live page lives, in case they share
            the artifact and the recipient wants to actually buy. */}
        <p className="hidden print:block text-xs text-muted-foreground italic text-center mt-8 pt-4 border-t border-border">
          Printed from https://unlocksaas.com/machine-sales — the live page
          has the working checkout button and the current refund-rate
          transparency report.
        </p>
      </div>
    </div>
  );
}
