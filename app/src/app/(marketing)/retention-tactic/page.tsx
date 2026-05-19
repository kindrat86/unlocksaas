import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  RETENTION_TACTIC_ENTRIES,
  LIFECYCLE_STAGES,
  LIFECYCLE_STAGE_LABELS,
} from "@/lib/retention-tactics";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/retention-tactic";

export const metadata: Metadata = {
  title: "SaaS Retention Tactics by Lifecycle Stage | Unlock SaaS",
  description:
    "Eight retention tactics mapped to lifecycle stage — week-1 check-in, day-3 nudge, month-1 feedback call, milestone celebration, quarterly revisit, win-back, annual renewal, feature deprecation.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "SaaS Retention Tactics by Lifecycle Stage — Unlock SaaS",
    description:
      "Lifecycle-stage retention tactics for indie SaaS with target metrics and honest failure modes.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Retention Tactics by Lifecycle Stage",
    description: "Week-1, month-1, quarter-1, year-1 retention tactics.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "SaaS Retention Tactics by Lifecycle Stage",
  url: `${BASE_URL}/retention-tactic`,
  description:
    "Lifecycle-stage retention tactics for indie SaaS, with target metrics, actions, failure modes, and when to retire.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: RETENTION_TACTIC_ENTRIES.length,
    itemListElement: RETENTION_TACTIC_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/retention-tactic/${e.slug}`,
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
      name: "Retention tactics",
      item: `${BASE_URL}/retention-tactic`,
    },
  ],
});

export default function RetentionTacticHubPage() {
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
            Retention tactics
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Lifecycle-stage specific
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          SaaS retention tactics by lifecycle stage.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Eight retention tactics mapped to specific lifecycle stages —
          week-1, month-1, quarter-1, year-1, and ongoing. Each page
          covers what the tactic is, why this stage requires it, the
          target retention metric, the specific actions, the failure
          modes, and when to retire the tactic.
        </p>
      </header>

      <Separator className="my-2" />

      {LIFECYCLE_STAGES.map((stage) => {
        const items = RETENTION_TACTIC_ENTRIES.filter(
          (e) => e.lifecycleStage === stage,
        );
        if (items.length === 0) return null;
        return (
          <section
            key={stage}
            className="max-w-3xl mx-auto px-6 py-6"
            aria-labelledby={`stage-${stage}`}
          >
            <h2
              id={`stage-${stage}`}
              className="text-xl font-bold mb-3 leading-tight"
            >
              {LIFECYCLE_STAGE_LABELS[stage]}
            </h2>
            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/retention-tactic/${e.slug}`}
                    className="block border border-border/40 rounded-lg p-3 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-base font-semibold text-primary mb-1 leading-tight">
                      {e.tacticName}
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
              Pair retention tactics with the right metric
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Each tactic targets a specific retention metric. The metric
              pages cover formulas and what good looks like.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/saas-metric/churn-rate">Churn rate metric</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/saas-metric/net-revenue-retention">NRR metric</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
