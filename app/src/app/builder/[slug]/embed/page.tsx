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
