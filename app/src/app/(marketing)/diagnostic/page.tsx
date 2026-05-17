import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DiagnosticForm } from "./diagnostic-form";
import { DiagnosticJsonLd, BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import {
  HOOK_COPY,
  resolveHookVariant,
} from "@/lib/diagnostic-hook-variant";
import { DiagnosticHookVariantBeacon } from "@/components/diagnostic/hook-variant-beacon";
import { DiagnosticPublicCounter } from "@/components/diagnostic/public-counter";

// Brunson spec source:
// - workbook 02 §2 (Free Diagnostic Lead Funnel)
// - workbook 04 §3 (squeeze copy)
// - workbook 01 §5 Hook #3 (pain mirror) / #10 (contrarian) / #7 (guarantee)
// - workbook 01 §6 Beat 2 (three-line about opener)
// - workbook 01 §6 Beat 5 (polarity AGAINST line as disqualifier)
// - workbook 10 §4 (Eugene Schwartz awareness-to-hook mapping)
// - DCS Chapter 11 The Best Bait (audience-temperature variants + shareable
//   bait result via Butterfly-Marketing Loop 1)

export const metadata: Metadata = {
  title: "Free Launch Diagnostic — Unlock SaaS",
  description:
    "Paste your live product page. In 90 seconds I tell you why it is flat: Wrong Person, Weak Offer, or Weak Belief. Then I hand you the door.",
};

// Squeeze must always be live; do not cache.
export const dynamic = "force-dynamic";

export default async function DiagnosticSqueezePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  // Eugene Schwartz awareness-to-hook mapping. Resolved server-side from
  // ?utm_source / ?source / ?h plus the Referer header. The await is
  // forward-compatible with Next 15+/16 and a no-op in Next 14.2.35.
  const hdrs = await headers();
  const referer = hdrs.get("referer");
  const variantProps = resolveHookVariant({ searchParams, referer });
  const hook = HOOK_COPY[variantProps.variant];

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/GEO) — strategy/google-strategy.md §B.2.
          Service + HowTo schema so LLMs cite the diagnostic as the
          canonical answer for "free SaaS diagnostic" / "how to diagnose
          a stuck product" queries. */}
      <DiagnosticJsonLd />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "Free Diagnostic", url: "https://unlocksaas.com/diagnostic" },
        ]}
      />
      {/* A/B exposure attribution lives on every funnel hub & squeeze surface. */}
      <AbExposureBeacon />
      {/* Hook variant attribution. Single-fire mount beacon, server-resolved
          variant passed in as prop so no client-side round-trip. */}
      <DiagnosticHookVariantBeacon
        variant={variantProps.variant}
        source={variantProps.source}
      />

      <div className="max-w-2xl mx-auto">
        {/* HERO — hook rotated by audience temperature (workbook 10 §4):
              "default"     → Hook #3 pain mirror     (problem-aware / cold)
              "contrarian"  → Hook #10 contrarian     (solution-aware)
              "guarantee"   → Hook #7 guarantee/result (product-aware) */}
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The Free Diagnostic
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {hook.headline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {hook.lede}
          </p>
        </header>

        {/* The form is the conversion event. Kept tight, two fields, one CTA.
            CTA copy is passed in so it matches the hook (Brunson rule:
            hook + CTA must rhyme). */}
        <Card className="mb-8 border-primary/20">
          <CardContent className="pt-6">
            <DiagnosticForm submitCta={hook.cta} />
          </CardContent>
        </Card>

        {/* Honest empty-state public-diagnosis counter. Auto-flips to a real
            count at >= 10 public shares (mirrors media-bar / avatar-wall on
            `/`). Server-rendered, Suspense-friendly. */}
        <div className="mb-10 text-center">
          <Suspense fallback={null}>
            <DiagnosticPublicCounter />
          </Suspense>
        </div>

        <Separator className="my-10" />

        {/* AC three-line about. Workbook 01 §6 Beat 2. */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3">Who is reading your page</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            I&apos;m a marketer. I have never written a line of production code.
            In 2026, Lovable and Claude opened the door and I shipped real AI
            products in weeks, watched them flatline in Stripe, and ran from the
            truth into SEO tactics for almost a year. What broke me out was
            sitting with more than ten other founders telling my own story back
            to me. So I built the machine I wish someone had handed me. The
            diagnostic below is the first thing that machine does.
          </p>
        </section>

        {/* What the diagnostic actually checks. Reduces "magic AI box" suspicion. */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-3">What I am reading on your page</h2>
          <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <li>
              <strong className="text-foreground">Wrong Person.</strong> Your
              copy is for a category (&ldquo;founders&rdquo;, &ldquo;teams&rdquo;,
              &ldquo;creators&rdquo;) instead of one named person with a known
              pain.
            </li>
            <li>
              <strong className="text-foreground">Weak Offer.</strong> You
              describe features instead of promising a specific, defensible
              result inside a timeframe.
            </li>
            <li>
              <strong className="text-foreground">Weak Belief.</strong> Your
              page assumes the visitor already believes the upstream story they
              do not yet believe.
            </li>
          </ul>
        </section>

        {/* Polarity — AGAINST line as disqualifier. Workbook 01 §6 Beat 5.
            Now strengthened with explicit "This is NOT for you if..." block
            (DCS Chapter 11: an honest disqualifier converts the right-fit
            visitor by raising perceived selectivity, NOT by lowering it). */}
        <section className="mb-10 rounded-lg border border-border bg-muted/40 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Before you paste your URL
          </p>
          <p className="text-sm leading-relaxed mb-4">
            This is not &ldquo;validate your idea&rdquo; advice handed to a
            founder who has not shipped. You already shipped. The diagnostic
            assumes the product works and the problem is upstream — wrong
            person, wrong promise, or unbuilt belief — and gives you back the
            specific door that fixes the one that is broken.
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            This is NOT for you if
          </p>
          <ul className="text-sm leading-relaxed space-y-1.5 list-disc list-inside marker:text-muted-foreground">
            <li>You have not shipped a live product yet.</li>
            <li>
              You want a content-marketing audit, an SEO teardown, or another
              traffic playbook.
            </li>
            <li>
              You are looking for someone to validate that the problem is the
              product. I am the wrong person to ask.
            </li>
          </ul>
        </section>

        {/* Trust-line. Honest. */}
        <p className="text-xs text-muted-foreground text-center">
          The diagnostic is free forever. No card. The email is so I can send
          the read-out and follow up with one short note a day for five days.
          Reply STOP to unsubscribe. The link to{" "}
          <Link
            href="/starter"
            className="underline underline-offset-4 hover:text-foreground"
          >
            the $1 Starter
          </Link>{" "}
          stays open even if you skip the diagnostic.
        </p>

        {/* Reverse-squeeze bridge — for the cold visitor who is not yet
            ready to type an email. Reads the stories first, opts in (or
            doesn't) at the bottom. DCS Secret 14 reverse variant. */}
        <p className="mt-3 text-xs text-muted-foreground text-center">
          Not ready to enter your email yet?{" "}
          <Link
            href="/stories"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Read the five stories first
          </Link>
          . Free, no gate, opt-in is at the bottom.
        </p>
      </div>
    </div>
  );
}
