/**
 * Hero – Brunson Hook / Story / Offer (DotCom Secrets §2 + Funnel Hacker's
 * Cookbook §1), reshaped 2026-05-17 to lead with the FREE DIAGNOSTIC instead
 * of the 5-email opt-in.
 *
 * Why the pivot: Maryan's product decision is to make the diagnostic the
 * primary outcome on the home surface. The 5 emails are still available
 * (footer of hero + exit-intent popup) but they are no longer the primary
 * conversion target – they were eating clicks the diagnostic should be
 * taking.
 *
 * New composition (emotion → logic, Brunson Expert Secrets §2):
 *   1. Eyebrow chip with live pulse + scarcity cue ("17 of 100 founding spots
 *      taken") – the visitor sees the urgency BEFORE the hook.
 *   2. H1 Hook – the emotional promise + the polarity move ("or refunded
 *      automatically"). Same as before, this is the most-tested line on the
 *      page.
 *   3. Scar-tissue subhead – founder authority in two short paragraphs.
 *      Marco trusts founders who failed publicly, not coaches who never did.
 *   4. PRIMARY CTA – "Get my free 2-minute diagnosis" → /diagnostic. The
 *      diagnostic is the lead funnel now. One large primary button.
 *   5. Secondary door – "Start the Playbook for $1" for the visitor who is
 *      already further down the ladder.
 *   6. Tertiary text links – the full $49/mo page AND the newsletter
 *      subscribe link, both subordinated to the diagnostic.
 *   7. Reverse-squeeze bridge – "read the five stories first" gives the
 *      hard-skeptic an exit ramp into content instead of bouncing.
 *
 * Visual treatment: subtle radial spotlight using shadcn primary token at 6%
 * opacity. No new colors introduced.
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
          {/* Eyebrow + scarcity cue */}
          <Badge
            variant="secondary"
            className="mb-7 gap-2 px-3 py-1 text-xs uppercase tracking-widest font-medium"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            />
            Founding rate · first 100 builders only
          </Badge>

          {/* Hook – emotional promise + polarity move. */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-balance">
            Your first paying customer{" "}
            <span className="text-muted-foreground">in 60 days.</span>
            <br />
            Or your money back,{" "}
            <span className="text-muted-foreground">automatically.</span>
          </h1>

          {/* Scar-tissue subhead – founder authority. Emotional first. */}
          <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto leading-relaxed">
            I shipped 12 AI products and nobody paid for any of them. Then I
            figured out why – and I built the playbook I wish someone had
            handed me before I burned a year of evenings on the wrong work.
          </p>
          <p className="text-sm text-foreground/80 mb-10">
            – Maryan, non-engineer founder
          </p>

          {/* PRIMARY CTA – the free diagnostic. One large button. */}
          <div className="mx-auto max-w-md mb-3">
            <Button asChild size="lg" className="w-full text-base sm:text-lg py-7">
              <Link href="/diagnostic">
                Get my free 2-minute diagnosis →
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
            Paste your live URL. In 90 seconds I tell you why it is flat –
            Wrong Person, Weak Offer, or Weak Belief – and the one move that
            fixes it. No card. No login. No newsletter.
          </p>

          {/* Secondary door – Starter $1. */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto mb-6">
            <Button asChild variant="outline" size="default" className="flex-1">
              <Link href="/starter">Start the Playbook for $1</Link>
            </Button>
            <Button asChild variant="ghost" size="default" className="flex-1">
              <Link href="/playbook-sales">Full Playbook – $49/mo</Link>
            </Button>
          </div>

          {/* Tertiary – content exit + small newsletter link. */}
          <p className="text-sm text-muted-foreground">
            Not ready?{" "}
            <Link
              href="/stories"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Read the stories first
            </Link>{" "}
            or{" "}
            <a
              href="#newsletter-tail"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              subscribe to the newsletter
            </a>
            .
          </p>
        </div>
      </div>
    </header>
  );
}
