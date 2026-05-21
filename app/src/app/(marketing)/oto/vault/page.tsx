import { Suspense } from "react";
import type { Metadata } from "next";
import { OtoStep } from "@/components/checkout/oto-step";
import { Event } from "@/lib/analytics/events";

/**
 * OTO #1 – $97 Founder's Diary Vault.
 *
 * Fires on the decline path from /oto (the $49 Playbook upsell). If the
 * visitor said no to the Playbook, they're still in the buying mood for a
 * lower-priced lateral upsell – the Vault is a Brunson "self-liquidating
 * asset" play: 30 episodes of script + B-roll prompt + voice settings the
 * operator was going to give away on YouTube anyway. The $97 line item
 * funds the Dream 100 outreach and paid traffic experiments.
 *
 * Decline → /oto/cold-emails (the $27 downsell). The chain only moves
 * forward; we never bounce the visitor back to /oto.
 */
export const metadata: Metadata = {
  title: "One more thing | UnlockSaaS",
  // No-index – it's a stepped checkout page that doesn't make sense on its
  // own. Cookie-less visitors arriving here cold see a quiet placeholder.
  robots: { index: false, follow: false },
};

export default function OtoVaultPage() {
  return (
    <Suspense fallback={null}>
      <OtoStep
        offerId="oto_vault"
        headline="One more honest ask before /welcome."
        intro={[
          "You said no to the $49 Playbook. Heard, no whining. The Starter is yours either way.",
          "Before the tab closes – the Founder's Diary backlog I've been writing in parallel is shippable. Thirty episodes worth of script, voice settings, and B-roll prompts. Built for me, but it's the same format anyone shipping a faceless founder channel needs.",
          "If you want it as a vault, this is the one window. After the next page it isn't on the site.",
        ]}
        acceptCtaLabel="Send me the Founder's Diary Vault – $97"
        declineLabel="Not the Vault either. Show me the small one."
        declineHref="/oto/cold-emails"
        reassurance="One-time charge. Nothing recurring. The Vault is a Notion + Drive bundle you keep forever, even if you cancel everything else tomorrow."
        events={{
          viewed: Event.OtoVaultPageViewed,
          accepted: Event.OtoVaultAccepted,
          declined: Event.OtoVaultDeclined,
        }}
      />
    </Suspense>
  );
}
