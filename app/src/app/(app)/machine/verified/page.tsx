/**
 * /machine/verified — the First Paying Customer Verified celebration page.
 *
 * States rendered:
 *
 *   1. NO_CONVERSION_YET
 *      User has never had a verified conversion. We render the milestone
 *      explainer + (in non-prod) a "simulate" form for the operator. Copy
 *      stays in Reluctant Hero voice — no fake "you're almost there"
 *      cheerleading. The page is honest: nothing yet.
 *
 *   2. VERIFIED
 *      One or more verified_conversions rows exist. We celebrate (in voice),
 *      show the Stripe-confirmed amount/customer/date, render the public
 *      badge preview, and surface the share controls. The user can flip
 *      visibility public + edit display name / product details inline.
 *
 *  Auth: enforced by the machine layout. Profile row guaranteed to exist
 *  via the link_profile_on_user_create trigger.
 */
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ExternalLink, Eye, EyeOff } from "lucide-react";
import {
  absoluteBadgeUrl,
  shareIntents,
} from "@/lib/builder-badge";
import { ShareButtons } from "./ShareButtons";
import { updateShareSettings, simulateFirstCustomer } from "./actions";
import { RepeatableInterestForm } from "@/components/repeatable-interest-form";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProfileBadgeFields {
  id: string;
  email: string;
  builder_slug: string | null;
  builder_name: string | null;
  product_name: string | null;
  product_url: string | null;
  share_visibility: "private" | "public";
  first_customer_at: string | null;
}

interface VerifiedConversionRow {
  id: string;
  stripe_charge_id: string | null;
  amount_cents: number;
  currency: string;
  customer_email: string | null;
  source: "connect" | "manual";
  detected_at: string;
}

