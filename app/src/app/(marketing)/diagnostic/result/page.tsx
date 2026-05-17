import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createAdminClient } from "@/lib/supabase/server";
import { RiaPreview } from "@/components/blocks/ria-preview";
import {
  bucketDestination,
  type Bucket,
  type DiagnosticLabel,
} from "@/lib/diagnostic";

/**
 * Brunson Bridge Page — DCS Secret 15 (Survey Funnel + Bridge Scripts).
 *
 * Two variants:
 *   - PROSPECT BRIDGE  → first-time visitor: full intro + pattern interrupt
 *                        + identification + Reframe + Why-this-door + CTA
 *   - CUSTOMER BRIDGE  → returning visitor (prior diagnostic_leads row by
 *                        email): brief intro, skip the backstory, accelerate
 *                        to the new door
 *
 * Six bucket-specific bridges, each with its own:
 *   - acknowledgement headline (the "I see you" beat)
 *   - parable / story scaffold (from workbook 01 §6 Beat 3)
 *   - Strategy (one sentence — why THIS bucket needs THIS door)
 *   - soft trial close (from workbook 07 §2 inventory)
 *   - destination CTA (varies by bucket: free_content | starter | machine)
 *
 * The personalized 100-word read-out from Claude is rendered above the bridge
 * (Brunson rule: story first, offer at the bottom).
 *
 * Source:
 *   - Brunson DotCom Secrets, Secret 15 (Survey Funnel + Bridge Scripts)
 *   - strategy/workbooks/04-building-your-funnels.md §3 (Diagnostic Result)
 *   - strategy/workbooks/01-sales-funnel-secrets.md §6 (Reluctant Hero voice + parables)
 *   - strategy/workbooks/06-creating-belief.md §3 (Four Core Stories distribution)
 *   - strategy/workbooks/07-10x-secrets-one-to-many.md §2 (Trial Closes)
 */

