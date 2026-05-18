/**
 * Verified Builder embed code page.
 *
 * Why this exists (off-page lift):
 *   Every Verified Builder is the post-launch proof point UnlockSaaS relies
 *   on for E-E-A-T. When a Verified Builder embeds their badge on their own
 *   product site, that becomes a real editorial backlink to
 *   /builder/<slug>. The backlink is honest — the founder really is a
 *   Verified Builder, Stripe really did confirm the first paying customer,
 *   the link points at the canonical proof page. No paid placements, no
 *   reciprocal link schemes, no PBN nonsense.
 *
 *   Strategically: every verified-customer cycle that ships compounds into
 *   one more do-follow link to unlocksaas.com. That is the *only* off-page
 *   lift mechanism a pre-revenue solo SaaS can ship without violating the
 *   Brunson Hard-Rule. Every other link-building tactic either (a) asks
 *   the founder to fabricate value, or (b) waits on earned media.
 *
 * Page audience:
 *   - The verified builder themselves: copies the embed and drops it into
 *     their own site footer or testimonials section.
 *   - Anyone browsing /builders who wants to see what an embeddable badge
 *     looks like before they become a Verified Builder.
 *
 * Schema: BreadcrumbList only. The embed page is a tool, not editorial
 * content – we explicitly do not want Google ranking this surface above
 * the canonical badge page at /builder/<slug>.
 *
 * Static-render constraint: like /builder/<slug> itself, this page reads
 * from the public `builder_badges` view (which already filters out
 * private profiles), so we keep `force-dynamic` for the freshness story.
 * The page is cheap – no markdown rendering, just template substitution.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge, absoluteBadgeUrl } from "@/lib/builder-badge";
import { ArrowLeft, CheckCircle2, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const badge = await loadPublicBadge(createAdminClient(), params.slug);
  if (!badge) {
    return {
      title: "Verified Builder embed",
      // Embed tooling is not editorial; never index these.
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Embed code – ${badge.builderName} (Verified Builder)`,
    description: `Copy-paste HTML to embed ${badge.builderName}'s Verified Builder badge on any site. The badge links to the canonical Stripe-verified proof page at unlocksaas.com.`,
    // index:false is correct: this is a tool surface for the verified
    // builder. The canonical badge at /builder/<slug> is the indexable
    // page; this one shipping into Google would create duplicate-intent
    // results for the same query.
    robots: { index: false, follow: false },
  };
}

export default async function EmbedPage(props: Props) {
  const params = await props.params;
  const badge = await loadPublicBadge(createAdminClient(), params.slug);
  if (!badge) notFound();

  const badgeUrl = absoluteBadgeUrl(badge.slug);
  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const productLabel = badge.productName ?? "their product";

  /**
   * Two embed snippets. Both:
   *   - link to the canonical badge URL (the backlink the founder gets);
   *   - carry `rel="external"` to mark this as an editorial outbound
   *     link – honest about its purpose, no nofollow needed since the
   *     relationship is genuinely editorial.
   *   - use inline styles only so the embed survives any host stylesheet.
   *
   * Snippet A: card badge – small box with the Verified Builder pill,
   * the builder name, product, and date. ~6 lines of HTML. Style values
   * are intentionally low-contrast (no brand purple/yellow/orange per
   * the visual-style lock) so the badge fits on any site.
   *
   * Snippet B: plain text link – one-line `<a>` for sites that don't
   * want the card chrome. Best for testimonials/footer link rows.
   */
  const cardSnippet = `<a href="${badgeUrl}" rel="external" style="display:inline-block;text-decoration:none;color:inherit;font:14px/1.4 system-ui,sans-serif;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;background:#fff;max-width:320px">
  <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px">✓ Verified Builder</div>
  <div style="font-weight:600;color:#111827;margin-bottom:2px">${escapeHtml(badge.builderName)} shipped ${escapeHtml(productLabel)} and got paid for it.</div>
  <div style="font-size:12px;color:#6b7280">Verified by Stripe · ${dateStr}</div>
</a>`;

  const linkSnippet = `<a href="${badgeUrl}" rel="external">✓ Verified Builder – ${escapeHtml(badge.builderName)} on Unlock SaaS</a>`;

  /**
   * Markdown version – for builders embedding in a README, Notion page,
   * Substack post, or anywhere markdown is the host language. Same backlink
   * semantics; rendered text identical to the plain HTML link.
   */
  const markdownSnippet = `[✓ Verified Builder – ${badge.builderName} on Unlock SaaS](${badgeUrl})`;

  /**
   * SVG image embed snippets — the off-page lift surface for any host
   * that strips arbitrary HTML (GitHub README, Substack, Medium, Reddit,
   * Notion exports, most issue trackers). The SVG endpoint at
   * /builder/<slug>/badge.svg renders 600x80 with the builder name,
   * product, Stripe-verified date, and wordmark; identical visual
   * grammar to the in-page card above.
   *
   * The link wrapper carries the editorial backlink (rel="external") —
   * that's the on-page-of-host signal Google reads. The <img> alt text
   * carries the same Stripe-verified claim so screen readers and
   * search-snippet pipelines have a non-visual handle on it.
   *
   * Why two forms (HTML and markdown):
   *   - HTML form for personal product sites that accept raw HTML.
   *   - Markdown form for README files, where `[![](...)](...)` is the
   *     only embed grammar that renders as a clickable image.
   *
   * Why no shields.io: we control the SVG, the cache headers, the
   * canonical URL, AND the link relationship. Outsourcing the render to
   * a third party would either lose the canonical anchor or introduce a
   * dependency the Brunson Hard-Rule can't honestly verify.
   */
  const svgUrl = `${badgeUrl}/badge.svg`;
  const svgHtmlSnippet = `<a href="${badgeUrl}" rel="external">
  <img src="${svgUrl}" alt="Verified Builder – ${escapeHtml(badge.builderName)} shipped ${escapeHtml(productLabel)} and got paid for it. Verified by Stripe." width="600" height="80" />
</a>`;
  const svgMarkdownSnippet = `[![Verified Builder – ${badge.builderName} on Unlock SaaS](${svgUrl})](${badgeUrl})`;

  /**
   * Review JSON-LD snippet — the off-page E-E-A-T amplifier.
   *
   * What this is:
   *   A schema.org Review block the Verified Builder pastes on their own
   *   product site (in a <head> or anywhere in <body>; schema.org doesn't
   *   care about position). Google harvests Review schema from third-
   *   party domains as long as the `itemReviewed` resolves to a real
   *   entity — which it does, via the @id anchor pointing at the
   *   canonical Organization node at unlocksaas.com/#organization.
   *
   * What it claims, in Brunson Hard-Rule:
   *   - Author: the Verified Builder, by public slug — no email, no PII.
   *   - itemReviewed: Unlock SaaS, by @id.
   *   - reviewBody: the verifiable fact the badge already states. No
   *     embellishment, no opinion-laundering. "X shipped Y and got a
   *     paying customer. Verified by Stripe on DATE."
   *   - publisher.url: points back at the founder's product URL when one
   *     is on file. This is the symmetric backlink — UnlockSaaS now has a
   *     Review schema citing the founder, and the founder's site has a
   *     Review schema citing UnlockSaaS. Knowledge-graph reciprocity.
   *
   * What it deliberately does NOT include:
   *   - No reviewRating. A rating implies a 1–5 evaluation; this is a
   *     verifiable fact (cycle happened or didn't), not a graded
   *     opinion. Brunson aggregateRating-omission rule cascades here:
   *     no fabricated ratings, ever.
   *   - No dateModified. The Stripe-verified date IS the publish date.
   *
   * Caller responsibility: the founder pastes both the badge link AND
   * the JSON-LD on the same page. Google reads both, resolves @id, and
   * the relationship lights up in the structured-data graph.
   */
  const reviewJsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Review",
      "itemReviewed": {
        "@type": "Organization",
        "@id": "https://unlocksaas.com/#organization",
        "name": "Unlock SaaS",
        "url": "https://unlocksaas.com",
      },
      "author": {
        "@type": "Person",
        "name": badge.builderName,
        "url": badgeUrl,
      },
      "reviewBody": `${badge.builderName} shipped ${productLabel} and got a paying customer. Verified by Stripe on ${dateStr}.`,
      "datePublished": badge.firstCustomerAt.toISOString().slice(0, 10),
      ...(badge.productUrl
        ? {
            "publisher": {
              "@type": "Organization",
              "name": badge.productName ?? badge.builderName,
              "url": badge.productUrl,
            },
          }
        : {}),
    },
    null,
    2,
  );
  const reviewSnippet = `<script type="application/ld+json">
${reviewJsonLd}
</script>`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href={`/builder/${badge.slug}`}
            className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to badge
          </Link>
        </nav>

        <header className="mb-10 space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-2">
            <Code2 className="h-3 w-3" />
            Embed code
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Embed your Verified Builder badge.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Drop one of the snippets below into your product site, your
            README, your Notion page, or anywhere else you want to show that
            you shipped something real and a customer paid for it. Every
            embed links back to the Stripe-verified proof at{" "}
            <Link
              href={`/builder/${badge.slug}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {badgeUrl.replace(/^https?:\/\//, "")}
            </Link>
            .
          </p>
        </header>

        {/* ── Live preview of the card ──────────────────────────────── */}
        <section aria-labelledby="preview" className="mb-10">
          <h2
            id="preview"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Live preview
          </h2>
          <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider font-medium">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
              Verified Builder
            </div>
            <div className="font-semibold leading-snug">
              {badge.builderName} shipped {productLabel} and got paid for it.
            </div>
            <div className="text-xs text-muted-foreground">
              Verified by Stripe · {dateStr}
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* ── Snippet 0: SVG image (most portable embed) ───────────────
            Renders as a 600x80 image on any host that allows <img>:
            GitHub README, Substack, Medium, Reddit, Notion, every issue
            tracker. The SVG itself is served from /builder/<slug>/badge
            .svg with edge caching, so a paste in a popular README costs
            us roughly one Supabase round-trip per day per visitor pool. */}
        <section aria-labelledby="svg-html" className="mb-10 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="svg-html" className="text-xl font-bold">
              SVG image (HTML)
            </h2>
            <CopyButton text={svgHtmlSnippet} label="Copy HTML" />
          </div>
          <p className="text-sm text-muted-foreground">
            A self-contained SVG card – the most portable form. Renders
            identically on GitHub READMEs, Substack, Medium, Reddit,
            Notion, and any site that allows{" "}
            <code className="text-xs">&lt;img&gt;</code>. No host CSS, no
            JavaScript, no tracking.
          </p>
          <div className="rounded-md border bg-muted/40 p-4">
            <img
              src={svgUrl}
              alt={`Verified Builder – ${badge.builderName} shipped ${productLabel} and got paid for it. Verified by Stripe on ${dateStr}.`}
              width={600}
              height={80}
              className="block max-w-full h-auto"
            />
          </div>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{svgHtmlSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet 0b: SVG image markdown form ──────────────────────
            The form GitHub READMEs and any markdown-rendered host
            requires. `[![alt](image)](link)` is the only markdown
            grammar that produces a clickable image. Same SVG URL, same
            backlink semantics – the only difference is the wrapping
            grammar. */}
        <section aria-labelledby="svg-markdown" className="mb-10 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="svg-markdown" className="text-xl font-bold">
              SVG image (markdown)
            </h2>
            <CopyButton text={svgMarkdownSnippet} label="Copy markdown" />
          </div>
          <p className="text-sm text-muted-foreground">
            Drop this into your README.md, your Substack issue, your
            Notion page. Same SVG, same backlink relationship – the
            wrapping grammar is the only difference.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{svgMarkdownSnippet}</code>
          </pre>
        </section>

        <Separator className="my-8" />

        {/* ── Snippet A: HTML card ──────────────────────────────────── */}
        <section aria-labelledby="card-html" className="mb-10 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="card-html" className="text-xl font-bold">
              Card badge (HTML)
            </h2>
            <CopyButton text={cardSnippet} label="Copy HTML" />
          </div>
          <p className="text-sm text-muted-foreground">
            Self-contained inline-styled link. Works on any site, survives
            any host stylesheet, no JavaScript required.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{cardSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet B: plain HTML link ────────────────────────────── */}
        <section aria-labelledby="link-html" className="mb-10 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="link-html" className="text-xl font-bold">
              Plain link (HTML)
            </h2>
            <CopyButton text={linkSnippet} label="Copy HTML" />
          </div>
          <p className="text-sm text-muted-foreground">
            One-line link. Best for site footer rows or testimonial sections
            where you already have your own styling.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{linkSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet C: markdown ───────────────────────────────────── */}
        <section aria-labelledby="markdown-link" className="mb-10 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="markdown-link" className="text-xl font-bold">
              Markdown
            </h2>
            <CopyButton text={markdownSnippet} label="Copy markdown" />
          </div>
          <p className="text-sm text-muted-foreground">
            README files, Notion pages, Substack posts, GitHub repo
            descriptions – anywhere markdown is the host language.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{markdownSnippet}</code>
          </pre>
        </section>

        <Separator className="my-8" />

        {/* ── Snippet D: structured-data block (E-E-A-T amplifier) ─────
            Paste this on the same page as the badge. Google harvests
            schema.org Review nodes from third-party domains and resolves
            the `itemReviewed` @id back to the canonical Organization
            node at unlocksaas.com/#organization. The founder's own site
            now feeds Review schema to UnlockSaaS – the off-page E-E-A-T
            signal that no amount of on-page work can produce. Brunson
            Hard-Rule: no reviewRating (a 1-5 star claim implies a graded
            opinion; this is a verifiable cycle, not an opinion). */}
        <section aria-labelledby="review-jsonld" className="mb-10 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="review-jsonld" className="text-xl font-bold">
              Structured data (optional, advanced)
            </h2>
            <CopyButton text={reviewSnippet} label="Copy JSON-LD" />
          </div>
          <p className="text-sm text-muted-foreground">
            Paste this <code className="text-xs">&lt;script&gt;</code> tag
            on the same page as the badge above. It tells Google &amp;
            AI-Overview pipelines that you, by name, ran a Stripe-verified
            cycle. The Review block carries no rating – the badge is a
            verifiable fact, not a graded opinion – and never includes
            your email or any private metadata.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{reviewSnippet}</code>
          </pre>
        </section>

        <Separator className="my-8" />

        {/* ── Editorial notes ───────────────────────────────────────── */}
        <section
          aria-labelledby="notes"
          className="mb-10 space-y-3 text-sm text-muted-foreground leading-relaxed"
        >
          <h2
            id="notes"
            className="text-sm uppercase tracking-widest text-muted-foreground"
          >
            Editorial notes
          </h2>
          <p>
            <strong className="text-foreground">No tracking pixel.</strong>{" "}
            The embed is a plain link, not a script. Your visitors are not
            counted, profiled, or redirected through any third party.
          </p>
          <p>
            <strong className="text-foreground">No revocation if you
              refund.</strong>{" "}
            The customer who paid was real even if they later left. The badge
            keeps reading the same way unless you flip your profile to
            private in your{" "}
            <Link
              href="/playbook"
              className="underline underline-offset-4 hover:text-foreground"
            >
              member area
            </Link>
            .
          </p>
          <p>
            <strong className="text-foreground">
              Honest backlink relationship.
            </strong>{" "}
            The badge carries{" "}
            <code className="text-xs">rel=&quot;external&quot;</code> – not{" "}
            <code className="text-xs">nofollow</code> – because the
            relationship is a real editorial link, not a paid placement or a
            reciprocal-link scheme.
          </p>
        </section>
      </main>
    </div>
  );
}

/**
 * Minimal HTML escape for builder/product names that land in the embed
 * HTML. Builder names are user-controlled; treat as untrusted even though
 * the same names are also rendered in JSX elsewhere (which React escapes
 * automatically). Inline embeds bypass JSX escaping, so this guard is
 * necessary.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
