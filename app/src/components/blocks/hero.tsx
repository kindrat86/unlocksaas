/**
 * Hero – Brunson Hook / Story / Offer (DotCom Secrets §2 + Funnel Hacker's
 * Cookbook §1) reshaped for a LEAD-FUNNEL primary outcome.
 *
 * The homepage's stated target is "get a subscriber" – not "get a checkout".
 * Per Brunson Traffic Secrets Chapter 5 (Owned Traffic) and DotCom Secrets
 * Secret 14 (Reverse Squeeze), a lead-funnel hero has ONE primary CTA: the
 * email opt-in. Everything else on the page is supporting work.
 *
 * New composition:
 *   1. Eyebrow chip with live pulse – "this is alive, not a brochure".
 *   2. H1 Hook – two-line punch: result + polarity move ("or refunded
 *      automatically"). The polarity move is the differentiator no
 *      competitor in the space offers.
 *   3. Scar-tissue subhead – the founder's authority anchor in one sentence.
 *      Marco trusts founders who have failed publicly, not coaches who
 *      haven't.
 *   4. PRIMARY CTA – inline newsletter capture. The five-email arc IS the
 *      lead magnet. Email field + button + one-line value reminder.
 *   5. Subordinated doors – diagnostic ($0) and Starter ($1) as smaller
 *      buttons below. The full Playbook ($49/mo) link is a quiet text
 *      tertiary; visitors at hero-temperature do not buy $49/mo cold.
 *   6. Reverse-squeeze bridge – "or read the five stories first" gives the
 *      hard-skeptic an exit ramp into content instead of bouncing.
 *
 * Visual treatment: subtle radial spotlight using shadcn primary token at 6%
 * opacity. Matches the dark aesthetic. No new colors introduced.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsletterSignup } from "@/components/newsletter-signup";

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Subtle radial spotlight – anchors the hero visually without
          introducing new colors. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, hsl(var(--primary) / 0.12), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Eyebrow */}
          <Badge
            variant="secondary"
            className="mb-7 gap-2 px-3 py-1 text-xs uppercase tracking-widest font-medium"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            />
            Pre-revenue founders building with AI
          </Badge>

          {/* Hook – promise + polarity move. */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-balance">
            Your first paying customer{" "}
            <span className="text-muted-foreground">in 60 days.</span>
            <br />
            Or your money back,{" "}
            <span className="text-muted-foreground">automatically.</span>
          </h1>

          {/* Scar-tissue subhead – founder authority in one sentence. */}
          <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto leading-relaxed">
            I shipped 12 AI products and nobody paid for any of them. Then I
            figured out why – and I wrote the five emails I wish someone had
            sent me before I burned a year of evenings on the wrong work.
          </p>
          <p className="text-sm text-foreground/80 mb-8">
            – Maryan, non-engineer founder
          </p>

          {/* PRIMARY CTA – the five-email arc, inline opt-in. This is the
              lead-funnel ask. Workbook 09 §1 Soap Opera Sequence is the
              after-opt-in payoff. */}
          <div className="mx-auto max-w-md mb-3 text-left">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center">
              Start with the 5-day arc – free
            </p>
            <NewsletterSignup variant="hero" source="hero" />
          </div>
          <p className="text-xs text-muted-foreground mb-10 leading-relaxed max-w-md mx-auto">
            One short letter a day for five days, from one founder to another.
            By Friday you will know which beat is keeping your Stripe line
            flat – and what the work that fixes it actually looks like.
          </p>

          {/* Secondary doors – subordinated to the email opt-in above.
              Diagnostic and Starter both get sub-buttons. The full $49 page
              is a quiet text link below – visitors at hero-temperature do
              not buy $49/mo cold. */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto mb-6">
            <Button asChild variant="outline" size="default" className="flex-1">
              <Link href="/diagnostic">Free 2-minute diagnosis</Link>
            </Button>
            <Button asChild variant="outline" size="default" className="flex-1">
              <Link href="/starter">Start the Playbook for $1</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-7">
            Already convinced?{" "}
            <Link
              href="/playbook-sales"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Skip ahead to the full Playbook – $49/mo
            </Link>
          </p>

          {/* Reverse-squeeze bridge (DCS Secret 14 reverse). Hard skeptics
              who do not want to opt in get a third exit into content. */}
          <p className="text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/stories"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              read the five stories first
            </Link>{" "}
            – free, no email required.
          </p>
        </div>
      </div>
    </header>
  );
}
