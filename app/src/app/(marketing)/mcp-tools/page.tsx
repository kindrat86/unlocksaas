import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MCP_TOOLS,
  groupMcpToolsByCategory,
  latestMcpToolsVerifiedDate,
} from "@/lib/mcp-tools";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { HubDatasetJsonLd } from "@/components/seo/json-ld";
import { HubTldr } from "@/components/seo/hub-tldr";

/**
 * /mcp-tools hub – programmatic SEO surface #11.
 *
 * Switzerland-style directory of MCP servers an indie SaaS founder
 * would plausibly install alongside the UnlockSaaS MCP server. Same
 * shape as the prior pSEO hubs (alternatives-to, funnel-teardown,
 * pricing-teardown, vs, category, etc.): CollectionPage + Dataset +
 * BreadcrumbList JSON-LD, category grouping, cross-link block, CTA.
 *
 * Why this surface exists
 * -----------------------
 * 2026 is the year MCP graduates from niche protocol to default agent
 * integration surface. Early directory owners compound – the same play
 * llms.txt occupied in 2025. Owning the "best MCP for X" / "MCP server
 * directory" search shape now is a defensive positioning bet with low
 * marginal cost.
 *
 * Honesty discipline
 * ------------------
 * No fabricated tool counts. No paid placements. No slag on listed
 * vendors. Every entry lastVerified-stamped and editable by an operator
 * via src/lib/mcp-tools.ts.
 */

const BASE = "https://unlocksaas.com";

