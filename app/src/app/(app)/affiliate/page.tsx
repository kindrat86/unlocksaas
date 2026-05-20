import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  getAffiliateDashboard,
  getOrIssueAffiliate,
  type AffiliateDashboardStats,
} from "@/lib/affiliate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CopyLink } from "./copy-link";

// Cache Components: the dashboard is a personalised request-time view — auth
// + profile + commission reads all happen inside the Suspense'd body which
// starts with `await connection()` to defer.

export default function AffiliatePage() {
  return (
    <Suspense fallback={<AffiliateSkeleton />}>
      <AffiliateBody />
    </Suspense>
  );
}

function AffiliateSkeleton() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold leading-tight">Refer + earn 50%</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Loading your link…
        </p>
      </header>
    </div>
  );
}

async function AffiliateBody() {
  await connection();
  const supabase = await createClient();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData?.user) redirect("/login?next=/affiliate");

  // Auto-issue: any signed-in user with a profile in tier {starter, core}
  // gets an affiliate code on first dashboard visit. Tier=none users get a
  // "you need to buy first" CTA instead — affiliate seats aren't open to
  // anyone off the street (the Verified Builders identity is the gate).
  const admin = createAdminClient() as unknown as { from: (t: string) => any };
  const { data: profile } = await admin
    .from("profiles")
    .select("id,tier,email,builder_name")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!profile) {
    return <NotEnrolled reason="no_profile" />;
  }
  if (profile.tier === "none") {
    return <NotEnrolled reason="no_tier" />;
  }

  // Idempotent: returns existing or creates fresh.
  await getOrIssueAffiliate(profile.id as string);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://unlocksaas.com";
  const dashboard = await getAffiliateDashboard(profile.id as string, appUrl);
  if (!dashboard) {
    // Shouldn't happen — getOrIssueAffiliate just created the row.
    return <NotEnrolled reason="enrol_failed" />;
  }

  return <Dashboard dashboard={dashboard} builderName={profile.builder_name as string | null} />;
}

function fmtCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function Dashboard({
  dashboard,
  builderName,
}: {
  dashboard: AffiliateDashboardStats;
  builderName: string | null;
}) {
  const { affiliate, shareUrl } = dashboard;
  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">{affiliate.rev_share_pct}% rev share</Badge>
          {affiliate.status !== "active" && (
            <Badge variant="destructive">{affiliate.status}</Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold leading-tight">
          {builderName ? `${builderName.split(" ")[0]}, send a builder.` : "Send a builder."}
        </h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          You keep {affiliate.rev_share_pct}% of every dollar UnlockSaaS earns
          from anyone you refer – for as long as they stay paying. Lifetime
          rate locks at {affiliate.rev_share_floor_pct}% (you're grandfathered).
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyLink shareUrl={shareUrl} />
          <p className="text-xs text-muted-foreground">
            Or share <code className="font-mono">unlocksaas.com/?ref={affiliate.code}</code>
            – both work. Cookie attribution lasts 90 days, first touch wins.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Clicks" value={dashboard.clickCount.toString()} />
        <Stat label="Sign-ups" value={dashboard.referralCount.toString()} />
        <Stat label="Converted" value={dashboard.convertedCount.toString()} />
        <Stat label="Active Core" value={dashboard.activeCustomers.toString()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earnings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0">
          <Stat label="Pending" value={fmtCents(dashboard.earningsCents.pending)} />
          <Stat label="Payable" value={fmtCents(dashboard.earningsCents.payable)} />
          <Stat label="Paid" value={fmtCents(dashboard.earningsCents.paid)} />
          <Stat label="Lifetime" value={fmtCents(dashboard.earningsCents.lifetime)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How payout works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2 pt-0">
          <p>
            <strong className="text-foreground">Pending</strong> – the customer
            just paid. Sits 30 days while the refund window runs.
          </p>
          <p>
            <strong className="text-foreground">Payable</strong> – refund
            window expired, commission is locked in.
          </p>
          <p>
            <strong className="text-foreground">Paid</strong> – I sent it via
            Wise on the 1st of the next month. Reply to my emails with your
            Wise email if you haven't already.
          </p>
          <p className="pt-2">
            <Link
              href="/affiliate/terms"
              className="underline underline-offset-2"
            >
              Full terms
            </Link>
          </p>
        </CardContent>
      </Card>

      <Separator />

      <p className="text-xs text-muted-foreground">
        – Maryan
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold tabular-nums leading-snug">
        {value}
      </div>
    </div>
  );
}

function NotEnrolled({ reason }: { reason: "no_profile" | "no_tier" | "enrol_failed" }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold leading-tight">Refer + earn 50%</h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          {reason === "no_tier"
            ? "The affiliate program is open to UnlockSaaS customers. Pick up the $1 Starter or the $49/mo Core and your dashboard unlocks here."
            : reason === "enrol_failed"
              ? "Something went wrong issuing your code. Refresh the page – if it sticks, email maryan@unlocksaas.com and I'll cut you in manually."
              : "Sign in with the email you used at checkout to see your dashboard."}
        </p>
      </header>
      <div className="flex gap-3">
        {reason === "no_tier" ? (
          <>
            <Button asChild>
              <Link href="/starter">Get the $1 Starter</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/playbook-sales">See Core</Link>
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link href="/login?next=/affiliate">Sign in</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
