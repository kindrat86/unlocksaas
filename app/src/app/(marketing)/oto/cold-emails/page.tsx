import { Suspense } from "react";
import type { Metadata } from "next";
import { OtoStep } from "@/components/checkout/oto-step";
import { Event } from "@/lib/analytics/events";

/**
 * Downsell – $27 Cold Email Library only.
 *
 * Fires when the visitor declines the $97 Vault. Brunson DCS Secret 16
 * downsell pattern: same buyer, lower-priced version of one piece of the
 * declined offer. The Cold Email Library is a strict subset of both the
 * Vault and the Starter bump – packaging it as its own SKU lets the
 * declining-but-curious visitor still buy a small thing.
 *
 * Decline → /oto/lifetime. The chain still moves forward.
 */
export const metadata: Metadata = {
  title: "Smaller version | UnlockSaaS",
  robots: { index: false, follow: false },
};

export default function OtoColdEmailsPage() {
  return (
    <Suspense fallback={null}>
      <OtoStep
        offerId="oto_downsell"
        headline="A smaller piece, for what it's worth."
        intro={[
          "Vault not for you. Fair. The piece most founders actually use out of it is the cold-email library – eight templates plus the three reply branches I keep getting from real founders.",
          "Twenty-seven dollars. One Notion doc. If the templates earn back the price on a single reply this week, the rest is bonus.",
        ]}
        acceptCtaLabel="Send the Cold Email Library – $27"
        declineLabel="No emails either. What's last?"
        declineHref="/oto/lifetime"
        reassurance="If you took the bump on the Starter cart, you already have this. Skip it and I'll route you to the last thing. No charge."
        events={{
          viewed: Event.OtoDownsellPageViewed,
          accepted: Event.OtoDownsellAccepted,
          declined: Event.OtoDownsellDeclined,
        }}
      />
    </Suspense>
  );
}
