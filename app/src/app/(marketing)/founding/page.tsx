import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { FoundingCohortMeter } from "@/components/founding-cohort-meter";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { FoundingWaitlistForm } from "./waitlist-form";
import { FoundingClaimButton } from "./claim-button";
import { cartWindow, seatsClaimed, FOUNDING_COHORT_CAP } from "@/lib/founding/cohort";

export const dynamic = "force-dynamic";

// Per-page metadata — Surface A of the Google strategy. The Founding Cohort
// PLF is state-dependent (pre_launch / open / closed); the title/description
// stay constant because the same URL serves all three windows and SERP titles
// must not whiplash between deploys. State-specific copy lives in the body.
export const metadata: Metadata = {
  title: "The Founding Cohort — 50 seats, lifetime $49 price lock",
  description:
    "50 Founding Verified Builders. 7-day window. Same $49/mo as the eventual evergreen price, locked for the life of your subscription. Founding-variant Verified Builder badge. The founder's email for 30 days.",
  alternates: { canonical: "/founding" },
  openGraph: {
    title: "The Founding Cohort — Unlock SaaS",
    description:
      "50 Founding Verified Builders. 7-day window. Lifetime price lock. After 50 seats or 7 days, the founding bonuses retire forever.",
    url: "/founding",
    type: "website",
  },
};

/**
 * Founding-Cohort PLF landing page.
 *
 * Workbook 03 Script 8 (revised 2026-05-17). One page. Same Reluctant Hero
 * voice as the homepage and the $1 Starter page. The state of this page
 * morphs across three windows:
 *
 *   1. pre_launch  — waitlist form is the only CTA. PLVs are embedded.
 *   2. open        — cart-open. Stripe checkout button is the primary CTA.
 *   3. closed (cap or window) — door-closed message; Starter as fallback.
 */
