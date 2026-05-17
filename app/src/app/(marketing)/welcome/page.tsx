"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Profit Maximizer / Return Path.
 *
 * Lands here when the visitor:
 *   - declines the $49 OTO (?path=starter_only), OR
 *   - successfully buys the $49 Playbook (?path=core_activated)
 *
 * Workbook 04 §4 (Return Path). Avoids a $19 downsell — locked lean
 * ladder discipline (workbook 02 §3). Captures the no-vote with a
 * future-pace + reassurance + queues the soap opera, so the decision
 * is not a dead-end.
 */
export default function Welcome() {
  return (
    <Suspense fallback={null}>
      <WelcomeInner />
    </Suspense>
  );
}

function WelcomeInner() {
  const params = useSearchParams();
  const path = params.get("path") ?? "starter_only";
  const router = useRouter();

  // After 12s, route to the member area so the visitor never sits on a
  // dead-end page. 12s = comfortable read time without trapping them.
  useEffect(() => {
    const t = window.setTimeout(() => {
      router.push("/playbook");
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [router]);

  if (path === "core_activated") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-lg text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Core activated
          </p>
          <h1 className="text-3xl font-bold mb-6">
            The 60-day clock is now running.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Steps 3 through 7 are unlocked. The Outreach Room is unlocked.
            The 14-Day Sprint timer is unlocked. The guarantee is in
            writing in your member area, and the refund logic is in code,
            not in my inbox. — Maryan
          </p>
          <Button asChild size="lg" className="w-full text-lg py-6">
            <Link href="/playbook">Go to the Playbook</Link>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Auto-redirecting in 12 seconds.
          </p>
        </div>
      </div>
    );
  }

  // path === "starter_only" (default)
  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-lg text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Starter delivered
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          You said no to the $49 for now. Good. That is exactly the call
          the page told you was honest.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Playbook Steps 1 and 2 are in your member area. They are yours to
          keep. Finish them this week, see if a real WHO and a real WHAT
          changes anything in your Stripe line. If they do, you will not
          need me to sell you the rest.
        </p>

        <Card className="mb-8 text-left">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold mb-2">What happens next</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>— One short email a day for five days, walking you through the work without selling at you.</li>
              <li>— Email 5 is the offer for the full Playbook, in case you want it back.</li>
              <li>— Reply STOP at any time. No drip-forever traps.</li>
            </ul>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/playbook">Open the Starter</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Auto-redirecting in 12 seconds. — Maryan
        </p>
      </div>
    </div>
  );
}
