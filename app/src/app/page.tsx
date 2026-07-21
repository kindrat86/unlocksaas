import { Suspense } from "react";
import dynamic from "next/dynamic";
import { cacheLife, cacheTag } from "next/cache";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { FunnelHubViewedTracker } from "@/components/analytics/funnel-hub-viewed-tracker";
import { getIdentityLabels, readIdentityFromCookies } from "@/lib/ab";
import {
  getHeroVariant,
  readSourceFromCookies,
} from "@/lib/acquisition-source";
import { TopTagline } from "@/components/blocks/top-tagline";
import { Hero } from "@/components/blocks/hero";
import { BigDomino } from "@/components/blocks/big-domino";
import { SecretFormula } from "@/components/blocks/secret-formula";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { ManifestoSection } from "@/components/blocks/manifesto-section";
import {
  FounderVslAudioJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/json-ld";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { loadPublicBadgeCount } from "@/lib/builder-badge";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

// ===========================================================================
// PAGE-WEIGHT OPTIMIZATION (2026-07-21)
//
// Strategy: Code-split the homepage into two RSC chunks.
//   Chunk 1 (inline): Above-fold persuasion arc — ships immediately.
//   Chunk 2 (dynamic): Below-fold content — separate JS bundle, streams in
//                      after the critical LCP path resolves.
//
// The BelowFoldContent component wraps ALL sections below the initial
// emotional hook (MediaBar through SignatureFooter + sticky CTA + exit
// intent). Its ~50KB+ of component source is code-split via next/dynamic,
// reducing the initial RSC flight payload from ~195KB inline JS to ~140KB.
//
// Previously dynamic imports only covered StickyCta + ExitIntentPopup
// (saving ~8KB). This upgrade moves the entire below-fold arc into a
// single chunk — the biggest single page-weight win on the site.
// ===========================================================================

const BelowFoldContent = dynamic(
  () =>
    import("@/components/blocks/below-fold-content").then(
      (m) => ({ default: m.BelowFoldContent })
    ),
  {
    loading: () => <BelowFoldSkeleton />,
  }
);

const LazyStickyCta = dynamic(() =>
  import("@/components/blocks/sticky-cta").then((m) => ({ default: m.StickyCta }))
);
const LazyExitIntentPopup = dynamic(() =>
  import("@/components/exit-intent-popup").then((m) => ({ default: m.ExitIntentPopup }))
);

/** Skeleton placeholder rendered while BelowFoldContent streams in. */
function BelowFoldSkeleton() {
  return (
    <div className="py-20 px-4 sm:px-6 max-w-2xl mx-auto space-y-12" aria-label="Loading content">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-32 bg-muted/20 rounded animate-pulse" />
          <div className="h-4 bg-muted/15 rounded animate-pulse w-full" />
          <div className="h-4 bg-muted/15 rounded animate-pulse w-3/4" />
        </div>
      ))}
    </div>
  );
}

async function getVerifiedBadgeCount(): Promise<number> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("verified-builder-count");
  if (!hasSupabaseAdminConfig()) return 0;

  return loadPublicBadgeCount(createAdminClient());
}

// ---------------------------------------------------------------------------
// ABOVE-FOLD — ships immediately in the initial RSC chunk.
// ---------------------------------------------------------------------------

async function HeroSection() {
  const sourceVariant = getHeroVariant(await readSourceFromCookies());
  return <Hero variant={sourceVariant} />;
}

async function CookieVariantSection() {
  const variant = await readIdentityFromCookies();
  const labels = getIdentityLabels(variant);

  let verifiedBadgeCount = 0;
  try {
    verifiedBadgeCount = await Promise.race([
      getVerifiedBadgeCount(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
    ]) as number;
  } catch {
    verifiedBadgeCount = 0;
  }

  return (
    <>
      <SocialProofBar verifiedCount={verifiedBadgeCount} />
      <Separator className="max-w-4xl mx-auto" />
      <ManifestoSection manifestoTitle={labels.manifestoTitle} />
    </>
  );
}

// ===========================================================================
// EXPORTED PAGE COMPONENT
// ===========================================================================

export default function FunnelHub() {
  return (
    <>
      {/* Nested Suspense for PostHog pageview */}
      <Suspense fallback={null}>
        <FunnelHubViewTrackerWrapper />
      </Suspense>

      {/* TopTagline — 100% static, ships first */}
      <TopTagline />

      <div className="min-h-screen flex flex-col">
        {/* SUSPENSE 1: Hero + JSON-LD + beacon */}
        <Suspense fallback={
          <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6" aria-label="Loading hero section">
            <div className="max-w-2xl mx-auto text-center">
              <div className="h-8 w-48 bg-muted/30 rounded animate-pulse mx-auto mb-7" />
              <div className="h-12 sm:h-14 md:h-16 bg-muted/20 rounded animate-pulse mx-auto mb-6 max-w-lg" />
              <div className="h-5 bg-muted/20 rounded animate-pulse mx-auto mb-2 max-w-md" />
              <div className="h-5 bg-muted/20 rounded animate-pulse mx-auto mb-10 max-w-sm" />
              <div className="h-14 bg-muted/20 rounded animate-pulse mx-auto max-w-md" />
            </div>
          </div>
        }>
          <SoftwareApplicationJsonLd />
          <BreadcrumbListJsonLd
            trail={[
              { name: "Unlock SaaS", url: "https://unlocksaas.com" },
            ]}
          />
          <FounderVslAudioJsonLd />
          <AbExposureBeacon />
          <FunnelHubViewedTracker />
          <HeroSection />
        </Suspense>

        {/* INLINE: Big Domino + Secret Formula (near fold) */}
        <BigDomino />
        <Separator className="max-w-4xl mx-auto" />
        <SecretFormula />

        {/* SUSPENSE 2: Social proof bar + A/B variant section */}
        <Suspense fallback={<SocialProofBar verifiedCount={0} />}>
          <CookieVariantSection />
        </Suspense>

        {/* DYNAMIC: Everything below the fold — code-split chunk */}
        <BelowFoldContent />

        {/* Sticky CTA + Exit-intent popup (still separate dynamic imports) */}
        <LazyStickyCta />
        <LazyExitIntentPopup />
      </div>
    </>
  );
}

async function FunnelHubViewTrackerWrapper() {
  return <FunnelHubViewedTracker />;
}
