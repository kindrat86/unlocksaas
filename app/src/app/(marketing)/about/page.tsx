import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  PersonJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";
import { FOUNDER_WORK_EXAMPLES } from "@/lib/seo/founder-works";
import { ID, ORGANIZATION } from "@/lib/seo/entity";

/**
 * About page. E-E-A-T author anchor for the whole site.
 *
 * Why this page exists (and is short):
 *   Google's quality raters and LLM citation pipelines both look for an
 *   "about the author/operator" surface to bind claims to a real, named,
 *   contactable Person entity. Without it, Organization is anchored to
 *   nothing — empty `sameAs` and a name in a footer.
 *
 * Voice: Reluctant Hero. Same beats as strategy/founder-vsl-script.md
 * (confession → flat line → epiphany → manifesto) but compressed for cold
 * Google traffic that did not arrive expecting a VSL. No new claims; every
 * sentence here either appears in the VSL or is implied by the locked
 * state.json. Brunson Hard-Rule (honest claims): no fabricated credentials.
 *
 * Schema: Person (canonical here via mainEntityOfPage = ProfilePage) +
 * BreadcrumbList.
 */
export const metadata: Metadata = {
  title: "About Maryan",
  description:
    "I'm a marketer. I never wrote a line of production code. Then Lovable and Claude let me ship – and now I have fifteen years of Brunson-style funnels plus a real shipped product in one head. Almost nobody in the post-launch pre-revenue niche has both.",
  // markdownAlternate emits canonical + per-page hreflang + the
  // `text/markdown` content-type alternate pointing at /about.md (the
  // playbook-readable mirror for retrieval pipelines that prefer markdown
  // over JS-rendered HTML).
  alternates: markdownAlternate("/about", "/about.md"),
  openGraph: {
    type: "profile",
    title: "About Maryan",
    description:
      "Funnel marketer + non-engineer who shipped a real AI product. Almost nobody in the post-launch pre-revenue niche has both, in one head.",
    url: "/about",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary",
    title: "About Maryan",
    description:
      "Funnel marketer + non-engineer who shipped a real AI product. Builder of Unlock SaaS.",
  },
  robots: { index: true, follow: true },
};

// Pure static surface — no per-request data, no cookies, no auth gating.
// Pre-rendered at build time, served from the CDN edge.

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "About", url: "https://unlocksaas.com/about" },
] as const;

