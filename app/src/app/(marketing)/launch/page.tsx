import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  LAUNCH_ENTRIES,
  LAUNCH_CHANNELS,
  LAUNCH_CHANNEL_LABELS,
} from "@/lib/launches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/launch";

export const metadata: Metadata = {
  title: "Indie SaaS Launch Playbooks by Channel | Unlock SaaS",
  description:
    "Channel-specific launch playbooks for indie SaaS — Product Hunt, Twitter, Hacker News, Indie Hackers, Reddit, LinkedIn, cold outreach, newsletter swap.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Launch Playbooks — Unlock SaaS",
    description:
      "How to launch on Product Hunt, Twitter, Hacker News, Indie Hackers, Reddit, LinkedIn, cold outreach, newsletter swaps.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Launch Playbooks by Channel",
    description: "Channel-specific launch playbooks with honest time bands and success / failure profiles.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Launch Playbooks by Channel",
  url: `${BASE_URL}/launch`,
  description:
    "Channel-specific launch playbooks for indie SaaS founders. Pre-launch build-up, launch-day cadence, post-launch follow-up. Honest time bands.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: LAUNCH_ENTRIES.length,
    itemListElement: LAUNCH_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/launch/${e.slug}`,
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
      name: "Launch",
      item: `${BASE_URL}/launch`,
    },
  ],
});

const FIT_BADGE: Record<
  (typeof LAUNCH_ENTRIES)[number]["fitVerdict"],
  string
> = {
  "strong-fit":
    "bg-green-100 text-green-900 border-green-300 dark:bg-green-950 dark:text-green-100 dark:border-green-800",
  "good-fit":
    "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800",
  "marginal-fit":
    "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-100 dark:border-amber-800",
  "wrong-channel":
    "bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-100 dark:border-red-800",
};

const FIT_LABEL: Record<(typeof LAUNCH_ENTRIES)[number]["fitVerdict"], string> = {
  "strong-fit": "Strong fit",
  "good-fit": "Good fit",
  "marginal-fit": "Marginal",
  "wrong-channel": "Wrong channel",
};

export default function LaunchHubPage() {
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
            Launch
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Channel x SaaS type
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS launch playbooks.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          One playbook per channel × SaaS-type intersection. Pre-launch
          build-up, launch-day cadence, post-launch follow-up — with honest
          time bands, success profiles, and the channel-specific mistakes
          that kill the launch.
        </p>
      </header>

      <Separator className="my-2" />

      {LAUNCH_CHANNELS.map((channel) => {
        const items = LAUNCH_ENTRIES.filter((e) => e.channel === channel);
        if (items.length === 0) return null;
        return (
          <section
            key={channel}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`ch-${channel}`}
          >
            <h2
              id={`ch-${channel}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {LAUNCH_CHANNEL_LABELS[channel]}
            </h2>
            <ul className="space-y-3">
              {items.map((e) => (
                <li
                  key={e.slug}
                  className="flex flex-col sm:flex-row sm:items-start gap-3"
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center text-xs font-semibold px-2 py-0.5 rounded border w-fit sm:w-28 ${FIT_BADGE[e.fitVerdict]}`}
                  >
                    {FIT_LABEL[e.fitVerdict]}
                  </span>
                  <Link
                    href={`/launch/${e.slug}`}
                    className="text-base text-primary hover:underline leading-relaxed"
                  >
                    {e.displayName}
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
              Run the pre-launch checklist first
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Each launch playbook assumes the product itself is ready. The
              pre-launch indie SaaS checklist names the ten things every
              SaaS must verify before any of these channels.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/checklist/pre-launch-saas-checklist">
                  Pre-launch checklist
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
