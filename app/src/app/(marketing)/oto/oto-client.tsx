"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

/**
 * Post-Starter OTO body. Rendered by the server component in page.tsx,
 * which resolves session_id from searchParams at request time — so buyers
 * (and crawlers) always receive full server-rendered HTML instead of the
 * empty Suspense shell the old useSearchParams() implementation produced.
 */
export function OtoClient({ parentSessionId }: { parentSessionId: string }) {
  const [checkoutError, setCheckoutError] = useState(false);

  useEffect(() => {
    track(Event.OtoPageViewed);
  }, []);

  async function handleUpgrade() {
    track(Event.OtoUpgradeClicked, {
      price_type: "playbook",
      surface: "oto",
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceType: "playbook",
          parentSessionId,
        }),
      });
      const { url } = (await res.json()) as { url?: string };
      if (url) {
        window.location.href = url;
        return;
      }
      setCheckoutError(true);
    } catch {
      setCheckoutError(true);
    }
  }

  function handleDecline() {
    track(Event.OtoDeclined);
  }

  // Decline routes to the next OTO in the chain. Brunson rule: never end on a
  // dead-end "thanks anyway" page – every "no" carries the visitor forward to
  // the next yes. /oto/vault gates on its own env var (OTO_VAULT price id)
  // and silently routes to /oto/cold-emails if the vault offer is disabled.
  const declineHref = parentSessionId
    ? `/oto/vault?session_id=${encodeURIComponent(parentSessionId)}`
    : "/oto/vault";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <AbExposureBeacon />
      <div className="max-w-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
          You are two of seven steps in. Want the rest plus the 60-day
          guarantee?
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-4">
          You just paid $1 to finish your dream customer and your offer. Good.
          That is two of the seven steps. The actual paying customer comes from
          the next five, and you only get those plus the 60-day guarantee on the
          full Playbook.
        </p>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Your $1 applies. The 60-day clock starts the moment you click. If the
          Playbook does not produce a verified paying customer in your Stripe in
          60 days, you get the two monthly payments back. That is in writing.
        </p>

        <Separator className="my-8" />

        {/* Primary button */}
        <Button size="lg" className="w-full text-lg py-6 mb-4" onClick={handleUpgrade}>
          Continue the Playbook. $49/mo. 60-day guarantee.
        </Button>

        {/* Honest degradation: checkout unavailable (Stripe price id unset or
            Stripe error). Never leave a dead button — hand them the founding
            waitlist door instead. */}
        {checkoutError && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Checkout is not open yet — nothing was charged. Paid checkout
            opens with the founding cohort.{" "}
            <Link
              href="/founding"
              className="font-semibold underline underline-offset-4"
            >
              Lock the founding rate at $49/mo →
            </Link>
          </p>
        )}

        {/* Secondary link — Profit Maximizer Return Path. Walks the visitor
            into the next OTO ($97 Vault) instead of dead-ending on /welcome. */}
        <Link
          href={declineHref}
          onClick={handleDecline}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Not the Playbook. Show me the next thing.
        </Link>

        {/* Reassurance: the no-vote does not get punished. Workbook 04 §4 Return Path. */}
        <p className="text-xs text-muted-foreground mt-8 leading-relaxed">
          Either button is honest. If you skip the Playbook for now, the
          Starter is yours to keep, the door at $49 stays open, and the
          five-email sequence walking you through the work keeps arriving.
          The clock only starts when you click the top button.
        </p>
      </div>
    </div>
  );
}
