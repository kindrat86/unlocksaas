"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { Event, type PriceType } from "@/lib/analytics/events";

interface CheckoutButtonProps {
  priceType: PriceType;
  children: React.ReactNode;
  className?: string;
  /**
   * Which surface fired this click. Defaults to a generic "playbook_sales"
   * because that's where the shared button is used most; override on the
   * starter or OTO pages.
   */
  surface?: "starter" | "playbook_sales" | "oto";
}

export function CheckoutButton({
  priceType,
  children,
  className,
  surface = "playbook_sales",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    // Fire the click event BEFORE we redirect — PostHog batches by default,
    // and the navigation will tear down the page. The client lib uses
    // beacon-style transport for events near unload, so this is safe.
    const eventName =
      surface === "starter"
        ? Event.StarterCheckoutClicked
        : surface === "oto"
          ? Event.OtoUpgradeClicked
          : Event.PlaybookSalesCheckoutClicked;
    track(eventName, { price_type: priceType, surface });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
        return;
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button
      size="lg"
      className={className}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Opening Stripe…" : children}
    </Button>
  );
}
