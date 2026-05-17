import { Suspense } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Search,
  FileText,
  BarChart3,
  Users,
  DollarSign,
  ShieldCheck,
  MessageSquare,
  Globe,
  Brain,
  Zap,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { MediaBar } from "@/components/blocks/media-bar";
import { AvatarWall } from "@/components/blocks/avatar-wall";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

/**
 * UnlockSaaS Funnel Hub — funnelfixer.site-mirrored structure.
 *
 * Section order matches the proven funnelfixer.site converter:
 *   1. Glassy nav (logo · login · gradient Get Started)
 *   2. Hero (pill badge · huge headline · gradient subhead · sparkle CTA card)
 *   3. SocialProofBar (existing honest 3-column structural proof)
 *   4. MediaBar (conditional — renders at >=3 earned mentions)
 *   5. Why I Built — Struggle / Epiphany / Solution
 *   6. Here's What You Get in 60 Days (4 checks + scarcity-replacement + zero-risk)
 *   7. Fix Without Guessing — 3-step process w/ numbered gradient tiles
 *   8. Built on the Brunson Stack — trilogy trust
 *   9. Here's the Deal — founder validation framing
 *  10. Pricing — Starter $1 vs Machine $49/mo
 *  11. 60-day Stripe-verified refund callout
 *  12. FAQ — existing 6 honest objections
 *  13. AvatarWall (conditional, >=9)
 *  14. NewsletterSignup (Soap Opera Day 0)
 *  15. Footer
 */