function formatAmount(cents: number, currency: string): string {
  const n = cents / 100;
  const upper = currency.toUpperCase();
  if (upper === "USD") return `$${n.toFixed(2)}`;
  if (upper === "EUR") return `€${n.toFixed(2)}`;
  return `${n.toFixed(2)} ${upper}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function VerifiedCelebrationPage() {
  const sb = createClient();
  const { data: userData } = await sb.auth.getUser();
  if (!userData?.user) redirect("/login?next=/machine/verified");

  const { data: profileData } = await sb
    .from("profiles")
    .select(
      "id,email,builder_slug,builder_name,product_name,product_url,share_visibility,first_customer_at"
    )
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!profileData) redirect("/machine");

  const profile = profileData as ProfileBadgeFields;

  const { data: conversionsData } = await sb
    .from("verified_conversions")
    .select(
      "id,stripe_charge_id,amount_cents,currency,customer_email,source,detected_at"
    )
    .eq("profile_id", profile.id)
    .order("detected_at", { ascending: true });

  const conversions = (conversionsData as VerifiedConversionRow[] | null) ?? [];
  const verified = conversions.length > 0;
  const first = verified ? conversions[0] : null;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        {verified ? (
          <Badge variant="default" className="mb-3">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Milestone earned
          </Badge>
        ) : (
          <Badge variant="outline" className="mb-3 opacity-60">
            Locked
          </Badge>
        )}
        <h1 className="text-3xl font-bold mb-2">
          {verified ? "The line moved." : "First Paying Customer Verified"}
        </h1>
        <p className="text-muted-foreground">
          {verified ? (
            <>
              Stripe confirmed a real human paid you for the thing you built.
              That fact is the entire offer kept. Everything below is optional —
              the badge is yours either way.
            </>
          ) : (
            <>
              No verified conversion yet. This page wakes up the moment your
              connected Stripe account records its first charge. The work you
              did inside the Machine is what gets you here — finish the steps,
              run the outreach, ship the proof.
            </>
          )}
        </p>
      </div>

      {/* If verified, show the conversion record */}
      {verified && first && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What Stripe saw</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Amount" value={formatAmount(first.amount_cents, first.currency)} />
            <Row label="Detected" value={formatDate(first.detected_at)} />
            {first.customer_email && (
              <Row label="Customer" value={first.customer_email} />
            )}
            <Row
              label="Source"
              value={
                first.source === "connect"
                  ? "Stripe Connect (your account)"
                  : "Recorded manually"
              }
            />
            {first.stripe_charge_id && (
              <Row label="Charge ID" value={first.stripe_charge_id} mono />
            )}
            {conversions.length > 1 && (
              <p className="text-xs text-muted-foreground pt-2">
                +{conversions.length - 1} more verified customer
                {conversions.length - 1 === 1 ? "" : "s"} on file. The first one
                is what kept the promise.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings + share. Only meaningful when verified. */}
      {verified && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Verified Builder badge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              The badge is a public page at{" "}
              <code className="text-xs">unlocksaas.com/builder/&lt;slug&gt;</code>{" "}
              that says: this person built a real product and Stripe paid them
              for it. Visibility is private by default — flip it public when
              you&apos;re ready.
            </p>

            <form action={updateShareSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="builder_name"
                  className="text-sm font-medium text-foreground"
                >
                  Display name
                </label>
                <Input
                  id="builder_name"
                  name="builder_name"
                  defaultValue={
                    profile.builder_name ?? profile.email.split("@")[0] ?? ""
                  }
                  placeholder="The name on your badge"
                  maxLength={80}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="product_name"
                  className="text-sm font-medium text-foreground"
                >
                  Product name
                </label>
                <Input
                  id="product_name"
                  name="product_name"
                  defaultValue={profile.product_name ?? ""}
                  placeholder="What did you build?"
                  maxLength={80}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="product_url"
                  className="text-sm font-medium text-foreground"
                >
                  Product URL
                </label>
                <Input
                  id="product_url"
                  name="product_url"
                  type="url"
                  defaultValue={profile.product_url ?? ""}
                  placeholder="https://yourthing.com"
                  maxLength={200}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="text-sm">
                  <p className="font-medium flex items-center gap-2">
                    {profile.share_visibility === "public" ? (
                      <>
                        <Eye className="h-4 w-4" />
                        Public
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Private
                      </>
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {profile.share_visibility === "public"
                      ? "Anyone with the link can see your badge."
                      : "Only you can see your badge."}
                  </p>
                </div>
                <select
                  name="share_visibility"
                  defaultValue={profile.share_visibility}
                  className="text-sm bg-background border rounded-md h-9 px-3"
                >
                  <option value="private">Keep private</option>
                  <option value="public">Make public</option>
                </select>
              </div>

              <Button type="submit">Save badge settings</Button>
            </form>

            {/* If already public, render preview + share controls. */}
            {profile.share_visibility === "public" && profile.builder_slug && (
              <>
                <Separator />
                <PublicBadgeShare
                  slug={profile.builder_slug}
                  productName={profile.product_name}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rung 3 ascension card — fires the moment First Paying Customer
          Verified is true. DCS Secret #2: once a buyer says yes, there
          must always be a next yes. The celebration is the moment of
          maximum next-yes appetite — show the door, but keep the discipline
          (Rung 3 is gated; this card is intent-capture, not a checkout). */}
      {verified && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              What ladders up from here
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You earned the Verified Builder badge. The next rung is the
              Repeatable Revenue Layer — a self-serve $149/mo tier that
              carries your dream customer, AC, outreach, and Stripe
              pattern into Product 2 without starting from zero. It is
              spec&apos;d and gated: I refuse to ship it until three
              Core customers (including you, now) have completed the loop
              AND at least one of you has asked, unprompted, for it.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you would actually use this, log it below. One row =
              activation gate #2 firing. No follow-up sequence. No
              countdown.
            </p>
            <RepeatableInterestForm
              source="verified_celebration"
              ctaLabel="Yes — I would use this for Product 2"
            />
            <p className="text-xs text-muted-foreground">
              Full spec:{" "}
              <Link
                href="/repeatable"
                className="underline underline-offset-4 hover:text-foreground"
              >
                /repeatable
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Operator-only simulate form (dev/staging). Lets Maryan see the
          celebration without a Stripe Connect customer. */}
      {!verified && process.env.NODE_ENV !== "production" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">
              Operator: simulate a verified customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Dev / staging only. Injects a synthetic verified_conversions row so
              you can verify the celebration UI and the public badge flow before
              Stripe Connect onboarding ships.
            </p>
            <form action={simulateFirstCustomer} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="amount"
                  className="text-sm font-medium text-foreground"
                >
                  Amount (USD)
                </label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  defaultValue="49"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="customer_email"
                  className="text-sm font-medium text-foreground"
                >
                  Customer email (optional)
                </label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  placeholder="customer@example.com"
                />
              </div>
              <Button type="submit" variant="outline">
                Inject verified conversion
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <Button asChild variant="ghost">
          <Link href="/machine">← Back to the Machine</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : "font-medium"}>{value}</span>
    </div>
  );
}

function PublicBadgeShare({
  slug,
  productName,
}: {
  slug: string;
  productName: string | null;
}) {
  const badgeUrl = absoluteBadgeUrl(slug);
  const intents = shareIntents({ productName, badgeUrl });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Your badge is live</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share it anywhere a link goes — X, LinkedIn, your site, your README.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/builder/${slug}`} target="_blank" rel="noopener noreferrer">
            View badge
            <ExternalLink className="h-3 w-3 ml-1.5" />
          </a>
        </Button>
      </div>
      <ShareButtons
        badgeUrl={badgeUrl}
        caption={intents.caption}
        intents={{ x: intents.x, linkedin: intents.linkedin, reddit: intents.reddit }}
      />
    </div>
  );
}
