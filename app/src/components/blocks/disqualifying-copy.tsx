/**
 * DisqualifyingCopy — Brunson 23 Building Blocks #11 (Disqualifier).
 *
 * Brunson's rule (DCS Secret 13 / ES Polarity): a high-converting funnel
 * actively REPELS the wrong avatar before the FAQ. Disqualifying copy is
 * not a footer disclaimer — it is a piece of polarity that earns trust
 * from the right reader by visibly turning down the wrong one. Pre-FAQ
 * placement is intentional: the FAQ answers objections from qualified
 * readers; the disqualifier removes unqualified ones first.
 *
 * Source:
 * - Workbook 01 §6 Beat 5 (Polarity — what you stand AGAINST)
 * - Workbook 04 §4 "Disqualifying copy" block on the $49 page
 * - Workbook 09 §1 Soap Opera rule: story first, polarity sharp
 *
 * Five items. Each one mirrors a specific AGAINST line from the workbook;
 * each one closes a specific wrong-avatar gate.
 *
 * Pure server component. Zero kB to client.
 */

const DISQUALIFIERS: { gate: string; line: string }[] = [
  {
    gate: "You have not shipped anything yet.",
    line:
      "Go ship first. Come back when your Stripe is flat. The Machine treats post-launch avoidance; it cannot manufacture a product that does not exist yet.",
  },
  {
    gate: "You want a course, a PDF, or a Slack group.",
    line:
      "This is software, not a curriculum. The framework lives in the engine — you do not read it, you run it. If you want teaching, courses cost $497 and have no guarantee.",
  },
  {
    gate: "You want more traffic tactics.",
    line:
      "The disease is upstream of traffic. SEO, AEO, GEO, and paid ads do not fix a product built for no one in particular. If you have not named one real person and written one real offer, traffic is not your bottleneck.",
  },
  {
    gate: "You want the tool to do your outreach for you.",
    line:
      "The tool removes the avoidance option; it does not do the work. Step 5 generates the message, picks the target, and tracks the send — you still press send. If you want done-for-you, hire a consultant.",
  },
  {
    gate: "You want a magic number on your dashboard tomorrow.",
    line:
      "The clock is 60 days. Real outreach takes real days. The honest math says one verified paying customer is a win — and the only one that matters. If you want vanity metrics, every other tool on the market sells them.",
  },
];

export function DisqualifyingCopy() {
  return (
    <section
      aria-labelledby="disqualifier-heading"
      className="py-12 sm:py-16 px-4 sm:px-6"
    >
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
            Honest polarity
          </p>
          <h2
            id="disqualifier-heading"
            className="text-2xl sm:text-3xl font-bold text-foreground leading-tight"
          >
            This is not for you if…
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Five honest disqualifiers. Each one is here because The Machine is
            wrong for the reader behind it. Cheaper to find out now than in
            month two.
          </p>
        </header>

        <ul className="space-y-5">
          {DISQUALIFIERS.map((item) => (
            <li
              key={item.gate}
              className="border-l-2 border-zinc-300 pl-4 sm:pl-5 py-1"
            >
              <p className="font-semibold text-foreground leading-snug">
                {item.gate}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {item.line}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs text-muted-foreground italic text-center leading-relaxed">
          Polarity is not rudeness. The line that disqualifies the wrong reader
          is the same line that qualifies the right one.
        </p>
      </div>
    </section>
  );
}
