import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { SectionDivider } from "@/components/blocks/section-divider";
import { shouldRenderMediaBar } from "@/lib/media-mentions";
import { HOMEPAGE_FAQS } from "@/lib/faqs";
import { ArrowRight } from "lucide-react";
import {
  OrganizationJsonLd,
  PersonJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";

/**
 * UnlockSaaS Funnel Hub — ClickFunnels 1.0 visual treatment, top to bottom.
 *
 * Building blocks per workbook 04 §2 + 23 Building Blocks (DotCom Secrets) +
 * Funnel Hacker's Cookbook v1 trust columns (strategy/funnel-hackers-cookbook.md):
 *
 *   1. Hero — yellow attention bar + enemy sentence + one-line bio + 3 CTAs
 *   2. Social proof bar (structural proof, not numeric)
 *   3. Media bar — earned mentions, auto-renders at ≥3 (Cookbook Swipe 3)
 *   4. Manifesto (half) — Verified / Paid Builders A/B from cookie
 *   5. Before / After block — red/green Stripe-dashboard contrast
 *   6. Founder VSL (env-driven, kinetic fallback, orange frame)
 *   7. Founder timeline
 *   8. Comparison block — Machine vs Course vs DIY vs Doing-Nothing
 *   9. Stack Slide — eight deliverables, $4,900+ → $49/mo reveal (Block #14)
 *  10. Guarantee Hero — 60-day Stripe-verified, polarity move (Cookbook §4)
 *  11. Honest testimonials — public quotes from real founders
 *  12. Avatar wall — verified builders, auto-renders at ≥9 (Cookbook Swipe 6)
 *  13. FAQ — sourced from strategy/dollar-objections.md (6 entries)
 *  14. Newsletter signup — real form, fires Day 0 of Soap Opera
 *  15. Final CTA — close-the-loop, three doors one more time
 *  16. Maryan signature footer — handwritten note (Cookbook Swipe 4)
 *  17. Sticky scroll CTA — always-visible offer below the hero
 *
 * Theming note: layout.tsx forces `<html className="dark">` globally so
 * dashboards can use the dark theme tokens. The funnel hub explicitly opts
 * back to a light ClickFunnels palette by wrapping the entire surface in a
 * `bg-white text-gray-900` shell and avoiding theme variables (bg-card,
 * text-muted-foreground, etc.) inside this tree.
 */
export default function FunnelHub() {
  const variant = readIdentityFromCookies();
  const labels = getIdentityLabels(variant);
  const showHonestEmptyState = !shouldRenderMediaBar();

  return (
    <div
      className="min-h-screen flex flex-col bg-white text-gray-900"
      style={{ colorScheme: "light" }}
    >
      {/* Surface B (AEO/GEO/AIO) — strategy/google-strategy.md §B.2.
          Organization + WebSite + Person + FAQPage schema for LLM citation
          anchoring. The four together let an AI resolve the entity graph:
          Organization (the brand) → Person (the founder) → WebSite (the
          surface) → FAQPage (the Q&A an answer engine paraphrases). The
          FAQPage block consumes the same HOMEPAGE_FAQS list rendered below,
          so visible content and structured data never diverge. */}
      <OrganizationJsonLd />
      <PersonJsonLd />
      <FaqPageJsonLd items={HOMEPAGE_FAQS} />
      <AbExposureBeacon />

      {/* ---------------- HERO (ClickFunnels 1.0 visual treatment) ----------------
          Marco-avatar shoppers recognize Brunson's funnel pages by sight: yellow
          attention bar, purple + orange palette, headline with highlighted
          punch-phrases, big blocky orange CTA. */}
      <div className="bg-yellow-300 text-black text-center py-2 px-3 sm:px-4 text-[11px] sm:text-sm font-bold uppercase tracking-wide sm:tracking-wider border-b-2 border-yellow-500">
        Attention: Pre-revenue founders building with AI
      </div>

      <header className="bg-gradient-to-b from-purple-50 via-purple-50/40 to-white py-14 sm:py-24 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] font-bold text-purple-700 mb-4 sm:mb-5">
            Unlock SaaS Presents
          </p>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] sm:leading-[1.05] text-gray-900 mb-6 tracking-tight">
            The problem stuck founders have is{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              not the product.
            </span>{" "}
            It is that an entire industry profits from teaching them to{" "}
            <span className="text-purple-700">keep building</span>{" "}
            when the only thing left is{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              to sell.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed">
            Marketer, non-engineer, built a dozen AI products that nobody paid
            for. Then I figured out why.{" "}
            <span className="font-semibold text-gray-900">— Maryan</span>
          </p>

          <div
            className="text-3xl text-orange-500 mb-3 animate-bounce motion-reduce:animate-none select-none"
            aria-hidden="true"
          >
            ↓
          </div>

          {/* Primary CTA — classic CF orange blocky button with bottom-border depth */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <Button
              asChild
              className="h-auto rounded-md bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30 px-6 sm:px-8 py-4 sm:py-5 text-base sm:text-xl font-extrabold uppercase tracking-wide w-full sm:w-auto sm:min-w-[420px] max-w-full border-b-4 border-orange-700 hover:border-orange-800 transition-colors leading-tight whitespace-normal"
            >
              <Link href="/diagnostic" className="inline-flex items-center justify-center gap-2">
                Yes! Get My Free Diagnosis
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>
            </Button>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
              Free · 2 minutes · No card required
            </p>
          </div>

          {/* Secondary CTAs — restrained, purple-trimmed for CF visual coherence */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white border-2 border-purple-700 text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-bold"
            >
              <Link href="/starter">Start the Machine for $1</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-purple-700 hover:bg-purple-50 hover:text-purple-900 font-semibold"
            >
              <Link href="/machine-sales">The Full Machine — $49/mo</Link>
            </Button>
          </div>

          {/* Reverse-squeeze bridge — DCS Secret 14 reverse variant. Value-first
              surface for the cold visitor not yet ready to opt in. */}
          <p className="mt-10 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/parables"
              className="font-bold text-purple-700 underline underline-offset-4 decoration-2 hover:text-purple-900"
            >
              read the five parables first
            </Link>
            {" "}— free, no email required.
          </p>
        </div>
      </header>

      {/* Building Block #20 — Social Proof Bar (honest variant, no fake counts). */}
      <SocialProofBar />

      {/* Cookbook Swipe 3 — "As seen in" earned-media bar. Pre-staged.
          Renders only when >= 3 earned mentions exist; returns null otherwise. */}
      <MediaBar />

      {/* ---------------- MANIFESTO (half) — A/B identity_label ---------------- */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
              The Manifesto
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              {labels.manifestoTitle}
            </h2>
          </div>
          <blockquote className="space-y-5 text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
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
              <span className="font-bold text-gray-900 bg-yellow-200 px-1 box-decoration-clone">
                name one real person, make one real promise, sell it before it felt ready.
              </span>
            </p>
            <p>
              We measure progress in Stripe charges, not in encouragement. We do
              not collect praise.{" "}
              <span className="font-bold text-purple-700">We collect customers.</span>
            </p>
          </blockquote>
        </div>
      </section>

      <SectionDivider />

      {/* ---------------- BEFORE / AFTER (Block #22) ---------------- */}
      <BeforeAfter />

      <SectionDivider />

      {/* ---------------- FOUNDER VSL (Block #20, six-line intro framework) ---------------- */}
      <VslBlock />

      <SectionDivider variant="muted" />

      {/* ---------------- FOUNDER TIMELINE ---------------- */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
              The Timeline
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              How we got here — in order, with{" "}
              <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
                dates.
              </span>
            </h2>
          </div>

          <ol className="relative space-y-6 sm:space-y-7 max-w-2xl mx-auto">
            {/* Vertical line behind the dots — visible only on sm+ */}
            <div
              className="hidden sm:block absolute left-[7.5rem] top-2 bottom-2 w-0.5 bg-purple-100"
              aria-hidden="true"
            />
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
                className="relative flex flex-col sm:flex-row gap-2 sm:gap-6 items-start"
              >
                <div className="shrink-0 sm:w-32 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-purple-700 sm:pt-2">
                  {row.date}
                </div>
                <div
                  className="hidden sm:block shrink-0 h-3 w-3 rounded-full bg-orange-500 ring-4 ring-white mt-3 relative z-10"
                  aria-hidden="true"
                />
                <div className="text-[15px] sm:text-base text-gray-700 leading-relaxed flex-1">
                  {row.line}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <SectionDivider />

      {/* ---------------- COMPARISON ---------------- */}
      <section className="bg-purple-50/40 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
              Apples to Apples
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              What you have been trying — and{" "}
              <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
                what is different about this.
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border-2 border-purple-200 shadow-lg bg-white">
            <table className="w-full text-sm sm:text-base">
              <thead className="bg-purple-700 text-white">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-bold uppercase text-xs sm:text-sm tracking-wider">Approach</th>
                  <th className="text-left p-3 sm:p-4 font-bold uppercase text-xs sm:text-sm tracking-wider">Cost</th>
                  <th className="text-left p-3 sm:p-4 font-bold uppercase text-xs sm:text-sm tracking-wider">Guarantee</th>
                  <th className="text-left p-3 sm:p-4 font-bold uppercase text-xs sm:text-sm tracking-wider">Removes avoidance?</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-t border-purple-100">
                  <td className="p-3 sm:p-4 font-semibold text-gray-900">Doing nothing</td>
                  <td className="p-3 sm:p-4">Free</td>
                  <td className="p-3 sm:p-4">None</td>
                  <td className="p-3 sm:p-4 text-red-600">✗ No — avoidance is the default state</td>
                </tr>
                <tr className="border-t border-purple-100 bg-gray-50/60">
                  <td className="p-3 sm:p-4 font-semibold text-gray-900">Course / cohort</td>
                  <td className="p-3 sm:p-4">$497–$2,000</td>
                  <td className="p-3 sm:p-4">Refund-policy theatre</td>
                  <td className="p-3 sm:p-4 text-red-600">✗ No — teaching, not doing</td>
                </tr>
                <tr className="border-t border-purple-100">
                  <td className="p-3 sm:p-4 font-semibold text-gray-900">Hire a consultant</td>
                  <td className="p-3 sm:p-4">$3,000+</td>
                  <td className="p-3 sm:p-4">Hourly</td>
                  <td className="p-3 sm:p-4 text-red-600">✗ No — outsourced understanding</td>
                </tr>
                <tr className="border-t border-purple-100 bg-gray-50/60">
                  <td className="p-3 sm:p-4 font-semibold text-gray-900">Generic funnel / AI tool</td>
                  <td className="p-3 sm:p-4">$29–$99/mo</td>
                  <td className="p-3 sm:p-4">Trial only</td>
                  <td className="p-3 sm:p-4 text-red-600">✗ No — assumes you already did the work</td>
                </tr>
                <tr className="border-t-2 border-orange-500 bg-orange-50">
                  <td className="p-3 sm:p-4 font-black text-purple-700 uppercase tracking-wide">★ The Machine</td>
                  <td className="p-3 sm:p-4 font-bold text-gray-900">$49/mo</td>
                  <td className="p-3 sm:p-4 font-bold text-gray-900">Stripe-verified, code-enforced</td>
                  <td className="p-3 sm:p-4 font-bold text-green-700">✓ Yes — outreach happens inside the tool</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 italic text-center mt-6 max-w-2xl mx-auto leading-relaxed">
            The comparison is honest. Every other approach has a place. None of
            them remove the avoidance,{" "}
            <span className="font-bold text-gray-900 not-italic">which is the actual disease.</span>
          </p>
        </div>
      </section>

      <SectionDivider variant="loud" />

      {/* ---------------- STACK SLIDE — Brunson Block #14 ---------------- */}
      <StackSlide />

      <SectionDivider />

      {/* ---------------- GUARANTEE HERO — polarity move (Cookbook §4) ---------------- */}
      <GuaranteeHero />

      <SectionDivider />

      {/* ---------------- HONEST TESTIMONIALS (Block #7) ---------------- */}
      <HonestTestimonials />

      {/* Cookbook Swipe 6 — Verified Builder avatar wall. Pre-staged. */}
      <Suspense fallback={null}>
        <AvatarWall />
      </Suspense>

      <SectionDivider />

      {/* ---------------- FAQ ---------------- */}
      <section className="bg-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
              Honest Objections
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">
              The six things you&apos;re thinking{" "}
              <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
                right now.
              </span>
            </h2>
            <p className="text-sm text-gray-600 mt-4 max-w-xl mx-auto leading-relaxed">
              Mined from public Indie Hackers and Hacker News threads written by
              founders matching the Marco avatar.
            </p>
          </div>
          <div className="space-y-4 sm:space-y-5">
            {HOMEPAGE_FAQS.map((item, i) => (
              <div
                key={item.q}
                className="bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-colors p-5 sm:p-6 shadow-sm hover:shadow-md"
              >
                <p className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight mb-3">
                  <span className="text-orange-500 font-black mr-2">Q{i + 1}.</span>
                  {item.q}
                </p>
                <p className="text-[15px] sm:text-base text-gray-700 leading-relaxed pl-7 sm:pl-8 border-l-2 border-purple-100">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ---------------- NEWSLETTER ---------------- */}
      <section className="bg-purple-50/40 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
            Or, the slower lane
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-4">
            Not ready to subscribe?{" "}
            <span className="bg-yellow-300 px-1.5 py-0.5 box-decoration-clone">
              Read the five-day arc
            </span>{" "}
            first.
          </h2>
          <p className="text-base text-gray-700 mb-7 leading-relaxed">
            Founders who build real things with AI deserve to get paid for them.
            One short email a day for five days, written like a letter from one
            founder to another. Reply STOP anytime.
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* ---------------- HONEST "AS SEEN IN" EMPTY-STATE ----------------
          Only renders when the MediaBar above is hidden (< 3 earned mentions). */}
      {showHonestEmptyState ? (
        <section className="bg-white py-10 sm:py-12 px-4 sm:px-6 border-t border-purple-100">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-purple-700 mb-3">
              As seen in
            </p>
            <p className="text-sm text-gray-600 italic leading-relaxed">
              Nowhere yet. Reluctant Hero rule: no fake logos. The first time
              a podcast or newsletter mentions Unlock SaaS, that logo lands
              here. Build in public means showing the empty version too.
            </p>
          </div>
        </section>
      ) : null}

      {/* ---------------- SOCIAL ---------------- */}
      <section className="bg-white py-10 sm:py-12 px-4 sm:px-6 border-t border-purple-100">
        <div className="max-w-md mx-auto text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-purple-700 mb-4">
            Find me
          </p>
          <div className="flex gap-6 justify-center text-sm font-bold text-gray-700">
            <a
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors"
            >
              X / Twitter
            </a>
            <a
              href="https://www.indiehackers.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors"
            >
              Indie Hackers
            </a>
            <a
              href="https://reddit.com/r/SaaS"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-700 transition-colors"
            >
              r/SaaS
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA — close-the-loop ---------------- */}
      <FinalCta />

      {/* ---------------- FOOTER — Maryan handwritten signature (Cookbook Swipe 4) ---------------- */}
      <SignatureFooter />

      {/* ---------------- STICKY SCROLL CTA — always-visible offer below the hero ---------------- */}
      <StickyCta />
    </div>
  );
}
