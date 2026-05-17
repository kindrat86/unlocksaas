import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { ParablesOptIn } from "./parables-opt-in";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";

// Stable literal — DO NOT replace with `new Date()`. Article.datePublished
// must be a real-world publish date the editorial commits to; a per-build
// timestamp signals "edited every deploy" noise to crawlers and LLMs.
// Bump dateModified separately when the editorial actually changes.
const PARABLES_PUBLISHED_AT = "2026-05-17";
const PARABLES_URL = "https://unlocksaas.com/parables";

export const metadata: Metadata = {
  title: "Five Parables for the Flat Stripe Line — Unlock SaaS",
  description:
    "Five short stories about the work non-engineer founders skip — the Blank Offer Page, the Stripe Refresh, the SEO Escape Hatch, the Mirror in Ten Founders, the Door That Opened. Read free. No email required.",
  alternates: { canonical: "/parables" },
  openGraph: {
    title: "Five Parables for the Flat Stripe Line",
    description:
      "Why your launch went flat, in five short stories. Read free.",
    type: "article",
    url: "/parables",
    publishedTime: PARABLES_PUBLISHED_AT,
    authors: ["Maryan"],
  },
  robots: { index: true, follow: true },
};

// Marketing page can be statically generated; the form is a client island.
export const dynamic = "force-static";

/**
 * The Reverse Squeeze (DotCom Secrets Secret 14, reverse variant).
 *
 * Brunson's rule:
 *   - Normal squeeze: email FIRST, content second.
 *   - Reverse squeeze: content FIRST (free, no gate), email second — and
 *     only after the visitor has already enjoyed the value.
 *
 * Why it converts where the normal squeeze does not: the reader has already
 * accepted that the Reluctant Hero has something true to say. The opt-in is
 * "more of this," not "trust me with your email for a thing you have not
 * seen yet."
 *
 * Structure:
 *   1. Tiny preface — frame what the parables are and why they exist.
 *   2. Five parables in full, in workbook order. No gate, no fragments.
 *   3. Mid-content opt-in after parable 3 — soft, "want the diagnostic by
 *      email plus the rest of the story?"
 *   4. End-content opt-in after parable 5 — strong, "want the 5-email
 *      Soap Opera Sequence?"
 *   5. Bridge to the $1 Starter for readers who skip the opt-in.
 *
 * Source: strategy/workbooks/01-sales-funnel-secrets.md §6 Beat 3 (the five
 * named parables) + strategy/workbooks/04-building-your-funnels.md §5 (the
 * Soap Opera Sequence the opt-in routes into).
 */
