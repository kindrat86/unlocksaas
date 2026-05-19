import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { OBJECTION_ENTRIES } from "@/lib/objections";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/objection";

export const metadata: Metadata = {
  title: "SaaS Sales Objection Handling Scripts | Unlock SaaS",
  description:
    "Honest response scripts for the eight most common indie SaaS sales objections. Brunson-method reframes, what NOT to say, and the question that surfaces the real concern.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "SaaS Sales Objection Handling — Unlock SaaS",
    description:
      "Brunson-method honest response scripts for the most common indie SaaS sales objections.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Sales Objection Handling Scripts",
    description: "Honest objection-response scripts with what NOT to say.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "SaaS Sales Objection Handling Scripts",
  url: `${BASE_URL}/objection`,
  description:
    "Honest, Brunson-method response scripts for the most common indie SaaS sales objections.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: OBJECTION_ENTRIES.length,
    itemListElement: OBJECTION_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/objection/${e.slug}`,
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
      name: "Objections",
      item: `${BASE_URL}/objection`,
    },
  ],
});

const LENS_LABEL = {
  hook: "Hook (Wrong Person)",
  story: "Story (Weak Belief)",
  offer: "Offer (Weak Offer)",
} as const;

export default function ObjectionHubPage() {
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
            Objections
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Brunson-method, honest, no pressure
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          SaaS sales objection handling scripts.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Honest response scripts for the eight most common indie SaaS sales
          objections — too expensive, no time, can DIY, wrong timing, missing
          feature, more info, tried before, need to think. Each page covers
          when the objection is legitimate, the real concern underneath, the
          response script, what NOT to say, and the question that surfaces
          the real concern.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Different from{" "}
          <Link href="/answers" className="text-primary hover:underline">
            /answers
          </Link>{" "}
          (founder questions about funnels) — these are buyer objections
          about the offer itself, mapped to the Brunson Hook / Story /
          Offer triage.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {OBJECTION_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/objection/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                  {LENS_LABEL[e.brunsonLens]}
                </p>
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  &ldquo;{e.objection}&rdquo;
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  {e.intro}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Which objection does your funnel hit most?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              diagnosis your page hits — and that maps directly to the
              objections you will hear when you start having sales
              conversations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/template">Brunson script templates</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
