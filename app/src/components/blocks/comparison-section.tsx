import { cacheLife } from "next/cache";
import { TldrBlock } from "@/components/tldr-block";

/**
 * ComparisonSection — anti-secrets comparison table.
 * Extracted from page.tsx for code-splitting (page-weight optimization).
 */
export async function ComparisonSection() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          What you have been trying
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          None of these remove the one thing that keeps the line flat.
        </h2>
      </div>
      <TldrBlock>
        Courses teach. Consultants understand. Tools assume you did the work
        already. The Playbook removes the avoidance option – outreach happens
        inside the software, not on your willpower.
      </TldrBlock>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-foreground">
            <tr>
              <th className="text-left p-3 font-semibold">Approach</th>
              <th className="text-left p-3 font-semibold">Cost</th>
              <th className="text-left p-3 font-semibold">Guarantee</th>
              <th className="text-left p-3 font-semibold">
                Removes avoidance?
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-t border-border">
              <td className="p-3">Doing nothing</td>
              <td className="p-3">Free</td>
              <td className="p-3">None</td>
              <td className="p-3">No — avoidance is the default state</td>
            </tr>
            <tr className="border-t border-border">
              <td className="p-3">Course / cohort</td>
              <td className="p-3">$497–$2,000</td>
              <td className="p-3">Refund-policy theatre</td>
              <td className="p-3">No — teaching, not doing</td>
            </tr>
            <tr className="border-t border-border">
              <td className="p-3">Hire a consultant</td>
              <td className="p-3">$3,000+</td>
              <td className="p-3">Hourly</td>
              <td className="p-3">No — outsourced understanding</td>
            </tr>
            <tr className="border-t border-border">
              <td className="p-3">Generic funnel/AI tool</td>
              <td className="p-3">$29–$99/mo</td>
              <td className="p-3">Trial only</td>
              <td className="p-3">No — assumes you already did the work</td>
            </tr>
            <tr className="border-t border-border bg-primary/5">
              <td className="p-3 font-semibold text-foreground">
                The Playbook
              </td>
              <td className="p-3 font-semibold text-foreground">$49/mo</td>
              <td className="p-3 font-semibold text-foreground">
                Stripe-verified, code-enforced
              </td>
              <td className="p-3 font-semibold text-foreground">
                Yes — outreach happens inside the tool
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground italic text-center mt-4">
        The comparison is honest. Every other approach has a place. None of
        them remove the avoidance, which is the actual disease.
      </p>
    </section>
  );
}
