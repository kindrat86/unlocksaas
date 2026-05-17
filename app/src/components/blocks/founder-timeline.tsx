/**
 * Founder Timeline — Brunson Building Block #21.
 *
 * The Reluctant Hero arc (workbook 06 §2 Hero's Two Journeys) made visual.
 * External arc on top (events), internal arc beneath (what changed in his
 * head). Marco recognizes himself in the internal column. That recognition
 * is the conversion event.
 *
 * Voice: workbook 01 §6 Beat 2 (one-line bio expanded), workbook 06 §2.
 */
import { Separator } from "@/components/ui/separator";

type TimelineEntry = {
  year: string;
  external: string;
  internal: string;
};

const ENTRIES: TimelineEntry[] = [
  {
    year: "Pre-2026",
    external: "Marketing career. Operator. Never wrote production code.",
    internal: "Building software was for other people.",
  },
  {
    year: "Early 2026",
    external: "Lovable + Claude. Shipped real AI products in weeks.",
    internal: "The door opened. I walked through it.",
  },
  {
    year: "Spring 2026",
    external: "Opened Stripe daily. Watched a line stay flat.",
    internal: "The product is the problem. One more polish pass and they'll buy.",
  },
  {
    year: "Mid-2026",
    external: "Disappeared into SEO and tactic-shopping for a year.",
    internal: "Productive avoidance feels safer than the truth.",
  },
  {
    year: "Late 2026",
    external: "Sat with 10+ other founders. Heard my own story back, every time.",
    internal: "The problem was never the product. It was the work I skipped.",
  },
  {
    year: "Now",
    external: "Built the Machine. Running it on myself first.",
    internal: "If it doesn't work for me, it doesn't ship.",
  },
];

export function FounderTimeline() {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Path
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          From flat Stripe line to the Machine that broke me out of it.
        </h2>
      </div>

      <ol className="space-y-0">
        {ENTRIES.map((entry, idx) => (
          <li key={entry.year} className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 md:grid-cols-[7rem_1fr]">
            <div className="text-xs uppercase tracking-widest text-muted-foreground pt-1">
              {entry.year}
            </div>
            <div className="pb-6">
              <p className="text-sm font-semibold leading-snug">
                {entry.external}
              </p>
              <p className="text-sm text-muted-foreground italic mt-1 leading-relaxed">
                {entry.internal}
              </p>
              {idx < ENTRIES.length - 1 ? (
                <Separator className="mt-6 opacity-50" />
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
