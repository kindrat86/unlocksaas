/**
 * Verified Builder embed-code helper page.
 *
 * Why this exists (off-page lift):
 *   Every Verified Builder is the post-launch proof point UnlockSaaS relies
 *   on for E-E-A-T. When a verified founder embeds their badge on their own
 *   product site, README, or testimonial wall, that becomes a real
 *   editorial backlink to /builder/<slug> AND ships a Review JSON-LD
 *   node that Google can harvest on the founder's domain. The Review
 *   resolves `itemReviewed.@id` back to the unlocksaas Playbook
 *   SoftwareApplication; over time, the citation graph compounds.
 *
 *   This page is the founder-facing "copy this snippet" surface. It is a
 *   tool, not editorial content — robots:noindex, never indexed.
 *
 * Snippets shipped here (in priority order):
 *
 *   1. The canonical bundle: <a rel="me external"> wrapping the SVG badge,
 *      plus a sibling <script type="application/ld+json"> with the Review
 *      payload. This is the snippet to use on a personal site / product
 *      homepage / portfolio. One copy, three signals (backlink, identity
 *      via rel="me", structured-data review).
 *
 *   2. The iframe variant: <iframe src=".../embed.html">. For Notion,
 *      Substack, Webflow CMS fields, Ghost, any host that only allows
 *      iframes. The iframe document itself contains both the link and the
 *      Review JSON-LD, so the signal chain survives the iframe boundary.
 *
 *   3. The plain-link variant: <a href=".../builder/<slug>" rel="me external">
 *      with text only. For testimonial footer rows that already have
 *      their own visual style.
 *
 *   4. The markdown variant: for READMEs, Notion pages, Substack posts,
 *      and any markdown host.
 *
 *   5. The JSON-LD-only variant: just the <script type="application/ld+json">
 *      Review block. For founders who already have their own visual
 *      testimonial section and only want to add the structured-data
 *      citation. Sourced from /builder/<slug>/review.json so the schema
 *      stays in sync with what the canonical badge surface emits.
 *
 *   6. The image-only variant: a bare <img src=".../badge.svg"> with
 *      anchor + rel attributes documented separately, for advanced users
 *      who want full control of the surrounding markup.
 *
 *   7. The oEmbed discovery anchor URL: documented for advanced hosts
 *      that consume oEmbed (Substack, Ghost, Medium auto-render).
 *
 * Editorial discipline:
 *   No tracking pixel. No JavaScript. No third-party requests except the
 *   stable badge SVG and oembed.json endpoints on unlocksaas.com. Every
 *   snippet survives any host stylesheet because styles are inline.
 */
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge, absoluteBadgeUrl } from "@/lib/builder-badge";
import { buildReviewJsonLd } from "@/lib/seo/builder-review";
import { ArrowLeft, CheckCircle2, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CopyButton } from "@/components/copy-button";


const BASE = "https://unlocksaas.com";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Cached badge lookup tagged by slug.
 *
 * Service-role Supabase reads (no cookies/headers) are safe inside `'use cache'`.
 * Tag `builder:${slug}` lets the verified-conversion webhook target an exact
 * builder page for invalidation: `revalidateTag('builder:tally', 'max')`.
 * Without the tag a builder edit would have to wait for the 1-hour
 * cacheLife window or trigger a full deploy.
 */
