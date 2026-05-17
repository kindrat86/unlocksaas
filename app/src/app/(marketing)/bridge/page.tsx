import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

/**
 * Cold traffic bridge page.
 *
 * Workbook 10 §4: cold traffic NEVER goes straight to the $49 sales page.
 * It lands here. Hook #3 (pain mirror) above the fold; one sentence of
 * Reluctant Hero context; one CTA to the Free Diagnostic.
 *
 * Used as the destination for solo ads, sponsored content, and cold
 * social posts that need their own pre-frame before the diagnostic.
 */

// Per-page metadata — Surface A of the Google strategy. The Funnel Hub
// layout template provides global fallbacks; this override gives the bridge
// its own crawler-visible title and meta description so cold ad traffic and
// SERP listings carry the pain-mirror language rather than the hub's promise.
export const metadata: Metadata = {
  title: "For founders who already shipped — the flat-Stripe-line bridge",
  description:
    "You shipped a real product. The Stripe line is flat. The 90-second free diagnostic labels what is actually broken — Wrong Person, Weak Offer, or Weak Belief — and hands you the door that fixes it.",
  alternates: pageAlternates("/bridge"),
  openGraph: {
    title: "For founders who already shipped — Unlock SaaS",
    description:
      "You shipped a real product. The Stripe line is flat. Get the labeled diagnosis that fixes it.",
    url: "/bridge",
    type: "website",
  },
};

export default function ColdTrafficBridge() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/SEO) — BreadcrumbList anchors this page in the
          site graph. Two-deep trail (Home > Bridge) mirrors the visible
          link in the footer block below. Google uses this to render
          breadcrumb sitelinks in SERPs and LLMs use it to understand the
          page's position in the funnel. */}
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "For founders who already shipped", url: "https://unlocksaas.com/bridge" },
        ]}
      />
      <AbExposureBeacon />
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          For founders who already shipped
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
          You shipped a real product. The line in Stripe is flat. You have
          been told the answer is more building, more traffic, or a better
          course. None of those produce your first paying customer.
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed mb-6">
          The work that does is one thing, done in one order: name one real
          person, write one real promise, sell it before it feels ready.
          The page on the other side of this button reads your live product
          page and tells you which of the three is actually broken.
        </p>

        <p className="text-sm text-muted-foreground italic mb-8">
          — Maryan, marketer, non-engineer, built a dozen AI products that
          nobody paid for. Then I figured out why.
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-semibold">
              The diagnostic is free. No card. No bait-and-switch.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>— Two fields: your email + your product URL.</li>
              <li>— Labelled diagnosis (Wrong Person / Weak Offer / Weak Belief).</li>
              <li>— One concrete next step. One short email a day for five days.</li>
              <li>— No course, no coach, no $2,000 community.</li>
            </ul>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/diagnostic?from=bridge">Get my free diagnosis</Link>
        </Button>

        <Separator className="my-10" />

        <p className="text-xs text-muted-foreground italic">
          Why this page exists: cold traffic does not buy a $49/mo
          subscription from a single ad. It buys a labelled diagnosis from
          someone who sounds like a founder, not a guru. That is what is on
          the other side of this button.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Already know what is broken?{" "}
          <Link
            href="/starter"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Skip to the $1 Starter
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
