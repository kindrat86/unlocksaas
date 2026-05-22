import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MCP_TOOL_SLUGS,
  getMcpToolBySlug,
  getRelatedMcpTools,
  renderClaudeDesktopSnippet,
  renderCursorSnippet,
  type McpTool,
} from "@/lib/mcp-tools";
import { ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

/**
 * Programmatic SEO surface – /mcp-tools/[slug].
 *
 * Per-server detail page in the MCP directory. Same JSON-LD pattern as
 * the prior pSEO clusters (Article + FAQPage + BreadcrumbList) with an
 * additional SoftwareApplication block specifically because every entry
 * IS a piece of software the agent can install.
 *
 * No fabricated tool counts, no quoted vendor copy, no slag. Install
 * snippets are derived from the registry's distribution shape so they
 * stay drift-free with the source of truth in src/lib/mcp-tools.ts.
 */

const BASE = "https://unlocksaas.com";

export function generateStaticParams() {
  return MCP_TOOL_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const t = getMcpToolBySlug(params.slug);
  if (!t) return {};

  const canonical = `/mcp-tools/${t.slug}`;
  const title = `${t.name} – install in Claude Desktop and Cursor`;
  const description = t.oneLine;

  return {
    title,
    description,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ----- JSON-LD --------------------------------------------------------------

function buildJsonLd(t: McpTool, canonicalUrl: string): string[] {
  const subject = {
    "@type": "SoftwareApplication",
    name: t.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Cross-platform",
    url: t.vendorUrl,
    publisher: { "@type": "Organization", name: t.vendor },
    description: t.oneLine,
    softwareHelp: {
      "@type": "CreativeWork",
      url: t.vendorUrl,
    },
    // Honest empty: no offers, no aggregateRating until verifiable.
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${t.name} – install in Claude Desktop and Cursor`,
    description: t.oneLine,
    abstract: t.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: t.lastVerified,
    dateModified: t.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: subject,
    mentions: subject,
    keywords: t.tags.join(", "),
    inLanguage: "en-US",
    speakable: buildSpeakable(
      '[data-speakable="recommendation"]',
      '[data-speakable="faq-q"]',
      '[data-speakable="faq-a"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    ...subject,
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    speakable: buildSpeakable(
      '[data-speakable="recommendation"]',
      '[data-speakable="faq-q"]',
      '[data-speakable="faq-a"]',
    ),
    ...ACCESS_MODE_TEXTUAL,
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage: "en-US",
      },
    })),
  };

  const breadcrumbs = {
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
      {
        "@type": "ListItem",
        position: 3,
        name: t.name,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
    JSON.stringify(softwareApplication),
    JSON.stringify(faqPage),
    JSON.stringify(breadcrumbs),
  ];
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

// ----- Page ------------------------------------------------------------------

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-muted text-foreground rounded-md border p-4 text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

function distributionLabel(t: McpTool): string {
  switch (t.distribution) {
    case "remote":
      return "Remote (hosted URL)";
    case "npm":
      return "npm package (runs locally)";
    case "binary":
      return "Local binary";
    case "repo":
      return "Source repository";
  }
}

export default async function McpToolDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const t = getMcpToolBySlug(params.slug);
  if (!t) notFound();

  const canonicalUrl = `${BASE}/mcp-tools/${t.slug}`;
  const jsonLdBlocks = buildJsonLd(t, canonicalUrl);
  const related = getRelatedMcpTools(t.slug, 3);
  const claudeSnippet = renderClaudeDesktopSnippet(t);
  const cursorSnippet = renderCursorSnippet(t);

  return (
    <article className="min-h-screen">
      {jsonLdBlocks.map((json, idx) => (
        <JsonLdBlock key={idx} json={json} />
      ))}

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
          <li>
            <Link href="/mcp-tools" className="hover:underline">
              MCP server directory
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {t.name}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          MCP server · {t.category}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {t.name}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-4">
          {t.oneLine}
        </p>
        <div className="flex gap-2 flex-wrap">
          {t.builtByUnlocksaas ? (
            <Badge variant="default">Built by us</Badge>
          ) : null}
          {t.official ? (
            <Badge variant="secondary">Official</Badge>
          ) : (
            <Badge variant="outline">Community</Badge>
          )}
          <Badge variant="outline">{distributionLabel(t)}</Badge>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={t.lastVerified}>
            {formatVerifiedDate(t.lastVerified)}
          </time>
          {" · "}
          <Link
            href="/editorial-policy"
            className="underline hover:text-foreground"
          >
            editorial policy
          </Link>
        </p>
      </header>

      <Separator className="my-2" />

      {/* TL;DR */}
      <TldrSummary
        headingLabel={`${t.name} TL;DR`}
        items={[
          { term: "Server", definition: t.name },
          { term: "Vendor", definition: t.vendor },
          { term: "Category", definition: t.category },
          { term: "Distribution", definition: distributionLabel(t) },
          { term: "TL;DR", definition: t.tldr },
          { term: "Founder fit", definition: t.founderFit },
          {
            term: "Last verified",
            definition: formatVerifiedDate(t.lastVerified),
          },
        ]}
      />

      {/* What you can do with it */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="capabilities"
      >
        <h2
          id="capabilities"
          className="text-2xl font-bold mb-6 leading-tight"
        >
          What an agent can do with it
        </h2>
        <div className="space-y-3">
          {t.toolHighlights.map((cap) => (
            <Card key={cap.label}>
              <CardContent className="pt-6">
                <h3 className="text-base font-semibold leading-tight mb-2">
                  {cap.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cap.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Founder fit */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="founder-fit"
      >
        <h2
          id="founder-fit"
          className="text-2xl font-bold mb-4 leading-tight"
        >
          Why an indie SaaS founder cares
        </h2>
        <p
          className="text-base leading-relaxed"
          data-speakable="recommendation"
        >
          {t.founderFit}
        </p>
      </section>

      {/* Install */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="install">
        <h2 id="install" className="text-2xl font-bold mb-4 leading-tight">
          Install
        </h2>
        {t.accessNote ? (
          <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardContent className="pt-6 pb-6">
              <p className="text-sm flex gap-2 leading-relaxed">
                <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  <span className="font-semibold">Access:</span>{" "}
                  {t.accessNote}
                </span>
              </p>
            </CardContent>
          </Card>
        ) : null}

        <h3 className="text-base font-semibold mb-3 leading-tight">
          Claude Desktop
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Add the following block to your{" "}
          <code className="text-sm">claude_desktop_config.json</code> and
          restart Claude:
        </p>
        <CodeBlock>{claudeSnippet}</CodeBlock>

        <h3 className="text-base font-semibold mt-6 mb-3 leading-tight">
          Cursor
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Add the following block to{" "}
          <code className="text-sm">.cursor/mcp.json</code> in your home
          directory or project root:
        </p>
        <CodeBlock>{cursorSnippet}</CodeBlock>

        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          Install snippets are derived from the vendor's published
          distribution shape. If your client is neither Claude Desktop nor
          Cursor, see the{" "}
          <a
            href={t.vendorUrl}
            target="_blank"
            rel="noopener noreferrer external"
            className="underline hover:text-foreground"
          >
            vendor docs
            <ExternalLink className="h-3 w-3 inline ml-1" />
          </a>{" "}
          for client-specific configuration.
        </p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {t.name} – FAQ
        </h2>
        <div className="space-y-3">
          {t.faqs.map((f) => (
            <details
              key={f.q}
              className="group border border-border rounded-lg px-4 py-3"
            >
              <summary className="cursor-pointer font-semibold leading-snug list-none flex items-start justify-between gap-3">
                <span data-speakable="faq-q">{f.q}</span>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform"
                >
                  ▾
                </span>
              </summary>
              <p
                className="mt-3 text-sm text-muted-foreground leading-relaxed"
                data-speakable="faq-a"
              >
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10 border-t border-border/40"
          aria-labelledby="related"
        >
          <h2 id="related" className="text-xl font-bold mb-4 leading-tight">
            Related MCP servers
          </h2>
          <div className="space-y-3">
            {related.map((r) => (
              <Card key={r.slug} className="hover:border-primary/30 transition">
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold leading-tight mb-2">
                    <Link
                      href={`/mcp-tools/${r.slug}`}
                      className="hover:text-primary transition"
                    >
                      {r.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {r.oneLine}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              {t.builtByUnlocksaas
                ? "Already convinced? Get the free diagnostic."
                : "Want an agent that knows your SaaS offer?"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              {t.builtByUnlocksaas
                ? "Install the server above, then run the 90-second diagnostic. The MCP gives the assistant the same structured access that powers it – paste your URL and get a Wrong Person / Weak Offer / Weak Belief label."
                : "Install the UnlockSaaS MCP server alongside this one and the assistant can diagnose your live landing page, pull funnel and pricing teardowns of competitors, and walk the Brunson Playbook with you."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {t.builtByUnlocksaas ? (
                <>
                  <Button asChild>
                    <Link href="/diagnostic">Get the free diagnostic</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/starter">Start with $1</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/mcp">Install the UnlockSaaS MCP server</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/diagnostic">Get the free diagnostic</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Browse more */}
      <section
        className="max-w-3xl mx-auto px-6 py-8 border-t border-border/40"
        aria-labelledby="browse"
      >
        <h2 id="browse" className="sr-only">
          Browse more
        </h2>
        <p className="text-sm">
          <Link
            href="/mcp-tools"
            className="text-primary hover:underline font-semibold"
          >
            <ArrowRight className="h-4 w-4 inline" /> Browse every MCP server
          </Link>
        </p>
      </section>

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified{" "}
          <time dateTime={t.lastVerified}>
            {formatVerifiedDate(t.lastVerified)}
          </time>
          . This entry describes the publicly documented behaviour of{" "}
          {t.name} at that date. No quoted vendor copy, no fabricated tool
          counts, no paid placement. See the canonical vendor page at{" "}
          <a
            href={t.vendorUrl}
            target="_blank"
            rel="noopener noreferrer external"
            className="underline hover:text-foreground"
          >
            {t.vendorUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
          . If anything on this page is wrong or out of date, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix it.
        </p>
      </footer>
    </article>
  );
}
