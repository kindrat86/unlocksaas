import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FOUNDER_MISTAKE_ENTRIES } from "@/lib/founder-mistakes";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

export const dynamic = "force-static";

const CANONICAL = "/founder-mistake";

export const metadata: Metadata = {
  title: "Strategic Indie SaaS Founder Mistakes | Unlock SaaS",
  description:
    "Eight strategic-level founder mistakes post-launch pre-revenue founders make. How they show up, why they happen, the real cost, and the specific fix.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Strategic Indie SaaS Founder Mistakes — Unlock SaaS",
    description:
      "Strategic-level founder mistakes with specific fixes. Built for the post-launch pre-revenue cohort.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Strategic Indie SaaS Founder Mistakes",
    description: "Strategic mistakes with specific fixes, not feel-good advice.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Strategic Indie SaaS Founder Mistakes",
  url: `${BASE_URL}/founder-mistake`,
  description:
    "Strategic-level founder mistakes post-launch pre-revenue founders make, with specific fixes anchored on the Brunson Hook / Story / Offer triage.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: FOUNDER_MISTAKE_ENTRIES.length,
    itemListElement: FOUNDER_MISTAKE_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/founder-mistake/${e.slug}`,
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
      name: "Founder mistakes",
      item: `${BASE_URL}/founder-mistake`,
    },
  ],
});

const LENS_LABEL = {
  hook: "Hook (Wrong Person)",
  story: "Story (Weak Belief)",
  offer: "Offer (Weak Offer)",
} as const;

export default function FounderMistakeHubPage() {
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
            Founder mistakes
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Strategic-level, not element-level
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Strategic indie SaaS founder mistakes.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Eight strategic mistakes post-launch pre-revenue founders make,
          mapped to the Brunson Hook / Story / Offer triage. How each
          mistake shows up, why founders make it, the real cost, the
          specific fix, and the false-fixes that look like fixes but
          are not.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
          Complement to{" "}
          <Link
            href="/why-isnt-my"
            className="text-primary hover:underline"
          >
            /why-isnt-my
          </Link>{" "}
          (element-level diagnostics) — these are the mid-build / post-
          launch strategic mistakes that take months to surface.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {FOUNDER_MISTAKE_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/founder-mistake/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.displayName}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {LENS_LABEL[e.brunsonLens]}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
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
              Which mistake is your funnel making?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic labels which Brunson
              failure mode your page hits — and tells you which of these
              strategic mistakes is the most likely root cause.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/why-isnt-my">Element diagnostics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
