/**
 * Comparison Table — Brunson Building Block #17.
 *
 * Positions the Playbook against the four things the founder has ALREADY tried that
 * did not produce a paying customer. Workbook 01 §6 Beat 5 polarity AGAINST
 * list maps directly: SEO/AEO/GEO, courses, "validate your idea" advice,
 * funnel tooling that quietly assumes you can code.
 *
 * Visual rule: Playbook column is the ONLY one with the green check on the
 * row that matters (produces a verified customer). Every other column gets
 * red X marks. The skeptic counts the X's.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Check, X } from "lucide-react";

type ComparisonRow = {
  capability: string;
  playbook: boolean;
  course: boolean;
  seo: boolean;
  coach: boolean;
  diy: boolean;
};

const ROWS: ComparisonRow[] = [
  {
    capability: "Tells you what to do",
    playbook: true,
    course: true,
    seo: false,
    coach: true,
    diy: true,
  },
  {
    capability: "Pushes back when your answer is vague",
    playbook: true,
    course: false,
    seo: false,
    coach: true,
    diy: false,
  },
  {
    capability: "Sends the outreach for you (inside the tool)",
    playbook: true,
    course: false,
    seo: false,
    coach: false,
    diy: false,
  },
  {
    capability: "Verifies your first paying customer via Stripe webhook",
    playbook: true,
    course: false,
    seo: false,
    coach: false,
    diy: false,
  },
  {
    capability: "Refunds you in code if the result does not happen",
    playbook: true,
    course: false,
    seo: false,
    coach: false,
    diy: false,
  },
  {
    capability: "Stops you from skipping the work that gets paid",
    playbook: true,
    course: false,
    seo: false,
    coach: false,
    diy: false,
  },
  {
    capability: "Costs less than $98 to find out if it works",
    playbook: true,
    course: false,
    seo: false,
    coach: false,
    diy: true,
  },
];

function YesNo({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <Check
      className="h-5 w-5 text-primary mx-auto"
      aria-label={`Yes — ${label}`}
    />
  ) : (
    <X
      className="h-5 w-5 text-muted-foreground/50 mx-auto"
      aria-label={`No — ${label}`}
    />
  );
}

export function ComparisonTable() {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Things You Already Tried
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          Count the green checks. That is the difference.
        </h2>
      </div>

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Capability
                </th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-foreground">
                  Playbook
                </th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Course
                </th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  SEO
                </th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Coach
                </th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                  Build it yourself
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.capability} className="border-b border-border/40 last:border-b-0">
                  <td className="py-3 pr-4 leading-snug">{row.capability}</td>
                  <td className="py-3 px-2 text-center">
                    <YesNo value={row.playbook} label={row.capability} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <YesNo value={row.course} label={row.capability} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <YesNo value={row.seo} label={row.capability} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <YesNo value={row.coach} label={row.capability} />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <YesNo value={row.diy} label={row.capability} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground italic text-center mt-6 leading-relaxed">
        You can build the Playbook yourself in three weekends. While you do, you are not
        running the funnel. That is the disease the Playbook treats.
      </p>
    </section>
  );
}
