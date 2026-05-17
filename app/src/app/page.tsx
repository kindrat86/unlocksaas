import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getIdentityLabels, readIdentityFromCookies } from "@/lib/ab";
import { Hero } from "@/components/blocks/hero";
import { BigDomino } from "@/components/blocks/big-domino";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { BeforeAfter } from "@/components/blocks/before-after";
import { HonestTestimonials } from "@/components/blocks/honest-testimonials";
import { VslBlock } from "@/components/blocks/vsl-block";
import { MediaBar } from "@/components/blocks/media-bar";
import { AvatarWall } from "@/components/blocks/avatar-wall";
import { StackSlide } from "@/components/blocks/stack-slide";
import { GuaranteeHero } from "@/components/blocks/guarantee-hero";
import { FoundingBuilder } from "@/components/blocks/founding-builder";
import { FinalCta } from "@/components/blocks/final-cta";
import { StickyCta } from "@/components/blocks/sticky-cta";
import { SignatureFooter } from "@/components/blocks/signature-footer";
import { HOMEPAGE_FAQS } from "@/lib/faqs";
import {
  OrganizationJsonLd,
  PersonJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";

/**
 * UnlockSaaS Funnel Hub — Perfect Webinar arc.
 *
 * Section order follows DotCom Secrets §2 + Expert Secrets §3 (Perfect Webinar
 * Framework) + Funnel Hacker's Cookbook v1 (strategy/funnel-hackers-cookbook.md):
 *
 *   1. Hook            — promise + polarity move in <3 seconds
 *   2. Big Domino      — the one claim the page must prove
 *   3. Proof Bar       — structural credibility (refund-by-code + scar tissue)
 *   4. Media Bar       — earned mentions, auto-renders at ≥3
 *   5. Mirror Moment   — Honest testimonials (public pain in real founders'
 *                        own words); positioned high so the visitor recognizes
 *                        themselves BEFORE the longer origin story
 *   6. Founder VSL     — origin story in the founder's voice
 *   7. Manifesto       — A/B identity label (Verified / Paid Builders)
 *   8. Timeline        — receipts that the story is real
 *   9. Before / After  — the transformation made concrete
 *  10. Comparison      — anti-secrets (what they tried that did not work)
 *  11. Stack Slide     — the offer reveal + anchored price ($4,900 → $49)
 *  12. Guarantee Hero  — the polarity move with refund conditions
 *  13. Avatar Wall     — Verified Builder proof (renders at ≥9)
 *  14. FAQ             — objection handling sourced from dollar-objections
 *  15. Newsletter      — last-resort soft opt-in (Soap Opera Day 0 trigger)
 *  16. Final CTA       — three doors one more time (close before the close)
 *  17. Honest empty    — "as seen in" empty state when MediaBar hidden
 *  18. Social links    — find-me row
 *  19. Signature       — Maryan footer (Cookbook Swipe 4)
 *  20. Sticky CTA      — always-visible offer bar below the hero
 *
 * Theming: shadcn dark tokens only — no explicit colors, no script fonts, no
 * ClickFunnels 1.0 yellow attention bars. The header now reads as the same
 * visual family as every block below it (eyebrow → heading → body → CTAs).
 */
export default function FunnelHub() {
  const variant = readIdentityFromCookies();
  const labels = getIdentityLabels(variant);

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

      {/* ---------------- 1. HOOK ---------------- */}
      <Hero />

      {/* ---------------- 2. BIG DOMINO ---------------- */}
      <BigDomino />

      {/* ---------------- 3. STRUCTURAL PROOF BAR ---------------- */}
      <SocialProofBar />

      {/* ---------------- 4. EARNED MEDIA (pre-staged) ---------------- */}
      <MediaBar />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 5. MIRROR MOMENT — moved up ----------------
          Brunson rule: the visitor must recognize themselves in real public
          pain BEFORE the longer origin story. Mirror first, autobiography
          second. */}
      <HonestTestimonials />

      {/* Cookbook Swipe 6 — Verified Builder avatar wall (pre-staged at ≥9). */}
      <Suspense fallback={null}>
        <AvatarWall />
      </Suspense>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 6. FOUNDER VSL ---------------- */}
      <VslBlock />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 7. MANIFESTO (half) — A/B identity_label ---------------- */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="text-center mb-7">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The Movement
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
            {labels.manifestoTitle}
          </h2>
        </div>
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

      {/* ---------------- 8. FOUNDER TIMELINE ---------------- */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Receipts
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
            How a flat Stripe line became this page.
          </h2>
        </div>
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

      {/* ---------------- 9. BEFORE / AFTER ---------------- */}
      <BeforeAfter />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 10. ANTI-SECRETS — Comparison ---------------- */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            What you have been trying
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
            None of these remove the one thing that keeps the line flat.
          </h2>
        </div>
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

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 11. STACK SLIDE — the offer ---------------- */}
      <StackSlide />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 12. GUARANTEE HERO — polarity move ---------------- */}
      <GuaranteeHero />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 12.5 FOUNDING BUILDER – honest scarcity ----------------
          Brunson 10X Secrets §3 Category 4, in the honest variant the Marco
          avatar will accept. Three real levers: founding-price lock, personal
          capacity ceiling, and the cost-of-waiting calendar argument. No fake
          countdown timer, no neon. Placed AFTER the guarantee on purpose –
          the visitor must read the polarity move first so the scarcity reads
          as "decide now" rather than "buy now or else". */}
      <FoundingBuilder tone="full" />

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 13. FAQ — objection handling ---------------- */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Honest objections
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
            What founders push back on — answered straight.
          </h2>
          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
            Mined from public Indie Hackers and Hacker News threads written by
            founders matching the Marco avatar. Full sources:{" "}
            <code className="text-xs">strategy/dollar-objections.md</code>.
          </p>
        </div>
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

      {/* ---------------- 14. NEWSLETTER – second-chance opt-in ----------------
          The hero already offered the email opt-in cold. This block is the
          mid-page second chance for the visitor who scrolled past the hero
          to read first and decide later. Soap Opera Sequence Day 0 fires on
          submit; cron picks up Days 1–4. Source tag splits hero vs. tail in
          the metrics dashboard. The `#newsletter-tail` anchor is the target
          of the sticky CTA "Get the 5 emails" button below the hero. */}
      <section
        id="newsletter-tail"
        className="py-14 sm:py-20 px-4 sm:px-6 max-w-md mx-auto text-center scroll-mt-24"
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Still reading? Take the five letters.
        </p>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 leading-tight text-balance">
          The 5 emails I wish someone had sent me before I shipped 12 products
          to flat Stripe lines.
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          One short letter a day for five days. Written like one founder to
          another, not a marketing sequence. By Friday you will know which
          beat is keeping your line flat – and whether the Playbook is the
          right answer for you, or not.
        </p>
        <div className="text-left">
          <NewsletterSignup variant="hero" source="midpage" />
        </div>
      </section>

      <Separator className="max-w-4xl mx-auto" />

      {/* ---------------- 15. FINAL CTA — close-the-loop ---------------- */}
      <FinalCta />

      {/* ---------------- 18. SIGNATURE FOOTER ---------------- */}
      <SignatureFooter />

      {/* ---------------- 19. STICKY SCROLL CTA ---------------- */}
      <StickyCta />
    </div>
  );
}
