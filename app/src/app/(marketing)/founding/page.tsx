import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { cartWindow } from "@/lib/founding/cohort";
import { isCorePriceConfigured } from "@/lib/offers";
import { FoundingWaitlistForm } from "./waitlist-form";
import { FoundingClaimButton } from "./claim-button";
import { FOUNDING_COHORT_SIZE, seatsClaimedOrNull } from "./seats";


// Per-page metadata — Surface A of the Google strategy. The title and
// description stay constant across cohort states because the same URL
// serves every window and SERP titles must not whiplash between deploys.
// State-specific copy lives in the body.
export const metadata: Metadata = {
  title: "The Founding Cohort — $49/mo locked for life for the first 100 builders",
  description:
    "The first 100 builders get The Playbook at $49/mo, locked for the life of their subscription. After builder #100 the standard price is $79/mo. First paying customer verified by Stripe within 60 days or a full refund, enforced by code.",
  alternates: pageAlternates("/founding"),
  openGraph: {
    title: "The Founding Cohort",
    description:
      "The first 100 builders lock $49/mo for life. After builder #100 the standard price is $79/mo. 60-day Stripe-verified guarantee, refund enforced by code.",
    url: "/founding",
    type: "website",
    images: DEFAULT_OG_IMAGES,
  },
};

/**
 * Founding-Cohort landing page.
 *
 * Canonical offer story (do not contradict elsewhere):
 *   - Zero paying customers today, disclosed honestly. No invented
 *     testimonials, seat counts, or numbers — ever.
 *   - $49/mo locked for life for the first 100 builders; $79/mo standard
 *     after builder #100. That cliff is the ONLY urgency mechanic.
 *   - Stack: 8 deliverables, $4,900+ if bought separately, $49/mo price —
 *     mirrors the homepage StackSlide numbers exactly.
 *   - Guarantee: first paying customer verified by Stripe within 60 days
 *     or full refund, code-enforced, downside capped at $98.
 *
 * CTA states:
 *   - Checkout button only when the cart window is open AND the Stripe
 *     price id is configured AND the cohort is not verifiably full.
 *   - Otherwise the waitlist email capture ("lock the founding rate —
 *     checkout opens with the founding cohort"). Never a dead button.
 *   - "Cohort full" renders ONLY on a real seat count >= 100 — an
 *     unavailable count degrades to "open", never to a fabricated number.
 */
export default function FoundingPage() {
  return (
    <Suspense fallback={null}>
      <FoundingPageBody />
    </Suspense>
  );
}

// The 8-deliverable stack — same items and equivalent-value figures as the
// homepage StackSlide (components/blocks/stack-slide.tsx). If one changes,
// change both: the value-math must never diverge between surfaces.
const STACK_LINES: ReadonlyArray<{ name: string; value: string }> = [
  { name: "The 7-step Playbook engine", value: "$997 value" },
  { name: "Dream 100 picker (pre-loaded)", value: "$3,000 value" },
  { name: "Offer builder with engine pushback", value: "$497 value" },
  { name: "Outreach happens inside the tool", value: "$79/mo value" },
  { name: "Stripe-webhook verified badge", value: "Sold by no one else" },
  { name: "Public builder profile page", value: "$29/mo value" },
  { name: "Soap Opera + Seinfeld email sequences", value: "$297 value" },
  { name: "The 60-day Stripe-verified guarantee", value: "Refunded by code" },
];

