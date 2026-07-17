/**
 * /dream-100 — Russell Brunson Traffic Secrets §1 (Secret #2-3).
 *
 * The Dream 100 page names 27 specific influencers, communities, and
 * platforms whose audiences overlap with Unlock SaaS's dream customer.
 *
 * This is the public-facing version of the internal Dream 100 list.
 * It is NOT a directory of our actual collaboration status — it is a
 * reference page that teaches the Dream 100 framework AND lists the
 * real accounts our dream customer follows.
 *
 * Brunson Hard-Rule reconciliation: every entry names a REAL person or
 * community. Engagement stages are HONEST (all start at "not-started"
 * because the outreach hasn't been sent). This page exists to close
 * the accountability gap — once it's public, Maryan has to work through it.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DREAM_100_ENTRIES,
  DREAM_100_CATEGORIES,
  DREAM_100_TOTAL,
  ENGAGEMENT_ROLLUP,
  DREAM_100_COUNTS,
  type Dream100Category,
} from "@/lib/dream-100";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubQuestions } from "@/components/seo/hub-questions";
import { HubTldr } from "@/components/seo/hub-tldr";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";

const CANONICAL = "/dream-100";

export const metadata: Metadata = {
  title: "Dream 100 – The 27 People Unlock SaaS Should Reach in 2026",
  description:
    "The ranked list of 27 influencers, communities, and platforms whose audiences overlap with Unlock SaaS's dream customer: the non-engineer founder who shipped a real product and is stuck on distribution.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Dream 100 – Unlock SaaS's Target Audience",
    description:
      "27 people, communities, and platforms the post-launch indie founder actually follows.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Dream 100 – Unlock SaaS",
    description: "27 people and communities our dream customer actually follows.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS Dream 100",
  description:
    "The ranked list of influencers, communities, and platforms whose audiences overlap with Unlock SaaS's dream customer.",
  url: `${BASE_URL}/dream-100`,
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: DREAM_100_TOTAL,
    itemListElement: DREAM_100_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${BASE_URL}/dream-100/${e.slug}`,
      description: `${e.name} — ${e.role}`,
    })),
  },
});

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Dream 100", item: `${BASE_URL}/dream-100` },
  ],
});

function EngagementBar({ rollup }: { rollup: typeof ENGAGEMENT_ROLLUP }) {
  const total = Object.values(rollup).reduce((s, v) => s + v, 0);
  const engaged = rollup.engaging + rollup.contributed + rollup.collaborated;
  const pct = Math.round((engaged / total) * 100);

  return (
    <div className="max-w-3xl mx-auto px-6 py-4">
      <Card className="border-dashed">
        <CardContent className="pt-4 pb-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Honest engagement status
          </p>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
              {engaged}/{total}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We&rsquo;ve been building the funnel. Now we need to do the distribution work.
            Every name on this page represents a real person or community our dream
            customer follows. The engagement stage tells you how far along each
            relationship is — honestly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CategorySection({ category, label, description, entries }: {
  category: Dream100Category;
  label: string;
  description: string;
  entries: typeof DREAM_100_ENTRIES;
}) {
  const filtered = entries.filter((e) => e.category === category);
  if (filtered.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby={`cat-${category}`}>
      <div className="mb-6">
        <h2 id={`cat-${category}`} className="text-xl font-semibold leading-tight mb-2">
          {label}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="space-y-3">
        {filtered.map((entry) => {
          const diffStars = "★".repeat(entry.difficulty) + "☆".repeat(5 - entry.difficulty);
          return (
            <Card key={entry.slug} className="hover:border-primary/40 transition">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-semibold leading-tight">
                      {entry.handle ? (
                        <Link href={`/dream-100/${entry.slug}`} className="hover:underline">
                          {entry.name}
                        </Link>
                      ) : (
                        <span>{entry.name}</span>
                      )}
                      {entry.handle && (
                        <span className="text-sm text-muted-foreground font-normal ml-2">
                          {entry.handle}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.platform} &middot; ~{entry.audience}
                    </p>
                  </div>
                  <Badge variant={entry.engagementStage === "not-started" ? "outline" : "secondary"} className="shrink-0">
                    {entry.engagementStage.replace("-", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-1.5">
                  {entry.why}
                </p>
                <p className="text-xs text-muted-foreground">
                  Difficulty: <span className="text-amber-500">{diffStars}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default function Dream100HubPage() {
  const notStarted = ENGAGEMENT_ROLLUP.notStarted;

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
            Dream 100
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Traffic Secrets &sect;1 — Dream 100
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {DREAM_100_TOTAL} people, communities, and platforms our dream customer actually follows.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Russell Brunson&rsquo;s Dream 100 framework: you don&rsquo;t need a million followers.
          You need to get in front of the {DREAM_100_TOTAL} audiences that the people below
          already assembled. Every name here is a real account or community our dream
          customer follows. Each one is a distribution channel waiting to be activated.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          <strong className="text-foreground">Honest status:</strong>{" "}
          {notStarted} of {DREAM_100_TOTAL} entries have not been engaged yet.
          This page exists to make the work visible — once it&rsquo;s public, the
          outreach has to happen.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Dream 100 hub TL;DR"
        cluster="Dream 100 distribution targets"
        count={`${DREAM_100_TOTAL} entries across ${DREAM_100_COUNTS.length} categories`}
        intent="Every name on this page is a person, community, or platform whose audience overlaps with Unlock SaaS's dream customer. The engagement status tells you how far along each relationship is."
        schema="CollectionPage + ItemList; per-detail Article + BreadcrumbList"
      />

      <EngagementBar rollup={ENGAGEMENT_ROLLUP} />

      <Separator className="my-2" />

      {(Object.keys(DREAM_100_CATEGORIES) as Dream100Category[]).map((cat) => (
        <CategorySection
          key={cat}
          category={cat}
          label={DREAM_100_CATEGORIES[cat].label}
          description={DREAM_100_CATEGORIES[cat].description}
          entries={DREAM_100_ENTRIES}
        />
      ))}

      {DREAM_100_COUNTS.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-6">
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground font-medium mb-2">
              Category breakdown
            </summary>
            <ul className="space-y-1 pl-4 list-disc">
              {DREAM_100_COUNTS.map((c) => (
                <li key={c.category}>
                  <span className="font-medium text-foreground">{c.label}:</span>{" "}
                  {c.count} entries
                </li>
              ))}
            </ul>
          </details>
        </section>
      )}

      <Separator className="my-2" />

      <HubQuestions
        questions={[
          {
            q: "What is a Dream 100 list?",
            a: "A Dream 100 list is Russell Brunson's traffic method: name the specific people, communities, newsletters, and platforms that already have your dream customer's attention, then systematically become useful to them before making any ask. It replaces cold outreach with warm relationships that compound into distribution over time.",
          },
          {
            q: "How many targets does this list track?",
            a: (
              <>
                This page tracks {DREAM_100_TOTAL} named targets across{" "}
                {DREAM_100_COUNTS.length} categories, each with an honest
                engagement status, so the outreach pipeline is public instead
                of imagined. The list is Unlock SaaS&rsquo;s own working Dream
                100 — real accounts and communities our dream customer follows
                — updated as relationships progress.
              </>
            ),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-12"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              The Dream 100 is useless without the Dream Customer.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Knowing who to reach matters less than knowing who you&rsquo;re reaching
              FOR. The free Launch Diagnostic names your one person — so your Dream 100
              outreach has a target.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Name your dream customer</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/who">Read the aviator</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
