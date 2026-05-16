import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your Diagnosis — Unlock SaaS",
  description:
    "Why your launch is flat: Wrong Person, Weak Offer, or Weak Belief — and the one door that fixes it.",
  robots: { index: false, follow: false },
};

// Result is keyed off a freshly-created Supabase row id. Cannot be cached.
export const dynamic = "force-dynamic";

// Just reading one DB row — no Claude call, no URL fetch. Quick by default.
export const maxDuration = 15;

type DiagnosticLabel =
  | "wrong_person"
  | "weak_offer"
  | "weak_belief"
  | "error";

type LeadRow = {
  id: string;
  product_url: string;
  label: DiagnosticLabel;
  explanation: string;
  evidence: string | null;
  created_at: string;
};

/**
 * Static label-derived copy. The label predicts the headline + CTA the
 * Reluctant Hero would use; we keep these in code (not in the DB) so they
 * are A/B-testable and version-controlled. The personalized explanation +
 * evidence come from the Claude run stored on the row.
 *
 * Source: strategy/workbooks/04-building-your-funnels.md §3.
 */
const LABEL_COPY: Record<
  DiagnosticLabel,
  { short: string; headline: string; cta: string }
> = {
  wrong_person: {
    short: "Wrong Person",
    headline: "Your copy is for a category, not a person.",
    cta: "Pin your dream customer for $1",
  },
  weak_offer: {
    short: "Weak Offer",
    headline: "You describe features. You do not promise a result.",
    cta: "Build your offer for $1",
  },
  weak_belief: {
    short: "Weak Belief",
    headline:
      "Your page assumes the visitor already believes you. They do not.",
    cta: "Fix the upstream belief for $1",
  },
  error: {
    short: "Engine Error",
    headline: "I could not finish the read.",
    cta: "Start the Machine for $1",
  },
};

// NOTE: Next 14.2 keeps searchParams sync. When this project migrates to
// Next 15/16, `next-codemod next-async-request-api` will turn the type into
// `Promise<SearchParams>` and add an `await`.
type SearchParams = { id?: string | string[] };

export default async function DiagnosticResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = searchParams?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  if (!id || !isUuid(id)) {
    return <MissingIdShell />;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diagnostic_leads")
    .select("id, product_url, label, explanation, evidence, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[diagnostic/result] db read failed", error);
    return <DbErrorShell />;
  }

  if (!data) {
    return <NotFoundShell />;
  }

  const row = data as LeadRow;
  return <ResultShell row={row} />;
}

function ResultShell({ row }: { row: LeadRow }) {
  const copy = LABEL_COPY[row.label] ?? LABEL_COPY.error;
  const isError = row.label === "error";
  let host = row.product_url;
  try {
    host = new URL(row.product_url).hostname;
  } catch {
    // keep raw
  }

  return (
    <PageFrame hostLine={`Diagnosis for ${host}.`}>
      <article>
        <Card className={isError ? "border-destructive/30" : "border-primary/30"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant={isError ? "destructive" : "default"}
                className="text-xs uppercase tracking-wider"
              >
                {copy.short}
              </Badge>
            </div>

            <h2 className="text-2xl font-bold leading-tight mb-4">
              {copy.headline}
            </h2>

            {/* The 100-word read-out from Claude. */}
            <p className="text-base leading-relaxed text-muted-foreground mb-6 whitespace-pre-line">
              {row.explanation}
            </p>

            {row.evidence ? (
              <>
                <Separator className="my-6" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  What I saw on the page
                </p>
                <p className="text-sm leading-relaxed mb-2 italic">
                  {row.evidence}
                </p>
              </>
            ) : null}

            <Separator className="my-6" />

            {/* The handoff. Brunson Soap Opera rule: story first, offer at
                the bottom. The diagnosis is the story; the $1 Starter is the
                offer. */}
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              The door that fixes it
            </p>
            <p className="text-sm leading-relaxed mb-4">
              The Machine has 7 steps. Steps 1 and 2 — Pin Dream Customer and
              Build Offer — are the upstream fix for what I just diagnosed. The
              $1 Starter unlocks both. Yours to keep. No subscription, no
              auto-upgrade.
            </p>

            {/* Attribution rides through to Stripe metadata via the
                Starter page → /api/checkout flow, so the webhook can stamp
                converted_to_starter_at + converted_session_id on this row. */}
            <Button asChild size="lg" className="w-full text-base py-6">
              <Link
                href={`/starter?from=diagnostic&label=${row.label}&lead=${row.id}`}
              >
                {copy.cta}
              </Link>
            </Button>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              One-time $1. The full Machine plus the 60-day guarantee is the
              optional upgrade on the next page.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          The diagnosis is also in your inbox. Reply if you want me to look at
          it personally.
        </p>
      </article>
    </PageFrame>
  );
}

function MissingIdShell() {
  return (
    <PageFrame hostLine="No diagnosis on file.">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm mb-6">
            This page needs an id from a fresh diagnostic run. Looks like you
            arrived here without one. Run the diagnostic, or skip ahead.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="secondary" className="flex-1">
              <Link href="/diagnostic">Run the diagnostic</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/starter">Skip to the $1 Starter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  );
}

function NotFoundShell() {
  return (
    <PageFrame hostLine="I cannot find that diagnosis.">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm mb-6">
            The id in the URL does not match a diagnosis I have on file. It may
            have been deleted, or the link is wrong. Run it again — it is
            still free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="secondary" className="flex-1">
              <Link href="/diagnostic">Re-run the diagnostic</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/starter">Skip to the $1 Starter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  );
}

function DbErrorShell() {
  return (
    <PageFrame hostLine="The store is unreachable.">
      <Card className="border-destructive/40">
        <CardContent className="pt-6">
          <p className="text-sm mb-6">
            Your diagnosis ran, but I could not read it back. Refresh in a
            minute. If it still fails, email me at maryan@unlocksaas.com — I
            will paste your result by hand.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="secondary" className="flex-1">
              <Link href="/diagnostic">Run again</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/starter">Skip to the $1 Starter</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageFrame>
  );
}

function PageFrame({
  hostLine,
  children,
}: {
  hostLine: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Your Diagnosis
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
          {hostLine}
        </h1>
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          The diagnostic does one thing: reads your page and labels the upstream
          failure. <strong>Wrong Person</strong>, <strong>Weak Offer</strong>,
          or <strong>Weak Belief</strong>. Then it hands you the door.
        </p>
        {children}
        <p className="text-xs text-muted-foreground mt-10 text-center">
          The diagnostic is a 90-second read of your live page. It is not a
          replacement for one real customer conversation.
        </p>
      </div>
    </div>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}
