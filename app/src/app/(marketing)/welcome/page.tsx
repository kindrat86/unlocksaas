"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PLAYBOOK, ORDER_FORM_BUMP } from "@/lib/playbook";

/**
 * Profit Maximizer / Return Path + Book-Funnel unboxing moment.
 *
 * Lands here when the visitor:
 *   - declines the $49 OTO (?path=starter_only), OR
 *   - successfully buys the $49 Machine (?path=core_activated)
 *
 * Workbook 04 §4 (Return Path). Avoids a $19 downsell — locked lean
 * ladder discipline (workbook 02 §3). Captures the no-vote with a
 * future-pace + reassurance + queues the soap opera, so the decision
 * is not a dead-end.
 *
 * Brunson DCS Secret #17 (Book Funnel): the buyer just paid for the
 * Playbook. This page is the "the book arrived" moment — same emotional
 * weight as a brown padded envelope landing on the doormat. Naming the
 * artifact ("The Founder's First Customer Playbook") here, not just
 * "Starter delivered," carries the identity-anchor effect through to
 * the member area.
 *
 * The optional ?bump=outreach_kit query param surfaces a second
 * unboxing line for the order-form-bump buyer ("Outreach Script Kit
 * is also in your account").
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
  const bump = params.get("bump");
  const hasOutreachKit = bump === ORDER_FORM_BUMP.id;
  const router = useRouter();

  // After 12s, route to the member area so the visitor never sits on a
  // dead-end page. 12s = comfortable read time without trapping them.
  useEffect(() => {
    const t = window.setTimeout(() => {
      router.push("/machine");
    }, 12_000);
    return () => window.clearTimeout(t);
  }, [router]);

  if (path === "core_activated") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-lg text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Your Playbook is being assembled
          </p>
          <h1 className="text-3xl font-bold mb-6">
            The full {PLAYBOOK.name} is on its way to your account. The 60-day
            clock is now running.
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8">
            All seven chapters are unlocked. The Outreach Room is unlocked.
            The 14-Day Sprint timer is unlocked. The guarantee is in writing
            in your member area, and the refund logic is in code, not in my
            inbox.{" "}
            {hasOutreachKit && (
              <>
                The <strong>Outreach Script Kit</strong> bump is in your
                account too.{" "}
              </>
            )}
            — Maryan
          </p>
          <Button asChild size="lg" className="w-full text-lg py-6">
            <Link href="/machine">Open the Playbook</Link>
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
          Your Playbook has shipped
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          You said no to the $49 for now. Good. That is exactly the call
          the page told you was honest.
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          The first two chapters of <strong>{PLAYBOOK.name}</strong> are in
          your member area, plus all three appendices. They are yours to
          keep, no recurring charge. Finish Chapters 1 and 2 this week and
          see if a real WHO and a real WHAT changes anything in your Stripe
          line. If they do, you will not need me to sell you the rest.
          {hasOutreachKit && (
            <>
              {" "}
              The <strong>Outreach Script Kit</strong> bump is in your
              account too — use it the moment Chapter 2 is locked.
            </>
          )}
        </p>

        <Card className="mb-8 text-left">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold mb-2">What happens next</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>— One short email a day for five days, walking you through the work without selling at you.</li>
              <li>— Email 5 is the offer for the rest of the Playbook, in case you want the upgrade.</li>
              <li>— Reply STOP at any time. No drip-forever traps.</li>
            </ul>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full text-lg py-6">
          <Link href="/machine">Open the Playbook</Link>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Auto-redirecting in 12 seconds. — Maryan
        </p>
      </div>
    </div>
  );
}
