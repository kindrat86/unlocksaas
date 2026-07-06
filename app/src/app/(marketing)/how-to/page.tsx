import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HOW_TO_ENTRIES,
  HOW_TO_CATEGORIES,
  HOW_TO_CATEGORY_LABELS,
} from "@/lib/how-to";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/how-to";

export const metadata: Metadata = {
  title:
    "How to Get Your First SaaS Customer — Step-by-Step Guides (Unlock SaaS)",
  description:
    "Step-by-step playbooks for getting your first paying customer. Cold DM, community, content marketing, free tiers — every channel with an actionable system.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "How to Get Your First SaaS Customer — Step-by-Step Guides",
    description:
      "Step-by-step playbooks for getting your first paying customer. Every channel with an actionable system.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Get Your First SaaS Customer",
    description:
      "Step-by-step playbooks for getting your first paying customer.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "How to Get Your First SaaS Customer",
  url: `${BASE_URL}/how-to`,
  description:
    "Step-by-step playbooks for getting your first paying customer.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: HOW_TO_ENTRIES.length,
    itemListElement: HOW_TO_ENTRIES.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h.title,
      url: `${BASE_URL}/how-to/${h.slug}`,
      description: h.oneLine,
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
      name: "How-to",
      item: `${BASE_URL}/how-to`,
    },
  ],
});

function CategoryBadge({ category }: { category: string }) {
  const label = HOW_TO_CATEGORY_LABELS[category as keyof typeof HOW_TO_CATEGORY_LABELS] ?? category;
  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  );
}

export default function HowToHub() {
  const grouped = HOW_TO_CATEGORIES.map((cat) => ({
    category: cat,
    label: HOW_TO_CATEGORY_LABELS[cat],
    entries: HOW_TO_ENTRIES.filter((h) => h.category === cat),
  })).filter((g) => g.entries.length > 0);

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: COLLECTION_JSON }}
      />

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:underline">Home</Link></li>
          <li aria-current="page" className="text-foreground">How-to</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          How-to guides
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          How to get your first paying customer.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Not theory. Step-by-step systems that work for pre-revenue SaaS
          founders. Each guide names the exact steps, the tools you need,
          and the metric that tells you it is working.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="How-to hub TL;DR"
        cluster="First-customer acquisition guides"
        count={`${HOW_TO_ENTRIES.length} step-by-step guides`}
        intent="Step-by-step, actionable playbooks for getting your first paying SaaS customer. Each guide covers one channel (cold DM, community, content, free tier) with numbered steps and pro tips."
        schema="CollectionPage + ItemList; per-detail Article + HowTo + BreadcrumbList"
      />

      {grouped.map((group) => (
        <section
          key={group.category}
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby={`cat-${group.category}`}
        >
          <h2
            id={`cat-${group.category}`}
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-semibold"
          >
            {group.label}
          </h2>
          <div className="space-y-4">
            {group.entries.map((h) => (
              <Card key={h.slug} className="hover:border-primary/30 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold leading-tight">
                      <Link
                        href={`/how-to/${h.slug}`}
                        className="hover:text-primary transition"
                      >
                        {h.title}
                      </Link>
                    </h3>
                    <CategoryBadge category={h.category} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {h.oneLine}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={`/how-to/${h.slug}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Read the guide →
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {h.lastVerified}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Need a guide that follows you step by step?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook is not a guide you read — it is software that walks
              you through every step and tracks your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/playbook-sales">See the Playbook</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Run the free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="cross"
      >
        <h2
          id="cross"
          className="text-sm uppercase tracking-widest text-muted-foreground mb-3 font-semibold"
        >
          Also see
        </h2>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            <Link href="/mistakes" className="text-primary hover:underline font-semibold">
              Mistakes to avoid →
            </Link>{" "}
            The mistakes that keep the Stripe line flat.
          </p>
          <p>
            <Link href="/case-studies" className="text-primary hover:underline font-semibold">
              Case studies →
            </Link>{" "}
            Real stories of founders who went from zero to first customer.
          </p>
        </div>
      </section>

      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          These guides are based on real tactics that have worked for pre-revenue
          SaaS founders. Results vary. If you have a tactic to share, email{" "}
          <a href="mailto:maryan@unlocksaas.com" className="underline hover:text-foreground">
            maryan@unlocksaas.com
          </a>.
        </p>
      </footer>
    </main>
  );
}
