import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { MediaBar } from "@/components/blocks/media-bar";
import { HonestTestimonials } from "@/components/blocks/honest-testimonials";
import { AvatarWall } from "@/components/blocks/avatar-wall";
import { VslBlock } from "@/components/blocks/vsl-block";
import { TimelineSection } from "@/components/blocks/timeline-section";
import { BeforeAfter } from "@/components/blocks/before-after";
import { FoundingBuilder } from "@/components/blocks/founding-builder";
import { ComparisonSection } from "@/components/blocks/comparison-section";
import { StackSlide } from "@/components/blocks/stack-slide";
import { ValueLadder } from "@/components/blocks/value-ladder";
import { GuaranteeHero } from "@/components/blocks/guarantee-hero";
import { FaqSection } from "@/components/blocks/faq-section";
import { NewsletterTailSection } from "@/components/blocks/newsletter-tail-section";
import { FinalCta } from "@/components/blocks/final-cta";
import { ExploreResources } from "@/components/blocks/explore-resources";
import { SignatureFooter } from "@/components/blocks/signature-footer";

/**
 * BelowFoldContent — all content below the initial above-fold persuasion arc.
 *
 * This component is dynamically imported in page.tsx so its entire code
 * gets code-split into a separate chunk. Saves ~50KB+ of component source
 * from the initial RSC flight payload (page-weight optimization 2026-07-21).
 *
 * Section order follows the Brunson funnel arc:
 *   1. Media bar + Mirror moment (HonestTestimonials + AvatarWall)
 *   2. Emotional Arc (VSL, Timeline, Before/After)
 *   3. Scarcity Bridge (FoundingBuilder)
 *   4. Anti-secrets Comparison
 *   5. Logical Arc (StackSlide, ValueLadder, GuaranteeHero, FAQ, Newsletter)
 *   6. Final CTA + Explore Resources + Signature Footer
 */
export function BelowFoldContent() {
  return (
    <>
      {/* Media bar + Mirror moment */}
      <MediaBar />
      <Separator className="max-w-4xl mx-auto" />
      <HonestTestimonials />
      <Suspense fallback={null}>
        <AvatarWall />
      </Suspense>

      {/* Emotional Arc */}
      <Separator className="max-w-4xl mx-auto" />
      <VslBlock />
      <Separator className="max-w-4xl mx-auto" />
      <TimelineSection />
      <Separator className="max-w-4xl mx-auto" />
      <BeforeAfter />

      {/* Scarcity Bridge */}
      <Separator className="max-w-4xl mx-auto" />
      <FoundingBuilder tone="full" />

      {/* Anti-secrets Comparison */}
      <ComparisonSection />

      {/* Logical Arc */}
      <Separator className="max-w-4xl mx-auto" />
      <StackSlide />
      <Separator className="max-w-4xl mx-auto" />
      <ValueLadder />
      <Separator className="max-w-4xl mx-auto" />
      <GuaranteeHero />
      <Separator className="max-w-4xl mx-auto" />
      <FaqSection />
      <Separator className="max-w-4xl mx-auto" />
      <NewsletterTailSection />

      {/* Final CTA + Post-close */}
      <Separator className="max-w-4xl mx-auto" />
      <FinalCta />
      <ExploreResources />
      <SignatureFooter />
    </>
  );
}
