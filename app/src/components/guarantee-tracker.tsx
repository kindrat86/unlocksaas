/**
 * Guarantee tracker UI block. Server-rendered inside the Machine dashboard.
 *
 * Renders one of several states based on GuaranteeEvaluation.phase:
 *   - no_subscription        → nothing (caller hides)
 *   - active                 → countdown + milestone checklist
 *   - verdict_kept           → celebratory "promise kept"
 *   - verdict_refund_eligible → refund button + amount
 *   - verdict_work_incomplete → "the work wasn't done; here's what's missing"
 *   - refunded               → "refunded on YYYY-MM-DD"
 *   - expired                → "claim window closed"
 *
 * Voice: Reluctant Hero. Direct, no hype. Tracks the rule "the framework
 * lives in the engine, not in forms" — the user reads facts, not instructions.
 */
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  formatRefundAmount,
  type GuaranteeEvaluation,
} from "@/lib/guarantee";
import { RefundButton } from "@/components/refund-button";

export function GuaranteeTracker({
  evaluation,
}: {
  evaluation: GuaranteeEvaluation;
}) {
  if (evaluation.phase === "no_subscription") return null;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">60-Day Guarantee</CardTitle>
          <PhaseBadge evaluation={evaluation} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <Headline evaluation={evaluation} />
        <Countdown evaluation={evaluation} />
        <MilestoneList evaluation={evaluation} />
        <Footer evaluation={evaluation} />
      </CardContent>
    </Card>
  );
}

function PhaseBadge({ evaluation }: { evaluation: GuaranteeEvaluation }) {
  switch (evaluation.phase) {
    case "active":
      return (
        <Badge variant="outline">{evaluation.daysRemaining}d remaining</Badge>
      );
    case "verdict_kept":
      return <Badge>Promise kept</Badge>;
    case "verdict_refund_eligible":
      return <Badge variant="destructive">Refund available</Badge>;
    case "verdict_work_incomplete":
      return <Badge variant="secondary">Window closed</Badge>;
    case "refunded":
      return <Badge variant="secondary">Refunded</Badge>;
    case "expired":
      return <Badge variant="outline">Claim window closed</Badge>;
    case "canceled_pre_window":
      return <Badge variant="outline">Canceled</Badge>;
    default:
      return null;
  }
}

function Headline({ evaluation }: { evaluation: GuaranteeEvaluation }) {
  switch (evaluation.phase) {
    case "active":
      return (
        <p className="text-sm text-muted-foreground leading-relaxed">
          The promise: your first paying customer within 60 days, verified by
          Stripe, or full refund of the {formatRefundAmount(evaluation.refund.maxRefundCents || 9800)}{" "}
          you&apos;ve paid in this window. No upsell. No extension.
        </p>
      );
    case "verdict_kept":
      return (
        <p className="text-sm leading-relaxed">
          A paying customer was detected on your Stripe account. The promise
          was kept. The subscription continues at $49/mo until you cancel it.
        </p>
      );
    case "verdict_refund_eligible":
      return (
        <p className="text-sm leading-relaxed">
          The 60 days ended. You did the work. No paying customer came through.
          The guarantee is yours to claim — {formatRefundAmount(
            evaluation.refund.maxRefundCents - evaluation.refund.refundedAtCents
          )}{" "}
          back. The subscription will cancel at the end of the current period.
        </p>
      );
    case "verdict_work_incomplete":
      return (
        <p className="text-sm leading-relaxed">
          The 60 days ended. The promise was conditional on completing the work
          inside the product. Here&apos;s what was missing:{" "}
          <span className="text-muted-foreground">
            {evaluation.milestones
              .filter((m) => !m.achieved)
              .map((m) => m.display)
              .join(", ")}
            .
          </span>
        </p>
      );
    case "refunded":
      return (
        <p className="text-sm text-muted-foreground leading-relaxed">
          The refund was issued. The subscription is set to cancel at the end
          of the current billing period. You keep access until then.
        </p>
      );
    case "expired":
      return (
        <p className="text-sm text-muted-foreground leading-relaxed">
          The claim window for the guarantee closed (30 days after the 60-day
          mark). The subscription continues at $49/mo until you cancel it.
        </p>
      );
    default:
      return null;
  }
}

function Countdown({ evaluation }: { evaluation: GuaranteeEvaluation }) {
  if (evaluation.phase !== "active" || !evaluation.startedAt) return null;

  const elapsedDays = Math.max(
    0,
    60 - Math.max(0, evaluation.daysRemaining)
  );
  const progress = Math.min(100, (elapsedDays / 60) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Day {elapsedDays} of 60</span>
        <span>
          {evaluation.daysRemaining > 0
            ? `${evaluation.daysRemaining} day${evaluation.daysRemaining === 1 ? "" : "s"} left`
            : "Closing today"}
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}

function MilestoneList({ evaluation }: { evaluation: GuaranteeEvaluation }) {
  if (
    evaluation.phase === "refunded" ||
    evaluation.phase === "expired" ||
    evaluation.phase === "verdict_kept"
  ) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Work Conditions ({evaluation.workCompleteCount}/
          {evaluation.workTotalCount})
        </p>
      </div>
      <ul className="space-y-1.5">
        {evaluation.milestones.map((m) => (
          <li
            key={m.key}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={
                  m.achieved
                    ? "inline-block w-4 h-4 rounded-full bg-primary"
                    : "inline-block w-4 h-4 rounded-full border border-muted-foreground/30"
                }
              />
              <span
                className={
                  m.achieved
                    ? "text-foreground"
                    : "text-muted-foreground"
                }
              >
                {m.display}
              </span>
            </div>
            {!m.achieved && (
              <Link
                href={`/machine/step/${m.stepIndex}`}
                className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                Step {m.stepIndex} →
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ evaluation }: { evaluation: GuaranteeEvaluation }) {
  if (evaluation.phase === "verdict_refund_eligible") {
    return (
      <div className="pt-2 border-t flex flex-col gap-3">
        <RefundButton
          maxRefundCents={
            evaluation.refund.maxRefundCents - evaluation.refund.refundedAtCents
          }
        />
        <p className="text-xs text-muted-foreground">
          One click refunds you. No emails, no friction. The promise was
          machine-verifiable from day one.
        </p>
      </div>
    );
  }

  if (evaluation.phase === "verdict_work_incomplete") {
    return (
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          The guarantee was conditional on the work happening inside the
          product. If you believe this is wrong, email maryan@unlocksaas.com.
        </p>
      </div>
    );
  }

  if (evaluation.phase === "active") {
    return (
      <p className="text-xs text-muted-foreground pt-2 border-t">
        The verdict is rendered automatically at the 60-day mark. Until then,
        the work in the Machine is what counts. Stripe is the only proof.
      </p>
    );
  }

  return null;
}
