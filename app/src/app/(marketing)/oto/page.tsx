"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function OTOPage() {
  async function handleUpgrade() {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceType: "machine" }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
          You are two of seven steps in. Want the rest plus the 60-day
          guarantee?
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-4">
          You just paid $1 to finish your dream customer and your offer. Good.
          That is two of the seven steps. The actual paying customer comes from
          the next five, and you only get those plus the 60-day guarantee on the
          full Machine.
        </p>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Your $1 applies. The 60-day clock starts the moment you click. If the
          Machine does not produce a verified paying customer in your Stripe in
          60 days, you get the two monthly payments back. That is in writing.
        </p>

        <Separator className="my-8" />

        {/* Primary button */}
        <Button size="lg" className="w-full text-lg py-6 mb-4" onClick={handleUpgrade}>
          Continue the Machine. $49/mo. 60-day guarantee.
        </Button>

        {/* Secondary link */}
        <Link
          href="/machine"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          No thanks, deliver just the Starter.
        </Link>
      </div>
    </div>
  );
}