// --- JSON-LD: Organization + ContactPoint + AboutPage (module-hoisted) ---
const BASE = "https://unlocksaas.com";
const ABOUT_ORG_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ID.organization,
      name: ORGANIZATION.name,
      url: BASE,
      logo: `${BASE}/icon.svg`,
      description: ORGANIZATION.description,
      slogan: ORGANIZATION.slogan,
      foundingDate: ORGANIZATION.foundingDate,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "hello@unlocksaas.com",
        url: `${BASE}/contact`,
      },
    },
    {
      "@type": "AboutPage",
      "@id": `${BASE}/about`,
      url: `${BASE}/about`,
      name: "About Unlock SaaS",
      description:
        "Unlock SaaS is a SaaS launch toolkit and community — alternatives directory, launch checklist, SaaS mistakes guide, revenue projector, LTV calculator, and the SaaS playbook.",
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.organization },
      mainEntity: { "@id": ID.person },
    },
  ],
});

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <PersonJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ABOUT_ORG_JSON }}
      />

      <article className="max-w-2xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>About</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            About the operator
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            I&rsquo;m a marketer. I have never written a line of production code.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            That sentence used to close a door. In 2026, Lovable and Claude
            opened it. The shipping part felt like magic. What came after did
            not.
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 prose-like space-y-4 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">The flat line</h2>
          <p>
            I&rsquo;d launch. I&rsquo;d open Stripe. And I&rsquo;d watch a line
            lie flat. Twelve users. Two paying. A handful of comments that said
            &ldquo;this is awesome&rdquo; from people who&rsquo;d never reach
            for a card.
          </p>
          <p>
            I told myself it was the product. I told myself the funnel was
            leaking. I went embarrassingly deep into SEO, AEO, GEO. I got good
            at being found. The truth I would not say out loud, for almost a
            year, was that learning more about traffic wasn&rsquo;t solving my
            problem. It was a respectable way of never looking at the flat
            line.
          </p>
        </section>

        <section className="mb-10 prose-like space-y-4 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">The break</h2>
          <p>
            What finally broke me wasn&rsquo;t the dashboard. It was sitting
            with more than ten other founders and hearing my own story back.
            Every single time.
          </p>
          <p>
            Halfway through call six, I had to mute. Get up. Walk around the
            room. A small cold voice said: <em>that is you. He is describing
            you.</em>
          </p>
          <p>
            That was the night I sat down to write the offer for this product
            and found nothing on the page. I&rsquo;d been building beautiful
            things for no one in particular and acting surprised when no one
            paid.
          </p>
        </section>

        {/* ── The weird mix ───────────────────────────────────────
            Cross-section frame (Greg Isenberg's "weird mix of skills
            is your moat" overlay applied to the locked Reluctant Hero
            backstory). Surfaces the Brunson-funnels + vibe-coded-product
            combination as the actual credibility wedge, in
            Reluctant Hero voice (confess the combination, never boast
            it). Voice and constraints recorded in
            strategy/state.json attractive_character.locked.cross_section_frame
            and mirrored in strategy/founder-vsl-script.md Beat 3.5. */}
        <section className="mb-10 prose-like space-y-4 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">The weird mix</h2>
          <p>
            I&rsquo;m not a marketer who picked up code. I&rsquo;m not an
            engineer who learned marketing. I&rsquo;m a marketer who spent
            fifteen years inside Brunson-style funnels – and the day Lovable
            and Claude let me ship without an engineer, I did.
          </p>
          <p>
            In the post-launch pre-revenue non-engineer niche, that
            combination is almost nobody. I am not saying that to brag. I am
            saying it because it is the only reason the work I&rsquo;m about
            to put in front of you reads different from playbooks written by
            people who never shipped a product, and different from
            build-in-public threads by people who never wrote a real offer.
          </p>
          <p>
            If you are a non-engineer who shipped something real with AI
            tools and is now staring at a flat Stripe line, I have stood
            exactly where you are standing, with one foot in each world.
          </p>
        </section>

        <section className="mb-10 prose-like space-y-4 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">What I&rsquo;m building</h2>
          <p>
            <strong>Unlock SaaS</strong> is a playbook that turns an
            already-shipped SaaS into a verified paying customer in sixty days.
            It refuses to let you skip the work that actually gets you paid:
            name one real person, write one real promise, send one real
            message, watch Stripe.
          </p>
          <p>
            If the playbook does not produce a verified paying customer in sixty
            days, you do not pay. The guarantee is wired into the product, not
            into a PDF.
          </p>
        </section>

        <section className="mb-10 prose-like space-y-4 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">Who this is for</h2>
          <p>
            Post-launch, pre-revenue, non-engineer founders who shipped
            something real with AI tools and are now staring at a flat Stripe
            line. If that&rsquo;s you, you are exactly who I built this for.
          </p>
        </section>

        <Separator className="my-8" />

        {/* ── Body of work ─────────────────────────────────────────
            Surfaces the founder's shipped artifacts so the bio is
            anchored to verifiable public works, not just narrative.
            Reads from FOUNDER_WORK_EXAMPLES (lib/seo/founder-works.ts);
            every entry resolves to a live URL on this domain or a
            verified off-platform mirror (Zenodo DOI, HuggingFace).
            Same registry the Person.workExample JSON-LD emits, so the
            rendered list and the structured data stay in sync. */}
        <section
          className="mb-10 prose-like space-y-4 text-base leading-relaxed"
          aria-labelledby="body-of-work-about"
        >
          <h2 id="body-of-work-about" className="text-2xl font-bold">
            What I&rsquo;ve actually shipped
          </h2>
          <p>
            Not awards. Not certifications. Real public artifacts you
            can open in a tab and read end-to-end:
          </p>
          <ul className="space-y-2 text-sm list-none pl-0">
            {FOUNDER_WORK_EXAMPLES.map((w) => (
              <li key={w.url} className="leading-relaxed">
                <a
                  href={w.url}
                  className="font-medium underline underline-offset-4 hover:text-foreground"
                  rel="bookmark"
                >
                  {w.name}
                </a>
                <span className="text-muted-foreground"> – {w.description}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            A press-kit-shaped version of the same list, plus brand
            facts and contact details, lives on{" "}
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /press
            </Link>
            .
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 prose-like space-y-4 text-base leading-relaxed">
          <h2 className="text-2xl font-bold">How to reach me</h2>
          <p>
            Email{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
            . One inbox, one human, real replies. If you&rsquo;re stuck and
            want a labeled diagnosis of why your launch went flat, the{" "}
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 hover:text-foreground"
            >
              free diagnostic
            </Link>{" "}
            is the front door.
          </p>
        </section>

        <div className="mt-12 text-xs text-muted-foreground">
          <p>
            More from me:{" "}
            <Link
              href="/stories"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Five Stories for the Flat Stripe Line
            </Link>{" "}
            ·{" "}
            <Link
              href="/playbook-sales"
              className="underline underline-offset-4 hover:text-foreground"
            >
              The Playbook
            </Link>{" "}
            ·{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
