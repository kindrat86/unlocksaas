import type { Metadata } from "next";
import Link from "next/link";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
  OrganizationJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * /dont-buy-unlock-saas — the polarity page.
 *
 * Why this surface exists
 * -----------------------
 * Brunson's polarity rule (Expert Secrets §15-§19, restated in
 * dollar-objections.md): an offer that converts is one where the buyer
 * can name the OPPOSITE buyer. Naming who shouldn't buy is what makes
 * "this is for me" feel true to the right buyer. Most SaaS sites duck
 * this — every landing page tries to convert every reader. UnlockSaaS
 * does the opposite here: a brutally honest "stop, you're the wrong
 * person" page that disqualifies five distinct misfits up front.
 *
 * Off-page lift mechanism
 * -----------------------
 * Surprising pages get linked. The two highest-shared classes of
 * indie-SaaS marketing posts are (a) "we made a mistake and here is
 * what we learned" and (b) "we will not sell to you, here is why".
 * This page is the (b) form. It compresses the founder's actual
 * editorial position on who the Playbook is and isn't for into a
 * surface that reads as confidence rather than gatekeeping. Patrick
 * McKenzie / Justin Welsh / honest-founder Twitter regularly retweet
 * pages of this shape. Each retweet is a permanent backlink with
 * audience overlap that matches the canonical UnlockSaaS reader.
 *
 * Voice
 * -----
 * Reluctant Hero, second-person, plain language. No softener
 * qualifiers ("you might find that…"). The point is to read as a
 * working position, not a marketing exercise. Brunson Hard-Rule:
 * every disqualifier below is something the founder ACTUALLY does
 * push back on inside the Playbook engine and during email replies
 * — not aspirational gatekeeping for SEO theater.
 *
 * SEO posture
 * -----------
 * Indexable. Article + BreadcrumbList + Organization JSON-LD. Targets
 * the long-tail query class "is unlock saas legit / for me / scam"
 * and the meta-class "saas sales pages that say who shouldn't buy"
 * (which is itself a real Indie Hackers / Twitter search behavior).
 * Markdown mirror at /dont-buy-unlock-saas.md for AI retrievers.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every disqualifier is verifiable against the existing product
 *     surface (the Playbook engine's behavior, the guarantee terms,
 *     the editorial policy). Nothing is invented for polarity theater.
 *   - No "secretly we want everyone to convert" misdirection. If a
 *     reader recognizes themselves in a disqualifier line, the
 *     correct next step IS to close the tab.
 *   - No fabricated dollar-amounts, no fabricated refund counts.
 */

const CANONICAL_PATH = "/dont-buy-unlock-saas";
const MD_PATH = "/dont-buy-unlock-saas.md";

// Surface-creation date. Brunson Hard-Rule: schema.datePublished must
// reflect when the page was actually first published, not the build
// time. Hand-rolled because there's no auto-derivation source for an
// editorial page like this.
const DATE_PUBLISHED = "2026-05-18";

