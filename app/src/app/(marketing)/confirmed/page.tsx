import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Double-opt-in landing page.
 *
 * The email-engine's verify endpoint 302s here after the subscriber
 * clicks the confirmation link (sequences/unlocksaas.yaml confirmed_url),
 * and the in-app confirm route can use it as a success surface too.
 *
 * Brunson: a confirmation page is never a dead end — set the open loop
 * for Letter 1 and re-present the funnel's front door (free diagnostic)
 * while intent is at its peak.
 */
export const metadata: Metadata = {
  title: "You're confirmed — UnlockSaaS",
  description:
    "Subscription confirmed. Letter 1 of the five-day founder arc is on its way.",
  robots: { index: false },
};

export default function Confirmed() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Confirmed
        </p>
        <h1 className="text-3xl font-bold mb-6 text-balance">
          You&apos;re in. Letter 1 is on its way.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Five short letters over the next week — one founder&apos;s honest
          account of a year staring at a flat Stripe line, and the exact
          moment it stopped being a product problem. No pitch until the
          story earns it.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-8">
          The first one lands in the next few minutes. If it isn&apos;t in
          your inbox, check spam and drag it out — that one click teaches
          your inbox where the rest belong.
        </p>
        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/diagnostic">
            While you wait: run the free 2-minute diagnostic
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          It tells you which of the three failure modes — wrong person, weak
          offer, weak belief — is keeping your line flat. No card, no login.
        </p>
      </div>
    </div>
  );
}
