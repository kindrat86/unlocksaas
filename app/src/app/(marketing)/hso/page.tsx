/**
 * /hso — Hook / Story / Offer Matrix (Traffic Secrets §3).
 *
 * 8 complete HSO combinations across 4 distribution channels. Each one
 * is a ready-to-deploy content unit: the hook that stops the scroll,
 * the 3-5 beat story that builds emotional tension, and the soft offer
 * (free diagnostic, never a hard sell).
 *
 * Brunson's rule: every piece of content — every ad, every post, every
 * email — needs all three legs. A hook with no story is a headline with
 * no payoff. A story with no offer is entertainment. An offer with no
 * hook is never seen.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  HSO_ENTRIES,
  HSO_TOTAL,
  HSO_CHANNELS,
  HSO_EMOTION_COUNTS,
  type HSOChannel,
} from "@/lib/hso-matrix";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";

const CANONICAL = "/hso";

export const metadata: Metadata = {
  title: "HSO Matrix — 8 Ready-to-Deploy Hook / Story / Offer Combinations",
  description:
    "8 complete HSO content units across X/Twitter, Indie Hackers, Reddit, and email. Each unit includes the exact hook, story beats, and soft offer — ready to deploy.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "HSO Matrix — 8 Ready-to-Deploy Content Units",
    description:
      "Hook / Story / Offer combinations for X, Indie Hackers, Reddit, and email. Copy-ready, deployable today.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "HSO Matrix — Unlock SaaS",
    description: "8 complete HSO units. Copy-ready. Deployable today.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS HSO Matrix",
  description:
    "Ready-to-deploy Hook / Story / Offer combinations across X/Twitter, Indie Hackers, Reddit, and email.",
  url: `${BASE_URL}/hso`,
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: HSO_TOTAL,
    itemListElement: HSO_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.hook,
      url: `${BASE_URL}/hso#${e.slug}`,
    })),
  },
});

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    { "@type": "ListItem", position: 2, name: "HSO Matrix", item: `${BASE_URL}/hso` },
  ],
});

const EMOTION_COLORS: Record<string, string> = {
  shame: "text-red-500",
  frustration: "text-orange-500",
  hope: "text-green-500",
  anger: "text-red-600",
  relief: "text-blue-500",
  curiosity: "text-purple-500",
};

const AWARENESS_BADGES: Record<string, "outline" | "secondary" | "default"> = {
  "Unaware": "outline",
  "Problem-Aware": "secondary",
  "Solution-Aware": "default",
  "Product-Aware": "default",
};

export default function HsoPage() {
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
          <li aria-current="page" className="text-foreground">HSO Matrix</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Traffic Secrets &sect;3 — Content Distribution
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {HSO_TOTAL} complete Hook / Story / Offer units. Ready to deploy.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Russell Brunson&rsquo;s content rule: every piece needs all three legs.
          A hook stops the scroll. A story builds connection. An offer captures
          the click. These {HSO_TOTAL} units span X/Twitter, Indie Hackers, Reddit,
          and email — choose your channel, paste the hook, tell the story, and
          link to the free diagnostic.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="HSO matrix TL;DR"
        cluster="Content distribution playbook"
        count={`${HSO_TOTAL} HSO units across ${Object.keys(HSO_CHANNELS).length} channels`}
        intent="Ready-to-deploy Hook/Story/Offer combinations. Each unit targets a specific awareness stage and emotional trigger. No editing needed — just post."
        schema="CollectionPage + ItemList"
      />

      <Separator className="my-2" />

      {/* Emotion distribution */}
      {HSO_EMOTION_COUNTS.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Emotion distribution
          </p>
          <div className="flex flex-wrap gap-2">
            {HSO_EMOTION_COUNTS.map((e) => (
              <Badge key={e.emotion} variant="outline" className={EMOTION_COLORS[e.emotion] || ""}>
                {e.emotion}: {e.count}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-2" />

      {/* By channel */}
      {(Object.keys(HSO_CHANNELS) as HSOChannel[]).map((channel) => {
        const channelEntries = HSO_ENTRIES.filter((e) => e.channel === channel);
        if (channelEntries.length === 0) return null;
        return (
          <section
            key={channel}
            className="max-w-3xl mx-auto px-6 py-8"
            aria-labelledby={`ch-${channel}`}
          >
            <div className="mb-6">
              <h2 id={`ch-${channel}`} className="text-xl font-semibold leading-tight mb-1">
                {HSO_CHANNELS[channel].label}
              </h2>
              <p className="text-xs text-muted-foreground">
                {HSO_CHANNELS[channel].format}
              </p>
            </div>
            <div className="space-y-6">
              {channelEntries.map((entry) => (
                <Card key={entry.slug} id={entry.slug} className="scroll-mt-20">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={AWARENESS_BADGES[entry.awarenessStage] || "outline"}>
                        {entry.awarenessStage}
                      </Badge>
                      <Badge variant="outline" className={EMOTION_COLORS[entry.emotion] || ""}>
                        {entry.emotion}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Hook</p>
                      <p className="text-base font-semibold leading-tight">&ldquo;{entry.hook}&rdquo;</p>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Story</p>
                      <ol className="space-y-1.5">
                        {entry.story.map((beat, i) => (
                          <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                            <span className="text-xs text-muted-foreground/50 mt-0.5 shrink-0">{i + 1}.</span>
                            <span>{beat}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Offer</p>
                      <p className="text-sm text-primary leading-relaxed">{entry.offer}</p>
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
              Content is distribution. Distribution is work.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The HSO Matrix gives you the copy. The Playbook gives you the system:
              which channels to post to on which days, how to track responses, and
              how to turn one comment into one paying customer.
            </p>
            <Button asChild>
              <Link href="/diagnostic">Get the free diagnostic first</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
