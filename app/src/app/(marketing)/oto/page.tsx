import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OtoClient } from "./oto-client";

/**
 * /oto — post-Starter one-time offer.
 *
 * Server-component entry. The old implementation was a "use client" page
 * reading session_id via useSearchParams() inside <Suspense fallback={null}>,
 * which server-rendered an EMPTY <main>: a buyer reopening the link from
 * email (or any crawler) saw a blank page until JS hydrated. Same failure
 * mode the 2026-05-22 crawler citation audit caught on /starter.
 *
 * Current shape mirrors /starter: synchronous Suspense wrapper, async body
 * that calls `await connection()` before awaiting searchParams (the
 * canonical Next 16 + cacheComponents pattern), then:
 *
 *   - session_id present  → the interactive OTO (client component, full
 *     checkout behavior, session forwarded for AOV stitching).
 *   - session_id absent   → server-rendered offer presentation with an
 *     honest note that paid checkout opens with the founding cohort and a
 *     waitlist CTA to /founding. No dead buttons, no blank page.
 */
export default function OTOPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={null}>
      <OTOPageBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function OTOPageBody(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const raw = searchParams.session_id;
  const sessionId = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  if (sessionId) {
    return <OtoClient parentSessionId={sessionId} />;
  }

  return <OtoFallback />;
}

/**
 * No-session fallback — fully server-rendered. Presents the same offer in
 * the same voice, without pretending a checkout session exists.
 */
function OtoFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6">
          The full Playbook. Seven steps. $49/mo. 60-day guarantee.
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-4">
          This page is normally the next step after the $1 Starter: it opens
          the remaining five of the seven Playbook steps, plus the 60-day
          guarantee — your first paying customer verified by your own Stripe
          within 60 days, or both monthly payments back. Downside capped at
          $98, refund enforced by code.
        </p>

        <p className="text-muted-foreground leading-relaxed mb-8">
          The honest note: paid checkout opens with the founding cohort. The
          first 100 builders get $49/mo locked for life; after builder #100
          the standard price is $79/mo.
        </p>

        <Separator className="my-8" />

        <Card className="mb-6 text-left">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold mb-2">Until checkout opens</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lock the founding rate with your email on the founding page —
              you get a note the moment the door opens. Or start free with
              the 90-second diagnostic.
            </p>
          </CardContent>
        </Card>

        <Button asChild size="lg" className="w-full text-lg py-6 mb-4">
          <Link href="/founding">Lock the founding rate — $49/mo</Link>
        </Button>

        <Link
          href="/diagnostic"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Not yet. Run the free diagnostic first.
        </Link>
      </div>
    </div>
  );
}
