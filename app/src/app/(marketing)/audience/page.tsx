import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AUDIENCE_ENTRIES,
  AUDIENCE_PLATFORMS,
  AUDIENCE_PLATFORM_LABELS,
} from "@/lib/audiences";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/audience";

export const metadata: Metadata = {
  title: "Indie SaaS Audience-Building Playbooks by Platform | Unlock SaaS",
  description:
    "Sustained audience-building playbooks for indie SaaS founders by platform — Twitter/X, LinkedIn, newsletter, podcast, YouTube, Reddit. Monthly cadence, milestones, stuck patterns.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Audience-Building Playbooks — Unlock SaaS",
    description:
      "Platform-specific audience-building playbooks for indie SaaS, with honest 12-24 month time bands.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Audience-Building Playbooks by Platform",
    description: "Twitter/X, LinkedIn, newsletter, podcast, YouTube, Reddit playbooks.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Audience-Building Playbooks by Platform",
  url: `${BASE_URL}/audience`,
  description:
    "Sustained audience-building playbooks by platform with monthly cadence, milestones, stuck patterns, and platform-specific gotchas.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: AUDIENCE_ENTRIES.length,
    itemListElement: AUDIENCE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/audience/${e.slug}`,
      description: e.intro,
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
      name: "Audience-building",
      item: `${BASE_URL}/audience`,
    },
  ],
});

export default function AudienceHubPage() {
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
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            Audience-building
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Sustained, not launch-event
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS audience-building by platform.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Six platform-specific playbooks for sustained audience-building
          over 12-24 months — Twitter/X, LinkedIn, newsletter, podcast,
          YouTube, Reddit. Each page covers who the platform fits, the
          required cadence, the monthly playbook from month 1 to month
          12+, the milestone subscriber/follower counts, the common stuck
          patterns, and how the platform compares to others for the same
          time investment.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Distinct from{" "}
          <Link href="/launch" className="text-primary hover:underline">
            /launch
          </Link>{" "}
          (launch-event playbooks) and{" "}
          <Link href="/skill/writing-in-public" className="text-primary hover:underline">
            /skill/writing-in-public
          </Link>{" "}
          (skill practice plan).
        </p>
      </header>

      <Separator className="my-2" />

      {AUDIENCE_PLATFORMS.map((platform) => {
        const items = AUDIENCE_ENTRIES.filter((e) => e.platform === platform);
        if (items.length === 0) return null;
        return (
          <section
            key={platform}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`pf-${platform}`}
          >
            <h2
              id={`pf-${platform}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {AUDIENCE_PLATFORM_LABELS[platform]}
            </h2>
            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/audience/${e.slug}`}
                    className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-base font-semibold text-primary mb-1 leading-tight">
                      {e.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Cadence: {e.cadence}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {e.intro}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Pair the platform playbook with the launch event
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Audience-building builds the foundation; the launch is the
              compounding moment that runs on top of it. Both are needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/launch">Launch playbooks</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/skill/writing-in-public">Writing-in-public skill</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
