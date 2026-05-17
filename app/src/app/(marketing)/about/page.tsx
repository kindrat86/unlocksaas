import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  PersonJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";

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
  title: "About Maryan — Unlock SaaS",
  description:
    "I'm a marketer. I have never written a line of production code. I shipped a dozen AI products and watched them flatline in Stripe — then built the Playbook to fix the work nobody taught indie SaaS founders to do.",
  // markdownAlternate emits canonical + per-page hreflang + the
  // `text/markdown` content-type alternate pointing at /about.md (the
  // playbook-readable mirror for retrieval pipelines that prefer markdown
  // over JS-rendered HTML).
  alternates: markdownAlternate("/about", "/about.md"),
  openGraph: {
    type: "profile",
    title: "About Maryan — Unlock SaaS",
    description:
      "The founder behind Unlock SaaS. Marketer, non-engineer, post-launch pre-revenue veteran.",
    url: "/about",
  },
  twitter: {
    card: "summary",
    title: "About Maryan — Unlock SaaS",
    description:
      "Marketer, non-engineer, post-launch pre-revenue veteran. Builder of Unlock SaaS.",
  },
  robots: { index: true, follow: true },
};

// Pure static surface — no per-request data, no cookies, no auth gating.
// Pre-rendered at build time, served from the CDN edge.
export const dynamic = "force-static";

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "About", url: "https://unlocksaas.com/about" },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <PersonJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />

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
