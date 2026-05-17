import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  OrganizationJsonLd,
  PersonJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import {
  BASE_URL,
  FOUNDER,
  ORGANIZATION,
  ALTERNATE_NAMES,
} from "@/lib/seo/entity";

/**
 * Press / media kit page.
 *
 * Why this surface exists (off-page lift):
 *   Journalists, podcasters, indie-hacker newsletter writers, and AI
 *   summarisers all look for a `/press` or `/media-kit` page before they
 *   decide whether they can write the piece. Without it, the typical
 *   reference is one paragraph the writer drafts from a Twitter bio,
 *   which means a coin-flip on whether the brand name even appears
 *   correctly. With this page, the writer copies 50/100/200-word
 *   descriptions verbatim, links to the founder bio and the company
 *   facts, and the citation is canonical.
 *
 *   This is one of the few backlink-adjacent surfaces a pre-launch
 *   single-founder SaaS can ship without violating the Brunson
 *   Hard-Rule. Every fact below is independently verifiable on the
 *   live site, in Stripe, in DNS, or in the strategy folder. Nothing
 *   is invented for promotional gloss.
 *
 * Voice: matter-of-fact, third-person where it serves the writer, no
 * Reluctant-Hero parable beats (those live on /about). A press kit is
 * a reference document, not a sales page.
 *
 * Schema: ProfilePage-style render — Organization + Person + BreadcrumbList
 * cross-linked via the canonical @id graph in lib/seo/entity.ts. The
 * Organization block is the same one used on the funnel hub; declaring it
 * here gives the press page its own entity anchor without duplicating
 * data.
 */
export const metadata: Metadata = {
  title: "Press and Media Kit – Unlock SaaS",
  description:
    "Brand facts, founder bio, descriptions in three lengths, and contact details for journalists, podcasters, and newsletter writers covering Unlock SaaS.",
  alternates: markdownAlternate("/press", "/press.md"),
  openGraph: {
    type: "website",
    title: "Press and Media Kit – Unlock SaaS",
    description:
      "Brand facts, founder bio, descriptions, and contact details for media coverage of Unlock SaaS.",
    url: "/press",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary",
    title: "Press and Media Kit – Unlock SaaS",
    description:
      "Brand facts, founder bio, descriptions, and contact for media coverage of Unlock SaaS.",
  },
  robots: { index: true, follow: true },
};

// Pure static – no per-request inputs.
export const dynamic = "force-static";

const TRAIL = [
  { name: "Unlock SaaS", url: `${BASE_URL}/` },
  { name: "Press", url: `${BASE_URL}/press` },
] as const;

/**
 * The three canonical descriptions. Length-tuned so a writer can paste
 * the right one for their format without rewriting. Every sentence is
 * present, verbatim or near-verbatim, on the funnel hub or /about.
 */
const DESCRIPTION_50 =
  "Unlock SaaS is a guided seven-step playbook that turns an already-shipped product into a verified paying customer in 60 days, or the founder does not pay. Built by a non-engineer marketer for non-engineer founders shipping with AI tools.";

const DESCRIPTION_100 =
  "Unlock SaaS is a guided seven-step playbook for post-launch pre-revenue founders. It names one real customer, writes one real promise, sends one real message, and verifies every step inside Stripe. Built by Maryan, a marketer (not an engineer), for non-engineer founders who shipped with Lovable, Claude, Cursor, v0, or Bolt and are now staring at a flat Stripe line. Sixty-day money-back guarantee tied to the first verified Stripe payment – refund automatic if no paying customer arrives.";

const DESCRIPTION_200 =
  "Unlock SaaS is a guided seven-step playbook for post-launch pre-revenue founders who shipped a product with AI tools and have no paying customers. It refuses to let the founder skip the work that actually gets them paid: pin one real person, write one real promise, send one real message, and verify every step inside Stripe. The free Launch Diagnostic labels what is broken on the live page with one of three diagnoses – Wrong Person, Weak Offer, or Weak Belief – and hands the founder the specific next step. The $1 Starter unlocks Playbook Steps 1 and 2. The full $49-per-month Playbook covers the entire seven-step system. If no verified paying customer arrives in sixty days, the subscription is refunded automatically – the guarantee is wired into the product, not into a PDF. Built by Maryan, a marketer (not an engineer), who shipped a dozen AI-assisted products, watched them flatline in Stripe, and built the playbook he wished someone had handed him.";

