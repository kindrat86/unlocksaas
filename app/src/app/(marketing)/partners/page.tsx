import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PARTNER_ENTRIES,
  FOUNDER_PARTNERS,
  AFFILIATE_PARTNERS,
  type PartnerEntry,
} from "@/lib/partners";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { HubTldr } from "@/components/seo/hub-tldr";

const CANONICAL = "/partners";

export const metadata: Metadata = {
  title: "Partners – Unlock SaaS",
  description:
    "Featured partner pages for the founders, operators, and creators recommending Unlock SaaS. Branded landing pages with attribution to the 50% lifetime rev share program.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Unlock SaaS partners",
    description:
      "Featured partners recommending Unlock SaaS to their audience. 50% lifetime rev share on every Core subscription, paid monthly.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unlock SaaS partners",
    description:
      "Featured partner pages plus the 50% lifetime rev share affiliate program.",
  },
};

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Unlock SaaS partners",
  url: `${BASE_URL}/partners`,
  description:
    "Branded landing pages for the founders and operators recommending Unlock SaaS to their audience, paired with the 50% lifetime rev share affiliate program.",
  isPartOf: { "@id": ID.website },
  inLanguage: "en-US",
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PARTNER_ENTRIES.length,
    itemListElement: PARTNER_ENTRIES.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.displayName,
      url: `${BASE_URL}/partners/${p.slug}`,
      description: p.headline,
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
      name: "Partners",
      item: `${BASE_URL}/partners`,
    },
  ],
});

function PartnerCard({ partner }: { partner: PartnerEntry }) {
  const ctaLabel =
    partner.kind === "founder" ? "Read the founder story →" : "Open partner page →";
  return (
    <Card className="hover:border-primary/40 transition">
      <CardContent className="pt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          {partner.kind === "founder" ? "From the founder" : "Featured partner"}
        </p>
        <h3 className="text-lg font-semibold leading-tight mb-2">
          <Link href={`/partners/${partner.slug}`} className="hover:underline">
            {partner.displayName}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {partner.headline}
        </p>
        <Link
          href={`/partners/${partner.slug}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {ctaLabel}
        </Link>
      </CardContent>
    </Card>
  );
}

export default function PartnersHubPage() {
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
            Partners
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Partner directory
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The people recommending Unlock SaaS to their audience.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Every partner below earns 50% lifetime rev share on every Core
          subscription they refer, paid monthly. Each page is a branded
          landing surface the partner can share – their pitch, their proof,
          attribution to their unique referral code on every click.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="Partners hub TL;DR"
        cluster="Branded partner landing pages"
        count={`${PARTNER_ENTRIES.length} featured partner${PARTNER_ENTRIES.length === 1 ? "" : "s"}`}
        intent="Per-partner landing pages with attribution to the 50% lifetime rev share affiliate program."
        schema="CollectionPage + ItemList; per-detail ProfilePage + Person + BreadcrumbList"
      />

      {FOUNDER_PARTNERS.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="founder"
        >
          <h2
            id="founder"
            className="text-xl font-semibold mb-4 leading-tight"
          >
            From the founder
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {FOUNDER_PARTNERS.map((p) => (
              <PartnerCard key={p.slug} partner={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="featured-partners"
      >
        <h2
          id="featured-partners"
          className="text-xl font-semibold mb-4 leading-tight"
        >
          Featured partners
        </h2>
        {AFFILIATE_PARTNERS.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AFFILIATE_PARTNERS.map((p) => (
              <PartnerCard key={p.slug} partner={p} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="pt-6 pb-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The featured-partner directory is empty by design.{" "}
                <strong className="text-foreground">
                  The first ten Verified Builders to recommend Unlock SaaS
                  get a permanent branded landing page on this directory
                </strong>
                {" "}plus the standard 50% lifetime rev share. Each page is
                yours: your face, your pitch, your proof, your tracking
                link. We will not invent a partner directory to look bigger
                than we are.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Recommend Unlock SaaS. Get a branded page.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The affiliate program is 50% lifetime rev share on every Core
              subscription, paid monthly via Wise. Featured partners get a
              dedicated /partners/&lt;your-handle&gt; page indexed on the
              sitemap, with their referral code wired into every CTA.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/affiliate/terms">Read the affiliate terms</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Try the diagnostic first</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

// Hub is fully static – every input is build-time content from
// lib/partners.ts. No runtime data, no cookies/headers/searchParams,
// so the page prerenders into the static shell automatically under
// Next 16 cacheComponents. No `force-static` shim required.