async function FoundingPageBody() {
  await connection();
  const window = cartWindow();
  const claimed = await seatsClaimedOrNull();

  // "Full" requires a REAL count at or past the cohort size. An unavailable
  // count (null) can never close the door.
  const foundingFull = claimed !== null && claimed >= FOUNDING_COHORT_SIZE;
  const checkoutConfigured = isCorePriceConfigured("playbook");
  const showCheckout =
    window.state === "open" && checkoutConfigured && !foundingFull;
  const showWaitlist = !showCheckout && !foundingFull;

  // Founder walkthrough videos — env-gated Mux playback ids. Parts without
  // an uploaded video render nothing; when none are uploaded the section
  // degrades to a single "coming this week" card. No env var names or
  // internal funnel jargon ever reach the visitor.
  const walkthroughParts = [
    {
      title: "The Door That Opened",
      length: "5 to 7 minutes",
      note: "Why I built this. What the bottleneck actually is now that AI has solved the building part. Who this is for and who it is not for.",
      playbackId: process.env.FOUNDING_PLV1_PLAYBACK?.trim() || null,
    },
    {
      title: "How the Playbook Actually Works",
      length: "8 to 10 minutes",
      note: "The seven steps. The engine pushback. The one step where every other tool quits and what mine does instead.",
      playbackId: process.env.FOUNDING_PLV2_PLAYBACK?.trim() || null,
    },
    {
      title: "What It Looks Like on the Inside",
      length: "10 to 12 minutes",
      note: "The manifesto read aloud. The actual refund button on screen. The badge. When the door opens.",
      playbackId: process.env.FOUNDING_PLV3_PLAYBACK?.trim() || null,
    },
  ];
  const hasAnyVideo = walkthroughParts.some((p) => p.playbackId);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Surface B (AEO/SEO) — BreadcrumbList. The Founding Cohort is a
          subpage of the Playbook sales path, so the trail reads
          Home → The Playbook → Founding Cohort. Three-deep mirrors the way
          a cold reader actually arrives here (homepage → /playbook-sales →
          /founding). */}
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", url: "https://unlocksaas.com/" },
          { name: "The Playbook", url: "https://unlocksaas.com/playbook-sales" },
          { name: "Founding Cohort", url: "https://unlocksaas.com/founding" },
        ]}
      />
      <AbExposureBeacon />
      <div className="max-w-2xl mx-auto">
        <Badge variant="secondary" className="mb-4">
          The Founding Cohort
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          The first 100 builders get $49 a month. Locked for life.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          I am opening The Playbook to the first 100 builders at $49 a month,
          locked for the life of your subscription. After builder #100 the
          standard price becomes $79 a month. That is the entire mechanic —
          no countdown timers, no fake windows.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The honest starting line, same as the homepage: I have zero paying
          customers today. The founding cohort exists because the first 100
          builders take the biggest leap on the least proof, so they get the
          lowest price the product will ever have — and keep it.
        </p>

        {/* Cohort status — real count when available, no number otherwise.
            Never a fabricated seat count. */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            The Founding Cohort
          </p>
          <p className="text-base font-semibold">
            {foundingFull
              ? `All ${FOUNDING_COHORT_SIZE} founding seats claimed.`
              : "Founding cohort: open"}
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-snug">
            Founding rate is capped at {FOUNDING_COHORT_SIZE} builders. $49/mo
            locked for life. After builder #{FOUNDING_COHORT_SIZE}, the
            standard price is $79/mo.
          </p>
        </div>

        <Separator className="my-10" />

        {/* Founder walkthrough — env-gated videos, honest placeholder. */}
        <section className="space-y-10 mb-12">
          {hasAnyVideo ? (
            walkthroughParts.map((part, i) =>
              part.playbackId ? (
                <WalkthroughVideo
                  key={part.title}
                  number={i + 1}
                  title={part.title}
                  length={part.length}
                  note={part.note}
                  playbackId={part.playbackId}
                />
              ) : null
            )
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Founder walkthrough
                </p>
                <h3 className="text-lg font-semibold mb-2">
                  Three short videos, coming this week.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Why I built this, how the Playbook actually works, and what
                  it looks like on the inside — including the refund button
                  on screen. Until they are up, everything they say is
                  already written on this page.
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        <Separator className="my-10" />

        {/* The stack — the same 8 deliverables and value math as the
            homepage. One story, every surface. */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What comes in the door</h2>

          <Card className="mb-6">
            <CardContent className="pt-6 space-y-3">
              {STACK_LINES.map((line) => (
                <StackLine key={line.name} name={line.name} value={line.value} />
              ))}
              <Separator />
              <StackLine
                name="All eight, bought separately"
                value="$4,900+"
                emphasis
              />
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-3">
            Plus, for the first {FOUNDING_COHORT_SIZE} builders only:
          </h3>
          <Card className="mb-6 border-primary/30">
            <CardContent className="pt-6 space-y-4">
              <FoundingBonus
                title="Lifetime $49/mo price lock"
                math="$79 standard − $49 founding = $30 saved every month, for life"
                body="Your $49 a month never goes up, for the life of your active subscription. After builder #100 the standard price is $79 — yours stays $49."
              />
              <FoundingBonus
                title="Founding Verified Builder badge"
                math="Distinct visual frame, public history on /builder/[slug]"
                body="The badge fires when your first paying customer is verified by Stripe. The Founding variant looks different. It is a permanent marker that you got in first."
              />
              <FoundingBonus
                title="30-day direct line to Maryan"
                math="1 business day reply, for your first 30 days inside"
                body="My personal email at maryan@unlocksaas.com. Not a help desk. Not a chatbot. Me, reading every message, replying within one business day, for the first 30 days you are inside."
              />
              <Separator />
              <p className="text-sm font-medium">
                Eight deliverables. $4,900+ if bought separately. Founding
                price: $49/mo, locked for life. After builder #
                {FOUNDING_COHORT_SIZE}: $79/mo.
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
              playbook-verifiable in-product actions only. No self-reporting.
              No &ldquo;feels like.&rdquo; Either Stripe saw a new charge or it
              did not.
            </p>
          </CardContent>
        </Card>

        {/* CTA — checkout when live, honest waitlist otherwise. */}
        <div className="text-center mb-6">
          {showCheckout && <FoundingClaimButton claimedAtRender={claimed} />}

          {showWaitlist && (
            <>
              <h2 className="text-xl font-bold mb-4">
                Lock the founding rate
              </h2>
              <FoundingWaitlistForm />
              <p className="text-xs text-muted-foreground mt-4">
                Checkout opens with the founding cohort. Leave your email and
                you get a note the moment it does, plus a short series of
                founder letters in the lead-up. Unsubscribe any time, one
                click. No spam, no shared addresses.
              </p>
            </>
          )}

          {foundingFull && (
            <Card>
              <CardContent className="pt-6 text-left">
                <h3 className="text-lg font-semibold mb-2">
                  All {FOUNDING_COHORT_SIZE} founding seats are claimed.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  The Playbook is now $79 a month standard and still carries
                  the 60-day Stripe-verified guarantee. The $49 lifetime lock,
                  the Founding badge, and the 30-day direct line belong to the
                  first {FOUNDING_COHORT_SIZE}. There will not be a second
                  founding cohort.
                </p>
                <Link
                  href="/starter"
                  className="text-base font-semibold underline underline-offset-4"
                >
                  Start the Playbook for $1 →
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

function WalkthroughVideo(props: {
  number: number;
  title: string;
  length: string;
  note: string;
  playbackId: string;
}) {
  // The playback id is a Mux PLAYBACK ID (not a full URL). We compose the
  // MP4 URL using Mux's static-rendition pattern:
  //   https://stream.mux.com/<PLAYBACK_ID>/medium.mp4
  // The upload pipeline (scripts/upload-shoot.py) requests `mp4_support:
  // 'standard'` at asset creation, so this rendition exists on every
  // uploaded video. Native <video> renders this in every browser without an
  // HLS shim.
  const mp4Url = `https://stream.mux.com/${props.playbackId}/medium.mp4`;
  const posterUrl = `https://image.mux.com/${props.playbackId}/thumbnail.jpg?time=1`;

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Part {props.number} — {props.length}
      </p>
      <h3 className="text-xl font-bold mb-2">{props.title}</h3>
      <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3 border border-border">
        {/* Native <video> handles play/pause/scrub/fullscreen with zero JS.
            Captions are burned in per the walkthrough production notes, so
            no <track> is wired. */}
        <video
          controls
          playsInline
          preload="auto"
          poster={posterUrl}
          className="w-full h-full"
        >
          <source src={mp4Url} type="video/mp4" />
          <p className="p-4 text-sm">
            Your browser doesn&apos;t support HTML5 video. Reply to any
            email from maryan@unlocksaas.com for a direct download link.
          </p>
        </video>
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