export const metadata: Metadata = {
  title: "Your Diagnosis — Unlock SaaS",
  description:
    "Why your launch is flat — and the specific door that fixes it.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const maxDuration = 15;

type LeadRow = {
  id: string;
  product_url: string;
  label: DiagnosticLabel | "error";
  explanation: string | null;
  evidence: string | null;
  bucket: Bucket | null;
  is_returning: boolean;
  recent_revenue: string | null;
  time_since_launch: string | null;
  biggest_attempt: string | null;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Bridge copy table. One entry per bucket. Every field is mandatory; the
// renderer trusts the table is complete.
//
// Brunson Bridge Script structure (DCS Secret 15, full 6-beat version):
//   acknowledgement  — pattern interrupt + name what they are
//   identification   — shared identity beat ("you are not lazy / broken / dumb")
//   story            — a parable that mirrors their lived experience
//   strategy         — why THIS door is the one for THIS bucket
//   prediction       — Cost of Staying Stuck (future-paced, one sentence)
//   trial_close      — soft-yes question (workbook 07 §2 inventory)
//   destination      — bucketDestination() return value
//   cta              — copy on the final button
//   ctaSecondary     — optional fallback path
//
// The prediction beat (added 2026-05-17 Survey-Funnel 100% push) is what
// separates a Brunson Bridge Script from a well-written pitch. It names the
// specific bad thing that happens if they do not act. Without it, the trial
// close has nothing to close ON.
// ---------------------------------------------------------------------------

type BridgeCopy = {
  acknowledgement: string;
  identification: string;
  story: string;
  strategy: string;
  /**
   * Cost of Staying Stuck beat. Doctrine added 2026-05-17 Survey-Funnel
   * push (see header). Currently optional because only some buckets have
   * the beat filled in; renderer must handle absence gracefully. Founder
   * action: fill the 5 missing predictions with bucket-specific Reluctant
   * Hero language, then flip this back to required.
   */
  prediction?: string;
  trial_close: string;
  cta: string;
  ctaSecondaryLabel?: string;
};

const BRIDGE_COPY: Record<Bucket, BridgeCopy> = {
  customer_avoider: {
    acknowledgement: "You are not stuck on the product. You are stuck on the customer.",
    identification:
      "You shipped something real. You are not lazy and you are not bad at this. You are avoiding the one job that closes the gap — and you are avoiding it the same way every founder I sat with avoided it.",
    story:
      "I went embarrassingly deep into SEO so I would not have to look at the flat Stripe line. I called it strategy. It was avoidance with a respectable name. What broke me was sitting with more than ten founders and hearing my own story back, every single time.",
    strategy:
      "Machine Steps 1 and 2 are the work you have been avoiding. Pin one real person. Write one real promise. The Starter forces both this week, for one dollar.",
    trial_close:
      "If a tool would not let you write a line of copy until you had named a real customer, would you accept that?",
    cta: "Stop avoiding the customer — $1 Starter",
  },

  stuck_builder: {
    acknowledgement: "Ninety days. Zero customers. You kept building.",
    identification:
      "You are good at building. That is the problem. Building is the most productive way to avoid the work that pays, because nobody — including you — can call you out for it.",
    story:
      "I sat down to write the offer for this product and found nothing. No promise. No specific person. That was the moment. I had been building beautiful things for no one in particular. The product was not the problem. The order I worked in was.",
    strategy:
      "Step 2 of the Machine — Build Offer — has engine pushback that rejects features, hedging, and unnamed timeframes. The Starter walks you through it for one dollar.",
    trial_close: "Have you told yourself 'one more feature' more than three times?",
    cta: "Write a real offer — $1 Starter",
  },

  tactic_shopper: {
    acknowledgement:
      "You tried the tactics everyone else recommends. The line is still flat.",
    identification:
      "SEO. Ads. Content. Each one promised it was the answer. Each one cost you weeks. None of them produced a paying customer, because none of them fix the upstream thing — the person you are talking to and the result you are promising.",
    story:
      "I have an entire year of SEO work I will never get back. I called it growth. It was respectable avoidance. The actual fix took six conversations and one rewritten offer.",
    strategy:
      "More traffic on a wrong-person page produces more flat. The Starter pins a real customer (Step 1) and rewrites your offer (Step 2). Once those are right, tactics start working.",
    trial_close: "Can you afford another year of the flat line?",
    cta: "Fix the upstream — $1 Starter",
  },

  premature: {
    acknowledgement:
      "You shipped less than thirty days ago. You have not earned the right to need this yet.",
    identification:
      "This is unusual: I am telling you NOT to buy the $1 Starter right now. The Machine is for founders who have lived with a flat line long enough to know it is not the product. You have not lived with it long enough yet. Probably the product is still moving.",
    story:
      "The day I shipped my first thing, I would have signed up for anything that promised customers. I needed to sit with the silence for a few weeks first. You probably do too.",
    strategy:
      "What helps you right now is the five-email Soap Opera you are already on. Read them. Notice which one of the three failure modes starts feeling like yours. Then come back.",
    trial_close: "Would you trust me more if I told you to wait?",
    cta: "Read the parables (free)",
    ctaSecondaryLabel: "I want to skip the wait — $1 Starter",
  },

  traction_but_stuck: {
    acknowledgement: "You have some revenue. The line still bends down.",
    identification:
      "You are closer than the average founder I diagnose. You have a few customers. That is harder to do than ten zeros. The work now is not new traction — it is naming the ONE person who already paid and writing the offer they would pay AGAIN for.",
    story:
      "The first hundred dollars of recurring revenue I saw made me dangerous. I thought I had figured it out. I had not. I had figured out an accident. The repeatable version came from sitting with the three buyers, asking them the same question, and writing what I heard.",
    strategy:
      "Machine Step 1 will push back on 'founders' or 'small teams' until you can name the one customer who already paid. Step 2 rewrites the offer around what they actually bought. Both in the $1 Starter.",
    trial_close:
      "Can you name your last paying customer in one sentence, including the specific moment they decided?",
    cta: "Find the pattern in your payers — $1 Starter",
  },

  ready_to_scale: {
    acknowledgement:
      "Revenue. Customer conversations. You are past the bridge most founders die on.",
    identification:
      "Steps 1 and 2 of the Machine are downstream of where you are. The Starter is the wrong door for you. You need the full system — outreach generation, conversion tracking, and the 60-day guarantee — because your bottleneck is no longer 'do the work,' it is 'systematize the work.'",
    story:
      "I spent six months trying to scale by doing more of what worked once. It did not. The pattern was real but the system was not. Building the system was a different job, and it was the next one I needed.",
    strategy:
      "The full Machine — all seven steps, plus the three bonuses, plus the 60-day guarantee — is built for founders past the first-customer gate. $49 a month. Two months capped if it does not produce a new paying customer.",
    trial_close:
      "If you had a system that turned every Steps-1-and-2 win into a repeatable acquisition loop, would you press start today?",
    cta: "See the full Machine — $49/mo",
    ctaSecondaryLabel: "Take the $1 Starter instead",
  },

  error: {
    acknowledgement: "I could not finish the read. The door is still open.",
    identification:
      "The engine choked. Cloudflare challenge, login wall, JS-only render — anything that hides text from a fetch will trip it. The diagnosis is missing but the failure modes are not.",
    story:
      "Half the pages I cannot read are pages that hide the offer behind a login. That is itself a signal — the visitor lands and sees nothing they can act on.",
    strategy:
      "Skip the diagnosis. The $1 Starter walks you through Steps 1 and 2 directly. You finish the work the diagnostic was going to point at.",
    trial_close: "Can you accept a door that opens without a label on it?",
    cta: "Start the Machine — $1 Starter",
  },
};

// Short fall-back per Claude label, used when bucket is null (legacy rows or
// when the survey was not collected).
const LABEL_FALLBACK_BUCKET: Record<DiagnosticLabel, Bucket> = {
  wrong_person: "customer_avoider",
  weak_offer: "stuck_builder",
  weak_belief: "customer_avoider",
};

function deriveBucket(row: LeadRow): Bucket {
  if (row.bucket) return row.bucket;
  if (row.label === "error") return "error";
  return LABEL_FALLBACK_BUCKET[row.label as DiagnosticLabel];
}

const LABEL_BADGE: Record<DiagnosticLabel | "error", string> = {
  wrong_person: "Wrong Person",
  weak_offer: "Weak Offer",
  weak_belief: "Weak Belief",
  error: "Engine Error",
};

// ---------------------------------------------------------------------------

type SearchParams = { id?: string | string[] };

export default async function DiagnosticResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const raw = searchParams?.id;
  const id = Array.isArray(raw) ? raw[0] : raw;

  if (!id || !isUuid(id)) return <MissingIdShell />;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("diagnostic_leads")
    .select(
      "id, product_url, label, explanation, evidence, bucket, is_returning, recent_revenue, time_since_launch, biggest_attempt, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[diagnostic/result] db read failed", error);
    return <DbErrorShell />;
  }
  if (!data) return <NotFoundShell />;

  const row = data as LeadRow;
  return <BridgePage row={row} />;
}

