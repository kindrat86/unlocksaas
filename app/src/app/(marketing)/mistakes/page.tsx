import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MISTAKES,
  MISTAKE_CATEGORIES,
  MISTAKE_CATEGORY_LABELS,
} from "@/lib/mistakes";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/mistakes";

export const metadata: Metadata = {
  title:
    "Indie SaaS Mistakes to Avoid — Hard-Earned Lessons (Unlock SaaS)",
  description:
    "Real mistakes real indie SaaS founders make that keep the Stripe line at zero. Each one comes with a specific fix you can apply today.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Mistakes to Avoid — Hard-Earned Lessons",
    description:
      "Real mistakes that keep the Stripe line flat. Each one with a specific fix you can apply today.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Mistakes to Avoid",
    description:
      "Real mistakes that keep the Stripe line flat. Each one with a specific fix.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Mistakes to Avoid",
  url: `${BASE_URL}/mistakes`,
  description:
    "Real mistakes indie SaaS founders make that keep the Stripe line at zero.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: MISTAKES.length,
    itemListElement: MISTAKES.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: m.title,
      url: `${BASE_URL}/mistakes/${m.slug}`,
      description: m.oneLine,
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
      name: "Mistakes",
      item: `${BASE_URL}/mistakes`,
    },
  ],
});

function CategoryBadge({ category }: { category: string }) {
  const label = MISTAKE_CATEGORY_LABELS[category as keyof typeof MISTAKE_CATEGORY_LABELS] ?? category;
  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  );
}

export default function MistakesHub() {
  const grouped = MISTAKE_CATEGORIES.map((cat) => ({
    category: cat,
    label: MISTAKE_CATEGORY_LABELS[cat],
    entries: MISTAKES.filter((m) => m.category === cat),
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
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">Mistakes</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Mistakes to avoid
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The mistakes that keep the Stripe line flat.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every entry below came from a real founder conversation or a public
          thread. Each one names the mistake, explains why it happens, and
          gives a specific fix — not a platitude.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Mistakes hub TL;DR"
        cluster="Indie SaaS mistakes"
        count={`${MISTAKES.length} documented mistakes`}
        intent="Each entry is one real mistake that keeps the Stripe line flat, with a names-the-problem, names-the-fix structure optimized for AI Overviews and Perplexity citation."
        schema="CollectionPage + ItemList; per-detail Article + FAQPage + BreadcrumbList"
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
            {group.entries.map((m) => (
              <Card key={m.slug} className="hover:border-primary/30 transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold leading-tight">
                      <Link
                        href={`/mistakes/${m.slug}`}
                        className="hover:text-primary transition"
                      >
                        {m.title}
                      </Link>
                    </h3>
                    <CategoryBadge category={m.category} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {m.oneLine}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <Link
                      href={`/mistakes/${m.slug}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Read the mistake →
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {m.lastVerified}
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
              Ready to stop making these mistakes?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook turns your already-shipped product into a first
              paying customer. If it does not, you do not pay.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/starter">Start with $1</Link>
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
            <Link href="/should-i" className="text-primary hover:underline font-semibold">
              Should I…? →
            </Link>{" "}
            Direct yes / no verdicts on decisions indie SaaS founders face.
          </p>
          <p>
            <Link href="/how-to" className="text-primary hover:underline font-semibold">
              How-to guides →
            </Link>{" "}
            Step-by-step playbooks for getting your first paying customer.
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
          Every mistake listed here comes from real founder conversations or
          public threads. If you see something wrong or have a mistake to add, email{" "}
          <a href="mailto:maryan@unlocksaas.com" className="underline hover:text-foreground">
            maryan@unlocksaas.com
          </a>.
        </p>
      </footer>
    </main>
  );
}
