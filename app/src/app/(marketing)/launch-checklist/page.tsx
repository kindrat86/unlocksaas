import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LAUNCH_CHECKLIST_ENTRIES } from "@/lib/launch-checklists";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/launch-checklist";

export const metadata: Metadata = {
  title:
    "Launch Checklists by Niche – Pre-Revenue Founder Plans for 12 Cohorts",
  description:
    "Ten-step pre-revenue launch checklists, tuned per niche. Course creators, SaaS founders, agency owners, coaches, AI wrappers, and 7 other cohorts.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Launch checklists by niche",
    description:
      "Pre-revenue founder checklists, tuned to each cohort's money mechanics and most common launch mistakes.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Launch checklists by niche",
    description:
      "Twelve niche-specific pre-revenue founder checklists.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS launch checklists by niche",
  url: `${BASE_URL}/launch-checklist`,
  description:
    "Niche-specific pre-revenue launch checklists, tuned to each cohort's money mechanics and most common launch mistakes.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: LAUNCH_CHECKLIST_ENTRIES.length,
    itemListElement: LAUNCH_CHECKLIST_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Launch checklist for ${e.displayName}`,
      url: `${BASE_URL}/launch-checklist/${e.slug}`,
      description: e.heroSubhead,
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
      name: "Launch checklist",
      item: `${BASE_URL}/launch-checklist`,
    },
  ],
});

export default function LaunchChecklistHubPage() {
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
            Launch checklist
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pre-revenue checklists
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The 14-day launch checklist, tuned to your cohort.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Same Brunson Hook / Story / Offer scaffold, applied to the
          vocabulary, money mechanics, and most common launch mistakes of one
          specific cohort. Pick the closest fit and you&rsquo;ll find the next
          14 days mapped step by step.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Launch-checklist hub TL;DR"
        cluster="Pre-revenue launch checklists by niche"
        count={`${LAUNCH_CHECKLIST_ENTRIES.length} niche-specific checklists, 10 steps each`}
        intent="Founder searches 'how to launch [niche] business' or 'pre-revenue checklist for [cohort]' and lands on an ordered 14-day plan tuned to their cohort."
        schema="CollectionPage + ItemList on the hub; Article + HowTo + FAQPage + BreadcrumbList on each detail page."
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        aria-labelledby="checklists"
      >
        <h2 id="checklists" className="sr-only">
          Checklists
        </h2>
        {LAUNCH_CHECKLIST_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold leading-tight mb-2">
                <Link
                  href={`/launch-checklist/${e.slug}`}
                  className="hover:underline capitalize"
                >
                  Launch checklist for {e.displayName}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.whoThisIsFor.slice(0, 220)}
                {e.whoThisIsFor.length > 220 ? "..." : ""}
              </p>
              <Link
                href={`/launch-checklist/${e.slug}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Open the 14-day plan →
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Not in this list? The diagnostic still works.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Hook / Story / Offer triage is cohort-agnostic. The
              niche-specific checklists above tune the vocabulary and the
              money mechanics; the diagnostic itself works on any post-launch
              pre-revenue founder page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/for">Browse cohort pages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