export default function FunnelHub() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      <OrganizationJsonLd />
      <AbExposureBeacon />

      {/* ---------------- GLASSY TOP NAV ---------------- */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-primary shadow-primary-glow">
              <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-foreground group-hover:text-indigo-600 transition-colors">
              Unlock SaaS
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-3 h-9 rounded-[10px] text-sm font-medium text-foreground hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/diagnostic"
              className="inline-flex items-center px-3 sm:px-4 h-9 rounded-[10px] text-sm font-semibold text-white bg-gradient-primary shadow-primary-glow hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <header className="relative bg-hero-wash overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint opacity-60" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-8">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Built on Russell Brunson&apos;s Secret Trilogy
          </div>

          {/* Huge tight headline — gradient on the punch phrase */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tighter text-foreground mb-6">
            Your first paying customer in{" "}
            <span className="text-gradient-primary">60 days</span>
            <br className="hidden sm:block" />
            {" "}or you do not pay.
          </h1>

          {/* Gradient subhead */}
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gradient-primary mb-6 leading-tight tracking-tight">
            A Machine for Non-Engineer Founders Who Shipped.
          </p>

          {/* Body */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            I&apos;m a marketer who shipped a dozen AI products with no-code
            tools. Stripe stayed flat on every one. Then I figured out why —
            and built the machine I wish I had.{" "}
            <span className="font-semibold text-foreground">— Maryan</span>
          </p>

          {/* Sparkle CTA card */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-indigo-500/5 p-6 sm:p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-primary">
                <Sparkles className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
              <p className="text-sm sm:text-base font-bold text-foreground">
                Start with the free Diagnostic
              </p>
            </div>
            <Button
              asChild
              className="h-auto w-full sm:w-auto sm:min-w-[420px] mx-auto bg-gradient-primary text-white text-base sm:text-lg font-bold rounded-2xl px-8 sm:px-12 py-4 sm:py-5 shadow-primary-glow hover:opacity-95 transition-opacity border-0"
            >
              <Link href="/diagnostic">
                Yes! Get My Free Diagnosis →
              </Link>
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                No card needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                2-minute teardown
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Brunson-stack analysis
              </span>
            </div>
          </div>

          {/* Reverse-squeeze for cold visitors (DCS Secret 14 reverse variant) */}
          <p className="mt-8 text-sm text-slate-600">
            Not ready?{" "}
            <Link
              href="/parables"
              className="font-bold text-indigo-700 underline underline-offset-4 decoration-2 hover:text-indigo-900"
            >
              Read the five parables first
            </Link>{" "}
            — free, no email required.
          </p>
        </div>
      </header>

      {/* ---------------- SOCIAL PROOF BAR (honest variant, no fake counts) ---------------- */}
      <SocialProofBar />

      {/* ---------------- MEDIA BAR (conditional, >=3 earned mentions) ---------------- */}
      <MediaBar />

      {/* ---------------- WHY I BUILT — Struggle / Epiphany / Solution ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-center text-foreground mb-12 sm:mb-16">
            Why I Built Unlock SaaS...
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 sm:space-y-10">
            {/* THE STRUGGLE */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 pb-8 sm:pb-10 border-b border-slate-100 last:border-0 last:pb-0">
              <span className="shrink-0 grid place-items-center h-12 w-12 rounded-xl bg-red-50 border border-red-100">
                <Zap className="h-6 w-6 text-red-500" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-red-500 mb-2">
                  The Struggle
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  A Dozen Products. One Flat Line.
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  I&apos;m a marketer, not an engineer. I shipped a dozen AI
                  products with Lovable, Bolt, and Cursor. I tweaked the copy,
                  the onboarding, the colours, the pricing. Stripe stayed flat
                  on every single one.
                </p>
              </div>
            </div>

            {/* THE EPIPHANY */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 pb-8 sm:pb-10 border-b border-slate-100 last:border-0 last:pb-0">
              <span className="shrink-0 grid place-items-center h-12 w-12 rounded-xl bg-amber-50 border border-amber-100">
                <Brain className="h-6 w-6 text-amber-500" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-amber-600 mb-2">
                  The Epiphany
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  It Wasn&apos;t a Build Problem.
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Then I re-read DotCom Secrets and Expert Secrets back-to-back.
                  I didn&apos;t have a product problem. I didn&apos;t have a
                  traffic problem. I had the problem nobody taught me to solve:
                  name one real person, make one real promise, sell it before
                  it felt ready.
                </p>
              </div>
            </div>

            {/* THE SOLUTION */}
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
              <span className="shrink-0 grid place-items-center h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-emerald-600 mb-2">
                  The Solution
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Unlock SaaS Was Born.
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  A machine, not a course. The 5 steps of the Brunson sales
                  stack, built into software you run yourself. Outreach
                  happens inside the tool. The refund is enforced by a Stripe
                  webhook — not by a &ldquo;tell us why you&apos;re unhappy&rdquo;
                  email I read at my leisure.
                </p>
              </div>
            </div>
          </div>

          {/* Transition callout */}
          <div className="mt-8 mx-auto max-w-2xl bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-4 text-center">
            <p className="text-base sm:text-lg font-bold text-foreground">
              Now it&apos;s your turn — get your first paying customer in 60 days.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- HERE'S WHAT YOU GET (in 60 days) ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-6">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              In Just 60 Days
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground">
              Here&apos;s What You Get:
            </h2>
          </div>

          {/* 4 checked rows */}
          <div className="space-y-4 mb-10">
            {[
              "A free 2-minute Diagnostic that names your one buyer and one promise",
              "A locked Brunson workbook — yours to keep whether you stay or not",
              "Five steps of the sales machine, built into software you run yourself",
              "Outreach happens INSIDE the tool — the job you keep avoiding becomes the job that gets done",
            ].map((line) => (
              <div
                key={line}
                className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 px-5 sm:px-6 py-4 sm:py-5"
              >
                <span className="shrink-0 grid place-items-center h-7 w-7 rounded-full bg-gradient-primary mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-white" aria-hidden="true" />
                </span>
                <p className="text-base sm:text-lg text-foreground font-medium leading-relaxed">
                  {line}
                </p>
              </div>
            ))}
          </div>

          {/* 2 side-by-side highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 sm:p-8 text-center">
              <span className="inline-grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 mb-4">
                <ShieldCheck className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                60-Day Stripe-Verified Refund
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Do the work, log outreach, and if Stripe shows no customer at
                day 60 —{" "}
                <span className="font-semibold text-foreground">
                  the code reads your account and refunds you the $98.
                </span>
              </p>
              <p className="text-sm text-slate-500 italic mt-2">
                In writing. Not theatre.
              </p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 sm:p-8 text-center">
              <span className="inline-grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4">
                <CheckCircle2 className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                Zero Risk. Zero Theatre.
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Diagnostic is free. No credit card. Starter is $1 and yours to
                keep.
              </p>
              <p className="text-sm text-slate-500 italic mt-2">
                Just the machine, revealed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FIX WITHOUT GUESSING — 3 step process ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-hero-wash relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-faint opacity-40" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-indigo-100 text-sm font-semibold text-indigo-700 mb-6">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Simple &amp; Fast
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-4">
              Get Paid Without Guessing —<br className="hidden sm:block" />{" "}
              in Under 60 Days
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              No course. No consultants. No overwhelm. Just the five steps
              that turn a shipped product into a paying customer.
            </p>
          </div>

          {/* 3 numbered step tiles with connecting line */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 mb-10">
            {/* Decorative connecting line on desktop */}
            <div
              className="hidden sm:block absolute top-[44px] left-[18%] right-[18%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200 -z-0"
              aria-hidden="true"
            />
            {[
              {
                num: 1,
                Icon: Globe,
                title: "Take the free Diagnostic",
                body: "Two minutes. Name your one buyer and your one promise.",
              },
              {
                num: 2,
                Icon: Sparkles,
                title: "Start the Machine for $1",
                body: "Locked Brunson workbook + your dream-100 picker. Yours to keep.",
              },
              {
                num: 3,
                Icon: FileText,
                title: "Run the 60-day Machine",
                body: "Outreach happens inside the tool. Refund enforced by Stripe webhook if Stripe stays flat.",
              },
            ].map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="relative inline-block mb-5">
                  <span className="grid place-items-center h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-primary shadow-primary-glow mx-auto">
                    <step.Icon className="h-9 w-9 sm:h-10 sm:w-10 text-white" aria-hidden="true" />
                  </span>
                  <span className="absolute -top-2 -right-2 grid place-items-center h-7 w-7 rounded-full bg-emerald-500 text-white text-xs font-bold border-2 border-white shadow-md">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                  Step {step.num}: {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          {/* Mid-page CTA */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl shadow-indigo-500/5 p-6 sm:p-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700 mb-4">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              First Diagnostic is FREE
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground mb-6">
              See what&apos;s broken before you ship one more thing nobody buys.
            </p>
            <Button
              asChild
              className="h-auto w-full sm:w-auto bg-gradient-primary text-white text-base sm:text-lg font-bold rounded-2xl px-8 sm:px-12 py-4 sm:py-5 shadow-primary-glow hover:opacity-95 transition-opacity border-0"
            >
              <Link href="/diagnostic">
                Get My Free Diagnosis →
              </Link>
            </Button>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-5 text-xs sm:text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                No card needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                2-minute teardown
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Brunson-stack analysis
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TRILOGY TRUST BLOCK ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
            What the Brunson Stack Reveals<br className="hidden sm:block" />{" "}
            About Your Funnel
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            Every Machine step is powered by the Secret Trilogy — DotCom
            Secrets, Expert Secrets, and Traffic Secrets — so you fix what&apos;s
            actually broken, not what&apos;s most visible.
          </p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <span className="shrink-0 grid place-items-center h-12 w-12 rounded-full bg-white border border-indigo-200">
                <Brain className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                This isn&apos;t surface-level stuff.
              </h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              These are the exact frameworks Russell used to scale ClickFunnels
              from zero to $100M. Now they&apos;re running inside the Machine —
              not as a course you watch, but as the next button you click.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- HERE'S THE DEAL — Founder Validation ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-center text-foreground mb-10">
            Here&apos;s the Deal.
          </h2>

          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <p className="text-base sm:text-lg text-slate-700">
              I&apos;m <span className="font-bold text-foreground">not</span>{" "}
              launching this with fake testimonials.
            </p>
            <p className="text-base sm:text-lg text-slate-700">
              I&apos;m <span className="font-bold text-foreground">not</span>{" "}
              faking urgency with a countdown timer that resets.
            </p>
            <p className="text-base sm:text-lg text-slate-700">
              I&apos;m <span className="font-bold text-foreground">not</span>{" "}
              hiding the empty &ldquo;As Seen In&rdquo; row.
            </p>
            <p className="text-base sm:text-lg text-slate-700 pt-4">
              I&apos;m doing what I wish someone had done for me back when my
              Stripe stayed flat:
            </p>
          </div>

          {/* 3 commitment cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {[
              { Icon: Search, title: "Building a tool.", body: "Not a course. Not a cohort." },
              { Icon: Sparkles, title: "Showing it raw.", body: "No funnel for the funnel." },
              { Icon: BarChart3, title: "Backing it with code.", body: "Refund enforced by Stripe webhook." },
            ].map((card) => (
              <div
                key={card.title}
                className="relative bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center"
              >
                <span className="absolute top-3 right-3 grid place-items-center h-6 w-6 rounded-full bg-emerald-500 border-2 border-white">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                </span>
                <span className="inline-grid place-items-center h-14 w-14 rounded-xl bg-gradient-primary shadow-primary-glow mb-4">
                  <card.Icon className="h-7 w-7 text-white" aria-hidden="true" />
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          {/* Validation framing */}
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
            <p className="text-base text-slate-700">
              Because before you spend $49 a month on the Machine...
            </p>
            <p className="text-base text-slate-700">
              I need to know one thing:
            </p>
            <p className="text-lg sm:text-xl font-bold text-foreground pt-4">
              Is this genuinely solving the problem stuck founders are willing
              to pay to fix?
            </p>
          </div>

          {/* Validation areas */}
          <p className="text-center font-bold text-foreground mb-6">
            I&apos;m validating in 3 areas:
          </p>
          <div className="space-y-4 max-w-2xl mx-auto mb-10">
            {[
              {
                Icon: Search,
                bg: "bg-indigo-50 border-indigo-100",
                iconColor: "text-indigo-600",
                title: "Idea Validation",
                body: "Is this solving the real “looks-good-but-doesn’t-sell” trap non-engineer founders are stuck in?",
              },
              {
                Icon: Users,
                bg: "bg-emerald-50 border-emerald-100",
                iconColor: "text-emerald-600",
                title: "Customer Validation",
                body: "Do they actually want a machine that does the outreach with them — not a course that teaches them how?",
              },
              {
                Icon: DollarSign,
                bg: "bg-amber-50 border-amber-100",
                iconColor: "text-amber-600",
                title: "Buyer Validation",
                body: "Will they pay $49/mo if it works — knowing the code refunds them automatically if Stripe stays flat?",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 px-5 sm:px-6 py-5"
              >
                <span className={`shrink-0 grid place-items-center h-12 w-12 rounded-xl border ${v.bg}`}>
                  <v.Icon className={`h-6 w-6 ${v.iconColor}`} aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="grid place-items-center h-5 w-5 rounded-full bg-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">
                      {v.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Closing pitch */}
          <div className="max-w-2xl mx-auto bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="grid place-items-center h-9 w-9 rounded-full bg-white border border-indigo-200">
                <MessageSquare className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              </span>
              <p className="text-base sm:text-lg font-bold text-foreground">
                If that&apos;s you — give the Machine a try.
              </p>
            </div>
            <p className="text-sm sm:text-base text-slate-700">
              The Diagnostic is free. No pressure. Just signal.
            </p>
            <p className="text-sm sm:text-base text-slate-700 mt-1">
              Help me prove this matters… or tell me where I missed the mark.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-4">
              Simple, <span className="text-gradient-primary">Transparent</span> Pricing.
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Start at $1. Upgrade when you&apos;ve felt it work. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* STARTER */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                Starter
              </h3>
              <p className="text-sm text-slate-600 mb-1">
                Perfect to get started
              </p>
              <p className="text-xs text-slate-500 italic mb-6">
                (Locked Brunson workbook + Diagnostic. Yours to keep.)
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-foreground">$1</span>
                <span className="text-slate-500">one-time</span>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Free Diagnostic (2 minutes)",
                  "Locked Brunson workbook — Steps 1–2",
                  "Dream-100 picker, pre-seeded",
                  "Email support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="shrink-0 grid place-items-center h-5 w-5 rounded-full bg-emerald-500 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-100 pt-4 mb-6">
                <ul className="space-y-2">
                  {[
                    "No 5-step Machine in-product",
                    "No outreach tracking",
                    "No 60-day Stripe-verified refund",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 opacity-70">
                      <span className="shrink-0 grid place-items-center h-5 w-5 rounded-full bg-red-100 mt-0.5">
                        <X className="h-3 w-3 text-red-500" aria-hidden="true" />
                      </span>
                      <span className="text-sm text-slate-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full mt-auto rounded-xl border-slate-300 text-foreground hover:bg-slate-50 font-semibold h-12"
              >
                <Link href="/starter">Start for $1</Link>
              </Button>
            </div>

            {/* MACHINE — Most popular */}
            <div className="relative bg-white rounded-2xl border-2 border-transparent p-6 sm:p-8 flex flex-col shadow-xl shadow-indigo-500/10"
                 style={{
                   backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #4346EF, #9B6AF1)",
                   backgroundOrigin: "border-box",
                   backgroundClip: "padding-box, border-box",
                 }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-primary shadow-md">
                Most Popular
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
                The Machine
              </h3>
              <p className="text-sm text-slate-600 mb-1">
                For builders ready to ship a customer
              </p>
              <p className="text-xs text-slate-500 italic mb-6">
                ($98 capped exposure over 60 days. Refunded by code if Stripe stays flat.)
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-bold text-foreground">$49</span>
                <span className="text-slate-500">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {[
                  "Everything in Starter",
                  "All 5 steps of the Machine in-product",
                  "Dream-100 outreach tracked inside the tool",
                  "Engine pushback when you skip a step",
                  "60-day Stripe-verified refund (code-enforced)",
                  "Verified Builder badge once you ship a customer",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="shrink-0 grid place-items-center h-5 w-5 rounded-full bg-gradient-primary mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full mt-auto rounded-xl bg-gradient-primary text-white font-semibold h-12 shadow-primary-glow hover:opacity-95 transition-opacity border-0"
              >
                <Link href="/machine-sales">Start the Machine — $49/mo</Link>
              </Button>
            </div>
          </div>

          {/* Guarantee callout */}
          <div className="mt-12 max-w-3xl mx-auto bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="grid place-items-center h-10 w-10 rounded-full bg-white border border-indigo-200">
                <ShieldCheck className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                60-Day Stripe-Verified Refund
              </h3>
            </div>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              If you complete Steps 1–5 in-product and log 20 outreach actions,
              and Stripe still shows no customer at day 60, the code reads your
              account and refunds the $98 automatically. No &ldquo;tell us why
              you&apos;re unhappy&rdquo; email. In writing.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ — honest objections ---------------- */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50/60 border-y border-slate-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-3">
              Honest Objections.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Mined from Indie Hackers and Hacker News threads written by
              founders matching the Marco avatar.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "I already have too many subscriptions.",
                a: "Start at $1, not $49. The Starter finishes your dream customer and your offer in a week and is yours to keep regardless of whether you upgrade.",
              },
              {
                q: "$49/mo is too much pre-revenue.",
                a: "Two coffees a week, $98 capped exposure over 60 days, refunded automatically if the work was done and Stripe shows no customer. Pre-revenue is the exact case the guarantee was written for.",
              },
              {
                q: "I have been burned by gurus.",
                a: "Same. This is not a course. The deliverable is software you run yourself. The refund is enforced by code — not by a “describe your experience” email I read at my leisure.",
              },
              {
                q: "Customers are MY problem, not the tool's job.",
                a: "Every other tool quietly agreed with you. The Machine does not. Outreach happens inside the tool, tracked. The job cannot be outsourced; it can be removed-from-your-willpower. That is the design.",
              },
              {
                q: "I could build this myself in a weekend.",
                a: "You could build the form. Not the Stripe-webhook proof, the Dream 100 picker fed from a locked workbook, the engine pushback, or the 60-day refund logic. And while you build the tool, you are not running the funnel — which is the exact disease the Machine treats.",
              },
              {
                q: "What if I do the work and still get no paying customer?",
                a: "Then the guarantee fires. The code reads your Stripe account at day 60. If you completed Steps 1–5 in-product and logged 20 outreach actions and the line is still flat, you get the two months ($98) back. In writing.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <summary className="cursor-pointer px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 list-none">
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    {item.q}
                  </span>
                  <svg
                    className="shrink-0 h-5 w-5 text-slate-400 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- AVATAR WALL (conditional, >=9 verified builders) ---------------- */}
      <Suspense fallback={null}>
        <AvatarWall />
      </Suspense>

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
            Not ready? Read the five-day arc first.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6">
            Founders who build real things with AI deserve to get paid for them.
            One short email a day for five days, written like a letter from one
            founder to another. Reply STOP anytime.
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="mt-auto py-10 px-4 sm:px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-slate-600 mb-3">
            <Link href="/builders" className="hover:text-foreground underline-offset-4 hover:underline">
              Verified Builder Directory
            </Link>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <Link href="/bridge" className="hover:text-foreground underline-offset-4 hover:underline">
              Came from a cold ad?
            </Link>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <a
              href="mailto:maryan@unlocksaas.com"
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              Contact Maryan
            </a>
          </p>
          <p className="text-xs text-slate-500">
            &copy; 2026 Unlock SaaS. Built by a non-engineer who shipped anyway.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Trained on DotCom Secrets · Expert Secrets · Traffic Secrets
          </p>
        </div>
      </footer>
    </div>
  );
}
