import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { FastLaneSqueezeForm } from "./fast-lane-form";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";

// Brunson spec source:
// - DotCom Secrets Chapter 14 (Lead Squeeze, canonical pattern)
// - workbook 04 §3 (squeeze copy) — fast-lane variant
// - workbook 01 §5 Hook #3 (pain mirror) compressed for ad / bio traffic
// - workbook 01 §6 Beat 2 (three-line about opener)
// - workbook 01 §6 Beat 5 (polarity AGAINST line as disqualifier)
//
// Why this page exists alongside /diagnostic and /parables:
//
//   /diagnostic  Survey Funnel (DCS Secret 15). 5-step micro-commitment.
//                Best for product-aware visitors who'll trade depth for a
//                labelled diagnosis. ~60 seconds. Wins on quality.
//
//   /parables    Reverse Squeeze (DCS Secret 14, reverse variant). Value
//                first, opt-in at mid- and end-content. Best for cold-but-
//                curious readers who need proof of voice before email.
//                ~6 minutes of reading.
//
//   /start       (THIS PAGE) Canonical Brunson Lead Squeeze (DCS Secret 14,
//                forward variant). One hook, one field, one CTA. Best for
//                cold ad traffic, podcast call-outs, X bio links, Indie
//                Hackers reply links, anywhere the friction must be zero or
//                the click dies. ~5 seconds.
//
// All three feed the same Day 0 Soap Opera Sequence. Different doors,
// same room. The DCS Chapter 14 close from 90 to 100 is fundamentally
// the existence of all three surfaces plus per-source measurement
// (supabase/views/squeeze_conversion.sql).

export const metadata: Metadata = {
  title: "The flat-Stripe-line emails — Unlock SaaS",
  description:
    "Five short emails over five days about the work non-engineer founders skip after they ship. Free. Reply STOP to unsubscribe.",
  alternates: { canonical: "/start" },
  openGraph: {
    title: "The flat-Stripe-line emails",
    description:
      "Five short emails over five days about the work non-engineer founders skip after they ship.",
    type: "website",
    url: "/start",
  },
  robots: { index: true, follow: true },
};

// Pure squeeze. No dynamic data on the server. Render statically — the
// form is a client island and posts to /api/soap-opera/subscribe.
// Brunson rule: a squeeze page is the page with the fewest moving parts
// on your entire site. Cache it like one.
export const dynamic = "force-static";

export default function FastLaneSqueezePage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "The Emails", url: "https://unlocksaas.com/start" },
        ]}
      />
      <AbExposureBeacon />

      <div className="max-w-xl mx-auto">
        {/* HERO — Hook #3 compressed. Workbook 01 §5.
            DCS Chapter 14 rule: the squeeze headline is the entire
            argument. If you cannot earn the email from this sentence
            alone, no body copy under it will save the page. */}
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The five emails
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            You shipped it. They said they loved it. Stripe is still flat.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Five short emails over five days about the work non-engineer
            founders skip after they ship — and the order I had to learn the
            hard way before my own Stripe line moved.
          </p>
        </header>

        {/* The one-field squeeze. Card-wrapped for visual focus parity
            with /diagnostic and /parables opt-ins. */}
        <Card className="mb-8 border-primary/30">
          <CardContent className="pt-6">
            <FastLaneSqueezeForm />
          </CardContent>
        </Card>

        {/* AC three-line about. Workbook 01 §6 Beat 2.
            Brunson rule: a squeeze page that is JUST a form converts on
            cold traffic but loses warm traffic that wants to know who is
            asking. One paragraph of voice solves it without re-opening
            the page to objection-handling theater. */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Who is writing them
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            I&apos;m a marketer. I have never written a line of production
            code. In 2026, Lovable and Claude opened the door and I shipped
            real AI products in weeks, watched them flatline in Stripe, and
            ran from the truth into SEO tactics for almost a year. What
            broke me out was sitting with more than ten other founders
            telling my own story back to me. The five emails are what I
            wish someone had sent me on day one of the flat line.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            — Maryan
          </p>
        </section>

        {/* Polarity — AGAINST line as disqualifier. Workbook 01 §6 Beat 5.
            DCS rule: a squeeze without a disqualifier collects email from
            people who never had any chance of buying. Better to lose the
            wrong subscriber here than waste five emails on them. */}
        <section className="mb-10 rounded-lg border border-border bg-muted/40 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Before you enter your email
          </p>
          <p className="text-sm leading-relaxed">
            This is not &ldquo;validate your idea&rdquo; advice for someone
            who has not shipped yet. The emails assume you already shipped a
            real product, the praise has been good, the payment has not,
            and the problem is upstream of the page. If that is not you,
            skip the form — there is nothing in here for you yet.
          </p>
        </section>

        <Separator className="my-10" />

        {/* The two other doors. Brunson rule: a squeeze is a single
            decision, but a refusing visitor is still a visitor. Offer
            them somewhere honest to go before they back-button. */}
        <section className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Not ready for email?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
            <Link
              href="/parables"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Read the five parables free
            </Link>
            <span className="text-muted-foreground hidden sm:inline">·</span>
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Run the free diagnostic on your page
            </Link>
            <span className="text-muted-foreground hidden sm:inline">·</span>
            <Link
              href="/starter"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Skip the emails — start the Machine for $1
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
