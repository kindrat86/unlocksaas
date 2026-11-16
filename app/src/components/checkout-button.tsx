"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics/client";
import { Event, type PriceType } from "@/lib/analytics/events";
import { buyerCheckoutErrorMessage } from "@/lib/checkout-failure-message";
import { cn } from "@/lib/utils";

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
  /**
   * Button size. Defaults to "lg" – the buy button is large by design at
   * the page-level CTA placements. The sticky persistent-offer bar uses
   * "default" to fit a thinner strip.
   */
  size?: "default" | "sm" | "lg";
}

const FRAME_CLASS =
  /^(?:[\w-]+:)*?(?:w-full|w-auto|flex-1|flex-auto|flex-initial|flex-none|min-w-0|max-w-full)$/;

function frameClass(className?: string): string | undefined {
  if (!className) return undefined;
  const kept = className.split(/\s+/).filter((token) => FRAME_CLASS.test(token));
  return kept.length > 0 ? kept.join(" ") : undefined;
}

async function readCheckoutBody(
  res: Response,
): Promise<{ url?: string; error?: string }> {
  try {
    const data = (await res.json()) as { url?: unknown; error?: unknown };
    return {
      url: typeof data.url === "string" ? data.url : undefined,
      error: typeof data.error === "string" ? data.error : undefined,
    };
  } catch {
    return {};
  }
}

export function CheckoutButton({
  priceType,
  children,
  className,
  surface = "playbook_sales",
  size = "lg",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorId = useId();

  async function handleClick() {
    setLoading(true);
    setErrorMessage(null);
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
      const data = await readCheckoutBody(res);
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setErrorMessage(
        buyerCheckoutErrorMessage({ status: res.status, error: data.error }),
      );
      setLoading(false);
    } catch {
      setErrorMessage(buyerCheckoutErrorMessage({}));
      setLoading(false);
    }
  }

  const button = (
    <Button
      size={size}
      className={className}
      onClick={handleClick}
      disabled={loading}
      aria-describedby={errorMessage ? errorId : undefined}
    >
      {loading ? "Opening Stripe…" : children}
    </Button>
  );

  if (!errorMessage) return button;

  // Width classes stay on the button. Copy the ones that size a flex/block
  // parent onto this frame so an error under a full-width or sticky CTA
  // does not collapse the control to the message width.
  const frame = frameClass(className);

  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-col",
        frame?.includes("w-full") ? "items-stretch" : "items-center",
        frame,
      )}
    >
      {button}
      <span
        id={errorId}
        role="alert"
        className="mt-2 max-w-prose text-center text-sm font-normal leading-snug text-destructive whitespace-normal"
      >
        {errorMessage}
      </span>
    </span>
  );
}
