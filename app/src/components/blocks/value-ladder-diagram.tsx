import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Value Ladder Diagram — visible rendering of the Brunson ladder.
 *
 * Closes the DCS Secret #2 audit gap that "a buyer staring at /machine-sales
 * or / does not see the ladder beyond the rung they are on." A ladder is the
 * customer's transformation map; if it is not visible, the next-yes does
 * not exist for the buyer mentally.
 *
 * Rungs rendered (workbook 02 §1 + workbook 02 §5):
 *   - Rung 0 (Free Diagnostic)   — built, live
 *   - Rung 1 ($1 Starter)         — built, live
 *   - Rung 2 ($49/mo Core)        — built, live
 *   - Rung 3 ($149/mo Repeatable) — spec locked, build gated
 *   - Rung 4 (Agency / Unlimited) — deferred indefinitely
 *
 * The diagram is honest about state: gated rungs are rendered with a
 * different visual treatment and link to the public spec page, not to a
 * fake "coming soon" countdown. This itself is a piece of Brunson polarity
 * (workbook 01 §6 Beat 5): every competitor in funnel-hacks.md either
 * pretends a missing rung exists or pretends it does not need to exist;
 * UnlockSaaS shows the full ladder, gated rungs included, with the
 * activation criterion stated in plain English.
 *
 * Pure server component. Renders to zero kB of client JS. Mountable on
 * /, /machine-sales, /repeatable, and any future page that benefits from
 * showing the customer transformation map.
 */

type RungState = "live" | "gated" | "deferred";

interface Rung {
  number: number;
  price: string;
  name: string;
  result: string;
  href: string | null;
  state: RungState;
  gateNote?: string;
}

const RUNGS: Rung[] = [
  {
    number: 0,
    price: "Free",
    name: "Free Diagnostic",
    result: "You see WHY your launch is flat — labeled in 90 seconds.",
    href: "/diagnostic",
    state: "live",
  },
  {
    number: 1,
    price: "$1",
    name: "Starter",
    result: "Your dream customer + irresistible offer, finished, kept.",
    href: "/starter",
    state: "live",
  },
  {
    number: 2,
    price: "$49/mo",
    name: "The Machine — Core",
    result:
      "Your first paying customer in 60 days, Stripe-verified, or you do not pay.",
    href: "/machine-sales",
    state: "live",
  },
  {
    number: 3,
    price: "$149/mo",
    name: "Repeatable Revenue Layer",
    result:
      "Carry your dream customer, AC, outreach, and Stripe pattern into Product 2 without starting from zero.",
    href: "/repeatable",
    state: "gated",
    gateNote:
      "Build gated on 3 verified Core customer cycles + 1 unprompted Core ask. Spec public.",
  },
  {
    number: 4,
    price: "TBD",
    name: "Agency / Unlimited Products",
    result:
      "Reserved slot. Re-evaluated only after Rung 3 has 10+ paying customers.",
    href: null,
    state: "deferred",
    gateNote: "Deferred indefinitely. No spec yet — no fake door.",
  },
];

interface ValueLadderDiagramProps {
  /** Which rung is the visitor on / closest to? Used to highlight. */
  highlight?: 0 | 1 | 2 | 3 | 4;
  /** Compact mode renders a tighter vertical list (e.g., on /machine-sales). */
  compact?: boolean;
  /** Section heading; pass null to omit. */
  heading?: string | null;
  /** Optional explainer beneath the heading. */
  intro?: React.ReactNode;
}

export function ValueLadderDiagram({
  highlight,
  compact = false,
  heading = "The full value ladder",
  intro,
}: ValueLadderDiagramProps) {
  return (
    <section
      className={cn(
        "mx-auto",
        compact ? "max-w-2xl py-8" : "max-w-3xl py-12 sm:py-16"
      )}
      aria-labelledby="value-ladder-heading"
    >
      {heading ? (
        <header className="mb-6 sm:mb-8 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Brunson Value Ladder
          </p>
          <h2
            id="value-ladder-heading"
            className={cn(
              "font-bold tracking-tight",
              compact
                ? "text-2xl sm:text-3xl"
                : "text-3xl sm:text-4xl"
            )}
          >
            {heading}
          </h2>
          {intro ? (
            <div className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {intro}
            </div>
          ) : null}
        </header>
      ) : null}

      <ol className="space-y-3 sm:space-y-4">
        {RUNGS.map((rung) => (
          <RungRow
            key={rung.number}
            rung={rung}
            highlighted={highlight === rung.number}
            compact={compact}
          />
        ))}
      </ol>

      {/* Discipline footer — workbook 01 §3 design rule. */}
      <p className="mt-8 text-xs text-muted-foreground text-center max-w-xl mx-auto leading-relaxed">
        Honest ladder. Every rung that is live has a real product behind it.
        Every rung that is not live has a spec, a gate, and no fake door.
        Workbook 02 §1, §5.
      </p>
    </section>
  );
}

function RungRow({
  rung,
  highlighted,
  compact,
}: {
  rung: Rung;
  highlighted: boolean;
  compact: boolean;
}) {
  const isLive = rung.state === "live";
  const isGated = rung.state === "gated";
  const isDeferred = rung.state === "deferred";

  const stateLabel =
    rung.state === "live"
      ? "Live"
      : rung.state === "gated"
        ? "Spec public, build gated"
        : "Deferred";

  const stateClasses = cn(
    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
    isLive && "bg-emerald-100 text-emerald-800",
    isGated && "bg-amber-100 text-amber-900",
    isDeferred && "bg-zinc-200 text-zinc-700"
  );

  const cardClasses = cn(
    "relative flex items-stretch gap-4 rounded-lg border bg-card p-4 sm:p-5 transition-colors",
    highlighted && "border-primary ring-2 ring-primary/30",
    !highlighted && "border-border",
    isDeferred && "opacity-70"
  );

  const inner = (
    <>
      {/* Rung number badge */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center rounded-md font-black text-lg sm:text-xl",
          compact ? "w-10" : "w-12 sm:w-14",
          isLive && "bg-orange-500 text-white",
          isGated && "bg-purple-200 text-purple-900",
          isDeferred && "bg-zinc-200 text-zinc-600"
        )}
        aria-hidden="true"
      >
        {rung.number}
      </div>

      {/* Rung content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-2 mb-1">
          <span className="text-sm font-bold tracking-wide text-foreground">
            {rung.price}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm font-semibold text-foreground">
            {rung.name}
          </span>
          <span className={stateClasses}>{stateLabel}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-snug">
          {rung.result}
        </p>
        {rung.gateNote ? (
          <p className="mt-2 text-xs text-muted-foreground italic">
            {rung.gateNote}
          </p>
        ) : null}
      </div>
    </>
  );

  if (rung.href) {
    return (
      <li>
        <Link
          href={rung.href}
          className={cn(cardClasses, "hover:border-primary/60 cursor-pointer")}
          aria-current={highlighted ? "step" : undefined}
        >
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className={cardClasses} aria-current={highlighted ? "step" : undefined}>
      {inner}
    </li>
  );
}
