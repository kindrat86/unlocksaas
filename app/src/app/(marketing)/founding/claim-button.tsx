"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Cart-open claim button. POSTs to /api/checkout with priceType=playbook and
 * attribution.from=founding so the Stripe webhook can stamp the founding
 * seat on subscription.created.
 *
 * `claimedAtRender` is null when the live seat count is unavailable — in
 * that case the label omits the seat number entirely. We never render a
 * fabricated count.
 */
export function FoundingClaimButton(props: { claimedAtRender: number | null }) {
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const nextSeat =
    props.claimedAtRender === null ? null : props.claimedAtRender + 1;

  async function onClick() {
    if (state === "submitting") return;
    setState("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceType: "playbook",
          attribution: {
            from: "founding",
            label: "founding_cohort",
          },
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setErrorMessage(data.error ?? "We could not start checkout.");
        setState("error");
        return;
      }
      window.location.href = data.url;
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setState("error");
    }
  }

  return (
    <div>
      <Button
        size="lg"
        className="text-lg px-8 py-6"
        onClick={onClick}
        disabled={state === "submitting"}
      >
        {state === "submitting"
          ? "Opening checkout..."
          : nextSeat === null
            ? "Claim your founding seat for $49/mo"
            : `Claim seat #${nextSeat} for $49/mo`}
      </Button>
      <p className="text-xs text-muted-foreground mt-3">
        $49 a month, locked for life. $79/mo after builder #100. 60-day
        Stripe-verified guarantee.
      </p>
      {state === "error" && errorMessage && (
        <p className="text-sm text-red-600 mt-3">{errorMessage}</p>
      )}
    </div>
  );
}
