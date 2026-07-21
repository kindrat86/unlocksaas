import { cacheLife } from "next/cache";
import { TldrBlock } from "@/components/tldr-block";

/**
 * TimelineSection — static cached receipts section.
 * Extracted from page.tsx for code-splitting (page-weight optimization).
 */
export async function TimelineSection() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-10 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Receipts
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          How a flat Stripe line became this page.
        </h2>
      </div>
      <TldrBlock>
        Five shipped products, three years of learning traffic tactics, one year
        of sitting with founders, and one code-locked system that removes
        avoidance.
      </TldrBlock>
      <ol className="space-y-5 sm:space-y-4">
        {[
          {
            date: "2025, summer",
            line:
              "First AI product shipped with Lovable. Stripe stayed at zero. Told myself it was the product.",
          },
          {
            date: "2025, autumn",
            line:
              "Three more products shipped. Two paying users across all four. Started a deep dive into SEO so I would not have to look at the line.",
          },
          {
            date: "2026, winter",
            line:
              "Sat down to write the offer for the fifth product. Found nothing. No promise. No specific person.",
          },
          {
            date: "2026, spring",
            line:
              "Ran ten founder conversations. Heard my own story back, every time. Stopped fixing products. Started fixing the order.",
          },
          {
            date: "2026, May",
            line:
              "Locked the Brunson workbook chain end-to-end. Shipped this funnel.",
          },
        ].map((row) => (
          <li
            key={row.date}
            className="flex flex-col sm:flex-row gap-1 sm:gap-4"
          >
            <div className="shrink-0 sm:w-32 text-xs uppercase tracking-widest text-muted-foreground sm:pt-1">
              {row.date}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {row.line}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