async function getBadge(slug: string) {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag(`builder:${slug}`);
  return loadPublicBadge(createAdminClient(), slug);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const badge = await getBadge(params.slug);
  if (!badge) {
    return {
      title: "Verified Builder embed",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Embed code – ${badge.builderName} (Verified Builder)`,
    description: `Copy-paste HTML and JSON-LD to embed ${badge.builderName}'s Verified Builder badge on any site. Every snippet links to the canonical Stripe-verified proof page on unlocksaas.com.`,
    // index:false is correct: this is a tool surface for the verified
    // builder. The canonical badge at /builder/<slug> is the indexable
    // page; this one shipping into Google would create duplicate-intent
    // results for the same query.
    robots: { index: false, follow: false },
  };
}

export default function EmbedPage(props: Props) {
  return (
    <Suspense fallback={null}>
      <EmbedPageBody params={props.params} />
    </Suspense>
  );
}

async function EmbedPageBody({ params: paramsP }: { params: Props["params"] }) {
  const params = await paramsP;
  const badge = await getBadge(params.slug);
  if (!badge) notFound();

  const badgeUrl = absoluteBadgeUrl(badge.slug);
  const svgUrl = `${BASE}/builder/${badge.slug}/badge.svg`;
  const reviewJsonUrl = `${BASE}/builder/${badge.slug}/review.json`;
  const embedHtmlUrl = `${BASE}/builder/${badge.slug}/embed.html`;
  const oembedUrl = `${BASE}/builder/${badge.slug}/oembed.json`;
  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const productLabel = badge.productName ?? "their product";
  const altText = `Stripe-Verified First Customer · Unlock SaaS · ${badge.builderName}`;

  // Pre-built Review JSON-LD payload, formatted for human readability when
  // the founder pastes it into their site source.
  const reviewJsonPretty = JSON.stringify(buildReviewJsonLd(badge), null, 2);

  // ── Snippet 1: canonical bundle ─────────────────────────────────────────
  // The user's "all three signals in one paste" snippet. Anchor with
  // rel="me external" carries identity verification + outbound-editorial
  // semantics. Img is the hot-linked SVG (no host CSS needed). Script
  // ships the Review JSON-LD inline. Pasted into a homepage or footer,
  // this single block gives Google a backlink, identity reciprocity,
  // and a third-party Review citation in one trip.
  const canonicalSnippet = `<a href="${badgeUrl}" rel="me external">
  <img src="${svgUrl}" alt="${escapeAttr(altText)}" width="360" height="80" loading="lazy" decoding="async" style="border:0;max-width:100%;height:auto" />
</a>
<script type="application/ld+json">
${reviewJsonPretty}
</script>`;

  // ── Snippet 2: iframe variant ───────────────────────────────────────────
  const iframeSnippet = `<iframe src="${embedHtmlUrl}" title="${escapeAttr(badge.builderName)} — Verified Builder" width="360" height="140" frameborder="0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="border:0;max-width:100%"></iframe>`;

  // ── Snippet 3: card badge inline-styled (legacy from prior version) ─────
  const cardSnippet = `<a href="${badgeUrl}" rel="me external" style="display:inline-block;text-decoration:none;color:inherit;font:14px/1.4 system-ui,sans-serif;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;background:#fff;max-width:320px">
  <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#6b7280;margin-bottom:6px">✓ Verified Builder</div>
  <div style="font-weight:600;color:#111827;margin-bottom:2px">${escapeHtml(badge.builderName)} shipped ${escapeHtml(productLabel)} and got paid for it.</div>
  <div style="font-size:12px;color:#6b7280">Verified by Stripe · ${dateStr}</div>
</a>`;

  // ── Snippet 4: plain link ───────────────────────────────────────────────
  const linkSnippet = `<a href="${badgeUrl}" rel="me external">✓ Verified Builder – ${escapeHtml(badge.builderName)} on Unlock SaaS</a>`;

  // ── Snippet 5: markdown ─────────────────────────────────────────────────
  const markdownSnippet = `[![✓ Verified Builder – ${badge.builderName} on Unlock SaaS](${svgUrl})](${badgeUrl})`;

  // ── Snippet 6: JSON-LD only ─────────────────────────────────────────────
  const jsonLdOnlySnippet = `<script type="application/ld+json">
${reviewJsonPretty}
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
            Three signals in one paste: a backlink, an identity link, and a
            structured-data review. Drop the canonical snippet below into your
            product site or portfolio, or pick a variant that fits the host.
            Every embed points at the Stripe-verified proof at{" "}
            <Link
              href={`/builder/${badge.slug}`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {badgeUrl.replace(/^https?:\/\//, "")}
            </Link>
            .
          </p>
        </header>

        {/* ── Live preview of the SVG badge ──────────────────────────── */}
        <section aria-labelledby="preview" className="mb-10">
          <h2
            id="preview"
            className="text-sm uppercase tracking-widest text-muted-foreground mb-4"
          >
            Live preview
          </h2>
          <div className="rounded-2xl border bg-card p-6 sm:p-8 space-y-4 shadow-sm">
            {/* The very same SVG the embed serves. Hot-linked, not bundled. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={svgUrl}
              alt={altText}
              width={360}
              height={80}
              loading="lazy"
              decoding="async"
              style={{ border: 0, maxWidth: "100%", height: "auto" }}
            />
            <div className="text-xs text-muted-foreground">
              SVG renders crisply at any size. The clickable target is the
              surrounding anchor — the badge image itself is decorative.
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* ── Snippet 1: canonical bundle ────────────────────────────── */}
        <section aria-labelledby="canonical" className="mb-12 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="canonical" className="text-xl font-bold">
              Canonical snippet (recommended)
            </h2>
            <CopyButton text={canonicalSnippet} label="Copy snippet" />
          </div>
          <p className="text-sm text-muted-foreground">
            Three signals in one paste:{" "}
            <code className="text-xs">rel=&quot;me&quot;</code> identity
            link, <code className="text-xs">&lt;img&gt;</code> badge served
            from our edge, and a{" "}
            <code className="text-xs">
              &lt;script type=&quot;application/ld+json&quot;&gt;
            </code>{" "}
            Review block. Paste both blocks adjacent to each other in your
            page source. The image is hot-linked from our edge cache, so
            updates propagate without you re-copying anything.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{canonicalSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet 2: iframe ──────────────────────────────────────── */}
        <section aria-labelledby="iframe" className="mb-12 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="iframe" className="text-xl font-bold">
              Iframe (Notion, Substack, Ghost, Webflow CMS)
            </h2>
            <CopyButton text={iframeSnippet} label="Copy HTML" />
          </div>
          <p className="text-sm text-muted-foreground">
            For hosts that only allow iframe embeds. The iframe document
            ships both the link and the Review JSON-LD inside it, so the
            signal chain survives the iframe boundary on every crawler that
            indexes iframe contents.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{iframeSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet 3: card badge ──────────────────────────────────── */}
        <section aria-labelledby="card-html" className="mb-12 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="card-html" className="text-xl font-bold">
              Card badge (inline-styled HTML)
            </h2>
            <CopyButton text={cardSnippet} label="Copy HTML" />
          </div>
          <p className="text-sm text-muted-foreground">
            Self-contained inline-styled link. Works on any site, survives
            any host stylesheet, no JavaScript required, no external image
            fetched. Best when you want a card that matches a minimal site
            without depending on our SVG endpoint.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{cardSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet 4: plain link ──────────────────────────────────── */}
        <section aria-labelledby="link-html" className="mb-12 space-y-3">
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

        {/* ── Snippet 5: markdown ────────────────────────────────────── */}
        <section aria-labelledby="markdown-link" className="mb-12 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="markdown-link" className="text-xl font-bold">
              Markdown
            </h2>
            <CopyButton text={markdownSnippet} label="Copy markdown" />
          </div>
          <p className="text-sm text-muted-foreground">
            For README files, Notion pages, Substack posts, GitHub repo
            descriptions, and anywhere markdown is the host language.
            Renders the SVG badge wrapped in the canonical link.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{markdownSnippet}</code>
          </pre>
        </section>

        {/* ── Snippet 6: JSON-LD only ────────────────────────────────── */}
        <section aria-labelledby="jsonld-only" className="mb-12 space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="jsonld-only" className="text-xl font-bold">
              Review JSON-LD only
            </h2>
            <CopyButton text={jsonLdOnlySnippet} label="Copy JSON-LD" />
          </div>
          <p className="text-sm text-muted-foreground">
            Just the structured-data block. Use this when you already have
            your own testimonial section and only want to add the citation
            signal. Paste anywhere inside <code className="text-xs">&lt;head&gt;</code>{" "}
            or before the closing <code className="text-xs">&lt;/body&gt;</code>{" "}
            tag. Same payload is served at{" "}
            <a
              href={reviewJsonUrl}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {reviewJsonUrl.replace(/^https?:\/\//, "")}
            </a>{" "}
            for server-side template inlining.
          </p>
          <pre className="text-xs sm:text-sm overflow-x-auto rounded-md border bg-muted/40 p-4 leading-snug">
            <code>{jsonLdOnlySnippet}</code>
          </pre>
        </section>

        <Separator className="my-8" />

        {/* ── Reference URLs ─────────────────────────────────────────── */}
        <section
          aria-labelledby="reference-urls"
          className="mb-10 space-y-4 text-sm"
        >
          <h2
            id="reference-urls"
            className="text-sm uppercase tracking-widest text-muted-foreground"
          >
            Reference URLs
          </h2>
          <dl className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <dt className="font-semibold w-40 shrink-0">Canonical badge</dt>
              <dd className="text-muted-foreground break-all">
                <a className="underline underline-offset-4" href={badgeUrl}>
                  {badgeUrl}
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <dt className="font-semibold w-40 shrink-0">SVG badge</dt>
              <dd className="text-muted-foreground break-all">
                <a className="underline underline-offset-4" href={svgUrl}>
                  {svgUrl}
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <dt className="font-semibold w-40 shrink-0">Review JSON-LD</dt>
              <dd className="text-muted-foreground break-all">
                <a
                  className="underline underline-offset-4"
                  href={reviewJsonUrl}
                >
                  {reviewJsonUrl}
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <dt className="font-semibold w-40 shrink-0">Iframe payload</dt>
              <dd className="text-muted-foreground break-all">
                <a className="underline underline-offset-4" href={embedHtmlUrl}>
                  {embedHtmlUrl}
                </a>
              </dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <dt className="font-semibold w-40 shrink-0">oEmbed discovery</dt>
              <dd className="text-muted-foreground break-all">
                <a className="underline underline-offset-4" href={oembedUrl}>
                  {oembedUrl}
                </a>
              </dd>
            </div>
          </dl>
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
            The embed is a plain link plus an SVG image plus an inline
            JSON-LD block. Your visitors are not counted, profiled, or
            redirected through any third party.
          </p>
          <p>
            <strong className="text-foreground">
              Identity link, not a link-spam relationship.
            </strong>{" "}
            The anchor uses <code className="text-xs">rel=&quot;me external&quot;</code>{" "}
            – the IndieWeb identity-verification relationship plus the
            outbound-editorial relationship. Mastodon profile-link
            verification and IndieAuth both honor reciprocal{" "}
            <code className="text-xs">rel=&quot;me&quot;</code> when our
            canonical badge page reciprocates by linking back to your
            product URL with the same attribute (we do, automatically, when
            your profile has a productUrl set).
          </p>
          <p>
            <strong className="text-foreground">
              Honest Review JSON-LD.
            </strong>{" "}
            The Review schema declares{" "}
            <code className="text-xs">reviewRating: 5</code> with the
            documented semantics &quot;Verified outcome: first paying
            customer on a connected Stripe account.&quot; This is a binary
            verification fact, not a satisfaction score — the rating
            reflects the Stripe verification, not speculation about how
            you feel. You consented to public verification when you flipped
            your badge to public.
          </p>
          <p>
            <strong className="text-foreground">No revocation if you
              refund.</strong>{" "}
            The customer who paid was real even if they later left. The
            badge keeps reading the same way unless you flip your profile
            to private in your{" "}
            <Link
              href="/playbook"
              className="underline underline-offset-4 hover:text-foreground"
            >
              member area
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}

/**
 * Minimal HTML escape for user-controlled fields rendered inside inline
 * embed snippets. The JSX paths above are React-escaped automatically;
 * these helpers exist because the inline embed strings bypass JSX.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
