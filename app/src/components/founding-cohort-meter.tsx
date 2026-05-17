import { seatsClaimed, FOUNDING_COHORT_CAP, cartWindow } from "@/lib/founding/cohort";

/**
 * Server-rendered cohort meter. Reads count from DB on every request.
 *
 * Workbook 03 Script 8 — "real (not fake) scarcity." This component does NOT
 * tick down on the client. The number you see is the number at the moment
 * the page rendered. Refresh to update. Brunson rule: no fake live counters.
 */
export async function FoundingCohortMeter() {
  const claimed = await seatsClaimed();
  const remaining = Math.max(0, FOUNDING_COHORT_CAP - claimed);
  const pct = Math.min(100, Math.round((claimed / FOUNDING_COHORT_CAP) * 100));
  const window = cartWindow();

  const label = (() => {
    if (window.state === "pre_launch") {
      return window.openAt
        ? `Cart opens ${window.openAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}`
        : "Waitlist open. Cart-open date to be announced.";
    }
    if (window.state === "closed") {
      return "The founding cart is closed.";
    }
    if (remaining === 0) {
      return "50 of 50 claimed. The door is closed.";
    }
    return `${claimed} of ${FOUNDING_COHORT_CAP} founding seats claimed — ${remaining} remaining.`;
  })();

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          The Founding Cohort
        </p>
        <p className="text-sm font-medium">
          {claimed} / {FOUNDING_COHORT_CAP}
        </p>
      </div>
      <div
        className="h-2 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FOUNDING_COHORT_CAP}
        aria-valuenow={claimed}
        aria-label="Founding cohort seats claimed"
      >
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground mt-2 leading-snug">{label}</p>
    </div>
  );
}
