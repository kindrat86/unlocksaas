/**
 * Hero – Brunson Hook / Story / Offer (DotCom Secrets §2 + Funnel Hacker's
 * Cookbook §1), reshaped 2026-05-17 to lead with the FREE DIAGNOSTIC instead
 * of the 5-email opt-in.
 *
 * 2026-05-21 source-aware variant pass: the Hero now reads a HeroVariant
 * copy deck (eyebrow + headline + scar-tissue subhead + primary CTA) so the
 * home page surfaces channel-native copy to the visitor's acquisition
 * source (IndieHackers, Marc Lou, X, HN, LinkedIn, MicroConf, Reddit,
 * launch directory, organic). Default variant preserves the originally
 * shipped copy verbatim — organic / direct / unknown traffic gets the
 * exact same page as before. See src/lib/acquisition-source.ts for the
 * variant catalog + first-touch cookie discipline. The source cookie is
 * written sticky for 90 days in proxy.ts; the homepage server component
 * reads it via readSourceFromCookies() and passes the resolved variant
 * down here.
 *
 * Why the lift exists: 2026 distribution research flagged dynamic-by-
 * referrer landing pages converting at 37.1% vs 19.2% for static — near-
 * 2x conversion lift. This is the cheapest possible version of that play:
 * one cookie, one Server Component, no JS, SSR-perfect, indexable HTML
 * stays identical for organic Googlebot/Bingbot/Perplexity (default
 * variant).
 *
 * Why the pivot to diagnostic (2026-05-17 origin): Maryan's product
 * decision is to make the diagnostic the primary outcome on the home
 * surface. The 5 emails are still available (footer of hero + exit-intent
 * popup) but they are no longer the primary conversion target – they were
 * eating clicks the diagnostic should be taking.
 *
 * Composition (emotion → logic, Brunson Expert Secrets §2):
 *   1. Eyebrow chip with live pulse + scarcity/channel cue – the visitor
 *      sees the urgency (or the channel signal) BEFORE the hook.
 *   2. H1 Hook – the emotional promise + the polarity move. Source-aware
 *      lead and tail; default preserves the originally shipped wording.
 *   3. Scar-tissue subhead – founder authority in two short paragraphs.
 *      The avatar trusts founders who failed publicly, not coaches who never
 *      did. Source-aware first paragraph; closer (founder credit) is
 *      variant-specific.
 *   4. PRIMARY CTA – "Get my free 2-minute diagnosis" → /diagnostic. The
 *      diagnostic is the lead funnel now. One large primary button.
 *      Source-aware verb so the button copy matches the channel-native
 *      eyebrow without breaking the destination (/diagnostic).
 *   5. Secondary door – "Start the Playbook for $1" for the visitor who
 *      is already further down the ladder.
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
import {
  HERO_VARIANTS,
  type HeroVariant,
} from "@/lib/acquisition-source";

type HeroProps = {
  /**
   * Optional variant override. When omitted, the `default` variant ships
   * (matches the originally shipped copy). Callers (the homepage Server
   * Component) read the source cookie via readSourceFromCookies() and
   * pass the resolved HeroVariant down. Passing the resolved variant as
   * a prop keeps this component free of next/headers imports so it can
   * still be rendered in tests / Storybook without a real request.
   */
  variant?: HeroVariant;
};

export function Hero({ variant }: HeroProps = {}) {
  const copy = variant ?? HERO_VARIANTS.default;

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
          {/* Eyebrow + scarcity/channel cue – source-aware. */}
          <Badge
            variant="secondary"
            className="mb-7 gap-2 px-3 py-1 text-xs uppercase tracking-widest font-medium animate-fade-up"
          >
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
            />
            {copy.eyebrow}
          </Badge>

          {/* Hook – emotional promise + polarity move. Source-aware. */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-balance animate-fade-up" style={{ animationDelay: "60ms" }}>
            {copy.headlineLead}{" "}
            <span className="text-muted-foreground">
              {copy.headlineLeadMuted}
            </span>
            <br />
            {copy.headlineTailLead}{" "}
            <span className="text-muted-foreground">
              {copy.headlineTailMuted}
            </span>
          </h1>

          {/* Scar-tissue subhead – founder authority. Source-aware first
              paragraph; closer (founder credit) is variant-specific. */}
          <p className="text-base sm:text-lg text-muted-foreground mb-2 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "120ms" }}>
            {copy.subheadOpener}
          </p>
          <p className="text-sm text-foreground/80 mb-10 animate-fade-up" style={{ animationDelay: "160ms" }}>
            {copy.subheadCloser}
          </p>

          {/* PRIMARY CTA – the free diagnostic. One large button. Source-
              aware verb so the button copy matches the channel-native
              eyebrow without breaking the destination (/diagnostic). */}
          <div className="mx-auto max-w-md mb-3 animate-fade-up" style={{ animationDelay: "220ms" }}>
            <Button asChild size="lg" className="w-full text-base sm:text-lg py-7 btn-glow">
              <Link href="/diagnostic">{copy.primaryCta}</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto animate-fade-up" style={{ animationDelay: "260ms" }}>
            Paste your live URL. In 90 seconds I tell you why it is flat –
            Wrong Person, Weak Offer, or Weak Belief – and the one move that
            fixes it. No card. No login. No newsletter.
          </p>

          {/* Secondary door – Starter $1. */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center max-w-md mx-auto mb-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
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
