import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOnboardingStatus, type OnboardingStatus } from "@/lib/onboarding";
import {
  getCommunityCardState,
  type CommunityCardState,
} from "@/lib/community";
import { FounderMemoryBanner } from "@/components/founder-memory-banner";
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
  Users,
} from "lucide-react";

// Onboarding is a personalised, server-rendered view. Don't pre-render or
// cache it — every render must read fresh profile + project state.
//
// Under Cache Components (Next 16+) the old `export const dynamic = "force-dynamic"`
// route segment no longer exists. Replacement pattern: the top-level page
// renders a static skeleton wrapped in `<Suspense>`, and the auth + Supabase
// reads happen in a child component that calls `await connection()` to defer
// to request time. The Suspense fallback ships from the CDN immediately; the
// personalized content streams in once auth + profile resolve.

export default function OnboardingPage(
  props: {
    searchParams: Promise<{ session_id?: string; connect?: string; error?: string }>;
  }
) {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingBody searchParams={props.searchParams} />
    </Suspense>
  );
}

function OnboardingSkeleton() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold leading-tight">
          Welcome to the Playbook.
        </h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Loading your onboarding state…
        </p>
      </header>
    </div>
  );
}

async function OnboardingBody({
  searchParams: searchParamsP,
}: {
  searchParams: Promise<{
    session_id?: string;
    connect?: string;
    error?: string;
    community?: string;
  }>;
}) {
  await connection();
  const searchParams = await searchParamsP;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login?next=/onboarding");
  }

  const status = await getOnboardingStatus({
    userId: data.user.id,
    email: data.user.email ?? "",
  });

  // Community card state is fetched only when we have a profile id. Defaults
  // are safe (unconfigured + no grant) for pre-Core users.
  const community: CommunityCardState | null = status.profile?.id
    ? await getCommunityCardState(status.profile.id)
    : null;

  // If the user has no Core tier at all, kindly redirect them back to the
  // sales flow rather than leave them looking at a half-empty onboarding.
  // Starter-only users land on /playbook directly — the OTO page's secondary
  // CTA goes to /playbook, not here.
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
          Welcome to the Playbook.
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
          message={`Stripe Connect error: ${searchParams.error}. Try again or skip for now — you can connect from inside the Playbook.`}
        />
      ) : null}

      {searchParams.session_id && status.profile?.tier !== "core" ? (
        <FlashBanner
          tone="info"
          message="Your checkout is processing. This page will refresh in a moment with your 60-day clock."
        />
      ) : null}

      {searchParams.community === "resent" ? (
        <FlashBanner
          tone="success"
          message="Invite re-sent. Check your inbox – it should arrive in under a minute."
        />
      ) : null}

      {searchParams.community === "resend_failed" ? (
        <FlashBanner
          tone="error"
          message="The invite resend did not go through. Reply to the welcome email and Maryan will send it manually."
        />
      ) : null}

      {/* Persistent founder memory – pulls the founder's last diagnostic so
          onboarding never re-asks the questions the diagnostic already
          answered. Renders nothing when no memory exists. */}
      <FounderMemoryBanner
        userId={data.user.id}
        email={data.user.email ?? null}
      />

      <ClockCard status={status} />
      <CarryoverCard status={status} />
      <ConnectCard status={status} />
      <CommunityCard status={status} community={community} />

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          You can return to onboarding from any step in the Playbook.
        </p>
        <Button asChild>
          <Link href="/playbook">Enter the Playbook →</Link>
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
          If the Playbook does not produce a verified paying customer in your
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
              <Link href="/playbook/step/1">Start at Step 1 →</Link>
            </Button>
          </>
        ) : !hasAny ? (
          <>
            <p className="text-sm text-muted-foreground">
              You purchased the Starter but did not finish Steps 1 or 2. They
              are still waiting for you — and they unlock the rest of the
              Playbook.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/playbook/step/1">Finish Step 1 →</Link>
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
              Stripe is the only proof. Connect your Stripe so the Playbook can
              detect your first paying customer the second it happens — and
              the guarantee math runs itself.
            </p>
            <div className="flex items-center gap-3">
              <form action="/api/stripe-connect/start" method="post">
                <Button type="submit">Connect Stripe →</Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Optional — you can connect later from inside the Playbook.
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

function CommunityCard({
  status,
  community,
}: {
  status: OnboardingStatus;
  community: CommunityCardState | null;
}) {
  const isCore = status.profile?.tier === "core";
  const label = community?.platformLabel ?? "the community room";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          4. Step into the Verified Builders room
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isCore ? (
          <p className="text-sm text-muted-foreground">
            The room is for Core members. Upgrade to $49/mo Core and your
            invite to {label} lands the same minute.
          </p>
        ) : !community?.configured ? (
          <>
            <p className="text-sm text-muted-foreground">
              The room is opening shortly. Maryan will email your invite the
              moment {label.startsWith("the ") ? label : `the ${label} link`}{" "}
              goes live – usually within 24 hours of your first Core invoice.
            </p>
            <p className="text-xs text-muted-foreground">
              Your seat is reserved. There is nothing for you to do here.
            </p>
          </>
        ) : community.hasLiveAccess && community.inviteUrl ? (
          <>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
              <span className="font-medium">
                Your seat is live on {label}.
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Founders working the same Playbook are inside. One welcome
              channel, one &quot;what is working&quot; channel. No spectators.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <a
                  href={community.inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {label} →
                </a>
              </Button>
              <form action="/api/community/resend-invite" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Re-send invite email
                </Button>
              </form>
            </div>
            {community.inviteSentAt ? (
              <p className="text-xs text-muted-foreground">
                Last invite emailed{" "}
                <time dateTime={community.inviteSentAt}>
                  {formatDate(new Date(community.inviteSentAt))}
                </time>
                {community.inviteSentCount > 1 ? (
                  <span> ({community.inviteSentCount} sends total)</span>
                ) : null}
                .
              </p>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              We sent your {label} invite to the email on file. If it has not
              arrived, re-send below.
            </p>
            <form action="/api/community/resend-invite" method="post">
              <Button type="submit" variant="outline" size="sm">
                Re-send invite email
              </Button>
            </form>
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
