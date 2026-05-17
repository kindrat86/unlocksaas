import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getIdentityLabels, readIdentityFromCookies } from "@/lib/ab";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { BeforeAfter } from "@/components/blocks/before-after";
import { HonestTestimonials } from "@/components/blocks/honest-testimonials";
import { VslBlock } from "@/components/blocks/vsl-block";
import { MediaBar } from "@/components/blocks/media-bar";
import { AvatarWall } from "@/components/blocks/avatar-wall";
import { StackSlide } from "@/components/blocks/stack-slide";
import { GuaranteeHero } from "@/components/blocks/guarantee-hero";
import { FinalCta } from "@/components/blocks/final-cta";
import { StickyCta } from "@/components/blocks/sticky-cta";
import { SignatureFooter } from "@/components/blocks/signature-footer";
import { shouldRenderMediaBar } from "@/lib/media-mentions";
import { HOMEPAGE_FAQS } from "@/lib/faqs";
import {
  OrganizationJsonLd,
  PersonJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";

/**
 * UnlockSaaS Funnel Hub.
 *
 * Building blocks per workbook 04 §2 + 23 Building Blocks (DotCom Secrets) +
 * Funnel Hacker's Cookbook v1 trust columns (strategy/funnel-hackers-cookbook.md):
 *
 *   1. Hero — enemy sentence + one-line bio + 3 CTAs (diagnostic / starter / machine)
 *   2. Social proof bar (structural proof, not numeric)
 *   3. Media bar — earned mentions, auto-renders at ≥3 (Cookbook Swipe 3)
 *   4. Manifesto (half) — Verified / Paid Builders A/B from cookie
 *   5. Before / After block
 *   6. Founder VSL (env-driven, kinetic fallback)
 *   7. Founder timeline
 *   8. Comparison block — Machine vs Course vs DIY vs Doing-Nothing
 *   9. Stack Slide — eight deliverables + $49/mo anchor (Block #14)
 *  10. Guarantee Hero — 60-day Stripe-verified polarity move (Cookbook §4)
 *  11. Honest testimonials — public quotes from real founders
 *  12. Avatar wall — verified builders, auto-renders at ≥9 (Cookbook Swipe 6)
 *  13. FAQ — sourced from strategy/dollar-objections.md (6 entries)
 *  14. Newsletter signup — real form, fires Day 0 of Soap Opera
 *  15. Final CTA — close-the-loop three doors one more time (Block #21)
 *  16. Honest "as seen in" empty-state — only renders when MediaBar is hidden
 *  17. Social links
 *  18. Maryan signature footer (Cookbook Swipe 4)
 *  19. Sticky scroll CTA — always-visible offer bar below the hero
 *
 * Theming: matches the rest of the app. shadcn theme tokens only — no
 * explicit colors, no script fonts. Inherits dark mode from layout.tsx.
 */
export default function FunnelHub() {
  const variant = readIdentityFromCookies();
  const labels = getIdentityLabels(variant);
  const showHonestEmptyState = !shouldRenderMediaBar();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Surface B (AEO/GEO/AIO) — Organization + Person + FAQPage schema for
          LLM citation anchoring. The FAQPage block consumes the same
          HOMEPAGE_FAQS list rendered below, so visible content and structured
          data never diverge. */}
      <OrganizationJsonLd />
      <PersonJsonLd />
      <FaqPageJsonLd items={HOMEPAGE_FAQS} />
      <AbExposureBeacon />

      {/* ---------------- HERO ---------------- */}
      <header className="py-16 sm:py-24 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            Pre-revenue founders building with AI
          </Badge>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
            The problem stuck founders have is not the product. It is that an
            entire industry profits from teaching them to keep building when
            the only thing left is to sell.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Marketer, non-engineer, built a dozen AI products that nobody paid
            for. Then I figured out why.{" "}
            <span className="text-foreground">— Maryan</span>
          </p>

          {/* Primary CTA — restrained shadcn default. */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Button asChild size="lg">
              <Link href="/diagnostic">Yes — get my free diagnosis</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Free · 2 minutes · No card required
            </p>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <Button asChild variant="outline" size="lg">
              <Link href="/starter">Start the Machine for $1</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/machine-sales">The Full Machine — $49/mo</Link>
            </Button>
          </div>

          {/* Reverse-squeeze bridge — DCS Secret 14 reverse variant. */}
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
      </header>

      {/* Building Block #20 — Social Proof Bar (honest variant). */}
      <SocialProofBar />

      {/* Cookbook Swipe 3 — "As seen in" earned-media bar. Pre-staged. */}
      <MediaBar />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- MANIFESTO (half) — A/B identity_label ---------------- */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center leading-tight">
          {labels.manifestoTitle}
        </h2>
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
            We measure progress in Stripe charges, not in encouragement. We do
            not collect praise.{" "}
            <strong className="text-foreground font-semibold">
              We collect customers.
            </strong>
          </p>
        </blockquote>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- BEFORE / AFTER (Block #22) ---------------- */}
      <BeforeAfter />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FOUNDER VSL (Block #20) ---------------- */}
      <VslBlock />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FOUNDER TIMELINE ---------------- */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center leading-tight">
          The Timeline
        </h2>
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

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- COMPARISON ---------------- */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center leading-tight">
          What you have been trying — and what is different about this.
        </h2>
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
                  The Machine
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

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- STACK SLIDE — Block #14 ---------------- */}
      <StackSlide />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- GUARANTEE HERO — polarity move (Cookbook §4) ---------------- */}
      <GuaranteeHero />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- HONEST TESTIMONIALS (Block #7) ---------------- */}
      <HonestTestimonials />

      {/* Cookbook Swipe 6 — Verified Builder avatar wall. Pre-staged. */}
      <Suspense fallback={null}>
        <AvatarWall />
      </Suspense>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FAQ ---------------- */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center leading-tight">
          Honest objections.
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8">
          Mined from public Indie Hackers and Hacker News threads written by
          founders matching the Marco avatar. Full sources:{" "}
          <code className="text-xs">strategy/dollar-objections.md</code>.
        </p>
        <div className="space-y-6">
          {HOMEPAGE_FAQS.map((item) => (
            <div key={item.q}>
              <p className="font-semibold">{item.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-md mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 leading-tight">
          Not ready to subscribe? Read the five-day arc first.
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Founders who build real things with AI deserve to get paid for them.
          One short email a day for five days, written like a letter from one
          founder to another. Reply STOP anytime.
        </p>
        <NewsletterSignup />
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- FINAL CTA — close-the-loop ---------------- */}
      <FinalCta />

      {/* ---------------- HONEST "AS SEEN IN" EMPTY-STATE ----------------
          Only renders when the MediaBar above is hidden (< 3 earned mentions). */}
      {showHonestEmptyState ? (
        <>
          <Separator className="max-w-4xl mx-auto" />
          <section className="py-10 sm:py-12 px-4 sm:px-6 max-w-2xl mx-auto text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              As seen in
            </p>
            <p className="text-sm text-muted-foreground italic">
              Nowhere yet. Reluctant Hero rule: no fake logos. The first time
              a podcast or newsletter mentions Unlock SaaS, that logo lands
              here. Build in public means showing the empty version too.
            </p>
          </section>
        </>
      ) : null}

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- SOCIAL ---------------- */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 max-w-md mx-auto text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Find me
        </p>
        <div className="flex gap-4 justify-center text-sm text-muted-foreground">
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            X / Twitter
          </a>
          <a
            href="https://www.indiehackers.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Indie Hackers
          </a>
          <a
            href="https://reddit.com/r/SaaS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            r/SaaS
          </a>
        </div>
      </section>

      {/* ---------------- FOOTER — Maryan signature (Cookbook Swipe 4) ---------------- */}
      <SignatureFooter />

      {/* ---------------- STICKY SCROLL CTA — below-hero offer bar ---------------- */}
      <StickyCta />
    </div>
  );
}