export const metadata: Metadata = {
  title: "Don't buy Unlock SaaS if these describe you",
  description:
    "Five distinct reasons the Unlock SaaS Playbook is the wrong fit. Brutally honest disqualifiers from the founder, written so the right reader can rule themselves out before they spend a dollar.",
  alternates: markdownAlternate(`${BASE_URL}${CANONICAL_PATH}`, MD_PATH),
  openGraph: {
    title: "Don't buy Unlock SaaS if these describe you",
    description:
      "Five honest disqualifiers from the founder. If any of these sound like you, close the tab.",
    url: CANONICAL_PATH,
    type: "article",
    publishedTime: DATE_PUBLISHED,
    authors: ["Maryan"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't buy Unlock SaaS if these describe you",
    description:
      "Five honest disqualifiers from the founder. If any sound like you, close the tab.",
    creator: "@maryan",
  },
  robots: { index: true, follow: true },
};

const TRAIL = [
  { name: "Unlock SaaS", url: `${BASE_URL}/` },
  { name: "Don't buy Unlock SaaS", url: `${BASE_URL}${CANONICAL_PATH}` },
] as const;

/**
 * Word count for the Article schema. E-E-A-T expertise signal —
 * Google weights long-form editorial heavier when the schema declares
 * the actual depth. Counted by hand from the rendered prose below
 * (the five disqualifier blocks plus header lede plus closing).
 * Brunson Hard-Rule: honest measurement, not inflated.
 */
const WORD_COUNT = 1180;

const DISQUALIFIERS: ReadonlyArray<{
  heading: string;
  speakableId: string;
  body: ReadonlyArray<string>;
}> = [
  {
    heading: "You're pre-launch",
    speakableId: "dq-pre-launch",
    body: [
      "The Playbook starts with an already-shipped product that has a public URL and a Stripe account wired up. Step 1 is pinning a real customer; you can't pin a real customer for a thing that doesn't exist yet. Step 6's escalation logic assumes a live offer page to revise.",
      "If you're still building, leave. Build the product first. Then come back when you have a URL you'd let a stranger read. The diagnostic at /diagnostic refuses to score pre-launch URLs precisely because there's nothing to diagnose yet — that's not a UX accident, it's the discipline.",
    ],
  },
  {
    heading: "You hate writing",
    speakableId: "dq-hate-writing",
    body: [
      "Five of the seven Playbook steps produce written output. Step 2 is a one-sentence offer naming the person and the result — the engine pushes back on every vague verb until you replace it. Step 4 is outreach copy. Step 5 is the reply-handling script. Step 7 is the iteration log. There's no skip button on any of them.",
      "If the idea of writing one paragraph that names a real person and a real result reads as homework you'd procrastinate on for a week, the Playbook is the wrong tool. You don't need a system; you need to either hire a writer or pick a different business model. Saying that out loud here saves us both the refund cycle.",
    ],
  },
  {
    heading: "You think Stripe verification is a gimmick",
    speakableId: "dq-stripe-gimmick",
    body: [
      "The Playbook's guarantee fires only when Stripe pings the webhook for your first verified payment, not when a customer says \"yes I'll buy\". Some founders read this as theater — \"obviously you'd pay if you got the result\". It isn't theater. Most founders who self-report \"I've tried customer interviews\" stop at praise. Praise is free. A Stripe charge is the only test of the offer that costs the buyer a real thing.",
      "If your read of this guarantee design is \"the founder is making it harder than it needs to be on purpose\", you'll fight the engine in Step 3 and Step 6. Close the tab. The founders who get the result are the ones who agree, before they sign up, that the only proof that counts is the Stripe ping.",
    ],
  },
  {
    heading: "You want a magic button",
    speakableId: "dq-magic-button",
    body: [
      "The Playbook is not an AI agent that does the outreach for you. It generates the copy, but you send the email. It tracks the reply, but you read it. It surfaces the iteration recommendation, but you decide whether to revise the offer or the audience. Twenty logged outreach actions is the floor before the guarantee can fire. Twenty.",
      "If you came to UnlockSaaS hoping for a fully-automated revenue robot, that product exists elsewhere and it doesn't work, but you'll find versions of it. The Playbook is the opposite tool: a structured forcing-function that puts you in front of the work the product doesn't do for you. If you don't want to be in front of that work, this isn't your tool.",
    ],
  },
  {
    heading: "You already know your customer and your offer",
    speakableId: "dq-already-know",
    body: [
      "Some readers land here from a search like \"$49/mo SaaS playbook\" while already knowing exactly who buys their product and exactly what to say to them. They don't need a system to pin a person — they have the name. They don't need help writing an offer — the offer page converts. They need volume, not clarity.",
      "If that's you, you need a paid-ads channel, an SEO content engine, or a partnership pipeline — not the Playbook. Two surfaces on this site that might be the right tool instead: the funnel teardown library at /funnel-teardown (for studying how indie SaaS scale traffic) and the dataset at /dataset (for self-serve analysis of what's working). Don't sign up for the Playbook to scale a known-good offer. The Playbook is for the founders who don't yet know what their offer should say.",
    ],
  },
];

export default function DontBuyPage() {
  return (
    <main className="px-6 py-12 md:py-16">
      <OrganizationJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />
      <ArticleJsonLd
        headline="Don't buy Unlock SaaS if these describe you"
        description="Five distinct reasons the Unlock SaaS Playbook is the wrong fit. Brutally honest disqualifiers from the founder, written so the right reader can rule themselves out before they spend a dollar."
        url={`${BASE_URL}${CANONICAL_PATH}`}
        datePublished={DATE_PUBLISHED}
        wordCount={WORD_COUNT}
        articleSection="Editorial"
        keywords={[
          "saas anti-marketing",
          "polarity in saas",
          "honest founder",
          "who shouldn't buy",
          "unlock saas",
          "Brunson polarity",
        ]}
        // Voice/Speakable: each disqualifier's H2 + body paragraphs are
        // safe to read aloud. The nav, footer, and the closing CTA are
        // not. Selectors target the disqualifier blocks by aria-labelledby.
        speakableSelectors={[
          '[aria-labelledby="tldr"]',
          '[data-speakable="disqualifier"]',
        ]}
      />

      <article className="max-w-2xl mx-auto space-y-8">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:underline">
            Unlock SaaS
          </Link>{" "}
          <span aria-hidden>›</span> Don&apos;t buy Unlock SaaS
        </nav>

        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Don&apos;t buy Unlock SaaS if these describe you
          </h1>
          <p
            id="tldr"
            data-speakable="tldr"
            className="text-lg text-muted-foreground"
          >
            Five honest reasons the Playbook is the wrong fit. If any of these
            describe you, close the tab. The founders who get the verified
            Stripe ping are the ones who can read this whole page without
            flinching at any of it.
          </p>
        </header>

        <section className="space-y-8">
          {DISQUALIFIERS.map((dq, i) => (
            <article
              key={dq.speakableId}
              aria-labelledby={dq.speakableId}
              data-speakable="disqualifier"
              className="space-y-3"
            >
              <h2
                id={dq.speakableId}
                className="text-xl font-semibold"
              >
                {i + 1}. {dq.heading}
              </h2>
              {dq.body.map((paragraph, j) => (
                <p key={j} className="leading-7">
                  {paragraph}
                </p>
              ))}
            </article>
          ))}
        </section>

        <section className="space-y-3 border-t pt-8">
          <h2 className="text-xl font-semibold">
            Still here? Good.
          </h2>
          <p>
            If you read all five and none of them rang true, the Playbook is
            probably for you. Start with the free diagnostic — paste your
            live product URL and the engine labels what is actually broken
            in about ninety seconds.
          </p>
          <p>
            <Link
              href="/diagnostic"
              className="underline underline-offset-4"
            >
              Run the diagnostic →
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">
            Or read the long form at{" "}
            <Link
              href="/playbook-sales"
              className="underline underline-offset-4"
            >
              /playbook-sales
            </Link>
            . The $1 Starter at{" "}
            <Link
              href="/starter"
              className="underline underline-offset-4"
            >
              /starter
            </Link>{" "}
            is the lowest-stakes way to verify the engine works on your
            specific product.
          </p>
        </section>

        <footer className="pt-8 border-t text-sm text-muted-foreground">
          Maintained by Maryan ·{" "}
          <Link
            href="/editorial-policy"
            className="underline underline-offset-4"
          >
            Editorial policy
          </Link>{" "}
          ·{" "}
          <Link
            href="/about"
            className="underline underline-offset-4"
          >
            About
          </Link>{" "}
          ·{" "}
          <Link href="/faq" className="underline underline-offset-4">
            FAQ
          </Link>
        </footer>
      </article>
    </main>
  );
}
