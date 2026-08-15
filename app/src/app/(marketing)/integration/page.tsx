import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { INTEGRATION_ENTRIES } from "@/lib/integrations";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";


const CANONICAL = "/integration";

export const metadata: Metadata = {
  title: "Indie SaaS Tool Integration Patterns | Unlock SaaS",
  description:
    "Pattern-level integration guides for common indie SaaS tool pairs — Stripe+Supabase, Resend+Next.js, Cal.com+Stripe, Supabase+Vercel, and more.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Indie SaaS Tool Integration Patterns — Unlock SaaS",
    description: "Pattern-level integration deep dives for common indie SaaS tool combinations.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indie SaaS Tool Integration Patterns",
    description: "Stripe+Supabase, Resend+Next.js, Cal.com+Stripe, and more.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Indie SaaS Tool Integration Patterns",
  url: `${BASE_URL}/integration`,
  description:
    "Pattern-level integration patterns for common indie SaaS tool pairs. What each tool owns, the integration shape, implementation steps, common gotchas.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: INTEGRATION_ENTRIES.length,
    itemListElement: INTEGRATION_ENTRIES.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.displayName,
      url: `${BASE_URL}/integration/${e.slug}`,
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
      name: "Integrations",
      item: `${BASE_URL}/integration`,
    },
  ],
});

export default function IntegrationHubPage() {
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
            Integrations
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pattern-level, not code-level
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Indie SaaS tool integration patterns.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Pattern-level integration deep dives for common indie SaaS tool
          pairs — Stripe+Supabase, Resend+Next.js, Cal.com+Stripe,
          Supabase+Vercel, Stripe+Beehiiv, Stripe+Loops, Tally+Supabase.
          Each page covers what each tool owns, the integration shape,
          implementation steps with gotchas, and when NOT to build the
          integration.
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-6">
        <ul className="space-y-4">
          {INTEGRATION_ENTRIES.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/integration/${e.slug}`}
                className="block border border-border/40 rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <p className="text-base font-semibold text-primary mb-1 leading-tight">
                  {e.displayName}
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
              See the stack these tools come from
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The integrations here apply within the named-tool stack
              recommendations. The stack pages tell you which tools to use
              together; the integration pages tell you how.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/stack">Stack recommendations</Link>
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
