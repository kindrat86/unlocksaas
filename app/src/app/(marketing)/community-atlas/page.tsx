/**
 * /community-atlas — Russell Brunson Traffic Secrets §1-2 (Secret #4-6).
 *
 * The directory of EVERY community where Unlock SaaS's dream customer hangs out.
 * 18 communities across 7 platforms, each with platform type, audience size,
 * difficulty score, self-promo policy, and the exact entry strategy.
 *
 * Brunson's second question: "Where does your dream customer hang out?"
 * This page is the answer. It's also the accountability tool — once it's
 * public, the weekly engagement work has a target list.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  COMMUNITY_ENTRIES,
  COMMUNITY_TOTAL,
  COMMUNITY_BY_PLATFORM,
  PLATFORM_LABELS,
  type Platform,
} from "@/lib/community-atlas";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";

const CANONICAL = "/community-atlas";

export const metadata: Metadata = {
  title: "Community Atlas — 18 Communities Where Indie SaaS Founders Actually Are",
  description:
    "Every community, platform, and congregation where Unlock SaaS's dream customer hangs out. 18 entries across 7 platforms, each with entry strategy and self-promo policy.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Community Atlas — Find Indie SaaS Founders",
    description:
      "18 communities across 7 platforms where post-launch indie founders actually hang out.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Atlas — Unlock SaaS",
    description: "18 communities. 7 platforms. One target audience.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS Community Atlas",
  description:
    "The directory of communities where post-launch indie founders hang out, with entry strategies and self-promo policies for each.",
  url: `${BASE_URL}/community-atlas`,
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: COMMUNITY_TOTAL,
    itemListElement: COMMUNITY_ENTRIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      url: c.url,
    })),
  },
});

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Community Atlas", item: `${BASE_URL}/community-atlas` },
  ],
});

const DIFF_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Tier 1 — Easy entry", color: "text-green-600 dark:text-green-400" },
  2: { label: "Tier 2 — Straightforward", color: "text-green-500 dark:text-green-300" },
  3: { label: "Tier 3 — Medium", color: "text-amber-500" },
  4: { label: "Tier 4 — Hard", color: "text-orange-500" },
  5: { label: "Tier 5 — Very hard", color: "text-red-500" },
};

const SELF_PROMO_BADGE: Record<string, { variant: "outline" | "secondary" | "default" | "destructive"; label: string }> = {
  "banned": { variant: "destructive", label: "Banned" },
  "restricted": { variant: "outline", label: "Restricted" },
  "allowed-with-value": { variant: "secondary", label: "Allowed (value first)" },
  "allowed": { variant: "default", label: "Allowed" },
};

export default function CommunityAtlasPage() {
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
          <li aria-current="page" className="text-foreground">Community Atlas</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Traffic Secrets &sect;1-2 — Congregations
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {COMMUNITY_TOTAL} communities where our dream customer actually spends time.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Russell Brunson&rsquo;s second question: &ldquo;Where does your dream customer hang out?&rdquo;
          This atlas answers it — {COMMUNITY_TOTAL} communities across {COMMUNITY_BY_PLATFORM.length}{" "}
          platforms, each with the audience size, self-promo policy, and the exact entry strategy
          that works.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Community atlas TL;DR"
        cluster="Distribution entry points"
        count={`${COMMUNITY_TOTAL} communities across ${COMMUNITY_BY_PLATFORM.length} platforms`}
        intent="Every community here contains a subset of our dream customer. The entry strategy tells you how to contribute value before you mention Unlock SaaS."
        schema="CollectionPage + ItemList"
      />

      <Separator className="my-2" />

      {/* Platform breakdown */}
      {COMMUNITY_BY_PLATFORM.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-2">
            {COMMUNITY_BY_PLATFORM.map((p) => (
              <Badge key={p.platform} variant="secondary">
                {p.label}: {p.count}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-2" />

      {/* Community list */}
      <section className="max-w-3xl mx-auto px-6 py-8 space-y-4" aria-labelledby="list">
        <h2 id="list" className="sr-only">All communities</h2>
        {COMMUNITY_ENTRIES.map((c) => {
          const dif = DIFF_LABELS[c.difficulty];
          const promo = SELF_PROMO_BADGE[c.selfPromoPolicy];
          return (
            <Card key={c.slug} className="hover:border-primary/40 transition">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-semibold leading-tight">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {c.name}
                      </a>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {PLATFORM_LABELS[c.platform]} &middot; {c.audience}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Badge variant={promo.variant}>{promo.label}</Badge>
                    <Badge variant="outline" className={dif.color}>{dif.label}</Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Where they are:</strong>{" "}
                    {c.whereTheyAre}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Entry strategy:</strong>{" "}
                    {c.bestEntryStrategy}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              A community list without a plan is a bookmark graveyard.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook includes a weekly community engagement system: which
              communities to post in, which threads to reply to, and how to track
              the conversations that turn into customers. &ldquo;Contribute value first&rdquo;
              is a good motto. The Playbook gives you the structure.
            </p>
            <Button asChild>
              <Link href="/playbook-sales">Start with the Playbook</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
