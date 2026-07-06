import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CASE_STUDIES,
  CASE_STUDY_CATEGORIES,
  CASE_STUDY_CATEGORY_LABELS,
} from "@/lib/case-studies";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/case-studies";

export const metadata: Metadata = {
  title:
    "Zero to First Customer Case Studies — Real Indie SaaS Stories (Unlock SaaS)",
  description:
    "Real stories from real founders who went from a flat Stripe line to their first paying customer. Each one names the exact tactic that worked.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Zero to First Customer Case Studies — Unlock SaaS",
    description:
      "Real founders who went from a flat Stripe line to their first paying customer.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zero to First Customer Case Studies",
    description:
      "Real founders who went from zero to their first paying customer.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Zero to First Customer Case Studies",
  url: `${BASE_URL}/case-studies`,
  description:
    "Real stories from founders who went from zero to first paying customer.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: CASE_STUDIES.length,
    itemListElement: CASE_STUDIES.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${BASE_URL}/case-studies/${c.slug}`,
      description: c.oneLine,
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
      name: "Case Studies",
      item: `${BASE_URL}/case-studies`,
    },
  ],
});

function CategoryBadge({ category }: { category: string }) {
  const label = CASE_STUDY_CATEGORY_LABELS[category as keyof typeof CASE_STUDY_CATEGORY_LABELS] ?? category;
  return (
    <Badge variant="secondary" className="text-xs">
      {label}
    </Badge>
  );
}

export default function CaseStudiesHub() {
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
          <li aria-current="page" className="text-foreground">Case Studies</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Case studies
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          From zero to first customer. Real stories.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every case study on this page is either a real founder story or a
          composite of real conversations. Each one names the exact tactic
          that produced the first paying customer — not general advice.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Case studies TL;DR"
        cluster="First-customer founder stories"
        count={`${CASE_STUDIES.length} case studies`}
        intent="Real founder stories of going from zero to first paying customer. Each one names the founder profile, the problem, what changed, and the specific result."
        schema="CollectionPage + ItemList; per-detail Article + BreadcrumbList"
      />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="list">
        <h2 id="list" className="sr-only">All case studies</h2>
        <div className="space-y-4">
          {CASE_STUDIES.map((c) => (
            <Card key={c.slug} className="hover:border-primary/30 transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-semibold leading-tight">
                    <Link
                      href={`/case-studies/${c.slug}`}
                      className="hover:text-primary transition"
                    >
                      {c.title}
                    </Link>
                  </h3>
                  <CategoryBadge category={c.category} />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{c.founderProfile}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {c.oneLine}
                </p>
                <div className="flex items-center justify-between gap-4">
                  <Link
                    href={`/case-studies/${c.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Read the case study →
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {c.lastVerified}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Ready to write your own case study?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The Playbook walks you step-by-step from a flat Stripe line to
              your first paying customer. 60-day guarantee, code-enforced.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/playbook-sales">See the Playbook</Link>
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
            <Link href="/mistakes" className="text-primary hover:underline font-semibold">
              Mistakes to avoid →
            </Link>{" "}
            The mistakes that keep the Stripe line flat.
          </p>
          <p>
            <Link href="/how-to" className="text-primary hover:underline font-semibold">
              How-to guides →
            </Link>{" "}
            Step-by-step playbooks for getting your first paying customer.
          </p>
        </div>
      </section>

      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          These are real or composite stories based on actual founder
          conversations. If you have a story to share, email{" "}
          <a href="mailto:maryan@unlocksaas.com" className="underline hover:text-foreground">
            maryan@unlocksaas.com
          </a>.
        </p>
      </footer>
    </main>
  );
}