export default async function FoundingPage() {
  const window = cartWindow();
  const claimed = await seatsClaimed();
  const remaining = Math.max(0, FOUNDING_COHORT_CAP - claimed);
  const capReached = remaining === 0;
  const showCheckout = window.state === "open" && !capReached;
  const showWaitlist = window.state === "pre_launch";
  const closed = window.state === "closed" || capReached;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/SEO) — BreadcrumbList. The Founding Cohort is a
          time-bound subpage of the Machine sales path, so the trail reads
          Home → The Machine → Founding Cohort. Three-deep mirrors the way
          a cold reader actually arrives here (homepage → /machine-sales →
          /founding once cart opens). */}
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "The Machine", url: "https://unlocksaas.com/machine-sales" },
          { name: "Founding Cohort", url: "https://unlocksaas.com/founding" },
        ]}
      />
      <AbExposureBeacon />
      <div className="max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          The Founding Cohort
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          50 Founding Verified Builders. 7-day window. Lifetime price lock.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          I am opening The Machine to the first 50 founders ever. Same $49 a
          month as the eventual evergreen price. The bonus is that your $49 is
          locked for the life of your subscription, you get a Founding variant
          of the Verified Builder badge, and you get my email address for
          thirty days. After 50 seats or 7 days, whichever comes first, the
          founding bonuses retire forever. The product stays at $49 a month.
        </p>

        <Suspense fallback={null}>
          <FoundingCohortMeter />
        </Suspense>

        <Separator className="my-10" />

        {/* The three PLVs — ungated. Replay surfaces. */}
        <section className="space-y-10 mb-12">
          <PlvBlock
            number={1}
            title="The Door That Opened"
            length="5 to 7 minutes"
            envVar="FOUNDING_PLV1_PLAYBACK"
            note="Why I built this. What the bottleneck actually is now that AI has solved the building part. Who this is for and who it is not for."
          />
          <PlvBlock
            number={2}
            title="How the Machine Actually Works"
            length="8 to 10 minutes"
            envVar="FOUNDING_PLV2_PLAYBACK"
            note="The seven steps. The engine pushback. The one step where every other tool quits and what mine does instead."
          />
          <PlvBlock
            number={3}
            title="What It Looks Like on the Inside"
            length="10 to 12 minutes"
            envVar="FOUNDING_PLV3_PLAYBACK"
            note="The manifesto read aloud. The actual refund button on screen. The badge. When the door opens."
          />
        </section>

        <Separator className="my-10" />

        {/* The stack — base $49 stack + the three founding bonuses. */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What comes in the door</h2>

          <Card className="mb-6">
            <CardContent className="pt-6 space-y-3">
              <StackLine name="The Machine — 7-step system" value="$259/mo" />
              <StackLine name="Bonus: 14-Day First-Customer Sprint" value="$89" />
              <StackLine name="Bonus: The Outreach Room" value="$79/mo" />
              <StackLine name="Bonus: The Outreach Script Kit" value="$69" />
              <Separator />
              <StackLine name="Base stack total" value="$496" emphasis />
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-3">
            Plus, only during the founding window:
          </h3>
          <Card className="mb-6 border-primary/30">
            <CardContent className="pt-6 space-y-4">
              <FoundingBonus
                title="Lifetime $49/mo price lock"
                math="$30/mo × 24 months = $720 of locked-in value"
                body="Your $49 a month never goes up, for the life of your active subscription. The evergreen price will rise — yours will not."
              />
              <FoundingBonus
                title="Founding Verified Builder badge"
                math="Distinct visual frame, public history on /builder/[slug]"
                body="The badge fires when your first paying customer is verified by Stripe. The Founding variant looks different. It is a permanent marker that you got in first."
              />
              <FoundingBonus
                title="30-day direct line to Maryan"
                math="1 business day reply, capped at 50 founders × 30 days"
                body="My personal email at maryan@unlocksaas.com. Not a help desk. Not a chatbot. Me, reading every message, replying within one business day, for the first 30 days you are inside."
              />
              <Separator />
              <p className="text-sm font-medium">
                Founding bonus value: ~$920. Total package value: $1,416.
                Total package price: $49/mo. Ratio: 28.9x.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Guarantee */}
        <Card className="mb-10 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">The 60-day guarantee</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your first paying customer verified by your own Stripe within 60
              days, or both months back. Refund capped at $98 — the two monthly
              payments inside the guarantee window. The work conditions are
              machine-verifiable in-product actions only. No self-reporting.
              No &ldquo;feels like.&rdquo; Either Stripe saw a new charge or it
              did not.
            </p>
          </CardContent>
        </Card>

        {/* CTA — morphs with window state */}
        <div className="text-center mb-6">
          {showCheckout && (
            <FoundingClaimButton claimedAtRender={claimed} />
          )}

          {showWaitlist && (
            <>
              <FoundingWaitlistForm />
              <p className="text-xs text-muted-foreground mt-4">
                When the cart opens you will get an email at 9am. PLE1 through
                PLE5 land in the lead-up. No spam, no shared addresses.
              </p>
            </>
          )}

          {closed && (
            <Card>
              <CardContent className="pt-6 text-left">
                <h3 className="text-lg font-semibold mb-2">
                  {capReached
                    ? "50 of 50 claimed. The founding cohort is full."
                    : "The founding window has closed."}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The Machine itself is still $49 a month and still carries
                  the 60-day Stripe-verified guarantee. The price lock, the
                  Founding badge, and the 30-day direct line are gone. There
                  will not be a second founding cohort.
                </p>
                <Link
                  href="/starter"
                  className="text-base font-semibold underline underline-offset-4"
                >
                  Start the Machine for $1 →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Polarity AGAINST line */}
        <p className="text-sm text-muted-foreground italic text-center">
          The problem stuck founders have is not the product. It is that an
          entire industry profits from teaching them to keep building when the
          only thing left is to sell.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function PlvBlock(props: {
  number: 1 | 2 | 3;
  title: string;
  length: string;
  envVar: string;
  note: string;
}) {
  // Server-side read of the playback ID env var. This component is rendered
  // inside the (force-dynamic) FoundingPage server component, so reading
  // process.env at render is correct — no NEXT_PUBLIC_ prefix needed, the
  // playback ID stays out of the client bundle until the URL is composed.
  //
  // The env var holds a Mux PLAYBACK ID (not a full URL). We compose the
  // MP4 URL here using Mux's static-rendition pattern:
  //   https://stream.mux.com/<PLAYBACK_ID>/medium.mp4
  // The upload pipeline (scripts/upload-shoot.py) requests `mp4_support:
  // 'standard'` at asset creation, so this rendition exists on every
  // uploaded PLV. Native <video> renders this in every browser without an
  // HLS shim.
  const playbackId = process.env[props.envVar]?.trim();
  const hasVideo = !!playbackId && playbackId.length > 0;
  const mp4Url = hasVideo
    ? `https://stream.mux.com/${playbackId}/medium.mp4`
    : undefined;
  const posterUrl = hasVideo
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?time=1`
    : undefined;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        PLV{props.number} — {props.length}
      </p>
      <h3 className="text-xl font-bold mb-2">{props.title}</h3>
      <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3 border border-border">
        {mp4Url ? (
          // Native <video> handles play/pause/scrub/fullscreen with zero JS.
          // preload="metadata" keeps the page light until the visitor
          // presses play. Captions are burned in per the PLV script
          // production notes, so no <track> is wired.
          <video
            controls
            playsInline
            preload="metadata"
            poster={posterUrl}
            src={mp4Url}
            className="w-full h-full"
          >
            <p className="p-4 text-sm">
              Your browser doesn&apos;t support HTML5 video. Reply to any
              email from maryan@unlocksaas.com for a direct download link.
            </p>
          </video>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-sm text-muted-foreground px-4 text-center">
              Video upload pending — playback ID env var:{" "}
              <code className="text-xs">{props.envVar}</code>
            </p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {props.note}
      </p>
    </div>
  );
}

function StackLine(props: { name: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 ${props.emphasis ? "font-semibold" : ""}`}>
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary mt-1 shrink-0" />
        <span className="text-sm">{props.name}</span>
      </div>
      <span className="text-sm tabular-nums">{props.value}</span>
    </div>
  );
}

function FoundingBonus(props: { title: string; math: string; body: string }) {
  return (
    <div>
      <p className="text-base font-semibold">{props.title}</p>
      <p className="text-xs text-muted-foreground mb-1 tabular-nums">
        {props.math}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {props.body}
      </p>
    </div>
  );
}