// Brand assets the operator publishes for re-use. Every URL below is a
// live, indexable surface – no broken links or placeholder paths.
const BRAND_ASSETS: ReadonlyArray<{
  label: string;
  href: string;
  note: string;
}> = [
  {
    label: "Logo / favicon (PNG, served by the canonical /icon route)",
    href: `${BASE_URL}/icon`,
    note: "Next.js dynamic icon. Same image used in the address bar and OG cards.",
  },
  {
    label: "Default Open Graph card",
    href: `${BASE_URL}/opengraph-image`,
    note: "1200×630 PNG. Use this when embedding the homepage in a story.",
  },
  {
    label: "Canonical funnel hub",
    href: `${BASE_URL}/`,
    note: "The page to link in a story.",
  },
  {
    label: "Founder bio (long form)",
    href: `${BASE_URL}/about`,
    note: "Reluctant-Hero voice. Drawn from the founder VSL script.",
  },
  {
    label: "Free Launch Diagnostic (cite-worthy interactive surface)",
    href: `${BASE_URL}/diagnostic`,
    note: "Paste a product URL, get a labeled diagnosis in about 90 seconds. No card.",
  },
  {
    label: "Long-form stories (free, no email gate)",
    href: `${BASE_URL}/stories`,
    note: "Five long-form essays on the work non-engineer founders skip.",
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/* Organization + Person are anchored via @id in the canonical
          entity graph (lib/seo/entity.ts). Declaring them here gives the
          press page its own snapshot of the same nodes – schema.org's
          documented pattern for distributed-but-coherent entity claims. */}
      <OrganizationJsonLd />
      <PersonJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />

      <article className="max-w-2xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Press</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Press and media kit
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Brand facts, descriptions, and contact for coverage of Unlock SaaS.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Everything below is published for re-use by journalists, podcast
            hosts, newsletter writers, and AI summarisers. Copy any block
            verbatim. No permission required for editorial coverage. Every
            fact on this page is independently verifiable on the live site.
          </p>
        </header>

        <Separator className="my-8" />

        {/* ── Fast facts ────────────────────────────────────────────── */}
        <section
          aria-labelledby="facts"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="facts" className="text-2xl font-bold">
            Fast facts
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{ORGANIZATION.name}</dd>

            <dt className="text-muted-foreground">Alternate spellings</dt>
            <dd className="font-medium">{ALTERNATE_NAMES.join(", ")}</dd>

            <dt className="text-muted-foreground">Founder</dt>
            <dd className="font-medium">
              {FOUNDER.name} ({FOUNDER.jobTitle})
            </dd>

            <dt className="text-muted-foreground">Founded</dt>
            <dd className="font-medium">{ORGANIZATION.foundingDate}</dd>

            <dt className="text-muted-foreground">Area served</dt>
            <dd className="font-medium">{ORGANIZATION.areaServed}</dd>

            <dt className="text-muted-foreground">Slogan</dt>
            <dd className="font-medium">{ORGANIZATION.slogan}</dd>

            <dt className="text-muted-foreground">Press contact</dt>
            <dd className="font-medium">
              <a
                href={`mailto:${FOUNDER.email}?subject=Press%20inquiry%20–%20Unlock%20SaaS`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {FOUNDER.email}
              </a>
            </dd>

            <dt className="text-muted-foreground">Web</dt>
            <dd className="font-medium">
              <a
                href={BASE_URL}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {BASE_URL.replace(/^https:\/\//, "")}
              </a>
            </dd>
          </dl>
        </section>

        <Separator className="my-8" />

        {/* ── Descriptions in three lengths ─────────────────────────── */}
        <section
          aria-labelledby="descriptions"
          className="mb-10 space-y-6 text-base leading-relaxed"
        >
          <h2 id="descriptions" className="text-2xl font-bold">
            Descriptions (copy verbatim)
          </h2>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              50 words – tweet, capsule, sidebar
            </p>
            <blockquote className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
              {DESCRIPTION_50}
            </blockquote>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              100 words – podcast intro, newsletter blurb
            </p>
            <blockquote className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
              {DESCRIPTION_100}
            </blockquote>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              200 words – feature lede, profile opener
            </p>
            <blockquote className="rounded-md border bg-muted/40 p-4 text-sm leading-relaxed">
              {DESCRIPTION_200}
            </blockquote>
          </div>
        </section>

        <Separator className="my-8" />

        {/* ── Founder bio ───────────────────────────────────────────── */}
        <section
          aria-labelledby="founder"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="founder" className="text-2xl font-bold">
            Founder bio
          </h2>
          <p>
            <strong>{FOUNDER.name}</strong> – {FOUNDER.description}
          </p>
          <p className="text-sm text-muted-foreground">
            Long-form bio in the founder&rsquo;s own voice:{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {BASE_URL.replace(/^https:\/\//, "")}/about
            </Link>
          </p>
        </section>

        <Separator className="my-8" />

        {/* ── Topical expertise ─────────────────────────────────────── */}
        <section
          aria-labelledby="expertise"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="expertise" className="text-2xl font-bold">
            Topical expertise (for interview prep)
          </h2>
          <p className="text-muted-foreground">
            Subjects the founder can speak to without notes, anchored to
            shipped strategy documents and the locked workbook set:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>
              Post-launch pre-revenue SaaS founder activation – the work
              non-engineer founders skip.
            </li>
            <li>
              Russell Brunson sales funnel design (DotCom, Expert, Traffic
              Secrets) applied to micro-SaaS.
            </li>
            <li>
              Honest competitor comparison editorial standards (the
              &ldquo;Brunson Hard-Rule&rdquo; for fabrication-free marketing
              claims).
            </li>
            <li>
              Stripe-verified founder validation – why self-reported customer
              counts are worth nothing.
            </li>
            <li>
              Money-back guarantee mechanics for digital products – guarantees
              wired into the product, not the PDF.
            </li>
            <li>
              Non-engineer founder workflows with AI tools (Lovable, v0,
              Bolt.new, Cursor, Claude Code, Replit).
            </li>
            <li>
              Soap Opera Sequence and Seinfeld daily email marketing for indie
              SaaS.
            </li>
            <li>
              Dream 100 outreach strategy adapted for one-founder distribution.
            </li>
            <li>
              Programmatic SEO for indie SaaS that respects the
              Brunson Hard-Rule.
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        {/* ── Brand assets ──────────────────────────────────────────── */}
        <section
          aria-labelledby="assets"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="assets" className="text-2xl font-bold">
            Brand assets and link targets
          </h2>
          <p className="text-muted-foreground">
            Use the canonical URLs below when linking. The OG card auto-renders
            for any page on the site, so a story that links to{" "}
            <code className="text-xs">{BASE_URL}/diagnostic</code> picks up the
            page-specific card without any extra work on the writer&rsquo;s
            side.
          </p>
          <ul className="space-y-3 text-sm">
            {BRAND_ASSETS.map((a) => (
              <li key={a.href} className="space-y-1">
                <a
                  href={a.href}
                  className="font-medium underline underline-offset-4 hover:text-foreground"
                  rel="bookmark"
                >
                  {a.label}
                </a>
                <p className="text-muted-foreground">{a.note}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {a.href}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* ── Coverage policy ───────────────────────────────────────── */}
        <section
          aria-labelledby="policy"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="policy" className="text-2xl font-bold">
            Editorial policy and coverage rules
          </h2>
          <p>
            No embargoes, no exclusivity asks, no &ldquo;please send me the
            piece before publication.&rdquo; If you can verify the claim, you
            can publish it.
          </p>
          <p>
            We do not publish customer testimonials, screenshots, or
            aggregate ratings until they correspond to a verified paying
            customer cycle in Stripe. If you ask the founder for proof
            numbers, you will be handed either a real verified-by-Stripe
            count or the honest empty-state copy. There is no third option.
          </p>
          <p>
            Comparison pages on the site name real competitors and respect
            their value propositions. Every entry has a{" "}
            <code className="text-xs">lastVerified</code> date in the footer.
            Quote them freely – none of the copy was AI-paraphrased from the
            competitor&rsquo;s own site.
          </p>
        </section>

        <Separator className="my-8" />

        {/* ── Recent coverage (honest empty until 3+) ───────────────── */}
        <section
          aria-labelledby="coverage"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="coverage" className="text-2xl font-bold">
            Recent coverage
          </h2>
          <p className="text-muted-foreground italic">
            Nowhere yet. The founder is pre-launch. When real coverage lands,
            it appears on the funnel hub&rsquo;s media bar and is also listed
            here in reverse-chronological order. No fake logos, no &ldquo;as
            seen in&rdquo; placeholders – the empty state is the honest state.
          </p>
        </section>

        <Separator className="my-8" />

        {/* ── How to reach me ───────────────────────────────────────── */}
        <section
          aria-labelledby="contact"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="contact" className="text-2xl font-bold">
            Reach the founder
          </h2>
          <p>
            For interviews, podcast appearances, fact checks, or quote
            requests, email{" "}
            <a
              href={`mailto:${FOUNDER.email}?subject=Press%20inquiry%20–%20Unlock%20SaaS`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {FOUNDER.email}
            </a>
            . One inbox, one human, real replies. Time zone: EU. Typical
            response window: within one business day.
          </p>
        </section>

        <div className="mt-12 text-xs text-muted-foreground">
          <p>
            Related surfaces:{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              About the founder
            </Link>{" "}
            ·{" "}
            <Link
              href="/stories"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Five Stories
            </Link>{" "}
            ·{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact
            </Link>{" "}
            ·{" "}
            <Link
              href="/press.md"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Markdown mirror
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
