import { Suspense } from "react";
import type { Metadata } from "next";
import { OtoStep } from "@/components/checkout/oto-step";
import { Event } from "@/lib/analytics/events";

/**
 * OTO #2 – $297 Lifetime Verified Builders community access.
 *
 * Terminal step of the OTO chain. Lands the visitor on /welcome regardless
 * of accept or decline.
 *
 * Brunson Expert Secrets §3 Stack-and-Closes: the highest-anchored OTO
 * comes last because the visitor has already been through three smaller
 * decisions and is calibrated to the dollar amounts on this funnel. The
 * lifetime access is the genuine "you don't need the Playbook to be in
 * the room" Profit Maximizer move – it monetizes the Diagnostic visitors
 * who never planned to subscribe.
 *
 * On accept: webhook stamps profiles.community_lifetime_at + sends the
 * existing Verified Builders invite email. community.ts treats lifetime
 * as a short-circuit so a later subscription cancel never revokes it.
 */
export const metadata: Metadata = {
  title: "Last thing – the room | UnlockSaaS",
  robots: { index: false, follow: false },
};

export default function OtoLifetimePage() {
  return (
    <Suspense fallback={null}>
      <OtoStep
        offerId="oto_lifetime"
        headline="Last thing. The room the $49 seat unlocks – for life."
        intro={[
          "The $49 Playbook wraps a private Verified Builders room. Skool or Discord, your call. It's the place ten founders sitting together is what broke me out of a year of flat Stripe.",
          "Subscribing every month buys the room. So does this single $297 charge – with the difference that you keep it even if the Playbook isn't a fit and you never come back.",
          "If you ever do come back to the Playbook later, this $297 credits in full against your first month.",
        ]}
        acceptCtaLabel="Yes – seat me for life. $297."
        declineLabel="No room either. Take me to /welcome."
        declineHref="/welcome?path=starter_only"
        reassurance="No subscription. No auto-renewal. The room invite arrives in your inbox within five minutes. Direct DM access to me for the first thirty days is on the same seat."
        events={{
          viewed: Event.OtoLifetimePageViewed,
          accepted: Event.OtoLifetimeAccepted,
          declined: Event.OtoLifetimeDeclined,
        }}
      />
    </Suspense>
  );
}