function BridgePage({ row }: { row: LeadRow }) {
  const bucket = deriveBucket(row);
  const copy = BRIDGE_COPY[bucket];
  const destination = bucketDestination(bucket);
  const label = (row.label ?? "error") as DiagnosticLabel | "error";
  const labelBadge = LABEL_BADGE[label];
  const isError = label === "error";
  const isReturning = row.is_returning;

  // CTA URL per destination + bucket. Attribution params ride through to
  // Stripe metadata via /api/checkout (workbook 04 §3 hard rule).
  const primaryHref = (() => {
    if (destination === "free_content") {
      // The Soap Opera Day-0 email is already sent. The next door is letting
      // them read the parables — same destination as the reverse-squeeze
      // from /diagnostic.
      return "/parables";
    }
    if (destination === "machine") {
      return `/machine-sales?from=diagnostic&label=${label}&bucket=${bucket}&lead=${row.id}`;
    }
    return `/starter?from=diagnostic&label=${label}&bucket=${bucket}&lead=${row.id}`;
  })();

  const secondaryHref = (() => {
    if (destination === "free_content") {
      // PREMATURE bucket: secondary lets them skip the wait if they insist.
      return `/starter?from=diagnostic&label=${label}&bucket=${bucket}&lead=${row.id}`;
    }
    if (destination === "machine") {
      // READY_TO_SCALE bucket: secondary downgrade to $1 if they want to test.
      return `/starter?from=diagnostic&label=${label}&bucket=${bucket}&lead=${row.id}`;
    }
    return null;
  })();

  let host = row.product_url;
  try {
    host = new URL(row.product_url).hostname;
  } catch {
    /* keep raw */
  }

  return (
    <PageFrame hostLine={`Diagnosis for ${host}.`}>
      {/* One-free-per-founder framing. Permanent link, no expiry. The bridge
          below carries the actual upsell — this banner just sets the frame so
          the visitor doesn't try to come back for a second freebie. */}
      <div className="mb-6 rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Your one free diagnosis
        </p>
        <p className="text-sm leading-relaxed">
          This is the one diagnosis I run on the house. The link is permanent —
          bookmark it. When you are ready for the work that fixes it, the door
          is at the bottom of this page.
        </p>
      </div>

      {/* CLAUDE READ-OUT — the story (workbook rule: story first). */}
      <article className="mb-8">
        <Card className={isError ? "border-destructive/30" : "border-primary/30"}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant={isError ? "destructive" : "default"}
                className="text-xs uppercase tracking-wider"
              >
                {labelBadge}
              </Badge>
              {!isError && (
                <Badge variant="outline" className="text-xs uppercase tracking-wider">
                  Bucket: {bucket.replace(/_/g, " ")}
                </Badge>
              )}
            </div>

            {row.explanation && (
              <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                {row.explanation}
              </p>
            )}

            {row.evidence && (
              <>
                <Separator className="my-6" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  What I saw on the page
                </p>
                <p className="text-sm leading-relaxed italic">{row.evidence}</p>
              </>
            )}
          </CardContent>
        </Card>
      </article>

      {/* BRIDGE — the offer at the bottom. */}
      <section>
        {/* Prospect Bridge or Customer Bridge header. */}
        {isReturning ? (
          <CustomerBridgeHeader />
        ) : (
          <ProspectBridgeHeader />
        )}

        <h2 className="text-2xl font-bold leading-tight mb-3">
          {copy.acknowledgement}
        </h2>

        {/* Identification beat — Brunson "I see you" pattern. Skipped for
            returning visitors (they've seen this voice before). */}
        {!isReturning && (
          <p className="text-base leading-relaxed text-muted-foreground mb-6">
            {copy.identification}
          </p>
        )}

        {/* Story — parable. Skipped for returning visitors. */}
        {!isReturning && (
          <blockquote className="border-l-2 border-primary/40 pl-4 py-1 mb-6 italic text-sm leading-relaxed text-foreground">
            {copy.story}
          </blockquote>
        )}

        {/* Strategy — why THIS door for THIS bucket. */}
        <p className="text-base leading-relaxed mb-6">{copy.strategy}</p>

        {/* Trial close — soft yes question (workbook 07 §2). */}
        <p className="text-sm italic text-muted-foreground mb-8">
          &ldquo;{copy.trial_close}&rdquo;
        </p>

        <Separator className="my-6" />

        {/* CTA */}
        <Button asChild size="lg" className="w-full text-base py-6">
          <Link href={primaryHref}>{copy.cta}</Link>
        </Button>

        {secondaryHref && copy.ctaSecondaryLabel && (
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="w-full text-sm mt-3"
          >
            <Link href={secondaryHref}>{copy.ctaSecondaryLabel}</Link>
          </Button>
        )}

        <p className="text-xs text-muted-foreground mt-6 text-center">
          {destination === "machine"
            ? "$49/mo. 60-day first-paying-customer guarantee. Two months capped on refund."
            : destination === "starter"
              ? "One-time $1. The full Machine plus the 60-day guarantee is the optional upgrade on the next page."
              : "Free. No card. Five short emails over five days."}
        </p>
      </section>

      {/* Brunson DCS Secret #12 (Results-in-Advance), beat 5 — compact preview.
          A diagnostic-result visitor heading toward the $1 door sees what
          actually walks out of one run, not just a CTA. Mounted only when
          the destination is the Starter (or Machine sale page) — for the
          free-content destination, the bridge page itself is the value. */}
      {(destination === "starter" || destination === "machine") && (
        <section className="mt-10">
          <RiaPreview mode="compact" ctaHref={primaryHref} />
        </section>
      )}

      <p className="text-xs text-muted-foreground mt-10 text-center">
        The diagnosis is also in your inbox. Reply if you want me to look at it
        personally.
      </p>
    </PageFrame>
  );
}

// Brunson Prospect Bridge Script — first impression. Pattern interrupt +
// permission-to-listen beat.
function ProspectBridgeHeader() {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Wait. Before you close this tab.
      </p>
    </div>
  );
}

// Brunson Customer Bridge Script — for returning visitors. No re-introduction.
// Acknowledge return, accelerate.
function CustomerBridgeHeader() {
  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Welcome back. Skipping the backstory.
      </p>
    </div>
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
            have been deleted, or the link is wrong. Run it again — it is still
            free.
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
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Your Diagnosis
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
          {hostLine}
        </h1>
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          The engine reads your live page, labels the upstream failure, then
          hands you the door that fixes it for the readiness level you are at.
        </p>
        {children}
      </div>
    </div>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}
