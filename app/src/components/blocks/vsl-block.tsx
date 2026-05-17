/**
 * "Meet the founder" block — Brunson Building Block #20, text-only variant.
 *
 * Earlier revisions mounted a kinetic-typography scene player that swapped
 * lines on a timer. Maryan rejected the swap surface on 2026-05-17 and
 * asked for plain text. The six-line founder intro now renders as static
 * prose with no autoplay, no scenes, no <details> collapse, no JSON-LD
 * VideoObject (there is no video to claim).
 *
 * Props are kept as accept-and-ignore so the existing call sites
 * (`src/app/page.tsx`, `src/app/(marketing)/machine-sales/page.tsx`) keep
 * compiling. They were never passing values anyway.
 */

const SIX_LINE_INTRO = `I'm a marketer and an operator. I have never written a line of production code.
For most of my life that closed a door. Then in 2026, Lovable and Claude opened it
and I shipped real AI products in weeks. The shipping part felt like magic.
What came after did not. I would launch, open Stripe, and watch a line lie flat.
What finally broke me was sitting with more than ten other founders and hearing
my own story back. So I built the machine I wish someone had handed me.`;

interface Props {
  /** Retained for call-site compatibility; ignored in the text-only variant. */
  surface?: string;
  /** Retained for call-site compatibility; ignored in the text-only variant. */
  autoplay?: boolean;
}

export function VslBlock(_props: Props = {}) {
  return (
    <section className="py-16 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Meet the founder
        </p>
        <h2 className="text-2xl font-bold leading-tight">
          The story behind the Machine, in the founder&apos;s voice.
        </h2>
      </div>

      <blockquote className="pl-5 border-l-2 border-primary/40 text-muted-foreground leading-relaxed whitespace-pre-line">
        {SIX_LINE_INTRO}
      </blockquote>
      <p className="text-xs text-muted-foreground text-right mt-3 italic">— Maryan</p>
    </section>
  );
}