export const metadata: Metadata = {
  title:
    "MCP server directory – install the right MCP for your indie SaaS stack",
  description:
    "Honest directory of MCP servers for indie SaaS founders. Diagnostic, infrastructure, project management, design and testing – install snippets for Claude Desktop and Cursor, founder-fit notes, lastVerified per entry.",
  alternates: markdownAlternate("/mcp-tools", "/mcp-tools.md"),
  robots: { index: true, follow: true },
  openGraph: {
    title: "MCP server directory – Unlock SaaS",
    description:
      "Honest directory of MCP servers for indie SaaS founders. Install snippets, founder-fit notes, lastVerified per entry.",
    type: "website",
    url: "/mcp-tools",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP server directory – Unlock SaaS",
    description:
      "Honest directory of MCP servers for indie SaaS founders. Install snippets, founder-fit notes, lastVerified per entry.",
  },
};

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${BASE}/`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "MCP server directory",
      item: `${BASE}/mcp-tools`,
    },
  ],
});

const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "MCP server directory – Unlock SaaS",
  url: `${BASE}/mcp-tools`,
  inLanguage: "en-US",
  description:
    "Honest directory of MCP servers an indie SaaS founder would plausibly install. Each entry names the vendor, the distribution shape, the founder-fit verdict, and a copy-paste install snippet for Claude Desktop and Cursor.",
  isPartOf: {
    "@type": "WebSite",
    name: "Unlock SaaS",
    url: BASE,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: MCP_TOOLS.length,
    itemListElement: MCP_TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `${BASE}/mcp-tools/${t.slug}`,
    })),
  },
});

export default function McpToolsHub() {
  const groups = groupMcpToolsByCategory();
  const latestVerified = latestMcpToolsVerifiedDate();

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
      <HubDatasetJsonLd
        name="MCP Server Directory for Indie SaaS Founders"
        description="Honest directory of MCP servers an indie SaaS founder would plausibly install. Each entry names the vendor, the distribution shape, the founder-fit verdict, and the install snippet."
        hubPath="/mcp-tools"
        mdPath="/mcp-tools.md"
        lastVerified={latestVerified}
        entries={MCP_TOOLS.map((t) => ({
          slug: t.slug,
          displayName: t.name,
        }))}
      />

      {/* Breadcrumb */}
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
            MCP server directory
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          MCP server directory
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The MCP servers an indie SaaS founder should know about.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          An honest directory of MCP servers across diagnostic, infrastructure,
          project management, and design. Each entry names the vendor, the
          distribution shape, the founder-fit verdict, and a copy-paste install
          snippet for Claude Desktop and Cursor.
        </p>
      </header>

      <Separator className="my-2" />

      <HubTldr
        headingLabel="MCP tools hub TL;DR"
        cluster="MCP server directory"
        count={`${MCP_TOOLS.length} curated MCP servers`}
        intent="Switzerland-style directory of MCP servers an indie SaaS founder would plausibly install alongside the UnlockSaaS MCP server. Categorised by purpose, with install snippets and founder-fit verdicts."
        schema="CollectionPage + ItemList + Dataset; per-detail SoftwareApplication + FAQPage + BreadcrumbList"
      />

      {/* How to read */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="lens">
        <h2 id="lens" className="text-xl font-bold mb-4 leading-tight">
          How to read this directory
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-semibold">Vendor</span> is
            the publisher of the MCP server. Official entries are tagged.
          </li>
          <li>
            <span className="text-foreground font-semibold">Distribution</span>{" "}
            tells you whether the server is a hosted URL, an npm package, or
            a binary you install locally.
          </li>
          <li>
            <span className="text-foreground font-semibold">Founder fit</span>{" "}
            names why a post-launch pre-revenue indie SaaS founder
            specifically would care.
          </li>
          <li>
            <span className="text-foreground font-semibold">
              Install snippets
            </span>{" "}
            on each detail page are copy-paste ready for Claude Desktop and
            Cursor.
          </li>
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Grouped list */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="list">
        <h2 id="list" className="sr-only">
          All MCP servers
        </h2>
        <div className="space-y-10">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4 font-semibold">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.tools.map((t) => (
                  <Card
                    key={t.slug}
                    className="hover:border-primary/30 transition"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                        <h4 className="text-lg font-semibold leading-tight">
                          <Link
                            href={`/mcp-tools/${t.slug}`}
                            className="hover:text-primary transition"
                          >
                            {t.name}
                          </Link>
                        </h4>
                        <div className="flex gap-2 shrink-0">
                          {t.builtByUnlocksaas ? (
                            <Badge variant="default">Built by us</Badge>
                          ) : null}
                          {t.official ? (
                            <Badge variant="secondary">Official</Badge>
                          ) : (
                            <Badge variant="outline">Community</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t.vendor} · {t.distribution}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {t.oneLine}
                      </p>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <Link
                          href={`/mcp-tools/${t.slug}`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Read the entry →
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          Verified {t.lastVerified}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Want an agent that knows your SaaS offer?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Install the UnlockSaaS MCP server alongside any of the above
              and Claude or Cursor can diagnose your live landing page, pull
              the funnel teardown of a competitor, or walk the Brunson
              Playbook with you – grounded in real structured data, not
              guesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/mcp">Install the UnlockSaaS MCP server</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Cross-links to other pSEO surfaces */}
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
            <Link
              href="/mcp"
              className="text-primary hover:underline font-semibold"
            >
              UnlockSaaS MCP server →
            </Link>{" "}
            The strategy server this directory was built around. Read-only,
            no auth, free.
          </p>
          <p>
            <Link
              href="/vs"
              className="text-primary hover:underline font-semibold"
            >
              Head-to-head comparisons →
            </Link>{" "}
            Symmetric vendor comparisons across the tools indie founders
            evaluate.
          </p>
          <p>
            <Link
              href="/stack-for"
              className="text-primary hover:underline font-semibold"
            >
              Stack-for guides →
            </Link>{" "}
            Recommended SaaS stack per founder situation.
          </p>
        </div>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          We do not take placements or fees from any vendor on this directory.
          The list is the set of MCP servers we believe an indie SaaS founder
          would plausibly want to install in 2026. If an entry is wrong, out of
          date, or you want to nominate a server we missed, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix or extend it.
        </p>
      </footer>
    </main>
  );
}
