/**
 * /ad-library — Russell Brunson Traffic Secrets §5 (Secret #11-15).
 *
 * The Ad Creative Library: 9 ready-to-deploy ad concepts across Meta,
 * Reddit, LinkedIn, and Google. Each concept includes the hook, body
 * copy, targeting preset, format, and phase (validation → raiders → scale).
 *
 * Every ad points to the free diagnostic. Never to paid checkout.
 * The ad is the hook. The diagnostic is the story. The Playbook is
 * the offer. This is the cold-traffic bridge (Traffic Secrets #19).
 *
 * These ads are not running. This page is the inventory — the work
 * that needs to get deployed once the first paid customer validates
 * the ROI.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AD_CREATIVES,
  AD_TOTAL,
  AD_PHASE_COUNTS,
  AD_PLATFORM_LABELS,
  type AdPlatform,
} from "@/lib/ad-library";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";

const CANONICAL = "/ad-library";

export const metadata: Metadata = {
  title: "Ad Creative Library — 9 Paid Distribution Concepts for Unlock SaaS",
  description:
    "Nine ready-to-deploy ad concepts across Meta, Reddit, LinkedIn, and Google. Each includes exact copy, targeting preset, and launch phase. Not running yet — this is the inventory.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Ad Creative Library — 9 Distribution Concepts",
    description:
      "Ready-to-deploy ad concepts for Meta, Reddit, LinkedIn, and Google. Cold-traffic bridge to the free diagnostic.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ad Library — Unlock SaaS",
    description: "9 paid distribution concepts, ready to deploy.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS Ad Creative Library",
  description:
    "Ready-to-deploy ad concepts for paid distribution, cold-traffic bridge to the free diagnostic.",
  url: `${BASE_URL}/ad-library`,
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: AD_TOTAL,
    itemListElement: AD_CREATIVES.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: a.hook,
      url: `${BASE_URL}/ad-library#${a.slug}`,
    })),
  },
});

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Ad Creative Library",
      item: `${BASE_URL}/ad-library`,
    },
  ],
});

const PHASE_COLORS: Record<string, string> = {
  validation: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  raiders: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  scale: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const FORMAT_LABELS: Record<string, string> = {
  "single-image": "Single Image",
  "carousel": "Carousel",
  "text-only": "Text Only",
  "video-15s": "Video (15s)",
  "video-30s": "Video (30s)",
};

export default function AdLibraryPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COLLECTION_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">Ad Creative Library</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Traffic Secrets &sect;5 — Paid Distribution
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {AD_TOTAL} ad concepts. Ready to deploy. Not running yet.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          These are the cold-traffic bridge ads: the hook earns a click to the
          free diagnostic. Every concept includes exact copy, targeting preset,
          format, and launch phase.&nbsp;
          <strong className="text-foreground">None of these ads are live.</strong>
          &nbsp;The page exists as the inventory and the accountability system —
          when distribution starts, the first ad comes from here.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Ad creative library TL;DR"
        cluster="Paid distribution concepts"
        count={`${AD_TOTAL} ad concepts across ${Object.keys(AD_PLATFORM_LABELS).length} platforms`}
        intent="Every ad points to the free diagnostic. The cold-traffic bridge from Traffic Secrets Secret #19. Not running yet."
        schema="CollectionPage + ItemList"
      />

      <Separator className="my-2" />

      {/* Phase summary */}
      {AD_PHASE_COUNTS.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Deploy sequence
          </p>
          <div className="flex flex-wrap gap-2">
            {AD_PHASE_COUNTS.map((p) => (
              <Badge key={p.phase} className={PHASE_COLORS[p.phase] || ""}>
                {p.label}: {p.count} concepts
              </Badge>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-2" />

      {/* By platform */}
      {(Object.keys(AD_PLATFORM_LABELS) as AdPlatform[]).map((platform) => {
        const platformAds = AD_CREATIVES.filter((a) => a.platform === platform);
        if (platformAds.length === 0) return null;
        return (
          <section
            key={platform}
            className="max-w-3xl mx-auto px-6 py-8"
            aria-labelledby={`pf-${platform}`}
          >
            <h2 id={`pf-${platform}`} className="text-xl font-semibold mb-4 leading-tight">
              {AD_PLATFORM_LABELS[platform]}
            </h2>
            <div className="space-y-4">
              {platformAds.map((ad) => (
                <Card key={ad.slug} id={ad.slug} className="scroll-mt-20">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={PHASE_COLORS[ad.phase] || ""}>
                        {ad.phase}
                      </Badge>
                      <Badge variant="outline">
                        {FORMAT_LABELS[ad.format] || ad.format}
                      </Badge>
                    </div>

                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Hook
                    </p>
                    <p className="text-base font-semibold leading-tight mb-3">
                      &ldquo;{ad.hook}&rdquo;
                    </p>

                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      Body Copy
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {ad.bodyCopy}
                    </p>

                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      CTA — {ad.cta}
                    </p>
                    <p className="text-xs text-primary font-mono mb-3">
                      {ad.offerLink}
                    </p>

                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Targeting:</strong>{" "}
                        {ad.targetingPreset}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Persona:</strong>{" "}
                        {ad.persona}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Ads amplify distribution. They don&rsquo;t replace it.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The ad concepts are the cold-traffic bridge. Before turning them on,
              the organic distribution layer needs to be running — Dream 100 outreach,
              community engagement, content cadence. The Playbook covers the organic first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/playbook-sales">Build the organic layer first</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/hso">See the free content units</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
