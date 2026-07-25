import { cacheLife } from "next/cache";
import { TldrBlock } from "@/components/tldr-block";
import { HOMEPAGE_FAQS } from "@/lib/faqs";

/**
 * FaqSection — objection-handling FAQ list.
 * Extracted from page.tsx for code-splitting (page-weight optimization).
 */
export async function FaqSection() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-8 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Honest objections
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          What founders push back on — answered straight.
        </h2>
        <TldrBlock>
          Real doubts from real founders. Every objection below came from
          Indie Hackers or Hacker News threads written by someone exactly like
          you.
        </TldrBlock>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          Mined from public Indie Hackers and Hacker News threads written by
          founders matching the indie-founder profile.
        </p>
      </div>
      <div className="space-y-6">
        {HOMEPAGE_FAQS.map((item) => (
          <div key={item.q} className="group rounded-lg border border-border bg-card p-5 card-hover hover:border-primary/30 hover:shadow-md">
            <p className="font-semibold">{item.q}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
