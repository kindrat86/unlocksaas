/**
 * Hero — Brunson Hook / Story / Offer (DotCom Secrets §2 + Funnel Hacker's
 * Cookbook §1).
 *
 * The old hero was a 36-word thesis statement about an industry problem.
 * Brunson rule: the first 3 seconds must deliver a specific PROMISE plus the
 * polarity move that proves it. Thesis statements do not stop scroll. Promises
 * do.
 *
 * New composition:
 *   1. Eyebrow chip with live pulse — matches the rest-of-app Badge treatment
 *      but adds a "this is alive, not a static brochure" signal.
 *   2. H1 Hook — two-line punch: result + polarity move. The polarity move
 *      ("or refunded by webhook") is the differentiator no competitor offers,
 *      and Brunson canon says it belongs in the headline, not buried in fine
 *      print at the bottom.
 *   3. Scar-tissue subhead — the founder's authority anchor in one sentence.
 *      Marco trusts founders who have failed publicly, not coaches who haven't.
 *   4. Offer stack — ONE primary CTA (free diagnostic = lead funnel), TWO
 *      subordinated CTAs ($1 starter + $49 machine). Brunson rule: the
 *      visitor must know which door is the obvious next step.
 *   5. Reverse-squeeze bridge — "or read the five parables first" gives the
 *      hard-skeptic an exit ramp into content instead of bouncing.
 *
 * Visual treatment: subtle radial spotlight using shadcn primary token at 6%
 * opacity. Matches the dark aesthetic. No new colors introduced. The header
 * now reads as the same visual family as every block below it (eyebrow →
 * heading → body → CTAs), instead of looking like a separate "naked landing
 * strip" before the real page begins.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <header className="relative overflow-hidden">
      {/* Subtle radial spotlight — anchors the hero visually without
          introducing new colors. Inline style so the CSS variable + alpha
          syntax survives Tailwind's arbitrary-value parser intact. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 50% 0%, hsl(var(--primary) / 0.07), transparent 65%)",
        }}
      />
      {/* Hairline that softens the seam between hero and the proof bar below.
          Same border token the rest of the page already uses. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow — uses the same Badge variant as the rest of the page,
              with a live-dot signal to differentiate the hero variant. */}
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

          {/* Hook — promise + polarity move. */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-balance">
            Your first paying customer{" "}
            <span className="text-muted-foreground">in 60 days.</span>
            <br />
            Or your money back,{" "}
            <span className="text-muted-foreground">by webhook.</span>
          </h1>

          {/* Scar-tissue subhead — founder authority in one sentence. */}
          <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto leading-relaxed">
            I shipped 12 AI products and nobody paid for any of them. Then I
            figured out why — and built the machine I wish someone had handed
            me back then.
          </p>
          <p className="text-sm text-foreground/80 mb-10">
            — Maryan, marketer · non-engineer
          </p>

          {/* Primary CTA — the only domino with full button gravity. */}
          <div className="flex flex-col items-center gap-3 mb-7">
            <Button asChild size="lg" className="group">
              <Link href="/diagnostic" className="inline-flex items-center gap-2">
                Get my free 2-minute diagnosis
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Free · 2 minutes · No card required
            </p>
          </div>

          {/* Secondary doors — subordinated, same row, equal weight to each
              other but visually lighter than the primary CTA above. */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto">
            <Button asChild variant="outline" size="default" className="flex-1">
              <Link href="/starter">Start The Machine for $1</Link>
            </Button>
            <Button asChild variant="ghost" size="default" className="flex-1">
              <Link href="/machine-sales">The Full Machine — $49/mo</Link>
            </Button>
          </div>

          {/* Reverse-squeeze bridge (DCS Secret 14 reverse). Hard skeptics
              who do not want to click any door get a third exit into content. */}
          <p className="mt-10 text-sm text-muted-foreground">
            Or{" "}
            <Link
              href="/parables"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              read the five parables first
            </Link>
            {" "}— free, no email required.
          </p>
        </div>
      </div>
    </header>
  );
}
