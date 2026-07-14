"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Profit Maximizer / Return Path — interactive body.
 *
 * Rendered by the server component in page.tsx when a post-purchase routing
 * param is present:
 *   - ?path=starter_only   → declined the $49 OTO
 *   - ?path=core_activated → bought the $49 Playbook
 *   - ?path=lifetime       → bought the $297 lifetime room seat
 *
 * Workbook 04 §4 (Return Path). Captures the no-vote with a future-pace +
 * reassurance + queues the soap opera, so the decision is not a dead-end.
 */
export function WelcomeClient({ path }: { path: string }) {
  const router = useRouter();

  // After 12s, route to the member area or first-win onboarding so the
  // visitor never sits on a dead-end page. 12s = comfortable read time
  // without trapping them.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const dest = path === "core_activated" ? "/playbook" : "/first-win";
      router.push(dest);
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [router, path]);

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

  if (path === "lifetime") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-lg text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Lifetime seat confirmed
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-6">
            You are in the room. For life.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            The Verified Builders room invite arrives in your inbox within
            five minutes, and the 30-day direct line to me starts today.
            No subscription, no renewal, nothing else to click. — Maryan
          </p>
          <Button asChild size="lg" className="w-full text-lg py-6">
            <Link href="/first-win">Get your first-win drafts</Link>
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
          <Link href="/first-win">Get your first-win drafts</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Auto-redirecting in 12 seconds. — Maryan
        </p>
      </div>
    </div>
  );
}
