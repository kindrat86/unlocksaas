"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatRefundAmount } from "@/lib/guarantee";

/**
 * Client component used inside the server-rendered GuaranteeTracker.
 *
 * Calls POST /api/guarantee/refund. The server re-evaluates eligibility
 * (the client display is advisory only) and either issues the refund or
 * returns 409. Either way we refresh the page so the new verdict renders.
 */
export function RefundButton({ maxRefundCents }: { maxRefundCents: number }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/guarantee/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "60-day guarantee, self-service" }),
      });

      const body = (await res.json()) as {
        error?: string;
        result?: { ok: boolean; message: string };
      };

      if (!res.ok) {
        setError(body.error ?? "Refund request failed.");
        setSubmitting(false);
        setConfirming(false);
        return;
      }

      // Refund issued — refresh so the tracker re-renders in "refunded" phase.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
      setSubmitting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant={confirming ? "destructive" : "default"}
        onClick={handleClick}
        disabled={submitting}
        className="w-full sm:w-auto"
      >
        {submitting
          ? "Refunding…"
          : confirming
            ? `Confirm refund of ${formatRefundAmount(maxRefundCents)}`
            : `Claim the guarantee — ${formatRefundAmount(maxRefundCents)}`}
      </Button>
      {confirming && !submitting && (
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline ml-2"
        >
          Cancel
        </button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