export default function ParablesReverseSqueezePage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/GEO) — strategy/google-strategy.md §B.2.
          Article schema gives LLMs a typed editorial node with author +
          publisher anchored to the Organization/Person graph. BreadcrumbList
          lets Google render breadcrumb sitelinks in SERPs and gives LLMs a
          navigational hint about where this page sits relative to the hub. */}
      <ArticleJsonLd
        headline="Five Parables for the Flat Stripe Line"
        description="Five short stories about the work non-engineer founders skip — the Blank Offer Page, the Stripe Refresh, the SEO Escape Hatch, the Mirror in Ten Founders, the Door That Opened."
        url={PARABLES_URL}
        datePublished={PARABLES_PUBLISHED_AT}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "Five Parables", url: PARABLES_URL },
        ]}
      />
      <AbExposureBeacon />
      <article className="max-w-2xl mx-auto">
        {/* PREFACE */}
        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Five parables
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            What I tell other founders before I show them the Machine.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            These are the five stories I keep coming back to in DMs, in calls,
            and in my own head when I am avoiding the work. They are not
            tactics. They are the order I had to learn the hard way.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            No email gate. Read all five. The opt-in is in the middle and at
            the end if you want what comes after.
          </p>
        </header>

        <Separator className="my-10" />

        {/* PARABLE 1 — The Blank Offer Page */}
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Parable one
          </p>
          <h2 className="text-2xl font-bold mb-4">The Blank Offer Page</h2>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              I sat down to write the offer page for the product I had spent
              three months shipping. I had the headline component. I had the
              feature grid. I had the pricing block. I opened the Google Doc
              for the actual promise and stared at a blank cursor for forty
              minutes.
            </p>
            <p>
              I knew the features. I knew the architecture. I knew the AI
              models under the hood. I could not write the sentence that said
              what one specific person would walk away with, by when, and what
              they were paying for. Not because I was a bad writer. Because
              the answer did not exist yet. I had built the product before I
              had earned the right to write that sentence.
            </p>
            <p>
              That is the moment I started suspecting the order was wrong.
            </p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-foreground">
            If you cannot write your offer in one sentence, to one real person,
            you have not earned the right to build the product.
          </blockquote>
        </section>

        <Separator className="my-10" />

        {/* PARABLE 2 — The Stripe Refresh */}
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Parable two
          </p>
          <h2 className="text-2xl font-bold mb-4">The Stripe Refresh</h2>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              For about a month after I launched, my Stripe dashboard had a
              tab open in my browser at all times. I would refresh it between
              tasks. Between meetings. While I was waiting for water to boil.
              The line stayed flat. Every refresh confirmed it.
            </p>
            <p>
              I told myself I was checking on the business. I was not. I was
              hoping a number would appear that would let me skip the
              uncomfortable part — the part where I have to talk to someone
              who has not yet decided to pay. The refresh was the cheapest
              substitute for the work that would have made the line move.
            </p>
            <p>
              I added it up later. I was refreshing Stripe forty to sixty
              times a day. None of those refreshes generated a single dollar.
              The day I started counting was the day I started to suspect
              that &ldquo;working on the business&rdquo; and &ldquo;doing the
              work&rdquo; were not the same thing.
            </p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-foreground">
            The daily activity of &ldquo;working on it&rdquo; is the most
            expensive way to avoid the actual work.
          </blockquote>
        </section>

        <Separator className="my-10" />

        {/* PARABLE 3 — The SEO Escape Hatch */}
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Parable three
          </p>
          <h2 className="text-2xl font-bold mb-4">The SEO Escape Hatch</h2>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              When the Stripe Refresh got too painful, I needed a way out
              that did not feel like quitting. I found one. It was called
              SEO.
            </p>
            <p>
              For almost a year, I told myself I was driving traffic. I
              learned topic clusters. I learned schema markup. I built a
              programmatic page generator. I redesigned my sitemap three
              times. I read every Aleyda Solis post that had ever been
              written. None of it produced a single new paying customer for
              the product I had already shipped. All of it produced the
              appearance of someone who was working hard.
            </p>
            <p>
              That was the trick. SEO let me be visibly productive in front
              of a problem that needed to be solved by an uncomfortable
              conversation, not a keyword. Nobody could call me lazy. I
              looked like a founder who was grinding. I was a founder who was
              hiding.
            </p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-foreground">
            Productive work is the best-camouflaged form of avoidance, because
            nobody, including you, can call you out for it.
          </blockquote>
        </section>

        {/* MID-CONTENT OPT-IN — soft, after the reader has already received
            three full parables of value. Brunson rule: ask at the moment of
            highest perceived value, not at the moment of highest commitment
            anxiety. */}
        <Card className="mb-12 border-primary/30">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Halfway through
            </p>
            <h3 className="text-xl font-bold mb-3">
              Want me to read your live page next?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              You have read three of the five. If you want the other two by
              email plus the same diagnostic I run on every founder I talk
              to — paste your address. The diagnostic is free, the parables
              keep coming, and the only thing you will get from me afterward
              is one short note a day for the rest of the week.
            </p>
            <ParablesOptIn
              placement="mid_content"
              ctaLabel="Send me the rest plus the diagnostic"
              trustLine="One short email a day for five days. Reply STOP to unsubscribe. No course pitch, no countdown timer, no second opt-in."
            />
          </CardContent>
        </Card>

        <Separator className="my-10" />

        {/* PARABLE 4 — The Mirror in Ten Founders */}
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Parable four
          </p>
          <h2 className="text-2xl font-bold mb-4">
            The Mirror in Ten Founders
          </h2>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              The SEO Escape Hatch did finally collapse. The way it collapsed
              was that I started talking to other founders. Not interviews.
              Not customer development sessions. Just conversations. Ten of
              them, across a few weeks, all post-launch, all pre-revenue, all
              non-engineers who had shipped real things with Lovable or
              Claude.
            </p>
            <p>
              Every single one told me my story back. The same flat line. The
              same drift into tactics. The same conviction that the next
              feature, the next pricing tweak, the next traffic source, was
              the missing piece. The same blank look when I asked them to
              describe the one person their product was actually for.
            </p>
            <p>
              I could not see my own pattern. I could see all ten of theirs
              in about an hour. That asymmetry broke the spell. The way out
              was not a better tactic. The way out was the work I had
              skipped: name one person, write one promise, sell it before it
              felt ready.
            </p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-foreground">
            You will not see your own pattern until you hear it in someone
            else&apos;s mouth.
          </blockquote>
        </section>

        <Separator className="my-10" />

        {/* PARABLE 5 — The Door That Opened */}
        <section className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Parable five
          </p>
          <h2 className="text-2xl font-bold mb-4">The Door That Opened</h2>
          <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
            <p>
              For most of my life, I could not have shipped any of those
              products. Building software was a closed door for me. I am not
              an engineer. I have never written a line of production code in
              anger.
            </p>
            <p>
              In 2026, Lovable and Claude opened that door. I walked through
              it. I shipped real AI products in weeks. The shipping part was
              not the hard part. It was magic. The hard part was what came
              after — the part that had never been hard for engineers
              either, because they were always too busy building to notice
              that selling was the thing nobody had built a tool for.
            </p>
            <p>
              The bottleneck moved. Building got solved. Selling did not. For
              the first time in my life, the thing standing between me and
              recurring revenue was not my inability to write code. It was
              the work I had been told to skip — for years, by everyone — in
              favor of building more. The door that opened also exposed the
              work that nobody is doing.
            </p>
            <p>
              The Machine is what I built to do that work on myself. It is
              the tool I wish someone had handed me on day one of my flat
              line. I run it on me first. Then I let other people use it.
            </p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary pl-4 italic text-foreground">
            The bottleneck has moved. Building is solved. Selling has not
            been, and now it sits exposed.
          </blockquote>
        </section>

        <Separator className="my-10" />

        {/* END-CONTENT OPT-IN — stronger now. The reader has finished all
            five. The next ask is bigger because the value already delivered
            is bigger. */}
        <Card className="mb-12 border-primary/40">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              That is the five
            </p>
            <h3 className="text-xl font-bold mb-3">
              The next five are by email.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              These five are the parables. The next five days are the work
              they point at — one short note a day, in the same voice, that
              walks you from &ldquo;I have a flat line&rdquo; to &ldquo;I
              have a written offer for one specific person.&rdquo; If you
              want those five, the address below is the only thing that has
              to leave this page.
            </p>
            <ParablesOptIn
              placement="end_content"
              ctaLabel="Send me the next five days"
              trustLine="Day one arrives now. Days two through five at 9am each weekday. Reply STOP at any time. You will never get an upsell email — the upsell is on the page, not in the inbox."
            />
          </CardContent>
        </Card>

        <Separator className="my-10" />

        {/* BRIDGE — for the reader who does not want the email but does want
            the next door. */}
        <section className="mb-12 text-center">
          <h3 className="text-lg font-bold mb-3">
            Or skip the email and walk through the door directly.
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
            The $1 Starter is the same destination the five emails point at —
            just compressed. You finish your dream customer and your offer
            this week. Yours to keep. No subscription, no auto-upgrade, no
            email required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/starter"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-3 text-base font-medium"
            >
              Start the Machine for $1
            </Link>
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors px-6 py-3 text-base font-medium"
            >
              Run the free diagnostic first
            </Link>
          </div>
          {/* DCS Secret 19 third door — for the avoidant-Marco archetype who
              wants the work broken into one-a-day so he cannot postpone all of
              it. Same Day 14 destination ($1 Starter). Spec at
              strategy/decisions/challenge-funnel.md. */}
          <p className="mt-6 text-xs text-muted-foreground">
            Or take the{" "}
            <Link
              href="/challenge"
              className="underline underline-offset-4 hover:text-foreground"
            >
              free 14-Day First-Customer Sprint
            </Link>
            {" "}— one short email a day for 14 days, no card, no group.
          </p>
        </section>

        <footer className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            — Maryan. Founder, Unlock SaaS. Marketer, non-engineer, built a
            dozen AI products that nobody paid for. Then I figured out why.
          </p>
        </footer>
      </article>
    </div>
  );
}
