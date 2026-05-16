import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus, type OnboardingStatus } from "@/lib/onboarding";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  ArrowDownToLine,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Onboarding is a personalised, server-rendered view. Don't pre-render or
// cache it — every render must read fresh profile + project state.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { session_id?: string; connect?: string; error?: string };
}) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?next=/onboarding");
  }

  const status = await getOnboardingStatus({
    userId: data.user.id,
    email: data.user.email ?? "",
  });

  // If the user has no Core tier at all, kindly redirect them back to the
  // sales flow rather than leave them looking at a half-empty onboarding.
  // Starter-only users land on /machine directly — the OTO page's secondary
  // CTA goes to /machine, not here.
  if (status.profile?.tier === "none" || status.profile === null) {
    // Brief grace period: the user may have JUST checked out and the webhook
    // hasn't fired yet. If session_id is present, show a "processing" state
    // rather than redirecting away from a payment they just made.
    if (!searchParams.session_id) {
      redirect("/oto");
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold leading-tight">
          Welcome to the Machine.
        </h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Three small setup pieces before Step 3. Two minutes. Then the work
          starts.
        </p>
      </header>

      {searchParams.connect === "ok" ? (
        <FlashBanner
          tone="success"
          message="Your Stripe account is connected. We will detect your first paying customer the moment it lands."
        />
      ) : null}

      {searchParams.connect === "denied" ? (
        <FlashBanner
          tone="error"
          message="Stripe connection canceled. You can connect later, but the 60-day verifier needs it to detect your first paying customer automatically."
        />
      ) : null}

      {searchParams.error ? (
        <FlashBanner
          tone="error"
          message={`Stripe Connect error: ${searchParams.error}. Try again or skip for now — you can connect from inside the Machine.`}
        />
      ) : null}

      {searchParams.session_id && status.profile?.tier !== "core" ? (
        <FlashBanner
          tone="info"
          message="Your checkout is processing. This page will refresh in a moment with your 60-day clock."
        />
      ) : null}

      <ClockCard status={status} />
      <CarryoverCard status={status} />
      <ConnectCard status={status} />

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          You can return to onboarding from any step in the Machine.
        </p>
        <Button asChild>
          <Link href="/machine">Enter the Machine →</Link>
        </Button>
      </div>
    </div>
  );
}

// ── cards ────────────────────────────────────────────────────────────────────

function ClockCard({ status }: { status: OnboardingStatus }) {
  const { clock, profile } = status;

  const headline = (() => {
    if (clock.status === "pending") {
      if (profile?.tier === "starter") {
        return "Upgrade to Core to start your 60-day clock";
      }
      return "Your 60-day clock will start the moment your $49 invoice clears";
    }
    if (clock.status === "running") {
      return `${clock.daysRemaining} day${clock.daysRemaining === 1 ? "" : "s"} remaining on your 60-day guarantee`;
    }
    return "Your 60-day guarantee window has closed";
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          1. Your 60-day clock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-base font-medium leading-snug">{headline}</p>
        {clock.startedAt && clock.expiresAt ? (
          <p className="text-sm text-muted-foreground">
            Started{" "}
            <time
              dateTime={clock.startedAt.toISOString()}
              className="font-medium text-foreground"
            >
              {formatDate(clock.startedAt)}
            </time>
            . Judged at{" "}
            <time
              dateTime={clock.expiresAt.toISOString()}
              className="font-medium text-foreground"
            >
              {formatDate(clock.expiresAt)}
            </time>
            .
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          If the Machine does not produce a verified paying customer in your
          Stripe by the 60-day mark, the two monthly payments come back to you.
          That is in writing.
        </p>
      </CardContent>
    </Card>
  );
}

function CarryoverCard({ status }: { status: OnboardingStatus }) {
  const { starterCarryover, profile } = status;
  const purchasedStarter = profile?.starter_purchased_at != null;
  const hasAny = starterCarryover.has_dream_customer || starterCarryover.has_offer;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5" />
          2. Carry over from your $1 Starter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!purchasedStarter ? (
          <>
            <p className="text-sm text-muted-foreground">
              You skipped the $1 Starter and came in at Core. Nothing to
              import — you will define your dream customer and your offer
              inside Steps 1 and 2.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/machine/step/1">Start at Step 1 →</Link>
            </Button>
          </>
        ) : !hasAny ? (
          <>
            <p className="text-sm text-muted-foreground">
              You purchased the Starter but did not finish Steps 1 or 2. They
              are still waiting for you — and they unlock the rest of the
              Machine.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/machine/step/1">Finish Step 1 →</Link>
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
              <span className="font-medium">Your Starter answers carry forward.</span>
            </div>
            {starterCarryover.has_dream_customer ? (
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Dream customer (Step 1)
                </p>
                <p className="text-sm">
                  {starterCarryover.dream_customer_summary ??
                    "Saved — review inside Step 1."}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Step 1 is still empty. Begin there before Step 2 unlocks.
              </p>
            )}
            {starterCarryover.has_offer ? (
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Offer (Step 2)
                </p>
                <p className="text-sm">
                  {starterCarryover.offer_summary ??
                    "Saved — review inside Step 2."}
                </p>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ConnectCard({ status }: { status: OnboardingStatus }) {
  const { stripeConnection } = status;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          3. Connect your Stripe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stripeConnection ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
              <span className="font-medium">
                Connected{" "}
                <time dateTime={stripeConnection.connected_at}>
                  {formatDate(new Date(stripeConnection.connected_at))}
                </time>
                .
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Account{" "}
              <code className="font-mono text-xs">
                {stripeConnection.stripe_account_id}
              </code>
              . We listen for{" "}
              <span className="font-medium text-foreground">charge.succeeded</span>{" "}
              on your account and stamp your first paying customer the moment
              one lands.
            </p>
            <p className="text-xs text-muted-foreground">
              Read-only access. We can see charges; we cannot move money or
              modify your products.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Stripe is the only proof. Connect your Stripe so the Machine can
              detect your first paying customer the second it happens — and
              the guarantee math runs itself.
            </p>
            <div className="flex items-center gap-3">
              <form action="/api/stripe-connect/start" method="post">
                <Button type="submit">Connect Stripe →</Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Optional — you can connect later from inside the Machine.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Permission requested:{" "}
              <span className="font-medium text-foreground">read_only</span>{" "}
              (charges + customers). No write access.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── primitives ───────────────────────────────────────────────────────────────

function FlashBanner({
  tone,
  message,
}: {
  tone: "success" | "error" | "info";
  message: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  const variant = tone === "error" ? "destructive" : "outline";
  return (
    <Badge
      variant={variant as "outline" | "destructive"}
      className="w-full flex items-start gap-2 p-3 text-left text-sm leading-snug whitespace-normal"
    >
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </Badge>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
