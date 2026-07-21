import { cacheLife } from "next/cache";
import { TldrBlock } from "@/components/tldr-block";

/**
 * ManifestoSection — the movement manifesto.
 * Extracted from page.tsx for code-splitting (page-weight optimization).
 * Title is A/B variant-specific, passed as prop.
 */
export async function ManifestoSection({ manifestoTitle }: { manifestoTitle: string }) {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-7 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Movement
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          {manifestoTitle}
        </h2>
      </div>
      <TldrBlock>
        We stopped pretending the product was the problem. The missing piece
        was naming one real person and making one real promise before we were
        ready to sell it.
      </TldrBlock>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        Post-launch founders who built real products with AI tools, watched them flatline in Stripe, and refused to call it a product problem. We measure progress in Stripe charges, not in encouragement. The work nobody taught us to do -- name one real person, make one real promise, sell it before it felt ready -- is what this movement runs on.
      </p>
      <blockquote className="text-muted-foreground space-y-4 leading-relaxed">
        <p>
          We are non-engineer founders who shipped real things with AI tools
          we did not write.
        </p>
        <p>
          We were told the answer was more building, then more traffic, then
          a better course. We tried all three. The line stayed flat.
        </p>
        <p>
          We stopped pretending the problem was the product. The problem was
          the work nobody taught us to do:{" "}
          <strong className="text-foreground font-semibold">
            name one real person, make one real promise, sell it before it
            felt ready.
          </strong>
        </p>
        <p>
          We do not collect praise.{" "}
          <strong className="text-foreground font-semibold">
            We collect customers.
          </strong>{" "}
          No encouragement count. No traction-porn. Only Stripe charges.
        </p>
        <p>
          <strong className="text-foreground font-semibold">
            This is not a self-improvement group. This is a shipping movement.
          </strong>
        </p>
      </blockquote>
    </section>
  );
}
